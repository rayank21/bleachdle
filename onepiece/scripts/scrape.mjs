// Scrapes One Piece characters from the One Piece wiki and writes data/characters.js.
// The wiki uses a portable infobox, read from the rendered page.
// Usage: node onepiece/scripts/scrape.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seed } from "./seed.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://onepiece.fandom.com/api.php";
const IMG_DIR = join(ROOT, "assets", "characters");
const UA = { "User-Agent": "Onepiecedle fan game scraper (personal project)" };
// The image CDN only serves files when they are requested from the wiki itself.
const IMG_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", Referer: "https://onepiece.fandom.com/" };

// Last anime episode of each arc.
const ARC_ENDS = [61, 135, 206, 325, 384, 516, 574, 746, 891, 1085, 99999];
const WANO = 9; // most final bounties are published at the end of Wano

const SEAS = ["East Blue", "West Blue", "North Blue", "South Blue", "Grand Line", "New World", "Calm Belt", "Red Line"];
const SKY = /sky|skypiea|birka|weatheria/i;
const FISHMAN = /fish-man|fishman|ryugu/i;

const slug = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", redirects: "1", ...params })}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const decode = (s) => s.replace(/&#44;/g, ",").replace(/&#160;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&#91;\d+&#93;/g, "");

// Portable infobox → { source: [lines] } (first occurrence of each field)
function infobox(html) {
  const out = {};
  for (const m of html.matchAll(/data-source="([^"]+)"[\s\S]*?<div class="pi-data-value[^>]*>([\s\S]*?)<\/div>/g)) {
    if (m[1] in out) continue;
    const text = decode(m[2].replace(/<sup[\s\S]*?<\/sup>/g, "").replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, ""));
    out[m[1]] = text.split(/\n|;/).map((x) => x.trim()).filter(Boolean);
  }
  return out;
}

const NOT_CURRENT = /\((former|defected|filler|temporar|disbanded|non-canon|formerly|anime only|movie)/i;

function affiliations(lines = []) {
  // "Marines (Headquarters, Marine 153rd Branch (former))" → "Marines"
  const current = lines.filter((l) => !NOT_CURRENT.test(l) && !/grand fleet/i.test(l)).map((l) => l.split("(")[0].split(",")[0].trim());
  const pick = (current.length ? current : lines.map((l) => l.replace(/\(.*?\)/g, "").trim())).filter(Boolean);
  return pick.length ? [pick[0]] : ["None"];
}

function originOf(lines = []) {
  const first = lines[0] ?? "";
  if (SKY.test(first)) return "Sky Island";
  if (FISHMAN.test(first)) return "Fish-Man Island";
  return SEAS.find((s) => first.includes(s)) ?? "Unknown";
}

function fruitTypes(html) {
  const types = [...html.matchAll(/data-source="dftype"[\s\S]*?<div class="pi-data-value[^>]*>([\s\S]*?)<\/div>/g)]
    .map((m) => decode(m[1].replace(/<[^>]+>/g, "")))
    .map((t) => (/zoan/i.test(t) ? "Zoan" : /logia/i.test(t) ? "Logia" : /paramecia/i.test(t) ? "Paramecia" : null))
    .filter(Boolean);
  return types.length ? [...new Set(types)] : ["None"];
}

// "930,000,000 / 130,000,000 / …" (latest first) → oldest until Wano, latest from Wano on.
// Marines get a star/crown rank in this field instead of a bounty: that counts as no bounty.
function bountyOf(lines = [], debutArc, html) {
  if (/data-source="bounty"[\s\S]{0,300}?(★|alt="Crown")/.test(html)) return 0;
  const values = [...lines.join(" ").matchAll(/\d{1,3}(?:,\d{3})+|\b\d{2,}\b/g)].map((m) => Number(m[0].replace(/,/g, ""))).filter((n) => n > 0);
  if (!values.length) return 0;
  const latest = values[0];
  const oldest = values[values.length - 1];
  if (latest === oldest || debutArc >= WANO) return latest;
  return { [debutArc]: oldest, [WANO]: latest };
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
    const html = p.parse.text["*"];
    const f = infobox(html);
    const q = await api({ action: "query", titles: title, prop: "pageimages", pithumbsize: "320" });
    const img = Object.values(q.query.pages)[0]?.thumbnail?.source;

    const ep = /Episode (\d+)/.exec((f.first ?? []).join(" "));
    if (!ep) throw new Error(`no anime debut (${(f.first ?? []).join(" ")})`);
    const arc = ARC_ENDS.findIndex((end) => Number(ep[1]) <= end);

    const name = s.name ?? title;
    const id = slug(name);
    const age = /\d+/.exec((f.age ?? [])[0] ?? "");
    // Height lists child / pre-timeskip / post-timeskip values: skip the childhood ones.
    const heights = (f.height ?? []).join(" ").split(/(?=\b\d{2,4}\s*cm)/)
      .map((seg) => [/^(\d{2,4})\s*cm/.exec(seg)?.[1], seg])
      .filter(([n]) => n);
    const height = heights.find(([, seg]) => !/child|age \d|young/i.test(seg)) ?? heights[0];
    const epithet = /"([^"]+)"/.exec((f.epithet ?? []).join(" "));
    const entry = {
      id,
      name,
      gender: s.gender ?? "Unknown",
      aff: affiliations(f.affiliation),
      fruit: fruitTypes(html),
      bounty: bountyOf(f.bounty, arc, html),
      height: height ? Number(height[0]) : null,
      origin: originOf(f.origin),
      age: age ? Number(age[0]) : null,
      epithet: epithet ? epithet[1] : null,
      arc,
      image: img ? await download(img, id) : null,
    };
    for (const k of Object.keys(s)) if (!["wiki", "name"].includes(k)) entry[k] = s[k];
    out.push(entry);
    const fmt = (v) => (v && typeof v === "object" && !Array.isArray(v) ? JSON.stringify(v) : [].concat(v).join("/"));
    console.log(`✓ ${name.padEnd(22)} arc${String(arc).padEnd(2)} ${fmt(entry.aff).slice(0, 26).padEnd(26)} ${fmt(entry.fruit).padEnd(16)} ${fmt(entry.bounty).slice(0, 30).padEnd(30)} ${String(entry.height).padEnd(5)} ${entry.origin.padEnd(15)} ${entry.epithet ?? ""} ${img ? "" : "NO IMG"}`);
  } catch (e) {
    console.log(`✗ ${s.wiki}: ${e.message}`);
  }
}

const js = `// Generated by scripts/scrape.mjs — edit scripts/seed.mjs instead.\nwindow.DLE_CHARACTERS = ${JSON.stringify(out, null, 1)};\n`;
await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(join(ROOT, "data", "characters.js"), js);
console.log(`\n${out.length} characters written`);
