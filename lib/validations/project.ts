import { z } from "zod";

export const blueprintSchema = z.object({
  name: z.string().min(1, "Blueprint name is required"),
  pdfUrl: z.string().min(1, "PDF URL is required"),
  thumbnailUrl: z.string().min(1, "Thumbnail URL is required"),
  category: z.string().optional().default("أخرى"),
  note: z.string().optional(),
});

export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  fullDescription: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  category: z.enum(["residential", "commercial", "mixed-use"], {
    message: "Category must be one of: residential, commercial, mixed-use",
  }),
  status: z.enum(["upcoming", "under-construction", "completed"], {
    message: "Status must be one of: upcoming, under-construction, completed",
  }),
  coverImage: z.string().min(1, "Cover image URL is required"),
  gallery: z.array(z.string()).optional().default([]),
  blueprints: z.array(blueprintSchema).optional().default([]),
  featured: z.boolean().optional().default(false),
});

// Explicit update schema WITHOUT .default() calls so omitted fields stay undefined
export const updateProjectSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").optional(),
  slug: z.string().optional(),
  description: z.string().min(1, "Description cannot be empty").optional(),
  fullDescription: z.string().optional(),
  location: z.string().min(1, "Location cannot be empty").optional(),
  category: z.enum(["residential", "commercial", "mixed-use"], {
    message: "Category must be one of: residential, commercial, mixed-use",
  }).optional(),
  status: z.enum(["upcoming", "under-construction", "completed"], {
    message: "Status must be one of: upcoming, under-construction, completed",
  }).optional(),
  coverImage: z.string().min(1, "Cover image URL cannot be empty").optional(),
  gallery: z.array(z.string()).optional(),
  blueprints: z.array(blueprintSchema).optional(),
  featured: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
