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

export async function createSessionToken(username: string = "admin"): Promise<string> {
  const secret = getAdminSecret();
  const timestamp = Date.now().toString();
  const payload = `${username}.${timestamp}`;
  const sig = await hmacSha256(payload, secret);
  return `${payload}.${sig}`;
}

export interface VerifyTokenResult {
  valid: boolean;
  username?: string;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<VerifyTokenResult> {
  if (!token) return { valid: false };
  const parts = token.split(".");

  // Support 3-part format: username.timestamp.sig
  if (parts.length === 3) {
    const [username, timestampStr, sig] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return { valid: false };

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const age = Date.now() - timestamp;
    if (age > SEVEN_DAYS_MS || age < -60000) return { valid: false };

    const secret = getAdminSecret();
    const expectedSig = await hmacSha256(`${username}.${timestampStr}`, secret);

    if (constantTimeEqual(sig, expectedSig)) {
      return { valid: true, username };
    }
    return { valid: false };
  }

  // Fallback for 2-part legacy format: timestamp.sig
  if (parts.length === 2) {
    const [timestampStr, sig] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return { valid: false };

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const age = Date.now() - timestamp;
    if (age > SEVEN_DAYS_MS || age < -60000) return { valid: false };

    const secret = getAdminSecret();
    const expectedSig = await hmacSha256(timestampStr, secret);

    if (constantTimeEqual(sig, expectedSig)) {
      return { valid: true, username: "admin" };
    }
    return { valid: false };
  }

  return { valid: false };
}

export async function getAdminSessionUser(req: NextRequest): Promise<string | null> {
  const secretHeader = req.headers.get("x-admin-secret");
  const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
  const expectedSecret = getAdminSecret();

  if ((secretHeader && constantTimeEqual(secretHeader, expectedSecret)) ||
      (authHeader && constantTimeEqual(authHeader, expectedSecret))) {
    return "system";
  }

  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const res = await verifySessionToken(cookieToken);
  if (res.valid && res.username) {
    return res.username;
  }
  return null;
}

export async function isAuthorizedAdmin(req: NextRequest): Promise<boolean> {
  const user = await getAdminSessionUser(req);
  return user !== null;
}

export async function isAuthorizedViewerOrAdmin(req: NextRequest): Promise<boolean> {
  if (await isAuthorizedAdmin(req)) {
    return true;
  }
  const viewerToken = req.cookies.get(VIEWER_COOKIE_NAME)?.value;
  const res = await verifySessionToken(viewerToken);
  return res.valid;
}
