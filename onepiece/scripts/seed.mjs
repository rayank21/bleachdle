// Source list for Onepiecedle. Affiliation, origin, height, bounty, Devil Fruit, epithet, portrait and
// first arc are scraped from the One Piece wiki (scrape.mjs). Gender and spoiler-free overrides are set here.
//
// Arc indexes (anime episodes):
//   0 East Blue (1–61) · 1 Arabasta (62–135) · 2 Sky Island (136–206) · 3 Water 7 & Enies Lobby (207–325)
//   4 Thriller Bark (326–384) · 5 Summit War (385–516) · 6 Fish-Man Island (517–574)
//   7 Punk Hazard & Dressrosa (575–746) · 8 Zou & Whole Cake Island (747–891) · 9 Wano (892–1085) · 10 Egghead (1086–)
//
// Any field may be { arcIndex: value } to stay spoiler-free. Bounties are in berries (0 = none).

const SH = ["Straw Hat Pirates"];

export const seed = [
  // ── Straw Hat Pirates (bounties set arc by arc) ──
  { wiki: "Monkey D. Luffy", gender: "M", aff: SH, fruit: { 0: ["Paramecia"], 9: ["Zoan"] },
    bounty: { 0: 30000000, 1: 100000000, 3: 300000000, 5: 400000000, 7: 500000000, 8: 1500000000, 9: 3000000000 } },
  { wiki: "Roronoa Zoro", gender: "M", aff: SH, bounty: { 0: 0, 3: 120000000, 7: 320000000, 9: 1111000000 } },
  { wiki: "Nami", gender: "F", aff: { 0: ["Arlong Pirates", ...SH], 1: SH }, bounty: { 0: 0, 3: 16000000, 7: 66000000, 9: 366000000 } },
  { wiki: "Usopp", gender: "M", aff: SH, bounty: { 0: 0, 3: 30000000, 7: 200000000, 9: 500000000 } },
  { wiki: "Sanji", gender: "M", aff: SH, bounty: { 0: 0, 3: 77000000, 7: 177000000, 9: 1032000000 } },
  { wiki: "Tony Tony Chopper", gender: "M", aff: SH, bounty: { 1: 0, 3: 50, 7: 100, 9: 1000 } },
  { wiki: "Nico Robin", gender: "F", aff: { 1: ["Baroque Works"], 2: SH }, bounty: { 1: 79000000, 3: 80000000, 7: 130000000, 9: 930000000 } },
  { wiki: "Franky", gender: "M", aff: { 3: ["Franky Family"], 4: SH }, bounty: { 3: 44000000, 7: 94000000, 9: 394000000 } },
  { wiki: "Brook", gender: "M", aff: SH, bounty: { 4: 33000000, 7: 83000000, 9: 383000000 } },
  { wiki: "Jinbe", gender: "M", aff: { 5: ["Sun Pirates", "Seven Warlords"], 7: ["Sun Pirates"], 9: SH }, bounty: { 5: 0, 8: 438000000, 9: 1100000000 } },

  // ── East Blue ──
  { wiki: "Shanks", gender: "M", bounty: { 0: null, 9: 4048900000 } },
  { wiki: "Buggy", gender: "M", aff: { 0: ["Buggy Pirates"], 10: ["Cross Guild"] }, bounty: { 0: 15000000, 10: 3189000000 } },
  { wiki: "Alvida", gender: "F", aff: { 0: ["Alvida Pirates"], 10: ["Cross Guild"] } },
  { wiki: "Koby", gender: "M", aff: ["Marines"] },
  { wiki: "Helmeppo", gender: "M" },
  { wiki: "Morgan", gender: "M" },
  { wiki: "Kuro", gender: "M" },
  { wiki: "Don Krieg", gender: "M" },
  { wiki: "Zeff", gender: "M" },
  { wiki: "Arlong", gender: "M" },
  { wiki: "Nojiko", gender: "F", aff: ["Cocoyasi Village"] },
  { wiki: "Bell-mère", gender: "F" },
  { wiki: "Smoker", gender: "M" },
  { wiki: "Tashigi", gender: "F" },
  { wiki: "Monkey D. Dragon", gender: "M" },
  { wiki: "Gol D. Roger", gender: "M", bounty: { 0: null, 9: 5564800000 } },
  { wiki: "Kuina", gender: "F" },
  { wiki: "Dracule Mihawk", gender: "M", aff: { 0: ["Seven Warlords"], 10: ["Cross Guild"] }, bounty: { 0: 0, 10: 3590000000 } },

  // ── Arabasta ──
  { wiki: "Crocodile", gender: "M", aff: { 1: ["Baroque Works"], 10: ["Cross Guild"] }, bounty: { 1: 0, 10: 1965000000 } },
  { wiki: "Daz Bonez", gender: "M", aff: { 1: ["Baroque Works"], 10: ["Cross Guild"] } },
  { wiki: "Bentham", gender: "M", aff: { 1: ["Baroque Works"], 5: ["Newkama Land"] } },
  { wiki: "Galdino", gender: "M", aff: { 1: ["Baroque Works"], 10: ["Cross Guild"] } },
  { wiki: "Nefertari Vivi", gender: "F" },
  { wiki: "Wapol", gender: "M", aff: ["Drum Kingdom"] },
  { wiki: "Kureha", gender: "F", aff: ["Drum Kingdom"] },
  { wiki: "Hiriluk", gender: "M", aff: ["Drum Kingdom"] },
  { wiki: "Portgas D. Ace", gender: "M", bounty: 550000000 },

  // ── Sky Island ──
  { wiki: "Enel", gender: "M", aff: ["God's Army"] },
  // The wiki's infobox shows him from the manga: the anime one instead.
  { wiki: "Wyper", gender: "M", img: "Wyper_Anime_Pre_Timeskip_Infobox.png" },
  { wiki: "Gan Fall", gender: "M" },
  { wiki: "Doc Q", gender: "M", aff: { 2: ["Blackbeard Pirates"] } },
  { wiki: "Marshall D. Teach", gender: "M", fruit: { 2: ["Unknown"], 5: ["Logia", "Paramecia"] }, bounty: { 2: 0, 9: 3996000000 } },

  // ── Water 7 & Enies Lobby ──
  { wiki: "Kuzan", gender: "M", aff: { 3: ["Marines"], 9: ["Blackbeard Pirates"] } },
  { wiki: "Iceburg", gender: "M" },
  { wiki: "Tom", gender: "M" },
  { wiki: "Paulie", gender: "M" },
  { wiki: "Rob Lucci", gender: "M", aff: { 3: ["CP9"], 9: ["CP0"] } },
  { wiki: "Kaku", gender: "M", aff: { 3: ["CP9"], 9: ["CP0"] } },
  { wiki: "Kalifa", gender: "F", aff: ["CP9"] },
  { wiki: "Spandam", gender: "M", aff: ["CP9"] },
  { wiki: "Monkey D. Garp", gender: "M" },

  // ── Thriller Bark ──
  { wiki: "Gecko Moria", gender: "M", aff: ["Thriller Bark Pirates", "Seven Warlords"] },
  { wiki: "Perona", gender: "F" },
  { wiki: "Bartholomew Kuma", gender: "M", aff: { 2: ["Seven Warlords"], 7: ["Revolutionary Army"] } },

  // ── Summit War ──
  { wiki: "Silvers Rayleigh", gender: "M" },
  { wiki: "Eustass Kid", gender: "M" },
  { wiki: "Trafalgar D. Water Law", name: "Trafalgar Law", gender: "M" },
  { wiki: "Killer", gender: "M" },
  { wiki: "Basil Hawkins", gender: "M" },
  { wiki: "X Drake", gender: "M" },
  { wiki: "Jewelry Bonney", gender: "F" },
  { wiki: "Boa Hancock", gender: "F", aff: ["Kuja Pirates", "Seven Warlords"] },
  { wiki: "Emporio Ivankov", gender: "M" },
  { wiki: "Magellan", gender: "M" },
  { wiki: "Edward Newgate", gender: "M", bounty: { 1: null, 9: 5046000000 } },
  { wiki: "Marco", gender: "M", bounty: { 2: null, 9: 1374000000 } },
  { wiki: "Sengoku", gender: "M" },
  { wiki: "Sakazuki", gender: "M" },
  { wiki: "Borsalino", gender: "M" },

  // ── Fish-Man Island ──
  { wiki: "Hody Jones", gender: "M" },
  { wiki: "Shirahoshi", gender: "F" },
  { wiki: "Neptune", gender: "M" },
  { wiki: "Fisher Tiger", gender: "M" },

  // ── Punk Hazard & Dressrosa ──
  { wiki: "Caesar Clown", gender: "M" },
  { wiki: "Monet", gender: "F", aff: ["Donquixote Pirates"] },
  { wiki: "Vergo", gender: "M" },
  { wiki: "Kin'emon", gender: "M" },
  { wiki: "Kozuki Momonosuke", gender: "M", height: { 7: 110, 9: 322 } },
  { wiki: "Donquixote Doflamingo", gender: "M", aff: ["Donquixote Pirates", "Seven Warlords"] },
  { wiki: "Issho", gender: "M" },
  { wiki: "Sabo", gender: "M", height: 187 },
  { wiki: "Rebecca", gender: "F" },
  { wiki: "Kyros", gender: "M" },
  { wiki: "Bartolomeo", gender: "M" },
  { wiki: "Cavendish", gender: "M" },

  // ── Zou & Whole Cake Island ──
  { wiki: "Carrot", gender: "F" },
  { wiki: "Pedro", gender: "M" },
  { wiki: "Inuarashi", gender: "M" },
  { wiki: "Nekomamushi", gender: "M" },
  { wiki: "Imu", name: "Imu", gender: "Unknown", img: "Imu_Anime_Concept_Art.png" },
  { wiki: "Charlotte Linlin", gender: "F", bounty: { 6: null, 9: 4388000000 } },
  { wiki: "Charlotte Katakuri", gender: "M" },
  { wiki: "Charlotte Pudding", gender: "F" },
  { wiki: "Charlotte Cracker", gender: "M" },
  { wiki: "Charlotte Brulee", name: "Charlotte Brûlée", gender: "F" },
  { wiki: "Vinsmoke Judge", gender: "M" },
  { wiki: "Vinsmoke Reiju", gender: "F" },

  // ── Wano ──
  { wiki: "Kaidou", gender: "M", bounty: { 7: null, 9: 4611100000 } },
  { wiki: "King", gender: "M" },
  { wiki: "Queen", gender: "M" },
  { wiki: "Jack", gender: "M" },
  { wiki: "Yamato", gender: "M", aff: ["Beasts Pirates"] },
  { wiki: "Kozuki Oden", gender: "M" },
  { wiki: "Kozuki Hiyori", gender: "F" },

  // ── Navigators, cooks, doctors and crews added later (their first arc comes from the wiki) ──
  { wiki: "Crocus", gender: "M" },
  { wiki: "Nico Olivia", gender: "F" },
  { wiki: "Dorry", gender: "M" },
  { wiki: "Brogy", gender: "M" },
  { wiki: "Bellamy", gender: "M" },
  { wiki: "Gin", gender: "M" },
  { wiki: "Laffitte", gender: "M" },
  { wiki: "Tsuru", gender: "F" },
  { wiki: "Jozu", gender: "M" },
  { wiki: "Bepo", gender: "M" },
  { wiki: "Urouge", gender: "M" },
  { wiki: "Scratchmen Apoo", gender: "M" },
  { wiki: "Benn Beckman", gender: "M" },
  { wiki: "Lucky Roux", gender: "M" },
  { wiki: "Yasopp", gender: "M" },
  { wiki: "Streusen", gender: "M" },
  { wiki: "Charlotte Perospero", gender: "M" },
  { wiki: "Charlotte Oven", gender: "M" },
  { wiki: "Gaimon", gender: "M" },
  { wiki: "Peepley Lulu", gender: "M" },
  { wiki: "Den", gender: "M" },
  { wiki: "Charlos", name: "Charlos", gender: "M" },
  // Seen in flashbacks from the first episode, but only named in Wano.
  { wiki: "Scopper Gaban", gender: "M", arc: 9 },
  // Oden's father hides as Hitetsu for most of Wano.
  { wiki: "Kozuki Sukiyaki", gender: "M", arc: 9 },

  // ── Egghead ──
  { wiki: "Vegapunk", gender: "M" },
  // The Five Elders appear early, but they are only named (and fight) in Egghead.
  { wiki: "Jaygarcia Saturn", gender: "M", arc: 10 },
  { wiki: "Marcus Mars", gender: "M", arc: 10 },
  { wiki: "Topman Warcury", gender: "M", arc: 10 },
  { wiki: "Ethanbaron V. Nusjuro", gender: "M", arc: 10 },
  { wiki: "Shepherd Ju Peter", gender: "M", arc: 10 },
  { wiki: "Figarland Garling", gender: "M", arc: 10 },
  { wiki: "Figarland Shamrock", gender: "M", arc: 10 },
];
