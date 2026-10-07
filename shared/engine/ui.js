// Modals (arc, help, stats), menus, language, layout and starting a game.

import { S } from "./state.js";
import { $, $$, CFG, CHARS, COLS, colLabel, hash, isOnline, loadGame, play, saveSettings, settings, statsMode, t } from "./core.js";
import { currentStreak, stats } from "./stats.js";
import { el, esc } from "./dom.js";
import { renderBoard, renderCategories, renderHero, renderHints, renderResult, renderStatsBar, renderWeekly } from "./render.js";
import { closeSuggestions } from "./guess.js";
import { ensureRooms, renderRace, tryPendingJoin, updateRaceProfile } from "./race.js";
import { renderPlay } from "./play.js";

// ── Modals ──
let arcDraft = null;
export function openArcModal() {
  arcDraft = settings.arc ?? CFG.arcs.length - 1;
  renderArcGrid();
  $("#arcConfirm").textContent = settings.arc == null ? t("start") : t("save");
  $("#arcModal").showModal();
}

function renderArcGrid() {
  const grid = $("#arcGrid");
  grid.innerHTML = "";
  CFG.arcs.forEach((a, i) => {
    const b = el("button", `arc-card ${i <= arcDraft ? "is-included" : ""} ${i === arcDraft ? "is-selected" : ""}`);
    b.type = "button";
    b.setAttribute("aria-pressed", i === arcDraft);
    const count = CHARS.filter((c) => c.arc <= i).length;
    const eps = /^\d/.test(a.eps) ? `${t("eps")} ${a.eps}` : a.eps;
    b.innerHTML = `
      <span class="arc-num">${String(i + 1).padStart(2, "0")}</span>
      <span class="arc-name">${esc(a[settings.lang])}</span>
      <span class="arc-meta">${eps} · ${count} ${t("chars")}</span>`;
    b.addEventListener("click", () => { arcDraft = i; renderArcGrid(); });
    grid.append(b);
  });
}

function helpHtml() {
  const arrowCols = COLS.filter((c) => ["ordinal", "number", "arc"].includes(c.type)).map((c) => colLabel(c.key).toLowerCase());
  const hintNames = CFG.hints.map((h) => (h.type === "portrait" ? t("hintPortrait") : h.label[settings.lang]).toLowerCase());
  return t("help")({ anime: CFG.anime, arrowCols: arrowCols.join(", "), arcCol: colLabel("arc"), hintNames: hintNames.join(", ") });
}
function openHelp() {
  $("#helpBody").innerHTML = helpHtml();
  $("#helpModal").showModal();
}

function openStats() {
  const s = stats[statsMode()];
  const buckets = ["1", "2", "3", "4", "5", "6", "7-9", "10+"];
  const bucketOf = (n) => (n <= 6 ? String(n) : n <= 9 ? "7-9" : "10+");
  const dist = Object.fromEntries(buckets.map((b) => [b, 0]));
  for (const [n, c] of Object.entries(s.dist)) dist[bucketOf(Number(n))] += c;
  const max = Math.max(1, ...Object.values(dist));
  const bars = buckets
    .map((b) => `<div class="dist-row"><span>${b}</span><div class="dist-bar" style="--w:${(dist[b] / max) * 100}%"><b>${dist[b]}</b></div></div>`)
    .join("");
  $("#statsBody").innerHTML = `
    <p class="muted center">${CFG.brand} · ${t(statsMode() === "daily" ? "modeDaily" : "modeEndless")}</p>
    <div class="stats-grid">
      <div><b>${s.played}</b><span>${t("statsPlayed")}</span></div>
      <div><b>${s.wins}</b><span>${t("statsWins")}</span></div>
      <div><b>${currentStreak(statsMode())}</b><span>${t("statsStreak")}</span></div>
      <div><b>${s.max}</b><span>${t("statsMax")}</span></div>
    </div>
    <h3>${t("statsDist")}</h3>
    <div class="dist">${bars}</div>`;
  $("#statsModal").showModal();
}

export function bindUi() {
  $$("[data-lang]").forEach((b) => b.addEventListener("click", () => {
    settings.lang = b.dataset.lang;
    window.DLE_LANG.set(settings.lang);
    applyLang();
    window.dispatchEvent(new Event("dle:lang"));
    if ($("#arcModal").open) {
      renderArcGrid();
      $("#arcConfirm").textContent = settings.arc == null ? t("start") : t("save");
    }
  }));

  $$("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    if (settings.mode === b.dataset.mode) return;
    settings.mode = b.dataset.mode;
    saveSettings();
    if (isOnline()) ensureRooms();
    startGame();
  }));

  const actions = { arc: openArcModal, stats: openStats, help: openHelp };
  $$("[data-action]").forEach((b) => b.addEventListener("click", () => {
    toggleMenu(false);
    actions[b.dataset.action]();
  }));

  $("#menuBtn").addEventListener("click", (e) => { e.stopPropagation(); toggleMenu(); });
  document.addEventListener("click", (e) => { if (!e.target.closest("#menu")) toggleMenu(false); });

  $("#arcConfirm").addEventListener("click", () => {
    settings.arc = arcDraft;
    saveSettings();
    $("#arcModal").close();
    startGame();
    updateRaceProfile();
    tryPendingJoin();
    $("#searchInput").focus();
  });
  // The arc must be chosen before the first game.
  $("#arcModal").addEventListener("cancel", (e) => { if (settings.arc == null) e.preventDefault(); });

  $$("dialog").forEach((d) => {
    d.addEventListener("click", (e) => { if (e.target === d && !(d.id === "arcModal" && settings.arc == null)) d.close(); });
    $$("[data-close]", d).forEach((b) => b.addEventListener("click", () => d.close()));
  });
}

function toggleMenu(force) {
  const menu = $("#menu");
  const open = force ?? menu.hidden;
  menu.hidden = !open;
  $("#menuBtn").setAttribute("aria-expanded", open);
}

export function applyLang() {
  document.documentElement.lang = settings.lang;
  renderCategories();
  $$("[data-i18n]").forEach((n) => { const v = t(n.dataset.i18n); if (typeof v === "string") n.textContent = v; });
  $$("[data-i18n-aria]").forEach((n) => n.setAttribute("aria-label", t(n.dataset.i18nAria)));
  $$("[data-i18n-title]").forEach((n) => { n.title = t(n.dataset.i18nTitle); n.setAttribute("aria-label", n.title); });
  $$("[data-lang]").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === settings.lang));
  $("#searchInput").placeholder = t("placeholder")(CFG.example);
  $("#searchInput").setAttribute("aria-label", t("placeholder")(CFG.example));
  $("#footerText").textContent = CFG.footer[settings.lang];
  if ($("#helpModal").open) $("#helpBody").innerHTML = helpHtml();
  if (S.game || isOnline()) renderAll();
}

export function renderAll() {
  renderHero();
  renderStatsBar();
  renderRace();
  // Online without a race in progress: only the lobby is shown.
  const active = !!S.game;
  $(".guess-box").hidden = !active;
  $(".board-wrap").hidden = !active || play() !== "classic";
  renderPlay();
  if (!active) { $("#resultBanner").hidden = true; renderWeekly(); return; }
  renderBoard();
  renderHints();
  renderResult();
  renderWeekly();
}

export function startGame() {
  if (settings.arc == null) return;
  loadGame();
  closeSuggestions();
  $("#searchInput").value = "";
  $("#clearBtn").hidden = true;
  renderAll();
}

export function renderBackground() {
  const imgs = CHARS.filter((c) => c.image);
  // Only as many tiles as the rotated grid shows on this screen (fewer images to load and draw on a phone).
  const fit = Math.ceil((innerWidth * 1.4) / 126) * Math.ceil((innerHeight * 1.4) / 156) + 8;
  const order = [...imgs, ...imgs]
    .map((c, i) => ({ c, k: hash(`${c.id}:${i}`) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.c)
    .slice(0, Math.min(imgs.length * 2, fit));
  window.DLE_BG?.(order.map((c) => c.image));
}

export function setupLayout() {
  const widths = COLS.map((c) => (c.width ? `${c.width}px` : "var(--tile)")).join(" ");
  const narrow = COLS.map((c) => (c.width ? `${Math.round(c.width * 0.84)}px` : "var(--tile)")).join(" ");
  document.documentElement.style.setProperty("--cols", widths);
  document.documentElement.style.setProperty("--cols-narrow", narrow);
  // Phones: the portrait on the left, the clues on two lines next to it, so a whole guess fits the screen.
  document.documentElement.style.setProperty("--clue-cols", String(Math.ceil((COLS.length - 1) / 2)));
}
