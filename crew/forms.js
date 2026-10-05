// Crew Roll transformations: when one of these characters is drawn, the card powers up and turns
// into this form (portrait from crew/scripts/forms.mjs → crew/assets/forms/<game>-<id>.webp).
// arc: first arc where the form appears, so it never shows up before the player got there.
// fx: the effect's shape (aura: flames and lightning, pillar: a beam of energy, domain: a sphere
// that swallows the panel); c1/c2: its colours; kanji: the word slammed over the card.
(() => {
  const SAIYAN = { fx: "aura", c1: "255, 225, 77", c2: "255, 157, 46", kanji: "超", lightning: true };
  const BANKAI = { fx: "pillar", c1: "255, 42, 42", c2: "30, 6, 8", kanji: "卍解" };
  const RESURRECCION = { fx: "pillar", c1: "60, 220, 140", c2: "10, 40, 25", kanji: "帰刃" };
  const DOMAIN = { fx: "domain", c1: "150, 90, 255", c2: "8, 4, 20", kanji: "領域展開" };
  // A Titan shifter's transformation: a lightning strike and a column of steam.
  const TITAN = { fx: "pillar", c1: "255, 196, 110", c2: "40, 14, 4", kanji: "巨人", lightning: true };

  window.CREW_FORMS = {
    dragonball: {
      goku: { arc: 5, name: { en: "Super Saiyan", fr: "Super Saiyan" }, ...SAIYAN },
      vegeta: { arc: 6, name: { en: "Super Saiyan", fr: "Super Saiyan" }, ...SAIYAN },
      gohan: { arc: 6, name: { en: "Super Saiyan 2", fr: "Super Saiyan 2" }, ...SAIYAN, lightning: true },
      "future-trunks": { arc: 6, name: { en: "Super Saiyan", fr: "Super Saiyan" }, ...SAIYAN },
      frieza: { arc: 8, name: { en: "Golden Frieza", fr: "Golden Freezer" }, fx: "aura", c1: "255, 211, 77", c2: "255, 245, 190", kanji: "金" },
      "goku-black": { arc: 8, name: { en: "Super Saiyan Rosé", fr: "Super Saiyan Rosé" }, fx: "aura", c1: "255, 122, 217", c2: "176, 77, 255", kanji: "超", lightning: true },
      cell: { arc: 6, name: { en: "Super Perfect Cell", fr: "Cell Super Parfait" }, fx: "aura", c1: "140, 255, 120", c2: "255, 230, 90", kanji: "完全体", lightning: true },
      "majin-buu": { arc: 7, name: { en: "Super Buu", fr: "Super Boo" }, fx: "pillar", c1: "255, 120, 200", c2: "40, 6, 30", kanji: "魔人" },
      piccolo: { arc: 8, name: { en: "Orange Piccolo", fr: "Piccolo Orange" }, fx: "aura", c1: "255, 150, 40", c2: "255, 90, 30", kanji: "覚醒" },
      jiren: { arc: 8, name: { en: "Full Power", fr: "Pleine puissance" }, fx: "aura", c1: "255, 60, 60", c2: "255, 200, 200", kanji: "全力", lightning: true },
      zamasu: { arc: 8, name: { en: "Fusion Zamasu", fr: "Zamasu fusionné" }, fx: "pillar", c1: "200, 255, 210", c2: "60, 10, 70", kanji: "合体" },
      kale: { arc: 8, name: { en: "Legendary Super Saiyan", fr: "Super Saiyan légendaire" }, fx: "aura", c1: "120, 255, 120", c2: "40, 180, 60", kanji: "伝説", lightning: true },
    },
    bleach: {
      "ichigo-kurosaki": { arc: 1, name: { en: "Bankai · Tensa Zangetsu", fr: "Bankai · Tensa Zangetsu" }, ...BANKAI },
      "byakuya-kuchiki": { arc: 1, name: { en: "Bankai · Senbonzakura Kageyoshi", fr: "Bankai · Senbonzakura Kageyoshi" }, ...BANKAI, c1: "255, 140, 190" },
      "renji-abarai": { arc: 1, name: { en: "Bankai · Hihiō Zabimaru", fr: "Bankai · Hihiō Zabimaru" }, ...BANKAI },
      "toshiro-hitsugaya": { arc: 1, name: { en: "Bankai · Daiguren Hyōrinmaru", fr: "Bankai · Daiguren Hyōrinmaru" }, ...BANKAI, c1: "120, 210, 255", c2: "6, 20, 40" },
      "ulquiorra-cifer": { arc: 3, name: { en: "Resurrección · Segunda Etapa", fr: "Resurrección · Segunda Etapa" }, ...RESURRECCION },
      "grimmjow-jaegerjaquez": { arc: 3, name: { en: "Resurrección · Pantera", fr: "Resurrección · Pantera" }, ...RESURRECCION, c1: "80, 200, 255", c2: "6, 20, 40" },
      "coyote-starrk": { arc: 4, name: { en: "Resurrección · Los Lobos", fr: "Resurrección · Los Lobos" }, ...RESURRECCION, c1: "120, 200, 255", c2: "6, 16, 40" },
      "sajin-komamura": { arc: 1, name: { en: "Bankai · Kokujō Tengen Myō'ō", fr: "Bankai · Kokujō Tengen Myō'ō" }, ...BANKAI, c1: "255, 120, 40" },
      "mayuri-kurotsuchi": { arc: 1, name: { en: "Bankai · Konjiki Ashisogi Jizō", fr: "Bankai · Konjiki Ashisogi Jizō" }, ...BANKAI, c1: "255, 210, 60", c2: "40, 6, 40" },
      "sosuke-aizen": { arc: 4, name: { en: "Fused with the Hōgyoku", fr: "Fusion avec le Hōgyoku" }, fx: "domain", c1: "190, 120, 255", c2: "10, 4, 24", kanji: "崩玉" },
      "kenpachi-zaraki": { arc: 6, name: { en: "Bankai", fr: "Bankai" }, ...BANKAI, kanji: "卍解", lightning: true },
      yhwach: { arc: 6, name: { en: "The Almighty", fr: "The Almighty" }, fx: "domain", c1: "255, 40, 50", c2: "4, 4, 12", kanji: "全知全能" },
    },
    naruto: {
      "naruto-uzumaki": { arc: 6, name: { en: "Sage Mode", fr: "Mode Ermite" }, fx: "aura", c1: "255, 150, 40", c2: "255, 220, 90", kanji: "仙人" },
      "sasuke-uchiha": { arc: 7, name: { en: "Susanoo", fr: "Susanoo" }, fx: "pillar", c1: "180, 110, 255", c2: "20, 6, 40", kanji: "須佐能乎" },
      "itachi-uchiha": { arc: 6, name: { en: "Susanoo", fr: "Susanoo" }, fx: "pillar", c1: "255, 90, 50", c2: "40, 6, 6", kanji: "須佐能乎" },
      "kakashi-hatake": { arc: 4, name: { en: "Mangekyō Sharingan", fr: "Mangekyō Sharingan" }, fx: "domain", c1: "230, 30, 40", c2: "20, 0, 0", kanji: "万華鏡" },
      "might-guy": { arc: 8, name: { en: "Eight Gates", fr: "Huit Portes" }, fx: "aura", c1: "255, 60, 60", c2: "90, 255, 140", kanji: "八門遁甲", lightning: true },
      "rock-lee": { arc: 1, name: { en: "Eight Gates", fr: "Huit Portes" }, fx: "aura", c1: "90, 255, 140", c2: "60, 160, 255", kanji: "八門遁甲" },
      gaara: { arc: 2, name: { en: "Shukaku", fr: "Shukaku" }, fx: "pillar", c1: "230, 200, 140", c2: "50, 30, 10", kanji: "守鶴" },
      jiraiya: { arc: 6, name: { en: "Sage Mode", fr: "Mode Ermite" }, fx: "aura", c1: "255, 150, 40", c2: "255, 220, 90", kanji: "仙人" },
      "kabuto-yakushi": { arc: 8, name: { en: "Sage Mode", fr: "Mode Ermite" }, fx: "aura", c1: "120, 220, 255", c2: "60, 90, 200", kanji: "仙人" },
      "minato-namikaze": { arc: 8, name: { en: "Nine-Tails Chakra Mode", fr: "Mode Chakra de Kyûbi" }, fx: "aura", c1: "255, 170, 40", c2: "255, 240, 140", kanji: "九尾", lightning: true },
      "obito-uchiha": { arc: 8, name: { en: "Ten-Tails Jinchūriki", fr: "Jinchûriki de Jûbi" }, fx: "pillar", c1: "240, 240, 230", c2: "20, 10, 30", kanji: "十尾" },
      "madara-uchiha": { arc: 8, name: { en: "Six Paths Sage Mode", fr: "Mode Ermite des Six Chemins" }, fx: "domain", c1: "235, 235, 255", c2: "10, 6, 20", kanji: "六道" },
    },
    onepiece: {
      "monkey-d-luffy": { arc: 9, name: { en: "Gear 5", fr: "Gear 5" }, fx: "aura", c1: "255, 255, 255", c2: "190, 150, 255", kanji: "ニカ", lightning: true },
      "roronoa-zoro": { arc: 3, name: { en: "Asura", fr: "Asura" }, fx: "domain", c1: "90, 255, 150", c2: "4, 20, 10", kanji: "阿修羅" },
      "tony-tony-chopper": { arc: 3, name: { en: "Monster Point", fr: "Monster Point" }, fx: "pillar", c1: "255, 120, 160", c2: "40, 10, 10", kanji: "怪物" },
      "polo-marco": { arc: 5, name: { en: "Phoenix", fr: "Phénix" }, fx: "aura", c1: "80, 200, 255", c2: "255, 220, 80", kanji: "不死鳥" },
      "rob-lucci": { arc: 3, name: { en: "Leopard Human-Beast form", fr: "Forme hybride du Léopard" }, fx: "aura", c1: "255, 200, 60", c2: "60, 30, 0", kanji: "豹", lightning: true },
      king: { arc: 9, name: { en: "Pteranodon", fr: "Ptéranodon" }, fx: "pillar", c1: "255, 110, 30", c2: "30, 6, 20", kanji: "火災" },
      sanji: { arc: 8, name: { en: "Raid Suit · Stealth Black", fr: "Raid Suit · Stealth Black" }, fx: "aura", c1: "255, 120, 40", c2: "255, 40, 40", kanji: "黒足" },
      "charlotte-katakuri": { arc: 8, name: { en: "Future Sight", fr: "Haki de l'observation · Futur" }, fx: "domain", c1: "255, 90, 140", c2: "20, 4, 12", kanji: "見聞色" },
      kaidou: { arc: 9, name: { en: "Azure Dragon", fr: "Dragon azur" }, fx: "pillar", c1: "90, 160, 255", c2: "6, 12, 40", kanji: "龍", lightning: true },
    },
    jujutsukaisen: {
      "satoru-gojo": { arc: 1, name: { en: "Domain Expansion · Infinite Void", fr: "Extension du territoire · Sphère de l'espace infini" }, ...DOMAIN, c1: "90, 170, 255" },
      "ryomen-sukuna": { arc: 5, name: { en: "Domain Expansion · Malevolent Shrine", fr: "Extension du territoire · Temple maléfique" }, ...DOMAIN, c1: "255, 50, 60" },
      "yuta-okkotsu": { arc: 6, name: { en: "Rika, fully manifested", fr: "Rika, pleinement manifestée" }, fx: "pillar", c1: "255, 70, 120", c2: "20, 0, 10", kanji: "里香" },
      mahito: { arc: 1, name: { en: "Domain Expansion · Self-Embodiment of Perfection", fr: "Extension du territoire · Incarnation parfaite" }, ...DOMAIN, c1: "255, 120, 60" },
      jogo: { arc: 1, name: { en: "Domain Expansion · Coffin of the Iron Mountain", fr: "Extension du territoire · Cercueil de la montagne de fer" }, ...DOMAIN, c1: "255, 110, 40" },
      "megumi-fushiguro": { arc: 3, name: { en: "Domain Expansion · Chimera Shadow Garden", fr: "Extension du territoire · Jardin des ombres chimériques" }, ...DOMAIN, c1: "70, 140, 255" },
      "maki-zen-in": { arc: 6, name: { en: "Heavenly Restriction awakened", fr: "Entrave céleste éveillée" }, fx: "aura", c1: "120, 255, 160", c2: "255, 255, 255", kanji: "天与呪縛" },
      "kinji-hakari": { arc: 6, name: { en: "Jackpot", fr: "Jackpot" }, fx: "aura", c1: "90, 230, 255", c2: "255, 90, 200", kanji: "大当たり", lightning: true },
      "hiromi-higuruma": { arc: 6, name: { en: "Domain Expansion · Deadly Sentencing", fr: "Extension du territoire · Jugement mortel" }, ...DOMAIN, c1: "60, 230, 170" },
    },
    hunterxhunter: {
      "killua-zoldyck": { arc: 5, name: { en: "Godspeed", fr: "Vitesse divine" }, fx: "aura", c1: "140, 220, 255", c2: "255, 255, 255", kanji: "神速", lightning: true },
      // Gon's vow against Pitou: he forces his body to the age it would need to win.
      "gon-freecss": { arc: 5, name: { en: "Adult Gon", fr: "Gon adulte" }, fx: "pillar", c1: "255, 170, 50", c2: "30, 10, 0", kanji: "制約", lightning: true },
      kurapika: { arc: 3, name: { en: "Emperor Time", fr: "Emperor Time" }, fx: "domain", c1: "255, 40, 50", c2: "20, 0, 0", kanji: "絶対時間" },
      "biscuit-krueger": { arc: 4, name: { en: "True Form", fr: "Vraie forme" }, fx: "aura", c1: "255, 140, 200", c2: "255, 230, 120", kanji: "真体" },
      "isaac-netero": { arc: 5, name: { en: "Hundred-Type Guanyin Bodhisattva", fr: "Bodhisattva aux cent mille mains" }, fx: "pillar", c1: "255, 210, 80", c2: "40, 20, 0", kanji: "百式観音" },
      neferpitou: { arc: 5, name: { en: "Terpsichora", fr: "Terpsichora" }, fx: "aura", c1: "255, 50, 70", c2: "60, 0, 20", kanji: "黒子舞想", lightning: true },
      menthuthuyoupi: { arc: 5, name: { en: "Rage form", fr: "Forme de rage" }, fx: "pillar", c1: "255, 60, 60", c2: "30, 0, 0", kanji: "憤怒" },
    },
    blackclover: {
      asta: { arc: 5, name: { en: "Black Asta", fr: "Asta noir" }, fx: "aura", c1: "40, 40, 50", c2: "255, 40, 40", kanji: "悪魔", lightning: true },
      yuno: { arc: 7, name: { en: "Spirit Dive", fr: "Spirit Dive" }, fx: "aura", c1: "120, 255, 170", c2: "255, 255, 255", kanji: "精霊同化" },
      "fuegoleon-vermillion": { arc: 7, name: { en: "Salamander", fr: "Salamandre" }, fx: "pillar", c1: "255, 120, 30", c2: "50, 10, 0", kanji: "火精" },
      "noelle-silva": { arc: 9, name: { en: "Valkyrie Dress", fr: "Armure de Valkyrie" }, fx: "aura", c1: "110, 220, 255", c2: "200, 255, 240", kanji: "戦乙女" },
      "dante-zogratis": { arc: 9, name: { en: "Devil Union", fr: "Fusion démoniaque" }, fx: "domain", c1: "160, 60, 255", c2: "10, 0, 20", kanji: "悪魔同化" },
    },
    // Each shifter transforms only from the arc where the anime reveals who they are.
    attackontitan: {
      "eren-yeager": { arc: 0, name: { en: "Attack Titan", fr: "Titan Assaillant" }, ...TITAN },
      "annie-leonhart": { arc: 1, name: { en: "Female Titan", fr: "Titan Féminin" }, ...TITAN, c1: "170, 220, 255" },
      "reiner-braun": { arc: 2, name: { en: "Armored Titan", fr: "Titan Cuirassé" }, ...TITAN, c1: "255, 230, 170" },
      "bertholdt-hoover": { arc: 2, name: { en: "Colossal Titan", fr: "Titan Colossal" }, ...TITAN, c1: "255, 90, 40" },
      ymir: { arc: 2, name: { en: "Jaw Titan", fr: "Titan Mâchoire" }, ...TITAN },
      "armin-arlert": { arc: 4, name: { en: "Colossal Titan", fr: "Titan Colossal" }, ...TITAN, c1: "255, 90, 40" },
      "zeke-yeager": { arc: 4, name: { en: "Beast Titan", fr: "Titan Bestial" }, ...TITAN, c1: "230, 200, 140" },
      "porco-galliard": { arc: 5, name: { en: "Jaw Titan", fr: "Titan Mâchoire" }, ...TITAN },
      "pieck-finger": { arc: 5, name: { en: "Cart Titan", fr: "Titan Charrette" }, ...TITAN },
      "lara-tybur": { arc: 5, name: { en: "War Hammer Titan", fr: "Titan Marteau d'armes" }, ...TITAN, c1: "255, 240, 220" },
      "falco-grice": { arc: 6, name: { en: "Jaw Titan", fr: "Titan Mâchoire" }, ...TITAN },
      "rod-reiss": { arc: 3, name: { en: "Abnormal Titan", fr: "Titan déviant" }, ...TITAN, c1: "255, 150, 80" },
      "dina-fritz": { arc: 4, name: { en: "Smiling Titan", fr: "Titan souriant" }, ...TITAN, c1: "255, 200, 150" },
      "grisha-yeager": { arc: 4, name: { en: "Attack Titan", fr: "Titan Assaillant" }, ...TITAN },
      "marcel-galliard": { arc: 4, name: { en: "Jaw Titan", fr: "Titan Mâchoire" }, ...TITAN },
      "ymir-fritz": { arc: 6, name: { en: "Founding Titan", fr: "Titan Originel" }, ...TITAN, c1: "255, 240, 200" },
    },
  };
})();
