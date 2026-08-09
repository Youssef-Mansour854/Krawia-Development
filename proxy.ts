import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  VIEWER_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";

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
