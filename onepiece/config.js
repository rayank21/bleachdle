// Onepiecedle: category config read by shared/engine.js
(() => {
  // 3000000000 → "฿3B" / "฿3 Md", 177000000 → "฿177M"
  const trim = (n) => String(Number(n.toFixed(2)));
  function berries(x, lang, tv) {
    if (x === 0) return tv("None");
    if (x >= 1e9) return `฿${trim(x / 1e9)}${lang === "fr" ? " Md" : "B"}`;
    if (x >= 1e6) return `฿${trim(x / 1e6)}M`;
    return `฿${x.toLocaleString(lang)}`;
  }

  window.DLE_CONFIG = {
    id: "onepiece",
    storage: "onepiecedle",
    brand: "Onepiecedle",
    anime: "One Piece",
    heroTitle: "ONE PIECE",
    example: "Zoro",

    arcs: [
      { en: "East Blue", fr: "East Blue", eps: "1–61" },
      { en: "Arabasta", fr: "Alabasta", eps: "62–135" },
      { en: "Sky Island", fr: "Skypiea", eps: "136–206" },
      { en: "Water 7 & Enies Lobby", fr: "Water Seven & Enies Lobby", eps: "207–325" },
      { en: "Thriller Bark", fr: "Thriller Bark", eps: "326–384" },
      { en: "Summit War", fr: "Guerre au sommet", eps: "385–516" },
      { en: "Fish-Man Island", fr: "Île des Hommes-Poissons", eps: "517–574" },
      { en: "Punk Hazard & Dressrosa", fr: "Punk Hazard & Dressrosa", eps: "575–746" },
      { en: "Zou & Whole Cake Island", fr: "Zo & Whole Cake Island", eps: "747–891" },
      { en: "Wano", fr: "Pays des Wa", eps: "892–1085" },
      { en: "Egghead", fr: "Egghead", eps: "1086–" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "aff", type: "set", width: 132 },
      { key: "fruit", type: "set", width: 100 },
      { key: "bounty", type: "number", width: 100, format: berries },
      { key: "height", type: "number", unit: " cm" },
      { key: "origin", type: "exact", width: 108 },
      { key: "arc", type: "arc", width: 140 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", aff: "Affiliation", fruit: "Devil Fruit", bounty: "Bounty", height: "Height", origin: "Origin", arc: "First Arc" },
      fr: { name: "Nom", gender: "Genre", aff: "Affiliation", fruit: "Fruit du démon", bounty: "Prime", height: "Taille", origin: "Origine", arc: "1er arc" },
    },

    hints: [
      {
        key: "epithet",
        at: 4,
        icon: "spark",
        label: { en: "Epithet", fr: "Surnom" },
        // Characters without an epithet give the first letter of their name instead.
        value: (v, ui) => (v.epithet ? `“${v.epithet}”` : ui.startsWith(v.name[0])),
      },
      { type: "portrait", at: 8 },
    ],

    names: { fr: { Kaidou: "Kaido", "Kouzuki Oden": "Kozuki Oden", "Kouzuki Hiyori": "Kozuki Hiyori", "Kouzuki Momonosuke": "Kozuki Momonosuke" } },

    values: {
      en: { M: "Male", F: "Female" },
      fr: {
        M: "Homme", F: "Femme", Unknown: "Inconnu", None: "Aucun",
        "Fish-Man Island": "Île des Hommes-Poissons", "Sky Island": "Île céleste",
        "Straw Hat Pirates": "Chapeau de paille", Marines: "Marine", "Seven Warlords": "Grands Corsaires",
        "Revolutionary Army": "Armée révolutionnaire", "Whitebeard Pirates": "Équipage de Barbe Blanche",
        "Blackbeard Pirates": "Équipage de Barbe Noire", "Big Mom Pirates": "Équipage de Big Mom",
        "Beasts Pirates": "Équipage aux Cent Bêtes", "Red Hair Pirates": "Équipage du Roux", "Roger Pirates": "Équipage de Roger",
        "Heart Pirates": "Équipage du Heart", "Kid Pirates": "Équipage de Kidd", "Kouzuki Family": "Famille Kozuki",
        "Charlotte Family": "Famille Charlotte", "Five Elders": "Cinq Doyens", "Vinsmoke Family": "Famille Vinsmoke", "Donquixote Pirates": "Famille Don Quichotte",
        "Buggy Pirates": "Équipage de Baggy", "Arlong Pirates": "Équipage d'Arlong", "Sun Pirates": "Équipage du Soleil",
        "Franky Family": "Franky Family", "Drum Kingdom": "Royaume de Drum", "Arabasta Kingdom": "Royaume d'Alabasta",
        "God's Army": "Armée divine", "Cocoyasi Village": "Village de Cocoyashi", "Mokomo Dukedom": "Duché de Mokomo",
        "Neptune Family": "Famille Neptune", "New Fish-Man Pirates": "Nouvel équipage des Hommes-Poissons",
      },
    },

    footer: {
      en: "Onepiecedle is a fan-made game and is not affiliated with Eiichiro Oda, Shueisha or Toei Animation. Character images from the One Piece Wiki (Fandom).",
      fr: "Onepiecedle est un jeu de fan, sans lien avec Eiichiro Oda, Shueisha ou Toei Animation. Images des personnages : One Piece Wiki (Fandom).",
    },
  };
})();
