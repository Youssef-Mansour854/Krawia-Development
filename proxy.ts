import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  VIEWER_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { SiteConfig } from "@/models/SiteConfig";


export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1. Static files & Next.js assets bypass middleware/proxy
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/icon.svg") ||
    pathname.startsWith("/pdf.worker") ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|pdf|ico|css|js)$/i)
  ) {
    return NextResponse.next();
  }

  // 1b. Check site suspension status FIRST for all routes
  try {
    await connectToDatabase();
    const siteConfig = await SiteConfig.findOne({ key: "site_status" }).lean();
    if (siteConfig?.suspended) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          {
            error: "Service Unavailable",
            message: "هذا الموقع غير متاح مؤقتاً. يرجى التواصل مع مسؤول الموقع لمزيد من المعلومات.",
          },
          { status: 503 }
        );
      }

      const suspendedHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>503 - Service Unavailable</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0d1117;
      color: #c9d1d9;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1.5rem;
      text-align: center;
    }
    .card {
      background-color: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 2.5rem 2rem;
      max-width: 480px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    h1 {
      font-size: 1.75rem;
      color: #f0f6fc;
      margin-top: 0;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.05rem;
      color: #8b949e;
      line-height: 1.6;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>الموقع غير متاح مؤقتاً</h1>
    <p>هذا الموقع غير متاح مؤقتاً. يرجى التواصل مع مسؤول الموقع لمزيد من المعلومات.</p>
  </div>
</body>
</html>`;

      return new NextResponse(suspendedHtml, {
        status: 503,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  } catch (err) {
    console.error("Error checking site suspension status in proxy:", err);
  }


  // Check sessions
  const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const viewerToken = req.cookies.get(VIEWER_COOKIE_NAME)?.value;

  const secretHeader = req.headers.get("x-admin-secret");
  const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
  const expectedSecret = process.env.ADMIN_SECRET;

  const isAdminSecret = Boolean(
    expectedSecret &&
      ((secretHeader && secretHeader === expectedSecret) ||
        (authHeader && authHeader === expectedSecret))
  );

  const adminTokenRes = await verifySessionToken(adminToken);
  const viewerTokenRes = await verifySessionToken(viewerToken);

  const isAdminAuth = isAdminSecret || adminTokenRes.valid;
  const isViewerAuth = viewerTokenRes.valid;
  const isAuthenticated = isAdminAuth || isViewerAuth;

  // 2. Admin routes protection
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    if (isLoginPage) {
      if (isAdminAuth) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    if (!isAdminAuth) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. Exclude public auth endpoints and /enter page
  if (pathname === "/enter" || pathname.startsWith("/api/auth")) {
    if (pathname === "/enter" && isAuthenticated) {
      // If already logged in, redirect away from /enter to homepage or target
      const target = req.nextUrl.searchParams.get("redirect") || "/";
      return NextResponse.redirect(new URL(target, req.url));
    }
    return NextResponse.next();
  }

  // 4. Protect all public pages and API routes
  if (!isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Access code or login required" },
        { status: 401 }
      );
    }

    const redirectPath = `${pathname}${search}`;
    const enterUrl = new URL(
      `/enter?redirect=${encodeURIComponent(redirectPath)}`,
      req.url
    );
    return NextResponse.redirect(enterUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
