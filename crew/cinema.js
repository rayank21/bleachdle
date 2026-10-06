// Transformation cinematic, played full screen when a drawn card transforms (about 5 s, longer with an anime clip).
//   1. tension — deep blue-black, a line of light and a few particles; the anime clip, when there is one, plays
//                in a diagonal panel;
//   2. reveal  — a diagonal mask uncovers the transformed character with a short, sharp move that eases out;
//   3. impact  — the name lands big, a brief light accent, a few fine lightning branches, a small camera jolt;
//   4. pose    — the composition holds while the camera slowly pushes in, the planes drift apart (parallax);
//   5. exit    — diagonal panels in the same colours sweep across and hand back to the site.
// The character is a cut-out (assets/forms/cut/, see crew/scripts/cutouts.py) or, for close-ups that can't be cut,
// the picture in a feathered diagonal frame. Everything moves with transform / opacity / clip-path; all of it is
// removed at the end. "Skip" (button, Escape or a tap) jumps to the exit. Reduced motion: a simple fade.
(() => {
  "use strict";

  const CYAN = "120, 225, 255";
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const rgba = (c, a) => `rgba(${c}, ${a})`;
  const rand = (a, b) => a + Math.random() * (b - a);
  const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
  const SNAP = "cubic-bezier(0.7, 0, 0.84, 0)";
  const SMOOTH = "cubic-bezier(0.45, 0, 0.25, 1)";
  const cutOf = (form) => {
    const name = form.image.replace(/^.*\//, "").replace(/\.webp$/, "");
    return (window.CREW_CUTOUTS || []).includes(name) ? form.image.replace(/forms\//, "forms/cut/") : null;
  };

  // Pictures and clips fetched ahead (called as soon as a transforming card is drawn).
  const cache = new Map();
  function preload(form) {
    if (!form) return;
    const src = cutOf(form) ?? form.image;
    if (!cache.has(src)) {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      cache.set(src, img.decode ? img.decode().catch(() => {}) : Promise.resolve());
    }
    if (form.clip && !cache.has(form.clip)) {
      const v = document.createElement("video");
      Object.assign(v, { muted: true, playsInline: true, preload: "auto", src: form.clip });
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      cache.set(form.clip, v);
    }
  }
  // The picture is shown only once decoded (a half-loaded picture would pop in during the reveal); a slow
  // network gets 2.5 s before the scene goes on anyway.
  const ready = (src) => Promise.race([cache.get(src) ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]);

  // A fine, irregular, branching bolt between two points.
  function bolt(x0, y0, x1, y1, rough) {
    let pts = [[x0, y0], [x1, y1]];
    for (let d = 0; d < 6; d++) {
      const next = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1];
        const [bx, by] = pts[i];
        const len = Math.hypot(bx - ax, by - ay) || 1;
        const off = (Math.random() - 0.5) * rough * (len / 220);
        next.push([(ax + bx) / 2 + (-(by - ay) / len) * off, (ay + by) / 2 + ((bx - ax) / len) * off], pts[i]);
      }
      pts = next;
    }
    return pts;
  }

  function play({ form, char, sub }) {
    if (!form) return null;
    preload(form);
    const quiet = reduced();
    const lang = window.DLE_LANG?.get() === "fr" ? "fr" : "en";
    const cut = cutOf(form);
    const mobile = innerWidth < innerHeight || innerWidth < 760;

    return new Promise((resolve) => {
      const prevFocus = document.activeElement;
      const root = el("div", `cine${mobile ? " is-mobile" : ""}${quiet ? " is-quiet" : ""}`);
      root.setAttribute("role", "dialog");
      root.setAttribute("aria-modal", "true");
      root.setAttribute("aria-label", `${char?.name ?? ""} · ${form.name[lang]}`);
      root.style.setProperty("--c1", form.c1);
      root.style.setProperty("--cy", CYAN);

      const bg = el("div", "cine-bg");
      const glow = el("div", "cine-glow");
      const glow2 = el("div", "cine-glow is-char");
      const back = el("canvas", "cine-fx");
      const world = el("div", "cine-world");
      const shapes = el("div", "cine-shapes");
      const bands = [el("i", "cine-band is-a"), el("i", "cine-band is-b"), el("i", "cine-band is-c")];
      const kanji = el("div", "cine-kanji", form.kanji);
      shapes.append(...bands, kanji);
      const hero = el("div", `cine-hero${cut ? " is-cut" : " is-framed"}`);
      const img = el("img");
      img.src = cut ?? form.image;
      img.alt = "";
      img.decoding = "async";
      hero.append(img);
      const type = el("div", "cine-type");
      const kicker = el("span", "cine-kicker", "Transformation");
      const name = el("h2", "cine-name", char?.name ?? "");
      const formLine = el("span", "cine-form", form.name[lang]);
      const subLine = sub ? el("span", "cine-sub", sub) : null;
      const streak = el("i", "cine-streak");
      type.append(kicker, name, formLine, ...(subLine ? [subLine] : []), streak);
      const front = el("div", "cine-front");
      front.append(el("i", "cine-line is-a"), el("i", "cine-line is-b"));
      const frontFx = el("canvas", "cine-fx is-front");
      let clipBox = null;
      let video = null;
      if (form.clip && !quiet) {
        clipBox = el("div", "cine-clip");
        const cached = cache.get(form.clip);
        video = cached instanceof HTMLVideoElement ? cached : el("video");
        Object.assign(video, { muted: true, playsInline: true, preload: "auto", controls: false, disablePictureInPicture: true });
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("disableremoteplayback", "");
        if (!video.getAttribute("src")) video.src = form.clip;
        try { video.currentTime = 0; } catch {}
        clipBox.append(video);
      }
      world.append(shapes, ...(clipBox ? [clipBox] : []), hero, type, front);
      const wipeA = el("i", "cine-wipe is-a");
      const wipeB = el("i", "cine-wipe is-b");
      const skip = el("button", "cine-skip", lang === "fr" ? "Passer ›" : "Skip ›");
      skip.type = "button";
      root.append(bg, glow, glow2, back, world, frontFx, wipeA, wipeB, skip);
      document.body.append(root);
      skip.focus({ preventScroll: true });

      // ── Canvas: particles, a line of light, brief bolts ──
      const dpr = Math.min(1.5, devicePixelRatio || 1);
      const ctxB = back.getContext("2d");
      const ctxF = frontFx.getContext("2d");
      const fit = () => {
        for (const [c, x] of [[back, ctxB], [frontFx, ctxF]]) {
          c.width = innerWidth * dpr;
          c.height = innerHeight * dpr;
          x.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
      };
      fit();
      addEventListener("resize", fit);
      const motes = Array.from({ length: mobile ? 26 : 44 }, () => ({ x: rand(0, 1), y: rand(0, 1), r: rand(0.6, 2.2), s: rand(0.006, 0.02), a: rand(0.12, 0.5), front: Math.random() < 0.15 }));
      const bolts = [];
      let lineK = 0;
      let raf = 0;
      let last = performance.now();
      const heroBox = () => {
        const r = img.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height * 0.4, r.width, r.height];
      };
      const strike = (n) => {
        const [cx, cy, w, h] = heroBox();
        for (let i = 0; i < n; i++) {
          const side = i % 2 ? 1 : -1;
          const x0 = cx + side * w * rand(0.55, 0.85);
          const y0 = cy - h * rand(0.25, 0.5);
          const pts = bolt(x0, y0, cx + side * w * rand(0.3, 0.45), cy + h * rand(-0.05, 0.3), 80);
          const branches = [0, 1].map(() => {
            const p = pts[Math.floor(rand(pts.length * 0.25, pts.length * 0.75))];
            return bolt(p[0], p[1], p[0] + side * rand(20, 90), p[1] + rand(20, 110), 45);
          });
          bolts.push({ pts, branches, age: -i * 45, life: rand(110, 160) });
        }
      };
      const frame = (now) => {
        const dt = Math.min(48, now - last);
        last = now;
        const w = innerWidth;
        const h = innerHeight;
        ctxB.clearRect(0, 0, w, h);
        ctxF.clearRect(0, 0, w, h);
        // A line of light during the tension, widening, then fading.
        if (lineK > 0) {
          const g = ctxB.createLinearGradient(0, 0, w, 0);
          g.addColorStop(0, rgba(CYAN, 0));
          g.addColorStop(0.5, rgba(CYAN, 0.5 * lineK));
          g.addColorStop(1, rgba(CYAN, 0));
          ctxB.fillStyle = g;
          ctxB.save();
          ctxB.translate(w / 2, h * 0.56);
          ctxB.rotate(-0.32);
          ctxB.fillRect(-w, -0.8 - lineK, w * 2, 1.6 + lineK * 2);
          ctxB.restore();
        }
        for (const m of motes) {
          m.y -= m.s * dt * 0.06;
          if (m.y < -0.05) { m.y = 1.05; m.x = rand(0, 1); }
          const c = m.front ? ctxF : ctxB;
          c.fillStyle = rgba(m.front ? "255, 255, 255" : CYAN, m.a);
          c.beginPath();
          c.arc(m.x * w, m.y * h, m.front ? m.r * 1.5 : m.r, 0, Math.PI * 2);
          c.fill();
        }
        ctxF.globalCompositeOperation = "lighter";
        for (let i = bolts.length - 1; i >= 0; i--) {
          const b = bolts[i];
          b.age += dt;
          if (b.age < 0) continue;
          if (b.age > b.life) { bolts.splice(i, 1); continue; }
          const a = (1 - b.age / b.life) * (Math.random() < 0.3 ? 0.45 : 1);
          const draw = (pts, wid) => {
            ctxF.beginPath();
            ctxF.moveTo(pts[0][0], pts[0][1]);
            for (const p of pts) ctxF.lineTo(p[0], p[1]);
            ctxF.lineWidth = wid * 3.5;
            ctxF.strokeStyle = rgba(CYAN, 0.16 * a);
            ctxF.stroke();
            ctxF.lineWidth = wid;
            ctxF.strokeStyle = rgba("255, 255, 255", 0.9 * a);
            ctxF.stroke();
          };
          draw(b.pts, 1.2);
          for (const br of b.branches) draw(br, 0.7);
        }
        ctxF.globalCompositeOperation = "source-over";
        raf = requestAnimationFrame(frame);
      };
      if (!quiet) raf = requestAnimationFrame(frame);

      // ── Timeline ──
      const anims = [];
      const timers = [];
      const at = (ms, fn) => timers.push(setTimeout(fn, ms));
      const anim = (node, frames, opts) => { const a = node.animate(frames, { fill: "both", ...opts }); anims.push(a); return a; };
      let exiting = false;
      let done = false;
      let resolved = false;
      const finish = () => { if (!resolved) { resolved = true; resolve(); } };

      const cleanup = () => {
        if (done) return;
        done = true;
        finish();
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        anims.forEach((a) => a.cancel());
        removeEventListener("resize", fit);
        removeEventListener("keydown", onKey, true);
        if (video) { video.pause(); cache.delete(form.clip); }
        root.remove();
        if (prevFocus?.focus) prevFocus.focus({ preventScroll: true });
      };

      // The exit: two diagonal panels cover the scene, the scene goes, the panels slide off to the site.
      const exit = (fast) => {
        if (exiting || done) return;
        exiting = true;
        const d = fast ? 0.6 : 1;
        const across = (from, to) => [{ transform: `translateX(${from}) skewX(-18deg)` }, { transform: `translateX(${to}) skewX(-18deg)` }];
        anim(wipeA, across("-140%", "0%"), { duration: 300 * d, easing: SNAP });
        anim(wipeB, across("-140%", "0%"), { duration: 300 * d, delay: 70 * d, easing: SNAP }).finished.then(() => {
          if (done) return;
          for (const n of [bg, glow, glow2, back, world, frontFx, skip]) n.style.visibility = "hidden";
          finish();
          anim(wipeB, across("0%", "140%"), { duration: 400 * d, easing: EXPO });
          anim(wipeA, across("0%", "140%"), { duration: 400 * d, delay: 60 * d, easing: EXPO }).finished.then(cleanup, cleanup);
        }, cleanup);
      };
      const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); exit(true); } };
      addEventListener("keydown", onKey, true);
      skip.addEventListener("click", (e) => { e.stopPropagation(); exit(true); });
      root.addEventListener("click", () => exit(true));

      // Reduced motion: the scene fades in, holds, fades out.
      if (quiet) {
        anim(root, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
        at(2300, () => anim(root, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 }).finished.then(cleanup, cleanup));
        return;
      }

      const start = async () => {
        await ready(cut ?? form.image);
        if (done) return;
        // 1. Tension.
        anim(bg, [{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: "ease-out" });
        anim(glow, [{ opacity: 0, transform: "scale(0.6)" }, { opacity: 0.85, transform: "scale(1)" }], { duration: 1200, easing: EXPO });
        anim(glow2, [{ opacity: 0, transform: "scale(0.5)" }, { opacity: 0.55, transform: "scale(1)" }], { duration: 1400, delay: 250, easing: EXPO });
        bands.forEach((b, i) => anim(b, [{ transform: `translateX(${i % 2 ? 160 : -160}%) skewX(-18deg)`, opacity: 0 }, { transform: "translateX(0) skewX(-18deg)", opacity: 1 }], { duration: 900, delay: 220 + i * 110, easing: EXPO }));
        const t0 = performance.now();
        const lineUp = (now) => {
          const t = now - t0;
          lineK = Math.min(1, t / 700) * Math.max(0, 1 - Math.max(0, t - 900) / 500);
          if (t < 1500 && !done) requestAnimationFrame(lineUp);
          else lineK = 0;
        };
        requestAnimationFrame(lineUp);

        // The clip, in a diagonal panel, before the reveal.
        let charge = 1050;
        if (clipBox) {
          // Enough of the clip buffered to play smoothly, then it must really start: a phone that blocks
          // autoplay (battery saver) or a clip that fails skips straight to the reveal instead of a frozen frame.
          let ok = await new Promise((res) => {
            if (video.readyState >= 3) return res(true);
            video.addEventListener("canplay", () => res(true), { once: true });
            video.addEventListener("error", () => res(false), { once: true });
            setTimeout(() => res(video.readyState >= 2), 2200);
          });
          if (done || exiting) return;
          if (ok) ok = await Promise.race([video.play().then(() => true, () => false), new Promise((r) => setTimeout(() => r(!video.paused), 900))]);
          if (done || exiting) return;
          if (ok) {
            const len = Math.min(5200, Math.max(1400, (video.duration || 3) * 1000));
            anim(clipBox, [{ clipPath: "polygon(0 0, 0 0, -12% 100%, -12% 100%)" }, { clipPath: "polygon(0 0, 112% 0, 100% 100%, -12% 100%)" }], { duration: 520, easing: EXPO });
            anim(video, [{ transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: len, easing: "linear" });
            await new Promise((r) => at(len, r));
            if (done || exiting) return;
            anim(clipBox, [{ clipPath: "polygon(0 0, 112% 0, 100% 100%, -12% 100%)" }, { clipPath: "polygon(112% 0, 112% 0, 100% 100%, 100% 100%)" }], { duration: 420, easing: SNAP });
            charge = 280;
          } else { video.pause(); clipBox.remove(); }
        }
        if (done || exiting) return;

        // 2. Reveal: a diagonal mask, a short move that settles.
        at(charge, () => {
          anim(hero, [{ clipPath: "polygon(-30% 0, -30% 0, -60% 100%, -60% 100%)" }, { clipPath: "polygon(-30% 0, 160% 0, 130% 100%, -60% 100%)" }], { duration: 640, easing: EXPO });
          anim(img, [{ transform: "translateX(6%) scale(1.07)" }, { transform: "translateX(0) scale(1)" }], { duration: 1150, easing: EXPO });
          anim(kanji, [{ opacity: 0, transform: "translate(-50%, -50%) scale(1.25)" }, { opacity: 1, transform: "translate(-50%, -50%) scale(1)" }], { duration: 1200, delay: 120, easing: EXPO });
        });
        // 3. Impact: the name, a brief accent, fine bolts, a small jolt.
        at(charge + 400, () => {
          anim(name, [{ clipPath: "inset(-10% 100% -10% 0)", transform: "translateY(18px)" }, { clipPath: "inset(-10% 0 -10% 0)", transform: "translateY(0)" }], { duration: 560, easing: EXPO });
          anim(kicker, [{ opacity: 0, transform: "translateX(-16px)" }, { opacity: 1, transform: "translateX(0)" }], { duration: 480, delay: 120, easing: EXPO });
          anim(formLine, [{ opacity: 0, transform: "translateX(-24px)" }, { opacity: 1, transform: "translateX(0)" }], { duration: 520, delay: 200, easing: EXPO });
          if (subLine) anim(subLine, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 320, easing: "ease-out" });
          anim(streak, [{ opacity: 0, transform: "translateX(-80%) skewX(-18deg)" }, { opacity: 1, offset: 0.35 }, { opacity: 0, transform: "translateX(180%) skewX(-18deg)" }], { duration: 440, delay: 80, easing: "ease-out" });
          anim(world, [{ translate: "0 0" }, { translate: "-5px 3px" }, { translate: "4px -2px" }, { translate: "-2px 1px" }, { translate: "0 0" }], { duration: 230, easing: "linear" });
          strike(form.lightning ? 3 : 2);
        });
        // 4. Pose: slow push-in, the planes drift apart. 5. Exit.
        at(charge + 720, () => {
          const hold = 2300;
          anim(world, [{ transform: "scale(1)" }, { transform: "scale(1.045)" }], { duration: hold, easing: SMOOTH });
          anim(shapes, [{ translate: "0 0" }, { translate: "-1.6% 0" }], { duration: hold, easing: SMOOTH });
          anim(hero, [{ translate: "0 0" }, { translate: "-0.8% 0" }], { duration: hold, easing: SMOOTH });
          anim(type, [{ translate: "0 0" }, { translate: "0.7% 0" }], { duration: hold, easing: SMOOTH });
          anim(front, [{ translate: "0 0", opacity: 0 }, { translate: "-3% 0", opacity: 1 }], { duration: hold, easing: SMOOTH });
          at(hold, () => exit(false));
        });
      };
      start();
    });
  }

  window.CREW_CINEMA = { play, preload };
})();
