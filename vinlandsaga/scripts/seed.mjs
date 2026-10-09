// Source list for Vinlanddle. Gender and portrait come from the Vinland Saga wiki (scripts/simple-scrape.mjs);
// hair, people, affiliation, occupation and first arc are set here by hand (the wiki lists few heights).
//
// Arc indexes (anime, then the manga):
//   0 Prologue: Thors (S1 1–4) · 1 War in England (S1 5–24) · 2 Slave (S2 1–24) · 3 Eastern Expedition (ch. 100–124)
//   4 War in the Baltic (ch. 125–165) · 5 Far Western Voyage & Vinland (ch. 166–221)
//
// Any field may be { arcIndex: value } to stay spoiler-free.
export const WIKI = "vinlandsaga";
export const PREFER = /anime|episode|ep\.? ?\d|s2|season/i;

const NONE = ["None"];
const FAM = ["Thors's Family"];
const BAND = ["Askeladd's Band"];
const DK = ["Danish Army"];
const CROWN = ["Danish Crown"];
const ENG = ["English Crown"];
const JOMS = ["Jomsvikings"];
const FARM = ["Ketil's Farm"];
const EXP = ["Thorfinn's Expedition"];
const HALF = ["Halfdan's Household"];
const LNU = ["Lnu"];

export const seed = [
  // ── Iceland: Thors's family and their neighbours ──
  { wiki: "Thorfinn", hair: "Blond", people: "Icelander", aff: { 0: FAM, 1: BAND, 2: FARM, 3: EXP }, job: { 0: "None", 1: "Warrior", 2: "Slave", 3: "Sailor" }, arc: 0 },
  { wiki: "Thors Snorresson", name: "Thors", hair: "Black", people: "Icelander", aff: FAM, job: "Farmer", arc: 0 },
  { wiki: "Ylva", gender: "F", hair: "Blond", people: "Icelander", aff: FAM, job: "Farmer", arc: 0 },
  { wiki: "Helga", hair: "Blond", people: "Icelander", aff: FAM, job: "Farmer", arc: 0 },
  { wiki: "Leif Ericson", hair: { 0: "Brown", 3: "Grey" }, people: "Greenlander", aff: { 0: NONE, 3: EXP }, job: "Sailor", arc: 0 },
  { wiki: "Halfdan", hair: { 0: "Black", 5: "Grey" }, people: "Icelander", aff: HALF, job: "Landowner", arc: 0 },

  // ── Askeladd's band and the Jomsvikings ──
  { wiki: "Askeladd", hair: "Blond", people: "Welsh", aff: BAND, job: "Warrior", arc: 0 },
  { wiki: "Bjorn", hair: "Brown", people: "Dane", aff: BAND, job: "Warrior", arc: 0 },
  { wiki: "Atli", hair: "Blond", people: "Dane", aff: BAND, job: "Warrior", arc: 0 },
  { wiki: "Torgrim", hair: "Blond", people: "Dane", aff: BAND, job: "Warrior", arc: 0 },
  { wiki: "Floki", hair: "Blond", people: "Dane", aff: JOMS, job: "Warrior", arc: 0 },
  { wiki: "Sigvaldi", hair: "Blond", people: "Dane", aff: JOMS, job: "Warrior", arc: 1 },

  // ── The war in England ──
  { wiki: "Thorkell", hair: "Blond", people: "Dane", aff: { 1: ["Thorkell's Army"], 2: DK }, job: "Warrior", arc: 1 },
  { wiki: "Asgeir", hair: "Blond", people: "Dane", aff: ["Thorkell's Army"], job: "Warrior", arc: 1 },
  { wiki: "Canute", hair: "Blond", people: "Dane", aff: [...CROWN, ...DK], job: "Royalty", arc: 1 },
  { wiki: "Sweyn", hair: "Black", people: "Dane", aff: [...CROWN, ...DK], job: "Royalty", arc: 1 },
  { wiki: "Harald", hair: "Brown", people: "Dane", aff: CROWN, job: "Royalty", arc: 1 },
  { wiki: "Ragnar", hair: "Black", people: "Dane", aff: DK, job: "Retainer", arc: 1 },
  { wiki: "Willibald", hair: "Blond", people: "Unknown", aff: DK, job: "Clergy", arc: 1 },
  { wiki: "Gratianus", hair: "Grey", people: "Welsh", aff: ["Morgannwg"], job: "Warrior", arc: 1 },
  { wiki: "Lydia", hair: "Blond", people: "Welsh", aff: NONE, job: "Slave", arc: 1 },
  { wiki: "Olaf", hair: "Blond", people: "Dane", aff: NONE, job: "Warrior", arc: 1 },

  // ── Ketil's farm and Canute's England ──
  { wiki: "Einar", hair: "Auburn", people: "English", aff: { 2: FARM, 3: EXP }, job: { 2: "Slave", 3: "Farmer" }, arc: 2 },
  { wiki: "Ketil", hair: "Blond", people: "Dane", aff: FARM, job: "Landowner", arc: 2 },
  { wiki: "Olmar", hair: "Blond", people: "Dane", aff: FARM, job: "Farmer", arc: 2 },
  { wiki: "Thorgil", hair: "Blond", people: "Dane", aff: FARM, job: "Warrior", arc: 2 },
  { wiki: "Sverkel", hair: "Grey", people: "Dane", aff: FARM, job: "Farmer", arc: 2 },
  { wiki: "Pater", gender: "M", hair: "Brown", people: "Dane", aff: FARM, job: "Servant", arc: 2 },
  { wiki: "Arnheid", hair: "Blond", people: "Unknown", aff: FARM, job: "Slave", arc: 2 },
  { wiki: "Gardar", gender: "M", hair: "Red", people: "Unknown", aff: NONE, job: "Slave", arc: 2 },
  { wiki: "Snake", hair: "Black", people: "Unknown", aff: FARM, job: "Mercenary", arc: 2 },
  { wiki: "Fox", hair: "Blond", people: "Unknown", aff: FARM, job: "Mercenary", arc: 2 },
  { wiki: "Badger", hair: "Black", people: "Unknown", aff: FARM, job: "Mercenary", arc: 2 },
  { wiki: "Edmund Ironside", name: "Edmund", gender: "M", hair: "Auburn", people: "English", aff: ENG, job: "Royalty", arc: 2 },
  { wiki: "Ethelred II", name: "Ethelred", hair: "Grey", people: "English", aff: ENG, job: "Royalty", arc: 2 },
  { wiki: "Eadric", gender: "M", hair: "Brown", people: "English", aff: ENG, job: "Noble", arc: 2 },
  { wiki: "Wulf", hair: "Black", people: "Dane", aff: DK, job: "Warrior", arc: 2 },
  { wiki: "Estrid", hair: "Blond", people: "Dane", aff: CROWN, job: "Royalty", arc: 2 },

  // ── The Eastern Expedition ──
  { wiki: "Gudrid", hair: "Black", people: "Icelander", aff: EXP, job: "Sailor", arc: 3 },
  { wiki: "Karli", hair: "Red", people: "Unknown", aff: EXP, job: "None", arc: 3 },
  { wiki: "Hild", hair: "Blond", people: "Unknown", aff: { 3: NONE, 5: EXP }, job: "Hunter", arc: 3 },
  { wiki: "Sigurd", hair: "Black", people: "Icelander", aff: HALF, job: "Sailor", arc: 3 },

  // ── War in the Baltic ──
  { wiki: "Garm", hair: "Blond", people: "Unknown", aff: NONE, job: "Mercenary", arc: 4 },
  { wiki: "Baldr", hair: "Blond", people: "Dane", aff: JOMS, job: "None", arc: 4 },
  { wiki: "Vagn", hair: "Black", people: "Dane", aff: JOMS, job: "Warrior", arc: 4 },

  // ── The voyage to Vinland and the Lnu ──
  { wiki: "Ivar", hair: "Blond", people: "Icelander", aff: EXP, job: "Farmer", arc: 5 },
  { wiki: "Styrk", hair: "Blond", people: "Icelander", aff: EXP, job: "Farmer", arc: 5 },
  { wiki: "Cordelia", hair: "Red", people: "Dane", aff: EXP, job: "Farmer", arc: 5 },
  { wiki: "Miskwekepu'j", hair: "Grey", people: "Lnu", aff: LNU, job: "Shaman", arc: 5 },
  { wiki: "Niskawaji'j", hair: "Black", people: "Lnu", aff: LNU, job: "Shaman", arc: 5 },
  { wiki: "Kitpui", gender: "M", hair: "Black", people: "Lnu", aff: LNU, job: "Chief", arc: 5 },
];
