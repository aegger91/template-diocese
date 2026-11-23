// Zips the static build with the site files at the zip root.
// Usage: node scripts/zip-dist.mjs [target.zip]   (default: orthodox-diocese-template-dist.zip)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "out");
const target = path.resolve(process.argv[2] || path.join(root, "orthodox-diocese-template-dist.zip"));
if (!fs.existsSync(path.join(out, "index.html"))) {
  console.error("No build found. Run npm run build first.");
  process.exit(1);
}
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.rmSync(target, { force: true });
execFileSync("zip", ["-r", "-q", "-X", target, "."], { cwd: out, stdio: "inherit" });
console.log(`Wrote ${target} (${(fs.statSync(target).size / 1024 / 1024).toFixed(1)} MB)`);
