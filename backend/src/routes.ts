import { Router } from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import type { Types } from "mongoose";
import { optionalAuth, requireAuth, signToken, type AuthedRequest } from "./auth.js";
import { cloudinaryConfigured } from "./env.js";
import { uploadAvatar } from "./cloudinary.js";
import { Checkin } from "./models/Checkin.js";
import { Habit } from "./models/Habit.js";
import { User } from "./models/User.js";
import { checkinJson, currentStreak, habitJson, habitRunJson, userJson } from "./serialize.js";
import { FREE_SUBSCRIPTION } from "./types.js";
import type { CheckinDoc } from "./models/Checkin.js";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH = /^\d{4}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Photo must be an image"));
  },
});

function nameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim();
  return local || "You";
}

function activeHabit(userId: Types.ObjectId) {
  return Habit.findOne({ userId, endedAt: null });
}

async function historyFor(userId: Types.ObjectId) {
  const ended = await Habit.find({
    userId,
    endedAt: { $ne: null },
  }).sort({ endedAt: -1 });
  const runs = await Promise.all(
    ended.map(async (habit) => {
      const checkins = await Checkin.find({ habitId: habit._id });
      return habitRunJson(habit, checkins);
    }),
  );
  return runs;
}

export const router = Router();

router.post("/login", async (req, res) => {
  const email = String(req.body?.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password ?? "");

  if (!EMAIL.test(email) || password.length < 1) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 10),
      name: nameFromEmail(email),
      avatarUri: null,
    });
  } else if (!(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  res.json({ user: userJson(user), token: signToken(String(user._id)) });
});

router.post("/logout", (_req, res) => {
  res.status(204).end();
});

router.get("/session", optionalAuth, (req: AuthedRequest, res) => {
  if (!req.user) {
    res.json(null);
    return;
  }
  res.json({ user: userJson(req.user) });
});

router.get("/bootstrap", optionalAuth, async (req: AuthedRequest, res) => {
  if (!req.user) {
    res.json({
      onboardingComplete: false,
      pendingHabitName: null,
      pendingGoalDays: null,
      hasAccount: false,
      user: null,
      habit: null,
      checkins: [],
      history: [],
      subscription: FREE_SUBSCRIPTION,
    });
    return;
  }

  const habit = await activeHabit(req.user._id);
  const [checkins, history] = await Promise.all([
    habit ? Checkin.find({ habitId: habit._id }).sort({ date: 1 }) : Promise.resolve([] as CheckinDoc[]),
    historyFor(req.user._id),
  ]);

  res.json({
    onboardingComplete: true,
    pendingHabitName: null,
    pendingGoalDays: null,
    hasAccount: true,
    user: userJson(req.user),
    habit: habit ? habitJson(habit) : null,
    checkins: checkins.map(checkinJson),
    history,
    subscription: FREE_SUBSCRIPTION,
  });
});

router.post("/onboarding/complete", (_req, res) => {
  res.status(204).end();
});

router.get("/habit", requireAuth, async (req: AuthedRequest, res) => {
  const habit = await activeHabit(req.user!._id);
  res.json(habit ? habitJson(habit) : null);
});

router.get("/history", requireAuth, async (req: AuthedRequest, res) => {
  res.json(await historyFor(req.user!._id));
});

router.post("/habit", requireAuth, async (req: AuthedRequest, res) => {
  const name = String(req.body?.name ?? "").trim();
  const goalDays = Number(req.body?.goalDays);
  const endCurrent = Boolean(req.body?.endCurrent);

  if (!name || !Number.isInteger(goalDays) || goalDays < 2 || goalDays > 365) {
    res.status(400).json({ error: "Habit name and goal days are required" });
    return;
  }

  const existing = await activeHabit(req.user!._id);
  if (existing && existing.name === name) {
    existing.goalDays = goalDays;
    await existing.save();
    res.json(habitJson(existing));
    return;
  }

  if (existing && existing.name !== name) {
    if (!endCurrent) {
      const checkins = await Checkin.find({ habitId: existing._id });
      res.status(409).json({
        error: "End this run first",
        habit: habitJson(existing),
        streak: currentStreak(checkins),
      });
      return;
    }
    existing.endedAt = new Date();
    await existing.save();
  }

  const habit = await Habit.create({
    userId: req.user!._id,
    name,
    goalDays,
    startedAt: new Date(),
    endedAt: null,
  });

  res.json(habitJson(habit));
});

router.post("/checkin", requireAuth, async (req: AuthedRequest, res) => {
  const date = String(req.body?.date ?? "");
  const answer = req.body?.answer;

  if (!DATE.test(date) || (answer !== "yes" && answer !== "no")) {
    res.status(400).json({ error: "Need a date and yes or no" });
    return;
  }

  const habit = await activeHabit(req.user!._id);
  if (!habit) {
    res.status(400).json({ error: "Pick a habit first" });
    return;
  }

  const checkin = await Checkin.findOneAndUpdate(
    { habitId: habit._id, date },
    { $set: { answer, userId: req.user!._id, habitId: habit._id } },
    { new: true, upsert: true },
  );

  res.json(checkinJson(checkin!));
});

router.get("/checkins", requireAuth, async (req: AuthedRequest, res) => {
  const month = typeof req.query.month === "string" ? req.query.month : "";
  if (month && !MONTH.test(month)) {
    res.status(400).json({ error: "Month should look like YYYY-MM" });
    return;
  }

  const habit = await activeHabit(req.user!._id);
  if (!habit) {
    res.json([]);
    return;
  }

  const filter: {
    habitId: Types.ObjectId;
    date?: { $gte: string; $lte: string };
  } = {
    habitId: habit._id,
  };
  if (month) filter.date = { $gte: `${month}-01`, $lte: `${month}-31` };

  const checkins = await Checkin.find(filter).sort({ date: 1 });
  res.json(checkins.map(checkinJson));
});

router.post("/profile", requireAuth, async (req: AuthedRequest, res) => {
  const name =
    req.body?.name === undefined ? undefined : String(req.body.name).trim();
  if (name !== undefined) {
    if (!name) {
      res.status(400).json({ error: "Name cannot be empty" });
      return;
    }
    req.user!.name = name;
  }
  await req.user!.save();
  res.json({ user: userJson(req.user!) });
});

router.post(
  "/profile/avatar",
  requireAuth,
  (req: AuthedRequest, res, next) => {
    upload.single("photo")(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  async (req: AuthedRequest, res) => {
    if (!req.file) {
      res.status(400).json({ error: "Attach a photo" });
      return;
    }
    if (!cloudinaryConfigured()) {
      res.status(503).json({ error: "Add Cloudinary keys in backend/.env" });
      return;
    }
    try {
      const url = await uploadAvatar(req.file.buffer, String(req.user!._id));
      req.user!.avatarUri = url;
      await req.user!.save();
      res.json({ user: userJson(req.user!) });
    } catch {
      res.status(502).json({ error: "Could not upload photo" });
    }
  },
);

function plusStub(_req: AuthedRequest, res: import("express").Response) {
  res.json(FREE_SUBSCRIPTION);
}

router.post("/plus/purchase", requireAuth, plusStub);
router.post("/plus/restore", requireAuth, plusStub);
router.post("/plus/end", requireAuth, plusStub);
