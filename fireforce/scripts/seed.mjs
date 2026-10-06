// Source list for Fireforcedle. Gender, height and portrait come from the Fire Force wiki (scripts/simple-scrape.mjs);
// gender, role, generation, affiliation, Adolla Burst and first arc are set here by hand (the wiki has no
// standard infobox for them).
//
// Arc indexes (anime):
//   0 Company 8 (S1 1–12) · 1 The Nether & Company 7 (S1 13–24) · 2 Holy Sol & Haijima (S2 1–12)
//   3 Ashes & the Pillars (S2 13–24) · 4 The Great Cataclysm (S3)
//
// Any field may be { arcIndex: value } to stay spoiler-free.
export const WIKI = "fireforce";

const C8 = ["Company 8"];
const WC = ["White Clad"];
const G2 = "Second Generation";
const G3 = "Third Generation";
const NO = "Non-Pyrokinetic";

export const seed = [
  // ── Special Fire Force Company 8 ──
  { wiki: "Shinra Kusakabe", gender: "M", role: "Fire Soldier", gen: G3, aff: C8, adolla: { 0: "No", 1: "Yes" }, arc: 0 },
  { wiki: "Arthur Boyle", gender: "M", role: "Fire Soldier", gen: G3, aff: C8, adolla: "No", arc: 0 },
  { wiki: "Akitaru Obi", gender: "M", role: "Captain", gen: NO, aff: C8, adolla: "No", arc: 0 },
  { wiki: "Takehisa Hinawa", gender: "M", role: "Lieutenant", gen: G2, aff: C8, adolla: "No", arc: 0 },
  { wiki: "Maki Oze", gender: "F", role: "Fire Soldier", gen: G2, aff: C8, adolla: "No", arc: 0 },
  { wiki: "Iris", gender: "F", role: "Sister", gen: NO, aff: C8, adolla: "No", arc: 0 },
  { wiki: "Tamaki Kotatsu", gender: "F", role: "Fire Soldier", gen: G3, aff: { 0: ["Company 1"], 1: C8 }, adolla: "No", arc: 0 },
  { wiki: "Viktor Licht", gender: "M", role: "Researcher", gen: NO, aff: { 0: ["Haijima", ...C8] }, adolla: "No", arc: 0 },
  { wiki: "Vulcan Joseph", gender: "M", role: "Engineer", gen: NO, aff: C8, adolla: "No", arc: 0 },
  { wiki: "Ogun Montgomery", gender: "M", role: "Fire Soldier", gen: G3, aff: { 2: ["Company 4"], 3: C8 }, adolla: "No", arc: 2 },
  { wiki: "Lisa Isaribi", gender: "F", role: "Fire Soldier", gen: G3, aff: { 1: WC, 3: C8 }, adolla: "No", arc: 1 },
  // ── Other companies ──
  { wiki: "Princess Hibana", gender: "F", role: "Captain", name: "Hibana", gen: G2, aff: ["Company 5"], adolla: "No", arc: 0 },
  { wiki: "Benimaru Shinmon", gender: "M", role: "Captain", gen: "Second & Third Generation", aff: ["Company 7"], adolla: "No", arc: 1 },
  { wiki: "Konro Sagamiya", gender: "M", role: "Lieutenant", gen: G3, aff: ["Company 7"], adolla: "No", arc: 1 },
  { wiki: "Leonard Burns", gender: "M", role: "Captain", gen: G3, aff: ["Company 1"], adolla: "No", arc: 0 },
  { wiki: "Karim Flam", gender: "M", role: "Lieutenant", gen: G2, aff: ["Company 1"], adolla: "No", arc: 0 },
  { wiki: "Rekka Hoshimiya", gender: "M", role: "Lieutenant", gen: G3, aff: ["Company 1", ...WC], adolla: "No", arc: 0 },
  { wiki: "Giovanni", gender: "M", role: "Captain", gen: G3, aff: ["Company 3", ...WC], adolla: "No", arc: 1 },
  // ── The White Clad and the Pillars ──
  { wiki: "Joker", gender: "M", role: "None", gen: G3, aff: ["None"], adolla: "Yes", arc: 0 },
  { wiki: "Sho Kusakabe", gender: "M", role: "Pillar", gen: G3, aff: WC, adolla: "Yes", arc: 1 },
  { wiki: "Haumea", gender: "F", role: "Pillar", gen: G2, aff: WC, adolla: "Yes", arc: 1 },
  { wiki: "Charon", gender: "M", role: "Knight", gen: G3, aff: WC, adolla: "No", arc: 1 },
  { wiki: "Arrow", gender: "F", role: "Knight", gen: G3, aff: WC, adolla: "No", arc: 1 },
  { wiki: "Assault", gender: "M", role: "Knight", gen: G3, aff: WC, adolla: "No", arc: 1 },
  { wiki: "Dragon", gender: "M", role: "Knight", gen: G3, aff: WC, adolla: "No", arc: 3 },
  { wiki: "Yona", gender: "M", role: "Knight", gen: G3, aff: WC, adolla: "No", arc: 2 },
  { wiki: "Inca Kasugatani", gender: "F", role: "Pillar", gen: G3, aff: ["None"], adolla: "Yes", arc: 1 },
  { wiki: "Nataku Son", gender: "M", role: "Pillar", gen: G3, aff: ["Haijima"], adolla: "Yes", arc: 2 },
  { wiki: "Kurono", gender: "M", role: "Researcher", gen: G3, aff: ["Haijima"], adolla: "No", arc: 3 },
];
