// Live voice chat: a voice channel (the general one, or a game room's) where everyone hears everyone.
// Audio goes straight from player to player (WebRTC through Trystero, with the TURN relays when a direct link fails):
// no server ever carries it. Loaded by presence.js the first time a player joins a voice channel.
//
// DLE_Voice.join(id, label) · leave() · toggleMute() · state() → { id, label, muted, people: [{ id, name, pid, speaking, muted, me }] }
// "dle:voice" fires on every change. A channel joined in this tab is joined again on the next page (same tab).
(() => {
  "use strict";
  if (window.DLE_Voice) return;
  const TRYSTERO = "https://cdn.jsdelivr.net/npm/trystero@0.25.4/+esm";
  const APP_ID = "bleachdle.rayank21.v1";
  const KEEP = "dle:voice";

  let cur = null; // { id, label, room, stream, muted, peers: Map(peerId → { name, pid, muted, audio, level }), ctx, meters }
  const changed = () => window.dispatchEvent(new Event("dle:voice"));
  const myName = () => { try { return localStorage.getItem("dle:name") || "Player"; } catch { return "Player"; } };
  const myPid = () => window.DLE_Profile?.current?.id ?? null;
  const clean = (s) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 20) || "Player";

  // Who is speaking: the loudness of each stream, read a few times a second.
  function meter(stream, onLevel) {
    if (!cur.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return () => {};
      cur.ctx = new AC();
    }
    try {
      const src = cur.ctx.createMediaStreamSource(stream);
      const an = cur.ctx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const buf = new Uint8Array(an.fftSize);
      const timer = setInterval(() => {
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += (v - 128) ** 2;
        onLevel(Math.sqrt(sum / buf.length));
      }, 180);
      return () => { clearInterval(timer); try { src.disconnect(); } catch {} };
    } catch { return () => {}; }
  }

  async function join(id, label) {
    if (cur?.id === id) return true;
    if (cur) await leave();
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch (e) {
      changed();
      throw Object.assign(new Error("mic"), { code: "mic" });
    }
    const trystero = await import(TRYSTERO);
    const turn = (await window.DLE_TURN?.()) ?? [];
    const room = trystero.joinRoom({ appId: APP_ID, relayConfig: { urls: window.DLE_RELAYS }, turnConfig: turn }, `voice-${id}`);
    cur = { id, label, room, stream, muted: false, speaking: false, peers: new Map(), ctx: null, stops: [] };
    try { sessionStorage.setItem(KEEP, JSON.stringify({ id, label })); } catch {}
    const who = room.makeAction("who");
    const sendWho = (target) => who.send({ name: myName(), pid: myPid(), muted: cur?.muted ?? false }, target ? { target } : undefined);
    cur.sendWho = sendWho;
    who.onMessage = (d, { peerId }) => {
      if (!cur || cur.room !== room) return;
      const p = cur.peers.get(peerId) ?? {};
      cur.peers.set(peerId, { ...p, name: clean(d?.name), pid: /^[a-z0-9]{10,20}$/.test(d?.pid ?? "") ? d.pid : null, muted: d?.muted === true });
      changed();
    };
    room.addStream(stream);
    room.onPeerJoin = (peerId) => {
      if (!cur || cur.room !== room) return;
      room.addStream(stream, peerId);
      sendWho(peerId);
      if (!cur.peers.has(peerId)) cur.peers.set(peerId, { name: "…", pid: null, muted: false });
      window.DLE_FX?.play("place");
      changed();
    };
    room.onPeerLeave = (peerId) => {
      if (!cur || cur.room !== room) return;
      const p = cur.peers.get(peerId);
      p?.audio?.remove();
      p?.stop?.();
      cur.peers.delete(peerId);
      window.DLE_FX?.play("whoosh");
      changed();
    };
    room.onPeerStream = (s, peerId) => {
      if (!cur || cur.room !== room) return;
      const p = cur.peers.get(peerId) ?? { name: "…", pid: null, muted: false };
      p.audio?.remove();
      p.stop?.();
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.setAttribute("playsinline", "");
      audio.srcObject = s;
      audio.hidden = true;
      document.body.append(audio);
      audio.play().catch(() => { cur.blocked = true; changed(); });
      p.audio = audio;
      p.stop = meter(s, (lv) => { const on = lv > 6; if (on !== p.speaking) { p.speaking = on; changed(); } });
      cur.peers.set(peerId, p);
      changed();
    };
    cur.stops.push(meter(stream, (lv) => { const on = !cur.muted && lv > 6; if (on !== cur.speaking) { cur.speaking = on; changed(); } }));
    sendWho();
    window.DLE_Profile?.count?.("voice", 1);
    window.DLE_FX?.play("win");
    changed();
    return true;
  }

  async function leave() {
    const c = cur;
    if (!c) return;
    cur = null;
    try { sessionStorage.removeItem(KEEP); } catch {}
    for (const p of c.peers.values()) { p.audio?.remove(); p.stop?.(); }
    c.stops.forEach((f) => f());
    c.stream.getTracks().forEach((tr) => tr.stop());
    try { c.ctx?.close(); } catch {}
    try { await c.room.leave(); } catch {}
    changed();
  }

  function toggleMute() {
    if (!cur) return;
    cur.muted = !cur.muted;
    for (const tr of cur.stream.getAudioTracks()) tr.enabled = !cur.muted;
    if (cur.muted) cur.speaking = false;
    cur.sendWho?.();
    changed();
  }

  // Audio the browser refused to start on its own (no click yet on this page): a tap anywhere starts it.
  function unblock() {
    if (!cur?.blocked) return;
    cur.blocked = false;
    for (const p of cur.peers.values()) p.audio?.play().catch(() => {});
    try { cur.ctx?.resume(); } catch {}
    changed();
  }
  document.addEventListener("pointerdown", unblock, true);

  function state() {
    if (!cur) return null;
    const people = [{ id: "me", name: myName(), pid: myPid(), speaking: cur.speaking, muted: cur.muted, me: true }];
    for (const [id, p] of cur.peers) people.push({ id, name: p.name, pid: p.pid, speaking: !!p.speaking, muted: !!p.muted, me: false });
    return { id: cur.id, label: cur.label, muted: cur.muted, blocked: !!cur.blocked, people };
  }

  window.DLE_Voice = { join, leave, toggleMute, state };
  window.addEventListener("pagehide", () => { cur?.room.leave().catch?.(() => {}); });

  // Rejoin the channel of the previous page (the microphone permission is already granted).
  try {
    const kept = JSON.parse(sessionStorage.getItem(KEEP) || "null");
    if (kept?.id) join(kept.id, kept.label).catch(() => { try { sessionStorage.removeItem(KEEP); } catch {} });
  } catch {}
  changed();
})();
