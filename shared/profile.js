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
      myStats: "My stats", ovPlayed: "Games played", ovPlayedSub: (g, c) => `${g} guessing · ${c} crews`, ovWins: "Wins", ovRate: (r) => `${r}% win rate`,
      ovRolls: "Rolls", ovRerolls: (n) => `${n} reroll${n === 1 ? "" : "s"}`, ovGuesses: "Guesses", ovPerWin: (a) => `${a} per win`, ovStreak: "Best streak",
      ovStreakSub: "in a row", ovCrews: "Crews built", ovBest: (s, r) => `best ${s} (${r})`, ovDuels: "Online matches", ovDuelWins: (n) => `${n} won`,
      ovTime: "Time played", ovFav: (a) => `favourite: ${a}`,
      stats: "Stats", wins: "wins", played: "played", streak: "best streak", crew: "Best crew", crewNone: "No crew yet: play Crew Roll!",
      crews: (n) => `${n} crew${n > 1 ? "s" : ""} built`, recovery: "Recovery code", recoveryHelp: "Keep it secret: it logs into your profile on another device.",
      show: "Show", copy: "Copy", copied: "Copied!", board: "Leaderboard", topCrews: "Best crews", topWins: "Most wins", allAnime: "All", players: (n) => `${n} player${n > 1 ? "s" : ""}`,
      empty: "Nobody yet: be the first!", taken: "This name is taken.", badName: "2 to 20 characters.", badCode: "Unknown code.",
      duels: (n, w) => `${n} online match${n > 1 ? "es" : ""} · ${w} won`,
      offline: "Profiles are unavailable right now.", logoutConfirm: "Log out? Keep your recovery code to come back.",
      friends: "Friends", addFriend: "Add a friend", friendName: "Their name", add: "Add", requests: "Friend requests",
      accept: "Accept", decline: "Decline", noFriends: "No friends yet: add one by their profile name.",
      needProfile: "Create a profile to add friends and join them in one click.", sent: (n) => `Request sent to ${n}.`,
      nobody: "No profile with this name.", self: "That's you!", onlineIn: (g) => `Online · ${g}`, offlineNow: "Offline",
      inRoom: (code) => `Waiting in room ${code}`, joinRoom: "Join", invite: "Invite", invitedOk: "Invited!",
      remove: "Remove", removeConfirm: (n) => `Remove ${n} from your friends?`, home: "home page", crewRoll: "Crew Roll",
      inviteHelp: "Open a room (Crew Roll or an online race) to invite your friends.",
      invites: "Invitations", invitesYou: (g, code) => `invites you · ${g} · room ${code}`, invitedOffline: "Invited! They'll see it when they come back.",
      achievements: (a, b) => `Achievements · ${a} / ${b}`, unlocked: "Achievement unlocked!", collection: "Crew Roll collection",
      collectionSub: (a, b) => `${a} / ${b} cards drawn`, season: (m) => `Season · ${m}`, allTime: "All time", seasonEnds: (d) => `ends in ${d} day${d > 1 ? "s" : ""}`,
      champions: (m) => `Champions of ${m}`, seasonCrews: "Best crews this month", seasonWins: "Most wins this month",
    },
    fr: {
      profile: "Profil", create: "Crée ton profil", createSub: "Tes stats et ton meilleur équipage, sauvegardés en ligne et affichés au classement.",
      name: "Pseudo", avatar: "Avatar", save: "Créer", saving: "Enregistrement…", have: "Déjà un profil ?", code: "Code de récupération",
      login: "Se connecter", edit: "Modifier", done: "Enregistrer", cancel: "Annuler", logout: "Se déconnecter", since: (d) => `Membre depuis le ${d}`,
      myStats: "Mes stats", ovPlayed: "Parties jouées", ovPlayedSub: (g, c) => `${g} devinettes · ${c} équipages`, ovWins: "Victoires", ovRate: (r) => `${r} % de victoires`,
      ovRolls: "Rolls", ovRerolls: (n) => `${n} relance${n > 1 ? "s" : ""}`, ovGuesses: "Essais", ovPerWin: (a) => `${a} par victoire`, ovStreak: "Meilleure série",
      ovStreakSub: "d'affilée", ovCrews: "Équipages construits", ovBest: (s, r) => `meilleur ${s} (${r})`, ovDuels: "Matchs en ligne", ovDuelWins: (n) => `${n} gagné${n > 1 ? "s" : ""}`,
      ovTime: "Temps de jeu", ovFav: (a) => `préféré : ${a}`,
      stats: "Stats", wins: "victoires", played: "parties", streak: "meilleure série", crew: "Meilleur équipage", crewNone: "Pas encore d'équipage : joue à Roll ton équipage !",
      crews: (n) => `${n} équipage${n > 1 ? "s" : ""} construit${n > 1 ? "s" : ""}`, recovery: "Code de récupération", recoveryHelp: "Garde-le secret : il connecte ton profil sur un autre appareil.",
      show: "Afficher", copy: "Copier", copied: "Copié !", board: "Classement", topCrews: "Meilleurs équipages", topWins: "Plus de victoires", allAnime: "Tous", players: (n) => `${n} joueur${n > 1 ? "s" : ""}`,
      empty: "Personne pour l'instant : sois le premier !", taken: "Ce pseudo est déjà pris.", badName: "2 à 20 caractères.", badCode: "Code inconnu.",
      duels: (n, w) => `${n} match${n > 1 ? "s" : ""} en ligne · ${w} gagné${w > 1 ? "s" : ""}`,
      offline: "Les profils sont indisponibles pour l'instant.", logoutConfirm: "Se déconnecter ? Garde ton code de récupération pour revenir.",
      friends: "Amis", addFriend: "Ajouter un ami", friendName: "Son pseudo", add: "Ajouter", requests: "Demandes d'ami",
      accept: "Accepter", decline: "Refuser", noFriends: "Pas encore d'amis : ajoute-en un avec son pseudo de profil.",
      needProfile: "Crée un profil pour ajouter des amis et les rejoindre en un clic.", sent: (n) => `Demande envoyée à ${n}.`,
      nobody: "Aucun profil avec ce pseudo.", self: "C'est toi !", onlineIn: (g) => `En ligne · ${g}`, offlineNow: "Hors ligne",
      inRoom: (code) => `Attend dans la salle ${code}`, joinRoom: "Rejoindre", invite: "Inviter", invitedOk: "Invité !",
      remove: "Retirer", removeConfirm: (n) => `Retirer ${n} de tes amis ?`, home: "accueil", crewRoll: "Roll ton équipage",
      inviteHelp: "Ouvre une salle (Roll ton équipage ou une course en ligne) pour inviter tes amis.",
      invites: "Invitations", invitesYou: (g, code) => `t'invite · ${g} · salle ${code}`, invitedOffline: "Invité ! Il le verra en revenant.",
      achievements: (a, b) => `Succès · ${a} / ${b}`, unlocked: "Succès débloqué !", collection: "Collection Roll ton équipage",
      collectionSub: (a, b) => `${a} / ${b} cartes tirées`, season: (m) => `Saison · ${m}`, allTime: "Tout temps", seasonEnds: (d) => `fin dans ${d} jour${d > 1 ? "s" : ""}`,
      champions: (m) => `Champions de ${m}`, seasonCrews: "Meilleurs équipages du mois", seasonWins: "Plus de victoires du mois",
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
      for (const m of ["daily", "endless", "online"]) out[g.id][m] = { played: s[m]?.played || 0, wins: s[m]?.wins || 0, max: s[m]?.max || 0 };
    }
    return out;
  }

  function adopt(profile, token) {
    const sent = token ? false : !!session?.collectionSent;
    session = { id: profile.id, token: token ?? session?.token, profile, collectionSent: sent };
    if (!sent) { clearTimeout(countTimer); countTimer = setTimeout(flushCounters, 1500); }
    saveSession();
    // The profile name is the name in the online bar and the lobbies too.
    try {
      if (localStorage.getItem("dle:name") !== profile.name) {
        localStorage.setItem("dle:name", profile.name);
        window.dispatchEvent(new Event("dle:name"));
      }
    } catch {}
    renderButton();
    window.dispatchEvent(new Event("dle:profile"));
    checkAchievements();
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

  // Activity counters (rolls, rerolls, guesses, seconds played): kept in this browser until the profile gets them.
  const PENDING = "dle:pending-counters";
  const pending = () => { try { return JSON.parse(localStorage.getItem(PENDING) || "{}"); } catch { return {}; } };
  let countTimer;
  function count(key, n = 1) {
    const p = pending();
    p[key] = (p[key] || 0) + n;
    try { localStorage.setItem(PENDING, JSON.stringify(p)); } catch {}
    clearTimeout(countTimer);
    countTimer = setTimeout(flushCounters, 4000);
  }
  async function flushCounters(keepalive = false) {
    const add = pending();
    // A profile made after some rolls gets this browser's whole collection.
    const collectNow = session && !session.collectionSent ? readJSON(COLLECTION) : readJSON(PENDING_COLLECT);
    if (!session || (!Object.keys(add).length && !Object.keys(collectNow).length)) return;
    try { localStorage.removeItem(PENDING); localStorage.removeItem(PENDING_COLLECT); } catch {}
    try {
      const res = await fetch(API, { method: "POST", keepalive, headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "update", id: session.id, token: session.token, add, collect: collectNow }) });
      if (!res.ok) throw new Error();
      session.collectionSent = true;
      saveSession();
      if (!keepalive) adopt((await res.json()).profile);
    } catch {
      // Not sent: put them back for next time.
      const back = pending();
      for (const [k, v] of Object.entries(add)) back[k] = (back[k] || 0) + v;
      try { localStorage.setItem(PENDING, JSON.stringify(back)); } catch {}
      const pend = readJSON(PENDING_COLLECT);
      for (const [g, ids] of Object.entries(collectNow)) pend[g] = [...new Set([...(pend[g] ?? []), ...ids])];
      writeJSON(PENDING_COLLECT, pend);
    }
  }
  // Crew Roll collection: every character drawn, per anime. This browser keeps its own copy (it works without a
  // profile); new cards wait in PENDING_COLLECT until the profile has them.
  const COLLECTION = "dle:collection";
  const PENDING_COLLECT = "dle:pending-collect";
  const readJSON = (k) => { try { return JSON.parse(localStorage.getItem(k) || "{}") || {}; } catch { return {}; } };
  const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  function collectionOf(game) {
    return new Set([...(readJSON(COLLECTION)[game] ?? []), ...(session?.profile?.collection?.[game] ?? [])]);
  }
  // Returns true the first time this card is drawn.
  function collect(game, id) {
    if (!game || !id) return false;
    const isNew = !collectionOf(game).has(id);
    const local = readJSON(COLLECTION);
    local[game] = [...new Set([...(local[game] ?? []), id])];
    writeJSON(COLLECTION, local);
    if (isNew) {
      const pend = readJSON(PENDING_COLLECT);
      pend[game] = [...new Set([...(pend[game] ?? []), id])];
      writeJSON(PENDING_COLLECT, pend);
      clearTimeout(countTimer);
      countTimer = setTimeout(flushCounters, 4000);
      checkAchievements();
    }
    return isNew;
  }

  // Time played: every half minute the page is in front.
  setInterval(() => { if (!document.hidden) count("seconds", 30); }, 30000);
  window.addEventListener("pagehide", () => flushCounters(true));

  async function recordCrew(crew) {
    if (!session) return;
    try {
      const { profile } = await api({ action: "update", id: session.id, token: session.token, crew });
      adopt(profile);
    } catch {}
  }

  // A Crew Roll online match: counted on the profile, and its wins on the leaderboard.
  async function recordDuel(won) {
    if (!session) return;
    try { const { profile } = await api({ action: "update", id: session.id, token: session.token, duel: { won: !!won } }); adopt(profile); } catch {}
  }

  function logout(silent) {
    if (!silent && !confirm(t("logoutConfirm"))) return;
    session = null;
    saveSession();
    setFriends({ friends: [], requests: [] });
    window.dispatchEvent(new Event("dle:profile"));
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
    const pending = friendState.requests.length + friendState.invites.length;
    if (pending) button.append(el("span", "pf-btn-badge", String(pending)));
    button.title = t("profile");
  }

  // ── Dialog ──
  let dialog = null;
  let tab = "profile";
  let editing = false;

  // `anime` opens the leaderboard on that anime's best crews.
  function open(which = "profile", { anime } = {}) {
    if (anime) boardAnime = anime;
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
    if (session && which === "friends") loadFriends();
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
    for (const [id, label] of [["profile", t("profile")], ["friends", t("friends")], ["board", t("board")]]) {
      const b = el("button", tab === id ? "is-active" : "", label);
      b.type = "button";
      b.addEventListener("click", () => { tab = id; editing = false; render(); });
      tabs.append(b);
    }
    inner.append(close, tabs);
    if (tab === "board") inner.append(boardView());
    else if (tab === "friends") inner.append(friendsView());
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

  // ── Achievements: worked out from the profile (stats, counters, crews, collection, friends, seasons) ──
  const ACH_ICONS = {
    trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3",
    flame: "M12 22c4 0 7-3 7-7 0-5-5-7-5-13-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 9 0 4 3 7 7 7z",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20",
    dice: "M4 4h16v16H4zM8.5 8.5h.01M15.5 15.5h.01M12 12h.01M15.5 8.5h.01M8.5 15.5h.01",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    star: "M12 2l3 6.5 7 1-5 5 1.2 7L12 18l-6.2 3.5L7 14.5l-5-5 7-1z",
    swords: "M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M9.5 17.5 21 6V3h-3L6.5 14.5M11 19l-6-6M8 16l-4 4",
    cards: "M4 6h12v14H4zM8 2h12v14",
    heart: "M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z",
    clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
    crown: "M3 18h18M4 8l4 4 4-7 4 7 4-4-2 10H6z",
  };
  // [id, icon, tier, goal, value(ctx), name en, name fr, how en, how fr]
  const ACHIEVEMENTS = [
    ["win1", "trophy", "bronze", 1, (c) => c.wins, "First win", "Première victoire", "Win a game", "Gagne une partie"],
    ["win50", "trophy", "silver", 50, (c) => c.wins, "Regular", "Habitué", "Win 50 games", "Gagne 50 parties"],
    ["win250", "trophy", "gold", 250, (c) => c.wins, "Legend", "Légende", "Win 250 games", "Gagne 250 parties"],
    ["streak5", "flame", "bronze", 5, (c) => c.streak, "On fire", "En feu", "A streak of 5 wins", "Une série de 5 victoires"],
    ["streak15", "flame", "gold", 15, (c) => c.streak, "Unstoppable", "Inarrêtable", "A streak of 15 wins", "Une série de 15 victoires"],
    ["oneshot", "eye", "silver", 1, (c) => c.oneShot, "At first sight", "Du premier coup", "Find a character on the first guess", "Trouve un perso au premier essai"],
    ["modes", "eye", "bronze", 2, (c) => c.modes, "Sharp eye", "Œil de lynx", "Win a Blurred game and a Description game", "Gagne une partie Flou et une Description"],
    ["world", "globe", "silver", 8, (c) => c.animePlayed, "World tour", "Tour du monde", "Play all 8 anime", "Joue aux 8 animes"],
    ["roll100", "dice", "bronze", 100, (c) => c.rolls, "Roller", "Rouleur", "Roll 100 times", "Fais 100 rolls"],
    ["roll1000", "dice", "gold", 1000, (c) => c.rolls, "Roll addict", "Accro au roll", "Roll 1,000 times", "Fais 1 000 rolls"],
    ["crew25", "shield", "silver", 25, (c) => c.crews, "Builder", "Bâtisseur", "Build 25 crews", "Construis 25 équipages"],
    ["rankS", "star", "gold", 1, (c) => c.rankS, "S rank", "Rang S", "Build an S-rank crew", "Construis un équipage de rang S"],
    ["duel10", "swords", "silver", 10, (c) => c.onlineWins, "Duelist", "Duelliste", "Win 10 online games", "Gagne 10 parties en ligne"],
    ["coll100", "cards", "silver", 100, (c) => c.cards, "Collector", "Collectionneur", "Draw 100 different cards", "Tire 100 cartes différentes"],
    ["collfull", "cards", "gold", 1, (c) => c.fullAnime, "Completionist", "Complétiste", "Complete an anime's collection", "Complète la collection d'un animé"],
    ["friend", "heart", "bronze", 1, (c) => c.friends, "Not alone", "Pas tout seul", "Add a friend", "Ajoute un ami"],
    ["time10", "clock", "silver", 10, (c) => c.hours, "Marathon", "Marathon", "Play for 10 hours", "Joue 10 heures"],
    ["podium", "crown", "gold", 1, (c) => c.podium, "Season podium", "Podium de saison", "Finish in a season's top 3", "Finis dans le top 3 d'une saison"],
  ];
  let lastBoard = null; // the latest leaderboard, for the season podium
  function achContext(p) {
    const stats = Object.values(p.stats ?? {});
    const modes = (m) => stats.reduce((a, x) => a + (x?.[m]?.wins || 0), 0);
    const c = p.counters ?? {};
    let cards = 0;
    let fullAnime = 0;
    for (const g of GAMES) {
      const n = collectionOf(g.id).size;
      cards += n;
      if (g.count && n >= g.count) fullAnime++;
    }
    const podium = (lastBoard?.podiums ?? []).some((s) => [...(s.crews ?? []), ...(s.wins ?? [])].some((r) => r.id === p.id)) ? 1 : 0;
    return {
      wins: modes("daily") + modes("endless") + modes("online") + (p.crew?.duelWins || 0),
      streak: Math.max(0, ...stats.flatMap((x) => Object.values(x ?? {}).map((m) => m?.max || 0))),
      oneShot: c.oneShot || 0,
      modes: (c.blurWins ? 1 : 0) + (c.descWins ? 1 : 0),
      animePlayed: Object.values(p.stats ?? {}).filter((x) => Object.values(x ?? {}).some((m) => m?.played)).length,
      rolls: c.rolls || 0,
      crews: p.crew?.played || 0,
      rankS: p.crew?.best?.rank === "S" ? 1 : 0,
      onlineWins: modes("online") + (p.crew?.duelWins || 0),
      cards, fullAnime,
      friends: friendState.friends.length,
      hours: Math.floor((c.seconds || 0) / 3600),
      podium,
    };
  }
  function achievements(p) {
    const ctx = achContext(p);
    return ACHIEVEMENTS.map(([id, icon, tier, goal, value, en, fr, howEn, howFr]) => {
      const v = Math.min(goal, value(ctx) || 0);
      return { id, icon, tier, goal, value: v, done: v >= goal, name: lang() === "fr" ? fr : en, how: lang() === "fr" ? howFr : howEn };
    });
  }
  // A toast for each achievement unlocked since last time. The first time, the ones already earned are just noted.
  const ACH_SEEN = "dle:ach-seen";
  function checkAchievements() {
    if (!session?.profile) return;
    const done = achievements(session.profile).filter((a) => a.done);
    let seen = null;
    try { seen = JSON.parse(localStorage.getItem(ACH_SEEN) || "null"); } catch {}
    const fresh = seen ? done.filter((a) => !seen.includes(a.id)) : [];
    try { localStorage.setItem(ACH_SEEN, JSON.stringify(done.map((a) => a.id).concat(seen ?? []).filter((x, i, l) => l.indexOf(x) === i))); } catch {}
    fresh.forEach((a, i) => setTimeout(() => achToast(a), i * 4800));
  }
  function achBadge(a) {
    const b = el("span", `ach-badge tier-${a.tier}${a.done ? " is-done" : ""}`);
    b.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22"><path d="${ACH_ICONS[a.icon]}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return b;
  }
  function achToast(a) {
    const box = el("div", `ach-toast tier-${a.tier}`);
    const text = el("div", "ach-toast-text");
    text.append(el("span", "ach-toast-kicker", t("unlocked")), el("b", null, a.name), el("span", "ach-toast-how", a.how));
    box.append(achBadge(a), text);
    box.addEventListener("click", () => { box.remove(); open("profile"); });
    document.body.append(box);
    window.DLE_FX?.play("win");
    setTimeout(() => box.classList.add("is-out"), 4200);
    setTimeout(() => box.remove(), 4700);
  }
  function achievementsView(p) {
    const list = achievements(p);
    const box = el("div", "ach-grid");
    for (const a of list.sort((x, y) => y.done - x.done)) {
      const tile = el("div", `ach-tile tier-${a.tier}${a.done ? " is-done" : ""}`);
      const text = el("div", "ach-text");
      text.append(el("b", "ach-name", a.name), el("span", "ach-how", a.how));
      if (!a.done && a.goal > 1) {
        const bar = el("span", "ach-bar");
        const fill = el("i");
        fill.style.width = `${(a.value / a.goal) * 100}%`;
        bar.append(fill);
        text.append(bar, el("span", "ach-count", `${fmt(a.value)} / ${fmt(a.goal)}`));
      }
      tile.append(achBadge(a), text);
      box.append(tile);
    }
    return [el("h3", "pf-h", t("achievements")(list.filter((a) => a.done).length, list.length)), box];
  }
  // Collection: one bar per anime.
  function collectionView() {
    const box = el("div", "pf-coll");
    let all = 0;
    let total = 0;
    for (const g of GAMES) {
      const n = collectionOf(g.id).size;
      all += n;
      total += g.count || 0;
      const row = el("div", `pf-coll-row${n >= g.count ? " is-full" : ""}`);
      const logo = el("img");
      logo.src = ROOT + g.logo;
      logo.alt = "";
      const bar = el("span", "pf-coll-bar");
      const fill = el("i");
      fill.style.width = `${Math.min(100, (n / Math.max(1, g.count)) * 100)}%`;
      bar.append(fill);
      row.append(logo, el("span", "pf-coll-name", g.anime), bar, el("span", "pf-coll-n", `${n} / ${g.count}`));
      box.append(row);
    }
    return [el("h3", "pf-h", t("collection")), el("p", "muted pf-coll-sub", t("collectionSub")(all, total)), box];
  }

  // Overview: totals over every game, with the counters kept by the profile.
  const OV_ICONS = {
    games: "M6 11h4M8 9v4M15 12h.01M18 10h.01M17.3 5H6.7a4 4 0 0 0-4 3.6L2 15a3 3 0 0 0 5.5 2l1.2-2h6.6l1.2 2A3 3 0 0 0 22 15l-.7-6.4A4 4 0 0 0 17.3 5z",
    trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3",
    dice: "M4 4h16v16H4zM8.5 8.5h.01M15.5 15.5h.01M12 12h.01M15.5 8.5h.01M8.5 15.5h.01",
    search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5",
    flame: "M12 22c4 0 7-3 7-7 0-5-5-7-5-13-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 9 0 4 3 7 7 7z",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    swords: "M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 17.5 21 6V3h-3L6.5 14.5M11 19l-6-6M8 16l-4 4M5 21l-2-2",
    clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
  };
  const OV_RGB = { games: "90, 170, 255", trophy: "255, 200, 60", dice: "255, 90, 120", search: "120, 230, 170", flame: "255, 130, 50", shield: "170, 140, 255", swords: "255, 110, 200", clock: "90, 220, 230" };
  const fmt = (n) => Math.round(n).toLocaleString(lang());
  function overview(p) {
    const stats = Object.values(p.stats ?? {});
    const sumOf = (k) => stats.reduce((a, modes) => a + Object.values(modes).reduce((b, x) => b + (x?.[k] || 0), 0), 0);
    const guessPlayed = sumOf("played");
    const guessWins = sumOf("wins");
    const crew = p.crew ?? {};
    const c = p.counters ?? {};
    const played = guessPlayed + (crew.played || 0) + (crew.duels || 0);
    const wins = guessWins + (crew.duelWins || 0);
    const best = Math.max(0, ...stats.flatMap((modes) => Object.values(modes).map((x) => x?.max || 0)));
    // Favourite anime: the most played guessing game.
    let fav = null;
    for (const [g, modes] of Object.entries(p.stats ?? {})) {
      const n = Object.values(modes).reduce((a, x) => a + (x?.played || 0), 0);
      if (n && (!fav || n > fav.n)) fav = { g, n };
    }
    const secs = c.seconds || 0;
    const time = secs >= 3600 ? `${Math.floor(secs / 3600)} h ${String(Math.floor((secs % 3600) / 60)).padStart(2, "0")}` : `${Math.floor(secs / 60)} min`;
    const tiles = [
      ["games", played, t("ovPlayed"), t("ovPlayedSub")(guessPlayed, crew.played || 0)],
      ["trophy", wins, t("ovWins"), played ? t("ovRate")(Math.round((wins / Math.max(1, guessPlayed + (crew.duels || 0))) * 100)) : "—"],
      ["dice", c.rolls || 0, t("ovRolls"), t("ovRerolls")(c.rerolls || 0)],
      ["search", c.guesses || 0, t("ovGuesses"), guessWins ? t("ovPerWin")(((c.guesses || 0) / guessWins).toFixed(1)) : "—"],
      ["flame", best, t("ovStreak"), t("ovStreakSub")],
      ["shield", crew.played || 0, t("ovCrews"), crew.best ? t("ovBest")(crew.best.score.toFixed(1), crew.best.rank) : "—"],
      ["swords", crew.duels || 0, t("ovDuels"), t("ovDuelWins")(crew.duelWins || 0)],
      ["clock", null, t("ovTime"), fav ? t("ovFav")(gameOf(fav.g)?.anime ?? "") : "—", time],
    ];
    const grid = el("div", "pf-ov");
    tiles.forEach(([icon, value, label, sub, text], i) => {
      const tile = el("div", "pf-ov-tile");
      tile.style.setProperty("--ov-rgb", OV_RGB[icon]);
      tile.style.animationDelay = `${i * 40}ms`;
      const ic = el("span", "pf-ov-icon");
      ic.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20"><path d="${OV_ICONS[icon]}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      const num = el("b", "pf-ov-num", text ?? "0");
      if (text == null) countUp(num, value);
      tile.append(ic, num, el("span", "pf-ov-label", label), el("span", "pf-ov-sub", sub));
      grid.append(tile);
    });
    return grid;
  }
  // Numbers roll up when the profile opens.
  function countUp(node, to) {
    if (!to || matchMedia("(prefers-reduced-motion: reduce)").matches) { node.textContent = fmt(to || 0); return; }
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 700);
      node.textContent = fmt(to * (1 - (1 - k) ** 3));
      if (k < 1 && node.isConnected) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
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

    box.append(el("h3", "pf-h", t("myStats")), overview(p));
    box.append(...achievementsView(p));
    box.append(...collectionView());
    // The season podium needs the leaderboard: fetched once, then the achievements are drawn again.
    if (!lastBoard) leaderboard().then(() => { if (dialog?.open && tab === "profile" && !editing) render(); }).catch(() => {});

    // One tile per anime: wins, games and best streak (daily and endless together).
    box.append(el("h3", "pf-h", t("stats")));
    const grid = el("div", "pf-stats");
    for (const g of GAMES) {
      const s = p.stats?.[g.id] || {};
      const wins = (s.daily?.wins || 0) + (s.endless?.wins || 0) + (s.online?.wins || 0);
      const played = (s.daily?.played || 0) + (s.endless?.played || 0) + (s.online?.played || 0);
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
    if (!best) box.append(el("p", "muted", p.crew?.duels ? t("duels")(p.crew.duels, p.crew.duelWins || 0) : t("crewNone")));
    else {
      const card = el("div", "pf-crew");
      const rank = el("div", `crew-rank rank-${best.rank} pf-rank`, best.rank);
      const info = el("div", "pf-crew-info");
      info.append(el("b", "pf-crew-score", `${best.score.toFixed(1)} / 10`), el("span", "muted", `${gameOf(best.anime)?.anime || ""} · ${t("crews")(p.crew.played || 1)}`));
      if (p.crew.duels) info.append(el("span", "muted", t("duels")(p.crew.duels, p.crew.duelWins || 0)));
      const faces = el("div", "pf-crew-faces");
      for (const m of best.members) {
        const f = el("img");
        f.loading = "lazy";
        f.decoding = "async";
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

  // ── Friends ──
  // The list lives on the server; who is online and in which room comes from the online bar (presence.js).
  let friendState = { friends: [], requests: [], invites: [] };
  let friendNote = "";
  let friendDraft = "";
  const invited = new Map(); // friend id → { code of the room they were invited to, button text }
  function setFriends(data) {
    const list = (x) => (Array.isArray(x) ? x : []);
    friendState = { friends: list(data?.friends), requests: list(data?.requests), invites: list(data?.invites) };
    renderButton();
    announceInvites();
    window.dispatchEvent(new Event("dle:friends"));
    if (dialog?.open && tab === "friends") render();
  }
  async function friendCall(body) {
    const data = await api({ ...body, id: session.id, token: session.token });
    setFriends(data);
    return data;
  }
  // Each invitation pops up once as a banner (on any page); it stays in the friends tab until used or dismissed.
  function announceInvites() {
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem("dle:invites-seen") || "[]"); } catch {}
    for (const inv of friendState.invites) {
      const key = `${inv.from}:${inv.at}`;
      if (seen.includes(key)) continue;
      seen.push(key);
      window.DLE_Presence?.showInvite(inv.name, inv.room, () => clearInvite(inv.from));
    }
    try { localStorage.setItem("dle:invites-seen", JSON.stringify(seen.slice(-40))); } catch {}
  }
  async function clearInvite(from) {
    if (!session) return;
    try { await friendCall({ action: "invite-clear", from }); } catch {}
  }
  const roomPlace = (room) => (room.channel === "crew" ? t("crewRoll") : gameOf(room.game)?.brand ?? "");

  async function loadFriends() {
    if (!session) return;
    try { await friendCall({ action: "friends" }); } catch (e) { if (e.status === 401) logout(true); }
  }

  function friendsView() {
    const box = el("div", "pf-view pf-friends");
    if (!session) {
      box.append(el("p", "muted", t("needProfile")));
      const go = el("button", "btn-primary", t("create"));
      go.type = "button";
      go.addEventListener("click", () => { tab = "profile"; render(); });
      box.append(go);
      return box;
    }

    // Add by profile name.
    box.append(el("h3", "pf-h", t("addFriend")));
    const form = el("form", "pf-row");
    const input = el("input", "pf-input");
    input.maxLength = 20;
    input.placeholder = t("friendName");
    // The tab re-renders when friends come and go: keep what is being typed.
    input.value = friendDraft;
    input.addEventListener("input", () => { friendDraft = input.value; });
    input.classList.add("pf-friend-input");
    if (document.activeElement?.classList.contains("pf-friend-input")) setTimeout(() => { input.focus(); input.setSelectionRange(input.value.length, input.value.length); });
    const add = el("button", "btn-primary", t("add"));
    add.type = "submit";
    form.append(input, add);
    const note = el("p", "pf-note", friendNote);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!input.value.trim()) return;
      add.disabled = true;
      try {
        const data = await friendCall({ action: "friend-add", name: input.value });
        friendNote = data.sent ? t("sent")(data.sent.name) : "";
        friendDraft = "";
        window.DLE_FX?.play("place");
      } catch (err) {
        friendNote = err.code === "nobody" ? t("nobody") : err.code === "self" ? t("self") : t("offline");
      }
      render();
    });
    box.append(form, note);

    // Invitations left by friends (also while I was offline).
    if (friendState.invites.length) {
      box.append(el("h3", "pf-h", t("invites")));
      const ol = el("ol", "pf-list");
      for (const inv of friendState.invites) {
        const li = friendRow({ name: inv.name, avatar: inv.avatar });
        li.querySelector(".pf-friend-who").append(el("span", "pf-friend-where", t("invitesYou")(roomPlace(inv.room), inv.room.code)));
        const go = el("button", "btn-primary btn-small", t("joinRoom"));
        go.type = "button";
        go.addEventListener("click", async () => { go.disabled = true; await clearInvite(inv.from); dialog.close(); window.DLE_Presence?.goToRoom(inv.room); });
        const no = el("button", "pf-remove", "✕");
        no.type = "button";
        no.title = no.ariaLabel = t("decline");
        no.addEventListener("click", () => clearInvite(inv.from));
        li.append(go, no);
        ol.append(li);
      }
      box.append(ol);
    }

    // Requests I received.
    if (friendState.requests.length) {
      box.append(el("h3", "pf-h", t("requests")));
      const ol = el("ol", "pf-list");
      for (const f of friendState.requests) {
        const li = friendRow(f);
        const yes = el("button", "btn-primary btn-small", t("accept"));
        const no = el("button", "btn-ghost btn-small", t("decline"));
        yes.type = no.type = "button";
        yes.addEventListener("click", async () => { yes.disabled = true; try { await friendCall({ action: "friend-accept", other: f.id }); window.DLE_FX?.play("win"); } catch {} });
        no.addEventListener("click", async () => { no.disabled = true; try { await friendCall({ action: "friend-remove", other: f.id }); } catch {} });
        li.append(yes, no);
        ol.append(li);
      }
      box.append(ol);
    }

    // My friends, online first, with join / invite buttons.
    box.append(el("h3", "pf-h", `${t("friends")} (${friendState.friends.length})`));
    if (!friendState.friends.length) { box.append(el("p", "muted", t("noFriends"))); return box; }
    const here = window.DLE_Presence?.online() ?? new Map();
    const myRoom = window.DLE_Presence?.myRoom();
    if (!myRoom) box.append(el("p", "muted pf-help", t("inviteHelp")));
    const list = [...friendState.friends].sort((a, b) => here.has(b.id) - here.has(a.id) || a.name.localeCompare(b.name));
    const ol = el("ol", "pf-list");
    for (const f of list) {
      const on = here.get(f.id) ?? null;
      const li = friendRow(f, on);
      if (on?.room && on.room.code !== myRoom?.code) {
        const join = el("button", "btn-primary btn-small", t("joinRoom"));
        join.type = "button";
        join.addEventListener("click", () => { dialog.close(); window.DLE_Presence.goToRoom(on.room); });
        li.append(join);
      } else if (myRoom && on?.room?.code !== myRoom.code) {
        // Online: straight to their page. Offline: kept on their profile until they come back.
        const done = invited.get(f.id);
        const inv = el("button", "btn-ghost btn-small", done?.code === myRoom.code ? done.text : t("invite"));
        inv.type = "button";
        inv.disabled = done?.code === myRoom.code;
        // The list may have been rebuilt meanwhile: draw it again with the new label.
        const mark = (text) => { invited.set(f.id, { code: myRoom.code, text }); inv.textContent = text; if (dialog?.open && tab === "friends") render(); };
        inv.addEventListener("click", async () => {
          inv.disabled = true;
          if (on && window.DLE_Presence.invite(on.peerId)) { mark(t("invitedOk")); return; }
          try {
            await api({ action: "friend-invite", id: session.id, token: session.token, other: f.id, room: myRoom });
            mark(on ? t("invitedOk") : t("invitedOffline"));
          } catch { inv.disabled = false; }
        });
        li.append(inv);
      }
      const rm = el("button", "pf-remove", "✕");
      rm.type = "button";
      rm.title = rm.ariaLabel = t("remove");
      rm.addEventListener("click", async () => { if (!confirm(t("removeConfirm")(f.name))) return; try { await friendCall({ action: "friend-remove", other: f.id }); } catch {} });
      li.append(rm);
      ol.append(li);
    }
    box.append(ol);
    return box;
  }

  // A friend's line: avatar, name, and where they are when they're online.
  function friendRow(f, on) {
    const li = el("li", `pf-li pf-friend${on ? " is-online" : ""}`);
    const face = el("span", "pf-li-face");
    if (f.avatar) { const img = el("img"); img.src = avatarSrc(f.avatar); img.alt = ""; face.append(img); }
    const who = el("span", "pf-friend-who");
    who.append(el("span", "pf-li-name", f.name));
    if (on !== undefined) {
      const where = on?.room ? t("inRoom")(on.room.code)
        : on ? t("onlineIn")(on.game === "home" ? t("home") : gameOf(on.game)?.brand ?? t("crewRoll")) : t("offlineNow");
      who.append(el("span", "pf-friend-where", where));
    }
    li.append(el("span", "pf-dot"), face, who);
    return li;
  }
  // Live updates while the friends tab is open (someone comes online, opens a room…).
  window.addEventListener("dle:presence", () => { if (dialog?.open && tab === "friends") render(); });
  window.addEventListener("dle:room", () => { if (dialog?.open && tab === "friends") render(); });

  // One fetch shared by the profile window and the Crew Roll index, kept for a minute.
  let boardCache = null;
  function leaderboard() {
    if (!boardCache || Date.now() - boardCache.at > 60000) {
      const at = Date.now();
      boardCache = { at, data: fetch(`${API}?leaderboard=1`).then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => { lastBoard = d; checkAchievements(); return d; }) };
      boardCache.data.catch(() => { if (boardCache?.at === at) boardCache = null; });
    }
    return boardCache.data;
  }

  let boardAnime = "all";
  let boardScope = "season";
  const monthName = (id) => { const m = new Date(`${id}-15T12:00:00`).toLocaleDateString(lang(), { month: "long", year: "numeric" }); return m[0].toUpperCase() + m.slice(1); };
  const daysLeft = () => { const n = new Date(); return Math.max(1, Math.ceil((new Date(n.getFullYear(), n.getMonth() + 1, 1) - n) / 86400000)); };
  function boardView() {
    const box = el("div", "pf-view");
    const status = el("p", "muted pf-players", "…");
    // This month's season, or all time.
    const scopes = el("div", "pf-scope");
    // Best crews of every anime together, or of one anime.
    const chips = el("div", "pf-board-anime");
    const podium = el("div", "pf-podiums");
    const cols = el("div", "pf-board");
    box.append(status, scopes, podium, chips, cols);
    leaderboard().then((data) => {
      const season = data.season;
      if (!season) boardScope = "all";
      status.textContent = t("players")(data.players);
      const crewsCol = el("div", "pf-col");
      const winsCol = el("div", "pf-col");
      const draw = () => {
        const src = boardScope === "season" ? season : data;
        const rows = boardAnime === "all" ? src.crews : src.byAnime?.[boardAnime] ?? [];
        const crewTitle = boardScope === "season" ? t("seasonCrews") : t("topCrews");
        crewsCol.textContent = "";
        crewsCol.append(...boardList(boardAnime === "all" ? crewTitle : `${crewTitle} · ${gameOf(boardAnime)?.anime ?? ""}`, rows, crewValue, crewFaces).childNodes);
        winsCol.textContent = "";
        winsCol.append(...boardList(boardScope === "season" ? t("seasonWins") : t("topWins"), src.wins, (r) => el("span", "pf-val", `${r.wins}`)).childNodes);
        chips.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.anime === boardAnime));
        scopes.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.scope === boardScope));
        podium.hidden = boardScope !== "season";
      };
      if (season) {
        for (const [id, label] of [["season", t("season")(monthName(season.id))], ["all", t("allTime")]]) {
          const b = el("button", "pf-scope-btn");
          b.type = "button";
          b.dataset.scope = id;
          b.append(el("span", null, label));
          if (id === "season") b.append(el("small", null, t("seasonEnds")(daysLeft())));
          b.addEventListener("click", () => { boardScope = id; draw(); });
          scopes.append(b);
        }
        // Last season's top 3, crews and wins.
        const last = data.podiums?.[0];
        if (last && (last.crews?.length || last.wins?.length)) {
          const card = el("div", "pf-podium");
          card.append(el("h3", "pf-podium-h", `👑 ${t("champions")(monthName(last.id))}`));
          const row = el("div", "pf-podium-cols");
          for (const [list, value] of [[last.crews ?? [], (r) => `${r.rank} ${r.score.toFixed(1)}`], [last.wins ?? [], (r) => `${r.wins}`]]) {
            const ol = el("ol", "pf-podium-list");
            list.forEach((r, i) => {
              const li = el("li", `top-${i + 1}`);
              const face = el("span", "pf-li-face");
              if (r.avatar) { const img = el("img"); img.src = avatarSrc(r.avatar); img.alt = ""; face.append(img); }
              li.append(el("span", "pf-pos", ["🥇", "🥈", "🥉"][i]), face, el("span", "pf-li-name", r.name), el("span", "pf-val", value(r)));
              ol.append(li);
            });
            if (list.length) row.append(ol);
          }
          card.append(row);
          podium.append(card);
        }
      }
      const chip = (id, content, title) => {
        const b = el("button", "pf-board-chip");
        b.type = "button";
        b.dataset.anime = id;
        b.title = title;
        b.append(content);
        b.addEventListener("click", () => { boardAnime = id; draw(); });
        return b;
      };
      chips.append(chip("all", t("allAnime"), t("allAnime")));
      for (const g of GAMES) {
        const img = el("img");
        img.src = ROOT + g.logo;
        img.alt = g.anime;
        chips.append(chip(g.id, img, g.anime));
      }
      cols.append(crewsCol, winsCol);
      draw();
    }).catch(() => { status.textContent = t("offline"); });
    return box;
  }
  const crewValue = (r) => { const v = el("span", "pf-val"); v.append(el("i", `pf-mini-rank rank-${r.rank}`, r.rank), ` ${r.score.toFixed(1)}`); return v; };
  // The crew's faces under the player's name.
  function crewFaces(r) {
    if (!r.members?.length) return null;
    const faces = el("span", "pf-li-crew");
    for (const m of r.members) {
      const img = el("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.src = portrait(r.anime, m.id);
      img.alt = "";
      img.loading = "lazy";
      img.onerror = () => img.remove();
      img.title = `${m.id.replace(/-/g, " ")} (${m.points})`;
      faces.append(img);
    }
    return faces;
  }

  function boardList(title, rows, value, extra = null) {
    const col = el("div", "pf-col");
    col.append(el("h3", "pf-h", title));
    if (!rows.length) { col.append(el("p", "muted", t("empty"))); return col; }
    const ol = el("ol", "pf-list");
    rows.forEach((r, i) => {
      const li = el("li", `pf-li${r.id === session?.id ? " is-me" : ""}${i < 3 ? ` top-${i + 1}` : ""}`);
      li.style.animationDelay = `${i * 40}ms`;
      const face = el("span", "pf-li-face");
      if (r.avatar) { const img = el("img"); img.src = avatarSrc(r.avatar); img.alt = ""; face.append(img); }
      const who = el("span", "pf-li-who");
      who.append(el("span", "pf-li-name", r.name));
      const more = extra?.(r);
      if (more) who.append(more);
      li.append(el("span", "pf-pos", String(i + 1)), face, who, value(r));
      ol.append(li);
    });
    col.append(ol);
    return col;
  }

  window.addEventListener("dle:lang", () => { renderButton(); if (dialog?.open) render(); });

  function init() {
    renderButton();
    if (session) { refresh(); syncStats(); loadFriends(); }
    // New requests and new friends show up without reloading.
    setInterval(() => { if (session && !document.hidden) loadFriends(); }, 45000);
    document.addEventListener("visibilitychange", () => { if (session && !document.hidden) loadFriends(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.DLE_Profile = {
    open, recordCrew, recordDuel, leaderboard, crewFaces, count, collect, collectionOf,
    // Admin panel: a random achievement's toast.
    testAchievement() { if (!session?.profile) return false; const list = achievements(session.profile); achToast(list[Math.floor(Math.random() * list.length)]); return true; },
    get current() { return session?.profile ?? null; },
    get friendIds() { return friendState.friends.map((f) => f.id); },
    get requests() { return friendState.requests; },
    get invites() { return friendState.invites; },
  };
})();
