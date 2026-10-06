// Categories of the site. Paths are relative to the site root.
window.DLE_GAMES = [
  { id: "bleach", storage: "bleachdle", brand: "Bleachdle", anime: "Bleach", path: "bleach/", logo: "assets/logos/bleachdle.png", count: 106, arcs: 7,
    featured: ["ichigo-kurosaki", "rukia-kuchiki", "sosuke-aizen", "kenpachi-zaraki", "byakuya-kuchiki", "ulquiorra-cifer"] },
  { id: "hunterxhunter", storage: "hunterdle", brand: "Hunterdle", anime: "Hunter × Hunter", path: "hunterxhunter/", logo: "assets/logos/hunterdle.png", count: 92, arcs: 7,
    featured: ["gon-freecss", "killua-zoldyck", "kurapika", "hisoka", "chrollo-lucilfer", "meruem"] },
  { id: "dragonball", storage: "dragonballdle", brand: "Dragonballdle", anime: "Dragon Ball", path: "dragonball/", logo: "assets/logos/dragonballdle.jpg", count: 92, arcs: 9,
    featured: ["goku", "vegeta", "piccolo", "frieza", "cell", "majin-buu"] },
  { id: "naruto", storage: "narutodle", brand: "Narutodle", anime: "Naruto", path: "naruto/", logo: "assets/logos/narutodle.jpg", count: 93, arcs: 9,
    featured: ["naruto-uzumaki", "sasuke-uchiha", "sakura-haruno", "kakashi-hatake", "itachi-uchiha", "gaara"] },
  { id: "onepiece", storage: "onepiecedle", brand: "Onepiecedle", anime: "One Piece", path: "onepiece/", logo: "assets/logos/onepiecedle.jpg", count: 160, arcs: 11,
    featured: ["monkey-d-luffy", "roronoa-zoro", "nami", "sanji", "shanks", "trafalgar-law"] },
  { id: "jujutsukaisen", storage: "jujutsudle", brand: "Jujutsudle", anime: "Jujutsu Kaisen", path: "jujutsukaisen/", logo: "assets/logos/jujutsudle.jpg", count: 60, arcs: 7,
    featured: ["yuji-itadori", "megumi-fushiguro", "nobara-kugisaki", "satoru-gojo", "ryomen-sukuna", "kento-nanami"] },
  { id: "blackclover", storage: "blackcloverdle", brand: "Blackcloverdle", anime: "Black Clover", path: "blackclover/", logo: "assets/logos/blackcloverdle.png", count: 70, arcs: 10,
    featured: ["asta", "yuno", "yami-sukehiro", "noelle-silva", "julius-novachrono", "mereoleona-vermillion"] },
  { id: "attackontitan", storage: "snkdle", brand: "Snkdle", anime: "Attack on Titan", path: "attackontitan/", logo: "assets/logos/snkdle.png", count: 57, arcs: 7,
    featured: ["eren-yeager", "mikasa-ackerman", "armin-arlert", "levi", "erwin-smith", "hange-zoe"] },
  { id: "demonslayer", storage: "demonslayerdle", brand: "Demonslayerdle", anime: "Demon Slayer", path: "demonslayer/", logo: "assets/logos/demonslayerdle.png", count: 48, arcs: 8,
    featured: ["tanjiro-kamado", "nezuko-kamado", "zenitsu-agatsuma", "inosuke-hashibira", "kyojuro-rengoku", "muzan-kibutsuji"] },
  { id: "myheroacademia", storage: "mhadle", brand: "Mhadle", anime: "My Hero Academia", path: "myheroacademia/", logo: "assets/logos/mhadle.png", count: 59, arcs: 9,
    featured: ["izuku-midoriya", "katsuki-bakugo", "shoto-todoroki", "ochaco-uraraka", "all-might", "tomura-shigaraki"] },
  { id: "haikyuu", storage: "haikyudle", brand: "Haikyudle", anime: "Haikyuu!!", path: "haikyuu/", logo: "assets/logos/haikyudle.png", count: 50, arcs: 6,
    featured: ["shoyo-hinata", "tobio-kageyama", "kei-tsukishima", "yu-nishinoya", "toru-oikawa", "kotaro-bokuto"] },
  { id: "fireforce", storage: "fireforcedle", brand: "Fireforcedle", anime: "Fire Force", path: "fireforce/", logo: "assets/logos/fireforcedle.png", count: 29, arcs: 5,
    featured: ["shinra-kusakabe", "arthur-boyle", "maki-oze", "benimaru-shinmon", "tamaki-kotatsu", "akitaru-obi"] },
  { id: "slime", storage: "slimedle", brand: "Slimedle", anime: "That Time I Got Reincarnated as a Slime", path: "slime/", logo: "assets/logos/slimedle.png", count: 46, arcs: 5,
    featured: ["rimuru-tempest", "benimaru", "shuna", "shion", "milim-nava", "diablo"] },
  { id: "onepunchman", storage: "onepunchdle", brand: "Onepunchdle", anime: "One Punch Man", path: "onepunchman/", logo: "assets/logos/onepunchdle.png", count: 43, arcs: 5,
    featured: ["saitama", "genos", "tatsumaki", "garou", "bang", "boros"] },
];

// Link to the Crew Roll mini-game, shown after the categories in every header (its logo: the Thousand Sunny).
window.DLE_CREW_LINK = (root, label) =>
  `<a class="cat cat-crew" href="${root}crew/" title="${label}"><span class="cat-logo cat-dice cat-sunny"><img src="${root}assets/logos/sunny.webp" alt=""></span><span class="cat-name">${label}</span></a>`;

// Nostr relays used to find other players (Trystero). Pinned so a dead default relay can't keep players apart.
window.DLE_RELAYS = ["wss://nos.lol", "wss://relay.snort.social", "wss://nostr.mom", "wss://relay.primal.net"];
