// Crew Roll: pick an anime, roll random characters and place each one in a slot of your crew.
// Each placement scores 1–10; the crew's score is the average once every slot is filled.
(() => {
  "use strict";

  const GAMES = window.DLE_GAMES;
  const CREW = window.CREW_GAMES;
  const DEFAULT_POWER = window.CREW_DEFAULT_POWER;
  const REROLLS = 3;
  const ROOT = "../";

  const T = {
    en: {
      title: "Crew Roll",
      sub: "Roll random characters and build the strongest crew. Every placement counts.",
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
      rank: "Rank",
      best: "Best pick",
      worst: "Weakest pick",
      share: "Copy result",
      copied: "Result copied!",
      again: "New crew",
      locked: "Not available yet at your arc",
      points: (n) => `+${n}`,
      empty: "Empty",
    },
    fr: {
      title: "Roll ton équipage",
      sub: "Tire des personnages au hasard et construis l'équipage le plus fort. Chaque placement compte.",
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
      rank: "Rang",
      best: "Meilleur choix",
      worst: "Choix le plus faible",
      share: "Copier le résultat",
      copied: "Résultat copié !",
      again: "Nouvel équipage",
      locked: "Pas encore disponible à ton arc",
      points: (n) => `+${n}`,
      empty: "Libre",
    },
  };
  let lang = window.DLE_LANG.get();
  const t = (k) => T[lang][k];

  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  // ── Loading an anime's data (its config gives arcs, value names and the player's arc) ──
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
  async function loadGame(g) {
    if (!loaded[g.id]) {
      await loadScript(`${ROOT}${g.path}config.js`);
      await loadScript(`${ROOT}${g.path}data/characters.js`);
      loaded[g.id] = { config: window.DLE_CONFIG, chars: window.DLE_CHARACTERS };
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

  // ── State ──
  let game = null; // { g, config, crew, arc, pool, slots: [{def, label, char, points}], rolled, rerolls, done }

  async function start(gameId) {
    const g = GAMES.find((x) => x.id === gameId) ?? GAMES[0];
    try { localStorage.setItem("dle:crew-game", g.id); } catch {}
    const { config, chars } = await loadGame(g);
    const crew = CREW[g.id];
    const chosenArc = playerArc(config);
    const arc = chosenArc ?? config.arcs.length - 1;

    const pool = chars
      .filter((c) => c.arc <= arc && c.image)
      .map((c) => {
        const v = { id: c.id, image: `${ROOT}${g.path}${c.image}` };
        for (const [k, val] of Object.entries(c)) if (k !== "image") v[k] = resolve(val, arc);
        v.name = config.names?.[lang]?.[c.name] ?? c.name;
        v.power = crew.power[c.id] ?? DEFAULT_POWER;
        return v;
      });

    // A slot group is cut down to the number of characters that can fill it at this arc.
    const slots = [];
    for (const def of crew.slots) {
      const candidates = pool.filter((c) => def.fits(c)).length;
      for (let i = 0; i < def.count; i++) slots.push({ def, char: null, points: 0, locked: i >= candidates });
    }

    game = { g, config, crew, arc, chosenArc, pool, slots, rolled: null, rerolls: REROLLS, done: false, rolling: false };
    render();
  }

  const openSlots = () => game.slots.filter((s) => !s.char && !s.locked);
  const usedIds = () => new Set(game.slots.filter((s) => s.char).map((s) => s.char.id));
  const fitsSomewhere = (c) => openSlots().some((s) => s.def.fits(c));
  const pointsFor = (slot, c) => (slot.def.score ? slot.def.score(c, c.power) : c.power);

  function candidates(exclude) {
    const used = usedIds();
    return game.pool.filter((c) => !used.has(c.id) && c.id !== exclude && fitsSomewhere(c));
  }

  function roll(isReroll) {
    if (game.rolling || game.done) return;
    const list = candidates(game.rolled?.id);
    if (!list.length) { finish(); return; }
    if (isReroll) game.rerolls--;
    const pick = list[Math.floor(Math.random() * list.length)];
    game.rolling = true;
    game.rolled = null;
    render();

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reel = $("#reelImg");
    const name = $("#reelName");
    let i = 0;
    const steps = reduce ? 0 : 16;
    const tick = () => {
      if (i < steps) {
        const c = list[Math.floor(Math.random() * list.length)];
        reel.src = c.image;
        name.textContent = c.name;
        i++;
        setTimeout(tick, 45 + i * 6);
      } else {
        game.rolling = false;
        game.rolled = pick;
        render();
      }
    };
    tick();
  }

  function place(slotIndex) {
    const slot = game.slots[slotIndex];
    const c = game.rolled;
    if (!c || slot.char || slot.locked || !slot.def.fits(c)) return;
    slot.char = c;
    slot.points = pointsFor(slot, c);
    game.rolled = null;
    if (!openSlots().length || !candidates().length) finish();
    else render();
  }

  function finish() {
    game.done = true;
    game.rolled = null;
    render();
  }

  const filled = () => game.slots.filter((s) => s.char);
  const average = () => {
    const f = filled();
    return f.length ? f.reduce((a, s) => a + s.points, 0) / f.length : 0;
  };
  const rankOf = (avg) => (avg >= 9 ? "S" : avg >= 8 ? "A" : avg >= 6.5 ? "B" : avg >= 5 ? "C" : "D");

  // ── Rendering ──
  function renderPicker() {
    const box = $("#animePicker");
    box.textContent = "";
    for (const g of GAMES) {
      const b = el("button", `anime-pick${game?.g.id === g.id ? " is-active" : ""}`);
      b.type = "button";
      b.dataset.game = g.id;
      b.setAttribute("aria-pressed", game?.g.id === g.id);
      const img = el("img");
      img.src = ROOT + g.logo;
      img.alt = "";
      b.append(img, el("span", null, g.anime));
      b.addEventListener("click", () => start(g.id));
      box.append(b);
    }
  }

  function slotLabel(slot) {
    return slot.def.label[lang];
  }

  function renderBoard() {
    const board = $("#crewBoard");
    board.textContent = "";
    game.slots.forEach((slot, i) => {
      const card = el("button", "crew-slot");
      card.type = "button";
      const canPlace = game.rolled && !slot.char && !slot.locked && slot.def.fits(game.rolled);
      card.classList.toggle("is-filled", !!slot.char);
      card.classList.toggle("is-target", !!canPlace);
      card.classList.toggle("is-locked", slot.locked);
      card.disabled = !canPlace;

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
      else if (canPlace) card.append(el("span", "crew-points is-preview", t("points")(pointsFor(slot, game.rolled))));
      card.setAttribute("aria-label", `${slotLabel(slot)}: ${slot.char ? `${slot.char.name}, ${slot.points}` : canPlace ? t("chooseSlot") : t("empty")}`);
      card.addEventListener("click", () => place(i));
      board.append(card);
    });
  }

  function renderPanel() {
    const panel = $("#rollPanel");
    panel.textContent = "";
    if (game.done) return renderResult(panel);

    const reel = el("div", "reel");
    const img = el("img");
    img.id = "reelImg";
    img.alt = "";
    const face = el("span", "reel-face");
    face.append(img);
    const name = el("p", "reel-name");
    name.id = "reelName";
    reel.append(face, name);

    if (game.rolled) {
      img.src = game.rolled.image;
      name.textContent = game.rolled.name;
      const bar = el("div", "power");
      bar.append(el("span", "power-label", t("power")));
      const track = el("span", "power-track");
      const fill = el("span", "power-fill");
      fill.style.width = `${game.rolled.power * 10}%`;
      track.append(fill);
      bar.append(track, el("b", null, String(game.rolled.power)));
      reel.append(bar);
      const fits = openSlots().some((s) => s.def.fits(game.rolled));
      reel.append(el("p", "reel-hint", fits ? t("chooseSlot") : t("noSlot")));
    } else if (game.rolling) {
      name.textContent = t("rolling");
    } else {
      reel.classList.add("is-idle");
      face.textContent = "?";
    }
    panel.append(reel);

    const actions = el("div", "roll-actions");
    if (!game.rolled) {
      const b = el("button", "btn-primary roll-btn", t("roll"));
      b.type = "button";
      b.disabled = game.rolling;
      b.addEventListener("click", () => roll(false));
      actions.append(b);
    } else {
      const b = el("button", "btn-ghost", t("reroll")(game.rerolls));
      b.type = "button";
      b.disabled = game.rerolls <= 0;
      b.addEventListener("click", () => roll(true));
      actions.append(b);
    }
    panel.append(actions);
  }

  function renderResult(panel) {
    const avg = average();
    const rank = rankOf(avg);
    const f = filled();
    const best = [...f].sort((a, b) => b.points - a.points)[0];
    const worst = [...f].sort((a, b) => a.points - b.points)[0];
    const box = el("div", "crew-result");
    box.append(el("p", "result-kicker", t("resultTitle")));
    const r = el("div", `crew-rank rank-${rank}`);
    r.append(el("span", null, rank));
    box.append(r);
    box.append(el("p", "crew-avg", `${avg.toFixed(1)} / 10`));
    if (best) box.append(el("p", "muted", `${t("best")}: ${best.char.name} (${slotLabel(best)}, ${best.points})`));
    if (worst && worst !== best) box.append(el("p", "muted", `${t("worst")}: ${worst.char.name} (${slotLabel(worst)}, ${worst.points})`));
    const actions = el("div", "roll-actions");
    const share = el("button", "btn-ghost", t("share"));
    share.type = "button";
    share.addEventListener("click", copyResult);
    const again = el("button", "btn-primary", t("again"));
    again.type = "button";
    again.addEventListener("click", () => start(game.g.id));
    actions.append(share, again);
    box.append(actions);
    panel.append(box);
  }

  async function copyResult() {
    const avg = average();
    const lines = filled().map((s) => `${slotLabel(s)}: ${s.char.name} (${s.points})`);
    const text = `${t("title")} · ${game.g.anime} · ${rankOf(avg)} ${avg.toFixed(1)}/10\n${lines.join("\n")}`;
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
    const toast = $("#toast");
    toast.textContent = t("copied");
    toast.hidden = false;
    setTimeout(() => (toast.hidden = true), 1800);
  }

  function renderStatus() {
    const f = filled().length;
    const total = game.slots.filter((s) => !s.locked).length;
    $("#crewScore").textContent = f ? average().toFixed(1) : "–";
    $("#crewFilled").textContent = t("filled")(f, total);
    const arcName = game.config.arcs[game.arc][lang];
    $("#crewArc").textContent = game.chosenArc == null ? t("spoilerAll") : t("spoiler")(arcName);
    const link = $("#crewArcLink");
    link.href = `${ROOT}${game.g.path}`;
    document.body.dataset.game = game.g.id;
  }

  function render() {
    renderPicker();
    if (!game) return;
    renderStatus();
    renderBoard();
    renderPanel();
  }

  function applyLang() {
    document.documentElement.lang = lang;
    $("#crewTitle").textContent = t("title");
    $("#crewSub").textContent = t("sub");
    $("#crewPickLabel").textContent = t("pick");
    $("#crewScoreLabel").textContent = t("score");
    document.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === lang));
    if (game) {
      // Names can differ per language (Dragon Ball's French dub): reload them.
      for (const c of game.pool) {
        const orig = loaded[game.g.id].chars.find((x) => x.id === c.id);
        c.name = game.config.names?.[lang]?.[orig.name] ?? orig.name;
      }
      render();
    }
  }

  function renderCategories() {
    const nav = $("#categories");
    nav.innerHTML = "";
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
    const crew = el("a", "cat cat-crew is-current");
    crew.href = "./";
    crew.setAttribute("aria-current", "page");
    crew.innerHTML = `<span class="cat-logo cat-dice"><svg viewBox="0 0 24 24" width="22" height="22"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg></span>`;
    crew.append(el("span", "cat-name", T[lang].title));
    nav.append(crew);
  }

  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => {
    lang = b.dataset.lang;
    window.DLE_LANG.set(lang);
    renderCategories();
    applyLang();
    window.dispatchEvent(new Event("dle:lang"));
  }));

  renderCategories();
  applyLang();
  let saved = null;
  try { saved = localStorage.getItem("dle:crew-game"); } catch {}
  start(saved || "onepiece");
})();
