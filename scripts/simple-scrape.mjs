// Scrapes the characters of a game whose attributes are set by hand in <game>/scripts/seed.mjs, and writes
// <game>/data/characters.js. Only the gender, the height and the portrait come from the wiki (WIKI in the seed);
// everything else (species, affiliation, rank, first arc…) is curated so it stays spoiler-free.
// The seed may export PREFER, a regex for the infobox picture to prefer (e.g. /anime/i).
// Seed entries: { wiki: "Page title", name?: "Shown name", img?: "Wiki file.png", gender?: "M" | "F", height?: cm, …fields }
// Usage: node scripts/simple-scrape.mjs <game>
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const game = process.argv[2];
if (!game) throw new Error("usage: node scripts/simple-scrape.mjs <game>");
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", game);
const { seed, WIKI, PREFER } = await import(`file://${join(ROOT, "scripts", "seed.mjs").replace(/\\/g, "/")}`);
const API = `https://${WIKI}.fandom.com/api.php`;
const IMG_DIR = join(ROOT, "assets", "characters");
const UA = { "User-Agent": "Anime -dle fan game scraper (personal project)" };
// The image CDN only serves files when they are requested from the wiki itself.
const IMG_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", Referer: `https://${WIKI}.fandom.com/` };

const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", redirects: "1", ...params })}`;
  for (let k = 0; k < 4; k++) {
    try {
      const res = await fetch(url, { headers: UA });
      if (res.ok) return await res.json();
    } catch {}
    await sleep(700 * (k + 1));
  }
  throw new Error(`api ${url}`);
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

// Height in cm: the last value listed is usually the latest one (after a timeskip).
function heightOf(f) {
  // (Haikyuu!! lists the high school height as "or-height", the adult one as "ts-height".)
  const lines = f.height ?? f["height(s)"] ?? f["or-height"] ?? [];
  const cms = lines.join(" ").match(/(\d{2,3}(?:[.,]\d)?)\s*cm/g) ?? [];
  const last = cms.at(-1);
  return last ? Math.round(Number(last.replace(/[^\d.,]/g, "").replace(",", "."))) : null;
}

function genderOf(f) {
  const g = (f.gender ?? f.sex ?? []).join(" ");
  return /female|woman|girl/i.test(g) ? "F" : /male|man|boy/i.test(g) ? "M" : null;
}

async function fileUrl(file) {
  const q = await api({ action: "query", titles: `File:${file}`, prop: "imageinfo", iiprop: "url", iiurlwidth: "320" });
  return Object.values(q.query.pages)[0]?.imageinfo?.[0]?.thumburl ?? null;
}

async function download(url, id) {
  const res = await fetch(url, { headers: IMG_HEADERS });
  if (!res.ok) throw new Error(`image ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = buf.subarray(8, 12).toString() === "WEBP" ? "webp" : buf[0] === 0xff ? "jpg" : "png";
  await writeFile(join(IMG_DIR, `${id}.${ext}`), buf);
  return `assets/characters/${id}.${ext}`;
}

// The page itself, or the best search hit when the seed's title has another spelling on the wiki.
async function page(title) {
  let p = await api({ action: "parse", page: title, prop: "text", section: "0" });
  if (p.parse) return p.parse;
  const hit = (await api({ action: "query", list: "search", srsearch: title, srlimit: "1" })).query?.search?.[0]?.title;
  if (!hit) throw new Error("page not found");
  p = await api({ action: "parse", page: hit, prop: "text", section: "0" });
  if (!p.parse) throw new Error("page not found");
  return p.parse;
}

await mkdir(IMG_DIR, { recursive: true });
const out = [];
for (const s of seed) {
  try {
    const p = await page(s.wiki);
    const title = p.title;
    const f = infobox(p.text["*"]);
    const q = await api({ action: "query", titles: title, prop: "pageimages", pithumbsize: "320" });
    // PREFER (a regex in the seed) picks the infobox picture to use when the wiki shows several (its "Anime" tab
    // rather than the light novel or the manga).
    const files = [...p.text["*"].slice(0, 80000).matchAll(/data-image-name="([^"]+)"/g)].map((m) => decode(m[1]));
    const preferred = PREFER && !s.img ? files.find((x) => PREFER.test(x)) : null;
    const img = (s.img ? await fileUrl(s.img) : null) ?? (preferred ? await fileUrl(preferred) : null) ?? Object.values(q.query.pages)[0]?.thumbnail?.source;
    const name = s.name ?? s.wiki;
    const id = slug(name);
    const entry = { id, name, gender: s.gender ?? genderOf(f) ?? "Unknown", height: s.height ?? heightOf(f), image: img ? await download(img, id) : null };
    for (const k of Object.keys(s)) if (!["wiki", "name", "img", "gender", "height"].includes(k)) entry[k] = s[k];
    out.push(entry);
    console.log(`✓ ${name.padEnd(26)} ${entry.gender} ${String(entry.height).padEnd(4)} ${title === s.wiki ? "" : `(${title})`} ${img ? "" : "NO IMG"}`);
  } catch (e) {
    console.log(`✗ ${s.wiki}: ${e.message}`);
  }
  await sleep(80);
}

const js = `// Generated by scripts/simple-scrape.mjs — edit ${game}/scripts/seed.mjs instead.\nwindow.DLE_CHARACTERS = ${JSON.stringify(out, null, 1)};\n`;
await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(join(ROOT, "data", "characters.js"), js);
console.log(`\n${out.length} characters written`);
