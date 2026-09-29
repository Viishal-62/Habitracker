import mongoose, { Schema, type InferSchemaType } from "mongoose";

const checkinSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    habitId: { type: Schema.Types.ObjectId, ref: "Habit", required: true, index: true },
    date: { type: String, required: true },
    answer: { type: String, enum: ["yes", "no"], required: true },
  },
  { timestamps: false },
);

checkinSchema.index({ habitId: 1, date: 1 }, { unique: true });

export type CheckinDoc = InferSchemaType<typeof checkinSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Checkin = mongoose.model("Checkin", checkinSchema);
