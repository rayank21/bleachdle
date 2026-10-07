// Crew Roll: pick an anime, roll random characters and place each one in a slot of your crew.
// Each placement scores 1–10; the crew's score is the average of its slots.
// Solo mode, plus an online 1v1: two ready players get the same character each round and race
// for the better crew. Players connect directly (WebRTC via Trystero), like the online bar.
(() => {
  "use strict";

  const GAMES = window.DLE_GAMES;
  const CREW = window.CREW_GAMES;
  const DEFAULT_POWER = window.CREW_DEFAULT_POWER;
  const REROLLS = 5;
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
      skip: "No slot left for this one: skip",
      tiers: { legend: "Legendary", epic: "Epic", common: "Common" },
      teamWins: (n) => `${n} wins!`,
      teamDraw: "Draw between the teams!",
      index: "Index",
      indexTitle: (a) => `${a} index`,
      indexSub: (n, arc) => `${n} cards${arc ? ` · spoiler-free up to ${arc}` : ""}. What each card scores in every role.`,
      indexSearch: "Search a character…",
      indexSort: "Sort",
      sortPower: "Power",
      sortName: "Name",
      allTiers: "All",
      bestRole: "Best role",
      noFit: "Can't go in this role",
      noCard: "No card matches.",
      newCard: "✨ New card!", collection: (a, b) => `Collection · ${a} / ${b}`, ownAll: "All", ownYes: "Drawn", ownNo: "To find", notDrawn: "Not drawn yet",
      ixTop: "Best crews",
      ixBoard: "Full leaderboard",
      ixNone: "No crew yet for this anime: build one in Solo!",
      ixTap: "Tap to see the transformation",
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
      lobbyHelp: "Create a room for 2 to 8 players, or join an open one. Players take turns: roll, place, and watch the others' picks live (5 rerolls each); the best crew wins.",
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
      rejoining: "Getting you back into your match…",
      rejoined: "Back in the match!",
      lateJoined: (n) => `${n} joins the match and will catch up!`,
      rejoinFailed: "Your match couldn't be found anymore.",
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
      yourTurn: "Your turn!",
      turnOf: (n) => `${n}'s turn…`,
      autoIn: (s) => `Auto-play in ${s} s`,
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
      skip: "Plus de place pour lui : passer",
      tiers: { legend: "Légendaire", epic: "Épique", common: "Commun" },
      teamWins: (n) => `${n} gagne !`,
      teamDraw: "Égalité entre les équipes !",
      index: "Index",
      indexTitle: (a) => `Index ${a}`,
      indexSub: (n, arc) => `${n} cartes${arc ? ` · sans spoiler jusqu'à ${arc}` : ""}. Ce que chaque carte rapporte dans chaque rôle.`,
      indexSearch: "Chercher un personnage…",
      indexSort: "Trier",
      sortPower: "Puissance",
      sortName: "Nom",
      allTiers: "Toutes",
      bestRole: "Meilleur rôle",
      noFit: "Ne peut pas aller à ce rôle",
      noCard: "Aucune carte ne correspond.",
      newCard: "✨ Nouvelle carte !", collection: (a, b) => `Collection · ${a} / ${b}`, ownAll: "Toutes", ownYes: "Tirées", ownNo: "À trouver", notDrawn: "Pas encore tirée",
      ixTop: "Meilleurs équipages",
      ixBoard: "Classement complet",
      ixNone: "Pas encore d'équipage pour cet animé : fais-en un en Solo !",
      ixTap: "Touche pour voir la transformation",
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
      lobbyHelp: "Crée une salle de 2 à 8 joueurs, ou rejoins-en une. On joue chacun son tour : tire, place, et regarde les persos des autres en direct (5 relances chacun) : le meilleur équipage gagne.",
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
      rejoining: "Retour dans ta partie…",
      rejoined: "De retour dans la partie !",
      lateJoined: (n) => `${n} rejoint la partie et va rattraper son retard !`,
      rejoinFailed: "Impossible de retrouver ta partie.",
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
      yourTurn: "À ton tour !",
      turnOf: (n) => `Tour de ${n}…`,
      autoIn: (s) => `Jeu auto dans ${s} s`,
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
    flask: "M9 2h6M10 2v6.5L4.4 18.2A2.5 2.5 0 0 0 6.6 22h10.8a2.5 2.5 0 0 0 2.2-3.8L14 8.5V2M7 15h10",
    chess: "M8 22h8M7 18h10l-1 4H8zM9 18c0-3 1-5 1-7H8l1-3h6l1 3h-2c0 2 1 4 1 7M10 5a2 2 0 1 1 4 0 2 2 0 0 1-4 0z",
  };
  // Role colours by icon (two tones for gradients), so each role reads at a glance.
  const ROLE_RGB = {
    crown: ["255, 215, 80", "255, 140, 40"], swords: ["120, 170, 255", "150, 110, 255"], sword: ["120, 170, 255", "80, 220, 255"],
    compass: ["60, 210, 220", "60, 140, 255"], chef: ["255, 160, 60", "255, 90, 90"], cross: ["70, 220, 130", "40, 200, 200"],
    book: ["190, 130, 255", "255, 110, 200"], hammer: ["230, 175, 100", "255, 120, 60"], shield: ["160, 175, 200", "110, 140, 255"],
    skull: ["200, 200, 215", "150, 120, 255"], mask: ["240, 240, 245", "255, 120, 120"], star: ["255, 220, 90", "255, 150, 60"],
    person: ["120, 200, 255", "120, 255, 200"], card: ["90, 210, 150", "60, 170, 255"], bug: ["160, 220, 80", "60, 200, 120"],
    spider: ["200, 120, 255", "255, 90, 140"], bolt: ["120, 200, 255", "190, 120, 255"], dice: ["255, 150, 210", "190, 120, 255"],
    flame: ["255, 150, 50", "255, 70, 70"], leaf: ["110, 220, 110", "40, 200, 170"], cloud: ["255, 100, 110", "190, 70, 255"],
    hat: ["255, 195, 80", "255, 110, 60"], eye: ["255, 90, 90", "255, 160, 60"], globe: ["90, 180, 255", "90, 230, 200"],
    flask: ["120, 255, 220", "90, 160, 255"], chess: ["230, 230, 255", "160, 140, 255"],
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
  function burst(x, y, { count = 40, spread = 220, gold = false, color = null } = {}) {
    const layer = el("div", `burst${gold ? " is-gold" : ""}`);
    if (color) layer.style.setProperty("--burst-c", `rgb(${color})`);
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

  // The cinematic's small line under the name: the character's group (affiliation, village, crew…), if known.
  function subtitleOf(c) {
    for (const k of ["affiliation", "aff", "village", "team", "squad", "org", "grade", "rank"]) {
      const v = Array.isArray(c[k]) ? c[k][0] : c[k];
      if (typeof v === "string" && v && !/^(none|unknown)$/i.test(v)) return v;
    }
    return "";
  }

  // Transformation of a character at this arc (crew/forms.js), with its portrait.
  function formFor(game, c, arc) {
    const f = window.CREW_FORMS?.[game]?.[c.id];
    if (!f || arc < f.arc) return null;
    // A later look replaces the first once the player has reached it (files <game>-<id>-2.webp / .mp4).
    const late = f.next && arc >= f.next.arc;
    const key = late ? `${game}-${c.id}-2` : `${game}-${c.id}`;
    const base = late ? { ...f, ...f.next } : f;
    const clip = late ? f.next.clip : f.clip;
    return { ...base, image: `assets/forms/${key}.webp`, clip: clip ? `assets/clips/${key}.mp4` : null };
  }

  // Ripple filters for transformations: an animated turbulence displaces the picture like heat or energy.
  function ensureFilters() {
    if (document.getElementById("tf-filters")) return;
    const wave = (id, scale, dur, f1, f2) => `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="${f1}" numOctaves="2" seed="4"><animate attributeName="baseFrequency" dur="${dur}" values="${f1};${f2};${f1}" repeatCount="indefinite"/><animate attributeName="seed" dur="0.5s" values="4;9;2;7;4" calcMode="discrete" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
    document.body.insertAdjacentHTML("beforeend", `<svg id="tf-filters" width="0" height="0" style="position:absolute" aria-hidden="true">${wave("tf-wave", 12, "1.4s", "0.010 0.040", "0.016 0.065")}${wave("tf-wave-strong", 22, "0.6s", "0.012 0.05", "0.03 0.09")}${wave("tf-wave-soft", 4, "1.6s", "0.03 0.08", "0.05 0.12")}</svg>`);
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
    const fxLayer = el("div", "tf-layer");
    const kanji = el("span", "tf-kanji");
    stage.append(rays, glow, fxLayer, win, kanji);
    const zap = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    zap.setAttribute("viewBox", "0 0 100 100");
    zap.setAttribute("preserveAspectRatio", "none");
    zap.setAttribute("class", "tf-zap");
    win.append(zap);
    let zapTimer = null;
    // A few jagged bolts at random places, redrawn several times a second.
    const drawZap = () => {
      zap.textContent = "";
      const n = 1 + Math.floor(Math.random() * 3);
      for (let b = 0; b < n; b++) {
        let x = Math.random() * 100, y = Math.random() * 55;
        const ang = Math.random() * Math.PI * 2;
        let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
        for (let k = 0; k < 6; k++) {
          x += Math.cos(ang) * 6 + (Math.random() * 10 - 5);
          y += Math.sin(ang) * 6 + (Math.random() * 10 - 5);
          d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        zap.append(path);
      }
    };
    const startZap = () => { stopZap(); drawZap(); zapTimer = setInterval(() => (Math.random() < 0.75 ? drawZap() : (zap.textContent = "")), 110); };
    const stopZap = () => { clearInterval(zapTimer); zapTimer = null; zap.textContent = ""; };
    const formTag = el("span", "tf-name");
    formTag.hidden = true;
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
    wrap.append(el("p", "reel-kicker", t("draw")), stage, tier, formTag, name, power, hint);

    // Each portrait is shown whole over a blurred, zoomed copy of itself, so no one is cut off.
    const card = (c) => {
      const item = el("div", `reel-item${c.isForm ? " is-form" : ""}`);
      const bg = el("img", "reel-bg");
      const fg = el("img", "reel-fg");
      // Wide pictures fill the card; only tall portraits are shown whole over the blur.
      fg.addEventListener("load", () => item.classList.toggle("is-wide", fg.naturalWidth / fg.naturalHeight > 0.8), { once: true });
      bg.src = fg.src = c.image;
      bg.alt = fg.alt = "";
      item.append(bg, fg);
      // Transformed: a rippling copy over the top of the picture makes hair and aura move.
      if (c.isForm) {
        const hair = el("img", "reel-hair");
        hair.src = c.image;
        hair.alt = "";
        item.append(hair);
      }
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
    const clearForm = () => {
      stopZap();
      wrap.classList.remove("is-powering", "is-transformed", "tf-aura", "tf-pillar", "tf-domain");
      fxLayer.textContent = "";
      kanji.classList.remove("go");
      formTag.hidden = true;
    };
    // The effect's pieces: flame tongues and sparks for an aura, a beam for a pillar, a sphere for a domain.
    const buildFx = (f) => {
      fxLayer.textContent = "";
      wrap.style.setProperty("--fx1", f.c1);
      wrap.style.setProperty("--fx2", f.c2);
      wrap.classList.add(`tf-${f.fx}`);
      if (f.fx === "aura") {
        for (let i = 0; i < 14; i++) {
          const flame = el("i", "tf-flame");
          flame.style.setProperty("--x", `${(i / 13) * 100}%`);
          flame.style.setProperty("--h", `${55 + Math.random() * 45}%`);
          flame.style.animationDelay = `${Math.random() * -0.6}s`;
          fxLayer.append(flame);
        }
      }
      if (f.fx === "pillar") fxLayer.append(el("i", "tf-beam"), el("i", "tf-beam is-core"));
      if (f.fx === "domain") fxLayer.append(el("i", "tf-sphere"), el("i", "tf-ring"));
      for (let i = 0; i < 18; i++) {
        const spark = el("i", "tf-spark");
        spark.style.setProperty("--x", `${Math.random() * 100}%`);
        spark.style.animationDelay = `${Math.random() * -1.2}s`;
        spark.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
        fxLayer.append(spark);
      }
      if (f.lightning || f.fx === "aura") {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.setAttribute("class", "tf-bolts");
        for (let b = 0; b < 3; b++) {
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          let x = 15 + Math.random() * 70, d = `M${x} 0`;
          for (let y = 12; y <= 100; y += 12) { x += Math.random() * 18 - 9; d += ` L${x.toFixed(1)} ${y}`; }
          path.setAttribute("d", d);
          path.style.animationDelay = `${b * 0.23}s`;
          svg.append(path);
        }
        fxLayer.append(svg);
      }
    };
    const showForm = (c) => {
      ensureFilters();
      buildFx(c.form);
      if (c.form.lightning) startZap();
      wrap.classList.add("is-transformed");
      formTag.textContent = c.form.name[lang];
      formTag.hidden = false;
    };

    const reel = {
      el: wrap,
      window: win,
      idle(text = t("waitingRoll")) {
        strip.textContent = "";
        strip.style.transform = "translateY(0)";
        strip.style.filter = "";
        wrap.classList.remove("is-landed", "is-spinning", "is-charging");
        clearTier();
        clearForm();
        q.hidden = false;
        tier.hidden = true;
        setName(text, false);
        power.hidden = true;
        hint.textContent = "";
      },
      show(c, animate = false) {
        strip.textContent = "";
        clearForm();
        strip.append(card(c.form && !animate ? { image: c.formImage, isForm: true } : c));
        if (c.form && !animate) showForm(c);
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
      async spin(list, pick, { game = null, arc = 99 } = {}) {
        // A card that will transform: its cinematic's pictures load while the reel turns.
        if (game) window.CREW_CINEMA?.preload?.(formFor(game, pick, arc));
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
        const form = game && formFor(game, pick, arc);
        if (form) await reel.transform(pick, form);
      },
      // Power-up: the card trembles in a rising aura, then a flash, the kanji slams down and the
      // portrait becomes the transformed form, which keeps glowing.
      async transform(c, form) {
        ensureFilters();
        buildFx(form);
        startZap();
        wrap.classList.add("is-powering");
        hint.textContent = "";
        sfx("powerup");
        // The full-screen cinematic (cinema.js), or the short charge on the card alone.
        await (window.CREW_CINEMA?.play({ form, char: c, sub: subtitleOf(c) }) ?? new Promise((r) => setTimeout(r, 1500)));
        c.form = form;
        c.formImage = form.image;
        strip.textContent = "";
        strip.append(card({ image: form.image, isForm: true }));
        wrap.classList.remove("is-powering");
        showForm(c);
        kanji.textContent = form.kanji;
        kanji.classList.remove("go");
        void kanji.offsetWidth;
        kanji.classList.add("go");
        flash.classList.remove("go");
        void flash.offsetWidth;
        flash.classList.add("go");
        sfx("transform");
        window.DLE_FX?.flash(`rgba(${form.c1}, 0.45)`);
        shockwave(win, "is-form");
        const r = win.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, { count: 70, spread: 280, color: form.c1 });
        const panel = wrap.closest(".roll-panel");
        if (panel) { panel.classList.remove("shake"); void panel.offsetWidth; panel.classList.add("shake"); }
        await new Promise((r2) => setTimeout(r2, 900));
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
      const rgb = ROLE_RGB[slot.def.icon];
      if (rgb) { card.style.setProperty("--role-rgb", rgb[0]); card.style.setProperty("--role2-rgb", rgb[1]); }
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
        img.src = slot.char.formImage || slot.char.image;
        if (slot.char.form) { ensureFilters(); card.classList.add("is-transformed"); card.style.setProperty("--fx1", slot.char.form.c1); card.style.setProperty("--fx2", slot.char.form.c2); }
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
    if (mode === "index") renderIndex();
    else if (mode === "solo") startSolo();
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
    solo = { g, pool, arc, slots: makeSlots(g, pool), rolled: null, rerolls: REROLLS, done: false, rolling: false };
    renderSolo(true);
  }

  function soloCandidates(exclude) {
    const used = new Set(filledOf(solo.slots).map((s) => s.char.id));
    return solo.pool.filter((c) => !used.has(c.id) && c.id !== exclude && fitsIn(solo.slots, c));
  }

  // One random character of the list. With the admin panel's luck (shared/admin.js, unlocked browsers only) above 1,
  // characters worth more in the places still free weigh more.
  function draw(list, slots = null) {
    const luck = Math.min(Math.max(Number(window.DLE_ADMIN_LUCK) || 1, 1), 5);
    if (luck === 1) return list[Math.floor(Math.random() * list.length)];
    // What a character is worth here: the most it would score in one of the places still free on the board (so a
    // strong character useless in the missing roles doesn't count as strong). Each 2.5 points above 5 multiply the
    // odds by `luck` (below 5 divide them): at ×5, most draws are worth 8 or more in a free place.
    const open = slots ? openSlots(slots) : [];
    const worth = (c) => {
      const fit = open.filter((sl) => sl.def.fits(c));
      return fit.length ? Math.max(...fit.map((sl) => pointsFor(sl, c))) : c.power ?? DEFAULT_POWER;
    };
    const weights = list.map((c) => luck ** ((Math.min(worth(c), 10) - 5) / 2.5));
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < list.length; i++) if ((r -= weights[i]) < 0) return list[i];
    return list[list.length - 1];
  }

  // `forced`: a character picked in the admin panel instead of a random draw.
  async function soloRoll(isReroll, forced = null) {
    // No draw while a portrait is still flying to its slot: that slot is not filled yet.
    if (solo.rolling || solo.placing || solo.done) return;
    let list = soloCandidates(solo.rolled?.id);
    // Rerolling the only character that still fits gives it back rather than ending the crew.
    if (!list.length && solo.rolled) list = soloCandidates();
    if (!list.length && forced) list = [forced];
    if (!list.length) return soloFinish();
    if (isReroll) solo.rerolls--;
    window.DLE_Profile?.count(isReroll ? "rerolls" : "rolls");
    const pick = forced ?? draw(list, solo.slots);
    const run = solo;
    run.rolling = true;
    run.rolled = null;
    renderSoloActions();
    renderBoard($("#crewBoard"), run.slots);
    await soloReel.spin(list, pick, { game: run.g.id, arc: run.arc });
    if (solo !== run) return; // a new crew was started meanwhile
    run.rolling = false;
    // Safety net: a draw that no longer fits (or is already on the board) is redrawn for free.
    if (!forced && (!fitsIn(run.slots, pick) || filledOf(run.slots).some((x) => x.char.id === pick.id))) return soloRoll(false);
    run.rolled = pick;
    const fresh = window.DLE_Profile?.collect(run.g.id, pick.id);
    soloReel.hint(fresh ? `${t("newCard")} ${t("chooseSlot")}` : t("chooseSlot"));
    renderBoard($("#crewBoard"), run.slots, { rolled: pick, onPlace: soloPlace });
    renderSoloActions();
  }

  async function soloPlace(i) {
    const run = solo;
    const c = run.rolled;
    if (!c) return;
    run.rolled = null;
    run.placing = true;
    soloReel.hint("");
    renderSoloActions();
    const target = slotFace($("#crewBoard"), i);
    renderBoard($("#crewBoard"), run.slots);
    await fly(soloReel.window, target, c.formImage || c.image);
    run.placing = false;
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
    // Saved once per crew to the player's profile (best crew and leaderboard).
    if (!solo.recorded) {
      solo.recorded = true;
      const avg = average(solo.slots);
      window.DLE_Profile?.recordCrew({
        anime: solo.g.id,
        rank: rankOf(avg),
        score: avg,
        members: filledOf(solo.slots).map((s) => ({ id: s.char.id, name: s.char.name, role: slotLabel(s), points: s.points })),
      });
    }
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
      b.disabled = solo.rolling || solo.placing;
      b.addEventListener("click", () => soloRoll(false));
      box.append(b);
    } else {
      // A drawn character with nowhere to go can always be skipped, so the crew never gets stuck.
      const stuck = !fitsIn(solo.slots, solo.rolled);
      const b = el("button", "btn-ghost", stuck ? t("skip") : t("reroll")(solo.rerolls));
      b.type = "button";
      b.disabled = !stuck && solo.rerolls <= 0;
      b.addEventListener("click", () => soloRoll(!stuck));
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
      startData: (room) => ({
        arc: Math.min(...room.members.map((m) => m.arc)),
        key: Math.random().toString(36).slice(2, 10),
        teams: room.meta?.teams ? Object.fromEntries(room.members.map((m) => [m.id, rooms.teamOf(m.id, room) ?? 0])) : null,
      }),
      onChange: () => { tryPendingJoin(); if (!match) renderLobby(); else renderScoreboard(); },
      onStart: (room, data) => startMatch(room, data),
      onMessage: onMatchMessage,
      onClosed: (why) => {
        resume = null;
        if (match && !match.done) { match.closedByHost = true; finishMatch(); }
        else { match = null; renderLobby(); }
        toast(why === "rejoin-failed" ? t("rejoinFailed") : t("roomClosed"));
      },
      onRejoined: (room, data) => askResume(room, data),
      // A match under way can be joined (from a friend or a code): ask for it like after a reload.
      lateJoin: true,
      onLateJoined: (room) => askResume(room, { key: null }),
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
    if (rooms?.rejoining || resume) {
      $("#duel").hidden = true;
      const box = $("#lobby");
      box.hidden = false;
      box.textContent = "";
      const w = el("p", "lobby-waiting");
      w.append(el("span", "spinner"), t("rejoining"));
      box.append(el("h2", null, t("lobbyTitle")), w);
      return;
    }
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
    if (r.started ? r.members.length >= 8 : r.members.length >= r.size) { pendingJoin = null; toast(t("linkGone")); renderLobby(); return; }
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
    card.append(list, rooms.teamsBox());
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
  // Turn by turn: one player rolls (with their own rerolls) and places, everyone watches the roll
  // and the placement, then the next player goes. The match ends when every board is done.
  const TURN_MS = 45000; // a player who doesn't move in time is played for automatically
  async function startMatch(room, data) {
    const g = GAMES.find((x) => x.id === room.game);
    if (!g) return;
    if (currentGame.id !== g.id) await selectGame(g.id, { quiet: true });
    const gameData = await loadGame(g);
    const arc = Math.min(Number.isInteger(data.arc) ? data.arc : 0, gameData.config.arcs.length - 1);
    const pool = makePool(g, gameData, arc);
    const ids = room.members.map((m) => m.id);
    const teams = data.teams && typeof data.teams === "object" ? Object.fromEntries(ids.map((id) => [id, data.teams[id] === 1 ? 1 : 0])) : null;
    // Team vs team: one board per team, its players take turns on it; the turns alternate between the teams.
    const keys = teams ? [0, 1].filter((k) => ids.some((id) => teams[id] === k)).map((k) => `team-${k}`) : ids;
    let order = [...ids];
    if (teams) {
      const side = [0, 1].map((k) => ids.filter((id) => teams[id] === k));
      order = [];
      for (let i = 0; i < Math.max(side[0].length, side[1].length); i++) for (const k of [0, 1]) if (side[k][i]) order.push(side[k][i]);
    }
    match = {
      room, g, pool, ids, arc, config: gameData.config,
      names: new Map(room.members.map((m) => [m.id, m.id === rooms.selfId ? myName() || t("you") : m.name])),
      boards: new Map(keys.map((k) => [k, makeSlots(g, pool)])),
      active: new Set(ids),
      finished: new Set(),
      claims: new Map(), // playerId → character they have rolled and not placed yet
      rolled: null, rerolls: REROLLS, rolling: false, done: false, starting: true,
      key: String(data.key ?? ""), // tells this match's messages from the previous one's
      order, current: null, show: Promise.resolve(),
      // Team vs team: each player's team (0 red, 1 blue), and the team's board is the one its players fill.
      teams,
    };
    rooms.keepSeat = true;
    renderPicker();
    renderMatch();
    const others = ids.filter((id) => id !== rooms.selfId).map(memberName);
    await vsSplash(memberName(rooms.selfId), others.join(" · "));
    if (!match || match.room.id !== room.id) return;
    match.starting = false;
    // Everyone picks the same first player from the match key.
    const seed = [...match.key].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
    setTurn(order[seed % order.length]);
    startBeat(match);
  }

  // The board a player fills: their own, or their team's in team vs team.
  const boardKey = (id) => (match?.teams ? `team-${match.teams[id] ?? 0}` : id);
  const boardOf = (id) => match.boards.get(boardKey(id));
  const teammates = (id) => match.ids.filter((x) => boardKey(x) === boardKey(id));
  // Where a board is drawn: mine (full size) or one of the others (small).
  function boardBox(key) {
    if (key === boardKey(rooms.selfId)) return { box: $("#duelMine"), mini: false };
    return { box: document.querySelector(`[data-board="${CSS.escape(key)}"]`), mini: true };
  }
  const boardLabel = (key) => {
    if (!match.teams || !key.startsWith("team-")) return memberName(key);
    const k = Number(key.slice(5));
    return `${rooms.teamNames()[k]} · ${match.ids.filter((id) => match.teams[id] === k).map(memberName).join(" & ")}`;
  };

  // ── Turns ──
  const myTurn = () => !!match && match.current === rooms.selfId;
  const stillPlaying = (id) => match.active.has(id) && !match.finished.has(id);
  // A player behind everyone else (joined late) plays again and again until caught up, then the usual turns resume.
  function laggard() {
    if (match.teams) return null;
    const live = match.order.filter(stillPlaying);
    if (live.length < 2) return null;
    const count = (id) => filledOf(boardOf(id)).length;
    return live.find((id) => count(id) < Math.min(...live.filter((x) => x !== id).map(count))) ?? null;
  }
  function nextAfter(id) {
    const lag = laggard();
    if (lag) return lag;
    const o = match.order;
    const i = o.indexOf(id);
    for (let k = 1; k <= o.length; k++) { const x = o[(i + k) % o.length]; if (stillPlaying(x)) return x; }
    return null;
  }
  function setTurn(id) {
    const run = match;
    if (!run || run.done) return;
    if (id && !stillPlaying(id)) id = nextAfter(id);
    run.current = id;
    clearInterval(run.timer);
    renderScoreboard();
    if (!id) { checkMatchEnd(); return; }
    if (id !== rooms.selfId) {
      if (!run.spectating) matchReel.idle(t("turnOf")(memberName(id)));
      renderMatchActions();
      return;
    }
    // My turn: maybe nothing fits anymore, then I'm done.
    if (!matchCandidates().length) { markDone(); return; }
    sfx("whoosh");
    toast(t("yourTurn"));
    matchReel.idle(t("yourTurn"));
    run.deadline = Date.now() + TURN_MS;
    run.timer = setInterval(() => {
      if (match !== run || !myTurn()) { clearInterval(run.timer); return; }
      const left = Math.ceil((run.deadline - Date.now()) / 1000);
      const clock = $("#turnClock");
      if (clock) clock.textContent = t("autoIn")(Math.max(0, left));
      if (left <= 0) { clearInterval(run.timer); autoPlay(); }
    }, 500);
    renderMatchActions();
  }

  // Out of time: roll if needed, then take the place worth the most points.
  async function autoPlay() {
    const run = match;
    if (!myTurn() || run.rolling || run.placing) return;
    if (!run.rolled) await matchRoll(false);
    if (match !== run || !run.rolled) return;
    const board = myBoard();
    let best = -1;
    board.forEach((slot, i) => {
      if (slot.char || slot.locked || !slot.def.fits(run.rolled)) return;
      if (best < 0 || pointsFor(slot, run.rolled) > pointsFor(board[best], run.rolled)) best = i;
    });
    if (best >= 0) matchPlace(best);
    else matchRoll(false, true);
  }

  // Another player's roll and placement play out in my reel, one after the other.
  function spectate(task) {
    const run = match;
    // A tab in the background pauses animations: never let one of them hold the turns for more than a few seconds.
    run.show = run.show.then(() => (match === run ? Promise.race([task(), wait(document.hidden ? 300 : 7000)]) : null)).catch(() => {});
    return run.show;
  }

  // ── Keeping everyone on the same turn ──
  // Every few seconds each player tells the room what they see: their board, whose turn it is and how many
  // placements they know of. A player who missed something fills it in and takes the turn of whoever saw the most;
  // on a tie, the host's view wins. A lost message or a stuck tab can't leave the room waiting on the wrong player.
  function startBeat(run) {
    clearInterval(run.beat);
    run.beat = setInterval(() => {
      if (match !== run || run.done) { clearInterval(run.beat); return; }
      rooms.broadcast("beat", { key: run.key, current: run.current, moves: movesSeen(), board: myPairs(), finished: run.finished.has(rooms.selfId) });
    }, 4000);
  }

  function onBeat(d, from) {
    const run = match;
    if (run.done || run.starting || String(d.key) !== run.key) return;
    const before = movesSeen();
    if (Array.isArray(d.board)) fillBoard(from, d.board);
    if (d.finished === true && !run.finished.has(from)) {
      for (const id of teammates(from)) run.finished.add(id);
      renderScoreboard();
      checkMatchEnd();
      if (run.done) return;
    }
    const theirs = Number(d.moves) || 0;
    const current = typeof d.current === "string" && run.ids.includes(d.current) ? d.current : null;
    if (!current || current === run.current) return;
    // Mid-turn (a roll spinning, a portrait flying) the views differ for a moment: don't fight over it.
    if (run.rolling || run.placing || run.spectating || (myTurn() && run.rolled)) return;
    const fromHost = from === run.room.host || from === rooms.myRoom?.host;
    if (theirs > before || (theirs === before && fromHost)) setTurn(current);
  }

  function vsSplash(a, b) {
    const s = el("div", "vs-splash");
    s.append(el("span", "vs-name vs-left", a), el("span", "vs-mark", t("vs")), el("span", "vs-name vs-right", b));
    document.body.append(s);
    return wait(2200)
      .then(() => { s.classList.add("is-out"); return wait(350); })
      .then(() => s.remove());
  }

  const myBoard = () => boardOf(rooms.selfId);

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
    const free = match.pool.filter((c) => !taken.has(c.id) && c.id !== exclude && fitsIn(board, c));
    if (free.length) return free;
    // The others hold every character left for my places (e.g. the only god at this arc):
    // share them rather than leave a place that can never be filled. Never twice on my board.
    const mine = new Set(filledOf(board).map((x) => x.char.id));
    const shared = match.pool.filter((c) => !mine.has(c.id) && c.id !== exclude && fitsIn(board, c));
    shared.shared = true; // nobody "steals" a shared character
    return shared;
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
    if (!run || run.rolling || run.placing || run.done || run.starting || run.finished.has(rooms.selfId) || !myTurn()) return;
    let list = matchCandidates(run.rolled?.id);
    if (!list.length && run.rolled) list = matchCandidates();
    if (!list.length) return markDone();
    if (isReroll && !free) run.rerolls--;
    window.DLE_Profile?.count(isReroll && !free ? "rerolls" : "rolls");
    const pick = draw(list, myBoard());
    run.claims.set(rooms.selfId, pick.id);
    rooms.broadcast("claim", { charId: pick.id });
    run.rolling = true;
    run.rolled = null;
    renderMatchActions();
    renderBoard($("#duelMine"), myBoard());
    await matchReel.spin(list, pick, { game: match.g.id, arc: match.arc });
    if (match !== run || run.done) return;
    run.rolledShared = !!list.shared;
    const winner = !list.shared && lostClaim(pick);
    if (winner) return onStolen(winner);
    run.rolling = false;
    // Safety net: taken meanwhile, or no slot left for it: redraw for free.
    if (!fitsIn(myBoard(), pick) || filledOf(myBoard()).some((x) => x.char.id === pick.id) || (!list.shared && !matchCandidates().some((x) => x.id === pick.id))) {
      run.claims.delete(rooms.selfId);
      return matchRoll(false, true);
    }
    run.rolled = pick;
    const fresh = window.DLE_Profile?.collect(run.g.id, pick.id);
    matchReel.hint(fresh ? `${t("newCard")} ${t("chooseSlot")}` : t("chooseSlot"));
    renderBoard($("#duelMine"), myBoard(), { rolled: pick, onPlace: matchPlace });
    renderMatchActions();
  }

  async function matchPlace(i) {
    const run = match;
    const c = run?.rolled;
    if (!c) return;
    run.rolled = null;
    run.placing = true;
    matchReel.hint("");
    renderMatchActions();
    const target = slotFace($("#duelMine"), i);
    renderBoard($("#duelMine"), myBoard());
    await fly(matchReel.window, target, c.formImage || c.image);
    run.placing = false;
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
    else setTurn(nextAfter(rooms.selfId));
  }

  // "I'm done" with my whole board. A lost message would leave the others waiting forever, so it is
  // sent again every few seconds for a minute (even after the ranking); receiving it twice is harmless.
  function markDone() {
    if (!match || match.finished.has(rooms.selfId)) return;
    const run = match;
    for (const id of teammates(rooms.selfId)) run.finished.add(id);
    const sendDone = () => rooms.broadcast("done", { key: run.key, board: myBoard().map((s, i) => (s.char ? [i, s.char.id] : null)).filter(Boolean) });
    sendDone();
    let left = 20;
    const timer = setInterval(() => { if (match !== run || --left <= 0) clearInterval(timer); else sendDone(); }, 3000);
    matchReel.idle(t("waitOthers"));
    clearInterval(run.timer);
    if (run.current === rooms.selfId) setTurn(nextAfter(rooms.selfId));
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
    if (!myTurn()) {
      const w = el("p", "lobby-waiting");
      w.append(el("span", "spinner"), match.current ? t("turnOf")(memberName(match.current)) : t("waitOthers"));
      box.append(w);
      return;
    }
    const clock = el("p", "turn-clock", t("autoIn")(Math.max(0, Math.ceil((match.deadline - Date.now()) / 1000))));
    clock.id = "turnClock";
    box.append(clock);
    if (!match.rolled) {
      const b = el("button", "btn-primary roll-btn", match.rolling ? t("rolling") : t("roll"));
      b.prepend(icon("dice"));
      b.type = "button";
      b.disabled = match.rolling || match.placing;
      b.addEventListener("click", () => matchRoll(false));
      box.append(b);
    } else {
      const stuck = !fitsIn(myBoard(), match.rolled);
      const b = el("button", "btn-ghost", stuck ? t("skip") : t("reroll")(match.rerolls));
      b.type = "button";
      b.disabled = !stuck && match.rerolls <= 0;
      b.addEventListener("click", () => matchRoll(!stuck, stuck));
      box.append(b);
    }
  }

  // Places filled on any board: tells who has seen the most of the match.
  const movesSeen = () => [...match.boards.values()].reduce((a, b) => a + filledOf(b).length, 0);
  // Fill in placements of a player that I missed (lost message, link dropped for a moment).
  function fillBoard(from, pairs) {
    const board = boardOf(from);
    let changed = false;
    for (const pair of pairs.slice(0, board.length)) {
      const [i, charId] = Array.isArray(pair) ? pair : [];
      const slot = board[i];
      const c = match.pool.find((x) => x.id === charId);
      if (c && slot && !slot.char && !slot.locked && slot.def.fits(c) && !board.some((s) => s.char?.id === c.id)) {
        slot.char = c;
        slot.points = pointsFor(slot, c);
        changed = true;
      }
    }
    if (changed) {
      const { box, mini } = boardBox(boardKey(from));
      if (box) renderBoard(box, board, { mini });
    }
  }
  const myPairs = () => myBoard().map((s, i) => (s.char ? [i, s.char.id] : null)).filter(Boolean);

  function onMatchMessage(type, d, from) {
    // Coming back after a reload: the first full state that answers my request rebuilds the match.
    if (type === "state") {
      if (resume && !match && d && (resume.key == null || String(d.key) === resume.key)) resumeMatch(d);
      return;
    }
    if (type === "renamed") { renameInMatch(String(d.old ?? ""), String(d.now ?? "")); return; }
    if (!match || !match.ids.includes(from)) return;
    if (type === "beat") { onBeat(d, from); return; }
    if (type === "joined") { addLatePlayer(d); return; }
    if (type === "want") {
      // A late joiner doesn't know the key yet.
      if (d.key == null || String(d.key) === match.key) rooms.broadcast("state", matchState());
      return;
    }
    if (type === "rejoin") {
      // Their link dropped for a moment: send them my board and whose turn it is.
      rooms.broadcast("sync", { key: match.key, board: myPairs(), current: match.current, moves: movesSeen(), finished: match.finished.has(rooms.selfId) });
      return;
    }
    if (type === "sync") {
      if (d.key != null && String(d.key) !== match.key) return;
      const before = movesSeen();
      if (Array.isArray(d.board) && !match.done) fillBoard(from, d.board);
      if (d.finished === true && !match.finished.has(from)) match.finished.add(from);
      // They saw more of the match than I did: trust their idea of whose turn it is.
      if (Number(d.moves) > before && match.ids.includes(d.current) && !match.done) setTurn(d.current);
      renderScoreboard();
      checkMatchEnd();
      return;
    }
    if (type === "claim") {
      if (typeof d.charId !== "string") return;
      match.claims.set(from, d.charId);
      // They rolled the character I'm holding at the same moment and they win the tie.
      const mine = match.rolled ?? null;
      if (mine && !match.rolledShared && mine.id === d.charId && from < rooms.selfId) onStolen(from);
      // Their roll spins in my reel too.
      const c = match.pool.find((x) => x.id === d.charId);
      if (c && from === match.current && !myTurn()) {
        const run = match;
        spectate(async () => {
          run.spectating = true;
          const board = boardOf(from);
          const list = run.pool.filter((x) => fitsIn(board, x));
          await matchReel.spin(list.length ? list : [c], c, { game: run.g.id, arc: run.arc });
          if (match === run) matchReel.hint(t("turnOf")(memberName(from)));
        });
      }
      return;
    }
    if (type === "place") {
      match.claims.delete(from);
      const c = match.pool.find((x) => x.id === d.charId);
      const board = boardOf(from);
      const i = Number(d.slot);
      const slot = board[i];
      if (c && slot && !slot.char && !slot.locked && slot.def.fits(c) && !board.some((s) => s.char?.id === c.id)) {
        // Reserve the place now (so a late "done" doesn't fill it twice), show it after their roll.
        slot.char = c;
        slot.points = pointsFor(slot, c);
        slot.pending = true;
        const run = match;
        spectate(async () => {
          const { box, mini } = boardBox(boardKey(from));
          if (box) {
            await fly(matchReel.window, slotFace(box, i) || box, c.formImage || c.image);
          }
          slot.pending = false;
          run.spectating = false;
          if (match !== run) return;
          if (box) { renderBoard(box, board, { mini }); popSlot(box, i, slot.points); }
          renderScoreboard();
          if (!myTurn()) matchReel.idle(run.current ? t("turnOf")(memberName(run.current)) : t("waitOthers"));
        });
      }
      // Their turn is over; the next one starts once their placement has been shown.
      if (match.current === from) {
        const next = nextAfter(from);
        match.current = next;
        spectate(() => { if (match.current === next) setTurn(next); });
      }
    } else if (type === "done") {
      if (d.key != null && String(d.key) !== match.key) return;
      if (match.finished.has(from)) return;
      match.claims.delete(from);
      // Fill in any placement whose message was lost.
      const board = boardOf(from);
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
        const { box, mini } = boardBox(boardKey(from));
        if (box) renderBoard(box, board, { mini });
      }
      // A shared board is done for the whole team.
      for (const id of teammates(from)) match.finished.add(id);
      if (match.current === from) setTurn(nextAfter(from));
      renderScoreboard();
      checkMatchEnd();
    } else if (type === "left") {
      match.active.delete(from);
      if (match.current === from) setTurn(nextAfter(from));
      renderScoreboard();
      checkMatchEnd();
    }
  }

  function addLatePlayer(d) {
    const m = match;
    const id = typeof d?.id === "string" ? d.id : null;
    if (!m || m.done || !id || m.ids.includes(id)) return;
    m.ids.push(id);
    m.order.push(id);
    m.names.set(id, cleanName(d.name) || "Player");
    m.active.add(id);
    if (m.teams) m.teams[id] = d.team === 1 ? 1 : 0;
    if (!m.boards.has(boardKey(id))) m.boards.set(boardKey(id), makeSlots(m.g, m.pool));
    toast(t("lateJoined")(m.names.get(id)));
    // Redraw once nothing is moving on screen.
    spectate(async () => { if (match === m && !m.rolling && !m.placing) { renderMatch(); renderMatchActions(); } });
  }

  // ── Back after a reload ──
  // The whole match as I see it, for a player who reloaded their page.
  const pairsOf = (board) => board.map((x, i) => (x.char ? [i, x.char.id] : null)).filter(Boolean);
  function matchState() {
    const m = match;
    return {
      key: m.key, arc: m.arc, ids: m.ids, order: m.order, teams: m.teams, current: m.current,
      finished: [...m.finished], active: [...m.active], done: m.done,
      boards: Object.fromEntries([...m.boards].map(([k, b]) => [k, pairsOf(b)])),
    };
  }

  // A player came back with a new id (or I did, as seen by the others): swap it everywhere in the match.
  function renameInMatch(old, now) {
    const m = match;
    if (!m || !old || !now || old === now || !m.ids.includes(old)) return;
    const sw = (id) => (id === old ? now : id);
    m.ids = m.ids.map(sw);
    m.order = m.order.map(sw);
    for (const map of [m.names, m.claims, m.shown, m.boards]) if (map?.has(old)) { map.set(now, map.get(old)); map.delete(old); }
    for (const set of [m.active, m.finished]) if (set.has(old)) { set.delete(old); set.add(now); }
    if (m.teams && old in m.teams) { m.teams[now] = m.teams[old]; delete m.teams[old]; }
    if (m.current === old) m.current = now;
    if (rooms.myRoom) m.room = rooms.myRoom;
    const box = document.querySelector(`[data-board="${CSS.escape(old)}"]`);
    if (box) box.dataset.board = now;
    renderScoreboard();
    renderMatchActions();
  }

  // Back in the room after a reload: ask the others for the match, again until one answers.
  let resume = null;
  function askResume(room, data) {
    if (!data || match) return;
    if (mode !== "online") setMode("online");
    const key = data.key == null ? null : String(data.key);
    resume = { room, data, key };
    renderLobby();
    let n = 0;
    const ask = () => {
      if (!resume || match || resume.key !== key) return;
      if (++n > 15) { resume = null; toast(t("rejoinFailed")); rooms.leave(); renderLobby(); return; }
      rooms.broadcast("want", { key: resume.key });
      setTimeout(ask, 2000);
    };
    ask();
  }

  async function resumeMatch(st) {
    const { room } = resume;
    const g = GAMES.find((x) => x.id === room.game);
    if (!g || !Array.isArray(st.ids) || !st.ids.includes(rooms.selfId)) return;
    resume.loading = true;
    if (currentGame.id !== g.id) await selectGame(g.id, { quiet: true });
    const gameData = await loadGame(g);
    if (!resume || match) return;
    const arc = Math.min(Number.isInteger(st.arc) ? st.arc : 0, gameData.config.arcs.length - 1);
    const pool = makePool(g, gameData, arc);
    const ids = st.ids.map(String);
    const teams = st.teams && typeof st.teams === "object" ? Object.fromEntries(ids.map((id) => [id, st.teams[id] === 1 ? 1 : 0])) : null;
    const boards = new Map();
    for (const [k, pairs] of Object.entries(st.boards ?? {})) {
      const board = makeSlots(g, pool);
      for (const pair of Array.isArray(pairs) ? pairs.slice(0, board.length) : []) {
        const [i, charId] = Array.isArray(pair) ? pair : [];
        const slot = board[i];
        const c = pool.find((x) => x.id === charId);
        if (c && slot && !slot.char && !slot.locked && slot.def.fits(c)) { slot.char = c; slot.points = pointsFor(slot, c); }
      }
      boards.set(String(k), board);
    }
    let rerolls = REROLLS;
    try {
      const saved = JSON.parse(sessionStorage.getItem("dle:crew-rerolls") || "null");
      if (saved?.key === st.key && Number.isInteger(saved.rerolls)) rerolls = Math.max(0, Math.min(REROLLS, saved.rerolls));
    } catch {}
    const names = new Map((rooms.myRoom ?? room).members.map((m) => [m.id, m.id === rooms.selfId ? myName() || t("you") : m.name]));
    match = {
      room: rooms.myRoom ?? room, g, pool, ids, arc, config: gameData.config, names, boards,
      active: new Set((st.active ?? ids).map(String)),
      finished: new Set((st.finished ?? []).map(String)),
      claims: new Map(),
      rolled: null, rerolls, rolling: false, done: false, starting: false,
      key: String(st.key), order: (st.order ?? ids).map(String), current: null, show: Promise.resolve(), teams,
    };
    resume = null;
    rooms.keepSeat = true;
    renderPicker();
    renderMatch();
    toast(t("rejoined"));
    if (st.done) { finishMatch(); return; }
    setTurn(ids.includes(st.current) ? st.current : match.order.find((id) => match.active.has(id) && !match.finished.has(id)) ?? null);
    startBeat(match);
    checkMatchEnd();
  }

  // My rerolls left, kept in the tab for a reload.
  window.addEventListener("pagehide", () => {
    if (!match || match.done) return;
    try { sessionStorage.setItem("dle:crew-rerolls", JSON.stringify({ key: match.key, rerolls: match.rerolls })); } catch {}
  });

  const scores = () => match.ids.map((id) => ({ id, name: memberName(id), score: duelScore(boardOf(id)), left: !match.active.has(id) }))
    .sort((a, b) => b.score - a.score);

  function teamScores(live = false) {
    // Each team scores its own board.
    return [0, 1].map((k) => {
      const board = match.boards.get(`team-${k}`);
      if (!board) return 0;
      return duelScore(live ? board.map((x) => (x.pending ? { ...x, char: null, points: 0 } : x)) : board);
    });
  }

  function finishMatch() {
    if (!match || match.done) return;
    match.done = true;
    match.current = null;
    clearInterval(match.timer);
    rooms.clearRejoin();
    renderScoreboard();
    const mine = myBoard();
    renderBoard($("#duelMine"), mine);
    const ranking = scores();
    // Equal scores share a place.
    const myScore = duelScore(myBoard());
    const place = 1 + ranking.filter((r) => r.score > myScore + 1e-9).length;
    const tiedTop = place === 1 && ranking.filter((r) => Math.abs(r.score - myScore) < 1e-9).length > 1;
    const panel = $("#duelPanel");
    panel.textContent = "";
    let kind = tiedTop ? "draw" : place === 1 ? "win" : place === ranking.length ? "lose" : "draw";
    let text = tiedTop ? t("tie") : t("youPlace")(place);
    // Team vs team: my team's average decides.
    if (match.teams) {
      const sc = teamScores();
      const mineK = match.teams[rooms.selfId] ?? 0;
      const draw = Math.abs(sc[0] - sc[1]) < 1e-9;
      kind = draw ? "draw" : sc[mineK] > sc[1 - mineK] ? "win" : "lose";
      text = draw ? t("teamDraw") : t("teamWins")(rooms.teamNames()[sc[0] > sc[1] ? 0 : 1]);
      // The team leaderboard: only teams the host named (the default red / blue are everyone's).
      const chosen = rooms.myRoom?.meta?.names?.[mineK] || match.room?.meta?.names?.[mineK];
      if (chosen) window.DLE_Profile?.recordTeam?.({ name: chosen, won: kind === "win", score: sc[mineK] });
    }
    window.DLE_Profile?.recordDuel(kind === "win");
    const actions = [[t("leave"), "btn-ghost", leaveMatch]];
    if (!match.closedByHost) actions.push([t("backRoom"), "btn-primary", backToRoom]);
    panel.append(resultBlock(duelScore(mine), mine, { title: t("finalRanking"), outcome: { kind, text }, actions }));
    const list = el("ol", "ranking");
    for (const r of ranking) {
      const li = el("li", `${r.id === rooms.selfId ? "is-me" : ""}${match.teams ? ` team-${match.teams[r.id] ?? 0}` : ""}`);
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
    // Team vs team: the two team averages, live.
    if (match.teams) {
      const sc = teamScores(true);
      const names = rooms.teamNames();
      const bar = el("div", "team-bar crew-team-bar");
      for (const k of [0, 1]) {
        const side = el("div", `team-side team-${k}${match.done && sc[k] > sc[1 - k] + 1e-9 ? " is-winner" : ""}`);
        side.append(el("span", "team-side-name", names[k]), el("b", "team-side-pts", sc[k].toFixed(1)));
        bar.append(side);
        if (k === 0) bar.append(el("span", "team-vs", "VS"));
      }
      box.append(bar);
    }
    for (const id of match.ids) {
      const chip = el("div", `score-chip${id === rooms.selfId ? " is-me" : ""}${match.active.has(id) ? "" : " has-left"}${id === match.current && !match.done ? " is-turn" : ""}${match.teams ? ` team-${match.teams[id] ?? 0}` : ""}`);
      const dot = el("span", `duel-state${match.finished.has(id) ? " is-done" : ""}`);
      const score = el("b", "duel-score");
      // Scores animate from the value shown last time.
      score.dataset.value = match.shown?.get(id) ?? 0;
      chip.append(dot, el("span", "duel-pname", memberName(id)), score);
      box.append(chip);
      const value = duelScore(boardOf(id).map((x) => (x.pending ? { ...x, char: null, points: 0 } : x)));
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
    // Two boards (1v1, or team vs team): side by side, the reel between them. More: theirs below mine.
    const duo = match.boards.size === 2;
    grid.classList.toggle("is-1v1", duo);
    if (duo) {
      const wrap = el("div", "duel-mine");
      wrap.append(el("p", "duel-label is-me", match.teams ? boardLabel(boardKey(rooms.selfId)) : memberName(rooms.selfId)), mine);
      grid.append(wrap, panel);
    } else grid.append(mine, panel);

    const others = el("div", "others");
    for (const key of match.boards.keys()) {
      if (key === boardKey(rooms.selfId)) continue;
      const wrap = el("div", "duel-theirs");
      wrap.append(el("p", "duel-label", boardLabel(key)));
      const b = el("div", "crew-board");
      b.dataset.board = key;
      wrap.append(b);
      (duo ? grid : others).append(wrap);
      renderBoard(b, match.boards.get(key), { mini: true, stagger: true });
    }
    view.append(head, grid);
    if (!duo) view.append(others);
    renderBoard(mine, myBoard(), { stagger: true });
    renderScoreboard();
  }

  function toast(text) {
    const node = $("#toast");
    node.textContent = text;
    node.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => (node.hidden = true), 2200);
  }

  // ════════════════════ INDEX ════════════════════
  // Every card of the anime at the player's arc: its rarity, its power and what it scores in each role.
  const ix = { tier: "all", sort: "power", q: "", own: "all" };
  let ixToken = 0;

  async function renderIndex() {
    const g = currentGame;
    const token = ++ixToken;
    const data = await loadGame(g);
    if (token !== ixToken || mode !== "index") return;
    const last = data.config.arcs.length - 1;
    const arc = playerArc(data.config) ?? last;
    const roles = CREW[g.id].slots;
    const cards = makePool(g, data, arc).map((c) => {
      const scores = roles.map((def) => (def.fits(c) ? pointsFor({ def }, c) : null));
      const top = Math.max(...scores.filter((x) => x != null));
      return { c, tier: tierOf(c.power), scores, best: scores.indexOf(top), form: formFor(g.id, c, arc) };
    });

    const view = $("#indexView");
    view.textContent = "";

    // Header: the anime, the cards by rarity, and the anime's best crews.
    const hero = el("section", "card ix-hero");
    const head = el("div", "ix-head");
    const logo = el("img", "ix-logo");
    logo.src = ROOT + g.logo;
    logo.alt = "";
    const titles = el("div", "ix-titles");
    titles.append(el("h2", "ix-title", t("indexTitle")(g.anime)), el("p", "muted ix-sub", t("indexSub")(cards.length, arc < last ? data.config.arcs[arc][lang] : null)));
    head.append(logo, titles);
    const tiers = el("div", "ix-tiers");
    for (const tr of ["all", "legend", "epic", "common"]) {
      const n = tr === "all" ? cards.length : cards.filter((x) => x.tier === tr).length;
      const b = el("button", `ix-tier-pill tier-${tr}${ix.tier === tr ? " is-active" : ""}`);
      b.type = "button";
      b.append(el("span", null, tr === "all" ? t("allTiers") : t("tiers")[tr]), el("b", null, String(n)));
      b.addEventListener("click", () => { ix.tier = tr; tiers.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b)); drawGrid(); });
      tiers.append(b);
    }
    // Collection: the cards this player has drawn.
    const owned = window.DLE_Profile?.collectionOf?.(g.id) ?? new Set();
    const have = cards.filter((x) => owned.has(x.c.id)).length;
    const coll = el("div", "ix-coll");
    const collBar = el("span", "ix-coll-bar");
    const collFill = el("i");
    collFill.style.width = `${(have / Math.max(1, cards.length)) * 100}%`;
    collBar.append(collFill);
    coll.append(el("b", null, t("collection")(have, cards.length)), collBar);
    const own = el("div", "ix-own");
    for (const k of ["all", "yes", "no"]) {
      const b = el("button", `ix-own-btn${ix.own === k ? " is-active" : ""}`, t(k === "all" ? "ownAll" : k === "yes" ? "ownYes" : "ownNo"));
      b.type = "button";
      b.addEventListener("click", () => { ix.own = k; own.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b)); drawGrid(); });
      own.append(b);
    }
    coll.append(own);
    const left = el("div", "ix-hero-main");
    left.append(head, tiers, coll);
    hero.append(left, ixTopCrews(g, token));
    view.append(hero);

    // Tools: search and sort (by power, by name or by a role).
    const tools = el("div", "card ix-tools");
    const search = el("input", "ix-search");
    search.type = "search";
    search.placeholder = t("indexSearch");
    search.value = ix.q;
    search.addEventListener("input", () => { ix.q = search.value; drawGrid(); });
    const sorts = el("div", "ix-sorts");
    sorts.append(el("span", "crew-setting-label", t("indexSort")));
    const sortBtn = (key, content, title, def) => {
      const b = el("button", `ix-sort${ix.sort === key ? " is-active" : ""}`);
      b.type = "button";
      b.title = title;
      b.dataset.sort = key;
      if (def) setRoleColor(b, def);
      b.append(content);
      b.addEventListener("click", () => { ix.sort = key; sorts.querySelectorAll(".ix-sort").forEach((x) => x.classList.toggle("is-active", x === b)); drawGrid(); });
      sorts.append(b);
    };
    sortBtn("power", t("sortPower"), t("sortPower"));
    sortBtn("name", t("sortName"), t("sortName"));
    roles.forEach((def, i) => {
      const content = el("span", "ix-sort-role");
      content.append(icon(def.icon), el("span", null, def.label[lang]));
      sortBtn(`role${i}`, content, def.label[lang], def);
    });
    if (!/^(power|name)$/.test(ix.sort) && !roles[+ix.sort.slice(4)]) ix.sort = "power";
    tools.append(search, sorts);
    view.append(tools);

    const grid = el("div", "ix-grid");
    view.append(grid);

    function drawGrid() {
      const q = ix.q.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const r = ix.sort.startsWith("role") ? +ix.sort.slice(4) : -1;
      const list = cards
        .filter((x) => ix.tier === "all" || x.tier === ix.tier)
        .filter((x) => ix.own === "all" || owned.has(x.c.id) === (ix.own === "yes"))
        .filter((x) => !q || `${x.c.name} ${x.c.baseName}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q))
        .sort((a, b) => (ix.sort === "name" ? a.c.name.localeCompare(b.c.name)
          : r >= 0 ? (b.scores[r] ?? -1) - (a.scores[r] ?? -1) || b.c.power - a.c.power || a.c.name.localeCompare(b.c.name)
          : b.c.power - a.c.power || a.c.name.localeCompare(b.c.name)));
      grid.textContent = "";
      if (!list.length) { grid.append(el("p", "muted ix-empty", t("noCard"))); return; }
      list.forEach((x, n) => grid.append(ixCard(x, roles, r, n, owned.has(x.c.id))));
    }
    drawGrid();
  }

  function setRoleColor(node, def) {
    const rgb = ROLE_RGB[def.icon];
    if (rgb) { node.style.setProperty("--role-rgb", rgb[0]); node.style.setProperty("--role2-rgb", rgb[1]); }
  }

  function ixCard({ c, tier, scores, best, form }, roles, sorted, n, mine = true) {
    const card = el("article", `ix-card tier-${tier}${mine ? "" : " is-locked"}`);
    if (n < 40) card.style.animationDelay = `${n * 18}ms`;
    const top = el("div", "ix-top");
    const img = el("img", "ix-face");
    img.loading = "lazy";
    img.decoding = "async";
    img.src = c.image;
    img.alt = "";
    top.append(img, el("span", "ix-tier", t("tiers")[tier]), el("span", "ix-power", String(c.power)));
    if (!mine) top.append(el("span", "ix-lock", `🔒 ${t("notDrawn")}`));
    // A transformation: tap the portrait to see it.
    if (form) {
      const tag = el("button", "ix-form", `⚡ ${form.name[lang]}`);
      tag.type = "button";
      tag.title = t("ixTap");
      tag.style.setProperty("--fx1", form.c1);
      tag.style.setProperty("--fx2", form.c2);
      tag.addEventListener("click", () => {
        const on = card.classList.toggle("is-form");
        img.src = on ? form.image : c.image;
      });
      top.append(tag);
    }
    card.append(top, el("h3", "ix-name", c.name));
    const list = el("ul", "ix-roles");
    roles.forEach((def, i) => {
      const v = scores[i];
      const li = el("li", `ix-role${v == null ? " is-no" : ""}${i === best ? " is-best" : ""}${i === sorted ? " is-sorted" : ""}`);
      setRoleColor(li, def);
      li.title = v == null ? `${def.label[lang]} · ${t("noFit")}` : `${def.label[lang]} · ${v}${i === best ? ` · ${t("bestRole")}` : ""}`;
      const ic = el("span", "ix-ic");
      ic.append(icon(def.icon));
      const bar = el("span", "ix-bar");
      const fill = el("i");
      fill.style.width = `${v == null ? 0 : Math.min(100, v * 10)}%`;
      bar.append(fill);
      li.append(ic, el("span", "ix-label", def.label[lang]), bar, el("b", `ix-pts${v == null ? "" : ` p${Math.min(10, Math.round(v))}`}`, v == null ? "–" : String(v)));
      list.append(li);
    });
    card.append(list);
    return card;
  }

  // The anime's best crews from the online leaderboard.
  function ixTopCrews(g, token) {
    const box = el("div", "ix-top-crews");
    box.append(el("h3", "ix-top-h", t("ixTop")));
    const list = el("ol", "ix-top-list");
    list.append(el("li", "muted ix-top-wait", "…"));
    box.append(list);
    const more = el("button", "btn-ghost ix-top-more", t("ixBoard"));
    more.type = "button";
    more.addEventListener("click", () => window.DLE_Profile?.open("board", { anime: g.id }));
    box.append(more);
    const profile = window.DLE_Profile;
    if (!profile?.leaderboard) { box.hidden = true; return box; }
    profile.leaderboard().then((data) => {
      if (token !== ixToken) return;
      const rows = (data.byAnime?.[g.id] ?? []).slice(0, 5);
      list.textContent = "";
      if (!rows.length) { list.append(el("li", "muted ix-top-wait", t("ixNone"))); return; }
      rows.forEach((r, i) => {
        const li = el("li", `ix-top-li top-${i + 1}`);
        const who = el("span", "ix-top-who");
        who.append(el("b", null, r.name));
        const faces = profile.crewFaces(r);
        if (faces) who.append(faces);
        const val = el("span", "pf-val");
        val.append(el("i", `pf-mini-rank rank-${r.rank}`, r.rank), ` ${r.score.toFixed(1)}`);
        li.append(el("span", "ix-top-pos", String(i + 1)), who, val);
        list.append(li);
      });
    }).catch(() => { box.hidden = true; });
    return box;
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
    $("#indexView").hidden = m !== "index";
    if (m === "online") { ensureRooms(); if (match) renderMatch(); else renderLobby(); }
    else {
      if (rooms?.myRoom && !match) rooms.leave();
      if (m === "solo" && currentGame && !solo) startSolo();
      if (m === "index" && currentGame) renderIndex();
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
    const sunny = el("img");
    sunny.src = `${ROOT}assets/logos/sunny.webp`;
    sunny.alt = "";
    $("#crewBrandIcon").replaceChildren(sunny);
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
    if (mode === "index") renderIndex();
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

  // ── Admin panel hooks (shared/admin.js) ──
  const soloIdle = () => mode === "solo" && solo && !solo.rolling && !solo.placing;
  window.CREW_ADMIN = {
    get game() { return currentGame; },
    get solo() { return mode === "solo" ? solo : null; },
    forms: () => Object.keys(window.CREW_FORMS?.[currentGame?.id] ?? {}),
    roll(id) {
      if (!soloIdle() || solo.done) return false;
      const pick = solo.pool.find((c) => c.id === id);
      if (!pick || filledOf(solo.slots).some((s) => s.char.id === id)) return false;
      soloRoll(false, pick);
      return true;
    },
    rerolls(n = 99) { if (!soloIdle()) return; solo.rerolls += n; renderSoloActions(); },
    // Fills every open place: with the best character for it, or at random.
    fill(best = true) {
      if (!soloIdle() || solo.done) return;
      solo.rolled = null;
      for (const slot of openSlots(solo.slots)) {
        const used = new Set(filledOf(solo.slots).map((s) => s.char.id));
        const fits = solo.pool.filter((c) => !used.has(c.id) && slot.def.fits(c));
        if (!fits.length) continue;
        const c = best ? fits.reduce((a, b) => (pointsFor(slot, b) > pointsFor(slot, a) ? b : a)) : fits[Math.floor(Math.random() * fits.length)];
        slot.char = c;
        slot.points = pointsFor(slot, c);
      }
      if (!openSlots(solo.slots).length || !soloCandidates().length) solo.done = true;
      renderSolo(false);
    },
    finish() { if (soloIdle() && !solo.done) { solo.rolled = null; solo.done = true; renderSolo(false); } },
    restart() { if (currentGame && mode === "solo") startSolo(); },
    // A transformation cinematic on its own, whatever the player's arc (`late`: the later look, when there is one).
    async cinema(id, late = false) {
      const g = currentGame;
      const f = window.CREW_FORMS?.[g?.id]?.[id];
      if (!f) return;
      const data = await loadGame(g);
      const c = makePool(g, data, data.config.arcs.length - 1).find((x) => x.id === id);
      const form = c && formFor(g.id, c, late && f.next ? f.next.arc : f.arc);
      if (form) await window.CREW_CINEMA?.play({ form, char: c, sub: subtitleOf(c) });
    },
  };

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
  let backToMatch = false;
  try { backToMatch = !!sessionStorage.getItem("dle:rejoin:crew"); } catch {}
  mode = location.hash === "#online" || joinHash || backToMatch ? "online" : location.hash === "#index" ? "index" : "solo";
  setMode(mode);
  selectGame(currentGame.id);
})();
