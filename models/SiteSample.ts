import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteSample {
  _id: mongoose.Types.ObjectId | string;
  title: string;
  category: "interiors" | "execution" | "lighting";
  categoryLabel: string;
  imageSrc: string;
  location: string;
  createdAt: Date;
}

export interface ISiteSampleDocument extends Omit<ISiteSample, "_id">, Document {}

const SiteSampleSchema = new Schema<ISiteSampleDocument>(
  {
    title: {
      type: String,
      required: [true, "عنوان العينة مطلوب"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["interiors", "execution", "lighting"],
      required: [true, "التصنيف مطلوب"],
      default: "interiors",
    },
    categoryLabel: {
      type: String,
      required: true,
      default: "تشطيبات وديكورات فاخرة",
    },
    imageSrc: {
      type: String,
      required: [true, "رابط/صورة العينة مطلوب"],
    },
    location: {
      type: String,
      required: [true, "الموقع/المدينة مطلوب"],
      default: "دمنهور - شارع الضغط العالي",
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export const SiteSample: Model<ISiteSampleDocument> =
  mongoose.models.SiteSample || mongoose.model<ISiteSampleDocument>("SiteSample", SiteSampleSchema);
