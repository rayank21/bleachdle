// Crew Roll: pick an anime, roll random characters and place each one in a slot of your crew.
// Each placement scores 1–10; the crew's score is the average of its slots.
// Solo mode, plus an online 1v1: two ready players get the same character each round and race
// for the better crew. Players connect directly (WebRTC via Trystero), like the online bar.
(() => {
  "use strict";

  const GAMES = window.DLE_GAMES;
  const CREW = window.CREW_GAMES;
  const DEFAULT_POWER = window.CREW_DEFAULT_POWER;
  const REROLLS = 3;
  const ROOT = "../";
  const TRYSTERO = "https://cdn.jsdelivr.net/npm/trystero@0.25.4/+esm";
  const APP_ID = "bleachdle.rayank21.v1";

  const T = {
    en: {
      title: "Crew Roll",
      sub: "Roll random characters and build the strongest crew. Every placement counts.",
      solo: "Solo",
      online: "Online",
      pick: "Anime",
      modeLabel: "Mode",
      arcLabel: "Arc",
      allArcs: "All arcs",
      roll: "Roll a character",
      draw: "Draw",
      waitingRoll: "Who joins the crew?",
      captainTag: "Leader",
      tiers: { legend: "Legendary", epic: "Epic", common: "Common" },
      rolling: "Rolling…",
      chooseSlot: "Choose a slot for this character",
      noSlot: "No free slot fits this character",
      reroll: (n) => `Reroll (${n} left)`,
      score: "Score",
      filled: (a, b) => `${a}/${b} slots`,
      power: "Power",
      spoiler: (arc) => `Spoiler-free up to: ${arc}`,
      spoilerAll: "All arcs (set your arc in the guessing game to limit spoilers)",
      resultTitle: "Your crew is complete!",
      best: "Best pick",
      worst: "Weakest pick",
      share: "Copy result",
      copied: "Result copied!",
      again: "New crew",
      empty: "Empty",
      lobbyTitle: "Lobby",
      lobbyHelp: "Create a room for 2 to 8 players, or join an open one. Everyone builds a crew at the same time with their own rolls and 3 rerolls; the best crew wins.",
      yourName: "Your name",
      saveName: "Save",
      nameSaved: "Name saved",
      players: "Players",
      createRoom: "Create a room",
      openRooms: "Open rooms",
      noRooms: "No open room yet: create one and share the page!",
      inLobby: (n) => `In the lobby (${n})`,
      join: "Join",
      roomOf: (n) => `${n}'s room`,
      host: "host",
      freeSeat: "Free seat",
      start: "Start the match",
      leave: "Leave",
      waitHost: "Waiting for the host to start…",
      needTwo: "At least 2 players are needed to start.",
      roomClosed: "The host closed the room.",
      invite: "Invite",
      inviteSent: (n) => `Invitation sent to ${n}`,
      invitedBy: (n, a) => `${n} invites you to play${a ? ` (${a})` : ""}`,
      ignore: "Ignore",
      withCode: "Join with a code",
      codePlaceholder: "Room code",
      joinCode: "Join",
      codeLabel: "Room code",
      copyCode: "Copy",
      codeCopied: "Code copied!",
      codeNotFound: "No open room with this code.",
      searching: "Looking for the room…",
      aloneHere: "Nobody else is on this page yet. Send the link to your friends: they'll show up here with an Invite button.",
      copyLink: "Copy the link",
      linkCopied: "Link copied!",
      copyInvite: "Copy the invite link",
      inviteCopied: "Link copied! Send it to your friends.",
      joiningLink: "Joining the room from your link…",
      linkGone: "This room is full, already playing or closed.",
      pickToJoin: "Pick a name to join the room.",
      hostPicks: "You're the host: change the anime below, everyone follows.",
      hostChooses: "The host picks the anime.",
      connecting: "Connecting to the lobby…",
      offline: "Online play is unavailable right now.",
      you: "you",
      taken: (n) => `${n} already took this character: free roll!`,
      arcUsed: (arc) => `Arc: ${arc} (the lowest in the room, so nobody is spoiled)`,
      lockedNote: (roles) => `Not reached yet at this arc: ${roles}`,
      waitOthers: "Waiting for the other players…",
      skipped: "No free slot fits: skipped",
      finalRanking: "Final ranking",
      youPlace: (n) => (n === 1 ? "You win!" : `You finish #${n}`),
      left: "left",
      tie: "Tie for first!",
      backRoom: "Back to the room",
      vs: "VS",
      pickName: "Pick a name first",
    },
    fr: {
      title: "Roll ton équipage",
      sub: "Tire des personnages au hasard et construis l'équipage le plus fort. Chaque placement compte.",
      solo: "Solo",
      online: "En ligne",
      pick: "Anime",
      modeLabel: "Mode",
      arcLabel: "Arc",
      allArcs: "Tous les arcs",
      roll: "Tirer un personnage",
      draw: "Tirage",
      waitingRoll: "Qui rejoint l'équipage ?",
      captainTag: "Chef",
      tiers: { legend: "Légendaire", epic: "Épique", common: "Commun" },
      rolling: "Tirage…",
      chooseSlot: "Choisis une place pour ce personnage",
      noSlot: "Aucune place libre ne convient à ce personnage",
      reroll: (n) => `Relancer (${n} restant${n > 1 ? "s" : ""})`,
      score: "Score",
      filled: (a, b) => `${a}/${b} places`,
      power: "Puissance",
      spoiler: (arc) => `Sans spoiler jusqu'à : ${arc}`,
      spoilerAll: "Tous les arcs (choisis ton arc dans le jeu de devinette pour limiter les spoilers)",
      resultTitle: "Ton équipage est complet !",
      best: "Meilleur choix",
      worst: "Choix le plus faible",
      share: "Copier le résultat",
      copied: "Résultat copié !",
      again: "Nouvel équipage",
      empty: "Libre",
      lobbyTitle: "Lobby",
      lobbyHelp: "Crée une salle de 2 à 8 joueurs, ou rejoins-en une. Chacun construit son équipage en même temps avec ses propres tirages et 3 relances : le meilleur équipage gagne.",
      yourName: "Ton pseudo",
      saveName: "OK",
      nameSaved: "Pseudo enregistré",
      players: "Joueurs",
      createRoom: "Créer une salle",
      openRooms: "Salles ouvertes",
      noRooms: "Aucune salle ouverte : crée la tienne et partage la page !",
      inLobby: (n) => `Dans le lobby (${n})`,
      join: "Rejoindre",
      roomOf: (n) => `Salle de ${n}`,
      host: "hôte",
      freeSeat: "Place libre",
      start: "Lancer la partie",
      leave: "Quitter",
      waitHost: "En attente du lancement par l'hôte…",
      needTwo: "Il faut au moins 2 joueurs pour lancer.",
      roomClosed: "L'hôte a fermé la salle.",
      invite: "Inviter",
      inviteSent: (n) => `Invitation envoyée à ${n}`,
      invitedBy: (n, a) => `${n} t'invite à jouer${a ? ` (${a})` : ""}`,
      ignore: "Ignorer",
      withCode: "Rejoindre avec un code",
      codePlaceholder: "Code de salle",
      joinCode: "Rejoindre",
      codeLabel: "Code de la salle",
      copyCode: "Copier",
      codeCopied: "Code copié !",
      codeNotFound: "Aucune salle ouverte avec ce code.",
      searching: "Recherche de la salle…",
      aloneHere: "Personne d'autre sur cette page pour l'instant. Envoie le lien à tes potes : ils apparaîtront ici avec un bouton Inviter.",
      copyLink: "Copier le lien",
      linkCopied: "Lien copié !",
      copyInvite: "Copier le lien d'invitation",
      inviteCopied: "Lien copié ! Envoie-le à tes potes.",
      joiningLink: "Connexion à la salle de ton lien…",
      linkGone: "Cette salle est pleine, déjà en partie ou fermée.",
      pickToJoin: "Choisis un pseudo pour rejoindre la salle.",
      hostPicks: "Tu es l'hôte : change d'anime ci-dessous, tout le monde suit.",
      hostChooses: "L'hôte choisit l'anime.",
      connecting: "Connexion au lobby…",
      offline: "Le jeu en ligne est indisponible pour l'instant.",
      you: "toi",
      taken: (n) => `${n} a déjà pris ce perso : relance gratuite !`,
      arcUsed: (arc) => `Arc : ${arc} (le plus bas de la salle, pour ne spoiler personne)`,
      lockedNote: (roles) => `Pas encore atteint à cet arc : ${roles}`,
      waitOthers: "En attente des autres joueurs…",
      skipped: "Aucune place libre ne convient : passé",
      finalRanking: "Classement final",
      youPlace: (n) => (n === 1 ? "Victoire !" : `Tu finis ${n}e`),
      left: "parti",
      tie: "Égalité en tête !",
      backRoom: "Retour à la salle",
      vs: "VS",
      pickName: "Choisis d'abord un pseudo",
    },
  };
  let lang = window.DLE_LANG.get();
  const t = (k) => T[lang][k];

  const $ = (s, root = document) => root.querySelector(s);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ── Data ──
  const loaded = {};
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Could not load ${src}`));
      document.head.append(s);
    });
  }
  // Loaded one game at a time: each file sets the same globals.
  let loadChain = Promise.resolve();
  function loadGame(g) {
    if (!loaded[g.id]) {
      loaded[g.id] = loadChain = loadChain.then(async () => {
        await loadScript(`${ROOT}${g.path}config.js`);
        await loadScript(`${ROOT}${g.path}data/characters.js`);
        return { config: window.DLE_CONFIG, chars: window.DLE_CHARACTERS };
      });
    }
    return loaded[g.id];
  }

  function playerArc(config) {
    try {
      const s = JSON.parse(localStorage.getItem(`${config.storage}:settings`) || "{}");
      if (Number.isInteger(s.arc)) return s.arc;
    } catch {}
    return null;
  }

  // Same spoiler rule as the guessing games: a { arc: value } field takes the latest arc reached.
  function resolve(value, arc) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    const keys = Object.keys(value).map(Number).sort((a, b) => a - b);
    const k = keys.filter((x) => x <= arc).pop() ?? keys[0];
    return value[k];
  }

  const displayName = (config, baseName) => config.names?.[lang]?.[baseName] ?? baseName;

  function makePool(g, data, arc) {
    const crew = CREW[g.id];
    return data.chars
      .filter((c) => c.arc <= arc && c.image)
      .map((c) => {
        const v = { id: c.id, image: `${ROOT}${g.path}${c.image}`, baseName: c.name };
        for (const [k, val] of Object.entries(c)) if (k !== "image") v[k] = resolve(val, arc);
        v.name = displayName(data.config, c.name);
        v.power = crew.power[c.id] ?? DEFAULT_POWER;
        return v;
      });
  }

  // A slot group is cut down to the number of characters that can fill it at this arc.
  function makeSlots(g, pool) {
    const slots = [];
    for (const def of CREW[g.id].slots) {
      const candidates = pool.filter((c) => def.fits(c)).length;
      for (let i = 0; i < def.count; i++) slots.push({ def, char: null, points: 0, locked: i >= candidates });
    }
    return slots;
  }

  const pointsFor = (slot, c) => (slot.def.score ? slot.def.score(c, c.power) : c.power);
  const openSlots = (slots) => slots.filter((s) => !s.char && !s.locked);
  const fitsIn = (slots, c) => openSlots(slots).some((s) => s.def.fits(c));
  const filledOf = (slots) => slots.filter((s) => s.char);
  const average = (slots) => { const f = filledOf(slots); return f.length ? f.reduce((a, s) => a + s.points, 0) / f.length : 0; };
  // In a duel, empty slots count as 0 so skipping a slot is never an advantage.
  const duelScore = (slots) => { const n = slots.filter((s) => !s.locked).length; return n ? filledOf(slots).reduce((a, s) => a + s.points, 0) / n : 0; };
  const rankOf = (avg) => (avg >= 9 ? "S" : avg >= 8 ? "A" : avg >= 6.5 ? "B" : avg >= 5 ? "C" : "D");
  const slotLabel = (slot) => slot.def.label[lang];
  const isCaptain = (slot) => slot.def.role === "captain";

  // Role icons (24×24 line drawings), named by `icon` in roster.js.
  const ICONS = {
    crown: "M3 18h18M4 18 3 7l5 4 4-6 4 6 5-4-1 11",
    swords: "M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 17.5 21 6V3h-3L6.5 14.5M11 19l-6-6M8 16l-4 4M5 21l-2-2",
    sword: "M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2",
    compass: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z",
    chef: "M6 13.9A4 4 0 1 1 8.2 6.3a4 4 0 0 1 7.6 0A4 4 0 1 1 18 13.9V20H6zM6 17h12",
    cross: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
    book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 0 6.5 22H20v-5",
    hammer: "m15 12-8.4 8.4a2.1 2.1 0 1 1-3-3L12 9M17.6 15 22 10.6M20.9 11.7l-1.2-1.2a2 2 0 0 1-.6-1.4V7.9l-2.3-2.3a6 6 0 0 0-4.2-1.8H9.4l.9.8a6.2 6.2 0 0 1 2 4.5V10l2 2h1.2a2 2 0 0 1 1.4.6l1.2 1.2",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    skull: "M9 12h.01M15 12h.01M8 20v2h8v-2M12.5 17l-.5-1-.5 1zM16 20a2 2 0 0 0 1.6-3.2 8 8 0 1 0-11.2 0A2 2 0 0 0 8 20",
    mask: "M3 5c3 1 15 1 18 0v6a9 9 0 0 1-18 0zM7 10.5h3M14 10.5h3M9 16c2 1 4 1 6 0",
    star: "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z",
    person: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
    card: "M3 5h18v14H3zM7 9h4v4H7zM14 10h4M14 14h4M7 16h11",
    bug: "M8 2l1.9 1.9M16 2l-1.9 1.9M9 7.1V6a3 3 0 1 1 6 0v1.1M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6zM12 20v-9M6.5 13H3M21 13h-3.5M6 9.5 3 8M18 9.5 21 8M6 17l-3 2M18 17l3 2",
    spider: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM9.5 11 5 7V3M9 13H3M9.5 15 5 19v2M14.5 11 19 7V3M15 13h6M14.5 15l4.5 4v2",
    bolt: "M13 2 3 14h9l-1 8 10-12h-9z",
    dice: "M4 4h16v16H4zM8.5 8.5h.01M15.5 15.5h.01M12 12h.01M15.5 8.5h.01M8.5 15.5h.01",
    flame: "M12 22c4 0 7-3 7-7 0-5-5-7-5-13-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 9 0 4 3 7 7 7z",
    leaf: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.4 5.2-6.1C9.5 14.4 12 13 13 12",
    cloud: "M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z",
    hat: "M2 18h20M5 18 12 5l7 13",
    eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20",
  };
  function icon(name, cls = "icon") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", cls);
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", ICONS[name] ?? ICONS.star);
    svg.append(path);
    return svg;
  }

  // ── Motion helpers ──
  // The draw is the heart of Crew Roll, so its motion always plays (even with reduced motion on).
  const easeOutCubic = (k) => 1 - Math.pow(1 - k, 3);
  const easeOutQuint = (k) => 1 - Math.pow(1 - k, 5);
  const frame = () => new Promise((r) => requestAnimationFrame(r));
  const sfx = (name, opts) => window.DLE_FX?.play(name, opts);

  function countUp(node, to, decimals = 1, ms = 650) {
    const from = Number(node.dataset.value || 0);
    node.dataset.value = to;
    if (from === to) { node.textContent = to.toFixed(decimals); return; }
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / ms);
      node.textContent = (from + (to - from) * easeOutCubic(k)).toFixed(decimals);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Shards flung out from a point; `gold` for legendary draws.
  function burst(x, y, { count = 40, spread = 220, gold = false } = {}) {
    const layer = el("div", `burst${gold ? " is-gold" : ""}`);
    layer.style.left = `${x}px`;
    layer.style.top = `${y}px`;
    for (let i = 0; i < count; i++) {
      const p = el("i");
      const a = Math.random() * Math.PI * 2;
      const d = spread * (0.4 + Math.random() * 0.6);
      p.style.setProperty("--x", `${Math.cos(a) * d}px`);
      p.style.setProperty("--y", `${Math.sin(a) * d - 60}px`);
      p.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
      p.style.animationDelay = `${Math.random() * 100}ms`;
      if (i % 3 === 0) p.className = "alt";
      layer.append(p);
    }
    document.body.append(layer);
    setTimeout(() => layer.remove(), 1600);
  }

  // A ring that expands from an element (slot landing, reel landing).
  function shockwave(target, cls = "") {
    if (!target) return;
    const r = target.getBoundingClientRect();
    const ring = el("span", `shockwave ${cls}`);
    Object.assign(ring.style, { left: `${r.left + r.width / 2}px`, top: `${r.top + r.height / 2}px`, width: `${Math.max(r.width, r.height)}px`, height: `${Math.max(r.width, r.height)}px` });
    document.body.append(ring);
    setTimeout(() => ring.remove(), 900);
  }

  // A portrait flies from the reel to the chosen slot along an arc, leaving a short trail of ghosts.
  function fly(fromEl, toEl, src) {
    if (!fromEl || !toEl || !fromEl.animate) return Promise.resolve();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const s = b.width / a.width;
    const sy = b.height / a.height;
    const make = (cls) => {
      const img = el("img", cls);
      img.src = src;
      img.alt = "";
      Object.assign(img.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` });
      document.body.append(img);
      return img;
    };
    const path = [
      { transform: "translate(0, 0) scale(1) rotate(0deg)", borderRadius: "18px" },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(${(1 + s) / 2 + 0.12}, ${(1 + sy) / 2 + 0.12}) rotate(-8deg)`, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s}, ${sy}) rotate(0deg)`, borderRadius: "50%" },
    ];
    const ghosts = [1, 2, 3].map((i) => {
      const g = make("flyer is-ghost");
      g.style.opacity = String(0.35 - i * 0.08);
      g.animate(path, { duration: 640, delay: i * 45, easing: "cubic-bezier(.5,0,.2,1)", fill: "both" }).finished.then(() => g.remove(), () => g.remove());
      return g;
    });
    const img = make("flyer");
    sfx("whoosh");
    const anim = img.animate(path, { duration: 640, easing: "cubic-bezier(.5,0,.2,1)", fill: "both" });
    return anim.finished.then(() => { img.remove(); ghosts.forEach((g) => g.remove()); }, () => img.remove());
  }

  // Rarity tier from the character's power.
  const tierOf = (power) => (power >= 9 ? "legend" : power >= 7 ? "epic" : "common");

  // Slot-machine reel: a strip of portraits that winds up, races, ticks past each face and slams
  // onto the picked character with a flash, a shockwave and light rays.
  function makeReel() {
    const wrap = el("div", "reel");
    const stage = el("div", "reel-stage");
    const rays = el("div", "reel-rays");
    const glow = el("div", "reel-glow");
    const win = el("div", "reel-window");
    const strip = el("div", "reel-strip");
    const q = el("span", "reel-q", "?");
    const shine = el("span", "reel-shine");
    const flash = el("span", "reel-flash");
    const lines = el("span", "reel-lines");
    win.append(strip, lines, q, shine, flash);
    stage.append(rays, glow, win);
    const tier = el("span", "reel-tier");
    tier.hidden = true;
    const name = el("p", "reel-name");
    const power = el("div", "power");
    const powerLabel = el("span", "power-label");
    const track = el("span", "power-track");
    const fill = el("span", "power-fill");
    const value = el("b");
    value.dataset.value = 0;
    track.append(fill);
    power.append(powerLabel, track, value);
    power.hidden = true;
    const hint = el("p", "reel-hint");
    wrap.append(el("p", "reel-kicker", t("draw")), stage, tier, name, power, hint);

    // Each portrait is shown whole over a blurred, zoomed copy of itself, so no one is cut off.
    const card = (c) => {
      const item = el("div", "reel-item");
      const bg = el("img", "reel-bg");
      const fg = el("img", "reel-fg");
      bg.src = fg.src = c.image;
      bg.alt = fg.alt = "";
      item.append(bg, fg);
      return item;
    };
    const setName = (text, animate) => {
      name.textContent = "";
      if (!animate) { name.textContent = text; return; }
      [...text].forEach((ch, i) => {
        const s = el("span", "reel-letter", ch === " " ? " " : ch);
        s.style.animationDelay = `${120 + i * 32}ms`;
        name.append(s);
      });
    };
    const clearTier = () => wrap.classList.remove("tier-legend", "tier-epic", "tier-common");

    const reel = {
      el: wrap,
      window: win,
      idle(text = t("waitingRoll")) {
        strip.textContent = "";
        strip.style.transform = "translateY(0)";
        strip.style.filter = "";
        wrap.classList.remove("is-landed", "is-spinning", "is-charging");
        clearTier();
        q.hidden = false;
        tier.hidden = true;
        setName(text, false);
        power.hidden = true;
        hint.textContent = "";
      },
      show(c, animate = false) {
        strip.textContent = "";
        strip.append(card(c));
        strip.style.transform = "translateY(0)";
        strip.style.filter = "";
        q.hidden = true;
        clearTier();
        const tr = tierOf(c.power);
        wrap.classList.add("is-landed", `tier-${tr}`);
        tier.textContent = t("tiers")[tr];
        tier.hidden = false;
        setName(c.name, animate);
        power.hidden = false;
        powerLabel.textContent = t("power");
        fill.style.transition = "none";
        fill.style.width = "0%";
        if (animate) {
          value.dataset.value = 0;
          value.textContent = "0";
          setTimeout(() => { fill.style.transition = ""; fill.style.width = `${c.power * 10}%`; countUp(value, c.power, 0, 700); }, 260);
        } else {
          fill.getBoundingClientRect();
          fill.style.transition = "";
          fill.style.width = `${c.power * 10}%`;
          value.textContent = c.power;
          value.dataset.value = c.power;
        }
      },
      async spin(list, pick) {
        wrap.classList.remove("is-landed");
        clearTier();
        tier.hidden = true;
        power.hidden = true;
        hint.textContent = "";
        setName(t("rolling"), false);

        // Wind-up: the card shrinks and charges before letting go.
        wrap.classList.add("is-charging");
        sfx("charge");
        await new Promise((r) => setTimeout(r, 260));
        wrap.classList.remove("is-charging");
        wrap.classList.add("is-spinning");
        q.hidden = true;
        sfx("whoosh");

        const n = 30;
        strip.textContent = "";
        for (let i = 0; i < n; i++) strip.append(card(list[Math.floor(Math.random() * list.length)]));
        strip.append(card(pick));
        const h = strip.firstElementChild.offsetHeight;
        const total = n * h;
        const ms = 2700;
        const start = performance.now();
        let lastIndex = 0;
        let lastPos = 0;
        let lastTick = 0;
        for (;;) {
          const now = await frame();
          const k = Math.min(1, (now - start) / ms);
          const pos = easeOutQuint(k) * total;
          // Motion blur follows the speed.
          const speed = pos - lastPos;
          lastPos = pos;
          strip.style.transform = `translateY(${-pos}px)`;
          strip.style.filter = speed > 4 ? `blur(${Math.min(7, speed / 9).toFixed(1)}px)` : "";
          // Each face that passes the frame makes it tick.
          const idx = Math.floor((pos + h / 2) / h);
          if (idx !== lastIndex) {
            lastIndex = idx;
            win.classList.remove("tick");
            void win.offsetWidth;
            win.classList.add("tick");
            // Ticks are spaced out at full speed so they rattle instead of buzzing.
            if (now - lastTick > 45) { lastTick = now; sfx("tick", { pitch: 0.8 + k * 0.7 }); }
          }
          if (k >= 1) break;
        }
        strip.style.filter = "";
        wrap.classList.remove("is-spinning");
        reel.show(pick, true);

        // Impact: flash, shockwave, shards; legendary draws shake the panel and burst in gold.
        const tr = tierOf(pick.power);
        sfx("land");
        if (tr === "epic") sfx("epic");
        if (tr === "legend") { sfx("legend"); window.DLE_FX?.flash("rgba(255, 200, 60, 0.3)"); }
        flash.classList.remove("go");
        void flash.offsetWidth;
        flash.classList.add("go");
        shockwave(win, `is-${tr}`);
        const r = win.getBoundingClientRect();
        if (tr !== "common") burst(r.left + r.width / 2, r.top + r.height / 2, { count: tr === "legend" ? 60 : 26, spread: tr === "legend" ? 260 : 170, gold: tr === "legend" });
        const panel = wrap.closest(".roll-panel");
        if (panel && tr === "legend") { panel.classList.remove("shake"); void panel.offsetWidth; panel.classList.add("shake"); }
        await new Promise((r2) => setTimeout(r2, 380));
      },
      hint(text) { hint.textContent = text; },
    };
    return reel;
  }

  // ── Board ──
  function renderBoard(container, slots, { rolled = null, onPlace = null, mini = false, stagger = false } = {}) {
    container.textContent = "";
    container.classList.toggle("is-mini", mini);
    // Two rows: 10 roles make a 5 × 2 grid.
    container.style.setProperty("--cols", Math.max(1, Math.ceil(slots.filter((s) => !s.locked).length / 2)));
    slots.forEach((slot, i) => {
      if (slot.locked) return;
      const card = el("button", "crew-slot");
      card.type = "button";
      card.classList.toggle("is-captain", isCaptain(slot));
      const ic = el("span", "crew-icon");
      ic.append(icon(slot.def.icon));
      card.append(ic);
      if (isCaptain(slot) && !mini) card.append(el("span", "crew-captain-tag", t("captainTag")));
      if (stagger) { card.classList.add("enter"); card.style.animationDelay = `${i * 45}ms`; }
      const canPlace = !!(onPlace && rolled && !slot.char && !slot.locked && slot.def.fits(rolled));
      card.classList.toggle("is-filled", !!slot.char);
      card.classList.toggle("is-target", canPlace);
      if (canPlace) card.style.setProperty("--d", `${i * 50}ms`); // targets light up in a wave
      card.classList.toggle("is-locked", slot.locked);
      card.disabled = !canPlace;
      card.dataset.index = i;

      const face = el("span", "crew-face");
      if (slot.char) {
        const img = el("img");
        img.src = slot.char.image;
        img.alt = "";
        face.append(img);
      } else {
        face.textContent = "?";
      }
      card.append(face);
      card.append(el("span", "crew-name", slot.char ? slot.char.name : t("empty")));
      card.append(el("span", "crew-role", slotLabel(slot)));
      if (slot.char) card.append(el("span", `crew-points p${Math.min(10, Math.round(slot.points))}`, String(slot.points)));
      else if (canPlace) card.append(el("span", "crew-points is-preview", `+${pointsFor(slot, rolled)}`));
      card.setAttribute("aria-label", `${slotLabel(slot)}: ${slot.char ? `${slot.char.name}, ${slot.points}` : canPlace ? t("chooseSlot") : t("empty")}`);
      if (canPlace) card.addEventListener("click", () => onPlace(i));
      container.append(card);
    });
    const hidden = slots.filter((s) => s.locked);
    if (hidden.length && !mini) {
      const roles = [...new Set(hidden.map(slotLabel))].join(", ");
      container.append(el("p", "crew-note", t("lockedNote")(roles)));
    }
  }

  const slotFace = (container, i) => container.querySelector(`[data-index="${i}"] .crew-face`);
  // Landing in a slot: the card pops, a ring spreads from the face, strong picks throw sparks.
  function popSlot(container, i, points = 0) {
    const card = container.querySelector(`[data-index="${i}"]`);
    if (!card) return;
    card.classList.add("pop");
    sfx("place");
    const face = card.querySelector(".crew-face");
    shockwave(face, points >= 8 ? "is-legend" : "is-epic");
    if (points >= 8) {
      const r = face.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, { count: 22, spread: 120, gold: points >= 9 });
    }
  }

  // ── Shared UI ──
  let currentGame = null; // a DLE_GAMES entry
  let mode = "solo";
  let pendingJoin = null;

  function renderPicker() {
    const box = $("#animePicker");
    box.textContent = "";
    // Online, the lobby is the same for every anime: the anime is picked when creating a room.
    const online = mode === "online";
    $("#crewPickWrap").hidden = online;
    $("#crewArcWrap").hidden = online;
    for (const g of GAMES) {
      const b = el("button", `anime-pick${currentGame?.id === g.id ? " is-active" : ""}`);
      b.type = "button";
      b.title = g.anime;
      b.dataset.game = g.id;
      b.setAttribute("aria-pressed", currentGame?.id === g.id);
      // Online, only the host of a room picks the anime (not during a match); the others follow.
      b.disabled = mode === "online" && !!((match && !match.done) || (rooms?.myRoom && !rooms.isHost()));
      const img = el("img");
      img.src = ROOT + g.logo;
      img.alt = "";
      b.append(img, el("span", null, g.anime));
      b.addEventListener("click", () => selectGame(g.id));
      box.append(b);
    }
  }

  async function renderArcChip() {
    const data = await loadGame(currentGame);
    const arc = playerArc(data.config);
    $("#crewArc").textContent = arc == null ? t("allArcs") : data.config.arcs[arc][lang];
    $("#crewArcLink").title = arc == null ? t("spoilerAll") : t("spoiler")(data.config.arcs[arc][lang]);
    $("#crewArcLink").href = `${ROOT}${currentGame.path}`;
  }

  async function selectGame(id, { quiet = false } = {}) {
    currentGame = GAMES.find((x) => x.id === id) ?? GAMES[0];
    try { localStorage.setItem("dle:crew-game", currentGame.id); } catch {}
    document.body.dataset.game = currentGame.id;
    renderPicker();
    await renderArcChip();
    if (quiet) return;
    if (mode === "solo") startSolo();
    else {
      // From the end-of-match screen, the host goes back to the room with the new anime.
      if (match?.done) { if (rooms?.myRoom) backToRoom(); else match = null; }
      updateProfile();
      if (rooms?.isHost()) rooms.setGame(currentGame.id);
      renderLobby();
    }
  }

  // ════════════════════ SOLO ════════════════════
  let solo = null;
  let soloReel = null;

  async function startSolo() {
    const g = currentGame;
    const data = await loadGame(g);
    const arc = playerArc(data.config) ?? data.config.arcs.length - 1;
    const pool = makePool(g, data, arc);
    solo = { g, pool, slots: makeSlots(g, pool), rolled: null, rerolls: REROLLS, done: false, rolling: false };
    renderSolo(true);
  }

  function soloCandidates(exclude) {
    const used = new Set(filledOf(solo.slots).map((s) => s.char.id));
    return solo.pool.filter((c) => !used.has(c.id) && c.id !== exclude && fitsIn(solo.slots, c));
  }

  async function soloRoll(isReroll) {
    if (solo.rolling || solo.done) return;
    const list = soloCandidates(solo.rolled?.id);
    if (!list.length) return soloFinish();
    if (isReroll) solo.rerolls--;
    const pick = list[Math.floor(Math.random() * list.length)];
    const run = solo;
    run.rolling = true;
    run.rolled = null;
    renderSoloActions();
    renderBoard($("#crewBoard"), run.slots);
    await soloReel.spin(list, pick);
    if (solo !== run) return; // a new crew was started meanwhile
    run.rolling = false;
    run.rolled = pick;
    soloReel.hint(t("chooseSlot"));
    renderBoard($("#crewBoard"), run.slots, { rolled: pick, onPlace: soloPlace });
    renderSoloActions();
  }

  async function soloPlace(i) {
    const run = solo;
    const c = run.rolled;
    if (!c) return;
    run.rolled = null;
    renderSoloActions();
    const target = slotFace($("#crewBoard"), i);
    renderBoard($("#crewBoard"), run.slots);
    await fly(soloReel.window, target, c.image);
    if (solo !== run) return;
    const slot = run.slots[i];
    slot.char = c;
    slot.points = pointsFor(slot, c);
    soloReel.idle();
    renderBoard($("#crewBoard"), run.slots);
    popSlot($("#crewBoard"), i, slot.points);
    renderSoloStatus();
    if (!openSlots(run.slots).length || !soloCandidates().length) soloFinish();
    else renderSoloActions();
  }

  function soloFinish() {
    solo.done = true;
    solo.rolled = null;
    renderBoard($("#crewBoard"), solo.slots);
    renderSoloStatus();
    const panel = $("#rollPanel");
    panel.textContent = "";
    panel.append(resultBlock(average(solo.slots), solo.slots, {
      title: t("resultTitle"),
      actions: [[t("share"), "btn-ghost", () => copyText(shareSolo())], [t("again"), "btn-primary", startSolo]],
    }));
  }

  function resultBlock(avg, slots, { title, actions, outcome }) {
    const rank = rankOf(avg);
    const f = filledOf(slots);
    const best = [...f].sort((a, b) => b.points - a.points)[0];
    const worst = [...f].sort((a, b) => a.points - b.points)[0];
    const box = el("div", "crew-result");
    box.append(el("p", "result-kicker", title));
    if (outcome) box.append(el("p", `duel-outcome is-${outcome.kind}`, outcome.text));
    const r = el("div", `crew-rank rank-${rank}`);
    setTimeout(() => sfx(rank === "S" || rank === "A" ? "win" : "stamp"), 150);
    r.append(el("span", null, rank));
    box.append(r);
    const avgEl = el("p", "crew-avg");
    const num = el("span", null, "0.0");
    avgEl.append(num, " / 10");
    box.append(avgEl);
    countUp(num, avg, 1, 900);
    if (best) box.append(el("p", "muted", `${t("best")}: ${best.char.name} (${slotLabel(best)}, ${best.points})`));
    if (worst && worst !== best) box.append(el("p", "muted", `${t("worst")}: ${worst.char.name} (${slotLabel(worst)}, ${worst.points})`));
    const row = el("div", "roll-actions");
    for (const [label, cls, fn] of actions) {
      const b = el("button", cls, label);
      b.type = "button";
      b.addEventListener("click", fn);
      row.append(b);
    }
    box.append(row);
    setTimeout(() => {
      const rect = r.getBoundingClientRect();
      if (rank === "S" || rank === "A" || outcome?.kind === "win") burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }, 380);
    return box;
  }

  function renderSoloStatus() {
    const f = filledOf(solo.slots).length;
    const total = solo.slots.filter((s) => !s.locked).length;
    const score = $("#crewScore");
    if (f) countUp(score, average(solo.slots));
    else { score.textContent = "–"; score.dataset.value = 0; }
    $("#crewFilled").textContent = t("filled")(f, total);
    // The ring shows the score out of 10; one pip per place, coloured by its points.
    $("#crewRing").style.strokeDasharray = `${f ? average(solo.slots) * 10 : 0} 100`;
    const rank = $("#crewLiveRank");
    rank.hidden = !f;
    if (f) {
      const letter = rankOf(average(solo.slots));
      // The badge stamps in again whenever the rank changes.
      const changed = rank.textContent !== letter;
      rank.textContent = letter;
      rank.className = `crew-live-rank rank-${letter}${changed ? " stamp" : ""}`;
    } else rank.textContent = "";
    const pips = $("#crewPips");
    pips.textContent = "";
    for (const s of solo.slots) {
      if (s.locked) continue;
      const pip = el("span", s.char ? `crew-pip is-filled p${Math.min(10, Math.round(s.points))}` : "crew-pip");
      pip.title = slotLabel(s);
      pips.append(pip);
    }
  }

  function renderSoloActions() {
    const box = $("#rollActions");
    if (!box) return;
    box.textContent = "";
    if (solo.done) return;
    if (!solo.rolled) {
      const b = el("button", "btn-primary roll-btn", solo.rolling ? t("rolling") : t("roll"));
      b.prepend(icon("dice"));
      b.type = "button";
      b.disabled = solo.rolling;
      b.addEventListener("click", () => soloRoll(false));
      box.append(b);
    } else {
      const b = el("button", "btn-ghost", t("reroll")(solo.rerolls));
      b.type = "button";
      b.disabled = solo.rerolls <= 0;
      b.addEventListener("click", () => soloRoll(true));
      box.append(b);
    }
  }

  function renderSolo(stagger) {
    const panel = $("#rollPanel");
    panel.textContent = "";
    soloReel = makeReel();
    panel.append(soloReel.el);
    if (solo.rolled) { soloReel.show(solo.rolled); soloReel.hint(t("chooseSlot")); } else soloReel.idle();
    const actions = el("div", "roll-actions");
    actions.id = "rollActions";
    panel.append(actions);
    renderBoard($("#crewBoard"), solo.slots, { stagger, rolled: solo.rolled, onPlace: solo.rolled ? soloPlace : null });
    renderSoloStatus();
    renderSoloActions();
    if (solo.done) soloFinish();
  }

  function shareSolo() {
    const avg = average(solo.slots);
    const lines = filledOf(solo.slots).map((s) => `${slotLabel(s)}: ${s.char.name} (${s.points})`);
    return `${t("title")} · ${solo.g.anime} · ${rankOf(avg)} ${avg.toFixed(1)}/10\n${lines.join("\n")}`;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = el("textarea");
      ta.value = text;
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast(t("copied"));
  }

  // ════════════════════ ONLINE (2–8 players) ════════════════════
  // Rooms come from shared/rooms.js. In a match the host picks one character per round for
  // everyone; each player places it on their own board and the boards are shared live.
  const SIZES = [2, 3, 4, 5, 6, 7, 8];
  let rooms = null;
  let roomSize = 2;
  let match = null;
  let matchReel = null;

  const cleanName = (s) => window.DLE_Rooms.cleanName(s);
  function myName() {
    try { return cleanName(localStorage.getItem("dle:name")); } catch { return ""; }
  }

  function ensureRooms() {
    if (rooms) return;
    rooms = window.DLE_Rooms.create({
      channel: "crew",
      startData: (room) => ({ arc: Math.min(...room.members.map((m) => m.arc)), key: Math.random().toString(36).slice(2, 10) }),
      onChange: () => { tryPendingJoin(); if (!match) renderLobby(); else renderScoreboard(); },
      onStart: (room, data) => startMatch(room, data),
      onMessage: onMatchMessage,
      onClosed: () => {
        if (match && !match.done) { match.closedByHost = true; finishMatch(); }
        else { match = null; renderLobby(); }
        toast(t("roomClosed"));
      },
      onInvite: (room, from) => {
        if (match && !match.done) return;
        const g = GAMES.find((x) => x.id === room.game);
        window.DLE_Rooms.inviteBanner({
          text: t("invitedBy")(rooms.peers.get(from)?.name ?? "Player", g?.anime),
          join: t("join"),
          dismiss: t("ignore"),
          onJoin: () => joinRoom(room),
        });
      },
    });
    updateProfile();
  }

  async function updateProfile() {
    if (!rooms || !currentGame) return;
    const data = await loadGame(currentGame);
    rooms.setProfile({ name: myName() || "Player", game: currentGame.id, arc: playerArc(data.config) ?? data.config.arcs.length - 1 });
  }

  const memberName = (id) => (id === rooms.selfId ? myName() || t("you") : match?.names.get(id) ?? rooms.peers.get(id)?.name ?? "Player");

  // ── Lobby ──
  function renderLobby() {
    if (mode !== "online" || match) return;
    // The host changed the anime: follow it (and send my spoiler limit for that anime).
    const joined = rooms?.myRoom;
    if (joined && !rooms.isHost() && joined.game !== currentGame.id && GAMES.some((g) => g.id === joined.game)) {
      selectGame(joined.game, { quiet: true }).then(() => { updateProfile(); renderLobby(); });
      return;
    }
    $("#duel").hidden = true;
    const box = $("#lobby");
    box.hidden = false;
    box.textContent = "";
    box.append(el("h2", null, t("lobbyTitle")));
    box.append(el("p", "muted", t("lobbyHelp")));

    if (!rooms || rooms.status === "connecting") {
      const w = el("p", "lobby-waiting");
      w.append(el("span", "spinner"), t("connecting"));
      box.append(w);
      return;
    }
    if (rooms.status === "offline") { box.append(el("p", "lobby-status is-error", t("offline"))); return; }

    // Name
    const form = el("form", "lobby-form");
    const input = el("input");
    input.id = "lobbyName";
    input.maxLength = 20;
    input.placeholder = t("yourName");
    input.setAttribute("aria-label", t("yourName"));
    input.value = myName();
    const save = el("button", "btn-ghost", t("saveName"));
    save.type = "submit";
    form.append(input, save);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = cleanName(input.value);
      if (!name) { input.placeholder = t("pickName"); input.focus(); return; }
      try { localStorage.setItem("dle:name", name); } catch {}
      window.dispatchEvent(new Event("dle:name"));
      updateProfile();
      toast(t("nameSaved"));
      tryPendingJoin();
    });
    box.append(form);

    const room = rooms.myRoom;
    if (!room && pendingJoin) {
      const w = el("p", "lobby-waiting");
      w.append(el("span", "spinner"), t("searching"));
      box.append(w);
    }
    if (room) box.append(roomCard(room));
    else {
      // Create a room
      box.append(el("h3", "room-title", t("withCode")));
      box.append(codeForm());
      box.append(el("h3", "room-title", t("pick")));
      box.append(animeChooser());
      const create = el("div", "room-create");
      create.append(el("span", "room-label", t("players")));
      const sizes = el("div", "size-picker");
      for (const n of SIZES) {
        const b = el("button", `size-pick${n === roomSize ? " is-active" : ""}`, String(n));
        b.type = "button";
        b.setAttribute("aria-pressed", n === roomSize);
        b.addEventListener("click", () => { roomSize = n; renderLobby(); });
        sizes.append(b);
      }
      const go = el("button", "btn-primary", t("createRoom"));
      go.type = "button";
      go.addEventListener("click", () => {
        if (!myName()) { input.placeholder = t("pickName"); input.focus(); return; }
        rooms.createRoom({ game: currentGame.id, size: roomSize });
      });
      create.append(sizes, go);
      box.append(create);

      // Open rooms
      box.append(el("h3", "room-title", t("openRooms")));
      const open = rooms.openRooms().sort((a, b) => Number(b.game === currentGame.id) - Number(a.game === currentGame.id));
      if (!open.length) box.append(el("p", "muted lobby-empty", t("noRooms")));
      const list = el("ul", "lobby-list");
      for (const r of open) {
        const g = GAMES.find((x) => x.id === r.game);
        const li = el("li", `lobby-player${r.game === currentGame.id ? " same-game" : ""}`);
        if (g) { const img = el("img"); img.src = ROOT + g.logo; img.alt = ""; img.title = g.anime; li.append(img); }
        const host = r.members.find((m) => m.id === r.host);
        const label = el("span", "lobby-pname", t("roomOf")(host?.name ?? "Player"));
        if (g) label.append(el("small", "lobby-anime", g.anime));
        li.append(label, el("span", "lobby-badge", `${r.members.length}/${r.size}`));
        const join = el("button", "btn-primary btn-small", t("join"));
        join.type = "button";
        join.addEventListener("click", () => {
          if (!myName()) { input.placeholder = t("pickName"); input.focus(); return; }
          joinRoom(r);
        });
        li.append(join);
        list.append(li);
      }
      box.append(list);
    }

    // Who is around
    const around = [...rooms.peers.values()];
    box.append(el("h3", "room-title", t("inLobby")(around.length + 1)));
    if (around.length) {
      const chips = el("div", "lobby-chips");
      for (const p of around) chips.append(peerChip(p));
      box.append(chips);
    } else box.append(aloneNote());
  }

  function aloneNote() {
    const wrap = el("div", "lobby-alone");
    wrap.append(el("p", "muted", t("aloneHere")));
    const b = el("button", "btn-ghost btn-small", t("copyLink"));
    b.type = "button";
    b.addEventListener("click", async () => {
      await copyText(location.href.split("#")[0] + "#online");
      toast(t("linkCopied"));
    });
    wrap.append(b);
    return wrap;
  }

  async function joinRoom(r) {
    if (match) { match = null; }
    if (mode !== "online") setMode("online");
    if (r.game !== currentGame.id) await selectGame(r.game, { quiet: true });
    // Send my spoiler limit for this room's anime before joining, not the one of the previous anime.
    await updateProfile();
    rooms.join(r.id);
  }

  // A player in the lobby: join the room they wait in, or invite them into mine.
  function peerChip(p) {
    const chip = el("span", "lobby-chip");
    const name = el("span");
    name.textContent = p.name;
    chip.append(name);
    const mine = rooms.myRoom;
    const theirs = rooms.roomOf(p.id);
    let btn = null;
    if (theirs && theirs.id !== mine?.id) {
      if (theirs.members.length < theirs.size) {
        btn = el("button", "btn-primary btn-small", t("join"));
        btn.addEventListener("click", () => {
          if (!myName()) { $("#lobbyName")?.focus(); toast(t("pickName")); return; }
          joinRoom(theirs);
        });
      }
    } else if (!theirs && !(mine && mine.members.length >= mine.size)) {
      btn = el("button", "btn-ghost btn-small", t("invite"));
      btn.addEventListener("click", () => {
        if (!myName()) { $("#lobbyName")?.focus(); toast(t("pickName")); return; }
        if (rooms.invite(p.id, { game: currentGame.id, size: roomSize })) toast(t("inviteSent")(p.name));
      });
    }
    if (btn) { btn.type = "button"; chip.classList.add("has-action"); chip.append(btn); }
    return chip;
  }

  // Invite links: crew/#join=<room id>. The room shows up once its host is found, then we join it.
  const inviteLink = (room) => `${location.href.split("#")[0]}#join=${encodeURIComponent(room.id)}`;

  // Wait for a room (from a link or a code) to be announced by its host, then join it.
  function waitForRoom(key, ms, message) {
    pendingJoin = key;
    tryPendingJoin.asked = false;
    setTimeout(() => { if (pendingJoin === key && !rooms?.myRoom) { pendingJoin = null; toast(t(message)); renderLobby(); } }, ms);
    tryPendingJoin();
    renderLobby();
  }

  function codeBadge(code) {
    const wrap = el("div", "room-code");
    wrap.append(el("span", null, t("codeLabel")), el("b", null, code));
    const b = el("button", "btn-ghost btn-small", t("copyCode"));
    b.type = "button";
    b.addEventListener("click", async () => { await copyText(code); toast(t("codeCopied")); });
    wrap.append(b);
    return wrap;
  }

  function codeForm() {
    const form = el("form", "code-form");
    const input = el("input");
    input.id = "roomCodeInput";
    input.maxLength = 6;
    input.placeholder = t("codePlaceholder");
    input.autocomplete = "off";
    input.setAttribute("autocapitalize", "characters");
    input.setAttribute("aria-label", t("codePlaceholder"));
    input.addEventListener("input", () => { input.value = window.DLE_Rooms.cleanCode(input.value); });
    const go = el("button", "btn-primary", t("joinCode"));
    go.type = "submit";
    form.append(input, go);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = window.DLE_Rooms.cleanCode(input.value);
      if (code.length < 4) { input.focus(); return; }
      if (!myName()) { toast(t("pickName")); $("#lobbyName")?.focus(); return; }
      waitForRoom(code, 12000, "codeNotFound");
    });
    return form;
  }

  function tryPendingJoin() {
    if (!pendingJoin || !rooms || rooms.status !== "live") return;
    const mine = rooms.myRoom;
    if (mine && (mine.id === pendingJoin || mine.code === pendingJoin)) { pendingJoin = null; return; }
    const r = rooms.findRoom(pendingJoin);
    if (!r) return;
    if (r.started || r.members.length >= r.size) { pendingJoin = null; toast(t("linkGone")); renderLobby(); return; }
    if (!myName()) {
      if (!tryPendingJoin.asked) { tryPendingJoin.asked = true; toast(t("pickToJoin")); setTimeout(() => $("#lobbyName")?.focus(), 50); }
      return;
    }
    pendingJoin = null;
    history.replaceState(null, "", "#online");
    joinRoom(r);
  }

  // Small row of anime logos (create a room, or the host changing the room's anime).
  function animeChooser() {
    const row = el("div", "anime-mini");
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "Anime");
    for (const g of GAMES) {
      const on = currentGame?.id === g.id;
      const b = el("button", `anime-mini-pick${on ? " is-active" : ""}`);
      b.type = "button";
      b.title = g.anime;
      b.setAttribute("aria-label", g.anime);
      b.setAttribute("aria-pressed", on);
      const img = el("img");
      img.src = ROOT + g.logo;
      img.alt = "";
      b.append(img);
      if (on) b.append(el("span", null, g.anime));
      b.addEventListener("click", () => { if (!on) selectGame(g.id); });
      row.append(b);
    }
    return row;
  }

  function roomCard(room) {
    const card = el("div", "room-card");
    const g = GAMES.find((x) => x.id === room.game);
    const head = el("div", "room-head");
    if (g) { const img = el("img"); img.src = ROOT + g.logo; img.alt = ""; head.append(img); }
    const host = room.members.find((m) => m.id === room.host);
    head.append(el("b", null, t("roomOf")(host?.name ?? "Player")), el("span", "lobby-badge", `${room.members.length}/${room.size}`));
    card.append(head);
    const hint = el("p", "room-hint");
    if (g) hint.append(el("b", null, g.anime), " · ");
    hint.append(rooms.isHost() ? t("hostPicks") : t("hostChooses"));
    card.append(hint);
    if (room.code) card.append(codeBadge(room.code));
    if (rooms.isHost()) card.append(animeChooser());
    const list = el("ul", "room-members");
    for (let i = 0; i < room.size; i++) {
      const m = room.members[i];
      const li = el("li", m ? "is-taken" : "is-free");
      li.append(el("span", "room-seat", String(i + 1)));
      li.append(el("span", null, m ? (m.id === rooms.selfId ? `${m.name} (${t("you")})` : m.name) : t("freeSeat")));
      if (m && m.id === room.host) li.append(el("span", "lobby-badge", t("host")));
      list.append(li);
    }
    card.append(list);
    const actions = el("div", "roll-actions");
    if (rooms.isHost()) {
      const start = el("button", "btn-primary", t("start"));
      start.type = "button";
      start.disabled = room.members.length < 2;
      start.addEventListener("click", () => rooms.start());
      actions.append(start);
      if (room.members.length < 2) card.append(el("p", "muted", t("needTwo")));
    } else {
      const w = el("p", "lobby-waiting");
      w.append(el("span", "spinner"), t("waitHost"));
      card.append(w);
    }
    const leave = el("button", "btn-ghost", t("leave"));
    leave.type = "button";
    leave.addEventListener("click", () => rooms.leave());
    actions.append(leave);
    const link = el("button", "btn-ghost", t("copyInvite"));
    link.type = "button";
    link.addEventListener("click", async () => {
      await copyText(inviteLink(room));
      toast(t("inviteCopied"));
    });
    actions.append(link);
    card.append(actions, rooms.chatBox());
    return card;
  }

  // ── Match ──
  // Everyone plays at the same time with their own rolls and rerolls, like in solo. Each
  // placement is shared so the other boards fill up live; the match ends when everyone is done.
  async function startMatch(room, data) {
    const g = GAMES.find((x) => x.id === room.game);
    if (!g) return;
    if (currentGame.id !== g.id) await selectGame(g.id, { quiet: true });
    const gameData = await loadGame(g);
    const arc = Math.min(Number.isInteger(data.arc) ? data.arc : 0, gameData.config.arcs.length - 1);
    const pool = makePool(g, gameData, arc);
    const ids = room.members.map((m) => m.id);
    match = {
      room, g, pool, ids, arc, config: gameData.config,
      names: new Map(room.members.map((m) => [m.id, m.id === rooms.selfId ? myName() || t("you") : m.name])),
      boards: new Map(ids.map((id) => [id, makeSlots(g, pool)])),
      active: new Set(ids),
      finished: new Set(),
      claims: new Map(), // playerId → character they have rolled and not placed yet
      rolled: null, rerolls: REROLLS, rolling: false, done: false, starting: true,
      key: String(data.key ?? ""), // tells this match's messages from the previous one's
    };
    renderPicker();
    renderMatch();
    const others = ids.filter((id) => id !== rooms.selfId).map(memberName);
    await vsSplash(memberName(rooms.selfId), others.join(" · "));
    if (!match || match.room.id !== room.id) return;
    match.starting = false;
    renderMatchActions();
    if (!matchCandidates().length) markDone();
  }

  function vsSplash(a, b) {
    const s = el("div", "vs-splash");
    s.append(el("span", "vs-name vs-left", a), el("span", "vs-mark", t("vs")), el("span", "vs-name vs-right", b));
    document.body.append(s);
    return wait(2200)
      .then(() => { s.classList.add("is-out"); return wait(350); })
      .then(() => s.remove());
  }

  const myBoard = () => match.boards.get(rooms.selfId);

  // Taken: placed on any board, or currently rolled by another player.
  function takenIds() {
    const ids = new Set();
    for (const board of match.boards.values()) for (const s of filledOf(board)) ids.add(s.char.id);
    for (const [id, charId] of match.claims) if (id !== rooms.selfId) ids.add(charId);
    return ids;
  }

  function matchCandidates(exclude) {
    const board = myBoard();
    const taken = takenIds();
    return match.pool.filter((c) => !taken.has(c.id) && c.id !== exclude && fitsIn(board, c));
  }

  // Two players rolled the same character at the same moment: the smaller id keeps it,
  // the other one gets a free roll.
  function lostClaim(c) {
    for (const [id, charId] of match.claims) if (id !== rooms.selfId && charId === c.id && id < rooms.selfId) return id;
    return null;
  }

  function onStolen(byId) {
    toast(t("taken")(memberName(byId)));
    match.rolled = null;
    match.rolling = false;
    matchReel.idle();
    renderBoard($("#duelMine"), myBoard());
    matchRoll(false, true);
  }

  async function matchRoll(isReroll, free = false) {
    const run = match;
    if (!run || run.rolling || run.done || run.starting || run.finished.has(rooms.selfId)) return;
    const list = matchCandidates(run.rolled?.id);
    if (!list.length) return markDone();
    if (isReroll && !free) run.rerolls--;
    const pick = list[Math.floor(Math.random() * list.length)];
    run.claims.set(rooms.selfId, pick.id);
    rooms.broadcast("claim", { charId: pick.id });
    run.rolling = true;
    run.rolled = null;
    renderMatchActions();
    renderBoard($("#duelMine"), myBoard());
    await matchReel.spin(list, pick);
    if (match !== run || run.done) return;
    const winner = lostClaim(pick);
    if (winner) return onStolen(winner);
    run.rolling = false;
    run.rolled = pick;
    matchReel.hint(t("chooseSlot"));
    renderBoard($("#duelMine"), myBoard(), { rolled: pick, onPlace: matchPlace });
    renderMatchActions();
  }

  async function matchPlace(i) {
    const run = match;
    const c = run?.rolled;
    if (!c) return;
    run.rolled = null;
    renderMatchActions();
    const target = slotFace($("#duelMine"), i);
    renderBoard($("#duelMine"), myBoard());
    await fly(matchReel.window, target, c.image);
    if (match !== run) return;
    const slot = myBoard()[i];
    slot.char = c;
    slot.points = pointsFor(slot, c);
    matchReel.idle();
    renderBoard($("#duelMine"), myBoard());
    popSlot($("#duelMine"), i, slot.points);
    run.claims.delete(rooms.selfId);
    rooms.broadcast("place", { slot: i, charId: c.id });
    renderScoreboard();
    if (!openSlots(myBoard()).length || !matchCandidates().length) markDone();
    else renderMatchActions();
  }

  // "I'm done" with my whole board. A lost message would leave the others waiting forever, so it is
  // sent again every few seconds for a minute (even after the ranking); receiving it twice is harmless.
  function markDone() {
    if (!match || match.finished.has(rooms.selfId)) return;
    const run = match;
    run.finished.add(rooms.selfId);
    const sendDone = () => rooms.broadcast("done", { key: run.key, board: myBoard().map((s, i) => (s.char ? [i, s.char.id] : null)).filter(Boolean) });
    sendDone();
    let left = 20;
    const timer = setInterval(() => { if (match !== run || --left <= 0) clearInterval(timer); else sendDone(); }, 3000);
    matchReel.idle(t("waitOthers"));
    renderMatchActions();
    renderScoreboard();
    checkMatchEnd();
  }

  function checkMatchEnd() {
    if (match && !match.done && [...match.active].every((id) => match.finished.has(id))) finishMatch();
  }

  function renderMatchActions() {
    const box = $("#matchActions");
    if (!box || !match) return;
    box.textContent = "";
    if (match.done || match.starting || match.finished.has(rooms.selfId)) return;
    if (!match.rolled) {
      const b = el("button", "btn-primary roll-btn", match.rolling ? t("rolling") : t("roll"));
      b.prepend(icon("dice"));
      b.type = "button";
      b.disabled = match.rolling;
      b.addEventListener("click", () => matchRoll(false));
      box.append(b);
    } else {
      const b = el("button", "btn-ghost", t("reroll")(match.rerolls));
      b.type = "button";
      b.disabled = match.rerolls <= 0;
      b.addEventListener("click", () => matchRoll(true));
      box.append(b);
    }
  }

  function onMatchMessage(type, d, from) {
    if (!match || !match.boards.has(from)) return;
    if (type === "claim") {
      if (typeof d.charId !== "string") return;
      match.claims.set(from, d.charId);
      // They rolled the character I'm holding at the same moment and they win the tie.
      const mine = match.rolled ?? null;
      if (mine && mine.id === d.charId && from < rooms.selfId) onStolen(from);
      return;
    }
    if (type === "place") {
      match.claims.delete(from);
      const c = match.pool.find((x) => x.id === d.charId);
      const board = match.boards.get(from);
      const i = Number(d.slot);
      const slot = board[i];
      if (c && slot && !slot.char && !slot.locked && slot.def.fits(c) && !board.some((s) => s.char?.id === c.id)) {
        slot.char = c;
        slot.points = pointsFor(slot, c);
        const box = document.querySelector(`[data-board="${CSS.escape(from)}"]`);
        if (box) { renderBoard(box, board, { mini: true }); popSlot(box, i); }
        renderScoreboard();
      }
    } else if (type === "done") {
      if (d.key != null && String(d.key) !== match.key) return;
      if (match.finished.has(from)) return;
      match.claims.delete(from);
      // Fill in any placement whose message was lost.
      const board = match.boards.get(from);
      if (Array.isArray(d.board) && !match.done) {
        for (const pair of d.board.slice(0, board.length)) {
          const [i, charId] = Array.isArray(pair) ? pair : [];
          const slot = board[i];
          const c = match.pool.find((x) => x.id === charId);
          if (c && slot && !slot.char && !slot.locked && slot.def.fits(c) && !board.some((s) => s.char?.id === c.id)) {
            slot.char = c;
            slot.points = pointsFor(slot, c);
          }
        }
        const box = document.querySelector(`[data-board="${CSS.escape(from)}"]`);
        if (box) renderBoard(box, board, { mini: true });
      }
      match.finished.add(from);
      renderScoreboard();
      checkMatchEnd();
    } else if (type === "left") {
      match.active.delete(from);
      renderScoreboard();
      checkMatchEnd();
    }
  }

  const scores = () => match.ids.map((id) => ({ id, name: memberName(id), score: duelScore(match.boards.get(id)), left: !match.active.has(id) }))
    .sort((a, b) => b.score - a.score);

  function finishMatch() {
    if (!match || match.done) return;
    match.done = true;
    match.current = null;
    renderScoreboard();
    const mine = match.boards.get(rooms.selfId);
    renderBoard($("#duelMine"), mine);
    const ranking = scores();
    // Equal scores share a place.
    const myScore = duelScore(match.boards.get(rooms.selfId));
    const place = 1 + ranking.filter((r) => r.score > myScore + 1e-9).length;
    const tiedTop = place === 1 && ranking.filter((r) => Math.abs(r.score - myScore) < 1e-9).length > 1;
    const panel = $("#duelPanel");
    panel.textContent = "";
    const kind = tiedTop ? "draw" : place === 1 ? "win" : place === ranking.length ? "lose" : "draw";
    const actions = [[t("leave"), "btn-ghost", leaveMatch]];
    if (!match.closedByHost) actions.push([t("backRoom"), "btn-primary", backToRoom]);
    panel.append(resultBlock(duelScore(mine), mine, { title: t("finalRanking"), outcome: { kind, text: tiedTop ? t("tie") : t("youPlace")(place) }, actions }));
    const list = el("ol", "ranking");
    for (const r of ranking) {
      const li = el("li", r.id === rooms.selfId ? "is-me" : "");
      li.append(el("span", "ranking-name", r.left ? `${r.name} (${t("left")})` : r.name), el("b", null, r.score.toFixed(1)));
      list.append(li);
    }
    panel.querySelector(".crew-result").insertBefore(list, panel.querySelector(".crew-result .roll-actions"));
    if (!match.closedByHost) panel.append(rooms.chatBox());
  }

  function leaveMatch() {
    match = null;
    rooms.leave();
    renderPicker();
    renderLobby();
  }

  function backToRoom() {
    match = null;
    if (rooms.isHost()) rooms.reopen();
    renderPicker();
    renderLobby();
  }

  function renderScoreboard() {
    if (!match) return;
    const box = $("#scoreboard");
    if (!box) return;
    box.textContent = "";
    for (const id of match.ids) {
      const chip = el("div", `score-chip${id === rooms.selfId ? " is-me" : ""}${match.active.has(id) ? "" : " has-left"}`);
      const dot = el("span", `duel-state${match.finished.has(id) ? " is-done" : ""}`);
      const score = el("b", "duel-score");
      // Scores animate from the value shown last time.
      score.dataset.value = match.shown?.get(id) ?? 0;
      chip.append(dot, el("span", "duel-pname", memberName(id)), score);
      box.append(chip);
      const value = duelScore(match.boards.get(id));
      countUp(score, value);
      (match.shown ??= new Map()).set(id, value);
    }
    $("#duelRound").textContent = t("arcUsed")(match.config.arcs[match.arc][lang]);
  }

  function renderMatch() {
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
    matchReel = makeReel();
    matchReel.idle();
    const actions = el("div", "roll-actions");
    actions.id = "matchActions";
    panel.append(matchReel.el, actions);
    grid.append(mine, panel);

    const others = el("div", "others");
    for (const id of match.ids) {
      if (id === rooms.selfId) continue;
      const wrap = el("div", "duel-theirs");
      wrap.append(el("p", "duel-label", memberName(id)));
      const b = el("div", "crew-board");
      b.dataset.board = id;
      wrap.append(b);
      others.append(wrap);
      renderBoard(b, match.boards.get(id), { mini: true, stagger: true });
    }
    view.append(head, grid, others);
    renderBoard(mine, match.boards.get(rooms.selfId), { stagger: true });
    renderScoreboard();
  }

  function toast(text) {
    const node = $("#toast");
    node.textContent = text;
    node.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => (node.hidden = true), 2200);
  }

  // ── Modes ──
  function setMode(m) {
    mode = m;
    document.querySelectorAll(".crew-mode [data-mode]").forEach((b) => {
      const on = b.dataset.mode === m;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on);
    });
    $("#soloView").hidden = m !== "solo";
    $("#duelView").hidden = m !== "online";
    if (m === "online") { ensureRooms(); if (match) renderMatch(); else renderLobby(); }
    else {
      if (rooms?.myRoom && !match) rooms.leave();
      if (currentGame && !solo) startSolo();
    }
    renderPicker();
  }

  // ── Header & language ──
  function renderCategories() {
    const nav = $("#categories");
    nav.textContent = "";
    for (const g of GAMES) {
      const a = el("a", "cat");
      a.href = ROOT + g.path;
      a.title = g.brand;
      const logo = el("span", "cat-logo");
      const img = el("img");
      img.src = ROOT + g.logo;
      img.alt = "";
      logo.append(img);
      a.append(logo, el("span", "cat-name", g.brand));
      nav.append(a);
    }
    nav.insertAdjacentHTML("beforeend", window.DLE_CREW_LINK(ROOT, T[lang].title));
    const crew = nav.querySelector(".cat-crew");
    crew.classList.add("is-current");
    crew.setAttribute("aria-current", "page");
  }

  function applyLang() {
    document.documentElement.lang = lang;
    $("#crewTitle").textContent = t("title");
    $("#crewSub").textContent = t("sub");
    $("#crewPickLabel").textContent = t("pick");
    $("#crewModeLabel").textContent = t("modeLabel");
    $("#crewArcLabel").textContent = t("arcLabel");
    $("#crewBrandIcon").replaceChildren(icon("dice"));
    $("#crewScoreLabel").textContent = t("score");
    document.querySelectorAll(".crew-mode [data-mode]").forEach((b) => (b.textContent = t(b.dataset.mode)));
    document.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === lang));
  }

  // Names can differ per language (Dragon Ball's French dub).
  async function relabel() {
    if (!currentGame) return;
    await renderArcChip();
    const { config } = await loadGame(currentGame);
    for (const pool of [solo?.pool, match?.pool]) for (const c of pool ?? []) c.name = displayName(config, c.baseName);
    if (mode === "solo" && solo && !solo.rolling) renderSolo(false);
    if (mode === "online") { if (match) renderScoreboard(); else renderLobby(); }
  }

  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => {
    lang = b.dataset.lang;
    window.DLE_LANG.set(lang);
    renderCategories();
    applyLang();
    window.dispatchEvent(new Event("dle:lang"));
    relabel();
  }));
  document.querySelectorAll(".crew-mode [data-mode]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));

  renderCategories();
  applyLang();
  let saved = null;
  try { saved = localStorage.getItem("dle:crew-game"); } catch {}
  currentGame = GAMES.find((g) => g.id === saved) ?? GAMES.find((g) => g.id === "onepiece");
  const joinHash = location.hash.match(/^#join=(.+)$/);
  if (joinHash) {
    const key = decodeURIComponent(joinHash[1]).slice(0, 64);
    pendingJoin = key;
    // Give up after a while if the host is gone.
    setTimeout(() => { if (pendingJoin === key && !rooms?.myRoom) { pendingJoin = null; toast(t("linkGone")); renderLobby(); } }, 25000);
  }
  mode = location.hash === "#online" || joinHash ? "online" : "solo";
  setMode(mode);
  selectGame(currentGame.id);
})();
