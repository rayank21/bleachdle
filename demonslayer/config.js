// Demonslayerdle: category config read by shared/engine.js
(() => {
  const HEIGHTS = ["< 160 cm", "160-169 cm", "170-179 cm", "180-189 cm", "190+ cm"];
  const bucket = (h) => (h == null ? "Unknown" : h < 160 ? HEIGHTS[0] : h < 170 ? HEIGHTS[1] : h < 180 ? HEIGHTS[2] : h < 190 ? HEIGHTS[3] : HEIGHTS[4]);

  window.DLE_CONFIG = {
    id: "demonslayer",
    storage: "demonslayerdle",
    brand: "Demonslayerdle",
    anime: "Demon Slayer",
    heroTitle: "DEMON SLAYER",
    example: "Tanjiro",

    arcs: [
      { en: "Final Selection", fr: "La Sélection finale", eps: "S1 1–5" },
      { en: "Asakusa & Tsuzumi Mansion", fr: "Asakusa & le manoir aux tambours", eps: "S1 6–14" },
      { en: "Mount Natagumo", fr: "Le mont Natagumo", eps: "S1 15–26" },
      { en: "Mugen Train", fr: "Le train de l'Infini", eps: "S2 1–7" },
      { en: "Entertainment District", fr: "Le quartier des plaisirs", eps: "S2 8–18" },
      { en: "Swordsmith Village", fr: "Le village des forgerons", eps: "S3" },
      { en: "Hashira Training", fr: "L'entraînement des Piliers", eps: "S4" },
      { en: "Infinity Castle", fr: "La forteresse infinie", eps: "Film" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "race", type: "set", width: 100 },
      { key: "aff", type: "set", width: 140 },
      { key: "rank", type: "exact", width: 120 },
      { key: "style", type: "set", width: 140 },
      { key: "height", type: "ordinal", width: 100, order: HEIGHTS },
      { key: "arc", type: "arc", width: 150 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", arc: "First Arc", race: "Species", aff: "Affiliation", rank: "Rank", style: "Fighting style", height: "Height" },
      fr: { name: "Nom", gender: "Genre", arc: "1er arc", race: "Espèce", aff: "Affiliation", rank: "Rang", style: "Style de combat", height: "Taille" },
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
        Human: "Humain", Demon: "Démon", "Demon Slayer Corps": "Pourfendeurs de démons", "Twelve Kizuki": "Douze Lunes démoniaques",
        "Kamado Family": "Famille Kamado", "Ubuyashiki Family": "Famille Ubuyashiki", "Rengoku Family": "Famille Rengoku",
        "Swordsmith Village": "Village des forgerons", "Uzui Family": "Famille Uzui", "Tamayo's Clinic": "Clinique de Tamayo", Demons: "Démons",
        "Demon Slayer": "Pourfendeur", Hashira: "Pilier", "Former Hashira": "Ancien Pilier", "Corps Leader": "Chef des pourfendeurs",
        "Upper Moon": "Lune supérieure", "Lower Moon": "Lune inférieure", "Former Lower Moon": "Ancienne Lune inférieure", "Demon King": "Roi des démons",
        "Water Breathing": "Souffle de l'eau", "Sun Breathing": "Souffle du soleil", "Thunder Breathing": "Souffle de la foudre",
        "Beast Breathing": "Souffle de la bête", "Flower Breathing": "Souffle de la fleur", "Insect Breathing": "Souffle de l'insecte",
        "Flame Breathing": "Souffle de la flamme", "Sound Breathing": "Souffle du son", "Love Breathing": "Souffle de l'amour",
        "Mist Breathing": "Souffle de la brume", "Stone Breathing": "Souffle de la pierre", "Wind Breathing": "Souffle du vent",
        "Serpent Breathing": "Souffle du serpent", "Moon Breathing": "Souffle de la lune", "Blood Demon Art": "Art démoniaque", "< 160 cm": "< 160 cm", "160-169 cm": "160-169 cm", "170-179 cm": "170-179 cm", "180-189 cm": "180-189 cm", "190+ cm": "190 cm et +",
      },
    },

    footer: {
      en: "Demonslayerdle is a fan-made game and is not affiliated with Koyoharu Gotouge, Shueisha or ufotable. Character images from the Kimetsu no Yaiba Wiki (Fandom).",
      fr: "Demonslayerdle est un jeu de fan, sans lien avec Koyoharu Gotōge, Shūeisha ou ufotable. Images des personnages : Kimetsu no Yaiba Wiki (Fandom).",
    },
  };
})();
