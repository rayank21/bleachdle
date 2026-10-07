// The index: every card of the anime, its rarity, power and scores per role.

import { S } from "./state.js";
import { $, CREW, ROLE_RGB, ROOT, el, icon, loadGame, makePool, playerArc, pointsFor, t } from "./base.js";
import { formFor, tierOf } from "./fx.js";

// ════════════════════ INDEX ════════════════════
// Every card of the anime at the player's arc: its rarity, its power and what it scores in each role.
const ix = { tier: "all", sort: "power", q: "", own: "all" };
let ixToken = 0;

export async function renderIndex() {
  const g = S.currentGame;
  const token = ++ixToken;
  const data = await loadGame(g);
  if (token !== ixToken || S.mode !== "index") return;
  const last = data.config.arcs.length - 1;
  const arc = playerArc(data.config) ?? last;
  const roles = CREW[g.id].slots;
  const cards = makePool(g, data, arc).map((c) => {
    const scores = roles.map((def) => (def.fits(c) ? pointsFor({ def }, c) : null));
    const top = Math.max(...scores.filter((x) => x != null));
    return { c, tier: tierOf(c.power), scores, best: scores.indexOf(top), form: formFor(g.id, c, arc) };
  });

  const view = $("#indexView");
  view.textContent = "";

  // Header: the anime, the cards by rarity, and the anime's best crews.
  const hero = el("section", "card ix-hero");
  const head = el("div", "ix-head");
  const logo = el("img", "ix-logo");
  logo.src = ROOT + g.logo;
  logo.alt = "";
  const titles = el("div", "ix-titles");
  titles.append(el("h2", "ix-title", t("indexTitle")(g.anime)), el("p", "muted ix-sub", t("indexSub")(cards.length, arc < last ? data.config.arcs[arc][S.lang] : null)));
  head.append(logo, titles);
  const tiers = el("div", "ix-tiers");
  for (const tr of ["all", "legend", "epic", "common"]) {
    const n = tr === "all" ? cards.length : cards.filter((x) => x.tier === tr).length;
    const b = el("button", `ix-tier-pill tier-${tr}${ix.tier === tr ? " is-active" : ""}`);
    b.type = "button";
    b.append(el("span", null, tr === "all" ? t("allTiers") : t("tiers")[tr]), el("b", null, String(n)));
    b.addEventListener("click", () => { ix.tier = tr; tiers.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b)); drawGrid(); });
    tiers.append(b);
  }
  // Collection: the cards this player has drawn.
  const owned = window.DLE_Profile?.collectionOf?.(g.id) ?? new Set();
  const have = cards.filter((x) => owned.has(x.c.id)).length;
  const coll = el("div", "ix-coll");
  const collBar = el("span", "ix-coll-bar");
  const collFill = el("i");
  collFill.style.width = `${(have / Math.max(1, cards.length)) * 100}%`;
  collBar.append(collFill);
  coll.append(el("b", null, t("collection")(have, cards.length)), collBar);
  const own = el("div", "ix-own");
  for (const k of ["all", "yes", "no"]) {
    const b = el("button", `ix-own-btn${ix.own === k ? " is-active" : ""}`, t(k === "all" ? "ownAll" : k === "yes" ? "ownYes" : "ownNo"));
    b.type = "button";
    b.addEventListener("click", () => { ix.own = k; own.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b)); drawGrid(); });
    own.append(b);
  }
  coll.append(own);
  const left = el("div", "ix-hero-main");
  left.append(head, tiers, coll);
  hero.append(left, ixTopCrews(g, token));
  view.append(hero);

  // Tools: search and sort (by power, by name or by a role).
  const tools = el("div", "card ix-tools");
  const search = el("input", "ix-search");
  search.type = "search";
  search.placeholder = t("indexSearch");
  search.value = ix.q;
  search.addEventListener("input", () => { ix.q = search.value; drawGrid(); });
  const sorts = el("div", "ix-sorts");
  sorts.append(el("span", "crew-setting-label", t("indexSort")));
  const sortBtn = (key, content, title, def) => {
    const b = el("button", `ix-sort${ix.sort === key ? " is-active" : ""}`);
    b.type = "button";
    b.title = title;
    b.dataset.sort = key;
    if (def) setRoleColor(b, def);
    b.append(content);
    b.addEventListener("click", () => { ix.sort = key; sorts.querySelectorAll(".ix-sort").forEach((x) => x.classList.toggle("is-active", x === b)); drawGrid(); });
    sorts.append(b);
  };
  sortBtn("power", t("sortPower"), t("sortPower"));
  sortBtn("name", t("sortName"), t("sortName"));
  roles.forEach((def, i) => {
    const content = el("span", "ix-sort-role");
    content.append(icon(def.icon), el("span", null, def.label[S.lang]));
    sortBtn(`role${i}`, content, def.label[S.lang], def);
  });
  if (!/^(power|name)$/.test(ix.sort) && !roles[+ix.sort.slice(4)]) ix.sort = "power";
  tools.append(search, sorts);
  view.append(tools);

  const grid = el("div", "ix-grid");
  view.append(grid);

  function drawGrid() {
    const q = ix.q.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const r = ix.sort.startsWith("role") ? +ix.sort.slice(4) : -1;
    const list = cards
      .filter((x) => ix.tier === "all" || x.tier === ix.tier)
      .filter((x) => ix.own === "all" || owned.has(x.c.id) === (ix.own === "yes"))
      .filter((x) => !q || `${x.c.name} ${x.c.baseName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q))
      .sort((a, b) => (ix.sort === "name" ? a.c.name.localeCompare(b.c.name)
        : r >= 0 ? (b.scores[r] ?? -1) - (a.scores[r] ?? -1) || b.c.power - a.c.power || a.c.name.localeCompare(b.c.name)
        : b.c.power - a.c.power || a.c.name.localeCompare(b.c.name)));
    grid.textContent = "";
    if (!list.length) { grid.append(el("p", "muted ix-empty", t("noCard"))); return; }
    list.forEach((x, n) => grid.append(ixCard(x, roles, r, n, owned.has(x.c.id))));
  }
  drawGrid();
}

function setRoleColor(node, def) {
  const rgb = ROLE_RGB[def.icon];
  if (rgb) { node.style.setProperty("--role-rgb", rgb[0]); node.style.setProperty("--role2-rgb", rgb[1]); }
}

function ixCard({ c, tier, scores, best, form }, roles, sorted, n, mine = true) {
  const card = el("article", `ix-card tier-${tier}${mine ? "" : " is-locked"}`);
  if (n < 40) card.style.animationDelay = `${n * 18}ms`;
  const top = el("div", "ix-top");
  const img = el("img", "ix-face");
  img.loading = "lazy";
  img.decoding = "async";
  img.src = c.image;
  img.alt = "";
  top.append(img, el("span", "ix-tier", t("tiers")[tier]), el("span", "ix-power", String(c.power)));
  if (!mine) top.append(el("span", "ix-lock", `🔒 ${t("notDrawn")}`));
  // A transformation: tap the portrait to see it.
  if (form) {
    const tag = el("button", "ix-form", `⚡ ${form.name[S.lang]}`);
    tag.type = "button";
    tag.title = t("ixTap");
    tag.style.setProperty("--fx1", form.c1);
    tag.style.setProperty("--fx2", form.c2);
    tag.addEventListener("click", () => {
      const on = card.classList.toggle("is-form");
      img.src = on ? form.image : c.image;
    });
    top.append(tag);
  }
  card.append(top, el("h3", "ix-name", c.name));
  const list = el("ul", "ix-roles");
  roles.forEach((def, i) => {
    const v = scores[i];
    const li = el("li", `ix-role${v == null ? " is-no" : ""}${i === best ? " is-best" : ""}${i === sorted ? " is-sorted" : ""}`);
    setRoleColor(li, def);
    li.title = v == null ? `${def.label[S.lang]} · ${t("noFit")}` : `${def.label[S.lang]} · ${v}${i === best ? ` · ${t("bestRole")}` : ""}`;
    const ic = el("span", "ix-ic");
    ic.append(icon(def.icon));
    const bar = el("span", "ix-bar");
    const fill = el("i");
    fill.style.width = `${v == null ? 0 : Math.min(100, v * 10)}%`;
    bar.append(fill);
    li.append(ic, el("span", "ix-label", def.label[S.lang]), bar, el("b", `ix-pts${v == null ? "" : ` p${Math.min(10, Math.round(v))}`}`, v == null ? "–" : String(v)));
    list.append(li);
  });
  card.append(list);
  return card;
}

// The anime's best crews from the online leaderboard.
function ixTopCrews(g, token) {
  const box = el("div", "ix-top-crews");
  box.append(el("h3", "ix-top-h", t("ixTop")));
  const list = el("ol", "ix-top-list");
  list.append(el("li", "muted ix-top-wait", "…"));
  box.append(list);
  const more = el("button", "btn-ghost ix-top-more", t("ixBoard"));
  more.type = "button";
  more.addEventListener("click", () => window.DLE_Profile?.open("board", { anime: g.id }));
  box.append(more);
  const profile = window.DLE_Profile;
  if (!profile?.leaderboard) { box.hidden = true; return box; }
  profile.leaderboard().then((data) => {
    if (token !== ixToken) return;
    const rows = (data.byAnime?.[g.id] ?? []).slice(0, 5);
    list.textContent = "";
    if (!rows.length) { list.append(el("li", "muted ix-top-wait", t("ixNone"))); return; }
    rows.forEach((r, i) => {
      const li = el("li", `ix-top-li top-${i + 1}`);
      const who = el("span", "ix-top-who");
      who.append(el("b", null, r.name));
      const faces = profile.crewFaces(r);
      if (faces) who.append(faces);
      const val = el("span", "pf-val");
      val.append(el("i", `pf-mini-rank rank-${r.rank}`, r.rank), ` ${r.score.toFixed(1)}`);
      li.append(el("span", "ix-top-pos", String(i + 1)), who, val);
      list.append(li);
    });
  }).catch(() => { box.hidden = true; });
  return box;
}
