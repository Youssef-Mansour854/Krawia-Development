import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAccessCodeData {
  _id: string;
  label: string;
  code: string;
  active: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IAccessCodeDoc extends Document {
  label: string;
  code: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccessCodeSchema: Schema<IAccessCodeDoc> = new Schema(
  {
    label: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AccessCode: Model<IAccessCodeDoc> =
  mongoose.models.AccessCode ||
  mongoose.model<IAccessCodeDoc>("AccessCode", AccessCodeSchema);
