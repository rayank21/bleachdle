// The game's data and state: config, storage, settings, language, dates, characters at the player's arc, the current game.

import { S } from "./state.js";

export const CFG = window.DLE_CONFIG;
export const CHARS = window.DLE_CHARACTERS;
export const GAMES = window.DLE_GAMES;
export const UI = window.DLE_UI;
// A game can reword the interface (Pokédle says "generation" where the others say "arc").
for (const l of Object.keys(CFG.ui ?? {})) if (UI[l]) Object.assign(UI[l], CFG.ui[l]);
export const ROOT = "../";

export const COLS = CFG.columns;
const EPOCH = new Date(2026, 0, 1);
export const FLIP_STEP = 170;

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ── Storage (browser storage can be unavailable: every access is guarded) ──
export const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(`${CFG.storage}:${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`${CFG.storage}:${key}`, JSON.stringify(value));
    } catch {}
  },
};

export const settings = Object.assign({ arc: null, mode: "daily", play: "classic" }, store.get("settings", {}));
delete settings.lang;
settings.lang = window.DLE_LANG.get();
export const saveSettings = () => store.set("settings", { arc: settings.arc, mode: settings.mode, play: settings.play });
export const isOnline = () => settings.mode === "online";
S.race = null; // online race in progress (see "Online race" below)

// Game variants: classic (attributes), blur (a blurred portrait that sharpens with each guess) and
// desc (a description, then a clue after 3 guesses and a nickname or first letter after 5).
export const PLAYS = ["classic", "blur", "desc"];
export const DESC = window.DLE_DESCRIPTIONS || {};
if (!PLAYS.includes(settings.play) || (settings.play === "desc" && !Object.keys(DESC).length)) settings.play = "classic";
export const play = () => (isOnline() && S.race ? S.race.play : settings.play);
export const CLUE_AT = 3;
export const NICK_AT = 5;
// The strongest characters (Crew Roll power) get an animated aura wherever their portrait shows.
const POWER = window.CREW_GAMES?.[CFG.id]?.power ?? {};
export const auraOf = (id) => (POWER[id] >= 10 ? " aura-10" : POWER[id] >= 9 ? " aura-9" : "");
const arcCap = () => (isOnline() && S.race ? S.race.arc : settings.arc);
// Online games don't count in the daily / endless statistics.
export const statsMode = () => (settings.mode === "endless" ? "endless" : "daily");

// ── i18n helpers ──
export const t = (key) => UI[settings.lang][key];
export const tv = (v) => {
  const table = CFG.values[settings.lang] || {};
  if (v in table) return table[v];
  return CFG.translate?.(v, settings.lang) ?? v;
};
export const arcName = (i) => CFG.arcs[i][settings.lang];
export const colLabel = (key) => CFG.labels[settings.lang][key];

// ── Dates ──
export const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const dayNumber = () => Math.floor((new Date().setHours(0, 0, 0, 0) - EPOCH) / 864e5) + 1;

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  return (h ^ (h >>> 15)) >>> 0;
}

export const normalize = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "");

// ── Characters, resolved for the arc the player has watched (spoiler-free) ──
// A field given as { arcIndex: value } takes the value of the latest arc the player has reached.
const isByArc = (v) => v && typeof v === "object" && !Array.isArray(v);
function resolve(value) {
  if (!isByArc(value)) return value;
  const keys = Object.keys(value).map(Number).sort((a, b) => a - b);
  const k = keys.filter((x) => x <= arcCap()).pop() ?? keys[0];
  return value[k];
}
export const byId = new Map(CHARS.map((c) => [c.id, c]));
// Some characters have a different name in the French dub (Son Goku, Freezer, Hercule…).
export const nameOf = (c) => CFG.names?.[settings.lang]?.[c.name] ?? c.name;
export const view = (id) => {
  const c = byId.get(id);
  const out = {};
  for (const [k, v] of Object.entries(c)) out[k] = resolve(v);
  out.name = nameOf(c);
  return CFG.derive ? CFG.derive(out, arcCap()) : out;
};
export const pool = () => CHARS.filter((c) => c.arc <= arcCap());
// The description game only draws characters that have one.
export const targetPool = (p = play()) => pool().filter((c) => p !== "desc" || DESC[c.id]);

// ── Game state ──
S.game = null;
const playKey = () => (play() === "classic" ? "" : `${play()}:`);
export const gameKey = () => (settings.mode === "daily" ? `daily:${playKey()}${dateKey()}:${settings.arc}` : `endless:${playKey()}${settings.arc}`);

// Each variant has its own character of the day.
export function dailyTarget(d = new Date()) {
  const p = targetPool();
  return p[hash(`${dateKey(d)}|${settings.arc}|${CFG.storage}${play() === "classic" ? "" : `|${play()}`}`) % p.length].id;
}
export function randomTarget(exclude) {
  const p = targetPool().filter((c) => c.id !== exclude);
  return p[Math.floor(Math.random() * p.length)].id;
}

export function loadGame() {
  if (isOnline()) { S.game = S.race ? S.race.game : null; return; }
  const saved = store.get(gameKey(), null);
  const valid = saved && byId.has(saved.target) && byId.get(saved.target).arc <= settings.arc && (play() !== "desc" || DESC[saved.target]);
  S.game = valid
    ? saved
    : { target: settings.mode === "daily" ? dailyTarget() : randomTarget(), guesses: [], status: "playing", revealed: {} };
  saveGame();
}
export const saveGame = () => { if (!isOnline()) store.set(gameKey(), S.game); };
