import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Authenticate admin request using dual header/cookie auth
        const nextReq = new NextRequest(request);
        const isAuthorized = await isAuthorizedAdmin(nextReq);
        if (!isAuthorized) {
          throw new Error("Unauthorized: Admin authorization required for upload");
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "application/pdf",
          ],
          tokenPayload: JSON.stringify({
            user: "admin",
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("[Vercel Blob] Client upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Upload authorization failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
