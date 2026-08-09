import { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "admin_session";
export const VIEWER_COOKIE_NAME = "viewer_session";

function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SECRET environment variable is required");
  }
  return secret;
}

/**
 * Edge-compatible constant-time string comparison preventing timing attacks.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}

async function hmacSha256(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(): Promise<string> {
  const secret = getAdminSecret();
  const timestamp = Date.now().toString();
  const sig = await hmacSha256(timestamp, secret);
  return `${timestamp}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestampStr, sig] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Session expires in 7 days, and cannot be from the future
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const age = Date.now() - timestamp;
  if (age > SEVEN_DAYS_MS || age < -60000) return false;

  const secret = getAdminSecret();
  const expectedSig = await hmacSha256(timestampStr, secret);

  return constantTimeEqual(sig, expectedSig);
}

export async function isAuthorizedAdmin(req: NextRequest): Promise<boolean> {
  const secretHeader = req.headers.get("x-admin-secret");
  const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
  const expectedSecret = getAdminSecret();

  if (secretHeader && constantTimeEqual(secretHeader, expectedSecret)) {
    return true;
  }
  if (authHeader && constantTimeEqual(authHeader, expectedSecret)) {
    return true;
  }

  // Check admin session cookie
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(cookieToken);
}

export async function isAuthorizedViewerOrAdmin(req: NextRequest): Promise<boolean> {
  if (await isAuthorizedAdmin(req)) {
    return true;
  }
  const viewerToken = req.cookies.get(VIEWER_COOKIE_NAME)?.value;
  return verifySessionToken(viewerToken);
}
