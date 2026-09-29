import { Checkin } from "./models/Checkin.js";
import { Habit } from "./models/Habit.js";

export async function migrateRuns(): Promise<void> {
  const habits = Habit.collection;
  const checkins = Checkin.collection;

  try {
    await habits.dropIndex("userId_1");
  } catch {
    // Old unique index may already be gone.
  }
  try {
    await checkins.dropIndex("userId_1_date_1");
  } catch {
    // Old unique index may already be gone.
  }

  await Habit.syncIndexes();
  await Checkin.syncIndexes();

  await habits.updateMany(
    { endedAt: { $exists: false } },
    { $set: { endedAt: null } },
  );
  await habits.updateMany(
    { startedAt: { $exists: false } },
    { $set: { startedAt: new Date() } },
  );

  const active = await Habit.find({ endedAt: null });
  for (const habit of active) {
    await checkins.updateMany(
      {
        userId: habit.userId,
        $or: [{ habitId: { $exists: false } }, { habitId: null }],
      },
      { $set: { habitId: habit._id } },
    );
  }
}
