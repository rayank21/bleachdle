// Living background: a light layer of particles for each anime over the painted background (decor.js). Reishi motes
// and Hell butterflies for Bleach, Konoha leaves for Naruto, ki sparks for Dragon Ball, waves for One Piece…
// Every particle is a small picture drawn once, then moved only with transform animations, which the browser runs
// on the compositor (GPU) at the screen's refresh rate: nothing is redrawn per frame and the motion never waits for
// the page's own work (scrolling, rolling a crew, loading pictures). Fewer particles on phones and weak machines
// (.lite); off when the system asks for reduced motion.
(() => {
  "use strict";

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const game = document.body?.dataset.game || "home";

  // ── Sprites: each drawn once on a small canvas ──
  const DPR = Math.min(2, devicePixelRatio || 1) * 1.5; // drawn larger than shown: crisp on any screen
  function sprite(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = Math.ceil(w * DPR);
    c.height = Math.ceil(h * DPR);
    const g = c.getContext("2d");
    g.scale(DPR, DPR);
    draw(g, w, h);
    return { url: c.toDataURL(), w, h };
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
    // Solo Leveling: blue System sparks and the purple smoke of the shadows.
    sololeveling: [[() => [glow("110, 140, 255"), glow("170, 110, 255")], "rise", 40, [5, 13], 0.6, 0, 18], [() => [ember("150, 100, 255")], "rise", 14, [12, 22], 0.55, 0, 8]],
    // Pokémon: sparks of every type's colour (electric, fire, water, grass) rising softly.
    // Vinland Saga: snow drifting over the North Sea, a few sparks of the war.
    vinlandsaga: [[() => [glow("220, 235, 255"), glow("170, 205, 235")], "fall", 40, [8, 16], 0.55, 0, 16], [() => [ember("255, 170, 90")], "rise", 8, [12, 22], 0.4, 0, 6]],
    pokemon: [[() => [glow("255, 214, 60"), glow("255, 90, 70"), glow("80, 160, 255"), glow("110, 220, 110")], "rise", 34, [6, 14], 0.55, 0, 18], [() => [ember("255, 230, 120")], "rise", 10, [12, 20], 0.45, 0, 6]],
  };
  const theme = THEMES[game] || THEMES.home;
  const rnd = (a, b) => a + Math.random() * (b - a);

  const layer = document.createElement("div");
  layer.className = "bg-ambient";
  layer.setAttribute("aria-hidden", "true");
  let W = 0;
  let H = 0;

  // Two nested boxes per particle: the path, swaying included (outer), and the spin or wing flap (the picture),
  // each one endless animation. A negative delay starts every particle somewhere along its way.
  function particle(img, kind, size, alpha, spin, sway) {
    const outer = document.createElement("i");
    const pic = document.createElement("img");
    pic.src = img.url;
    pic.alt = "";
    pic.decoding = "async";
    const k = size / Math.max(img.w, img.h);
    pic.width = Math.max(1, Math.round(img.w * k));
    pic.height = Math.max(1, Math.round(img.h * k));
    outer.style.opacity = alpha;
    outer.append(pic);
    layer.append(outer);

    if (kind === "flit") {
      // A butterfly wanders between random points, flapping its wings.
      const pts = Array.from({ length: 7 }, () => ({ transform: `translate3d(${rnd(0.05, 0.95) * W}px, ${rnd(0.2, 0.9) * H}px, 0)`, easing: "ease-in-out" }));
      outer.animate(pts, { duration: rnd(36, 54) * 1000, iterations: Infinity, direction: "alternate", delay: -rnd(0, 30000) });
      pic.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0.25)" }], { duration: 175, iterations: Infinity, direction: "alternate", easing: "ease-in-out" });
      return;
    }
    // rise: floats up and sways · fall: drifts down sideways and spins (speeds in px per second)
    const rise = kind === "rise";
    const x = Math.random() * W;
    const vy = rise ? rnd(14, 44) : rnd(22, 48);
    const vx = rise ? 0 : rnd(10, 28);
    const dur = ((H + 80) / vy) * 1000;
    const [y0, y1] = rise ? [H + 30, -50] : [-40, H + 40];
    // The sway is a sine on top of the drift, sampled eight times per swing.
    const freq = rnd(0.4, 1.2);
    const amp = Math.min(60, (sway * rnd(0.5, 1.5)) / freq);
    const phase = rnd(0, 7);
    const steps = Math.max(2, Math.ceil(((dur / 1000) * freq) / Math.PI * 8));
    const path = Array.from({ length: steps + 1 }, (_, i) => {
      const t = (i / steps) * (dur / 1000);
      return { transform: `translate3d(${(x + vx * t + Math.sin(t * freq + phase) * amp).toFixed(1)}px, ${(y0 + ((y1 - y0) * i) / steps).toFixed(1)}px, 0)` };
    });
    outer.animate(path, { duration: dur, iterations: Infinity, easing: "linear", delay: -Math.random() * dur });
    const vr = (Math.random() - 0.5) * spin;
    if (Math.abs(vr) > 0.05) {
      const from = rnd(0, 360);
      pic.animate([{ transform: `rotate(${from}deg)` }, { transform: `rotate(${from + (vr > 0 ? 360 : -360)}deg)` }],
        { duration: ((Math.PI * 2) / Math.abs(vr)) * 1000, iterations: Infinity, easing: "linear" });
    }
  }

  // One Piece: three layers of waves rolling along the bottom of the screen, each a strip twice as wide as needed
  // that slides by half of itself, so the loop is seamless.
  function waves() {
    const layers = [["40, 120, 210", 0.22, 26, 1, 0.86], ["60, 160, 235", 0.18, 20, -1.4, 0.9], ["170, 225, 255", 0.12, 14, 0.8, 0.94]];
    for (const [color, a, amp, speed, base] of layers) {
      const period = 560;
      const w = (Math.ceil(W / period) + 1) * period;
      const h = Math.round(H * (1 - base) + amp * 2);
      let d = `M0 ${h}`;
      for (let x = 0; x <= w * 2; x += 10) {
        const t = (x / period) * Math.PI * 2;
        d += ` L${x} ${(amp + Math.sin(t) * amp * 0.75 + Math.sin(t * 3) * amp * 0.25).toFixed(1)}`;
      }
      d += ` L${w * 2} ${h} Z`;
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w * 2}' height='${h}'><path d='${d}' fill='rgba(${color},${a})'/></svg>`;
      const strip = document.createElement("i");
      strip.className = "amb-wave";
      strip.style.cssText = `top:${H - h}px;width:${w * 2}px;height:${h}px;background-image:url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
      layer.append(strip);
      const [from, to] = speed > 0 ? [0, -w] : [-w, 0];
      strip.animate([{ transform: `translate3d(${from}px, 0, 0)` }, { transform: `translate3d(${to}px, 0, 0)` }],
        { duration: (w / (40 * Math.abs(speed))) * 1000, iterations: Infinity, easing: "linear" });
    }
  }

  function build() {
    W = innerWidth;
    H = innerHeight;
    layer.replaceChildren();
    const lite = document.documentElement.classList.contains("lite");
    const scale = Math.min(1.6, (W * H) / (1366 * 768)) * (lite ? 0.45 : W < 760 ? 0.6 : 1);
    if (game === "onepiece") waves();
    for (const [make, kind, count, [s0, s1], alpha, spin, sway] of theme) {
      const sprites = make();
      const n = Math.max(3, Math.round(count * scale));
      for (let i = 0; i < n; i++) particle(sprites[i % sprites.length], kind, rnd(s0, s1), alpha * rnd(0.55, 1), spin, sway);
    }
  }

  function start() {
    const bg = document.querySelector(".bg");
    if (!bg) return;
    bg.after(layer);
    build();
    let timer = 0;
    addEventListener("resize", () => {
      if (Math.abs(innerWidth - W) < 40 && Math.abs(innerHeight - H) < 160) return;
      clearTimeout(timer);
      timer = setTimeout(build, 250);
    }, { passive: true });
    // The page found itself slow and went light (decor.js): fewer particles from now on.
    addEventListener("dle:lite", build);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
