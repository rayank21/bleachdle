// Source data for Bleachdle.
// Attributes are curated by hand; images and heights are scraped from the Bleach wiki (scrape.mjs).
//
// Arc indexes (anime order, fillers excluded):
//   0 Agent of the Shinigami · 1 Soul Society · 2 Arrancar · 3 Hueco Mundo
//   4 Fake Karakura Town · 5 Lost Agent (Fullbring) · 6 Thousand-Year Blood War
//
// Any attribute may be an object keyed by arc index: the value used is the one with the
// highest key <= the arc the player has watched. This keeps later reveals spoiler-free.

export const seed = [
  // ── Agent of the Shinigami ────────────────────────────────────────────
  { name: "Ichigo Kurosaki", wiki: "Ichigo Kurosaki", gender: "M", race: { 0: ["Human", "Shinigami"], 6: ["Hybrid"] }, age: "0-20", hair: ["Orange"], height: 181, residence: ["Karakura Town"], arc: 0, affiliation: "Substitute Shinigami" },
  { name: "Rukia Kuchiki", wiki: "Rukia Kuchiki", gender: "F", race: ["Shinigami"], age: "101-500", hair: ["Black"], height: 144, residence: ["Seireitei"], arc: 0, affiliation: "13th Division" },
  { name: "Orihime Inoue", wiki: "Orihime Inoue", gender: "F", race: ["Human"], age: "0-20", hair: ["Orange"], height: 157, residence: ["Karakura Town"], arc: 0, affiliation: "Karakura High School" },
  { name: "Yasutora Sado", wiki: "Yasutora Sado", gender: "M", race: { 0: ["Human"], 5: ["Human", "Fullbringer"] }, age: "0-20", hair: ["Brown"], height: 197, residence: ["Karakura Town"], arc: 0, affiliation: "Karakura High School" },
  { name: "Uryū Ishida", wiki: "Uryū Ishida", gender: "M", race: ["Quincy"], age: "0-20", hair: ["Black"], height: 171, residence: ["Karakura Town"], arc: 0, affiliation: "Karakura High School" },
  { name: "Kon", wiki: "Kon", gender: "M", race: ["Mod Soul"], age: "Unknown", hair: ["Blonde"], height: 30, residence: ["Karakura Town"], arc: 0, affiliation: "Kurosaki Clinic" },
  { name: "Kisuke Urahara", wiki: "Kisuke Urahara", gender: "M", race: ["Shinigami"], age: "101-500", hair: ["Blonde"], height: 183, residence: ["Karakura Town"], arc: 0, affiliation: "Urahara Shop" },
  { name: "Yoruichi Shihōin", wiki: "Yoruichi Shihōin", gender: "F", race: ["Shinigami"], age: "101-500", hair: ["Purple"], height: 156, residence: ["Karakura Town"], arc: 0, affiliation: "Shihōin Clan" },
  { name: "Tessai Tsukabishi", wiki: "Tessai Tsukabishi", gender: "M", race: ["Shinigami"], age: "101-500", hair: ["Black"], height: 208, residence: ["Karakura Town"], arc: 0, affiliation: "Urahara Shop" },
  { name: "Isshin Kurosaki", wiki: "Isshin Kurosaki", gender: "M", race: { 0: ["Human"], 4: ["Shinigami"] }, age: { 0: "21-100", 4: "101-500" }, hair: ["Black"], height: 185, residence: ["Karakura Town"], arc: 0, affiliation: "Kurosaki Clinic" },
  { name: "Masaki Kurosaki", wiki: "Masaki Kurosaki", gender: "F", race: { 0: ["Human"], 6: ["Quincy"] }, age: "21-100", hair: ["Orange"], height: 164, residence: ["Karakura Town"], arc: 0, affiliation: "Kurosaki Family" },
  { name: "Karin Kurosaki", wiki: "Karin Kurosaki", gender: "F", race: ["Human"], age: "0-20", hair: ["Black"], height: 140, residence: ["Karakura Town"], arc: 0, affiliation: "Kurosaki Clinic" },
  { name: "Yuzu Kurosaki", wiki: "Yuzu Kurosaki", gender: "F", race: ["Human"], age: "0-20", hair: ["Brown"], height: 139, residence: ["Karakura Town"], arc: 0, affiliation: "Kurosaki Clinic" },
  { name: "Tatsuki Arisawa", wiki: "Tatsuki Arisawa", gender: "F", race: ["Human"], age: "0-20", hair: ["Black"], height: 165, residence: ["Karakura Town"], arc: 0, affiliation: "Karakura High School" },
  { name: "Keigo Asano", wiki: "Keigo Asano", gender: "M", race: ["Human"], age: "0-20", hair: ["Brown"], height: 169, residence: ["Karakura Town"], arc: 0, affiliation: "Karakura High School" },
  { name: "Mizuiro Kojima", wiki: "Mizuiro Kojima", gender: "M", race: ["Human"], age: "0-20", hair: ["Black"], height: 153, residence: ["Karakura Town"], arc: 0, affiliation: "Karakura High School" },
  { name: "Don Kanonji", wiki: "Don Kanonji", gender: "M", race: ["Human"], age: "21-100", hair: ["Black"], height: 178, residence: ["Karakura Town"], arc: 0, affiliation: "Karakura Superheroes" },
  { name: "Renji Abarai", wiki: "Renji Abarai", gender: "M", race: ["Shinigami"], age: "101-500", hair: ["Red"], height: 188, residence: ["Seireitei"], arc: 0, affiliation: "6th Division" },
  { name: "Byakuya Kuchiki", wiki: "Byakuya Kuchiki", gender: "M", race: ["Shinigami"], age: "101-500", hair: ["Black"], height: 180, residence: ["Seireitei"], arc: 0, affiliation: "6th Division" },

  // ── Soul Society ──────────────────────────────────────────────────────
  { name: "Ganju Shiba", wiki: "Ganju Shiba", gender: "M", race: ["Soul"], age: "Unknown", hair: ["Black"], height: 172, residence: ["Rukongai"], arc: 1, affiliation: "Shiba Clan" },
  { name: "Kūkaku Shiba", wiki: "Kūkaku Shiba", gender: "F", race: ["Soul"], age: "Unknown", hair: ["Black"], height: 173, residence: ["Rukongai"], arc: 1, affiliation: "Shiba Clan" },
  { name: "Kaien Shiba", wiki: "Kaien Shiba", gender: "M", race: ["Shinigami"], age: "101-500", hair: ["Black"], height: 177, residence: ["Seireitei"], arc: 1, affiliation: "13th Division" },
  { name: "Hanatarō Yamada", wiki: "Hanatarō Yamada", gender: "M", race: ["Shinigami"], age: "Unknown", hair: ["Black"], height: 153, residence: ["Seireitei"], arc: 1, affiliation: "4th Division" },
  { name: "Genryūsai Yamamoto", wiki: "Shigekuni Genryūsai Yamamoto", gender: "M", race: ["Shinigami"], age: "1000+", hair: ["Bald"], height: 168, residence: ["Seireitei"], arc: 1, affiliation: "1st Division" },
  { name: "Chōjirō Sasakibe", wiki: "Chōjirō Tadaoki Sasakibe", gender: "M", race: ["Shinigami"], age: "1000+", hair: ["White"], height: 177, residence: ["Seireitei"], arc: 1, affiliation: "1st Division" },
  { name: "Suì-Fēng", wiki: "Suì-Fēng", gender: "F", race: ["Shinigami"], age: "101-500", hair: ["Black"], height: 150, residence: ["Seireitei"], arc: 1, affiliation: "2nd Division" },
  { name: "Marechiyo Ōmaeda", wiki: "Marechiyo Ōmaeda", gender: "M", race: ["Shinigami"], age: "Unknown", hair: ["Black"], height: 205, residence: ["Seireitei"], arc: 1, affiliation: "2nd Division" },
  { name: "Gin Ichimaru", wiki: "Gin Ichimaru", gender: "M", race: ["Shinigami"], age: "101-500", hair: ["White"], height: 185, residence: { 1: ["Seireitei"], 2: ["Las Noches", "Hueco Mundo"] }, arc: 1, affiliation: { 1: "3rd Division", 2: "Aizen's Army" } },
  { name: "Izuru Kira", wiki: "Izuru Kira", gender: "M", race: ["Shinigami"], age: "101-500", hair: ["Blonde"], height: 173, residence: ["Seireitei"], arc: 1, affiliation: "3rd Division" },
  { name: "Retsu Unohana", wiki: "Retsu Unohana", gender: "F", race: ["Shinigami"], age: "1000+", hair: ["Black"], height: 159, residence: ["Seireitei"], arc: 1, affiliation: "4th Division" },
  { name: "Isane Kotetsu", wiki: "Isane Kotetsu", gender: "F", race: ["Shinigami"], age: "101-500", hair: ["White"], height: 187, residence: ["Seireitei"], arc: 1, affiliation: "4th Division" },
  { name: "Sōsuke Aizen", wiki: "Sōsuke Aizen", gender: "M", race: ["Shinigami"], age: "101-500", hair: ["Brown"], height: 186, residence: { 1: ["Seireitei"], 2: ["Las Noches", "Hueco Mundo"] }, arc: 1, affiliation: { 1: "5th Division", 2: "Aizen's Army" } },
  { name: "Momo Hinamori", wiki: "Momo Hinamori", gender: "F", race: ["Shinigami"], age: "101-500", hair: ["Black"], height: 151, residence: ["Seireitei"], arc: 1, affiliation: "5th Division" },
  { name: "Sajin Komamura", wiki: "Sajin Komamura", gender: "M", race: ["Shinigami"], age: "101-500", hair: ["Brown"], height: 288, residence: ["Seireitei"], arc: 1, affiliation: "7th Division" },
  { name: "Tetsuzaemon Iba", wiki: "Tetsuzaemon Iba", gender: "M", race: ["Shinigami"], age: "Unknown", hair: ["Black"], height: 182, residence: ["Seireitei"], arc: 1, affiliation: "7th Division" },
  { name: "Shunsui Kyōraku", wiki: "Shunsui Kyōraku", gender: "M", race: ["Shinigami"], age: "1000+", hair: ["Brown"], height: 192, residence: ["Seireitei"], arc: 1, affiliation: "8th Division" },
  { name: "Nanao Ise", wiki: "Nanao Ise", gender: "F", race: ["Shinigami"], age: "101-500", hair: ["Black"], height: 158, residence: ["Seireitei"], arc: 1, affiliation: "8th Division" },
  { name: "Kaname Tōsen", wiki: "Kaname Tōsen", gender: "M", race: { 1: ["Shinigami"], 4: ["Shinigami", "Hollow"] }, age: "101-500", hair: ["Black"], height: 176, residence: { 1: ["Seireitei"], 2: ["Las Noches", "Hueco Mundo"] }, arc: 1, affiliation: { 1: "9th Division", 2: "Aizen's Army" } },
  { name: "Shūhei Hisagi", wiki: "Shūhei Hisagi", gender: "M", race: ["Shinigami"], age: "101-500", hair: ["Black"], height: 181, residence: ["Seireitei"], arc: 1, affiliation: "9th Division" },
  { name: "Tōshirō Hitsugaya", wiki: "Tōshirō Hitsugaya", gender: "M", race: ["Shinigami"], age: "Unknown", hair: ["White"], height: 133, residence: ["Seireitei"], arc: 1, affiliation: "10th Division" },
  { name: "Rangiku Matsumoto", wiki: "Rangiku Matsumoto", gender: "F", race: ["Shinigami"], age: "101-500", hair: ["Orange"], height: 172, residence: ["Seireitei"], arc: 1, affiliation: "10th Division" },
  { name: "Kenpachi Zaraki", wiki: "Kenpachi Zaraki", gender: "M", race: ["Shinigami"], age: "Unknown", hair: ["Black"], height: 202, residence: ["Seireitei"], arc: 1, affiliation: "11th Division" },
  { name: "Yachiru Kusajishi", wiki: "Yachiru Kusajishi", gender: "F", race: ["Shinigami"], age: "Unknown", hair: ["Pink"], height: 109, residence: ["Seireitei"], arc: 1, affiliation: "11th Division" },
  { name: "Ikkaku Madarame", wiki: "Ikkaku Madarame", gender: "M", race: ["Shinigami"], age: "Unknown", hair: ["Bald"], height: 176, residence: ["Seireitei"], arc: 1, affiliation: "11th Division" },
  { name: "Yumichika Ayasegawa", wiki: "Yumichika Ayasegawa", gender: "M", race: ["Shinigami"], age: "Unknown", hair: ["Black"], height: 169, residence: ["Seireitei"], arc: 1, affiliation: "11th Division" },
  { name: "Mayuri Kurotsuchi", wiki: "Mayuri Kurotsuchi", gender: "M", race: ["Shinigami"], age: "101-500", hair: ["Blue"], height: 174, residence: ["Seireitei"], arc: 1, affiliation: "12th Division" },
  { name: "Nemu Kurotsuchi", wiki: "Nemu Kurotsuchi", gender: "F", race: ["Shinigami"], age: "Unknown", hair: ["Black"], height: 164, residence: ["Seireitei"], arc: 1, affiliation: "12th Division" },
  { name: "Akon", wiki: "Akon", gender: "M", race: ["Shinigami"], age: "101-500", hair: ["Black"], height: 177, residence: ["Seireitei"], arc: 1, affiliation: "12th Division" },
  { name: "Jūshirō Ukitake", wiki: "Jūshirō Ukitake", gender: "M", race: ["Shinigami"], age: "1000+", hair: ["White"], height: 187, residence: ["Seireitei"], arc: 1, affiliation: "13th Division" },

  // ── Arrancar ──────────────────────────────────────────────────────────
  { name: "Ryūken Ishida", wiki: "Ryūken Ishida", gender: "M", race: ["Quincy"], age: "21-100", hair: ["White"], height: 187, residence: ["Karakura Town"], arc: 2, affiliation: "Karakura General Hospital" },
  { name: "Shinji Hirako", wiki: "Shinji Hirako", gender: "M", race: ["Visored"], age: "101-500", hair: ["Blonde"], height: 178, residence: ["Karakura Town"], arc: 2, affiliation: "Visored" },
  { name: "Hiyori Sarugaki", wiki: "Hiyori Sarugaki", gender: "F", race: ["Visored"], age: "101-500", hair: ["Blonde"], height: 133, residence: ["Karakura Town"], arc: 2, affiliation: "Visored" },
  { name: "Love Aikawa", wiki: "Love Aikawa", gender: "M", race: ["Visored"], age: "101-500", hair: ["Black"], height: 193, residence: ["Karakura Town"], arc: 2, affiliation: "Visored" },
  { name: "Rōjūrō Ōtoribashi", wiki: "Rōjūrō Ōtoribashi", gender: "M", race: ["Visored"], age: "101-500", hair: ["Blonde"], height: 180, residence: ["Karakura Town"], arc: 2, affiliation: "Visored" },
  { name: "Kensei Muguruma", wiki: "Kensei Muguruma", gender: "M", race: ["Visored"], age: "101-500", hair: ["White"], height: 179, residence: ["Karakura Town"], arc: 2, affiliation: "Visored" },
  { name: "Mashiro Kuna", wiki: "Mashiro Kuna", gender: "F", race: ["Visored"], age: "101-500", hair: ["Green"], height: 157, residence: ["Karakura Town"], arc: 2, affiliation: "Visored" },
  { name: "Lisa Yadōmaru", wiki: "Lisa Yadōmaru", gender: "F", race: ["Visored"], age: "101-500", hair: ["Black"], height: 164, residence: ["Karakura Town"], arc: 2, affiliation: "Visored" },
  { name: "Hachigen Ushōda", wiki: "Hachigen Ushōda", gender: "M", race: ["Visored"], age: "101-500", hair: ["Pink"], height: 190, residence: ["Karakura Town"], arc: 2, affiliation: "Visored" },
  { name: "Ulquiorra Cifer", wiki: "Ulquiorra Cifer", gender: "M", race: ["Arrancar"], age: "Unknown", hair: ["Black"], height: 169, residence: ["Las Noches", "Hueco Mundo"], arc: 2, affiliation: "Espada" },
  { name: "Yammy Llargo", wiki: "Yammy Llargo", gender: "M", race: ["Arrancar"], age: "Unknown", hair: ["Black"], height: 290, residence: ["Las Noches", "Hueco Mundo"], arc: 2, affiliation: "Espada" },
  { name: "Grimmjow Jaegerjaquez", wiki: "Grimmjow Jaegerjaquez", gender: "M", race: ["Arrancar"], age: "Unknown", hair: ["Blue"], height: 186, residence: ["Las Noches", "Hueco Mundo"], arc: 2, affiliation: "Espada" },
  { name: "Coyote Starrk", wiki: "Coyote Starrk", gender: "M", race: ["Arrancar"], age: "Unknown", hair: ["Brown"], height: 187, residence: ["Las Noches", "Hueco Mundo"], arc: 2, affiliation: "Espada" },
  { name: "Barragan Louisenbairn", wiki: "Baraggan Louisenbairn", gender: "M", race: ["Arrancar"], age: "Unknown", hair: ["White"], height: 178, residence: ["Las Noches", "Hueco Mundo"], arc: 2, affiliation: "Espada" },
  { name: "Tier Harribel", wiki: "Tier Harribel", gender: "F", race: ["Arrancar"], age: "Unknown", hair: ["Blonde"], height: 175, residence: ["Las Noches", "Hueco Mundo"], arc: 2, affiliation: "Espada" },
  { name: "Nnoitra Gilga", wiki: "Nnoitra Gilga", gender: "M", race: ["Arrancar"], age: "Unknown", hair: ["Black"], height: 215, residence: ["Las Noches", "Hueco Mundo"], arc: 2, affiliation: "Espada" },
  { name: "Szayelaporro Granz", wiki: "Szayelaporro Granz", gender: "M", race: ["Arrancar"], age: "Unknown", hair: ["Pink"], height: 184, residence: ["Las Noches", "Hueco Mundo"], arc: 2, affiliation: "Espada" },
  { name: "Zommari Rureaux", wiki: "Zommari Rureaux", gender: "M", race: ["Arrancar"], age: "Unknown", hair: ["Bald"], height: 202, residence: ["Las Noches", "Hueco Mundo"], arc: 2, affiliation: "Espada" },
  { name: "Aaroniero Arruruerie", wiki: "Aaroniero Arruruerie", gender: "M", race: ["Arrancar"], age: "Unknown", hair: ["Black"], height: 172, residence: ["Las Noches", "Hueco Mundo"], arc: 2, affiliation: "Espada" },
  { name: "Luppi Antenor", wiki: "Luppi Antenor", gender: "M", race: ["Arrancar"], age: "Unknown", hair: ["Black"], height: 160, residence: ["Las Noches", "Hueco Mundo"], arc: 2, affiliation: "Espada" },

  // ── Hueco Mundo ───────────────────────────────────────────────────────
  { name: "Nelliel Tu Odelschwanck", wiki: "Nelliel Tu Odelschwanck", gender: "F", race: ["Arrancar"], age: "Unknown", hair: ["Green"], height: 173, residence: ["Hueco Mundo"], arc: 3, affiliation: "Former Espada" },
  { name: "Loly Aivirrne", wiki: "Loly Aivirrne", gender: "F", race: ["Arrancar"], age: "Unknown", hair: ["Black"], height: 157, residence: ["Las Noches", "Hueco Mundo"], arc: 3, affiliation: "Aizen's Army" },
  { name: "Wonderweiss Margela", wiki: "Wonderweiss Margela", gender: "M", race: ["Arrancar"], age: "Unknown", hair: ["Blonde"], height: 149, residence: ["Las Noches", "Hueco Mundo"], arc: 3, affiliation: "Aizen's Army" },

  // ── Fake Karakura Town ────────────────────────────────────────────────
  { name: "Lilynette Gingerbuck", wiki: "Lilynette Gingerbuck", gender: "F", race: ["Arrancar"], age: "Unknown", hair: ["Blonde"], height: 131, residence: ["Las Noches", "Hueco Mundo"], arc: 4, affiliation: "Espada" },
  { name: "Emilou Apacci", wiki: "Emilou Apacci", gender: "F", race: ["Arrancar"], age: "Unknown", hair: ["Blue"], height: 157, residence: ["Las Noches", "Hueco Mundo"], arc: 4, affiliation: "Harribel's Fracción" },
  { name: "Ggio Vega", wiki: "Ggio Vega", gender: "M", race: ["Arrancar"], age: "Unknown", hair: ["Black"], height: 165, residence: ["Las Noches", "Hueco Mundo"], arc: 4, affiliation: "Barragan's Fracción" },

  // ── Lost Agent ────────────────────────────────────────────────────────
  { name: "Kūgo Ginjō", wiki: "Kūgo Ginjō", gender: "M", race: ["Human", "Fullbringer"], age: "21-100", hair: ["Black"], height: 190, residence: ["Karakura Town"], arc: 5, affiliation: "Xcution" },
  { name: "Shūkurō Tsukishima", wiki: "Shūkurō Tsukishima", gender: "M", race: ["Human", "Fullbringer"], age: "21-100", hair: ["Black"], height: 185, residence: ["Karakura Town"], arc: 5, affiliation: "Xcution" },
  { name: "Riruka Dokugamine", wiki: "Riruka Dokugamine", gender: "F", race: ["Human", "Fullbringer"], age: "0-20", hair: ["Pink"], height: 152, residence: ["Karakura Town"], arc: 5, affiliation: "Xcution" },
  { name: "Yukio Hans Vorarlberna", wiki: "Yukio Hans Vorarlberna", gender: "M", race: ["Human", "Fullbringer"], age: "0-20", hair: ["Blonde"], height: 160, residence: ["Karakura Town"], arc: 5, affiliation: "Xcution" },
  { name: "Jackie Tristan", wiki: "Jackie Tristan", gender: "F", race: ["Human", "Fullbringer"], age: "21-100", hair: ["Black"], height: 170, residence: ["Karakura Town"], arc: 5, affiliation: "Xcution" },
  { name: "Giriko Kutsuzawa", wiki: "Giriko Kutsuzawa", gender: "M", race: ["Human", "Fullbringer"], age: "21-100", hair: ["Black"], height: 187, residence: ["Karakura Town"], arc: 5, affiliation: "Xcution" },

  // ── Thousand-Year Blood War ───────────────────────────────────────────
  { name: "Yhwach", wiki: "Yhwach", gender: "M", race: ["Quincy"], age: "1000+", hair: ["Black"], height: 225, residence: ["Wandenreich"], arc: 6, affiliation: "Wandenreich" },
  { name: "Jugram Haschwalth", wiki: "Jugram Haschwalth", gender: "M", race: ["Quincy"], age: "101-500", hair: ["Blonde"], height: 185, residence: ["Wandenreich"], arc: 6, affiliation: "Sternritter" },
  { name: "Bazz-B", wiki: "Bazz-B", gender: "M", race: ["Quincy"], age: "101-500", hair: ["Red"], height: 180, residence: ["Wandenreich"], arc: 6, affiliation: "Sternritter" },
  { name: "Askin Nakk Le Vaar", wiki: "Askin Nakk Le Vaar", gender: "M", race: ["Quincy"], age: "Unknown", hair: ["Black"], height: 188, residence: ["Wandenreich"], arc: 6, affiliation: "Sternritter" },
  { name: "Bambietta Basterbine", wiki: "Bambietta Basterbine", gender: "F", race: ["Quincy"], age: "Unknown", hair: ["Black"], height: 160, residence: ["Wandenreich"], arc: 6, affiliation: "Sternritter" },
  { name: "Candice Catnipp", wiki: "Candice Catnipp", gender: "F", race: ["Quincy"], age: "Unknown", hair: ["Green"], height: 168, residence: ["Wandenreich"], arc: 6, affiliation: "Sternritter" },
  { name: "Liltotto Lamperd", wiki: "Liltotto Lamperd", gender: "F", race: ["Quincy"], age: "Unknown", hair: ["Blonde"], height: 134, residence: ["Wandenreich"], arc: 6, affiliation: "Sternritter" },
  { name: "Meninas McAllon", wiki: "Meninas McAllon", gender: "F", race: ["Quincy"], age: "Unknown", hair: ["Pink"], height: 165, residence: ["Wandenreich"], arc: 6, affiliation: "Sternritter" },
  { name: "Giselle Gewelle", wiki: "Giselle Gewelle", gender: "M", race: ["Quincy"], age: "Unknown", hair: ["Black"], height: 159, residence: ["Wandenreich"], arc: 6, affiliation: "Sternritter" },
  { name: "Äs Nödt", wiki: "Äs Nödt", gender: "M", race: ["Quincy"], age: "Unknown", hair: ["Black"], height: 184, residence: ["Wandenreich"], arc: 6, affiliation: "Sternritter" },
  { name: "Quilge Opie", wiki: "Quilge Opie", gender: "M", race: ["Quincy"], age: "Unknown", hair: ["Black"], height: 197, residence: ["Wandenreich"], arc: 6, affiliation: "Sternritter" },
  { name: "Gremmy Thoumeaux", wiki: "Gremmy Thoumeaux", gender: "M", race: ["Quincy"], age: "Unknown", hair: ["White"], height: 150, residence: ["Wandenreich"], arc: 6, affiliation: "Sternritter" },
  { name: "Lille Barro", wiki: "Lille Barro", gender: "M", race: ["Quincy"], age: "1000+", hair: ["Black"], height: 188, residence: ["Wandenreich"], arc: 6, affiliation: "Schutzstaffel" },
  { name: "Ichibē Hyōsube", wiki: "Ichibē Hyōsube", gender: "M", race: ["Shinigami"], age: "1000+", hair: ["Black"], height: 172, residence: ["Soul King Palace"], arc: 6, affiliation: "Zero Division" },
  { name: "Senjumaru Shutara", wiki: "Senjumaru Shutara", gender: "F", race: ["Shinigami"], age: "1000+", hair: ["Black"], height: 172, residence: ["Soul King Palace"], arc: 6, affiliation: "Zero Division" },
  { name: "Tenjirō Kirinji", wiki: "Tenjirō Kirinji", gender: "M", race: ["Shinigami"], age: "1000+", hair: ["Black"], height: 180, residence: ["Soul King Palace"], arc: 6, affiliation: "Zero Division" },
  { name: "Ōetsu Nimaiya", wiki: "Ōetsu Nimaiya", gender: "M", race: ["Shinigami"], age: "1000+", hair: ["Black"], height: 172, residence: ["Soul King Palace"], arc: 6, affiliation: "Zero Division" },
  { name: "Kirio Hikifune", wiki: "Kirio Hikifune", gender: "F", race: ["Shinigami"], age: "101-500", hair: ["Purple"], height: 175, residence: ["Soul King Palace"], arc: 6, affiliation: "Zero Division" },
];
