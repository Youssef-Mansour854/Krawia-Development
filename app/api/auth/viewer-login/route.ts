import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { AccessCode } from "@/models/AccessCode";
import { Admin } from "@/models/Admin";
import {
  createSessionToken,
  VIEWER_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
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
    let isViewerMatch = false;

    // 1. Check against DB active AccessCode entries
    await connectToDatabase();
    const activeCodes = await AccessCode.find({ active: true }).lean();
    if (Array.isArray(activeCodes)) {
      for (const item of activeCodes) {
        if (item.code && constantTimeEqual(inputPassword, item.code)) {
          isViewerMatch = true;
          break;
        }
      }
    }

    if (isViewerMatch) {
      const token = await createSessionToken("viewer");
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
    }

    // 2. Check if password matches an Admin account password or legacy ADMIN_PASSWORD
    let matchedAdminUsername: string | null = null;
    const admins = await Admin.find({}).lean();
    if (Array.isArray(admins)) {
      for (const adminItem of admins) {
        if (adminItem.passwordHash) {
          const match = await bcrypt.compare(inputPassword, adminItem.passwordHash);
          if (match) {
            matchedAdminUsername = adminItem.username;
            break;
          }
        }
      }
    }

    // Fallback: check against ADMIN_PASSWORD env var if set
    if (!matchedAdminUsername && process.env.ADMIN_PASSWORD && constantTimeEqual(inputPassword, process.env.ADMIN_PASSWORD)) {
      matchedAdminUsername = "admin";
    }

    if (matchedAdminUsername) {
      const adminToken = await createSessionToken(matchedAdminUsername);
      const viewerToken = await createSessionToken(matchedAdminUsername);

      const response = NextResponse.json(
        { success: true, message: "تم تسجيل الدخول كمسؤول بنجاح", isAdmin: true },
        { status: 200 }
      );

      // Set admin_session cookie
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: adminToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      // Also set viewer_session cookie for total compatibility
      response.cookies.set({
        name: VIEWER_COOKIE_NAME,
        value: viewerToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "كود الدخول غير صحيح أو غير مفعل" },
      { status: 401 }
    );
  } catch (error: unknown) {
    console.error("POST /api/auth/viewer-login error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}

