import mongoose, { Schema, Document, Model } from "mongoose";
import { slugify } from "transliteration";

export interface IBlueprint {
  name: string;
  pdfUrl: string;
  thumbnailUrl: string;
  category?: string;
  note?: string;
}

export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  fullDescription?: string;
  location: string;
  category: "residential" | "commercial" | "mixed-use";
  status: "upcoming" | "under-construction" | "completed";
  coverImage: string;
  gallery: string[];
  blueprints: IBlueprint[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function generateSlug(text: string): string {
  if (!text) return "";
  const transliterated = slugify(text, { lowercase: true, separator: "-" });
  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateUniqueSlug(
  text: string,
  currentDocId?: mongoose.Types.ObjectId | string
): Promise<string> {
  const baseSlug = generateSlug(text) || "project";
  let slug = baseSlug;
  let counter = 1;

  const ProjectModel =
    mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { slug };
    if (currentDocId) {
      query._id = { $ne: currentDocId };
    }

    const existing = await ProjectModel.findOne(query).exec();
    if (!existing) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

const BlueprintSchema = new Schema<IBlueprint>(
  {
    name: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    category: { type: String, default: "أخرى" },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const ProjectSchema: Schema<IProject> = new Schema(
  {
    title: { type: String, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, required: true },
    fullDescription: { type: String },
    location: { type: String, required: true },
    category: {
      type: String,
      enum: ["residential", "commercial", "mixed-use"],
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "under-construction", "completed"],
      required: true,
    },
    coverImage: { type: String, required: true },
    gallery: { type: [String], default: [] },
    blueprints: { type: [BlueprintSchema], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for fast server-side query, filtering, sorting, and search performance
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ featured: 1 });
ProjectSchema.index({ createdAt: -1 });

// Single async pre-validate hook for collision-safe slug generation
ProjectSchema.pre("validate", async function () {
  if (this.title && (this.isModified("title") || !this.slug)) {
    this.slug = await generateUniqueSlug(this.title, this._id);
  }
});

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
