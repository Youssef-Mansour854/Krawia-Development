const fs = require("fs");
const path = require("path");

function loadEnv(file) {
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
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnv(path.join(__dirname, "..", ".env.local"));

async function main() {
  // Import the client build
  const blobClient = require("@vercel/blob/client");

  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );

  try {
    console.log("Uploading test file to /api/upload...");
    const result = await blobClient.upload(
      "test-upload-" + Date.now() + ".png",
      new Blob([pngBuffer], { type: "image/png" }),
      {
        access: "public",
        handleUploadUrl: "http://localhost:3000/api/upload",
      }
    );
    console.log("SUCCESS: upload worked!");
    console.log("URL:", result.url);
    console.log("downloadUrl:", result.downloadUrl);
  } catch (err) {
    console.log("ERROR:");
    console.log("name:", err && err.name);
    console.log("message:", err && err.message);
    console.log("---");
    if (err && err.cause) {
      console.log("cause:", err.cause.message || String(err.cause));
    }
    if (err && err.statusCode) {
      console.log("statusCode:", err.statusCode);
    }
    if (err && err.url) {
      console.log("url:", err.url);
    }
    process.exitCode = 1;
  }
}

main();
