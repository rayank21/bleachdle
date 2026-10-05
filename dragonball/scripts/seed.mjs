// Source list for Dragonballdle. Race, gender, height, portrait and first arc are scraped from the
// Dragon Ball wiki (scrape.mjs); hair colour, affiliation and home planet are set here.
//
// Arc indexes (anime, GT excluded):
//   0 Emperor Pilaf & 21st Tournament (DB 1–28) · 1 Red Ribbon Army (DB 29–83) · 2 King Piccolo (DB 84–122)
//   3 Piccolo Jr. (DB 123–153) · 4 Saiyan (DBZ 1–35) · 5 Frieza (DBZ 36–107) · 6 Androids & Cell (DBZ 108–194)
//   7 Majin Buu (DBZ 195–291) · 8 Dragon Ball Super
//
// Any field may be { arcIndex: value } to stay spoiler-free.

const Z = ["Z Fighters"];
const RR = ["Red Ribbon Army"];
const FF = ["Frieza Force"];
const GF = ["Frieza Force", "Ginyu Force"];
const GODS = ["Gods"];
const EARTH = "Earth";
const NAMEK = "Namek";
const VEG = "Planet Vegeta";

export const seed = [
  // Emperor Pilaf & 21st Tournament
  { wiki: "Goku", race: { 0: ["Human"], 4: ["Saiyan"] }, hair: ["Black"], aff: Z, origin: { 0: EARTH, 4: VEG } },
  { wiki: "Bulma", hair: ["Blue"], aff: [...Z, "Capsule Corp"], origin: EARTH },
  { wiki: "Oolong", hair: ["None"], aff: Z, origin: EARTH },
  { wiki: "Yamcha", hair: ["Black"], aff: Z, origin: EARTH },
  { wiki: "Puar", hair: ["None"], aff: Z, origin: EARTH },
  { wiki: "Chi-Chi", hair: ["Black"], aff: Z, origin: EARTH },
  { wiki: "Ox-King", hair: ["Black"], aff: Z, origin: EARTH },
  { wiki: "Master Roshi", hair: ["Bald"], aff: [...Z, "Turtle School"], origin: EARTH },
  { wiki: "Turtle", gender: "M", hair: ["None"], aff: ["Turtle School"], origin: EARTH },
  { wiki: "Emperor Pilaf", hair: ["None"], aff: ["Pilaf Gang"], origin: EARTH },
  { wiki: "Mai", hair: ["Black"], aff: ["Pilaf Gang"], origin: EARTH },
  { wiki: "Shu", hair: ["None"], aff: ["Pilaf Gang"], origin: EARTH },
  { wiki: "Krillin", hair: ["Bald"], aff: [...Z, "Turtle School"], origin: EARTH },
  { wiki: "Launch", hair: ["Blue", "Blonde"], aff: Z, origin: EARTH },
  // Red Ribbon Army
  { wiki: "Upa", hair: ["Black"], aff: ["Korin Tower"], origin: EARTH },
  { wiki: "Bora", hair: ["Black"], aff: ["Korin Tower"], origin: EARTH },
  { wiki: "General Blue", hair: ["Blonde"], aff: RR, origin: EARTH },
  { wiki: "Commander Red", hair: ["Red"], aff: RR, origin: EARTH },
  { wiki: "Mercenary Tao", hair: ["Black"], aff: [...RR, "Crane School"], origin: EARTH },
  { wiki: "Arale Norimaki", arc: 1, hair: ["Purple"], aff: ["Penguin Village"], origin: EARTH },
  { wiki: "Korin", hair: ["None"], aff: ["Korin Tower"], origin: EARTH },
  { wiki: "Yajirobe", hair: ["Black"], aff: Z, origin: EARTH },
  // King Piccolo
  { wiki: "Tien Shinhan", hair: ["Bald"], aff: { 2: ["Crane School"], 3: [...Z, "Crane School"] }, origin: EARTH },
  { wiki: "Chiaotzu", hair: ["Bald"], aff: { 2: ["Crane School"], 3: [...Z, "Crane School"] }, origin: EARTH },
  { wiki: "King Piccolo", gender: "M", race: { 2: ["Demon"], 4: ["Namekian"] }, hair: ["None"], aff: ["Demon Clan"], origin: { 2: EARTH, 4: NAMEK } },
  // Piccolo Jr.
  { wiki: "Piccolo", gender: "M", race: { 3: ["Demon"], 4: ["Namekian"] }, hair: ["None"], aff: { 3: ["Demon Clan"], 4: Z }, origin: { 3: EARTH, 4: NAMEK } },
  { wiki: "Kami", gender: "M", race: { 3: ["Unknown"], 4: ["Namekian"] }, hair: ["None"], aff: ["Kami's Lookout"], origin: { 3: EARTH, 4: NAMEK } },
  { wiki: "Mr. Popo", gender: "M", hair: ["None"], aff: ["Kami's Lookout"], origin: "Unknown" },
  // Saiyan
  { wiki: "Gohan", hair: ["Black"], aff: Z, origin: EARTH },
  { wiki: "Raditz", hair: ["Black"], aff: ["Saiyan Army", ...FF], origin: VEG },
  { wiki: "Nappa", hair: ["Bald"], aff: ["Saiyan Army", ...FF], origin: VEG },
  { wiki: "Vegeta", hair: ["Black"], aff: { 4: ["Saiyan Army", ...FF], 6: Z }, origin: VEG },
  { wiki: "King Kai", hair: ["None"], aff: GODS, origin: "Other World" },
  { wiki: "Bardock", hair: ["Black"], aff: ["Saiyan Army", ...FF], origin: VEG },
  // Frieza
  { wiki: "Frieza", hair: ["None"], aff: FF, origin: "Unknown" },
  { wiki: "Zarbon", hair: ["Green"], aff: FF, origin: "Unknown" },
  { wiki: "Dodoria", hair: ["None"], aff: FF, origin: "Unknown" },
  { wiki: "Captain Ginyu", hair: ["None"], aff: GF, origin: "Unknown" },
  { wiki: "Recoome", hair: ["Red"], aff: GF, origin: "Unknown" },
  { wiki: "Burter", hair: ["None"], aff: GF, origin: "Unknown" },
  { wiki: "Jeice", hair: ["White"], aff: GF, origin: "Unknown" },
  { wiki: "Guldo", hair: ["None"], aff: GF, origin: "Unknown" },
  { wiki: "Dende", gender: "M", hair: ["None"], aff: { 5: ["Namekians"], 7: ["Kami's Lookout"] }, origin: NAMEK },
  { wiki: "Nail", gender: "M", hair: ["None"], aff: ["Namekians"], origin: NAMEK },
  { wiki: "Grand Elder Guru", gender: "M", hair: ["None"], aff: ["Namekians"], origin: NAMEK },
  { wiki: "King Cold", gender: "M", hair: ["None"], aff: FF, origin: "Unknown" },
  // Androids & Cell
  { wiki: "Future Trunks", hair: ["Purple"], aff: Z, origin: EARTH },
  { wiki: "Android 17", hair: ["Black"], aff: { 6: RR, 8: [...RR, "Team Universe 7"] }, origin: EARTH },
  { wiki: "Android 18", hair: ["Blonde"], aff: { 6: RR, 7: [...RR, ...Z] }, origin: EARTH },
  { wiki: "Android 16", hair: ["Red"], aff: RR, origin: EARTH },
  { wiki: "Android 19", gender: "M", hair: ["None"], aff: RR, origin: EARTH },
  { wiki: "Dr. Gero", hair: ["White"], aff: RR, origin: EARTH },
  { wiki: "Cell", gender: "M", hair: ["None"], aff: RR, origin: EARTH },
  { wiki: "Mr. Satan", hair: ["Black"], aff: ["Satan City"], origin: EARTH },
  // Majin Buu
  { wiki: "Videl", hair: ["Black"], aff: { 7: ["Satan City"], 8: ["Satan City", ...Z] }, origin: EARTH },
  { wiki: "Goten", hair: ["Black"], aff: Z, origin: EARTH },
  { wiki: "Trunks", name: "Kid Trunks", hair: ["Purple"], aff: [...Z, "Capsule Corp"], origin: EARTH },
  { wiki: "Majin Buu", gender: "M", race: ["Majin"], arc: 7, hair: ["None"], aff: ["Babidi's Army"], origin: "Unknown" },
  { wiki: "Babidi", hair: ["None"], aff: ["Babidi's Army"], origin: "Unknown" },
  { wiki: "Dabura", hair: ["None"], aff: ["Babidi's Army"], origin: "Unknown" },
  { wiki: "Supreme Kai", name: "Shin (Supreme Kai)", hair: ["White"], aff: GODS, origin: "Other World" },
  { wiki: "Kibito", hair: ["White"], aff: GODS, origin: "Other World" },
  { wiki: "Uub", hair: ["Black"], aff: Z, origin: EARTH },
  // Dragon Ball Super
  { wiki: "Beerus", hair: ["None"], aff: GODS, origin: "Universe 7" },
  { wiki: "Whis", hair: ["White"], aff: GODS, origin: "Universe 7" },
  { wiki: "Champa", hair: ["None"], aff: GODS, origin: "Universe 6" },
  { wiki: "Vados", hair: ["Blue"], aff: GODS, origin: "Universe 6" },
  { wiki: "Hit", race: ["Alien"], hair: ["None"], aff: ["Team Universe 6"], origin: "Universe 6" },
  { wiki: "Cabba", hair: ["Black"], aff: ["Team Universe 6"], origin: "Universe 6" },
  { wiki: "Caulifla", hair: ["Black"], aff: ["Team Universe 6"], origin: "Universe 6" },
  { wiki: "Kale", hair: ["Green"], aff: ["Team Universe 6"], origin: "Universe 6" },
  { wiki: "Zeno", race: ["God"], hair: ["None"], aff: GODS, origin: "Unknown" },
  { wiki: "Goku Black", hair: ["Black"], aff: ["Team Zamasu"], origin: "Universe 10" },
  { wiki: "Zamasu", hair: ["White"], aff: [...GODS, "Team Zamasu"], origin: "Universe 10" },
  { wiki: "Jiren", hair: ["None"], aff: ["Pride Troopers"], origin: "Universe 11" },
  { wiki: "Toppo", name: "Toppo", race: ["Alien"], hair: ["None"], aff: [...GODS, "Pride Troopers"], origin: "Universe 11" },
  { wiki: "Grand Priest", name: "Grand Priest", hair: ["White"], aff: GODS, origin: "Unknown" },
  { wiki: "Dr. Brief", name: "Dr. Brief", hair: ["Purple"], aff: ["Capsule Corp"], origin: EARTH },
  // Super Hero (film) and the Granolah arc (manga): no anime episode, so their arc is set here.
  { wiki: "Gamma 1", name: "Gamma 1", gender: "M", race: ["Android"], arc: 8, hair: ["Black"], aff: RR, origin: EARTH },
  { wiki: "Gamma 2", name: "Gamma 2", gender: "M", race: ["Android"], arc: 8, hair: ["Black"], aff: RR, origin: EARTH },
  { wiki: "Saonel", name: "Saonel", gender: "M", race: ["Namekian"], arc: 8, hair: ["None"], aff: ["Heeters"], origin: NAMEK },
  { wiki: "Pirina", name: "Pirina", gender: "M", race: ["Namekian"], arc: 8, hair: ["None"], aff: ["Heeters"], origin: NAMEK },
];
