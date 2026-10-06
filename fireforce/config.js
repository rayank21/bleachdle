// Fireforcedle: category config read by shared/engine.js
(() => {
  window.DLE_CONFIG = {
    id: "fireforce",
    storage: "fireforcedle",
    brand: "Fireforcedle",
    anime: "Fire Force",
    heroTitle: "FIRE FORCE",
    example: "Shinra",

    arcs: [
      { en: "Company 8", fr: "La 8e brigade", eps: "S1 1–12" },
      { en: "The Nether & Company 7", fr: "Le Néant & la 7e brigade", eps: "S1 13–24" },
      { en: "Holy Sol & Haijima", fr: "Le Temple du Soleil & Haijima", eps: "S2 1–12" },
      { en: "Ashes & the Pillars", fr: "Les cendres & les Piliers", eps: "S2 13–24" },
      { en: "The Great Cataclysm", fr: "La Grande Catastrophe", eps: "S3" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "gen", type: "exact", width: 130 },
      { key: "aff", type: "set", width: 140 },
      { key: "role", type: "exact", width: 120 },
      { key: "adolla", type: "exact", width: 100 },
      { key: "arc", type: "arc", width: 150 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", arc: "First Arc", gen: "Generation", aff: "Affiliation", role: "Role", adolla: "Adolla Burst" },
      fr: { name: "Nom", gender: "Genre", arc: "1er arc", gen: "Génération", aff: "Affiliation", role: "Rôle", adolla: "Adolla Burst" },
    },

    hints: [
      { key: "initial", at: 4, icon: "spark", label: { en: "Initial", fr: "Initiale" }, value: (v, ui) => ui.startsWith(v.name[0]) },
      { type: "portrait", at: 8 },
    ],

    values: {
      en: { M: "Male", F: "Female" },
      fr: {
        M: "Homme", F: "Femme", Unknown: "Inconnu", None: "Aucun",
        "Second Generation": "2e génération", "Third Generation": "3e génération", "Second & Third Generation": "2e & 3e génération",
        "Non-Pyrokinetic": "Non-pyrokinésiste", "Company 1": "1re brigade", "Company 3": "3e brigade", "Company 4": "4e brigade",
        "Company 5": "5e brigade", "Company 7": "7e brigade", "Company 8": "8e brigade", "White Clad": "Hommes en blanc", Haijima: "Haijima",
        "Fire Soldier": "Soldat du feu", Captain: "Capitaine", Lieutenant: "Lieutenant", Sister: "Sœur", Researcher: "Chercheur",
        Engineer: "Ingénieur", Pillar: "Pilier", Knight: "Chevalier", Yes: "Oui", No: "Non",
      },
    },

    footer: {
      en: "Fireforcedle is a fan-made game and is not affiliated with Atsushi Ohkubo, Kodansha or David Production. Character images from the Fire Force Wiki (Fandom).",
      fr: "Fireforcedle est un jeu de fan, sans lien avec Atsushi Ōkubo, Kōdansha ou David Production. Images des personnages : Fire Force Wiki (Fandom).",
    },
  };
})();
