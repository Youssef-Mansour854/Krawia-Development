import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AccessCode } from "@/models/AccessCode";
import {
  createSessionToken,
  VIEWER_COOKIE_NAME,
  constantTimeEqual,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body || {};

    if (!password || typeof password !== "string" || !password.trim()) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال كود الدخول" },
        { status: 400 }
      );
    }

    const inputPassword = password.trim();
    let isMatch = false;

    // 1. Allow ADMIN_PASSWORD as a valid viewer password
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword && constantTimeEqual(inputPassword, adminPassword)) {
      isMatch = true;
    }

    // 2. Check against DB active AccessCode entries
    if (!isMatch) {
      await connectToDatabase();
      const activeCodes = await AccessCode.find({ active: true }).lean().exec();
      for (const item of activeCodes) {
        if (constantTimeEqual(inputPassword, item.code)) {
          isMatch = true;
          break;
        }
      }
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "كود الدخول غير صحيح أو تم إلغاؤه" },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    const response = NextResponse.json(
      { success: true, message: "تم تسجيل الدخول بنجاح" },
      { status: 200 }
    );

    response.cookies.set({
      name: VIEWER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("POST /api/auth/viewer-login error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
