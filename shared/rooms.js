// Online rooms shared by the multiplayer modes (Crew Roll, guessing race).
// Players connect directly to each other with Trystero (WebRTC, Nostr relays for discovery).
// A room is owned by the player who created it (the host): the host keeps the member list and
// relays it to everyone; it closes when the host leaves. Everything received is untrusted input.
(() => {
  const TRYSTERO = "https://cdn.jsdelivr.net/npm/trystero@0.25.4/+esm";
  const APP_ID = "bleachdle.rayank21.v1";
  const MAX_NAME = 20;
  const CHAT_MAX = 200;
  const CHAT_T = {
    en: { title: "Room chat", say: "Say something to the room…", send: "Send", empty: "Only the players of this room see these messages." },
    fr: { title: "Chat de la salle", say: "Écris à la salle…", send: "Envoyer", empty: "Seuls les joueurs de cette salle voient ces messages." },
  };
  const TEAM_T = {
    en: { mode: "Team vs team", on: "On", off: "Off", names: ["Red team", "Blue team"], swap: "Switch", hostOnly: "The host turns teams on or off.", empty: "Nobody yet" },
    fr: { mode: "Équipe contre équipe", on: "Oui", off: "Non", names: ["Équipe rouge", "Équipe bleue"], swap: "Changer", hostOnly: "L'hôte active ou non les équipes.", empty: "Personne" },
  };
  const teamLang = () => TEAM_T[window.DLE_LANG?.get() === "fr" ? "fr" : "en"];
  // Room options set by the host: the game variant played and the teams (0 = red, 1 = blue).
  const PLAYS = ["classic", "blur", "desc"];
  function cleanMeta(m, members) {
    const ids = new Set(members.map((x) => x.id));
    const team = {};
    for (const [id, v] of Object.entries(m?.team ?? {})) if (ids.has(id) && (v === 0 || v === 1)) team[id] = v;
    return { play: PLAYS.includes(m?.play) ? m.play : "classic", teams: m?.teams === true, team };
  }

  // Room codes: 5 characters, no 0/O or 1/I to mix up.
  const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const cleanCode = (s) => String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const newCode = () => Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
  const cleanName = (s) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME);
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  // startData(room) gives the shared data of a match (e.g. the arc and the character to find);
  // it is used both by the host's Start button and by the automatic start when the room is full.
  function create({ channel, startData = () => ({}), onChange = () => {}, onStart = () => {}, onMessage = () => {}, onClosed = () => {}, onInvite = () => {} }) {
    const api = {
      status: "connecting", // connecting | live | offline
      selfId: null,
      profile: { name: "", game: null, arc: 0 },
      peers: new Map(), // peerId → { id, name, game, arc }
      rooms: new Map(), // roomId → room (as last announced by its host)
      myRoom: null,
    };
    const send = {};
    let started = false;
    // A peer-to-peer link often drops for a few seconds (phone in the background, network hiccup) and comes back on
    // its own. A player is only treated as gone after this grace period, unless they said goodbye themselves.
    const GRACE = 30000;
    const gone = new Map(); // peerId → timer
    let tries = 0;

    // The open room I'm in is announced to my friends by the online bar (presence.js), so they can join it.
    const pageOnChange = onChange;
    let published = "null";
    onChange = () => {
      const r = api.myRoom;
      const mine = r && !r.started && r.members.length < r.size ? { code: r.code, channel, game: r.game } : null;
      if (JSON.stringify(mine) !== published) {
        published = JSON.stringify(mine);
        window.DLE_MY_ROOM = mine;
        window.dispatchEvent(new Event("dle:room"));
      }
      pageOnChange();
    };

    // ── Room helpers ──
    const isHost = () => api.myRoom && api.myRoom.host === api.selfId;
    const sanitizeRoom = (r, from) => {
      if (!r || typeof r !== "object" || typeof r.id !== "string" || r.host !== from) return null;
      const members = Array.isArray(r.members) ? r.members.slice(0, 8).map((m) => ({ id: String(m.id), name: cleanName(m.name) || "Player", arc: Number.isInteger(m.arc) ? m.arc : 0 })) : [];
      return { id: r.id.slice(0, 64), code: cleanCode(r.code), host: from, game: String(r.game), size: clamp(Number(r.size) || 2, 2, 8), members, started: !!r.started, meta: cleanMeta(r.meta, members) };
    };
    const announce = (target) => {
      if (!isHost()) return;
      send.roominfo?.(api.myRoom, target);
      api.rooms.set(api.myRoom.id, api.myRoom);
    };
    const members = () => (api.myRoom ? api.myRoom.members.filter((m) => m.id !== api.selfId).map((m) => m.id) : []);

    function handle(type, d, from) {
      if (!d || typeof d !== "object") return;
      if (type === "hello") {
        api.peers.set(from, { id: from, name: cleanName(d.name) || "Player", game: String(d.game ?? ""), arc: Number.isInteger(d.arc) ? d.arc : 0 });
        // Keep my name up to date in the room I host.
        if (isHost()) {
          const m = api.myRoom.members.find((x) => x.id === from);
          if (m) { m.name = api.peers.get(from).name; m.arc = api.peers.get(from).arc; announce(); }
        }
      } else if (type === "roominfo") {
        if (d.closed) {
          api.rooms.delete(d.id);
          if (api.myRoom?.id === d.id && !isHost()) { api.myRoom = null; onClosed("closed"); }
        } else {
          const room = sanitizeRoom(d, from);
          if (!room) return;
          api.rooms.set(room.id, room);
          if (api.myRoom?.id === room.id) {
            // The host may have removed me (room full or I left).
            api.myRoom = room.members.some((m) => m.id === api.selfId) ? room : null;
          }
        }
      } else if (type === "roomjoin") {
        if (!isHost() || d.roomId !== api.myRoom.id || api.myRoom.started) return;
        const room = api.myRoom;
        if (!room.members.some((m) => m.id === from) && room.members.length < room.size) {
          const p = api.peers.get(from);
          room.members.push({ id: from, name: p?.name ?? "Player", arc: p?.arc ?? 0 });
          placeInTeam(from);
        }
        announce();
        if (room.members.length >= room.size) api.start();
      } else if (type === "roomleave") {
        if (isHost() && d.roomId === api.myRoom.id) {
          api.myRoom.members = api.myRoom.members.filter((m) => m.id !== from);
          delete api.myRoom.meta?.team[from];
          announce();
          if (api.myRoom.started) onMessage("left", { id: from }, from);
        }
      } else if (type === "roomstart") {
        const room = sanitizeRoom(d.room, from);
        if (!room || api.myRoom?.id !== room.id || !room.members.some((m) => m.id === api.selfId)) return;
        api.myRoom = room;
        onStart(room, d.data ?? {});
      } else if (type === "invite") {
        // Any member can invite; the host still decides when the join request arrives.
        const room = sanitizeRoom(d.room, d.room?.host);
        if (!room || room.started || room.members.length >= room.size || !room.members.some((m) => m.id === from)) return;
        if (api.myRoom?.id === room.id) return;
        if (!api.rooms.has(room.id)) api.rooms.set(room.id, room);
        onInvite(room, from);
      } else if (type === "msg") {
        if (!api.myRoom || d.roomId !== api.myRoom.id || !api.myRoom.members.some((m) => m.id === from)) return;
        if (d.type === "chat") { receiveChat(d.data, from); return; }
        // A member asks the host to move them to the other team.
        if (d.type === "team") {
          if (isHost() && !api.myRoom.started && api.myRoom.meta?.teams) { api.myRoom.meta.team[from] = d.data?.team === 1 ? 1 : 0; announce(); onChange(); }
          return;
        }
        onMessage(String(d.type), d.data ?? {}, from);
        return;
      }
      onChange();
    }

    // The lobby channel. A link that drops is not set up again by the network library on its own, so when a player
    // of my room vanishes without saying goodbye, I leave the channel and join it again: a fresh handshake.
    let trystero = null;
    let turn = []; // TURN relays, used when the direct link fails
    let lobby = null;
    let relinking = false;
    function joinLobby() {
      const room = trystero.joinRoom({ appId: APP_ID, relayConfig: { urls: window.DLE_RELAYS }, turnConfig: turn }, `${channel}-lobby`);
      lobby = room;
      for (const name of ["hello", "roominfo", "roomjoin", "roomleave", "roomstart", "msg", "invite"]) {
        const action = room.makeAction(name);
        send[name] = (data, target) => action.send(data, target ? { target } : undefined);
        action.onMessage = (data, { peerId }) => { if (lobby === room) handle(name, data, peerId); };
      }
      room.onPeerJoin = (peerId) => {
        if (lobby !== room) return;
        // Back within the grace period: nothing is lost, the match catches up on what was missed.
        if (gone.has(peerId)) {
          clearTimeout(gone.get(peerId));
          gone.delete(peerId);
          if (api.myRoom?.started && api.myRoom.members.some((m) => m.id === peerId)) onMessage("rejoin", {}, peerId);
        }
        send.hello(api.profile, peerId);
        if (isHost() && !api.myRoom.started) announce(peerId);
      };
      room.onPeerLeave = (peerId) => {
        if (lobby !== room) return;
        clearTimeout(gone.get(peerId));
        gone.set(peerId, setTimeout(() => { gone.delete(peerId); peerGone(peerId); }, GRACE));
        // Someone of my room dropped: reconnect a few times during the grace period to find them again.
        if (api.myRoom?.members.some((m) => m.id === peerId)) {
          for (const ms of [2500, 12000, 22000]) setTimeout(() => { if (gone.has(peerId)) relink(); }, ms);
        }
      };
    }
    async function relink() {
      if (relinking || !lobby) return;
      relinking = true;
      const old = lobby;
      lobby = null;
      try { await old.leave(); } catch {}
      joinLobby();
      relinking = false;
    }
    const peerGone = (peerId) => {
      api.peers.delete(peerId);
      for (const [id, r] of api.rooms) if (r.host === peerId) api.rooms.delete(id);
      if (api.myRoom) {
        if (api.myRoom.host === peerId) { api.myRoom = null; onClosed("host-left"); }
        else if (api.myRoom.members.some((m) => m.id === peerId)) {
          if (isHost()) { api.myRoom.members = api.myRoom.members.filter((m) => m.id !== peerId); delete api.myRoom.meta?.team[peerId]; announce(); }
          if (api.myRoom.started) onMessage("left", { id: peerId }, peerId);
        }
      }
      onChange();
    };

    async function connect() {
      try {
        trystero = await import(TRYSTERO);
        api.selfId = trystero.selfId;
        turn = (await window.DLE_TURN?.()) ?? [];
        joinLobby();
        api.status = "live";
        tries = 0;
        send.hello(api.profile);
        // Closing or leaving the page says goodbye at once, so the others don't wait for the grace period.
        window.addEventListener("pagehide", () => api.leave());
      } catch (e) {
        // The network library could not load (CDN or connection hiccup): try again, forever, a bit slower each time.
        console.warn("Online rooms unavailable, retrying:", e);
        api.status = "offline";
        setTimeout(connect, Math.min(30000, 2000 * 2 ** tries++));
      }
      onChange();
    }

    api.setProfile = (p) => {
      api.profile = { name: cleanName(p.name) || "Player", game: p.game, arc: Number.isInteger(p.arc) ? p.arc : 0 };
      send.hello?.(api.profile);
      if (isHost()) {
        const me = api.myRoom.members.find((m) => m.id === api.selfId);
        if (me) { me.name = api.profile.name; me.arc = api.profile.arc; }
        if (!api.myRoom.started) announce();
      }
    };

    api.createRoom = ({ game, size, play }) => {
      if (api.status !== "live") return;
      api.leave();
      api.myRoom = {
        id: `${api.selfId}-${Date.now().toString(36)}`,
        code: newCode(),
        host: api.selfId,
        game,
        size: clamp(size, 2, 8),
        members: [{ id: api.selfId, name: api.profile.name, arc: api.profile.arc }],
        started: false,
        meta: { play: PLAYS.includes(play) ? play : "classic", teams: false, team: { [api.selfId]: 0 } },
      };
      announce();
      onChange();
    };

    api.join = (roomId) => {
      const room = api.rooms.get(roomId);
      if (!room || room.started || api.status !== "live") return;
      api.leave();
      api.myRoom = { ...room, members: [...room.members] };
      send.roomjoin({ roomId }, room.host);
      onChange();
    };

    api.leave = () => {
      if (!api.myRoom) return;
      const room = api.myRoom;
      if (room.host === api.selfId) {
        send.roominfo?.({ id: room.id, closed: true });
        api.rooms.delete(room.id);
      } else {
        send.roomleave?.({ roomId: room.id }, room.host);
        send.msg?.({ roomId: room.id, type: "left", data: { id: api.selfId } });
      }
      api.myRoom = null;
      onChange();
    };

    // Host only: lock the room and tell every member to start, with shared match data.
    api.start = () => {
      if (!isHost() || api.myRoom.members.length < 2 || api.myRoom.started) return;
      api.myRoom.started = true;
      const payload = startData(api.myRoom);
      for (const id of members()) send.roomstart({ room: api.myRoom, data: payload }, id);
      announce();
      onStart(api.myRoom, payload);
    };

    // Send to every other member of my room.
    api.broadcast = (type, data) => {
      if (!api.myRoom) return;
      for (const id of members()) send.msg({ roomId: api.myRoom.id, type, data }, id);
    };

    // Host only: change the room's game while waiting; members follow it.
    api.setGame = (game) => {
      if (!isHost() || api.myRoom.started || api.myRoom.game === game) return;
      api.myRoom.game = String(game);
      announce();
      onChange();
    };

    // ── Teams ──
    // A new member goes to the team with fewer players.
    function placeInTeam(id) {
      const meta = api.myRoom?.meta;
      if (!meta || meta.team[id] != null) return;
      const n = [0, 1].map((k) => api.myRoom.members.filter((m) => meta.team[m.id] === k).length);
      meta.team[id] = n[1] < n[0] ? 1 : 0;
    }
    // Host only: change the room's options (game variant, teams on or off) while waiting.
    api.setMeta = (patch) => {
      if (!isHost() || api.myRoom.started) return;
      const meta = (api.myRoom.meta ??= { play: "classic", teams: false, team: {} });
      if (PLAYS.includes(patch.play)) meta.play = patch.play;
      if (typeof patch.teams === "boolean") meta.teams = patch.teams;
      for (const m of api.myRoom.members) placeInTeam(m.id);
      announce();
      onChange();
    };
    // Move a player (myself, or anyone when I host) to a team.
    api.setTeam = (id, team) => {
      const room = api.myRoom;
      if (!room || room.started || !room.meta?.teams) return;
      if (isHost()) { room.meta.team[id] = team === 1 ? 1 : 0; announce(); onChange(); }
      else if (id === api.selfId) { room.meta.team[id] = team === 1 ? 1 : 0; send.msg({ roomId: room.id, type: "team", data: { team } }, room.host); onChange(); }
    };
    api.teamOf = (id, room = api.myRoom) => (room?.meta?.teams ? room.meta.team[id] ?? 0 : null);
    api.teamNames = () => teamLang().names;

    // The teams panel of the room card: the host turns teams on or off and can move anyone; a player can switch.
    api.teamsBox = () => {
      const room = api.myRoom;
      const L = teamLang();
      const box = document.createElement("div");
      box.className = "room-teams";
      if (!room) return box;
      const head = document.createElement("div");
      head.className = "room-teams-head";
      const label = document.createElement("span");
      label.className = "room-teams-label";
      label.textContent = L.mode;
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = `team-toggle${room.meta?.teams ? " is-on" : ""}`;
      toggle.setAttribute("role", "switch");
      toggle.setAttribute("aria-checked", !!room.meta?.teams);
      toggle.append(Object.assign(document.createElement("i"), {}), Object.assign(document.createElement("b"), { textContent: room.meta?.teams ? L.on : L.off }));
      toggle.disabled = !isHost();
      toggle.title = isHost() ? L.mode : L.hostOnly;
      toggle.addEventListener("click", () => api.setMeta({ teams: !room.meta?.teams }));
      head.append(label, toggle);
      box.append(head);
      if (!room.meta?.teams) return box;
      const cols = document.createElement("div");
      cols.className = "room-teams-cols";
      for (const k of [0, 1]) {
        const col = document.createElement("div");
        col.className = `team-col team-${k}`;
        const h = document.createElement("b");
        h.className = "team-name";
        h.textContent = L.names[k];
        col.append(h);
        const list = document.createElement("ul");
        const mine = room.members.filter((m) => api.teamOf(m.id) === k);
        if (!mine.length) { const li = document.createElement("li"); li.className = "team-empty"; li.textContent = L.empty; list.append(li); }
        for (const m of mine) {
          const li = document.createElement("li");
          const name = document.createElement("span");
          name.textContent = m.id === api.selfId ? `${m.name} ★` : m.name;
          li.append(name);
          if (isHost() || m.id === api.selfId) {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "team-swap";
            b.textContent = `${L.swap} ⇄`;
            b.addEventListener("click", () => api.setTeam(m.id, k === 0 ? 1 : 0));
            li.append(b);
          }
          list.append(li);
        }
        col.append(list);
        cols.append(col);
      }
      box.append(cols);
      return box;
    };

    // A room that ended can be reopened by its host for another round with the same players.
    api.reopen = () => {
      if (!isHost()) return;
      api.myRoom.started = false;
      announce();
      onChange();
    };

    // Invite a player from the lobby into my room, creating one first if I have none.
    api.invite = (peerId, { game, size }) => {
      if (api.status !== "live" || !api.peers.has(peerId)) return false;
      if (!api.myRoom || api.myRoom.started) api.createRoom({ game, size });
      const room = api.myRoom;
      if (!room || room.members.length >= room.size || room.members.some((m) => m.id === peerId)) return false;
      send.invite({ room }, peerId);
      return true;
    };

    // The open room a player is waiting in, if any (to join them directly).
    api.roomOf = (peerId) => [...api.rooms.values()].find((r) => !r.started && r.members.some((m) => m.id === peerId)) ?? null;

    // ── Room chat: only the players of my room, in the room card and on the end-of-match screen ──
    // The pages re-render often, so the draft and the focus survive a rebuild of the box.
    const chat = { log: [], list: null, draft: "", focused: false, rate: new Map() };
    const chatName = (id) => api.myRoom?.members.find((m) => m.id === id)?.name || api.peers.get(id)?.name || "Player";
    const chatText = (s) => String(s ?? "").replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, CHAT_MAX);

    function chatItem(m) {
      const li = document.createElement("li");
      li.className = `room-chat-msg${m.mine ? " is-mine" : ""}`;
      const who = document.createElement("b");
      who.textContent = m.name;
      const text = document.createElement("span");
      text.textContent = m.text;
      li.append(who, text);
      return li;
    }

    function pushChat(m) {
      chat.log.push(m);
      if (chat.log.length > 80) chat.log.shift();
      const list = chat.list;
      if (!list?.isConnected || list.dataset.room !== m.roomId) return;
      list.querySelector(".room-chat-empty")?.remove();
      list.append(chatItem(m));
      list.scrollTop = list.scrollHeight;
    }

    function receiveChat(d, from) {
      const text = chatText(d?.text);
      if (!text) return;
      const now = Date.now();
      const times = (chat.rate.get(from) || []).filter((x) => now - x < 8000);
      times.push(now);
      chat.rate.set(from, times);
      if (times.length > 6) return;
      pushChat({ roomId: api.myRoom.id, name: chatName(from), text, mine: false });
    }

    api.chatBox = () => {
      const room = api.myRoom;
      if (!room) return document.createDocumentFragment();
      const L = CHAT_T[window.DLE_LANG?.get() === "fr" ? "fr" : "en"];
      const box = document.createElement("div");
      box.className = "room-chat";
      const title = document.createElement("h3");
      title.className = "room-title";
      title.textContent = L.title;
      const list = document.createElement("ol");
      list.className = "room-chat-list";
      list.dataset.room = room.id;
      list.setAttribute("aria-live", "polite");
      const mine = chat.log.filter((m) => m.roomId === room.id);
      if (!mine.length) {
        const empty = document.createElement("li");
        empty.className = "room-chat-empty";
        empty.textContent = L.empty;
        list.append(empty);
      }
      for (const m of mine) list.append(chatItem(m));
      const form = document.createElement("form");
      form.className = "room-chat-form";
      const input = document.createElement("input");
      input.className = "room-chat-input";
      input.maxLength = CHAT_MAX;
      input.autocomplete = "off";
      input.placeholder = L.say;
      input.setAttribute("aria-label", L.title);
      input.value = chat.draft;
      const send = document.createElement("button");
      send.type = "submit";
      send.className = "btn-primary btn-small";
      send.textContent = L.send;
      form.append(input, send);
      input.addEventListener("input", () => { chat.draft = input.value; });
      input.addEventListener("focus", () => { chat.focused = true; });
      // A blur caused by the page rebuilding the box keeps the focus for the new one.
      input.addEventListener("blur", () => setTimeout(() => { if (input.isConnected) chat.focused = false; }));
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = chatText(input.value);
        if (!text || !api.myRoom) return;
        api.broadcast("chat", { text });
        pushChat({ roomId: api.myRoom.id, name: api.profile.name, text, mine: true });
        input.value = chat.draft = "";
      });
      box.append(title, list, form);
      chat.list = list;
      // The caller appends the box right away: restore the focus as soon as it is in the page.
      queueMicrotask(() => {
        list.scrollTop = list.scrollHeight;
        if (chat.focused && input.isConnected) input.focus({ preventScroll: true });
      });
      return box;
    };

    // The room with this code (or this id), as announced by its host.
    api.findRoom = (key) => {
      const code = cleanCode(key);
      return api.rooms.get(key) ?? (code ? [...api.rooms.values()].find((r) => r.code === code) : null) ?? null;
    };

    api.isHost = isHost;
    api.openRooms = () => [...api.rooms.values()].filter((r) => !r.started && r.members.length < r.size && r.id !== api.myRoom?.id);

    if (!started) { started = true; connect(); }
    return api;
  }

  // Banner shown when someone invites me; the newest invitation replaces the previous one.
  function inviteBanner({ text, join, dismiss, onJoin, ms = 20000 }) {
    document.querySelector(".invite-banner")?.remove();
    const box = document.createElement("div");
    box.className = "invite-banner";
    box.setAttribute("role", "alert");
    const msg = document.createElement("span");
    msg.className = "invite-text";
    msg.textContent = text;
    const yes = document.createElement("button");
    yes.type = "button";
    yes.className = "btn-primary btn-small";
    yes.textContent = join;
    const no = document.createElement("button");
    no.type = "button";
    no.className = "btn-ghost btn-small";
    no.textContent = dismiss;
    const close = () => { clearTimeout(timer); box.classList.add("is-out"); setTimeout(() => box.remove(), 250); };
    const timer = setTimeout(close, ms);
    yes.addEventListener("click", () => { close(); onJoin(); });
    no.addEventListener("click", close);
    box.append(msg, yes, no);
    document.body.append(box);
    return close;
  }

  window.DLE_Rooms = { create, cleanName, cleanCode, inviteBanner };
})();
