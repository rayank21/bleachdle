// Player profiles: avatar, name, stats from every game and best Crew Roll crew, saved online
// (netlify/functions/profile.mjs). The browser keeps the profile id and its secret token; the
// recovery code "id.token" logs in on another device. A leaderboard ranks crews and wins.
(() => {
  "use strict";

  const API = "/api/profile";
  const KEY = "dle:profile";
  const GAMES = window.DLE_GAMES || [];
  // Paths are relative to the site root, found from this script's own URL.
  const ROOT = (document.currentScript?.src || "").replace(/shared\/profile\.js.*$/, "");

  const T = {
    en: {
      profile: "Profile", create: "Create your profile", createSub: "Your stats and best crew, saved online and shown on the leaderboard.",
      name: "Name", avatar: "Avatar", save: "Create", saving: "Saving…", have: "Already have a profile?", code: "Recovery code",
      login: "Log in", edit: "Edit", done: "Save", cancel: "Cancel", logout: "Log out", since: (d) => `Member since ${d}`,
      stats: "Stats", wins: "wins", played: "played", streak: "best streak", crew: "Best crew", crewNone: "No crew yet: play Crew Roll!",
      crews: (n) => `${n} crew${n > 1 ? "s" : ""} built`, recovery: "Recovery code", recoveryHelp: "Keep it secret: it logs into your profile on another device.",
      show: "Show", copy: "Copy", copied: "Copied!", board: "Leaderboard", topCrews: "Best crews", topWins: "Most wins", players: (n) => `${n} player${n > 1 ? "s" : ""}`,
      empty: "Nobody yet: be the first!", taken: "This name is taken.", badName: "2 to 20 characters.", badCode: "Unknown code.",
      offline: "Profiles are unavailable right now.", logoutConfirm: "Log out? Keep your recovery code to come back.",
    },
    fr: {
      profile: "Profil", create: "Crée ton profil", createSub: "Tes stats et ton meilleur équipage, sauvegardés en ligne et affichés au classement.",
      name: "Pseudo", avatar: "Avatar", save: "Créer", saving: "Enregistrement…", have: "Déjà un profil ?", code: "Code de récupération",
      login: "Se connecter", edit: "Modifier", done: "Enregistrer", cancel: "Annuler", logout: "Se déconnecter", since: (d) => `Membre depuis le ${d}`,
      stats: "Stats", wins: "victoires", played: "parties", streak: "meilleure série", crew: "Meilleur équipage", crewNone: "Pas encore d'équipage : joue à Roll ton équipage !",
      crews: (n) => `${n} équipage${n > 1 ? "s" : ""} construit${n > 1 ? "s" : ""}`, recovery: "Code de récupération", recoveryHelp: "Garde-le secret : il connecte ton profil sur un autre appareil.",
      show: "Afficher", copy: "Copier", copied: "Copié !", board: "Classement", topCrews: "Meilleurs équipages", topWins: "Plus de victoires", players: (n) => `${n} joueur${n > 1 ? "s" : ""}`,
      empty: "Personne pour l'instant : sois le premier !", taken: "Ce pseudo est déjà pris.", badName: "2 à 20 caractères.", badCode: "Code inconnu.",
      offline: "Les profils sont indisponibles pour l'instant.", logoutConfirm: "Se déconnecter ? Garde ton code de récupération pour revenir.",
    },
  };
  const lang = () => (window.DLE_LANG?.get() === "fr" ? "fr" : "en");
  const t = (k) => T[lang()][k];

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const gameOf = (id) => GAMES.find((g) => g.id === id);
  const portrait = (game, char) => { const g = gameOf(game); return g ? `${ROOT}${g.path}assets/characters/${char}.webp` : ""; };
  const avatarSrc = (a) => (a ? portrait(a.game, a.char) : "");

  // ── Saved session ──
  let session = null; // { id, token, profile }
  try { session = JSON.parse(localStorage.getItem(KEY) || "null"); } catch {}
  const saveSession = () => { try { session ? localStorage.setItem(KEY, JSON.stringify(session)) : localStorage.removeItem(KEY); } catch {} };

  async function api(body) {
    const res = await fetch(API, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : undefined);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || "server"), { code: data.error, status: res.status });
    return data;
  }

  // Stats of every guessing game, read from this browser.
  function localStats() {
    const out = {};
    for (const g of GAMES) {
      let s = null;
      try { s = JSON.parse(localStorage.getItem(`${g.storage}:stats`) || "null"); } catch {}
      if (!s) continue;
      out[g.id] = {};
      for (const m of ["daily", "endless"]) out[g.id][m] = { played: s[m]?.played || 0, wins: s[m]?.wins || 0, max: s[m]?.max || 0 };
    }
    return out;
  }

  function adopt(profile, token) {
    session = { id: profile.id, token: token ?? session?.token, profile };
    saveSession();
    // The profile name is the name in the online bar and the lobbies too.
    try {
      if (localStorage.getItem("dle:name") !== profile.name) {
        localStorage.setItem("dle:name", profile.name);
        window.dispatchEvent(new Event("dle:name"));
      }
    } catch {}
    renderButton();
  }

  let syncTimer;
  function syncStats() {
    if (!session) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
      try { const { profile } = await api({ action: "update", id: session.id, token: session.token, stats: localStats() }); adopt(profile); } catch (e) { if (e.status === 401) logout(true); }
    }, 1200);
  }
  window.addEventListener("dle:stats", syncStats);
  // A name changed in the online bar or a lobby renames the profile too (or is put back if taken).
  window.addEventListener("dle:name", async () => {
    if (!session) return;
    let name = "";
    try { name = localStorage.getItem("dle:name") || ""; } catch {}
    if (!name || name === session.profile.name) return;
    try { const { profile } = await api({ action: "update", id: session.id, token: session.token, name }); adopt(profile); }
    catch { try { localStorage.setItem("dle:name", session.profile.name); } catch {} window.dispatchEvent(new Event("dle:name")); }
  });

  async function recordCrew(crew) {
    if (!session) return;
    try {
      const { profile } = await api({ action: "update", id: session.id, token: session.token, crew });
      adopt(profile);
    } catch {}
  }

  function logout(silent) {
    if (!silent && !confirm(t("logoutConfirm"))) return;
    session = null;
    saveSession();
    renderButton();
    if (dialog?.open) render();
  }

  // ── Top bar button ──
  let button = null;
  function renderButton() {
    const bar = document.querySelector(".topbar-actions");
    if (!bar) return;
    if (!button) {
      button = el("button", "pf-btn");
      button.type = "button";
      button.addEventListener("click", () => open());
      bar.prepend(button);
    }
    button.textContent = "";
    const face = el("span", "pf-btn-face");
    if (session?.profile?.avatar) { const img = el("img"); img.src = avatarSrc(session.profile.avatar); img.alt = ""; face.append(img); }
    else face.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    button.append(face, el("span", "pf-btn-name", session?.profile?.name || t("profile")));
    button.title = t("profile");
  }

  // ── Dialog ──
  let dialog = null;
  let tab = "profile";
  let editing = false;

  function open(which = "profile") {
    if (!dialog) {
      dialog = el("dialog", "modal pf-modal");
      dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
      document.body.append(dialog);
    }
    tab = which;
    editing = false;
    render();
    if (!dialog.open) dialog.showModal();
    if (session) refresh();
  }

  async function refresh() {
    try {
      const res = await fetch(`${API}?id=${encodeURIComponent(session.id)}`);
      if (res.ok) { adopt((await res.json()).profile); if (dialog?.open && tab === "profile" && !editing) render(); }
    } catch {}
  }

  function render() {
    const inner = el("div", "modal-inner pf-inner");
    const close = el("button", "modal-close", "✕");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", () => dialog.close());
    const tabs = el("div", "mode-tabs pf-tabs");
    for (const [id, label] of [["profile", t("profile")], ["board", t("board")]]) {
      const b = el("button", tab === id ? "is-active" : "", label);
      b.type = "button";
      b.addEventListener("click", () => { tab = id; editing = false; render(); });
      tabs.append(b);
    }
    inner.append(close, tabs);
    if (tab === "board") inner.append(boardView());
    else if (!session) inner.append(createView());
    else if (editing) inner.append(editView());
    else inner.append(profileView());
    dialog.replaceChildren(inner);
  }

  // Avatar picker: anime tabs, then that anime's featured characters.
  function avatarPicker(current, onPick) {
    const box = el("div", "pf-picker");
    let game = current?.game || GAMES[0]?.id;
    const animeRow = el("div", "pf-anime");
    const grid = el("div", "pf-grid");
    const draw = () => {
      animeRow.textContent = "";
      for (const g of GAMES) {
        const b = el("button", `pf-anime-btn${g.id === game ? " is-active" : ""}`);
        b.type = "button";
        b.title = g.anime;
        const img = el("img"); img.src = ROOT + g.logo; img.alt = g.anime;
        b.append(img);
        b.addEventListener("click", () => { game = g.id; draw(); });
        animeRow.append(b);
      }
      grid.textContent = "";
      for (const char of gameOf(game)?.featured || []) {
        const on = current?.game === game && current?.char === char;
        const b = el("button", `pf-avatar${on ? " is-active" : ""}`);
        b.type = "button";
        const img = el("img"); img.src = portrait(game, char); img.alt = char; img.loading = "lazy";
        b.append(img);
        b.addEventListener("click", () => { current = { game, char }; onPick(current); draw(); });
        grid.append(b);
      }
    };
    draw();
    box.append(animeRow, grid);
    return box;
  }

  const errorLine = () => el("p", "pf-error");
  function showError(node, e) {
    node.textContent = e.code === "taken" ? t("taken") : e.code === "name" ? t("badName") : e.code === "code" ? t("badCode") : t("offline");
  }

  function createView() {
    const box = el("div", "pf-view");
    box.append(el("h2", "pf-title", t("create")), el("p", "pf-sub muted", t("createSub")));
    let avatar = { game: GAMES[0]?.id, char: GAMES[0]?.featured?.[0] };
    const preview = el("div", "pf-hero-face");
    const pimg = el("img"); pimg.alt = ""; pimg.src = avatarSrc(avatar);
    preview.append(pimg);
    const name = el("input", "pf-input");
    name.maxLength = 20;
    name.placeholder = t("name");
    try { name.value = localStorage.getItem("dle:name") || ""; } catch {}
    const err = errorLine();
    const go = el("button", "btn-primary pf-go", t("save"));
    go.type = "button";
    go.addEventListener("click", async () => {
      go.disabled = true; go.textContent = t("saving"); err.textContent = "";
      try {
        const { profile, token } = await api({ action: "create", name: name.value, avatar, stats: localStats() });
        adopt(profile, token);
        window.DLE_FX?.play("win");
        render();
      } catch (e) { showError(err, e); go.disabled = false; go.textContent = t("save"); }
    });
    box.append(preview, label(t("name"), name), label(t("avatar"), avatarPicker(avatar, (a) => { avatar = a; pimg.src = avatarSrc(a); pimg.classList.remove("pf-pop"); void pimg.offsetWidth; pimg.classList.add("pf-pop"); })), err, go);

    // Log in with a recovery code.
    const sep = el("p", "pf-sep", t("have"));
    const row = el("div", "pf-row");
    const code = el("input", "pf-input");
    code.placeholder = t("code");
    const err2 = errorLine();
    const login = el("button", "btn-ghost", t("login"));
    login.type = "button";
    login.addEventListener("click", async () => {
      err2.textContent = "";
      try { const { profile, token } = await api({ action: "login", code: code.value }); adopt(profile, token); syncStats(); render(); } catch (e) { showError(err2, e); }
    });
    row.append(code, login);
    box.append(sep, row, err2);
    return box;
  }

  function label(text, node) {
    const l = el("div", "pf-field");
    l.append(el("span", "pf-label", text), node);
    return l;
  }

  function editView() {
    const p = session.profile;
    const box = el("div", "pf-view");
    let avatar = p.avatar;
    const preview = el("div", "pf-hero-face");
    const pimg = el("img"); pimg.alt = ""; pimg.src = avatarSrc(avatar);
    preview.append(pimg);
    const name = el("input", "pf-input");
    name.maxLength = 20;
    name.value = p.name;
    const err = errorLine();
    const row = el("div", "pf-row pf-actions");
    const cancel = el("button", "btn-ghost", t("cancel"));
    cancel.type = "button";
    cancel.addEventListener("click", () => { editing = false; render(); });
    const save = el("button", "btn-primary", t("done"));
    save.type = "button";
    save.addEventListener("click", async () => {
      save.disabled = true; err.textContent = "";
      try {
        const { profile } = await api({ action: "update", id: session.id, token: session.token, name: name.value, avatar });
        adopt(profile);
        editing = false;
        render();
      } catch (e) { showError(err, e); save.disabled = false; }
    });
    row.append(cancel, save);
    box.append(preview, label(t("name"), name), label(t("avatar"), avatarPicker(avatar, (a) => { avatar = a; pimg.src = avatarSrc(a); pimg.classList.remove("pf-pop"); void pimg.offsetWidth; pimg.classList.add("pf-pop"); })), err, row);
    return box;
  }

  function profileView() {
    const p = session.profile;
    const box = el("div", "pf-view");
    const hero = el("div", "pf-hero");
    const face = el("div", "pf-hero-face");
    if (p.avatar) { const img = el("img"); img.src = avatarSrc(p.avatar); img.alt = ""; face.append(img); }
    const who = el("div", "pf-who");
    who.append(el("h2", "pf-name", p.name), el("p", "muted pf-since", t("since")(new Date(p.created).toLocaleDateString(lang()))));
    const edit = el("button", "btn-ghost pf-edit", t("edit"));
    edit.type = "button";
    edit.addEventListener("click", () => { editing = true; render(); });
    who.append(edit);
    hero.append(face, who);
    box.append(hero);

    // One tile per anime: wins, games and best streak (daily and endless together).
    box.append(el("h3", "pf-h", t("stats")));
    const grid = el("div", "pf-stats");
    for (const g of GAMES) {
      const s = p.stats?.[g.id] || {};
      const wins = (s.daily?.wins || 0) + (s.endless?.wins || 0);
      const played = (s.daily?.played || 0) + (s.endless?.played || 0);
      const max = Math.max(s.daily?.max || 0, s.endless?.max || 0);
      const tile = el("div", `pf-stat${played ? "" : " is-empty"}`);
      tile.dataset.game = g.id;
      const logo = el("img"); logo.src = ROOT + g.logo; logo.alt = "";
      const nums = el("div", "pf-stat-nums");
      nums.append(el("b", null, String(wins)), el("span", null, `${t("wins")} · ${played} ${t("played")}`), el("span", null, `🔥 ${max} ${t("streak")}`));
      tile.append(logo, nums);
      grid.append(tile);
    }
    box.append(grid);

    // Best Crew Roll crew.
    box.append(el("h3", "pf-h", t("crew")));
    const best = p.crew?.best;
    if (!best) box.append(el("p", "muted", t("crewNone")));
    else {
      const card = el("div", "pf-crew");
      const rank = el("div", `crew-rank rank-${best.rank} pf-rank`, best.rank);
      const info = el("div", "pf-crew-info");
      info.append(el("b", "pf-crew-score", `${best.score.toFixed(1)} / 10`), el("span", "muted", `${gameOf(best.anime)?.anime || ""} · ${t("crews")(p.crew.played || 1)}`));
      const faces = el("div", "pf-crew-faces");
      for (const m of best.members) {
        const f = el("img");
        f.src = portrait(best.anime, m.id);
        f.alt = m.name;
        f.title = `${m.role}: ${m.name} (${m.points})`;
        faces.append(f);
      }
      info.append(faces);
      card.append(rank, info);
      box.append(card);
    }

    // Recovery code and log out.
    box.append(el("h3", "pf-h", t("recovery")));
    const code = `${session.id}.${session.token}`;
    const row = el("div", "pf-row");
    const field = el("input", "pf-input pf-code");
    field.readOnly = true;
    field.type = "password";
    field.value = code;
    const show = el("button", "btn-ghost", t("show"));
    show.type = "button";
    show.addEventListener("click", () => { field.type = field.type === "password" ? "text" : "password"; });
    const copy = el("button", "btn-ghost", t("copy"));
    copy.type = "button";
    copy.addEventListener("click", async () => { try { await navigator.clipboard.writeText(code); copy.textContent = t("copied"); setTimeout(() => (copy.textContent = t("copy")), 1500); } catch {} });
    row.append(field, show, copy);
    const out = el("button", "link-btn pf-logout", t("logout"));
    out.type = "button";
    out.addEventListener("click", () => logout());
    box.append(row, el("p", "muted pf-help", t("recoveryHelp")), out);
    return box;
  }

  function boardView() {
    const box = el("div", "pf-view");
    const status = el("p", "muted pf-players", "…");
    const cols = el("div", "pf-board");
    box.append(status, cols);
    fetch(`${API}?leaderboard=1`).then((r) => (r.ok ? r.json() : Promise.reject())).then((data) => {
      status.textContent = t("players")(data.players);
      cols.append(
        boardList(t("topCrews"), data.crews, (r) => { const v = el("span", "pf-val"); v.append(el("i", `pf-mini-rank rank-${r.rank}`, r.rank), ` ${r.score.toFixed(1)}`); return v; }),
        boardList(t("topWins"), data.wins, (r) => el("span", "pf-val", `${r.wins}`)),
      );
    }).catch(() => { status.textContent = t("offline"); });
    return box;
  }

  function boardList(title, rows, value) {
    const col = el("div", "pf-col");
    col.append(el("h3", "pf-h", title));
    if (!rows.length) { col.append(el("p", "muted", t("empty"))); return col; }
    const ol = el("ol", "pf-list");
    rows.forEach((r, i) => {
      const li = el("li", `pf-li${r.id === session?.id ? " is-me" : ""}${i < 3 ? ` top-${i + 1}` : ""}`);
      li.style.animationDelay = `${i * 40}ms`;
      const face = el("span", "pf-li-face");
      if (r.avatar) { const img = el("img"); img.src = avatarSrc(r.avatar); img.alt = ""; face.append(img); }
      li.append(el("span", "pf-pos", String(i + 1)), face, el("span", "pf-li-name", r.name), value(r));
      ol.append(li);
    });
    col.append(ol);
    return col;
  }

  window.addEventListener("dle:lang", () => { renderButton(); if (dialog?.open) render(); });

  function init() {
    renderButton();
    if (session) { refresh(); syncStats(); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.DLE_Profile = { open, recordCrew, get current() { return session?.profile ?? null; } };
})();
