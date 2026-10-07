// Motion helpers (count-ups, bursts, shockwaves, flying portraits), transformations and rarity tiers.

import { el } from "./base.js";

// ── Motion helpers ──
// The draw is the heart of Crew Roll, so its motion always plays (even with reduced motion on).
const easeOutCubic = (k) => 1 - Math.pow(1 - k, 3);
export const easeOutQuint = (k) => 1 - Math.pow(1 - k, 5);
export const frame = () => new Promise((r) => requestAnimationFrame(r));
export const sfx = (name, opts) => window.DLE_FX?.play(name, opts);

export function countUp(node, to, decimals = 1, ms = 650) {
  const from = Number(node.dataset.value || 0);
  node.dataset.value = to;
  if (from === to) { node.textContent = to.toFixed(decimals); return; }
  const start = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - start) / ms);
    node.textContent = (from + (to - from) * easeOutCubic(k)).toFixed(decimals);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Shards flung out from a point; `gold` for legendary draws.
export function burst(x, y, { count = 40, spread = 220, gold = false, color = null } = {}) {
  const layer = el("div", `burst${gold ? " is-gold" : ""}`);
  if (color) layer.style.setProperty("--burst-c", `rgb(${color})`);
  layer.style.left = `${x}px`;
  layer.style.top = `${y}px`;
  for (let i = 0; i < count; i++) {
    const p = el("i");
    const a = Math.random() * Math.PI * 2;
    const d = spread * (0.4 + Math.random() * 0.6);
    p.style.setProperty("--x", `${Math.cos(a) * d}px`);
    p.style.setProperty("--y", `${Math.sin(a) * d - 60}px`);
    p.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
    p.style.animationDelay = `${Math.random() * 100}ms`;
    if (i % 3 === 0) p.className = "alt";
    layer.append(p);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 1600);
}

// A ring that expands from an element (slot landing, reel landing).
export function shockwave(target, cls = "") {
  if (!target) return;
  const r = target.getBoundingClientRect();
  const ring = el("span", `shockwave ${cls}`);
  Object.assign(ring.style, { left: `${r.left + r.width / 2}px`, top: `${r.top + r.height / 2}px`, width: `${Math.max(r.width, r.height)}px`, height: `${Math.max(r.width, r.height)}px` });
  document.body.append(ring);
  setTimeout(() => ring.remove(), 900);
}

// A portrait flies from the reel to the chosen slot along an arc, leaving a short trail of ghosts.
export function fly(fromEl, toEl, src) {
  if (!fromEl || !toEl || !fromEl.animate) return Promise.resolve();
  const a = fromEl.getBoundingClientRect();
  const b = toEl.getBoundingClientRect();
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const s = b.width / a.width;
  const sy = b.height / a.height;
  const make = (cls) => {
    const img = el("img", cls);
    img.src = src;
    img.alt = "";
    Object.assign(img.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` });
    document.body.append(img);
    return img;
  };
  const path = [
    { transform: "translate(0, 0) scale(1) rotate(0deg)", borderRadius: "18px" },
    { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(${(1 + s) / 2 + 0.12}, ${(1 + sy) / 2 + 0.12}) rotate(-8deg)`, offset: 0.5 },
    { transform: `translate(${dx}px, ${dy}px) scale(${s}, ${sy}) rotate(0deg)`, borderRadius: "50%" },
  ];
  const ghosts = [1, 2, 3].map((i) => {
    const g = make("flyer is-ghost");
    g.style.opacity = String(0.35 - i * 0.08);
    g.animate(path, { duration: 640, delay: i * 45, easing: "cubic-bezier(.5,0,.2,1)", fill: "both" }).finished.then(() => g.remove(), () => g.remove());
    return g;
  });
  const img = make("flyer");
  sfx("whoosh");
  const anim = img.animate(path, { duration: 640, easing: "cubic-bezier(.5,0,.2,1)", fill: "both" });
  return anim.finished.then(() => { img.remove(); ghosts.forEach((g) => g.remove()); }, () => img.remove());
}

// The cinematic's small line under the name: the character's group (affiliation, village, crew…), if known.
export function subtitleOf(c) {
  for (const k of ["affiliation", "aff", "village", "team", "squad", "org", "grade", "rank"]) {
    const v = Array.isArray(c[k]) ? c[k][0] : c[k];
    if (typeof v === "string" && v && !/^(none|unknown)$/i.test(v)) return v;
  }
  return "";
}

// Frames a transformation portrait in a cropped box (circle, card): on the form's `focus` when it has one, else on the
// head for tall full-body pictures (the middle would show the belt).
export function frameImg(img, focus) {
  const set = () => {
    const tall = img.naturalHeight > img.naturalWidth * 1.15;
    img.style.objectPosition = focus || (tall ? "50% 4%" : "");
  };
  if (img.complete && img.naturalWidth) set();
  else img.addEventListener("load", set, { once: true });
}

// Transformation of a character at this arc (crew/forms.js), with its portrait.
export function formFor(game, c, arc) {
  const f = window.CREW_FORMS?.[game]?.[c.id];
  if (!f || arc < f.arc) return null;
  // A later look replaces the first once the player has reached it (files <game>-<id>-2.webp / .mp4).
  const late = f.next && arc >= f.next.arc;
  const key = late ? `${game}-${c.id}-2` : `${game}-${c.id}`;
  const base = late ? { ...f, ...f.next } : f;
  const clip = late ? f.next.clip : f.clip;
  const scene = late ? f.next.scene : f.scene;
  return { ...base, image: `assets/forms/${key}.webp`, clip: clip ? `assets/clips/${key}.mp4` : null, scene: scene ? `assets/scenes/${key}.webp` : null };
}

// Ripple filters for transformations: an animated turbulence displaces the picture like heat or energy.
export function ensureFilters() {
  if (document.getElementById("tf-filters")) return;
  const wave = (id, scale, dur, f1, f2) => `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="${f1}" numOctaves="2" seed="4"><animate attributeName="baseFrequency" dur="${dur}" values="${f1};${f2};${f1}" repeatCount="indefinite"/><animate attributeName="seed" dur="0.5s" values="4;9;2;7;4" calcMode="discrete" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  document.body.insertAdjacentHTML("beforeend", `<svg id="tf-filters" width="0" height="0" style="position:absolute" aria-hidden="true">${wave("tf-wave", 12, "1.4s", "0.010 0.040", "0.016 0.065")}${wave("tf-wave-strong", 22, "0.6s", "0.012 0.05", "0.03 0.09")}${wave("tf-wave-soft", 4, "1.6s", "0.03 0.08", "0.05 0.12")}</svg>`);
}

// Rarity tier from the character's power.
export const tierOf = (power) => (power >= 9 ? "legend" : power >= 7 ? "epic" : "common");
