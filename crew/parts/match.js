// An online match: turns, live boards, the end and coming back after a reload.

import { S } from "./state.js";
import { $, GAMES, REROLLS, duelScore, el, filledOf, fitsIn, icon, loadGame, makePool, makeSlots, openSlots, pointsFor, t, toast, wait } from "./base.js";
import { countUp, fly, sfx } from "./fx.js";
import { makeReel } from "./reel.js";
import { popSlot, renderBoard, slotFace } from "./board.js";
import { renderPicker, selectGame } from "./picker.js";
import { draw, resultBlock } from "./solo.js";
import { cleanName, memberName, myName, renderLobby, rooms } from "./lobby.js";
import { setMode } from "../crew.js";

// ── Match ──
// Turn by turn: one player rolls (with their own rerolls) and places, everyone watches the roll
// and the placement, then the next player goes. The match ends when every board is done.
const TURN_MS = 45000; // a player who doesn't move in time is played for automatically
export async function startMatch(room, data) {
  const g = GAMES.find((x) => x.id === room.game);
  if (!g) return;
  if (S.currentGame.id !== g.id) await selectGame(g.id, { quiet: true });
  const gameData = await loadGame(g);
  const arc = Math.min(Number.isInteger(data.arc) ? data.arc : 0, gameData.config.arcs.length - 1);
  const pool = makePool(g, gameData, arc);
  const ids = room.members.map((m) => m.id);
  const teams = data.teams && typeof data.teams === "object" ? Object.fromEntries(ids.map((id) => [id, data.teams[id] === 1 ? 1 : 0])) : null;
  // Team vs team: one board per team, its players take turns on it; the turns alternate between the teams.
  const keys = teams ? [0, 1].filter((k) => ids.some((id) => teams[id] === k)).map((k) => `team-${k}`) : ids;
  let order = [...ids];
  if (teams) {
    const side = [0, 1].map((k) => ids.filter((id) => teams[id] === k));
    order = [];
    for (let i = 0; i < Math.max(side[0].length, side[1].length); i++) for (const k of [0, 1]) if (side[k][i]) order.push(side[k][i]);
  }
  S.match = {
    room, g, pool, ids, arc, config: gameData.config,
    names: new Map(room.members.map((m) => [m.id, m.id === rooms.selfId ? myName() || t("you") : m.name])),
    boards: new Map(keys.map((k) => [k, makeSlots(g, pool)])),
    active: new Set(ids),
    finished: new Set(),
    claims: new Map(), // playerId → character they have rolled and not placed yet
    rolled: null, rerolls: REROLLS, rolling: false, done: false, starting: true,
    key: String(data.key ?? ""), // tells this match's messages from the previous one's
    order, current: null, show: Promise.resolve(),
    // Team vs team: each player's team (0 red, 1 blue), and the team's board is the one its players fill.
    teams,
  };
  rooms.keepSeat = true;
  renderPicker();
  renderMatch();
  const others = ids.filter((id) => id !== rooms.selfId).map(memberName);
  await vsSplash(memberName(rooms.selfId), others.join(" · "));
  if (!S.match || S.match.room.id !== room.id) return;
  S.match.starting = false;
  // Everyone picks the same first player from the match key.
  const seed = [...S.match.key].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  setTurn(order[seed % order.length]);
  startBeat(S.match);
}

// The board a player fills: their own, or their team's in team vs team.
const boardKey = (id) => (S.match?.teams ? `team-${S.match.teams[id] ?? 0}` : id);
const boardOf = (id) => S.match.boards.get(boardKey(id));
const teammates = (id) => S.match.ids.filter((x) => boardKey(x) === boardKey(id));
// Where a board is drawn: mine (full size) or one of the others (small).
function boardBox(key) {
  if (key === boardKey(rooms.selfId)) return { box: $("#duelMine"), mini: false };
  return { box: document.querySelector(`[data-board="${CSS.escape(key)}"]`), mini: true };
}
// A board's label as an element: a team's name and players, or the player's (shining for the top 3).
function labelEl(key, cls) {
  const p = el("p", cls);
  if (S.match.teams && key.startsWith("team-")) p.textContent = boardLabel(key);
  else p.append(window.DLE_NAME(memberName(key), rooms.pidOf(key)));
  return p;
}
const boardLabel = (key) => {
  if (!S.match.teams || !key.startsWith("team-")) return memberName(key);
  const k = Number(key.slice(5));
  return `${rooms.teamNames()[k]} · ${S.match.ids.filter((id) => S.match.teams[id] === k).map(memberName).join(" & ")}`;
};

// ── Turns ──
const myTurn = () => !!S.match && S.match.current === rooms.selfId;
const stillPlaying = (id) => S.match.active.has(id) && !S.match.finished.has(id);
// A player behind everyone else (joined late) plays again and again until caught up, then the usual turns resume.
function laggard() {
  if (S.match.teams) return null;
  const live = S.match.order.filter(stillPlaying);
  if (live.length < 2) return null;
  const count = (id) => filledOf(boardOf(id)).length;
  return live.find((id) => count(id) < Math.min(...live.filter((x) => x !== id).map(count))) ?? null;
}
function nextAfter(id) {
  const lag = laggard();
  if (lag) return lag;
  const o = S.match.order;
  const i = o.indexOf(id);
  for (let k = 1; k <= o.length; k++) { const x = o[(i + k) % o.length]; if (stillPlaying(x)) return x; }
  return null;
}
function setTurn(id) {
  const run = S.match;
  if (!run || run.done) return;
  if (id && !stillPlaying(id)) id = nextAfter(id);
  run.current = id;
  clearInterval(run.timer);
  renderScoreboard();
  if (!id) { checkMatchEnd(); return; }
  if (id !== rooms.selfId) {
    if (!run.spectating) S.matchReel.idle(t("turnOf")(memberName(id)));
    renderMatchActions();
    return;
  }
  // My turn: maybe nothing fits anymore, then I'm done.
  if (!matchCandidates().length) { markDone(); return; }
  sfx("whoosh");
  toast(t("yourTurn"));
  S.matchReel.idle(t("yourTurn"));
  run.deadline = Date.now() + TURN_MS;
  run.timer = setInterval(() => {
    if (S.match !== run || !myTurn()) { clearInterval(run.timer); return; }
    const left = Math.ceil((run.deadline - Date.now()) / 1000);
    const clock = $("#turnClock");
    if (clock) clock.textContent = t("autoIn")(Math.max(0, left));
    if (left <= 0) { clearInterval(run.timer); autoPlay(); }
  }, 500);
  renderMatchActions();
}

// Out of time: roll if needed, then take the place worth the most points.
async function autoPlay() {
  const run = S.match;
  if (!myTurn() || run.rolling || run.placing) return;
  if (!run.rolled) await matchRoll(false);
  if (S.match !== run || !run.rolled) return;
  const board = myBoard();
  let best = -1;
  board.forEach((slot, i) => {
    if (slot.char || slot.locked || !slot.def.fits(run.rolled)) return;
    if (best < 0 || pointsFor(slot, run.rolled) > pointsFor(board[best], run.rolled)) best = i;
  });
  if (best >= 0) matchPlace(best);
  else matchRoll(false, true);
}

// Another player's roll and placement play out in my reel, one after the other.
function spectate(task) {
  const run = S.match;
  // A tab in the background pauses animations: never let one of them hold the turns for more than a few seconds.
  run.show = run.show.then(() => (S.match === run ? Promise.race([task(), wait(document.hidden ? 300 : 7000)]) : null)).catch(() => {});
  return run.show;
}

// ── Keeping everyone on the same turn ──
// Every few seconds each player tells the room what they see: their board, whose turn it is and how many
// placements they know of. A player who missed something fills it in and takes the turn of whoever saw the most;
// on a tie, the host's view wins. A lost message or a stuck tab can't leave the room waiting on the wrong player.
function startBeat(run) {
  clearInterval(run.beat);
  run.beat = setInterval(() => {
    if (S.match !== run || run.done) { clearInterval(run.beat); return; }
    rooms.broadcast("beat", { key: run.key, current: run.current, moves: movesSeen(), board: myPairs(), finished: run.finished.has(rooms.selfId) });
  }, 4000);
}

function onBeat(d, from) {
  const run = S.match;
  if (run.done || run.starting || String(d.key) !== run.key) return;
  const before = movesSeen();
  if (Array.isArray(d.board)) fillBoard(from, d.board);
  if (d.finished === true && !run.finished.has(from)) {
    for (const id of teammates(from)) run.finished.add(id);
    renderScoreboard();
    checkMatchEnd();
    if (run.done) return;
  }
  const theirs = Number(d.moves) || 0;
  const current = typeof d.current === "string" && run.ids.includes(d.current) ? d.current : null;
  if (!current || current === run.current) return;
  // Mid-turn (a roll spinning, a portrait flying) the views differ for a moment: don't fight over it.
  if (run.rolling || run.placing || run.spectating || (myTurn() && run.rolled)) return;
  const fromHost = from === run.room.host || from === rooms.myRoom?.host;
  if (theirs > before || (theirs === before && fromHost)) setTurn(current);
}

function vsSplash(a, b) {
  const s = el("div", "vs-splash");
  s.append(el("span", "vs-name vs-left", a), el("span", "vs-mark", t("vs")), el("span", "vs-name vs-right", b));
  document.body.append(s);
  return wait(2200)
    .then(() => { s.classList.add("is-out"); return wait(350); })
    .then(() => s.remove());
}

const myBoard = () => boardOf(rooms.selfId);

// Taken: placed on any board, or currently rolled by another player.
function takenIds() {
  const ids = new Set();
  for (const board of S.match.boards.values()) for (const s of filledOf(board)) ids.add(s.char.id);
  for (const [id, charId] of S.match.claims) if (id !== rooms.selfId) ids.add(charId);
  return ids;
}

function matchCandidates(exclude) {
  const board = myBoard();
  const taken = takenIds();
  const free = S.match.pool.filter((c) => !taken.has(c.id) && c.id !== exclude && fitsIn(board, c));
  if (free.length) return free;
  // The others hold every character left for my places (e.g. the only god at this arc):
  // share them rather than leave a place that can never be filled. Never twice on my board.
  const mine = new Set(filledOf(board).map((x) => x.char.id));
  const shared = S.match.pool.filter((c) => !mine.has(c.id) && c.id !== exclude && fitsIn(board, c));
  shared.shared = true; // nobody "steals" a shared character
  return shared;
}

// Two players rolled the same character at the same moment: the smaller id keeps it,
// the other one gets a free roll.
function lostClaim(c) {
  for (const [id, charId] of S.match.claims) if (id !== rooms.selfId && charId === c.id && id < rooms.selfId) return id;
  return null;
}

function onStolen(byId) {
  toast(t("taken")(memberName(byId)));
  S.match.rolled = null;
  S.match.rolling = false;
  S.matchReel.idle();
  renderBoard($("#duelMine"), myBoard());
  matchRoll(false, true);
}

async function matchRoll(isReroll, free = false) {
  const run = S.match;
  if (!run || run.rolling || run.placing || run.done || run.starting || run.finished.has(rooms.selfId) || !myTurn()) return;
  let list = matchCandidates(run.rolled?.id);
  if (!list.length && run.rolled) list = matchCandidates();
  if (!list.length) return markDone();
  if (isReroll && !free) run.rerolls--;
  window.DLE_Profile?.count(isReroll && !free ? "rerolls" : "rolls");
  const pick = draw(list, myBoard());
  run.claims.set(rooms.selfId, pick.id);
  rooms.broadcast("claim", { charId: pick.id });
  run.rolling = true;
  run.rolled = null;
  renderMatchActions();
  renderBoard($("#duelMine"), myBoard());
  await S.matchReel.spin(list, pick, { game: S.match.g.id, arc: S.match.arc });
  if (S.match !== run || run.done) return;
  run.rolledShared = !!list.shared;
  const winner = !list.shared && lostClaim(pick);
  if (winner) return onStolen(winner);
  run.rolling = false;
  // Safety net: taken meanwhile, or no slot left for it: redraw for free.
  if (!fitsIn(myBoard(), pick) || filledOf(myBoard()).some((x) => x.char.id === pick.id) || (!list.shared && !matchCandidates().some((x) => x.id === pick.id))) {
    run.claims.delete(rooms.selfId);
    return matchRoll(false, true);
  }
  run.rolled = pick;
  S.matchReel.hint(t("chooseSlot"));
  renderBoard($("#duelMine"), myBoard(), { rolled: pick, onPlace: matchPlace });
  renderMatchActions();
}

async function matchPlace(i) {
  const run = S.match;
  const c = run?.rolled;
  if (!c) return;
  run.rolled = null;
  run.placing = true;
  S.matchReel.hint("");
  renderMatchActions();
  const target = slotFace($("#duelMine"), i);
  renderBoard($("#duelMine"), myBoard());
  await fly(S.matchReel.window, target, c.formImage || c.image);
  run.placing = false;
  if (S.match !== run) return;
  const slot = myBoard()[i];
  slot.char = c;
  slot.points = pointsFor(slot, c);
  S.matchReel.idle();
  renderBoard($("#duelMine"), myBoard());
  popSlot($("#duelMine"), i, slot.points);
  run.claims.delete(rooms.selfId);
  rooms.broadcast("place", { slot: i, charId: c.id });
  renderScoreboard();
  if (!openSlots(myBoard()).length || !matchCandidates().length) markDone();
  else setTurn(nextAfter(rooms.selfId));
}

// "I'm done" with my whole board. A lost message would leave the others waiting forever, so it is
// sent again every few seconds for a minute (even after the ranking); receiving it twice is harmless.
function markDone() {
  if (!S.match || S.match.finished.has(rooms.selfId)) return;
  const run = S.match;
  for (const id of teammates(rooms.selfId)) run.finished.add(id);
  const sendDone = () => rooms.broadcast("done", { key: run.key, board: myBoard().map((s, i) => (s.char ? [i, s.char.id] : null)).filter(Boolean) });
  sendDone();
  let left = 20;
  const timer = setInterval(() => { if (S.match !== run || --left <= 0) clearInterval(timer); else sendDone(); }, 3000);
  S.matchReel.idle(t("waitOthers"));
  clearInterval(run.timer);
  if (run.current === rooms.selfId) setTurn(nextAfter(rooms.selfId));
  renderMatchActions();
  renderScoreboard();
  checkMatchEnd();
}

function checkMatchEnd() {
  if (S.match && !S.match.done && [...S.match.active].every((id) => S.match.finished.has(id))) finishMatch();
}

function renderMatchActions() {
  const box = $("#matchActions");
  if (!box || !S.match) return;
  box.textContent = "";
  if (S.match.done || S.match.starting || S.match.finished.has(rooms.selfId)) return;
  if (!myTurn()) {
    const w = el("p", "lobby-waiting");
    w.append(el("span", "spinner"), S.match.current ? t("turnOf")(memberName(S.match.current)) : t("waitOthers"));
    box.append(w);
    return;
  }
  const clock = el("p", "turn-clock", t("autoIn")(Math.max(0, Math.ceil((S.match.deadline - Date.now()) / 1000))));
  clock.id = "turnClock";
  box.append(clock);
  if (!S.match.rolled) {
    const b = el("button", "btn-primary roll-btn", S.match.rolling ? t("rolling") : t("roll"));
    b.prepend(icon("dice"));
    b.type = "button";
    b.disabled = S.match.rolling || S.match.placing;
    b.addEventListener("click", () => matchRoll(false));
    box.append(b);
  } else {
    const stuck = !fitsIn(myBoard(), S.match.rolled);
    const b = el("button", "btn-ghost", stuck ? t("skip") : t("reroll")(S.match.rerolls));
    b.type = "button";
    b.disabled = !stuck && S.match.rerolls <= 0;
    b.addEventListener("click", () => matchRoll(!stuck, stuck));
    box.append(b);
  }
}

// Places filled on any board: tells who has seen the most of the match.
const movesSeen = () => [...S.match.boards.values()].reduce((a, b) => a + filledOf(b).length, 0);
// Fill in placements of a player that I missed (lost message, link dropped for a moment).
function fillBoard(from, pairs) {
  const board = boardOf(from);
  let changed = false;
  for (const pair of pairs.slice(0, board.length)) {
    const [i, charId] = Array.isArray(pair) ? pair : [];
    const slot = board[i];
    const c = S.match.pool.find((x) => x.id === charId);
    if (c && slot && !slot.char && !slot.locked && slot.def.fits(c) && !board.some((s) => s.char?.id === c.id)) {
      slot.char = c;
      slot.points = pointsFor(slot, c);
      changed = true;
    }
  }
  if (changed) {
    const { box, mini } = boardBox(boardKey(from));
    if (box) renderBoard(box, board, { mini });
  }
}
const myPairs = () => myBoard().map((s, i) => (s.char ? [i, s.char.id] : null)).filter(Boolean);

export function onMatchMessage(type, d, from) {
  // Coming back after a reload: the first full state that answers my request rebuilds the match.
  if (type === "state") {
    if (S.resume && !S.match && d && (S.resume.key == null || String(d.key) === S.resume.key)) resumeMatch(d);
    return;
  }
  if (type === "renamed") { renameInMatch(String(d.old ?? ""), String(d.now ?? "")); return; }
  if (!S.match || !S.match.ids.includes(from)) return;
  if (type === "beat") { onBeat(d, from); return; }
  if (type === "joined") { addLatePlayer(d); return; }
  if (type === "want") {
    // A late joiner doesn't know the key yet.
    if (d.key == null || String(d.key) === S.match.key) rooms.broadcast("state", matchState());
    return;
  }
  if (type === "rejoin") {
    // Their link dropped for a moment: send them my board and whose turn it is.
    rooms.broadcast("sync", { key: S.match.key, board: myPairs(), current: S.match.current, moves: movesSeen(), finished: S.match.finished.has(rooms.selfId) });
    return;
  }
  if (type === "sync") {
    if (d.key != null && String(d.key) !== S.match.key) return;
    const before = movesSeen();
    if (Array.isArray(d.board) && !S.match.done) fillBoard(from, d.board);
    if (d.finished === true && !S.match.finished.has(from)) S.match.finished.add(from);
    // They saw more of the match than I did: trust their idea of whose turn it is.
    if (Number(d.moves) > before && S.match.ids.includes(d.current) && !S.match.done) setTurn(d.current);
    renderScoreboard();
    checkMatchEnd();
    return;
  }
  if (type === "claim") {
    if (typeof d.charId !== "string") return;
    S.match.claims.set(from, d.charId);
    // They rolled the character I'm holding at the same moment and they win the tie.
    const mine = S.match.rolled ?? null;
    if (mine && !S.match.rolledShared && mine.id === d.charId && from < rooms.selfId) onStolen(from);
    // Their roll spins in my reel too.
    const c = S.match.pool.find((x) => x.id === d.charId);
    if (c && from === S.match.current && !myTurn()) {
      const run = S.match;
      spectate(async () => {
        run.spectating = true;
        const board = boardOf(from);
        const list = run.pool.filter((x) => fitsIn(board, x));
        await S.matchReel.spin(list.length ? list : [c], c, { game: run.g.id, arc: run.arc });
        if (S.match === run) S.matchReel.hint(t("turnOf")(memberName(from)));
      });
    }
    return;
  }
  if (type === "place") {
    S.match.claims.delete(from);
    const c = S.match.pool.find((x) => x.id === d.charId);
    const board = boardOf(from);
    const i = Number(d.slot);
    const slot = board[i];
    if (c && slot && !slot.char && !slot.locked && slot.def.fits(c) && !board.some((s) => s.char?.id === c.id)) {
      // Reserve the place now (so a late "done" doesn't fill it twice), show it after their roll.
      slot.char = c;
      slot.points = pointsFor(slot, c);
      slot.pending = true;
      const run = S.match;
      spectate(async () => {
        const { box, mini } = boardBox(boardKey(from));
        if (box) {
          await fly(S.matchReel.window, slotFace(box, i) || box, c.formImage || c.image);
        }
        slot.pending = false;
        run.spectating = false;
        if (S.match !== run) return;
        if (box) { renderBoard(box, board, { mini }); popSlot(box, i, slot.points); }
        renderScoreboard();
        if (!myTurn()) S.matchReel.idle(run.current ? t("turnOf")(memberName(run.current)) : t("waitOthers"));
      });
    }
    // Their turn is over; the next one starts once their placement has been shown.
    if (S.match.current === from) {
      const next = nextAfter(from);
      S.match.current = next;
      spectate(() => { if (S.match.current === next) setTurn(next); });
    }
  } else if (type === "done") {
    if (d.key != null && String(d.key) !== S.match.key) return;
    if (S.match.finished.has(from)) return;
    S.match.claims.delete(from);
    // Fill in any placement whose message was lost.
    const board = boardOf(from);
    if (Array.isArray(d.board) && !S.match.done) {
      for (const pair of d.board.slice(0, board.length)) {
        const [i, charId] = Array.isArray(pair) ? pair : [];
        const slot = board[i];
        const c = S.match.pool.find((x) => x.id === charId);
        if (c && slot && !slot.char && !slot.locked && slot.def.fits(c) && !board.some((s) => s.char?.id === c.id)) {
          slot.char = c;
          slot.points = pointsFor(slot, c);
        }
      }
      const { box, mini } = boardBox(boardKey(from));
      if (box) renderBoard(box, board, { mini });
    }
    // A shared board is done for the whole team.
    for (const id of teammates(from)) S.match.finished.add(id);
    if (S.match.current === from) setTurn(nextAfter(from));
    renderScoreboard();
    checkMatchEnd();
  } else if (type === "left") {
    S.match.active.delete(from);
    if (S.match.current === from) setTurn(nextAfter(from));
    renderScoreboard();
    checkMatchEnd();
  }
}

function addLatePlayer(d) {
  const m = S.match;
  const id = typeof d?.id === "string" ? d.id : null;
  if (!m || m.done || !id || m.ids.includes(id)) return;
  m.ids.push(id);
  m.order.push(id);
  m.names.set(id, cleanName(d.name) || "Player");
  m.active.add(id);
  if (m.teams) m.teams[id] = d.team === 1 ? 1 : 0;
  if (!m.boards.has(boardKey(id))) m.boards.set(boardKey(id), makeSlots(m.g, m.pool));
  toast(t("lateJoined")(m.names.get(id)));
  // Redraw once nothing is moving on screen.
  spectate(async () => { if (S.match === m && !m.rolling && !m.placing) { renderMatch(); renderMatchActions(); } });
}

// ── Back after a reload ──
// The whole match as I see it, for a player who reloaded their page.
const pairsOf = (board) => board.map((x, i) => (x.char ? [i, x.char.id] : null)).filter(Boolean);
function matchState() {
  const m = S.match;
  return {
    key: m.key, arc: m.arc, ids: m.ids, order: m.order, teams: m.teams, current: m.current,
    finished: [...m.finished], active: [...m.active], done: m.done,
    boards: Object.fromEntries([...m.boards].map(([k, b]) => [k, pairsOf(b)])),
  };
}

// A player came back with a new id (or I did, as seen by the others): swap it everywhere in the match.
function renameInMatch(old, now) {
  const m = S.match;
  if (!m || !old || !now || old === now || !m.ids.includes(old)) return;
  const sw = (id) => (id === old ? now : id);
  m.ids = m.ids.map(sw);
  m.order = m.order.map(sw);
  for (const map of [m.names, m.claims, m.shown, m.boards]) if (map?.has(old)) { map.set(now, map.get(old)); map.delete(old); }
  for (const set of [m.active, m.finished]) if (set.has(old)) { set.delete(old); set.add(now); }
  if (m.teams && old in m.teams) { m.teams[now] = m.teams[old]; delete m.teams[old]; }
  if (m.current === old) m.current = now;
  if (rooms.myRoom) m.room = rooms.myRoom;
  const box = document.querySelector(`[data-board="${CSS.escape(old)}"]`);
  if (box) box.dataset.board = now;
  renderScoreboard();
  renderMatchActions();
}

// Back in the room after a reload: ask the others for the match, again until one answers.
S.resume = null;
export function askResume(room, data) {
  if (!data || S.match) return;
  if (S.mode !== "online") setMode("online");
  const key = data.key == null ? null : String(data.key);
  S.resume = { room, data, key };
  renderLobby();
  let n = 0;
  const ask = () => {
    if (!S.resume || S.match || S.resume.key !== key) return;
    if (++n > 15) { S.resume = null; toast(t("rejoinFailed")); rooms.leave(); renderLobby(); return; }
    rooms.broadcast("want", { key: S.resume.key });
    setTimeout(ask, 2000);
  };
  ask();
}

async function resumeMatch(st) {
  const { room } = S.resume;
  const g = GAMES.find((x) => x.id === room.game);
  if (!g || !Array.isArray(st.ids) || !st.ids.includes(rooms.selfId)) return;
  S.resume.loading = true;
  if (S.currentGame.id !== g.id) await selectGame(g.id, { quiet: true });
  const gameData = await loadGame(g);
  if (!S.resume || S.match) return;
  const arc = Math.min(Number.isInteger(st.arc) ? st.arc : 0, gameData.config.arcs.length - 1);
  const pool = makePool(g, gameData, arc);
  const ids = st.ids.map(String);
  const teams = st.teams && typeof st.teams === "object" ? Object.fromEntries(ids.map((id) => [id, st.teams[id] === 1 ? 1 : 0])) : null;
  const boards = new Map();
  for (const [k, pairs] of Object.entries(st.boards ?? {})) {
    const board = makeSlots(g, pool);
    for (const pair of Array.isArray(pairs) ? pairs.slice(0, board.length) : []) {
      const [i, charId] = Array.isArray(pair) ? pair : [];
      const slot = board[i];
      const c = pool.find((x) => x.id === charId);
      if (c && slot && !slot.char && !slot.locked && slot.def.fits(c)) { slot.char = c; slot.points = pointsFor(slot, c); }
    }
    boards.set(String(k), board);
  }
  let rerolls = REROLLS;
  try {
    const saved = JSON.parse(sessionStorage.getItem("dle:crew-rerolls") || "null");
    if (saved?.key === st.key && Number.isInteger(saved.rerolls)) rerolls = Math.max(0, Math.min(REROLLS, saved.rerolls));
  } catch {}
  const names = new Map((rooms.myRoom ?? room).members.map((m) => [m.id, m.id === rooms.selfId ? myName() || t("you") : m.name]));
  S.match = {
    room: rooms.myRoom ?? room, g, pool, ids, arc, config: gameData.config, names, boards,
    active: new Set((st.active ?? ids).map(String)),
    finished: new Set((st.finished ?? []).map(String)),
    claims: new Map(),
    rolled: null, rerolls, rolling: false, done: false, starting: false,
    key: String(st.key), order: (st.order ?? ids).map(String), current: null, show: Promise.resolve(), teams,
  };
  S.resume = null;
  rooms.keepSeat = true;
  renderPicker();
  renderMatch();
  toast(t("rejoined"));
  if (st.done) { finishMatch(); return; }
  setTurn(ids.includes(st.current) ? st.current : S.match.order.find((id) => S.match.active.has(id) && !S.match.finished.has(id)) ?? null);
  startBeat(S.match);
  checkMatchEnd();
}

// My rerolls left, kept in the tab for a reload.
window.addEventListener("pagehide", () => {
  if (!S.match || S.match.done) return;
  try { sessionStorage.setItem("dle:crew-rerolls", JSON.stringify({ key: S.match.key, rerolls: S.match.rerolls })); } catch {}
});

const scores = () => S.match.ids.map((id) => ({ id, name: memberName(id), score: duelScore(boardOf(id)), left: !S.match.active.has(id) }))
  .sort((a, b) => b.score - a.score);

function teamScores(live = false) {
  // Each team scores its own board.
  return [0, 1].map((k) => {
    const board = S.match.boards.get(`team-${k}`);
    if (!board) return 0;
    return duelScore(live ? board.map((x) => (x.pending ? { ...x, char: null, points: 0 } : x)) : board);
  });
}

export function finishMatch() {
  if (!S.match || S.match.done) return;
  S.match.done = true;
  S.match.current = null;
  clearInterval(S.match.timer);
  rooms.clearRejoin();
  renderScoreboard();
  const mine = myBoard();
  renderBoard($("#duelMine"), mine);
  const ranking = scores();
  // Equal scores share a place.
  const myScore = duelScore(myBoard());
  const place = 1 + ranking.filter((r) => r.score > myScore + 1e-9).length;
  const tiedTop = place === 1 && ranking.filter((r) => Math.abs(r.score - myScore) < 1e-9).length > 1;
  const panel = $("#duelPanel");
  panel.textContent = "";
  let kind = tiedTop ? "draw" : place === 1 ? "win" : place === ranking.length ? "lose" : "draw";
  let text = tiedTop ? t("tie") : t("youPlace")(place);
  // Team vs team: my team's average decides.
  if (S.match.teams) {
    const sc = teamScores();
    const mineK = S.match.teams[rooms.selfId] ?? 0;
    const draw = Math.abs(sc[0] - sc[1]) < 1e-9;
    kind = draw ? "draw" : sc[mineK] > sc[1 - mineK] ? "win" : "lose";
    text = draw ? t("teamDraw") : t("teamWins")(rooms.teamNames()[sc[0] > sc[1] ? 0 : 1]);
    // The team leaderboard: only teams the host named (the default red / blue are everyone's).
    const chosen = rooms.myRoom?.meta?.names?.[mineK] || S.match.room?.meta?.names?.[mineK];
    if (chosen) window.DLE_Profile?.recordTeam?.({ name: chosen, won: kind === "win", score: sc[mineK] });
  }
  window.DLE_Profile?.recordDuel(kind === "win");
  const actions = [[t("leave"), "btn-ghost", leaveMatch]];
  if (!S.match.closedByHost) actions.push([t("backRoom"), "btn-primary", backToRoom]);
  panel.append(resultBlock(duelScore(mine), mine, { title: t("finalRanking"), outcome: { kind, text }, actions }));
  const list = el("ol", "ranking");
  for (const r of ranking) {
    const li = el("li", `${r.id === rooms.selfId ? "is-me" : ""}${S.match.teams ? ` team-${S.match.teams[r.id] ?? 0}` : ""}`);
    li.append(window.DLE_NAME(r.left ? `${r.name} (${t("left")})` : r.name, rooms.pidOf(r.id), "ranking-name"), el("b", null, r.score.toFixed(1)));
    list.append(li);
  }
  panel.querySelector(".crew-result").insertBefore(list, panel.querySelector(".crew-result .roll-actions"));
  if (!S.match.closedByHost) panel.append(rooms.chatBox());
}

function leaveMatch() {
  S.match = null;
  rooms.leave();
  renderPicker();
  renderLobby();
}

export function backToRoom() {
  S.match = null;
  if (rooms.isHost()) rooms.reopen();
  renderPicker();
  renderLobby();
}

export function renderScoreboard() {
  if (!S.match) return;
  const box = $("#scoreboard");
  if (!box) return;
  box.textContent = "";
  // Team vs team: the two team averages, live.
  if (S.match.teams) {
    const sc = teamScores(true);
    const names = rooms.teamNames();
    const bar = el("div", "team-bar crew-team-bar");
    for (const k of [0, 1]) {
      const side = el("div", `team-side team-${k}${S.match.done && sc[k] > sc[1 - k] + 1e-9 ? " is-winner" : ""}`);
      side.append(el("span", "team-side-name", names[k]), el("b", "team-side-pts", sc[k].toFixed(1)));
      bar.append(side);
      if (k === 0) bar.append(el("span", "team-vs", "VS"));
    }
    box.append(bar);
  }
  for (const id of S.match.ids) {
    const chip = el("div", `score-chip${id === rooms.selfId ? " is-me" : ""}${S.match.active.has(id) ? "" : " has-left"}${id === S.match.current && !S.match.done ? " is-turn" : ""}${S.match.teams ? ` team-${S.match.teams[id] ?? 0}` : ""}`);
    const dot = el("span", `duel-state${S.match.finished.has(id) ? " is-done" : ""}`);
    const score = el("b", "duel-score");
    // Scores animate from the value shown last time.
    score.dataset.value = S.match.shown?.get(id) ?? 0;
    chip.append(dot, window.DLE_NAME(memberName(id), rooms.pidOf(id), "duel-pname"), score);
    box.append(chip);
    const value = duelScore(boardOf(id).map((x) => (x.pending ? { ...x, char: null, points: 0 } : x)));
    countUp(score, value);
    (S.match.shown ??= new Map()).set(id, value);
  }
  $("#duelRound").textContent = t("arcUsed")(S.match.config.arcs[S.match.arc][S.lang]);
}

export function renderMatch() {
  $("#lobby").hidden = true;
  const view = $("#duel");
  view.hidden = false;
  view.textContent = "";

  const head = el("div", "card duel-head");
  const round = el("span", "duel-round");
  round.id = "duelRound";
  const board = el("div", "scoreboard");
  board.id = "scoreboard";
  head.append(round, board);

  const grid = el("div", "duel-grid");
  const mine = el("div", "crew-board");
  mine.id = "duelMine";
  const panel = el("div", "card roll-panel");
  panel.id = "duelPanel";
  S.matchReel = makeReel();
  S.matchReel.idle();
  const actions = el("div", "roll-actions");
  actions.id = "matchActions";
  panel.append(S.matchReel.el, actions);
  // Two boards (1v1, or team vs team): side by side, the reel between them. More: theirs below mine.
  const duo = S.match.boards.size === 2;
  grid.classList.toggle("is-1v1", duo);
  if (duo) {
    const wrap = el("div", "duel-mine");
    wrap.append(labelEl(boardKey(rooms.selfId), "duel-label is-me"), mine);
    grid.append(wrap, panel);
  } else grid.append(mine, panel);

  const others = el("div", "others");
  for (const key of S.match.boards.keys()) {
    if (key === boardKey(rooms.selfId)) continue;
    const wrap = el("div", "duel-theirs");
    wrap.append(labelEl(key, "duel-label"));
    const b = el("div", "crew-board");
    b.dataset.board = key;
    wrap.append(b);
    (duo ? grid : others).append(wrap);
    renderBoard(b, S.match.boards.get(key), { mini: true, stagger: true });
  }
  view.append(head, grid);
  if (!duo) view.append(others);
  renderBoard(mine, myBoard(), { stagger: true });
  renderScoreboard();
}
