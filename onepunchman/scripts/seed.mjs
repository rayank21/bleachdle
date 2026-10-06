// Source list for Onepunchdle. Gender, height and portrait come from the One Punch Man wiki (scripts/simple-scrape.mjs);
// race, affiliation, rank (hero class or disaster level) and first arc are set here by hand.
//
// Arc indexes (anime):
//   0 Hero Debut (S1 1–6) · 1 Deep Sea King & Boros (S1 7–12) · 2 Hero Hunter Garou (S2 1–8)
//   3 Monster Association (S2 9–12) · 4 Monster Association Raid (S3)
//
// Any field may be { arcIndex: value } to stay spoiler-free.
export const WIKI = "onepunchman";
// The wiki shows the light novel / manga pictures first: take the anime one.
export const PREFER = /anime/i;

const HA = ["Hero Association"];
const MA = ["Monster Association"];
const H = ["Human"];
const M = ["Monster"];

export const seed = [
  // ── Heroes ──
  { wiki: "Saitama", race: H, aff: HA, rank: { 0: "C-Class", 1: "B-Class" }, arc: 0 },
  { wiki: "Genos", race: ["Cyborg"], aff: HA, rank: "S-Class", arc: 0 },
  { wiki: "Mumen Rider", race: H, aff: HA, rank: "C-Class", arc: 1 },
  { wiki: "King", race: H, aff: HA, rank: "S-Class", arc: 2 },
  { wiki: "Tatsumaki", race: H, aff: HA, rank: "S-Class", arc: 1 },
  { wiki: "Fubuki", race: H, aff: [...HA, "Blizzard Group"], rank: "B-Class", arc: 2 },
  { wiki: "Bang", race: H, aff: HA, rank: "S-Class", arc: 1 },
  { wiki: "Atomic Samurai", race: H, aff: HA, rank: "S-Class", arc: 1 },
  { wiki: "Child Emperor", race: H, aff: HA, rank: "S-Class", arc: 1 },
  { wiki: "Metal Knight", race: ["Unknown"], aff: HA, rank: "S-Class", arc: 1 },
  { wiki: "Zombieman", race: H, aff: HA, rank: "S-Class", arc: 1 },
  { wiki: "Drive Knight", gender: "M", race: ["Cyborg"], aff: HA, rank: "S-Class", arc: 1 },
  { wiki: "Pig God", race: H, aff: HA, rank: "S-Class", arc: 1 },
  { wiki: "Superalloy Darkshine", race: H, aff: HA, rank: "S-Class", arc: 1 },
  { wiki: "Watchdog Man", race: H, aff: HA, rank: "S-Class", arc: 1 },
  { wiki: "Flashy Flash", race: H, aff: HA, rank: "S-Class", arc: 2 },
  { wiki: "Metal Bat", race: H, aff: HA, rank: "S-Class", arc: 1 },
  { wiki: "Tank-Top Master", race: H, aff: HA, rank: "S-Class", arc: 1 },
  { wiki: "Puri-Puri Prisoner", race: H, aff: HA, rank: "S-Class", arc: 1 },
  { wiki: "Amai Mask", race: H, aff: HA, rank: "A-Class", arc: 1 },
  { wiki: "Stinger", race: H, aff: HA, rank: "A-Class", arc: 1 },
  { wiki: "Iaian", race: H, aff: HA, rank: "A-Class", arc: 2 },
  { wiki: "Death Gatling", race: H, aff: HA, rank: "A-Class", arc: 2 },
  { wiki: "Snek", race: H, aff: HA, rank: "A-Class", arc: 1 },
  { wiki: "Sitch", race: H, aff: HA, rank: "None", arc: 1 },
  // ── Outside the Association ──
  { wiki: "Speed-o'-Sound Sonic", name: "Sonic", race: H, aff: ["None"], rank: "None", arc: 0 },
  { wiki: "Garou", race: H, aff: ["None"], rank: "None", arc: 2 },
  { wiki: "Charanko", race: H, aff: ["None"], rank: "None", arc: 2 },
  { wiki: "Suiryu", race: H, aff: ["None"], rank: "None", arc: 3 },
  { wiki: "Dr. Genus", name: "Dr. Genus", race: H, aff: ["House of Evolution"], rank: "None", arc: 0 },
  // ── Monsters and invaders ──
  { wiki: "Vaccine Man", race: M, aff: ["None"], rank: "Demon", arc: 0 },
  { wiki: "Mosquito Girl", race: M, aff: ["None"], rank: "Demon", arc: 0 },
  { wiki: "Carnage Kabuto", race: M, aff: ["House of Evolution"], rank: "Demon", arc: 0 },
  { wiki: "Deep Sea King", race: M, aff: ["Seafolk"], rank: "Demon", arc: 1 },
  { wiki: "Boros", race: ["Alien"], aff: ["Dark Matter Thieves"], rank: "Dragon", arc: 1 },
  { wiki: "Melzargard", gender: "M", race: ["Alien"], aff: ["Dark Matter Thieves"], rank: "Dragon", arc: 1 },
  { wiki: "Geryuganshoop", gender: "M", race: ["Alien"], aff: ["Dark Matter Thieves"], rank: "Dragon", arc: 1 },
  { wiki: "Orochi", race: M, aff: MA, rank: "Dragon", arc: 3 },
  { wiki: "Gouketsu", race: M, aff: MA, rank: "Dragon", arc: 3 },
  { wiki: "Psykos", race: H, aff: MA, rank: "Dragon", arc: 3 },
  { wiki: "Elder Centipede", race: M, aff: MA, rank: "Dragon", arc: 3 },
  { wiki: "Homeless Emperor", race: H, aff: MA, rank: "Dragon", arc: 3 },
  { wiki: "Black Sperm", race: M, aff: MA, rank: "Dragon", arc: 4 },
];
