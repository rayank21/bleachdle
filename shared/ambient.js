// Living background: a light layer of particles drawn for each anime at the screen's refresh rate (60 fps or
// more), over the painted background (decor.js). Reishi motes and Hell butterflies for Bleach, Konoha leaves for
// Naruto, ki sparks for Dragon Ball, waves for One Piece… Every particle is a small picture drawn once and then
// only moved, so a frame costs a few hundred image copies. It pauses in hidden tabs, uses fewer particles on
// phones and weak machines (.lite), and stays off when the system asks for reduced motion.
(() => {
  "use strict";

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const game = document.body?.dataset.game || "home";
  const lite = document.documentElement.classList.contains("lite");

  // ── Sprites: each drawn once on a small canvas ──
  function sprite(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    return c;
  }
  const glow = (color, r = 16) => sprite(r * 2, r * 2, (g) => {
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, `rgba(${color}, 1)`);
    grad.addColorStop(0.25, `rgba(${color}, 0.55)`);
    grad.addColorStop(1, `rgba(${color}, 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, r * 2, r * 2);
  });
  const petal = (color, edge) => sprite(28, 20, (g) => {
    g.translate(14, 10);
    g.beginPath();
    g.moveTo(-12, 0);
    g.bezierCurveTo(-6, -10, 8, -9, 12, -1);
    g.lineTo(9, 0);
    g.lineTo(12, 1);
    g.bezierCurveTo(8, 9, -6, 10, -12, 0);
    const grad = g.createLinearGradient(-12, 0, 12, 0);
    grad.addColorStop(0, `rgb(${edge})`);
    grad.addColorStop(1, `rgb(${color})`);
    g.fillStyle = grad;
    g.fill();
  });
  const leaf = (color, vein) => sprite(34, 22, (g) => {
    g.translate(17, 11);
    g.beginPath();
    g.moveTo(-15, 0);
    g.quadraticCurveTo(-2, -12, 15, 0);
    g.quadraticCurveTo(-2, 12, -15, 0);
    g.fillStyle = `rgb(${color})`;
    g.fill();
    g.strokeStyle = `rgba(${vein}, 0.8)`;
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(-15, 0);
    g.lineTo(14, 0);
    g.stroke();
  });
  const clover = (color) => sprite(28, 28, (g) => {
    g.translate(14, 14);
    g.fillStyle = `rgb(${color})`;
    for (let i = 0; i < 4; i++) {
      g.rotate(Math.PI / 2);
      g.beginPath();
      g.arc(-3.5, -6, 4.6, 0, Math.PI * 2);
      g.arc(3.5, -6, 4.6, 0, Math.PI * 2);
      g.moveTo(0, 0);
      g.lineTo(-7, -6);
      g.lineTo(7, -6);
      g.fill();
    }
  });
  const ember = (color) => sprite(10, 30, (g) => {
    const grad = g.createLinearGradient(0, 30, 0, 0);
    grad.addColorStop(0, `rgba(${color}, 0)`);
    grad.addColorStop(0.7, `rgba(${color}, 0.9)`);
    grad.addColorStop(1, "rgba(255, 255, 240, 1)");
    g.fillStyle = grad;
    g.beginPath();
    g.ellipse(5, 15, 3, 15, 0, 0, Math.PI * 2);
    g.fill();
  });
  const feather = () => sprite(40, 16, (g) => {
    g.translate(20, 8);
    g.beginPath();
    g.moveTo(-18, 0);
    g.quadraticCurveTo(0, -9, 18, -1);
    g.quadraticCurveTo(0, 7, -18, 0);
    g.fillStyle = "rgba(240, 240, 245, 0.95)";
    g.fill();
    g.strokeStyle = "rgba(170, 170, 185, 0.9)";
    g.beginPath();
    g.moveTo(-20, 0.5);
    g.lineTo(17, -0.5);
    g.stroke();
  });
  const bubble = (color) => sprite(36, 36, (g) => {
    g.strokeStyle = `rgba(${color}, 0.85)`;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(18, 18, 15, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = `rgba(${color}, 0.18)`;
    g.fill();
    g.fillStyle = "rgba(255, 255, 255, 0.85)";
    g.beginPath();
    g.ellipse(12, 11, 4, 2.5, -0.6, 0, Math.PI * 2);
    g.fill();
  });
  // A Hell butterfly: two frames-free wings, flapped by squeezing the sprite horizontally.
  const butterfly = () => sprite(40, 30, (g) => {
    g.translate(20, 15);
    g.fillStyle = "#0b0b10";
    g.strokeStyle = "rgba(150, 120, 255, 0.9)";
    g.lineWidth = 1.2;
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(0, 0);
      g.bezierCurveTo(s * 6, -16, s * 20, -14, s * 17, -2);
      g.bezierCurveTo(s * 16, 4, s * 9, 3, 0, 1);
      g.bezierCurveTo(s * 8, 6, s * 14, 13, s * 6, 13);
      g.closePath();
      g.fill();
      g.stroke();
    }
  });

  // ── Particle kinds: how each one spawns and moves (px per second) ──
  // rise: floats up and sways · fall: drifts down, spins · flit: wanders (butterflies)
  const KINDS = {
    rise: (W, H, p, fresh) => Object.assign(p, { x: Math.random() * W, y: fresh ? Math.random() * H : H + 20, vx: 0, vy: -(14 + Math.random() * 30) }),
    fall: (W, H, p, fresh) => Object.assign(p, { x: Math.random() * W, y: fresh ? Math.random() * H : -30, vx: 10 + Math.random() * 18, vy: 22 + Math.random() * 26 }),
    flit: (W, H, p) => Object.assign(p, { x: Math.random() * W, y: H * (0.2 + Math.random() * 0.7), vx: (Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 14), vy: -4 - Math.random() * 6 }),
  };

  // One theme per page: [sprites, kind, count per 1366×768, size range, opacity, spin, sway]
  const sakura = () => [petal("255, 190, 214", "255, 236, 242"), petal("255, 160, 196", "255, 220, 232")];
  const THEMES = {
    home: [[sakura, "fall", 22, [12, 22], 0.75, 1.6, 30], [() => [glow("255, 170, 90"), glow("120, 200, 255"), glow("255, 110, 160")], "rise", 26, [6, 14], 0.55, 0, 16]],
    crew: [[() => [glow("255, 210, 90"), glow("255, 160, 60")], "rise", 34, [6, 16], 0.6, 0, 18], [sakura, "fall", 12, [12, 20], 0.65, 1.6, 30]],
    bleach: [[() => [glow("170, 230, 255"), glow("235, 248, 255")], "rise", 48, [5, 13], 0.7, 0, 22], [() => [butterfly()], "flit", 4, [22, 30], 0.95, 0, 40]],
    hunterxhunter: [[() => [glow("110, 255, 160"), glow("190, 255, 120")], "rise", 46, [6, 16], 0.55, 0, 26]],
    dragonball: [[() => [ember("255, 200, 60"), ember("255, 140, 30")], "rise", 34, [10, 22], 0.7, 0, 8], [() => [glow("255, 220, 120")], "rise", 22, [6, 12], 0.6, 0, 14]],
    naruto: [[() => [leaf("86, 170, 70", "40, 90, 30"), leaf("120, 190, 80", "50, 100, 40"), leaf("210, 160, 60", "120, 80, 20")], "fall", 24, [16, 28], 0.85, 1.4, 36], [() => [glow("255, 150, 40")], "rise", 14, [6, 12], 0.5, 0, 14]],
    onepiece: [[() => [glow("255, 230, 150"), glow("150, 220, 255")], "rise", 24, [5, 12], 0.55, 0, 18]],
    jujutsukaisen: [[() => [ember("150, 80, 255"), ember("90, 60, 220")], "rise", 36, [10, 22], 0.65, 0, 10], [() => [glow("120, 70, 255"), glow("40, 30, 90")], "rise", 18, [8, 18], 0.5, 0, 22]],
    blackclover: [[() => [clover("70, 170, 90"), clover("30, 120, 60")], "fall", 16, [12, 20], 0.8, 1.8, 30], [() => [glow("40, 40, 50"), glow("90, 200, 120")], "rise", 30, [6, 14], 0.55, 0, 20]],
    attackontitan: [[() => [feather()], "fall", 10, [18, 30], 0.75, 0.9, 40], [() => [glow("200, 190, 180"), glow("150, 140, 130")], "fall", 36, [3, 7], 0.6, 0, 18]],
    demonslayer: [[() => [petal("190, 150, 255", "235, 220, 255"), petal("160, 110, 230", "220, 200, 255")], "fall", 24, [12, 20], 0.8, 1.6, 30], [() => [ember("255, 120, 50")], "rise", 16, [10, 18], 0.6, 0, 10]],
    myheroacademia: [[() => [ember("120, 200, 255"), ember("255, 220, 80")], "rise", 32, [10, 20], 0.65, 0, 10], [() => [glow("255, 80, 80")], "rise", 14, [6, 12], 0.5, 0, 16]],
    haikyuu: [[() => [glow("255, 150, 40"), glow("255, 220, 160")], "rise", 34, [6, 14], 0.55, 0, 18], [() => [ember("255, 255, 255")], "rise", 10, [12, 20], 0.4, 0, 6]],
    fireforce: [[() => [ember("255, 120, 30"), ember("255, 190, 60")], "rise", 52, [10, 22], 0.75, 0, 12], [() => [glow("40, 30, 30")], "rise", 18, [8, 16], 0.5, 0, 20]],
    slime: [[() => [bubble("110, 190, 255"), bubble("150, 230, 255")], "rise", 22, [12, 26], 0.75, 0, 22], [() => [glow("120, 200, 255")], "rise", 16, [5, 10], 0.5, 0, 14]],
    onepunchman: [[() => [glow("255, 225, 90"), glow("255, 255, 255")], "rise", 30, [5, 12], 0.55, 0, 16], [() => [ember("255, 200, 40")], "rise", 10, [12, 22], 0.5, 0, 6]],
  };
  const theme = THEMES[game] || THEMES.home;

  const canvas = document.createElement("canvas");
  canvas.className = "bg-ambient";
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  let W = 0;
  let H = 0;
  let parts = [];
  let waves = game === "onepiece";

  function build() {
    W = innerWidth;
    H = innerHeight;
    canvas.width = W;
    canvas.height = H;
    const scale = Math.min(1.6, (W * H) / (1366 * 768)) * (lite ? 0.45 : W < 760 ? 0.6 : 1);
    parts = [];
    for (const [make, kind, count, [s0, s1], alpha, spin, sway] of theme) {
      const sprites = make();
      const n = Math.max(3, Math.round(count * scale));
      for (let i = 0; i < n; i++) {
        const p = { img: sprites[i % sprites.length], kind, size: s0 + Math.random() * (s1 - s0), alpha: alpha * (0.55 + Math.random() * 0.45),
          rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * spin, sway: sway * (0.5 + Math.random()), phase: Math.random() * 7, freq: 0.4 + Math.random() * 0.8 };
        KINDS[kind](W, H, p, true);
        parts.push(p);
      }
    }
  }

  // One Piece: three layers of waves rolling along the bottom of the screen.
  function drawWaves(t) {
    const layers = [["40, 120, 210", 0.22, 26, 0.5, 0.86], ["60, 160, 235", 0.18, 20, -0.7, 0.9], ["170, 225, 255", 0.12, 14, 0.9, 0.94]];
    for (const [color, a, amp, speed, base] of layers) {
      ctx.fillStyle = `rgba(${color}, ${a})`;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W + 20; x += 20) {
        const y = H * base + Math.sin(x / 140 + t * speed) * amp + Math.sin(x / 57 - t * speed * 1.7) * amp * 0.35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    }
  }

  let last = 0;
  let raf = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    const t = now / 1000;
    ctx.clearRect(0, 0, W, H);
    if (waves) drawWaves(t);
    for (const p of parts) {
      p.x += (p.vx + Math.sin(t * p.freq + p.phase) * p.sway) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.kind === "flit") p.vy += Math.sin(t * 2 + p.phase) * 18 * dt;
      if (p.y < -40 || p.y > H + 40 || p.x < -60 || p.x > W + 60) KINDS[p.kind](W, H, p, false);
      const w = p.size * (p.img.width / Math.max(p.img.width, p.img.height));
      const h = p.size * (p.img.height / Math.max(p.img.width, p.img.height));
      ctx.globalAlpha = p.alpha;
      if (p.kind === "rise" && !p.vr) {
        ctx.drawImage(p.img, p.x - w / 2, p.y - h / 2, w, h);
      } else {
        ctx.setTransform(1, 0, 0, 1, p.x, p.y);
        if (p.kind === "flit") ctx.scale(0.25 + Math.abs(Math.sin(t * 9 + p.phase)) * 0.75, 1);
        else ctx.rotate(p.rot);
        ctx.drawImage(p.img, -w / 2, -h / 2, w, h);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
    ctx.globalAlpha = 1;
  }

  function start() {
    const bg = document.querySelector(".bg");
    if (!bg) return;
    bg.after(canvas);
    build();
    raf = requestAnimationFrame(frame);
    let timer = 0;
    addEventListener("resize", () => {
      if (Math.abs(innerWidth - W) < 40 && Math.abs(innerHeight - H) < 160) return;
      clearTimeout(timer);
      timer = setTimeout(build, 250);
    }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (!document.hidden) raf = requestAnimationFrame(frame);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
