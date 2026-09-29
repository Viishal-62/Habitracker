import cors from "cors";
import express from "express";
import { initCloudinary } from "./cloudinary.js";
import { connectDb } from "./db.js";
import { env } from "./env.js";
import { router } from "./routes.js";

async function main(): Promise<void> {
  await connectDb();
  initCloudinary();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });
  app.use(router);
  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (!err) {
        next();
        return;
      }
      res.status(400).json({ error: "Bad request" });
    },
  );

  app.listen(env.port, "0.0.0.0", () => {
    console.log(`ChooseOne API on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
