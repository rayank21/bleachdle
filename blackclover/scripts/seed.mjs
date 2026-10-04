// Source list for Blackcloverdle. Species, gender, age, hair, magic attribute, squad, country, portrait and
// first arc are scraped from the Black Clover wiki (scrape.mjs). Values set here override what is scraped.
//
// Arc indexes (anime episodes):
//   0 Magic Knights Entrance (1–13) · 1 Dungeon Exploration (14–19) · 2 Royal Capital Assault (20–27)
//   3 Eye of the Midnight Sun Encounter (28–39) · 4 Seabed Temple (40–50) · 5 Witches' Forest (51–65)
//   6 Royal Knights (66–95) · 7 Elf Reincarnation (96–157) · 8 Heart Kingdom Joint Struggle (158–167)
//   9 Spade Kingdom Raid (168–, and the manga after the anime)
//
// Any field may be { arcIndex: value } to stay spoiler-free.

export const seed = [
  // ── Black Bulls ──
  { wiki: "Asta" },
  { wiki: "Yami Sukehiro" },
  { wiki: "Noelle Silva" },
  { wiki: "Luck Voltia" },
  { wiki: "Magna Swing", hair: ["Blonde"] },
  { wiki: "Vanessa Enoteca" },
  { wiki: "Finral Roulacase" },
  { wiki: "Gauche Adlai" },
  { wiki: "Gordon Agrippa" },
  { wiki: "Grey" },
  { wiki: "Charmy Pappitson", race: { 0: ["Human"], 7: ["Dwarf"] } },
  { wiki: "Zora Ideale" },
  { wiki: "Henry Legolant" },
  // Her human form is a reveal of the Elf arc: she only shows up from there.
  { wiki: "Secre Swallowtail", arc: 7 },
  { wiki: "Nacht Faust" },
  { wiki: "Sekke Bronzazza" },
  // Asta's devil is only named in the Elf arc.
  { wiki: "Liebe", arc: 7 },

  // ── Golden Dawn ──
  { wiki: "Yuno", name: "Yuno", country: ["Clover Kingdom"] },
  { wiki: "William Vangeance" },
  { wiki: "Klaus Lunettes" },
  { wiki: "Mimosa Vermillion", hair: ["Red"] },
  { wiki: "Alecdora Sandler" },
  { wiki: "Langris Vaude" },

  // ── Other squads ──
  { wiki: "Nozel Silva" },
  { wiki: "Solid Silva" },
  { wiki: "Nebra Silva" },
  { wiki: "Fuegoleon Vermillion", hair: ["Red"] },
  { wiki: "Leopold Vermillion", hair: ["Red"] },
  { wiki: "Mereoleona Vermillion", hair: ["Red"] },
  { wiki: "Charlotte Roselei" },
  { wiki: "Sol Marron" },
  { wiki: "Jack the Ripper" },
  { wiki: "Dorothy Unsworth" },
  { wiki: "Kahono", country: ["Clover Kingdom"] },
  { wiki: "Kiato", country: ["Clover Kingdom"] },
  { wiki: "Kirsch Vermillion", hair: ["Red"] },
  { wiki: "Kaiser Granvorka" },
  { wiki: "Rill Boismortier", hair: ["Blue"] },
  { wiki: "Rebecca Scarlet" },

  // ── Clover Kingdom ──
  { wiki: "Julius Novachrono", aff: ["Wizard King"] },
  { wiki: "Marx Francois" },
  { wiki: "Damnatio Kira" },
  { wiki: "Lily Aquaria", name: "Sister Lily" },

  // ── Eye of the Midnight Sun (their leader is shown as human until the Elf arc) ──
  { wiki: "Patry", name: "Patry", race: { 0: ["Human"], 7: ["Elf"] } },
  { wiki: "Rhya", race: { 0: ["Human"], 7: ["Elf"] } },
  { wiki: "Fana", race: { 0: ["Human"], 7: ["Elf"] } },
  { wiki: "Vetto", race: { 0: ["Human"], 7: ["Elf"] } },
  { wiki: "Sally" },
  { wiki: "Valtos" },
  { wiki: "Catherine" },

  // ── Diamond Kingdom ──
  { wiki: "Mars" },
  { wiki: "Lotus Whomalt" },
  { wiki: "Fanzell Kruger" },
  { wiki: "Ladros" },
  { wiki: "Rades Spirito" },
  { wiki: "Moris Libardirt" },

  // ── Witches, elves, Heart Kingdom ──
  { wiki: "Witch Queen", name: "Witch Queen", race: ["Witch"] },
  { wiki: "Licht" },
  { wiki: "Lemiel Silvamillion Clover", name: "Lumiere Silvamillion Clover", race: ["Human"], aff: ["Wizard King"] },
  { wiki: "Tetia", name: "Tetia", race: ["Elf"] },
  { wiki: "Lolopechka" },
  { wiki: "Gadjah" },

  // ── Spade Kingdom and the devils ──
  { wiki: "Dante Zogratis" },
  { wiki: "Vanica Zogratis" },
  { wiki: "Zenon Zogratis", race: ["Human"] },
  { wiki: "Lucius Zogratis", arc: 9 },
  { wiki: "Morgen Faust" },
  { wiki: "Zagred" },
  { wiki: "Megicula" },
  { wiki: "Lucifero", arc: 9 },
];
