import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AccessCode } from "@/models/AccessCode";
import { isAuthorizedAdmin } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorizedAdmin(req))) {
    return NextResponse.json(
      { success: false, error: "غير مصرح لك بالوصول" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const codeDoc = await AccessCode.findById(id);
    if (!codeDoc) {
      return NextResponse.json(
        { success: false, error: "لم يتم العثور على الكود المطلوب" },
        { status: 404 }
      );
    }

    if (typeof body.active === "boolean") {
      codeDoc.active = body.active;
    }
    if (typeof body.label === "string" && body.label.trim()) {
      codeDoc.label = body.label.trim();
    }
    if (typeof body.code === "string" && body.code.trim()) {
      codeDoc.code = body.code.trim();
    }

    await codeDoc.save();
    const serializedCode = JSON.parse(JSON.stringify(codeDoc));
    return NextResponse.json({ success: true, data: serializedCode });
  } catch (error) {
    console.error("PUT /api/access-codes/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "فشل تعديل كود الدخول" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorizedAdmin(req))) {
    return NextResponse.json(
      { success: false, error: "غير مصرح لك بالوصول" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    await connectToDatabase();

    const deletedDoc = await AccessCode.findByIdAndDelete(id);
    if (!deletedDoc) {
      return NextResponse.json(
        { success: false, error: "لم يتم العثور على الكود المطلوب لحذفه" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "تم حذف الكود بنجاح" });
  } catch (error) {
    console.error("DELETE /api/access-codes/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "فشل حذف كود الدخول" },
      { status: 500 }
    );
  }
}
