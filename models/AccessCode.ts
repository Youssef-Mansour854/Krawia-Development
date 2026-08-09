import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAccessCode extends Document {
  label: string;
  code: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccessCodeSchema: Schema<IAccessCode> = new Schema(
  {
    label: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AccessCode: Model<IAccessCode> =
  mongoose.models.AccessCode ||
  mongoose.model<IAccessCode>("AccessCode", AccessCodeSchema);
