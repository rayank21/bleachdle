// Page background, painted once into a single canvas: the tilted grey grid of characters, plus two big characters
// on the sides fading into it (on a game page from that anime's featured characters; on the home page and Crew Roll,
// from two different anime, new ones each visit). One still picture costs nothing while scrolling, where the old
// layers (a filtered, rotated grid and two masked, floating images) made the browser recomposite at every frame.
// Pages hand the grid's pictures over with window.DLE_BG(urls); it redraws only when the window really changes size.
(() => {
  "use strict";

  const GAMES = window.DLE_GAMES || [];
  const ROOT = (document.currentScript?.src || "").replace(/shared\/decor\.js.*$/, "");
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const cache = new Map();
  let grid = [];
  let sides = null;
  let canvas = null;
  let size = { w: 0, h: 0 };
  let timer = 0;

  // Weak machines (few cores or little memory): a lighter page, without the endless decorative animations.
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory || 8;
  if (cores <= 4 || mem <= 4) document.documentElement.classList.add("lite");

  function load(src) {
    if (!cache.has(src)) {
      cache.set(src, new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      }));
    }
    return cache.get(src);
  }

  // Draws img into the box like `object-fit: cover` with the given vertical focus (0 top … 1 bottom).
  function cover(ctx, img, x, y, w, h, fy) {
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = w / s, sh = h / s;
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) * fy, sw, sh, x, y, w, h);
  }

  function pickSides() {
    const here = GAMES.find((g) => location.pathname.includes(`/${g.path}`));
    let chars;
    if (here) {
      const a = pick(here.featured);
      chars = [[here, a], [here, pick(here.featured.filter((x) => x !== a))]];
    } else {
      const g1 = pick(GAMES);
      const g2 = pick(GAMES.filter((g) => g !== g1));
      chars = [[g1, pick(g1.featured)], [g2, pick(g2.featured)]];
    }
    return chars.map(([g, id]) => `${ROOT}${g.path}assets/characters/${id}.webp`);
  }

  async function paint() {
    const bg = document.querySelector(".bg");
    if (!bg) return;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "bg-canvas";
      bg.prepend(canvas);
    }
    const W = innerWidth, H = innerHeight;
    size = { w: W, h: H };
    const mobile = W <= 760;
    // Phones keep the canvases small: mobile browsers cap canvas memory and reload a page that goes over it.
    const dpr = Math.min(devicePixelRatio || 1, document.documentElement.classList.contains("lite") || mobile ? 1 : 1.5);

    // The grid: 140% of the screen, turned by -7°, cells of 120×150 with 6px gaps, like the old CSS grid.
    const gw = W * 1.4, gh = H * 1.4;
    const cols = Math.max(1, Math.floor((gw + 6) / 126));
    const cw = (gw - 6 * (cols - 1)) / cols;
    const rows = Math.ceil((gh + 6) / 156);
    const cells = grid.length ? Array.from({ length: cols * rows }, (_, i) => grid[i % grid.length]) : [];
    const [imgs, decor] = await Promise.all([Promise.all(cells.map(load)), Promise.all((sides || []).map(load))]);
    if (size.w !== W || size.h !== H) return; // resized meanwhile: a newer paint is coming

    const g = document.createElement("canvas");
    g.width = Math.round(W * dpr);
    g.height = Math.round(H * dpr);
    const gx = g.getContext("2d");
    gx.scale(dpr, dpr);
    gx.translate(W / 2, H / 2);
    gx.rotate((-7 * Math.PI) / 180);
    gx.translate(-gw / 2, -gh / 2);
    imgs.forEach((img, i) => {
      if (img) cover(gx, img, (i % cols) * (cw + 6), Math.floor(i / cols) * 156, cw, 150, 0.2);
    });
    gx.setTransform(1, 0, 0, 1, 0, 0);
    // Grey: the saturation blend takes the colour out everywhere, even where canvas filters are not supported.
    gx.globalCompositeOperation = "saturation";
    gx.fillStyle = "#808080";
    gx.fillRect(0, 0, g.width, g.height);

    const ctx = canvas.getContext("2d");
    canvas.width = g.width;
    canvas.height = g.height;
    ctx.fillStyle = "#0b0b0d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.2;
    ctx.drawImage(g, 0, 0);

    // The two side characters, fading towards the middle of the page.
    decor.forEach((img, i) => {
      if (!img) return;
      const h = (mobile ? 0.6 : 1) * H;
      const w = Math.min((img.naturalWidth / img.naturalHeight) * h, (mobile ? 0.6 : 0.42) * W);
      const d = document.createElement("canvas");
      d.width = Math.round(w * dpr);
      d.height = Math.round(h * dpr);
      const dx = d.getContext("2d");
      cover(dx, img, 0, 0, d.width, d.height, 0.5);
      dx.globalCompositeOperation = "destination-in";
      const fade = i ? dx.createLinearGradient(d.width, 0, 0, 0) : dx.createLinearGradient(0, 0, d.width, 0);
      fade.addColorStop(0.45, "#000");
      fade.addColorStop(0.95, "rgba(0,0,0,0)");
      dx.fillStyle = fade;
      dx.fillRect(0, 0, d.width, d.height);
      const x = i ? W * 1.03 - w : -0.03 * W;
      const y = H * 1.02 - h;
      ctx.globalAlpha = mobile ? 0.3 : 0.6;
      ctx.drawImage(d, x * dpr, y * dpr);
      d.width = d.height = 0;
    });
    ctx.globalAlpha = 1;
    canvas.classList.add("is-in");
    // Free the scratch canvas and the decoded pictures at once instead of waiting for the garbage collector.
    g.width = g.height = 0;
    cache.clear();
  }

  function schedule(delay = 0) {
    clearTimeout(timer);
    timer = setTimeout(paint, delay);
  }

  window.DLE_BG = (urls) => {
    grid = urls || [];
    schedule();
  };

  addEventListener("resize", () => {
    // Phones resize the window when the address bar slides; the canvas simply stretches for that.
    if (Math.abs(innerWidth - size.w) > 40 || Math.abs(innerHeight - size.h) > 160) schedule(250);
  }, { passive: true });

  function start() {
    if (!document.querySelector(".bg") || !GAMES.length) return;
    sides = pickSides();
    schedule();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
