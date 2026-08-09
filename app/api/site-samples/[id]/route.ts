import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SiteSample } from "@/models/SiteSample";
import { isAuthorizedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getCategoryLabel(category: string): string {
  switch (category) {
    case "interiors":
      return "تشطيبات وديكورات فاخرة";
    case "execution":
      return "تنفيذ وتطوير معماري";
    case "lighting":
      return "إضاءات وديكورات حديثة";
    default:
      return "تشطيبات وديكورات فاخرة";
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthorizedAdmin(req))) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, category, imageSrc, location } = body || {};

    await connectToDatabase();
    const sample = await SiteSample.findById(id);

    if (!sample) {
      return NextResponse.json({ success: false, error: "لم يتم العثور على عينة العمل" }, { status: 404 });
    }

    if (title && typeof title === "string") sample.title = title.trim();
    if (imageSrc && typeof imageSrc === "string") sample.imageSrc = imageSrc.trim();
    if (location && typeof location === "string") sample.location = location.trim();
    if (category && ["interiors", "execution", "lighting"].includes(category)) {
      sample.category = category as "interiors" | "execution" | "lighting";
      sample.categoryLabel = getCategoryLabel(category);
    }

    await sample.save();

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات عينة العمل بنجاح",
      data: JSON.parse(JSON.stringify(sample)),
    });
  } catch (error: unknown) {
    console.error("PUT /api/site-samples/[id] error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء التعديل" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthorizedAdmin(req))) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const sample = await SiteSample.findByIdAndDelete(id);
    if (!sample) {
      return NextResponse.json({ success: false, error: "لم يتم العثور على عينة العمل" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `تم حذف عينة العمل "${sample.title}" بنجاح`,
    });
  } catch (error: unknown) {
    console.error("DELETE /api/site-samples/[id] error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء الحذف" }, { status: 500 });
  }
}
