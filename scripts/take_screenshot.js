const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const possiblePaths = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

let executablePath = possiblePaths.find((p) => fs.existsSync(p));

async function capture() {
  if (!executablePath) {
    console.error("No Chrome/Edge executable found!");
    process.exit(1);
  }

  console.log("Using browser executable:", executablePath);

  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    viewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();

  // Navigate to login
  console.log("Navigating to /admin/login...");
  await page.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle0" });

  // Fill credentials & submit
  await page.type("#username", "youssef");
  await page.type("#password", "NewPass123!");
  await page.click("button[type='submit']");

  console.log("Waiting for navigation after login...");
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  // Navigate to /admin/admins
  console.log("Navigating to /admin/admins...");
  await page.goto("http://localhost:3000/admin/admins", { waitUntil: "networkidle0" });

  // Wait 1.5 sec for rendering
  await new Promise((r) => setTimeout(r, 1500));

  const artifactDir = path.resolve("C:/Users/mms2024/.gemini/antigravity-ide/brain/25246b63-72ba-46a8-ac3c-fce126f4db55");
  const screenshotPath = path.join(artifactDir, "admins_page_screenshot.png");
  
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log("Screenshot saved successfully to:", screenshotPath);
  await browser.close();
}

capture().catch((err) => {
  console.error("Error taking screenshot:", err);
  process.exit(1);
});
