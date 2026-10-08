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
    chatEmpty: "No messages yet. Say hi!", react: "React", boomHelp: "Big reaction (everyone sees it)",
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
    away: "Away", setAway: "Set yourself away", backOnline: "Back online",
    conn: "Connection", connTitle: "Connection test", connRun: "Test again", connFix: "Reconnect", connFull: "Full diagnostic", connCopy: "Copy", connCopied: "Copied!",
    connNet: "Internet", connRelays: "Relays (finding players)", connServer: "Server (profiles, leaderboard)", connRtc: "Direct link (WebRTC)", connPlayers: "Players found",
    connOk: "Everything works on your side.", connBad: "Something is wrong: tap Reconnect, and if it lasts run the full diagnostic.", connWait: "Testing…",
    tabGeneral: "General", tabPrivate: "Private", tabVoice: "Voice",
    dmNeed: "Create a profile and add friends to write to them in private.", dmNone: "No friends yet: add some from your profile (Friends tab).",
    dmEmpty: (n) => `No messages with ${n} yet. Say hi!`, dmSay: (n) => `Message ${n}…`, dmFail: "Not sent, try again.", back: "Back",
    record: "Voice message", recording: "Recording", cancel: "Cancel", voiceNeed: "Create a profile to send voice messages.",
    micDenied: "Microphone blocked: allow it in your browser's settings for this site.", voiceUnsupported: "Your browser can't record audio.",
    voiceFail: "The voice message didn't go through.", voiceMsg: "Voice message", featAch: (n) => `unlocked the achievement “${n}”!`,
    voiceTitle: "Voice chat", voiceHelp: "Talk live with everyone in the channel. Your microphone is only used while you're in it.",
    voiceGeneral: "General voice", voiceRoom: (c) => `Room voice · ${c}`, voiceJoin: "Join", voiceLeave: "Leave", mute: "Mute", unmute: "Unmute",
    voiceTap: "Tap anywhere to hear the others", voiceAlone: "Nobody else yet: invite your friends!", voiceLoading: "Connecting…",
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
    chatEmpty: "Aucun message pour l'instant. Dis bonjour !", react: "Réagir", boomHelp: "Grosse réaction (tout le monde la voit)",
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
    away: "Absent", setAway: "Te mettre absent", backOnline: "De retour",
    conn: "Connexion", connTitle: "Test de connexion", connRun: "Relancer", connFix: "Reconnecter", connFull: "Diagnostic complet", connCopy: "Copier", connCopied: "Copié !",
    connNet: "Internet", connRelays: "Relais (trouver les joueurs)", connServer: "Serveur (profils, classement)", connRtc: "Connexion directe (WebRTC)", connPlayers: "Joueurs trouvés",
    connOk: "Tout fonctionne de ton côté.", connBad: "Il y a un souci : appuie sur Reconnecter, et si ça dure lance le diagnostic complet.", connWait: "Test en cours…",
    tabGeneral: "Général", tabPrivate: "Privé", tabVoice: "Vocal",
    dmNeed: "Crée un profil et ajoute des amis pour leur écrire en privé.", dmNone: "Pas encore d'amis : ajoute-en depuis ton profil (onglet Amis).",
    dmEmpty: (n) => `Aucun message avec ${n} pour l'instant. Dis bonjour !`, dmSay: (n) => `Écrire à ${n}…`, dmFail: "Pas envoyé, réessaie.", back: "Retour",
    record: "Message vocal", recording: "Enregistrement", cancel: "Annuler", voiceNeed: "Crée un profil pour envoyer des messages vocaux.",
    micDenied: "Micro bloqué : autorise-le dans les réglages du navigateur pour ce site.", voiceUnsupported: "Ton navigateur ne sait pas enregistrer le son.",
    voiceFail: "Le message vocal n'est pas passé.", voiceMsg: "Message vocal", featAch: (n) => `a débloqué le succès « ${n} » !`,
    voiceTitle: "Chat vocal", voiceHelp: "Parle en direct avec tout le monde dans le salon. Ton micro n'est utilisé que pendant que tu y es.",
    voiceGeneral: "Vocal général", voiceRoom: (c) => `Vocal de la salle · ${c}`, voiceJoin: "Rejoindre", voiceLeave: "Quitter", mute: "Couper le micro", unmute: "Activer le micro",
    voiceTap: "Touche l'écran pour entendre les autres", voiceAlone: "Personne d'autre pour l'instant : invite tes amis !", voiceLoading: "Connexion…",
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
// The people behind the peers, once each: a player with several tabs, or whose old link is still in its grace
// period after a reload, is one person (same profile, or same name without one). Me in another tab isn't shown.
const personKey = (p) => (p.pid ? `p:${p.pid}` : `n:${p.name.toLowerCase()}`);
function people() {
  const me = personKey(myInfo());
  const out = new Map();
  for (const p of peers.values()) {
    const k = personKey(p);
    if (k === me) continue;
    if (!out.has(k) || (p.at ?? 0) > (out.get(k).at ?? 0)) out.set(k, p);
  }
  return [...out.values()];
}
let status = "connecting"; // connecting | live | offline
// Away: set by hand (kept), or by itself after 5 minutes in another tab or app.
const AWAY = "dle:away";
let manualAway = false;
try { manualAway = localStorage.getItem(AWAY) === "1"; } catch {}
let autoAway = false;
let awayTimer = null;
const isAway = () => manualAway || autoAway;
function setAway(on) {
  manualAway = on;
  try { on ? localStorage.setItem(AWAY, "1") : localStorage.removeItem(AWAY); } catch {}
  announce();
  render();
}
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
const myPid = () => window.DLE_Profile?.current?.id ?? null;
const cleanPid = (s) => (/^[a-z0-9]{10,20}$/.test(s ?? "") ? s : null);

function chip(name, gameId, isMe, isFriend, badges = [], pid = null, away = false) {
  const li = el("li", `presence-chip${isMe ? " is-me" : ""}${isFriend ? " is-friend" : ""}${away ? " is-away" : ""}`);
  if (isFriend) li.title = t("friends");
  if (away) li.title = `${li.title ? `${li.title} · ` : ""}${t("away")}`;
  const logo = gameLogo(gameId);
  if (logo) li.append(logo);
  li.append(window.DLE_NAME(name, pid, "presence-name"));
  if (away) li.append(el("span", "presence-away", "💤"));
  const row = badgeRow(badges);
  if (row) li.append(row);
  if (isMe) li.append(el("span", "presence-you", `(${t("you")})`));
  // Someone with a profile: a click opens it (their showcase, best crew, numbers).
  else if (pid && window.DLE_Profile?.openPlayer) {
    li.classList.add("has-profile");
    li.addEventListener("click", () => window.DLE_Profile.openPlayer(pid));
  }
  return li;
}

function myChip() {
  if (!editing) {
    const li = chip(shownName(), game, true, false, myBadges(), myPid(), isAway());
    // Away / back.
    const st = el("button", `presence-status-btn${isAway() ? " is-away" : ""}`);
    st.type = "button";
    st.title = st.ariaLabel = manualAway ? t("backOnline") : t("setAway");
    st.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="${manualAway ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
    st.addEventListener("click", () => setAway(!manualAway));
    li.append(st);
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
  const others = people().sort((a, b) => isFriend(b) - isFriend(a) || a.name.localeCompare(b.name));
  const count = others.length + 1;
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
  for (const p of others) list.append(chip(p.name, p.game, false, isFriend(p), p.badges, p.pid, p.away));
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

  // The connection test, right here.
  const conn = el("button", "presence-conn");
  conn.type = "button";
  conn.title = conn.ariaLabel = t("connTitle");
  conn.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0M12 19.5h.01" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  conn.append(el("span", null, t("conn")));
  conn.addEventListener("click", openConn);
  bar.append(conn);

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
const myInfo = () => ({ name: shownName(), game, pid: window.DLE_Profile?.current?.id ?? null, room: window.DLE_MY_ROOM ?? null, badges: myBadges(), away: isAway() });
const cleanRoom = (r) => {
  if (!r || typeof r !== "object") return null;
  const code = String(r.code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const channel = ["crew", "race", "cards"].includes(r.channel) ? r.channel : null;
  const g = GAMES.find((x) => x.id === r.game);
  return code && channel && (channel !== "race" || g) ? { code, channel, game: g?.id ?? null } : null;
};
// The page that opens a room: Crew Roll, or the guessing game of a race room.
function roomUrl(room) {
  // A card duel opens Crew Roll's cards tab.
  if (room.channel === "cards") return `${root}crew/index.html#cards=${room.code}`;
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
// The top 3 came in (or changed): their names shine.
window.addEventListener("dle:ranks", () => { render(); renderChat(); });

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
// Players announce themselves every 25 s and on every arrival: their updates are drawn together, a moment later,
// instead of rebuilding the bar and the chat for each one (that was a source of stutter with many players).
let soonTimer = 0;
function soon() {
  if (soonTimer) return;
  soonTimer = setTimeout(() => { soonTimer = 0; render(); presenceChanged(); renderChat(); }, 300);
}

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
    peers.set(peerId, { name, game: g, pid, room: cleanRoom(data?.room), badges: cleanBadges(data?.badges), away: data?.away === true, at: Date.now() });
    soon();
  });
  const invite = room.makeAction("finvite");
  sendInvite = (data, peerId) => invite.send(data, { target: peerId });
  invite.onMessage = mine((data, { peerId }) => receiveInvite(data, peerId));
  const chatMsg = room.makeAction("chat");
  const chatLog = room.makeAction("chatlog");
  sendChat = (m) => chatMsg.send(m);
  chatMsg.onMessage = mine((data, { peerId }) => receive(data, peerId));
  chatLog.onMessage = mine((data, { peerId }) => receiveHistory(data, peerId));
  const react = room.makeAction("react");
  sendReact = (d) => react.send(d);
  react.onMessage = mine((data, { peerId }) => receiveReact(data, peerId));
  const dmAct = room.makeAction("dm");
  sendDmTo = (data, peerId) => dmAct.send(data, { target: peerId });
  dmAct.onMessage = mine((data, { peerId }) => receiveDm(data, peerId));
  const big = room.makeAction("boom");
  sendBoom = (d) => big.send(d);
  big.onMessage = mine((data, { peerId }) => receiveBoom(data, peerId));
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
      peers.delete(peerId); rate.delete(peerId); soon();
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
// Back from a phone's sleep or a network change (shared/link.js): shake hands again at once, then say who I am.
window.addEventListener("dle:wake", async () => {
  if (!lobby) return;
  lastRelink = 0;
  await relink();
  announce();
});
// Coming back to the tab or the network: tell everyone I'm here (and no longer away). 5 minutes away: away.
document.addEventListener("visibilitychange", () => {
  clearTimeout(awayTimer);
  if (document.hidden) { awayTimer = setTimeout(() => { autoAway = true; announce(); render(); }, 300000); return; }
  if (autoAway) { autoAway = false; render(); }
  announce();
});
window.addEventListener("online", announce);

// ── Live chat (bottom left, every page) ──
// Same peers as the presence bar. There is no server, so the history lives with the players:
// each tab keeps the last messages and hands them to whoever arrives. Everything is plain text.
const CHAT_MAX = 200;
const API = "/api/profile";
const VOICE_ID = /^[a-f0-9]{16}$/;
const CHAT_KEEP = 60;
const chat = { open: false, unread: 0, messages: [], seen: new Set() };
let sendChat = null;
let lastSent = 0;
const rate = new Map(); // peerId → recent receive times

const realNow = () => window.DLE_CLOCK?.now() ?? Date.now();
// An automatic message: an achievement unlocked or a record beaten (in both languages, each reader sees theirs).
function cleanFeat(f) {
  if (!f || typeof f !== "object" || !["ach", "rec"].includes(f.k)) return null;
  const clip = (s) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, "").slice(0, 120);
  return { k: f.k, tier: ["bronze", "silver", "gold", "platinum"].includes(f.tier) ? f.tier : "silver", en: clip(f.en), fr: clip(f.fr) };
}
const featText = (f) => (lang() === "fr" ? f.fr || f.en : f.en || f.fr);
function cleanMessage(m) {
  if (!m || typeof m !== "object") return null;
  const text = String(m.text ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, CHAT_MAX);
  const id = String(m.id ?? "").slice(0, 40);
  const voice = VOICE_ID.test(m.voice ?? "") ? m.voice : null;
  if ((!text && !voice) || !id) return null;
  return {
    id,
    text,
    voice,
    dur: voice ? Math.min(60, Math.max(1, Math.round(+m.dur || 1))) : 0,
    name: cleanName(m.name) || "Player",
    ts: Math.min(Number(m.ts) || realNow(), realNow() + 60000), // real time (shared/games.js), not a wrong local clock
    game: GAMES.some((x) => x.id === m.game) ? m.game : "home",
    badges: cleanBadges(m.badges),
    pid: cleanPid(m.pid),
    reacts: cleanReacts(m.reacts),
    mine: !!m.mine,
    feat: cleanFeat(m.feat),
  };
}

// ── Reactions: an emoji under a message (who reacted, by name), and big ones that fly across everyone's screen ──
const REACTS = ["😂", "🔥", "💀", "😮", "❤️", "👍"];
const BOOMS = ["🔥", "😂", "💀", "🎉", "😱", "👑", "💯", "🤯"];
function cleanReacts(r) {
  const out = {};
  if (!r || typeof r !== "object") return out;
  for (const e of REACTS) {
    const names = Array.isArray(r[e]) ? [...new Set(r[e].map(cleanName).filter(Boolean))].slice(0, 30) : [];
    if (names.length) out[e] = names;
  }
  return out;
}
// Adds or removes one name's reaction; true when something changed.
function setReact(m, e, name, on) {
  if (!m || !REACTS.includes(e) || !name) return false;
  const list = m.reacts[e] ?? [];
  const has = list.some((n) => n.toLowerCase() === name.toLowerCase());
  if (has === on) return false;
  m.reacts[e] = on ? [...list, name].slice(0, 30) : list.filter((n) => n.toLowerCase() !== name.toLowerCase());
  if (!m.reacts[e].length) delete m.reacts[e];
  return true;
}
const saveChat = () => { try { sessionStorage.setItem("dle:chat", JSON.stringify(chat.messages)); } catch {} };

function addMessage(raw, { quiet = false } = {}) {
  const m = cleanMessage(raw);
  if (!m) return false;
  // Known already (history from someone else): only its reactions can be new.
  if (chat.seen.has(m.id)) {
    const known = chat.messages.find((x) => x.id === m.id);
    let changed = false;
    if (known) for (const [e, names] of Object.entries(m.reacts)) for (const n of names) changed = setReact(known, e, n, true) || changed;
    if (changed) saveChat();
    return changed;
  }
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
    <nav class="chat-tabs"></nav>
    <div class="chat-dmhead" hidden></div>
    <ol class="chat-list" aria-live="polite"></ol>
    <div class="chat-voice" hidden></div>
    <div class="chat-booms" hidden></div>
    <form class="chat-form">
      <button class="chat-boom" type="button"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M13 2 3 14h9l-1 8 10-12h-9z" fill="currentColor"/></svg></button>
      <input class="chat-input" autocomplete="off" maxlength="${CHAT_MAX}" />
      <button class="chat-mic" type="button"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
      <button class="chat-send" type="submit"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" fill="currentColor"/></svg></button>
      <div class="chat-rec" hidden>
        <span class="chat-rec-dot"></span><span class="chat-rec-label"></span><b class="chat-rec-time">0:00</b>
        <button class="chat-rec-cancel btn-ghost btn-small" type="button"></button>
        <button class="chat-rec-send" type="button"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" fill="currentColor"/></svg></button>
      </div>
    </form>
  </section>
  <button class="voice-pill" type="button" hidden></button>
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
  $c(".chat-count").textContent = status === "live" ? t("online")(people().length + 1) : status === "connecting" ? t("connecting") : t("offline");
  $c(".chat-close").setAttribute("aria-label", t("close"));
  $c(".chat-send").setAttribute("aria-label", t("send"));
  chatInput.placeholder = status === "offline" ? t("offline") : t("say")(shownName());
  chatInput.disabled = status === "offline";
  chatInput.setAttribute("aria-label", t("chat"));
  chatToggle.setAttribute("aria-label", t("chat"));
  $c(".chat-boom").title = $c(".chat-boom").ariaLabel = t("boomHelp");
  chatToggle.setAttribute("aria-expanded", chat.open);
  chatToggle.title = t("chat");
  const badge = $c(".chat-badge");
  const total = chat.unread + dmTotal();
  badge.hidden = !total;
  badge.textContent = total > 9 ? "9+" : String(total);
  renderVoicePill();
  // Closed: only the badge and the voice pill change; the list is drawn when the chat opens.
  if (!chat.open) return;
  renderTabs();
  const view = chat.view;
  $c(".chat-form").hidden = view === "dms" || view === "voice";
  $c(".chat-boom").hidden = view !== "general";
  if (view !== "general") boomRow.hidden = true;
  $c(".chat-dmhead").hidden = view !== "dm";
  $c(".chat-voice").hidden = view !== "voice";
  chatList.hidden = view === "voice";
  $c(".chat-mic").title = $c(".chat-mic").ariaLabel = t("record");
  $c(".chat-rec-cancel").textContent = t("cancel");
  $c(".chat-rec-label").textContent = t("recording");
  if (view === "dms") { renderDmList(); return; }
  if (view === "dm") { renderDm(scroll, nearBottom); return; }
  if (view === "voice") { renderVoice(); return; }

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
      meta.append(window.DLE_NAME(m.mine ? `${m.name} (${t("you")})` : m.name, m.pid, "chat-author"));
      const row = badgeRow(m.badges);
      if (row) meta.append(row);
      meta.append(time);
      li.append(meta);
    }
    if (m.feat) {
      li.classList.add("is-feat", `tier-${m.feat.tier}`);
      const p = el("p", "chat-feat");
      p.append(el("span", "chat-feat-icon", m.feat.k === "ach" ? "🏆" : "🔥"), el("b", null, m.mine ? t("you") : m.name), " ", m.feat.k === "ach" ? t("featAch")(featText(m.feat)) : featText(m.feat));
      li.append(p);
    } else if (m.text) li.append(el("p", "chat-text", m.text));
    if (m.voice) li.append(voiceEl(m.voice, m.dur));
    // Reactions under the message (mine highlighted, a click toggles mine), and the button to add one.
    const me = shownName().toLowerCase();
    const reacts = el("div", "chat-reacts");
    for (const e of REACTS) {
      const names = m.reacts[e];
      if (!names?.length) continue;
      const chipBtn = el("button", `chat-react${names.some((n) => n.toLowerCase() === me) ? " is-mine" : ""}`);
      chipBtn.type = "button";
      chipBtn.title = names.join(", ");
      chipBtn.append(el("span", "chat-react-e", e), el("b", null, String(names.length)));
      chipBtn.addEventListener("click", () => toggleReact(m, e));
      reacts.append(chipBtn);
    }
    const add = el("button", "chat-react-add");
    add.type = "button";
    add.title = add.ariaLabel = t("react");
    add.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM8.5 14.5s1.3 2 3.5 2 3.5-2 3.5-2M9 9.5h.01M15 9.5h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    add.addEventListener("click", (ev) => { ev.stopPropagation(); reactPicker(add, m); });
    reacts.append(add);
    li.append(reacts);
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
  // On a phone, focusing the input opens the keyboard: only when there is something to type into.
  if (open && !chatInput.closest("form").hidden && matchMedia("(pointer: fine)").matches) chatInput.focus();
  else if (!open) chatToggle.focus();
}

chatToggle.addEventListener("click", () => setChatOpen(!chat.open));
// The ⚡ button: a row of big reactions that fly across everyone's screen.
const boomRow = $c(".chat-booms");
for (const e of BOOMS) {
  const b = el("button", null, e);
  b.type = "button";
  b.addEventListener("click", () => sendBig(e));
  boomRow.append(b);
}
$c(".chat-boom").addEventListener("click", () => { boomRow.hidden = !boomRow.hidden; $c(".chat-boom").classList.toggle("is-on", !boomRow.hidden); });
$c(".chat-close").addEventListener("click", () => setChatOpen(false));
chatRoot.addEventListener("keydown", (e) => { if (e.key === "Escape" && chat.open) setChatOpen(false); });

$c(".chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.replace(/\s+/g, " ").trim().slice(0, CHAT_MAX);
  const now = Date.now();
  if (chat.view === "dm") {
    if (!text || now - lastSent < 500) return;
    lastSent = now;
    chatInput.value = "";
    sendDm({ text });
    return;
  }
  if (!text || !sendChat || now - lastSent < 800) return;
  window.DLE_Profile?.count?.("chats", 1);
  lastSent = now;
  const msg = { id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 10)}`, text, name: shownName(), game, ts: window.DLE_CLOCK?.now() ?? now, badges: myBadges(), pid: myPid() };
  sendChat(msg);
  addMessage({ ...msg, mine: true });
  chatInput.value = "";
  renderChat({ scroll: true });
});

// Other pages post in the general chat (a shared crew).
window.addEventListener("dle:say", (e) => {
  const text = String(e.detail?.text ?? "").replace(/\s+/g, " ").trim().slice(0, CHAT_MAX);
  const now = Date.now();
  if (!text || !sendChat || now - lastSent < 800) return;
  lastSent = now;
  const msg = { id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 10)}`, text, name: shownName(), game, ts: window.DLE_CLOCK?.now() ?? now, badges: myBadges(), pid: myPid() };
  sendChat(msg);
  addMessage({ ...msg, mine: true });
  renderChat({ scroll: true });
});

// Achievements and records go to the general chat by themselves (at most one every 5 s, queued).
const featQueue = [];
let featTimer = 0;
window.addEventListener("dle:feat", (e) => {
  const f = cleanFeat(e.detail);
  if (!f || !myPid()) return;
  featQueue.push(f);
  if (!featTimer) flushFeat();
});
function flushFeat() {
  featTimer = 0;
  const f = featQueue.shift();
  if (!f) return;
  if (!sendChat) { featQueue.unshift(f); featTimer = setTimeout(flushFeat, 5000); return; }
  const now = Date.now();
  const msg = { id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 10)}`, text: featText(f), feat: f, name: shownName(), game, ts: window.DLE_CLOCK?.now() ?? now, badges: myBadges(), pid: myPid() };
  sendChat(msg);
  addMessage({ ...msg, mine: true });
  renderChat();
  if (featQueue.length) featTimer = setTimeout(flushFeat, 5000);
}

// The six reactions, in a small bubble above the message.
function reactPicker(anchor, m) {
  document.querySelector(".chat-picker")?.remove();
  const pick = el("div", "chat-picker");
  for (const e of REACTS) {
    const b = el("button", null, e);
    b.type = "button";
    b.addEventListener("click", () => { pick.remove(); toggleReact(m, e); });
    pick.append(b);
  }
  anchor.closest(".chat-msg").append(pick);
  const away = (ev) => { if (!pick.contains(ev.target)) { pick.remove(); document.removeEventListener("pointerdown", away, true); } };
  setTimeout(() => document.addEventListener("pointerdown", away, true));
}
let sendReact = null;
let lastReact = 0;
function toggleReact(m, e) {
  const now = Date.now();
  if (now - lastReact < 250) return;
  lastReact = now;
  const name = shownName();
  const on = !(m.reacts[e] ?? []).some((n) => n.toLowerCase() === name.toLowerCase());
  if (!setReact(m, e, name, on)) return;
  saveChat();
  sendReact?.({ id: m.id, e, on });
  window.DLE_FX?.play(on ? "place" : "whoosh");
  renderChat();
}
function receiveReact(data, peerId) {
  if (!allowed(peerId)) return;
  const name = peers.get(peerId)?.name || cleanName(data?.name);
  const m = chat.messages.find((x) => x.id === String(data?.id ?? ""));
  if (setReact(m, data?.e, name, data?.on === true)) { saveChat(); renderChat(); }
}

// Big reactions: an emoji bursts up from the bottom of every screen, with the sender's name.
let sendBoom = null;
let lastBoom = 0;
function boom(e, name, mine) {
  if (!BOOMS.includes(e)) return;
  const lite = document.documentElement.classList.contains("lite");
  const layer = el("div", "boom");
  const main = el("div", "boom-main");
  main.style.left = `${15 + Math.random() * 70}%`;
  main.append(el("span", "boom-e", e), el("span", "boom-name", mine ? t("you") : name));
  layer.append(main);
  // A spray of small copies rising around it.
  for (let i = 0; i < (lite ? 5 : 14); i++) {
    const s = el("span", "boom-small", e);
    s.style.left = `${Math.random() * 100}%`;
    s.style.setProperty("--d", `${Math.random() * 0.9}s`);
    s.style.setProperty("--s", (0.6 + Math.random() * 0.9).toFixed(2));
    s.style.setProperty("--x", `${(Math.random() - 0.5) * 160}px`);
    layer.append(s);
  }
  document.body.append(layer);
  window.DLE_FX?.play("whoosh");
  setTimeout(() => layer.remove(), 3600);
}
function sendBig(e) {
  const now = Date.now();
  if (now - lastBoom < 1500) return;
  lastBoom = now;
  sendBoom?.({ e });
  boom(e, shownName(), true);
}
function receiveBoom(data, peerId) {
  if (!allowed(peerId)) return;
  boom(data?.e, peers.get(peerId)?.name || "?", false);
}

function receive(data, peerId) {
  if (!allowed(peerId)) return;
  // Use the name their presence announced when we know it.
  const from = peers.get(peerId);
  if (!addMessage({ ...data, name: from?.name || data?.name, badges: from?.badges ?? data?.badges, pid: from ? from.pid : data?.pid, mine: false })) return;
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
  head.append(window.DLE_NAME(m.name, m.pid, "chat-author"), el("time", null, clock(m.ts)));
  card.append(head, el("span", "chat-note-text", m.feat ? `${m.feat.k === "ach" ? "🏆" : "🔥"} ${m.feat.k === "ach" ? t("featAch")(featText(m.feat)) : featText(m.feat)}` : m.text || `🎤 ${t("voiceMsg")}`));
  card.addEventListener("click", () => { if (m.dmWith) openDm(m.dmWith); else { chat.view = "general"; setChatOpen(true); } });
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

// ── Tabs: the general chat, private messages with friends, and voice ──
chat.view = "general";
try { const v = sessionStorage.getItem("dle:chatView"); if (["general", "dms", "voice"].includes(v)) chat.view = v; } catch {}
const dmTotal = () => Object.values(window.DLE_Profile?.dmUnread ?? {}).reduce((a, n) => a + (Number(n) || 0), 0);
function setView(v) {
  chat.view = v;
  if (v === "general") chat.unread = 0;
  try { sessionStorage.setItem("dle:chatView", v === "dm" ? "dms" : v); } catch {}
  renderChat({ scroll: true });
}
function renderTabs() {
  const nav = $c(".chat-tabs");
  nav.textContent = "";
  const vs = window.DLE_Voice?.state?.();
  for (const [id, label, n] of [["general", t("tabGeneral"), chat.view === "general" ? 0 : chat.unread], ["dms", t("tabPrivate"), dmTotal()], ["voice", t("tabVoice"), vs ? vs.people.length : 0]]) {
    const b = el("button", `chat-tab${chat.view === id || (id === "dms" && chat.view === "dm") ? " is-active" : ""}${id === "voice" && vs ? " is-live" : ""}`);
    b.type = "button";
    b.append(el("span", null, label));
    if (n) b.append(el("b", "chat-tab-badge", n > 9 ? "9+" : String(n)));
    b.addEventListener("click", () => setView(id));
    nav.append(b);
  }
}

// A voice message: a small player that loads the audio when played.
function voiceEl(id, dur) {
  const box = el("div", "chat-voice-msg");
  const a = el("audio", "chat-audio");
  a.controls = true;
  a.preload = "none";
  a.src = `${API}?voice=${id}`;
  box.append(el("span", "chat-voice-ico", "🎤"), a);
  if (dur) box.append(el("span", "chat-voice-dur", `${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, "0")}`));
  return box;
}
function chatNote(text) {
  const li = el("li", "chat-empty chat-warn", text);
  chatList.append(li);
  chatList.scrollTop = chatList.scrollHeight;
  setTimeout(() => li.remove(), 5000);
}

// ── Private messages ──
// Kept on the server (the last 100 of each pair of friends); sent straight to the friend too when they're online, so
// it shows at once. A friend who was away finds them (and the unread count) when they come back.
const dmCache = new Map(); // friend id → messages
let sendDmTo = null;
const cleanDm = (m) => {
  if (!m || typeof m !== "object") return null;
  const text = String(m.text ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 300);
  const voice = VOICE_ID.test(m.voice?.id ?? "") ? { id: m.voice.id, dur: Math.min(60, Math.max(1, Math.round(+m.voice.dur || 1))) } : null;
  const mid = String(m.mid ?? "").slice(0, 20);
  if ((!text && !voice) || !mid || !cleanPid(m.from)) return null;
  return { mid, from: m.from, text, voice, at: Math.min(Number(m.at) || realNow(), realNow() + 60000) };
};
function pushDm(friendId, raw) {
  const m = cleanDm(raw);
  if (!m) return false;
  const list = dmCache.get(friendId) ?? [];
  if (list.some((x) => x.mid === m.mid)) return false;
  list.push(m);
  list.sort((a, b) => a.at - b.at);
  dmCache.set(friendId, list.slice(-100));
  return true;
}
function friendById(id) { return window.DLE_Profile?.friends?.find((f) => f.id === id) ?? null; }
function openDm(f) {
  const friend = typeof f === "string" ? friendById(f) : f;
  if (!friend) return;
  chat.dm = { id: friend.id, name: friend.name, avatar: friend.avatar };
  chat.view = "dm";
  try { sessionStorage.setItem("dle:chatView", "dms"); } catch {}
  setChatOpen(true);
  loadDm(friend.id);
}
let dmLoading = null;
async function loadDm(id, quiet = false) {
  if (!window.DLE_Profile?.current || dmLoading === id) return;
  dmLoading = id;
  try {
    const { messages } = await window.DLE_Profile.call("dm-list", { with: id });
    const before = (dmCache.get(id) ?? []).length;
    dmCache.set(id, []);
    for (const m of messages ?? []) pushDm(id, m);
    window.DLE_Profile.clearUnread?.(id);
    if (!quiet || (dmCache.get(id) ?? []).length !== before) renderChat({ scroll: true });
  } catch {}
  dmLoading = null;
}
// While a conversation is open, look for new messages now and then (in case the direct push didn't arrive).
setInterval(() => { if (chat.open && chat.view === "dm" && chat.dm && !document.hidden) loadDm(chat.dm.id, true); }, 8000);
async function sendDm({ text = "", voice = null, dur = 0 }) {
  const f = chat.dm;
  if (!f || !window.DLE_Profile?.current) return false;
  try {
    const { msg } = await window.DLE_Profile.call("dm-send", { to: f.id, text, voice, dur });
    pushDm(f.id, msg);
    window.DLE_Profile?.count?.("chats", 1);
    // Straight to the friend's open pages.
    for (const [peerId, p] of peers) if (p.pid === f.id) sendDmTo?.({ ...msg }, peerId);
    renderChat({ scroll: true });
    return true;
  } catch {
    chatNote(t("dmFail"));
    return false;
  }
}
let friendsReload = null;
function receiveDm(data, peerId) {
  const p = peers.get(peerId);
  if (!p?.pid || !isFriend(p) || !allowed(peerId) || data?.from !== p.pid) return;
  if (!pushDm(p.pid, data)) return;
  const open = chat.open && chat.view === "dm" && chat.dm?.id === p.pid;
  window.DLE_FX?.play("message");
  if (open) { renderChat(); clearTimeout(friendsReload); friendsReload = setTimeout(() => loadDm(p.pid, true), 1500); return; }
  // The unread count comes from the server: ask for it again in a moment.
  clearTimeout(friendsReload);
  friendsReload = setTimeout(() => window.DLE_Profile?.reloadFriends?.(), 1200);
  const m = cleanDm(data);
  notify({ name: p.name, pid: p.pid, game: p.game, ts: m.at, text: m.text, dmWith: p.pid });
  chatToggle.classList.remove("bump");
  void chatToggle.offsetWidth;
  chatToggle.classList.add("bump");
}
function renderDmList() {
  chatList.textContent = "";
  if (!window.DLE_Profile?.current) { chatList.append(el("li", "chat-empty", t("dmNeed"))); return; }
  const friends = window.DLE_Profile.friends ?? [];
  if (!friends.length) { chatList.append(el("li", "chat-empty", t("dmNone"))); return; }
  const here = window.DLE_Presence.online();
  const unread = window.DLE_Profile.dmUnread ?? {};
  const sorted = [...friends].sort((a, b) => (unread[b.id] || 0) - (unread[a.id] || 0) || here.has(b.id) - here.has(a.id) || a.name.localeCompare(b.name));
  for (const f of sorted) {
    const on = here.get(f.id);
    const li = el("li", "chat-friend");
    const b = el("button", `chat-friend-btn${on ? " is-online" : ""}${on?.away ? " is-away" : ""}`);
    b.type = "button";
    const face = el("span", "chat-friend-face");
    if (f.avatar && window.DLE_Profile.avatarImg) { const img = window.DLE_Profile.avatarImg(el("img"), f.avatar); img.alt = ""; face.append(img); }
    face.append(el("i", "chat-friend-dot"));
    const who = el("span", "chat-friend-who");
    who.append(el("b", null, f.name), el("small", null, on ? (on.away ? t("away") : gameName(on.game)) : ""));
    b.append(face, who);
    if (unread[f.id]) b.append(el("span", "chat-tab-badge", String(unread[f.id])));
    b.addEventListener("click", () => openDm(f));
    li.append(b);
    chatList.append(li);
  }
}
const gameName = (id) => (id === "home" ? "Anime -dle" : GAMES.find((g) => g.id === id)?.brand ?? "Crew Roll");
function renderDm(scroll, nearBottom) {
  const f = chat.dm;
  const head = $c(".chat-dmhead");
  head.textContent = "";
  const back = el("button", "chat-dm-back", "‹");
  back.type = "button";
  back.title = back.ariaLabel = t("back");
  back.addEventListener("click", () => setView("dms"));
  const on = window.DLE_Presence.online().get(f.id);
  head.append(back, window.DLE_NAME(f.name, f.id, "chat-dm-name"), el("span", `chat-dm-state${on ? (on.away ? " is-away" : " is-online") : ""}`, on ? (on.away ? t("away") : gameName(on.game)) : ""));
  chatInput.placeholder = t("dmSay")(f.name);
  chatList.textContent = "";
  const list = dmCache.get(f.id) ?? [];
  if (!list.length) chatList.append(el("li", "chat-empty", t("dmEmpty")(f.name)));
  const me = myPid();
  let prev = null;
  for (const m of list) {
    const newDay = !prev || dayKey(prev.at) !== dayKey(m.at);
    if (newDay) chatList.append(el("li", "chat-day", dayLabel(m.at)));
    const mine = m.from === me;
    const grouped = !newDay && prev.from === m.from && m.at - prev.at < 120000;
    const li = el("li", `chat-msg${mine ? " is-mine" : ""}${grouped ? " is-grouped" : ""}`);
    if (!grouped) {
      const meta = el("div", "chat-meta");
      const time = el("time", null, clock(m.at));
      time.title = fullDate(m.at);
      meta.append(window.DLE_NAME(mine ? `${shownName()} (${t("you")})` : f.name, m.from, "chat-author"), time);
      li.append(meta);
    }
    if (m.text) li.append(el("p", "chat-text", m.text));
    if (m.voice) li.append(voiceEl(m.voice.id, m.voice.dur));
    chatList.append(li);
    prev = m;
  }
  if (scroll || nearBottom) chatList.scrollTop = chatList.scrollHeight;
}
window.addEventListener("dle:friends", () => renderChat());

// ── Voice messages: recorded here (30 s at most), stored on the server, played from it ──
let rec = null;
const recTypes = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4", "audio/webm"];
async function startRec() {
  if (rec) return;
  if (!window.DLE_Profile?.current) { chatNote(t("voiceNeed")); return; }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { chatNote(t("voiceUnsupported")); return; }
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
  catch { chatNote(t("micDenied")); return; }
  const type = recTypes.find((x) => MediaRecorder.isTypeSupported?.(x)) || "";
  let mr;
  try { mr = new MediaRecorder(stream, type ? { mimeType: type, audioBitsPerSecond: 32000 } : undefined); }
  catch { stream.getTracks().forEach((tr) => tr.stop()); chatNote(t("voiceUnsupported")); return; }
  rec = { mr, chunks: [], start: Date.now(), stream, type: mr.mimeType || type || "audio/webm", target: chat.view === "dm" ? chat.dm : null };
  mr.ondataavailable = (e) => { if (e.data.size) rec?.chunks.push(e.data); };
  mr.start(250);
  rec.timer = setInterval(() => { renderRec(); if (rec && Date.now() - rec.start >= 30000) stopRec(true); }, 250);
  window.DLE_FX?.play("place");
  renderRec();
}
function stopRec(send) {
  const r = rec;
  if (!r) return;
  rec = null;
  clearInterval(r.timer);
  renderRec();
  r.mr.onstop = () => {
    r.stream.getTracks().forEach((tr) => tr.stop());
    if (!send) return;
    const dur = Math.max(1, Math.round((Date.now() - r.start) / 1000));
    const blob = new Blob(r.chunks, { type: r.type });
    if (blob.size < 600) return;
    sendVoice(blob, dur, r.target);
  };
  try { r.mr.stop(); } catch {}
}
function renderRec() {
  const box = $c(".chat-rec");
  box.hidden = !rec;
  $c(".chat-form").classList.toggle("is-recording", !!rec);
  if (!rec) return;
  const s = Math.floor((Date.now() - rec.start) / 1000);
  $c(".chat-rec-time").textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} / 0:30`;
}
async function sendVoice(blob, dur, target) {
  try {
    const data = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1] || ""); fr.onerror = rej; fr.readAsDataURL(blob); });
    const { id } = await window.DLE_Profile.call("voice-up", { mime: blob.type || "audio/webm", data });
    window.DLE_Profile?.count?.("voiceMsgs", 1);
    if (target) {
      const keep = chat.dm;
      chat.dm = target;
      await sendDm({ voice: id, dur });
      chat.dm = keep;
      return;
    }
    if (!sendChat) throw new Error("offline");
    const now = Date.now();
    const msg = { id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 10)}`, text: "", voice: id, dur, name: shownName(), game, ts: window.DLE_CLOCK?.now() ?? now, badges: myBadges(), pid: myPid() };
    sendChat(msg);
    addMessage({ ...msg, mine: true });
    renderChat({ scroll: true });
  } catch {
    chatNote(t("voiceFail"));
  }
}
$c(".chat-mic").addEventListener("click", startRec);
$c(".chat-rec-cancel").addEventListener("click", () => stopRec(false));
$c(".chat-rec-send").addEventListener("click", () => stopRec(true));

// ── Live voice (shared/voice.js, loaded the first time) ──
let voiceLoad = null;
function loadVoice() {
  if (window.DLE_Voice) return Promise.resolve();
  return (voiceLoad ??= new Promise((res, rej) => {
    const sc = document.createElement("script");
    sc.src = `${root}shared/voice.js`;
    sc.onload = () => res();
    sc.onerror = rej;
    document.head.append(sc);
  }));
}
let voiceBusy = false;
async function joinVoice(id, label) {
  if (voiceBusy) return;
  voiceBusy = true;
  renderChat();
  try { await loadVoice(); await window.DLE_Voice.join(id, label); }
  catch (e) { chatNote(e?.code === "mic" ? t("micDenied") : t("offline")); }
  voiceBusy = false;
  renderChat();
}
function renderVoice() {
  const box = $c(".chat-voice");
  box.textContent = "";
  const vs = window.DLE_Voice?.state?.();
  box.append(el("p", "chat-voice-help", t("voiceHelp")));
  if (!vs) {
    const opts = [["general", t("voiceGeneral")]];
    const r = window.DLE_IN_ROOM ?? window.DLE_MY_ROOM;
    if (r?.code) opts.unshift([`room-${r.channel}-${r.code}`, t("voiceRoom")(r.code)]);
    for (const [id, label] of opts) {
      const b = el("button", "btn-primary chat-voice-join", voiceBusy ? t("voiceLoading") : `${t("voiceJoin")} · ${label}`);
      b.type = "button";
      b.disabled = voiceBusy;
      b.addEventListener("click", () => joinVoice(id, label));
      box.append(b);
    }
    return;
  }
  box.append(el("h3", "chat-voice-title", vs.label));
  if (vs.blocked) box.append(el("p", "chat-warn", t("voiceTap")));
  const ul = el("ul", "chat-voice-people");
  for (const p of vs.people) {
    const li = el("li", `chat-voice-person${p.speaking ? " is-speaking" : ""}${p.muted ? " is-muted" : ""}`);
    li.append(el("span", "chat-voice-ring", p.muted ? "🔇" : "🎙"), window.DLE_NAME(p.me ? `${p.name} (${t("you")})` : p.name, p.pid, "chat-voice-name"));
    ul.append(li);
  }
  box.append(ul);
  if (vs.people.length < 2) box.append(el("p", "muted", t("voiceAlone")));
  const row = el("div", "chat-voice-actions");
  const mute = el("button", `btn-ghost${vs.muted ? " is-on" : ""}`, vs.muted ? t("unmute") : t("mute"));
  mute.type = "button";
  mute.addEventListener("click", () => window.DLE_Voice.toggleMute());
  const leave = el("button", "btn-primary chat-voice-leave", t("voiceLeave"));
  leave.type = "button";
  leave.addEventListener("click", () => window.DLE_Voice.leave());
  row.append(mute, leave);
  box.append(row);
}
// In voice with the chat closed: a small pill above the chat button (who's talking, mute, back to the channel).
function renderVoicePill() {
  const pill = $c(".voice-pill");
  const vs = window.DLE_Voice?.state?.();
  pill.hidden = !vs || (chat.open && chat.view === "voice");
  if (!vs) return;
  pill.classList.toggle("is-speaking", vs.people.some((p) => p.speaking));
  pill.classList.toggle("is-muted", vs.muted);
  pill.textContent = `${vs.muted ? "🔇" : "🎙"} ${vs.people.length}`;
  pill.title = vs.label;
}
$c(".voice-pill").addEventListener("click", () => { chat.view = "voice"; setChatOpen(true); });
let voiceFrame = 0;
window.addEventListener("dle:voice", () => { if (!voiceFrame) voiceFrame = requestAnimationFrame(() => { voiceFrame = 0; renderChat(); }); });
// Joined on the previous page of this tab: join again.
try { if (sessionStorage.getItem("dle:voice")) loadVoice().catch(() => {}); } catch {}

// ── Connection test (the button in the online bar) ──
let connDialog = null;
function openConn() {
  if (!connDialog) {
    connDialog = el("dialog", "modal conn-modal");
    connDialog.addEventListener("click", (e) => { if (e.target === connDialog) connDialog.close(); });
    document.body.append(connDialog);
  }
  if (!connDialog.open) connDialog.showModal();
  runConn();
}
async function runConn() {
  const inner = el("div", "modal-inner conn-inner");
  const close = el("button", "modal-close", "✕");
  close.type = "button";
  close.addEventListener("click", () => connDialog.close());
  const verdict = el("p", "conn-verdict", t("connWait"));
  const list = el("ol", "conn-list");
  const report = [`${t("connTitle")} · ${new Date().toLocaleString()}`, navigator.userAgent];
  const line = (label) => {
    const li = el("li", "is-wait");
    const v = el("b", "conn-v", "…");
    const note = el("small");
    const txt = el("span");
    txt.append(el("span", null, label), note);
    li.append(el("i", "conn-dot"), txt, v);
    list.append(li);
    return (state, value, extra = "") => { li.className = `is-${state}`; v.textContent = value; note.textContent = extra; report.push(`${state === "ok" ? "OK" : state === "warn" ? "~~" : "XX"} ${label}: ${value}${extra ? ` (${extra})` : ""}`); return state; };
  };
  const actions = el("div", "conn-actions");
  const again = el("button", "btn-ghost", t("connRun"));
  again.type = "button";
  again.addEventListener("click", runConn);
  const fix = el("button", "btn-primary", t("connFix"));
  fix.type = "button";
  fix.addEventListener("click", () => { fix.disabled = true; window.DLE_Link?.wake?.(); setTimeout(runConn, 5000); });
  const copy = el("button", "btn-ghost", t("connCopy"));
  copy.type = "button";
  copy.addEventListener("click", async () => { try { await navigator.clipboard.writeText(report.join("\n")); copy.textContent = t("connCopied"); } catch {} });
  const full = el("a", "btn-ghost", t("connFull"));
  full.href = `${root}diag/`;
  actions.append(fix, again, copy, full);
  inner.append(close, el("h2", null, t("connTitle")), verdict, list, actions);
  connDialog.replaceChildren(inner);

  const states = [];
  states.push(line(t("connNet"))(navigator.onLine ? "ok" : "bad", navigator.onLine ? "OK" : t("offline")));
  const n = window.DLE_Link?.relays?.() ?? 0;
  const total = (window.DLE_RELAYS || []).length;
  states.push(line(t("connRelays"))(n >= 2 ? "ok" : n ? "warn" : "bad", `${n} / ${total}`));
  const players = line(t("connPlayers"));
  states.push(players(status === "live" && n ? "ok" : status === "connecting" ? "warn" : "bad", status === "live" ? String(people().length) : status === "connecting" ? t("connecting") : t("offline")));
  const server = line(t("connServer"));
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    const t0 = performance.now();
    await fetch(`${API}?id=ping`, { cache: "no-store", signal: ctl.signal });
    clearTimeout(timer);
    const ms = Math.round(performance.now() - t0);
    states.push(server(ms < 1500 ? "ok" : "warn", `${ms} ms`));
  } catch { states.push(server("bad", "—")); }
  const rtc = line(t("connRtc"));
  if (!window.RTCPeerConnection) states.push(rtc("warn", "—"));
  else {
    try {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pc.createDataChannel("t");
      const types = new Set();
      pc.onicecandidate = (e) => { if (e.candidate) types.add(e.candidate.type); };
      await pc.setLocalDescription(await pc.createOffer());
      await new Promise((r) => setTimeout(r, 2500));
      pc.close();
      states.push(rtc(types.has("srflx") ? "ok" : "warn", types.has("srflx") ? "OK" : [...types].join(", ") || "—"));
    } catch { states.push(rtc("warn", "—")); }
  }
  const bad = states.includes("bad");
  verdict.textContent = bad ? t("connBad") : t("connOk");
  verdict.className = `conn-verdict ${bad ? "is-bad" : "is-ok"}`;
}

window.DLE_Chat = { openDm, open: () => setChatOpen(true) };

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
