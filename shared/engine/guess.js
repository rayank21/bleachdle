// Guessing and the name autocomplete.

import { S } from "./state.js";
import { $, COLS, FLIP_STEP, auraOf, isOnline, nameOf, normalize, play, pool, saveGame, t } from "./core.js";
import { recordStart, recordWin } from "./stats.js";
import { el, esc, thumb } from "./dom.js";
import { burst, renderGiveUp, renderHead, renderHints, renderResult, renderRow, renderStatsBar, renderWeekly, toast } from "./render.js";
import { myTurn, raceProgress, sendTurnGuess, turnOwnerName } from "./race.js";
import { renderPlay } from "./play.js";

// ── Guessing ──
export function submitGuess(id) {
  if (S.game.status !== "playing" || S.game.guesses.includes(id)) return;
  if (isOnline() && (!S.race || !S.race.startedAt || S.race.done)) return;
  // Turn by turn: only the player whose turn it is guesses.
  if (isOnline() && S.race.turns && !myTurn()) { toast(t("notYourTurn")(turnOwnerName())); return; }
  if (!isOnline() && S.game.guesses.length === 0) recordStart();
  S.game.guesses.push(id);
  window.DLE_Profile?.count("guesses");
  const won = id === S.game.target;
  if (won) {
    S.game.status = "won";
    if (!isOnline()) recordWin(S.game.guesses.length);
    // For the profile's achievements.
    if (S.game.guesses.length === 1) window.DLE_Profile?.count("oneShot");
    if (play() === "blur") window.DLE_Profile?.count("blurWins");
    if (play() === "desc") window.DLE_Profile?.count("descWins");
  }
  saveGame();
  if (isOnline()) { if (S.race.turns) sendTurnGuess(id, won); else raceProgress(); }

  // Blur and description: no attribute row, the panel updates (sharper picture, new clue, wrong-guess shake).
  if (play() !== "classic") {
    renderPlay(won ? "won" : "wrong");
    renderHints();
    renderGiveUp();
    renderStatsBar();
    closeSuggestions();
    const box = $("#searchInput");
    box.value = "";
    $("#clearBtn").hidden = true;
    if (won) {
      $("#searchForm").hidden = true;
      setTimeout(() => {
        burst();
        window.DLE_FX?.play("win");
        window.DLE_FX?.flash("rgba(var(--accent-rgb), 0.35)");
        renderResult();
        renderWeekly();
        $("#resultBanner").scrollIntoView({ behavior: "smooth", block: "center" });
      }, 900);
    } else {
      window.DLE_FX?.play("wrong");
      box.focus();
    }
    return;
  }

  renderHead();
  const row = renderRow(id, true);
  $("#boardRows").prepend(row);
  renderHints();
  renderGiveUp();
  renderStatsBar();
  closeSuggestions();
  const input = $("#searchInput");
  input.value = "";
  $("#clearBtn").hidden = true;

  if (won) {
    $("#searchForm").hidden = true;
    setTimeout(() => {
      row.classList.add("is-win");
      burst();
      window.DLE_FX?.play("win");
      window.DLE_FX?.flash("rgba(var(--accent-rgb), 0.35)");
      renderResult();
      renderWeekly();
      $("#resultBanner").scrollIntoView({ behavior: "smooth", block: "center" });
    }, COLS.length * FLIP_STEP + 450);
  } else {
    input.focus();
  }
}

// ── Autocomplete ──
let matches = [];
let active = -1;

function search(q) {
  const nq = normalize(q.trim());
  if (!nq || !S.game) return [];
  return pool()
    .filter((c) => !S.game.guesses.includes(c.id))
    .map((c) => {
      const scoreOf = (name) => {
        const n = normalize(name);
        return n.startsWith(nq) ? 0 : n.split(" ").some((w) => w.startsWith(nq)) ? 1 : n.includes(nq) ? 2 : 9;
      };
      const score = Math.min(scoreOf(nameOf(c)), scoreOf(c.name));
      return { c, score: score === 9 ? -1 : score };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => a.score - b.score || nameOf(a.c).localeCompare(nameOf(b.c)))
    .map((x) => x.c);
}

function renderSuggestions() {
  const list = $("#suggestions");
  const input = $("#searchInput");
  list.innerHTML = "";
  if (!input.value.trim()) return closeSuggestions();
  if (!matches.length) {
    list.innerHTML = `<li class="empty">${esc(t("noMatch"))}</li>`;
  } else {
    matches.forEach((c, i) => {
      const li = el("li", i === active ? "is-active" : "", `<span class="sug-face${auraOf(c.id)}">${thumb(c.image)}</span><span>${esc(nameOf(c))}</span>`);
      li.id = `sug-${c.id}`;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", i === active);
      li.addEventListener("mousedown", (e) => { e.preventDefault(); submitGuess(c.id); });
      list.append(li);
    });
  }
  list.hidden = false;
  input.setAttribute("aria-expanded", "true");
  input.setAttribute("aria-activedescendant", active >= 0 && matches[active] ? `sug-${matches[active].id}` : "");
  list.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
}

export function closeSuggestions() {
  $("#suggestions").hidden = true;
  $("#searchInput").setAttribute("aria-expanded", "false");
  active = -1;
}

export function bindSearch() {
  const input = $("#searchInput");
  input.addEventListener("input", () => {
    matches = search(input.value);
    active = matches.length ? 0 : -1;
    $("#clearBtn").hidden = !input.value;
    renderSuggestions();
  });
  input.addEventListener("keydown", (e) => {
    if ($("#suggestions").hidden) return;
    if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(active + 1, matches.length - 1); renderSuggestions(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(active - 1, 0); renderSuggestions(); }
    else if (e.key === "Escape") closeSuggestions();
  });
  input.addEventListener("blur", () => setTimeout(closeSuggestions, 120));
  input.addEventListener("focus", () => { if (input.value) { matches = search(input.value); renderSuggestions(); } });
  $("#clearBtn").addEventListener("click", () => {
    input.value = "";
    $("#clearBtn").hidden = true;
    closeSuggestions();
    input.focus();
  });
  $("#searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pick = matches[active] ?? matches[0];
    if (pick && input.value.trim()) submitGuess(pick.id);
  });
}
