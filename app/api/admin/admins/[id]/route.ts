import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { isAuthorizedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthorizedAdmin(req))) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "معرف الحساب غير صالح" }, { status: 400 });
    }

    const body = await req.json();
    const { employeeName, newPassword, username } = body || {};

    await connectToDatabase();

    const targetAdmin = await Admin.findById(id);
    if (!targetAdmin) {
      return NextResponse.json({ success: false, error: "لم يتم العثور على الحساب" }, { status: 404 });
    }

    if (employeeName !== undefined && typeof employeeName === "string") {
      targetAdmin.employeeName = employeeName.trim();
    }

    if (username && typeof username === "string" && username.trim()) {
      const trimmed = username.trim().toLowerCase();
      if (trimmed !== targetAdmin.username) {
        const existing = await Admin.findOne({ username: trimmed });
        if (existing) {
          return NextResponse.json(
            { success: false, error: "اسم المستخدم هذا مُستخدم بالفعل لحساب آخر" },
            { status: 400 }
          );
        }
        targetAdmin.username = trimmed;
      }
    }

    if (newPassword && typeof newPassword === "string" && newPassword.trim()) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: "كلمة السر الجديدة يجب أن تكون 8 أحرف على الأقل" },
          { status: 400 }
        );
      }
      targetAdmin.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await targetAdmin.save();

    return NextResponse.json({
      success: true,
      message: `تم تحديث بيانات حساب المسؤول "${targetAdmin.username}" وكلمة السر بنجاح`,
      data: {
        _id: targetAdmin._id.toString(),
        username: targetAdmin.username,
        employeeName: targetAdmin.employeeName || "",
        createdAt: targetAdmin.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error("PUT /api/admin/admins/[id] error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء تعديل الحساب" }, { status: 500 });
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
    if (!id) {
      return NextResponse.json({ success: false, error: "معرف الحساب غير صالح" }, { status: 400 });
    }

    await connectToDatabase();

    const totalAdmins = await Admin.countDocuments();
    if (totalAdmins <= 1) {
      return NextResponse.json(
        {
          success: false,
          error: "لا يمكن حذف حساب المسؤول الأخير في النظام لمنع الإغلاق النهائي (Lockout).",
        },
        { status: 400 }
      );
    }

    const targetAdmin = await Admin.findById(id);
    if (!targetAdmin) {
      return NextResponse.json({ success: false, error: "لم يتم العثور على الحساب" }, { status: 404 });
    }

    await Admin.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `تم حذف حساب المسؤول "${targetAdmin.username}" بنجاح`,
    });
  } catch (error: unknown) {
    console.error("DELETE /api/admin/admins/[id] error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء محاولة حذف الحساب" }, { status: 500 });
  }
}
