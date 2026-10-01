// Categories of the site. Paths are relative to the site root.
window.DLE_GAMES = [
  { id: "bleach", storage: "bleachdle", brand: "Bleachdle", anime: "Bleach", path: "bleach/", logo: "assets/logos/bleachdle.png", count: 97, arcs: 7,
    featured: ["ichigo-kurosaki", "rukia-kuchiki", "sosuke-aizen", "kenpachi-zaraki", "byakuya-kuchiki", "ulquiorra-cifer"] },
  { id: "hunterxhunter", storage: "hunterdle", brand: "Hunterdle", anime: "Hunter × Hunter", path: "hunterxhunter/", logo: "assets/logos/hunterdle.png", count: 92, arcs: 7,
    featured: ["gon-freecss", "killua-zoldyck", "kurapika", "hisoka", "chrollo-lucilfer", "meruem"] },
  { id: "dragonball", storage: "dragonballdle", brand: "Dragonballdle", anime: "Dragon Ball", path: "dragonball/", logo: "assets/logos/dragonballdle.jpg", count: 77, arcs: 9,
    featured: ["goku", "vegeta", "piccolo", "frieza", "cell", "majin-buu"] },
  { id: "naruto", storage: "narutodle", brand: "Narutodle", anime: "Naruto", path: "naruto/", logo: "assets/logos/narutodle.jpg", count: 93, arcs: 9,
    featured: ["naruto-uzumaki", "sasuke-uchiha", "sakura-haruno", "kakashi-hatake", "itachi-uchiha", "gaara"] },
  { id: "onepiece", storage: "onepiecedle", brand: "Onepiecedle", anime: "One Piece", path: "onepiece/", logo: "assets/logos/onepiecedle.jpg", count: 99, arcs: 11,
    featured: ["monkey-d-luffy", "roronoa-zoro", "nami", "sanji", "shanks", "trafalgar-law"] },
  { id: "jujutsukaisen", storage: "jujutsudle", brand: "Jujutsudle", anime: "Jujutsu Kaisen", path: "jujutsukaisen/", logo: "assets/logos/jujutsudle.jpg", count: 60, arcs: 7,
    featured: ["yuji-itadori", "megumi-fushiguro", "nobara-kugisaki", "satoru-gojo", "ryomen-sukuna", "kento-nanami"] },
];

// Link to the Crew Roll mini-game, shown after the categories in every header.
window.DLE_CREW_LINK = (root, label) =>
  `<a class="cat cat-crew" href="${root}crew/" title="${label}"><span class="cat-logo cat-dice"><svg viewBox="0 0 24 24" width="22" height="22"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg></span><span class="cat-name">${label}</span></a>`;
