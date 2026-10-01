// Shared game engine. Each category page loads its data (DLE_CHARACTERS) and config (DLE_CONFIG) first.
(() => {
  "use strict";

  const CFG = window.DLE_CONFIG;
  const CHARS = window.DLE_CHARACTERS;
  const GAMES = window.DLE_GAMES;
  const UI = window.DLE_UI;
  const ROOT = "../";

  const COLS = CFG.columns;
  const EPOCH = new Date(2026, 0, 1);
  const FLIP_STEP = 170;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ── Storage (browser storage can be unavailable: every access is guarded) ──
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(`${CFG.storage}:${key}`);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(`${CFG.storage}:${key}`, JSON.stringify(value));
      } catch {}
    },
  };

  const settings = Object.assign({ arc: null, mode: "daily" }, store.get("settings", {}));
  delete settings.lang;
  settings.lang = window.DLE_LANG.get();
  const saveSettings = () => store.set("settings", { arc: settings.arc, mode: settings.mode });
  const isOnline = () => settings.mode === "online";
  let race = null; // online race in progress (see "Online race" below)
  const arcCap = () => (isOnline() && race ? race.arc : settings.arc);
  // Online games don't count in the daily / endless statistics.
  const statsMode = () => (settings.mode === "endless" ? "endless" : "daily");

  // ── i18n helpers ──
  const t = (key) => UI[settings.lang][key];
  const tv = (v) => {
    const table = CFG.values[settings.lang] || {};
    if (v in table) return table[v];
    return CFG.translate?.(v, settings.lang) ?? v;
  };
  const arcName = (i) => CFG.arcs[i][settings.lang];
  const colLabel = (key) => CFG.labels[settings.lang][key];

  // ── Dates ──
  const dateKey = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const dayNumber = () => Math.floor((new Date().setHours(0, 0, 0, 0) - EPOCH) / 864e5) + 1;

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    return (h ^ (h >>> 15)) >>> 0;
  }

  const normalize = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "");

  // ── Characters, resolved for the arc the player has watched (spoiler-free) ──
  // A field given as { arcIndex: value } takes the value of the latest arc the player has reached.
  const isByArc = (v) => v && typeof v === "object" && !Array.isArray(v);
  function resolve(value) {
    if (!isByArc(value)) return value;
    const keys = Object.keys(value).map(Number).sort((a, b) => a - b);
    const k = keys.filter((x) => x <= arcCap()).pop() ?? keys[0];
    return value[k];
  }
  const byId = new Map(CHARS.map((c) => [c.id, c]));
  // Some characters have a different name in the French dub (Son Goku, Freezer, Hercule…).
  const nameOf = (c) => CFG.names?.[settings.lang]?.[c.name] ?? c.name;
  const view = (id) => {
    const c = byId.get(id);
    const out = {};
    for (const [k, v] of Object.entries(c)) out[k] = resolve(v);
    out.name = nameOf(c);
    return CFG.derive ? CFG.derive(out, arcCap()) : out;
  };
  const pool = () => CHARS.filter((c) => c.arc <= arcCap());

  // ── Game state ──
  let game = null;
  const gameKey = () => (settings.mode === "daily" ? `daily:${dateKey()}:${settings.arc}` : `endless:${settings.arc}`);

  function dailyTarget() {
    const p = pool();
    return p[hash(`${dateKey()}|${settings.arc}|${CFG.storage}`) % p.length].id;
  }
  function randomTarget(exclude) {
    const p = pool().filter((c) => c.id !== exclude);
    return p[Math.floor(Math.random() * p.length)].id;
  }

  function loadGame() {
    if (isOnline()) { game = race ? race.game : null; return; }
    const saved = store.get(gameKey(), null);
    const valid = saved && byId.has(saved.target) && byId.get(saved.target).arc <= settings.arc;
    game = valid
      ? saved
      : { target: settings.mode === "daily" ? dailyTarget() : randomTarget(), guesses: [], status: "playing", revealed: {} };
    saveGame();
  }
  const saveGame = () => { if (!isOnline()) store.set(gameKey(), game); };

  // ── Stats ──
  const emptyStats = () => ({ played: 0, wins: 0, streak: 0, max: 0, last: null, dist: {} });
  const stats = Object.assign({ daily: emptyStats(), endless: emptyStats(), history: {} }, store.get("stats", {}));
  const saveStats = () => store.set("stats", stats);

  function currentStreak(mode) {
    const s = stats[mode];
    if (mode === "endless") return s.streak;
    const ok = s.last === dateKey() || s.last === dateKey(addDays(new Date(), -1));
    return ok ? s.streak : 0;
  }

  function recordStart() {
    stats[settings.mode].played++;
    saveStats();
  }

  function recordWin(n) {
    const s = stats[settings.mode];
    s.wins++;
    s.dist[n] = (s.dist[n] || 0) + 1;
    if (settings.mode === "daily") {
      const today = dateKey();
      if (s.last !== today) {
        s.streak = s.last === dateKey(addDays(new Date(), -1)) ? s.streak + 1 : 1;
        s.last = today;
      }
      if (!(today in stats.history)) stats.history[today] = n;
    } else {
      s.streak++;
    }
    s.max = Math.max(s.max, s.streak);
    saveStats();
  }

  function recordGiveUp() {
    stats.endless.streak = 0;
    saveStats();
  }

  // ── Comparison ──
  function compareSets(a, b) {
    const setA = new Set(a);
    const inter = b.filter((x) => setA.has(x)).length;
    if (inter === a.length && inter === b.length) return "correct";
    return inter > 0 ? "partial" : "wrong";
  }

  function compareCol(col, g, tg) {
    const a = g[col.key];
    const b = tg[col.key];
    switch (col.type) {
      case "name":
        return { status: g.id === tg.id ? "correct" : "wrong" };
      case "set":
        return { status: compareSets(a, b) };
      case "ordinal": {
        const ia = col.order.indexOf(a);
        const ib = col.order.indexOf(b);
        if (a === b) return { status: "correct" };
        return { status: "wrong", dir: ia >= 0 && ib >= 0 ? (ib > ia ? "up" : "down") : null };
      }
      case "number":
      case "arc":
        if (a === b) return { status: "correct" };
        return { status: "wrong", dir: a != null && b != null ? (b > a ? "up" : "down") : null };
      default:
        return { status: a === b ? "correct" : "wrong" };
    }
  }

  function compare(g, tg) {
    const res = {};
    for (const col of COLS) res[col.key] = compareCol(col, g, tg);
    return res;
  }

  function cellText(col, v) {
    const x = v[col.key];
    switch (col.type) {
      case "name": return v.name;
      case "set": return x.map(tv).join(", ");
      case "number": return x == null ? tv("Unknown") : col.format ? col.format(x, settings.lang, tv) : `${x}${col.unit || ""}`;
      case "arc": return arcName(x);
      default: return tv(x);
    }
  }

  // ── Rendering helpers ──
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const arrow = (dir) => (dir ? `<span class="arrow" aria-hidden="true">${dir === "up" ? "▲" : "▼"}</span>` : "");
  const ICONS = {
    shield: `<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
    spark: `<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    person: `<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  };

  // ── Header: categories ──
  function renderCategories() {
    const nav = $("#categories");
    nav.innerHTML = GAMES.map((g) => {
      const current = g.id === CFG.id;
      return `<a class="cat ${current ? "is-current" : ""}" href="${ROOT}${g.path}" title="${esc(g.brand)}" ${current ? 'aria-current="page"' : ""}>
        <span class="cat-logo"><img src="${ROOT}${g.logo}" alt="" onerror="this.onerror=null;this.src='${ROOT}assets/logos/placeholder.svg'" /></span>
        <span class="cat-name">${esc(g.brand)}</span></a>`;
    }).join("") + window.DLE_CREW_LINK(ROOT, t("crew"));
  }

  // ── Board ──
  function renderHead() {
    const head = $("#boardHead");
    head.innerHTML = "";
    for (const col of COLS) head.append(el("div", `col col-${col.key}`, esc(colLabel(col.key))));
    head.hidden = game.guesses.length === 0;
  }

  function renderRow(id, animate) {
    const g = view(id);
    const res = compare(g, view(game.target));
    const row = el("div", "row");
    COLS.forEach((col, i) => {
      const { status, dir } = res[col.key];
      const tile = el("div", `tile tile-${col.type === "name" ? "name" : col.key} is-${status}`);
      const dirWord = dir ? (dir === "up" ? " ▲" : " ▼") : "";
      tile.setAttribute("aria-label", `${colLabel(col.key)}: ${cellText(col, g)}${dirWord} (${t(status)})`);
      tile.innerHTML = col.type === "name"
        ? `<img src="${esc(g.image)}" alt="" loading="lazy" /><span class="tile-caption">${esc(g.name)}</span>`
        : `<span class="tile-text">${esc(cellText(col, g))}</span>${arrow(dir)}`;
      if (animate) {
        tile.classList.add("flip");
        tile.style.animationDelay = `${i * FLIP_STEP}ms`;
      }
      row.append(tile);
    });
    return row;
  }

  function renderBoard() {
    renderHead();
    const rows = $("#boardRows");
    rows.innerHTML = "";
    for (const id of [...game.guesses].reverse()) rows.append(renderRow(id, false));
  }

  function renderHints() {
    const box = $("#hints");
    box.innerHTML = "";
    const n = game.guesses.length;
    const tg = view(game.target);
    CFG.hints.forEach((h, i) => {
      const id = h.key ?? h.type;
      const unlocked = n >= h.at || game.status !== "playing";
      const revealed = game.revealed[id];
      const isPortrait = h.type === "portrait";
      const label = isPortrait ? t("hintPortrait") : h.label[settings.lang];
      const btn = el("button", `hint ${unlocked ? "is-unlocked" : ""} ${revealed ? "is-revealed" : ""}`);
      btn.type = "button";
      btn.disabled = !unlocked || revealed;
      let body;
      if (revealed) {
        body = isPortrait
          ? `<span class="hint-portrait"><img src="${esc(tg.image)}" alt="" /></span>`
          : `<strong>${esc(h.value ? h.value(tg, UI[settings.lang]) : tv(tg[h.key]))}</strong>`;
      } else {
        body = `<small>${unlocked ? t("hintReveal") : t("hintIn")(h.at - n)}</small>`;
      }
      btn.innerHTML = `${ICONS[isPortrait ? "person" : h.icon] ?? ICONS.shield}<span class="hint-label">${esc(label)}</span>${body}`;
      btn.addEventListener("click", () => {
        game.revealed[id] = true;
        saveGame();
        renderHints();
      });
      box.append(btn);
    });
    $("#guessCount").textContent = n ? t("guesses")(n) : "";
  }

  function renderStatsBar() {
    $("#statStreak").textContent = currentStreak(statsMode());
    $("#statWins").textContent = stats[statsMode()].wins;
    $("#statArc").textContent = settings.arc == null ? "-" : settings.arc + 1;
  }

  function renderHero() {
    $("#heroTitle").textContent = CFG.heroTitle;
    $("#heroSub").textContent = t(isOnline() ? "subOnline" : settings.mode === "daily" ? "subDaily" : "subEndless");
    $("#arcChipName").textContent = settings.arc == null ? "-" : arcName(settings.arc);
    $$(".mode-tabs [data-mode]").forEach((b) => {
      const on = b.dataset.mode === settings.mode;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on);
    });
  }

  function renderWeekly() {
    const box = $("#weekly");
    const today = new Date();
    const start = addDays(today, -today.getDay());
    const days = t("days");
    let sum = 0, count = 0, cells = "";
    for (let i = 0; i < 7; i++) {
      const key = dateKey(addDays(start, i));
      const v = stats.history[key];
      if (v != null) { sum += v; count++; }
      const isToday = key === dateKey(today);
      cells += `<div class="wk-day ${isToday ? "is-today" : ""}"><span>${days[i]}</span><b class="${v != null ? "has" : ""}">${v ?? "-"}</b></div>`;
    }
    const foot = count ? t("weeklyAvg")((sum / count).toFixed(1)) : t("weeklyEmpty");
    box.innerHTML = `<h3>${t("weeklyTitle")}</h3><div class="wk-grid">${cells}</div><p class="muted">${foot}</p>`;
  }

  function shareText() {
    const emoji = { correct: "🟩", partial: "🟧", wrong: "🟥" };
    const tg = view(game.target);
    const lines = game.guesses.map((id) => {
      const r = compare(view(id), tg);
      return COLS.map((c) => emoji[r[c.key].status]).join("");
    });
    const shown = lines.length > 8 ? [...lines.slice(0, 7), "…", lines[lines.length - 1]] : lines;
    const title = isOnline() ? `${CFG.brand} · ${t("modeOnline")}` : settings.mode === "daily" ? `${CFG.brand} #${dayNumber()}` : `${CFG.brand} ∞`;
    const result = game.status === "won" ? t("guesses")(game.guesses.length) : "X";
    return `${title} · ${arcName(settings.arc)} · ${result}\n${shown.join("\n")}`;
  }

  let countdownTimer = null;
  function renderResult() {
    const banner = $("#resultBanner");
    const form = $("#searchForm");
    clearInterval(countdownTimer);
    if (isOnline() && game.status !== "playing") return renderRaceResult(banner, form);
    if (game.status === "playing") {
      banner.hidden = true;
      form.hidden = false;
      renderGiveUp();
      return;
    }
    form.hidden = true;
    $("#giveUp")?.remove();
    const tg = view(game.target);
    const won = game.status === "won";
    const next = settings.mode === "daily"
      ? `<p class="countdown-label">${t("nextIn")}</p><p class="countdown" id="countdown">--:--:--</p>`
      : `<button class="btn-primary" type="button" id="nextBtn">${t("nextChar")}</button>`;
    banner.innerHTML = `
      <div class="result-portrait ${won ? "is-won" : ""}"><img src="${esc(tg.image)}" alt="${esc(tg.name)}" /></div>
      <div class="result-body">
        <p class="result-kicker">${won ? t("winTitle") : t("giveUpTitle")}</p>
        <h2 class="result-name">${esc(tg.name)}</h2>
        ${won ? `<p class="muted">${t("winLine")(game.guesses.length)}</p>` : ""}
        <div class="result-actions">
          <button class="btn-ghost" type="button" id="shareBtn">${t("share")}</button>
        </div>
        ${next}
      </div>`;
    banner.hidden = false;
    $("#shareBtn").addEventListener("click", copyShare);
    if (settings.mode === "daily") {
      const tick = () => {
        const ms = addDays(new Date(), 1).getTime() - Date.now();
        if (ms <= 0) { clearInterval(countdownTimer); startGame(); return; }
        const s = Math.floor(ms / 1000);
        const node = $("#countdown");
        if (node) node.textContent = [s / 3600, (s % 3600) / 60, s % 60].map((x) => String(Math.floor(x)).padStart(2, "0")).join(":");
      };
      tick();
      countdownTimer = setInterval(tick, 1000);
    } else {
      $("#nextBtn").addEventListener("click", () => {
        game = { target: randomTarget(game.target), guesses: [], status: "playing", revealed: {} };
        saveGame();
        renderAll();
        $("#searchInput").focus();
      });
    }
  }

  function renderRaceResult(banner, form) {
    form.hidden = true;
    $("#giveUp")?.remove();
    const tg = view(game.target);
    const won = game.status === "won";
    const me = race.players.get(rooms.selfId);
    const place = raceRanking().filter((p) => p.found).findIndex((p) => p.id === me.id) + 1;
    banner.innerHTML = `
      <div class="result-portrait ${won ? "is-won" : ""}"><img src="${esc(tg.image)}" alt="${esc(tg.name)}" /></div>
      <div class="result-body">
        <p class="result-kicker">${won ? t("winTitle") : t("giveUpTitle")}</p>
        <h2 class="result-name">${esc(tg.name)}</h2>
        ${won ? `<p class="muted">${t("raceWon")(place, game.guesses.length, clock(me.ms ?? 0))}</p>` : ""}
        <p class="muted">${race.done ? "" : esc(t("raceWait"))}</p>
      </div>`;
    banner.hidden = false;
  }

  function renderGiveUp() {
    const existing = $("#giveUp");
    const canGiveUp = settings.mode === "endless" || (isOnline() && race && !race.done);
    if (!canGiveUp || game.guesses.length === 0) { existing?.remove(); return; }
    if (existing) { existing.textContent = t("giveUp"); return; }
    const b = el("button", "link-btn", esc(t("giveUp")));
    b.id = "giveUp";
    b.type = "button";
    b.addEventListener("click", () => {
      game.status = "lost";
      if (isOnline()) { renderAll(); raceProgress(); return; }
      saveGame();
      recordGiveUp();
      renderAll();
    });
    $(".guess-box").append(b);
  }

  async function copyShare() {
    const text = shareText();
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

  let toastTimer;
  function toast(msg) {
    const node = $("#toast");
    node.textContent = msg;
    node.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (node.hidden = true), 1800);
  }

  function burst() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = el("div", "burst");
    for (let i = 0; i < 46; i++) {
      const p = el("i");
      const a = Math.random() * Math.PI * 2;
      const d = 140 + Math.random() * 260;
      p.style.setProperty("--x", `${Math.cos(a) * d}px`);
      p.style.setProperty("--y", `${Math.sin(a) * d - 80}px`);
      p.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
      p.style.animationDelay = `${Math.random() * 120}ms`;
      if (i % 3 === 0) p.className = "alt";
      layer.append(p);
    }
    document.body.append(layer);
    setTimeout(() => layer.remove(), 1600);
  }

  // ── Guessing ──
  function submitGuess(id) {
    if (game.status !== "playing" || game.guesses.includes(id)) return;
    if (isOnline() && (!race || !race.startedAt || race.done)) return;
    if (!isOnline() && game.guesses.length === 0) recordStart();
    game.guesses.push(id);
    const won = id === game.target;
    if (won) {
      game.status = "won";
      if (!isOnline()) recordWin(game.guesses.length);
    }
    saveGame();
    if (isOnline()) raceProgress();

    renderHead();
    const row = renderRow(id, true);
    $("#boardRows").prepend(row);
    renderHints();
    renderGiveUp();
    renderStatsBar();
    closeSuggestions();
    const input = $("#searchInput");
    input.value = "";
    $("#clearBtn").hidden = true;

    if (won) {
      $("#searchForm").hidden = true;
      setTimeout(() => {
        row.classList.add("is-win");
        burst();
        renderResult();
        renderWeekly();
        $("#resultBanner").scrollIntoView({ behavior: "smooth", block: "center" });
      }, COLS.length * FLIP_STEP + 450);
    } else {
      input.focus();
    }
  }

  // ── Autocomplete ──
  let matches = [];
  let active = -1;

  function search(q) {
    const nq = normalize(q.trim());
    if (!nq || !game) return [];
    return pool()
      .filter((c) => !game.guesses.includes(c.id))
      .map((c) => {
        const scoreOf = (name) => {
          const n = normalize(name);
          return n.startsWith(nq) ? 0 : n.split(" ").some((w) => w.startsWith(nq)) ? 1 : n.includes(nq) ? 2 : 9;
        };
        const score = Math.min(scoreOf(nameOf(c)), scoreOf(c.name));
        return { c, score: score === 9 ? -1 : score };
      })
      .filter((x) => x.score >= 0)
      .sort((a, b) => a.score - b.score || nameOf(a.c).localeCompare(nameOf(b.c)))
      .map((x) => x.c);
  }

  function renderSuggestions() {
    const list = $("#suggestions");
    const input = $("#searchInput");
    list.innerHTML = "";
    if (!input.value.trim()) return closeSuggestions();
    if (!matches.length) {
      list.innerHTML = `<li class="empty">${esc(t("noMatch"))}</li>`;
    } else {
      matches.forEach((c, i) => {
        const li = el("li", i === active ? "is-active" : "", `<img src="${esc(c.image)}" alt="" loading="lazy" /><span>${esc(nameOf(c))}</span>`);
        li.id = `sug-${c.id}`;
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", i === active);
        li.addEventListener("mousedown", (e) => { e.preventDefault(); submitGuess(c.id); });
        list.append(li);
      });
    }
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    input.setAttribute("aria-activedescendant", active >= 0 && matches[active] ? `sug-${matches[active].id}` : "");
    list.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
  }

  function closeSuggestions() {
    $("#suggestions").hidden = true;
    $("#searchInput").setAttribute("aria-expanded", "false");
    active = -1;
  }

  function bindSearch() {
    const input = $("#searchInput");
    input.addEventListener("input", () => {
      matches = search(input.value);
      active = matches.length ? 0 : -1;
      $("#clearBtn").hidden = !input.value;
      renderSuggestions();
    });
    input.addEventListener("keydown", (e) => {
      if ($("#suggestions").hidden) return;
      if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(active + 1, matches.length - 1); renderSuggestions(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(active - 1, 0); renderSuggestions(); }
      else if (e.key === "Escape") closeSuggestions();
    });
    input.addEventListener("blur", () => setTimeout(closeSuggestions, 120));
    input.addEventListener("focus", () => { if (input.value) { matches = search(input.value); renderSuggestions(); } });
    $("#clearBtn").addEventListener("click", () => {
      input.value = "";
      $("#clearBtn").hidden = true;
      closeSuggestions();
      input.focus();
    });
    $("#searchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const pick = matches[active] ?? matches[0];
      if (pick && input.value.trim()) submitGuess(pick.id);
    });
  }

  // ── Modals ──
  let arcDraft = null;
  function openArcModal() {
    arcDraft = settings.arc ?? CFG.arcs.length - 1;
    renderArcGrid();
    $("#arcConfirm").textContent = settings.arc == null ? t("start") : t("save");
    $("#arcModal").showModal();
  }

  function renderArcGrid() {
    const grid = $("#arcGrid");
    grid.innerHTML = "";
    CFG.arcs.forEach((a, i) => {
      const b = el("button", `arc-card ${i <= arcDraft ? "is-included" : ""} ${i === arcDraft ? "is-selected" : ""}`);
      b.type = "button";
      b.setAttribute("aria-pressed", i === arcDraft);
      const count = CHARS.filter((c) => c.arc <= i).length;
      const eps = /^\d/.test(a.eps) ? `${t("eps")} ${a.eps}` : a.eps;
      b.innerHTML = `
        <span class="arc-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="arc-name">${esc(a[settings.lang])}</span>
        <span class="arc-meta">${eps} · ${count} ${t("chars")}</span>`;
      b.addEventListener("click", () => { arcDraft = i; renderArcGrid(); });
      grid.append(b);
    });
  }

  function helpHtml() {
    const arrowCols = COLS.filter((c) => ["ordinal", "number", "arc"].includes(c.type)).map((c) => colLabel(c.key).toLowerCase());
    const hintNames = CFG.hints.map((h) => (h.type === "portrait" ? t("hintPortrait") : h.label[settings.lang]).toLowerCase());
    return t("help")({ anime: CFG.anime, arrowCols: arrowCols.join(", "), arcCol: colLabel("arc"), hintNames: hintNames.join(", ") });
  }
  function openHelp() {
    $("#helpBody").innerHTML = helpHtml();
    $("#helpModal").showModal();
  }

  function openStats() {
    const s = stats[statsMode()];
    const buckets = ["1", "2", "3", "4", "5", "6", "7-9", "10+"];
    const bucketOf = (n) => (n <= 6 ? String(n) : n <= 9 ? "7-9" : "10+");
    const dist = Object.fromEntries(buckets.map((b) => [b, 0]));
    for (const [n, c] of Object.entries(s.dist)) dist[bucketOf(Number(n))] += c;
    const max = Math.max(1, ...Object.values(dist));
    const bars = buckets
      .map((b) => `<div class="dist-row"><span>${b}</span><div class="dist-bar" style="--w:${(dist[b] / max) * 100}%"><b>${dist[b]}</b></div></div>`)
      .join("");
    $("#statsBody").innerHTML = `
      <p class="muted center">${CFG.brand} · ${t(statsMode() === "daily" ? "modeDaily" : "modeEndless")}</p>
      <div class="stats-grid">
        <div><b>${s.played}</b><span>${t("statsPlayed")}</span></div>
        <div><b>${s.wins}</b><span>${t("statsWins")}</span></div>
        <div><b>${currentStreak(statsMode())}</b><span>${t("statsStreak")}</span></div>
        <div><b>${s.max}</b><span>${t("statsMax")}</span></div>
      </div>
      <h3>${t("statsDist")}</h3>
      <div class="dist">${bars}</div>`;
    $("#statsModal").showModal();
  }

  function bindUi() {
    $$("[data-lang]").forEach((b) => b.addEventListener("click", () => {
      settings.lang = b.dataset.lang;
      window.DLE_LANG.set(settings.lang);
      applyLang();
      window.dispatchEvent(new Event("dle:lang"));
      if ($("#arcModal").open) {
        renderArcGrid();
        $("#arcConfirm").textContent = settings.arc == null ? t("start") : t("save");
      }
    }));

    $$("[data-mode]").forEach((b) => b.addEventListener("click", () => {
      if (settings.mode === b.dataset.mode) return;
      settings.mode = b.dataset.mode;
      saveSettings();
      if (isOnline()) ensureRooms();
      startGame();
    }));

    const actions = { arc: openArcModal, stats: openStats, help: openHelp };
    $$("[data-action]").forEach((b) => b.addEventListener("click", () => {
      toggleMenu(false);
      actions[b.dataset.action]();
    }));

    $("#menuBtn").addEventListener("click", (e) => { e.stopPropagation(); toggleMenu(); });
    document.addEventListener("click", (e) => { if (!e.target.closest("#menu")) toggleMenu(false); });

    $("#arcConfirm").addEventListener("click", () => {
      settings.arc = arcDraft;
      saveSettings();
      $("#arcModal").close();
      startGame();
      $("#searchInput").focus();
    });
    // The arc must be chosen before the first game.
    $("#arcModal").addEventListener("cancel", (e) => { if (settings.arc == null) e.preventDefault(); });

    $$("dialog").forEach((d) => {
      d.addEventListener("click", (e) => { if (e.target === d && !(d.id === "arcModal" && settings.arc == null)) d.close(); });
      $$("[data-close]", d).forEach((b) => b.addEventListener("click", () => d.close()));
    });
  }

  function toggleMenu(force) {
    const menu = $("#menu");
    const open = force ?? menu.hidden;
    menu.hidden = !open;
    $("#menuBtn").setAttribute("aria-expanded", open);
  }

  function applyLang() {
    document.documentElement.lang = settings.lang;
    renderCategories();
    $$("[data-i18n]").forEach((n) => { const v = t(n.dataset.i18n); if (typeof v === "string") n.textContent = v; });
    $$("[data-i18n-aria]").forEach((n) => n.setAttribute("aria-label", t(n.dataset.i18nAria)));
    $$("[data-i18n-title]").forEach((n) => { n.title = t(n.dataset.i18nTitle); n.setAttribute("aria-label", n.title); });
    $$("[data-lang]").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === settings.lang));
    $("#searchInput").placeholder = t("placeholder")(CFG.example);
    $("#searchInput").setAttribute("aria-label", t("placeholder")(CFG.example));
    $("#footerText").textContent = CFG.footer[settings.lang];
    if ($("#helpModal").open) $("#helpBody").innerHTML = helpHtml();
    if (game || isOnline()) renderAll();
  }

  function renderAll() {
    renderHero();
    renderStatsBar();
    renderRace();
    // Online without a race in progress: only the lobby is shown.
    const active = !!game;
    $(".guess-box").hidden = !active;
    $(".board-wrap").hidden = !active;
    if (!active) { $("#resultBanner").hidden = true; renderWeekly(); return; }
    renderBoard();
    renderHints();
    renderResult();
    renderWeekly();
  }

  function startGame() {
    if (settings.arc == null) return;
    loadGame();
    closeSuggestions();
    $("#searchInput").value = "";
    $("#clearBtn").hidden = true;
    renderAll();
  }

  function renderBackground() {
    const imgs = CHARS.filter((c) => c.image);
    const order = [...imgs, ...imgs]
      .map((c, i) => ({ c, k: hash(`${c.id}:${i}`) }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.c);
    $("#bgGrid").innerHTML = order.map((c) => `<span style="background-image:url('${c.image}')"></span>`).join("");
  }

  function setupLayout() {
    const widths = COLS.map((c) => (c.width ? `${c.width}px` : "var(--tile)")).join(" ");
    const narrow = COLS.map((c) => (c.width ? `${Math.round(c.width * 0.84)}px` : "var(--tile)")).join(" ");
    document.documentElement.style.setProperty("--cols", widths);
    document.documentElement.style.setProperty("--cols-narrow", narrow);
  }

  // ── Online race (2–8 players, first to find the character wins) ──
  // Rooms come from shared/rooms.js, with one lobby per anime. The host draws the character at the
  // lowest arc among the players so nobody gets spoiled. Players share their progress live: the
  // number of guesses and the tile colours of their last guess, never the names they tried.
  let rooms = null;
  let raceSize = 2;
  const SIZES = [2, 3, 4, 6, 8];
  const STATUSES = new Set(["correct", "partial", "wrong"]);
  const myName = () => {
    try { return window.DLE_Rooms.cleanName(localStorage.getItem("dle:name")); } catch { return ""; }
  };
  const clock = (ms) => {
    const s = Math.max(0, Math.round(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  function ensureRooms() {
    if (rooms || !window.DLE_Rooms) return;
    rooms = window.DLE_Rooms.create({
      channel: `race-${CFG.id}`,
      startData: raceStartData,
      onChange: () => { if (isOnline()) renderRace(); },
      onStart: startRace,
      onMessage: onRaceMessage,
      onClosed: () => {
        toast(t("roomClosed"));
        if (race && !race.done) finishRace();
        else if (!race && isOnline()) renderRace();
      },
      onInvite: (room, from) => {
        if (race && !race.done) return;
        window.DLE_Rooms.inviteBanner({
          text: t("invitedBy")(rooms.peers.get(from)?.name ?? "Player", ""),
          join: t("join"),
          dismiss: t("ignore"),
          onJoin: () => joinRaceRoom(room),
        });
      },
    });
    updateRaceProfile();
  }

  // Host: the race uses the lowest arc among the players, and a character from that pool.
  function raceStartData(room) {
    const arc = Math.min(...room.members.map((m) => m.arc), CFG.arcs.length - 1);
    const candidates = CHARS.filter((c) => c.arc <= arc);
    return { arc, target: candidates[Math.floor(Math.random() * candidates.length)].id };
  }

  function updateRaceProfile() {
    rooms?.setProfile({ name: myName() || "Player", game: CFG.id, arc: settings.arc ?? CFG.arcs.length - 1 });
  }

  function startRace(room, data) {
    const target = byId.get(data.target);
    if (!target || !Number.isInteger(data.arc) || target.arc > data.arc) return;
    race = {
      room,
      arc: data.arc,
      startedAt: 0,
      done: false,
      game: { target: target.id, guesses: [], status: "playing", revealed: {} },
      players: new Map(room.members.map((m) => [m.id, {
        id: m.id, name: m.id === rooms.selfId ? myName() || t("you") : m.name, n: 0, last: [], found: false, gaveUp: false, ms: null, left: false,
      }])),
    };
    if (!isOnline()) { settings.mode = "online"; saveSettings(); }
    startGame();
    raceSplash().then(() => {
      if (!race || race.room.id !== room.id) return;
      race.startedAt = Date.now();
      renderRace();
      $("#searchInput").focus();
    });
  }

  function raceSplash() {
    const others = [...race.players.values()].filter((p) => p.id !== rooms.selfId).map((p) => p.name);
    const s = el("div", "vs-splash");
    const left = el("span", "vs-name vs-left");
    left.textContent = myName() || t("you");
    const mark = el("span", "vs-mark", esc(t("vs")));
    const right = el("span", "vs-name vs-right");
    right.textContent = others.join(" · ");
    s.append(left, mark, right);
    document.body.append(s);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    return new Promise((r) => setTimeout(r, reduce ? 0 : 2200))
      .then(() => { s.classList.add("is-out"); return new Promise((r) => setTimeout(r, reduce ? 0 : 350)); })
      .then(() => s.remove());
  }

  // Called after each of my guesses (or when I give up).
  function raceProgress() {
    const me = race.players.get(rooms.selfId);
    const tg = view(game.target);
    const lastId = game.guesses[game.guesses.length - 1];
    me.n = game.guesses.length;
    me.last = lastId ? (() => { const r = compare(view(lastId), tg); return COLS.map((c) => r[c.key].status); })() : [];
    me.found = game.status === "won";
    me.gaveUp = game.status === "lost";
    if (me.found && me.ms == null) me.ms = Date.now() - race.startedAt;
    rooms.broadcast("progress", { n: me.n, last: me.last, found: me.found, gaveUp: me.gaveUp, ms: me.ms });
    renderRace();
    checkRaceEnd();
  }

  function onRaceMessage(type, d, from) {
    if (!race) return;
    const p = race.players.get(from);
    if (!p) return;
    if (type === "progress") {
      p.n = Math.max(0, Math.min(999, Math.floor(Number(d.n) || 0)));
      p.last = Array.isArray(d.last) ? d.last.slice(0, COLS.length).filter((s) => STATUSES.has(s)) : [];
      p.found = !!d.found;
      p.gaveUp = !!d.gaveUp && !p.found;
      p.ms = p.found && Number.isFinite(d.ms) ? Math.max(0, d.ms) : null;
    } else if (type === "left") {
      p.left = true;
    } else return;
    renderRace();
    checkRaceEnd();
  }

  function checkRaceEnd() {
    if (race && !race.done && [...race.players.values()].every((p) => p.found || p.gaveUp || p.left)) finishRace();
  }

  function finishRace() {
    if (!race || race.done) return;
    race.done = true;
    renderRace();
    if (game) renderResult();
  }

  // Found first (fastest, then fewest guesses), then the others.
  const raceRanking = () => [...race.players.values()].sort((a, b) =>
    Number(b.found) - Number(a.found) || (a.ms ?? Infinity) - (b.ms ?? Infinity) || a.n - b.n);

  function leaveRace() {
    race = null;
    rooms?.leave();
    startGame();
  }

  function backToRoom() {
    race = null;
    if (rooms?.isHost()) rooms.reopen();
    startGame();
  }

  function renderRace() {
    const box = $("#raceBox");
    if (!box) return;
    box.hidden = !isOnline();
    if (!isOnline()) return;
    box.textContent = "";
    if (race) renderRaceBoard(box);
    else renderRaceLobby(box);
  }

  function renderRaceBoard(box) {
    const head = el("div", "race-head");
    head.append(el("h2", null, esc(race.done ? t("finalRanking") : t("raceLive"))));
    if (!race.done && race.startedAt) {
      const timer = el("span", "race-timer", clock(Date.now() - race.startedAt));
      head.append(timer);
      clearInterval(renderRaceBoard.timer);
      renderRaceBoard.timer = setInterval(() => {
        if (!race || race.done || !document.body.contains(timer)) return clearInterval(renderRaceBoard.timer);
        timer.textContent = clock(Date.now() - race.startedAt);
      }, 1000);
    }
    box.append(head);
    const list = el("ol", "ranking race-list");
    for (const p of raceRanking()) {
      const li = el("li", `${p.id === rooms.selfId ? "is-me" : ""}${p.found ? " is-found" : ""}${p.left ? " has-left" : ""}`);
      const name = el("span", "ranking-name");
      name.textContent = p.id === rooms.selfId ? `${p.name} (${t("you")})` : p.name;
      const status = p.found ? t("foundIn")(p.n, clock(p.ms)) : p.gaveUp ? t("gaveUpShort") : p.left ? t("left") : t("looking")(p.n);
      const sq = el("span", "race-squares");
      for (const s of p.last) sq.append(el("i", `sq is-${s}`));
      li.append(name, sq, el("span", "race-status", esc(status)));
      list.append(li);
    }
    box.append(list);
    if (race.done) {
      const actions = el("div", "result-actions");
      const leave = el("button", "btn-ghost", esc(t("leave")));
      leave.type = "button";
      leave.addEventListener("click", leaveRace);
      const again = el("button", "btn-primary", esc(t("backRoom")));
      again.type = "button";
      again.addEventListener("click", backToRoom);
      actions.append(leave, again);
      box.append(actions);
    }
  }

  function joinRaceRoom(r) {
    if (!isOnline()) { settings.mode = "online"; saveSettings(); startGame(); }
    if (race) race = null;
    rooms.join(r.id);
    renderRace();
  }

  // Who is around: join the room a player waits in, or invite them into mine.
  function racePeers(box) {
    const around = [...rooms.peers.values()];
    box.append(el("h3", "room-title", esc(t("inLobby")(around.length + 1))));
    if (!around.length) {
      const wrap = el("div", "lobby-alone");
      wrap.append(el("p", "muted", esc(t("aloneHere"))));
      const b = el("button", "btn-ghost btn-small", esc(t("copyLink")));
      b.type = "button";
      b.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(location.href.split("#")[0]); } catch {}
        toast(t("linkCopied"));
      });
      wrap.append(b);
      box.append(wrap);
      return;
    }
    const chips = el("div", "lobby-chips");
    const mine = rooms.myRoom;
    for (const p of around) {
      const chip = el("span", "lobby-chip");
      const name = el("span");
      name.textContent = p.name;
      chip.append(name);
      const theirs = rooms.roomOf(p.id);
      let btn = null;
      if (theirs && theirs.id !== mine?.id) {
        if (theirs.members.length < theirs.size) {
          btn = el("button", "btn-primary btn-small", esc(t("join")));
          btn.addEventListener("click", () => { if (myName()) joinRaceRoom(theirs); else { $("#raceName")?.focus(); toast(t("pickName")); } });
        }
      } else if (!theirs && !(mine && mine.members.length >= mine.size)) {
        btn = el("button", "btn-ghost btn-small", esc(t("invite")));
        btn.addEventListener("click", () => {
          if (!myName()) { $("#raceName")?.focus(); toast(t("pickName")); return; }
          if (rooms.invite(p.id, { game: CFG.id, size: raceSize })) toast(t("inviteSent")(p.name));
        });
      }
      if (btn) { btn.type = "button"; chip.classList.add("has-action"); chip.append(btn); }
      chips.append(chip);
    }
    box.append(chips);
  }

  function renderRaceLobby(box) {
    box.append(el("h2", null, esc(t("raceTitle"))));
    box.append(el("p", "muted", esc(t("raceHelp"))));
    if (!rooms || rooms.status === "connecting") {
      const w = el("p", "lobby-waiting");
      w.append(el("span", "spinner"));
      w.append(t("connecting"));
      box.append(w);
      return;
    }
    if (rooms.status === "offline") { box.append(el("p", "lobby-status is-error", esc(t("offline")))); return; }

    const form = el("form", "lobby-form");
    const input = el("input");
    input.id = "raceName";
    input.maxLength = 20;
    input.placeholder = t("yourName");
    input.setAttribute("aria-label", t("yourName"));
    input.value = myName();
    const save = el("button", "btn-ghost", esc(t("saveName")));
    save.type = "submit";
    form.append(input, save);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = window.DLE_Rooms.cleanName(input.value);
      if (!name) { input.placeholder = t("pickName"); input.focus(); return; }
      try { localStorage.setItem("dle:name", name); } catch {}
      updateRaceProfile();
      toast(t("nameSaved"));
    });
    box.append(form);
    const needName = () => { if (myName()) return false; input.placeholder = t("pickName"); input.focus(); return true; };

    const room = rooms.myRoom;
    if (room) {
      const card = el("div", "room-card");
      const host = room.members.find((m) => m.id === room.host);
      const head = el("div", "room-head");
      const title = el("b");
      title.textContent = t("roomOf")(host?.name ?? "Player");
      head.append(title, el("span", "lobby-badge", `${room.members.length}/${room.size}`));
      card.append(head);
      const seats = el("ul", "room-members");
      for (let i = 0; i < room.size; i++) {
        const m = room.members[i];
        const li = el("li", m ? "is-taken" : "is-free");
        li.append(el("span", "room-seat", String(i + 1)));
        const label = el("span");
        label.textContent = m ? (m.id === rooms.selfId ? `${m.name} (${t("you")})` : m.name) : t("freeSeat");
        li.append(label);
        if (m && m.id === room.host) li.append(el("span", "lobby-badge", esc(t("host"))));
        seats.append(li);
      }
      card.append(seats);
      const actions = el("div", "result-actions");
      if (rooms.isHost()) {
        const start = el("button", "btn-primary", esc(t("startRace")));
        start.type = "button";
        start.disabled = room.members.length < 2;
        start.addEventListener("click", () => rooms.start());
        actions.append(start);
        if (room.members.length < 2) card.append(el("p", "muted", esc(t("needTwo"))));
      } else {
        const w = el("p", "lobby-waiting");
        w.append(el("span", "spinner"));
        w.append(t("waitHost"));
        card.append(w);
      }
      const leave = el("button", "btn-ghost", esc(t("leave")));
      leave.type = "button";
      leave.addEventListener("click", () => rooms.leave());
      actions.append(leave);
      card.append(actions);
      box.append(card);
      racePeers(box);
      return;
    }

    const create = el("div", "room-create");
    create.append(el("span", "room-label", esc(t("players"))));
    const sizes = el("div", "size-picker");
    for (const n of SIZES) {
      const b = el("button", `size-pick${n === raceSize ? " is-active" : ""}`, String(n));
      b.type = "button";
      b.setAttribute("aria-pressed", n === raceSize);
      b.addEventListener("click", () => { raceSize = n; renderRace(); });
      sizes.append(b);
    }
    const go = el("button", "btn-primary", esc(t("createRoom")));
    go.type = "button";
    go.addEventListener("click", () => { if (!needName()) rooms.createRoom({ game: CFG.id, size: raceSize }); });
    create.append(sizes, go);
    box.append(create);

    box.append(el("h3", "room-title", esc(t("openRooms"))));
    const open = rooms.openRooms();
    if (!open.length) box.append(el("p", "muted lobby-empty", esc(t("noRooms"))));
    const list = el("ul", "lobby-list");
    for (const r of open) {
      const li = el("li", "lobby-player same-game");
      const host = r.members.find((m) => m.id === r.host);
      const label = el("span", "lobby-pname");
      label.textContent = t("roomOf")(host?.name ?? "Player");
      li.append(label, el("span", "lobby-badge", `${r.members.length}/${r.size}`));
      const join = el("button", "btn-primary btn-small", esc(t("join")));
      join.type = "button";
      join.addEventListener("click", () => { if (!needName()) rooms.join(r.id); });
      li.append(join);
      list.append(li);
    }
    box.append(list);
    racePeers(box);
  }

  // ── Boot ──
  setupLayout();
  renderCategories();
  renderBackground();
  bindUi();
  bindSearch();
  if (isOnline()) ensureRooms();
  applyLang();
  if (settings.arc == null) {
    renderHero();
    renderStatsBar();
    renderWeekly();
    openArcModal();
  } else {
    startGame();
  }
})();
