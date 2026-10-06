// Onepunchdle: category config read by shared/engine.js
(() => {
  const HEIGHTS = ["< 160 cm", "160-169 cm", "170-179 cm", "180-189 cm", "190+ cm"];
  const bucket = (h) => (h == null ? "Unknown" : h < 160 ? HEIGHTS[0] : h < 170 ? HEIGHTS[1] : h < 180 ? HEIGHTS[2] : h < 190 ? HEIGHTS[3] : HEIGHTS[4]);

  window.DLE_CONFIG = {
    id: "onepunchman",
    storage: "onepunchdle",
    brand: "Onepunchdle",
    anime: "One Punch Man",
    heroTitle: "ONE PUNCH MAN",
    example: "Genos",

    arcs: [
      { en: "Hero Debut", fr: "Les débuts du héros", eps: "S1 1–6" },
      { en: "Deep Sea King & Boros", fr: "Le Roi des profondeurs & Boros", eps: "S1 7–12" },
      { en: "Hero Hunter Garou", fr: "Garou, le chasseur de héros", eps: "S2 1–8" },
      { en: "Monster Association", fr: "L'Association des monstres", eps: "S2 9–12" },
      { en: "Monster Association Raid", fr: "L'assaut contre les monstres", eps: "S3" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "race", type: "set", width: 110 },
      { key: "aff", type: "set", width: 150 },
      { key: "rank", type: "ordinal", width: 110, order: ["C-Class", "B-Class", "A-Class", "S-Class"] },
      { key: "height", type: "ordinal", width: 100, order: HEIGHTS },
      { key: "arc", type: "arc", width: 150 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", arc: "First Arc", race: "Species", aff: "Affiliation", rank: "Rank", height: "Height" },
      fr: { name: "Nom", gender: "Genre", arc: "1er arc", race: "Espèce", aff: "Affiliation", rank: "Rang", height: "Taille" },
    },

    derive(v) {
      v.height = bucket(v.height);
      return v;
    },

    hints: [
      { key: "initial", at: 4, icon: "spark", label: { en: "Initial", fr: "Initiale" }, value: (v, ui) => ui.startsWith(v.name[0]) },
      { type: "portrait", at: 8 },
    ],

    values: {
      en: { M: "Male", F: "Female" },
      fr: {
        M: "Homme", F: "Femme", Unknown: "Inconnu", None: "Aucun",
        Human: "Humain", Cyborg: "Cyborg", Monster: "Monstre", Alien: "Extraterrestre",
        "Hero Association": "Association des héros", "Monster Association": "Association des monstres", "Blizzard Group": "Groupe Blizzard",
        "House of Evolution": "Maison de l'évolution", "Dark Matter Thieves": "Pilleurs de la matière noire", Seafolk: "Peuple de la mer",
        "C-Class": "Classe C", "B-Class": "Classe B", "A-Class": "Classe A", "S-Class": "Classe S", Demon: "Niveau Démon", Dragon: "Niveau Dragon", "< 160 cm": "< 160 cm", "160-169 cm": "160-169 cm", "170-179 cm": "170-179 cm", "180-189 cm": "180-189 cm", "190+ cm": "190 cm et +",
      },
    },

    footer: {
      en: "Onepunchdle is a fan-made game and is not affiliated with ONE, Yusuke Murata, Shueisha or Madhouse / J.C.Staff. Character images from the One Punch Man Wiki (Fandom).",
      fr: "Onepunchdle est un jeu de fan, sans lien avec ONE, Yūsuke Murata, Shūeisha ou Madhouse / J.C.Staff. Images des personnages : One Punch Man Wiki (Fandom).",
    },
  };
})();
