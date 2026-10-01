// Bleachdle — translations (English / Français)
window.BLEACHDLE_ARCS = [
  { en: "Agent of the Shinigami", fr: "Shinigami remplaçant", eps: "1–20" },
  { en: "Soul Society", fr: "Soul Society", eps: "21–63" },
  { en: "Arrancar", fr: "Arrancar", eps: "110–143" },
  { en: "Hueco Mundo", fr: "Hueco Mundo", eps: "144–167 · 190–205" },
  { en: "Fake Karakura Town", fr: "Fausse Karakura", eps: "206–229 · 266–316" },
  { en: "Lost Agent", fr: "Fullbring", eps: "343–366" },
  { en: "Thousand-Year Blood War", fr: "Guerre Sanglante de Mille Ans", eps: "TYBW" },
];

window.BLEACHDLE_I18N = {
  en: {
    menu: "Menu",
    menuArc: "Change arc",
    menuStats: "Statistics",
    menuHelp: "How to play",
    helpTitle: "How to play",
    statsShort: "Stats",
    streak: "Current streak",
    wins: "Wins",
    subDaily: "Guess today's character",
    subEndless: "Guess as many as you can",
    modeDaily: "Daily",
    modeEndless: "Endless",
    watchedUpTo: "Watched up to:",
    placeholder: "Enter character name (e.g. Urahara)",
    guess: "Guess",
    clear: "Clear",
    close: "Close",
    noMatch: "No character found",
    guesses: (n) => `${n} guess${n === 1 ? "" : "es"}`,
    cols: { name: "Name", gender: "Gender", race: "Race", age: "Age", hair: "Hair Color", height: "Height", residence: "Residence", arc: "First Arc" },
    hintAffiliation: "Affiliation",
    hintPortrait: "Blurred portrait",
    hintIn: (n) => `in ${n} guess${n === 1 ? "" : "es"}`,
    hintReveal: "Click to reveal",
    arcTitle: "How far have you watched?",
    arcIntro: "Only characters introduced up to this arc can be picked, and their details stay spoiler-free.",
    language: "Language",
    start: "Start playing",
    save: "Save",
    arcLabel: "Arc",
    eps: "Ep.",
    chars: "characters",
    winTitle: "You found it!",
    winLine: (n) => `Found in <strong>${n}</strong> guess${n === 1 ? "" : "es"}`,
    giveUpTitle: "The character was…",
    nextIn: "Next character in",
    nextChar: "Next character",
    giveUp: "Reveal answer",
    share: "Copy result",
    copied: "Result copied!",
    weeklyTitle: "Weekly Average",
    weeklyEmpty: "No games played this week yet",
    weeklyAvg: (a) => `Average: <strong>${a}</strong> guesses per win`,
    days: ["S", "M", "T", "W", "T", "F", "S"],
    statsPlayed: "Played",
    statsWins: "Wins",
    statsStreak: "Current streak",
    statsMax: "Best streak",
    statsDist: "Guess distribution",
    footer: "Bleachdle is a fan-made game and is not affiliated with Tite Kubo, Shueisha or Studio Pierrot. Character images from the Bleach Wiki (Fandom).",
    helpHtml: `
      <p>Guess the hidden <strong>Bleach</strong> character. Each guess reveals how close you are.</p>
      <div class="legend">
        <div><span class="sw sw-correct"></span> Correct</div>
        <div><span class="sw sw-partial"></span> Partially correct</div>
        <div><span class="sw sw-wrong"></span> Wrong</div>
      </div>
      <ul class="help-list">
        <li><strong>▲ / ▼</strong> — the answer is higher / lower (age, height, first arc).</li>
        <li><strong>Partial</strong> — shares at least one value (e.g. race <em>Human, Fullbringer</em> vs <em>Human</em>).</li>
        <li><strong>First Arc</strong> — the anime arc where the character first appears.</li>
        <li><strong>Hints</strong> unlock after a few guesses: affiliation, then a blurred portrait.</li>
        <li><strong>Daily</strong> — one character a day, the same for everyone who picked the same arc. <strong>Endless</strong> — play as much as you like.</li>
        <li>Set <strong>how far you've watched</strong> so no future characters or reveals slip through.</li>
      </ul>`,
  },
  fr: {
    menu: "Menu",
    menuArc: "Changer d'arc",
    menuStats: "Statistiques",
    menuHelp: "Comment jouer",
    helpTitle: "Comment jouer",
    statsShort: "Stats",
    streak: "Série en cours",
    wins: "Victoires",
    subDaily: "Devine le personnage du jour",
    subEndless: "Enchaîne les personnages",
    modeDaily: "Du jour",
    modeEndless: "Infini",
    watchedUpTo: "Vu jusqu'à :",
    placeholder: "Nom du perso (ex : Urahara)",
    guess: "Deviner",
    clear: "Effacer",
    close: "Fermer",
    noMatch: "Aucun personnage trouvé",
    guesses: (n) => `${n} essai${n > 1 ? "s" : ""}`,
    cols: { name: "Nom", gender: "Genre", race: "Race", age: "Âge", hair: "Cheveux", height: "Taille", residence: "Résidence", arc: "1er arc" },
    hintAffiliation: "Affiliation",
    hintPortrait: "Portrait flouté",
    hintIn: (n) => `dans ${n} essai${n > 1 ? "s" : ""}`,
    hintReveal: "Clique pour révéler",
    arcTitle: "Jusqu'où as-tu regardé ?",
    arcIntro: "Seuls les personnages apparus jusqu'à cet arc peuvent tomber, et leurs infos restent sans spoiler.",
    language: "Langue",
    start: "Commencer",
    save: "Enregistrer",
    arcLabel: "Arc",
    eps: "Ép.",
    chars: "persos",
    winTitle: "Bien joué !",
    winLine: (n) => `Trouvé en <strong>${n}</strong> essai${n > 1 ? "s" : ""}`,
    giveUpTitle: "Le personnage était…",
    nextIn: "Prochain personnage dans",
    nextChar: "Personnage suivant",
    giveUp: "Voir la réponse",
    share: "Copier le résultat",
    copied: "Résultat copié !",
    weeklyTitle: "Moyenne de la semaine",
    weeklyEmpty: "Aucune partie jouée cette semaine",
    weeklyAvg: (a) => `Moyenne : <strong>${a}</strong> essais par victoire`,
    days: ["D", "L", "M", "M", "J", "V", "S"],
    statsPlayed: "Parties",
    statsWins: "Victoires",
    statsStreak: "Série en cours",
    statsMax: "Meilleure série",
    statsDist: "Répartition des essais",
    footer: "Bleachdle est un jeu de fan, sans lien avec Tite Kubo, Shueisha ou le Studio Pierrot. Images des personnages : Bleach Wiki (Fandom).",
    helpHtml: `
      <p>Devine le personnage de <strong>Bleach</strong> caché. Chaque essai te dit si tu chauffes.</p>
      <div class="legend">
        <div><span class="sw sw-correct"></span> Correct</div>
        <div><span class="sw sw-partial"></span> Partiellement correct</div>
        <div><span class="sw sw-wrong"></span> Incorrect</div>
      </div>
      <ul class="help-list">
        <li><strong>▲ / ▼</strong> — la réponse est plus haute / plus basse (âge, taille, 1er arc).</li>
        <li><strong>Partiel</strong> — au moins une valeur en commun (ex : race <em>Humain, Fullbringer</em> contre <em>Humain</em>).</li>
        <li><strong>1er arc</strong> — l'arc de l'anime où le personnage apparaît pour la première fois.</li>
        <li><strong>Indices</strong> débloqués après quelques essais : l'affiliation, puis un portrait flouté.</li>
        <li><strong>Du jour</strong> — un personnage par jour, le même pour tous ceux qui ont choisi le même arc. <strong>Infini</strong> — joue autant que tu veux.</li>
        <li>Indique <strong>jusqu'où tu as regardé</strong> pour éviter tout spoiler.</li>
      </ul>`,
  },
};

// Translations of attribute values. English is the key; missing entries fall back to it.
window.BLEACHDLE_VALUES = {
  fr: {
    M: "Homme", F: "Femme",
    Human: "Humain", Soul: "Âme (Plus)", "Mod Soul": "Âme modifiée", Hybrid: "Hybride",
    Black: "Noir", Brown: "Brun", Orange: "Roux", Blonde: "Blond", Red: "Rouge", White: "Blanc",
    Blue: "Bleu", Pink: "Rose", Purple: "Violet", Green: "Vert", Bald: "Chauve",
    "Karakura Town": "Karakura", "Soul King Palace": "Palais du Roi des Âmes",
    Unknown: "Inconnu",
    "Substitute Shinigami": "Shinigami remplaçant", "Karakura High School": "Lycée de Karakura",
    "Kurosaki Clinic": "Clinique Kurosaki", "Urahara Shop": "Boutique Urahara", "Shihōin Clan": "Clan Shihōin",
    "Kurosaki Family": "Famille Kurosaki", "Karakura Superheroes": "Super-héros de Karakura", "Shiba Clan": "Clan Shiba",
    "Aizen's Army": "Armée d'Aizen", "Karakura General Hospital": "Hôpital général de Karakura",
    "Former Espada": "Ancienne Espada", "Harribel's Fracción": "Fracción de Harribel",
    "Barragan's Fracción": "Fracción de Barragan", "Zero Division": "Division Zéro",
  },
  en: { M: "Male", F: "Female", Soul: "Soul (Plus)" },
};
