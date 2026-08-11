const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Load .env.local if present
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?([^"'\r\n]+)["']?/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI environment variable is required.");
  process.exit(1);
}

const action = process.argv[2];
if (action !== "on" && action !== "off") {
  console.log("Usage: node scripts/toggle_site_status.js <on|off>");
  process.exit(1);
}

const suspended = action === "on";

const SiteConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "site_status" },
    suspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const SiteConfig =
  mongoose.models.SiteConfig || mongoose.model("SiteConfig", SiteConfigSchema);

async function main() {
  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(MONGODB_URI);

  const config = await SiteConfig.findOneAndUpdate(
    { key: "site_status" },
    { suspended, updatedAt: new Date() },
    { upsert: true, returnDocument: "after" }
  );

  console.log(`Site status updated. Suspended: ${config.suspended}`);

  await mongoose.disconnect();
  console.log("Database disconnected.");
}

main().catch((err) => {
  console.error("Error updating site status:", err);
  process.exit(1);
});
