import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdmin {
  _id: mongoose.Types.ObjectId | string;
  username: string;
  employeeName?: string;
  passwordHash: string;
  createdAt: Date;
}

export interface IAdminDocument extends Omit<IAdmin, "_id">, Document {}

const AdminSchema = new Schema<IAdminDocument>(
  {
    username: {
      type: String,
      required: [true, "اسم المستخدم مطلوب"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    employeeName: {
      type: String,
      default: "",
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "كلمة السر المشفرة مطلوبة"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export const Admin: Model<IAdminDocument> =
  mongoose.models.Admin || mongoose.model<IAdminDocument>("Admin", AdminSchema);
