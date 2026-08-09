import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const username = await getAdminSessionUser(req);
    if (!username) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }
    return NextResponse.json({ success: true, username });
  } catch {
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
