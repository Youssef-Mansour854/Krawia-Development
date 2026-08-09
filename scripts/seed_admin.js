const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
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

const username = process.argv[2] || process.env.SEED_ADMIN_USER;
const password = process.argv[3] || process.env.SEED_ADMIN_PASS;

if (!username || !password) {
  console.log("Usage: node scripts/seed_admin.js <username> <password>");
  console.log("Alternatively set SEED_ADMIN_USER and SEED_ADMIN_PASS environment variables.");
  process.exit(1);
}

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function main() {
  console.log(`Connecting to MongoDB Atlas...`);
  await mongoose.connect(MONGODB_URI);

  const normalizedUsername = username.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await Admin.findOne({ username: normalizedUsername });
  if (existing) {
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`Successfully updated password for existing admin: "${normalizedUsername}"`);
  } else {
    await Admin.create({
      username: normalizedUsername,
      passwordHash,
    });
    console.log(`Successfully created new admin account: "${normalizedUsername}"`);
  }

  await mongoose.disconnect();
  console.log("Database disconnected. Admin seed complete.");
}

main().catch((err) => {
  console.error("Error during admin seed:", err);
  process.exit(1);
});
