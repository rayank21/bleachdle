// Scrapes Naruto characters from the Naruto wiki and writes data/characters.js.
// The wiki builds its infobox from data stored elsewhere, so this reads the rendered infobox.
// Usage: node naruto/scripts/scrape.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seed } from "./seed.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://naruto.fandom.com/api.php";
const IMG_DIR = join(ROOT, "assets", "characters");
const UA = { "User-Agent": "Narutodle fan game scraper (personal project)" };
// The image CDN only serves files when they are requested from the wiki itself.
const IMG_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", Referer: "https://naruto.fandom.com/" };

// Last episode of each arc (fillers fold into the arc they sit in).
const PART1_ENDS = [19, 67, 106, 220];
const SHIPPUDEN_ENDS = [32, 88, 175, 214, 500];
const PART2 = 4; // first arc of Shippūden

const LABELS = ["Debut", "Appears in", "Voice Actors", "Personal", "Birthdate", "Sex", "Age", "Height", "Weight", "Blood type", "Classification",
  "Occupation", "Affiliation", "Team", "Clan", "Rank", "Ninja Rank", "Ninja Registration", "Academy Grad. Age", "Chūnin Prom. Age",
  "Family", "Nature Type", "Jutsu", "Tools", "Kekkei Genkai", "Kekkei Mōra", "Tailed Beast", "Partner", "Status", "Species", "Kekkei Tōta", "Unique Traits", "Tailed Beasts", "Kekkei Genkai"];
const VILLAGES = ["Konohagakure", "Sunagakure", "Kirigakure", "Kumogakure", "Iwagakure", "Otogakure", "Amegakure", "Takigakure", "Kusagakure", "Akatsuki"];

const slug = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", redirects: "1", ...params })}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const decode = (s) => s.replace(/&#160;/g, " ").replace(/&#44;/g, ",").replace(/&#91;\d+&#93;/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');

// Infobox → { label: [lines] }
function infobox(html) {
  const start = html.indexOf("infobox");
  // The infobox nests tables, so read the whole lead section: labels delimit the fields.
  const text = decode(
    html.slice(start)
      .replace(/<style[\s\S]*?<\/style>/g, "")
      .replace(/<sup[\s\S]*?<\/sup>/g, "")
      .replace(/<(br|\/tr|\/th|\/td|\/li|\/div)[^>]*>/g, "\n")
      .replace(/<[^>]+>/g, "")
  );
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const out = {};
  let cur = null;
  for (const l of lines) {
    if (LABELS.includes(l)) { cur = l; out[cur] = out[cur] ?? []; continue; }
    if (cur) out[cur].push(l);
  }
  return { fields: out, text: lines.join("\n") };
}

// "Part I: 12–13" / "Part II: 15–17" → { 0: first, 4: second }
function byPart(lines, parse) {
  const p1 = lines.find((l) => /^Part I:/.test(l));
  const p2 = lines.find((l) => /^Part II:/.test(l));
  const v1 = p1 ? parse(p1.replace(/^Part I:\s*/, "")) : null;
  const v2 = p2 ? parse(p2.replace(/^Part II:\s*/, "")) : null;
  if (v1 == null && v2 == null) {
    const plain = lines.find((l) => !/^(Blank Period|Boruto|Adult|Epilogue)/.test(l));
    return plain ? parse(plain.replace(/^[^:]*:\s*/, "")) : null;
  }
  if (v1 != null && v2 != null && v1 !== v2) return { 0: v1, [PART2]: v2 };
  return v1 ?? v2;
}

const firstNumber = (s) => { const m = /\d+/.exec(s); return m ? Number(m[0]) : null; };
function rankOf(s) {
  if (/kage|hokage/i.test(s)) return "Kage";
  if (/jōnin|jonin/i.test(s)) return "Jōnin";
  if (/chūnin|chunin/i.test(s)) return "Chūnin";
  if (/genin/i.test(s)) return "Genin";
  if (/anbu/i.test(s)) return "ANBU";
  return null;
}

const canonOnly = (l) => !/\((Novel|Movie|Game|OVA) only\)/i.test(l);

function natures(lines) {
  const out = lines
    .filter(canonOnly)
    .map((l) => l.replace(/\(.*?\)/g, "").replace(/ Release$/, "").trim())
    .filter((l) => l && !/^(Yin|Yang|Yin–Yang)$/.test(l));
  return out.length ? [...new Set(out)] : ["Unknown"];
}

function clanOf(lines, name) {
  const clans = lines.filter(canonOnly).map((l) => l.replace(/\(.*?\)/g, "").replace(/ Clan$/, "").trim()).filter(Boolean);
  if (!clans.length) return ["None"];
  const words = name.split(" ");
  const own = clans.find((c) => words.includes(c));
  if (own) return [own];
  // A surname that matches none of the clans means the clan came later (e.g. by marriage): treat as none.
  return words.length > 1 ? ["None"] : [clans[0]];
}

function villages(lines) {
  const v = VILLAGES.filter((name) => lines.some((l) => l.startsWith(name) && canonOnly(l)));
  return v.length ? v : ["None"];
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
    const { fields: f, text } = infobox(p.parse.text["*"]);
    const q = await api({ action: "query", titles: title, prop: "pageimages", pithumbsize: "320" });
    const img = Object.values(q.query.pages)[0]?.thumbnail?.source;

    const ep = /Anime\n(Naruto(?: Shippūden)?) Episode #(\d+)/.exec(text);
    if (!ep) throw new Error("no anime debut");
    const n = Number(ep[2]);
    const arc = ep[1] === "Naruto" ? PART1_ENDS.findIndex((e) => n <= e) : PART2 + SHIPPUDEN_ENDS.findIndex((e) => n <= e);

    const name = s.name ?? title;
    const id = slug(name);
    const sex = (f.Sex ?? [])[0] ?? "";
    const entry = {
      id,
      name,
      gender: /female/i.test(sex) ? "F" : /male/i.test(sex) ? "M" : "Unknown",
      age: byPart(f.Age ?? [], firstNumber),
      village: villages(f.Affiliation ?? []),
      clan: clanOf(f.Clan ?? [], name),
      rank: byPart(f["Ninja Rank"] ?? [], rankOf) ?? "None",
      nature: natures(f["Nature Type"] ?? []),
      arc,
      image: img ? await download(img, id) : null,
    };
    for (const k of Object.keys(s)) if (!["wiki", "name"].includes(k)) entry[k] = s[k];
    out.push(entry);
    const fmt = (v) => (v && typeof v === "object" && !Array.isArray(v) ? JSON.stringify(v) : [].concat(v).join("/"));
    console.log(`✓ ${name.padEnd(22)} arc${arc} ${entry.gender} age ${fmt(entry.age).padEnd(12)} ${fmt(entry.village).padEnd(24)} ${fmt(entry.clan).padEnd(10)} ${fmt(entry.rank).padEnd(26)} ${fmt(entry.nature)} ${img ? "" : "NO IMG"}`);
  } catch (e) {
    console.log(`✗ ${s.wiki}: ${e.message}`);
  }
}

const js = `// Generated by scripts/scrape.mjs — edit scripts/seed.mjs instead.\nwindow.DLE_CHARACTERS = ${JSON.stringify(out, null, 1)};\n`;
await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(join(ROOT, "data", "characters.js"), js);
console.log(`\n${out.length} characters written`);
