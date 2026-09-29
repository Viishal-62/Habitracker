import { model, Schema, type HydratedDocument, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    avatarUri: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

type UserFields = InferSchemaType<typeof userSchema> & { createdAt: Date };
export type UserDoc = HydratedDocument<UserFields>;

export const User = model("User", userSchema);
