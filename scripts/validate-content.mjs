// Validates content/*.json against schemas/, checks cross references and house copy rules.
// Usage: node scripts/validate-content.mjs   (also scans out/ when a build exists)
import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const f of fs.readdirSync(path.join(root, "schemas"))) ajv.addSchema(read(`schemas/${f}`));

const files = {
  "site.config": "content/site.config.json",
  tokens: "content/tokens.json",
  diocese: "content/diocese.json",
  parishes: "content/parishes.json",
  clergy: "content/clergy.json",
  events: "content/events.json",
  news: "content/news.json",
  "bishop-schedule": "content/bishop-schedule.json",
  ministries: "content/ministries.json",
  documents: "content/documents.json",
  funds: "content/funds.json",
  careers: "content/careers.json",
  media: "content/media.json",
  pages: "content/pages.json",
};

const data = {};
for (const [schema, file] of Object.entries(files)) {
  data[schema] = read(file);
  const validate = ajv.getSchema(`${schema}.schema.json`);
  if (!validate(data[schema])) {
    for (const e of validate.errors) fail(`${file}${e.instancePath || "/"} ${e.message}`);
  }
}

const config = data["site.config"];
const langs = config.languages.map((l) => l.code);
const dictionary = ajv.getSchema("dictionary.schema.json");
const flatKeys = (o, p = "") => Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? flatKeys(v, `${p}${k}.`) : [`${p}${k}`]));
const baseKeys = new Set(flatKeys(read(`content/i18n/${config.defaultLanguage}.json`)));
for (const lang of langs) {
  const f = `content/i18n/${lang}.json`;
  if (!fs.existsSync(path.join(root, f))) {
    fail(`Language "${lang}" is in site.config.json but ${f} is missing (it would fall back to ${config.defaultLanguage}).`);
    continue;
  }
  const dict = read(f);
  if (!dictionary(dict)) fail(`${f} is not a valid dictionary`);
  const missing = [...baseKeys].filter((k) => !new Set(flatKeys(dict)).has(k));
  if (missing.length) warnings.push(`${f}: ${missing.length} keys fall back to ${config.defaultLanguage} (${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ", ..." : ""})`);
}
if (!langs.includes(config.defaultLanguage)) fail(`defaultLanguage "${config.defaultLanguage}" is not in languages`);

// Cross references
const ids = (arr) => new Set(arr.map((x) => x.id));
const parishIds = ids(data.parishes.parishes);
const clergyIds = ids(data.clergy.clergy);
const deaneryIds = ids(data.diocese.structure.deaneries);
const ref = (set, value, where) => value && !set.has(value) && fail(`${where}: unknown id "${value}"`);
const unique = (arr, where) => {
  const seen = new Set();
  for (const x of arr) {
    if (seen.has(x.id)) fail(`${where}: duplicate id "${x.id}"`);
    seen.add(x.id);
  }
};
unique(data.parishes.parishes, "parishes");
unique(data.clergy.clergy, "clergy");
unique(data.events.events, "events");
unique(data.news.news, "news");
unique(data.funds.funds, "funds");

ref(clergyIds, data.diocese.bishop.clergyId, "diocese.bishop.clergyId");
for (const d of data.diocese.structure.deaneries) ref(clergyIds, d.deanId, `deanery ${d.id}`);
for (const o of data.diocese.structure.offices) ref(clergyIds, o.clergyId, "diocese.structure.offices");
for (const p of data.parishes.parishes) ref(deaneryIds, p.deanery, `parish ${p.id}`);
for (const c of data.clergy.clergy) for (const a of c.assignments) {
  ref(parishIds, a.parishId, `clergy ${c.id}`);
  ref(deaneryIds, a.deanery, `clergy ${c.id}`);
}
for (const e of data.events.events) {
  ref(parishIds, e.location.parishId, `event ${e.id}`);
  if (!e.location.parishId && !e.location.name) fail(`event ${e.id}: location needs parishId or name`);
  if (e.end && e.end < e.start) fail(`event ${e.id}: end is before start`);
}
for (const s of data["bishop-schedule"].entries) ref(parishIds, s.parishId, `bishop-schedule ${s.date}`);
for (const m of data.ministries.ministries) ref(clergyIds, m.contactClergyId, `ministry ${m.id}`);
for (const o of data.careers.openings) ref(parishIds, o.parishId, `opening ${o.id}`);
const albums = ids(data.media.albums);
for (const m of data.media.items) ref(albums, m.album, `media ${m.id}`);
if (data.funds.funds.filter((f) => f.isDefault).length > 1) fail("funds: only one fund can be isDefault");
const sections = config.homeSections.map((s) => s.id);
if (new Set(sections).size !== sections.length) fail("homeSections: each section can appear once");

// Files referenced from content must exist in public/
const assets = [];
const collect = (v) => {
  if (typeof v === "string" && /^\/(images|files)\//.test(v)) assets.push(v);
  else if (v && typeof v === "object") Object.values(v).forEach(collect);
};
Object.values(data).forEach(collect);
for (const a of new Set(assets)) if (!fs.existsSync(path.join(root, "public", a))) fail(`missing file public${a}`);

// Navigation targets must be real pages
const routes = new Set([
  "/", "/about/", "/about/bishop/", "/about/history/", "/about/structure/", "/about/church/", "/clergy/", "/parishes/",
  "/news/", "/news/schedule/", "/events/", "/ministries/", "/resources/", "/resources/feasts/", "/donate/", "/careers/",
  "/media/", "/live/", "/contact/",
  ...data.ministries.ministries.map((m) => `/ministries/${m.id}/`),
  ...data.parishes.parishes.map((p) => `/parishes/${p.id}/`),
  ...data.events.events.map((e) => `/events/${e.id}/`),
  ...data.news.news.map((n) => `/news/${n.id}/`),
  ...data.pages.pages.map((p) => `/${p.path}/`),
]);
const walk = (items) => items.forEach((n) => {
  const p = n.href.split("?")[0];
  if (p.startsWith("/") && !routes.has(p)) fail(`navigation: "${n.href}" is not a page`);
  if (n.children) walk(n.children);
});
walk(config.navigation);
for (const page of data.pages.pages) for (const b of page.blocks) {
  if (b.link?.href?.startsWith("/") && !routes.has(b.link.href.split("?")[0])) fail(`pages/${page.path}: link "${b.link.href}" is not a page`);
}

// House copy rules: no em or en dashes, no cross glyph, no QR codes.
const rules = [
  [/\u2014/, "em dash"],
  [/\u2013/, "en dash"],
  [/\u2626/, "the \u2626 glyph (use the OrthodoxCross component)"],
  [/\bQR\b/i, "QR code"],
];
const scanText = (file, text) => {
  for (const [re, label] of rules) if (re.test(text)) fail(`${file}: contains ${label}`);
};
for (const f of [...Object.values(files), ...langs.map((l) => `content/i18n/${l}.json`)]) {
  if (fs.existsSync(path.join(root, f))) scanText(f, fs.readFileSync(path.join(root, f), "utf8"));
}
const out = path.join(root, "out");
if (fs.existsSync(out)) {
  const html = [];
  const walkDir = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walkDir(p);
    else if (e.name.endsWith(".html")) html.push(p);
  });
  walkDir(out);
  for (const f of html) {
    const text = fs.readFileSync(f, "utf8").replace(/<script[\s\S]*?<\/script>/g, "");
    scanText(path.relative(root, f), text);
  }
  console.log(`Scanned ${html.length} built pages in out/.`);
}

for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(`Content OK: ${Object.keys(files).length} files, ${langs.length} languages.`);
