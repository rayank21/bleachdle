// Scrapes Hunter × Hunter characters from the HxH wiki and writes data/characters.js.
// Usage: node hunterxhunter/scripts/scrape.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seed } from "./seed.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://hunterxhunter.fandom.com/api.php";
const IMG_DIR = join(ROOT, "assets", "characters");
const UA = { "User-Agent": "Hunterdle fan game scraper (personal project)" };
// The image CDN only serves files when they are requested from the wiki itself.
const IMG_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", Referer: "https://hunterxhunter.fandom.com/" };

// 2011 anime: last episode of each arc
const ARC_ENDS = [21, 26, 36, 58, 75, 136, 148];
const NEN = { Enhancement: "Enhancer", Transmutation: "Transmuter", Emission: "Emitter", Conjuration: "Conjurer", Manipulation: "Manipulator", Specialization: "Specialist" };

const slug = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", redirects: "1", ...params })}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// Infobox fields as raw wikitext, keyed by field name.
function infobox(text) {
  const start = text.indexOf("{{Hunterpedia:Character");
  if (start < 0) return {};
  const fields = {};
  for (const m of text.slice(start).matchAll(/\n\|\s*([a-z ]+?)\s*=([\s\S]*?)(?=\n\||\}\}\n)/gi)) {
    if (!(m[1] in fields)) fields[m[1].toLowerCase()] = m[2];
  }
  return fields;
}

const clean = (s = "") =>
  s
    .replace(/<ref[\s\S]*?(<\/ref>|\/>)/gi, "")
    .replace(/\{\{Note[\s\S]*?\}\}/gi, "")
    .replace(/\{\{dtb\|([^}]*)\}\}/gi, "$1")
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/'''?/g, "")
    .trim();
const parts = (s) => clean(s).split(/<br\s*\/?>/i).map((x) => x.trim()).filter(Boolean);

// Wiki hair colours are very precise ("Cerulean", "Pale Lavender"); fold them into a small palette.
const HAIR = [
  [/bald/i, "Bald"], [/none/i, "None"], [/black/i, "Black"], [/blond|yellow/i, "Blonde"],
  [/fuchsia|pink/i, "Pink"], [/lavender|violet|purple/i, "Purple"], [/turquoise|green/i, "Green"],
  [/cerulean|blue/i, "Blue"], [/orange/i, "Orange"], [/red/i, "Red"], [/brown/i, "Brown"],
  [/white/i, "White"], [/gr[ae]y|silver/i, "Grey"],
];
function hairOf(raw) {
  const p = parts(raw);
  const pick = p.find((x) => /2011/.test(x)) ?? p[0];
  if (!pick) return ["Unknown"];
  const colours = pick.replace(/\(.*?\)|\[.*?\]/g, "").split(/\s*(?:&|,|\/| and )\s*/i);
  const out = colours.map((c) => HAIR.find(([re]) => re.test(c))?.[1]).filter(Boolean);
  return out.length ? [...new Set(out)] : ["Unknown"];
}

// Ability names, without wiki templates, sub-techniques (": Rock") or "Unknown".
const abilitiesOf = (raw) =>
  clean(raw.replace(/\{\{Tt\|[\s\S]*?\}\}/gi, ""))
    .split(/<br\s*\/?>|\n/i)
    .filter((a) => !/^\s*:/.test(a))
    .map((a) => a.replace(/\(.*?\)|\{\{.*|\}\}/g, "").trim())
    .filter((a) => a && a !== "Unknown");

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
    const p = await api({ action: "parse", page: s.wiki, prop: "wikitext", section: "0" });
    if (!p.parse) throw new Error("page not found");
    const title = p.parse.title;
    const f = infobox(p.parse.wikitext["*"]);
    const q = await api({ action: "query", titles: title, prop: "pageimages", pithumbsize: "320" });
    const img = Object.values(q.query.pages)[0]?.thumbnail?.source;

    const ep = /Episode (\d+) \(2011\)/.exec(f["anime debut"] ?? "");
    const arc = ep ? ARC_ENDS.findIndex((end) => Number(ep[1]) <= end) : null;
    const age = /\d+/.exec(clean(f.age ?? ""));
    const nen = [...new Set([...clean(f.type ?? "").matchAll(/(Enhancement|Transmutation|Emission|Conjuration|Manipulation|Specialization)/g)].map((m) => NEN[m[1]]))];
    const abilities = abilitiesOf(f.abilities ?? "");
    const gender = clean(f.gender ?? "").split(/\s|<|\(/)[0];

    const name = s.name ?? title;
    const id = slug(name);
    const entry = {
      id,
      name,
      gender: gender === "Male" ? "M" : gender === "Female" ? "F" : "Unknown",
      species: s.species,
      age: age ? Number(age[0]) : null,
      hair: hairOf(f.hair ?? ""),
      nen: nen.length ? nen : ["Unknown"],
      aff: s.aff,
      arc,
      ability: abilities.slice(0, 2).join(", ") || null,
      nenFrom: s.nenFrom ?? null,
      image: img ? await download(img, id) : null,
    };
    for (const k of Object.keys(s)) if (!["wiki", "name"].includes(k)) entry[k] = s[k];
    if (entry.arc == null || entry.arc < 0) throw new Error(`no 2011 debut (${f["anime debut"]})`);
    out.push(entry);
    console.log(`✓ ${name.padEnd(24)} arc${entry.arc} ${entry.gender.padEnd(7)} age ${String(entry.age).padEnd(4)} ${String(entry.hair).padEnd(12)} ${entry.nen.join("/").padEnd(22)} ${img ? "" : "NO IMG"} | ${entry.ability ?? ""}`);
  } catch (e) {
    console.log(`✗ ${s.wiki}: ${e.message}`);
  }
}

const js = `// Generated by scripts/scrape.mjs — edit scripts/seed.mjs instead.\nwindow.DLE_CHARACTERS = ${JSON.stringify(out, null, 1)};\n`;
await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(join(ROOT, "data", "characters.js"), js);
console.log(`\n${out.length} characters written`);
