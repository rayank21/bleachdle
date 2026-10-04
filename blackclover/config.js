// Blackcloverdle: category config read by shared/engine.js
(() => {
  const AGES = ["15-17", "18-20", "21-25", "26-30", "31+"];
  const bucket = (age) => (age == null ? "Unknown" : age <= 17 ? AGES[0] : age <= 20 ? AGES[1] : age <= 25 ? AGES[2] : age <= 30 ? AGES[3] : AGES[4]);

  window.DLE_CONFIG = {
    id: "blackclover",
    storage: "blackcloverdle",
    brand: "Blackcloverdle",
    anime: "Black Clover",
    heroTitle: "BLACK CLOVER",
    example: "Asta",

    arcs: [
      { en: "Magic Knights Entrance", fr: "L'entrée chez les Chevaliers-Mages", eps: "1–13" },
      { en: "Dungeon Exploration", fr: "L'exploration du donjon", eps: "14–19" },
      { en: "Royal Capital Assault", fr: "L'assaut de la capitale royale", eps: "20–27" },
      { en: "Eye of the Midnight Sun", fr: "L'Œil du Soleil de Minuit", eps: "28–39" },
      { en: "Seabed Temple", fr: "Le Temple sous-marin", eps: "40–50" },
      { en: "Witches' Forest", fr: "La Forêt des sorcières", eps: "51–65" },
      { en: "Royal Knights", fr: "Les Chevaliers royaux", eps: "66–95" },
      { en: "Elf Reincarnation", fr: "La réincarnation des elfes", eps: "96–157" },
      { en: "Heart Kingdom Alliance", fr: "L'alliance avec le royaume de Cœur", eps: "158–167" },
      { en: "Spade Kingdom Raid", fr: "L'assaut du royaume de Pique", eps: "168–" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "race", type: "set" },
      { key: "age", type: "ordinal", order: AGES },
      { key: "magic", type: "set", width: 104 },
      { key: "aff", type: "set", width: 140 },
      { key: "country", type: "set", width: 110 },
      { key: "arc", type: "arc", width: 140 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", race: "Species", age: "Age", magic: "Magic", aff: "Squad", country: "Kingdom", arc: "First Arc" },
      fr: { name: "Nom", gender: "Genre", race: "Espèce", age: "Âge", magic: "Magie", aff: "Escouade", country: "Royaume", arc: "1er arc" },
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
      en: { M: "Male", F: "Female", Anti: "Anti-Magic" },
      fr: {
        M: "Homme", F: "Femme", Unknown: "Inconnu", None: "Aucune",
        Human: "Humain", Elf: "Elfe", Devil: "Démon", Dwarf: "Nain", Witch: "Sorcière",
        Anti: "Anti-magie", Dark: "Ténèbres", Water: "Eau", Lightning: "Foudre", Fire: "Feu", Thread: "Fil", Spatial: "Espace",
        Mirror: "Miroir", Poison: "Poison", Transmutation: "Transformation", Cotton: "Coton", Ash: "Cendre", Recombination: "Recombinaison",
        Sealing: "Sceau", Shadow: "Ombre", Bronze: "Bronze", Star: "Étoile", "World Tree": "Arbre-monde", Steel: "Acier", Plant: "Plante",
        Sand: "Sable", Mercury: "Mercure", Mist: "Brume", Briar: "Ronce", Earth: "Terre", Slash: "Lame", Dream: "Rêve", Song: "Chant",
        Butoh: "Butō", "Cherry Blossom": "Cerisier", Vortex: "Vortex", Painting: "Peinture", Soul: "Âme", Memory: "Mémoire", Scale: "Balance",
        Light: "Lumière", Imitation: "Imitation", Beast: "Bête", Gel: "Gel", Mineral: "Minéral", Smoke: "Fumée", Wind: "Vent",
        "Soul Corpse": "Âme-cadavre", Modification: "Modification", Blood: "Sang", Sword: "Épée", Body: "Corps", Bone: "Os",
        Kotodama: "Kotodama", "Curse-Warding": "Malédiction", Gravity: "Gravité",
        "Black Bulls": "Taureau Noir", "Golden Dawn": "Aube Dorée", "Silver Eagles": "Aigle d'Argent", "Crimson Lion Kings": "Lion Écarlate Flamboyant",
        "Blue Rose": "Rose Bleue", "Green Mantis": "Mante Verte", "Coral Peacock": "Paon Corail", "Purple Orca": "Orque Pourpre",
        "Aqua Deer": "Cerf Azur", "Magic Parliament": "Conseil des mages", "Wizard King": "Empereur-Mage", Witches: "Sorcières", "Eye of the Midnight Sun": "Œil du Soleil de Minuit",
        "Eight Shining Generals": "Huit Généraux Rayonnants", "Dark Triad": "Triade Sombre",
        "Clover Kingdom": "Royaume de Trèfle", "Diamond Kingdom": "Royaume de Carreau", "Spade Kingdom": "Royaume de Pique",
        "Heart Kingdom": "Royaume de Cœur", "Witches' Forest": "Forêt des sorcières",
      },
    },

    footer: {
      en: "Blackcloverdle is a fan-made game and is not affiliated with Yūki Tabata, Shueisha or Pierrot. Character images from the Black Clover Wiki (Fandom).",
      fr: "Blackcloverdle est un jeu de fan, sans lien avec Yūki Tabata, Shueisha ou Pierrot. Images des personnages : Black Clover Wiki (Fandom).",
    },
  };
})();
