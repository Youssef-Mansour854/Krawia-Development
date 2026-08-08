import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { Project, generateUniqueSlug } from "@/models/Project";
import { getProjectBySlug } from "@/lib/projects";
import { updateProjectSchema } from "@/lib/validations/project";
import { isAuthorizedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: `Project with slug '${slug}' not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: project,
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

export async function PUT(req: NextRequest, { params }: RouteParams) {
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

    const { slug } = await params;
    const body = await req.json();

    // Validate body with Zod update schema
    const validationResult = updateProjectSchema.safeParse(body);
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

    await connectToDatabase();

    const existingProject = await Project.findOne({ slug });
    if (!existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: `Project with slug '${slug}' not found`,
        },
        { status: 404 }
      );
    }

    // Extract ONLY fields that were explicitly defined in the request body
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: Record<string, any> = Object.fromEntries(
      Object.entries(validationResult.data).filter(([, val]) => val !== undefined)
    );

    // If slug is being updated explicitly, check for collision
    if (updateFields.slug && updateFields.slug !== slug) {
      updateFields.slug = await generateUniqueSlug(
        updateFields.slug,
        String(existingProject._id)
      );
    }

    // Use $set to update only specified fields without wiping unmentioned arrays/fields
    const updatedProject = await Project.findOneAndUpdate(
      { slug },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    // On-demand revalidation for instant public updates
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${slug}`);
    if (updatedProject?.slug && updatedProject.slug !== slug) {
      revalidatePath(`/projects/${updatedProject.slug}`);
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedProject,
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

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    const { slug } = await params;
    await connectToDatabase();

    const deletedProject = await Project.findOneAndDelete({ slug });

    if (!deletedProject) {
      return NextResponse.json(
        {
          success: false,
          error: `Project with slug '${slug}' not found`,
        },
        { status: 404 }
      );
    }

    // On-demand revalidation for instant public & admin updates
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin");
    revalidatePath(`/projects/${slug}`);

    return NextResponse.json(
      {
        success: true,
        data: { message: `Project '${slug}' successfully deleted` },
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
