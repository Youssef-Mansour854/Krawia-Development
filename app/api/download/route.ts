import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");
    const customFilename = searchParams.get("filename") || "document.pdf";

    if (!fileUrl) {
      return NextResponse.json(
        { error: "رابط الملف غير موجود" },
        { status: 400 }
      );
    }

    const response = await fetch(fileUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "فشل تحميل الملف من المصدر" },
        { status: 502 }
      );
    }

    const blob = await response.blob();
    const headers = new Headers();

    const cleanFilename = customFilename.endsWith(".pdf")
      ? customFilename
      : `${customFilename}.pdf`;

    const encodedFilename = encodeURIComponent(cleanFilename);

    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`
    );
    headers.set(
      "Content-Type",
      response.headers.get("content-type") || "application/pdf"
    );

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("GET /api/download error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تنزيل المستند" },
      { status: 500 }
    );
  }
}
