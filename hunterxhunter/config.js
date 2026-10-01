// Hunterdle: category config read by shared/engine.js
(() => {
  const AGES = ["0-12", "13-19", "20-29", "30-49", "50+"];
  const bucket = (age) => (age == null ? "Unknown" : age <= 12 ? AGES[0] : age <= 19 ? AGES[1] : age <= 29 ? AGES[2] : age <= 49 ? AGES[3] : AGES[4]);
  const NEN_INTRO = 2; // Nen is introduced in the Heavens Arena arc

  window.DLE_CONFIG = {
    id: "hunterxhunter",
    storage: "hunterdle",
    brand: "Hunterdle",
    anime: "Hunter × Hunter",
    heroTitle: "HUNTER × HUNTER",
    example: "Kurapika",

    arcs: [
      { en: "Hunter Exam", fr: "Examen Hunter", eps: "1–21" },
      { en: "Zoldyck Family", fr: "Famille Zoldyck", eps: "22–26" },
      { en: "Heavens Arena", fr: "Tour Céleste", eps: "27–36" },
      { en: "Yorknew City", fr: "York Shin", eps: "37–58" },
      { en: "Greed Island", fr: "Greed Island", eps: "59–75" },
      { en: "Chimera Ant", fr: "Fourmis-Chimères", eps: "76–136" },
      { en: "Chairman Election", fr: "Élection du Président", eps: "137–148" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "species", type: "set" },
      { key: "age", type: "ordinal", order: AGES },
      { key: "hair", type: "set" },
      { key: "nen", type: "set", width: 104 },
      { key: "aff", type: "set", width: 132 },
      { key: "arc", type: "arc", width: 140 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", species: "Species", age: "Age", hair: "Hair Color", nen: "Nen Type", aff: "Affiliation", arc: "First Arc" },
      fr: { name: "Nom", gender: "Genre", species: "Espèce", age: "Âge", hair: "Cheveux", nen: "Type de Nen", aff: "Affiliation", arc: "1er arc" },
    },

    // Spoiler control: Nen types and abilities stay hidden until the arc that reveals them.
    derive(v, cap) {
      v.age = bucket(v.age);
      const revealed = cap >= Math.max(NEN_INTRO, v.nenFrom ?? v.arc);
      if (!revealed) {
        v.nen = ["Unknown"];
        v.ability = null;
      }
      return v;
    },

    hints: [
      {
        key: "ability",
        at: 4,
        icon: "spark",
        label: { en: "Ability", fr: "Capacité" },
        // Characters without a known ability give the first letter of their name instead.
        value: (v, ui) => v.ability || ui.startsWith(v.name[0]),
      },
      { type: "portrait", at: 8 },
    ],

    values: {
      en: { M: "Male", F: "Female" },
      fr: {
        M: "Homme", F: "Femme", Unknown: "Inconnu",
        Human: "Humain", "Chimera Ant": "Fourmi-Chimère",
        Black: "Noir", Brown: "Brun", Orange: "Roux", Blonde: "Blond", Red: "Rouge", White: "Blanc",
        Blue: "Bleu", Pink: "Rose", Purple: "Violet", Green: "Vert", Grey: "Gris", Bald: "Chauve", None: "Aucun",
        Enhancer: "Renforcement", Transmuter: "Transformation", Emitter: "Émission",
        Conjurer: "Matérialisation", Manipulator: "Manipulation", Specialist: "Spécialisation",
        "Hunter Association": "Association des Hunters", "Phantom Troupe": "Brigade Fantôme",
        "Zoldyck Family": "Famille Zoldyck", "Nostrade Family": "Famille Nostrad", Zodiacs: "Zodiaques",
        "Chimera Ants": "Fourmis-Chimères", "Royal Guards": "Gardes royaux", "Whale Island": "Île de la Baleine",
        "Hunter Exam": "Examen Hunter", "Heavens Arena": "Tour Céleste", "Yorknew City": "York Shin",
        Bombers: "Bombers", "East Gorteau": "Gorteau de l'Est",
      },
    },

    footer: {
      en: "Hunterdle is a fan-made game and is not affiliated with Yoshihiro Togashi, Shueisha or Madhouse. Character images from the Hunter × Hunter Wiki (Fandom).",
      fr: "Hunterdle est un jeu de fan, sans lien avec Yoshihiro Togashi, Shueisha ou Madhouse. Images des personnages : Hunter × Hunter Wiki (Fandom).",
    },
  };
})();
