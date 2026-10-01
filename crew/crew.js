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
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const T = {
    en: {
      title: "Crew Roll",
      sub: "Roll random characters and build the strongest crew. Every placement counts.",
      solo: "Solo",
      online: "Online",
      pick: "Pick an anime",
      roll: "Roll",
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
      locked: "Not available yet at your arc",
      empty: "Empty",
      lobbyTitle: "Lobby",
      lobbyHelp: "Create a room for 2 to 8 players, or join an open one. Everyone gets the same characters each round, with no rerolls.",
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
      connecting: "Connecting to the lobby…",
      offline: "Online play is unavailable right now.",
      you: "you",
      round: (a, b) => `Round ${a}/${b}`,
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
      pick: "Choisis un anime",
      roll: "Lancer",
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
      locked: "Pas encore disponible à ton arc",
      empty: "Libre",
      lobbyTitle: "Lobby",
      lobbyHelp: "Crée une salle de 2 à 8 joueurs, ou rejoins-en une. Tout le monde reçoit les mêmes persos à chaque manche, sans relance.",
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
      connecting: "Connexion au lobby…",
      offline: "Le jeu en ligne est indisponible pour l'instant.",
      you: "toi",
      round: (a, b) => `Manche ${a}/${b}`,
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
  const wait = (ms) => new Promise((r) => setTimeout(r, REDUCED ? 0 : ms));

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

  // ── Motion helpers ──
  function countUp(node, to, decimals = 1, ms = 650) {
    const from = Number(node.dataset.value || 0);
    node.dataset.value = to;
    if (REDUCED || from === to) { node.textContent = to.toFixed(decimals); return; }
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      node.textContent = (from + (to - from) * e).toFixed(decimals);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function burst(x, y) {
    if (REDUCED) return;
    const layer = el("div", "burst");
    layer.style.left = `${x}px`;
    layer.style.top = `${y}px`;
    for (let i = 0; i < 40; i++) {
      const p = el("i");
      const a = Math.random() * Math.PI * 2;
      const d = 90 + Math.random() * 220;
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

  // A portrait flies from the reel to the chosen slot along a short arc.
  function fly(fromEl, toEl, src) {
    if (REDUCED || !fromEl || !toEl || !fromEl.animate) return Promise.resolve();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const img = el("img", "flyer");
    img.src = src;
    img.alt = "";
    Object.assign(img.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` });
    document.body.append(img);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const s = b.width / a.width;
    const anim = img.animate(
      [
        { transform: "translate(0, 0) scale(1)" },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(${(1 + s) / 2 + 0.08})`, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(${s})` },
      ],
      { duration: 520, easing: "cubic-bezier(.4,.1,.2,1)" }
    );
    return anim.finished.then(() => img.remove(), () => img.remove());
  }

  // Slot-machine reel: a strip of portraits that decelerates onto the picked character.
  function makeReel() {
    const wrap = el("div", "reel");
    const win = el("div", "reel-window");
    const strip = el("div", "reel-strip");
    const q = el("span", "reel-q", "?");
    win.append(strip, q);
    const name = el("p", "reel-name");
    const power = el("div", "power");
    const powerLabel = el("span", "power-label");
    const track = el("span", "power-track");
    const fill = el("span", "power-fill");
    const value = el("b");
    track.append(fill);
    power.append(powerLabel, track, value);
    power.hidden = true;
    const hint = el("p", "reel-hint");
    wrap.append(win, name, power, hint);

    const reset = () => {
      strip.style.transition = "none";
      strip.style.transform = "translateY(0)";
    };
    const portrait = (c) => { const img = el("img"); img.src = c.image; img.alt = ""; return img; };

    const reel = {
      el: wrap,
      window: win,
      idle(text = "") {
        strip.textContent = "";
        reset();
        wrap.classList.remove("is-landed", "is-spinning");
        q.hidden = false;
        name.textContent = text;
        power.hidden = true;
        hint.textContent = "";
      },
      show(c) {
        strip.textContent = "";
        strip.append(portrait(c));
        reset();
        q.hidden = true;
        wrap.classList.add("is-landed");
        name.textContent = c.name;
        power.hidden = false;
        powerLabel.textContent = t("power");
        fill.style.width = "0%";
        requestAnimationFrame(() => requestAnimationFrame(() => (fill.style.width = `${c.power * 10}%`)));
        value.textContent = c.power;
      },
      async spin(list, pick) {
        wrap.classList.remove("is-landed");
        wrap.classList.add("is-spinning");
        q.hidden = true;
        power.hidden = true;
        hint.textContent = "";
        name.textContent = t("rolling");
        const n = REDUCED ? 0 : 18;
        strip.textContent = "";
        for (let i = 0; i < n; i++) strip.append(portrait(list[Math.floor(Math.random() * list.length)]));
        strip.append(portrait(pick));
        reset();
        if (n) {
          strip.getBoundingClientRect();
          strip.style.transition = "transform 1.9s cubic-bezier(.12,.75,.18,1)";
          strip.style.transform = `translateY(${-n * win.clientHeight}px)`;
          await new Promise((r) => setTimeout(r, 1950));
        }
        wrap.classList.remove("is-spinning");
        reel.show(pick);
      },
      hint(text) { hint.textContent = text; },
    };
    return reel;
  }

  // ── Board ──
  function renderBoard(container, slots, { rolled = null, onPlace = null, mini = false, stagger = false } = {}) {
    container.textContent = "";
    container.classList.toggle("is-mini", mini);
    slots.forEach((slot, i) => {
      const card = el("button", "crew-slot");
      card.type = "button";
      if (stagger && !REDUCED) { card.classList.add("enter"); card.style.animationDelay = `${i * 45}ms`; }
      const canPlace = !!(onPlace && rolled && !slot.char && !slot.locked && slot.def.fits(rolled));
      card.classList.toggle("is-filled", !!slot.char);
      card.classList.toggle("is-target", canPlace);
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
        face.textContent = slot.locked ? "–" : "?";
      }
      card.append(face);
      card.append(el("span", "crew-name", slot.char ? slot.char.name : slot.locked ? t("locked") : t("empty")));
      card.append(el("span", "crew-role", slotLabel(slot)));
      if (slot.char) card.append(el("span", `crew-points p${Math.min(10, Math.round(slot.points))}`, String(slot.points)));
      else if (canPlace) card.append(el("span", "crew-points is-preview", `+${pointsFor(slot, rolled)}`));
      card.setAttribute("aria-label", `${slotLabel(slot)}: ${slot.char ? `${slot.char.name}, ${slot.points}` : canPlace ? t("chooseSlot") : t("empty")}`);
      if (canPlace) card.addEventListener("click", () => onPlace(i));
      container.append(card);
    });
  }

  const slotFace = (container, i) => container.querySelector(`[data-index="${i}"] .crew-face`);
  function popSlot(container, i) {
    if (REDUCED) return;
    container.querySelector(`[data-index="${i}"]`)?.classList.add("pop");
  }

  // ── Shared UI ──
  let currentGame = null; // a DLE_GAMES entry
  let mode = "solo";

  function renderPicker() {
    const box = $("#animePicker");
    box.textContent = "";
    for (const g of GAMES) {
      const b = el("button", `anime-pick${currentGame?.id === g.id ? " is-active" : ""}`);
      b.type = "button";
      b.dataset.game = g.id;
      b.setAttribute("aria-pressed", currentGame?.id === g.id);
      // The anime can't change while waiting for or playing a match.
      b.disabled = mode === "online" && !!(match || rooms?.myRoom);
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
    $("#crewArc").textContent = arc == null ? t("spoilerAll") : t("spoiler")(data.config.arcs[arc][lang]);
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
    else { updateProfile(); renderLobby(); }
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
    popSlot($("#crewBoard"), i);
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
    $("#crewProgress").style.width = `${total ? (f / total) * 100 : 0}%`;
  }

  function renderSoloActions() {
    const box = $("#rollActions");
    if (!box) return;
    box.textContent = "";
    if (solo.done) return;
    if (!solo.rolled) {
      const b = el("button", "btn-primary roll-btn", solo.rolling ? t("rolling") : t("roll"));
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
  const SIZES = [2, 3, 4, 6, 8];
  let rooms = null;
  let roomSize = 2;
  let match = null;
  let matchReel = null;
  let pendingRound = null;

  const cleanName = (s) => window.DLE_Rooms.cleanName(s);
  function myName() {
    try { return cleanName(localStorage.getItem("dle:name")); } catch { return ""; }
  }

  function ensureRooms() {
    if (rooms) return;
    rooms = window.DLE_Rooms.create({
      channel: "crew",
      onChange: () => { if (!match) renderLobby(); else renderScoreboard(); },
      onStart: (room, data) => startMatch(room, data),
      onMessage: onMatchMessage,
      onClosed: () => {
        if (match && !match.done) { match.closedByHost = true; finishMatch(); }
        else { match = null; renderLobby(); }
        toast(t("roomClosed"));
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
      updateProfile();
      toast(t("nameSaved"));
    });
    box.append(form);

    const room = rooms.myRoom;
    if (room) box.append(roomCard(room));
    else {
      // Create a room
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
        li.append(el("span", "lobby-pname", t("roomOf")(host?.name ?? "Player")), el("span", "lobby-badge", `${r.members.length}/${r.size}`));
        const join = el("button", "btn-primary btn-small", t("join"));
        join.type = "button";
        join.addEventListener("click", async () => {
          if (!myName()) { input.placeholder = t("pickName"); input.focus(); return; }
          if (r.game !== currentGame.id) await selectGame(r.game, { quiet: true });
          rooms.join(r.id);
        });
        li.append(join);
        list.append(li);
      }
      box.append(list);
    }

    // Who is around
    const around = [...rooms.peers.values()];
    if (around.length) {
      box.append(el("h3", "room-title", t("inLobby")(around.length + 1)));
      const chips = el("div", "lobby-chips");
      for (const p of around) chips.append(el("span", "lobby-chip", p.name));
      box.append(chips);
    }
  }

  function roomCard(room) {
    const card = el("div", "room-card");
    const g = GAMES.find((x) => x.id === room.game);
    const head = el("div", "room-head");
    if (g) { const img = el("img"); img.src = ROOT + g.logo; img.alt = ""; head.append(img); }
    const host = room.members.find((m) => m.id === room.host);
    head.append(el("b", null, t("roomOf")(host?.name ?? "Player")), el("span", "lobby-badge", `${room.members.length}/${room.size}`));
    card.append(head);
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
      start.addEventListener("click", () => rooms.start((r) => ({ arc: Math.min(...r.members.map((m) => m.arc)) })));
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
    card.append(actions);
    return card;
  }

  // ── Match ──
  async function startMatch(room, data) {
    const g = GAMES.find((x) => x.id === room.game);
    if (!g) return;
    if (currentGame.id !== g.id) await selectGame(g.id, { quiet: true });
    const gameData = await loadGame(g);
    const arc = Math.min(Number.isInteger(data.arc) ? data.arc : 0, gameData.config.arcs.length - 1);
    const pool = makePool(g, gameData, arc);
    const ids = room.members.map((m) => m.id);
    match = {
      room, g, pool, host: room.host === rooms.selfId, ids,
      names: new Map(room.members.map((m) => [m.id, m.id === rooms.selfId ? myName() || t("you") : m.name])),
      boards: new Map(ids.map((id) => [id, makeSlots(g, pool)])),
      active: new Set(ids),
      round: 0, roundChar: null, current: null, placed: new Set(), used: new Set(), done: false, starting: true,
    };
    match.total = match.boards.get(rooms.selfId).filter((s) => !s.locked).length;
    renderPicker();
    renderMatch();
    const others = ids.filter((id) => id !== rooms.selfId).map(memberName);
    await vsSplash(memberName(rooms.selfId), others.join(" · "));
    match.starting = false;
    if (pendingRound) { const r = pendingRound; pendingRound = null; onRound(r); }
    if (match.host) nextRound();
  }

  function vsSplash(a, b) {
    const s = el("div", "vs-splash");
    s.append(el("span", "vs-name vs-left", a), el("span", "vs-mark", t("vs")), el("span", "vs-name vs-right", b));
    document.body.append(s);
    return wait(2200)
      .then(() => { s.classList.add("is-out"); return wait(350); })
      .then(() => s.remove());
  }

  // Host only: the next shared character is the one that fits the most crews.
  function nextRound() {
    if (!match || match.done) return;
    const boards = [...match.active].map((id) => match.boards.get(id));
    const free = match.pool.filter((c) => !match.used.has(c.id));
    let best = 0;
    let list = [];
    for (const c of free) {
      const n = boards.filter((b) => fitsIn(b, c)).length;
      if (n > best) { best = n; list = [c]; } else if (n === best && n > 0) list.push(c);
    }
    if (match.round >= match.total || !list.length) {
      rooms.broadcast("end", {});
      return finishMatch();
    }
    const pick = list[Math.floor(Math.random() * list.length)];
    const msg = { round: match.round + 1, charId: pick.id };
    rooms.broadcast("round", msg);
    onRound(msg);
  }

  async function onRound(d) {
    if (!match || match.starting) { pendingRound = d; return; }
    const c = match.pool.find((x) => x.id === d.charId);
    if (!c || d.round !== match.round + 1) return;
    Object.assign(match, { round: d.round, roundChar: c, current: null, placed: new Set() });
    match.used.add(c.id);
    renderScoreboard();
    const mine = match.boards.get(rooms.selfId);
    renderBoard($("#duelMine"), mine);
    const run = match;
    await matchReel.spin(match.pool, c);
    if (match !== run || match.done || match.round !== d.round) return;
    if (!fitsIn(mine, c)) { matchReel.hint(t("skipped")); return sendPlace(-1); }
    match.current = c;
    matchReel.hint(t("chooseSlot"));
    renderBoard($("#duelMine"), mine, { rolled: c, onPlace: matchPlace });
  }

  async function matchPlace(i) {
    const run = match;
    const c = run.current;
    if (!c || run.placed.has(rooms.selfId)) return;
    run.current = null;
    const mine = run.boards.get(rooms.selfId);
    const target = slotFace($("#duelMine"), i);
    renderBoard($("#duelMine"), mine);
    await fly(matchReel.window, target, c.image);
    if (match !== run) return;
    mine[i].char = c;
    mine[i].points = pointsFor(mine[i], c);
    renderBoard($("#duelMine"), mine);
    popSlot($("#duelMine"), i);
    sendPlace(i);
  }

  function sendPlace(slot) {
    match.placed.add(rooms.selfId);
    rooms.broadcast("place", { round: match.round, slot, charId: match.roundChar.id });
    if (!allPlaced()) matchReel.hint(t("waitOthers"));
    renderScoreboard();
    maybeAdvance();
  }

  const allPlaced = () => [...match.active].every((id) => match.placed.has(id));
  function maybeAdvance() {
    if (match.host && !match.done && allPlaced()) setTimeout(nextRound, REDUCED ? 0 : 700);
  }

  function onMatchMessage(type, d, from) {
    if (type === "round") {
      if (!match) { pendingRound = d; return; }
      if (from === match.room.host) onRound(d);
      return;
    }
    if (!match) return;
    if (type === "place") {
      if (d.round !== match.round || match.placed.has(from) || !match.boards.has(from)) return;
      const c = match.pool.find((x) => x.id === d.charId);
      const board = match.boards.get(from);
      const slot = board[Number(d.slot)];
      if (c && c === match.roundChar && slot && !slot.char && !slot.locked && slot.def.fits(c)) {
        slot.char = c;
        slot.points = pointsFor(slot, c);
        const box = document.querySelector(`[data-board="${CSS.escape(from)}"]`);
        if (box) { renderBoard(box, board, { mini: true }); popSlot(box, Number(d.slot)); }
      }
      match.placed.add(from);
      renderScoreboard();
      maybeAdvance();
    } else if (type === "left") {
      if (!match.active.has(from)) return;
      match.active.delete(from);
      renderScoreboard();
      if (match.active.size < 2 && !match.done) { if (match.host) rooms.broadcast("end", {}); finishMatch(); }
      else maybeAdvance();
    } else if (type === "end") {
      if (from === match.room.host) finishMatch();
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
      const dot = el("span", `duel-state${match.placed.has(id) ? " is-done" : ""}`);
      const score = el("b", "duel-score");
      // Scores animate from the value shown last time.
      score.dataset.value = match.shown?.get(id) ?? 0;
      chip.append(dot, el("span", "duel-pname", memberName(id)), score);
      box.append(chip);
      const value = duelScore(match.boards.get(id));
      countUp(score, value);
      (match.shown ??= new Map()).set(id, value);
    }
    $("#duelRound").textContent = t("round")(Math.max(1, match.round), match.total);
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
    panel.append(matchReel.el);
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
  mode = location.hash === "#online" ? "online" : "solo";
  setMode(mode);
  selectGame(currentGame.id);
})();
