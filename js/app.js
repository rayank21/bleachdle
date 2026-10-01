(() => {
  "use strict";

  const CHARS = window.BLEACHDLE_CHARACTERS;
  const ARCS = window.BLEACHDLE_ARCS;
  const I18N = window.BLEACHDLE_I18N;
  const VALUES = window.BLEACHDLE_VALUES;

  const AGE_ORDER = ["0-20", "21-100", "101-500", "501-1000", "1000+"];
  const COLS = ["name", "gender", "race", "age", "hair", "height", "residence", "arc"];
  const HINTS = [
    { key: "affiliation", at: 4 },
    { key: "portrait", at: 8 },
  ];
  const EPOCH = new Date(2026, 0, 1);
  const FLIP_STEP = 170;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ── Storage (browser storage can be unavailable: every access is guarded) ──
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(`bleachdle:${key}`);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(`bleachdle:${key}`, JSON.stringify(value));
      } catch {}
    },
  };

  const settings = Object.assign(
    { lang: (navigator.language || "").startsWith("fr") ? "fr" : "en", arc: null, mode: "daily" },
    store.get("settings", {})
  );
  const saveSettings = () => store.set("settings", settings);

  // ── i18n helpers ──
  const t = (key) => I18N[settings.lang][key];
  const ordinalDivisionFr = (v) => {
    const m = /^(\d+)(?:st|nd|rd|th) Division$/.exec(v);
    return m ? `${m[1]}${m[1] === "1" ? "re" : "e"} Division` : null;
  };
  const tv = (v) => {
    const table = VALUES[settings.lang] || {};
    if (v in table) return table[v];
    if (settings.lang === "fr") return ordinalDivisionFr(v) ?? v;
    return v;
  };
  const arcName = (i) => ARCS[i][settings.lang];

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
  function resolve(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const keys = Object.keys(value).map(Number).sort((a, b) => a - b);
      const k = keys.filter((x) => x <= settings.arc).pop() ?? keys[0];
      return value[k];
    }
    return value;
  }
  const byId = new Map(CHARS.map((c) => [c.id, c]));
  const view = (id) => {
    const c = byId.get(id);
    const out = { id: c.id, name: c.name, image: c.image, arc: c.arc, height: c.height };
    for (const f of ["gender", "race", "age", "hair", "residence", "affiliation"]) out[f] = resolve(c[f]);
    return out;
  };
  const pool = () => CHARS.filter((c) => c.arc <= settings.arc);

  // ── Game state ──
  let game = null;

  const gameKey = () => (settings.mode === "daily" ? `daily:${dateKey()}:${settings.arc}` : `endless:${settings.arc}`);

  function dailyTarget() {
    const p = pool();
    return p[hash(`${dateKey()}|${settings.arc}|bleachdle`) % p.length].id;
  }
  function randomTarget(exclude) {
    const p = pool().filter((c) => c.id !== exclude);
    return p[Math.floor(Math.random() * p.length)].id;
  }

  function loadGame() {
    const saved = store.get(gameKey(), null);
    const valid = saved && byId.has(saved.target) && byId.get(saved.target).arc <= settings.arc;
    game = valid
      ? saved
      : {
          target: settings.mode === "daily" ? dailyTarget() : randomTarget(),
          guesses: [],
          status: "playing",
          revealed: {},
        };
    saveGame();
  }
  const saveGame = () => store.set(gameKey(), game);

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

  function compare(g, tg) {
    const res = {};
    res.name = { status: g.id === tg.id ? "correct" : "wrong" };
    res.gender = { status: g.gender === tg.gender ? "correct" : "wrong" };
    for (const f of ["race", "hair", "residence"]) res[f] = { status: compareSets(g[f], tg[f]) };

    const ga = AGE_ORDER.indexOf(g.age);
    const ta = AGE_ORDER.indexOf(tg.age);
    res.age = { status: g.age === tg.age ? "correct" : "wrong" };
    if (res.age.status !== "correct" && ga >= 0 && ta >= 0) res.age.dir = ta > ga ? "up" : "down";

    res.height = { status: g.height === tg.height ? "correct" : "wrong" };
    if (res.height.status !== "correct") res.height.dir = tg.height > g.height ? "up" : "down";

    res.arc = { status: g.arc === tg.arc ? "correct" : "wrong" };
    if (res.arc.status !== "correct") res.arc.dir = tg.arc > g.arc ? "up" : "down";
    return res;
  }

  function cellText(f, v) {
    switch (f) {
      case "name": return v.name;
      case "gender": return tv(v.gender);
      case "race": case "hair": case "residence": return v[f].map(tv).join(", ");
      case "age": return tv(v.age);
      case "height": return `${v.height} cm`;
      case "arc": return arcName(v.arc);
    }
  }

  // ── Rendering ──
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const arrow = (dir) => (dir ? `<span class="arrow" aria-hidden="true">${dir === "up" ? "▲" : "▼"}</span>` : "");

  function renderHead() {
    const head = $("#boardHead");
    head.innerHTML = "";
    for (const f of COLS) head.append(el("div", `col col-${f}`, esc(t("cols")[f])));
    head.hidden = game.guesses.length === 0;
  }

  function renderRow(id, animate) {
    const g = view(id);
    const tg = view(game.target);
    const res = compare(g, tg);
    const row = el("div", "row");
    COLS.forEach((f, i) => {
      const { status, dir } = res[f];
      const tile = el("div", `tile tile-${f} is-${status}`);
      const dirWord = dir ? (dir === "up" ? " ▲" : " ▼") : "";
      tile.setAttribute("aria-label", `${t("cols")[f]}: ${cellText(f, g)}${dirWord} (${status})`);
      if (f === "name") {
        tile.innerHTML = `<img src="${esc(g.image)}" alt="" loading="lazy" /><span class="tile-caption">${esc(g.name)}</span>`;
      } else {
        tile.innerHTML = `<span class="tile-text">${esc(cellText(f, g))}</span>${arrow(dir)}`;
      }
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
    for (const h of HINTS) {
      const unlocked = n >= h.at || game.status !== "playing";
      const revealed = game.revealed[h.key];
      const label = t(h.key === "affiliation" ? "hintAffiliation" : "hintPortrait");
      const btn = el("button", `hint ${unlocked ? "is-unlocked" : ""} ${revealed ? "is-revealed" : ""}`);
      btn.type = "button";
      btn.disabled = !unlocked || revealed;
      const icon = h.key === "affiliation"
        ? `<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`
        : `<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
      let body;
      if (revealed) {
        body = h.key === "affiliation"
          ? `<strong>${esc(tv(tg.affiliation))}</strong>`
          : `<span class="hint-portrait"><img src="${esc(tg.image)}" alt="" /></span>`;
      } else {
        body = `<small>${unlocked ? t("hintReveal") : t("hintIn")(h.at - n)}</small>`;
      }
      btn.innerHTML = `${icon}<span class="hint-label">${label}</span>${body}`;
      btn.addEventListener("click", () => {
        game.revealed[h.key] = true;
        saveGame();
        renderHints();
      });
      box.append(btn);
    }
    const count = $("#guessCount");
    count.textContent = n ? t("guesses")(n) : "";
  }

  function renderStatsBar() {
    $("#statStreak").textContent = currentStreak(settings.mode);
    $("#statWins").textContent = stats[settings.mode].wins;
    $("#statArc").textContent = settings.arc == null ? "-" : settings.arc + 1;
  }

  function renderHero() {
    $("#heroSub").textContent = t(settings.mode === "daily" ? "subDaily" : "subEndless");
    $("#arcChipName").textContent = settings.arc == null ? "—" : arcName(settings.arc);
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
      return COLS.map((f) => emoji[r[f].status]).join("");
    });
    const shown = lines.length > 8 ? [...lines.slice(0, 7), "…", lines[lines.length - 1]] : lines;
    const title = settings.mode === "daily" ? `Bleachdle #${dayNumber()}` : "Bleachdle ∞";
    const result = game.status === "won" ? t("guesses")(game.guesses.length) : "X";
    return `${title} · ${arcName(settings.arc)} · ${result}\n${shown.join("\n")}`;
  }

  let countdownTimer = null;
  function renderResult() {
    const banner = $("#resultBanner");
    const form = $("#searchForm");
    clearInterval(countdownTimer);
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

  function renderGiveUp() {
    const existing = $("#giveUp");
    if (settings.mode !== "endless" || game.guesses.length === 0) { existing?.remove(); return; }
    if (existing) { existing.textContent = t("giveUp"); return; }
    const b = el("button", "link-btn", esc(t("giveUp")));
    b.id = "giveUp";
    b.type = "button";
    b.addEventListener("click", () => {
      game.status = "lost";
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
    if (game.guesses.length === 0) recordStart();
    game.guesses.push(id);
    const won = id === game.target;
    if (won) {
      game.status = "won";
      recordWin(game.guesses.length);
    }
    saveGame();

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
    if (!nq) return [];
    return pool()
      .filter((c) => !game.guesses.includes(c.id))
      .map((c) => {
        const n = normalize(c.name);
        const words = n.split(" ");
        const score = n.startsWith(nq) ? 0 : words.some((w) => w.startsWith(nq)) ? 1 : n.includes(nq) ? 2 : -1;
        return { c, score };
      })
      .filter((x) => x.score >= 0)
      .sort((a, b) => a.score - b.score || a.c.name.localeCompare(b.c.name))
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
        const li = el("li", i === active ? "is-active" : "", `<img src="${esc(c.image)}" alt="" loading="lazy" /><span>${esc(c.name)}</span>`);
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
    arcDraft = settings.arc ?? ARCS.length - 1;
    renderArcGrid();
    $("#arcConfirm").textContent = settings.arc == null ? t("start") : t("save");
    $("#arcModal").showModal();
  }

  function renderArcGrid() {
    const grid = $("#arcGrid");
    grid.innerHTML = "";
    ARCS.forEach((a, i) => {
      const b = el("button", `arc-card ${i <= arcDraft ? "is-included" : ""} ${i === arcDraft ? "is-selected" : ""}`);
      b.type = "button";
      b.setAttribute("aria-pressed", i === arcDraft);
      const count = CHARS.filter((c) => c.arc <= i).length;
      b.innerHTML = `
        <span class="arc-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="arc-name">${esc(a[settings.lang])}</span>
        <span class="arc-meta">${a.eps === "TYBW" ? "TYBW" : `${t("eps")} ${a.eps}`} · ${count} ${t("chars")}</span>`;
      b.addEventListener("click", () => { arcDraft = i; renderArcGrid(); });
      grid.append(b);
    });
  }

  function openHelp() {
    $("#helpBody").innerHTML = t("helpHtml");
    $("#helpModal").showModal();
  }

  function openStats() {
    const s = stats[settings.mode];
    const buckets = ["1", "2", "3", "4", "5", "6", "7-9", "10+"];
    const bucketOf = (n) => (n <= 6 ? String(n) : n <= 9 ? "7-9" : "10+");
    const dist = Object.fromEntries(buckets.map((b) => [b, 0]));
    for (const [n, c] of Object.entries(s.dist)) dist[bucketOf(Number(n))] += c;
    const max = Math.max(1, ...Object.values(dist));
    const bars = buckets
      .map((b) => `<div class="dist-row"><span>${b}</span><div class="dist-bar" style="--w:${(dist[b] / max) * 100}%"><b>${dist[b]}</b></div></div>`)
      .join("");
    $("#statsBody").innerHTML = `
      <p class="muted center">${t(settings.mode === "daily" ? "modeDaily" : "modeEndless")}</p>
      <div class="stats-grid">
        <div><b>${s.played}</b><span>${t("statsPlayed")}</span></div>
        <div><b>${s.wins}</b><span>${t("statsWins")}</span></div>
        <div><b>${currentStreak(settings.mode)}</b><span>${t("statsStreak")}</span></div>
        <div><b>${s.max}</b><span>${t("statsMax")}</span></div>
      </div>
      <h3>${t("statsDist")}</h3>
      <div class="dist">${bars}</div>`;
    $("#statsModal").showModal();
  }

  function bindUi() {
    $$("[data-lang]").forEach((b) => b.addEventListener("click", () => {
      settings.lang = b.dataset.lang;
      saveSettings();
      applyLang();
      if ($("#arcModal").open) {
        renderArcGrid();
        $("#arcConfirm").textContent = settings.arc == null ? t("start") : t("save");
      }
    }));

    $$("[data-mode]").forEach((b) => b.addEventListener("click", () => {
      if (settings.mode === b.dataset.mode) return;
      settings.mode = b.dataset.mode;
      saveSettings();
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
    $$("[data-i18n]").forEach((n) => { const v = t(n.dataset.i18n); if (typeof v === "string") n.textContent = v; });
    $$("[data-i18n-aria]").forEach((n) => n.setAttribute("aria-label", t(n.dataset.i18nAria)));
    $$("[data-i18n-title]").forEach((n) => { n.title = t(n.dataset.i18nTitle); n.setAttribute("aria-label", n.title); });
    $$("[data-lang]").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === settings.lang));
    $("#searchInput").placeholder = t("placeholder");
    $("#searchInput").setAttribute("aria-label", t("placeholder"));
    if ($("#helpModal").open) $("#helpBody").innerHTML = t("helpHtml");
    if (game) renderAll();
  }

  function renderAll() {
    renderHero();
    renderStatsBar();
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
    const grid = $("#bgGrid");
    const imgs = CHARS.filter((c) => c.image);
    const order = [...imgs, ...imgs]
      .map((c, i) => ({ c, k: hash(`${c.id}:${i}`) }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.c);
    grid.innerHTML = order.map((c) => `<span style="background-image:url('${c.image}')"></span>`).join("");
  }

  // ── Boot ──
  renderBackground();
  bindUi();
  bindSearch();
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
