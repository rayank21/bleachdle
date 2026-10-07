// Sololevelingdle: category config read by shared/engine.js
(() => {
  window.DLE_CONFIG = {
    id: "sololeveling",
    storage: "sololevelingdle",
    brand: "Sololevelingdle",
    anime: "Solo Leveling",
    heroTitle: "SOLO LEVELING",
    example: "Cha Hae-In",

    arcs: [
      { en: "Double Dungeon", fr: "Le Donjon double", eps: "S1 1–3" },
      { en: "Instant Dungeons", fr: "Donjons instantanés", eps: "S1 4–12" },
      { en: "Red Gate & Demon Castle", fr: "Porte rouge & Château du Démon", eps: "S2 13–18" },
      { en: "Jeju Island", fr: "L'île de Jeju", eps: "S2 19–25" },
      { en: "Monarchs' War", fr: "La guerre des Monarques", eps: "Webtoon" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "race", type: "set", width: 110 },
      { key: "rank", type: "ordinal", width: 110, order: ["E-Rank", "D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank", "National Level"] },
      { key: "class", type: "exact", width: 100 },
      { key: "aff", type: "set", width: 150 },
      { key: "country", type: "exact", width: 100 },
      { key: "arc", type: "arc", width: 150 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", arc: "First Arc", race: "Race", rank: "Rank", class: "Class", aff: "Affiliation", country: "Country" },
      fr: { name: "Nom", gender: "Genre", arc: "1er arc", race: "Race", rank: "Rang", class: "Classe", aff: "Affiliation", country: "Pays" },
    },

    hints: [
      { key: "initial", at: 4, icon: "spark", label: { en: "Initial", fr: "Initiale" }, value: (v, ui) => ui.startsWith(v.name[0]) },
      { type: "portrait", at: 8 },
    ],

    values: {
      en: { M: "Male", F: "Female" },
      fr: {
        M: "Homme", F: "Femme", Unknown: "Inconnu", None: "Aucune", Unranked: "Sans rang",
        Human: "Humain", Monarch: "Monarque", Shadow: "Ombre", Demon: "Démon", Elf: "Elfe", Orc: "Orc", Dragon: "Dragon",
        Ant: "Fourmi", Statue: "Statue", "Magic Beast": "Bête magique",
        "E-Rank": "Rang E", "D-Rank": "Rang D", "C-Rank": "Rang C", "B-Rank": "Rang B", "A-Rank": "Rang A", "S-Rank": "Rang S", "National Level": "Niveau national",
        Fighter: "Combattant", Mage: "Mage", Tank: "Tank", Assassin: "Assassin", Healer: "Soigneur", Ranger: "Archer",
        "Shadow Army": "Armée des ombres", "Ahjin Guild": "Guilde Ahjin", "Hunters Guild": "Guilde des Chasseurs", "White Tiger Guild": "Guilde du Tigre Blanc",
        "Reapers Guild": "Guilde des Faucheurs", "Fame Guild": "Guilde Fame", "Knights Guild": "Guilde des Chevaliers", "Scavenger Guild": "Guilde Scavenger",
        "Asura Guild": "Guilde Asura", "Richter Guild": "Guilde Richter", "Korean Hunters Association": "Association des chasseurs de Corée",
        "Japanese Hunters Association": "Association des chasseurs du Japon", "Federal Bureau of Hunters": "Bureau fédéral des chasseurs",
        "Yoojin Construction": "Yoojin Construction", "Demon Castle": "Château du Démon", Monarchs: "Monarques", Rulers: "Souverains",
        Korea: "Corée", Japan: "Japon", China: "Chine", USA: "États-Unis", India: "Inde", Germany: "Allemagne", "Other World": "Autre monde",
      },
    },

    footer: {
      en: "Sololevelingdle is a fan-made game and is not affiliated with Chugong, DUBU (Redice Studio), D&C Media or A-1 Pictures. Character images from the Solo Leveling Wiki (Fandom).",
      fr: "Sololevelingdle est un jeu de fan, sans lien avec Chugong, DUBU (Redice Studio), D&C Media ou A-1 Pictures. Images des personnages : Solo Leveling Wiki (Fandom).",
    },
  };
})();
