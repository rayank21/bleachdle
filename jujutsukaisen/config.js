// Jujutsudle: category config read by shared/engine.js
(() => {
  const AGES = ["0-15", "16-19", "20-29", "30-49", "50+"];
  const bucket = (age) => (age == null ? "Unknown" : age <= 15 ? AGES[0] : age <= 19 ? AGES[1] : age <= 29 ? AGES[2] : age <= 49 ? AGES[3] : AGES[4]);

  window.DLE_CONFIG = {
    id: "jujutsukaisen",
    storage: "jujutsudle",
    brand: "Jujutsudle",
    anime: "Jujutsu Kaisen",
    heroTitle: "JUJUTSU KAISEN",
    example: "Megumi",

    arcs: [
      { en: "Fearsome Womb", fr: "Le Fœtus maudit", eps: "1–5" },
      { en: "Vs. Mahito", fr: "Contre Mahito", eps: "6–13" },
      { en: "Kyoto Goodwill Event", fr: "Échange avec Kyoto", eps: "14–21" },
      { en: "Death Painting", fr: "Peintures de la mort", eps: "22–24" },
      { en: "Hidden Inventory", fr: "Inventaire caché", eps: "25–29" },
      { en: "Shibuya Incident", fr: "Incident de Shibuya", eps: "30–47" },
      { en: "Culling Game", fr: "Culling Game", eps: "48–" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "race", type: "set", width: 104 },
      { key: "age", type: "ordinal", order: AGES },
      { key: "hair", type: "set" },
      { key: "aff", type: "set", width: 140 },
      { key: "grade", type: "ordinal", width: 100, order: ["Grade 4", "Grade 3", "Grade 2", "Semi-Grade 1", "Grade 1", "Special Grade"] },
      { key: "arc", type: "arc", width: 140 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", race: "Race", age: "Age", hair: "Hair Color", aff: "Affiliation", grade: "Grade", arc: "First Arc" },
      fr: { name: "Nom", gender: "Genre", race: "Race", age: "Âge", hair: "Cheveux", aff: "Affiliation", grade: "Grade", arc: "1er arc" },
    },

    derive(v) {
      v.age = bucket(v.age);
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
        Human: "Humain", "Cursed Spirit": "Fléau", Incarnated: "Réincarné", "Cursed Corpse": "Cadavre maudit", "Death Painting": "Peinture de la mort",
        Black: "Noir", Brown: "Brun", Orange: "Roux", Blonde: "Blond", Red: "Rouge", White: "Blanc",
        Blue: "Bleu", Pink: "Rose", Purple: "Violet", Green: "Vert", Grey: "Gris",
        "Tokyo Jujutsu High": "École d'exorcisme de Tokyo", "Kyoto Jujutsu High": "École d'exorcisme de Kyoto",
        "Zen'in Clan": "Clan Zen'in", "Gojo Clan": "Clan Gojo", "Kamo Clan": "Clan Kamo", "Curse Users": "Utilisateurs de fléaux",
        "Jujutsu Headquarters": "Haute hiérarchie", "Death Paintings": "Peintures de la mort", "Star Religious Group": "Groupe religieux de l'Étoile",
        "Grade 4": "4e grade", "Grade 3": "3e grade", "Grade 2": "2e grade", "Semi-Grade 1": "Semi-1er grade", "Grade 1": "1er grade", "Special Grade": "Grade spécial",
      },
    },

    footer: {
      en: "Jujutsudle is a fan-made game and is not affiliated with Gege Akutami, Shueisha or MAPPA. Character images from the Jujutsu Kaisen Wiki (Fandom).",
      fr: "Jujutsudle est un jeu de fan, sans lien avec Gege Akutami, Shueisha ou MAPPA. Images des personnages : Jujutsu Kaisen Wiki (Fandom).",
    },
  };
})();
