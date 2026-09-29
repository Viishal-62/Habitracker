import mongoose, { Schema, type InferSchemaType } from "mongoose";

const habitSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    goalDays: { type: Number, default: null },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
  },
  { timestamps: false },
);

habitSchema.index({ userId: 1, endedAt: 1 });
habitSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { endedAt: null } },
);

export type HabitDoc = InferSchemaType<typeof habitSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Habit = mongoose.model("Habit", habitSchema);
