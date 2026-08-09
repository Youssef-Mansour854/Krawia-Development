const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browserPath = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;

const LIVE_URL = "https://krawia-development.vercel.app";

async function run() {
  console.log("1. Authenticating via viewer login API...");
  const loginRes = await fetch(`${LIVE_URL}/api/auth/viewer-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "cairo-code-7788" }),
  });
  const setCookie = loginRes.headers.get("set-cookie") || "";
  const match = setCookie.match(/viewer_session=([^;]+)/);
  if (!match) throw new Error("Failed to authenticate viewer session!");

  console.log("2. Launching browser...");
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });

  await page.setCookie({
    name: "viewer_session",
    value: match[1],
    url: LIVE_URL,
  });

  console.log("3. Navigating to project detail page /projects/brj-lml...");
  await page.goto(`${LIVE_URL}/projects/brj-lml`, { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 2500));

  const artifactDir = "C:\\Users\\mms2024\\.gemini\\antigravity-ide\\brain\\d61f58c4-2183-4eee-b3dc-ae4f4673babe";

  console.log("4. Opening PDF viewer modal for Tanta Apartment blueprint...");
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("h4, h3"));
    const card = cards.find((el) => el.textContent.includes("مخطط معمار طنطا") || el.textContent.includes("المخطط"));
    if (card) {
      const btn = card.closest("div").parentElement.querySelector("button");
      if (btn) btn.click();
    }
  });

  await new Promise((r) => setTimeout(r, 5000)); // wait for pdf canvas render

  const pdfPath = path.join(artifactDir, "pdf_viewer_autofit_screenshot.png");
  await page.screenshot({ path: pdfPath, fullPage: false });
  console.log("Saved Screenshot 1 (PDF viewer autofit):", pdfPath);

  console.log("5. Closing modal and capturing project detail layout alignment screenshot...");
  await page.evaluate(() => {
    const closeBtn = document.querySelector("button[aria-label='إغلاق المستعرض']");
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  const layoutPath = path.join(artifactDir, "project_detail_layout_alignment_screenshot.png");
  await page.screenshot({ path: layoutPath, fullPage: true });
  console.log("Saved Screenshot 2 (Project detail layout alignment):", layoutPath);

  await browser.close();
  console.log("SUCCESSFULLY CAPTURED ALL SCREENSHOTS!");
  process.exit(0);
}

run().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
