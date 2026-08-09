import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { isAuthorizedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
