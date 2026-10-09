// A crew's board: its places and the characters in them.

import { S } from "./state.js";
import { ROLE_RGB, el, icon, isCaptain, pointsFor, slotLabel, t } from "./base.js";
import { burst, ensureFilters, frameImg, sfx, shockwave } from "./fx.js";

// ── Scenes: some anime place their roles on a picture instead of a plain grid ──
// Haikyuu: a volleyball court seen from above (the net at the top, the front row, the back row, the libero), with the
// coach and the wildcard on the bench. Each place is a grid area, by the role's English name (and its number when a
// role has several places).
// Scenes with "pins" are a picture instead (ratio: its width / height), each role a round medallion at a point of it
// (x, y in %): One Piece on the Thousand Sunny (the captain on the lion's head, the first mate in the crow's nest, the
// navigator at her tangerine cabin…), Pokémon on a Poké Ball (the starter on its button).
const SCENES = {
  haikyuu: {
    areas: { "Spiker 1": "sp1", "Middle Blocker 1": "mb1", "Spiker 2": "sp2", "Setter 1": "set", "Middle Blocker 2": "mb2", "Captain 1": "cap",
      "Libero 1": "lib", "Coach / Manager 1": "coach", "Wildcard 1": "wild" },
    bench: ["coach", "wild"],
  },
  onepiece: {
    areas: { "First Mate 1": "mate", "Navigator 1": "nav", "Captain 1": "cap", "Combatant 1": "com1", "Combatant 2": "com2", "Cook 1": "cook",
      "Doctor 1": "doc", "Archaeologist 1": "arch", "Shipwright 1": "ship", "Combatant 3": "com3" },
    bench: [],
    ratio: 1132 / 919,
    pins: { cap: [12, 56], mate: [39, 14], com1: [53, 26], com3: [74, 33], com2: [40, 52], nav: [86, 58], cook: [64, 70],
      doc: [24, 84], arch: [51, 88], ship: [80, 87] },
  },
  pokemon: {
    areas: { "Starter 1": "start", "Legendary / Mythical 1": "leg", "Fire / Electric 1": "fire", "Dragon / Psychic / Ghost 1": "drag",
      "Strategist / Engineer 1": "strat", "Wildcard 1": "wild", "Water / Ice 1": "water", "Grass / Ground / Rock 1": "grass", "Healer 1": "heal" },
    bench: [],
    ratio: 1,
    pins: { start: [50, 50], leg: [50, 15], fire: [24, 27], drag: [76, 27], wild: [14, 50], strat: [86, 50], water: [24, 74], grass: [76, 74], heal: [50, 86] },
  },
};
// Backdrops replaced since by the players' picks (a new file name, so no browser keeps the old one): Hueco Mundo for
// Bleach, a tower on the plains for Hunter × Hunter, wheat fields for Vinland Saga, a gate opening over the city for Solo Leveling.
const REDONE = ["bleach", "hunterxhunter", "vinlandsaga", "sololeveling"];
// The other anime stand in one of their iconic places (crew/assets/boards/<game>.webp, 4:3): Kame House, Konoha, the
// Shibuya crossing, the Black Bulls' hideout, Trost's walls, the Infinity Castle, U.A., Cathedral 8, Rimuru's city, the
// Hero Association. The medallions are spread over it in rows (autoPins).
for (const g of ["bleach", "hunterxhunter", "dragonball", "naruto", "jujutsukaisen", "blackclover", "attackontitan", "demonslayer",
  "myheroacademia", "fireforce", "slime", "onepunchman", "sololeveling", "vinlandsaga"]) {
  SCENES[g] = { areas: {}, bench: [], ratio: 4 / 3, backdrop: `assets/boards/${g}${REDONE.includes(g) ? "-v2" : ""}.webp` };
}

// n medallions in up to three rows (fewer on top: 10 → 3, 4, 3), each row spread across, as [x, y] in %.
function autoPins(n) {
  const rows = n <= 3 ? [n] : n <= 6 ? [Math.floor(n / 2), Math.ceil(n / 2)] : [Math.floor(n / 3), Math.ceil((n - Math.floor(n / 3)) / 2)];
  if (n > 6) rows.push(n - rows[0] - rows[1]);
  const ys = { 1: [52], 2: [30, 72], 3: [19, 50, 81] }[rows.length];
  return rows.flatMap((k, r) => Array.from({ length: k }, (_, i) => [13 + (74 * (i + 0.5)) / k, ys[r]]));
}

// ── Board ──
export function renderBoard(container, slots, { rolled = null, onPlace = null, mini = false, stagger = false } = {}) {
  container.textContent = "";
  container.classList.toggle("is-mini", mini);
  const scene = !mini && SCENES[S.currentGame?.id];
  for (const k of Object.keys(SCENES)) container.classList.remove(`scene-${k}`);
  container.classList.toggle("has-scene", !!scene);
  let court = null;
  let bench = null;
  if (scene) {
    container.classList.add(`scene-${S.currentGame.id}`);
    court = el("div", `scene-field${scene.pins || scene.backdrop ? " has-pins" : ""}${scene.backdrop ? " is-backdrop" : ""}`);
    if (scene.ratio) court.style.aspectRatio = scene.ratio;
    if (scene.backdrop) court.style.backgroundImage = `url("${scene.backdrop}")`;
    court.append(el("i", "scene-deco"));
    container.append(court);
    if (scene.bench.length) {
      bench = el("div", "scene-bench");
      bench.append(el("span", "scene-bench-label", t("bench")));
      container.append(bench);
    }
  }
  const seen = {};
  // Backdrops: the leader takes the middle of the top row, the others fill the rows in order.
  const auto = new Map();
  if (scene?.backdrop) {
    const shown = slots.filter((s) => !s.locked);
    const spots = autoPins(shown.length);
    const lead = shown.findIndex(isCaptain);
    if (lead > 0) {
      const top = spots.filter((p) => p[1] === spots[0][1]);
      const mid = spots.indexOf(top[Math.floor((top.length - 1) / 2)]);
      shown.unshift(...shown.splice(lead, 1));
      spots.unshift(...spots.splice(mid, 1));
    }
    shown.forEach((s, k) => auto.set(s, spots[k]));
  }
  // Two rows: 10 roles make a 5 × 2 grid.
  container.style.setProperty("--cols", Math.max(1, Math.ceil(slots.filter((s) => !s.locked).length / 2)));
  slots.forEach((slot, i) => {
    if (slot.locked) return;
    const card = el("button", "crew-slot");
    card.type = "button";
    card.classList.toggle("is-captain", isCaptain(slot));
    const rgb = ROLE_RGB[slot.def.icon];
    if (rgb) { card.style.setProperty("--role-rgb", rgb[0]); card.style.setProperty("--role2-rgb", rgb[1]); }
    const ic = el("span", "crew-icon");
    ic.append(icon(slot.def.icon));
    card.append(ic);
    if (isCaptain(slot) && !mini) card.append(el("span", "crew-captain-tag", t("captainTag")));
    if (stagger) { card.classList.add("enter"); card.style.animationDelay = `${i * 45}ms`; }
    const canPlace = !!(onPlace && rolled && !slot.char && !slot.locked && slot.def.fits(rolled));
    card.classList.toggle("is-filled", !!slot.char);
    card.classList.toggle("is-target", canPlace);
    if (canPlace) card.style.setProperty("--d", `${i * 50}ms`); // targets light up in a wave
    card.classList.toggle("is-locked", slot.locked);
    card.disabled = !canPlace;
    card.dataset.index = i;

    const face = el("span", "crew-face");
    if (slot.char) {
      const img = el("img");
      img.src = slot.char.formImage || slot.char.image;
      if (slot.char.formImage) frameImg(img, slot.char.form?.focus);
      if (slot.char.form) { ensureFilters(); card.classList.add("is-transformed"); card.style.setProperty("--fx1", slot.char.form.c1); card.style.setProperty("--fx2", slot.char.form.c2); }
      img.alt = "";
      face.append(img);
    } else {
      face.textContent = "?";
    }
    card.append(face);
    card.append(el("span", "crew-name", slot.char ? slot.char.name : t("empty")));
    card.append(el("span", "crew-role", slotLabel(slot)));
    if (slot.char) card.append(el("span", `crew-points p${Math.min(10, Math.round(slot.points))}`, String(slot.points)));
    else if (canPlace) card.append(el("span", "crew-points is-preview", `+${pointsFor(slot, rolled)}`));
    card.setAttribute("aria-label", `${slotLabel(slot)}: ${slot.char ? `${slot.char.name}, ${slot.points}` : canPlace ? t("chooseSlot") : t("empty")}`);
    if (canPlace) card.addEventListener("click", () => onPlace(i));
    if (scene) {
      const n = (seen[slot.def.label.en] = (seen[slot.def.label.en] ?? 0) + 1);
      const area = scene.areas[`${slot.def.label.en} ${n}`];
      const onBench = scene.bench.includes(area);
      const pin = scene.pins?.[area] ?? auto.get(slot);
      if (pin) {
        card.classList.add("is-pin");
        card.style.left = `${pin[0]}%`;
        card.style.top = `${pin[1]}%`;
      } else if (area && !onBench) card.style.gridArea = area;
      (onBench ? bench : court).append(card);
    } else container.append(card);
  });
  const hidden = slots.filter((s) => s.locked);
  if (hidden.length && !mini) {
    const roles = [...new Set(hidden.map(slotLabel))].join(", ");
    container.append(el("p", "crew-note", t("lockedNote")(roles)));
  }
}

export const slotFace = (container, i) => container.querySelector(`[data-index="${i}"] .crew-face`);
// Landing in a slot: the card pops, a ring spreads from the face, strong picks throw sparks.
export function popSlot(container, i, points = 0) {
  const card = container.querySelector(`[data-index="${i}"]`);
  if (!card) return;
  card.classList.add("pop");
  sfx("place");
  const face = card.querySelector(".crew-face");
  shockwave(face, points >= 8 ? "is-legend" : "is-epic");
  if (points >= 8) {
    const r = face.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, { count: 22, spread: 120, gold: points >= 9 });
  }
}
