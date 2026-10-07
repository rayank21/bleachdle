// Source list for Hunterdle. Gender, age, hair, Nen type, abilities, portrait and first arc are
// scraped from the Hunter × Hunter wiki (scrape.mjs). Only what the wiki can't give cleanly is set here.
//
// Arc indexes (2011 anime):
//   0 Hunter Exam (1–21) · 1 Zoldyck Family (22–26) · 2 Heavens Arena (27–36) · 3 Yorknew City (37–58)
//   4 Greed Island (59–75) · 5 Chimera Ant (76–136) · 6 13th Hunter Chairman Election (137–148)
//
// species / aff may be an object keyed by arc index (spoiler-free values, like Bleachdle).
// nenFrom: first arc where the character's Nen type is revealed (never before arc 2, when Nen is introduced).
// Any scraped field can be overridden by setting it here.

const H = ["Human"];
const ANT = ["Chimera Ant"];
const HA = ["Hunter Association"];
const PT = ["Phantom Troupe"];
const ZF = ["Zoldyck Family"];
const CA = ["Chimera Ants"];
const RG = ["Chimera Ants", "Royal Guards"];

export const seed = [
  // ── Hunter Exam ──
  { wiki: "Gon Freecss", species: H, aff: HA, nenFrom: 2 },
  { wiki: "Killua Zoldyck", species: H, aff: { 0: ZF, 4: [...ZF, ...HA] }, nenFrom: 2 },
  { wiki: "Kurapika", age: 17, species: H, aff: { 0: HA, 3: [...HA, "Nostrade Family"], 6: [...HA, "Zodiacs"] }, nenFrom: 3 },
  { wiki: "Leorio Paradinight", species: H, aff: { 0: HA, 6: [...HA, "Zodiacs"] }, nenFrom: 6 },
  { wiki: "Hisoka Morow", age: 28, hair: ["Red"], name: "Hisoka", species: H, aff: { 0: HA, 3: [...HA, ...PT] }, nenFrom: 2 },
  { wiki: "Illumi Zoldyck", species: H, aff: [...ZF, ...HA], nenFrom: 2 },
  { wiki: "Kite", gender: "M", species: { 0: H, 5: ["Human", "Chimera Ant"] }, aff: HA, nenFrom: 5 },
  { wiki: "Mito Freecss", species: H, aff: ["Whale Island"] },
  { wiki: "Isaac Netero", species: H, aff: HA, nenFrom: 5 },
  { wiki: "Satotz", species: H, aff: HA },
  { wiki: "Menchi", species: H, aff: HA },
  { wiki: "Buhara", species: H, aff: HA },
  { wiki: "Hanzo", species: H, aff: HA, nenFrom: 6 },
  { wiki: "Pokkle", species: H, aff: HA, nenFrom: 5 },
  { wiki: "Tonpa", species: H, aff: ["Hunter Exam"] },
  { wiki: "Bodoro", species: H, aff: ["Hunter Exam"] },
  { wiki: "Ponzu", species: H, aff: ["Hunter Exam"], nenFrom: 5 },
  { wiki: "Lippo", species: H, aff: HA },
  { wiki: "Beans", name: "Beans", species: H, aff: HA },

  // ── Zoldyck Family ──
  { wiki: "Silva Zoldyck", species: H, aff: ZF, nenFrom: 3 },
  { wiki: "Zeno Zoldyck", species: H, aff: ZF, nenFrom: 3 },
  // The great-grandfather: a cameo in the 2011 anime (episode 141); no Nen shown. Portrait cropped from his 1999 design.
  { wiki: "Maha Zoldyck", species: H, aff: ZF, age: 115, hair: ["Bald"], nen: ["Unknown"] },
  { wiki: "Kikyo Zoldyck", species: H, aff: ZF },
  { wiki: "Milluki Zoldyck", species: H, aff: ZF },
  { wiki: "Kalluto Zoldyck", species: H, aff: { 1: ZF, 3: [...ZF, ...PT] }, nenFrom: 5 },
  { wiki: "Gotoh", species: H, aff: ZF, nenFrom: 6 },
  { wiki: "Canary", species: H, aff: ZF },

  // ── Heavens Arena ──
  { wiki: "Wing", species: H, aff: ["Shingen-ryu"], nenFrom: 2 },
  { wiki: "Zushi", species: H, aff: ["Shingen-ryu"], nenFrom: 2 },
  { wiki: "Gido", hair: ["Black"], species: H, aff: ["Heavens Arena"], nenFrom: 2 },
  { wiki: "Riehlvelt", species: H, aff: ["Heavens Arena"], nenFrom: 2 },
  { wiki: "Sadaso", species: H, aff: ["Heavens Arena"], nenFrom: 2 },
  { wiki: "Kastro", species: H, aff: ["Heavens Arena"], nenFrom: 2 },

  // ── Yorknew City ──
  { wiki: "Chrollo Lucilfer", species: H, aff: PT, nenFrom: 3 },
  { wiki: "Uvogin", species: H, aff: PT, nenFrom: 3 },
  { wiki: "Nobunaga Hazama", species: H, aff: PT, nenFrom: 3 },
  { wiki: "Feitan Portor", species: H, aff: PT, nenFrom: 5 },
  { wiki: "Phinks Magcub", species: H, aff: PT, nenFrom: 3 },
  { wiki: "Shalnark", species: H, aff: PT, nenFrom: 3 },
  { wiki: "Franklin Bordeau", species: H, aff: PT, nenFrom: 3 },
  { wiki: "Machi Komacine", species: H, aff: PT, nenFrom: 3 },
  { wiki: "Pakunoda", species: H, aff: PT, nenFrom: 3 },
  { wiki: "Shizuku Murasaki", species: H, aff: PT, nenFrom: 3 },
  { wiki: "Bonolenov Ndongo", species: H, aff: PT, nenFrom: 3 },
  { wiki: "Kortopi", species: H, aff: PT, nenFrom: 3 },
  { wiki: "Neon Nostrade", species: H, aff: ["Nostrade Family"], nenFrom: 3 },
  { wiki: "Light Nostrade", species: H, aff: ["Nostrade Family"] },
  { wiki: "Senritsu", name: "Senritsu", species: H, aff: [...HA, "Nostrade Family"], nenFrom: 3 },
  { wiki: "Basho", species: H, aff: ["Nostrade Family"], nenFrom: 3 },
  { wiki: "Squala", species: H, aff: ["Nostrade Family"], nenFrom: 3 },
  { wiki: "Dalzollene", species: H, aff: ["Nostrade Family"] },
  { wiki: "Zepile", species: H, aff: ["Yorknew City"] },

  // ── Greed Island ──
  { wiki: "Biscuit Krueger", species: H, aff: [...HA, "Shingen-ryu"], nenFrom: 4 },
  { wiki: "Genthru", species: H, aff: ["Bombers"], nenFrom: 4 },
  { wiki: "Razor", species: H, aff: ["Greed Island"], nenFrom: 4 },
  { wiki: "Tsezguerra", species: H, aff: HA, nenFrom: 4 },
  { wiki: "Goreinu", species: H, aff: ["Greed Island"], nenFrom: 4 },
  { wiki: "Abengane", species: H, aff: HA, nenFrom: 4 },
  { wiki: "Binolt", species: H, aff: ["Greed Island"], nenFrom: 4 },

  // ── Chimera Ant ──
  { wiki: "Meruem", age: 0, species: ANT, aff: CA, nenFrom: 5 },
  { wiki: "Neferpitou", species: ANT, aff: RG, nenFrom: 5 },
  { wiki: "Shaiapouf", species: ANT, aff: RG, nenFrom: 5 },
  { wiki: "Menthuthuyoupi", species: ANT, aff: RG, nenFrom: 5 },
  { wiki: "Chimera Ant Queen", species: ANT, aff: CA },
  { wiki: "Komugi", species: H, aff: ["East Gorteau"] },
  { wiki: "Knuckle Bine", species: H, aff: HA, nenFrom: 5 },
  { wiki: "Shoot McMahon", species: H, aff: HA, nenFrom: 5 },
  { wiki: "Morel Mackernasey", species: H, aff: HA, nenFrom: 5 },
  { wiki: "Knov", species: H, aff: HA, nenFrom: 5 },
  { wiki: "Palm Siberia", species: H, aff: HA, nenFrom: 5 },
  { wiki: "Colt", species: ANT, aff: CA, nenFrom: 5 },
  { wiki: "Meleoron", species: ANT, aff: CA, nenFrom: 5 },
  { wiki: "Ikalgo", species: ANT, aff: CA, nenFrom: 5 },
  { wiki: "Welfin", species: ANT, aff: CA, nenFrom: 5 },
  { wiki: "Zazan", species: ANT, aff: CA, nenFrom: 5 },
  { wiki: "Cheetu", species: ANT, aff: CA, nenFrom: 5 },
  { wiki: "Leol", species: ANT, aff: CA, nenFrom: 5 },
  { wiki: "Bloster", species: ANT, aff: CA },

  // ── 13th Hunter Chairman Election ──
  { wiki: "Ging Freecss", species: H, aff: [...HA, "Zodiacs"], nenFrom: 6 },
  { wiki: "Pariston Hill", species: H, aff: [...HA, "Zodiacs"], nenFrom: 6 },
  { wiki: "Cheadle Yorkshire", species: H, aff: [...HA, "Zodiacs"], nenFrom: 6 },
  { wiki: "Mizaistom Nana", species: H, aff: [...HA, "Zodiacs"], nenFrom: 6 },
  { wiki: "Botobai Gigante", species: H, aff: [...HA, "Zodiacs"], nenFrom: 6 },
  { wiki: "Cluck", species: H, aff: [...HA, "Zodiacs"], nenFrom: 6 },
  { wiki: "Ginta", species: H, aff: [...HA, "Zodiacs"], nenFrom: 6 },
  { wiki: "Saiyu", species: H, aff: [...HA, "Zodiacs"], nenFrom: 6 },
  { wiki: "Kanzai", species: H, aff: [...HA, "Zodiacs"], nenFrom: 6 },
  { wiki: "Geru", name: "Geru", species: H, aff: [...HA, "Zodiacs"], nenFrom: 6 },
  { wiki: "Pyon", species: H, aff: [...HA, "Zodiacs"], nenFrom: 6 },
  { wiki: "Saccho Kobayakawa", species: H, aff: [...HA, "Zodiacs"], nenFrom: 6 },
  { wiki: "Alluka Zoldyck", species: H, aff: ZF },
  { wiki: "Tsubone", species: H, aff: ZF, nenFrom: 6 },
  { wiki: "Amane", species: H, aff: ZF },
];
