import { connectToDatabase } from "./db";
import { Project, IProject } from "@/models/Project";

export interface ProjectFilters {
  category?: string;
  featured?: boolean;
}

export async function getAllProjects(
  filters?: ProjectFilters
): Promise<IProject[]> {
  try {
    const startConn = performance.now();
    await connectToDatabase();
    const connTime = performance.now() - startConn;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (filters?.category) {
      query.category = filters.category.toLowerCase();
    }

    if (filters?.featured !== undefined) {
      query.featured = filters.featured;
    }

    const startQuery = performance.now();
    const projects = await Project.find(query).sort({ createdAt: -1 }).lean();
    const queryTime = performance.now() - startQuery;

    console.log(
      `[Timing] connectDB (getAllProjects): ${connTime.toFixed(3)}ms | dbQuery: ${queryTime.toFixed(3)}ms`
    );

    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error("Error fetching projects from MongoDB:", error);
    return [];
  }
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

