// Scrapes Jujutsu Kaisen characters from the JJK wiki and writes data/characters.js.
// The wiki uses a portable infobox, read from the rendered page.
// Usage: node jujutsukaisen/scripts/scrape.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seed } from "./seed.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://jujutsu-kaisen.fandom.com/api.php";
const IMG_DIR = join(ROOT, "assets", "characters");
const UA = { "User-Agent": "Jujutsudle fan game scraper (personal project)" };
// The image CDN only serves files when they are requested from the wiki itself.
const IMG_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", Referer: "https://jujutsu-kaisen.fandom.com/" };

// Last anime episode of each arc.
const ARC_ENDS = [5, 13, 21, 24, 29, 47, 9999];

const RACES = [
  [/death painting|cursed womb/i, "Death Painting"], [/incarnat|reincarnat|vessel/i, "Incarnated"], [/shikigami/i, "Shikigami"],
  [/cursed corpse|panda/i, "Cursed Corpse"], [/curse|spirit/i, "Cursed Spirit"], [/human/i, "Human"],
];
const HAIR = [
  [/bald/i, "Bald"], [/black/i, "Black"], [/blond|yellow/i, "Blonde"], [/pink/i, "Pink"], [/purple|violet|lavender/i, "Purple"],
  [/green/i, "Green"], [/blue/i, "Blue"], [/orange|ginger/i, "Orange"], [/red/i, "Red"], [/brown/i, "Brown"], [/white|silver|platinum/i, "White"], [/gr[ae]y/i, "Grey"],
];
const AFFS = [
  [/tokyo/i, "Tokyo Jujutsu High"], [/kyoto/i, "Kyoto Jujutsu High"], [/zen.?in/i, "Zen'in Clan"], [/gojo/i, "Gojo Clan"], [/kamo/i, "Kamo Clan"],
  [/disaster|cursed spirit/i, "Cursed Spirits"], [/kenjaku|geto|curse user/i, "Curse Users"], [/death painting|brothers/i, "Death Paintings"],
  [/culling|colony/i, "Culling Game"], [/star religious|time vessel/i, "Star Religious Group"], [/jujutsu headquarters|higher-ups/i, "Jujutsu Headquarters"],
];
const GRADES = [
  [/special grade/i, "Special Grade"], [/semi.?grade 1/i, "Semi-Grade 1"], [/grade 1|first.?grade/i, "Grade 1"], [/grade 2/i, "Grade 2"],
  [/grade 3/i, "Grade 3"], [/grade 4/i, "Grade 4"],
];

const slug = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", redirects: "1", ...params })}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const decode = (s) => s.replace(/&#44;/g, ",").replace(/&#160;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');

// Portable infobox → { source: [lines] }. Every tag is a line break, so list items don't run together.
function infobox(html) {
  const out = {};
  for (const m of html.matchAll(/data-source="([^"]+)"[\s\S]*?<div class="pi-data-value[^>]*>([\s\S]*?)<\/div>/g)) {
    if (m[1] in out) continue;
    const text = decode(m[2].replace(/<sup[\s\S]*?<\/sup>/g, "").replace(/<[^>]+>/g, "\n"));
    out[m[1]] = text.split("\n").map((x) => x.trim()).filter(Boolean);
  }
  return out;
}

const mapFirst = (table, text, fallback) => table.find(([re]) => re.test(text))?.[1] ?? fallback;

// "Blonde (Manga) / Black and Pink (Anime)" → the colour written before "(Anime)", else the first one.
function hairOf(lines = []) {
  const anime = /(?:^|\))\s*([^()]*?)\s*\(Anime\)/i.exec(lines.join(" "));
  const pick = anime ? anime[1] : lines[0] ?? "";
  const colours = pick.replace(/\(.*?\)/g, "").split(/\s*(?:&|,|\/| and )\s*/i);
  const out = colours.map((c) => mapFirst(HAIR, c, null)).filter(Boolean);
  return out.length ? [...new Set(out)] : ["Unknown"];
}

function affiliationsOf(lines = []) {
  const current = lines.filter((l) => !/former|formerly/i.test(l));
  const out = [...new Set(current.map((l) => mapFirst(AFFS, l, null)).filter(Boolean))];
  return out.length ? out.slice(0, 2) : ["None"];
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

    let arc = s.arc;
    if (arc == null) {
      const ep = /Episode (\d+)/.exec((f.debutanime ?? []).join(" "));
      if (!ep) throw new Error(`no anime debut (${(f.debutanime ?? []).join(" ") || "none"})`);
      arc = ARC_ENDS.findIndex((end) => Number(ep[1]) <= end);
    }

    const name = s.name ?? title;
    const id = slug(name);
    const age = /\d{1,4}/.exec((f.age ?? [])[0] ?? "");
    const gender = (f.gender ?? [])[0] ?? "";
    const entry = {
      id,
      name,
      gender: /^female/i.test(gender) ? "F" : /^male/i.test(gender) ? "M" : "Unknown",
      race: [mapFirst(RACES, (f.race ?? []).join(" "), "Unknown")],
      age: age ? Number(age[0]) : null,
      hair: hairOf(f.hair),
      aff: affiliationsOf(f.affiliation),
      grade: mapFirst(GRADES, (f.class ?? f.grade ?? []).join(" "), "None"),
      arc,
      image: img ? await download(img, id) : null,
    };
    for (const k of Object.keys(s)) if (!["wiki", "name"].includes(k)) entry[k] = s[k];
    out.push(entry);
    const fmt = (v) => (v && typeof v === "object" && !Array.isArray(v) ? JSON.stringify(v) : [].concat(v).join("/"));
    console.log(`✓ ${name.padEnd(22)} arc${arc} ${entry.gender.padEnd(7)} ${fmt(entry.race).padEnd(15)} age ${String(entry.age).padEnd(5)} ${fmt(entry.hair).padEnd(12)} ${fmt(entry.aff).padEnd(40)} ${entry.grade.padEnd(13)} raw:${(f.affiliation ?? []).join("|").slice(0, 60)} ${img ? "" : "NO IMG"}`);
  } catch (e) {
    console.log(`✗ ${s.wiki}: ${e.message}`);
  }
}

const js = `// Generated by scripts/scrape.mjs — edit scripts/seed.mjs instead.\nwindow.DLE_CHARACTERS = ${JSON.stringify(out, null, 1)};\n`;
await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(join(ROOT, "data", "characters.js"), js);
console.log(`\n${out.length} characters written`);
