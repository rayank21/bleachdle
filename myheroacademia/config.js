// Mhadle: category config read by shared/engine.js
(() => {
  const HEIGHTS = ["< 160 cm", "160-169 cm", "170-179 cm", "180-189 cm", "190+ cm"];
  const bucket = (h) => (h == null ? "Unknown" : h < 160 ? HEIGHTS[0] : h < 170 ? HEIGHTS[1] : h < 180 ? HEIGHTS[2] : h < 190 ? HEIGHTS[3] : HEIGHTS[4]);

  window.DLE_CONFIG = {
    id: "myheroacademia",
    storage: "mhadle",
    brand: "Mhadle",
    anime: "My Hero Academia",
    heroTitle: "MY HERO ACADEMIA",
    example: "Bakugo",

    arcs: [
      { en: "Entrance Exam & USJ", fr: "L'examen d'entrée & l'USJ", eps: "S1" },
      { en: "Sports Festival", fr: "Le festival sportif", eps: "S2 1–12" },
      { en: "Hero Killer & Final Exams", fr: "Le Tueur de héros & les examens", eps: "S2 13–25" },
      { en: "Training Camp & All For One", fr: "Le camp d'entraînement & All For One", eps: "S3 1–11" },
      { en: "Provisional License", fr: "La licence provisoire", eps: "S3 12–25" },
      { en: "Shie Hassaikai", fr: "Shie Hassaikai", eps: "S4" },
      { en: "Joint Training & Meta Liberation", fr: "L'entraînement commun & la Libération", eps: "S5" },
      { en: "Paranormal Liberation War", fr: "La guerre de libération", eps: "S6" },
      { en: "Final War", fr: "La guerre finale", eps: "S7–" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "quirk", type: "exact", width: 120 },
      { key: "aff", type: "set", width: 140 },
      { key: "status", type: "exact", width: 100 },
      { key: "hair", type: "set", width: 100 },
      { key: "height", type: "ordinal", width: 100, order: HEIGHTS },
      { key: "arc", type: "arc", width: 150 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", arc: "First Arc", quirk: "Quirk type", aff: "Affiliation", status: "Status", hair: "Hair", height: "Height" },
      fr: { name: "Nom", gender: "Genre", arc: "1er arc", quirk: "Type d'Alter", aff: "Affiliation", status: "Statut", hair: "Cheveux", height: "Taille" },
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
        Emitter: "Émission", Transformation: "Transformation", Mutant: "Mutation",
        "Class 1-A": "Classe 1-A", "Class 1-B": "Classe 1-B", "General Studies": "Section générale", "U.A. Big Three": "Les Trois Grands",
        "U.A. Teachers": "Professeurs de Yuei", "U.A. High School": "Lycée Yuei", "Pro Heroes": "Héros pros", "League of Villains": "Ligue des vilains",
        "Vanguard Action Squad": "Escouade d'avant-garde", "Meta Liberation Army": "Armée de libération de l'Alter",
        Student: "Élève", "Pro Hero": "Héros pro", Teacher: "Professeur", Villain: "Vilain", Civilian: "Civil", Green: "Vert", Blonde: "Blond", White: "Blanc", Red: "Rouge", Brown: "Brun", Blue: "Bleu", Black: "Noir", Purple: "Violet", Pink: "Rose", Orange: "Orange", Grey: "Gris", "< 160 cm": "< 160 cm", "160-169 cm": "160-169 cm", "170-179 cm": "170-179 cm", "180-189 cm": "180-189 cm", "190+ cm": "190 cm et +",
      },
    },

    footer: {
      en: "Mhadle is a fan-made game and is not affiliated with Kohei Horikoshi, Shueisha or Bones. Character images from the My Hero Academia Wiki (Fandom).",
      fr: "Mhadle est un jeu de fan, sans lien avec Kōhei Horikoshi, Shūeisha ou Bones. Images des personnages : My Hero Academia Wiki (Fandom).",
    },
  };
})();
