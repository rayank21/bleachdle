// The slot-machine reel that draws a character.

import { S } from "./state.js";
import { el, t } from "./base.js";
import { burst, countUp, easeOutQuint, ensureFilters, formFor, frame, sfx, shockwave, subtitleOf, tierOf } from "./fx.js";

// Slot-machine reel: a strip of portraits that winds up, races, ticks past each face and slams
// onto the picked character with a flash, a shockwave and light rays.
export function makeReel() {
  const wrap = el("div", "reel");
  const stage = el("div", "reel-stage");
  const rays = el("div", "reel-rays");
  const glow = el("div", "reel-glow");
  const win = el("div", "reel-window");
  const strip = el("div", "reel-strip");
  const q = el("span", "reel-q", "?");
  const shine = el("span", "reel-shine");
  const flash = el("span", "reel-flash");
  const lines = el("span", "reel-lines");
  win.append(strip, lines, q, shine, flash);
  const fxLayer = el("div", "tf-layer");
  const kanji = el("span", "tf-kanji");
  stage.append(rays, glow, fxLayer, win, kanji);
  const zap = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  zap.setAttribute("viewBox", "0 0 100 100");
  zap.setAttribute("preserveAspectRatio", "none");
  zap.setAttribute("class", "tf-zap");
  win.append(zap);
  let zapTimer = null;
  // A few jagged bolts at random places, redrawn several times a second.
  const drawZap = () => {
    zap.textContent = "";
    const n = 1 + Math.floor(Math.random() * 3);
    for (let b = 0; b < n; b++) {
      let x = Math.random() * 100, y = Math.random() * 55;
      const ang = Math.random() * Math.PI * 2;
      let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
      for (let k = 0; k < 6; k++) {
        x += Math.cos(ang) * 6 + (Math.random() * 10 - 5);
        y += Math.sin(ang) * 6 + (Math.random() * 10 - 5);
        d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      zap.append(path);
    }
  };
  const startZap = () => { stopZap(); drawZap(); zapTimer = setInterval(() => (Math.random() < 0.75 ? drawZap() : (zap.textContent = "")), 110); };
  const stopZap = () => { clearInterval(zapTimer); zapTimer = null; zap.textContent = ""; };
  const formTag = el("span", "tf-name");
  formTag.hidden = true;
  const tier = el("span", "reel-tier");
  tier.hidden = true;
  const name = el("p", "reel-name");
  const power = el("div", "power");
  const powerLabel = el("span", "power-label");
  const track = el("span", "power-track");
  const fill = el("span", "power-fill");
  const value = el("b");
  value.dataset.value = 0;
  track.append(fill);
  power.append(powerLabel, track, value);
  power.hidden = true;
  const hint = el("p", "reel-hint");
  wrap.append(el("p", "reel-kicker", t("draw")), stage, tier, formTag, name, power, hint);

  // Each portrait is shown whole over a blurred, zoomed copy of itself, so no one is cut off.
  const card = (c) => {
    const item = el("div", `reel-item${c.isForm ? " is-form" : ""}`);
    const bg = el("img", "reel-bg");
    const fg = el("img", "reel-fg");
    // Wide pictures fill the card; only tall portraits are shown whole over the blur.
    fg.addEventListener("load", () => item.classList.toggle("is-wide", fg.naturalWidth / fg.naturalHeight > 0.8), { once: true });
    bg.src = fg.src = c.image;
    bg.alt = fg.alt = "";
    item.append(bg, fg);
    // Transformed: a rippling copy over the top of the picture makes hair and aura move.
    if (c.isForm) {
      const hair = el("img", "reel-hair");
      hair.src = c.image;
      hair.alt = "";
      item.append(hair);
    }
    return item;
  };
  const setName = (text, animate) => {
    name.textContent = "";
    if (!animate) { name.textContent = text; return; }
    [...text].forEach((ch, i) => {
      const s = el("span", "reel-letter", ch === " " ? " " : ch);
      s.style.animationDelay = `${120 + i * 32}ms`;
      name.append(s);
    });
  };
  const clearTier = () => wrap.classList.remove("tier-legend", "tier-epic", "tier-common");
  const clearForm = () => {
    stopZap();
    wrap.classList.remove("is-powering", "is-transformed", "tf-aura", "tf-pillar", "tf-domain");
    fxLayer.textContent = "";
    kanji.classList.remove("go");
    formTag.hidden = true;
  };
  // The effect's pieces: flame tongues and sparks for an aura, a beam for a pillar, a sphere for a domain.
  const buildFx = (f) => {
    fxLayer.textContent = "";
    wrap.style.setProperty("--fx1", f.c1);
    wrap.style.setProperty("--fx2", f.c2);
    wrap.classList.add(`tf-${f.fx}`);
    if (f.fx === "aura") {
      for (let i = 0; i < 14; i++) {
        const flame = el("i", "tf-flame");
        flame.style.setProperty("--x", `${(i / 13) * 100}%`);
        flame.style.setProperty("--h", `${55 + Math.random() * 45}%`);
        flame.style.animationDelay = `${Math.random() * -0.6}s`;
        fxLayer.append(flame);
      }
    }
    if (f.fx === "pillar") fxLayer.append(el("i", "tf-beam"), el("i", "tf-beam is-core"));
    if (f.fx === "domain") fxLayer.append(el("i", "tf-sphere"), el("i", "tf-ring"));
    for (let i = 0; i < 18; i++) {
      const spark = el("i", "tf-spark");
      spark.style.setProperty("--x", `${Math.random() * 100}%`);
      spark.style.animationDelay = `${Math.random() * -1.2}s`;
      spark.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
      fxLayer.append(spark);
    }
    if (f.lightning || f.fx === "aura") {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("preserveAspectRatio", "none");
      svg.setAttribute("class", "tf-bolts");
      for (let b = 0; b < 3; b++) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let x = 15 + Math.random() * 70, d = `M${x} 0`;
        for (let y = 12; y <= 100; y += 12) { x += Math.random() * 18 - 9; d += ` L${x.toFixed(1)} ${y}`; }
        path.setAttribute("d", d);
        path.style.animationDelay = `${b * 0.23}s`;
        svg.append(path);
      }
      fxLayer.append(svg);
    }
  };
  const showForm = (c) => {
    ensureFilters();
    buildFx(c.form);
    if (c.form.lightning) startZap();
    wrap.classList.add("is-transformed");
    formTag.textContent = c.form.name[S.lang];
    formTag.hidden = false;
  };

  const reel = {
    el: wrap,
    window: win,
    idle(text = t("waitingRoll")) {
      strip.textContent = "";
      strip.style.transform = "translateY(0)";
      strip.style.filter = "";
      wrap.classList.remove("is-landed", "is-spinning", "is-charging");
      clearTier();
      clearForm();
      q.hidden = false;
      tier.hidden = true;
      setName(text, false);
      power.hidden = true;
      hint.textContent = "";
    },
    show(c, animate = false) {
      strip.textContent = "";
      clearForm();
      strip.append(card(c.form && !animate ? { image: c.formImage, isForm: true } : c));
      if (c.form && !animate) showForm(c);
      strip.style.transform = "translateY(0)";
      strip.style.filter = "";
      q.hidden = true;
      clearTier();
      const tr = tierOf(c.power);
      wrap.classList.add("is-landed", `tier-${tr}`);
      tier.textContent = t("tiers")[tr];
      tier.hidden = false;
      setName(c.name, animate);
      power.hidden = false;
      powerLabel.textContent = t("power");
      fill.style.transition = "none";
      fill.style.width = "0%";
      if (animate) {
        value.dataset.value = 0;
        value.textContent = "0";
        setTimeout(() => { fill.style.transition = ""; fill.style.width = `${c.power * 10}%`; countUp(value, c.power, 0, 700); }, 260);
      } else {
        fill.getBoundingClientRect();
        fill.style.transition = "";
        fill.style.width = `${c.power * 10}%`;
        value.textContent = c.power;
        value.dataset.value = c.power;
      }
    },
    async spin(list, pick, { game = null, arc = 99 } = {}) {
      // A card that will transform: its cinematic's pictures load while the reel turns.
      if (game) window.CREW_CINEMA?.preload?.(formFor(game, pick, arc));
      wrap.classList.remove("is-landed");
      clearTier();
      tier.hidden = true;
      power.hidden = true;
      hint.textContent = "";
      setName(t("rolling"), false);

      // Wind-up: the card shrinks and charges before letting go.
      wrap.classList.add("is-charging");
      sfx("charge");
      await new Promise((r) => setTimeout(r, 260));
      wrap.classList.remove("is-charging");
      wrap.classList.add("is-spinning");
      q.hidden = true;
      sfx("whoosh");

      const n = 30;
      strip.textContent = "";
      for (let i = 0; i < n; i++) strip.append(card(list[Math.floor(Math.random() * list.length)]));
      strip.append(card(pick));
      const h = strip.firstElementChild.offsetHeight;
      const total = n * h;
      const ms = 2700;
      const start = performance.now();
      let lastIndex = 0;
      let lastPos = 0;
      let lastTick = 0;
      for (;;) {
        const now = await frame();
        const k = Math.min(1, (now - start) / ms);
        const pos = easeOutQuint(k) * total;
        // Motion blur follows the speed.
        const speed = pos - lastPos;
        lastPos = pos;
        strip.style.transform = `translateY(${-pos}px)`;
        strip.style.filter = speed > 4 ? `blur(${Math.min(7, speed / 9).toFixed(1)}px)` : "";
        // Each face that passes the frame makes it tick.
        const idx = Math.floor((pos + h / 2) / h);
        if (idx !== lastIndex) {
          lastIndex = idx;
          win.classList.remove("tick");
          void win.offsetWidth;
          win.classList.add("tick");
          // Ticks are spaced out at full speed so they rattle instead of buzzing.
          if (now - lastTick > 45) { lastTick = now; sfx("tick", { pitch: 0.8 + k * 0.7 }); }
        }
        if (k >= 1) break;
      }
      strip.style.filter = "";
      wrap.classList.remove("is-spinning");
      reel.show(pick, true);

      // Impact: flash, shockwave, shards; legendary draws shake the panel and burst in gold.
      const tr = tierOf(pick.power);
      sfx("land");
      if (tr === "epic") sfx("epic");
      if (tr === "legend") { sfx("legend"); window.DLE_FX?.flash("rgba(255, 200, 60, 0.3)"); }
      flash.classList.remove("go");
      void flash.offsetWidth;
      flash.classList.add("go");
      shockwave(win, `is-${tr}`);
      const r = win.getBoundingClientRect();
      if (tr !== "common") burst(r.left + r.width / 2, r.top + r.height / 2, { count: tr === "legend" ? 60 : 26, spread: tr === "legend" ? 260 : 170, gold: tr === "legend" });
      const panel = wrap.closest(".roll-panel");
      if (panel && tr === "legend") { panel.classList.remove("shake"); void panel.offsetWidth; panel.classList.add("shake"); }
      await new Promise((r2) => setTimeout(r2, 380));
      const form = game && formFor(game, pick, arc);
      if (form) await reel.transform(pick, form);
    },
    // Power-up: the card trembles in a rising aura, then a flash, the kanji slams down and the
    // portrait becomes the transformed form, which keeps glowing.
    async transform(c, form) {
      ensureFilters();
      buildFx(form);
      startZap();
      wrap.classList.add("is-powering");
      hint.textContent = "";
      sfx("powerup");
      // The full-screen cinematic (cinema.js), or the short charge on the card alone.
      await (window.CREW_CINEMA?.play({ form, char: c, sub: subtitleOf(c) }) ?? new Promise((r) => setTimeout(r, 1500)));
      c.form = form;
      c.formImage = form.image;
      strip.textContent = "";
      strip.append(card({ image: form.image, isForm: true }));
      wrap.classList.remove("is-powering");
      showForm(c);
      kanji.textContent = form.kanji;
      kanji.classList.remove("go");
      void kanji.offsetWidth;
      kanji.classList.add("go");
      flash.classList.remove("go");
      void flash.offsetWidth;
      flash.classList.add("go");
      sfx("transform");
      window.DLE_FX?.flash(`rgba(${form.c1}, 0.45)`);
      shockwave(win, "is-form");
      const r = win.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, { count: 70, spread: 280, color: form.c1 });
      const panel = wrap.closest(".roll-panel");
      if (panel) { panel.classList.remove("shake"); void panel.offsetWidth; panel.classList.add("shake"); }
      await new Promise((r2) => setTimeout(r2, 900));
    },
    hint(text) { hint.textContent = text; },
  };
  return reel;
}
