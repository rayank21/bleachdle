// Source list for Haikyudle. Gender, height and portrait come from the Haikyuu!! wiki (scripts/simple-scrape.mjs);
// school, position, year, jersey number and first arc are set here by hand.
//
// Arc indexes (anime):
//   0 Karasuno's Revival (S1 1–13) · 1 Inter-High (S1 14–25) · 2 Tokyo Training Camp (S2 1–13)
//   3 Spring Prelims (S2 14–25, S3) · 4 Spring Nationals (S4) · 5 Battle at the Garbage Dump (film)
//
// Any field may be { arcIndex: value } to stay spoiler-free.
export const WIKI = "haikyuu";

const K = "Karasuno";
const S = "Aoba Johsai";
const N = "Nekoma";
const SH = "Shiratorizawa";
const I = "Inarizaki";

export const seed = [
  // ── Karasuno ──
  { wiki: "Shōyō Hinata", name: "Shoyo Hinata", school: K, position: "Middle Blocker", year: "1st year", number: 10, arc: 0 },
  { wiki: "Tobio Kageyama", school: K, position: "Setter", year: "1st year", number: 9, arc: 0 },
  { wiki: "Kei Tsukishima", school: K, position: "Middle Blocker", year: "1st year", number: 11, arc: 0 },
  { wiki: "Tadashi Yamaguchi", school: K, position: "Middle Blocker", year: "1st year", number: 12, arc: 0 },
  { wiki: "Daichi Sawamura", school: K, position: "Wing Spiker", year: "3rd year", number: 1, arc: 0 },
  { wiki: "Kōshi Sugawara", name: "Koshi Sugawara", school: K, position: "Setter", year: "3rd year", number: 2, arc: 0 },
  { wiki: "Asahi Azumane", school: K, position: "Wing Spiker", year: "3rd year", number: 3, arc: 0 },
  { wiki: "Yū Nishinoya", name: "Yu Nishinoya", school: K, position: "Libero", year: "2nd year", number: 4, arc: 0 },
  { wiki: "Ryūnosuke Tanaka", name: "Ryunosuke Tanaka", school: K, position: "Wing Spiker", year: "2nd year", number: 5, arc: 0 },
  { wiki: "Chikara Ennoshita", school: K, position: "Wing Spiker", year: "2nd year", number: 6, arc: 0 },
  { wiki: "Hisashi Kinoshita", school: K, position: "Wing Spiker", year: "2nd year", number: 7, arc: 0 },
  { wiki: "Kazuhito Narita", school: K, position: "Middle Blocker", year: "2nd year", number: 8, arc: 0 },
  { wiki: "Kiyoko Shimizu", school: K, position: "Manager", year: "3rd year", number: null, arc: 0 },
  { wiki: "Hitoka Yachi", school: K, position: "Manager", year: "1st year", number: null, arc: 1 },
  { wiki: "Ittetsu Takeda", school: K, position: "Advisor", year: "Adult", number: null, arc: 0 },
  { wiki: "Keishin Ukai", school: K, position: "Coach", year: "Adult", number: null, arc: 0 },
  { wiki: "Ikkei Ukai", school: K, position: "Coach", year: "Adult", number: null, arc: 0 },
  { wiki: "Saeko Tanaka", school: "None", position: "Supporter", year: "Adult", number: null, arc: 2 },
  // ── Aoba Johsai ──
  { wiki: "Tōru Oikawa", name: "Toru Oikawa", school: S, position: "Setter", year: "3rd year", number: 1, arc: 0 },
  { wiki: "Hajime Iwaizumi", school: S, position: "Wing Spiker", year: "3rd year", number: 4, arc: 0 },
  { wiki: "Issei Matsukawa", school: S, position: "Middle Blocker", year: "3rd year", number: 2, arc: 0 },
  { wiki: "Takahiro Hanamaki", school: S, position: "Wing Spiker", year: "3rd year", number: 3, arc: 0 },
  { wiki: "Yūtarō Kindaichi", name: "Yutaro Kindaichi", school: S, position: "Middle Blocker", year: "1st year", number: 12, arc: 0 },
  { wiki: "Akira Kunimi", school: S, position: "Wing Spiker", year: "1st year", number: 13, arc: 0 },
  { wiki: "Kentarō Kyōtani", name: "Kentaro Kyotani", school: S, position: "Wing Spiker", year: "2nd year", number: 16, arc: 3 },
  { wiki: "Shinji Watari", school: S, position: "Libero", year: "2nd year", number: 7, arc: 1 },
  // ── Nekoma ──
  { wiki: "Tetsurō Kuroo", name: "Tetsuro Kuroo", school: N, position: "Middle Blocker", year: "3rd year", number: 1, arc: 0 },
  { wiki: "Kenma Kozume", school: N, position: "Setter", year: "2nd year", number: 5, arc: 0 },
  { wiki: "Morisuke Yaku", school: N, position: "Libero", year: "3rd year", number: 3, arc: 0 },
  { wiki: "Lev Haiba", school: N, position: "Middle Blocker", year: "1st year", number: 11, arc: 2 },
  { wiki: "Taketora Yamamoto", school: N, position: "Wing Spiker", year: "2nd year", number: 4, arc: 0 },
  { wiki: "Nobuyuki Kai", school: N, position: "Wing Spiker", year: "3rd year", number: 2, arc: 0 },
  { wiki: "Yasufumi Nekomata", school: N, position: "Coach", year: "Adult", number: null, arc: 1 },
  // ── Fukurodani, Date Tech, Johzenji ──
  { wiki: "Kōtarō Bokuto", name: "Kotaro Bokuto", school: "Fukurodani", position: "Wing Spiker", year: "3rd year", number: 4, arc: 2 },
  { wiki: "Keiji Akaashi", school: "Fukurodani", position: "Setter", year: "2nd year", number: 5, arc: 2 },
  { wiki: "Haruki Komi", school: "Fukurodani", position: "Libero", year: "3rd year", number: 11, arc: 2 },
  { wiki: "Kenji Futakuchi", school: "Date Tech", position: "Wing Spiker", year: "2nd year", number: 2, arc: 1 },
  { wiki: "Takanobu Aone", school: "Date Tech", position: "Middle Blocker", year: "2nd year", number: 7, arc: 1 },
  { wiki: "Kōsuke Sakunami", name: "Kosuke Sakunami", school: "Date Tech", position: "Libero", year: "1st year", number: 13, arc: 1 },
  { wiki: "Yūji Terushima", name: "Yuji Terushima", school: "Johzenji", position: "Wing Spiker", year: "3rd year", number: 1, arc: 3 },
  // ── Shiratorizawa ──
  { wiki: "Wakatoshi Ushijima", school: SH, position: "Opposite", year: "3rd year", number: 1, arc: 1 },
  { wiki: "Satori Tendō", name: "Satori Tendo", school: SH, position: "Middle Blocker", year: "3rd year", number: 5, arc: 3 },
  { wiki: "Kenjirō Shirabu", name: "Kenjiro Shirabu", school: SH, position: "Setter", year: "2nd year", number: 10, arc: 3 },
  { wiki: "Eita Semi", school: SH, position: "Setter", year: "3rd year", number: 3, arc: 3 },
  { wiki: "Tsutomu Goshiki", school: SH, position: "Wing Spiker", year: "1st year", number: 8, arc: 3 },
  { wiki: "Hayato Yamagata", school: SH, position: "Libero", year: "3rd year", number: 14, arc: 3 },
  { wiki: "Tanji Washijō", name: "Tanji Washijo", school: SH, position: "Coach", year: "Adult", number: null, arc: 3 },
  // ── Spring Nationals ──
  { wiki: "Atsumu Miya", school: I, position: "Setter", year: "2nd year", number: 7, arc: 4 },
  { wiki: "Osamu Miya", school: I, position: "Wing Spiker", year: "2nd year", number: 11, arc: 4 },
  { wiki: "Shinsuke Kita", school: I, position: "Wing Spiker", year: "3rd year", number: 1, arc: 4 },
  { wiki: "Rintarō Suna", name: "Rintaro Suna", school: I, position: "Middle Blocker", year: "2nd year", number: 10, arc: 4 },
  { wiki: "Aran Ojiro", school: I, position: "Opposite", year: "3rd year", number: 4, arc: 4 },
  { wiki: "Michinari Akagi", school: I, position: "Libero", year: "3rd year", number: 15, arc: 4 },
  { wiki: "Kiyoomi Sakusa", school: "Itachiyama", position: "Wing Spiker", year: "2nd year", number: 15, arc: 4 },
  { wiki: "Motoya Komori", school: "Itachiyama", position: "Libero", year: "2nd year", number: 13, arc: 4 },
  { wiki: "Kōrai Hoshiumi", name: "Korai Hoshiumi", school: "Kamomedai", position: "Wing Spiker", year: "2nd year", number: 1, arc: 4 },
  { wiki: "Sachirō Hirugami", name: "Sachiro Hirugami", school: "Kamomedai", position: "Middle Blocker", year: "2nd year", number: 3, arc: 4 },
];
