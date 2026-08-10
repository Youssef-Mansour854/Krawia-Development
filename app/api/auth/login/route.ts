import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { createSessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import {
  getClientIp,
  checkRateLimit,
  recordFailedAttempt,
  resetFailedAttempts,
} from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(ip, 5, 5 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "تجاوزت الحد المسموح من محاولات الدخول الخاطئة. يرجى المحاولة بعد 5 دقائق.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password } = body || {};

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const normalizedUsername = username.trim().toLowerCase();
    const admin = await Admin.findOne({ username: normalizedUsername });

    if (!admin) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    resetFailedAttempts(ip);

    const token = await createSessionToken(admin.username);
    const response = NextResponse.json(
      { success: true, message: "تم تسجيل الدخول بنجاح", username: admin.username },
      { status: 200 }
    );

    // Set signed httpOnly cookie for 7 days
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
