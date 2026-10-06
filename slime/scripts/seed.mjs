// Source list for Slimedle (That Time I Got Reincarnated as a Slime). Gender, height and portrait come from the
// Tensura wiki (scripts/simple-scrape.mjs); race, affiliation, title and first arc are set here by hand.
//
// Arc indexes (anime):
//   0 Goblin Village & Dwargon (S1 1–8) · 1 Orc Lord (S1 9–24) · 2 Kingdom of Falmuth (S2 1–12)
//   3 Walpurgis (S2 13–24) · 4 Holy Empire Lubelius (S3)
//
// Any field may be { arcIndex: value } to stay spoiler-free.
export const WIKI = "tensura";
// The wiki shows the light novel / manga pictures first: take the anime one.
export const PREFER = /anime/i;

const T = ["Tempest"];
const DL = ["Octagram"];

export const seed = [
  // ── Tempest ──
  { wiki: "Rimuru Tempest", race: ["Slime"], aff: T, title: { 0: "None", 2: "Demon Lord" }, arc: 0 },
  { wiki: "Veldora Tempest", race: ["Dragon"], aff: T, title: "True Dragon", arc: 0 },
  { wiki: "Benimaru", race: ["Kijin"], aff: T, title: "None", arc: 1 },
  { wiki: "Shuna", race: ["Kijin"], aff: T, title: "None", arc: 1 },
  { wiki: "Shion", race: ["Kijin"], aff: T, title: "None", arc: 1 },
  { wiki: "Souei", race: ["Kijin"], aff: T, title: "None", arc: 1 },
  { wiki: "Hakurou", name: "Hakuro", race: ["Kijin"], aff: T, title: "None", arc: 1 },
  { wiki: "Kurobe", race: ["Kijin"], aff: T, title: "None", arc: 1 },
  { wiki: "Ranga", race: ["Tempest Wolf"], aff: T, title: "None", arc: 0 },
  { wiki: "Rigurd", race: ["Hobgoblin"], aff: T, title: "None", arc: 0 },
  { wiki: "Gobta", race: ["Hobgoblin"], aff: T, title: "None", arc: 0 },
  { wiki: "Rigur", race: ["Hobgoblin"], aff: T, title: "None", arc: 0 },
  { wiki: "Gabiru", race: ["Lizardman"], aff: { 1: ["Lizardmen"], 2: T }, title: "None", arc: 1 },
  { wiki: "Geld", race: ["Orc"], aff: { 1: ["Orc Army"], 2: T }, title: "None", arc: 1 },
  { wiki: "Kaijin", race: ["Dwarf"], aff: T, title: "None", arc: 0 },
  { wiki: "Treyni", race: ["Dryad"], aff: ["Jura Forest"], title: "None", arc: 1 },
  { wiki: "Diablo", race: ["Demon"], aff: T, title: "Primordial Demon", arc: 2 },
  { wiki: "Testarossa", race: ["Demon"], aff: T, title: "Primordial Demon", arc: 4 },
  { wiki: "Ultima", race: ["Demon"], aff: T, title: "Primordial Demon", arc: 4 },
  { wiki: "Carrera", race: ["Demon"], aff: T, title: "Primordial Demon", arc: 4 },
  { wiki: "Mjurran", race: ["Majin"], aff: { 2: ["Clayman's Army"], 3: T }, title: "None", arc: 2 },
  // ── Demon Lords ──
  { wiki: "Milim Nava", race: ["Dragonoid"], aff: DL, title: "Demon Lord", arc: 1 },
  { wiki: "Carrion", race: ["Beastman"], aff: { 1: ["Eurazania"], 3: T }, title: "Demon Lord", arc: 1 },
  { wiki: "Frey", race: ["Harpy"], aff: DL, title: "Demon Lord", arc: 1 },
  { wiki: "Clayman", race: ["Majin"], aff: DL, title: "Demon Lord", arc: 1 },
  { wiki: "Guy Crimson", race: ["Demon"], aff: DL, title: "Demon Lord", arc: 3 },
  { wiki: "Leon Cromwell", race: ["Human"], aff: DL, title: "Demon Lord", arc: 3 },
  { wiki: "Ramiris", race: ["Fairy"], aff: DL, title: "Demon Lord", arc: 2 },
  { wiki: "Luminous Valentine", race: ["Vampire"], aff: DL, title: "Demon Lord", arc: 3 },
  { wiki: "Dino", race: ["Fallen Angel"], aff: DL, title: "Demon Lord", arc: 3 },
  { wiki: "Dagruel", race: ["Giant"], aff: DL, title: "Demon Lord", arc: 3 },
  // ── Humans and others ──
  { wiki: "Shizue Izawa", name: "Shizu", race: ["Human"], aff: ["Free Guild"], title: "Hero", arc: 0 },
  { wiki: "Hinata Sakaguchi", race: ["Human"], aff: ["Western Holy Church"], title: "Hero", arc: 2 },
  { wiki: "Masayuki Honjo", race: ["Human"], aff: ["Free Guild"], title: "Hero", arc: 4 },
  { wiki: "Yuuki Kagurazaka", race: ["Human"], aff: ["Free Guild"], title: "None", arc: 1 },
  { wiki: "Chloe Aubert", race: ["Human"], aff: ["Free Guild"], title: "None", arc: 1 },
  { wiki: "Fuze", race: ["Human"], aff: ["Kingdom of Blumund"], title: "None", arc: 1 },
  { wiki: "Youm", race: ["Human"], aff: { 2: ["Kingdom of Falmuth"], 3: T }, title: "None", arc: 2 },
  { wiki: "Gazel Dwargo", race: ["Dwarf"], aff: ["Dwargon"], title: "None", arc: 0 },
  { wiki: "Elmesia El-Ru Sarion", race: ["Elf"], aff: ["Sorcerous Dynasty of Sarion"], title: "None", arc: 3 },
  { wiki: "Edmaris", race: ["Human"], aff: ["Kingdom of Falmuth"], title: "None", arc: 2 },
  { wiki: "Razen", race: ["Human"], aff: ["Kingdom of Falmuth"], title: "None", arc: 2 },
  { wiki: "Gelmud", race: ["Majin"], aff: ["Clayman's Army"], title: "None", arc: 1 },
  { wiki: "Phobio", race: ["Beastman"], aff: ["Eurazania"], title: "None", arc: 1 },
  { wiki: "Laplace", race: ["Majin"], aff: ["Moderate Harlequin Alliance"], title: "None", arc: 1 },
  { wiki: "Footman", race: ["Majin"], aff: ["Moderate Harlequin Alliance"], title: "None", arc: 1 },
];
