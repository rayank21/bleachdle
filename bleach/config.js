// Bleachdle: category config read by shared/engine.js
window.DLE_CONFIG = {
  id: "bleach",
  storage: "bleachdle",
  brand: "Bleachdle",
  anime: "Bleach",
  heroTitle: "BLEACH",
  example: "Urahara",

  arcs: [
    { en: "Agent of the Shinigami", fr: "Shinigami remplaçant", eps: "1–20" },
    { en: "Soul Society", fr: "Soul Society", eps: "21–63" },
    { en: "Arrancar", fr: "Arrancar", eps: "110–143" },
    { en: "Hueco Mundo", fr: "Hueco Mundo", eps: "144–167 · 190–205" },
    { en: "Fake Karakura Town", fr: "Fausse Karakura", eps: "206–229 · 266–316" },
    { en: "Lost Agent", fr: "Fullbring", eps: "343–366" },
    { en: "Thousand-Year Blood War", fr: "Guerre Sanglante de Mille Ans", eps: "TYBW" },
  ],

  columns: [
    { key: "name", type: "name", width: 116 },
    { key: "gender", type: "exact" },
    { key: "race", type: "set" },
    { key: "age", type: "ordinal", order: ["0-20", "21-100", "101-500", "501-1000", "1000+"] },
    { key: "hair", type: "set" },
    { key: "height", type: "number", unit: " cm" },
    { key: "residence", type: "set", width: 116 },
    { key: "arc", type: "arc", width: 150 },
  ],
  labels: {
    en: { name: "Name", gender: "Gender", race: "Race", age: "Age", hair: "Hair Color", height: "Height", residence: "Residence", arc: "First Arc" },
    fr: { name: "Nom", gender: "Genre", race: "Race", age: "Âge", hair: "Cheveux", height: "Taille", residence: "Résidence", arc: "1er arc" },
  },

  hints: [
    { key: "affiliation", at: 4, icon: "shield", label: { en: "Affiliation", fr: "Affiliation" } },
    { type: "portrait", at: 8 },
  ],

  values: {
    en: { M: "Male", F: "Female", Soul: "Soul (Plus)" },
    fr: {
      M: "Homme", F: "Femme",
      Human: "Humain", Soul: "Âme (Plus)", "Mod Soul": "Âme modifiée", Hybrid: "Hybride",
      Black: "Noir", Brown: "Brun", Orange: "Roux", Blonde: "Blond", Red: "Rouge", White: "Blanc",
      Blue: "Bleu", Pink: "Rose", Purple: "Violet", Green: "Vert", Bald: "Chauve",
      "Karakura Town": "Karakura", "Soul King Palace": "Palais du Roi des Âmes",
      Unknown: "Inconnu",
      "Substitute Shinigami": "Shinigami remplaçant", "Karakura High School": "Lycée de Karakura",
      "Kurosaki Clinic": "Clinique Kurosaki", "Urahara Shop": "Boutique Urahara", "Shihōin Clan": "Clan Shihōin",
      "Kurosaki Family": "Famille Kurosaki", "Karakura Superheroes": "Super-héros de Karakura", "Shiba Clan": "Clan Shiba",
      "Aizen's Army": "Armée d'Aizen", "Karakura General Hospital": "Hôpital général de Karakura",
      "Former Espada": "Ancienne Espada", "Harribel's Fracción": "Fracción de Harribel",
      "Barragan's Fracción": "Fracción de Barragan", "Zero Division": "Division Zéro",
    },
  },
  // "13th Division" → "13e Division"
  translate(v, lang) {
    const m = lang === "fr" && /^(\d+)(?:st|nd|rd|th) Division$/.exec(v);
    return m ? `${m[1]}${m[1] === "1" ? "re" : "e"} Division` : null;
  },

  footer: {
    en: "Bleachdle is a fan-made game and is not affiliated with Tite Kubo, Shueisha or Studio Pierrot. Character images from the Bleach Wiki (Fandom).",
    fr: "Bleachdle est un jeu de fan, sans lien avec Tite Kubo, Shueisha ou le Studio Pierrot. Images des personnages : Bleach Wiki (Fandom).",
  },
};
