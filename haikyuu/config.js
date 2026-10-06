// Haikyudle: category config read by shared/engine.js
(() => {
  window.DLE_CONFIG = {
    id: "haikyuu",
    storage: "haikyudle",
    brand: "Haikyudle",
    anime: "Haikyuu!!",
    heroTitle: "HAIKYUU!!",
    example: "Kageyama",

    arcs: [
      { en: "Karasuno's Revival", fr: "Le renouveau de Karasuno", eps: "S1 1–13" },
      { en: "Inter-High", fr: "L'Inter-lycées", eps: "S1 14–25" },
      { en: "Tokyo Training Camp", fr: "Le stage de Tokyo", eps: "S2 1–13" },
      { en: "Spring Prelims", fr: "Les qualifications du printemps", eps: "S2 14–25, S3" },
      { en: "Spring Nationals", fr: "Le tournoi national", eps: "S4" },
      { en: "Battle at the Garbage Dump", fr: "La bataille de la décharge", eps: "Film" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "school", type: "exact", width: 120 },
      { key: "position", type: "exact", width: 120 },
      { key: "year", type: "ordinal", width: 100, order: ["1st year", "2nd year", "3rd year", "Adult"] },
      { key: "height", type: "number", width: 100, unit: " cm" },
      { key: "number", type: "number", width: 90 },
      { key: "arc", type: "arc", width: 150 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", arc: "First Arc", school: "School", position: "Position", year: "Year", height: "Height", number: "Number" },
      fr: { name: "Nom", gender: "Genre", arc: "1er arc", school: "Lycée", position: "Poste", year: "Année", height: "Taille", number: "Numéro" },
    },

    hints: [
      { key: "initial", at: 4, icon: "spark", label: { en: "Initial", fr: "Initiale" }, value: (v, ui) => ui.startsWith(v.name[0]) },
      { type: "portrait", at: 8 },
    ],

    values: {
      en: { M: "Male", F: "Female" },
      fr: {
        M: "Homme", F: "Femme", Unknown: "Inconnu", None: "Aucun",
        "1st year": "1re année", "2nd year": "2e année", "3rd year": "3e année", Adult: "Adulte",
        "Wing Spiker": "Ailier", "Middle Blocker": "Central", Setter: "Passeur", Libero: "Libéro", Opposite: "Pointu",
        Manager: "Manager", Coach: "Entraîneur", Advisor: "Conseiller", Supporter: "Supportrice",
      },
    },

    footer: {
      en: "Haikyudle is a fan-made game and is not affiliated with Haruichi Furudate, Shueisha or Production I.G. Character images from the Haikyuu!! Wiki (Fandom).",
      fr: "Haikyudle est un jeu de fan, sans lien avec Haruichi Furudate, Shūeisha ou Production I.G. Images des personnages : Haikyuu!! Wiki (Fandom).",
    },
  };
})();
