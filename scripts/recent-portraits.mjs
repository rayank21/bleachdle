// Portraits in the characters' most recent look: for every character of every anime, reads the image tabs of
// the wiki infobox and keeps the most recent one, the anime picture over the manga one when the wiki has both.
//   One Piece: "Anime post-timeskip" · Jujutsu Kaisen / Dragon Ball / Black Clover: the "Anime" tab
//   Hunter × Hunter: 2011 · Bleach: the newest year · Attack on Titan: the latest year (not a Titan form)
//   Naruto: Part II (Shippūden), never the Boruto look.
// Usage: node scripts/recent-portraits.mjs [game …] [--out dir]   (default: writes into <game>/assets/characters)
// With --out, the list of what was picked is written to <out>/recent-portraits-<game>.json, to review before copying.
// Black Clover and Attack on Titan get their anime pictures from their own scrapers (the infobox there is often a manga page).
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WIKI = { bleach: "bleach", hunterxhunter: "hunterxhunter", dragonball: "dragonball", naruto: "naruto", onepiece: "onepiece", jujutsukaisen: "jujutsu-kaisen", blackclover: "blackclover", attackontitan: "attackontitan" };
const args = process.argv.slice(2);
const outAt = args.indexOf("--out");
const OUT = outAt >= 0 ? args[outAt + 1] : null;
const games = args.filter((a, i) => !a.startsWith("--") && i !== outAt + 1);
const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36" };
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(wiki, params) {
  for (let k = 0; k < 4; k++) {
    try {
      const res = await fetch(`https://${wiki}.fandom.com/api.php?${new URLSearchParams({ format: "json", redirects: "1", ...params })}`, { headers: UA });
      if (res.ok) return await res.json();
    } catch {}
    await sleep(800 * (k + 1));
  }
  throw new Error("api");
}

// The infobox's pictures, with the label of their tab ("" when there are no tabs).
function infoboxImages(html, game) {
  const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"');
  if (game === "naruto") {
    const at = html.indexOf("infobox");
    const box = html.slice(at, at + 30000);
    return [...box.matchAll(/data-image-name="([^"]+)"/g)].map((m) => decode(m[1])).filter((f) => !/\.svg$/i.test(f)).map((file) => ({ label: "", file }));
  }
  const at = html.indexOf("portable-infobox");
  if (at < 0) return [];
  const box = html.slice(at, at + 80000);
  // The first image block: a single figure, or a collection of tabs.
  const end = box.search(/<section class="pi-item pi-group|<div class="pi-item pi-data|<h2 class="pi-item pi-header/);
  const head = end > 0 ? box.slice(0, end) : box;
  const labels = [...head.matchAll(/wds-tabs__tab-label[^>]*>(?:<[^>]+>)*\s*([^<]+)/g)].map((m) => decode(m[1].trim()));
  const files = [...head.matchAll(/data-image-name="([^"]+)"/g)].map((m) => decode(m[1])).filter((f) => !/\.svg$/i.test(f));
  return files.map((file, i) => ({ label: labels[i] ?? "", file }));
}

function choose(list, game) {
  if (!list.length) return null;
  if (game === "naruto") {
    const notBoruto = list.filter((x) => !/part ?iii|part ?3|boruto|p3\b/i.test(x.file));
    return notBoruto.find((x) => /p(art)?[ _-]?(2|ii)(?!i)|shipp/i.test(x.file)) ?? notBoruto.at(-1) ?? list[0];
  }
  if (game === "attackontitan") return list.find((x) => !/titan/i.test(x.label + x.file)) ?? list[0];
  const anime = list.find((x) => /anime/i.test(x.label) && !/pre.?time.?skip/i.test(x.label));
  return anime ?? list.find((x) => !/manga/i.test(x.label)) ?? list[0];
}

for (const game of games.length ? games : Object.keys(WIKI)) {
  const wiki = WIKI[game];
  const { seed } = await import(`file://${join(ROOT, game, "scripts", "seed.mjs").replace(/\\/g, "/")}`);
  const chars = JSON.parse((await readFile(join(ROOT, game, "data", "characters.js"), "utf8")).replace(/^[\s\S]*?window\.DLE_CHARACTERS = /, "").replace(/;\s*$/, ""));
  const ids = new Set(chars.map((c) => c.id));
  const dir = OUT ? join(OUT, game) : join(ROOT, game, "assets", "characters");
  await mkdir(dir, { recursive: true });
  const report = [];
  for (const s of seed) {
    const title = s.wiki ?? s.name;
    const id = slug(s.name ?? title);
    if (!ids.has(id)) continue;
    try {
      const page = await api(wiki, { action: "parse", page: title, prop: "text", section: "0" });
      const pick = choose(infoboxImages(page.parse?.text?.["*"] ?? "", game), game);
      if (!pick) { report.push({ id, title, skip: "no infobox image" }); console.log(`· ${game}/${id}: no infobox image, kept`); continue; }
      const info = await api(wiki, { action: "query", titles: `File:${pick.file}`, prop: "imageinfo", iiprop: "url", iiurlwidth: "360" });
      const url = Object.values(info.query.pages)[0]?.imageinfo?.[0]?.thumburl;
      if (!url) throw new Error(`no url for ${pick.file}`);
      const res = await fetch(url, { headers: { ...UA, Referer: `https://${wiki}.fandom.com/` } });
      if (!res.ok) throw new Error(`image ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.subarray(8, 12).toString() !== "WEBP") throw new Error("not webp");
      await writeFile(join(dir, `${id}.webp`), buf);
      report.push({ id, title, label: pick.label, file: pick.file });
      console.log(`✓ ${game}/${id.padEnd(28)} ${pick.label.padEnd(24)} ${pick.file}`);
    } catch (e) {
      report.push({ id, title, error: e.message });
      console.log(`✗ ${game}/${id}: ${e.message}`);
    }
    await sleep(120);
  }
  if (OUT) await writeFile(join(OUT, `recent-portraits-${game}.json`), JSON.stringify(report, null, 1));
}
