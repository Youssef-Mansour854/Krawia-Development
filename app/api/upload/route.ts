import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "application/pdf",
          ],
          tokenPayload: JSON.stringify({ user: "admin" }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("[Vercel Blob] Upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

