// Source list for Demonslayerdle. Gender, height and portrait come from the Kimetsu no Yaiba wiki
// (scripts/simple-scrape.mjs); race, affiliation, rank, style and first arc are set here by hand.
//
// Arc indexes (anime):
//   0 Final Selection (S1 1–5) · 1 Asakusa & Tsuzumi Mansion (S1 6–14) · 2 Mount Natagumo (S1 15–26)
//   3 Mugen Train (S2 1–7) · 4 Entertainment District (S2 8–18) · 5 Swordsmith Village (S3)
//   6 Hashira Training (S4) · 7 Infinity Castle (film)
//
// Any field may be { arcIndex: value } to stay spoiler-free.
export const WIKI = "kimetsu-no-yaiba";

const DSC = ["Demon Slayer Corps"];
const H = ["Human"];
const D = ["Demon"];
const BDA = ["Blood Demon Art"];

export const seed = [
  // ── Demon Slayer Corps ──
  { wiki: "Tanjiro Kamado", race: H, aff: DSC, rank: "Demon Slayer", style: { 0: ["Water Breathing"], 2: ["Water Breathing", "Sun Breathing"] }, arc: 0 },
  { wiki: "Nezuko Kamado", race: D, aff: ["Kamado Family"], rank: "None", style: BDA, arc: 0 },
  { wiki: "Zenitsu Agatsuma", race: H, aff: DSC, rank: "Demon Slayer", style: ["Thunder Breathing"], arc: 1 },
  { wiki: "Inosuke Hashibira", race: H, aff: DSC, rank: "Demon Slayer", style: ["Beast Breathing"], arc: 1 },
  { wiki: "Kanao Tsuyuri", race: H, aff: DSC, rank: "Demon Slayer", style: ["Flower Breathing"], arc: 0 },
  { wiki: "Genya Shinazugawa", race: H, aff: DSC, rank: "Demon Slayer", style: ["None"], arc: 0 },
  { wiki: "Murata", race: H, aff: DSC, rank: "Demon Slayer", style: ["Water Breathing"], arc: 2 },
  { wiki: "Aoi Kanzaki", race: H, aff: DSC, rank: "Demon Slayer", style: ["None"], arc: 2 },
  { wiki: "Sabito", race: H, aff: DSC, rank: "Demon Slayer", style: ["Water Breathing"], arc: 0 },
  { wiki: "Makomo", race: H, aff: DSC, rank: "Demon Slayer", style: ["Water Breathing"], arc: 0 },
  // ── Hashira ──
  { wiki: "Giyu Tomioka", race: H, aff: DSC, rank: "Hashira", style: ["Water Breathing"], arc: 0 },
  { wiki: "Shinobu Kocho", race: H, aff: DSC, rank: "Hashira", style: ["Insect Breathing"], arc: 2 },
  { wiki: "Kyojuro Rengoku", race: H, aff: DSC, rank: "Hashira", style: ["Flame Breathing"], arc: 2 },
  { wiki: "Tengen Uzui", race: H, aff: DSC, rank: "Hashira", style: ["Sound Breathing"], arc: 2 },
  { wiki: "Mitsuri Kanroji", race: H, aff: DSC, rank: "Hashira", style: ["Love Breathing"], arc: 2 },
  { wiki: "Muichiro Tokito", race: H, aff: DSC, rank: "Hashira", style: ["Mist Breathing"], arc: 2 },
  { wiki: "Gyomei Himejima", race: H, aff: DSC, rank: "Hashira", style: ["Stone Breathing"], arc: 2 },
  { wiki: "Sanemi Shinazugawa", race: H, aff: DSC, rank: "Hashira", style: ["Wind Breathing"], arc: 2 },
  { wiki: "Obanai Iguro", race: H, aff: DSC, rank: "Hashira", style: ["Serpent Breathing"], arc: 2 },
  { wiki: "Kanae Kocho", race: H, aff: DSC, rank: "Hashira", style: ["Flower Breathing"], arc: 2 },
  // ── Former Hashira, the Corps' family and allies ──
  { wiki: "Sakonji Urokodaki", race: H, aff: DSC, rank: "Former Hashira", style: ["Water Breathing"], arc: 0 },
  { wiki: "Jigoro Kuwajima", race: H, aff: DSC, rank: "Former Hashira", style: ["Thunder Breathing"], arc: 1 },
  { wiki: "Shinjuro Rengoku", race: H, aff: DSC, rank: "Former Hashira", style: ["Flame Breathing"], arc: 3 },
  { wiki: "Yoriichi Tsugikuni", race: H, aff: DSC, rank: "Former Hashira", style: ["Sun Breathing"], arc: 5 },
  { wiki: "Kagaya Ubuyashiki", race: H, aff: ["Ubuyashiki Family"], rank: "Corps Leader", style: ["None"], arc: 2 },
  { wiki: "Senjuro Rengoku", race: H, aff: ["Rengoku Family"], rank: "None", style: ["None"], arc: 3 },
  { wiki: "Hotaru Haganezuka", race: H, aff: ["Swordsmith Village"], rank: "None", style: ["None"], arc: 0 },
  { wiki: "Kotetsu", race: H, aff: ["Swordsmith Village"], rank: "None", style: ["None"], arc: 5 },
  { wiki: "Makio", race: H, aff: ["Uzui Family"], rank: "None", style: ["None"], arc: 4 },
  { wiki: "Suma", race: H, aff: ["Uzui Family"], rank: "None", style: ["None"], arc: 4 },
  { wiki: "Hinatsuru", race: H, aff: ["Uzui Family"], rank: "None", style: ["None"], arc: 4 },
  { wiki: "Tamayo", race: D, aff: ["Tamayo's Clinic"], rank: "None", style: BDA, arc: 1 },
  { wiki: "Yushiro", race: D, aff: ["Tamayo's Clinic"], rank: "None", style: BDA, arc: 1 },
  // ── Demons ──
  { wiki: "Muzan Kibutsuji", race: D, aff: ["Twelve Kizuki"], rank: "Demon King", style: BDA, arc: 1 },
  { wiki: "Kokushibo", race: D, aff: ["Twelve Kizuki"], rank: "Upper Moon", style: ["Moon Breathing"], arc: 5 },
  { wiki: "Doma", race: D, aff: ["Twelve Kizuki"], rank: "Upper Moon", style: BDA, arc: 5 },
  { wiki: "Akaza", race: D, aff: ["Twelve Kizuki"], rank: "Upper Moon", style: BDA, arc: 3 },
  { wiki: "Hantengu", race: D, aff: ["Twelve Kizuki"], rank: "Upper Moon", style: BDA, arc: 5 },
  { wiki: "Gyokko", race: D, aff: ["Twelve Kizuki"], rank: "Upper Moon", style: BDA, arc: 5 },
  { wiki: "Daki", race: D, aff: ["Twelve Kizuki"], rank: "Upper Moon", style: BDA, arc: 4 },
  { wiki: "Gyutaro", race: D, aff: ["Twelve Kizuki"], rank: "Upper Moon", style: BDA, arc: 4 },
  { wiki: "Nakime", race: D, aff: ["Twelve Kizuki"], rank: "Upper Moon", style: BDA, arc: 2 },
  { wiki: "Rui", race: D, aff: ["Twelve Kizuki"], rank: "Lower Moon", style: BDA, arc: 2 },
  { wiki: "Enmu", race: D, aff: ["Twelve Kizuki"], rank: "Lower Moon", style: BDA, arc: 2 },
  { wiki: "Kyogai", race: D, aff: ["Demons"], rank: "Former Lower Moon", style: BDA, arc: 1 },
  { wiki: "Susamaru", race: D, aff: ["Demons"], rank: "None", style: BDA, arc: 1 },
  { wiki: "Yahaba", race: D, aff: ["Demons"], rank: "None", style: BDA, arc: 1 },
  { wiki: "Hand Demon", race: D, aff: ["Demons"], rank: "None", style: BDA, arc: 0 },
];
