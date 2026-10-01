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

    // ── Room helpers ──
    const isHost = () => api.myRoom && api.myRoom.host === api.selfId;
    const sanitizeRoom = (r, from) => {
      if (!r || typeof r !== "object" || typeof r.id !== "string" || r.host !== from) return null;
      const members = Array.isArray(r.members) ? r.members.slice(0, 8).map((m) => ({ id: String(m.id), name: cleanName(m.name) || "Player", arc: Number.isInteger(m.arc) ? m.arc : 0 })) : [];
      return { id: r.id.slice(0, 64), host: from, game: String(r.game), size: clamp(Number(r.size) || 2, 2, 8), members, started: !!r.started };
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
        }
        announce();
        if (room.members.length >= room.size) api.start();
      } else if (type === "roomleave") {
        if (isHost() && d.roomId === api.myRoom.id) {
          api.myRoom.members = api.myRoom.members.filter((m) => m.id !== from);
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
        onMessage(String(d.type), d.data ?? {}, from);
        return;
      }
      onChange();
    }

    async function connect() {
      try {
        const { joinRoom, selfId } = await import(TRYSTERO);
        api.selfId = selfId;
        const room = joinRoom({ appId: APP_ID }, `${channel}-lobby`);
        for (const name of ["hello", "roominfo", "roomjoin", "roomleave", "roomstart", "msg", "invite"]) {
          const action = room.makeAction(name);
          send[name] = (data, target) => action.send(data, target ? { target } : undefined);
          action.onMessage = (data, { peerId }) => handle(name, data, peerId);
        }
        room.onPeerJoin = (peerId) => {
          send.hello(api.profile, peerId);
          if (isHost() && !api.myRoom.started) announce(peerId);
        };
        room.onPeerLeave = (peerId) => {
          api.peers.delete(peerId);
          for (const [id, r] of api.rooms) if (r.host === peerId) api.rooms.delete(id);
          if (api.myRoom) {
            if (api.myRoom.host === peerId) { api.myRoom = null; onClosed("host-left"); }
            else if (api.myRoom.members.some((m) => m.id === peerId)) {
              if (isHost()) { api.myRoom.members = api.myRoom.members.filter((m) => m.id !== peerId); announce(); }
              if (api.myRoom.started) onMessage("left", { id: peerId }, peerId);
            }
          }
          onChange();
        };
        api.status = "live";
        send.hello(api.profile);
      } catch (e) {
        console.warn("Online rooms unavailable:", e);
        api.status = "offline";
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

    api.createRoom = ({ game, size }) => {
      if (api.status !== "live") return;
      api.leave();
      api.myRoom = {
        id: `${api.selfId}-${Date.now().toString(36)}`,
        host: api.selfId,
        game,
        size: clamp(size, 2, 8),
        members: [{ id: api.selfId, name: api.profile.name, arc: api.profile.arc }],
        started: false,
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

  window.DLE_Rooms = { create, cleanName, inviteBanner };
})();
