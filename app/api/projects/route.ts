import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { Project, generateUniqueSlug } from "@/models/Project";
import { getAllProjects, getPaginatedProjects } from "@/lib/projects";
import { createProjectSchema } from "@/lib/validations/project";
import { isAuthorizedAdmin, isAuthorizedViewerOrAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    if (!(await isAuthorizedViewerOrAdmin(req))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Access code or login required" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const featuredParam = searchParams.get("featured");
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    let featured: boolean | undefined = undefined;
    if (featuredParam === "true") featured = true;
    if (featuredParam === "false") featured = false;

    const result = await getPaginatedProjects({
      category,
      featured,
      search,
      page,
      limit,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.projects,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAuthorizedAdmin(req))) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Invalid or missing admin secret header",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate body with Zod
    const validationResult = createProjectSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
        },
        { status: 400 }
      );
    }

    const inputData = validationResult.data;

    await connectToDatabase();

    // Generate collision-safe unique Latin slug from title (or explicit slug)
    const rawSlugSource = inputData.slug || inputData.title;
    inputData.slug = await generateUniqueSlug(rawSlugSource);

    const newProject = await Project.create(inputData);

    // On-demand revalidation for instant public & admin updates
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin");
    revalidatePath(`/projects/${newProject.slug}`);

    return NextResponse.json(
      {
        success: true,
        data: newProject,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
