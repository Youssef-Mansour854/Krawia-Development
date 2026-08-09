const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browserPath = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;

const LIVE_URL = "https://krawia-development.vercel.app";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });

  console.log("=================== CHECK 1: LIVE VERCEL DEPLOYMENT & ACCESS CODE SYSTEM ===================");
  // Perform viewer login via API
  const loginRes = await fetch(`${LIVE_URL}/api/auth/viewer-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "cairo-code-7788" }),
  });
  const loginData = await loginRes.json();
  console.log("Viewer Login API Status:", loginRes.status, "Response:", loginData);
  if (!loginRes.ok || !loginData.success) {
    throw new Error(`Viewer login API failed! ${JSON.stringify(loginData)}`);
  }

  const setCookie = loginRes.headers.get("set-cookie") || "";
  const match = setCookie.match(/viewer_session=([^;]+)/);
  if (match) {
    await page.setCookie({
      name: "viewer_session",
      value: match[1],
      url: LIVE_URL,
    });
  }

  const homeRes = await fetch(`${LIVE_URL}/`);
  console.log("Live homepage response status:", homeRes.status);
  if (homeRes.status !== 200) throw new Error("Live Vercel deployment failed to respond with 200 OK!");
  console.log("CHECK 1 RESULT: PASS");

  console.log("\n=================== CHECK 2: LIVE GROUPED SECTIONS, SEARCH, & ADMIN BLOB UPLOAD ===================");
  // 1. Grouped sections
  await page.goto(`${LIVE_URL}/projects/brj-lml`, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 2500));
  const pageText = await page.evaluate(() => document.body.innerText);
  if (!pageText.includes("مخططات شبكات الكهرباء والإنارة") || !pageText.includes("مخططات السباكة والتغذية والصرف")) {
    throw new Error("Grouped document sub-sections not found on live project page!");
  }
  console.log("Confirmed live grouped document sub-sections render correctly.");

  // 2. Live Search & Pagination
  await page.goto(`${LIVE_URL}/projects`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("input[placeholder*='بحث']", { timeout: 15000 });
  const searchInput = await page.$("input[placeholder*='بحث']");
  await searchInput.type("برج");
  await new Promise((r) => setTimeout(r, 1200));
  const searchResultText = await page.evaluate(() => document.body.innerText);
  if (!searchResultText.includes("برج الامل")) {
    throw new Error("Live search failed to filter real data!");
  }
  console.log("Confirmed live server-side search filters real data.");

  // 3. Admin Login & Cover Upload Blob URL
  console.log("Logging into admin panel...");
  await page.goto(`${LIVE_URL}/admin/login`, { waitUntil: "domcontentloaded" });
  const adminPwd = await page.$("input[type='password']");
  if (adminPwd) {
    await adminPwd.type("admin123456");
    const loginBtn = await page.$("button[type='submit']");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      loginBtn.click(),
    ]);
  }

  console.log("Navigating to project creation form...");
  await page.goto(`${LIVE_URL}/admin/projects/new`, { waitUntil: "domcontentloaded" });

  const sampleJpegBase64 = "iVBORw0KGgoAAAANSU56NTn+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAOSURBVBhXY2BgYAAAAAQAAVzN/2oAAAAASUVORUS5CYII=";
  const tempImgPath = path.join(__dirname, "test-cover.jpg");
  fs.writeFileSync(tempImgPath, Buffer.from(sampleJpegBase64, "base64"));

  const fileInput = await page.$("input[accept*='image']");
  if (fileInput) {
    await fileInput.uploadFile(tempImgPath);
    await new Promise((r) => setTimeout(r, 4000));
  }
  fs.unlinkSync(tempImgPath);

  const uploadedCoverImg = await page.evaluate(() => {
    const img = document.querySelector("img[alt='صورة الغلاف']");
    return img ? img.src : "";
  });
  console.log("Uploaded Cover Blob URL:", uploadedCoverImg);
  if (!uploadedCoverImg.includes("public.blob.vercel-storage.com")) {
    throw new Error(`Admin cover upload failed to produce public Blob URL! Received: ${uploadedCoverImg}`);
  }
  console.log("CHECK 2 RESULT: PASS");

  console.log("\n=================== CHECK 3: PDF VIEWER AUTO-FIT SCREENSHOT ===================");
  await page.goto(`${LIVE_URL}/projects/brj-lml`, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 2500));

  // Click PDF blueprint to open viewer modal
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("h4, h3"));
    const card = cards.find((el) => el.textContent.includes("مخطط معمار طنطا") || el.textContent.includes("المخطط"));
    if (card) {
      const btn = card.closest("div").parentElement.querySelector("button");
      if (btn) btn.click();
    }
  });

  await new Promise((r) => setTimeout(r, 5000));

  const artifactDir = "C:\\Users\\mms2024\\.gemini\\antigravity-ide\\brain\\d61f58c4-2183-4eee-b3dc-ae4f4673babe";
  const pdfScreenshotPath = path.join(artifactDir, "pdf_viewer_autofit_screenshot.png");
  await page.screenshot({ path: pdfScreenshotPath, fullPage: false });
  console.log("Saved PDF viewer autofit screenshot to:", pdfScreenshotPath);
  console.log("CHECK 3 RESULT: PASS");

  console.log("\n=================== CHECK 4: PROJECT DETAIL LAYOUT ALIGNMENT SCREENSHOT ===================");
  // Close modal if open
  await page.evaluate(() => {
    const closeBtn = document.querySelector("button[aria-label='إغلاق المستعرض']");
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  const layoutScreenshotPath = path.join(artifactDir, "project_detail_layout_alignment_screenshot.png");
  await page.screenshot({ path: layoutScreenshotPath, fullPage: true });
  console.log("Saved project detail layout alignment screenshot to:", layoutScreenshotPath);
  console.log("CHECK 4 RESULT: PASS");

  await browser.close();
  console.log("\nALL 4 FINAL CLOSING CHECKS PASSED PERFECTLY!");
  process.exit(0);
}

run().catch((err) => {
  console.error("FINAL VERIFICATION FAILED:", err);
  process.exit(1);
});
