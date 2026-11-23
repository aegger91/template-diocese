// Desktop (1440) and mobile (390) screenshots of the key pages in every language.
// Usage: npm run preview (in another terminal), then: node scripts/screenshots.mjs [baseUrl] [outDir]
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const root = path.resolve(import.meta.dirname, "..");
const base = (process.argv[2] || "http://127.0.0.1:4318").replace(/\/$/, "");
const outDir = path.resolve(process.argv[3] || path.join(root, "qa-output/screenshots"));
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const langs = read("content/site.config.json").languages.map((l) => l.code);
const firstNews = read("content/news.json").news.find((n) => n.category !== "announcement");

const pages = [
  ["home", "/"],
  ["parishes", "/parishes/"],
  ["parish-detail", `/parishes/${read("content/parishes.json").parishes[0].id}/`],
  ["clergy", "/clergy/"],
  ["bishop", "/about/bishop/"],
  ["news", "/news/"],
  ["letter", `/news/${firstNews.id}/`],
  ["events", "/events/"],
  ["feasts", "/resources/feasts/"],
  ["donate", "/donate/"],
];
const devices = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome" });
for (const [device, viewport] of devices) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: device === "mobile" ? 2 : 1 });
  for (const lang of langs) {
    for (const [name, p] of pages) {
      await page.goto(`${base}/${lang}${p}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(outDir, `${lang}-${device}-${name}.png`), fullPage: true });
    }
  }
  await page.close();
}
await browser.close();
console.log(`Saved ${pages.length * langs.length * devices.length} screenshots to ${outDir}`);
