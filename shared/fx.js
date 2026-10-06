// Sound and visual effects shared by every page.
// Sounds are synthesised with Web Audio (no files to load). A speaker button in the top bar mutes
// them; the choice is kept in the browser. Pages call window.DLE_FX.play(name).
(() => {
  "use strict";

  const KEY = "dle:sfx";
  let muted = false;
  try { muted = localStorage.getItem(KEY) === "off"; } catch {}

  let ctx = null;
  let master = null;
  let noiseBuf = null;
  // Browsers only start audio after a gesture: the context is created on the first press.
  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp);
      comp.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // ── Building blocks ──
  function tone({ freq = 440, to = null, type = "sine", start = 0, dur = 0.2, vol = 0.3, attack = 0.005 }) {
    const t0 = ctx.currentTime + start;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }
  function noise({ start = 0, dur = 0.2, vol = 0.3, type = "bandpass", freq = 1200, to = null, q = 1 }) {
    const t0 = ctx.currentTime + start;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, t0);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.03, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.05);
  }
  const notes = (list, { type = "triangle", step = 0.08, dur = 0.35, vol = 0.22, start = 0 } = {}) =>
    list.forEach((f, i) => tone({ freq: f, type, start: start + i * step, dur, vol }));

  // ── The sounds ──
  const SOUNDS = {
    tap: () => tone({ freq: 900, to: 600, type: "triangle", dur: 0.06, vol: 0.12 }),
    tick: ({ pitch = 1 } = {}) => { noise({ dur: 0.035, vol: 0.25, freq: 3200 * pitch, q: 4 }); tone({ freq: 1400 * pitch, type: "square", dur: 0.025, vol: 0.05 }); },
    charge: () => { tone({ freq: 180, to: 520, type: "sawtooth", dur: 0.28, vol: 0.08 }); noise({ dur: 0.28, vol: 0.12, freq: 400, to: 2400, q: 2 }); },
    whoosh: () => noise({ dur: 0.45, vol: 0.28, freq: 300, to: 3000, q: 0.8 }),
    land: () => { tone({ freq: 160, to: 45, type: "sine", dur: 0.45, vol: 0.6 }); noise({ dur: 0.25, vol: 0.35, type: "lowpass", freq: 2200, to: 300 }); tone({ freq: 660, type: "triangle", start: 0.02, dur: 0.3, vol: 0.12 }); },
    epic: () => notes([523, 784, 1047], { step: 0.07, dur: 0.5, vol: 0.18 }),
    legend: () => { notes([523, 659, 784, 1047, 1319, 1568], { step: 0.06, dur: 0.9, vol: 0.16 }); notes([2093, 2637, 3136], { type: "sine", start: 0.4, step: 0.05, dur: 0.6, vol: 0.06 }); noise({ start: 0.05, dur: 1.2, vol: 0.06, type: "highpass", freq: 6000 }); },
    place: () => { tone({ freq: 320, to: 880, type: "sine", dur: 0.14, vol: 0.3 }); tone({ freq: 1320, type: "triangle", start: 0.08, dur: 0.18, vol: 0.1 }); },
    stamp: () => { tone({ freq: 120, to: 50, dur: 0.3, vol: 0.5 }); noise({ dur: 0.12, vol: 0.3, type: "lowpass", freq: 1500 }); },
    correct: () => notes([880, 1320], { step: 0.05, dur: 0.25, vol: 0.16 }),
    partial: () => tone({ freq: 660, type: "triangle", dur: 0.2, vol: 0.16 }),
    wrong: () => { tone({ freq: 200, to: 120, type: "triangle", dur: 0.18, vol: 0.22 }); noise({ dur: 0.06, vol: 0.12, type: "lowpass", freq: 900 }); },
    win: () => { notes([523, 659, 784], { step: 0.1, dur: 0.4, vol: 0.2 }); notes([1047, 1319, 1568, 2093], { start: 0.32, step: 0.08, dur: 0.8, vol: 0.18 }); noise({ start: 0.3, dur: 1, vol: 0.05, type: "highpass", freq: 7000 }); },
    lose: () => notes([392, 330, 262, 196], { type: "sine", step: 0.14, dur: 0.4, vol: 0.18 }),
    // Transformation: a rumble and a rising scream of energy, then a blast with a bright chord.
    powerup: () => {
      tone({ freq: 55, to: 90, type: "sawtooth", dur: 1.5, vol: 0.18, attack: 0.4 });
      tone({ freq: 110, to: 880, type: "sawtooth", dur: 1.5, vol: 0.06, attack: 0.6 });
      noise({ dur: 1.5, vol: 0.22, freq: 200, to: 4000, q: 1.5 });
      for (let i = 0; i < 6; i++) noise({ start: 0.3 + i * 0.2, dur: 0.06, vol: 0.18, type: "highpass", freq: 3000 });
    },
    transform: () => {
      tone({ freq: 140, to: 35, dur: 0.9, vol: 0.7 });
      noise({ dur: 0.9, vol: 0.45, type: "lowpass", freq: 3000, to: 200 });
      notes([392, 523, 659, 784, 1047], { type: "sawtooth", step: 0.015, dur: 1.2, vol: 0.06, start: 0.05 });
      notes([1568, 2093], { type: "sine", step: 0.08, dur: 0.9, vol: 0.06, start: 0.15 });
    },
    message: () => { tone({ freq: 1180, type: "sine", dur: 0.12, vol: 0.12 }); tone({ freq: 1580, type: "sine", start: 0.07, dur: 0.16, vol: 0.1 }); },
  };

  function play(name, opts) {
    if (muted || !SOUNDS[name]) return;
    if (!audio()) return;
    try { SOUNDS[name](opts); } catch {}
  }

  // ── Visual effects ──
  // Full-screen colour flash (wins, legendary draws).
  function flash(color = "rgba(255, 255, 255, 0.35)") {
    const f = document.createElement("div");
    f.className = "fx-flash";
    f.style.background = `radial-gradient(circle at 50% 45%, ${color}, transparent 70%)`;
    document.body.append(f);
    setTimeout(() => f.remove(), 700);
  }

  // Ripple from the pointer on buttons, with a soft tap sound.
  const RIPPLE = ".btn-primary, .btn-ghost, .roll-btn, .anime-pick, .mode-tabs button, .lang-switch button, .crew-slot.is-target, .game-card, .cat, .fx-sound";
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest?.(RIPPLE);
    if (!b || b.disabled) return;
    const r = b.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const dot = document.createElement("span");
    dot.className = "fx-ripple";
    Object.assign(dot.style, { width: `${size}px`, height: `${size}px`, left: `${e.clientX - r.left - size / 2}px`, top: `${e.clientY - r.top - size / 2}px` });
    if (getComputedStyle(b).position === "static") b.style.position = "relative";
    b.classList.add("fx-host");
    b.append(dot);
    setTimeout(() => dot.remove(), 650);
    if (!b.matches(".roll-btn, .crew-slot")) play("tap");
  }, { passive: true });

  // 3D tilt with a moving glare on the home page cards.
  function tilt(selector) {
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest?.(selector);
      document.querySelectorAll(`${selector}.is-tilting`).forEach((c) => { if (c !== card) { c.classList.remove("is-tilting"); c.style.transform = ""; } });
      if (!card || e.pointerType !== "mouse") return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.classList.add("is-tilting");
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-4px)`;
      card.style.setProperty("--gx", `${x * 100}%`);
      card.style.setProperty("--gy", `${y * 100}%`);
    }, { passive: true });
    document.addEventListener("pointerleave", () => document.querySelectorAll(`${selector}.is-tilting`).forEach((c) => { c.classList.remove("is-tilting"); c.style.transform = ""; }));
  }
  tilt(".game-card, .crew-card");

  // ── Mute button in the top bar ──
  const ICON_ON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zM17 9l5 6M22 9l-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function label() {
    const fr = (document.documentElement.lang || "").startsWith("fr");
    return muted ? (fr ? "Activer le son" : "Turn sound on") : (fr ? "Couper le son" : "Mute sound");
  }
  function mountButton() {
    const bar = document.querySelector(".topbar-actions");
    if (!bar || bar.querySelector(".fx-sound")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "icon-btn fx-sound";
    const sync = () => {
      b.innerHTML = muted ? ICON_OFF : ICON_ON;
      b.classList.toggle("is-muted", muted);
      b.title = label();
      b.setAttribute("aria-label", label());
      b.setAttribute("aria-pressed", String(!muted));
    };
    b.addEventListener("click", () => {
      muted = !muted;
      try { localStorage.setItem(KEY, muted ? "off" : "on"); } catch {}
      sync();
      play("tap");
    });
    window.addEventListener("dle:lang", sync);
    sync();
    bar.prepend(b);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountButton);
  else mountButton();

  // ── New version check ──
  // A tab opened before a deploy keeps running the old code. Only an update with new content counts: the
  // newest patch note (shared/changelog.js) is read now and then, and when a newer one appears, a banner
  // offers to reload. Small fixes deployed without a patch note don't bother anyone.
  // (read when checking: changelog.js loads after this script)
  const notesUrl = () => [...document.scripts].map((x) => x.src).find((u) => /shared\/changelog\.js/.test(u || ""));
  async function fingerprint() {
    const url = notesUrl();
    if (!url) return "";
    const text = await fetch(url, { cache: "no-store" }).then((r) => (r.ok ? r.text() : ""), () => "");
    return /at:\s*"([^"]+)"/.exec(text)?.[1] ?? "";
  }
  let first = null;
  let warned = false;
  async function checkVersion() {
    if (warned || location.protocol === "file:" || document.hidden) return;
    const now = await fingerprint();
    if (!now) return;
    if (first == null) { first = now; return; }
    if (now <= first) return;
    warned = true;
    const fr = (document.documentElement.lang || "").startsWith("fr");
    const bar = document.createElement("div");
    bar.className = "fx-update";
    bar.setAttribute("role", "status");
    const text = document.createElement("span");
    text.textContent = fr ? "Une nouvelle version du site est disponible." : "A new version of the site is available.";
    const go = document.createElement("button");
    go.type = "button";
    go.className = "btn-primary";
    go.textContent = fr ? "Recharger" : "Reload";
    go.addEventListener("click", () => location.reload());
    const later = document.createElement("button");
    later.type = "button";
    later.className = "fx-update-close";
    later.textContent = "✕";
    later.setAttribute("aria-label", fr ? "Plus tard" : "Later");
    later.addEventListener("click", () => bar.remove());
    bar.append(text, go, later);
    document.body.append(bar);
  }
  setTimeout(checkVersion, 4000);
  setInterval(checkVersion, 120000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) checkVersion(); });

  window.DLE_FX = { play, flash, get muted() { return muted; } };
})();
