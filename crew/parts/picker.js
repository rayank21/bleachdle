// The anime picker, shared by every mode.

import { S } from "./state.js";
import { $, GAMES, ROOT, el, loadGame, playerArc, t } from "./base.js";
import { startSolo } from "./solo.js";
import { renderLobby, rooms, updateProfile } from "./lobby.js";
import { backToRoom } from "./match.js";
import { renderIndex } from "./index-view.js";

// ── Shared UI ──
S.currentGame = null; // a DLE_GAMES entry
S.mode = "solo";
S.pendingJoin = null;

export function renderPicker() {
  const box = $("#animePicker");
  box.textContent = "";
  // Online, the lobby is the same for every anime: the anime is picked when creating a room.
  const online = S.mode === "online";
  $("#crewPickWrap").hidden = online;
  $("#crewArcWrap").hidden = online;
  for (const g of GAMES) {
    const b = el("button", `anime-pick${S.currentGame?.id === g.id ? " is-active" : ""}`);
    b.type = "button";
    b.title = g.anime;
    b.dataset.game = g.id;
    b.setAttribute("aria-pressed", S.currentGame?.id === g.id);
    // Online, only the host of a room picks the anime (not during a match); the others follow.
    b.disabled = S.mode === "online" && !!((S.match && !S.match.done) || (rooms?.myRoom && !rooms.isHost()));
    const img = el("img");
    img.src = ROOT + g.logo;
    img.alt = "";
    b.append(img, el("span", null, g.anime));
    b.addEventListener("click", () => selectGame(g.id));
    box.append(b);
  }
}

export async function renderArcChip() {
  const data = await loadGame(S.currentGame);
  const arc = playerArc(data.config);
  $("#crewArc").textContent = arc == null ? t("allArcs") : data.config.arcs[arc][S.lang];
  $("#crewArcLink").title = arc == null ? t("spoilerAll") : t("spoiler")(data.config.arcs[arc][S.lang]);
  $("#crewArcLink").href = `${ROOT}${S.currentGame.path}`;
}

export async function selectGame(id, { quiet = false } = {}) {
  S.currentGame = GAMES.find((x) => x.id === id) ?? GAMES[0];
  try { localStorage.setItem("dle:crew-game", S.currentGame.id); } catch {}
  document.body.dataset.game = S.currentGame.id;
  renderPicker();
  await renderArcChip();
  if (quiet) return;
  if (S.mode === "index") renderIndex();
  else if (S.mode === "solo") startSolo();
  else {
    // From the end-of-match screen, the host goes back to the room with the new anime.
    if (S.match?.done) { if (rooms?.myRoom) backToRoom(); else S.match = null; }
    updateProfile();
    if (rooms?.isHost()) rooms.setGame(S.currentGame.id);
    renderLobby();
  }
}
