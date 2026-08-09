import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { getAdminSessionUser, isAuthorizedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (!(await isAuthorizedAdmin(req))) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    await connectToDatabase();
    const currentUsername = await getAdminSessionUser(req);
    const admins = await Admin.find({}, "-passwordHash").sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      currentUsername,
      admins: JSON.parse(JSON.stringify(admins)),
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/admins error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAuthorizedAdmin(req))) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { username, password } = body || {};

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "اسم المستخدم وكلمة السر مطلوبان" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername.length < 3) {
      return NextResponse.json(
        { success: false, error: "اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "كلمة السر يجب أن تكون 8 أحرف على الأقل" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await Admin.findOne({ username: trimmedUsername });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "اسم المستخدم هذا مُستخدم بالفعل" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      username: trimmedUsername,
      passwordHash,
    });

    const result = {
      _id: newAdmin._id.toString(),
      username: newAdmin.username,
      createdAt: newAdmin.createdAt,
    };

    return NextResponse.json(
      { success: true, message: "تم إضافة حساب المسؤول بنجاح", data: result },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/admin/admins error:", error);
    const errObj = error as { code?: number };
    if (errObj && errObj.code === 11000) {
      return NextResponse.json(
        { success: false, error: "اسم المستخدم هذا مُستخدم بالفعل" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إضافة الحساب" }, { status: 500 });
  }
}
