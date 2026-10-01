// Scrapes Dragon Ball characters from the Dragon Ball wiki and writes data/characters.js.
// The debut is given as an episode title, so its episode page is read for the series and number.
// Usage: node dragonball/scripts/scrape.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seed } from "./seed.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://dragonball.fandom.com/api.php";
const IMG_DIR = join(ROOT, "assets", "characters");
const UA = { "User-Agent": "Dragonballdle fan game scraper (personal project)" };
// The image CDN only serves files when they are requested from the wiki itself.
const IMG_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", Referer: "https://dragonball.fandom.com/" };

// Last episode of each arc per series (fillers fold into the arc they sit in).
const ARC_ENDS = { DB: [[28, 0], [83, 1], [122, 2], [153, 3]], DBZ: [[35, 4], [107, 5], [194, 6], [291, 7]], DBS: [[131, 8]] };

// Wiki race names → game values
const RACES = [
  [/frieza/i, "Frieza Clan"], [/1\/2 saiyan|half-saiyan|saiyan.*earthling|earthling.*saiyan/i, "Half-Saiyan"], [/saiyan/i, "Saiyan"],
  [/namekian|namek/i, "Namekian"], [/bio-android/i, "Bio-Android"], [/android|cyborg/i, "Android"], [/majin/i, "Majin"],
  [/angel/i, "Angel"], [/demon realm/i, "Demon"], [/glind|beerus|god|kai|core person/i, "God"],
  [/animal|^cat|pig|bear|turtle|dog|monkey|wolf/i, "Animal"], [/earthling|human/i, "Human"],
  [/race|mutant|seijin|boulean|alien/i, "Alien"],
];
// The wiki spells the series several ways ("Dragon Ball", "db", "Dragon Ball Super"…).
const seriesOf = (s) => (/super|dbs/i.test(s) ? "DBS" : /\bz\b|dbz|kai/i.test(s) ? "DBZ" : /^(db|dragon ball)$/i.test(s.trim()) ? "DB" : s);

const slug = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", redirects: "1", ...params })}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function infobox(text) {
  const start = text.search(/\{\{(Character|Episode) ?Infobox/i);
  if (start < 0) return {};
  const fields = {};
  for (const m of text.slice(start).matchAll(/\n\|\s*([A-Za-z ]+?)\s*=([\s\S]*?)(?=\n\||\n\}\})/g)) {
    const k = m[1].toLowerCase();
    if (!(k in fields)) fields[k] = m[2];
  }
  return fields;
}

const clean = (s = "") =>
  s.replace(/<ref[\s\S]*?(<\/ref>|\/>)/gi, "").replace(/\{\{[^{}]*\}\}/g, "").replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1").replace(/'''?/g, "").trim();

const episodeCache = new Map();
async function episode(title) {
  if (!episodeCache.has(title)) {
    const p = await api({ action: "parse", page: title, prop: "wikitext", section: "0" });
    const f = infobox(p.parse?.wikitext?.["*"] ?? "");
    episodeCache.set(title, { series: clean(f.series ?? "").trim(), number: Number(clean(f.number ?? "")) || null });
  }
  return episodeCache.get(title);
}

// "Cameo: [[A]]<br>Full Appearance: [[B]]" → B; otherwise the first linked episode.
function debutTitle(raw = "") {
  const full = /Full Appearance:\s*"?\[\[([^\]|]+)/i.exec(raw);
  const first = /\[\[([^\]|]+)/.exec(raw);
  return (full ?? first)?.[1] ?? null;
}

function raceOf(raw) {
  const first = raw.split(/<br\s*\/?>/i).map(clean).find((l) => l && !/formerly|\(GT\)|Xenoverse|Heroes/i.test(l)) ?? "";
  const r = RACES.find(([re]) => re.test(first));
  return r ? r[1] : first || "Unknown";
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
    const p = await api({ action: "parse", page: s.wiki, prop: "wikitext", section: "0" });
    if (!p.parse) throw new Error("page not found");
    const title = p.parse.title;
    const f = infobox(p.parse.wikitext["*"]);
    const q = await api({ action: "query", titles: title, prop: "pageimages", pithumbsize: "320" });
    const img = Object.values(q.query.pages)[0]?.thumbnail?.source;

    // A seed can set the arc when the wiki debut can't be used (crossover or missing field).
    let arc = s.arc;
    let ep = { series: "seed", number: "" };
    if (arc == null) {
      const debut = debutTitle(f["anime debut"]);
      if (!debut) throw new Error("no anime debut");
      ep = await episode(debut);
      const ends = ARC_ENDS[seriesOf(ep.series)];
      if (!ends || !ep.number) throw new Error(`debut "${debut}" is ${ep.series || "?"} ${ep.number ?? ""}`);
      arc = (ends.find(([end]) => ep.number <= end) ?? ends[ends.length - 1])[1];
    }

    const height = /(\d{2,4}(?:\.\d+)?)\s*cm/.exec(clean(f.height ?? ""));
    const gender = clean(f.gender ?? "").split(/\s|<|\(/)[0];
    const name = s.name ?? title;
    const id = slug(name);
    const entry = {
      id,
      name,
      gender: /^female/i.test(gender) ? "F" : /^male/i.test(gender) ? "M" : "Unknown",
      race: [raceOf(f.race ?? "")],
      height: height ? Math.round(Number(height[1])) : null,
      arc,
      image: img ? await download(img, id) : null,
    };
    for (const k of Object.keys(s)) if (!["wiki", "name"].includes(k)) entry[k] = s[k];
    out.push(entry);
    console.log(`✓ ${name.padEnd(22)} arc${arc} (${ep.series} ${String(ep.number).padEnd(3)}) ${entry.gender.padEnd(7)} ${String(entry.height).padEnd(5)} ${JSON.stringify(entry.race).padEnd(24)} raw: ${clean(f.race ?? "").split(/<br/i)[0].slice(0, 50)} ${img ? "" : "NO IMG"}`);
  } catch (e) {
    console.log(`✗ ${s.wiki}: ${e.message}`);
  }
}

const js = `// Generated by scripts/scrape.mjs — edit scripts/seed.mjs instead.\nwindow.DLE_CHARACTERS = ${JSON.stringify(out, null, 1)};\n`;
await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(join(ROOT, "data", "characters.js"), js);
console.log(`\n${out.length} characters written`);
