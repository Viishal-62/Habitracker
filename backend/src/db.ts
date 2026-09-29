import mongoose from "mongoose";
import { env } from "./env.js";
import { migrateRuns } from "./migrate.js";

export async function connectDb(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
  await migrateRuns();
}
