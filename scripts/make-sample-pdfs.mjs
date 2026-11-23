// Writes clearly marked sample PDFs for every /files/*.pdf referenced in content. Replace them with real files.
// Usage: node scripts/make-sample-pdfs.mjs
import fs from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const en = (v) => (typeof v === "string" ? v : v?.en ?? Object.values(v ?? {})[0] ?? "");
const enList = (v) => (Array.isArray(v) ? v : v?.en ?? []);

const site = read("content/site.config.json");
const files = new Map();
for (const n of read("content/news.json").news) {
  if (n.pdf) files.set(n.pdf, { title: en(n.title), kind: n.category === "announcement" ? "Announcement" : "Official letter", paragraphs: enList(n.body), date: n.date });
}
for (const d of read("content/documents.json").documents) {
  if (!files.has(d.file)) files.set(d.file, { title: en(d.title), kind: "Document", paragraphs: [en(d.description)].filter(Boolean), date: d.updated });
}

const royal = rgb(0.075, 0.149, 0.345);
const gold = rgb(0.769, 0.604, 0.208);
const ink = rgb(0.086, 0.125, 0.231);
// Same geometry as the site's OrthodoxCross: the footrest's left end (viewer's left) is higher.
const CROSS = "M18 0 H22 V60 H18 Z M12 8 H28 V11.5 H12 Z M3 18 H37 V23 H3 Z M9 39.5 L31 46.5 L31 50.5 L9 43.5 Z";

function wrap(text, font, size, width) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

for (const [file, info] of files) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${info.title} (sample)`);
  pdf.setAuthor(en(site.siteName));
  pdf.setSubject("Sample document for the Project Orthodox diocese template");
  const page = pdf.addPage([612, 792]);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  const margin = 72;

  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: gold, borderWidth: 1.5 });
  page.drawRectangle({ x: 30, y: 30, width: width - 60, height: height - 60, borderColor: gold, borderWidth: 0.5 });
  page.drawSvgPath(CROSS, { x: width / 2 - 12, y: height - 70, scale: 0.6, color: royal });
  const center = (text, font, size, y, color = ink) =>
    page.drawText(text, { x: (width - font.widthOfTextAtSize(text, size)) / 2, y, size, font, color });
  center(en(site.siteName).toUpperCase(), sans, 10, height - 125, royal);
  center(info.kind.toUpperCase(), sans, 8, height - 140, gold);
  let y = height - 180;
  for (const line of wrap(info.title, serifBold, 20, width - margin * 2)) {
    center(line, serifBold, 20, y, royal);
    y -= 26;
  }
  center(info.date, serif, 11, y - 2);
  y -= 40;

  const body = [
    ...info.paragraphs,
    "This is a sample file for the website template. It contains no real policy, form or letter. Replace it with your diocese's own document of the same name.",
  ];
  for (const p of body) {
    for (const line of wrap(p, serif, 12, width - margin * 2)) {
      page.drawText(line, { x: margin, y, size: 12, font: serif, color: ink });
      y -= 17;
    }
    y -= 9;
  }

  page.drawText("SAMPLE", { x: width / 2 - 150, y: 260, size: 96, font: sans, color: gold, opacity: 0.12, rotate: { type: "degrees", angle: 30 } });
  center("Sample document. Not for official use.", serif, 9, 48, rgb(0.29, 0.33, 0.45));

  const target = path.join(root, "public", file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, await pdf.save());
}
console.log(`Wrote ${files.size} sample PDFs to public/files.`);
