// Snkdle: category config read by shared/engine.js
(() => {
  const HEIGHTS = ["< 160 cm", "160-169 cm", "170-179 cm", "180-189 cm", "190+ cm"];
  const bucket = (h) => (h == null ? "Unknown" : h < 160 ? HEIGHTS[0] : h < 170 ? HEIGHTS[1] : h < 180 ? HEIGHTS[2] : h < 190 ? HEIGHTS[3] : HEIGHTS[4]);

  window.DLE_CONFIG = {
    id: "attackontitan",
    storage: "snkdle",
    brand: "Snkdle",
    anime: "Attack on Titan",
    heroTitle: "ATTACK ON TITAN",
    example: "Eren Yeager",

    arcs: [
      { en: "Fall of Shiganshina & Trost", fr: "La chute de Shiganshina & Trost", eps: "1–13" },
      { en: "Female Titan", fr: "Le Titan féminin", eps: "14–25" },
      { en: "Clash of the Titans", fr: "Le choc des Titans", eps: "26–37" },
      { en: "Uprising", fr: "La rébellion", eps: "38–49" },
      { en: "Return to Shiganshina", fr: "Le retour à Shiganshina", eps: "50–59" },
      { en: "Marley", fr: "Mahr", eps: "60–66" },
      { en: "War for Paradis", fr: "La guerre pour Paradis", eps: "67–" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "race", type: "set", width: 110 },
      { key: "height", type: "ordinal", order: HEIGHTS, width: 100 },
      { key: "aff", type: "set", width: 140 },
      { key: "origin", type: "set", width: 110 },
      { key: "arc", type: "arc", width: 140 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", race: "Species", height: "Height", aff: "Affiliation", origin: "Origin", arc: "First Arc" },
      fr: { name: "Nom", gender: "Genre", race: "Espèce", height: "Taille", aff: "Affiliation", origin: "Origine", arc: "1er arc" },
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
        M: "Homme", F: "Femme", Unknown: "Inconnu",
        Human: "Humain", "Titan Shifter": "Titan Shifter", Titan: "Titan",
        "Survey Corps": "Bataillon d'exploration", Garrison: "Garnison", "Military Police": "Brigades spéciales", "Training Corps": "Recrues",
        "Military Command": "État-major", "Interior Police": "Brigade centrale", "Royal Family": "Famille royale", Civilian: "Civil",
        Warriors: "Guerriers", Marley: "Mahr", "Tybur Family": "Famille Tybur", "Eldian Restorationists": "Restaurationnistes eldiens",
        "Anti-Marleyan Volunteers": "Volontaires anti-Mahr", Yeagerists: "Yeageristes", Hizuru: "Hizuru",
        "Wall Maria": "Mur Maria", "Wall Rose": "Mur Rose", "Wall Sina": "Mur Sina", Underground: "Ville souterraine", Eldia: "Eldia",
      },
    },

    footer: {
      en: "Snkdle is a fan-made game and is not affiliated with Hajime Isayama, Kodansha, Wit Studio or MAPPA. Character images from the Attack on Titan Wiki (Fandom).",
      fr: "Snkdle est un jeu de fan, sans lien avec Hajime Isayama, Kōdansha, Wit Studio ou MAPPA. Images des personnages : Attack on Titan Wiki (Fandom).",
    },
  };
})();
