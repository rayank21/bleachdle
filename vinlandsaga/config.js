// Vinlanddle: category config read by shared/engine.js
(() => {
  window.DLE_CONFIG = {
    id: "vinlandsaga",
    storage: "vinlanddle",
    brand: "Vinlanddle",
    anime: "Vinland Saga",
    heroTitle: "VINLAND SAGA",
    example: "Askeladd",

    arcs: [
      { en: "Prologue: Thors", fr: "Prologue : Thors", eps: "S1 1–4" },
      { en: "War in England", fr: "La guerre en Angleterre", eps: "S1 5–24" },
      { en: "Slave", fr: "L'esclave", eps: "S2 1–24" },
      { en: "Eastern Expedition", fr: "L'expédition vers l'Est", eps: "Manga 100–124" },
      { en: "War in the Baltic", fr: "La guerre de la Baltique", eps: "Manga 125–165" },
      { en: "Vinland", fr: "Le Vinland", eps: "Manga 166–221" },
    ],

    columns: [
      { key: "name", type: "name", width: 116 },
      { key: "gender", type: "exact" },
      { key: "hair", type: "exact", width: 100 },
      { key: "people", type: "exact", width: 110 },
      { key: "aff", type: "set", width: 160 },
      { key: "job", type: "exact", width: 110 },
      { key: "arc", type: "arc", width: 150 },
    ],
    labels: {
      en: { name: "Name", gender: "Gender", hair: "Hair", people: "People", aff: "Affiliation", job: "Occupation", arc: "First Arc" },
      fr: { name: "Nom", gender: "Genre", hair: "Cheveux", people: "Peuple", aff: "Affiliation", job: "Métier", arc: "1er arc" },
    },

    hints: [
      { key: "initial", at: 4, icon: "spark", label: { en: "Initial", fr: "Initiale" }, value: (v, ui) => ui.startsWith(v.name[0]) },
      { type: "portrait", at: 8 },
    ],

    values: {
      en: { M: "Male", F: "Female" },
      fr: {
        M: "Homme", F: "Femme", Unknown: "Inconnu", None: "Aucun",
        Blond: "Blond", Brown: "Brun", Black: "Noir", Red: "Roux", Auburn: "Auburn", Grey: "Gris",
        Icelander: "Islandais", Dane: "Danois", English: "Anglais", Welsh: "Gallois", Greenlander: "Groenlandais", Lnu: "Lnu",
        "Thors's Family": "Famille de Thors", "Askeladd's Band": "Bande d'Askeladd", Jomsvikings: "Jomsvikings", "Thorkell's Army": "Armée de Thorkell",
        "Danish Army": "Armée danoise", "Danish Crown": "Couronne danoise", "English Crown": "Couronne anglaise", Morgannwg: "Morgannwg",
        "Ketil's Farm": "Ferme de Ketil", "Thorfinn's Expedition": "Expédition de Thorfinn", "Halfdan's Household": "Maison de Halfdan",
        Warrior: "Guerrier", Royalty: "Royauté", Noble: "Noble", Retainer: "Serviteur royal", Clergy: "Clergé", Slave: "Esclave",
        Farmer: "Fermier", Landowner: "Propriétaire terrien", Servant: "Domestique", Mercenary: "Mercenaire", Sailor: "Marin",
        Hunter: "Chasseur", Shaman: "Chaman", Chief: "Chef",
      },
    },

    footer: {
      en: "Vinlanddle is a fan-made game and is not affiliated with Makoto Yukimura, Kodansha, Wit Studio or MAPPA. Character images from AniList and the Vinland Saga Wiki (Fandom).",
      fr: "Vinlanddle est un jeu de fan, sans lien avec Makoto Yukimura, Kodansha, Wit Studio ou MAPPA. Images des personnages : AniList et Vinland Saga Wiki (Fandom).",
    },
  };
})();
