import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlFiles = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(target);
    else if (entry.name.endsWith(".html") && !target.includes(`${path.sep}src${path.sep}`)) htmlFiles.push(target);
  }
}

await walk(rootDir);
const errors = [];
const required = [
  "index.html",
  "start-here.html",
  "training-plan.html",
  "guides.html",
  "about.html",
  "privacy.html",
  "404.html",
  "sitemap.xml",
  "robots.txt",
  "assets/styles.css",
  "assets/site.js",
  "assets/logo.svg"
];

for (const file of required) {
  try {
    await access(path.join(rootDir, file));
  } catch {
    errors.push(`Missing required file: ${file}`);
  }
}

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const rel = path.relative(rootDir, file).replaceAll("\\", "/");
  if (!html.startsWith("<!doctype html>")) errors.push(`${rel}: missing doctype`);
  if (!html.includes('<html lang="en">')) errors.push(`${rel}: missing lang=en`);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${rel}: missing title`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${rel}: missing meta description`);
  if (!/<link rel="canonical"/.test(html)) errors.push(`${rel}: missing canonical`);

  const links = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const link of links) {
    if (/^(?:https?:|mailto:|tel:|#|data:)/.test(link)) continue;
    const clean = link.split("#")[0].split("?")[0];
    if (!clean) continue;
    const target = path.resolve(path.dirname(file), clean);
    try {
      await access(target);
    } catch {
      errors.push(`${rel}: broken internal link ${link}`);
    }
  }
}

if (!htmlFiles.some((file) => file.endsWith("guides\\name-and-attention.html") || file.endsWith("guides/name-and-attention.html"))) {
  errors.push("Missing name-and-attention guide");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Checked ${htmlFiles.length} HTML pages: no missing required files or broken internal links.`);
