// Crew Roll transformations: when one of these characters is drawn, the card powers up and turns
// into this form (portrait from crew/scripts/forms.mjs → crew/assets/forms/<game>-<id>.webp).
// arc: first arc where the form appears, so it never shows up before the player got there.
// fx: the effect's shape (aura: flames and lightning, pillar: a beam of energy, domain: a sphere
// that swallows the panel); c1/c2: its colours; kanji: the word slammed over the card.
(() => {
  const SAIYAN = { fx: "aura", c1: "255, 225, 77", c2: "255, 157, 46", kanji: "超" };
  const BANKAI = { fx: "pillar", c1: "255, 42, 42", c2: "30, 6, 8", kanji: "卍解" };
  const RESURRECCION = { fx: "pillar", c1: "60, 220, 140", c2: "10, 40, 25", kanji: "帰刃" };
  const DOMAIN = { fx: "domain", c1: "150, 90, 255", c2: "8, 4, 20", kanji: "領域展開" };

  window.CREW_FORMS = {
    dragonball: {
      goku: { arc: 5, name: { en: "Super Saiyan", fr: "Super Saiyan" }, ...SAIYAN },
      vegeta: { arc: 6, name: { en: "Super Saiyan", fr: "Super Saiyan" }, ...SAIYAN },
      gohan: { arc: 6, name: { en: "Super Saiyan 2", fr: "Super Saiyan 2" }, ...SAIYAN, lightning: true },
      "future-trunks": { arc: 6, name: { en: "Super Saiyan", fr: "Super Saiyan" }, ...SAIYAN },
      frieza: { arc: 8, name: { en: "Golden Frieza", fr: "Golden Freezer" }, fx: "aura", c1: "255, 211, 77", c2: "255, 245, 190", kanji: "金" },
      "goku-black": { arc: 8, name: { en: "Super Saiyan Rosé", fr: "Super Saiyan Rosé" }, fx: "aura", c1: "255, 122, 217", c2: "176, 77, 255", kanji: "超" },
    },
    bleach: {
      "ichigo-kurosaki": { arc: 1, name: { en: "Bankai · Tensa Zangetsu", fr: "Bankai · Tensa Zangetsu" }, ...BANKAI },
      "byakuya-kuchiki": { arc: 1, name: { en: "Bankai · Senbonzakura Kageyoshi", fr: "Bankai · Senbonzakura Kageyoshi" }, ...BANKAI, c1: "255, 140, 190" },
      "renji-abarai": { arc: 1, name: { en: "Bankai · Hihiō Zabimaru", fr: "Bankai · Hihiō Zabimaru" }, ...BANKAI },
      "toshiro-hitsugaya": { arc: 1, name: { en: "Bankai · Daiguren Hyōrinmaru", fr: "Bankai · Daiguren Hyōrinmaru" }, ...BANKAI, c1: "120, 210, 255", c2: "6, 20, 40" },
      "ulquiorra-cifer": { arc: 3, name: { en: "Resurrección · Segunda Etapa", fr: "Resurrección · Segunda Etapa" }, ...RESURRECCION },
      "grimmjow-jaegerjaquez": { arc: 3, name: { en: "Resurrección · Pantera", fr: "Resurrección · Pantera" }, ...RESURRECCION, c1: "80, 200, 255", c2: "6, 20, 40" },
    },
    naruto: {
      "naruto-uzumaki": { arc: 6, name: { en: "Sage Mode", fr: "Mode Ermite" }, fx: "aura", c1: "255, 150, 40", c2: "255, 220, 90", kanji: "仙人" },
      "sasuke-uchiha": { arc: 7, name: { en: "Susanoo", fr: "Susanoo" }, fx: "pillar", c1: "180, 110, 255", c2: "20, 6, 40", kanji: "須佐能乎" },
      "itachi-uchiha": { arc: 6, name: { en: "Susanoo", fr: "Susanoo" }, fx: "pillar", c1: "255, 90, 50", c2: "40, 6, 6", kanji: "須佐能乎" },
      "kakashi-hatake": { arc: 4, name: { en: "Mangekyō Sharingan", fr: "Mangekyō Sharingan" }, fx: "domain", c1: "230, 30, 40", c2: "20, 0, 0", kanji: "万華鏡" },
      "might-guy": { arc: 8, name: { en: "Eight Gates", fr: "Huit Portes" }, fx: "aura", c1: "255, 60, 60", c2: "90, 255, 140", kanji: "八門遁甲", lightning: true },
      "rock-lee": { arc: 1, name: { en: "Eight Gates", fr: "Huit Portes" }, fx: "aura", c1: "90, 255, 140", c2: "60, 160, 255", kanji: "八門遁甲" },
    },
    onepiece: {
      "monkey-d-luffy": { arc: 9, name: { en: "Gear 5", fr: "Gear 5" }, fx: "aura", c1: "255, 255, 255", c2: "190, 150, 255", kanji: "ニカ", lightning: true },
      "roronoa-zoro": { arc: 3, name: { en: "Asura", fr: "Asura" }, fx: "domain", c1: "90, 255, 150", c2: "4, 20, 10", kanji: "阿修羅" },
    },
    jujutsukaisen: {
      "satoru-gojo": { arc: 1, name: { en: "Domain Expansion · Infinite Void", fr: "Extension du territoire · Sphère de l'espace infini" }, ...DOMAIN, c1: "90, 170, 255" },
      "ryomen-sukuna": { arc: 5, name: { en: "Domain Expansion · Malevolent Shrine", fr: "Extension du territoire · Temple maléfique" }, ...DOMAIN, c1: "255, 50, 60" },
      "yuta-okkotsu": { arc: 6, name: { en: "Rika, fully manifested", fr: "Rika, pleinement manifestée" }, fx: "pillar", c1: "255, 70, 120", c2: "20, 0, 10", kanji: "里香" },
      mahito: { arc: 1, name: { en: "Domain Expansion · Self-Embodiment of Perfection", fr: "Extension du territoire · Incarnation parfaite" }, ...DOMAIN, c1: "255, 120, 60" },
    },
    hunterxhunter: {
      "killua-zoldyck": { arc: 5, name: { en: "Godspeed", fr: "Vitesse divine" }, fx: "aura", c1: "140, 220, 255", c2: "255, 255, 255", kanji: "神速", lightning: true },
      kurapika: { arc: 3, name: { en: "Emperor Time", fr: "Emperor Time" }, fx: "domain", c1: "255, 40, 50", c2: "20, 0, 0", kanji: "絶対時間" },
    },
  };
})();
