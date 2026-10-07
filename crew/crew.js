// Crew Roll: pick an anime, roll random characters and place each one in a slot of your crew.
// Each placement scores 1–10; the crew's score is the average of its slots.
// Solo mode, plus an online 1v1: two ready players get the same character each round and race
// for the better crew. Players connect directly (WebRTC via Trystero), like the online bar.

import { S } from "./parts/state.js";
import { T } from "./parts/text.js";
import { $, GAMES, ROOT, displayName, el, filledOf, loadGame, makePool, openSlots, pointsFor, t, toast } from "./parts/base.js";
import { formFor, subtitleOf } from "./parts/fx.js";
import { renderArcChip, renderPicker, selectGame } from "./parts/picker.js";
import { renderSolo, renderSoloActions, solo, soloCandidates, soloRoll, startSolo } from "./parts/solo.js";
import { ensureRooms, renderLobby, rooms } from "./parts/lobby.js";
import { renderMatch, renderScoreboard } from "./parts/match.js";
import { renderIndex } from "./parts/index-view.js";
import { renderBoosters } from "./parts/boosters.js";

// The Boosters tab shows how many packs wait.
function renderBoostTab() {
  const b = document.querySelector('.crew-mode [data-mode="boosters"]');
  if (!b) return;
  const n = window.DLE_Profile?.boosters?.() ?? 0;
  b.textContent = t("boosters");
  if (n) b.append(el("span", "boost-tab-n", String(n)));
}
window.addEventListener("dle:boosters", () => { renderBoostTab(); if (S.mode === "boosters" && !document.querySelector(".bopen")) renderBoosters(); });
window.addEventListener("dle:profile", renderBoostTab);
// Links from the profile and the booster toast (#boosters, #index) switch the mode on this page too.
window.addEventListener("hashchange", () => {
  const m = location.hash.slice(1);
  if (m === "boosters" || m === "index") setMode(m);
});

// ── Modes ──
export function setMode(m) {
  S.mode = m;
  document.querySelectorAll(".crew-mode [data-mode]").forEach((b) => {
    const on = b.dataset.mode === m;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-selected", on);
  });
  $("#soloView").hidden = m !== "solo";
  $("#duelView").hidden = m !== "online";
  $("#indexView").hidden = m !== "index";
  $("#boostView").hidden = m !== "boosters";
  if (m === "online") { ensureRooms(); if (S.match) renderMatch(); else renderLobby(); }
  else {
    if (rooms?.myRoom && !S.match) rooms.leave();
    if (m === "solo" && S.currentGame && !solo) startSolo();
    if (m === "index" && S.currentGame) renderIndex();
    if (m === "boosters") renderBoosters();
  }
  renderPicker();
  renderBoostTab();
  window.dispatchEvent(new Event("dle:admin-refresh"));
}

// ── Header & language ──
function renderCategories() {
  const nav = $("#categories");
  nav.textContent = "";
  for (const g of GAMES) {
    const a = el("a", "cat");
    a.href = ROOT + g.path;
    a.title = g.brand;
    const logo = el("span", "cat-logo");
    const img = el("img");
    img.src = ROOT + g.logo;
    img.alt = "";
    logo.append(img);
    a.append(logo, el("span", "cat-name", g.brand));
    nav.append(a);
  }
  nav.insertAdjacentHTML("beforeend", window.DLE_CREW_LINK(ROOT, T[S.lang].title));
  const crew = nav.querySelector(".cat-crew");
  crew.classList.add("is-current");
  crew.setAttribute("aria-current", "page");
}

function applyLang() {
  document.documentElement.lang = S.lang;
  $("#crewTitle").textContent = t("title");
  $("#crewSub").textContent = t("sub");
  $("#crewPickLabel").textContent = t("pick");
  $("#crewModeLabel").textContent = t("modeLabel");
  $("#crewArcLabel").textContent = t("arcLabel");
  const sunny = el("img");
  sunny.src = `${ROOT}assets/logos/sunny.webp`;
  sunny.alt = "";
  $("#crewBrandIcon").replaceChildren(sunny);
  $("#crewScoreLabel").textContent = t("score");
  document.querySelectorAll(".crew-mode [data-mode]").forEach((b) => (b.textContent = t(b.dataset.mode)));
  renderBoostTab();
  document.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === S.lang));
}

// Names can differ per language (Dragon Ball's French dub).
async function relabel() {
  if (!S.currentGame) return;
  await renderArcChip();
  const { config } = await loadGame(S.currentGame);
  for (const pool of [solo?.pool, S.match?.pool]) for (const c of pool ?? []) c.name = displayName(config, c.baseName);
  if (S.mode === "solo" && solo && !solo.rolling) renderSolo(false);
  if (S.mode === "index") renderIndex();
  if (S.mode === "online") { if (S.match) renderScoreboard(); else renderLobby(); }
}

document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => {
  S.lang = b.dataset.lang;
  window.DLE_LANG.set(S.lang);
  renderCategories();
  applyLang();
  window.dispatchEvent(new Event("dle:lang"));
  relabel();
}));
document.querySelectorAll(".crew-mode [data-mode]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));

// ── Admin panel hooks (shared/admin.js) ──
const soloIdle = () => S.mode === "solo" && solo && !solo.rolling && !solo.placing;
window.CREW_ADMIN = {
  get game() { return S.currentGame; },
  get solo() { return S.mode === "solo" ? solo : null; },
  forms: () => Object.keys(window.CREW_FORMS?.[S.currentGame?.id] ?? {}),
  roll(id) {
    if (!soloIdle() || solo.done) return false;
    const pick = solo.pool.find((c) => c.id === id);
    if (!pick || filledOf(solo.slots).some((s) => s.char.id === id)) return false;
    soloRoll(false, pick);
    return true;
  },
  rerolls(n = 99) { if (!soloIdle()) return; solo.rerolls += n; renderSoloActions(); },
  // Fills every open place: with the best character for it, or at random.
  fill(best = true) {
    if (!soloIdle() || solo.done) return;
    solo.rolled = null;
    for (const slot of openSlots(solo.slots)) {
      const used = new Set(filledOf(solo.slots).map((s) => s.char.id));
      const fits = solo.pool.filter((c) => !used.has(c.id) && slot.def.fits(c));
      if (!fits.length) continue;
      const c = best ? fits.reduce((a, b) => (pointsFor(slot, b) > pointsFor(slot, a) ? b : a)) : fits[Math.floor(Math.random() * fits.length)];
      slot.char = c;
      slot.points = pointsFor(slot, c);
    }
    if (!openSlots(solo.slots).length || !soloCandidates().length) solo.done = true;
    renderSolo(false);
  },
  finish() { if (soloIdle() && !solo.done) { solo.rolled = null; solo.done = true; renderSolo(false); } },
  restart() { if (S.currentGame && S.mode === "solo") startSolo(); },
  // A transformation cinematic on its own, whatever the player's arc (`late`: the later look, when there is one).
  async cinema(id, late = false) {
    const g = S.currentGame;
    const f = window.CREW_FORMS?.[g?.id]?.[id];
    if (!f) return;
    const data = await loadGame(g);
    const c = makePool(g, data, data.config.arcs.length - 1).find((x) => x.id === id);
    const form = c && formFor(g.id, c, late && f.next ? f.next.arc : f.arc);
    if (form) await window.CREW_CINEMA?.play({ form, char: c, sub: subtitleOf(c) });
  },
};

renderCategories();
applyLang();
let saved = null;
try { saved = localStorage.getItem("dle:crew-game"); } catch {}
S.currentGame = GAMES.find((g) => g.id === saved) ?? GAMES.find((g) => g.id === "onepiece");
const joinHash = location.hash.match(/^#join=(.+)$/);
if (joinHash) {
  const key = decodeURIComponent(joinHash[1]).slice(0, 64);
  S.pendingJoin = key;
  // Give up after a while if the host is gone.
  setTimeout(() => { if (S.pendingJoin === key && !rooms?.myRoom) { S.pendingJoin = null; toast(t("linkGone")); renderLobby(); } }, 25000);
}
let backToMatch = false;
try { backToMatch = !!sessionStorage.getItem("dle:rejoin:crew"); } catch {}
S.mode = location.hash === "#online" || joinHash || backToMatch ? "online" : location.hash === "#index" ? "index" : location.hash === "#boosters" ? "boosters" : "solo";
setMode(S.mode);
selectGame(S.currentGame.id);
