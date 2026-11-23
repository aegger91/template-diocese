// Quick screenshot helper: node scripts/shot.mjs <url> <out.png> [width] [full]
import { chromium } from "playwright-core";

const [url, out, width = "1280", full = "full"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome" });
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: full === "full" });
await browser.close();
