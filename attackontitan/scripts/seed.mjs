// Source list for Snkdle. Gender, height and portrait are scraped from the Attack on Titan wiki (scrape.mjs);
// species, affiliation, origin and first arc are set here by hand, because the wiki gives them away
// (who is a Titan shifter, who comes from Marley).
//
// Arc indexes (anime episodes):
//   0 Fall of Shiganshina & Trost (1–13) · 1 Female Titan (14–25) · 2 Clash of the Titans (26–37)
//   3 Uprising (38–49) · 4 Return to Shiganshina (50–59) · 5 Marley (60–66) · 6 War for Paradis (67–)
//
// Any field may be { arcIndex: value } to stay spoiler-free.

const SC = ["Survey Corps"];
const TS = ["Titan Shifter"];
const HU = ["Human"];

export const seed = [
  // ── Survey Corps ──
  { wiki: "Eren Yeager", race: TS, aff: { 0: SC, 6: ["Yeagerists"] }, origin: ["Wall Maria"], arc: 0 },
  { wiki: "Mikasa Ackerman", race: HU, aff: SC, origin: ["Wall Maria"], arc: 0 },
  { wiki: "Armin Arlert", race: { 0: HU, 4: TS }, aff: SC, origin: ["Wall Maria"], arc: 0 },
  // His surname is only learnt in the Uprising arc.
  { wiki: "Levi Ackerman", name: "Levi", race: HU, aff: SC, origin: ["Underground"], arc: 0 },
  { wiki: "Erwin Smith", race: HU, aff: SC, origin: ["Unknown"], arc: 0 },
  { wiki: "Hange Zoë", name: "Hange Zoë", race: HU, aff: SC, origin: ["Unknown"], arc: 1 },
  { wiki: "Jean Kirstein", race: HU, aff: SC, origin: ["Wall Rose"], arc: 0 },
  { wiki: "Connie Springer", race: HU, aff: SC, origin: ["Wall Rose"], arc: 0 },
  { wiki: "Sasha Blouse", race: HU, aff: SC, origin: ["Wall Rose"], arc: 0 },
  // Introduced as Krista Lenz: her real name comes with the Clash of the Titans arc.
  { wiki: "Historia Reiss", race: HU, aff: { 2: SC, 3: [...SC, "Royal Family"] }, origin: ["Wall Rose"], arc: 2 },
  { wiki: "Ymir", race: { 0: HU, 2: TS }, aff: SC, origin: ["Unknown"], arc: 0 },
  { wiki: "Mike Zacharias", race: HU, aff: SC, origin: ["Unknown"], arc: 1 },
  { wiki: "Petra Ral", race: HU, aff: SC, origin: ["Unknown"], arc: 1 },
  { wiki: "Oluo Bozado", race: HU, aff: SC, origin: ["Unknown"], arc: 1 },
  { wiki: "Eld Jinn", race: HU, aff: SC, origin: ["Unknown"], arc: 1 },
  { wiki: "Gunther Schultz", race: HU, aff: SC, origin: ["Unknown"], arc: 1 },
  { wiki: "Moblit Berner", race: HU, aff: SC, origin: ["Unknown"], arc: 1 },
  { wiki: "Floch Forster", race: HU, aff: { 4: SC, 6: ["Yeagerists"] }, origin: ["Unknown"], arc: 4 },

  // ── The warriors hidden among the 104th ──
  { wiki: "Reiner Braun", race: { 0: HU, 2: TS }, aff: { 0: SC, 2: ["Warriors"] }, origin: { 0: ["Wall Maria"], 2: ["Marley"] }, arc: 0 },
  { wiki: "Bertholdt Hoover", name: "Bertholdt Hoover", race: { 0: HU, 2: TS }, aff: { 0: SC, 2: ["Warriors"] }, origin: { 0: ["Wall Maria"], 2: ["Marley"] }, arc: 0 },
  { wiki: "Annie Leonhart", race: { 0: HU, 1: TS }, aff: { 0: ["Military Police"], 1: ["Military Police", "Warriors"] }, origin: { 0: ["Unknown"], 2: ["Marley"] }, arc: 0 },
  { wiki: "Marco Bott", race: HU, aff: ["Training Corps"], origin: ["Wall Rose"], arc: 0 },

  // ── Training Corps, Garrison, Military Police, Interior ──
  { wiki: "Keith Shadis", race: HU, aff: ["Training Corps"], origin: ["Wall Maria"], arc: 0 },
  { wiki: "Dot Pixis", race: HU, aff: ["Garrison"], origin: ["Unknown"], arc: 0 },
  { wiki: "Hannes", race: HU, aff: ["Garrison"], origin: ["Wall Maria"], arc: 0 },
  { wiki: "Rico Brzenska", race: HU, aff: ["Garrison"], origin: ["Unknown"], arc: 0 },
  { wiki: "Ian Dietrich", race: HU, aff: ["Garrison"], origin: ["Unknown"], arc: 0 },
  { wiki: "Anka Rheinberger", race: HU, aff: ["Garrison"], origin: ["Unknown"], arc: 0 },
  { wiki: "Nile Dawk", name: "Nile Dok", race: HU, aff: ["Military Police"], origin: ["Unknown"], arc: 1 },
  { wiki: "Hitch Dreyse", race: HU, aff: ["Military Police"], origin: ["Unknown"], arc: 1 },
  { wiki: "Dhalis Zachary", name: "Darius Zackly", race: HU, aff: ["Military Command"], origin: ["Unknown"], arc: 1 },
  { wiki: "Kenny Ackerman", race: HU, aff: ["Interior Police"], origin: ["Underground"], arc: 3 },
  { wiki: "Djel Sannes", race: HU, aff: ["Interior Police"], origin: ["Unknown"], arc: 3 },
  { wiki: "Marlo Freudenberg", name: "Marlo Freudenberg", race: HU, aff: ["Military Police"], origin: ["Unknown"], arc: 3 },
  { wiki: "Traute Caven", name: "Traute Carven", race: HU, aff: ["Interior Police"], origin: ["Unknown"], arc: 3 },
  { wiki: "Rod Reiss", race: HU, aff: ["Royal Family"], origin: ["Wall Rose"], arc: 3 },
  { wiki: "Frieda Reiss", race: TS, aff: ["Royal Family"], origin: ["Wall Rose"], arc: 3 },
  { wiki: "Kaya", race: HU, aff: ["Civilian"], origin: ["Wall Rose"], arc: 2 },

  // ── The Yeager family and the Restorationists ──
  { wiki: "Grisha Yeager", race: { 0: HU, 3: TS }, aff: { 0: ["Civilian"], 4: ["Eldian Restorationists"] }, origin: { 0: ["Wall Maria"], 4: ["Marley"] }, arc: 0 },
  { wiki: "Carla Yeager", race: HU, aff: ["Civilian"], origin: ["Wall Maria"], arc: 0 },
  // The Smiling Titan has a name only once the basement is opened.
  { wiki: "Dina Fritz", race: ["Titan"], aff: ["Eldian Restorationists", "Royal Family"], origin: ["Marley"], arc: 4 },
  { wiki: "Eren Kruger", race: TS, aff: ["Eldian Restorationists", "Marley"], origin: ["Marley"], arc: 4 },

  // ── Marley ──
  { wiki: "Zeke Yeager", race: TS, aff: ["Warriors"], origin: ["Marley"], arc: 4 },
  { wiki: "Marcel Galliard", race: TS, aff: ["Warriors"], origin: ["Marley"], arc: 4 },
  { wiki: "Pieck Finger", race: TS, aff: ["Warriors"], origin: ["Marley"], arc: 5 },
  { wiki: "Porco Galliard", race: TS, aff: ["Warriors"], origin: ["Marley"], arc: 5 },
  { wiki: "Gabi Braun", race: HU, aff: ["Warriors"], origin: ["Marley"], arc: 5 },
  { wiki: "Falco Grice", race: { 5: HU, 6: TS }, aff: ["Warriors"], origin: ["Marley"], arc: 5 },
  { wiki: "Colt Grice", race: HU, aff: ["Warriors"], origin: ["Marley"], arc: 5 },
  { wiki: "Theo Magath", race: HU, aff: ["Marley"], origin: ["Marley"], arc: 5 },
  { wiki: "Willy Tybur", race: HU, aff: ["Tybur Family"], origin: ["Marley"], arc: 5 },
  { wiki: "Lara Tybur", race: TS, aff: ["Tybur Family"], origin: ["Marley"], arc: 5 },
  { wiki: "Nicolo", race: HU, aff: ["Marley"], origin: ["Marley"], arc: 6 },
  { wiki: "Yelena", race: HU, aff: ["Anti-Marleyan Volunteers"], origin: ["Marley"], arc: 6 },
  { wiki: "Onyankopon", race: HU, aff: ["Anti-Marleyan Volunteers"], origin: ["Marley"], arc: 6 },
  { wiki: "Kiyomi Azumabito", race: HU, aff: ["Hizuru"], origin: ["Hizuru"], arc: 6 },
  { wiki: "Ymir Fritz", race: TS, aff: ["Royal Family"], origin: ["Eldia"], arc: 6 },
];
