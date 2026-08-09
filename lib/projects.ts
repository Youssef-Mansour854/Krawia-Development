import { connectToDatabase } from "./db";
import { Project, IProject } from "@/models/Project";

export interface ProjectFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProjectsResult {
  projects: IProject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getPaginatedProjects(
  filters?: ProjectFilters
): Promise<PaginatedProjectsResult> {
  try {
    const startConn = performance.now();
    await connectToDatabase();
    const connTime = performance.now() - startConn;

    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, Math.min(100, filters?.limit || 12));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (filters?.category) {
      query.category = filters.category.toLowerCase();
    }

    if (filters?.featured !== undefined) {
      query.featured = filters.featured;
    }

    if (filters?.search && filters.search.trim() !== "") {
      const sanitizedTerm = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(sanitizedTerm, "i");
      query.$or = [
        { title: { $regex: searchRegex } },
        { location: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    const startQuery = performance.now();
    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(query),
    ]);
    const queryTime = performance.now() - startQuery;

    console.log(
      `[Timing] connectDB (getPaginatedProjects page=${page}): ${connTime.toFixed(3)}ms | dbQuery: ${queryTime.toFixed(3)}ms | total=${total}`
    );

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      projects: JSON.parse(JSON.stringify(projects)),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching paginated projects from MongoDB:", error);
    return {
      projects: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
    };
  }
}

export async function getAllProjects(
  filters?: ProjectFilters
): Promise<IProject[]> {
  const paginated = await getPaginatedProjects({ ...filters, limit: 1000 });
  return paginated.projects;
}

export async function getProjectBySlug(
  slug: string
): Promise<IProject | null> {
  try {
    const startConn = performance.now();
    await connectToDatabase();
    const connTime = performance.now() - startConn;

    const startQuery = performance.now();
    const project = await Project.findOne({ slug }).lean();
    const queryTime = performance.now() - startQuery;

    console.log(
      `[Timing] connectDB (getProjectBySlug: ${slug}): ${connTime.toFixed(3)}ms | dbQuery: ${queryTime.toFixed(3)}ms`
    );

    if (!project) return null;
    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    console.error(`Error fetching project by slug (${slug}):`, error);
    return null;
  }
}

