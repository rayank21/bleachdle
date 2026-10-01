// Interface text shared by every category (English / Français).
window.DLE_UI = {
  en: {
    menu: "Menu",
    menuHome: "All games",
    menuArc: "Change arc",
    menuStats: "Statistics",
    menuHelp: "How to play",
    helpTitle: "How to play",
    categories: "Games",
    statsShort: "Stats",
    streak: "Current streak",
    wins: "Wins",
    subDaily: "Guess today's character",
    subEndless: "Guess as many as you can",
    modeDaily: "Daily",
    modeEndless: "Endless",
    watchedUpTo: "Watched up to:",
    placeholder: (ex) => `Enter character name (e.g. ${ex})`,
    guess: "Guess",
    clear: "Clear",
    close: "Close",
    noMatch: "No character found",
    guesses: (n) => `${n} guess${n === 1 ? "" : "es"}`,
    hintPortrait: "Blurred portrait",
    hintIn: (n) => `in ${n} guess${n === 1 ? "" : "es"}`,
    hintReveal: "Click to reveal",
    startsWith: (l) => `Name starts with “${l}”`,
    arcTitle: "How far have you watched?",
    arcIntro: "Only characters introduced up to this arc can be picked, and their details stay spoiler-free.",
    language: "Language",
    start: "Start playing",
    save: "Save",
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
    correct: "Correct",
    partial: "Partially correct",
    wrong: "Wrong",
    help: (g) => `
      <p>Guess the hidden <strong>${g.anime}</strong> character. Each guess shows how close you are.</p>
      <div class="legend">
        <div><span class="sw sw-correct"></span> Correct</div>
        <div><span class="sw sw-partial"></span> Partially correct</div>
        <div><span class="sw sw-wrong"></span> Wrong</div>
      </div>
      <ul class="help-list">
        <li><strong>▲ / ▼</strong>: the answer is higher / lower (${g.arrowCols}).</li>
        <li><strong>Partial</strong>: shares at least one value with the answer.</li>
        <li><strong>${g.arcCol}</strong>: the anime arc where the character first appears.</li>
        <li><strong>Hints</strong> unlock after a few guesses: ${g.hintNames}.</li>
        <li><strong>Daily</strong>: one character a day, the same for everyone who picked the same arc. <strong>Endless</strong>: play as much as you like.</li>
        <li>Set <strong>how far you've watched</strong> so no future characters or reveals slip through.</li>
      </ul>`,
    crew: "Crew Roll",
    crewTitle: "Crew Roll",
    crewDesc: "Roll random characters, place them in your crew and aim for the best score.",
    homeTitle: "Pick your anime",
    homeSub: "Daily character guessing games, spoiler-free for where you are in the anime.",
    play: "Play",
    homeFooter: "Fan-made games, not affiliated with the authors, publishers or studios. Character images from the Fandom wikis.",
  },
  fr: {
    menu: "Menu",
    menuHome: "Tous les jeux",
    menuArc: "Changer d'arc",
    menuStats: "Statistiques",
    menuHelp: "Comment jouer",
    helpTitle: "Comment jouer",
    categories: "Jeux",
    statsShort: "Stats",
    streak: "Série en cours",
    wins: "Victoires",
    subDaily: "Devine le personnage du jour",
    subEndless: "Enchaîne les personnages",
    modeDaily: "Du jour",
    modeEndless: "Infini",
    watchedUpTo: "Vu jusqu'à :",
    placeholder: (ex) => `Nom du perso (ex : ${ex})`,
    guess: "Deviner",
    clear: "Effacer",
    close: "Fermer",
    noMatch: "Aucun personnage trouvé",
    guesses: (n) => `${n} essai${n > 1 ? "s" : ""}`,
    hintPortrait: "Portrait flouté",
    hintIn: (n) => `dans ${n} essai${n > 1 ? "s" : ""}`,
    hintReveal: "Clique pour révéler",
    startsWith: (l) => `Le nom commence par « ${l} »`,
    arcTitle: "Jusqu'où as-tu regardé ?",
    arcIntro: "Seuls les personnages apparus jusqu'à cet arc peuvent tomber, et leurs infos restent sans spoiler.",
    language: "Langue",
    start: "Commencer",
    save: "Enregistrer",
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
    correct: "Correct",
    partial: "Partiel",
    wrong: "Incorrect",
    help: (g) => `
      <p>Devine le personnage de <strong>${g.anime}</strong> caché. Chaque essai te dit si tu chauffes.</p>
      <div class="legend">
        <div><span class="sw sw-correct"></span> Correct</div>
        <div><span class="sw sw-partial"></span> Partiellement correct</div>
        <div><span class="sw sw-wrong"></span> Incorrect</div>
      </div>
      <ul class="help-list">
        <li><strong>▲ / ▼</strong> : la réponse est plus haute / plus basse (${g.arrowCols}).</li>
        <li><strong>Partiel</strong> : au moins une valeur en commun avec la réponse.</li>
        <li><strong>${g.arcCol}</strong> : l'arc de l'anime où le personnage apparaît pour la première fois.</li>
        <li><strong>Indices</strong> débloqués après quelques essais : ${g.hintNames}.</li>
        <li><strong>Du jour</strong> : un personnage par jour, le même pour tous ceux qui ont choisi le même arc. <strong>Infini</strong> : joue autant que tu veux.</li>
        <li>Indique <strong>jusqu'où tu as regardé</strong> pour éviter tout spoiler.</li>
      </ul>`,
    crew: "Équipage",
    crewTitle: "Roll ton équipage",
    crewDesc: "Tire des persos au hasard, place-les dans ton équipage et vise le meilleur score.",
    homeTitle: "Choisis ton anime",
    homeSub: "Des jeux pour deviner un personnage par jour, sans spoiler selon où tu en es dans l'anime.",
    play: "Jouer",
    homeFooter: "Jeux de fan, sans lien avec les auteurs, éditeurs ou studios. Images des personnages : wikis Fandom.",
  },
};

// Language is shared by every category.
window.DLE_LANG = {
  get() {
    try {
      const v = localStorage.getItem("dle:lang");
      if (v === "en" || v === "fr") return v;
    } catch {}
    return (navigator.language || "").startsWith("fr") ? "fr" : "en";
  },
  set(lang) {
    try {
      localStorage.setItem("dle:lang", lang);
    } catch {}
  },
};
