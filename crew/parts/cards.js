// Cards: the collection as an inventory (duplicates counted), trades with friends, and 1v1 card duels online.
//   Pack battle: both players open a free pack of the same anime, three times; the stronger pack wins each round.
//   Deck battle: each brings 5 cards (35 power at most) and plays one per round, with combos, the underdog rule and a double last round.
// Duels use their own online rooms (shared/rooms.js, channel "cards"), like Crew Roll's online mode.

import { S } from "./state.js";
import { $, CREW, DEFAULT_POWER, GAMES, ROOT, displayName, el, loadGame, t, toast, wait } from "./base.js";
import { burst, sfx, tierOf } from "./fx.js";
import { drawPack, packColours, packEl, spotlight } from "./boosters.js";

const PROFILE = () => window.DLE_Profile;
const CV = { sub: "inv", anime: "all", dupesOnly: false, trade: null, mode: "pack", size: 2 };
// Both battles take 2 to 8 players: free for all, or two teams from 3 players.
const SIZES = [2, 3, 4, 5, 6, 7, 8];
const roomSize = () => CV.size;
export let cardRooms = null;
S.cardMatch = null;

// ════════════════════ CARD DATA ════════════════════
// Name, power and portrait of every character of an anime, loaded once.
const metas = new Map();
function metaOf(gid) {
  if (!metas.has(gid)) {
    const g = GAMES.find((x) => x.id === gid);
    metas.set(gid, !g ? Promise.resolve(new Map()) : loadGame(g).then((data) => {
      const m = new Map();
      for (const c of data.chars) {
        if (!c.image) continue;
        m.set(c.id, { n: displayName(data.config, c.name), p: CREW[gid]?.power?.[c.id] ?? c.power ?? DEFAULT_POWER, image: `${ROOT}${g.path}${c.image}` });
      }
      return m;
    }));
  }
  return metas.get(gid);
}
const hasForm = (g, id) => !!window.CREW_FORMS?.[g]?.[id];

// Every card of a list of {g, id}, with its name, power and copies.
async function cardsOf(list, copiesOf = (g, id) => PROFILE()?.copiesOf?.(g, id) ?? 1) {
  const out = [];
  for (const { g, id } of list) {
    const m = (await metaOf(g)).get(id);
    if (m) out.push({ g, id, n: m.n, p: m.p, copies: copiesOf(g, id) });
  }
  return out;
}
// My collection: every card I own, strongest first.
async function myCards() {
  const list = [];
  for (const g of GAMES) for (const id of PROFILE()?.collectionOf?.(g.id) ?? []) list.push({ g: g.id, id });
  return (await cardsOf(list)).sort((a, b) => b.p - a.p || a.n.localeCompare(b.n));
}
const cardFace = (c, small = true) => PROFILE()?.card?.(c, { small }) ?? el("div");

// ════════════════════ VIEW ════════════════════
let token = 0;
export async function renderCards() {
  const view = $("#cardsView");
  if (!view || S.mode !== "cards") return;
  const mine = ++token;
  view.textContent = "";
  const head = el("section", "card cv-head");
  const tabs = el("div", "mode-tabs cv-tabs");
  const inMatch = S.cardMatch && !S.cardMatch.done;
  for (const [id, label] of [["inv", t("cInventory")], ["trade", t("cTrades")], ["duel", t("cDuels")]]) {
    const b = el("button", CV.sub === id ? "is-active" : "", label);
    b.type = "button";
    const n = id === "trade" ? PROFILE()?.trades?.().in.length ?? 0 : 0;
    if (n) b.append(el("span", "boost-tab-n", String(n)));
    b.disabled = inMatch && id !== "duel";
    b.addEventListener("click", () => { CV.sub = id; renderCards(); });
    tabs.append(b);
  }
  head.append(el("h2", "cv-title", t("cTitle")), el("p", "muted cv-sub", t("cSub")), tabs);
  view.append(head);
  const body = el("div", "cv-body");
  view.append(body);
  if (CV.sub === "trade") await tradeView(body, mine);
  else if (CV.sub === "duel") duelView(body);
  else await inventoryView(body, mine);
}

// ── Inventory ──
async function inventoryView(box, mine) {
  box.append(el("p", "muted cv-wait", "…"));
  const all = await myCards();
  if (mine !== token) return;
  box.textContent = "";
  const unique = all.length;
  const copies = all.reduce((a, c) => a + c.copies, 0);
  const stats = el("div", "card cv-stats");
  for (const [n, label] of [[unique, t("cUnique")], [copies, t("cCopies")], [copies - unique, t("cDupes")]]) {
    const s = el("div", "cv-stat");
    s.append(el("b", null, String(n)), el("span", null, label));
    stats.append(s);
  }
  box.append(stats);
  if (!all.length) {
    const empty = el("div", "card cv-empty");
    const go = el("a", "btn-primary", t("cGoBoosters"));
    go.href = "#boosters";
    empty.append(el("p", null, t("cNoCards")), go);
    box.append(empty);
    return;
  }
  // Filters: anime, duplicates only.
  const tools = el("div", "card cv-tools");
  const chips = el("div", "cv-anime");
  const chip = (id, content, title) => {
    const b = el("button", `cv-chip${CV.anime === id ? " is-active" : ""}`);
    b.type = "button";
    b.title = title;
    b.append(content);
    b.addEventListener("click", () => { CV.anime = id; renderCards(); });
    chips.append(b);
  };
  chip("all", t("allTiers"), t("allTiers"));
  for (const g of GAMES) {
    const n = all.filter((c) => c.g === g.id).length;
    if (!n) continue;
    const img = el("img");
    img.src = ROOT + g.logo;
    img.alt = "";
    const span = el("span", "cv-chip-n", String(n));
    const wrap = el("span", "cv-chip-in");
    wrap.append(img, span);
    chip(g.id, wrap, g.anime);
  }
  const dupes = el("button", `cv-chip cv-dupes${CV.dupesOnly ? " is-active" : ""}`, t("cOnlyDupes"));
  dupes.type = "button";
  dupes.addEventListener("click", () => { CV.dupesOnly = !CV.dupesOnly; renderCards(); });
  tools.append(chips, dupes);
  box.append(tools);
  const list = all.filter((c) => (CV.anime === "all" || c.g === CV.anime) && (!CV.dupesOnly || c.copies > 1));
  const grid = el("div", "cv-grid");
  if (!list.length) grid.append(el("p", "muted", t("noCard")));
  list.forEach((c, i) => {
    const cell = el("div", "cv-cell");
    if (i < 40) cell.style.animationDelay = `${i * 15}ms`;
    cell.append(cardFace(c));
    const acts = el("div", "cv-acts");
    const star = el("button", `cv-act${PROFILE()?.inShowcase?.(c.g, c.id) ? " is-on" : ""}`, "★");
    star.type = "button";
    star.title = t("bShow").replace("★ ", "");
    star.addEventListener("click", () => star.classList.toggle("is-on", !!PROFILE()?.toggleShowcase?.(c)));
    const trade = el("button", "cv-act", "⇄");
    trade.type = "button";
    trade.title = t("cTradeThis");
    trade.addEventListener("click", () => { CV.sub = "trade"; CV.trade = { step: "friend", give: c, want: undefined, friend: null }; renderCards(); });
    acts.append(star, trade);
    cell.append(acts);
    grid.append(cell);
  });
  box.append(grid);
}

// ════════════════════ TRADES ════════════════════
const tradeError = (e) => t("cTradeErr")[e?.code] ?? t("offline");
async function tradeView(box, mine) {
  const P = PROFILE();
  if (!P?.current) {
    const card = el("div", "card cv-empty");
    const go = el("button", "btn-primary", t("cMakeProfile"));
    go.type = "button";
    go.addEventListener("click", () => P?.open("profile"));
    card.append(el("p", null, t("cNeedProfile")), go);
    box.append(card);
    return;
  }
  // A trade being prepared.
  if (CV.trade) { await tradeBuilder(box, mine); return; }

  const start = el("button", "btn-primary cv-new-trade", `⇄ ${t("cNewTrade")}`);
  start.type = "button";
  start.addEventListener("click", () => { CV.trade = { step: "friend", give: null, want: undefined, friend: null }; renderCards(); });
  box.append(start);
  const { in: got, out: sent } = P.trades();
  // Offers I got: what I'd receive, what I'd give.
  box.append(el("h3", "cv-h", t("cGot")(got.length)));
  if (!got.length) box.append(el("p", "muted", t("cNoneGot")));
  for (const o of got) {
    const row = await offerRow(o, true);
    if (mine !== token) return;
    const yes = el("button", "btn-primary btn-small", t("cAccept"));
    const no = el("button", "btn-ghost btn-small", t("cDecline"));
    yes.type = no.type = "button";
    yes.addEventListener("click", async () => {
      yes.disabled = no.disabled = true;
      try { await P.tradeCall({ action: "trade-answer", tid: o.tid, accept: true }); sfx("win"); toast(t("cTradeOk")); }
      catch (e) { toast(tradeError(e)); P.loadTrades(); }
      renderCards();
    });
    no.addEventListener("click", async () => {
      yes.disabled = no.disabled = true;
      try { await P.tradeCall({ action: "trade-answer", tid: o.tid, accept: false }); } catch {}
      renderCards();
    });
    row.querySelector(".cv-offer-acts").append(yes, no);
    box.append(row);
  }
  box.append(el("h3", "cv-h", t("cSent")(sent.length)));
  if (!sent.length) box.append(el("p", "muted", t("cNoneSent")));
  for (const o of sent) {
    const row = await offerRow(o, false);
    if (mine !== token) return;
    const cancel = el("button", "btn-ghost btn-small", t("cCancel"));
    cancel.type = "button";
    cancel.addEventListener("click", async () => { cancel.disabled = true; try { await P.tradeCall({ action: "trade-cancel", tid: o.tid }); } catch {} renderCards(); });
    row.querySelector(".cv-offer-acts").append(cancel);
    box.append(row);
  }
}

// One offer: the two cards with arrows, from my side of the trade.
async function offerRow(o, toMe) {
  const row = el("div", "card cv-offer");
  const [give] = await cardsOf([o.give], () => 1);
  const [want] = o.want ? await cardsOf([o.want], () => 1) : [null];
  const who = toMe ? o.from?.name : o.to?.name;
  row.append(el("p", "cv-offer-who", toMe ? t("cOfferFrom")(who) : t("cOfferTo")(who)));
  const pair = el("div", "cv-pair");
  const side = (label, c) => {
    const s = el("div", "cv-side");
    s.append(el("span", "cv-side-label", label), c ? cardFace(c) : el("div", "cv-gift", "🎁"));
    return s;
  };
  // Toward me: I receive their "give" and give my card they "want".
  if (toMe) pair.append(side(t("cYouGet"), give), el("span", "cv-arrow", "⇄"), side(t("cYouGive"), want));
  else pair.append(side(t("cYouGive"), give), el("span", "cv-arrow", "⇄"), side(t("cYouGet"), want));
  row.append(pair, el("div", "cv-offer-acts"));
  return row;
}

// Prepare a trade: the friend, my card, their card (or nothing: a gift), then send.
async function tradeBuilder(box, mine) {
  const P = PROFILE();
  const tr = CV.trade;
  const back = el("button", "link-btn cv-back", `← ${t("back")}`);
  back.type = "button";
  back.addEventListener("click", () => { CV.trade = null; renderCards(); });
  box.append(back);
  // Summary of the offer so far.
  const sum = el("div", "card cv-builder");
  const step = (n, label, done, content, onEdit) => {
    const s = el("div", `cv-step${done ? " is-done" : ""}`);
    s.append(el("span", "cv-step-n", String(n)), el("b", null, label));
    if (content) s.append(content);
    if (done && onEdit) {
      const e = el("button", "link-btn", t("cChange"));
      e.type = "button";
      e.addEventListener("click", onEdit);
      s.append(e);
    }
    return s;
  };
  sum.append(
    step(1, t("cStepFriend"), !!tr.friend, tr.friend ? el("span", "cv-step-val", tr.friend.name) : null, () => { tr.friend = null; tr.want = undefined; tr.step = "friend"; renderCards(); }),
    step(2, t("cStepGive"), !!tr.give, tr.give ? el("span", "cv-step-val", `${tr.give.n} (${tr.give.p})`) : null, () => { tr.give = null; tr.step = "give"; renderCards(); }),
    step(3, t("cStepWant"), tr.want !== undefined, tr.want !== undefined ? el("span", "cv-step-val", tr.want ? `${tr.want.n} (${tr.want.p})` : t("cGift")) : null, () => { tr.want = undefined; tr.step = "want"; renderCards(); }),
  );
  box.append(sum);
  const next = () => (!tr.friend ? "friend" : !tr.give ? "give" : tr.want === undefined ? "want" : "send");
  tr.step = next();

  if (tr.step === "friend") {
    const friends = P.friends ?? [];
    box.append(el("h3", "cv-h", t("cPickFriend")));
    if (!friends.length) { box.append(el("p", "muted", t("cNoFriends"))); return; }
    const list = el("div", "cv-friends");
    for (const f of friends) {
      const b = el("button", "cv-friend");
      b.type = "button";
      const face = el("span", "pf-li-face");
      if (f.avatar && P.avatarImg) { const img = P.avatarImg(el("img"), f.avatar); img.alt = ""; face.append(img); }
      b.append(face, el("span", null, f.name));
      b.addEventListener("click", () => { tr.friend = f; renderCards(); });
      list.append(b);
    }
    box.append(list);
    return;
  }
  if (tr.step === "give") {
    box.append(el("h3", "cv-h", t("cPickGive")), el("p", "muted", t("cPickGiveHelp")));
    const cards = (await myCards()).sort((a, b) => b.copies - a.copies || b.p - a.p);
    if (mine !== token) return;
    box.append(pickGrid(cards, (c) => { tr.give = c; renderCards(); }));
    return;
  }
  if (tr.step === "want") {
    box.append(el("h3", "cv-h", t("cPickWant")(tr.friend.name)));
    const gift = el("button", "btn-ghost cv-giftbtn", `🎁 ${t("cNothing")}`);
    gift.type = "button";
    gift.addEventListener("click", () => { tr.want = null; renderCards(); });
    box.append(gift);
    const wait = el("p", "muted cv-wait", "…");
    box.append(wait);
    let theirs = [];
    try {
      const p = await P.profileOf(tr.friend.id);
      const list = Object.entries(p.collection ?? {}).flatMap(([g, ids]) => (Array.isArray(ids) ? ids : []).map((id) => ({ g, id })));
      theirs = (await cardsOf(list, (g, id) => 1 + (p.dupes?.[g]?.[id] ?? 0))).sort((a, b) => b.p - a.p);
    } catch { wait.textContent = t("offline"); return; }
    if (mine !== token) return;
    wait.remove();
    if (!theirs.length) { box.append(el("p", "muted", t("cTheyHaveNone"))); return; }
    box.append(pickGrid(theirs, (c) => { tr.want = c; renderCards(); }, (c) => PROFILE()?.copiesOf?.(c.g, c.id) === 0));
    return;
  }
  // Ready: send it.
  const send = el("button", "btn-primary cv-send", t("cSend"));
  send.type = "button";
  send.addEventListener("click", async () => {
    send.disabled = true;
    try {
      await P.tradeCall({ action: "trade-offer", other: tr.friend.id, give: { g: tr.give.g, id: tr.give.id }, want: tr.want ? { g: tr.want.g, id: tr.want.id } : null });
      sfx("place");
      toast(t("cSentOk")(tr.friend.name));
      CV.trade = null;
    } catch (e) { toast(tradeError(e)); send.disabled = false; return; }
    renderCards();
  });
  box.append(send);
}

// A grid of cards to pick one from; `isNew(c)` marks the ones I don't have yet.
function pickGrid(cards, onPick, isNew = null) {
  const wrap = el("div", "cv-pick");
  const search = el("input", "ix-search cv-search");
  search.type = "search";
  search.placeholder = t("indexSearch");
  const grid = el("div", "cv-grid");
  const draw = () => {
    const q = search.value.trim().toLowerCase();
    grid.textContent = "";
    for (const c of cards.filter((x) => !q || x.n.toLowerCase().includes(q)).slice(0, 120)) {
      const b = el("button", "cv-cell cv-pickable");
      b.type = "button";
      b.append(cardFace(c));
      if (isNew?.(c)) b.append(el("span", "cv-new", t("bNew")));
      b.addEventListener("click", () => onPick(c));
      grid.append(b);
    }
  };
  search.addEventListener("input", draw);
  draw();
  wrap.append(search, grid);
  return wrap;
}

// ════════════════════ DUELS ════════════════════
const DECK_KEY = "dle:card-deck";
const DECK_SIZE = 5;
const readDeck = () => { try { const d = JSON.parse(localStorage.getItem(DECK_KEY) || "[]"); return Array.isArray(d) ? d : []; } catch { return []; } };
const saveDeck = (d) => { try { localStorage.setItem(DECK_KEY, JSON.stringify(d.slice(0, DECK_SIZE))); } catch {} };
const myName = () => { try { return window.DLE_Rooms.cleanName(localStorage.getItem("dle:name")) || ""; } catch { return ""; } };
// Points of a pack card: its power, plus its rarity.
const BONUS = { common: 0, epic: 2, legend: 4, secret: 8 };
const packScore = (cards) => cards.reduce((a, c) => a + c.p + (BONUS[c.tier] ?? 0), 0);
// Deck battle rules. A deck is 5 cards whose powers add up to 35 at most, so it mixes strong and weaker cards.
// A card's strength in a round: power ×10, +8 when it transforms, + the round's luck (0–9, same on every screen),
// +6 when it is from the same anime as the card that player played the round before (combo), and the underdog:
// the weakest card on the table, when it is 4 or more below the strongest, gets the gap back ×10.
// The last round is worth 2 points.
const BUDGET = 35;
const COMBO = 6;
const UNDERDOG_GAP = 4;
const deckPower = (cards) => cards.reduce((a, c) => a + (c?.p ?? 0), 0);
// The cards that still fit a deck (leaving at least 1 power for each empty place after this one).
const fitsBudget = (deck, c, minP = 1) => deckPower(deck) + c.p + Math.max(0, DECK_SIZE - deck.length - 1) * minP <= BUDGET;
// The best deck under the budget: the strongest card that still leaves room for the others, place after place.
function bestDeck(all) {
  const minP = Math.min(...all.map((c) => c.p));
  const deck = [];
  for (const c of all) { if (deck.length >= DECK_SIZE) break; if (fitsBudget(deck, c, minP)) deck.push(c); }
  return deck;
}
const roundPoints = (m, r) => (m.mode === "deck" && r === DECK_SIZE - 1 ? 2 : 1);
function luck(seed, round, side) {
  let x = (seed ^ (round * 0x9e3779b1) ^ (side * 0x85ebca77)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b) >>> 0;
  return ((x ^ (x >>> 16)) >>> 0) % 10;
}
const strength = (c, l) => c.p * 10 + (c.form ? 8 : 0) + l;

export function ensureCardRooms() {
  if (cardRooms) return;
  cardRooms = window.DLE_Rooms.create({
    channel: "cards",
    startData: (room) => ({
      mode: room.meta?.play === "deck" ? "deck" : "pack", game: room.game, seed: Math.floor(Math.random() * 2 ** 31), key: Math.random().toString(36).slice(2, 10),
      teams: room.meta?.teams ? Object.fromEntries(room.members.map((m) => [m.id, cardRooms.teamOf(m.id, room) ?? 0])) : null,
    }),
    onChange: () => { tryPendingCardJoin(); if (S.mode === "cards" && CV.sub === "duel" && !(S.cardMatch && !S.cardMatch.done)) renderCards(); else if (S.cardMatch) drawMatch(); },
    onStart: (room, data) => startMatch(room, data),
    onMessage: onMatchMessage,
    onClosed: () => {
      if (S.cardMatch && !S.cardMatch.done) finish("forfeit");
      else { S.cardMatch = null; if (S.mode === "cards") renderCards(); }
      toast(t("roomClosed"));
    },
    onInvite: (room, from) => {
      if (S.cardMatch && !S.cardMatch.done) return;
      window.DLE_Rooms.inviteBanner({
        text: t("cInvitedBy")(cardRooms.peers.get(from)?.name ?? "Player", room.meta?.play === "deck" ? t("cDeckBattle") : t("cPackBattle")),
        join: t("join"),
        dismiss: t("ignore"),
        onJoin: () => joinCardRoom(room),
      });
    },
  });
  cardRooms.setProfile({ name: myName() || "Player", game: S.currentGame?.id, arc: 0 });
}

// Invite links and friends' invitations: crew/#cards=<code>.
let pendingJoin = null;
export function joinCardsByCode(code) {
  pendingJoin = code;
  CV.sub = "duel";
  setTimeout(() => { if (pendingJoin === code && !cardRooms?.myRoom) { pendingJoin = null; toast(t("linkGone")); renderCards(); } }, 25000);
}
function tryPendingCardJoin() {
  if (!pendingJoin || cardRooms?.status !== "live") return;
  const r = cardRooms.findRoom(pendingJoin);
  if (!r) return;
  pendingJoin = null;
  history.replaceState(null, "", "#cards");
  if (r.started || r.members.length >= r.size) { toast(t("linkGone")); return; }
  joinCardRoom(r);
}
function joinCardRoom(r) {
  CV.sub = "duel";
  if (S.mode !== "cards") window.dispatchEvent(new CustomEvent("crew:mode", { detail: "cards" }));
  cardRooms.setProfile({ name: myName() || "Player", game: r.game, arc: 0 });
  cardRooms.join(r.id);
}

function duelView(box) {
  ensureCardRooms();
  if (S.cardMatch) { box.append(el("div", "cv-match")); drawMatch(); return; }
  const lobby = el("div", "card cv-lobby");
  box.append(lobby);
  lobby.append(el("h3", "cv-h", t("cDuelTitle")), el("p", "muted", t("cDuelHelp")));
  if (!cardRooms || cardRooms.status === "connecting") { const w = el("p", "lobby-waiting"); w.append(el("span", "spinner"), t("connecting")); lobby.append(w); return; }
  if (cardRooms.status === "offline") { lobby.append(el("p", "lobby-status is-error", t("offline"))); return; }
  if (!myName()) lobby.append(el("p", "lobby-status", t("cNeedName")));

  const room = cardRooms.myRoom;
  if (room) { lobby.append(roomCard(room)); return; }

  // Mode, then the anime (pack battle) or the deck (deck battle).
  const modes = el("div", "cv-modes");
  for (const [id, title, help] of [["pack", t("cPackBattle"), t("cPackHelp")], ["deck", t("cDeckBattle"), t("cDeckHelp")]]) {
    const b = el("button", `cv-mode${CV.mode === id ? " is-active" : ""}`);
    b.type = "button";
    b.append(el("b", null, title), el("span", null, help));
    b.addEventListener("click", () => { CV.mode = id; renderCards(); });
    modes.append(b);
  }
  lobby.append(modes);
  const sizes = el("div", "cv-sizes");
  sizes.append(el("span", "crew-setting-label", t("players")));
  for (const n of SIZES) {
    const b = el("button", `size-pick${n === CV.size ? " is-active" : ""}`, String(n));
    b.type = "button";
    b.addEventListener("click", () => { CV.size = n; renderCards(); });
    sizes.append(b);
  }
  lobby.append(sizes, el("p", "muted cv-teams-note", t("cTeamsNote")));
  if (CV.mode === "pack") lobby.append(animeRow());
  else deckBuilder(lobby);

  const create = el("button", "btn-primary", t("cCreate"));
  create.type = "button";
  create.addEventListener("click", () => {
    if (!myName()) { toast(t("pickName")); return; }
    if (CV.mode === "deck" && readDeck().length < DECK_SIZE) { toast(t("cDeckFirst")); return; }
    cardRooms.setProfile({ name: myName(), game: S.currentGame.id, arc: 0 });
    cardRooms.createRoom({ game: S.currentGame.id, size: roomSize(), play: CV.mode });
  });
  const code = el("form", "code-form");
  const input = el("input");
  input.maxLength = 6;
  input.placeholder = t("codePlaceholder");
  input.addEventListener("input", () => { input.value = window.DLE_Rooms.cleanCode(input.value); });
  const go = el("button", "btn-ghost", t("joinCode"));
  go.type = "submit";
  code.append(input, go);
  code.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!myName()) { toast(t("pickName")); return; }
    const r = cardRooms.findRoom(input.value);
    if (!r) { toast(t("codeNotFound")); return; }
    joinCardRoom(r);
  });
  const row = el("div", "cv-create");
  row.append(create, code);
  lobby.append(row);

  // Open duels and players around.
  const open = cardRooms.openRooms();
  lobby.append(el("h3", "cv-h", t("openRooms")));
  if (!open.length) lobby.append(el("p", "muted", t("cNoDuels")));
  const list = el("ul", "lobby-list");
  for (const r of open) {
    const g = GAMES.find((x) => x.id === r.game);
    const li = el("li", "lobby-player");
    if (g && r.meta?.play !== "deck") { const img = el("img"); img.src = ROOT + g.logo; img.alt = ""; li.append(img); }
    const host = r.members.find((m) => m.id === r.host);
    const label = el("span", "lobby-pname", t("roomOf")(host?.name ?? "Player"));
    label.append(el("small", "lobby-anime", r.meta?.play === "deck" ? t("cDeckBattle") : `${t("cPackBattle")} · ${g?.anime ?? ""}`));
    li.append(el("span", "lobby-badge", `${r.members.length}/${r.size}`));
    const join = el("button", "btn-primary btn-small", t("join"));
    join.type = "button";
    join.addEventListener("click", () => {
      if (!myName()) { toast(t("pickName")); return; }
      if (r.meta?.play === "deck" && readDeck().length < DECK_SIZE) { CV.mode = "deck"; toast(t("cDeckFirst")); renderCards(); return; }
      joinCardRoom(r);
    });
    li.append(label, join);
    list.append(li);
  }
  lobby.append(list);
  const around = [...cardRooms.peers.values()];
  lobby.append(el("h3", "cv-h", t("inLobby")(around.length + 1)));
  const chips = el("div", "lobby-chips");
  for (const p of around) {
    const chip = el("span", "lobby-chip has-action");
    chip.append(window.DLE_NAME(p.name, cardRooms.pidOf(p.id)));
    const inv = el("button", "btn-ghost btn-small", t("invite"));
    inv.type = "button";
    inv.addEventListener("click", () => {
      if (!myName()) { toast(t("pickName")); return; }
      if (CV.mode === "deck" && readDeck().length < DECK_SIZE) { toast(t("cDeckFirst")); return; }
      if (!cardRooms.myRoom) cardRooms.createRoom({ game: S.currentGame.id, size: roomSize(), play: CV.mode });
      if (cardRooms.invite(p.id, { game: S.currentGame.id, size: roomSize() })) toast(t("inviteSent")(p.name));
    });
    chip.append(inv);
    chips.append(chip);
  }
  if (around.length) lobby.append(chips);
  else lobby.append(el("p", "muted", t("cAlone")));
}

// The anime of a pack battle.
function animeRow() {
  const row = el("div", "anime-mini cv-anime-row");
  for (const g of GAMES) {
    const on = S.currentGame?.id === g.id;
    const b = el("button", `anime-mini-pick${on ? " is-active" : ""}`);
    b.type = "button";
    b.title = g.anime;
    const img = el("img");
    img.src = ROOT + g.logo;
    img.alt = "";
    b.append(img);
    if (on) b.append(el("span", null, g.anime));
    b.addEventListener("click", () => window.dispatchEvent(new CustomEvent("crew:game", { detail: g.id })));
    row.append(b);
  }
  return row;
}

// My deck: 5 cards of my collection, kept in this browser.
async function deckBuilder(box) {
  const wrap = el("div", "cv-deck");
  box.append(wrap);
  const all = await myCards();
  const owned = new Set(all.map((c) => `${c.g}/${c.id}`));
  const full = (d) => all.find((x) => x.g === d.g && x.id === d.id);
  let deck = readDeck().filter((d) => owned.has(`${d.g}/${d.id}`));
  while (deck.length && deckPower(deck.map(full)) > BUDGET) deck.pop();
  saveDeck(deck);
  const minP = all.length ? Math.min(...all.map((c) => c.p)) : 1;
  const draw = () => {
    wrap.textContent = "";
    const used = deckPower(deck.map(full));
    wrap.append(el("h3", "cv-h", t("cMyDeck")(deck.length, DECK_SIZE)), el("p", `cv-budget${used > BUDGET - 5 ? " is-tight" : ""}`, t("cBudget")(used, BUDGET)), el("p", "muted cv-rules", t("cDeckRules")));
    if (all.length < DECK_SIZE) { wrap.append(el("p", "muted", t("cDeckNeed")(DECK_SIZE))); return; }
    const slots = el("div", "cv-deck-slots");
    for (let i = 0; i < DECK_SIZE; i++) {
      const d = deck[i];
      const c = d && all.find((x) => x.g === d.g && x.id === d.id);
      const slot = el("button", `cv-deck-slot${c ? "" : " is-empty"}`);
      slot.type = "button";
      if (c) {
        slot.append(cardFace(c));
        slot.title = t("cRemove");
        slot.addEventListener("click", () => { deck = deck.filter((x) => x !== d); saveDeck(deck); draw(); });
      } else slot.append(el("span", null, "+"));
      slots.append(slot);
    }
    const auto = el("button", "btn-ghost btn-small", t("cDeckAuto"));
    auto.type = "button";
    auto.addEventListener("click", () => { deck = bestDeck(all).map((c) => ({ g: c.g, id: c.id })); saveDeck(deck); draw(); });
    wrap.append(slots, auto);
    if (deck.length < DECK_SIZE) {
      const free = all.filter((c) => !deck.some((d) => d.g === c.g && d.id === c.id) && fitsBudget(deck.map(full), c, minP));
      wrap.append(pickGrid(free, (c) => { if (deck.length < DECK_SIZE) { deck = [...deck, { g: c.g, id: c.id }]; saveDeck(deck); draw(); } }));
    }
  };
  draw();
}

function roomCard(room) {
  const card = el("div", "room-card");
  const g = GAMES.find((x) => x.id === room.game);
  const head = el("div", "room-head");
  const deck = room.meta?.play === "deck";
  if (g && !deck) { const img = el("img"); img.src = ROOT + g.logo; img.alt = ""; head.append(img); }
  const host = room.members.find((m) => m.id === room.host);
  head.append(el("b", null, t("roomOf")(host?.name ?? "Player")), el("span", "lobby-badge", `${room.members.length}/${room.size}`));
  card.append(head, el("p", "room-hint", deck ? t("cDeckBattle") : `${t("cPackBattle")} · ${g?.anime ?? ""}`));
  if (room.code) {
    const c = el("div", "room-code");
    c.append(el("span", null, t("codeLabel")), el("b", null, room.code));
    card.append(c);
  }
  const list = el("ul", "room-members");
  for (let i = 0; i < room.size; i++) {
    const m = room.members[i];
    const li = el("li", m ? "is-taken" : "is-free");
    li.append(el("span", "room-seat", String(i + 1)), m ? window.DLE_NAME(m.id === cardRooms.selfId ? `${m.name} (${t("you")})` : m.name, cardRooms.pidOf(m.id)) : el("span", null, t("freeSeat")));
    list.append(li);
  }
  card.append(list);
  // Battles with 3 players or more can be played in two teams.
  if (room.size > 2) card.append(cardRooms.teamsBox());
  const actions = el("div", "roll-actions");
  if (cardRooms.isHost()) {
    const start = el("button", "btn-primary", t("start"));
    start.type = "button";
    start.disabled = room.members.length < 2;
    start.addEventListener("click", () => cardRooms.start());
    actions.append(start);
  } else {
    const w = el("p", "lobby-waiting");
    w.append(el("span", "spinner"), t("waitHost"));
    card.append(w);
  }
  const leave = el("button", "btn-ghost", t("leave"));
  leave.type = "button";
  leave.addEventListener("click", () => cardRooms.leave());
  actions.append(leave);
  card.append(actions, cardRooms.chatBox());
  return card;
}

// ── Match ──
function startMatch(room, data) {
  const others = room.members.filter((m) => m.id !== cardRooms.selfId);
  if (!others.length) return;
  // Every screen orders the players the same way (for the luck of each round).
  const ids = room.members.map((m) => m.id).sort();
  const deck = data.mode === "deck";
  let teams = data.teams && typeof data.teams === "object" ? Object.fromEntries(ids.map((id) => [id, data.teams[id] === 1 ? 1 : 0])) : null;
  if (teams && new Set(Object.values(teams)).size < 2) teams = null;
  const m = {
    key: String(data.key ?? ""), mode: deck ? "deck" : "pack", game: GAMES.find((g) => g.id === data.game) ?? S.currentGame,
    seed: Number(data.seed) >>> 0, me: cardRooms.selfId,
    round: 0, done: false, log: [], busy: false,
    ids, names: new Map(room.members.map((x) => [x.id, x.name])), teams, teamNames: cardRooms.teamNames(room),
    points: new Map(ids.map((id) => [id, 0])), teamPts: [0, 0], active: new Set(ids),
    // pack battle: every player's pack for each round
    packs: new Map(ids.map((id) => [id, []])), opened: [], revealed: new Set(), queue: [], anim: null, timer: 0,
    // deck battle: every player's hand and the card they played each round
    hands: new Map(), plays: new Map(ids.map((id) => [id, []])),
  };
  S.cardMatch = m;
  CV.sub = "duel";
  if (S.mode !== "cards") window.dispatchEvent(new CustomEvent("crew:mode", { detail: "cards" }));
  renderCards();
  sfx("whoosh");
  if (m.mode === "pack") sendPack(0);
  else sendDeck();
}

const isMine = (from) => S.cardMatch?.ids.includes(from);
const ROUNDS = (m) => (m.mode === "pack" ? 3 : DECK_SIZE);
const cleanCard = (c, g) => (c && /^[a-z0-9-]{1,60}$/.test(c.id ?? "") ? {
  g: GAMES.some((x) => x.id === (g ?? c.g)) ? g ?? c.g : null, id: c.id, n: String(c.n ?? "").replace(/[\u0000-\u001f<>]/g, "").slice(0, 40) || "?",
  p: Math.min(10, Math.max(1, Math.round(+c.p || 1))), tier: ["common", "epic", "legend", "secret"].includes(c.tier) ? c.tier : "common", f: c.f === true, form: c.form === true,
} : null);

function onMatchMessage(type, d, from) {
  const m = S.cardMatch;
  if (!m || m.done) return;
  if (type === "left") {
    playerLeft(d?.id ?? from);
    return;
  }
  if (!isMine(from)) return;
  if (type === "pack" && m.mode === "pack" && Number.isInteger(d.r) && d.r >= 0 && d.r < 3 && Array.isArray(d.cards) && !m.packs.get(from)[d.r]) {
    m.packs.get(from)[d.r] = d.cards.slice(0, 5).map((c) => cleanCard(c, m.game.id)).filter((c) => c?.g);
    drawMatch();
    packStep();
  } else if (type === "open" && m.mode === "pack" && d.r === m.round) {
    markOpen(from);
  } else if (type === "deck" && m.mode === "deck" && Array.isArray(d.cards) && !m.hands.has(from)) {
    m.hands.set(from, d.cards.slice(0, DECK_SIZE).map((c) => cleanCard(c)).filter((c) => c?.g));
    drawMatch();
    tryResolve();
  } else if (type === "play" && m.mode === "deck" && Number.isInteger(d.r) && Number.isInteger(d.i) && d.r === m.round) {
    const plays = m.plays.get(from);
    if (!plays || plays[d.r] != null || d.i < 0 || d.i >= (m.hands.get(from)?.length ?? 0) || plays.includes(d.i)) return;
    plays[d.r] = d.i;
    drawMatch();
    tryResolve();
  }
}

// A player left: the others play on without them, until one player (or one team) is left.
function playerLeft(id) {
  const m = S.cardMatch;
  if (!m.active.has(id)) return;
  m.active.delete(id);
  const left = [...m.active];
  const sides = m.teams ? new Set(left.map((x) => m.teams[x])) : null;
  if (left.length < 2 || (sides && sides.size < 2)) { finish("forfeit"); return; }
  drawMatch();
  if (m.mode === "pack") packStep();
  else tryResolve();
}

// Scores a round. Free for all: the best score wins (several if tied). Teams: the team with the larger total wins.
function scoreRound(m, rows, pts = 1) {
  if (m.teams) {
    const totals = [0, 1].map((k) => rows.filter((x) => m.teams[x.id] === k).reduce((a, x) => a + x.s, 0));
    const teamWin = totals[0] === totals[1] ? null : totals[0] > totals[1] ? 0 : 1;
    if (teamWin != null) m.teamPts[teamWin] += pts;
    return { rows, teamWin, totals, winners: teamWin == null ? [] : rows.filter((x) => m.teams[x.id] === teamWin).map((x) => x.id) };
  }
  const best = Math.max(...rows.map((x) => x.s));
  const winners = rows.filter((x) => x.s === best).map((x) => x.id);
  // Everyone tied: nobody scores.
  if (winners.length === rows.length && rows.length > 1) return { rows, winners: [] };
  for (const id of winners) m.points.set(id, m.points.get(id) + pts);
  return { rows, winners };
}

// Over after the last round, or once the leader can't be caught.
function isOver(m, r) {
  let left = 0;
  for (let i = r + 1; i < ROUNDS(m); i++) left += roundPoints(m, i);
  const pts = m.teams ? m.teamPts : [...m.active].map((id) => m.points.get(id));
  const sorted = [...pts].sort((a, b) => b - a);
  return left <= 0 || sorted[0] - (sorted[1] ?? 0) > left;
}

// ── Pack battle: three rounds; each player in turn tears their pack open and its cards turn over one by one,
// then the bigger total wins the round ──
async function sendPack(r) {
  const m = S.cardMatch;
  const cards = await drawPack(m.game, { battle: true });
  if (S.cardMatch !== m || m.done) return;
  m.packs.get(m.me)[r] = cards.map((c) => ({ g: c.g, id: c.id, n: c.n, p: c.p, tier: c.tier, f: c.f }));
  cardRooms.broadcast("pack", { r, key: m.key, cards: m.packs.get(m.me)[r] });
  drawMatch();
  packStep();
}

// The turn order shifts by one each round, so a different player opens first.
const packOrder = (m) => m.ids.map((_, i) => m.ids[(i + m.round) % m.ids.length]).filter((id) => m.active.has(id));
const openedNow = (m) => (m.opened[m.round] ??= new Set());
const packsReady = (m) => [...m.active].every((id) => m.packs.get(id)?.[m.round]);
// Whose turn it is to open (nobody while a pack is being opened, or before every pack is drawn).
const opener = (m) => (m.done || m.busy || m.running || m.queue.length || !packsReady(m) ? null : packOrder(m).find((id) => !openedNow(m).has(id)) ?? null);

function openMine() {
  const m = S.cardMatch;
  if (!m || opener(m) !== m.me) return;
  cardRooms.broadcast("open", { r: m.round, key: m.key });
  markOpen(m.me);
}

function markOpen(id) {
  const m = S.cardMatch;
  if (!m || m.done || !m.active.has(id) || !packsReady(m) || openedNow(m).has(id)) return;
  openedNow(m).add(id);
  m.queue.push(id);
  runOpenings();
}

// Opens the queued packs one after the other, on every screen.
async function runOpenings() {
  const m = S.cardMatch;
  if (!m || m.running) return;
  m.running = true;
  clearTimeout(m.timer);
  while (m.queue.length && S.cardMatch === m && !m.done) {
    const id = m.queue.shift();
    const cards = m.packs.get(id)?.[m.round];
    if (!cards) continue;
    m.anim = { id, n: 0, torn: false };
    drawMatch();
    const row = () => document.querySelector(`.cv-match .cvm-row[data-id="${id}"]`);
    row()?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    // The pack shakes, its top tears off, then the cards come out face down.
    const pack = row()?.querySelector(".bpack");
    if (pack) {
      pack.classList.remove("is-idle");
      pack.animate([{ transform: "none" }, { transform: "translateX(-2px) rotate(-1deg)" }, { transform: "translateX(2px) rotate(1deg)" }, { transform: "none" }], { duration: 150, iterations: 4 });
      sfx("rise", { dur: 0.6 });
      await wait(600);
      pack.querySelector(".bpack-top")?.animate([{ transform: "none", opacity: 1 }, { transform: "translate(60px, -90px) rotate(40deg)", opacity: 0 }], { duration: 500, easing: "cubic-bezier(.3,.6,.4,1)", fill: "forwards" });
      pack.classList.add("is-torn");
      const b = pack.getBoundingClientRect();
      burst(b.left + b.width / 2, b.top + b.height * 0.15, { count: 36, spread: 180 });
      sfx("slash");
      await wait(450);
    }
    if (S.cardMatch !== m || m.done) return;
    m.anim.torn = true;
    drawMatch();
    await wait(350);
    // The cards turn over one by one, each in the spotlight (never skipped), then land in the row.
    for (let i = 0; i < cards.length; i++) {
      if (S.cardMatch !== m || m.done) return;
      await spotlight(cards[i], row()?.querySelector(".cvm-cards")?.children[i], packColours(m.game.id));
      if (S.cardMatch !== m || m.done) return;
      m.anim.n = i + 1;
      row()?.querySelector(".cvm-cards")?.children[i]?.classList.add("is-flipped");
      sfx("place");
      await wait(150);
    }
    m.revealed.add(id);
    m.anim = null;
    drawMatch();
    sfx("stamp");
    await wait(700);
  }
  m.anim = null;
  m.running = false;
  if (S.cardMatch === m) packStep();
}

// After every change: score the round once every pack is open, or wait for the next player to open theirs.
async function packStep() {
  const m = S.cardMatch;
  if (!m || m.done || m.mode !== "pack" || m.busy || m.running || m.queue.length) return;
  const r = m.round;
  const live = [...m.active];
  if (!packsReady(m)) { drawMatch(); return; }
  if (live.every((id) => m.revealed.has(id))) {
    m.busy = true;
    clearTimeout(m.timer);
    const rows = live.map((id) => ({ id, s: packScore(m.packs.get(id)[r]) }));
    m.log[r] = scoreRound(m, rows);
    const winners = m.log[r].winners;
    sfx(winners.includes(m.me) ? "win" : winners.length ? "stamp" : "place");
    drawMatch();
    await wait(2600);
    m.busy = false;
    if (S.cardMatch !== m || m.done) return;
    if (isOver(m, r)) { finish(); return; }
    m.round++;
    m.revealed = new Set();
    drawMatch();
    sendPack(m.round);
    return;
  }
  // My turn opens by itself after a while; someone who never opens is opened for after longer.
  const who = opener(m);
  drawMatch();
  clearTimeout(m.timer);
  if (who) m.timer = setTimeout(() => { if (S.cardMatch === m && opener(m) === who) { if (who === m.me) openMine(); else markOpen(who); } }, who === m.me ? 15000 : 30000);
}

// ── Deck battle: five rounds, everyone plays a card, the strongest wins the round (or the strongest team) ──
async function sendDeck() {
  const m = S.cardMatch;
  const deck = readDeck();
  let cards = (await cardsOf(deck, () => 1)).filter((c) => PROFILE()?.collectionOf?.(c.g)?.has(c.id));
  while (deckPower(cards) > BUDGET) cards.pop();
  // A deck short of cards is completed with my strongest ones that still fit the budget.
  if (cards.length < DECK_SIZE) {
    const all = await myCards();
    const minP = Math.min(...all.map((c) => c.p));
    for (const c of all) { if (cards.length >= DECK_SIZE) break; if (!cards.some((x) => x.g === c.g && x.id === c.id) && fitsBudget(cards, c, minP)) cards.push(c); }
  }
  if (S.cardMatch !== m) return;
  m.hands.set(m.me, cards.slice(0, DECK_SIZE).map((c) => ({ g: c.g, id: c.id, n: c.n, p: c.p, tier: tierOf(c.p), form: hasForm(c.g, c.id) })));
  cardRooms.broadcast("deck", { key: m.key, cards: m.hands.get(m.me) });
  drawMatch();
  tryResolve();
}

function play(i) {
  const m = S.cardMatch;
  const mine = m?.plays.get(m.me);
  if (!m || m.done || m.busy || !mine || mine[m.round] != null || mine.includes(i)) return;
  mine[m.round] = i;
  cardRooms.broadcast("play", { r: m.round, i, key: m.key });
  sfx("place");
  drawMatch();
  tryResolve();
}

// Who still has to play this round (players still in the match).
const waitingFor = (m) => [...m.active].filter((id) => m.plays.get(id)?.[m.round] == null);

async function tryResolve() {
  const m = S.cardMatch;
  if (!m || m.mode !== "deck" || m.busy || m.done) return;
  const r = m.round;
  const playing = [...m.active].filter((id) => m.hands.get(id)?.length);
  if (playing.length < m.active.size || waitingFor(m).length) return;
  m.busy = true;
  const rows = playing.map((id) => {
    const hand = m.hands.get(id);
    const c = hand[m.plays.get(id)[r]];
    const before = r ? hand[m.plays.get(id)[r - 1]] : null;
    const l = luck(m.seed, r, m.ids.indexOf(id));
    return { id, c, l, combo: before && before.g === c.g ? COMBO : 0, under: 0 };
  });
  const top = Math.max(...rows.map((x) => x.c.p));
  const low = Math.min(...rows.map((x) => x.c.p));
  if (rows.length > 1 && top - low >= UNDERDOG_GAP) for (const x of rows) if (x.c.p === low) x.under = (top - low) * 10;
  for (const x of rows) x.s = strength(x.c, x.l) + x.combo + x.under;
  m.log[r] = scoreRound(m, rows, roundPoints(m, r));
  const { winners } = m.log[r];
  m.shown = r;
  drawMatch();
  sfx("slash");
  await wait(500);
  sfx(winners.includes(m.me) ? "win" : winners.length ? "stamp" : "place");
  await wait(2200);
  m.busy = false;
  m.shown = null;
  if (S.cardMatch !== m || m.done) return;
  if (isOver(m, r)) { finish(); return; }
  m.round++;
  drawMatch();
  tryResolve();
}

function finish(why) {
  const m = S.cardMatch;
  if (!m || m.done) return;
  m.done = true;
  clearTimeout(m.timer);
  if (m.teams) {
    const k = m.teams[m.me];
    const left = [0, 1].filter((x) => [...m.active].some((id) => m.teams[id] === x));
    m.result = why === "forfeit" ? (left.includes(k) ? "win" : "lose") : m.teamPts[k] > m.teamPts[1 - k] ? "win" : m.teamPts[k] < m.teamPts[1 - k] ? "lose" : "draw";
  } else {
    const pts = [...m.active].map((id) => m.points.get(id));
    const best = Math.max(...pts);
    const mine = m.points.get(m.me);
    m.result = why === "forfeit" && m.active.size === 1 ? "win" : mine < best ? "lose" : pts.filter((x) => x === best).length > 1 ? "draw" : "win";
  }
  m.forfeit = why === "forfeit";
  const P = PROFILE();
  P?.count?.("cardDuels", 1);
  if (m.result === "win") { P?.count?.("cardWins", 1); P?.earnBooster?.(1, "duel"); sfx("win"); }
  cardRooms?.clearRejoin?.();
  renderCards();
}

// The match screen: the opponent's side on top, mine below, the score in between.
function drawMatch() {
  const m = S.cardMatch;
  const box = $(".cv-match");
  if (!m || !box) return null;
  box.textContent = "";
  const board = el("div", `card cvm cvm-${m.mode}`);
  const top = el("div", "cvm-score");
  if (m.teams) top.append(el("span", "cvm-name team-0", m.teamNames[0]), el("b", "cvm-pts", `${m.teamPts[0]} – ${m.teamPts[1]}`), el("span", "cvm-name team-1 is-left", m.teamNames[1]));
  board.append(top, scoreChips(m), el("p", `cvm-round${roundPoints(m, m.round) > 1 ? " is-double" : ""}`, m.done ? "" : `${t("cRound")(m.round + 1, ROUNDS(m))}${roundPoints(m, m.round) > 1 ? ` · ${t("cDouble")}` : ""}`));
  if (m.mode === "deck" && !m.done) board.append(el("p", "cvm-rules", t("cDeckRules")));

  if (m.mode === "pack") {
    // One row per player (mine last); the packs stay face down until everyone has opened theirs.
    const r = m.round;
    const entry = m.log[r];
    const many = m.ids.length > 2;
    const order = [...m.ids.filter((id) => id !== m.me), m.me];
    const turn = opener(m);
    const rows = el("div", `cvm-rows${many ? " is-multi" : ""}`);
    for (const id of order) {
      const cards = m.packs.get(id)?.[r];
      const gone = !m.active.has(id);
      if (gone && !cards) continue;
      const shown = m.revealed.has(id);
      const total = shown && cards ? packScore(cards) : null;
      const anim = m.anim?.id === id ? m.anim : null;
      const row = el("div", `cvm-row${id === m.me ? " is-me" : ""}${m.teams ? ` team-${m.teams[id]}` : ""}${gone ? " has-left" : ""}${entry?.winners.includes(id) ? " is-winner" : ""}${turn === id || anim ? " is-turn" : ""}`);
      row.dataset.id = id;
      const name = id === m.me ? t("you") : m.names.get(id) ?? "Player";
      row.append(el("span", "cvm-row-label", total == null ? name : `${name} · ${total}`));
      const list = el("div", "cvm-cards");
      if (!cards) list.append(el("p", "muted cvm-wait", t("cOpening")));
      else if (shown || anim?.torn) cards.forEach((c, i) => list.append(flipCard(c, shown || i < anim.n)));
      else {
        // Still sealed: the pack, which I tear open myself when it's my turn.
        const pack = packEl(m.game);
        pack.classList.add("cvm-pack");
        if (turn === id) pack.classList.add("is-idle");
        if (turn === m.me && id === m.me) {
          const b = el("button", "cvm-pack-btn");
          b.type = "button";
          b.append(pack, el("span", "btn-primary btn-small", t("cOpenMine")));
          b.addEventListener("click", openMine);
          list.append(b);
        } else list.append(pack);
      }
      row.append(list);
      rows.append(row);
    }
    board.append(rows);
    if (entry) board.append(verdict(m, entry));
    else if (turn && turn === m.me) board.append(el("p", "cvm-hint is-turn", t("cYourPack")));
    else if (turn || (m.anim && m.anim.id !== m.me)) board.append(el("p", "cvm-hint", t("cTheirPack")(m.names.get(turn ?? m.anim.id) ?? "Player")));
  } else {
    // The arena: every player's card this round (hidden until everyone has played), then my hand.
    const r = m.round;
    const entry = m.shown === r ? m.log[r] : null;
    const arena = el("div", `cvm-arena is-multi${m.ids.length > 4 ? " is-big" : ""}`);
    for (const id of m.ids) {
      const gone = !m.active.has(id);
      const box = el("div", `cvm-slot${id === m.me ? " is-me" : ""}${m.teams ? ` team-${m.teams[id]}` : ""}${gone ? " has-left" : ""}${entry?.winners.includes(id) ? " is-winner" : ""}`);
      box.append(window.DLE_NAME(id === m.me ? `${myName() || t("you")} (${t("you")})` : m.names.get(id) ?? "Player", cardRooms.pidOf(id), "cvm-slot-name"));
      const row = entry?.rows.find((x) => x.id === id);
      const played = m.plays.get(id)?.[r];
      if (row) {
        box.append(cardFace({ ...row.c, f: false }, false), el("span", "cvm-calc", `${row.c.p}×10${row.c.form ? " + ⚡8" : ""}${row.combo ? ` + 🔗${row.combo}` : ""}${row.under ? ` + 🐺${row.under}` : ""} + 🎲${row.l} = ${row.s}`));
      } else if (id === m.me && played != null) {
        box.append(cardFace({ ...m.hands.get(m.me)[played], f: false }, false));
      } else {
        box.append(el("span", "cvm-slot-empty", gone ? t("left") : !m.hands.has(id) ? t("cWaitDeck") : played != null ? "✓" : id === m.me ? t("cPlayCard") : "…"));
      }
      arena.append(box);
    }
    board.append(arena);
    if (entry) board.append(verdict(m, entry));
    const hand = el("div", "cvm-hand is-mine");
    const mine = m.plays.get(m.me) ?? [];
    (m.hands.get(m.me) ?? []).forEach((c, i) => {
      if (mine.includes(i)) return;
      const b = el("button", "cvm-play");
      b.type = "button";
      b.disabled = m.done || m.busy || mine[r] != null;
      b.append(cardFace({ ...c, f: false }));
      b.addEventListener("click", () => play(i));
      hand.append(b);
    });
    board.append(hand);
    const waiting = waitingFor(m).filter((id) => id !== m.me);
    if (!m.done && !m.busy && mine[r] == null) board.append(el("p", "cvm-hint", t("cPickPlay")));
    else if (!m.done && !m.busy && waiting.length) board.append(el("p", "cvm-hint", t("cWaitPlay")(waiting.map((id) => m.names.get(id) ?? "?").join(", "))));
  }

  if (m.done) {
    const res = el("div", `cvm-result is-${m.result}`);
    res.append(el("b", null, m.result === "win" ? (m.forfeit ? t("cWinForfeit") : t("cWin")) : m.result === "lose" ? t("cLose") : t("cDraw")));
    if (m.result === "win") res.append(el("span", null, t("cWinBooster")));
    const acts = el("div", "roll-actions");
    const leave = el("button", "btn-ghost", t("leave"));
    leave.type = "button";
    leave.addEventListener("click", () => { cardRooms.leave(); S.cardMatch = null; renderCards(); });
    acts.append(leave);
    if (cardRooms.myRoom && !m.forfeit) {
      const again = el("button", "btn-primary", t("backRoom"));
      again.type = "button";
      again.addEventListener("click", () => { if (cardRooms.isHost()) cardRooms.reopen(); S.cardMatch = null; renderCards(); });
      acts.append(again);
    }
    res.append(acts);
    board.append(res);
  }
  box.append(board);
  return board;
}

// Who won the round, as seen from my side.
function verdict(m, entry) {
  const won = entry.winners.includes(m.me);
  const text = !entry.winners.length ? t("cRoundTie")
    : m.teams ? `${t("teamWins")(m.teamNames[entry.teamWin])} (${entry.totals[0]} – ${entry.totals[1]})`
    : won ? (entry.winners.length > 1 ? t("cRoundShared") : t("cRoundWon")) : t("cRoundBy")(entry.winners.map((id) => m.names.get(id) ?? "?").join(", "));
  return el("p", `cvm-verdict ${won ? "is-win" : entry.winners.length ? "is-lose" : ""}`, text);
}

// Every player's points (or each team's members under its score).
function scoreChips(m) {
  const row = el("div", "cvm-chips");
  for (const id of m.ids) {
    const chip = el("span", `cvm-chip${id === m.me ? " is-me" : ""}${m.teams ? ` team-${m.teams[id]}` : ""}${m.active.has(id) ? "" : " has-left"}`);
    chip.append(window.DLE_NAME(m.names.get(id) ?? "Player", cardRooms.pidOf(id)));
    if (!m.teams) chip.append(el("b", null, String(m.points.get(id))));
    row.append(chip);
  }
  return row;
}

// A pack card, face down until the round is revealed.
function flipCard(c, shown) {
  const node = el("div", `bcard cvm-card tier-${c.tier}${shown ? " is-flipped" : ""}`);
  node.dataset.tier = c.tier;
  const inner = el("div", "bcard-inner");
  const back = el("div", "bcard-back");
  back.append(el("span", "bcard-back-mark", "✦"));
  const front = el("div", "bcard-front");
  front.append(cardFace({ g: c.g, id: c.id, n: c.n, p: c.p, f: c.f }));
  inner.append(back, front);
  node.append(inner);
  return node;
}
const backCard = () => {
  const node = el("div", "bcard cvm-card cvm-back");
  const inner = el("div", "bcard-inner");
  const back = el("div", "bcard-back");
  back.append(el("span", "bcard-back-mark", "✦"));
  inner.append(back);
  node.append(inner);
  return node;
};

// Leaving the tab: an open duel room closes (not a match under way).
export function leaveCards() {
  if (cardRooms?.myRoom && !(S.cardMatch && !S.cardMatch.done)) { cardRooms.leave(); S.cardMatch = null; }
}

window.addEventListener("crew:cards", () => renderCards());
window.addEventListener("dle:trades", () => { if (S.mode === "cards" && CV.sub !== "duel" && !CV.trade) renderCards(); });
window.addEventListener("dle:name", () => cardRooms?.setProfile({ name: myName() || "Player", game: S.currentGame?.id, arc: 0 }));
