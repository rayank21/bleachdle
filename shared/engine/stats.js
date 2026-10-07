// Statistics: games played, wins, streaks, guesses per win.

import { addDays, dateKey, play, settings, store } from "./core.js";

// ── Stats ──
export const emptyStats = () => ({ played: 0, wins: 0, streak: 0, max: 0, last: null, dist: {} });
export const stats = Object.assign({ daily: emptyStats(), endless: emptyStats(), online: emptyStats(), history: {} }, store.get("stats", {}));
export const saveStats = () => { store.set("stats", stats); window.dispatchEvent(new Event("dle:stats")); }; // the profile syncs on this event

export function currentStreak(mode) {
  const s = stats[mode];
  if (mode === "endless") return s.streak;
  const ok = s.last === dateKey() || s.last === dateKey(addDays(new Date(), -1));
  return ok ? s.streak : 0;
}

export function recordStart() {
  stats[settings.mode].played++;
  saveStats();
}

export function recordWin(n) {
  const s = stats[settings.mode];
  s.wins++;
  s.dist[n] = (s.dist[n] || 0) + 1;
  if (settings.mode === "daily") {
    const today = dateKey();
    if (s.last !== today) {
      s.streak = s.last === dateKey(addDays(new Date(), -1)) ? s.streak + 1 : 1;
      s.last = today;
    }
    if (!(today in stats.history) && play() === "classic") stats.history[today] = n;
  } else {
    s.streak++;
  }
  s.max = Math.max(s.max, s.streak);
  saveStats();
  window.DLE_Profile?.earnBooster?.(1, "win"); // every win gives a Crew Roll booster
}

export function recordGiveUp() {
  stats.endless.streak = 0;
  saveStats();
}
