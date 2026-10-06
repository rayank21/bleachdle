// Slimedle: category config read by shared/engine.js
(() => {
  const HEIGHTS = ["< 160 cm", "160-169 cm", "170-179 cm", "180-189 cm", "190+ cm"];
  const bucket = (h) => (h == null ? "Unknown" : h < 160 ? HEIGHTS[0] : h < 170 ? HEIGHTS[1] : h < 180 ? HEIGHTS[2] : h < 190 ? HEIGHTS[3] : HEIGHTS[4]);

  window.DLE_CONFIG = {
    id: "slime",
    storage: "slimedle",
    brand: "Slimedle",
    anime: "That Time I Got Reincarnated as a Slime",
    heroTitle: "SLIME",
    example: "Benimaru",

    arcs: [
      { en: "Goblin Village & Dwargon", fr: "Le village gobelin & Dwargon", eps: "S1 1–8" },
      { en: "Orc Lord", fr: "Le Seigneur orc", eps: "S1 9–24" },
      { en: "Kingdom of Falmuth", fr: "Le royaume de Falmuth", eps: "S2 1–12" },
      { en: "Walpurgis", fr: "Walpurgis", eps: "S2 13–24" },
      { en: "Holy Empire Lubelius", fr: "L'empire sacré de Lubelius", eps: "S3" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "race", type: "set", width: 120 },
      { key: "aff", type: "set", width: 150 },
      { key: "title", type: "exact", width: 130 },
      { key: "height", type: "ordinal", width: 100, order: HEIGHTS },
      { key: "arc", type: "arc", width: 150 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", arc: "First Arc", race: "Race", aff: "Affiliation", title: "Title", height: "Height" },
      fr: { name: "Nom", gender: "Genre", arc: "1er arc", race: "Race", aff: "Affiliation", title: "Titre", height: "Taille" },
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
        Slime: "Slime", Dragon: "Dragon", Kijin: "Kijin", "Tempest Wolf": "Loup Tempest", Hobgoblin: "Hobgobelin", Lizardman: "Homme-lézard",
        Orc: "Orc", Dwarf: "Nain", Dryad: "Dryade", Demon: "Démon", Majin: "Majin", Dragonoid: "Dragonoïde", Beastman: "Homme-bête",
        Harpy: "Harpie", Human: "Humain", Fairy: "Fée", Vampire: "Vampire", "Fallen Angel": "Ange déchu", Giant: "Géant", Elf: "Elfe",
        Lizardmen: "Hommes-lézards", "Orc Army": "Armée des orcs", "Jura Forest": "Forêt de Jura", "Clayman's Army": "Armée de Clayman",
        "Free Guild": "Guilde libre", "Western Holy Church": "Sainte Église de l'Ouest", "Kingdom of Blumund": "Royaume de Blumund",
        "Kingdom of Falmuth": "Royaume de Falmuth", "Sorcerous Dynasty of Sarion": "Dynastie magique de Sarion",
        "Moderate Harlequin Alliance": "Alliance des Arlequins modérés",
        "Demon Lord": "Seigneur démon", "True Dragon": "Vrai dragon", "Primordial Demon": "Démon primordial", Hero: "Héros", "< 160 cm": "< 160 cm", "160-169 cm": "160-169 cm", "170-179 cm": "170-179 cm", "180-189 cm": "180-189 cm", "190+ cm": "190 cm et +",
      },
    },

    footer: {
      en: "Slimedle is a fan-made game and is not affiliated with Fuse, Kodansha or Eight Bit. Character images from the Tensura Wiki (Fandom).",
      fr: "Slimedle est un jeu de fan, sans lien avec Fuse, Kōdansha ou Eight Bit. Images des personnages : Tensura Wiki (Fandom).",
    },
  };
})();
