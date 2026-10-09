// Online race: 2–8 players, the first to find the character wins (rooms from shared/rooms.js).

import { S } from "./state.js";
import { $, CFG, CHARS, COLS, DESC, PLAYS, byId, isOnline, saveSettings, settings, t, view } from "./core.js";
import { saveStats, stats } from "./stats.js";
import { compare } from "./compare.js";
import { el, esc } from "./dom.js";
import { renderResult, toast } from "./render.js";
import { renderAll, startGame } from "./ui.js";
import { PLAY_LABEL, renderPlayTabs } from "./play.js";

// ── Online race (2–8 players, first to find the character wins) ──
// Turn by turn (on by default, the host can switch it off): the players guess one after the other on one shared board,
// every guess (and every clue it uncovers) is seen by all, and whoever finds the character wins. A turn lasts
// TURN_MS; then it passes to the next player.
// Rooms come from shared/rooms.js, with one lobby per anime. The host draws the character at the
// lowest arc among the players so nobody gets spoiled. Players share their progress live: the
// number of guesses and the tile colours of their last guess, never the names they tried.
export let rooms = null;
let raceSize = 2;
const SIZES = [2, 3, 4, 5, 6, 7, 8];
const STATUSES = new Set(["correct", "partial", "wrong"]);
const myName = () => {
  try { return window.DLE_Rooms.cleanName(localStorage.getItem("dle:name")); } catch { return ""; }
};
export const clock = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function ensureRooms() {
  if (rooms || !window.DLE_Rooms) return;
  rooms = window.DLE_Rooms.create({
    channel: "race",
    startData: raceStartData,
    onChange: () => { tryPendingJoin(); if (isOnline()) { renderRace(); renderPlayTabs(); } },
    onStart: startRace,
    onMessage: onRaceMessage,
    onClosed: () => {
      toast(t("roomClosed"));
      if (S.race && !S.race.done) finishRace();
      else if (!S.race && isOnline()) renderRace();
    },
    onInvite: (room, from) => {
      if (S.race && !S.race.done) return;
      window.DLE_Rooms.inviteBanner({
        text: t("invitedBy")(rooms.peers.get(from)?.name ?? "Player", (window.DLE_GAMES || []).find((g) => g.id === room.game)?.anime ?? ""),
        join: t("join"),
        dismiss: t("ignore"),
        onJoin: () => joinRaceRoom(room),
      });
    },
  });
  updateRaceProfile();
}

// Host: the race uses the lowest arc among the players, and a character from that pool.
function raceStartData(room) {
  const arc = Math.min(...room.members.map((m) => m.arc), CFG.arcs.length - 1);
  const p = PLAYS.includes(room.meta?.play) && (room.meta.play !== "desc" || Object.keys(DESC).length) ? room.meta.play : "classic";
  const candidates = CHARS.filter((c) => c.arc <= arc && (p !== "desc" || DESC[c.id]));
  const teams = room.meta?.teams ? Object.fromEntries(room.members.map((m) => [m.id, rooms.teamOf(m.id, room) ?? 0])) : null;
  const order = room.members.map((m) => m.id).sort(() => Math.random() - 0.5);
  return { arc, play: p, teams, turns: room.meta?.turns !== false, order, target: candidates[Math.floor(Math.random() * candidates.length)].id, key: Math.random().toString(36).slice(2, 10) };
}

export function updateRaceProfile() {
  rooms?.setProfile({ name: myName() || "Player", game: CFG.id, arc: settings.arc ?? CFG.arcs.length - 1 });
}

function startRace(room, data) {
  const target = byId.get(data.target);
  if (!target || !Number.isInteger(data.arc) || target.arc > data.arc) return;
  const teams = data.teams && typeof data.teams === "object"
    ? Object.fromEntries(room.members.map((m) => [m.id, data.teams[m.id] === 1 ? 1 : 0]))
    : null;
  S.race = {
    room,
    key: String(data.key ?? ""), // tells this race's messages from the previous one's
    play: PLAYS.includes(data.play) ? data.play : "classic",
    teams,
    arc: data.arc,
    startedAt: 0,
    done: false,
    game: { target: target.id, guesses: [], status: "playing", revealed: {} },
    players: new Map(room.members.map((m) => [m.id, {
      id: m.id, name: m.id === rooms.selfId ? myName() || t("you") : m.name, n: 0, last: [], found: false, gaveUp: false, ms: null, left: false,
    }])),
    // Turn by turn: the order of play, whose turn it is (a counter), and who made each guess.
    turns: data.turns === true,
    order: Array.isArray(data.order) && data.order.every((id) => room.members.some((m) => m.id === id)) && data.order.length === room.members.length
      ? data.order : room.members.map((m) => m.id).sort(),
    turn: 0, turnAt: 0, by: new Map(), winner: null,
  };
  if (!isOnline()) { settings.mode = "online"; saveSettings(); }
  startGame();
  raceSplash().then(() => {
    if (!S.race || S.race.room.id !== room.id) return;
    S.race.startedAt = Date.now();
    if (S.race.turns) startTurn(0);
    renderRace();
    $("#searchInput").focus();
  });
}

function raceSplash() {
  const others = [...S.race.players.values()].filter((p) => p.id !== rooms.selfId).map((p) => p.name);
  const s = el("div", "vs-splash");
  const left = el("span", "vs-name vs-left");
  left.textContent = myName() || t("you");
  const mark = el("span", "vs-mark", esc(t("vs")));
  const right = el("span", "vs-name vs-right");
  right.textContent = others.join(" · ");
  s.append(left, mark, right);
  document.body.append(s);
  return new Promise((r) => setTimeout(r, 2200))
    .then(() => { s.classList.add("is-out"); return new Promise((r) => setTimeout(r, 350)); })
    .then(() => s.remove());
}

// Called after each of my guesses (or when I give up).
export function raceProgress() {
  const me = S.race.players.get(rooms.selfId);
  const tg = view(S.game.target);
  const lastId = S.game.guesses[S.game.guesses.length - 1];
  me.n = S.game.guesses.length;
  me.last = !lastId ? [] : S.race.play !== "classic" ? [lastId === S.game.target ? "correct" : "wrong"]
    : (() => { const r = compare(view(lastId), tg); return COLS.map((c) => r[c.key].status); })();
  me.found = S.game.status === "won";
  me.gaveUp = S.game.status === "lost";
  if (me.found && me.ms == null) me.ms = Date.now() - S.race.startedAt;
  const state = { key: S.race.key, n: me.n, last: me.last, found: me.found, gaveUp: me.gaveUp, ms: me.ms };
  rooms.broadcast("progress", state);
  // My final state is sent again for a minute: a lost message would leave the others waiting.
  if ((me.found || me.gaveUp) && !S.race.resending) {
    const run = S.race;
    run.resending = true;
    let left = 20;
    const timer = setInterval(() => { if (S.race !== run || --left <= 0) clearInterval(timer); else rooms.broadcast("progress", state); }, 3000);
  }
  renderRace();
  checkRaceEnd();
}

function raceProgressResend() {
  const me = S.race.players.get(rooms.selfId);
  rooms.broadcast("progress", { key: S.race.key, n: me.n, last: me.last, found: me.found, gaveUp: me.gaveUp, ms: me.ms });
}

function onRaceMessage(type, d, from) {
  if (!S.race) return;
  const p = S.race.players.get(from);
  if (!p) return;
  if (type === "progress") {
    if (d.key != null && String(d.key) !== S.race.key) return;
    p.n = Math.max(0, Math.min(999, Math.floor(Number(d.n) || 0)));
    p.last = Array.isArray(d.last) ? d.last.slice(0, COLS.length).filter((s) => STATUSES.has(s)) : [];
    p.found = !!d.found;
    p.gaveUp = !!d.gaveUp && !p.found;
    p.ms = p.found && Number.isFinite(d.ms) ? Math.max(0, d.ms) : null;
  } else if (type === "tguess" || type === "tpass") {
    if (!S.race.turns || String(d.key) !== S.race.key || S.race.done) return;
    onTurnMessage(type, d, from);
    return;
  } else if (type === "left") {
    p.left = true;
    // Turn by turn: the game goes on without them (their turn passes), until one player is left.
    if (S.race.turns && !S.race.done) {
      if (activeOrder().length < 2) { endTurns(null); return; }
      // The turn starts again for whoever plays now (everyone drops the same player, so everyone agrees).
      startTurn(S.race.turn);
    }
  } else if (type === "rejoin") {
    // Their link dropped for a moment: send my progress again, they may have missed some.
    if (S.race.startedAt) raceProgressResend();
    return;
  } else return;
  renderRace();
  checkRaceEnd();
}

// ── Turn by turn ──
const TURN_MS = 40000;
// After this long without a word from the player whose turn it is, everyone moves on (they lost their link).
const TURN_GRACE = 8000;
const MAX_TURNS = 80;
const activeOrder = () => S.race.order.filter((id) => !S.race.players.get(id)?.left);
const turnOwner = (n) => { const a = activeOrder(); return a.length ? a[n % a.length] : undefined; };
export const myTurn = () => !!S.race?.turns && !S.race.done && turnOwner(S.race.turn) === rooms?.selfId;
export const turnOwnerName = () => S.race?.players.get(turnOwner(S.race.turn))?.name ?? "?";

let turnTimer = 0;
let turnTick = 0;
function startTurn(n) {
  const run = S.race;
  if (!run || run.done) return;
  if (n >= MAX_TURNS) { endTurns(null); return; }
  run.turn = n;
  run.turnAt = Date.now();
  clearTimeout(turnTimer);
  const mine = turnOwner(n) === rooms.selfId;
  // My turn runs out: I pass. Someone else's: I move on by myself a little later if their pass never comes.
  turnTimer = setTimeout(() => {
    if (S.race !== run || run.done || run.turn !== n) return;
    if (mine) rooms.broadcast("tpass", { key: run.key, turn: n });
    startTurn(n + 1);
  }, TURN_MS + (mine ? 0 : TURN_GRACE));
  lockInput();
  if (mine) { window.DLE_FX?.play("place"); toast(t("yourTurn")); $("#searchInput")?.focus({ preventScroll: true }); }
  renderRace();
}

// The search box only works on my turn.
function lockInput() {
  const input = $("#searchInput");
  if (!input || !S.race?.turns) return;
  const on = myTurn();
  input.disabled = !on;
  input.placeholder = S.race.done ? "" : on ? t("yourTurnPh") : t("theirTurnPh")(turnOwnerName());
}

// My guess, on my turn: everyone gets it.
export function sendTurnGuess(id, won) {
  const run = S.race;
  run.by.set(id, rooms.selfId);
  const me = run.players.get(rooms.selfId);
  me.n++;
  rooms.broadcast("tguess", { key: run.key, turn: run.turn, id });
  if (won) { endTurns(rooms.selfId); return; }
  startTurn(run.turn + 1);
}

function onTurnMessage(type, d, from) {
  const run = S.race;
  const n = Math.floor(Number(d.turn));
  // Messages for a turn already gone (my clock ran ahead) are still taken: a guess is never lost.
  if (!Number.isInteger(n) || n < run.turn - 1) return;
  if (type === "tpass") { if (n >= run.turn) startTurn(n + 1); return; }
  const id = String(d.id ?? "");
  if (!byId.has(id) || !CHARS.some((c) => c.id === id && c.arc <= run.arc)) return;
  if (!S.game.guesses.includes(id)) {
    S.game.guesses.push(id);
    run.by.set(id, from);
    const p = run.players.get(from);
    if (p) p.n++;
  }
  if (id === S.game.target) { endTurns(from); return; }
  if (n >= run.turn) startTurn(n + 1);
  showRemoteGuess();
}

// Someone else's guess lands on my board, with the same flip as mine.
function showRemoteGuess() {
  renderAll();
  window.DLE_FX?.play("wrong");
  const row = $("#boardRows")?.firstElementChild;
  if (row) [...row.querySelectorAll(".tile")].forEach((tile, i) => { tile.classList.add("flip"); tile.style.animationDelay = `${i * 120}ms`; });
}

function endTurns(winner) {
  const run = S.race;
  if (!run || run.done) return;
  clearTimeout(turnTimer);
  run.winner = winner;
  for (const p of run.players.values()) { p.found = p.id === winner; p.gaveUp = !p.found; }
  const w = run.players.get(winner);
  if (w) w.ms = Date.now() - run.startedAt;
  S.game.status = winner === rooms.selfId ? "won" : "lost";
  const input = $("#searchInput");
  if (input) { input.disabled = false; input.placeholder = ""; }
  finishRace();
  renderAll();
  window.DLE_FX?.play(winner === rooms.selfId ? "win" : "lose");
}

function checkRaceEnd() {
  if (S.race && !S.race.done && [...S.race.players.values()].every((p) => p.found || p.gaveUp || p.left)) finishRace();
}

function finishRace() {
  if (!S.race || S.race.done) return;
  S.race.done = true;
  // Online races count in the stats (and on the profile): played, and won when I finished first.
  const top = raceRanking()[0];
  stats.online.played++;
  const winsBefore = stats.online.wins;
  if (S.race.teams) { const sc = teamScores(); const mine = S.race.teams[rooms?.selfId] ?? 0; if (sc[mine] > sc[1 - mine]) stats.online.wins++; }
  else if (top?.id === rooms?.selfId && top.found) stats.online.wins++;
  saveStats();
  if (stats.online.wins > winsBefore) window.DLE_Profile?.earnBooster?.(1, "duel");
  renderRace();
  if (S.game) renderResult();
}

// Found first (fastest, then fewest guesses), then the others.
export const raceRanking = () => [...S.race.players.values()].sort((a, b) =>
  Number(b.found) - Number(a.found) || (a.ms ?? Infinity) - (b.ms ?? Infinity) || a.n - b.n);

// Teams: every player earns points for their place (finding it first is worth the most), averaged per team.
function teamScores() {
  const ranked = raceRanking();
  const pts = [0, 0];
  const count = [0, 0];
  ranked.forEach((p, i) => {
    const k = S.race.teams[p.id] ?? 0;
    count[k]++;
    if (p.found) pts[k] += ranked.length - i;
  });
  return [0, 1].map((k) => (count[k] ? Math.round((pts[k] / count[k]) * 10) / 10 : 0));
}
export function teamOutcomeHtml() {
  const sc = teamScores();
  const names = rooms.teamNames();
  const text = sc[0] === sc[1] ? t("teamDraw") : t("teamWins")(names[sc[0] > sc[1] ? 0 : 1]);
  return `<p class="team-outcome team-${sc[0] === sc[1] ? "draw" : sc[0] > sc[1] ? 0 : 1}">${esc(text)}</p>`;
}
function teamBar() {
  const sc = teamScores();
  const names = rooms.teamNames();
  const bar = el("div", "team-bar");
  for (const k of [0, 1]) {
    const side = el("div", `team-side team-${k}${S.race.done && sc[k] > sc[1 - k] ? " is-winner" : ""}`);
    side.append(el("span", "team-side-name", esc(names[k])), el("b", "team-side-pts", esc(t("teamPts")(sc[k]))));
    bar.append(side);
    if (k === 0) bar.append(el("span", "team-vs", "VS"));
  }
  return bar;
}

function unlockInput() {
  clearTimeout(turnTimer);
  const input = $("#searchInput");
  if (input) input.disabled = false;
}

function leaveRace() {
  unlockInput();
  S.race = null;
  rooms?.leave();
  startGame();
}

function backToRoom() {
  unlockInput();
  S.race = null;
  if (rooms?.isHost()) rooms.reopen();
  startGame();
}

export function renderRace() {
  const box = $("#raceBox");
  if (!box) return;
  box.hidden = !isOnline();
  if (!isOnline()) return;
  box.textContent = "";
  if (S.race) renderRaceBoard(box);
  else renderRaceLobby(box);
}

function renderRaceBoard(box) {
  const head = el("div", "race-head");
  head.append(el("h2", null, esc(S.race.done ? t("finalRanking") : S.race.turns ? t("turnLive") : t("raceLive"))));
  if (!S.race.done && S.race.startedAt) {
    const timer = el("span", "race-timer", clock(Date.now() - S.race.startedAt));
    head.append(timer);
    clearInterval(renderRaceBoard.timer);
    renderRaceBoard.timer = setInterval(() => {
      if (!S.race || S.race.done || !document.body.contains(timer)) return clearInterval(renderRaceBoard.timer);
      timer.textContent = clock(Date.now() - S.race.startedAt);
    }, 1000);
  }
  box.append(head);
  if (S.race.teams) box.append(teamBar());
  if (S.race.turns) { box.append(turnBar()); lockInput(); }
  const list = el("ol", "ranking race-list");
  for (const p of raceRanking()) {
    const li = el("li", `${p.id === rooms.selfId ? "is-me" : ""}${p.found ? " is-found" : ""}${p.left ? " has-left" : ""}${S.race.teams ? ` team-${S.race.teams[p.id] ?? 0}` : ""}`);
    const name = window.DLE_NAME(p.id === rooms.selfId ? `${p.name} (${t("you")})` : p.name, rooms.pidOf(p.id), "ranking-name");
    const status = S.race.turns ? (p.found ? t("turnWinner") : p.left ? t("left") : t("turnGuesses")(p.n))
      : p.found ? t("foundIn")(p.n, clock(p.ms)) : p.gaveUp ? t("gaveUpShort") : p.left ? t("left") : t("looking")(p.n);
    const sq = el("span", "race-squares");
    for (const s of p.last) sq.append(el("i", `sq is-${s}`));
    li.append(name, sq, el("span", "race-status", esc(status)));
    list.append(li);
  }
  box.append(list);
  if (S.race.done) {
    const actions = el("div", "result-actions");
    const leave = el("button", "btn-ghost", esc(t("leave")));
    leave.type = "button";
    leave.addEventListener("click", leaveRace);
    const again = el("button", "btn-primary", esc(t("backRoom")));
    again.type = "button";
    again.addEventListener("click", backToRoom);
    actions.append(leave, again);
    box.append(actions);
    if (rooms.myRoom) box.append(rooms.chatBox());
  }
}

// Turn by turn: the order of play, the current player lit up, and the time left in the turn.
function turnBar() {
  const bar = el("div", "turn-bar");
  const owner = turnOwner(S.race.turn);
  S.race.order.forEach((id) => {
    const p = S.race.players.get(id);
    const chip = el("span", `turn-chip${id === owner && !S.race.done ? " is-turn" : ""}${id === rooms.selfId ? " is-me" : ""}${p?.left ? " has-left" : ""}${S.race.teams ? ` team-${S.race.teams[id] ?? 0}` : ""}`);
    chip.textContent = id === rooms.selfId ? t("you") : p?.name ?? "?";
    bar.append(chip);
  });
  if (!S.race.done && S.race.turnAt) {
    const left = el("div", "turn-time");
    const fill = el("i");
    const label = el("span", null, "");
    left.append(fill, label);
    bar.append(left);
    clearInterval(turnTick);
    const tick = () => {
      if (!S.race || S.race.done || !document.body.contains(fill)) return clearInterval(turnTick);
      const ms = Math.max(0, TURN_MS - (Date.now() - S.race.turnAt));
      fill.style.width = `${(ms / TURN_MS) * 100}%`;
      label.textContent = `${myTurn() ? t("yourTurn") : turnOwnerName()} · ${Math.ceil(ms / 1000)} s`;
      left.classList.toggle("is-low", ms < 10000);
    };
    tick();
    turnTick = setInterval(tick, 250);
  }
  return bar;
}

// Invite links: <game>/#join=<room id>. Wait for the room to be announced (and for an arc), then join.
const inviteLink = (room) => `${location.href.split("#")[0]}#join=${encodeURIComponent(room.id)}`;
let pendingJoin = null;
const joinHash = location.hash.match(/^#join=(.+)$/);
if (joinHash) {
  const key = decodeURIComponent(joinHash[1]).slice(0, 64);
  pendingJoin = key;
  settings.mode = "online";
  setTimeout(() => { if (pendingJoin === key && !rooms?.myRoom) { pendingJoin = null; toast(t("linkGone")); renderRace(); } }, 25000);
}

function waitForRoom(key, ms, message) {
  pendingJoin = key;
  tryPendingJoin.asked = false;
  setTimeout(() => { if (pendingJoin === key && !rooms?.myRoom) { pendingJoin = null; toast(t(message)); renderRace(); } }, ms);
  tryPendingJoin();
  renderRace();
}

export function tryPendingJoin() {
  if (!pendingJoin || !rooms || rooms.status !== "live" || settings.arc == null) return;
  const mine = rooms.myRoom;
  if (mine && (mine.id === pendingJoin || mine.code === pendingJoin)) { pendingJoin = null; return; }
  const r = rooms.findRoom(pendingJoin);
  if (!r) return;
  if (r.started || r.members.length >= r.size) { pendingJoin = null; toast(t("linkGone")); renderRace(); return; }
  if (!myName()) {
    if (!tryPendingJoin.asked) { tryPendingJoin.asked = true; toast(t("pickToJoin")); setTimeout(() => $("#raceName")?.focus(), 50); }
    return;
  }
  pendingJoin = null;
  history.replaceState(null, "", location.pathname + location.search);
  joinRaceRoom(r);
}

function joinRaceRoom(r) {
  const other = r.game !== CFG.id && (window.DLE_GAMES || []).find((g) => g.id === r.game);
  if (other) { location.href = `../${other.path}index.html#join=${encodeURIComponent(r.id)}`; return; }
  if (!isOnline()) { settings.mode = "online"; saveSettings(); startGame(); }
  if (S.race) S.race = null;
  rooms.join(r.id);
  renderRace();
}

// Who is around: join the room a player waits in, or invite them into mine.
function racePeers(box) {
  const around = [...rooms.peers.values()];
  box.append(el("h3", "room-title", esc(t("inLobby")(around.length + 1))));
  if (!around.length) {
    const wrap = el("div", "lobby-alone");
    wrap.append(el("p", "muted", esc(t("aloneHere"))));
    const b = el("button", "btn-ghost btn-small", esc(t("copyLink")));
    b.type = "button";
    b.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(location.href.split("#")[0]); } catch {}
      toast(t("linkCopied"));
    });
    wrap.append(b);
    box.append(wrap);
    return;
  }
  const chips = el("div", "lobby-chips");
  const mine = rooms.myRoom;
  for (const p of around) {
    const chip = el("span", "lobby-chip");
    chip.append(window.DLE_NAME(p.name, rooms.pidOf(p.id)));
    const theirs = rooms.roomOf(p.id);
    let btn = null;
    if (theirs && theirs.id !== mine?.id) {
      if (theirs.members.length < theirs.size) {
        btn = el("button", "btn-primary btn-small", esc(t("join")));
        btn.addEventListener("click", () => { if (myName()) joinRaceRoom(theirs); else { $("#raceName")?.focus(); toast(t("pickName")); } });
      }
    } else if (!theirs && !(mine && mine.members.length >= mine.size)) {
      btn = el("button", "btn-ghost btn-small", esc(t("invite")));
      btn.addEventListener("click", () => {
        if (!myName()) { $("#raceName")?.focus(); toast(t("pickName")); return; }
        if (rooms.invite(p.id, { game: CFG.id, size: raceSize })) toast(t("inviteSent")(p.name));
      });
    }
    if (btn) { btn.type = "button"; chip.classList.add("has-action"); chip.append(btn); }
    chips.append(chip);
  }
  box.append(chips);
}

function renderRaceLobby(box) {
  box.append(el("h2", null, esc(t("raceTitle"))));
  box.append(el("p", "muted", esc(t("raceHelp"))));
  if (!rooms || rooms.status === "connecting") {
    const w = el("p", "lobby-waiting");
    w.append(el("span", "spinner"));
    w.append(t("connecting"));
    box.append(w);
    return;
  }
  if (rooms.status === "offline") { box.append(el("p", "lobby-status is-error", esc(t("offline")))); return; }
  if (pendingJoin && !rooms.myRoom) {
    const w = el("p", "lobby-waiting");
    w.append(el("span", "spinner"));
    w.append(t("searching"));
    box.append(w);
  }

  const form = el("form", "lobby-form");
  const input = el("input");
  input.id = "raceName";
  input.maxLength = 20;
  input.placeholder = t("yourName");
  input.setAttribute("aria-label", t("yourName"));
  input.value = myName();
  const save = el("button", "btn-ghost", esc(t("saveName")));
  save.type = "submit";
  form.append(input, save);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = window.DLE_Rooms.cleanName(input.value);
    if (!name) { input.placeholder = t("pickName"); input.focus(); return; }
    try { localStorage.setItem("dle:name", name); } catch {}
    window.dispatchEvent(new Event("dle:name"));
    updateRaceProfile();
    toast(t("nameSaved"));
    tryPendingJoin();
  });
  box.append(form);
  const needName = () => { if (myName()) return false; input.placeholder = t("pickName"); input.focus(); return true; };
  if (!rooms.myRoom) {
    box.append(el("h3", "room-title", esc(t("withCode"))));
    const codeForm = el("form", "code-form");
    const codeInput = el("input");
    codeInput.id = "roomCodeInput";
    codeInput.maxLength = 6;
    codeInput.placeholder = t("codePlaceholder");
    codeInput.autocomplete = "off";
    codeInput.setAttribute("autocapitalize", "characters");
    codeInput.setAttribute("aria-label", t("codePlaceholder"));
    codeInput.addEventListener("input", () => { codeInput.value = window.DLE_Rooms.cleanCode(codeInput.value); });
    const go = el("button", "btn-primary", esc(t("joinCode")));
    go.type = "submit";
    codeForm.append(codeInput, go);
    codeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = window.DLE_Rooms.cleanCode(codeInput.value);
      if (code.length < 4) { codeInput.focus(); return; }
      if (!needName()) waitForRoom(code, 12000, "codeNotFound");
    });
    box.append(codeForm);
  }

  const room = rooms.myRoom;
  if (room) {
    const card = el("div", "room-card");
    const host = room.members.find((m) => m.id === room.host);
    const head = el("div", "room-head");
    const title = el("b");
    title.textContent = t("roomOf")(host?.name ?? "Player");
    head.append(title, el("span", "lobby-badge", `${room.members.length}/${room.size}`));
    card.append(head);
    if (room.code) {
      const code = el("div", "room-code");
      const label = el("span", null, esc(t("codeLabel")));
      const value = el("b");
      value.textContent = room.code;
      const copy = el("button", "btn-ghost btn-small", esc(t("copyCode")));
      copy.type = "button";
      copy.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(room.code); } catch {}
        toast(t("codeCopied"));
      });
      code.append(label, value, copy);
      card.append(code);
    }
    const seats = el("ul", "room-members");
    for (let i = 0; i < room.size; i++) {
      const m = room.members[i];
      const li = el("li", m ? "is-taken" : "is-free");
      li.append(el("span", "room-seat", String(i + 1)));
      li.append(window.DLE_NAME(m ? (m.id === rooms.selfId ? `${m.name} (${t("you")})` : m.name) : t("freeSeat"), m ? rooms.pidOf(m.id) : null));
      if (m && m.id === room.host) li.append(el("span", "lobby-badge", esc(t("host"))));
      seats.append(li);
    }
    card.append(seats);
    // The game variant (the host picks it with the tabs above) and the teams.
    const variant = el("p", "room-play");
    variant.append(el("span", null, esc(t("playLabel"))), el("b", null, esc(t(PLAY_LABEL[room.meta?.play ?? "classic"]))));
    if (!rooms.isHost()) variant.append(el("small", "muted", esc(t("hostPicks"))));
    // Turn by turn or a free race (the host chooses).
    const turns = room.meta?.turns !== false;
    const how = el("div", "room-turns");
    for (const [on, label] of [[true, t("turnMode")], [false, t("raceMode")]]) {
      const b = el("button", `size-pick room-turn-pick${turns === on ? " is-active" : ""}`, esc(label));
      b.type = "button";
      b.disabled = !rooms.isHost();
      b.setAttribute("aria-pressed", turns === on);
      b.addEventListener("click", () => rooms.setMeta({ turns: on }));
      how.append(b);
    }
    card.append(variant, how, el("p", "muted room-turns-help", esc(turns ? t("turnHelp") : t("raceHelpShort"))), rooms.teamsBox());
    const actions = el("div", "result-actions");
    if (rooms.isHost()) {
      const start = el("button", "btn-primary", esc(t("startRace")));
      start.type = "button";
      start.disabled = room.members.length < 2;
      start.addEventListener("click", () => rooms.start());
      actions.append(start);
      if (room.members.length < 2) card.append(el("p", "muted", esc(t("needTwo"))));
    } else {
      const w = el("p", "lobby-waiting");
      w.append(el("span", "spinner"));
      w.append(t("waitHost"));
      card.append(w);
    }
    const leave = el("button", "btn-ghost", esc(t("leave")));
    leave.type = "button";
    leave.addEventListener("click", () => rooms.leave());
    actions.append(leave);
    const link = el("button", "btn-ghost", esc(t("copyInvite")));
    link.type = "button";
    link.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(inviteLink(room)); } catch {}
      toast(t("inviteCopied"));
    });
    actions.append(link);
    card.append(actions, rooms.chatBox());
    box.append(card);
    racePeers(box);
    return;
  }

  const create = el("div", "room-create");
  create.append(el("span", "room-label", esc(t("players"))));
  const sizes = el("div", "size-picker");
  for (const n of SIZES) {
    const b = el("button", `size-pick${n === raceSize ? " is-active" : ""}`, String(n));
    b.type = "button";
    b.setAttribute("aria-pressed", n === raceSize);
    b.addEventListener("click", () => { raceSize = n; renderRace(); });
    sizes.append(b);
  }
  const go = el("button", "btn-primary", esc(t("createRoom")));
  go.type = "button";
  go.addEventListener("click", () => { if (!needName()) rooms.createRoom({ game: CFG.id, size: raceSize, play: settings.play }); });
  create.append(sizes, go);
  box.append(create);

  box.append(el("h3", "room-title", esc(t("openRooms"))));
  const open = rooms.openRooms();
  if (!open.length) box.append(el("p", "muted lobby-empty", esc(t("noRooms"))));
  const list = el("ul", "lobby-list");
  open.sort((a, b) => Number(b.game === CFG.id) - Number(a.game === CFG.id));
  for (const r of open) {
    const g = (window.DLE_GAMES || []).find((x) => x.id === r.game);
    const li = el("li", `lobby-player${r.game === CFG.id ? " same-game" : ""}`);
    if (g) { const img = el("img"); img.src = `../${g.logo}`; img.alt = ""; img.title = g.anime; li.append(img); }
    const host = r.members.find((m) => m.id === r.host);
    const label = el("span", "lobby-pname");
    label.textContent = t("roomOf")(host?.name ?? "Player");
    if (g) { const small = el("small", "lobby-anime"); small.textContent = g.anime; label.append(small); }
    li.append(label, el("span", "lobby-badge", `${r.members.length}/${r.size}`));
    const join = el("button", "btn-primary btn-small", esc(t("join")));
    join.type = "button";
    join.addEventListener("click", () => { if (!needName()) joinRaceRoom(r); });
    li.append(join);
    list.append(li);
  }
  box.append(list);
  racePeers(box);
}
