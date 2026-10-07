// Small copies of the portraits (160 px wide) for the places that show them small: the background wall, the
// suggestions, the tried names, profile faces, and the board tiles on screens that don't need the full picture.
// Written next to each portrait in assets/characters/sm/. Only missing or outdated copies are made again.
//
//   node scripts/thumbs.mjs            every anime
//   node scripts/thumbs.mjs bleach     one anime
import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WIDTH = 160;
const only = process.argv[2];
const games = readdirSync(ROOT).filter((d) => existsSync(join(ROOT, d, "assets/characters")) && (!only || d === only));
let made = 0;
for (const game of games) {
  const dir = join(ROOT, game, "assets/characters");
  const out = join(dir, "sm");
  mkdirSync(out, { recursive: true });
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".webp"))) {
    const src = join(dir, file);
    const dest = join(out, file);
    if (existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs) continue;
    await sharp(src).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest);
    made++;
  }
}
console.log(`${made} thumbnail${made === 1 ? "" : "s"} written`);
