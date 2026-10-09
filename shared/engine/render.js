// Drawing the page: header, board, hints, hero, weekly results, result banner, sharing, toasts.

import { S } from "./state.js";
import { $, $$, CFG, COLS, FLIP_STEP, GAMES, ROOT, UI, addDays, arcName, auraOf, colLabel, dateKey, dayNumber, isOnline, play, randomTarget, saveGame, settings, statsMode, t, tv, view } from "./core.js";
import { currentStreak, recordGiveUp, stats } from "./stats.js";
import { cellText, compare } from "./compare.js";
import { ICONS, arrow, el, esc, thumb } from "./dom.js";
import { renderAll, startGame } from "./ui.js";
import { clock, raceProgress, raceRanking, rooms, teamOutcomeHtml } from "./race.js";
import { renderPlay, renderPlayTabs } from "./play.js";

// ── Header: categories ──
export function renderCategories() {
  const nav = $("#categories");
  nav.innerHTML = GAMES.map((g) => {
    const current = g.id === CFG.id;
    return `<a class="cat ${current ? "is-current" : ""}" href="${ROOT}${g.path}" title="${esc(g.brand)}" ${current ? 'aria-current="page"' : ""}>
      <span class="cat-logo"><img src="${ROOT}${g.logo}" alt="" onerror="this.onerror=null;this.src='${ROOT}assets/logos/placeholder.svg'" /></span>
      <span class="cat-name">${esc(g.brand)}</span></a>`;
  }).join("") + window.DLE_CREW_LINK(ROOT, t("crew"));
}

// ── Board ──
export function renderHead() {
  const head = $("#boardHead");
  head.innerHTML = "";
  for (const col of COLS) head.append(el("div", `col col-${col.key}`, esc(colLabel(col.key))));
  head.hidden = S.game.guesses.length === 0;
}

export function renderRow(id, animate) {
  const g = view(id);
  const res = compare(g, view(S.game.target));
  const row = el("div", "row");
  COLS.forEach((col, i) => {
    const { status, dir } = res[col.key];
    const tile = el("div", `tile tile-${col.type === "name" ? `name${auraOf(id)}` : col.key} is-${status}`);
    const dirWord = dir ? (dir === "up" ? " ▲" : " ▼") : "";
    tile.setAttribute("aria-label", `${colLabel(col.key)}: ${cellText(col, g)}${dirWord} (${t(status)})`);
    if (col.type !== "name") tile.dataset.label = colLabel(col.key); // shown on phones, where the header row is hidden
    tile.innerHTML = col.type === "name"
      ? `<img src="${esc(g.image)}" srcset="${esc(window.DLE_THUMB(g.image))} 160w, ${esc(g.image)} 320w" sizes="96px" onerror="this.onerror=null;this.removeAttribute('srcset')" alt="" loading="lazy" /><span class="tile-caption">${esc(g.name)}</span>`
      : `<span class="tile-text">${esc(cellText(col, g))}</span>${arrow(dir)}`;
    if (animate) {
      tile.classList.add("flip");
      tile.style.animationDelay = `${i * FLIP_STEP}ms`;
      // Each tile sounds its colour as it flips in.
      setTimeout(() => window.DLE_FX?.play(status), i * FLIP_STEP + 120);
    }
    row.append(tile);
  });
  // Turn by turn: who made this guess.
  const by = S.race?.turns && S.race.by.get(id);
  if (by) row.append(el("span", `row-by${by === rooms.selfId ? " is-me" : ""}`, esc(S.race.players.get(by)?.name ?? "?")));
  return row;
}

export function renderBoard() {
  renderHead();
  const rows = $("#boardRows");
  rows.innerHTML = "";
  for (const id of [...S.game.guesses].reverse()) rows.append(renderRow(id, false));
}

export function renderHints() {
  const box = $("#hints");
  box.innerHTML = "";
  const n = S.game.guesses.length;
  const tg = view(S.game.target);
  box.hidden = play() !== "classic";
  (play() === "classic" ? CFG.hints : []).forEach((h, i) => {
    const id = h.key ?? h.type;
    const unlocked = n >= h.at || S.game.status !== "playing";
    const revealed = S.game.revealed[id];
    const isPortrait = h.type === "portrait";
    const label = isPortrait ? t("hintPortrait") : h.label[settings.lang];
    const btn = el("button", `hint ${unlocked ? "is-unlocked" : ""} ${revealed ? "is-revealed" : ""}`);
    btn.type = "button";
    btn.disabled = !unlocked || revealed;
    let body;
    if (revealed) {
      body = isPortrait
        ? `<span class="hint-portrait">${thumb(tg.image)}</span>`
        : `<strong>${esc(h.value ? h.value(tg, UI[settings.lang]) : tv(tg[h.key]))}</strong>`;
    } else {
      body = `<small>${unlocked ? t("hintReveal") : t("hintIn")(h.at - n)}</small>`;
    }
    btn.innerHTML = `${ICONS[isPortrait ? "person" : h.icon] ?? ICONS.shield}<span class="hint-label">${esc(label)}</span>${body}`;
    btn.addEventListener("click", () => {
      S.game.revealed[id] = true;
      saveGame();
      renderHints();
    });
    box.append(btn);
  });
  $("#guessCount").textContent = n ? t("guesses")(n) : "";
}

export function renderStatsBar() {
  $("#statStreak").textContent = currentStreak(statsMode());
  $("#statWins").textContent = stats[statsMode()].wins;
  $("#statArc").textContent = settings.arc == null ? "-" : settings.arc + 1;
}

export function renderHero() {
  $("#heroTitle").textContent = CFG.heroTitle;
  $("#heroSub").textContent = t(isOnline() ? "subOnline" : play() === "blur" ? "subBlur" : play() === "desc" ? "subDesc" : settings.mode === "daily" ? "subDaily" : "subEndless");
  renderPlayTabs();
  $("#arcChipName").textContent = settings.arc == null ? "-" : arcName(settings.arc);
  $$(".mode-tabs [data-mode]").forEach((b) => {
    const on = b.dataset.mode === settings.mode;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-selected", on);
  });
}

export function renderWeekly() {
  const box = $("#weekly");
  const today = new Date();
  const start = addDays(today, -today.getDay());
  const days = t("days");
  let sum = 0, count = 0, cells = "";
  for (let i = 0; i < 7; i++) {
    const key = dateKey(addDays(start, i));
    const v = stats.history[key];
    if (v != null) { sum += v; count++; }
    const isToday = key === dateKey(today);
    cells += `<div class="wk-day ${isToday ? "is-today" : ""}"><span>${days[i]}</span><b class="${v != null ? "has" : ""}">${v ?? "-"}</b></div>`;
  }
  const foot = count ? t("weeklyAvg")((sum / count).toFixed(1)) : t("weeklyEmpty");
  box.innerHTML = `<h3>${t("weeklyTitle")}</h3><div class="wk-grid">${cells}</div><p class="muted">${foot}</p>`;
}

function shareText() {
  const emoji = { correct: "🟩", partial: "🟧", wrong: "🟥" };
  const tg = view(S.game.target);
  if (play() !== "classic") {
    const variant = t(play() === "blur" ? "playBlur" : "playDesc");
    const head = isOnline() ? `${CFG.brand} · ${t("modeOnline")}` : settings.mode === "daily" ? `${CFG.brand} #${dayNumber()}` : `${CFG.brand} ∞`;
    const line = S.game.guesses.map((id) => (id === S.game.target ? "🟩" : "🟥")).join("");
    return `${head} · ${variant} · ${arcName(settings.arc)} · ${S.game.status === "won" ? t("guesses")(S.game.guesses.length) : "X"}\n${line}`;
  }
  const lines = S.game.guesses.map((id) => {
    const r = compare(view(id), tg);
    return COLS.map((c) => emoji[r[c.key].status]).join("");
  });
  const shown = lines.length > 8 ? [...lines.slice(0, 7), "…", lines[lines.length - 1]] : lines;
  const title = isOnline() ? `${CFG.brand} · ${t("modeOnline")}` : settings.mode === "daily" ? `${CFG.brand} #${dayNumber()}` : `${CFG.brand} ∞`;
  const result = S.game.status === "won" ? t("guesses")(S.game.guesses.length) : "X";
  return `${title} · ${arcName(settings.arc)} · ${result}\n${shown.join("\n")}`;
}

let countdownTimer = null;
export function renderResult() {
  const banner = $("#resultBanner");
  const form = $("#searchForm");
  clearInterval(countdownTimer);
  if (isOnline() && S.game.status !== "playing") return renderRaceResult(banner, form);
  if (S.game.status === "playing") {
    banner.hidden = true;
    form.hidden = false;
    renderGiveUp();
    return;
  }
  form.hidden = true;
  $("#giveUp")?.remove();
  const tg = view(S.game.target);
  const won = S.game.status === "won";
  const next = settings.mode === "daily"
    ? `<p class="countdown-label">${t("nextIn")}</p><p class="countdown" id="countdown">--:--:--</p>`
    : `<button class="btn-primary" type="button" id="nextBtn">${t("nextChar")}</button>`;
  banner.innerHTML = `
    <div class="result-portrait ${won ? "is-won" : ""}${auraOf(tg.id)}"><img src="${esc(tg.image)}" alt="${esc(tg.name)}" /></div>
    <div class="result-body">
      <p class="result-kicker">${won ? t("winTitle") : t("giveUpTitle")}</p>
      <h2 class="result-name">${esc(tg.name)}</h2>
      ${won ? `<p class="muted">${t("winLine")(S.game.guesses.length)}</p>` : ""}
      <div class="result-actions">
        <button class="btn-ghost" type="button" id="shareBtn">${t("share")}</button>
      </div>
      ${next}
    </div>`;
  banner.hidden = false;
  $("#shareBtn").addEventListener("click", copyShare);
  if (settings.mode === "daily") {
    const tick = () => {
      const ms = addDays(new Date(), 1).getTime() - Date.now();
      if (ms <= 0) { clearInterval(countdownTimer); startGame(); return; }
      const s = Math.floor(ms / 1000);
      const node = $("#countdown");
      if (node) node.textContent = [s / 3600, (s % 3600) / 60, s % 60].map((x) => String(Math.floor(x)).padStart(2, "0")).join(":");
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  } else {
    $("#nextBtn").addEventListener("click", () => {
      S.game = { target: randomTarget(S.game.target), guesses: [], status: "playing", revealed: {} };
      saveGame();
      renderAll();
      $("#searchInput").focus();
    });
  }
}

function renderRaceResult(banner, form) {
  form.hidden = true;
  $("#giveUp")?.remove();
  const tg = view(S.game.target);
  const won = S.game.status === "won";
  const me = S.race.players.get(rooms.selfId);
  const place = raceRanking().filter((p) => p.found).findIndex((p) => p.id === me.id) + 1;
  banner.innerHTML = `
    <div class="result-portrait ${won ? "is-won" : ""}${auraOf(tg.id)}"><img src="${esc(tg.image)}" alt="${esc(tg.name)}" /></div>
    <div class="result-body">
      <p class="result-kicker">${won ? t("winTitle") : S.race.turns ? t("turnOver") : t("giveUpTitle")}</p>
      <h2 class="result-name">${esc(tg.name)}</h2>
      ${S.race.turns ? `<p class="muted">${esc(S.race.winner ? (S.race.winner === me.id ? t("turnYouFound")(S.game.guesses.length) : t("turnFoundBy")(S.race.players.get(S.race.winner)?.name ?? "?", S.game.guesses.length)) : t("turnNobody"))}</p>`
        : won ? `<p class="muted">${t("raceWon")(place, S.game.guesses.length, clock(me.ms ?? 0))}</p>` : ""}
      ${S.race.teams && S.race.done ? teamOutcomeHtml() : ""}
      <p class="muted">${S.race.done ? "" : esc(t("raceWait"))}</p>
    </div>`;
  banner.hidden = false;
}

export function renderGiveUp() {
  const existing = $("#giveUp");
  const canGiveUp = settings.mode === "endless" || (isOnline() && S.race && !S.race.done && !S.race.turns);
  if (!canGiveUp || S.game.guesses.length === 0) { existing?.remove(); return; }
  if (existing) { existing.textContent = t("giveUp"); return; }
  const b = el("button", "link-btn", esc(t("giveUp")));
  b.id = "giveUp";
  b.type = "button";
  b.addEventListener("click", () => {
    S.game.status = "lost";
    window.DLE_FX?.play("lose");
    renderPlay();
    if (isOnline()) { renderAll(); raceProgress(); return; }
    saveGame();
    recordGiveUp();
    renderAll();
  });
  $(".guess-box").append(b);
}

async function copyShare() {
  const text = shareText();
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = el("textarea");
    ta.value = text;
    document.body.append(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  toast(t("copied"));
}

let toastTimer;
export function toast(msg) {
  const node = $("#toast");
  node.textContent = msg;
  node.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (node.hidden = true), 1800);
}

export function burst() {
  const layer = el("div", "burst");
  for (let i = 0; i < 46; i++) {
    const p = el("i");
    const a = Math.random() * Math.PI * 2;
    const d = 140 + Math.random() * 260;
    p.style.setProperty("--x", `${Math.cos(a) * d}px`);
    p.style.setProperty("--y", `${Math.sin(a) * d - 80}px`);
    p.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
    p.style.animationDelay = `${Math.random() * 120}ms`;
    if (i % 3 === 0) p.className = "alt";
    layer.append(p);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 1600);
}
