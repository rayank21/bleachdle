// Scrapes Black Clover characters from the Black Clover wiki and writes data/characters.js.
// The wiki uses a portable infobox, read from the rendered page.
// Usage: node blackclover/scripts/scrape.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seed } from "./seed.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://blackclover.fandom.com/api.php";
const IMG_DIR = join(ROOT, "assets", "characters");
const UA = { "User-Agent": "Blackcloverdle fan game scraper (personal project)" };
// The image CDN only serves files when they are requested from the wiki itself.
const IMG_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", Referer: "https://blackclover.fandom.com/" };

// Last anime episode of each arc.
const ARC_ENDS = [13, 19, 27, 39, 50, 65, 95, 157, 167, 99999];

const RACES = [[/devil/i, "Devil"], [/elf/i, "Elf"], [/spirit/i, "Spirit"], [/dwarf/i, "Dwarf"], [/witch/i, "Witch"], [/human/i, "Human"]];
const HAIR = [
  [/bald/i, "Bald"], [/black/i, "Black"], [/blond|yellow|gold/i, "Blonde"], [/pink/i, "Pink"], [/purple|violet|lavender|lilac/i, "Purple"],
  [/green|teal/i, "Green"], [/blue|cyan/i, "Blue"], [/orange|ginger/i, "Orange"], [/red|crimson|scarlet/i, "Red"], [/brown/i, "Brown"],
  [/white|silver|platinum/i, "White"], [/gr[ae]y/i, "Grey"],
];
const AFFS = [
  [/black bull/i, "Black Bulls"], [/golden dawn/i, "Golden Dawn"], [/silver eagle/i, "Silver Eagles"], [/crimson lion/i, "Crimson Lion Kings"],
  [/blue rose/i, "Blue Rose"], [/green mantis/i, "Green Mantis"], [/coral peacock/i, "Coral Peacock"], [/purple orca/i, "Purple Orca"],
  [/aqua deer|azure deer/i, "Aqua Deer"], [/royal knight/i, "Royal Knights"], [/midnight sun/i, "Eye of the Midnight Sun"],
  [/dark triad/i, "Dark Triad"], [/shining general/i, "Eight Shining Generals"], [/magic parliament/i, "Magic Parliament"],
  [/witch/i, "Witches"], [/church|clergy|sister/i, "Church"], [/spade/i, "Spade Kingdom"], [/heart/i, "Heart Kingdom"],
];
const COUNTRIES = [
  [/clover/i, "Clover Kingdom"], [/diamond/i, "Diamond Kingdom"], [/spade/i, "Spade Kingdom"], [/heart/i, "Heart Kingdom"],
  [/witch/i, "Witches' Forest"], [/hino/i, "Hino Country"], [/underworld/i, "Underworld"],
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

function hairOf(lines = []) {
  const colours = (lines[0] ?? "").replace(/\(.*?\)/g, "").split(/\s*(?:&|,|\/| and )\s*/i);
  const out = colours.map((c) => mapFirst(HAIR, c, null)).filter(Boolean);
  return out.length ? [...new Set(out)] : ["Unknown"];
}

// The first magic attribute only: later ones are often spoilers (devil powers, second grimoires).
function attributeOf(lines = []) {
  const first = lines.find((l) => /magic/i.test(l)) ?? lines[0];
  return first ? first.replace(/\s*magic\s*$/i, "").trim() : "None";
}

// Squads and groups the character belongs to now (former ones are skipped).
function affiliationsOf(f) {
  const lines = [...(f.squad ?? []), ...(f.affiliation ?? []), ...(f.occupation ?? [])].filter((l) => !/former|formerly/i.test(l));
  // The Royal Knights squad only forms late: it is left out so early arcs are not spoiled.
  const out = [...new Set(lines.map((l) => mapFirst(AFFS, l, null)).filter((a) => a && a !== "Royal Knights"))];
  return out.length ? out.slice(0, 2) : ["None"];
}


// URL of a wiki file, scaled down like the page images.
async function fileUrl(file) {
  const q = await api({ action: "query", titles: `File:${file}`, prop: "imageinfo", iiprop: "url", iiurlwidth: "320" });
  return Object.values(q.query.pages)[0]?.imageinfo?.[0]?.thumburl ?? null;
}
const imagesStarting = async (prefix) =>
  (await api({ action: "query", list: "allimages", aiprefix: prefix.replace(/ /g, "_"), ailimit: "200" })).query.allimages.map((i) => i.name);

// Portraits from the anime, not the manga: "<name>_anime_profile", else "<name>_square" (an anime screenshot for
// whoever appeared in the anime), else the movie concept art. Characters who never appeared in the anime keep the wiki's picture.
async function animeImage(title) {
  const first = title.split(" ")[0];
  const names = [...new Set([...(await imagesStarting(first)), ...(await imagesStarting(title))])];
  const esc = (s) => s.replace(/ /g, "_").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const who = `(${esc(first)}|${esc(title)})`;
  for (const re of [new RegExp(`^${who}_anime_profile\\.`, "i"), new RegExp(`^${who}_square\\.`, "i"), new RegExp(`^${who}_movie_concept\\.`, "i")]) {
    const hit = names.find((n) => re.test(n));
    if (hit) return fileUrl(hit);
  }
  return null;
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
    const img = (s.img ? await fileUrl(s.img) : null) ?? (await animeImage(title)) ?? Object.values(q.query.pages)[0]?.thumbnail?.source;

    let arc = s.arc;
    if (arc == null) {
      const ep = /Episode (\d+)/.exec((f.anime ?? []).join(" "));
      arc = ep ? ARC_ENDS.findIndex((end) => Number(ep[1]) <= end) : 9; // manga only: after the anime
    }

    const name = s.name ?? title;
    const id = slug(name);
    const age = /\d{1,4}/.exec((f.age ?? [])[0] ?? "");
    const gender = (f.gender ?? []).join(" ");
    const entry = {
      id,
      name,
      gender: /female/i.test(gender) ? "F" : /male/i.test(gender) ? "M" : "Unknown",
      race: [mapFirst(RACES, (f.species ?? []).join(" "), "Unknown")],
      age: age ? Number(age[0]) : null,
      hair: hairOf(f.hair),
      magic: [attributeOf(f.attribute)],
      aff: affiliationsOf(f),
      country: [mapFirst(COUNTRIES, (f.country ?? []).join(" "), "Unknown")],
      arc,
      image: img ? await download(img, id) : null,
    };
    for (const k of Object.keys(s)) if (!["wiki", "name", "img"].includes(k)) entry[k] = s[k];
    out.push(entry);
    const fmt = (v) => (v && typeof v === "object" && !Array.isArray(v) ? JSON.stringify(v) : [].concat(v).join("/"));
    console.log(`✓ ${(img ? decodeURIComponent(img.split("/images/")[1]?.split("/")[2] ?? "") : "NO IMG").padEnd(42)} ${name.padEnd(26)} arc${arc} ${entry.gender} ${fmt(entry.race).padEnd(12)} ${String(entry.age).padEnd(4)} ${fmt(entry.hair).padEnd(10)} ${fmt(entry.magic).padEnd(14)} ${fmt(entry.aff).padEnd(36)} ${fmt(entry.country).padEnd(16)} ${img ? "" : "NO IMG"}`);
  } catch (e) {
    console.log(`✗ ${s.wiki}: ${e.message}`);
  }
}

const js = `// Generated by scripts/scrape.mjs — edit scripts/seed.mjs instead.\nwindow.DLE_CHARACTERS = ${JSON.stringify(out, null, 1)};\n`;
await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(join(ROOT, "data", "characters.js"), js);
console.log(`\n${out.length} characters written`);
