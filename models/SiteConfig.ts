import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteConfigDoc extends Document {
  key: string;
  suspended: boolean;
  updatedAt: Date;
}

const SiteConfigSchema: Schema<ISiteConfigDoc> = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "site_status" },
    suspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SiteConfig: Model<ISiteConfigDoc> =
  mongoose.models.SiteConfig ||
  mongoose.model<ISiteConfigDoc>("SiteConfig", SiteConfigSchema);
