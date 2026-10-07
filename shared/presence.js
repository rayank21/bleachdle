// Live "who's online" bar and player name, shared by every page.
// Players connect directly to each other (WebRTC) through Trystero, which finds peers via public
// Nostr relays — no server or account needed, so it works on any static host (GitHub Pages…).
// Names come from other players: they are untrusted text and always rendered with textContent.

(() => {
const TRYSTERO = "https://cdn.jsdelivr.net/npm/trystero@0.25.4/+esm";
const APP_ID = "bleachdle.rayank21.v1";
const MAX_NAME = 20;

const bar = document.getElementById("presence");
const GAMES = window.DLE_GAMES || [];
const game = document.body.dataset.game || "home";
const root = game === "home" ? "" : "../";

const T = {
  en: {
    online: (n) => `${n} online`,
    alone: "Only you right now",
    connecting: "Connecting…",
    offline: "Live players unavailable",
    blocked: "Can't reach the other players",
    diag: "Run the diagnostic",
    blockedHelp: "Your connection blocks the servers used to find players: turn off your ad blocker or your antivirus' web protection for this site, or try another network (phone data), then reload.",
    you: "you",
    placeholder: "Your name",
    edit: "Change your name",
    save: "Save",
    pick: "Pick a name",
    chat: "Live chat",
    chatEmpty: "No messages yet. Say hi!",
    today: "Today",
    yesterday: "Yesterday",
    say: (n) => `Message as ${n}…`,
    send: "Send",
    close: "Close",
    friends: "Friends",
    friendsOnline: (n) => `${n} friend${n > 1 ? "s" : ""} online`,
    invited: (n) => `${n} invites you to play!`,
    join: "Join",
    later: "Later",
  },
  fr: {
    online: (n) => `${n} en ligne`,
    alone: "Tu es seul pour l'instant",
    connecting: "Connexion…",
    offline: "Joueurs en direct indisponibles",
    blocked: "Impossible de joindre les autres joueurs",
    diag: "Lancer le diagnostic",
    blockedHelp: "Ta connexion bloque les serveurs qui servent à trouver les joueurs : désactive ton bloqueur de pub ou la protection web de ton antivirus pour ce site, ou essaie un autre réseau (4G/5G), puis recharge la page.",
    you: "toi",
    placeholder: "Ton pseudo",
    edit: "Modifier ton pseudo",
    save: "OK",
    pick: "Choisis un pseudo",
    chat: "Chat en direct",
    chatEmpty: "Aucun message pour l'instant. Dis bonjour !",
    today: "Aujourd'hui",
    yesterday: "Hier",
    say: (n) => `Écrire en tant que ${n}…`,
    send: "Envoyer",
    close: "Fermer",
    friends: "Amis",
    friendsOnline: (n) => `${n} ami${n > 1 ? "s" : ""} en ligne`,
    invited: (n) => `${n} t'invite à jouer !`,
    join: "Rejoindre",
    later: "Plus tard",
  },
};
const lang = () => (window.DLE_LANG?.get() === "fr" ? "fr" : "en");
const t = (k) => T[lang()][k];

// ── Name (kept in this browser) ──
const cleanName = (s) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME);
function storedName() {
  try { return cleanName(localStorage.getItem("dle:name")); } catch { return ""; }
}
function saveName(name) {
  try { localStorage.setItem("dle:name", name); } catch {}
}
let myName = storedName();
const fallbackName = `Player ${Math.floor(1000 + Math.random() * 9000)}`;
const shownName = () => myName || fallbackName;

// ── State ──
const peers = new Map(); // peerId → { name, game, pid (profile id), room (open room they wait in) }
let status = "connecting"; // connecting | live | offline
let editing = !myName;
let sendInfo = null;

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

function gameLogo(id) {
  const g = GAMES.find((x) => x.id === id);
  if (!g) return null;
  const img = el("img", "presence-logo");
  img.src = root + g.logo;
  img.alt = "";
  img.title = g.brand;
  return img;
}

// A player's rare achievements (shared/profile.js), shown after their name.
const badgeRow = (ids) => window.DLE_Profile?.badgeRow?.(ids) ?? null;
const cleanBadges = (list) => window.DLE_Profile?.cleanBadges?.(list) ?? [];
const myBadges = () => window.DLE_Profile?.badges?.() ?? [];

function chip(name, gameId, isMe, isFriend, badges = []) {
  const li = el("li", `presence-chip${isMe ? " is-me" : ""}${isFriend ? " is-friend" : ""}`);
  if (isFriend) li.title = t("friends");
  const logo = gameLogo(gameId);
  if (logo) li.append(logo);
  li.append(el("span", "presence-name", name));
  const row = badgeRow(badges);
  if (row) li.append(row);
  if (isMe) li.append(el("span", "presence-you", `(${t("you")})`));
  return li;
}

function myChip() {
  if (!editing) {
    const li = chip(shownName(), game, true, false, myBadges());
    const btn = el("button", "presence-edit");
    btn.type = "button";
    btn.setAttribute("aria-label", t("edit"));
    btn.title = t("edit");
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13"><path d="M4 20h4L19 9l-4-4L4 16v4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
    btn.addEventListener("click", () => { editing = true; render(); bar.querySelector("input")?.focus(); });
    li.append(btn);
    return li;
  }
  const li = el("li", "presence-chip is-me is-editing");
  const form = el("form", "presence-form");
  const input = el("input");
  input.id = "presenceName";
  input.maxLength = MAX_NAME;
  input.placeholder = t("placeholder");
  input.setAttribute("aria-label", t("pick"));
  input.value = myName;
  const ok = el("button", "presence-save", t("save"));
  ok.type = "submit";
  form.append(input, ok);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = cleanName(input.value);
    if (!name) { input.focus(); return; }
    myName = name;
    saveName(name);
    editing = false;
    announce();
    render();
  });
  li.append(form);
  return li;
}

function render() {
  if (!bar) return;
  // Keep a half-typed name across live updates.
  const typing = bar.querySelector("#presenceName");
  const draft = typing ? typing.value : null;
  const hadFocus = typing && document.activeElement === typing;

  bar.textContent = "";
  bar.dataset.status = status;
  const head = el("div", "presence-status");
  head.append(el("span", "presence-dot"));
  const count = peers.size + 1;
  // No relay reachable at all: nobody can be found, whatever the game does. Say why instead of waiting forever.
  const cut = (status === "live" && window.DLE_Link?.blocked()) || status === "offline";
  if (cut) bar.dataset.status = "offline";
  head.append(el("span", "presence-count",
    cut ? t("blocked") : status === "offline" ? t("offline") : status === "connecting" ? t("connecting") : count === 1 ? t("alone") : t("online")(count)));
  if (cut) head.title = t("blockedHelp");
  bar.append(head);
  if (cut) {
    const help = el("span", "presence-blocked", `${t("blockedHelp")} `);
    const diag = el("a", null, t("diag"));
    diag.href = `${root}diag/`;
    help.append(diag);
    bar.append(help);
  }

  const list = el("ul", "presence-list");
  list.append(myChip());
  const others = [...peers.values()].sort((a, b) => isFriend(b) - isFriend(a) || a.name.localeCompare(b.name));
  for (const p of others) list.append(chip(p.name, p.game, false, isFriend(p), p.badges));
  bar.append(list);

  // Friends: how many are here, and a shortcut to the friends list (with join / invite buttons).
  if (window.DLE_Profile) {
    const n = new Set(others.filter(isFriend).map((p) => p.pid)).size;
    const btn = el("button", `presence-friends${n ? " has-online" : ""}`);
    btn.type = "button";
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.1a4 4 0 0 1 0 7.8M18 14.5a7 7 0 0 1 4 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    btn.append(el("span", null, n ? t("friendsOnline")(n) : t("friends")));
    const asked = (window.DLE_Profile.requests?.length || 0) + (window.DLE_Profile.invites?.length || 0);
    if (asked) btn.append(el("span", "presence-badge", String(asked)));
    btn.addEventListener("click", () => window.DLE_Profile.open("friends"));
    bar.append(btn);
  }

  if (draft != null) {
    const input = bar.querySelector("#presenceName");
    if (input) {
      input.value = draft;
      if (hadFocus) input.focus();
    }
  }
}

// ── Friends (profile.js keeps the list) ──
const friendIds = () => window.DLE_Profile?.friendIds ?? [];
const isFriend = (p) => !!p.pid && friendIds().includes(p.pid);
const myInfo = () => ({ name: shownName(), game, pid: window.DLE_Profile?.current?.id ?? null, room: window.DLE_MY_ROOM ?? null, badges: myBadges() });
const cleanRoom = (r) => {
  if (!r || typeof r !== "object") return null;
  const code = String(r.code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const channel = r.channel === "crew" ? "crew" : r.channel === "race" ? "race" : null;
  const g = GAMES.find((x) => x.id === r.game);
  return code && channel && (channel === "crew" || g) ? { code, channel, game: g?.id ?? null } : null;
};
// The page that opens a room: Crew Roll, or the guessing game of a race room.
function roomUrl(room) {
  const page = room.channel === "crew" ? "crew/" : GAMES.find((g) => g.id === room.game)?.path;
  return page ? `${root}${page}index.html#join=${room.code}` : null;
}
function goToRoom(room) {
  const url = roomUrl(room);
  if (!url) return;
  const target = new URL(url, location.href);
  const samePage = target.pathname.replace(/index\.html$/, "") === location.pathname.replace(/index\.html$/, "");
  location.href = target.href;
  // Same page, only the hash changes: reload so the page reads the invite.
  if (samePage) location.reload();
}
let sendInvite = null;
function receiveInvite(data, peerId) {
  const p = peers.get(peerId);
  const room = cleanRoom(data?.room);
  if (!p || !isFriend(p) || !room || !allowed(peerId)) return;
  window.DLE_FX?.play("message");
  inviteBanner(t("invited")(p.name), () => goToRoom(room));
}
function inviteBanner(text, onJoin) {
  if (window.DLE_Rooms) { window.DLE_Rooms.inviteBanner({ text, join: t("join"), dismiss: t("later"), onJoin }); return; }
  document.querySelector(".invite-banner")?.remove();
  const box = el("div", "invite-banner");
  box.setAttribute("role", "alert");
  const yes = el("button", "btn-primary btn-small", t("join"));
  const no = el("button", "btn-ghost btn-small", t("later"));
  yes.type = no.type = "button";
  const close = () => { box.classList.add("is-out"); setTimeout(() => box.remove(), 250); };
  yes.addEventListener("click", () => { close(); onJoin(); });
  no.addEventListener("click", close);
  setTimeout(close, 20000);
  box.append(el("span", "invite-text", text), yes, no);
  document.body.append(box);
}
const announce = () => sendInfo?.(myInfo());
window.addEventListener("dle:room", announce);
window.addEventListener("dle:profile", () => { announce(); render(); });
window.addEventListener("dle:friends", render);
window.addEventListener("dle:badges", () => { announce(); render(); });

// For the friends list: who is here, where, and in which open room.
window.DLE_Presence = {
  get status() { return status; },
  // profile id → { peerId, name, game, room }
  online() {
    const out = new Map();
    for (const [peerId, p] of peers) if (p.pid) out.set(p.pid, { peerId, ...p });
    return out;
  },
  myRoom: () => window.DLE_MY_ROOM ?? null,
  // An invitation left while I was away (kept on my profile).
  showInvite(name, room, onJoin) {
    const r = cleanRoom(room);
    if (!r) return;
    window.DLE_FX?.play("message");
    inviteBanner(t("invited")(name), () => { onJoin?.(); goToRoom(r); });
  },
  invite(peerId) {
    const room = window.DLE_MY_ROOM;
    if (!room || !sendInvite || !peers.has(peerId)) return false;
    sendInvite({ room }, peerId);
    return true;
  },
  goToRoom,
};
const presenceChanged = () => window.dispatchEvent(new Event("dle:presence"));

// A dropped peer-to-peer link usually comes back within seconds: keep the player in the bar meanwhile.
const GRACE = 30000;
const gone = new Map(); // peerId → timer
let tries = 0;

// The network library doesn't set a dropped link up again by itself: when someone vanishes and isn't back after a few
// seconds, leave the lobby and join it again (a fresh handshake), at most every 20 seconds.
let trystero = null;
let turn = []; // TURN relays, used when the direct link fails
let lobby = null;
let lastRelink = 0;
async function joinLobby() {
  // Direct links, with the Nostr relays as a fallback when they fail (shared/link.js).
  const config = { appId: APP_ID, relayConfig: { urls: window.DLE_RELAYS }, turnConfig: turn };
  const room = window.DLE_Link ? await window.DLE_Link.join(trystero, config, "lobby") : trystero.joinRoom(config, "lobby");
  lobby = room;
  const mine = (fn) => (data, meta) => { if (lobby === room) fn(data, meta); };
  const info = room.makeAction("info");
  sendInfo = (data, opts) => info.send(data, opts);
  info.onMessage = mine((data, { peerId }) => {
    const name = cleanName(data?.name);
    if (!name) return;
    const g = GAMES.some((x) => x.id === data?.game) ? data.game : "home";
    const pid = /^[a-z0-9]{10,20}$/.test(data?.pid ?? "") ? data.pid : null;
    peers.set(peerId, { name, game: g, pid, room: cleanRoom(data?.room), badges: cleanBadges(data?.badges) });
    render();
    presenceChanged();
    renderChat();
  });
  const invite = room.makeAction("finvite");
  sendInvite = (data, peerId) => invite.send(data, { target: peerId });
  invite.onMessage = mine((data, { peerId }) => receiveInvite(data, peerId));
  const chatMsg = room.makeAction("chat");
  const chatLog = room.makeAction("chatlog");
  sendChat = (m) => chatMsg.send(m);
  chatMsg.onMessage = mine((data, { peerId }) => receive(data, peerId));
  chatLog.onMessage = mine((data, { peerId }) => receiveHistory(data, peerId));
  room.onPeerJoin = (peerId) => {
    if (lobby !== room) return;
    clearTimeout(gone.get(peerId));
    gone.delete(peerId);
    info.send(myInfo(), { target: peerId });
    if (chat.messages.length) chatLog.send(shareable(), { target: peerId });
  };
  room.onPeerLeave = (peerId) => {
    if (lobby !== room) return;
    clearTimeout(gone.get(peerId));
    gone.set(peerId, setTimeout(() => {
      gone.delete(peerId);
      peers.delete(peerId); rate.delete(peerId); render(); renderChat(); presenceChanged();
    }, GRACE));
    setTimeout(() => { if (gone.has(peerId)) relink(); }, 5000);
  };
}
async function relink() {
  if (!lobby || Date.now() - lastRelink < 20000) return;
  lastRelink = Date.now();
  const old = lobby;
  lobby = null;
  try { await old.leave(); } catch {}
  await joinLobby();
}

async function connect() {
  try {
    trystero = await import(TRYSTERO);
    turn = (await window.DLE_TURN?.()) ?? [];
    await joinLobby();
    status = "live";
    tries = 0;
    // Say who I am again now and then: someone who missed it (lost message, link back up) still sees me.
    setInterval(announce, 25000);
    render();
    renderChat();
  } catch (e) {
    // The network library could not load: try again, forever, a bit slower each time.
    console.warn("Presence unavailable, retrying:", e);
    status = "offline";
    render();
    renderChat();
    setTimeout(connect, Math.min(30000, 2000 * 2 ** tries++));
  }
}
// Coming back to the tab or the network: tell everyone I'm here.
document.addEventListener("visibilitychange", () => { if (!document.hidden) announce(); });
window.addEventListener("online", announce);

// ── Live chat (bottom left, every page) ──
// Same peers as the presence bar. There is no server, so the history lives with the players:
// each tab keeps the last messages and hands them to whoever arrives. Everything is plain text.
const CHAT_MAX = 200;
const CHAT_KEEP = 60;
const chat = { open: false, unread: 0, messages: [], seen: new Set() };
let sendChat = null;
let lastSent = 0;
const rate = new Map(); // peerId → recent receive times

const realNow = () => window.DLE_CLOCK?.now() ?? Date.now();
function cleanMessage(m) {
  if (!m || typeof m !== "object") return null;
  const text = String(m.text ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, CHAT_MAX);
  const id = String(m.id ?? "").slice(0, 40);
  if (!text || !id) return null;
  return {
    id,
    text,
    name: cleanName(m.name) || "Player",
    ts: Math.min(Number(m.ts) || realNow(), realNow() + 60000), // real time (shared/games.js), not a wrong local clock
    game: GAMES.some((x) => x.id === m.game) ? m.game : "home",
    badges: cleanBadges(m.badges),
    mine: !!m.mine,
  };
}

function addMessage(raw, { quiet = false } = {}) {
  const m = cleanMessage(raw);
  if (!m || chat.seen.has(m.id)) return false;
  chat.seen.add(m.id);
  chat.messages.push(m);
  chat.messages.sort((a, b) => a.ts - b.ts);
  if (chat.messages.length > CHAT_KEEP) chat.messages.splice(0, chat.messages.length - CHAT_KEEP);
  if (!quiet && !chat.open && !m.mine) chat.unread++;
  if (!quiet && !m.mine) window.DLE_FX?.play("message");
  try { sessionStorage.setItem("dle:chat", JSON.stringify(chat.messages)); } catch {}
  return true;
}

// Ignore anyone sending more than 6 messages in 8 seconds.
function allowed(peerId) {
  const now = Date.now();
  const times = (rate.get(peerId) || []).filter((x) => now - x < 8000);
  times.push(now);
  rate.set(peerId, times);
  return times.length <= 6;
}

// The chat follows the player from page to page within the tab.
try { chat.open = sessionStorage.getItem("dle:chatOpen") === "1"; } catch {}
try {
  const kept = JSON.parse(sessionStorage.getItem("dle:chat") || "[]");
  if (Array.isArray(kept)) for (const m of kept) addMessage(m, { quiet: true });
} catch {}

const chatRoot = el("div", "chat");
chatRoot.innerHTML = `
  <section class="chat-panel" role="dialog" aria-labelledby="chatTitle" hidden>
    <header class="chat-head">
      <span class="presence-dot"></span>
      <div class="chat-titles"><h2 id="chatTitle"></h2><span class="chat-count"></span></div>
      <button class="chat-close" type="button"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
    </header>
    <ol class="chat-list" aria-live="polite"></ol>
    <form class="chat-form">
      <input class="chat-input" autocomplete="off" maxlength="${CHAT_MAX}" />
      <button class="chat-send" type="submit"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" fill="currentColor"/></svg></button>
    </form>
  </section>
  <button class="chat-toggle" type="button">
    <svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 5h16v11H9l-5 4V5z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>
    <span class="chat-badge" hidden></span>
  </button>`;
document.body.append(chatRoot);

const $c = (s) => chatRoot.querySelector(s);
const chatList = $c(".chat-list");
const chatInput = $c(".chat-input");
const chatToggle = $c(".chat-toggle");

function clock(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// The day a message was sent: "Today", "Yesterday", or a date ("Mon 6 Oct"), with the year when it isn't this one.
const dayKey = (ts) => new Date(ts).toDateString();
function dayLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return t("today");
  if (d.toDateString() === yesterday.toDateString()) return t("yesterday");
  const opts = { weekday: "short", day: "numeric", month: "short" };
  if (d.getFullYear() !== today.getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString(lang() === "fr" ? "fr-FR" : "en-GB", opts);
}
const fullDate = (ts) => new Date(ts).toLocaleString(lang() === "fr" ? "fr-FR" : "en-GB", { dateStyle: "full", timeStyle: "short" });

function renderChat({ scroll = false } = {}) {
  const nearBottom = chatList.scrollHeight - chatList.scrollTop - chatList.clientHeight < 60;
  chatRoot.dataset.status = status;
  chatRoot.classList.toggle("is-open", chat.open);
  $c(".chat-panel").hidden = !chat.open;
  $c("#chatTitle").textContent = t("chat");
  $c(".chat-count").textContent = status === "live" ? t("online")(peers.size + 1) : status === "connecting" ? t("connecting") : t("offline");
  $c(".chat-close").setAttribute("aria-label", t("close"));
  $c(".chat-send").setAttribute("aria-label", t("send"));
  chatInput.placeholder = status === "offline" ? t("offline") : t("say")(shownName());
  chatInput.disabled = status === "offline";
  chatInput.setAttribute("aria-label", t("chat"));
  chatToggle.setAttribute("aria-label", t("chat"));
  chatToggle.setAttribute("aria-expanded", chat.open);
  chatToggle.title = t("chat");
  const badge = $c(".chat-badge");
  badge.hidden = !chat.unread;
  badge.textContent = chat.unread > 9 ? "9+" : String(chat.unread);

  chatList.textContent = "";
  if (!chat.messages.length) chatList.append(el("li", "chat-empty", t("chatEmpty")));
  let prev = null;
  for (const m of chat.messages) {
    // A divider at each new day.
    const newDay = !prev || dayKey(prev.ts) !== dayKey(m.ts);
    if (newDay) chatList.append(el("li", "chat-day", dayLabel(m.ts)));
    const grouped = !newDay && prev.name === m.name && prev.mine === m.mine && m.ts - prev.ts < 120000;
    const li = el("li", `chat-msg${m.mine ? " is-mine" : ""}${grouped ? " is-grouped" : ""}`);
    if (!grouped) {
      const meta = el("div", "chat-meta");
      const logo = gameLogo(m.game);
      if (logo) meta.append(logo);
      const time = el("time", null, clock(m.ts));
      time.dateTime = new Date(m.ts).toISOString();
      time.title = fullDate(m.ts);
      meta.append(el("b", null, m.mine ? `${m.name} (${t("you")})` : m.name));
      const row = badgeRow(m.badges);
      if (row) meta.append(row);
      meta.append(time);
      li.append(meta);
    }
    li.append(el("p", "chat-text", m.text));
    chatList.append(li);
    prev = m;
  }
  if (scroll || nearBottom) chatList.scrollTop = chatList.scrollHeight;
}

function setChatOpen(open) {
  chat.open = open;
  if (open) { chat.unread = 0; document.querySelector(".chat-notes")?.replaceChildren(); }
  try { sessionStorage.setItem("dle:chatOpen", open ? "1" : "0"); } catch {}
  renderChat({ scroll: true });
  (open ? chatInput : chatToggle).focus();
}

chatToggle.addEventListener("click", () => setChatOpen(!chat.open));
$c(".chat-close").addEventListener("click", () => setChatOpen(false));
chatRoot.addEventListener("keydown", (e) => { if (e.key === "Escape" && chat.open) setChatOpen(false); });

$c(".chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.replace(/\s+/g, " ").trim().slice(0, CHAT_MAX);
  const now = Date.now();
  if (!text || !sendChat || now - lastSent < 800) return;
  lastSent = now;
  const msg = { id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 10)}`, text, name: shownName(), game, ts: window.DLE_CLOCK?.now() ?? now, badges: myBadges() };
  sendChat(msg);
  addMessage({ ...msg, mine: true });
  chatInput.value = "";
  renderChat({ scroll: true });
});

function receive(data, peerId) {
  if (!allowed(peerId)) return;
  // Use the name their presence announced when we know it.
  const from = peers.get(peerId);
  if (!addMessage({ ...data, name: from?.name || data?.name, badges: from?.badges ?? data?.badges, mine: false })) return;
  renderChat();
  if (!chat.open) {
    chatToggle.classList.remove("bump");
    void chatToggle.offsetWidth;
    chatToggle.classList.add("bump");
    const id = String(data?.id ?? "").slice(0, 40);
    notify(chat.messages.find((m) => m.id === id));
  }
}

// A message while the chat is closed: a small card next to the chat button for a few seconds (a click opens the
// chat). Never more than 2 on screen, and none at all while messages pour in (3 shown in the last 20 s): the badge
// still counts them, so the screen is never flooded.
const notes = el("div", "chat-notes");
document.body.append(notes);
let noteTimes = [];
function notify(m) {
  if (!m || chat.open) return;
  const now = Date.now();
  noteTimes = noteTimes.filter((x) => now - x < 20000);
  if (noteTimes.length >= 3) return;
  noteTimes.push(now);
  const card = el("button", "chat-note");
  card.type = "button";
  const head = el("span", "chat-note-head");
  const logo = gameLogo(m.game);
  if (logo) head.append(logo);
  head.append(el("b", null, m.name), el("time", null, clock(m.ts)));
  card.append(head, el("span", "chat-note-text", m.text));
  card.addEventListener("click", () => setChatOpen(true));
  notes.append(card);
  while (notes.children.length > 2) notes.firstElementChild.remove();
  setTimeout(() => { card.classList.add("is-leaving"); setTimeout(() => card.remove(), 250); }, 5000);
}

function receiveHistory(data, peerId) {
  if (!Array.isArray(data) || !allowed(peerId)) return;
  let added = false;
  for (const m of data.slice(-30)) added = addMessage({ ...m, mine: false }, { quiet: true }) || added;
  if (added) renderChat();
}

// What a newcomer receives: the recent messages, without my "mine" flags.
const shareable = () => chat.messages.slice(-30).map(({ mine, ...m }) => m);

// On a phone the category strip scrolls: bring the current page into view.
window.addEventListener("load", () => {
  const nav = document.getElementById("categories");
  const cur = nav?.querySelector(".is-current");
  if (nav && cur && nav.scrollWidth > nav.clientWidth) nav.scrollLeft += cur.getBoundingClientRect().left - nav.getBoundingClientRect().left - nav.clientWidth / 2 + cur.offsetWidth / 2;
});

window.addEventListener("dle:lang", () => { render(); renderChat(); });
window.addEventListener("dle:relays", render);
// A name saved in a game lobby is the name here too.
window.addEventListener("dle:name", () => {
  myName = storedName() || myName;
  editing = false;
  announce();
  render();
  renderChat();
});
render();
renderChat({ scroll: true });
connect();
})();
