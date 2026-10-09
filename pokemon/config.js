// Pokédle: category config read by shared/engine.js. Generations stand in for the anime arcs: the player picks the
// last generation they know, and only Pokémon up to it can be drawn. French names and values come with the data
// (data/characters.js sets window.DLE_POKE_FR); they are read when needed, as Crew Roll loads this file first.
(() => {
  const VALUES_FR = {
    M: "Mâle", F: "Femelle", Unknown: "Inconnu", None: "Aucun",
    Base: "De base", "Stage 1": "1re évolution", "Stage 2": "2e évolution",
    Regular: "Classique", Legendary: "Légendaire", Mythical: "Fabuleux", Baby: "Bébé",
  };
  // "1,7 m" in French, "1.7 m" in English.
  const decimal = (unit) => (x, lang) => `${lang === "fr" ? String(x).replace(".", ",") : x} ${unit}`;
  let fr = null;
  const poke = () => (fr ??= window.DLE_POKE_FR ? { names: window.DLE_POKE_FR.names, values: { ...window.DLE_POKE_FR.values, ...VALUES_FR } } : null);

  window.DLE_CONFIG = {
    id: "pokemon",
    storage: "pokedle",
    brand: "Pokédle",
    anime: "Pokémon",
    heroTitle: "POKÉMON",
    example: "Pikachu",

    arcs: [
      { en: "Gen 1 · Kanto", fr: "1re gén. · Kanto", eps: "Red & Blue" },
      { en: "Gen 2 · Johto", fr: "2e gén. · Johto", eps: "Gold & Silver" },
      { en: "Gen 3 · Hoenn", fr: "3e gén. · Hoenn", eps: "Ruby & Sapphire" },
      { en: "Gen 4 · Sinnoh", fr: "4e gén. · Sinnoh", eps: "Diamond & Pearl" },
      { en: "Gen 5 · Unova", fr: "5e gén. · Unys", eps: "Black & White" },
      { en: "Gen 6 · Kalos", fr: "6e gén. · Kalos", eps: "X & Y" },
      { en: "Gen 7 · Alola", fr: "7e gén. · Alola", eps: "Sun & Moon" },
      { en: "Gen 8 · Galar", fr: "8e gén. · Galar", eps: "Sword & Shield" },
      { en: "Gen 9 · Paldea", fr: "9e gén. · Paldea", eps: "Scarlet & Violet" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "types", type: "set", width: 130 },
      { key: "colour", type: "exact" },
      { key: "stage", type: "ordinal", width: 110, order: ["Base", "Stage 1", "Stage 2"] },
      { key: "category", type: "exact", width: 110 },
      { key: "height", type: "number", width: 90, format: decimal("m") },
      { key: "weight", type: "number", width: 100, format: decimal("kg") },
      { key: "arc", type: "arc", width: 140 },
    ],
    labels: {
      en: { name: "Pokémon", types: "Types", colour: "Colour", stage: "Evolution", category: "Category", height: "Height", weight: "Weight", arc: "Generation" },
      fr: { name: "Pokémon", types: "Types", colour: "Couleur", stage: "Évolution", category: "Catégorie", height: "Taille", weight: "Poids", arc: "Génération" },
    },

    hints: [
      { key: "initial", at: 4, icon: "spark", label: { en: "Initial", fr: "Initiale" }, value: (v, ui) => ui.startsWith(v.name[0]) },
      { type: "portrait", at: 8 },
    ],

    get values() {
      return { en: { Base: "Basic", "Stage 1": "Stage 1", "Stage 2": "Stage 2", Regular: "Regular" }, fr: poke()?.values ?? VALUES_FR };
    },
    get names() {
      return { fr: poke()?.names ?? {} };
    },

    // Generations instead of arcs in the interface.
    ui: {
      en: {
        menuArc: "Change generation", arcTitle: "Up to which generation?", watchedUpTo: "Up to:", chars: "Pokémon", arcLabel: "Generation",
        placeholder: (ex) => `Enter a Pokémon's name (e.g. ${ex})`, subDaily: "Guess today's Pokémon", subEndless: "Guess as many Pokémon as you can",
        subOnline: "Race other trainers to find the Pokémon", nextChar: "Next Pokémon",
        arcIntro: "Only Pokémon up to this generation can be drawn: pick the last games you know.",
      },
      fr: {
        menuArc: "Changer de génération", arcTitle: "Jusqu'à quelle génération ?", watchedUpTo: "Jusqu'à :", chars: "Pokémon", arcLabel: "Génération",
        placeholder: (ex) => `Nom du Pokémon (ex : ${ex})`, subDaily: "Devine le Pokémon du jour", subEndless: "Enchaîne les Pokémon",
        subOnline: "Sois le premier dresseur à trouver le Pokémon", nextChar: "Pokémon suivant", nextIn: "Prochain Pokémon dans",
        arcIntro: "Seuls les Pokémon jusqu'à cette génération peuvent tomber : choisis les derniers jeux que tu connais.",
      },
    },

    footer: {
      en: "Pokédle is a fan-made game and is not affiliated with Nintendo, Game Freak, Creatures or The Pokémon Company. Data and artwork from PokeAPI.",
      fr: "Pokédle est un jeu de fan, sans lien avec Nintendo, Game Freak, Creatures ou The Pokémon Company. Données et illustrations : PokeAPI.",
    },
  };
})();
