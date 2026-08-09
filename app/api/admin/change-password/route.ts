import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { getAdminSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const currentUsername = await getAdminSessionUser(req);
    if (!currentUsername || currentUsername === "system") {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بتغيير كلمة السر" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body || {};

    if (!currentPassword || !newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال كلمة سر جديدة لا تقل عن 6 أحرف" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const admin = await Admin.findOne({ username: currentUsername.toLowerCase() });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "لم يتم العثور على حساب المسؤول" },
        { status: 404 }
      );
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: "كلمة السر الحالية غير صحيحة" },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    admin.passwordHash = newHash;
    await admin.save();

    return NextResponse.json({
      success: true,
      message: "تم تحديث كلمة السر بنجاح",
    });
  } catch (error: unknown) {
    console.error("POST /api/admin/change-password error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم أثناء تغيير كلمة السر" },
      { status: 500 }
    );
  }
}
