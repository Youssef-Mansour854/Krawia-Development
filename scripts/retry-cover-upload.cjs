/**
 * Retries the same client-side cover upload path the ProjectForm uses:
 * @vercel/blob/client upload() -> POST /api/upload -> PUT vercel.com/api/blob
 * Logs fetch-level details similar to browser Network/Console.
 */
const fs = require("fs");
const path = require("path");

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv(path.join(__dirname, "..", ".env.local"));

const coverPath = path.join(
  __dirname,
  "..",
  "tmp-upload",
  "shane-rounce-1ZZ96uESRJQ-unsplash.jpg"
);

async function main() {
  if (!fs.existsSync(coverPath)) {
    console.error("[console.error] Cover file missing:", coverPath);
    process.exit(1);
  }

  const fileBuf = fs.readFileSync(coverPath);
  const filename = `cover-${Date.now()}-shane-rounce-1ZZ96uESRJQ-unsplash.jpg`;
  const file = new Blob([fileBuf], { type: "image/jpeg" });

  console.log("[console.log] Starting cover upload (same path as ProjectForm)");
  console.log("[console.log] file:", coverPath);
  console.log("[console.log] size:", fileBuf.length, "bytes");
  console.log("[console.log] filename:", filename);
  console.log("[console.log] handleUploadUrl: http://localhost:3000/api/upload");

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    const method = (init && init.method) || "GET";
    console.log(`[console.log] fetch → ${method} ${url}`);
    const res = await originalFetch(input, init);
    const clone = res.clone();
    let bodyText = "";
    try {
      bodyText = await clone.text();
    } catch {
      bodyText = "<unreadable body>";
    }
    const preview =
      bodyText.length > 500 ? bodyText.slice(0, 500) + "…" : bodyText;
    console.log(
      `[console.log] fetch ← ${res.status} ${res.statusText} ${url}`
    );
    if (preview) console.log("[console.log] response body:", preview);
    return res;
  };

  const { upload } = require("@vercel/blob/client");

  try {
    const result = await upload(filename, file, {
      access: "public",
      handleUploadUrl: "http://localhost:3000/api/upload",
    });
    console.log("[console.log] Upload SUCCESS");
    console.log("[console.log] blob.url:", result.url);
    console.log("[console.log] blob.downloadUrl:", result.downloadUrl);
    if (!result.url || !/\.public\.blob\.vercel-storage\.com/.test(result.url)) {
      console.error(
        "[console.error] Expected a public Vercel Blob URL, got:",
        result.url
      );
      process.exitCode = 1;
    } else {
      console.log("[console.log] Confirmed public domain (*.public.blob.vercel-storage.com)");
    }
  } catch (err) {
    console.error("[console.error] Upload FAILED");
    console.error("[console.error] name:", err && err.name);
    console.error("[console.error] message:", err && err.message);
    if (err && err.cause) {
      console.error(
        "[console.error] cause:",
        err.cause.message || String(err.cause)
      );
    }
    if (err && err.stack) console.error(err.stack);
    process.exitCode = 1;
  }
}

main();
