// Scrapes Attack on Titan characters from the Attack on Titan wiki and writes data/characters.js.
// Only gender, height and the portrait come from the wiki; the rest is set in seed.mjs.
// Usage: node attackontitan/scripts/scrape.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seed } from "./seed.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://attackontitan.fandom.com/api.php";
const IMG_DIR = join(ROOT, "assets", "characters");
const UA = { "User-Agent": "Snkdle fan game scraper (personal project)" };
// The image CDN only serves files when they are requested from the wiki itself.
const IMG_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", Referer: "https://attackontitan.fandom.com/" };

const slug = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", redirects: "1", ...params })}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const decode = (s) => s.replace(/&#44;/g, ",").replace(/&#160;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');

// Portable infobox → { source: [lines] }.
function infobox(html) {
  const out = {};
  for (const m of html.matchAll(/data-source="([^"]+)"[\s\S]*?<div class="pi-data-value[^>]*>([\s\S]*?)<\/div>/g)) {
    const key = m[1].toLowerCase();
    if (key in out) continue;
    const text = decode(m[2].replace(/<sup[\s\S]*?<\/sup>/g, "").replace(/<[^>]+>/g, "\n"));
    out[key] = text.split("\n").map((x) => x.trim()).filter(Boolean);
  }
  return out;
}

// Height in cm, as a human (not the Titan form); the last value is the oldest age shown.
function heightOf(lines = []) {
  const cms = lines.join(" ").replace(/\d+\s*m\s*\(Titan[^)]*\)/gi, "").match(/(\d{2,3})\s*cm/g) ?? [];
  const last = cms.at(-1);
  return last ? Number(last.replace(/\D/g, "")) : null;
}


// URL of a wiki file, scaled down like the page images.
async function fileUrl(file) {
  const q = await api({ action: "query", titles: `File:${file}`, prop: "imageinfo", iiprop: "url", iiurlwidth: "320" });
  return Object.values(q.query.pages)[0]?.imageinfo?.[0]?.thumburl ?? null;
}
const imagesStarting = async (prefix) =>
  (await api({ action: "query", list: "allimages", aiprefix: prefix.replace(/ /g, "_"), ailimit: "200" })).query.allimages.map((i) => i.name);

// Portraits from the anime, not the manga: "<name> (Anime) character image", where the wiki often keeps the old
// spellings (Jaeger, Ackermann, Pyxis). The most recent look comes first: the final season (year 854, then the undated
// picture, usually the final-season design), then older years; childhood pictures (845) only as a last resort.
const SPELLINGS = [["Yeager", "Jaeger"], ["Ackerman", "Ackermann"], ["Pixis", "Pyxis"], ["Kirstein", "Kirschtein"], ["Zoë", "Zoe"], ["Dok", "Dawk"],
  ["Arlert", "Arlelt"], ["Blouse", "Braus"], ["Ral", "Rall"], ["Eld Jinn", "Eld Gin"], ["Bott", "Bodt"], ["Shadis", "Sadies"],
  ["Connie", "Conny"], ["Mike Zacharias", "Miche Zacharius"], ["Oluo Bozado", "Oruo Bozad"]];
async function animeImage(title, extra = []) {
  const variants = new Set([title, ...extra]);
  for (const v of [...variants]) for (const [a, b] of SPELLINGS) if (v.includes(a)) variants.add(v.replace(a, b));
  const wanted = new Set([...variants].map((v) => v.toLowerCase()));
  const found = [];
  for (const word of new Set([...variants].map((v) => v.split(" ")[0]))) {
    const r = await api({ action: "query", list: "search", srnamespace: "6", srsearch: `${word} Anime character image`, srlimit: "50" });
    for (const hit of r.query?.search ?? []) {
      const m = /^File:(.+) \(Anime\) character image(?: \((?:c\. )?(\d+)\))?\.\w+$/.exec(hit.title);
      if (m && wanted.has(m[1].toLowerCase())) found.push({ file: hit.title.slice(5), year: m[2] ? Number(m[2]) : null });
    }
  }
  const rank = (x) => (x.year === null ? 1 : x.year >= 854 ? 0 : x.year > 845 ? 2 + (854 - x.year) : 100);
  found.sort((a, b) => rank(a) - rank(b));
  return found[0] ? fileUrl(found[0].file) : null;
}

async function download(url, id) {
  const res = await fetch(url, { headers: IMG_HEADERS });
  if (!res.ok) throw new Error(`image ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = buf.subarray(8, 12).toString() === "WEBP" ? "webp" : buf[0] === 0xff ? "jpg" : "png";
  await writeFile(join(IMG_DIR, `${id}.${ext}`), buf);
  return `assets/characters/${id}.${ext}`;
}

await mkdir(IMG_DIR, { recursive: true });
const out = [];
for (const s of seed) {
  try {
    const p = await api({ action: "parse", page: s.wiki, prop: "text", section: "0" });
    if (!p.parse) throw new Error("page not found");
    const title = p.parse.title;
    const f = infobox(p.parse.text["*"]);
    const q = await api({ action: "query", titles: title, prop: "pageimages", pithumbsize: "320" });
    const img = (s.img ? await fileUrl(s.img) : null) ?? (await animeImage(title, [s.name ?? title, s.wiki])) ?? Object.values(q.query.pages)[0]?.thumbnail?.source;
    const name = s.name ?? title;
    const id = slug(name);
    const gender = (f.gender ?? []).join(" ");
    const entry = {
      id,
      name,
      gender: /female/i.test(gender) ? "F" : /male/i.test(gender) ? "M" : "Unknown",
      height: heightOf(f.height),
      image: img ? await download(img, id) : null,
    };
    for (const k of Object.keys(s)) if (!["wiki", "name", "img"].includes(k)) entry[k] = s[k];
    out.push(entry);
    console.log(`✓ ${name.padEnd(22)} ${entry.gender} ${String(entry.height).padEnd(4)} ${img ? decodeURIComponent(img.split("/images/")[1]?.split("/")[2] ?? "") : "NO IMG"}`);
  } catch (e) {
    console.log(`✗ ${s.wiki}: ${e.message}`);
  }
}

const js = `// Generated by scripts/scrape.mjs — edit scripts/seed.mjs instead.\nwindow.DLE_CHARACTERS = ${JSON.stringify(out, null, 1)};\n`;
await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(join(ROOT, "data", "characters.js"), js);
console.log(`\n${out.length} characters written`);
