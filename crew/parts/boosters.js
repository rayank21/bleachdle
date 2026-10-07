// Boosters: a shelf with one pack per anime, and the opening (tear the pack, flip 5 cards, see what's new).
// The stock lives on the profile (shared/profile.js: earned and opened counters); the cards join the collection.

import { S } from "./state.js";
import { $, GAMES, ROOT, el, loadGame, makePool, playerArc, t, toast, wait } from "./base.js";
import { burst, formFor, sfx, tierOf } from "./fx.js";

// Each anime's pack: two colours and a kanji printed on the foil.
const PACKS = {
  bleach: ["255, 138, 31", "27, 11, 3", "卍"], hunterxhunter: ["61, 220, 132", "6, 33, 15", "念"], dragonball: ["255, 177, 31", "58, 18, 0", "龍"],
  naruto: ["255, 122, 26", "29, 12, 2", "忍"], onepiece: ["255, 59, 74", "26, 4, 8", "海"], jujutsukaisen: ["122, 92, 255", "12, 7, 32", "呪"],
  blackclover: ["48, 209, 88", "4, 19, 10", "魔"], attackontitan: ["201, 163, 107", "26, 18, 10", "巨"], demonslayer: ["255, 77, 109", "19, 6, 11", "鬼"],
  myheroacademia: ["46, 197, 255", "4, 18, 28", "英"], haikyuu: ["255, 140, 0", "22, 11, 0", "翔"], fireforce: ["255, 90, 31", "26, 5, 0", "炎"],
  slime: ["79, 195, 255", "4, 17, 29", "転"], onepunchman: ["255, 214, 10", "26, 20, 0", "拳"],
};
const PROFILE = () => window.DLE_Profile;
const stock = () => PROFILE()?.boosters?.() ?? 0;
const MAX = () => PROFILE()?.BOOST_MAX ?? 10;
// How many packs a click opens: 1, 2, 5, 10 or all of them.
const QTYS = [1, 2, 5, 10, "all"];
let qty = 1;
const howMany = () => (qty === "all" ? stock() : qty);

// ════════════════════ SHELF ════════════════════
let shelfTimer = null;
export function renderBoosters() {
  const view = $("#boostView");
  view.textContent = "";
  clearInterval(shelfTimer);

  const hero = el("section", "card bshop-hero");
  const left = el("div", "bshop-main");
  left.append(el("h2", "bshop-title", t("bTitle")), el("p", "muted bshop-sub", t("bSub")));
  const n = stock();
  const count = el("div", `bshop-stock${n ? " has-some" : ""}`);
  const stack = el("span", "bshop-stack");
  for (let i = 0; i < Math.min(n, 5); i++) { const p = el("i"); p.style.setProperty("--i", i); stack.append(p); }
  count.append(stack, el("b", null, t("bStock")(n)), el("span", "bshop-max", `${n} / ${MAX()}`));
  // Open several at once.
  const qtys = el("div", "bshop-qty");
  qtys.append(el("span", "crew-setting-label", t("bQty")));
  for (const q of QTYS) {
    const need = q === "all" ? 2 : q;
    const b = el("button", `bshop-qty-btn${qty === q ? " is-active" : ""}`, q === "all" ? t("bAll") : `×${q}`);
    b.type = "button";
    b.disabled = q !== 1 && n < need;
    b.addEventListener("click", () => { qty = q; renderBoosters(); });
    qtys.append(b);
  }
  if (qty !== 1 && n < (qty === "all" ? 2 : qty)) qty = 1;
  const next = el("span", "bshop-next");
  const tick = () => { next.textContent = t("bNext")(untilParisMidnight()); };
  tick();
  shelfTimer = setInterval(() => { if (!view.isConnected || S.mode !== "boosters") clearInterval(shelfTimer); else tick(); }, 30000);
  left.append(count, qtys, el("p", "bshop-how", t("bHow")), next, el("p", "muted bshop-rates", t("bRates")));
  hero.append(left);
  view.append(hero);

  const shelf = el("div", "bshop-shelf");
  GAMES.forEach((g, i) => {
    const owned = PROFILE()?.collectionOf?.(g.id)?.size ?? 0;
    const item = el("div", "bshop-item");
    item.style.animationDelay = `${i * 35}ms`;
    const pack = packEl(g);
    pack.classList.toggle("is-empty", !n);
    const btn = el("button", "bshop-pack-btn");
    btn.type = "button";
    btn.title = `${t("bOpen")}${howMany() > 1 ? ` ×${howMany()}` : ""} · ${g.anime}`;
    btn.append(pack);
    btn.addEventListener("click", () => {
      if (!stock()) { pack.classList.remove("is-nope"); void pack.offsetWidth; pack.classList.add("is-nope"); toast(t("bNone")); sfx("stamp"); return; }
      const k = Math.min(howMany(), stock());
      if (k > 1) openMany(g, pack, k);
      else openPack(g, pack);
    });
    const meta = el("div", "bshop-meta");
    const bar = el("span", "bshop-bar");
    const fill = el("i");
    fill.style.width = `${Math.min(100, (owned / Math.max(1, g.count)) * 100)}%`;
    bar.append(fill);
    meta.append(el("b", null, g.anime), bar, el("span", "bshop-owned", t("bOwned")(owned, g.count)));
    item.append(btn, meta);
    shelf.append(item);
  });
  view.append(shelf);
}

// "5 h 12" until midnight in Paris (the daily booster's day).
function untilParisMidnight() {
  const now = new Date();
  const paris = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  const left = Math.max(0, 24 * 3600 - (paris.getHours() * 3600 + paris.getMinutes() * 60 + paris.getSeconds()));
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  return h ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`;
}

// A pack: foil body with the anime's colours, its kanji, logo and name; a crimped top strip that tears off.
function packEl(g) {
  const [c1, c2, kanji] = PACKS[g.id] ?? ["255, 80, 80", "20, 4, 6", "★"];
  const pack = el("div", "bpack");
  pack.style.setProperty("--p1", c1);
  pack.style.setProperty("--p2", c2);
  const body = el("div", "bpack-body");
  const logo = el("img", "bpack-logo");
  logo.src = ROOT + g.logo;
  logo.alt = "";
  const face = el("img", "bpack-face");
  face.src = `${ROOT}${g.path}assets/characters/${g.featured?.[0] ?? ""}.webp`;
  face.alt = "";
  face.onerror = () => face.remove();
  body.append(el("span", "bpack-kanji", kanji), face, el("i", "bpack-foil"), logo, el("span", "bpack-name", g.anime), el("span", "bpack-count", "5 ✦"));
  // The zip: a dotted tear line under the cap, with its pull tab; the spark and the gap light up when it tears.
  const zip = el("div", "bpack-zip");
  zip.append(el("i", "bpack-gap"), el("i", "bpack-spark"), el("span", "bpack-tab"));
  pack.append(body, el("div", "bpack-top"), zip, el("div", "bpack-bottom"));
  return pack;
}

// ════════════════════ DRAW ════════════════════
const pickTier = (last) => {
  const r = Math.random();
  if (last) return r < 0.2 ? "legend" : "epic";
  return r < 0.04 ? "legend" : r < 0.25 ? "epic" : "common";
};
export async function drawPack(g) {
  const data = await loadGame(g);
  const arc = playerArc(data.config) ?? data.config.arcs.length - 1;
  const pool = makePool(g, data, arc);
  const byTier = { legend: [], epic: [], common: [] };
  for (const c of pool) byTier[tierOf(c.power)].push(c);
  const order = { legend: ["legend", "epic", "common"], epic: ["epic", "legend", "common"], common: ["common", "epic", "legend"] };
  const taken = new Set();
  const out = [];
  for (let i = 0; i < 5; i++) {
    const tier = pickTier(i === 4);
    let c = null;
    for (const tr of order[tier]) {
      const left = byTier[tr].filter((x) => !taken.has(x.id));
      if (left.length) { c = left[Math.floor(Math.random() * left.length)]; break; }
    }
    if (!c) break;
    taken.add(c.id);
    // Secret: a strong card shown in its transformation (about 1 card in 100).
    const form = c.power >= 7 ? formFor(g.id, c, arc) : null;
    const secret = !!form && Math.random() < 0.045;
    out.push({ g: g.id, id: c.id, n: c.name, p: c.power, f: secret, img: secret ? form.image : c.image, tier: secret ? "secret" : tierOf(c.power) });
  }
  // Rarest last: the best card comes at the end of the row.
  const rank = { common: 0, epic: 1, legend: 2, secret: 3 };
  return out.sort((a, b) => rank[a.tier] - rank[b.tier] || a.p - b.p);
}

// ════════════════════ OPENING ════════════════════
let opening = false;
async function openPack(g, fromPack) {
  if (opening || !PROFILE()?.openBooster?.()) return;
  opening = true;
  let cards = [];
  try { cards = await drawPack(g); } catch { opening = false; return; }
  // Into the collection right away (closing early never loses a card); new ones are marked first.
  for (const c of cards) c.isNew = !!PROFILE()?.collect?.(g.id, c.id);

  const [c1, c2] = PACKS[g.id] ?? ["255, 80, 80", "20, 4, 6"];
  const root = el("div", "bopen");
  root.style.setProperty("--p1", c1);
  root.style.setProperty("--p2", c2);
  const rays = el("div", "bopen-rays");
  const flash = el("div", "bopen-flash");
  const stage = el("div", "bopen-stage");
  const hint = el("p", "bopen-hint", t("bTap"));
  const pack = packEl(g);
  pack.classList.add("is-big");
  stage.append(pack);
  const row = el("div", "bopen-row");
  const foot = el("div", "bopen-foot");
  root.append(rays, stage, row, hint, foot, flash);
  document.body.append(root);
  document.documentElement.classList.add("bopen-lock");
  sfx("whoosh");

  // The pack flies in from the shelf.
  const from = fromPack?.getBoundingClientRect();
  await frame2();
  const to = pack.getBoundingClientRect();
  if (from && from.width) {
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    await pack.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width}) rotate(-6deg)` },
      { transform: "translate(0, -30px) scale(1.06) rotate(3deg)", offset: 0.7 },
      { transform: "none" },
    ], { duration: 700, easing: "cubic-bezier(.2,.9,.3,1)" }).finished.catch(() => {});
  }
  pack.classList.add("is-idle");

  // One click: a spark runs along the dotted line and unzips the pack, the cap lifts, then flies off.
  await new Promise((resolve) => {
    const go = () => { stage.removeEventListener("click", go); hint.removeEventListener("click", go); resolve(); };
    stage.addEventListener("click", go);
    hint.addEventListener("click", go);
  });
  hint.textContent = "";
  pack.classList.remove("is-idle");
  root.style.setProperty("--charge", 1);
  const ZIP = 650;
  const zipEase = "cubic-bezier(.55,0,.45,1)";
  const top = pack.querySelector(".bpack-top");
  pack.querySelector(".bpack-tab")?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: "forwards" });
  pack.querySelector(".bpack-spark").animate([{ left: "0%", opacity: 1 }, { left: "100%", opacity: 1, offset: 0.92 }, { left: "100%", opacity: 0 }], { duration: ZIP, easing: zipEase, fill: "forwards" });
  pack.querySelector(".bpack-gap").animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: ZIP, easing: zipEase, fill: "forwards" });
  top.animate([{ transform: "none" }, { transform: "translateY(-5%) rotate(4deg)" }], { duration: ZIP, easing: zipEase, fill: "forwards" });
  pack.animate([{ transform: "none" }, { transform: "translateX(-2px) rotate(-0.6deg)" }, { transform: "translateX(2px) rotate(0.6deg)" }, { transform: "none" }], { duration: 160, iterations: Math.ceil(ZIP / 160) });
  sfx("rise", { dur: ZIP / 1000 });
  await wait(ZIP);
  top.animate([{ transform: "translateY(-5%) rotate(4deg)", opacity: 1 }, { transform: "translate(170px, -260px) rotate(42deg)", opacity: 0 }], { duration: 650, easing: "cubic-bezier(.3,.6,.4,1)", fill: "forwards" });
  pack.classList.add("is-torn");
  flash.animate([{ opacity: 0 }, { opacity: 0.85 }, { opacity: 0 }], { duration: 520, easing: "ease-out" });
  const r = pack.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height * 0.15, { count: 50, spread: 260, color: c1 });
  sfx("slash");
  await wait(420);

  // The pack slides down; the cards come out of it one by one, land in the row and turn over.
  root.classList.add("is-dealing");
  const faces = cards.map((c, i) => cardSlot(c, i));
  for (const f of faces) f.node.style.opacity = "0";
  row.append(...faces.map((f) => f.node));
  const low = Math.min(window.innerHeight * 0.3, 270);
  await stage.animate([{ transform: "none" }, { transform: `translateY(${low}px) scale(0.6)` }], { duration: 520, easing: "cubic-bezier(.2,.9,.3,1)", fill: "forwards" }).finished.catch(() => {});
  let fast = false;
  const skip = el("button", "btn-ghost bopen-all", t("bSkip"));
  skip.type = "button";
  skip.addEventListener("click", () => { fast = true; skip.disabled = true; });
  foot.append(skip);
  for (const f of faces) {
    const pr = pack.getBoundingClientRect();
    const nr = f.node.getBoundingClientRect();
    const dx = pr.left + pr.width / 2 - (nr.left + nr.width / 2);
    const dy = pr.top + pr.height * 0.35 - (nr.top + nr.height / 2);
    f.node.style.opacity = "";
    pack.animate([{ transform: "none" }, { transform: "scale(1.05, 0.96)" }, { transform: "none" }], { duration: 260, easing: "ease-out" });
    sfx("whoosh");
    await f.node.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(0.42)`, opacity: 0 },
      { transform: `translate(${dx}px, ${dy - nr.height * 0.55}px) scale(0.6)`, opacity: 1, offset: 0.3 },
      { transform: `translate(${dx * 0.35}px, ${-30}px) scale(1.05) rotate(${dx > 0 ? -6 : 6}deg)`, offset: 0.75 },
      { transform: "none", opacity: 1 },
    ], { duration: fast ? 280 : 680, easing: "cubic-bezier(.25,.8,.3,1)" }).finished.catch(() => {});
    f.flipped = true;
    await reveal(f, root, flash, fast);
    await wait(fast ? 110 : f.card.tier === "common" ? 380 : 700);
  }
  skip.remove();
  stage.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" });
  await wait(500);
  stage.remove();
  root.classList.remove("is-dealing");

  // Summary.
  hint.textContent = "";
  foot.textContent = "";
  const fresh = cards.filter((c) => c.isNew).length;
  const sum = el("p", `bopen-sum${fresh ? " has-new" : ""}`, t("bSummary")(fresh));
  const again = el("button", "btn-primary", `${t("bAgain")} (${stock()})`);
  again.type = "button";
  again.disabled = !stock();
  const close = el("button", "btn-ghost", t("bDone"));
  close.type = "button";
  const end = (next) => {
    root.classList.add("is-out");
    setTimeout(() => { root.remove(); document.documentElement.classList.remove("bopen-lock"); }, 320);
    opening = false;
    if (S.mode === "boosters") renderBoosters();
    if (next) setTimeout(() => openPack(g, null), 360);
  };
  again.addEventListener("click", () => end(true));
  close.addEventListener("click", () => end(false));
  root.addEventListener("keydown", (e) => { if (e.key === "Escape") end(false); });
  foot.append(sum, again, close);
  close.focus({ preventScroll: true });
  if (fresh) sfx("win");
}

const frame2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

// Several packs of the same anime at once: one zip for the whole stack, then every card dealt into a grid and turned
// over in a quick wave (the rare ones still get their moment), and a summary of what came out.
async function openMany(g, fromPack, n) {
  if (opening || !PROFILE()?.openBooster?.(n)) return;
  opening = true;
  let packs = [];
  try { packs = await Promise.all(Array.from({ length: n }, () => drawPack(g))); } catch { opening = false; return; }
  const rank = { common: 0, epic: 1, legend: 2, secret: 3 };
  const cards = packs.flat();
  for (const c of cards) c.isNew = !!PROFILE()?.collect?.(g.id, c.id);
  // Commons first, the best at the end, so the wave builds up.
  cards.sort((a, b) => rank[a.tier] - rank[b.tier] || a.p - b.p);

  const [c1, c2] = PACKS[g.id] ?? ["255, 80, 80", "20, 4, 6"];
  const root = el("div", "bopen is-many");
  root.style.setProperty("--p1", c1);
  root.style.setProperty("--p2", c2);
  const rays = el("div", "bopen-rays");
  const flash = el("div", "bopen-flash");
  const stage = el("div", "bopen-stage");
  const hint = el("p", "bopen-hint", t("bTapMany")(n));
  const pack = packEl(g);
  pack.classList.add("is-big", "is-stack");
  pack.style.setProperty("--stack", Math.min(n, 6));
  stage.append(pack);
  const grid = el("div", "bopen-grid");
  const foot = el("div", "bopen-foot");
  root.append(rays, stage, grid, hint, foot, flash);
  document.body.append(root);
  document.documentElement.classList.add("bopen-lock");
  sfx("whoosh");
  const from = fromPack?.getBoundingClientRect();
  await frame2();
  const to = pack.getBoundingClientRect();
  if (from && from.width) {
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    await pack.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width}) rotate(-6deg)` }, { transform: "none" }], { duration: 600, easing: "cubic-bezier(.2,.9,.3,1)" }).finished.catch(() => {});
  }
  pack.classList.add("is-idle");
  await new Promise((resolve) => {
    const go = () => { stage.removeEventListener("click", go); hint.removeEventListener("click", go); resolve(); };
    stage.addEventListener("click", go);
    hint.addEventListener("click", go);
  });
  hint.textContent = "";
  pack.classList.remove("is-idle");
  root.style.setProperty("--charge", 1);
  pack.querySelector(".bpack-tab")?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: "forwards" });
  pack.querySelector(".bpack-spark").animate([{ left: "0%", opacity: 1 }, { left: "100%", opacity: 0 }], { duration: 500, fill: "forwards" });
  pack.querySelector(".bpack-gap").animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 500, fill: "forwards" });
  sfx("rise", { dur: 0.5 });
  await wait(500);
  pack.querySelector(".bpack-top").animate([{ opacity: 1 }, { transform: "translate(170px, -260px) rotate(42deg)", opacity: 0 }], { duration: 600, fill: "forwards" });
  flash.animate([{ opacity: 0 }, { opacity: 0.85 }, { opacity: 0 }], { duration: 520, easing: "ease-out" });
  const r = pack.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height * 0.15, { count: 70, spread: 320, color: c1 });
  sfx("slash");
  await wait(350);
  stage.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(0.6)" }], { duration: 380, fill: "forwards" });
  await wait(300);
  stage.remove();

  // The grid: every card face down, then turned over one after the other.
  const faces = cards.map((c, i) => cardSlot(c, i));
  grid.append(...faces.map((f) => f.node));
  faces.forEach((f, i) => f.node.animate([{ opacity: 0, transform: "translateY(30px) scale(0.8)" }, { opacity: 1, transform: "none" }], { duration: 320, delay: Math.min(i, 40) * 18, easing: "cubic-bezier(.2,.9,.3,1)", fill: "backwards" }));
  await wait(Math.min(faces.length, 40) * 18 + 300);
  let fast = false;
  const skip = el("button", "btn-ghost bopen-all", t("bSkip"));
  skip.type = "button";
  skip.addEventListener("click", () => { fast = true; skip.disabled = true; });
  foot.append(skip);
  for (const f of faces) {
    if (fast) { f.node.classList.add("is-flipped", "is-shown"); continue; }
    const big = f.card.tier === "legend" || f.card.tier === "secret";
    f.node.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
    await reveal(f, root, flash, !big);
    await wait(big ? 650 : f.card.tier === "epic" ? 180 : 70);
  }
  skip.remove();

  const fresh = cards.filter((c) => c.isNew).length;
  const by = (tr) => cards.filter((c) => c.tier === tr).length;
  const sum = el("p", `bopen-sum${fresh ? " has-new" : ""}`, t("bSummary")(fresh));
  const detail = el("p", "bopen-detail", t("bManyDetail")(cards.length, by("epic"), by("legend"), by("secret")));
  const close = el("button", "btn-primary", t("bDone"));
  close.type = "button";
  close.addEventListener("click", () => {
    root.classList.add("is-out");
    setTimeout(() => { root.remove(); document.documentElement.classList.remove("bopen-lock"); }, 320);
    opening = false;
    if (S.mode === "boosters") renderBoosters();
  });
  foot.append(sum, detail, close);
  close.focus({ preventScroll: true });
  if (fresh) sfx("win");
}

// A card in the row: its back, its face, its tag (new / duplicate) and the showcase button.
function cardSlot(card, i) {
  const node = el("div", `bcard tier-${card.tier}`);
  node.style.setProperty("--i", i);
  const inner = el("div", "bcard-inner");
  const back = el("div", "bcard-back");
  back.append(el("span", "bcard-back-mark", "✦"), el("i", "bcard-back-shine"));
  const front = el("div", "bcard-front");
  const face = PROFILE()?.card?.({ ...card }) ?? el("div");
  front.append(face);
  inner.append(back, front);
  const copies = PROFILE()?.copiesOf?.(card.g, card.id) ?? 1;
  const tag = el("span", `bcard-tag${card.isNew ? " is-new" : ""}`, card.isNew ? t("bNew") : `${t("bDupe")} ×${copies}`);
  const show = el("button", "bcard-show", PROFILE()?.inShowcase?.(card.g, card.id) ? t("bShowOn") : t("bShow"));
  show.type = "button";
  show.addEventListener("click", (e) => {
    e.stopPropagation();
    const on = PROFILE()?.toggleShowcase?.(card);
    show.textContent = on ? t("bShowOn") : t("bShow");
    show.classList.toggle("is-on", !!on);
    sfx("place");
  });
  node.append(inner, tag, show);
  return { node, card, flipped: false };
}

// The flip, louder for rarer cards: an epic bursts purple, a legendary flashes gold and shakes the screen,
// a secret one (a transformation) flashes every colour.
async function reveal(f, root, flash, fast = false) {
  const { node, card } = f;
  const big = card.tier === "legend" || card.tier === "secret";
  if (big) {
    // A beat of suspense: the back glows and trembles before it turns.
    node.classList.add("is-charging");
    sfx("rise", { dur: fast ? 0.3 : 0.6 });
    await wait(fast ? 320 : 650);
    node.classList.remove("is-charging");
  }
  node.classList.add("is-flipped");
  const r = node.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  if (card.tier === "common") sfx("place");
  else if (card.tier === "epic") { sfx("shimmer"); burst(x, y, { count: 34, spread: 200, color: "190, 120, 255" }); }
  else {
    sfx("impact");
    setTimeout(() => sfx("win"), 180);
    burst(x, y, { count: 70, spread: 320, gold: card.tier === "legend", color: card.tier === "secret" ? "120, 230, 255" : null });
    flash.style.background = card.tier === "secret" ? "linear-gradient(120deg, #ff4b6e, #ffd34d, #4bffb4, #4bb4ff, #c44bff)" : "radial-gradient(circle, #fff6c2, #ffc531 40%, transparent 75%)";
    flash.animate([{ opacity: 0 }, { opacity: 0.9 }, { opacity: 0 }], { duration: 700, easing: "ease-out" });
    root.animate([{ translate: "0 0" }, { translate: "-10px 6px" }, { translate: "8px -5px" }, { translate: "-4px 2px" }, { translate: "0 0" }], { duration: 360 });
  }
  setTimeout(() => node.classList.add("is-shown"), 500);
}
