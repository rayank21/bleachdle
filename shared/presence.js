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
    you: "you",
    placeholder: "Your name",
    edit: "Change your name",
    save: "Save",
    pick: "Pick a name",
    chat: "Live chat",
    chatEmpty: "No messages yet. Say hi!",
    say: (n) => `Message as ${n}…`,
    send: "Send",
    close: "Close",
  },
  fr: {
    online: (n) => `${n} en ligne`,
    alone: "Tu es seul pour l'instant",
    connecting: "Connexion…",
    offline: "Joueurs en direct indisponibles",
    you: "toi",
    placeholder: "Ton pseudo",
    edit: "Modifier ton pseudo",
    save: "OK",
    pick: "Choisis un pseudo",
    chat: "Chat en direct",
    chatEmpty: "Aucun message pour l'instant. Dis bonjour !",
    say: (n) => `Écrire en tant que ${n}…`,
    send: "Envoyer",
    close: "Fermer",
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
const peers = new Map(); // peerId → { name, game }
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

function chip(name, gameId, isMe) {
  const li = el("li", `presence-chip${isMe ? " is-me" : ""}`);
  const logo = gameLogo(gameId);
  if (logo) li.append(logo);
  li.append(el("span", "presence-name", name));
  if (isMe) li.append(el("span", "presence-you", `(${t("you")})`));
  return li;
}

function myChip() {
  if (!editing) {
    const li = chip(shownName(), game, true);
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
    sendInfo?.({ name, game });
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
  head.append(el("span", "presence-count",
    status === "offline" ? t("offline") : status === "connecting" ? t("connecting") : count === 1 ? t("alone") : t("online")(count)));
  bar.append(head);

  const list = el("ul", "presence-list");
  list.append(myChip());
  const others = [...peers.values()].sort((a, b) => a.name.localeCompare(b.name));
  for (const p of others) list.append(chip(p.name, p.game, false));
  bar.append(list);

  if (draft != null) {
    const input = bar.querySelector("#presenceName");
    if (input) {
      input.value = draft;
      if (hadFocus) input.focus();
    }
  }
}

async function connect() {
  try {
    const { joinRoom } = await import(TRYSTERO);
    const room = joinRoom({ appId: APP_ID, relayConfig: { urls: window.DLE_RELAYS } }, "lobby");
    const info = room.makeAction("info");
    sendInfo = (data, opts) => info.send(data, opts);
    info.onMessage = (data, { peerId }) => {
      const name = cleanName(data?.name);
      if (!name) return;
      const g = GAMES.some((x) => x.id === data?.game) ? data.game : "home";
      peers.set(peerId, { name, game: g });
      render();
      renderChat();
    };
    const chatMsg = room.makeAction("chat");
    const chatLog = room.makeAction("chatlog");
    sendChat = (m) => chatMsg.send(m);
    chatMsg.onMessage = (data, { peerId }) => receive(data, peerId);
    chatLog.onMessage = (data, { peerId }) => receiveHistory(data, peerId);
    room.onPeerJoin = (peerId) => {
      info.send({ name: shownName(), game }, { target: peerId });
      if (chat.messages.length) chatLog.send(shareable(), { target: peerId });
    };
    room.onPeerLeave = (peerId) => { peers.delete(peerId); rate.delete(peerId); render(); renderChat(); };
    status = "live";
    render();
    renderChat();
  } catch (e) {
    console.warn("Presence unavailable:", e);
    status = "offline";
    render();
    renderChat();
  }
}

// ── Live chat (bottom left, every page) ──
// Same peers as the presence bar. There is no server, so the history lives with the players:
// each tab keeps the last messages and hands them to whoever arrives. Everything is plain text.
const CHAT_MAX = 200;
const CHAT_KEEP = 60;
const chat = { open: false, unread: 0, messages: [], seen: new Set() };
let sendChat = null;
let lastSent = 0;
const rate = new Map(); // peerId → recent receive times

function cleanMessage(m) {
  if (!m || typeof m !== "object") return null;
  const text = String(m.text ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, CHAT_MAX);
  const id = String(m.id ?? "").slice(0, 40);
  if (!text || !id) return null;
  return {
    id,
    text,
    name: cleanName(m.name) || "Player",
    ts: Math.min(Number(m.ts) || Date.now(), Date.now()),
    game: GAMES.some((x) => x.id === m.game) ? m.game : "home",
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
    const grouped = prev && prev.name === m.name && prev.mine === m.mine && m.ts - prev.ts < 120000;
    const li = el("li", `chat-msg${m.mine ? " is-mine" : ""}${grouped ? " is-grouped" : ""}`);
    if (!grouped) {
      const meta = el("div", "chat-meta");
      const logo = gameLogo(m.game);
      if (logo) meta.append(logo);
      meta.append(el("b", null, m.mine ? `${m.name} (${t("you")})` : m.name), el("time", null, clock(m.ts)));
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
  if (open) chat.unread = 0;
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
  const msg = { id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 10)}`, text, name: shownName(), game, ts: now };
  sendChat(msg);
  addMessage({ ...msg, mine: true });
  chatInput.value = "";
  renderChat({ scroll: true });
});

function receive(data, peerId) {
  if (!allowed(peerId)) return;
  // Use the name their presence announced when we know it.
  if (!addMessage({ ...data, name: peers.get(peerId)?.name || data?.name, mine: false })) return;
  renderChat();
  if (!chat.open) {
    chatToggle.classList.remove("bump");
    void chatToggle.offsetWidth;
    chatToggle.classList.add("bump");
  }
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
// A name saved in a game lobby is the name here too.
window.addEventListener("dle:name", () => {
  myName = storedName() || myName;
  editing = false;
  sendInfo?.({ name: shownName(), game });
  render();
  renderChat();
});
render();
renderChat({ scroll: true });
connect();
})();
