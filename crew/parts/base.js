// Crew Roll basics: language, DOM helpers, the anime data (pools, slots, scores) and icons.

import { S } from "./state.js";
import { T } from "./text.js";

export const GAMES = window.DLE_GAMES;
export const CREW = window.CREW_GAMES;
export const DEFAULT_POWER = window.CREW_DEFAULT_POWER;
export const REROLLS = 3;
export const ROOT = "../";


S.lang = window.DLE_LANG.get();
export const t = (k) => T[S.lang][k];

export const $ = (s, root = document) => root.querySelector(s);
export const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Data ──
const loaded = {};
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.append(s);
  });
}
// Loaded one game at a time: each file sets the same globals.
let loadChain = Promise.resolve();
export function loadGame(g) {
  if (!loaded[g.id]) {
    loaded[g.id] = loadChain = loadChain.then(async () => {
      await loadScript(`${ROOT}${g.path}config.js`);
      await loadScript(`${ROOT}${g.path}data/characters.js`);
      return { config: window.DLE_CONFIG, chars: window.DLE_CHARACTERS };
    });
  }
  return loaded[g.id];
}

export function playerArc(config) {
  try {
    const s = JSON.parse(localStorage.getItem(`${config.storage}:settings`) || "{}");
    if (Number.isInteger(s.arc)) return s.arc;
  } catch {}
  return null;
}

// Same spoiler rule as the guessing games: a { arc: value } field takes the latest arc reached.
function resolve(value, arc) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const keys = Object.keys(value).map(Number).sort((a, b) => a - b);
  const k = keys.filter((x) => x <= arc).pop() ?? keys[0];
  return value[k];
}

export const displayName = (config, baseName) => config.names?.[S.lang]?.[baseName] ?? baseName;

export function makePool(g, data, arc) {
  const crew = CREW[g.id];
  return data.chars
    .filter((c) => c.arc <= arc && c.image)
    .map((c) => {
      const v = { id: c.id, image: `${ROOT}${g.path}${c.image}`, baseName: c.name };
      for (const [k, val] of Object.entries(c)) if (k !== "image") v[k] = resolve(val, arc);
      v.name = displayName(data.config, c.name);
      v.power = crew.power[c.id] ?? DEFAULT_POWER;
      return v;
    });
}

// A slot group is cut down to the number of characters that can fill it at this arc.
export function makeSlots(g, pool) {
  const slots = [];
  for (const def of CREW[g.id].slots) {
    const candidates = pool.filter((c) => def.fits(c)).length;
    for (let i = 0; i < def.count; i++) slots.push({ def, char: null, points: 0, locked: i >= candidates });
  }
  return slots;
}

export const pointsFor = (slot, c) => (slot.def.score ? slot.def.score(c, c.power) : c.power);
export const openSlots = (slots) => slots.filter((s) => !s.char && !s.locked);
export const fitsIn = (slots, c) => openSlots(slots).some((s) => s.def.fits(c));
export const filledOf = (slots) => slots.filter((s) => s.char);
export const average = (slots) => { const f = filledOf(slots); return f.length ? f.reduce((a, s) => a + s.points, 0) / f.length : 0; };
// In a duel, empty slots count as 0 so skipping a slot is never an advantage.
export const duelScore = (slots) => { const n = slots.filter((s) => !s.locked).length; return n ? filledOf(slots).reduce((a, s) => a + s.points, 0) / n : 0; };
export const rankOf = (avg) => (avg >= 9 ? "S" : avg >= 8 ? "A" : avg >= 6.5 ? "B" : avg >= 5 ? "C" : "D");
export const slotLabel = (slot) => slot.def.label[S.lang];
export const isCaptain = (slot) => slot.def.role === "captain";

// Role icons (24×24 line drawings), named by `icon` in roster.js.
const ICONS = {
  crown: "M3 18h18M4 18 3 7l5 4 4-6 4 6 5-4-1 11",
  swords: "M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 17.5 21 6V3h-3L6.5 14.5M11 19l-6-6M8 16l-4 4M5 21l-2-2",
  sword: "M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2",
  compass: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z",
  chef: "M6 13.9A4 4 0 1 1 8.2 6.3a4 4 0 0 1 7.6 0A4 4 0 1 1 18 13.9V20H6zM6 17h12",
  cross: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 0 6.5 22H20v-5",
  hammer: "m15 12-8.4 8.4a2.1 2.1 0 1 1-3-3L12 9M17.6 15 22 10.6M20.9 11.7l-1.2-1.2a2 2 0 0 1-.6-1.4V7.9l-2.3-2.3a6 6 0 0 0-4.2-1.8H9.4l.9.8a6.2 6.2 0 0 1 2 4.5V10l2 2h1.2a2 2 0 0 1 1.4.6l1.2 1.2",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  skull: "M9 12h.01M15 12h.01M8 20v2h8v-2M12.5 17l-.5-1-.5 1zM16 20a2 2 0 0 0 1.6-3.2 8 8 0 1 0-11.2 0A2 2 0 0 0 8 20",
  mask: "M3 5c3 1 15 1 18 0v6a9 9 0 0 1-18 0zM7 10.5h3M14 10.5h3M9 16c2 1 4 1 6 0",
  star: "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z",
  person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  card: "M3 5h18v14H3zM7 9h4v4H7zM14 10h4M14 14h4M7 16h11",
  bug: "M8 2l1.9 1.9M16 2l-1.9 1.9M9 7.1V6a3 3 0 1 1 6 0v1.1M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6zM12 20v-9M6.5 13H3M21 13h-3.5M6 9.5 3 8M18 9.5 21 8M6 17l-3 2M18 17l3 2",
  spider: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM9.5 11 5 7V3M9 13H3M9.5 15 5 19v2M14.5 11 19 7V3M15 13h6M14.5 15l4.5 4v2",
  bolt: "M13 2 3 14h9l-1 8 10-12h-9z",
  dice: "M4 4h16v16H4zM8.5 8.5h.01M15.5 15.5h.01M12 12h.01M15.5 8.5h.01M8.5 15.5h.01",
  flame: "M12 22c4 0 7-3 7-7 0-5-5-7-5-13-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 9 0 4 3 7 7 7z",
  leaf: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.4 5.2-6.1C9.5 14.4 12 13 13 12",
  cloud: "M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z",
  hat: "M2 18h20M5 18 12 5l7 13",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20",
  flask: "M9 2h6M10 2v6.5L4.4 18.2A2.5 2.5 0 0 0 6.6 22h10.8a2.5 2.5 0 0 0 2.2-3.8L14 8.5V2M7 15h10",
  chess: "M8 22h8M7 18h10l-1 4H8zM9 18c0-3 1-5 1-7H8l1-3h6l1 3h-2c0 2 1 4 1 7M10 5a2 2 0 1 1 4 0 2 2 0 0 1-4 0z",
};
// Role colours by icon (two tones for gradients), so each role reads at a glance.
export const ROLE_RGB = {
  crown: ["255, 215, 80", "255, 140, 40"], swords: ["120, 170, 255", "150, 110, 255"], sword: ["120, 170, 255", "80, 220, 255"],
  compass: ["60, 210, 220", "60, 140, 255"], chef: ["255, 160, 60", "255, 90, 90"], cross: ["70, 220, 130", "40, 200, 200"],
  book: ["190, 130, 255", "255, 110, 200"], hammer: ["230, 175, 100", "255, 120, 60"], shield: ["160, 175, 200", "110, 140, 255"],
  skull: ["200, 200, 215", "150, 120, 255"], mask: ["240, 240, 245", "255, 120, 120"], star: ["255, 220, 90", "255, 150, 60"],
  person: ["120, 200, 255", "120, 255, 200"], card: ["90, 210, 150", "60, 170, 255"], bug: ["160, 220, 80", "60, 200, 120"],
  spider: ["200, 120, 255", "255, 90, 140"], bolt: ["120, 200, 255", "190, 120, 255"], dice: ["255, 150, 210", "190, 120, 255"],
  flame: ["255, 150, 50", "255, 70, 70"], leaf: ["110, 220, 110", "40, 200, 170"], cloud: ["255, 100, 110", "190, 70, 255"],
  hat: ["255, 195, 80", "255, 110, 60"], eye: ["255, 90, 90", "255, 160, 60"], globe: ["90, 180, 255", "90, 230, 200"],
  flask: ["120, 255, 220", "90, 160, 255"], chess: ["230, 230, 255", "160, 140, 255"],
};
export function icon(name, cls = "icon") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", cls);
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", ICONS[name] ?? ICONS.star);
  svg.append(path);
  return svg;
}


export function toast(text) {
  const node = $("#toast");
  node.textContent = text;
  node.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (node.hidden = true), 2200);
}
