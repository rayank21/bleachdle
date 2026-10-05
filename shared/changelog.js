// Patch notes, one entry per update (date and time), newest first, shown a few per page. The window opens by
// itself only for updates the player has not seen yet, showing just those; the header button shows them all.
(() => {
  "use strict";

  // at: local date and time of the update. type: new | improved | balance | fix.
  // game: a category id (shows its logo), "crew" (Crew Roll) or nothing.
  const LOG = [
    {
      at: "2026-10-05T23:40",
      title: { en: "Black Clover devils", fr: "Les démons de Black Clover" },
      items: [
        { type: "new", game: "crew", en: "Crew Roll: every Black Clover devil transforms. Liebe, Zagred, Megicula and Lucifero fully manifest; Vanica, Zenon, Dante and Nacht reach their Devil Union; Asta now unites with Liebe.", fr: "Roll ton équipage : tous les démons de Black Clover se transforment. Liebe, Zagred, Megicula et Lucifero se manifestent entièrement ; Vanica, Zenon, Dante et Nacht passent en union démoniaque ; Asta fusionne maintenant avec Liebe." },
        { type: "balance", game: "onepiece", en: "One Piece: Blackbeard archaeologist 8.", fr: "One Piece : Barbe Noire archéologue 8." },
      ],
    },
    {
      at: "2026-10-05T23:15",
      title: { en: "Transformation cinematics, the Sunny and a new look", fr: "Cinématiques de transformation, le Sunny et un nouveau décor" },
      items: [
        { type: "new", game: "crew", en: "Every transformation in Crew Roll now plays a full-screen cinematic: cinema bars, lightning, sparks and speed lines, a blade of light, then the transformed character slams in with its kanji and name. 20 of them play the real anime scene first (Gear 5, Senbonzakura Kageyoshi, Daiguren Hyōrinmaru, Malevolent Shrine, Gon's transformation, the Titans…). Tap to skip.", fr: "Chaque transformation de Roll ton équipage lance une cinématique plein écran : bandes de cinéma, éclairs, étincelles et lignes de vitesse, une lame de lumière, puis le perso transformé débarque avec son kanji et son nom. 20 d'entre elles montrent d'abord la vraie scène de l'anime (Gear 5, Senbonzakura Kageyoshi, Daiguren Hyōrinmaru, Temple maléfique, la transformation de Gon, les Titans…). Touche l'écran pour passer." },
        { type: "new", game: "onepiece", en: "Imu gets his real face as a portrait, and transforms in Crew Roll (his form from the manga).", fr: "Imu a maintenant son vrai visage en portrait, et se transforme dans Roll ton équipage (sa forme du manga)." },
        { type: "improved", en: "Crew Roll's logo is now the Thousand Sunny, and two big characters of the anime frame every page.", fr: "Le logo de Roll ton équipage est maintenant le Thousand Sunny, et deux grands persos de l'animé encadrent chaque page." },
        { type: "balance", game: "bleach", en: "Bleach: Gin 8 (strategist 6), Izuru healer 7, Rukia healer 4.", fr: "Bleach : Gin 8 (stratège 6), Izuru soigneur 7, Rukia soigneuse 4." },
      ],
    },
    {
      at: "2026-10-05T22:54",
      title: { en: "Jack, Lucci and King", fr: "Jack, Lucci et King" },
      items: [
        { type: "new", game: "onepiece", en: "Jack the Drought joins One Piece (power 8 in Crew Roll).", fr: "Jack la Sécheresse rejoint One Piece (puissance 8 dans Roll ton équipage)." },
        { type: "new", game: "crew", en: "Crew Roll: Rob Lucci turns into his leopard form, King into his Pteranodon.", fr: "Roll ton équipage : Rob Lucci se transforme en léopard, King en Ptéranodon." },
      ],
    },
    {
      at: "2026-10-05T22:25",
      title: { en: "Achievements, collection and monthly seasons", fr: "Succès, collection et saisons mensuelles" },
      items: [
        { type: "new", en: "Achievements: 18 badges on your profile (bronze, silver, gold), from your first win to a season podium, with your progress on each. A banner pops up when you unlock one.", fr: "Succès : 18 badges sur ton profil (bronze, argent, or), de ta première victoire au podium de saison, avec ta progression pour chacun. Un bandeau s'affiche quand tu en débloques un." },
        { type: "new", game: "crew", en: "Collection: every card you draw in Crew Roll is kept (« ✨ New card! » the first time). The index shows which ones you have and which are left to find, and your profile shows your progress for each anime.", fr: "Collection : chaque carte tirée dans Roll ton équipage est gardée (« ✨ Nouvelle carte ! » la première fois). L'index montre celles que tu as et celles qui restent à trouver, et ton profil ta progression pour chaque animé." },
        { type: "new", en: "Monthly seasons: the leaderboard has a season of its own every month (best crews and most wins of the month), and last month's top 3 are shown as champions. The all-time leaderboard is still there.", fr: "Saisons mensuelles : le classement a sa propre saison chaque mois (meilleurs équipages et plus de victoires du mois), et le top 3 du mois précédent est affiché en champions. Le classement de tous les temps est toujours là." },
      ],
    },
    {
      at: "2026-10-05T22:15",
      title: { en: "42 new transformations", fr: "42 nouvelles transformations" },
      items: [
        { type: "new", game: "crew", en: "Crew Roll: 42 new transformations across every anime, with their own effects. Black Clover gets its first ones (Black Asta, Spirit Dive, Valkyrie Dress, Salamander, Dante's Devil Union); also Aizen, Kenpachi, Yhwach, Starrk, Komamura, Mayuri, Perfect Cell, Super Buu, Orange Piccolo, Jiren, Zamasu, Kale, Shukaku, Jiraiya, Minato, Obito, Madara, Kabuto, Monster Point Chopper, Marco, Sanji's Raid Suit, Katakuri, Kaidou, Megumi, Jogo, Maki, Hakari, Higuruma, Netero, Biscuit, Pitou, Youpi and five more Titans.", fr: "Roll ton équipage : 42 nouvelles transformations dans tous les animes, avec leurs propres effets. Black Clover a ses premières (Asta noir, Spirit Dive, Armure de Valkyrie, Salamandre, Dante en fusion démoniaque) ; et aussi Aizen, Kenpachi, Yhwach, Starrk, Komamura, Mayuri, Cell Super Parfait, Super Boo, Piccolo Orange, Jiren, Zamasu, Kale, Shukaku, Jiraiya, Minato, Obito, Madara, Kabuto, Chopper Monster Point, Marco, le Raid Suit de Sanji, Katakuri, Kaidou, Megumi, Jogo, Maki, Hakari, Higuruma, Netero, Biscuit, Pitou, Youpi et cinq Titans de plus." },
        { type: "balance", game: "onepiece", en: "One Piece: Saint Figarland Garling 10.", fr: "One Piece : Saint Figarland Garling 10." },
        { type: "balance", game: "hunterxhunter", en: "Hunter × Hunter: Biscuit 8.", fr: "Hunter × Hunter : Biscuit 8." },
      ],
    },
    {
      at: "2026-10-05T20:50",
      title: { en: "Lighter patch notes, faster on phones", fr: "Nouveautés plus légères, plus rapide sur téléphone" },
      items: [
        { type: "improved", en: "Faster on phones and PC: pictures stay in your browser between visits, leaderboard and index faces load only when you scroll to them, taps react at once and typing no longer zooms the page on iPhone.", fr: "Plus rapide sur téléphone et PC : les images restent dans ton navigateur d'une visite à l'autre, les visages du classement et de l'index ne chargent que quand tu descends jusqu'à eux, les appuis réagissent tout de suite et écrire ne zoome plus la page sur iPhone." },
        { type: "improved", en: "What's new is split by update (date and time) and into pages, and only opens by itself for what you have not seen yet. Everything else stays behind the What's new button.", fr: "Les Nouveautés sont rangées par mise à jour (date et heure) et en pages, et ne s'ouvrent toutes seules que pour ce que tu n'as pas encore vu. Le reste est derrière le bouton Nouveautés." },
      ],
    },
    {
      at: "2026-10-05T20:32",
      title: { en: "Smoother site and My stats", fr: "Site plus fluide et Mes stats" },
      items: [
        { type: "improved", en: "Smoother everywhere (60 fps): no more blur behind menus and the top bar, animations that no longer redraw the page, a much lighter Crew Roll index and draw, a background that loads only what fits on screen.", fr: "Plus fluide partout (60 fps) : plus de flou derrière les menus et la barre du haut, des animations qui ne redessinent plus la page, un index et un tirage de Roll ton équipage beaucoup plus légers, un fond qui ne charge que ce qui tient à l'écran." },
        { type: "new", en: "Profile: a My stats section with your games played, wins and win rate, rolls and rerolls, guesses, best streak, crews built, online matches, time played and favourite anime.", fr: "Profil : une section Mes stats avec tes parties jouées, victoires et taux de victoire, rolls et relances, essais, meilleure série, équipages construits, matchs en ligne, temps de jeu et animé préféré." },
      ],
    },
    {
      at: "2026-10-05T20:12",
      title: { en: "Blurred and Description games, team vs team", fr: "Jeux Flou et Description, équipe contre équipe" },
      items: [
        { type: "new", en: "Blurred game: guess the character from a blurred picture that gets sharper with every guess.", fr: "Jeu Flou : trouve le perso à partir d'une image floue qui se précise à chaque essai." },
        { type: "new", en: "Description game: a description of the character; after 3 guesses a technique or a place, after 5 a nickname or the first letter. 687 descriptions, spoiler-free.", fr: "Jeu Description : une description du perso ; après 3 essais une technique ou un lieu, après 5 un surnom ou la première lettre. 687 descriptions, sans spoiler." },
        { type: "new", en: "Team vs team online: red against blue in the guessing races (all three games) and in Crew Roll. The host turns it on in the room.", fr: "Équipe contre équipe en ligne : rouges contre bleus dans les courses (les trois jeux) et dans Roll ton équipage. L'hôte l'active dans la salle." },
        { type: "improved", en: "The strongest characters glow: a gold aura for power 10, violet for 9, in suggestions, guesses and results.", fr: "Les persos les plus forts brillent : aura dorée pour la puissance 10, violette pour 9, dans les suggestions, les essais et les résultats." },
      ],
    },
    {
      at: "2026-10-05T19:48",
      title: { en: "New characters and ratings for every anime", fr: "Nouveaux persos et notes pour chaque animé" },
      items: [
        { type: "new", game: "onepiece", en: "One Piece: Scopper Gaban, Den, Peepley Lulu, Gaimon, Charlos, Figarland Garling and Shamrock.", fr: "One Piece : Scopper Gaban, Den, Peepley Lulu, Gaimon, Charlos, Figarland Garling et Shamrock." },
        { type: "new", game: "dragonball", en: "Dragon Ball: Dr. Brief, Gamma 1 and 2, Saonel and Pirina.", fr: "Dragon Ball : Dr Brief, Gamma 1 et 2, Saonel et Pirina." },
        { type: "new", game: "attackontitan", en: "Attack on Titan: Marlo and Traute; the Garrison slot becomes Garrison / Military Police.", fr: "SNK : Marlo et Traute ; la case Garnison devient Garnison / Brigades spéciales." },
        { type: "new", game: "crew", en: "Gon transforms into Adult Gon in Crew Roll.", fr: "Gon se transforme en Gon adulte dans Roll ton équipage." },
        { type: "balance", game: "onepiece", en: "One Piece: Gaban 10 (navigator 9), Den and Lulu shipwrights 9; Ace, Crocodile, Kin'emon, Pedro, Cavendish, Dorry, Brogy, the Minks, Gin, Kalifa, Doc Q, Zeff and Shirahoshi down; Hawkins 7.", fr: "One Piece : Gaban 10 (navigateur 9), Den et Lulu charpentiers 9 ; Ace, Crocodile, Kin'emon, Pedro, Cavendish, Dorry, Brogy, les Minks, Gin, Kalifa, Doc Q, Zeff et Shirahoshi baissent ; Hawkins 7." },
        { type: "balance", game: "bleach", en: "Bleach: the Royal Guard at 9 (Ichibe stays 10), Ginjo 9, Tsukishima 8, Sado 7; Tosen 8 as Shinigami and 9 as Arrancar; Uryu 9 in Quincy; healers Isane and Hikifune 9, Hanataro 8; the Engineer slot becomes Strategist / Engineer (Yhwach 9).", fr: "Bleach : la Garde royale à 9 (Ichibe reste à 10), Ginjo 9, Tsukishima 8, Sado 7 ; Tosen 8 en Shinigami et 9 en Arrancar ; Uryū 9 en Quincy ; soigneurs Isane et Hikifune 9, Hanataro 8 ; la case Ingénieur devient Stratège / Ingénieur (Yhwach 9)." },
        { type: "balance", game: "hunterxhunter", en: "Hunter × Hunter: Gon, Ging and Zeno 10, Palm 7; Machi healer 9; Ging strategist 10.", fr: "Hunter × Hunter : Gon, Ging et Zeno 10, Palm 7 ; Machi soigneuse 9 ; Ging stratège 10." },
        { type: "balance", game: "dragonball", en: "Dragon Ball: Scientist becomes Scientist / Strategist (Piccolo and Roshi 10, Dr. Brief 9, Babidi 8); C-18 9 as Earthling and Android; Beerus, Champa and Toppo 7 and Whis 9 as God / Angel.", fr: "Dragon Ball : Scientifique devient Scientifique / Stratège (Piccolo et Tortue Géniale 10, Dr Brief 9, Babidi 8) ; C-18 9 en Terrien et Cyborg ; Beerus, Champa et Toppo 7 et Whis 9 en Dieu / Ange." },
        { type: "balance", game: "jujutsukaisen", en: "Jujutsu Kaisen: Kamo and Mechamaru 8 and Mai 7 at Kyoto, Higuruma 9 and Hana 8 as Freelance; Sukuna healer 9; Tengen and Kenjaku strategists 9.", fr: "Jujutsu Kaisen : Kamo et Mechamaru 8 et Mai 7 à Kyoto, Higuruma 9 et Hana 8 en Indépendants ; Sukuna soigneur 9 ; Tengen et Kenjaku stratèges 9." },
        { type: "balance", game: "blackclover", en: "Black Clover: Yami 10, Nozel 9 (11 as captain); William 9, Langris 8 and Klaus 7 in the Golden Dawn.", fr: "Black Clover : Yami 10, Nozel 9 (11 en capitaine) ; William 9, Langris 8 et Klaus 7 dans l'Aube Dorée." },
        { type: "balance", game: "attackontitan", en: "Attack on Titan: Hange 7 and Connie 6 in the Survey Corps; Rico 8 and Ian 6 in the Garrison.", fr: "SNK : Hange 7 et Connie 6 au Bataillon ; Rico 8 et Ian 6 à la Garnison." },
      ],
    },
    {
      at: "2026-10-05T17:46",
      title: { en: "Crew Roll index and leaderboard per anime", fr: "Index de Roll ton équipage et classement par animé" },
      items: [
        { type: "new", game: "crew", en: "Crew Roll index: every card of each anime with its rarity, its power and what it scores in every role. Search, filter by rarity and sort by role.", fr: "Index de Roll ton équipage : toutes les cartes de chaque animé avec leur rareté, leur puissance et ce qu'elles rapportent dans chaque rôle. Recherche, filtre par rareté et tri par rôle." },
        { type: "new", en: "Leaderboard per anime: the best Bleach crews, One Piece crews and so on, with each crew's faces.", fr: "Classement par animé : les meilleurs équipages Bleach, One Piece, etc., avec les visages de chaque équipage." },
      ],
    },
    {
      at: "2026-10-05T14:43",
      title: { en: "Steadier online play", fr: "Jeu en ligne plus stable" },
      items: [
        { type: "fix", en: "No more getting kicked offline: a connection that drops for a moment (phone in the background, network hiccup) now comes back by itself, and an online match carries on where it was.", fr: "Fini les déconnexions intempestives : une connexion qui saute un instant (téléphone en arrière-plan, réseau qui coupe) revient toute seule, et le match en ligne reprend où il en était." },
      ],
    },
    {
      at: "2026-10-05T14:02",
      title: { en: "Bleach and Black Clover ratings", fr: "Notes Bleach et Black Clover" },
      items: [
        { type: "new", game: "bleach", en: "Akon joins Bleach, as an engineer.", fr: "Akon rejoint Bleach, en ingénieur." },
        { type: "balance", game: "bleach", en: "Bleach: Visored and Quincy ratings spread out, Tenjiro healer 10, Kenpachi 10, Uryu 8, Tsukishima and Sasakibe 7.", fr: "Bleach : notes des Visored et Quincy plus variées, Tenjirō soigneur 10, Kenpachi 10, Uryū 8, Tsukishima et Sasakibe 7." },
        { type: "balance", game: "blackclover", en: "Black Clover: Rades healer 9.", fr: "Black Clover : Rades soigneur 9." },
      ],
    },
    {
      at: "2026-10-05T13:42",
      title: { en: "Attack on Titan", fr: "L'Attaque des Titans" },
      items: [
        { type: "new", game: "attackontitan", en: "Snkdle: 57 Attack on Titan characters over 7 anime arcs, spoiler-free (Titan shifters are only revealed with the anime).", fr: "Snkdle : 57 persos de L'Attaque des Titans sur 7 arcs, sans spoiler (les Titans Shifters ne sont révélés qu'avec l'anime)." },
        { type: "new", game: "crew", en: "Crew Roll Attack on Titan: Titans, Survey Corps, Strategist, Garrison, Marley, Commander and Wildcard, with 11 Titan transformations.", fr: "Roll ton équipage SNK : Titans, Bataillon, Stratège, Garnison, Mahr, Commandant et Joker, avec 11 transformations en Titan." },
        { type: "new", game: "onepiece", en: "19 new One Piece characters: Bepo, Laffitte, Crocus, Nico Olvia, Streusen, Sukiyaki, Benn Beckman, Lucky Roux, Yasopp, Oven, Perospero…", fr: "19 nouveaux persos One Piece : Bépo, Laffitte, Crocus, Nico Olvia, Streusen, Sukiyaki, Ben Beckman, Lucky Roux, Yasopp, Oven, Perospero…" },
        { type: "improved", en: "Portraits now come from the anime instead of the manga (Attack on Titan, Black Clover), in the characters' early look.", fr: "Les portraits viennent maintenant de l'anime et plus du manga (SNK, Black Clover), dans le look du début." },
      ],
    },
    {
      at: "2026-10-04T22:48",
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
      at: "2026-10-02T17:35",
      title: { en: "Smoother Crew Roll", fr: "Roll ton équipage plus fluide" },
      items: [
        { type: "fix", game: "crew", en: "No more getting stuck with a character that fits nowhere: a free skip appears.", fr: "Plus de blocage avec un perso qui ne rentre nulle part : un bouton passer apparaît." },
        { type: "fix", game: "crew", en: "Online, every crew can be completed even when the pool runs dry.", fr: "En ligne, chaque équipage peut être complété même quand il n'y a plus de persos libres." },
        { type: "improved", en: "When a new version of the site is out, a banner offers to reload.", fr: "Quand une nouvelle version du site sort, un bandeau propose de recharger." },
      ],
    },
  ];

  const PAGE = 3;
  const T = {
    en: { title: "What's new", today: "Today", button: "What's new", close: "Let's go!", unseen: (n) => `${n} new update${n > 1 ? "s" : ""}`,
      prev: "Newer", next: "Older", page: (a, b) => `Page ${a} / ${b}`,
      types: { new: "New", improved: "Improved", balance: "Balance", fix: "Fix" }, crew: "Crew Roll" },
    fr: { title: "Nouveautés", today: "Aujourd'hui", button: "Nouveautés", close: "C'est parti !", unseen: (n) => `${n} nouvelle${n > 1 ? "s" : ""} mise${n > 1 ? "s" : ""} à jour`,
      prev: "Plus récent", next: "Plus ancien", page: (a, b) => `Page ${a} / ${b}`,
      types: { new: "Nouveau", improved: "Amélioré", balance: "Équilibrage", fix: "Correctif" }, crew: "Roll ton équipage" },
  };
  const KEY = "dle:changelog-seen";
  const lang = () => (window.DLE_LANG?.get() === "fr" ? "fr" : "en");
  const t = (k) => T[lang()][k];
  const ROOT = (document.currentScript?.src || "").replace(/shared\/changelog\.js.*$/, "");
  const GAMES = window.DLE_GAMES || [];
  const latest = LOG[0].at;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const longDate = (key) => new Date(`${key}T12:00:00`).toLocaleDateString(lang(), { weekday: "long", day: "numeric", month: "long" });
  const clock = (at) => (lang() === "fr" ? at.slice(11).replace(":", "h") : at.slice(11));
  // The last update seen. Older saves were "day#item count": that day's updates are seen up to that many items.
  const seen = () => {
    let v = "";
    try { v = localStorage.getItem(KEY) || ""; } catch {}
    const old = /^(\d{4}-\d{2}-\d{2})#(\d+)$/.exec(v);
    if (!old) return v;
    let mark = `${old[1]}T00:00`;
    let count = 0;
    for (const u of LOG.filter((x) => x.at.startsWith(old[1])).reverse()) {
      count += u.items.length;
      if (count > Number(old[2])) break;
      mark = u.at;
    }
    return LOG.some((x) => x.at.startsWith(old[1])) ? mark : `${old[1]}T23:59`;
  };
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
      const m = el("img", "cl-game cl-game-crew");
      m.src = `${ROOT}assets/logos/sunny.webp`;
      m.alt = "";
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

  function update(entry, { open, isNew }) {
    const box = el("details", `cl-day${isNew ? " is-new" : ""}`);
    box.open = open;
    const head = el("summary", "cl-day-head");
    const date = entry.at.slice(0, 10);
    const when = `${date === todayKey() ? `${t("today")} · ` : ""}${longDate(date)} · ${clock(entry.at)}`;
    head.append(el("span", "cl-date", when), el("span", "cl-day-title", entry.title[lang()]));
    box.append(head);
    const list = el("ul", "cl-list");
    entry.items.forEach((item, i) => {
      const li = el("li", "cl-item");
      li.style.animationDelay = `${60 + i * 40}ms`;
      const mark = gameMark(item.game);
      li.append(badge(item));
      if (mark) li.append(mark);
      li.append(el("p", "cl-text", item[lang()]));
      list.append(li);
    });
    box.append(list);
    return box;
  }

  let dialog = null;
  let view = { onlyNew: false, page: 0, lastSeen: "" };

  function render() {
    // A first visit only gets the latest update; the rest is behind the button.
    const entries = !view.onlyNew ? LOG : view.lastSeen ? LOG.filter((u) => u.at > view.lastSeen) : LOG.slice(0, 1);
    const pages = Math.max(1, Math.ceil(entries.length / PAGE));
    view.page = Math.min(Math.max(0, view.page), pages - 1);
    const shown = entries.slice(view.page * PAGE, view.page * PAGE + PAGE);

    const card = el("div", "cl-card");
    const glow = el("div", "cl-glow");
    const head = el("header", "cl-head");
    const spark = el("span", "cl-spark");
    spark.innerHTML = svg(ICONS.new, 28);
    const titles = el("div", "cl-titles");
    titles.append(el("h2", "cl-title", t("title")), el("p", "cl-sub", view.onlyNew ? t("unseen")(entries.length) : LOG[0].title[lang()]));
    const x = el("button", "cl-x", "✕");
    x.type = "button";
    x.setAttribute("aria-label", "Close");
    x.addEventListener("click", () => dialog.close());
    head.append(spark, titles, x);

    const body = el("div", "cl-body");
    shown.forEach((entry, i) => body.append(update(entry, { open: view.page === 0 && i === 0 || view.onlyNew || entry.items.length <= 4, isNew: entry.at > view.lastSeen })));

    card.append(glow, head, body);
    if (pages > 1) {
      const pager = el("nav", "cl-pager");
      const go = (p) => { view.page = p; render(); dialog.querySelector(".cl-body")?.scrollTo(0, 0); };
      const prev = el("button", "cl-page-btn", `‹ ${t("prev")}`);
      prev.type = "button";
      prev.disabled = view.page === 0;
      prev.addEventListener("click", () => go(view.page - 1));
      const dots = el("div", "cl-dots");
      for (let p = 0; p < pages; p++) {
        const d = el("button", `cl-dot${p === view.page ? " is-on" : ""}`, String(p + 1));
        d.type = "button";
        d.setAttribute("aria-label", t("page")(p + 1, pages));
        d.addEventListener("click", () => go(p));
        dots.append(d);
      }
      const next = el("button", "cl-page-btn", `${t("next")} ›`);
      next.type = "button";
      next.disabled = view.page === pages - 1;
      next.addEventListener("click", () => go(view.page + 1));
      pager.append(prev, dots, next);
      card.append(pager);
    }
    const close = el("button", "btn-primary cl-go", t("close"));
    close.type = "button";
    close.addEventListener("click", () => dialog.close());
    card.append(close);
    dialog.replaceChildren(card);
  }

  // onlyNew: just the updates not seen yet (the automatic opening); otherwise the whole history.
  function open({ onlyNew = false } = {}) {
    if (!dialog) {
      dialog = el("dialog", "cl-modal");
      dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener("close", markSeen);
      document.body.append(dialog);
    }
    view = { onlyNew, page: 0, lastSeen: seen() };
    render();
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
      button.addEventListener("click", () => open());
      bar.prepend(button);
    }
    button.innerHTML = svg(ICONS.new, 18);
    button.append(el("span", "cl-btn-label", t("button")));
    button.title = t("button");
    button.classList.toggle("has-news", seen() < latest);
  }

  // Opens by itself only when an update was never seen, after any other window (name, arc picker…) is closed.
  function autoOpen() {
    if (seen() >= latest) return;
    const tryOpen = (left) => {
      if (document.querySelector("dialog[open]") && left > 0) { setTimeout(() => tryOpen(left - 1), 1000); return; }
      open({ onlyNew: true });
      window.DLE_FX?.play("win");
    };
    setTimeout(() => tryOpen(120), 900);
  }

  function init() {
    renderButton();
    autoOpen();
  }
  window.addEventListener("dle:lang", () => { renderButton(); if (dialog?.open) render(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.DLE_Changelog = { open };
})();
