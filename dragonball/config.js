// Dragonballdle: category config read by shared/engine.js
window.DLE_CONFIG = {
  id: "dragonball",
  storage: "dragonballdle",
  brand: "Dragonballdle",
  anime: "Dragon Ball",
  heroTitle: "DRAGON BALL",
  example: "Vegeta",

  arcs: [
    { en: "Emperor Pilaf", fr: "Empereur Pilaf", eps: "DB 1–28" },
    { en: "Red Ribbon Army", fr: "Armée du Ruban Rouge", eps: "DB 29–83" },
    { en: "King Piccolo", fr: "Piccolo Daimaō", eps: "DB 84–122" },
    { en: "Piccolo Jr.", fr: "Piccolo Jr.", eps: "DB 123–153" },
    { en: "Saiyan", fr: "Saïyens", eps: "DBZ 1–35" },
    { en: "Frieza", fr: "Freezer", eps: "DBZ 36–107" },
    { en: "Androids & Cell", fr: "Cyborgs & Cell", eps: "DBZ 108–194" },
    { en: "Majin Buu", fr: "Majin Boo", eps: "DBZ 195–291" },
    { en: "Dragon Ball Super", fr: "Dragon Ball Super", eps: "DBS 1–131" },
  ],

  columns: [
    { key: "name", type: "name", width: 116 },
    { key: "gender", type: "exact" },
    { key: "race", type: "set", width: 104 },
    { key: "hair", type: "set" },
    { key: "height", type: "number", unit: " cm" },
    { key: "aff", type: "set", width: 132 },
    { key: "origin", type: "exact", width: 112 },
    { key: "arc", type: "arc", width: 140 },
  ],
  labels: {
    en: { name: "Name", gender: "Gender", race: "Race", hair: "Hair Color", height: "Height", aff: "Affiliation", origin: "Home", arc: "First Arc" },
    fr: { name: "Nom", gender: "Genre", race: "Race", hair: "Cheveux", height: "Taille", aff: "Affiliation", origin: "Origine", arc: "1er arc" },
  },

  hints: [
    { key: "initial", at: 4, icon: "spark", label: { en: "Initial", fr: "Initiale" }, value: (v, ui) => ui.startsWith(v.name[0]) },
    { type: "portrait", at: 8 },
  ],

  names: {
    fr: {
      Goku: "Son Goku", Gohan: "Son Gohan", Goten: "Son Goten", Krillin: "Krilin", "Master Roshi": "Tortue Géniale",
      "Tien Shinhan": "Ten Shin Han", Chiaotzu: "Chaozu", "Mr. Satan": "Hercule", Frieza: "Freezer", "Majin Buu": "Majin Boo",
      Kami: "Kami-sama", "Captain Ginyu": "Capitaine Ginyu", Recoome: "Recoom", Jeice: "Jeece", Burter: "Barta", Zarbon: "Zabon",
      "King Kai": "Maître Kaïo", "Grand Elder Guru": "Grand Chef", Korin: "Maître Karin", Turtle: "Umigame", "Emperor Pilaf": "Pilaf",
      "Commander Red": "Commandant Red", "General Blue": "Général Blue", "Mercenary Tao": "Tao Pai Pai", "Arale Norimaki": "Arale",
      "Ox-King": "Gyumao", "Chi-Chi": "Chichi", Puar: "Plume", "Android 16": "C-16", "Android 17": "C-17", "Android 18": "C-18",
      "Android 19": "C-19", "Dr. Gero": "Dr Gero", "Shin (Supreme Kai)": "Kaïoshin", "Grand Priest": "Grand Prêtre",
      "Kid Trunks": "Trunks enfant", "Future Trunks": "Trunks du futur", Uub: "Oob", "Mr. Popo": "Mr Popo", "King Piccolo": "Piccolo Daimaō",
    },
  },

  values: {
    en: { M: "Male", F: "Female" },
    fr: {
      M: "Homme", F: "Femme", Unknown: "Inconnu",
      Human: "Humain", Animal: "Animal", Saiyan: "Saïyen", "Half-Saiyan": "Demi-Saïyen", Namekian: "Namek", Android: "Cyborg",
      "Bio-Android": "Bio-androïde", Majin: "Majin", "Frieza Clan": "Clan de Freezer", Alien: "Extraterrestre", God: "Dieu",
      Angel: "Ange", Demon: "Démon",
      Black: "Noir", Blue: "Bleu", Blonde: "Blond", Red: "Roux", White: "Blanc", Purple: "Violet", Green: "Vert", Bald: "Chauve", None: "Aucun",
      Earth: "Terre", "Planet Vegeta": "Planète Vegeta", Namek: "Namek", "Other World": "Au-delà", Cereal: "Céréale",
      "Universe 6": "Univers 6", "Universe 7": "Univers 7", "Universe 10": "Univers 10", "Universe 11": "Univers 11",
      "Z Fighters": "Guerriers Z", "Turtle School": "École de la Tortue", "Crane School": "École de la Grue", "Pilaf Gang": "Bande à Pilaf",
      "Red Ribbon Army": "Armée du Ruban Rouge", "Korin Tower": "Tour de Karin", "Penguin Village": "Village Pingouin",
      "Demon Clan": "Clan des démons", "Kami's Lookout": "Palais de Dieu", "Saiyan Army": "Armée saïyenne",
      "Frieza Force": "Armée de Freezer", "Ginyu Force": "Commando Ginyu", Namekians: "Nameks", "Babidi's Army": "Armée de Babidi",
      Gods: "Dieux", "Team Universe 6": "Équipe Univers 6", "Team Universe 7": "Équipe Univers 7", "Team Zamasu": "Équipe Zamasu",
      "Pride Troopers": "Troupe de l'Orgueil",
    },
  },

  footer: {
    en: "Dragonballdle is a fan-made game and is not affiliated with Akira Toriyama, Shueisha, Bird Studio or Toei Animation. Character images from the Dragon Ball Wiki (Fandom).",
    fr: "Dragonballdle est un jeu de fan, sans lien avec Akira Toriyama, Shueisha, Bird Studio ou Toei Animation. Images des personnages : Dragon Ball Wiki (Fandom).",
  },
};
