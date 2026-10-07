// Online links with a fallback.
// Players normally talk over direct WebRTC links (Trystero). Those can fail: two devices behind the same box that
// can't loop a connection back to itself, strict school or work networks… Then nothing got through and the players
// never saw each other. Here every channel also listens on the Nostr relays (the same ones used to find players):
// a player heard there but not linked directly after a few seconds is "joined" anyway, and the messages for them
// travel through the relays (slower, but it works). When a direct link comes up, it takes over silently.
//
// DLE_Link.join(trystero, config, name) returns an object shaped like a Trystero room:
// makeAction(name) → { send(data, { target }), onMessage }, onPeerJoin, onPeerLeave, leave().
// Messages are encrypted with a key derived from the channel, so they aren't readable as plain text on public
// relays (anyone with this page's code could still read them: this is not a secret, only not public text).
(() => {
  const NOBLE = "https://cdn.jsdelivr.net/npm/@noble/secp256k1@3.1.0/+esm";
  const KIND = 23517; // ephemeral events: relays pass them on without keeping them
  const BEAT = 15000; // "I'm here" on every channel
  const LOST = 45000; // a relay-only player silent this long has left
  const GRACE = 6000; // time given to the direct link before falling back to the relays

  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const sha256 = async (s) => crypto.subtle.digest("SHA-256", typeof s === "string" ? enc.encode(s) : s);
  const toB64 = (buf) => { let s = ""; for (const b of new Uint8Array(buf)) s += String.fromCharCode(b); return btoa(s); };
  const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  // ── One set of relay sockets per page, shared by every channel ──
  let keys = null; // { secretKey, pubkey, schnorr }
  const sockets = new Map(); // url → { ws, retry }
  const topics = new Map(); // topic → handler(content)
  const seen = new Set();

  async function ensureKeys() {
    if (keys) return keys;
    const { schnorr } = await import(NOBLE);
    const { secretKey, publicKey } = schnorr.keygen();
    keys = { secretKey, pubkey: hex(publicKey), schnorr };
    return keys;
  }

  const subId = (topic) => `dle${topic.slice(0, 20)}`;
  const req = (topic) => JSON.stringify(["REQ", subId(topic), { kinds: [KIND], "#x": [topic], since: Math.floor(Date.now() / 1000) - 10 }]);

  function openSocket(url) {
    const entry = sockets.get(url) ?? { ws: null, retry: 0 };
    sockets.set(url, entry);
    let ws;
    try { ws = new WebSocket(url); } catch { return; }
    entry.ws = ws;
    ws.onopen = () => {
      entry.retry = 0;
      for (const topic of topics.keys()) ws.send(req(topic));
    };
    ws.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      if (msg[0] !== "EVENT" || !msg[2]) return;
      const ev = msg[2];
      if (seen.has(ev.id) || ev.kind !== KIND) return;
      seen.add(ev.id);
      if (seen.size > 2000) seen.clear();
      const topic = ev.tags?.find((t) => t[0] === "x")?.[1];
      topics.get(topic)?.(ev.content);
    };
    ws.onclose = () => {
      if (entry.ws !== ws) return;
      entry.ws = null;
      if (!topics.size) return;
      setTimeout(() => openSocket(url), Math.min(30000, 2000 * 2 ** entry.retry++));
    };
  }

  function listen(topic, handler) {
    topics.set(topic, handler);
    for (const url of window.DLE_RELAYS || []) {
      const entry = sockets.get(url);
      if (!entry) openSocket(url);
      else if (entry.ws?.readyState === 1) entry.ws.send(req(topic));
    }
  }

  function unlisten(topic) {
    topics.delete(topic);
    for (const { ws } of sockets.values()) if (ws?.readyState === 1) ws.send(JSON.stringify(["CLOSE", subId(topic)]));
  }

  async function publish(topic, content) {
    const { secretKey, pubkey, schnorr } = await ensureKeys();
    const ev = { pubkey, created_at: Math.floor(Date.now() / 1000), kind: KIND, tags: [["x", topic]], content };
    const id = await sha256(JSON.stringify([0, ev.pubkey, ev.created_at, ev.kind, ev.tags, ev.content]));
    const full = JSON.stringify(["EVENT", { ...ev, id: hex(id), sig: hex(await schnorr.signAsync(new Uint8Array(id), secretKey)) }]);
    seen.add(hex(id));
    for (const { ws } of sockets.values()) if (ws?.readyState === 1) ws.send(full);
  }

  // ── A channel: Trystero's room plus the relay fallback ──
  async function join(trystero, config, name) {
    const self = trystero.selfId;
    const rtcRoom = trystero.joinRoom(config, name);
    const topic = hex(await sha256(`dle-link:${config.appId}:${name}`));
    const aes = await crypto.subtle.importKey("raw", await sha256(`dle-key:${config.appId}:${name}`), "AES-GCM", false, ["encrypt", "decrypt"]);
    await ensureKeys().catch(() => {});

    const rtc = new Set(); // linked directly
    const relay = new Set(); // reached through the relays only
    const lastSeen = new Map(); // peerId → time heard on the relays
    const waiting = new Map(); // peerId → timer before falling back
    const actions = new Map(); // name → { rtc action, onMessage }
    let onJoin = () => {};
    let onLeave = () => {};
    let closed = false;

    async function post(body) {
      if (closed) return;
      try {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aes, enc.encode(JSON.stringify(body)));
        const out = new Uint8Array(12 + data.byteLength);
        out.set(iv);
        out.set(new Uint8Array(data), 12);
        await publish(topic, toB64(out));
      } catch (e) {
        console.warn("Relay message not sent:", e);
      }
    }

    let beatSoon = null;
    const beat = (hi = false) => post({ f: self, a: hi ? "~hi" : "~beat" });
    const beatLater = () => { if (!beatSoon) beatSoon = setTimeout(() => { beatSoon = null; beat(); }, 500 + Math.random() * 1500); };

    function heard(id) {
      const fresh = !lastSeen.has(id);
      lastSeen.set(id, Date.now());
      if (rtc.has(id) || relay.has(id) || waiting.has(id)) return fresh;
      waiting.set(id, setTimeout(() => {
        waiting.delete(id);
        if (closed || rtc.has(id) || relay.has(id)) return;
        relay.add(id);
        onJoin(id);
      }, GRACE));
      return fresh;
    }

    async function receive(content) {
      let body;
      try {
        const raw = fromB64(content);
        const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: raw.slice(0, 12) }, aes, raw.slice(12));
        body = JSON.parse(dec.decode(plain));
      } catch { return; }
      const from = typeof body?.f === "string" ? body.f.slice(0, 40) : null;
      if (!from || from === self || closed) return;
      if (body.a === "~bye") {
        lastSeen.delete(from);
        clearTimeout(waiting.get(from));
        waiting.delete(from);
        if (relay.delete(from)) onLeave(from);
        return;
      }
      const fresh = heard(from);
      // Someone new (or back): tell them I'm here without waiting for my next beat.
      if (body.a === "~hi" || fresh) beatLater();
      if (body.a === "~beat" || body.a === "~hi") return;
      if (Array.isArray(body.t) && !body.t.includes(self)) return;
      actions.get(body.a)?.onMessage?.(body.d, { peerId: from });
    }

    listen(topic, receive);
    beat(true);
    const beats = setInterval(() => beat(), BEAT);
    const sweep = setInterval(() => {
      const now = Date.now();
      for (const id of [...relay]) {
        if (now - (lastSeen.get(id) ?? 0) > LOST) { relay.delete(id); lastSeen.delete(id); onLeave(id); }
      }
    }, 5000);

    rtcRoom.onPeerJoin = (id) => {
      rtc.add(id);
      clearTimeout(waiting.get(id));
      waiting.delete(id);
      // Already playing through the relays: the direct link just takes over.
      if (relay.delete(id)) return;
      onJoin(id);
    };
    rtcRoom.onPeerLeave = (id) => {
      rtc.delete(id);
      // Still heard on the relays: carry on that way instead of losing them.
      if (Date.now() - (lastSeen.get(id) ?? 0) < LOST) { relay.add(id); return; }
      onLeave(id);
    };

    return {
      makeAction(name) {
        const direct = rtcRoom.makeAction(name);
        const entry = { onMessage: null };
        actions.set(name, entry);
        direct.onMessage = (data, meta) => entry.onMessage?.(data, meta);
        return {
          send(data, opts) {
            const target = opts?.target;
            const list = target == null ? null : Array.isArray(target) ? target : [target];
            if (!list) {
              direct.send(data);
              if (relay.size) post({ f: self, a: name, d: data, t: [...relay] });
              return;
            }
            const viaRtc = list.filter((id) => rtc.has(id));
            const viaRelay = list.filter((id) => !rtc.has(id) && (relay.has(id) || lastSeen.has(id)));
            if (viaRtc.length) direct.send(data, { target: viaRtc.length === 1 ? viaRtc[0] : viaRtc });
            if (viaRelay.length) post({ f: self, a: name, d: data, t: viaRelay });
          },
          set onMessage(fn) { entry.onMessage = fn; },
          get onMessage() { return entry.onMessage; },
        };
      },
      set onPeerJoin(fn) { onJoin = fn; },
      set onPeerLeave(fn) { onLeave = fn; },
      async leave() {
        await post({ f: self, a: "~bye" });
        closed = true;
        clearInterval(beats);
        clearInterval(sweep);
        clearTimeout(beatSoon);
        for (const t of waiting.values()) clearTimeout(t);
        unlisten(topic);
        return rtcRoom.leave();
      },
    };
  }

  window.DLE_Link = { join };
})();
