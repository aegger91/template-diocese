// Language-fit QA: every page × every language at 360 / 768 / 1280.
// Flags text elements with scrollWidth > clientWidth, scrollHeight > clientHeight, or pairwise overlap.
// Usage: npm run preview (another terminal), then: node scripts/language-fit.mjs [baseUrl]
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
  "/",
  "/about/",
  "/about/bishop/",
  "/about/history/",
  "/about/structure/",
  "/about/church/",
  "/clergy/",
  "/parishes/",
  `/parishes/${first("parishes.json", "parishes").id}/`,
  "/news/",
  `/news/${first("news.json", "news").id}/`,
  "/news/schedule/",
  "/events/",
  `/events/${first("events.json", "events").id}/`,
  "/ministries/",
  `/ministries/${first("ministries.json", "ministries").id}/`,
  "/resources/",
  "/resources/feasts/",
  "/donate/",
  "/careers/",
  "/media/",
  "/live/",
  "/contact/",
  ...read("content/pages.json").pages.map((p) => `/${p.path}/`),
];
const widths = [360, 768, 1280];

const skipSel =
  "script, style, svg, path, img, video, canvas, iframe, noscript, [aria-hidden=true], .sr-only, .leaflet-container, [data-slot=sheet-content]";

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
});

const problems = [];
let views = 0;
let clipped = 0;
let overlapped = 0;

async function inspect(page, label) {
  const result = await page.evaluate((skip) => {
    const skipMatch = (el) => el.closest(skip);
    const visible = (el) => {
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
      // Skip screen-reader-only / visually clipped-away text (not on-screen UI).
      if (s.position === "absolute" && (s.clipPath === "inset(50%)" || (s.clip && s.clip !== "auto" && s.clip.includes("0px")))) return false;
      if (s.position === "absolute" && parseFloat(s.width) <= 1 && parseFloat(s.height) <= 1) return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };
    const ownText = (el) =>
      [...el.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent || "")
        .join("")
        .replace(/\s+/g, " ")
        .trim();

    const texty = (el) => {
      if (skipMatch(el)) return false;
      if (!visible(el)) return false;
      // Prefer elements that carry their own text (not layout wrappers).
      if (!ownText(el) && !["BUTTON", "A", "LABEL", "H1", "H2", "H3", "H4", "P", "SPAN", "LI", "TD", "TH", "SUMMARY"].includes(el.tagName)) {
        return false;
      }
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) return false;
      const kids = [...el.children].filter((c) => !skipMatch(c) && visible(c));
      if (kids.length && kids.every((c) => (c.textContent || "").replace(/\s+/g, " ").trim() === text)) return false;
      // Skip pure wrappers that only aggregate child labels (nav/header/ul/div without own text).
      if (!ownText(el) && kids.length > 1) return false;
      return true;
    };

    const clip = [];
    const boxes = [];
    for (const el of document.querySelectorAll("body *")) {
      if (!texty(el)) continue;
      const cs = getComputedStyle(el);
      const overflowX = cs.overflowX;
      const overflowY = cs.overflowY;
      const sw = el.scrollWidth - el.clientWidth;
      const sh = el.scrollHeight - el.clientHeight;
      const lineClamp = cs.webkitLineClamp && cs.webkitLineClamp !== "none";
      const bgClip = (cs.backgroundClip || "").split(" ").includes("text") || (cs.webkitBackgroundClip || "").split(" ").includes("text");
      // Owner rule: flag text whose content exceeds its box, or background-clip:text.
      if (sw > 1 || sh > 1 || bgClip) {
        const sample = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
        clip.push({
          tag: el.tagName.toLowerCase(),
          class: String(el.className || "").slice(0, 80),
          sw,
          sh,
          lineClamp: Boolean(lineClamp),
          bgClip,
          overflow: `${overflowX}/${overflowY}`,
          sample,
        });
      }
      // Overlap checks use leaf-ish text only (own text), to avoid parent/child noise.
      if (!ownText(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width >= 8 && r.height >= 8 && r.bottom > 0 && r.top < innerHeight) {
        boxes.push({
          el,
          left: r.left,
          top: r.top,
          right: r.right,
          bottom: r.bottom,
          sample: ownText(el).slice(0, 40),
          tag: el.tagName.toLowerCase(),
        });
      }
    }

    const overlaps = [];
    const area = (b) => Math.max(0, b.right - b.left) * Math.max(0, b.bottom - b.top);
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        const inter = ix * iy;
        if (inter < 40) continue;
        const smaller = Math.min(area(a), area(b));
        if (!smaller) continue;
        if (inter / smaller > 0.9) continue;
        if (inter / smaller > 0.4 && a.sample !== b.sample) {
          overlaps.push({
            a: `${a.tag}:"${a.sample}"`,
            b: `${b.tag}:"${b.sample}"`,
            inter: Math.round(inter),
          });
          if (overlaps.length >= 8) break;
        }
      }
      if (overlaps.length >= 8) break;
    }

    // Page-level horizontal overflow
    const pageOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;

    return { clip: clip.slice(0, 12), overlaps: overlaps.slice(0, 8), pageOverflow };
  }, skipSel);

  if (result.pageOverflow > 1) {
    problems.push(`${label}: page overflow ${result.pageOverflow}px`);
  }
  for (const c of result.clip) {
    clipped += 1;
    problems.push(
      `${label}: clipped <${c.tag}.${c.class}> sw=${c.sw} sh=${c.sh} overflow=${c.overflow}${c.lineClamp ? " line-clamp" : ""}${c.bgClip ? " bg-clip-text" : ""} "${c.sample}"`,
    );
  }
  for (const o of result.overlaps) {
    overlapped += 1;
    problems.push(`${label}: overlap ${o.a} × ${o.b} (${o.inter}px²)`);
  }
}

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", (e) => problems.push(`script @${width}: ${e.message}`));
  for (const lang of langs) {
    for (const p of pages) {
      const url = `${base}/${lang}${p}`;
      const res = await page.goto(url, { waitUntil: "networkidle" });
      if (!res || res.status() >= 400) {
        problems.push(`${url}: HTTP ${res?.status()}`);
        continue;
      }
      await page.waitForTimeout(80);
      await inspect(page, `${lang}${p} @${width}`);
      views += 1;
    }
  }
  await context.close();
}

await browser.close();

const summary = {
  views,
  pages: pages.length,
  languages: langs.length,
  widths,
  clipped,
  overlapped,
  problemCount: problems.length,
};
console.log(
  `Language-fit: ${views} views (${pages.length} pages × ${langs.length} langs × ${widths.length} widths). clipped=${clipped} overlapped=${overlapped} problems=${problems.length}`,
);
if (problems.length) {
  console.error(problems.map((p) => `- ${p}`).join("\n"));
  process.exit(1);
}
console.log("Language-fit clean: no clipped, overflowing or overlapping text.");
fs.mkdirSync(path.join(root, "qa-output"), { recursive: true });
fs.writeFileSync(path.join(root, "qa-output/language-fit.json"), JSON.stringify(summary, null, 2));
