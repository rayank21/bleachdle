// Online play: rooms and the lobby (shared/rooms.js).

import { S } from "./state.js";
import { $, GAMES, ROOT, el, loadGame, playerArc, t, toast } from "./base.js";
import { selectGame } from "./picker.js";
import { copyText } from "./solo.js";
import { askResume, finishMatch, onMatchMessage, renderScoreboard, startMatch } from "./match.js";
import { setMode } from "../crew.js";

// ════════════════════ ONLINE (2–8 players) ════════════════════
// Rooms come from shared/rooms.js. In a match the host picks one character per round for
// everyone; each player places it on their own board and the boards are shared live.
const SIZES = [2, 3, 4, 5, 6, 7, 8];
export let rooms = null;
let roomSize = 2;
S.match = null;
S.matchReel = null;

export const cleanName = (s) => window.DLE_Rooms.cleanName(s);
export function myName() {
  try { return cleanName(localStorage.getItem("dle:name")); } catch { return ""; }
}

export function ensureRooms() {
  if (rooms) return;
  rooms = window.DLE_Rooms.create({
    channel: "crew",
    startData: (room) => ({
      arc: Math.min(...room.members.map((m) => m.arc)),
      key: Math.random().toString(36).slice(2, 10),
      teams: room.meta?.teams ? Object.fromEntries(room.members.map((m) => [m.id, rooms.teamOf(m.id, room) ?? 0])) : null,
    }),
    onChange: () => { tryPendingJoin(); if (!S.match) renderLobby(); else renderScoreboard(); },
    onStart: (room, data) => startMatch(room, data),
    onMessage: onMatchMessage,
    onClosed: (why) => {
      S.resume = null;
      if (S.match && !S.match.done) { S.match.closedByHost = true; finishMatch(); }
      else { S.match = null; renderLobby(); }
      toast(why === "rejoin-failed" ? t("rejoinFailed") : t("roomClosed"));
    },
    onRejoined: (room, data) => askResume(room, data),
    // A match under way can be joined (from a friend or a code): ask for it like after a reload.
    lateJoin: true,
    onLateJoined: (room) => askResume(room, { key: null }),
    onInvite: (room, from) => {
      if (S.match && !S.match.done) return;
      const g = GAMES.find((x) => x.id === room.game);
      window.DLE_Rooms.inviteBanner({
        text: t("invitedBy")(rooms.peers.get(from)?.name ?? "Player", g?.anime),
        join: t("join"),
        dismiss: t("ignore"),
        onJoin: () => joinRoom(room),
      });
    },
  });
  updateProfile();
}

export async function updateProfile() {
  if (!rooms || !S.currentGame) return;
  const data = await loadGame(S.currentGame);
  rooms.setProfile({ name: myName() || "Player", game: S.currentGame.id, arc: playerArc(data.config) ?? data.config.arcs.length - 1 });
}

export const memberName = (id) => (id === rooms.selfId ? myName() || t("you") : S.match?.names.get(id) ?? rooms.peers.get(id)?.name ?? "Player");

// ── Lobby ──
export function renderLobby() {
  if (S.mode !== "online" || S.match) return;
  if (rooms?.rejoining || S.resume) {
    $("#duel").hidden = true;
    const box = $("#lobby");
    box.hidden = false;
    box.textContent = "";
    const w = el("p", "lobby-waiting");
    w.append(el("span", "spinner"), t("rejoining"));
    box.append(el("h2", null, t("lobbyTitle")), w);
    return;
  }
  // The host changed the anime: follow it (and send my spoiler limit for that anime).
  const joined = rooms?.myRoom;
  if (joined && !rooms.isHost() && joined.game !== S.currentGame.id && GAMES.some((g) => g.id === joined.game)) {
    selectGame(joined.game, { quiet: true }).then(() => { updateProfile(); renderLobby(); });
    return;
  }
  $("#duel").hidden = true;
  const box = $("#lobby");
  box.hidden = false;
  box.textContent = "";
  box.append(el("h2", null, t("lobbyTitle")));
  box.append(el("p", "muted", t("lobbyHelp")));

  if (!rooms || rooms.status === "connecting") {
    const w = el("p", "lobby-waiting");
    w.append(el("span", "spinner"), t("connecting"));
    box.append(w);
    return;
  }
  if (rooms.status === "offline") { box.append(el("p", "lobby-status is-error", t("offline"))); return; }

  // Name
  const form = el("form", "lobby-form");
  const input = el("input");
  input.id = "lobbyName";
  input.maxLength = 20;
  input.placeholder = t("yourName");
  input.setAttribute("aria-label", t("yourName"));
  input.value = myName();
  const save = el("button", "btn-ghost", t("saveName"));
  save.type = "submit";
  form.append(input, save);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = cleanName(input.value);
    if (!name) { input.placeholder = t("pickName"); input.focus(); return; }
    try { localStorage.setItem("dle:name", name); } catch {}
    window.dispatchEvent(new Event("dle:name"));
    updateProfile();
    toast(t("nameSaved"));
    tryPendingJoin();
  });
  box.append(form);

  const room = rooms.myRoom;
  if (!room && S.pendingJoin) {
    const w = el("p", "lobby-waiting");
    w.append(el("span", "spinner"), t("searching"));
    box.append(w);
  }
  if (room) box.append(roomCard(room));
  else {
    // Create a room
    box.append(el("h3", "room-title", t("withCode")));
    box.append(codeForm());
    box.append(el("h3", "room-title", t("pick")));
    box.append(animeChooser());
    const create = el("div", "room-create");
    create.append(el("span", "room-label", t("players")));
    const sizes = el("div", "size-picker");
    for (const n of SIZES) {
      const b = el("button", `size-pick${n === roomSize ? " is-active" : ""}`, String(n));
      b.type = "button";
      b.setAttribute("aria-pressed", n === roomSize);
      b.addEventListener("click", () => { roomSize = n; renderLobby(); });
      sizes.append(b);
    }
    const go = el("button", "btn-primary", t("createRoom"));
    go.type = "button";
    go.addEventListener("click", () => {
      if (!myName()) { input.placeholder = t("pickName"); input.focus(); return; }
      rooms.createRoom({ game: S.currentGame.id, size: roomSize });
    });
    create.append(sizes, go);
    box.append(create);

    // Open rooms
    box.append(el("h3", "room-title", t("openRooms")));
    const open = rooms.openRooms().sort((a, b) => Number(b.game === S.currentGame.id) - Number(a.game === S.currentGame.id));
    if (!open.length) box.append(el("p", "muted lobby-empty", t("noRooms")));
    const list = el("ul", "lobby-list");
    for (const r of open) {
      const g = GAMES.find((x) => x.id === r.game);
      const li = el("li", `lobby-player${r.game === S.currentGame.id ? " same-game" : ""}`);
      if (g) { const img = el("img"); img.src = ROOT + g.logo; img.alt = ""; img.title = g.anime; li.append(img); }
      const host = r.members.find((m) => m.id === r.host);
      const label = el("span", "lobby-pname", t("roomOf")(host?.name ?? "Player"));
      if (g) label.append(el("small", "lobby-anime", g.anime));
      li.append(label, el("span", "lobby-badge", `${r.members.length}/${r.size}`));
      const join = el("button", "btn-primary btn-small", t("join"));
      join.type = "button";
      join.addEventListener("click", () => {
        if (!myName()) { input.placeholder = t("pickName"); input.focus(); return; }
        joinRoom(r);
      });
      li.append(join);
      list.append(li);
    }
    box.append(list);
  }

  // Who is around
  const around = [...rooms.peers.values()];
  box.append(el("h3", "room-title", t("inLobby")(around.length + 1)));
  if (around.length) {
    const chips = el("div", "lobby-chips");
    for (const p of around) chips.append(peerChip(p));
    box.append(chips);
  } else box.append(aloneNote());
}

function aloneNote() {
  const wrap = el("div", "lobby-alone");
  wrap.append(el("p", "muted", t("aloneHere")));
  const b = el("button", "btn-ghost btn-small", t("copyLink"));
  b.type = "button";
  b.addEventListener("click", async () => {
    await copyText(location.href.split("#")[0] + "#online");
    toast(t("linkCopied"));
  });
  wrap.append(b);
  return wrap;
}

async function joinRoom(r) {
  if (S.match) { S.match = null; }
  if (S.mode !== "online") setMode("online");
  if (r.game !== S.currentGame.id) await selectGame(r.game, { quiet: true });
  // Send my spoiler limit for this room's anime before joining, not the one of the previous anime.
  await updateProfile();
  rooms.join(r.id);
}

// A player in the lobby: join the room they wait in, or invite them into mine.
function peerChip(p) {
  const chip = el("span", "lobby-chip");
  const name = el("span");
  name.textContent = p.name;
  chip.append(name);
  const mine = rooms.myRoom;
  const theirs = rooms.roomOf(p.id);
  let btn = null;
  if (theirs && theirs.id !== mine?.id) {
    if (theirs.members.length < theirs.size) {
      btn = el("button", "btn-primary btn-small", t("join"));
      btn.addEventListener("click", () => {
        if (!myName()) { $("#lobbyName")?.focus(); toast(t("pickName")); return; }
        joinRoom(theirs);
      });
    }
  } else if (!theirs && !(mine && mine.members.length >= mine.size)) {
    btn = el("button", "btn-ghost btn-small", t("invite"));
    btn.addEventListener("click", () => {
      if (!myName()) { $("#lobbyName")?.focus(); toast(t("pickName")); return; }
      if (rooms.invite(p.id, { game: S.currentGame.id, size: roomSize })) toast(t("inviteSent")(p.name));
    });
  }
  if (btn) { btn.type = "button"; chip.classList.add("has-action"); chip.append(btn); }
  return chip;
}

// Invite links: crew/#join=<room id>. The room shows up once its host is found, then we join it.
const inviteLink = (room) => `${location.href.split("#")[0]}#join=${encodeURIComponent(room.id)}`;

// Wait for a room (from a link or a code) to be announced by its host, then join it.
function waitForRoom(key, ms, message) {
  S.pendingJoin = key;
  tryPendingJoin.asked = false;
  setTimeout(() => { if (S.pendingJoin === key && !rooms?.myRoom) { S.pendingJoin = null; toast(t(message)); renderLobby(); } }, ms);
  tryPendingJoin();
  renderLobby();
}

function codeBadge(code) {
  const wrap = el("div", "room-code");
  wrap.append(el("span", null, t("codeLabel")), el("b", null, code));
  const b = el("button", "btn-ghost btn-small", t("copyCode"));
  b.type = "button";
  b.addEventListener("click", async () => { await copyText(code); toast(t("codeCopied")); });
  wrap.append(b);
  return wrap;
}

function codeForm() {
  const form = el("form", "code-form");
  const input = el("input");
  input.id = "roomCodeInput";
  input.maxLength = 6;
  input.placeholder = t("codePlaceholder");
  input.autocomplete = "off";
  input.setAttribute("autocapitalize", "characters");
  input.setAttribute("aria-label", t("codePlaceholder"));
  input.addEventListener("input", () => { input.value = window.DLE_Rooms.cleanCode(input.value); });
  const go = el("button", "btn-primary", t("joinCode"));
  go.type = "submit";
  form.append(input, go);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = window.DLE_Rooms.cleanCode(input.value);
    if (code.length < 4) { input.focus(); return; }
    if (!myName()) { toast(t("pickName")); $("#lobbyName")?.focus(); return; }
    waitForRoom(code, 12000, "codeNotFound");
  });
  return form;
}

function tryPendingJoin() {
  if (!S.pendingJoin || !rooms || rooms.status !== "live") return;
  const mine = rooms.myRoom;
  if (mine && (mine.id === S.pendingJoin || mine.code === S.pendingJoin)) { S.pendingJoin = null; return; }
  const r = rooms.findRoom(S.pendingJoin);
  if (!r) return;
  if (r.started ? r.members.length >= 8 : r.members.length >= r.size) { S.pendingJoin = null; toast(t("linkGone")); renderLobby(); return; }
  if (!myName()) {
    if (!tryPendingJoin.asked) { tryPendingJoin.asked = true; toast(t("pickToJoin")); setTimeout(() => $("#lobbyName")?.focus(), 50); }
    return;
  }
  S.pendingJoin = null;
  history.replaceState(null, "", "#online");
  joinRoom(r);
}

// Small row of anime logos (create a room, or the host changing the room's anime).
function animeChooser() {
  const row = el("div", "anime-mini");
  row.setAttribute("role", "group");
  row.setAttribute("aria-label", "Anime");
  for (const g of GAMES) {
    const on = S.currentGame?.id === g.id;
    const b = el("button", `anime-mini-pick${on ? " is-active" : ""}`);
    b.type = "button";
    b.title = g.anime;
    b.setAttribute("aria-label", g.anime);
    b.setAttribute("aria-pressed", on);
    const img = el("img");
    img.src = ROOT + g.logo;
    img.alt = "";
    b.append(img);
    if (on) b.append(el("span", null, g.anime));
    b.addEventListener("click", () => { if (!on) selectGame(g.id); });
    row.append(b);
  }
  return row;
}

function roomCard(room) {
  const card = el("div", "room-card");
  const g = GAMES.find((x) => x.id === room.game);
  const head = el("div", "room-head");
  if (g) { const img = el("img"); img.src = ROOT + g.logo; img.alt = ""; head.append(img); }
  const host = room.members.find((m) => m.id === room.host);
  head.append(el("b", null, t("roomOf")(host?.name ?? "Player")), el("span", "lobby-badge", `${room.members.length}/${room.size}`));
  card.append(head);
  const hint = el("p", "room-hint");
  if (g) hint.append(el("b", null, g.anime), " · ");
  hint.append(rooms.isHost() ? t("hostPicks") : t("hostChooses"));
  card.append(hint);
  if (room.code) card.append(codeBadge(room.code));
  if (rooms.isHost()) card.append(animeChooser());
  const list = el("ul", "room-members");
  for (let i = 0; i < room.size; i++) {
    const m = room.members[i];
    const li = el("li", m ? "is-taken" : "is-free");
    li.append(el("span", "room-seat", String(i + 1)));
    li.append(el("span", null, m ? (m.id === rooms.selfId ? `${m.name} (${t("you")})` : m.name) : t("freeSeat")));
    if (m && m.id === room.host) li.append(el("span", "lobby-badge", t("host")));
    list.append(li);
  }
  card.append(list, rooms.teamsBox());
  const actions = el("div", "roll-actions");
  if (rooms.isHost()) {
    const start = el("button", "btn-primary", t("start"));
    start.type = "button";
    start.disabled = room.members.length < 2;
    start.addEventListener("click", () => rooms.start());
    actions.append(start);
    if (room.members.length < 2) card.append(el("p", "muted", t("needTwo")));
  } else {
    const w = el("p", "lobby-waiting");
    w.append(el("span", "spinner"), t("waitHost"));
    card.append(w);
  }
  const leave = el("button", "btn-ghost", t("leave"));
  leave.type = "button";
  leave.addEventListener("click", () => rooms.leave());
  actions.append(leave);
  const link = el("button", "btn-ghost", t("copyInvite"));
  link.type = "button";
  link.addEventListener("click", async () => {
    await copyText(inviteLink(room));
    toast(t("inviteCopied"));
  });
  actions.append(link);
  card.append(actions, rooms.chatBox());
  return card;
}
