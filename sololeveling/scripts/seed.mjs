// Source list for Sololevelingdle. Gender and portrait come from the Solo Leveling wiki (scripts/simple-scrape.mjs);
// race, hunter rank, class, affiliation, country and first arc are set here by hand (the wiki has no heights).
//
// Arc indexes (anime, then the webtoon):
//   0 Double Dungeon (S1 1–3) · 1 Instant Dungeons & Job Change (S1 4–12) · 2 Red Gate & Demon Castle (S2 13–18)
//   3 Jeju Island (S2 19–25) · 4 Monarchs' War (webtoon)
//
// Any field may be { arcIndex: value } to stay spoiler-free.
export const WIKI = "solo-leveling";
// The infobox shows the webtoon picture first: take the anime one (a few dark anime shots are replaced by `img`).
export const PREFER = /anime|season|episode|cv/i;

const H = ["Human"];
const SH = ["Shadow"];
const MON = ["Monarch"];
const KR = "Korea";
const OW = "Other World";
const NONE = ["None"];
const HA = ["Korean Hunters Association"];
const U = "Unranked";

export const seed = [
  // ── Korean hunters and their families ──
  { wiki: "Sung Jinwoo", race: { 0: H, 4: [...H, "Monarch"] }, rank: { 0: "E-Rank", 2: "S-Rank" }, class: { 0: "Fighter", 1: "Mage" }, aff: { 0: NONE, 1: ["Shadow Army"], 3: ["Ahjin Guild", "Shadow Army"], 4: ["Ahjin Guild", "Shadow Army", "Monarchs"] }, country: KR, arc: 0 },
  { wiki: "Sung Jinah", race: H, rank: U, class: "None", aff: NONE, country: KR, arc: 0 },
  { wiki: "Park Kyung-Hye", race: H, rank: U, class: "None", aff: NONE, country: KR, arc: 0 },
  { wiki: "Sung Il-Hwan", img: "일환1.jpg", race: H, rank: "S-Rank", class: "Fighter", aff: { 2: NONE, 4: ["Rulers"] }, country: KR, arc: 2 },
  { wiki: "Cha Hae-In", race: H, rank: "S-Rank", class: "Fighter", aff: ["Hunters Guild"], country: KR, arc: 0 },
  { wiki: "Choi Jong-In", race: H, rank: "S-Rank", class: "Mage", aff: ["Hunters Guild"], country: KR, arc: 0 },
  { wiki: "Baek Yoonho", race: H, rank: "S-Rank", class: "Fighter", aff: ["White Tiger Guild"], country: KR, arc: 0 },
  { wiki: "Go Gunhee", race: H, rank: "S-Rank", class: "Fighter", aff: HA, country: KR, arc: 0 },
  { wiki: "Woo Jinchul", race: H, rank: "A-Rank", class: "Fighter", aff: HA, country: KR, arc: 0 },
  { wiki: "Kang Taeshik", race: H, rank: "B-Rank", class: "Assassin", aff: HA, country: KR, arc: 0 },
  { wiki: "Yoo Jinho", race: H, rank: "D-Rank", class: "Tank", aff: { 0: NONE, 3: ["Ahjin Guild"] }, country: KR, arc: 0 },
  { wiki: "Yoo Myunghan", race: H, rank: U, class: "None", aff: ["Yoojin Construction"], country: KR, arc: 1 },
  { wiki: "Song Chi-Yul", race: H, rank: "C-Rank", class: "Mage", aff: NONE, country: KR, arc: 0 },
  { wiki: "Lee Joohee", race: H, rank: "B-Rank", class: "Healer", aff: ["Knights Guild"], country: KR, arc: 0 },
  { wiki: "Kim Sangshik", race: H, rank: "D-Rank", class: "Unknown", aff: NONE, country: KR, arc: 0 },
  { wiki: "Han Song-Yi", race: H, rank: "E-Rank", class: "Unknown", aff: NONE, country: KR, arc: 0 },
  { wiki: "Hwang Dongsuk", race: H, rank: "C-Rank", class: "Tank", aff: NONE, country: KR, arc: 1 },
  { wiki: "Park Heejin", race: H, rank: "B-Rank", class: "Mage", aff: ["White Tiger Guild"], country: KR, arc: 1 },
  { wiki: "Kim Chul", race: H, rank: "A-Rank", class: "Tank", aff: ["White Tiger Guild"], country: KR, arc: 2 },
  { wiki: "Min Byung-Gyu", race: H, rank: "S-Rank", class: "Healer", aff: NONE, country: KR, arc: 0 },
  { wiki: "Lim Tae-Gyu", race: H, rank: "S-Rank", class: "Ranger", aff: ["Reapers Guild"], country: KR, arc: 3 },
  { wiki: "Ma Dongwook", race: H, rank: "S-Rank", class: "Tank", aff: ["Fame Guild"], country: KR, arc: 3 },
  { wiki: "Son Kihoon", race: H, rank: "A-Rank", class: "Tank", aff: ["Hunters Guild"], country: KR, arc: 2 },
  { wiki: "Han Semi", gender: "F", race: H, rank: "A-Rank", class: "Healer", aff: ["Hunters Guild"], country: KR, arc: 2 },
  { wiki: "Jung Yerim", gender: "F", race: H, rank: "A-Rank", class: "Healer", aff: ["Knights Guild"], country: KR, arc: 4 },

  // ── Hunters of other countries ──
  { wiki: "Hwang Dongsoo", race: H, rank: "S-Rank", class: "Fighter", aff: ["Scavenger Guild"], country: "USA", arc: 1 },
  { wiki: "Thomas Andre", img: "Andre1.jpg", race: H, rank: "National Level", class: "Tank", aff: ["Scavenger Guild"], country: "USA", arc: 3 },
  { wiki: "Goto Ryuji", race: H, rank: "S-Rank", class: "Fighter", aff: ["Japanese Hunters Association"], country: "Japan", arc: 3 },
  { wiki: "Akari Shimizu", gender: "F", race: H, rank: "S-Rank", class: "Healer", aff: ["Draw Sword Guild"], country: "Japan", arc: 3 },
  { wiki: "Liu Zhigang", race: H, rank: "National Level", class: "Fighter", aff: NONE, country: "China", arc: 3 },
  { wiki: "Christopher Reed", race: H, rank: "National Level", class: "Fighter", aff: NONE, country: "USA", arc: 4 },
  { wiki: "Siddharth Bachchan", race: H, rank: "National Level", class: "Unknown", aff: ["Asura Guild"], country: "India", arc: 4 },
  { wiki: "Lennart Niermann", race: H, rank: "National Level", class: "Unknown", aff: ["Richter Guild"], country: "Germany", arc: 4 },
  { wiki: "Norma Selner", gender: "F", race: H, rank: U, class: "None", aff: ["Federal Bureau of Hunters"], country: "USA", arc: 4 },
  { wiki: "Adam White", race: H, rank: U, class: "None", aff: ["Federal Bureau of Hunters"], country: "USA", arc: 4 },

  // ── Monsters and dungeon bosses ──
  { wiki: "Statue of God", gender: "Unknown", race: ["Statue"], rank: U, class: "None", aff: NONE, country: OW, arc: 0 },
  { wiki: "Blue Venom-Fanged Kasaka", name: "Kasaka", gender: "Unknown", race: ["Magic Beast"], rank: "C-Rank", class: "None", aff: NONE, country: OW, arc: 1 },
  { wiki: "Baruka", gender: "M", race: ["Elf"], rank: "S-Rank", class: "None", aff: NONE, country: OW, arc: 2 },
  { wiki: "Kargalgan", gender: "M", race: ["Orc"], rank: "S-Rank", class: "None", aff: NONE, country: OW, arc: 2 },
  { wiki: "Cerberus", gender: "Unknown", race: ["Magic Beast"], rank: "A-Rank", class: "None", aff: ["Demon Castle"], country: OW, arc: 2 },
  { wiki: "Vulcan", gender: "M", race: ["Demon"], rank: "S-Rank", class: "None", aff: ["Demon Castle"], country: OW, arc: 2 },
  { wiki: "Baran", gender: "M", race: { 2: ["Demon"], 4: ["Demon", "Monarch"] }, rank: U, class: "None", aff: { 2: ["Demon Castle"], 4: ["Demon Castle", "Monarchs"] }, country: OW, arc: 2 },
  { wiki: "Ant Queen", img: "Solo-leveling-ant-queen.png", gender: "F", race: ["Ant"], rank: "S-Rank", class: "None", aff: NONE, country: OW, arc: 3 },
  { wiki: "Esil Radiru", gender: "F", race: ["Demon"], rank: U, class: "None", aff: ["Demon Castle"], country: OW, arc: 3 },
  { wiki: "Kamish", gender: "Unknown", race: ["Dragon"], rank: "S-Rank", class: "None", aff: NONE, country: OW, arc: 4 },

  // ── The Shadow Army ──
  { wiki: "Igris", img: "Igris22.jpeg", gender: "M", race: SH, rank: U, class: "None", aff: ["Shadow Army"], country: OW, arc: 1 },
  { wiki: "Iron", img: "Iron 3.jpeg", gender: "M", race: SH, rank: U, class: "None", aff: ["Shadow Army"], country: OW, arc: 2 },
  { wiki: "Tank", img: "Tank4.jpg", gender: "M", race: SH, rank: U, class: "None", aff: ["Shadow Army"], country: OW, arc: 2 },
  { wiki: "Tusk", img: "Tusk0.jpg", gender: "M", race: SH, rank: U, class: "None", aff: ["Shadow Army"], country: OW, arc: 2 },
  { wiki: "Kaisel", gender: "Unknown", race: SH, rank: U, class: "None", aff: ["Shadow Army"], country: OW, arc: 2 },
  { wiki: "Beru", img: "Beru0.jpg", gender: "M", race: { 3: ["Ant", "Shadow"] }, rank: { 3: "S-Rank" }, class: "None", aff: ["Shadow Army"], country: OW, arc: 3 },
  { wiki: "Bellion", gender: "M", race: SH, rank: U, class: "None", aff: ["Shadow Army"], country: OW, arc: 4 },
  { wiki: "Greed", gender: "M", race: SH, rank: U, class: "None", aff: ["Shadow Army"], country: OW, arc: 4 },
  { wiki: "Jima", gender: "M", race: SH, rank: U, class: "None", aff: ["Shadow Army"], country: OW, arc: 4 },

  // ── Monarchs ──
  { wiki: "Sillad", name: "Frost Monarch", gender: "M", race: MON, rank: U, class: "None", aff: ["Monarchs"], country: OW, arc: 3 },
  { wiki: "Rakan", gender: "M", race: MON, rank: U, class: "None", aff: ["Monarchs"], country: OW, arc: 3 },
  { wiki: "Ashborn", gender: "M", race: MON, rank: U, class: "None", aff: ["Monarchs"], country: OW, arc: 4 },
  { wiki: "Antares", gender: "M", race: MON, rank: U, class: "None", aff: ["Monarchs"], country: OW, arc: 4 },
  { wiki: "Querehsha", gender: "F", race: MON, rank: U, class: "None", aff: ["Monarchs"], country: OW, arc: 4 },
  { wiki: "Legia", gender: "M", race: MON, rank: U, class: "None", aff: ["Monarchs"], country: OW, arc: 4 },
  { wiki: "Tarnak", gender: "M", race: MON, rank: U, class: "None", aff: ["Monarchs"], country: OW, arc: 4 },
  { wiki: "Yogumunt", gender: "M", race: MON, rank: U, class: "None", aff: ["Monarchs"], country: OW, arc: 4 },
];
