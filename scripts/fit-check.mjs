// Checks every page in every language at 360, 390, 768, 1280 and 1440 px for horizontal overflow,
// then scrolls each page to confirm the sticky header condenses and the page scrolls to the end.
// A second pass forces dir="rtl" to catch layout that is not direction-safe.
// Usage: npm run preview (in another terminal), then: node scripts/fit-check.mjs [baseUrl]
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const root = path.resolve(import.meta.dirname, "..");
const base = (process.argv[2] || "http://127.0.0.1:4318").replace(/\/$/, "");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const config = read("content/site.config.json");
const langs = config.languages.map((l) => l.code);
const first = (file, key) => read(`content/${file}`)[key][0];

const pages = [
  "/", "/about/", "/about/bishop/", "/about/history/", "/about/structure/", "/about/church/", "/clergy/",
  "/parishes/", `/parishes/${first("parishes.json", "parishes").id}/`,
  "/news/", `/news/${first("news.json", "news").id}/`, "/news/schedule/",
  "/events/", `/events/${first("events.json", "events").id}/`,
  "/ministries/", `/ministries/${first("ministries.json", "ministries").id}/`,
  "/resources/", "/resources/feasts/", "/donate/", "/careers/", "/media/", "/live/", "/contact/",
  ...read("content/pages.json").pages.map((p) => `/${p.path}/`),
];
const widths = [360, 390, 768, 1280, 1440];

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome" });
const problems = [];
let checks = 0;

async function inspect(page, label, { scroll }) {
  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const vw = doc.clientWidth;
    const offenders = [];
    if (doc.scrollWidth > vw + 1) {
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width && (r.right > vw + 1 || r.left < -1) && !el.closest(".leaflet-container, [data-slot=sheet-content]")) {
          offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")} (${Math.round(r.left)}..${Math.round(r.right)})`);
          if (offenders.length >= 3) break;
        }
      }
    }
    return { overflow: doc.scrollWidth - vw, offenders };
  });
  if (result.overflow > 1) problems.push(`${label}: page is ${result.overflow}px wider than the screen. ${result.offenders.join("; ")}`);
  if (!scroll) return;
  const header = page.locator("header[data-condensed]");
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(250);
  const scrollable = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 200);
  if (scrollable && (await header.getAttribute("data-condensed")) !== "true") problems.push(`${label}: header did not condense on scroll`);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(150);
  const atEnd = await page.evaluate(() => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2);
  if (!atEnd) problems.push(`${label}: could not scroll to the end of the page`);
  const headerTop = await header.evaluate((h) => h.getBoundingClientRect().top);
  if (Math.abs(headerTop) > 1) problems.push(`${label}: sticky header is not at the top after scrolling (${headerTop}px)`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
  if ((await header.getAttribute("data-condensed")) !== "false") problems.push(`${label}: header did not expand back at the top`);
}

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 860 } });
  const page = await context.newPage();
  page.on("pageerror", (e) => problems.push(`${page.url()} @${width}: script error ${e.message}`));
  for (const lang of langs) {
    for (const p of pages) {
      const url = `${base}/${lang}${p}`;
      const res = await page.goto(url, { waitUntil: "networkidle" });
      if (!res || res.status() >= 400) {
        problems.push(`${url}: HTTP ${res?.status()}`);
        continue;
      }
      await page.waitForTimeout(100);
      await inspect(page, `${lang}${p} @${width}`, { scroll: true });
      checks++;
    }
    if (width < 1280) {
      await page.goto(`${base}/${lang}/`, { waitUntil: "networkidle" });
      await page.getByRole("button", { name: new RegExp(read(`content/i18n/${lang}.json`).common.menu, "i") }).click();
      const drawer = page.locator("[data-slot=sheet-content]");
      await drawer.waitFor({ state: "visible", timeout: 3000 }).catch(() => problems.push(`${lang} @${width}: mobile menu did not open`));
      await page.waitForTimeout(800);
      const box = await drawer.boundingBox();
      if (box && (box.x < -1 || box.x + box.width > width + 1)) problems.push(`${lang} @${width}: mobile menu does not fit the screen`);
      await page.keyboard.press("Escape");
    }
  }
  await context.close();
}

// RTL pass: force dir="rtl" on the demo languages to check direction-safe layout.
for (const width of [390, 1280]) {
  const context = await browser.newContext({ viewport: { width, height: 860 } });
  const page = await context.newPage();
  for (const lang of langs) {
    for (const p of pages) {
      await page.goto(`${base}/${lang}${p}`, { waitUntil: "networkidle" });
      await page.evaluate(() => (document.documentElement.dir = "rtl"));
      await page.waitForTimeout(100);
      await inspect(page, `${lang}${p} @${width} rtl`, { scroll: false });
      const mirrored = await page.evaluate(() =>
        [...document.querySelectorAll(".orthodox-symbol, img")].filter((el) => {
          const t = getComputedStyle(el).transform;
          return t !== "none" && /^matrix\(-/.test(t);
        }).length,
      );
      if (mirrored) problems.push(`${lang}${p} @${width} rtl: ${mirrored} mirrored icon(s) or image(s)`);
      checks++;
    }
  }
  await context.close();
}

await browser.close();
console.log(`Checked ${checks} page views (${pages.length} pages x ${langs.length} languages x ${widths.length} widths, plus an RTL pass).`);
if (problems.length) {
  console.error(problems.map((p) => `- ${p}`).join("\n"));
  process.exit(1);
}
console.log("No overflow, scrolling or header problems found.");
