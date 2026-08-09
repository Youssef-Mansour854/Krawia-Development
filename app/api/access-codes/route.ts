import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AccessCode } from "@/models/AccessCode";
import { isAuthorizedAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await isAuthorizedAdmin(req))) {
    return NextResponse.json(
      { success: false, error: "غير مصرح لك بالوصول" },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();
    const codes = await AccessCode.find().sort({ createdAt: -1 }).lean().exec();
    return NextResponse.json({ success: true, data: codes });
  } catch (error) {
    console.error("GET /api/access-codes error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في خادم البيانات" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorizedAdmin(req))) {
    return NextResponse.json(
      { success: false, error: "غير مصرح لك بالوصول" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { label, code } = body || {};

    if (!label || typeof label !== "string" || !label.trim()) {
      return NextResponse.json(
        { success: false, error: "يرجى كتابة المسمى (الوصف) للكود" },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, error: "يرجى كتابة كود الدخول" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check duplicate code
    const existing = await AccessCode.findOne({ code: code.trim() }).exec();
    if (existing) {
      return NextResponse.json(
        { success: false, error: "هذا الكود مستخدم بالفعل، يرجى اختيار كود آخر" },
        { status: 400 }
      );
    }

    const newCode = await AccessCode.create({
      label: label.trim(),
      code: code.trim(),
      active: true,
    });

    const serializedCode = JSON.parse(JSON.stringify(newCode));
    return NextResponse.json({ success: true, data: serializedCode }, { status: 201 });
  } catch (error) {
    console.error("POST /api/access-codes error:", error);
    return NextResponse.json(
      { success: false, error: "فشل إضافة كود الدخول الجديد" },
      { status: 500 }
    );
  }
}
