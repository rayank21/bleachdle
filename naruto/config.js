// Narutodle: category config read by shared/engine.js
(() => {
  const AGES = ["0-12", "13-19", "20-29", "30-49", "50+"];
  const bucket = (age) => (age == null ? "Unknown" : age <= 12 ? AGES[0] : age <= 19 ? AGES[1] : age <= 29 ? AGES[2] : age <= 49 ? AGES[3] : AGES[4]);

  window.DLE_CONFIG = {
    id: "naruto",
    storage: "narutodle",
    brand: "Narutodle",
    anime: "Naruto",
    heroTitle: "NARUTO",
    example: "Kakashi",

    arcs: [
      { en: "Land of Waves", fr: "Pays des Vagues", eps: "1–19" },
      { en: "Chūnin Exams", fr: "Examen chūnin", eps: "20–67" },
      { en: "Konoha Crush & Tsunade", fr: "Destruction de Konoha & Tsunade", eps: "68–106" },
      { en: "Sasuke Recovery", fr: "Sauvetage de Sasuke", eps: "107–220" },
      { en: "Kazekage Rescue", fr: "Sauvetage du Kazekage", eps: "Shippūden 1–32" },
      { en: "Tenchi Bridge & Akatsuki", fr: "Pont Tenchi & Akatsuki", eps: "Shippūden 33–88" },
      { en: "Itachi Pursuit & Pain", fr: "Traque d'Itachi & Pain", eps: "Shippūden 89–175" },
      { en: "Five Kage Summit", fr: "Sommet des cinq Kage", eps: "Shippūden 176–214" },
      { en: "Fourth Shinobi World War", fr: "Quatrième Grande Guerre", eps: "Shippūden 215–500" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "age", type: "ordinal", order: AGES },
      { key: "village", type: "set", width: 124 },
      { key: "clan", type: "set", width: 100 },
      { key: "rank", type: "ordinal", order: ["Genin", "Chūnin", "Jōnin", "Kage"] },
      { key: "nature", type: "set", width: 124 },
      { key: "arc", type: "arc", width: 150 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", age: "Age", village: "Affiliation", clan: "Clan", rank: "Rank", nature: "Chakra Nature", arc: "First Arc" },
      fr: { name: "Nom", gender: "Genre", age: "Âge", village: "Affiliation", clan: "Clan", rank: "Rang", nature: "Affinité", arc: "1er arc" },
    },

    // Ages are given per Part (I / II) and are resolved before this runs.
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
        Fire: "Feu", Wind: "Vent", Lightning: "Foudre", Earth: "Terre", Water: "Eau", Wood: "Bois", Ice: "Glace",
        Lava: "Lave", Boil: "Ébullition", Storm: "Tempête", Magnet: "Magnétisme", Dust: "Particule",
        Konohagakure: "Konoha", Sunagakure: "Suna", Kirigakure: "Kiri", Kumogakure: "Kumo", Iwagakure: "Iwa",
        Otogakure: "Oto", Amegakure: "Ame", Kusagakure: "Kusa", Takigakure: "Taki",
      },
    },

    footer: {
      en: "Narutodle is a fan-made game and is not affiliated with Masashi Kishimoto, Shueisha or Studio Pierrot. Character images from the Naruto Wiki (Fandom).",
      fr: "Narutodle est un jeu de fan, sans lien avec Masashi Kishimoto, Shueisha ou le Studio Pierrot. Images des personnages : Naruto Wiki (Fandom).",
    },
  };
})();
