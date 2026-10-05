// Patch notes: a big "What's new" window that opens by itself when a player arrives and something changed since
// their last visit (newest day first, expanded), and a header button to open it again. Add the newest day on top.
(() => {
  "use strict";

  // type: new | improved | balance | fix. game: a category id (shows its logo), "crew" (Crew Roll) or nothing.
  const LOG = [
    {
      date: "2026-10-05",
      title: { en: "Attack on Titan joins the roster", fr: "L'Attaque des Titans débarque" },
      items: [
        { type: "new", game: "attackontitan", en: "Snkdle: 55 Attack on Titan characters over 7 anime arcs, spoiler-free (Titan shifters are only revealed with the anime).", fr: "Snkdle : 55 persos de L'Attaque des Titans sur 7 arcs, sans spoiler (les Titans Shifters ne sont révélés qu'avec l'anime)." },
        { type: "new", game: "crew", en: "Crew Roll Attack on Titan: Titans, Survey Corps, Strategist, Garrison, Marley, Commander and Wildcard, with 11 Titan transformations.", fr: "Roll ton équipage SNK : Titans, Bataillon, Stratège, Garnison, Mahr, Commandant et Joker, avec 11 transformations en Titan." },
        { type: "new", game: "onepiece", en: "19 new One Piece characters: Bepo, Laffitte, Crocus, Nico Olvia, Streusen, Sukiyaki, Benn Beckman, Lucky Roux, Yasopp, Oven, Perospero…", fr: "19 nouveaux persos One Piece : Bépo, Laffitte, Crocus, Nico Olvia, Streusen, Sukiyaki, Ben Beckman, Lucky Roux, Yasopp, Oven, Perospero…" },
        { type: "new", game: "bleach", en: "Akon joins Bleach, as an engineer.", fr: "Akon rejoint Bleach, en ingénieur." },
        { type: "improved", en: "Portraits now come from the anime instead of the manga (Attack on Titan, Black Clover), in the characters' early look.", fr: "Les portraits viennent maintenant de l'anime et plus du manga (SNK, Black Clover), dans le look du début." },
        { type: "balance", game: "bleach", en: "Bleach: Visored and Quincy ratings spread out, Tenjiro healer 10, Kenpachi 10, Uryu 8, Tsukishima and Sasakibe 7.", fr: "Bleach : notes des Visored et Quincy plus variées, Tenjirō soigneur 10, Kenpachi 10, Uryū 8, Tsukishima et Sasakibe 7." },
        { type: "balance", game: "blackclover", en: "Black Clover: Rades healer 9.", fr: "Black Clover : Rades soigneur 9." },
      ],
    },
    {
      date: "2026-10-04",
      title: { en: "Black Clover, friends and turn-based duels", fr: "Black Clover, amis et duels au tour par tour" },
      items: [
        { type: "new", game: "blackclover", en: "Blackcloverdle: 70 Black Clover characters over 10 arcs, also in Crew Roll.", fr: "Blackcloverdle : 70 persos de Black Clover sur 10 arcs, aussi dans Roll ton équipage." },
        { type: "new", en: "Friends: add friends by their profile name, see who is online and where, join their room in one click or invite them, even when they are offline.", fr: "Amis : ajoute tes amis par leur pseudo, vois qui est en ligne et où, rejoins leur salle en un clic ou invite-les, même hors ligne." },
        { type: "new", game: "crew", en: "Online Crew Roll is turn by turn: watch every roll and placement of your opponent live; in 1v1 both boards sit side by side.", fr: "Roll ton équipage en ligne se joue chacun son tour : tu vois chaque tirage et placement de l'adversaire en direct ; en 1v1 les deux plateaux sont côte à côte." },
        { type: "new", game: "crew", en: "Role slots for every anime: healer, engineer, scientist, strategist… and a 10 in every slot.", fr: "Des rôles pour tous les animes : soigneur, ingénieur, scientifique, stratège… et un 10 dans chaque rubrique." },
        { type: "improved", en: "Online wins (races and Crew Roll matches) now count on your profile and the leaderboard.", fr: "Les victoires en ligne (courses et matchs Roll ton équipage) comptent sur ton profil et au classement." },
        { type: "balance", game: "crew", en: "Captains and first mates get a bonus that grows with their power (a 10 is worth 12).", fr: "Capitaines et seconds ont un bonus qui grandit avec leur puissance (un 10 vaut 12)." },
        { type: "balance", game: "onepiece", en: "One Piece: fish-men navigate, the Five Elders, Brûlée, Tom, Paulie, Doc Q and Imu join; Aokiji 10, Kuma 6, Kyros 5, Doflamingo 8.", fr: "One Piece : les hommes-poissons naviguent, le Gorosei, Brûlée, Tom, Paulie, Doc Q et Imu arrivent ; Aokiji 10, Kuma 6, Kyros 5, Doflamingo 8." },
        { type: "balance", game: "dragonball", en: "Dragon Ball ratings raised by one.", fr: "Notes de Dragon Ball augmentées d'un point." },
      ],
    },
    {
      date: "2026-10-02",
      title: { en: "Smoother Crew Roll", fr: "Roll ton équipage plus fluide" },
      items: [
        { type: "fix", game: "crew", en: "No more getting stuck with a character that fits nowhere: a free skip appears.", fr: "Plus de blocage avec un perso qui ne rentre nulle part : un bouton passer apparaît." },
        { type: "fix", game: "crew", en: "Online, every crew can be completed even when the pool runs dry.", fr: "En ligne, chaque équipage peut être complété même quand il n'y a plus de persos libres." },
        { type: "improved", en: "When a new version of the site is out, a banner offers to reload.", fr: "Quand une nouvelle version du site sort, un bandeau propose de recharger." },
      ],
    },
  ];

  const T = {
    en: { title: "What's new", today: "Today", button: "What's new", close: "Let's go!", older: "Earlier updates",
      types: { new: "New", improved: "Improved", balance: "Balance", fix: "Fix" }, crew: "Crew Roll" },
    fr: { title: "Nouveautés", today: "Aujourd'hui", button: "Nouveautés", close: "C'est parti !", older: "Mises à jour précédentes",
      types: { new: "Nouveau", improved: "Amélioré", balance: "Équilibrage", fix: "Correctif" }, crew: "Roll ton équipage" },
  };
  const KEY = "dle:changelog-seen";
  const lang = () => (window.DLE_LANG?.get() === "fr" ? "fr" : "en");
  const t = (k) => T[lang()][k];
  const ROOT = (document.currentScript?.src || "").replace(/shared\/changelog\.js.*$/, "");
  const GAMES = window.DLE_GAMES || [];
  const latest = LOG[0].date;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const longDate = (key) => new Date(`${key}T12:00:00`).toLocaleDateString(lang(), { weekday: "long", day: "numeric", month: "long" });
  const seen = () => { try { return localStorage.getItem(KEY) || ""; } catch { return ""; } };
  const markSeen = () => { try { localStorage.setItem(KEY, latest); } catch {} renderButton(); };

  const ICONS = {
    new: "M12 3l2.2 5.6L20 10l-5.8 1.4L12 17l-2.2-5.6L4 10l5.8-1.4z",
    improved: "M12 19V5M5 12l7-7 7 7",
    balance: "M12 3v18M5 7h14M3 14l2-7 2 7a2 2 0 0 1-4 0zM17 14l2-7 2 7a2 2 0 0 1-4 0z",
    fix: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z",
  };
  const svg = (d, size = 16) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function badge(item) {
    const b = el("span", `cl-tag cl-${item.type}`);
    b.innerHTML = svg(ICONS[item.type], 13);
    b.append(t("types")[item.type]);
    return b;
  }
  function gameMark(id) {
    if (!id) return null;
    if (id === "crew") {
      const m = el("span", "cl-game cl-game-crew");
      m.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>';
      m.title = t("crew");
      return m;
    }
    const g = GAMES.find((x) => x.id === id);
    if (!g) return null;
    const img = el("img", "cl-game");
    img.src = ROOT + g.logo;
    img.alt = g.anime;
    img.title = g.brand;
    return img;
  }

  function day(entry, { open, isNew }) {
    const box = el("details", `cl-day${isNew ? " is-new" : ""}`);
    box.open = open;
    const head = el("summary", "cl-day-head");
    const when = el("span", "cl-date", entry.date === todayKey() ? `${t("today")} · ${longDate(entry.date)}` : longDate(entry.date));
    head.append(when, el("span", "cl-day-title", entry.title[lang()]));
    box.append(head);
    const list = el("ul", "cl-list");
    entry.items.forEach((item, i) => {
      const li = el("li", "cl-item");
      li.style.animationDelay = `${120 + i * 60}ms`;
      const mark = gameMark(item.game);
      const text = el("p", "cl-text", item[lang()]);
      li.append(badge(item));
      if (mark) li.append(mark);
      li.append(text);
      list.append(li);
    });
    box.append(list);
    return box;
  }

  let dialog = null;
  function open() {
    const lastSeen = seen();
    if (!dialog) {
      dialog = el("dialog", "cl-modal");
      dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener("close", markSeen);
      document.body.append(dialog);
    }
    const card = el("div", "cl-card");
    const glow = el("div", "cl-glow");
    const head = el("header", "cl-head");
    const spark = el("span", "cl-spark");
    spark.innerHTML = svg(ICONS.new, 28);
    const titles = el("div", "cl-titles");
    titles.append(el("h2", "cl-title", t("title")), el("p", "cl-sub", LOG[0].title[lang()]));
    const x = el("button", "cl-x", "✕");
    x.type = "button";
    x.setAttribute("aria-label", "Close");
    x.addEventListener("click", () => dialog.close());
    head.append(spark, titles, x);

    const body = el("div", "cl-body");
    LOG.forEach((entry, i) => {
      if (i === 1) body.append(el("p", "cl-older", t("older")));
      body.append(day(entry, { open: i === 0, isNew: entry.date > lastSeen }));
    });
    const go = el("button", "btn-primary cl-go", t("close"));
    go.type = "button";
    go.addEventListener("click", () => dialog.close());
    card.append(glow, head, body, go);
    dialog.replaceChildren(card);
    if (!dialog.open) dialog.showModal();
  }

  // Header button, with a dot while there is something unread.
  let button = null;
  function renderButton() {
    const bar = document.querySelector(".topbar-actions");
    if (!bar) return;
    if (!button) {
      button = el("button", "cl-btn");
      button.type = "button";
      button.addEventListener("click", open);
      bar.prepend(button);
    }
    button.innerHTML = svg(ICONS.new, 18);
    button.append(el("span", "cl-btn-label", t("button")));
    button.title = t("button");
    button.classList.toggle("has-news", seen() < latest);
  }

  // Opens by itself once there is something new, after any other window (name, arc picker…) is closed.
  function autoOpen() {
    if (seen() >= latest) return;
    const tryOpen = (left) => {
      if (document.querySelector("dialog[open]") && left > 0) { setTimeout(() => tryOpen(left - 1), 1000); return; }
      open();
      window.DLE_FX?.play("win");
    };
    setTimeout(() => tryOpen(120), 900);
  }

  function init() {
    renderButton();
    autoOpen();
  }
  window.addEventListener("dle:lang", () => { renderButton(); if (dialog?.open) open(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.DLE_Changelog = { open };
})();
