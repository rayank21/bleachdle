// Admin panel, for the site's owner only: live test tools on every page (the answer, a chosen character,
// forced Crew Roll draws, cinematics, sounds, banners, storage, a sandbox…).
// Unlocked once per browser by opening any page with #admin=<key>; #admin-off locks it again. The key only keeps
// the panel out of other players' way: every tool acts on this browser alone, nothing is granted on the server.
// Sandbox: the browser's storage is saved when it starts and put back when it ends, and in between nothing reaches
// the profile (stats, crews, counters), so tests never show on the leaderboard.
(() => {
  "use strict";

  const KEY_HASH = "ef97a0125fb1dc6a09ab30466feef765f5f6b64602bb4cf638da1387ed52fd71"; // SHA-256 of the key
  const UNLOCK = "dle:admin";
  const SANDBOX = "dle:admin-sandbox";
  const SNAPSHOT = "dle:admin-snapshot";
  const RESTORE = "dle:admin-restore";
  const FPS = "dle:admin-fps";
  const LITE = "dle:admin-lite";
  const OPEN = "dle:admin-open";
  // Crew Roll luck on this browser (solo and online draws): 1 = fair; above, the strongest characters come up more
  // often (crew.js reads window.DLE_ADMIN_LUCK, which only exists once the panel is unlocked).
  const LUCK = "dle:admin-luck";
  const LUCK_STEPS = [1, 1.5, 2, 3, 5];
  const setLuck = (v) => {
    const luck = LUCK_STEPS.includes(v) ? v : 1;
    ls.set(LUCK, String(luck));
    window.DLE_ADMIN_LUCK = luck;
    return luck;
  };
  const ROOT = (document.currentScript?.src || "").replace(/shared\/admin\.js.*$/, "");

  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch {} },
    keys() { try { return Object.keys(localStorage); } catch { return []; } },
  };
  const isAdminKey = (k) => k.startsWith("dle:admin");
  const sandboxOn = () => ls.get(SANDBOX) === "1";

  // Leaving the sandbox: the storage saved when it started comes back here, on the next load, before any other
  // script reads it (and after the old page's last writes on its way out).
  if (ls.get(RESTORE) === "1") {
    let snap = null;
    try { snap = JSON.parse(ls.get(SNAPSHOT) || "null"); } catch {}
    if (snap) {
      for (const k of ls.keys()) if (!isAdminKey(k)) ls.del(k);
      for (const [k, v] of Object.entries(snap)) ls.set(k, v);
    }
    for (const k of [SNAPSHOT, SANDBOX, RESTORE]) ls.del(k);
  }

  async function sha256(s) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function lock() {
    if (sandboxOn()) ls.set(RESTORE, "1");
    ls.del(UNLOCK);
    location.reload();
  }

  // ── Helpers ──
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const btn = (label, fn, cls = "") => {
    const b = el("button", `adm-btn ${cls}`.trim(), label);
    b.type = "button";
    b.addEventListener("click", fn);
    return b;
  };
  const row = (...kids) => { const r = el("div", "adm-row"); r.append(...kids.filter(Boolean)); return r; };
  const note = (text) => el("p", "adm-note", text);
  const openSet = () => { try { return new Set(JSON.parse(ls.get(OPEN) || "[]")); } catch { return new Set(); } };
  // A collapsible section that remembers whether it was open.
  function section(id, title, fallbackOpen = false) {
    const d = el("details", "adm-sec");
    const seen = openSet();
    d.open = seen.has(id) || (fallbackOpen && !seen.has(`-${id}`));
    d.append(el("summary", null, title));
    d.addEventListener("toggle", () => {
      const s = openSet();
      s.delete(id); s.delete(`-${id}`);
      s.add(d.open ? id : `-${id}`);
      ls.set(OPEN, JSON.stringify([...s]));
    });
    return d;
  }
  let toastTimer = 0;
  function toast(text) {
    let t = document.querySelector(".adm-toast");
    if (!t) { t = el("div", "adm-toast"); t.setAttribute("role", "status"); document.body.append(t); }
    t.textContent = text;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), 2600);
  }
  // A text field with suggestions: a character, picked by name.
  function picker(list, placeholder, label, onPick) {
    const id = `adm-dl-${Math.random().toString(36).slice(2)}`;
    const input = el("input", "adm-input");
    input.setAttribute("list", id);
    input.placeholder = placeholder;
    const dl = el("datalist");
    dl.id = id;
    for (const c of list) { const o = el("option"); o.value = c.name; dl.append(o); }
    const go = () => {
      const v = input.value.trim().toLowerCase();
      if (!v) return;
      const c = list.find((x) => x.name.toLowerCase() === v) ?? list.find((x) => x.name.toLowerCase().includes(v));
      if (!c) return toast("Personnage introuvable");
      input.value = "";
      onPick(c);
    };
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); go(); } });
    return row(input, dl, btn(label, go, "is-main"));
  }
  const copy = (text) => navigator.clipboard?.writeText(text).then(() => toast("Copié"), () => toast("Copie impossible"));
  const pageGame = () => (window.DLE_GAMES || []).find((g) => g.id === document.body.dataset.game);

  // ── Sandbox: profile updates are answered here and never sent ──
  let blocked = 0;
  function guardFetch() {
    const real = window.fetch;
    if (!real || real.adminGuard) return;
    const guarded = function (input, init) {
      if (sandboxOn() && /\/api\/profile/.test(String(input?.url ?? input))) {
        let body = null;
        try { body = JSON.parse(init?.body ?? "null"); } catch {}
        if (body?.action === "update") {
          blocked++;
          renderBadge();
          const profile = window.DLE_Profile?.current;
          return Promise.resolve(new Response(JSON.stringify(profile ? { profile } : { error: "sandbox" }), { status: profile ? 200 : 503, headers: { "content-type": "application/json" } }));
        }
      }
      return real.apply(window, arguments);
    };
    guarded.adminGuard = true;
    window.fetch = guarded;
  }
  function enterSandbox() {
    const snap = {};
    for (const k of ls.keys()) if (!isAdminKey(k)) snap[k] = ls.get(k);
    if (!ls.set(SNAPSHOT, JSON.stringify(snap))) return toast("Stockage plein : bac à sable impossible");
    ls.set(SANDBOX, "1");
    blocked = 0;
    toast("Bac à sable activé");
    renderBadge();
    render();
  }
  function leaveSandbox() {
    ls.set(RESTORE, "1");
    location.reload();
  }

  // ── FPS meter ──
  let fpsEl = null;
  let fpsRaf = 0;
  function fps(on) {
    ls.set(FPS, on ? "1" : "0");
    cancelAnimationFrame(fpsRaf);
    fpsEl?.remove();
    fpsEl = null;
    if (!on) return;
    fpsEl = el("div", "adm-fps", "… fps");
    document.body.append(fpsEl);
    let frames = 0;
    let last = performance.now();
    let prev = last;
    let worst = 0;
    const loop = (now) => {
      frames++;
      worst = Math.max(worst, now - prev);
      prev = now;
      if (now - last >= 500) {
        const rate = Math.round((frames * 1000) / (now - last));
        fpsEl.textContent = `${rate} fps · pire ${Math.round(worst)} ms`;
        fpsEl.classList.toggle("is-low", rate < 45);
        frames = 0; last = now; worst = 0;
      }
      fpsRaf = requestAnimationFrame(loop);
    };
    fpsRaf = requestAnimationFrame(loop);
  }

  // ── Panel ──
  let fab = null;
  let panel = null;
  let body = null;

  function start() {
    if (fab) return;
    setLuck(Number(ls.get(LUCK)) || 1);
    guardFetch();
    injectStyle();
    const mount = () => {
      fab = el("button", "adm-fab");
      fab.type = "button";
      fab.title = "Admin (Alt+A)";
      fab.setAttribute("aria-label", "Menu admin");
      fab.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><span class="adm-fab-badge" hidden></span>`;
      fab.addEventListener("click", () => toggle());
      panel = el("aside", "adm-panel");
      panel.hidden = true;
      panel.setAttribute("aria-label", "Menu admin");
      const head = el("div", "adm-head");
      head.append(el("b", null, "Admin"), btn("↻", render, "adm-icon"), btn("✕", () => toggle(false), "adm-icon"));
      head.children[1].title = "Actualiser";
      body = el("div", "adm-body");
      panel.append(head, body);
      document.body.append(fab, panel);
      renderBadge();
      if (ls.get(FPS) === "1") fps(true);
    };
    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount);
    addEventListener("keydown", (e) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === "KeyA") { e.preventDefault(); toggle(); }
      else if (e.key === "Escape" && panel && !panel.hidden) toggle(false);
    });
  }

  function toggle(force) {
    if (!panel) return;
    const show = force ?? panel.hidden;
    panel.hidden = !show;
    fab.classList.toggle("is-open", show);
    if (show) render();
  }

  function renderBadge() {
    const b = fab?.querySelector(".adm-fab-badge");
    if (!b) return;
    const on = sandboxOn();
    b.hidden = !on;
    b.textContent = blocked ? `Bac à sable · ${blocked}` : "Bac à sable";
    fab.classList.toggle("is-sandbox", on);
  }

  function render() {
    if (!body || panel.hidden) return;
    const keep = body.scrollTop;
    body.textContent = "";
    body.append(...[sandboxSection(), gameSection(), crewSection(), fxSection(), perfSection(), storageSection(), infoSection()].filter(Boolean));
    body.append(row(btn("Verrouiller ce navigateur", () => { if (confirm("Cacher le menu admin sur ce navigateur ? (#admin=<clé> pour le retrouver)")) lock(); }, "is-danger")));
    body.scrollTop = keep;
  }

  function sandboxSection() {
    const s = section("sandbox", sandboxOn() ? "Bac à sable · actif" : "Bac à sable", true);
    if (sandboxOn()) {
      s.append(note(`Rien n'est envoyé au profil (${blocked} envoi${blocked > 1 ? "s" : ""} bloqué${blocked > 1 ? "s" : ""} sur cette page). En sortant, tout le stockage du navigateur revient à son état d'avant.`));
      s.append(row(btn("Quitter et tout annuler", leaveSandbox, "is-main")));
    } else {
      s.append(note("Teste sans rien laisser : stats, équipages, collection et compteurs restent hors du profil et du classement, et tout est annulé à la sortie."));
      s.append(row(btn("Activer le bac à sable", enterSandbox, "is-main")));
    }
    return s;
  }

  function gameSection() {
    const G = window.DLE_GAME;
    if (!G) return null;
    const s = section("game", `Partie · ${pageGame()?.brand ?? ""}`, true);
    if (G.online) {
      s.append(note("En ligne : la partie suit la course, les actions sont désactivées. Passe en Quotidien ou Infini."));
      return s;
    }
    const ans = el("div", "adm-answer");
    const show = () => {
      const g = G.game;
      ans.textContent = "";
      if (!g) return ans.append(note("Pas de partie en cours."));
      const c = G.view(g.target);
      const img = el("img");
      img.src = c.image;
      img.alt = "";
      const text = el("div");
      text.append(el("b", null, c.name), el("small", null, `${g.guesses.length} essai${g.guesses.length > 1 ? "s" : ""} · ${({ playing: "en cours", won: "gagnée", lost: "abandonnée" })[g.status] ?? g.status}`));
      ans.append(img, text);
    };
    const later = () => setTimeout(() => { if (ans.childElementCount) show(); }, 900);
    s.append(
      row(btn("Voir la réponse", show, "is-main"), btn("Gagner", () => { G.win(); later(); }), btn("Rejouer", () => { G.reset(); later(); })),
      row(btn("+1 raté", () => { G.wrong(1); later(); }), btn("+3 ratés", () => { G.wrong(3); later(); }), btn("+5 ratés", () => { G.wrong(5); later(); }), btn("+8 ratés", () => { G.wrong(8); later(); })),
      ans,
      picker(G.pool(), "Faire deviner…", "Choisir", (c) => { G.setTarget(c.id); toast(`À deviner : ${c.name}`); if (ans.childElementCount) show(); }),
    );
    const arcs = el("select", "adm-input");
    G.config.arcs.forEach((a, i) => { const o = el("option", null, `${i + 1}. ${a.fr ?? a.en}`); o.value = i; arcs.append(o); });
    arcs.value = G.settings.arc ?? 0;
    arcs.addEventListener("change", () => { G.setArc(+arcs.value); toast("Arc changé"); render(); });
    s.append(row(el("span", "adm-label", "Arc"), arcs));
    // The characters of the coming days, for this arc and variant.
    const days = el("details", "adm-sub");
    days.append(el("summary", null, "Persos du jour à venir"));
    days.addEventListener("toggle", () => {
      if (!days.open || days.childElementCount > 1) return;
      const list = el("ol", "adm-days");
      for (let i = -1; i <= 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const li = el("li");
        li.append(el("span", null, i === 0 ? "Aujourd'hui" : i === 1 ? "Demain" : i === -1 ? "Hier" : d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })), el("b", null, G.view(G.dailyFor(i)).name));
        list.append(li);
      }
      days.append(list, note(`Variante ${G.play()}, arc ${(G.settings.arc ?? 0) + 1}.`));
    });
    s.append(days);
    s.append(row(btn("Remettre les stats de ce jeu à zéro", () => { if (confirm("Effacer les stats de ce jeu sur ce navigateur ?")) { G.resetStats(); toast("Stats remises à zéro"); } }, "is-danger")));
    return s;
  }

  function crewSection() {
    const C = window.CREW_ADMIN;
    if (!C) return null;
    const g = C.game;
    const s = section("crew", `Crew Roll · ${g?.anime ?? ""}`, true);
    // Luck: weights every draw (solo and online) toward the strongest characters, on this browser only.
    const luck = el("select", "adm-input");
    for (const v of LUCK_STEPS) {
      const o = el("option", null, v === 1 ? "Normale (×1)" : `×${String(v).replace(".", ",")}`);
      o.value = String(v);
      o.selected = v === (window.DLE_ADMIN_LUCK ?? 1);
      luck.append(o);
    }
    luck.addEventListener("change", () => toast(`Chance ${setLuck(Number(luck.value)) === 1 ? "normale" : `×${luck.value}`}`));
    s.append(el("span", "adm-label", "Chance aux tirages (solo et en ligne)"), row(luck),
      note("Un perso noté 10 sort jusqu'à ce nombre de fois plus souvent ; les persos faibles ne bougent presque pas."));
    const solo = C.solo;
    if (!solo) s.append(note("Passe en mode Solo pour les tirages forcés."));
    else {
      if (!sandboxOn()) s.append(note("Hors bac à sable, un équipage terminé compte au classement."));
      s.append(
        picker(solo.pool, "Perso à tirer…", "Tirer", (c) => { if (!C.roll(c.id)) toast("Pas maintenant (tirage en cours, déjà placé ou équipage fini)"); else toggle(false); }),
        row(btn("+99 relances", () => { C.rerolls(); toast("+99 relances"); }), btn("Remplir (meilleurs)", () => C.fill(true)), btn("Remplir (hasard)", () => C.fill(false))),
        row(btn("Terminer l'équipage", () => C.finish()), btn("Nouvel équipage", () => C.restart())),
      );
    }
    const forms = window.CREW_FORMS?.[g?.id] ?? {};
    const ids = Object.keys(forms);
    if (!ids.length) { s.append(note("Pas de transformation pour cet anime.")); return s; }
    const nameOf = (id) => solo?.pool.find((c) => c.id === id)?.name ?? id.replace(/-/g, " ");
    const sel = el("select", "adm-input");
    for (const id of ids) {
      const f = forms[id];
      const o = el("option", null, `${nameOf(id)} · ${f.name?.fr ?? f.name?.en ?? ""}${f.clip ? " 🎬" : ""}`);
      o.value = id;
      sel.append(o);
    }
    const late = el("label", "adm-check");
    const lateBox = el("input");
    lateBox.type = "checkbox";
    late.append(lateBox, el("span", null, "Forme tardive"));
    const syncLate = () => { late.hidden = !forms[sel.value]?.next; if (late.hidden) lateBox.checked = false; };
    sel.addEventListener("change", syncLate);
    syncLate();
    let chain = false;
    s.append(
      el("span", "adm-label", `Cinématiques (${ids.length})`),
      row(sel),
      row(btn("Jouer", () => { toggle(false); C.cinema(sel.value, lateBox.checked); }, "is-main"), late),
      row(btn("Enchaîner toutes", async () => {
        toggle(false);
        chain = true;
        for (const id of ids) { if (!chain) break; await C.cinema(id); }
        chain = false;
      }), btn("Arrêter l'enchaînement", () => { chain = false; toast("Arrêt après la cinématique en cours"); })),
    );
    return s;
  }

  function fxSection() {
    const s = section("fx", "Effets & bannières");
    const FX = window.DLE_FX;
    if (FX?.sounds?.length) {
      s.append(el("span", "adm-label", FX.muted ? "Sons (coupés sur le site)" : "Sons"));
      const grid = el("div", "adm-grid");
      for (const n of FX.sounds) grid.append(btn(n, () => FX.play(n)));
      s.append(grid);
    }
    s.append(
      row(btn("Flash", () => FX?.flash("rgba(var(--accent-rgb), 0.35)")), btn("Bannière mise à jour", () => FX?.showUpdate?.()), btn("Toast succès", () => { if (!window.DLE_Profile?.testAchievement()) toast("Connecte un profil pour ça"); })),
      row(btn("Nouveautés", () => { toggle(false); window.DLE_Changelog?.open(); }), btn("Nouveautés non lues", () => { ls.del("dle:changelog-seen"); location.reload(); })),
    );
    if (window.DLE_Rooms?.inviteBanner) {
      s.append(row(btn("Bannière d'invitation", () => window.DLE_Rooms.inviteBanner({
        text: "Admin t'invite · Test · salle ABCDE", join: "Rejoindre", dismiss: "Plus tard", onJoin: () => toast("Rejoindre cliqué"),
      }))));
    }
    return s;
  }

  function perfSection() {
    const s = section("perf", "Performance");
    const box = el("input");
    box.type = "checkbox";
    box.checked = ls.get(FPS) === "1";
    box.addEventListener("change", () => fps(box.checked));
    const check = el("label", "adm-check");
    check.append(box, el("span", null, "Compteur FPS"));
    const lite = el("select", "adm-input");
    for (const [v, label] of [["", "Auto"], ["1", "Forcé"], ["0", "Désactivé"]]) { const o = el("option", null, label); o.value = v; lite.append(o); }
    lite.value = ls.get(LITE) ?? "";
    lite.addEventListener("change", () => { lite.value ? ls.set(LITE, lite.value) : ls.del(LITE); location.reload(); });
    s.append(row(check), row(el("span", "adm-label", "Mode léger"), lite));
    s.append(note(`Actuellement ${document.documentElement.classList.contains("lite") ? "actif" : "inactif"} · ${navigator.hardwareConcurrency ?? "?"} cœurs · ${navigator.deviceMemory ?? "?"} Go`));
    return s;
  }

  function storageSection() {
    const s = section("storage", "Stockage du navigateur");
    const fill = () => {
      s.querySelector(".adm-store")?.remove();
      const wrap = el("div", "adm-store");
      const filter = el("input", "adm-input");
      filter.placeholder = "Filtrer les clés…";
      const list = el("ul", "adm-keys");
      const area = el("textarea", "adm-area");
      area.placeholder = "Clic sur une clé pour voir sa valeur, ou colle ici un export pour l'importer.";
      let current = null;
      const draw = () => {
        list.textContent = "";
        const q = filter.value.trim().toLowerCase();
        const keys = ls.keys().filter((k) => !isAdminKey(k) && k.toLowerCase().includes(q)).sort();
        for (const k of keys) {
          const v = ls.get(k) ?? "";
          const li = el("li", k === current ? "is-on" : "");
          const name = btn(k, () => {
            current = k;
            try { area.value = JSON.stringify(JSON.parse(v), null, 2); } catch { area.value = v; }
            draw();
          }, "adm-key");
          li.append(name, el("small", null, v.length > 1024 ? `${(v.length / 1024).toFixed(1)} k` : `${v.length}`), btn("×", () => {
            if (!confirm(`Supprimer « ${k} » ?`)) return;
            ls.del(k);
            if (current === k) { current = null; area.value = ""; }
            draw();
          }, "adm-icon"));
          list.append(li);
        }
        if (!keys.length) list.append(el("li", "adm-note", "Aucune clé."));
      };
      filter.addEventListener("input", draw);
      draw();
      const all = () => Object.fromEntries(ls.keys().filter((k) => !isAdminKey(k)).map((k) => [k, ls.get(k)]));
      const g = pageGame();
      wrap.append(filter, list, area,
        row(
          btn("Enregistrer la clé", () => {
            if (!current) return toast("Choisis une clé");
            let v = area.value;
            try { v = JSON.stringify(JSON.parse(v)); } catch {}
            ls.set(current, v);
            toast("Enregistré (recharge pour l'appliquer)");
            draw();
          }),
          btn("Recharger la page", () => location.reload()),
        ),
        row(
          btn("Exporter tout", () => copy(JSON.stringify(all()))),
          btn("Importer", () => {
            let data = null;
            try { data = JSON.parse(area.value); } catch {}
            if (!data || typeof data !== "object" || Array.isArray(data)) return toast("Colle un export JSON dans la zone");
            if (!confirm(`Écrire ${Object.keys(data).length} clés et recharger ?`)) return;
            for (const [k, v] of Object.entries(data)) if (!isAdminKey(k)) ls.set(k, typeof v === "string" ? v : JSON.stringify(v));
            location.reload();
          }),
          g && btn(`Effacer ${g.brand}`, () => {
            if (!confirm(`Effacer toutes les données de ${g.brand} (partie, stats, réglages) ?`)) return;
            for (const k of ls.keys()) if (k.startsWith(`${g.storage}:`)) ls.del(k);
            location.reload();
          }, "is-danger"),
        ),
      );
      s.append(wrap);
    };
    // Read when opened, so the list is fresh.
    s.addEventListener("toggle", () => { if (s.open) fill(); });
    if (s.open) fill();
    return s;
  }

  function infoSection() {
    const s = section("info", "Infos & réseau");
    const p = window.DLE_Profile?.current;
    const pres = window.DLE_Presence;
    let online = "?";
    try { online = pres?.online?.().size ?? "?"; } catch {}
    const lines = [
      ["Profil", p ? `${p.name} (${p.id})` : "aucun"],
      ["Page", document.body.dataset.game || location.pathname],
      ["Écran", `${innerWidth} × ${innerHeight} @${devicePixelRatio}x`],
      ["Relais Nostr ouverts", window.DLE_Link?.relays?.() ?? "?"],
      ["Présence", pres?.status ?? "?"],
      ["Profils en ligne", online],
      ["Bac à sable", sandboxOn() ? `actif (${blocked} bloqué${blocked > 1 ? "s" : ""})` : "non"],
      ["Navigateur", navigator.userAgent],
    ];
    const dl = el("dl", "adm-info");
    for (const [k, v] of lines) dl.append(el("dt", null, k), el("dd", null, String(v)));
    s.append(dl, row(
      btn("Copier", () => copy(lines.map(([k, v]) => `${k} : ${v}`).join("\n"))),
      btn("Diagnostic en ligne", () => { location.href = `${ROOT}diag/`; }),
    ));
    return s;
  }

  function injectStyle() {
    const css = `
.adm-fab { position: fixed; right: 16px; bottom: 16px; z-index: 2000; width: 42px; height: 42px; display: grid; place-items: center; border-radius: 50%; border: 1px solid var(--line); background: #17171b; color: var(--muted); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5); cursor: pointer; opacity: 0.7; transition: opacity 0.15s, color 0.15s, transform 0.15s; }
.adm-fab:hover, .adm-fab.is-open { opacity: 1; color: var(--text); }
.adm-fab.is-open svg { transform: rotate(60deg); }
.adm-fab svg { transition: transform 0.3s; }
.adm-fab.is-sandbox { opacity: 1; color: #f2bf2a; border-color: #f2bf2a; box-shadow: 0 0 0 3px rgba(242, 191, 42, 0.2), 0 8px 24px rgba(0, 0, 0, 0.5); }
.adm-fab-badge { position: absolute; right: 48px; top: 50%; transform: translateY(-50%); white-space: nowrap; padding: 3px 9px; border-radius: 999px; background: #f2bf2a; color: #1a1400; font: 800 11px/1.4 var(--font); letter-spacing: 0.02em; }
.adm-panel { position: fixed; right: 16px; bottom: 68px; z-index: 2001; width: min(380px, calc(100vw - 32px)); max-height: min(78vh, calc(100vh - 96px)); display: flex; flex-direction: column; border-radius: 14px; background: #131317; border: 1px solid var(--line); box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7); color: var(--text); font: 14px/1.4 var(--font); }
.adm-panel[hidden] { display: none; }
.adm-head { display: flex; align-items: center; gap: 6px; padding: 10px 10px 10px 16px; border-bottom: 1px solid var(--line); }
.adm-head b { flex: 1; font-weight: 900; font-style: italic; letter-spacing: 0.02em; }
.adm-body { overflow-y: auto; padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 8px; overscroll-behavior: contain; }
.adm-sec { border: 1px solid var(--line); border-radius: 10px; background: var(--surface-2); }
.adm-sec > summary { padding: 9px 12px; font-weight: 800; cursor: pointer; list-style: none; display: flex; justify-content: space-between; }
.adm-sec > summary::after { content: "+"; color: var(--muted); }
.adm-sec[open] > summary::after { content: "−"; }
.adm-sec[open] { padding-bottom: 10px; }
.adm-sec > :not(summary) { margin: 6px 12px 0; }
.adm-sub > summary { cursor: pointer; color: var(--muted); font-size: 13px; font-weight: 700; }
.adm-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.adm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); gap: 5px; }
.adm-btn { padding: 6px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface-3); color: var(--text); font: 600 12.5px/1.2 var(--font); cursor: pointer; }
.adm-btn:hover { border-color: rgba(var(--accent-rgb), 0.6); }
.adm-btn.is-main { background: rgba(var(--accent-rgb), 0.18); border-color: rgba(var(--accent-rgb), 0.55); }
.adm-btn.is-danger { color: #ff8a8a; border-color: rgba(255, 90, 90, 0.35); background: rgba(255, 90, 90, 0.08); }
.adm-icon { padding: 4px 8px; background: none; border-color: transparent; color: var(--muted); }
.adm-icon:hover { color: var(--text); }
.adm-input { flex: 1 1 140px; min-width: 0; padding: 6px 9px; border-radius: 8px; border: 1px solid var(--line); background: #0e0e11; color: var(--text); font: 13px/1.3 var(--font); }
.adm-label { display: block; color: var(--muted); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
.adm-row .adm-label { flex: 0 0 auto; }
.adm-note { margin: 0; color: var(--muted); font-size: 12.5px; line-height: 1.45; }
.adm-check { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; }
.adm-check[hidden] { display: none; }
.adm-answer { display: flex; align-items: center; gap: 10px; }
.adm-answer:empty { display: none; }
.adm-answer img { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; object-position: top; background: #0e0e11; }
.adm-answer b { display: block; font-size: 16px; }
.adm-answer small { color: var(--muted); }
.adm-days { list-style: none; margin: 6px 0; padding: 0; display: flex; flex-direction: column; gap: 3px; font-size: 13px; }
.adm-days li { display: flex; justify-content: space-between; gap: 10px; }
.adm-days span { color: var(--muted); text-transform: capitalize; }
.adm-store { display: flex; flex-direction: column; gap: 6px; }
.adm-keys { list-style: none; margin: 0; padding: 0; max-height: 180px; overflow-y: auto; border: 1px solid var(--line); border-radius: 8px; background: #0e0e11; }
.adm-keys li { display: flex; align-items: center; gap: 6px; padding: 1px 4px 1px 0; }
.adm-keys li.is-on { background: rgba(var(--accent-rgb), 0.14); }
.adm-keys small { color: var(--muted); font-variant-numeric: tabular-nums; font-size: 11px; }
.adm-key { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; background: none; border: 0; font: 12px/1.3 ui-monospace, Consolas, monospace; }
.adm-area { min-height: 110px; resize: vertical; padding: 8px; border-radius: 8px; border: 1px solid var(--line); background: #0e0e11; color: var(--text); font: 12px/1.4 ui-monospace, Consolas, monospace; }
.adm-info { display: grid; grid-template-columns: auto 1fr; gap: 3px 10px; margin: 6px 12px 0; font-size: 12.5px; }
.adm-info dt { color: var(--muted); }
.adm-info dd { margin: 0; overflow-wrap: anywhere; }
.adm-fps { position: fixed; right: 66px; bottom: 25px; z-index: 2000; padding: 3px 8px; border-radius: 6px; background: rgba(0, 0, 0, 0.75); color: #7dffa1; font: 700 12px/1.3 ui-monospace, Consolas, monospace; pointer-events: none; }
.adm-fps.is-low { color: #ff8a8a; }
.adm-fab.is-sandbox ~ .adm-fps { bottom: 52px; right: 16px; }
.adm-toast { position: fixed; right: 16px; bottom: 68px; z-index: 2002; max-width: calc(100vw - 32px); padding: 9px 14px; border-radius: 10px; background: #f2f2f2; color: #111; font: 700 13px/1.35 var(--font); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); }
.adm-toast[hidden] { display: none; }
.adm-panel:not([hidden]) ~ .adm-toast { bottom: auto; top: 16px; }
@media (max-width: 760px) { .adm-fab { right: 10px; bottom: 10px; } .adm-panel { right: 10px; left: 10px; width: auto; bottom: 60px; } }
`;
    const style = el("style");
    style.textContent = css;
    document.head.append(style);
  }

  // ── Unlock ──
  // The key leaves the address bar at once, before the page reads its hash (#join=…, #online). It also works
  // typed after the address of a page already open.
  function readHash() {
    const m = location.hash.match(/^#admin(?:=(.+)|-off)$/);
    if (!m) return false;
    history.replaceState(null, "", location.pathname + location.search);
    if (!m[1]) { if (ls.get(UNLOCK)) lock(); return true; }
    sha256(decodeURIComponent(m[1])).then((h) => {
      if (h !== KEY_HASH) return;
      ls.set(UNLOCK, h);
      start();
      toast("Menu admin activé sur ce navigateur (Alt+A)");
    }, () => {});
    return true;
  }
  addEventListener("hashchange", readHash);
  // Crew Roll: another anime or mode changes the pool, the forms and the title.
  addEventListener("dle:admin-refresh", () => render());
  if (!readHash() && ls.get(UNLOCK) === KEY_HASH) start();
})();
