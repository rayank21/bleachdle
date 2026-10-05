// Transformation cinematic: a full-screen sequence played when a drawn card transforms.
//   charge  — the screen goes dark behind cinema bars, the character (or the anime clip, when there is one)
//             fills the stage while lightning, sparks and speed lines build up and the camera shakes;
//   cut     — a slash of light wipes across, white flash, shockwave rings;
//   reveal  — the transformed portrait slams in with its aura, the kanji and the form's name;
//   out     — everything fades back to the reel, where the card is already transformed.
// The effect follows the form's style (aura, pillar, domain), its two colours and its lightning flag.
// A tap skips it. With reduced motion asked for, the camera does not shake.
(() => {
  "use strict";

  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const rgb = (c, a = 1) => `rgba(${c}, ${a})`;
  const rand = (a, b) => a + Math.random() * (b - a);
  const ease = (t) => 1 - (1 - t) ** 3;
  const load = (src) => new Promise((res) => { const i = new Image(); i.onload = i.onerror = () => res(i); i.src = src; });

  // A jagged bolt from (x0, y0) to (x1, y1), by midpoint displacement, with a branch now and then.
  function bolt(x0, y0, x1, y1, spread, depth = 5) {
    let pts = [[x0, y0], [x1, y1]];
    for (let d = 0; d < depth; d++) {
      const next = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1];
        const [bx, by] = pts[i];
        const len = Math.hypot(bx - ax, by - ay);
        const off = (Math.random() - 0.5) * spread * (len / 300);
        next.push([(ax + bx) / 2 + (-(by - ay) / len) * off, (ay + by) / 2 + ((bx - ax) / len) * off], pts[i]);
      }
      pts = next;
    }
    return pts;
  }

  function play({ form, char, base }) {
    if (!form) return null;
    const still = reduced();
    return new Promise((resolve) => {
      const W = () => innerWidth;
      const H = () => innerHeight;
      const c1 = form.c1;
      const c2 = form.c2;
      const root = el("div", `cine is-fx-${form.fx}`);
      root.style.setProperty("--c1", c1);
      root.style.setProperty("--c2", c2);
      const canvas = el("canvas", "cine-canvas");
      const ctx = canvas.getContext("2d");
      const dpr = Math.min(1.5, devicePixelRatio || 1);
      const size = () => { canvas.width = W() * dpr; canvas.height = H() * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
      size();
      const cam = el("div", "cine-cam");
      const stage = el("div", "cine-stage");
      const baseImg = el("img", "cine-base");
      baseImg.src = base;
      baseImg.alt = "";
      let video = null;
      if (form.clip) {
        video = el("video", "cine-clip");
        Object.assign(video, { muted: true, playsInline: true, preload: "auto", src: form.clip });
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        stage.classList.add("has-clip");
        stage.append(video);
      } else stage.append(baseImg);
      const formImg = el("img", "cine-form");
      formImg.src = form.image;
      formImg.alt = "";
      const reveal = el("div", "cine-reveal");
      const aura = el("div", "cine-aura");
      const kanji = el("div", "cine-kanji", form.kanji);
      const title = el("div", "cine-title");
      const lang = window.DLE_LANG?.get() === "fr" ? "fr" : "en";
      title.append(el("span", "cine-who", char?.name ?? ""), el("b", "cine-form-name", form.name[lang]));
      reveal.append(aura, formImg, kanji, title);
      const slash = el("div", "cine-slash");
      const flash = el("div", "cine-flash");
      const bars = [el("div", "cine-bar is-top"), el("div", "cine-bar is-bottom")];
      const skip = el("span", "cine-skip", lang === "fr" ? "Toucher pour passer" : "Tap to skip");
      cam.append(stage, reveal);
      root.append(canvas, cam, slash, flash, ...bars, skip);
      document.body.append(root);

      // Timeline (ms). With a clip, the charge lasts as long as the clip (up to 7 s).
      let CHARGE = 1500;
      const REVEAL = 1900;
      const OUT = 450;
      const IN = 260;
      let t0 = performance.now();
      let started = !video;
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        root.classList.add("is-out");
        setTimeout(() => { root.remove(); resolve(); }, 260);
        removeEventListener("resize", size);
      };
      root.addEventListener("click", finish);
      addEventListener("resize", size);

      if (video) {
        // The clip sets the length of the charge; if it can't play, the portrait takes its place.
        const fallback = () => { if (started) return; started = true; video.remove(); stage.classList.remove("has-clip"); stage.append(baseImg); t0 = performance.now(); };
        const go = () => {
          if (started) return;
          started = true;
          CHARGE = Math.min(7000, Math.max(1400, (video.duration || 3) * 1000));
          t0 = performance.now();
          video.play().catch(fallback);
        };
        video.addEventListener("loadeddata", go, { once: true });
        video.addEventListener("error", fallback, { once: true });
        setTimeout(fallback, 2500);
      }
      // The transformed portrait is ready before the cut.
      load(form.image);

      const bolts = [];
      const parts = [];
      const rings = [];
      let lastBolt = 0;
      let cutDone = false;

      const addBolt = (strong) => {
        const w = W();
        const h = H();
        const side = Math.floor(Math.random() * 4);
        const edge = [[rand(0, w), -20], [w + 20, rand(0, h)], [rand(0, w), h + 20], [-20, rand(0, h)]][side];
        const tx = w / 2 + rand(-w * 0.18, w * 0.18);
        const ty = h / 2 + rand(-h * 0.2, h * 0.2);
        const pts = bolt(edge[0], edge[1], tx, ty, strong ? 260 : 170);
        const branches = [];
        for (let k = 0; k < 2; k++) {
          const p = pts[Math.floor(rand(pts.length * 0.2, pts.length * 0.7))];
          branches.push(bolt(p[0], p[1], p[0] + rand(-180, 180), p[1] + rand(-180, 180), 90, 4));
        }
        bolts.push({ pts, branches, life: strong ? 200 : 140, age: 0, w: strong ? 4 : 2.5 });
      };
      const addPart = (x, y, vx, vy, life, r, col) => parts.push({ x, y, vx, vy, life, age: 0, r, col });

      let last = performance.now();
      let raf = 0;
      const frame = (now) => {
        const dt = Math.min(50, now - last);
        last = now;
        const t = started ? now - t0 : 0;
        const w = W();
        const h = H();
        const cx = w / 2;
        const cy = h / 2;
        const inCharge = t < IN + CHARGE;
        const k = Math.min(1, t / (IN + CHARGE)); // build-up 0 → 1
        const tr = t - IN - CHARGE; // time since the cut

        // ── DOM layers ──
        root.style.setProperty("--in", Math.min(1, t / IN));
        if (inCharge) {
          const shake = still ? 0 : (video ? 2 : 3) + k * k * (video ? 6 : 14);
          cam.style.transform = `translate(${rand(-shake, shake).toFixed(1)}px, ${rand(-shake, shake).toFixed(1)}px)`;
          stage.style.transform = `scale(${(1 + k * (video ? 0.06 : 0.14)).toFixed(3)})`;
          stage.style.filter = video ? "" : `brightness(${(0.75 + Math.random() * 0.35 * k).toFixed(2)}) saturate(${(1 + k * 0.6).toFixed(2)})`;
        } else if (!cutDone) {
          cutDone = true;
          root.classList.add("is-cut");
          for (let r = 0; r < 3; r++) rings.push({ age: -r * 90, life: 900 });
          for (let i = 0; i < 90; i++) {
            const a = rand(0, Math.PI * 2);
            const s = rand(0.35, 1.3);
            addPart(cx, cy, Math.cos(a) * s, Math.sin(a) * s, rand(500, 1100), rand(1.5, 4), Math.random() < 0.5 ? c1 : "255, 255, 255");
          }
          for (let i = 0; i < 4; i++) addBolt(true);
          if (video) video.pause();
        } else {
          const s = still ? 0 : Math.max(0, 1 - tr / 260);
          cam.style.transform = `translate(${rand(-s * 18, s * 18).toFixed(1)}px, ${rand(-s * 18, s * 18).toFixed(1)}px)`;
        }

        // ── Canvas ──
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";

        // Speed lines: converging during the charge, bursting outward after the cut.
        const lines = inCharge ? Math.floor(10 + k * 40) : Math.max(0, Math.floor(60 * (1 - tr / 900)));
        for (let i = 0; i < lines; i++) {
          const a = rand(0, Math.PI * 2);
          const r0 = Math.max(w, h) * (inCharge ? rand(0.35, 0.6) : rand(0.12, 0.3));
          const len = rand(80, 260) * (inCharge ? 0.6 + k : 1.6);
          ctx.strokeStyle = rgb(i % 3 ? "255, 255, 255" : c1, inCharge ? 0.05 + k * 0.12 : 0.22);
          ctx.lineWidth = rand(0.6, 2.2);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
          ctx.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len));
          ctx.stroke();
        }

        // Domain: a sphere swells from the centre and swallows the screen at the cut.
        if (form.fx === "domain") {
          const R = inCharge ? Math.max(w, h) * 0.08 * (1 + k * 3) : Math.max(w, h) * (0.32 + Math.min(1, tr / 300) * 0.9);
          const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
          g.addColorStop(0, rgb(c1, 0.0));
          g.addColorStop(0.75, rgb(c1, inCharge ? 0.18 : 0.12));
          g.addColorStop(1, rgb(c1, 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = rgb(c1, 0.5);
          ctx.lineWidth = 2;
          for (let r = 1; r <= 3; r++) {
            ctx.beginPath();
            ctx.arc(cx, cy, R * (0.45 + r * 0.17), now / (600 * r), now / (600 * r) + Math.PI * 1.3);
            ctx.stroke();
          }
        }

        // Pillar: a column of light rising behind the character.
        if (form.fx === "pillar") {
          const bw = inCharge ? w * (0.04 + k * 0.16) : w * 0.28 * Math.max(0, 1 - tr / 1200) + w * 0.06;
          const g = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
          g.addColorStop(0, rgb(c1, 0));
          g.addColorStop(0.5, rgb(c1, inCharge ? 0.18 + k * 0.25 : 0.35));
          g.addColorStop(1, rgb(c1, 0));
          ctx.fillStyle = g;
          ctx.fillRect(cx - bw, 0, bw * 2, h);
        }

        // Lightning.
        const boltEvery = form.lightning || form.fx !== "domain" ? (inCharge ? 260 - k * 190 : 170) : inCharge ? 520 - k * 300 : 400;
        if (now - lastBolt > boltEvery && (inCharge || tr < REVEAL - 300)) { addBolt(!inCharge || k > 0.7); lastBolt = now; }
        for (let i = bolts.length - 1; i >= 0; i--) {
          const b = bolts[i];
          b.age += dt;
          if (b.age > b.life) { bolts.splice(i, 1); continue; }
          const flick = Math.random() < 0.25 ? 0.35 : 1;
          const a = (1 - b.age / b.life) * flick;
          const draw = (pts, width) => {
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (const p of pts) ctx.lineTo(p[0], p[1]);
            ctx.lineWidth = width * 6;
            ctx.strokeStyle = rgb(c1, 0.16 * a);
            ctx.stroke();
            ctx.lineWidth = width * 2.2;
            ctx.strokeStyle = rgb(c1, 0.55 * a);
            ctx.stroke();
            ctx.lineWidth = width * 0.7;
            ctx.strokeStyle = rgb("255, 255, 255", 0.95 * a);
            ctx.stroke();
          };
          draw(b.pts, b.w);
          for (const br of b.branches) draw(br, b.w * 0.5);
        }

        // Sparks and embers: rising for an aura, flying debris for a pillar, motes drawn inward for a domain.
        if (inCharge && Math.random() < 0.5 + k) {
          for (let i = 0; i < 1 + k * 4; i++) {
            if (form.fx === "domain") {
              const a = rand(0, Math.PI * 2);
              const r = Math.max(w, h) * 0.6;
              addPart(cx + Math.cos(a) * r, cy + Math.sin(a) * r, -Math.cos(a) * 0.5, -Math.sin(a) * 0.5, 1200, rand(1, 3), c1);
            } else if (form.fx === "pillar") addPart(rand(cx - w * 0.3, cx + w * 0.3), h + 10, rand(-0.15, 0.15), -rand(0.4, 1.1), 1400, rand(1.5, 4.5), Math.random() < 0.6 ? c1 : c2);
            else addPart(rand(0, w), h + 10, rand(-0.08, 0.08), -rand(0.25, 0.8), 1800, rand(1, 3.5), Math.random() < 0.7 ? c1 : "255, 255, 255");
          }
        }
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.age += dt;
          if (p.age > p.life) { parts.splice(i, 1); continue; }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          const a = 1 - p.age / p.life;
          ctx.fillStyle = rgb(p.col, 0.9 * a);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shockwave rings after the cut.
        for (let i = rings.length - 1; i >= 0; i--) {
          const r = rings[i];
          r.age += dt;
          if (r.age < 0) continue;
          if (r.age > r.life) { rings.splice(i, 1); continue; }
          const p = ease(r.age / r.life);
          ctx.strokeStyle = rgb(i % 2 ? "255, 255, 255" : c1, 0.7 * (1 - p));
          ctx.lineWidth = 2 + 16 * (1 - p);
          ctx.beginPath();
          ctx.arc(cx, cy, p * Math.hypot(w, h) * 0.6, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";

        if (!inCharge && tr > REVEAL) { finish(); return; }
        if (!inCharge && tr > REVEAL - OUT) root.classList.add("is-leaving");
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    });
  }

  window.CREW_CINEMA = { play };
})();
