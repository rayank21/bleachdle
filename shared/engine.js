// Shared game engine. Each category page loads its data (DLE_CHARACTERS) and config (DLE_CONFIG) first.

import { S } from "./engine/state.js";
import { CFG, addDays, byId, dailyTarget, gameKey, isOnline, play, pool, saveGame, saveSettings, settings, store, targetPool, view } from "./engine/core.js";
import { emptyStats, saveStats, stats } from "./engine/stats.js";
import { renderCategories, renderHero, renderStatsBar, renderWeekly } from "./engine/render.js";
import { bindSearch, submitGuess } from "./engine/guess.js";
import { applyLang, bindUi, openArcModal, renderAll, renderBackground, setupLayout, startGame } from "./engine/ui.js";
import { ensureRooms } from "./engine/race.js";
import { setupPlay } from "./engine/play.js";

// ── Admin panel hooks (shared/admin.js) ──
window.DLE_GAME = {
  config: CFG,
  get game() { return S.game; },
  get settings() { return { ...settings }; },
  get online() { return isOnline(); },
  play,
  view,
  pool: () => targetPool().map((c) => view(c.id)),
  // The character of the day in `days` days (negative: past days), for the current arc and variant.
  dailyFor: (days) => dailyTarget(addDays(new Date(), days)),
  setTarget(id) {
    if (isOnline() || !byId.has(id)) return false;
    S.game = { target: id, guesses: [], status: "playing", revealed: {} };
    saveGame();
    renderAll();
    return true;
  },
  win() { if (S.game?.status === "playing") submitGuess(S.game.target); },
  // n wrong guesses, one after the other (to watch the hints, the blur and the clues unlock).
  wrong(n = 1) {
    const left = pool().filter((c) => c.id !== S.game?.target && !S.game?.guesses.includes(c.id)).sort(() => Math.random() - 0.5).slice(0, n);
    left.forEach((c, i) => setTimeout(() => { if (S.game?.status === "playing") submitGuess(c.id); }, i * 300));
  },
  reset() { if (isOnline()) return; store.set(gameKey(), null); startGame(); },
  setArc(i) { settings.arc = i; saveSettings(); startGame(); },
  resetStats() {
    Object.assign(stats, { daily: emptyStats(), endless: emptyStats(), online: emptyStats(), history: {} });
    saveStats();
    renderAll();
  },
};

// ── Boot ──
setupPlay();
setupLayout();
renderCategories();
renderBackground();
bindUi();
bindSearch();
if (isOnline()) ensureRooms();
applyLang();
if (settings.arc == null) {
  renderHero();
  renderStatsBar();
  renderWeekly();
  openArcModal();
} else {
  startGame();
}
