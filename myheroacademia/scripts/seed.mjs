// Source list for Heroacademiadle. Gender, height and portrait come from the My Hero Academia wiki
// (scripts/simple-scrape.mjs); quirk type, affiliation, status, hair and first arc are set here by hand.
//
// Arc indexes (anime):
//   0 Entrance Exam & USJ (S1) · 1 Sports Festival (S2 1–12) · 2 Hero Killer & Final Exams (S2 13–25)
//   3 Forest Training Camp & All For One (S3 1–11) · 4 Provisional License (S3 12–25) · 5 Shie Hassaikai (S4)
//   6 Joint Training & Meta Liberation (S5) · 7 Paranormal Liberation War (S6) · 8 Final War (S7–)
//
// Any field may be { arcIndex: value } to stay spoiler-free.
export const WIKI = "myheroacademia";

const A = ["Class 1-A"];
const B = ["Class 1-B"];
const PRO = ["Pro Heroes"];
const UA = ["U.A. Teachers"];
const LOV = ["League of Villains"];

export const seed = [
  // ── Class 1-A ──
  { wiki: "Izuku Midoriya", quirk: "Emitter", aff: A, status: "Student", hair: ["Green"], arc: 0 },
  { wiki: "Katsuki Bakugo", quirk: "Emitter", aff: A, status: "Student", hair: ["Blonde"], arc: 0 },
  { wiki: "Shoto Todoroki", quirk: "Emitter", aff: A, status: "Student", hair: ["White", "Red"], arc: 0 },
  { wiki: "Ochaco Uraraka", quirk: "Emitter", aff: A, status: "Student", hair: ["Brown"], arc: 0 },
  { wiki: "Tenya Iida", quirk: "Mutant", aff: A, status: "Student", hair: ["Blue"], arc: 0 },
  { wiki: "Eijiro Kirishima", quirk: "Transformation", aff: A, status: "Student", hair: ["Red"], arc: 0 },
  { wiki: "Momo Yaoyorozu", quirk: "Emitter", aff: A, status: "Student", hair: ["Black"], arc: 0 },
  { wiki: "Tsuyu Asui", quirk: "Mutant", aff: A, status: "Student", hair: ["Green"], arc: 0 },
  { wiki: "Denki Kaminari", quirk: "Emitter", aff: A, status: "Student", hair: ["Blonde"], arc: 0 },
  { wiki: "Kyoka Jiro", quirk: "Mutant", aff: A, status: "Student", hair: ["Purple"], arc: 0 },
  { wiki: "Fumikage Tokoyami", quirk: "Emitter", aff: A, status: "Student", hair: ["Black"], arc: 0 },
  { wiki: "Mina Ashido", quirk: "Emitter", aff: A, status: "Student", hair: ["Pink"], arc: 0 },
  { wiki: "Minoru Mineta", quirk: "Mutant", aff: A, status: "Student", hair: ["Purple"], arc: 0 },
  { wiki: "Yuga Aoyama", quirk: "Emitter", aff: A, status: "Student", hair: ["Blonde"], arc: 0 },
  { wiki: "Mezo Shoji", quirk: "Mutant", aff: A, status: "Student", hair: ["White"], arc: 0 },
  { wiki: "Hanta Sero", quirk: "Mutant", aff: A, status: "Student", hair: ["Black"], arc: 0 },
  { wiki: "Rikido Sato", quirk: "Transformation", aff: A, status: "Student", hair: ["Black"], arc: 0 },
  { wiki: "Koji Koda", quirk: "Emitter", aff: A, status: "Student", hair: ["None"], arc: 0 },
  { wiki: "Toru Hagakure", quirk: "Mutant", aff: A, status: "Student", hair: ["Unknown"], arc: 0 },
  { wiki: "Mashirao Ojiro", quirk: "Mutant", aff: A, status: "Student", hair: ["Blonde"], arc: 0 },
  // ── The rest of U.A. ──
  { wiki: "Neito Monoma", quirk: "Emitter", aff: B, status: "Student", hair: ["Blonde"], arc: 1 },
  { wiki: "Itsuka Kendo", quirk: "Transformation", aff: B, status: "Student", hair: ["Orange"], arc: 1 },
  { wiki: "Tetsutetsu Tetsutetsu", quirk: "Transformation", aff: B, status: "Student", hair: ["Grey"], arc: 1 },
  { wiki: "Hitoshi Shinso", quirk: "Emitter", aff: { 1: ["General Studies"], 6: A }, status: "Student", hair: ["Purple"], arc: 1 },
  { wiki: "Mirio Togata", quirk: "Emitter", aff: ["U.A. Big Three"], status: "Student", hair: ["Blonde"], arc: 4 },
  { wiki: "Tamaki Amajiki", quirk: "Transformation", aff: ["U.A. Big Three"], status: "Student", hair: ["Black"], arc: 4 },
  { wiki: "Nejire Hado", quirk: "Emitter", aff: ["U.A. Big Three"], status: "Student", hair: ["Blue"], arc: 4 },
  { wiki: "Eri", quirk: "Emitter", aff: { 5: ["Shie Hassaikai"], 6: ["U.A. High School"] }, status: "Civilian", hair: ["White"], arc: 5 },
  // ── Teachers and Pro Heroes ──
  { wiki: "Toshinori Yagi", name: "All Might", quirk: "Emitter", aff: [...PRO, ...UA], status: "Pro Hero", hair: ["Blonde"], arc: 0 },
  { wiki: "Shota Aizawa", quirk: "Emitter", aff: UA, status: "Pro Hero", hair: ["Black"], arc: 0 },
  { wiki: "Hizashi Yamada", name: "Present Mic", quirk: "Emitter", aff: UA, status: "Pro Hero", hair: ["Blonde"], arc: 0 },
  { wiki: "Nemuri Kayama", name: "Midnight", quirk: "Emitter", aff: UA, status: "Pro Hero", hair: ["Black"], arc: 0 },
  { wiki: "Ken Ishiyama", name: "Cementoss", quirk: "Emitter", aff: UA, status: "Pro Hero", hair: ["None"], arc: 1 },
  { wiki: "Nezu", quirk: "Mutant", aff: UA, status: "Teacher", hair: ["White"], arc: 0 },
  { wiki: "Chiyo Shuzenji", name: "Recovery Girl", quirk: "Emitter", aff: UA, status: "Pro Hero", hair: ["Grey"], arc: 0 },
  { wiki: "Enji Todoroki", name: "Endeavor", quirk: "Emitter", aff: PRO, status: "Pro Hero", hair: ["Red"], arc: 1 },
  { wiki: "Keigo Takami", name: "Hawks", quirk: "Mutant", aff: PRO, status: "Pro Hero", hair: ["Blonde"], arc: 5 },
  { wiki: "Tsunagu Hakamata", name: "Best Jeanist", quirk: "Emitter", aff: PRO, status: "Pro Hero", hair: ["Blonde"], arc: 2 },
  { wiki: "Rumi Usagiyama", name: "Mirko", quirk: "Mutant", aff: PRO, status: "Pro Hero", hair: ["White"], arc: 5 },
  { wiki: "Shinya Kamihara", name: "Edgeshot", quirk: "Transformation", aff: PRO, status: "Pro Hero", hair: ["Black"], arc: 3 },
  { wiki: "Sorahiko Torino", name: "Gran Torino", quirk: "Emitter", aff: PRO, status: "Pro Hero", hair: ["White"], arc: 2 },
  { wiki: "Mirai Sasaki", name: "Sir Nighteye", quirk: "Emitter", aff: PRO, status: "Pro Hero", hair: ["Green", "Blonde"], arc: 5 },
  { wiki: "Taishiro Toyomitsu", name: "Fatgum", quirk: "Mutant", aff: PRO, status: "Pro Hero", hair: ["Blonde"], arc: 5 },
  { wiki: "Anan Kurose", name: "Thirteen", quirk: "Emitter", aff: UA, status: "Pro Hero", hair: ["Unknown"], arc: 0 },
  { wiki: "Cathleen Bate", name: "Star and Stripe", quirk: "Emitter", aff: PRO, status: "Pro Hero", hair: ["Blonde"], arc: 8 },
  { wiki: "Kaina Tsutsumi", name: "Lady Nagant", quirk: "Transformation", aff: ["None"], status: "Villain", hair: ["Black", "Pink"], arc: 7 },
  // ── Villains ──
  { wiki: "Tomura Shigaraki", quirk: "Emitter", aff: LOV, status: "Villain", hair: ["Blue"], arc: 0 },
  { wiki: "All For One", quirk: "Emitter", aff: LOV, status: "Villain", hair: ["None"], arc: 3 },
  { wiki: "Kurogiri", quirk: "Mutant", aff: LOV, status: "Villain", hair: ["None"], arc: 0 },
  { wiki: "Dabi", quirk: "Emitter", aff: LOV, status: "Villain", hair: { 3: ["Black"], 7: ["White"] }, arc: 3 },
  { wiki: "Himiko Toga", quirk: "Transformation", aff: LOV, status: "Villain", hair: ["Blonde"], arc: 3 },
  { wiki: "Jin Bubaigawara", name: "Twice", quirk: "Emitter", aff: LOV, status: "Villain", hair: ["Brown"], arc: 3 },
  { wiki: "Atsuhiro Sako", name: "Mr. Compress", quirk: "Emitter", aff: LOV, status: "Villain", hair: ["Black"], arc: 3 },
  { wiki: "Shuichi Iguchi", name: "Spinner", quirk: "Mutant", aff: LOV, status: "Villain", hair: ["Purple"], arc: 2 },
  { wiki: "Kenji Hikiishi", name: "Magne", quirk: "Emitter", aff: LOV, status: "Villain", hair: ["Pink"], arc: 3 },
  { wiki: "Gigantomachia", quirk: "Mutant", aff: LOV, status: "Villain", hair: ["White"], arc: 6 },
  { wiki: "Muscular", quirk: "Transformation", aff: ["Vanguard Action Squad"], status: "Villain", hair: ["Blonde"], arc: 3 },
  { wiki: "Moonfish", quirk: "Mutant", aff: ["Vanguard Action Squad"], status: "Villain", hair: ["None"], arc: 3 },
  { wiki: "Mustard", quirk: "Emitter", aff: ["Vanguard Action Squad"], status: "Villain", hair: ["Black"], arc: 3 },
  { wiki: "Kyudai Garaki", name: "Kyudai Garaki", quirk: "Emitter", aff: LOV, status: "Villain", hair: ["None"], arc: 3 },
  { wiki: "Chizome Akaguro", name: "Stain", quirk: "Emitter", aff: ["None"], status: "Villain", hair: ["Black"], arc: 2 },
  { wiki: "Kai Chisaki", name: "Overhaul", quirk: "Emitter", aff: ["Shie Hassaikai"], status: "Villain", hair: ["Black"], arc: 5 },
  { wiki: "Rikiya Yotsubashi", name: "Re-Destro", quirk: "Transformation", aff: ["Meta Liberation Army"], status: "Villain", hair: ["Brown"], arc: 6 },
];
