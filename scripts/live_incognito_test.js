const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browserPath = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;

const LIVE_URL = "https://krawia-development.vercel.app";
const ARTIFACT_DIR = "C:\\Users\\mms2024\\.gemini\\antigravity-ide\\brain\\8ee40d3e-b225-4b4d-b128-4413a0583c97";

async function run() {
  console.log("Launching fresh browser instance (incognito context)...");
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--incognito"],
  });

  // Create an incognito browser context
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log("\n=================== STEP 1: LOGIN AT /admin/login ===================");
  console.log(`Navigating to ${LIVE_URL}/admin/login...`);
  await page.goto(`${LIVE_URL}/admin/login`, { waitUntil: "networkidle2" });

  console.log("Filling admin credentials...");
  const usernameInput = await page.$("input[name='username'], input[type='text']");
  const passwordInput = await page.$("input[name='password'], input[type='password']");

  if (usernameInput) {
    await usernameInput.type("youssef");
  }
  if (passwordInput) {
    await passwordInput.type("NewPass123!");
  }

  const submitButton = await page.$("button[type='submit']");
  console.log("Submitting login form...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    submitButton.click(),
  ]);

  console.log("Post-login URL:", page.url());

  console.log("\n=================== STEP 2: CONFIRM COOKIE DETAILS ===================");
  const cookies = await page.cookies(LIVE_URL);
  console.log("Cookies set for", LIVE_URL, ":");
  console.dir(cookies, { depth: null });

  const adminCookie = cookies.find((c) => c.name === "admin_session");
  if (adminCookie) {
    console.log("\n>>> EXACT COOKIE DETAILS <<<");
    console.log("Name:", adminCookie.name);
    console.log("Value:", adminCookie.value);
    console.log("Domain:", adminCookie.domain);
    console.log("Path:", adminCookie.path);
    console.log("HttpOnly:", adminCookie.httpOnly);
    console.log("Secure:", adminCookie.secure);
    console.log("SameSite:", adminCookie.sameSite);
  } else {
    console.log("WARNING: admin_session cookie NOT found in browser cookies!");
  }

  const screenshot1Path = path.join(ARTIFACT_DIR, "live_admin_login_cookies.png");
  await page.screenshot({ path: screenshot1Path, fullPage: false });
  console.log("Saved post-login screenshot to:", screenshot1Path);

  console.log("\n=================== STEP 3 & 4: NAVIGATE TO HOMEPAGE '/' ===================");
  console.log(`Navigating directly to ${LIVE_URL}/ ...`);
  const homeResponse = await page.goto(`${LIVE_URL}/`, { waitUntil: "networkidle2" });
  
  const finalUrl = page.url();
  const statusCode = homeResponse ? homeResponse.status() : "N/A";
  console.log("Response Status Code:", statusCode);
  console.log("Final URL landed on:", finalUrl);

  const screenshot2Path = path.join(ARTIFACT_DIR, "live_homepage_navigation.png");
  await page.screenshot({ path: screenshot2Path, fullPage: false });
  console.log("Saved homepage navigation screenshot to:", screenshot2Path);

  if (finalUrl === `${LIVE_URL}/` || finalUrl === `${LIVE_URL}`) {
    console.log("\nRESULT: Homepage loaded normally (200 OK)! NO REDIRECT TO /enter.");
  } else if (finalUrl.includes("/enter")) {
    console.log(`\nRESULT: Redirected to /enter! Actual landed URL: ${finalUrl}`);
  } else {
    console.log(`\nRESULT: Landed on unexpected URL: ${finalUrl}`);
  }

  await browser.close();
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
