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
    const room = joinRoom({ appId: APP_ID }, "lobby");
    const info = room.makeAction("info");
    sendInfo = (data, opts) => info.send(data, opts);
    info.onMessage = (data, { peerId }) => {
      const name = cleanName(data?.name);
      if (!name) return;
      const g = GAMES.some((x) => x.id === data?.game) ? data.game : "home";
      peers.set(peerId, { name, game: g });
      render();
    };
    room.onPeerJoin = (peerId) => info.send({ name: shownName(), game }, { target: peerId });
    room.onPeerLeave = (peerId) => { peers.delete(peerId); render(); };
    status = "live";
    render();
  } catch (e) {
    console.warn("Presence unavailable:", e);
    status = "offline";
    render();
  }
}

window.addEventListener("dle:lang", render);
render();
connect();
})();
