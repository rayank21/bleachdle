// Patch notes, one entry per update (date and time), newest first, shown a few per page. The window opens by
// itself only for updates the player has not seen yet, showing just those; the header button shows them all.
(() => {
  "use strict";

  // at: local date and time of the update. type: new | improved | balance | fix.
  // game: a category id (shows its logo), "crew" (Crew Roll) or nothing.
  const LOG = [
    {
      at: "2026-10-09T23:30",
      title: { en: "Vinlanddle: Vinland Saga joins the site", fr: "Vinlanddle : Vinland Saga arrive sur le site" },
      items: [
        { type: "new", game: "vinlandsaga", en: "Vinlanddle: guess the Vinland Saga character of the day among 51 (Thorfinn, Askeladd, Thorkell, Canute, Einar…), by gender, hair, people, affiliation, occupation and first arc, from Thors's prologue to Vinland. Classic, blur and description modes, endless and online games.", fr: "Vinlanddle : devine le perso Vinland Saga du jour parmi 51 (Thorfinn, Askeladd, Thorkell, Canute, Einar…), par genre, cheveux, peuple, affiliation, métier et 1er arc, du prologue de Thors jusqu'au Vinland. Modes classique, flou et description, partie infinie et en ligne." },
        { type: "new", game: "crew", en: "Crew Roll Vinland Saga: a leader, three warriors, a Viking band, a farmhand, an explorer, a healer, a strategist and a wildcard; Vinland Saga booster packs and cards.", fr: "Roll ton équipage Vinland Saga : un chef, trois guerriers, une bande de Vikings, un paysan, un explorateur, un soigneur, un stratège et un joker ; boosters et cartes Vinland Saga." },
      ],
    },
    {
      at: "2026-10-09T22:00",
      title: { en: "Visored and Fullbringers", fr: "Visored et Fullbringers" },
      items: [
        { type: "balance", game: "bleach", en: "Crew Roll Bleach: as a Visored, Hirako rises to 10, Muguruma to 9 and Hachigen to 8; as a human, Ginjo is now worth 10 and Tsukishima 9.", fr: "Roll ton équipage Bleach : en Visored, Hirako passe à 10, Muguruma à 9 et Hachigen à 8 ; en humain, Ginjô vaut maintenant 10 et Tsukishima 9." },
      ],
    },
    {
      at: "2026-10-09T21:00",
      title: { en: "The Sunny fixed online", fr: "Le Sunny réparé en ligne" },
      items: [
        { type: "fix", game: "onepiece", en: "Crew Roll One Piece and Pokémon: the medallions now scale with the ship (or the ball), so the roles keep their spots instead of piling up in online games, where your board is narrower, and on phones.", fr: "Roll ton équipage One Piece et Pokémon : les médaillons suivent la taille du bateau (ou de la Poké Ball) : les rôles restent à leur place au lieu de s'entasser en ligne, où ton plateau est plus étroit, et sur téléphone." },
      ],
    },
    {
      at: "2026-10-09T20:00",
      title: { en: "The real Sunny, a Poké Ball, living showcases", fr: "Le vrai Sunny, une Poké Ball, des vitrines animées" },
      items: [
        { type: "improved", game: "onepiece", en: "Crew Roll One Piece: the crew now stands on the real Thousand Sunny from the anime, each one a medallion on their spot: the captain on the lion's head, the first mate in the crow's nest, the navigator by her cabin, the cook at the galley, the doctor, the archaeologist and the shipwright on the hull.", fr: "Roll ton équipage One Piece : l'équipage est maintenant sur le vrai Thousand Sunny de l'anime, chacun en médaillon à sa place : le capitaine sur la tête du lion, le second dans la vigie, la navigatrice près de sa cabine, le cuisinier à la cuisine, le médecin, l'archéologue et le charpentier sur la coque." },
        { type: "new", game: "pokemon", en: "Crew Roll Pokémon: the team is set on a Poké Ball, the starter on its button.", fr: "Roll ton équipage Pokémon : l'équipe est placée sur une Poké Ball, le starter sur son bouton." },
        { type: "fix", en: "The neon and aura of transformed cards keep moving in showcases, even on computers in light mode.", fr: "Le néon et l'aura des cartes transformées bougent dans les vitrines, même sur les ordinateurs en mode léger." },
      ],
    },
    {
      at: "2026-10-09T19:00",
      title: { en: "The new pictures everywhere", fr: "Les nouvelles images partout" },
      items: [
        { type: "fix", game: "crew", en: "The new pictures of All Might, All For One, Black Frieza, Cosmic Garou, Shanks and Garp now show everywhere: Crew Roll, the transformation, cards, showcases and avatars (browsers kept showing the old ones).", fr: "Les nouvelles images d'All Might, All For One, Black Freezer, Garou cosmique, Shanks et Garp s'affichent partout : Roll ton équipage, la transformation, les cartes, les vitrines et les avatars (les navigateurs gardaient les anciennes)." },
      ],
    },
    {
      at: "2026-10-09T18:00",
      title: { en: "A court for Haikyuu, the Sunny for One Piece", fr: "Un terrain pour Haikyuu, le Sunny pour One Piece" },
      items: [
        { type: "new", game: "haikyuu", en: "Crew Roll Haikyuu!!: the team stands on a volleyball court (the net, the 3 m line): spikers and middles at the net, setter, captain and middle behind, the libero at the back, the coach and the wildcard on the bench.", fr: "Roll ton équipage Haikyuu!! : l'équipe est sur un terrain de volley (le filet, la ligne des 3 m) : attaquants et central au filet, passeur, capitaine et central derrière, le libéro au fond, le coach et le joker sur le banc." },
        { type: "new", game: "onepiece", en: "Crew Roll One Piece: the crew boards the Thousand Sunny: the captain on the lion's head, the first mate in the crow's nest, the navigator at the helm, the doctor, the archaeologist and the shipwright below deck.", fr: "Roll ton équipage One Piece : l'équipage monte sur le Thousand Sunny : le capitaine sur la tête du lion, le second dans la vigie, le navigateur à la barre, le médecin, l'archéologue et le charpentier sous le pont." },
      ],
    },
    {
      at: "2026-10-09T16:00",
      title: { en: "Pokédle, turn-by-turn online games and new transformation pictures", fr: "Pokédle, parties en ligne au tour par tour et nouvelles images de transformation" },
      items: [
        { type: "new", game: "pokemon", en: "Pokédle: guess one of the 1025 Pokémon (French names in French), with generations instead of arcs. Types, colour, evolution, category, height, weight and generation; blurred picture and Pokédex modes; Pokémon also join Crew Roll (starter, legendary, types, healer, strategist), boosters and cards.", fr: "Pokédle : devine l'un des 1025 Pokémon (noms en français), avec les générations à la place des arcs. Types, couleur, évolution, catégorie, taille, poids et génération ; modes image floue et Pokédex ; les Pokémon rejoignent aussi Roll ton équipage (starter, légendaire, types, soigneur, stratège), les boosters et les cartes." },
        { type: "new", en: "Online games (classic, blur and description) are now turn by turn: one guess each on a shared board, 40 s per turn, whoever finds it wins. The host can still pick the free race.", fr: "Les parties en ligne (classique, flou et description) se jouent maintenant au tour par tour : un essai chacun sur un plateau commun, 40 s par tour, celui qui trouve gagne. L'hôte peut toujours choisir la course libre." },
        { type: "new", game: "crew", en: "Showcase: choose for each card whether it shows its transformation (animated) or its normal picture.", fr: "Vitrine : choisis pour chaque carte si elle montre sa transformation (animée) ou son image normale." },
        { type: "improved", game: "crew", en: "Every card with a transformation gets a moving neon frame and a luminous aura in its transformation's colours.", fr: "Chaque carte avec une transformation a un cadre néon et une aura lumineuse qui bougent, aux couleurs de sa transformation." },
        { type: "improved", game: "crew", en: "New pictures: Garp's Galaxy Impact, Shanks's Divine Departure, Cosmic Garou, All Might, All For One, Black Frieza, and Ichigo's Mugetsu form for his showcase card.", fr: "Nouvelles images : Galaxy Impact de Garp, Kamusari de Shanks, Garou cosmique, All Might, All For One, Black Freezer, et la forme Mugetsu d'Ichigo pour sa carte en vitrine." },
        { type: "new", game: "slime", en: "Granbell Rozzo joins Slimedle (Human 8, Strategist 8, Wildcard 8).", fr: "Granbell Rozzo rejoint Slimedle (Humain 8, Stratège 8, Joker 8)." },
        { type: "balance", game: "crew", en: "Bleach: Quincy Gremmy 8, Lille Barro 9, Liltotto 6. Slime: strategists Testarossa 9, Clayman 8, Kurobe 10 as engineer.", fr: "Bleach : Quincy Gremmy 8, Lille Barro 9, Liltotto 6. Slime : stratèges Testarossa 9, Clayman 8, Kurobe 10 en ingénieur." },
        { type: "fix", en: "Lille Barro has blond hair (Bleachdle), Yu Haibara black hair (Jujutsudle).", fr: "Lille Barro a les cheveux blonds (Bleachdle), Yu Haibara les cheveux noirs (Jujutsudle)." },
      ],
    },
    {
      at: "2026-10-08T09:00",
      title: { en: "Living cards, crew sharing and new duel rules", fr: "Cartes vivantes, partage d'équipage et nouvelles règles de duel" },
      items: [
        { type: "new", game: "crew", en: "Epic cards glow with neon (a light runs round their frame), legendary ones burn with spiritual pressure (rising flames, sparks, a golden glow), secret ones in every colour.", fr: "Les cartes épiques brillent au néon (une lumière fait le tour du cadre), les légendaires brûlent de pression spirituelle (flammes qui montent, étincelles, halo doré), les secrètes de toutes les couleurs." },
        { type: "new", game: "crew", en: "Share your crew: a picture of your team (rank, score, every member) to send, save, copy as a link anyone can open, or post in the chat.", fr: "Partage ton équipage : une image de ton équipe (rang, score, chaque membre) à envoyer, enregistrer, copier en lien que tout le monde peut ouvrir, ou poster dans le chat." },
        { type: "new", en: "The live chat announces by itself when a player unlocks an achievement or beats a record (best crew, best streak).", fr: "Le chat en direct annonce tout seul quand un joueur débloque un succès ou bat un record (meilleur équipage, meilleure série)." },
        { type: "new", game: "crew", en: "27 legendary characters of the newer anime get a transformation or their signature move (Giyu, Muichiro, Sanemi, Mirio, Gigantomachia, Kuroo, Tendo, Burns, Testarossa, Velzard, Igris, Bellion…).", fr: "27 persos légendaires des nouveaux animes ont une transformation ou leur attaque signature (Giyu, Muichiro, Sanemi, Mirio, Gigantomachia, Kuroo, Tendo, Burns, Testarossa, Velzard, Igris, Bellion…)." },
        { type: "improved", game: "crew", en: "Every transformation now has its own picture, different from the portrait (Shanks, Garp, All Might, All For One, Mihawk, Whis, Gyomei, Muzan and 26 more), centred on the character.", fr: "Chaque transformation a maintenant sa propre image, différente du portrait (Shanks, Garp, All Might, All For One, Mihawk, Whis, Gyomei, Muzan et 26 autres), centrée sur le perso." },
        { type: "improved", game: "bleach", en: "Yamamoto: his Bankai picture now shows Zanka no Tachi, centred.", fr: "Yamamoto : son image de Bankai montre maintenant Zanka no Tachi, bien centrée." },
        { type: "balance", game: "crew", en: "Booster battles: battle packs drop about twice as many legendaries and three times as many transformations, and every card is turned over one by one in the middle of the screen.", fr: "Batailles de boosters : les boosters de bataille donnent environ deux fois plus de légendaires et trois fois plus de transformations, et chaque carte se retourne une par une au centre de l'écran." },
        { type: "balance", game: "crew", en: "New deck battle rules: decks of 35 power at most, +6 combo for two cards of the same anime in a row, the underdog gets the gap back, and the last round is worth 2 points.", fr: "Nouvelles règles des batailles de decks : decks de 35 de puissance au plus, combo +6 pour deux cartes du même anime d'affilée, l'outsider récupère l'écart, et la dernière manche vaut 2 points." },
      ],
    },
    {
      at: "2026-10-08T05:00",
      title: { en: "20 new characters and a big balance pass", fr: "20 nouveaux persos et un gros rééquilibrage" },
      items: [
        { type: "improved", game: "crew", en: "Cards (inventory, boosters, duels, showcase) now always show the transformation picture of a character who has one.", fr: "Les cartes (inventaire, boosters, duels, vitrine) montrent toujours l'image de transformation d'un perso qui en a une." },
        { type: "new", game: "dragonball", en: "Granolah joins Dragonballdle.", fr: "Granolah rejoint Dragonballdle." },
        { type: "new", game: "myheroacademia", en: "New: Thirteen, Kyudai Garaki, Moonfish and Mustard.", fr: "Nouveaux : Thirteen, Kyudai Garaki, Moonfish et Mustard." },
        { type: "new", game: "haikyuu", en: "New liberos (Yamagata, Komi, Akagi, Sakunami) and coaches (Ikkei Ukai, Washijo, Nekomata).", fr: "Nouveaux libéros (Yamagata, Komi, Akagi, Sakunami) et coachs (Ikkei Ukai, Washijo, Nekomata)." },
        { type: "new", game: "slime", en: "Velzard, the White Ice Dragon.", fr: "Velzard, le Dragon de glace blanche." },
        { type: "new", game: "onepunchman", en: "New: Bomb, Bakuzan, Choze and Dr. Kuseno.", fr: "Nouveaux : Bomb, Bakuzan, Choze et le Dr Kuseno." },
        { type: "new", game: "fireforce", en: "New captains: Gustav Honda (Company 2), Soichiro Hague (Company 4) and Kayoko Huang (Company 6).", fr: "Nouveaux capitaines : Gustav Honda (2e brigade), Soichiro Hague (4e brigade) et Kayoko Huang (6e brigade)." },
        { type: "balance", game: "crew", en: "My Hero Academia: healers Garaki 7, Thirteen 6, Tsuyu 6, Momo 5; strategists Momo 9, Bakugo 6, Lady Nagant 5, Mirio 4; villains Mr. Compress 5, Moonfish and Mustard 4; Pro Heroes Hawks 9, Sir Nighteye 5; Tokoyami 8 in Class 1-A.", fr: "My Hero Academia : soigneurs Garaki 7, Thirteen 6, Tsuyu 6, Momo 5 ; stratèges Momo 9, Bakugo 6, Lady Nagant 5, Mirio 4 ; vilains Mr. Compress 5, Moonfish et Mustard 4 ; héros pro Hawks 9, Sir Nighteye 5 ; Tokoyami 8 en Classe 1-A." },
        { type: "balance", game: "crew", en: "Haikyuu: Terushima 7 as captain, Shirabu 5 as setter, Kunimi and Hanamaki 5 as spikers; middles Yamaguchi 4, Kindaichi 5, Lev 6, Aone 7; liberos Nishinoya 10, Yamagata 7, Komi and Akagi 5, Sakunami 4; coaches Ikkei Ukai 9, Washijo and Nekomata 6.", fr: "Haikyuu : Terushima 7 en capitaine, Shirabu 5 en passeur, Kunimi et Hanamaki 5 en attaquant ; centraux Yamaguchi 4, Kindaichi 5, Lev 6, Aone 7 ; libéros Nishinoya 10, Yamagata 7, Komi et Akagi 5, Sakunami 4 ; coachs Ikkei Ukai 9, Washijo et Nekomata 6." },
        { type: "balance", game: "crew", en: "Slime: healers Shuna 10, Luminous 9, Shizu 5; humans Chloe 10, Hinata 8, Shizu 7; dragons Velzard 10, Veldora and Milim 9, Diablo and Guy 8, Testarossa 7, Ultima and Carrera 6; Demon Lords Rimuru 10, Guy and Milim 9, Leon and Dagruel 8, Carrion 7, Frey 6, Clayman 5; Tempest Benimaru 8, Ranga 7, Geld 6, Gabiru 5.", fr: "Slime : soigneurs Shuna 10, Luminous 9, Shizu 5 ; humains Chloé 10, Hinata 8, Shizu 7 ; dragons Velzard 10, Veldora et Milim 9, Diablo et Guy 8, Testarossa 7, Ultima et Carrera 6 ; seigneurs démons Rimuru 10, Guy et Milim 9, Léon et Dagruel 8, Carrion 7, Frey 6, Clayman 5 ; Tempest Benimaru 8, Ranga 7, Geld 6, Gabiru 5." },
        { type: "balance", game: "crew", en: "One Punch Man: Stinger 4, Snek 3, Vaccine Man 5; free fighters Bomb 9, Bakuzan 6, Choze 5; healers Kuseno 10, Genus 9, Metal Knight 7, Mumen Rider 4; strategists Atomic Samurai 5, Sitch 4.", fr: "One Punch Man : Stinger 4, Snek 3, Vaccine Man 5 ; combattants libres Bomb 9, Bakuzan 6, Choze 5 ; soigneurs Kuseno 10, Genus 9, Metal Knight 7, Mumen Rider 4 ; stratèges Atomic Samurai 5, Sitch 4." },
        { type: "balance", game: "crew", en: "Fire Force: captains Obi 10, Hibana 9, Honda and Huang 6, Hague 5; Lisa 5 in Company 8; Assault 4, Inca 5, Haumea 8, Nataku 7; second generation Karim 6, Hinawa 5. Companies 2 and 6 count as other companies.", fr: "Fire Force : capitaines Obi 10, Hibana 9, Honda et Huang 6, Hague 5 ; Lisa 5 en 8e brigade ; Assault 4, Inca 5, Haumea 8, Nataku 7 ; 2e génération Karim 6, Hinawa 5. Les 2e et 6e brigades comptent comme autres brigades." },
      ],
    },
    {
      at: "2026-10-08T04:25",
      title: { en: "Bleach: Gerard, As Nodt and Kukaku", fr: "Bleach : Gerard, As Nodt et Kukaku" },
      items: [
        { type: "balance", game: "crew", en: "Bleach team: Gerard Valkyrie 9 as Quincy, As Nodt 7, Kukaku Shiba 5 in the Human / Wandering Soul slot.", fr: "Équipe Bleach : Gerard Valkyrie 9 en Quincy, As Nodt 7, Kukaku Shiba 5 dans la place Humain / Âme errante." },
      ],
    },
    {
      at: "2026-10-08T04:10",
      title: { en: "Bleach: Pernida and Gerard, two Quincy slots", fr: "Bleach : Pernida et Gerard, deux places Quincy" },
      items: [
        { type: "new", game: "bleach", en: "Two new characters from Yhwach's royal guard: Pernida Parnkgjas and Gerard Valkyrie (108 in all).", fr: "Deux nouveaux persos de la garde royale de Yhwach : Pernida Parnkgjas et Gerard Valkyrie (108 en tout)." },
        { type: "balance", game: "crew", en: "Bleach team: one Shinigami slot becomes a second Quincy slot. Quincy: Uryu 10, Gerard Valkyrie 10, Pernida 9. Momo Hinamori healer 6, Yukio engineer 8.", fr: "Équipe Bleach : une place Shinigami devient une deuxième place Quincy. Quincy : Uryû 10, Gerard Valkyrie 10, Pernida 9. Momo Hinamori soigneuse 6, Yukio ingénieur 8." },
      ],
    },
    {
      at: "2026-10-08T03:50",
      title: { en: "My Hero Academia: Star and Stripe at 10", fr: "My Hero Academia : Star and Stripe à 10" },
      items: [
        { type: "balance", game: "crew", en: "My Hero Academia team: Star and Stripe goes up to 10 in power and 9 as strategist; All Might strategist 9, Fumikage Tokoyami strategist 6.", fr: "Équipe My Hero Academia : Star and Stripe passe à 10 en puissance et 9 en stratège ; All Might stratège 9, Fumikage Tokoyami stratège 6." },
      ],
    },
    {
      at: "2026-10-08T03:30",
      title: { en: "Private messages, voice chat, away status and a connection test", fr: "Messages privés, chat vocal, mode absent et test de connexion" },
      items: [
        { type: "new", en: "The chat has three tabs: General, Private and Voice. Write to your friends in private (they get the messages even if they were away, with an unread count), from the chat or the Message button in your friends list.", fr: "Le chat a trois onglets : Général, Privé et Vocal. Écris à tes amis en privé (ils reçoivent les messages même s'ils étaient absents, avec le nombre de non-lus), depuis le chat ou le bouton Message de ta liste d'amis." },
        { type: "new", en: "Voice messages (up to 30 s) in the general chat and in private: tap the microphone, talk, send.", fr: "Messages vocaux (30 s max) dans le chat général et en privé : appuie sur le micro, parle, envoie." },
        { type: "new", en: "Live voice chat: join the general voice channel, or your room's during an online game. Mute yourself, see who is talking; a small bubble stays above the chat button.", fr: "Chat vocal en direct : rejoins le vocal général, ou celui de ta salle pendant une partie en ligne. Coupe ton micro, vois qui parle ; une petite bulle reste au-dessus du bouton du chat." },
        { type: "new", en: "Away mode: the moon next to your name sets you away (others see 💤); you also go away by yourself after 5 minutes elsewhere.", fr: "Mode absent : la lune à côté de ton pseudo te met absent (les autres voient 💤) ; tu passes aussi absent tout seul après 5 minutes ailleurs." },
        { type: "new", en: "A Connection button in the online bar tests everything at once (internet, relays, server, direct link, players found), with Reconnect and the full diagnostic.", fr: "Un bouton Connexion dans la barre du haut teste tout d'un coup (internet, relais, serveur, connexion directe, joueurs trouvés), avec Reconnecter et le diagnostic complet." },
        { type: "new", en: "18 new achievements: boosters, card duels, trades, copies, showcase, friends, chat, voice, collection and all anime.", fr: "18 nouveaux succès : boosters, duels de cartes, échanges, exemplaires, vitrine, amis, chat, vocal, collection et tous les animes." },
        { type: "improved", game: "crew", en: "Crew Roll takes the colours of the anime you pick (buttons, frames, the draw), and every panel gets a touch of the anime's colour.", fr: "Roll ton équipage prend les couleurs de l'anime choisi (boutons, cadres, tirage), et chaque panneau a une touche de la couleur de l'anime." },
        { type: "improved", game: "crew", en: "After opening boosters, open more right away: ×1, ×2, ×5, ×10 or all.", fr: "Après une ouverture de boosters, rouvre directement : ×1, ×2, ×5, ×10 ou tout." },
        { type: "fix", en: "New cards and boosters no longer vanish for a while from the inventory after a page change (they wait for the server to confirm them).", fr: "Les nouvelles cartes et les boosters ne disparaissent plus un moment de l'inventaire après un changement de page (ils attendent que le serveur les confirme)." },
        { type: "fix", en: "Phones: the leaderboard loads more reliably (retries, a Try again button), the friends window no longer jumps while you scroll, the connection comes back on its own after the phone sleeps, and the modes no longer overlap the arc in Crew Roll.", fr: "Téléphone : le classement se charge mieux (nouveaux essais, bouton Réessayer), la fenêtre d'amis ne saute plus pendant que tu défiles, la connexion revient toute seule après une mise en veille, et les modes ne chevauchent plus l'arc dans Roll ton équipage." },
        { type: "improved", en: "Smoother pages: the online bar and the chat are no longer rebuilt every time a player announces themselves.", fr: "Pages plus fluides : la barre en ligne et le chat ne sont plus reconstruits à chaque signal d'un joueur." },
      ],
    },
    {
      at: "2026-10-08T02:30",
      title: { en: "Solo Leveling: new characters, new forms, rebalanced team", fr: "Solo Leveling : nouveaux persos, transformations et équipe rééquilibrée" },
      items: [
        { type: "new", game: "sololeveling", en: "6 new characters: the healers Han Semi, Jung Yerim and Akari Shimizu, the tank Son Kihoon, Baran the King of Demons and the Ant Queen (62 in all).", fr: "6 nouveaux persos : les soigneuses Han Semi, Jung Yerim et Akari Shimizu, le tank Son Kihoon, Baran le roi des démons et la Reine des fourmis (62 en tout)." },
        { type: "new", game: "crew", en: "Solo Leveling transformations: Baek Yoonho's White Tiger form, Sung Il-hwan with the Rulers' power, and Jinwoo becoming the Shadow Monarch in the webtoon arc. Jinwoo's Arise now shows him from the front.", fr: "Transformations Solo Leveling : la forme Tigre blanc de Baek Yoonho, Sung Il-hwan avec le pouvoir des Souverains, et Jinwoo qui devient le Monarque des Ombres dans l'arc du webtoon. L'Arise de Jinwoo le montre maintenant de face." },
        { type: "balance", game: "crew", en: "Solo Leveling team: one Shadow soldier slot becomes a second Monster / Monarch slot. More healers with higher ratings (Min Byung-Gyu 10, Akari, Jinwoo and Beru 9, Han Semi, Jung Yerim and Lee Joohee 8); Jinwoo strategist 8; Igris 9. S-rank hunters and monsters are spread out more evenly.", fr: "Équipe Solo Leveling : un emplacement Soldat de l'ombre devient un deuxième Monstre / Monarque. Plus de soigneurs, mieux notés (Min Byung-Gyu 10, Akari, Jinwoo et Beru 9, Han Semi, Jung Yerim et Lee Joohee 8) ; Jinwoo stratège 8 ; Igris 9. Les notes des chasseurs de rang S et des monstres sont mieux réparties." },
      ],
    },
    {
      at: "2026-10-08T01:45",
      title: { en: "New card pictures for Ichigo and Yoruichi", fr: "Nouvelles images de carte pour Ichigo et Yoruichi" },
      items: [
        { type: "improved", game: "bleach", en: "Ichigo's card, showcase and profile picture now show him as a Vasto Lorde, and Yoruichi's show her Shunkō · Raijin Senkei against Askin.", fr: "La carte, la vitrine et la photo de profil d'Ichigo le montrent maintenant en Vasto Lorde, et celles de Yoruichi avec son Shunkô · Raijin Senkei contre Askin." },
      ],
    },
    {
      at: "2026-10-08T01:20",
      title: { en: "Pack battles: open your pack in turn", fr: "Bataille de boosters : chacun son tour" },
      items: [
        { type: "improved", game: "crew", en: "In pack battles, the packs are no longer opened all at once: each player in turn tears their pack open (tap Open, or it opens by itself after 15 s) and everyone watches its cards turn over one by one. The first opener changes each round.", fr: "En bataille de boosters, les boosters ne s'ouvrent plus tous d'un coup : chaque joueur déchire le sien à son tour (bouton Ouvrir, ou tout seul au bout de 15 s) et tout le monde voit ses cartes se retourner une par une. Celui qui ouvre en premier change à chaque manche." },
      ],
    },
    {
      at: "2026-10-08T00:50",
      title: { en: "Pack battles up to 8 players, in teams too", fr: "Batailles de boosters jusqu'à 8, en équipes aussi" },
      items: [
        { type: "new", game: "crew", en: "Pack battles are no longer 1v1 only: 2 to 8 players each open a pack, three times, and the strongest pack wins the round. From 3 players, the host can make two teams; the team whose packs add up to more wins.", fr: "Les batailles de boosters ne sont plus seulement en 1v1 : de 2 à 8 joueurs ouvrent chacun un booster, trois fois, et le plus fort gagne la manche. À partir de 3 joueurs, l'hôte peut faire deux équipes ; l'équipe dont les boosters cumulent le plus gagne." },
      ],
    },
    {
      at: "2026-10-08T00:20",
      title: { en: "Deck battles up to 8 players, in teams too", fr: "Batailles de decks jusqu'à 8, en équipes aussi" },
      items: [
        { type: "new", game: "crew", en: "Deck battles now take 2 to 8 players: everyone plays a card each round and the strongest wins it. From 3 players, the host can split the room into two teams; the team with the larger total wins the round.", fr: "Les batailles de decks se jouent maintenant de 2 à 8 joueurs : chacun joue une carte par manche et la plus forte l'emporte. À partir de 3 joueurs, l'hôte peut faire deux équipes ; l'équipe au plus gros total gagne la manche." },
      ],
    },
    {
      at: "2026-10-07T23:59",
      title: { en: "Solo Leveling arrives", fr: "Solo Leveling débarque" },
      items: [
        { type: "new", game: "sololeveling", en: "Sololevelingdle: guess the Solo Leveling character of the day among 56 (hunters, shadows, monsters and Monarchs), by race, hunter rank, class, affiliation, country and first arc, spoiler-free up to where you are.", fr: "Sololevelingdle : devine le perso Solo Leveling du jour parmi 56 (chasseurs, ombres, monstres et Monarques), par race, rang de chasseur, classe, affiliation, pays et premier arc, sans spoiler selon où tu en es." },
        { type: "new", game: "crew", en: "Crew Roll and boosters: Solo Leveling with its own team (S-rank hunters, hunters, shadow soldiers, monster or Monarch, healer, strategist) and transformations for Jinwoo (Arise, with its clip), Beru, Ashborn and Antares.", fr: "Roll ton équipage et boosters : Solo Leveling avec son équipe (chasseurs de rang S, chasseurs, soldats de l'ombre, monstre ou Monarque, soigneur, stratège) et des transformations pour Jinwoo (Arise, avec son extrait), Beru, Ashborn et Antares." },
        { type: "improved", en: "Demon Slayer, My Hero Academia, Haikyuu!!, Fire Force, Slime and One Punch Man get their own accent colours back.", fr: "Demon Slayer, My Hero Academia, Haikyuu!!, Fire Force, Slime et One Punch Man retrouvent leurs couleurs à eux." },
      ],
    },
    {
      at: "2026-10-07T23:45",
      title: { en: "Cards: inventory, trades and 1v1 duels", fr: "Cartes : inventaire, échanges et duels 1v1" },
      items: [
        { type: "new", game: "crew", en: "A new Cards tab in Crew Roll. Inventory: all your booster cards with their duplicates (×2, ×3…). Duplicates are now counted.", fr: "Un nouvel onglet Cartes dans Roll ton équipage. Inventaire : toutes tes cartes de boosters avec leurs doublons (×2, ×3…). Les doublons sont maintenant comptés." },
        { type: "new", game: "crew", en: "Trades with your friends: offer one of your cards for one of theirs (or as a gift). They accept or decline from their Cards tab; a duplicate leaves first, so your collection keeps the card.", fr: "Échanges avec tes amis : propose une de tes cartes contre une des siennes (ou en cadeau). Il accepte ou refuse depuis son onglet Cartes ; un doublon part en premier, ta collection garde la carte." },
        { type: "new", game: "crew", en: "1v1 card duels online: Pack battle (both open a pack of the same anime, three rounds, pure luck) and Deck battle (5 cards of your collection, one per round: power, transformation bonus and a roll of the dice). The winner gets a booster.", fr: "Duels de cartes 1v1 en ligne : Bataille de boosters (vous ouvrez chacun un booster du même anime, en trois manches, que la chance) et Bataille de decks (5 cartes de ta collection, une par manche : puissance, bonus de transformation et un lancer de dé). Le gagnant reçoit un booster." },
        { type: "new", game: "crew", en: "Open 2, 5, 10 or all your boosters at once; your stock shows out of its maximum (10).", fr: "Ouvre 2, 5, 10 ou tous tes boosters d'un coup ; ton stock s'affiche sur son maximum (10)." },
        { type: "improved", en: "A character with a transformation now shows it on its cards, in the showcase and as a profile picture.", fr: "Un perso qui a une transformation l'affiche maintenant sur ses cartes, dans la vitrine et en photo de profil." },
        { type: "improved", en: "Team leaderboard: each team's win rate and its record against every team it met (wins, draws, losses).", fr: "Classement des équipes : le pourcentage de victoires de chaque équipe et son bilan contre chaque équipe affrontée (victoires, nuls, défaites)." },
      ],
    },
    {
      at: "2026-10-07T23:25",
      title: { en: "Yoruichi and Ginjo transform", fr: "Yoruichi et Ginjô se transforment" },
      items: [
        { type: "new", game: "crew", en: "Bleach: Yoruichi gets her Shunkō (with its Rebirth of Souls clip), which becomes Raijin Senkei in the Thousand-Year Blood War; Ginjo gets his Fullbring powered by Ichigo's stolen power.", fr: "Bleach : Yoruichi a son Shunkô (avec son extrait de Rebirth of Souls), qui devient le Raijin Senkei dans la Guerre Sanglante de Mille Ans ; Ginjô a son Fullbring renforcé par le pouvoir volé à Ichigo." },
        { type: "balance", game: "crew", en: "Kiyone Kotetsu is worth 6 as a healer; Black Clover: Sally is worth 9 as a strategist / engineer.", fr: "Kiyone Kotetsu vaut 6 en soigneuse ; Black Clover : Sally vaut 9 en stratège / ingénieur." },
      ],
    },
    {
      at: "2026-10-07T17:40",
      title: { en: "Unzip your boosters, a fresh collection for everyone", fr: "Ouvre le zip de tes boosters, collection remise à zéro" },
      items: [
        { type: "improved", game: "crew", en: "Opening a booster: one click unzips it along the dotted line, then the cards come out one by one and turn over by themselves (Skip to speed up).", fr: "Ouvrir un booster : un clic ouvre le zip le long des pointillés, puis les cartes sortent une par une et se retournent toutes seules (Passer pour accélérer)." },
        { type: "balance", en: "Your collection now only holds the cards you get from boosters: Crew Roll draws no longer count. Every collection starts from zero, with 3 boosters to get going.", fr: "Ta collection ne contient plus que les cartes obtenues en booster : les tirages de Roll ton équipage ne comptent plus. Toutes les collections repartent de zéro, avec 3 boosters pour démarrer." },
      ],
    },
    {
      at: "2026-10-07T17:00",
      title: { en: "Boosters, chat reactions and your showcase", fr: "Boosters, réactions au chat et ta vitrine" },
      items: [
        { type: "new", game: "crew", en: "Boosters! A new Crew Roll tab with a pack for every anime: tear it open, flip 5 cards (the last one Epic or better) and watch the rare ones explode. New cards join your collection. Commons, Epics, Legendaries… and Secret cards, shown in their transformation.", fr: "Les boosters ! Un nouvel onglet dans Roll ton équipage avec un booster pour chaque anime : déchire-le, retourne 5 cartes (la dernière au moins Épique) et regarde les rares exploser. Les nouvelles cartes rejoignent ta collection. Communes, Épiques, Légendaires… et des cartes Secrètes, dans leur transformation." },
        { type: "new", en: "Earning boosters: 3 as a welcome gift, 1 a day, 1 per win in any game and 1 per crew built (10 at most in stock).", fr: "Pour gagner des boosters : 3 en cadeau de bienvenue, 1 par jour, 1 par victoire dans n'importe quel jeu et 1 par équipage construit (10 maximum en stock)." },
        { type: "new", en: "Chat reactions: react to a message with an emoji, and send big reactions (⚡ button) that fly across everyone's screen.", fr: "Réactions au chat : réagis à un message avec un émoji, et envoie des grosses réactions (bouton ⚡) qui traversent l'écran de tout le monde." },
        { type: "new", en: "Profile showcase: pick your 3 favourite cards (★ in the Crew Roll index or after a booster). Click a name in the online bar or in your friends to see their profile and showcase.", fr: "Vitrine de profil : choisis tes 3 cartes préférées (★ dans l'Index de Roll ton équipage ou après un booster). Clique sur un pseudo dans la barre en ligne ou dans tes amis pour voir son profil et sa vitrine." },
      ],
    },
    {
      at: "2026-10-07T15:30",
      title: { en: "Transformations like in the anime", fr: "Des transformations comme dans l'anime" },
      items: [
        { type: "new", game: "crew", en: "Transformations now play like an anime: cinema bars, impact frames, speed lines, a shockwave, the kanji slamming down, and sound on every beat.", fr: "Les transformations se jouent comme dans un anime : bandes cinéma, impact frames, lignes de vitesse, onde de choc, le kanji qui s'écrase, et du son à chaque temps fort." },
        { type: "new", game: "crew", en: "15 new transformations with their anime clip: Tanjiro, Zenitsu, Rengoku, Akaza, Bakugo, Todoroki, Dabi, Hinata, Nishinoya, Arthur, Joker, Benimaru, Genos, Bang, Orochi.", fr: "15 nouvelles transformations avec leur extrait de l'anime : Tanjiro, Zenitsu, Rengoku, Akaza, Bakugo, Todoroki, Dabi, Hinata, Nishinoya, Arthur, Joker, Benimaru, Genos, Bang, Orochi." },
        { type: "improved", game: "crew", en: "Clips for the transformations that had none in the newest anime: Gyomei, Muzan, Doma, Shigaraki, Kageyama, Oikawa, Bokuto, Ushijima, Atsumu, Shinra, Benimaru, Sho, Dragon, Veldora, Milim, Guy, Luminous.", fr: "Des extraits pour les transformations qui n'en avaient pas dans les derniers animes : Gyomei, Muzan, Doma, Shigaraki, Kageyama, Oikawa, Bokuto, Ushijima, Atsumu, Shinra, Benimaru, Shô, Dragon, Veldora, Milim, Guy, Luminous." },
        { type: "new", game: "onepiece", en: "From Egghead, Rob Lucci awakens: his transformation opens on his clash with Luffy in Gear 5.", fr: "À partir d'Egghead, Rob Lucci s'éveille : sa transformation s'ouvre sur son choc avec Luffy en Gear 5." },
      ],
    },
    {
      at: "2026-10-07T14:55",
      title: { en: "The top 3 shine, drop rates in the index", fr: "Le top 3 brille, taux de drop dans l'index" },
      items: [
        { type: "new", en: "The top 3 of the leaderboard (best place between best crews and most wins) get a shining name everywhere: online bar, chat, lobbies, matches and the leaderboard. 1st: a flowing rainbow with a crown and sparkles; 2nd: ice and silver; 3rd: embers and gold.", fr: "Le top 3 du classement (meilleure place entre meilleurs équipages et plus de victoires) a un pseudo qui brille partout : barre en ligne, chat, salons, parties et classement. 1er : un arc-en-ciel qui défile avec une couronne et des étincelles ; 2e : glace et argent ; 3e : braise et or." },
        { type: "new", game: "crew", en: "Crew Roll index: the drop rate of each rarity (legendary, epic, common) for the anime at your arc.", fr: "Index de Roll ton équipage : le taux de drop de chaque rareté (légendaire, épique, commun) pour l'anime, à ton arc." },
      ],
    },
    {
      at: "2026-10-07T14:40",
      title: { en: "Rare badges and a lighter site", fr: "Badges rares et site plus léger" },
      items: [
        { type: "new", en: "Your rarest achievements (gold ones: full collection, season podium, 1,000 rolls, 250 wins, a streak of 15, an S-rank crew) now show next to your name in the online bar and the chat, for everyone to see.", fr: "Tes succès les plus rares (les dorés : collection complète, podium de saison, 1 000 rolls, 250 victoires, série de 15, équipage de rang S) s'affichent maintenant à côté de ton pseudo dans la barre en ligne et le chat, aux yeux de tous." },
        { type: "improved", en: "Links to the site shared on Discord, WhatsApp or elsewhere now show a preview picture for each anime.", fr: "Les liens du site partagés sur Discord, WhatsApp ou ailleurs affichent maintenant une image d'aperçu pour chaque anime." },
        { type: "improved", en: "Faster pages: the logos and the small portraits (suggestions, tried names, background, profiles) weigh 3 to 10 times less.", fr: "Pages plus rapides : les logos et les petits portraits (suggestions, persos essayés, fond, profils) pèsent 3 à 10 fois moins lourd." },
      ],
    },
    {
      at: "2026-10-07T13:00",
      title: { en: "Online Crew Roll: teams, reloads and late joins", fr: "Roll ton équipage en ligne : équipes, F5 et arrivées en cours de partie" },
      items: [
        { type: "new", game: "crew", en: "Team vs team: each team now fills a single board together, its players taking turns, and the host names the teams. Team results go on a new team leaderboard.", fr: "Équipe contre équipe : chaque équipe remplit maintenant un seul plateau ensemble, ses joueurs jouent chacun leur tour, et l'hôte choisit les noms d'équipe. Les résultats vont dans un nouveau classement des équipes." },
        { type: "new", game: "crew", en: "Reloading the page (F5) during a match puts you back in it, even as the host.", fr: "Recharger la page (F5) pendant une partie te remet dedans, même si tu es l'hôte." },
        { type: "new", game: "crew", en: "Join a match already under way, from your friends list or with the room's code: you roll several times in a row until you've caught up, then play in turn like everyone.", fr: "Rejoins une partie déjà en cours, depuis ta liste d'amis ou avec le code de la salle : tu enchaînes les tirages jusqu'à rattraper les autres, puis tu joues à ton tour comme tout le monde." },
        { type: "fix", game: "crew", en: "Fixed the match freezing on the wrong player's turn (a tab in the background, a lost message): everyone now stays on the same turn.", fr: "Corrigé : la partie qui se bloquait sur le tour d'un autre joueur (onglet en arrière-plan, message perdu) ; tout le monde reste maintenant sur le même tour." },
        { type: "new", game: "hunterxhunter", en: "Hunter × Hunter: Maha Zoldyck joins the game (Crew Roll: power 10, strategist 8).", fr: "Hunter × Hunter : Maha Zoldyck rejoint le jeu (Roll ton équipage : puissance 10, stratège 8)." },
      ],
    },
    {
      at: "2026-10-07T11:10",
      title: { en: "Finding each other faster, dates in the chat", fr: "On se trouve plus vite, les dates dans le chat" },
      items: [
        { type: "fix", en: "Online: players who can't connect directly now find each other in about 15 seconds instead of more than a minute.", fr: "En ligne : les joueurs qui ne peuvent pas se connecter directement se trouvent maintenant en 15 secondes environ, au lieu de plus d'une minute." },
        { type: "improved", en: "Online: twice as many relays to find other players, and when your connection blocks all of them (ad blocker, antivirus, network filter), the online bar says so and what to do.", fr: "En ligne : deux fois plus de relais pour trouver les autres joueurs, et si ta connexion les bloque tous (bloqueur de pub, antivirus, filtre réseau), la barre « en ligne » le dit et explique quoi faire." },
        { type: "new", en: "Chat: each day starts with its date (Today, Yesterday, Sun 4 Oct…), and hovering a time shows the full date.", fr: "Chat : chaque jour commence par sa date (Aujourd'hui, Hier, dim. 4 oct.…), et l'heure affiche la date complète au survol." },
      ],
    },
    {
      at: "2026-10-07T11:00",
      title: { en: "Play together even when the connection fails", fr: "Jouer ensemble même quand la connexion bloque" },
      items: [
        { type: "fix", en: "Online: when two players can't connect directly (same box, different networks, strict Wi-Fi), the game now goes through a relay instead: you see each other, chat and play anyway. It can take up to 20 seconds to find each other the first time.", fr: "En ligne : quand deux joueurs n'arrivent pas à se connecter directement (même box, réseaux différents, Wi-Fi strict), le jeu passe maintenant par un relais : vous vous voyez, vous chattez et vous jouez quand même. Il faut parfois jusqu'à 20 secondes pour se trouver la première fois." },
        { type: "new", game: "fireforce", en: "Crew Roll Fire Force: a new 2nd generation slot, for the pyrokinetics who bend flames (Maki, Hibana, Hinawa, Karim, Haumea, Benimaru).", fr: "Roll ton équipage Fire Force : nouvelle place 2e génération, pour les pyrokinésistes qui manipulent les flammes (Maki, Hibana, Hinawa, Karim, Haumea, Benimaru)." },
        { type: "balance", game: "haikyuu", en: "Crew Roll Haikyuu!!: the Miya twins are worth 10 at their own position, Atsumu as setter and Osamu as spiker.", fr: "Roll ton équipage Haikyuu!! : les jumeaux Miya valent 10 à leur poste, Atsumu passeur et Osamu attaquant." },
        { type: "balance", game: "crew", en: "Crew Roll: ratings rebalanced for the six new anime (fewer 10s, fairer gaps): Upper Moons by rank, pro heroes spread out, Watchdog Man and Amai Mask up, Clayman down, Yuuki and Chloe up…", fr: "Roll ton équipage : notes rééquilibrées pour les six nouveaux animes (moins de 10, écarts plus justes) : Lunes supérieures selon leur rang, héros pros mieux répartis, Watchdog Man et Amai Mask en hausse, Clayman en baisse, Yuuki et Chloe en hausse…" },
      ],
    },
    {
      at: "2026-10-07T00:30",
      title: { en: "Sharper, smoother clips and a lighter background", fr: "Des extraits plus nets et plus fluides, un fond plus léger" },
      items: [
        { type: "improved", game: "crew", en: "Every transformation clip was remastered: upscaled with an anime-trained AI (up to 4× sharper) and interpolated to 60 frames per second, so they no longer look blurry or choppy full screen.", fr: "Tous les extraits de transformation ont été remasterisés : agrandis par une IA spécialisée anime (jusqu'à 4× plus nets) et interpolés à 60 images par seconde, ils ne sont plus flous ni saccadés en plein écran." },
        { type: "improved", en: "The animated background is now moved entirely by the graphics card: nothing is redrawn at each frame, so scrolling and the rest of the page stay smooth, even on weak computers, and the particles are crisp on high-resolution screens.", fr: "Le fond animé est désormais entièrement géré par la carte graphique : plus rien n'est redessiné à chaque image, le défilement et le reste de la page restent fluides, même sur un PC faible, et les particules sont nettes sur les écrans haute résolution." },
      ],
    },
    {
      at: "2026-10-06T21:42",
      title: { en: "Six new anime", fr: "Six nouveaux animes" },
      items: [
        { type: "new", en: "Six new games, each with its own colours and animated background: Demonslayerdle (Demon Slayer, 48 characters), Mhadle (My Hero Academia, 59), Haikyudle (Haikyuu!!, 50, with real heights and jersey numbers), Fireforcedle (Fire Force, 29), Slimedle (That Time I Got Reincarnated as a Slime, 46) and Onepunchdle (One Punch Man, 43). Classic, blur and description modes, spoiler-free by arc like the others.", fr: "Six nouveaux jeux, chacun avec ses couleurs et son fond animé : Demonslayerdle (Demon Slayer, 48 persos), Mhadle (My Hero Academia, 59), Haikyudle (Haikyuu!!, 50, avec les vraies tailles et les numéros de maillot), Fireforcedle (Fire Force, 29), Slimedle (Moi, quand je me réincarne en Slime, 46) et Onepunchdle (One Punch Man, 43). Modes classique, flou et description, sans spoiler selon l'arc comme les autres." },
        { type: "new", game: "crew", en: "Crew Roll: the six new anime with their own teams (Hashira and Upper Moons, Class 1-A and villains, a full volleyball team, Company 8, Tempest and the Demon Lords, S-Class heroes and monsters), and a transformation or signature move for every character rated 10, with anime clips for Yoriichi, Kokushibo, Deku, All Might, Endeavor, All For One, Star and Stripe, Rimuru, Diablo, Saitama, Tatsumaki, Garou and Boros.", fr: "Roll ton équipage : les six nouveaux animes avec leurs propres équipes (Piliers et Lunes supérieures, Classe 1-A et vilains, une vraie équipe de volley, la 8e brigade, Tempest et les Seigneurs démons, héros de classe S et monstres), et une transformation ou une attaque phare pour chaque perso noté 10, avec des extraits de l'anime pour Yoriichi, Kokushibo, Deku, All Might, Endeavor, All For One, Star and Stripe, Rimuru, Diablo, Saitama, Tatsumaki, Garou et Boros." },
        { type: "fix", en: "The shine on a correct tile no longer leaves a grey streak next to the grid.", fr: "Le reflet d'une case juste ne laisse plus de trace grise à côté de la grille." },
      ],
    },
    {
      at: "2026-10-06T20:51",
      title: { en: "A living, colourful background for each anime", fr: "Un fond vivant et coloré pour chaque anime" },
      items: [
        { type: "new", en: "Each anime now has its own animated background at your screen's refresh rate: reishi motes and Hell butterflies in Bleach, Konoha leaves in Naruto, ki sparks in Dragon Ball, rolling waves in One Piece, Nen aura in Hunter × Hunter, cursed energy in Jujutsu Kaisen, clovers in Black Clover, Wings of Freedom feathers and ash in Attack on Titan, cherry petals on the home page. It stays light, pauses in hidden tabs and is lighter still on weak machines.", fr: "Chaque anime a maintenant son fond animé à la fréquence de ton écran : particules de reishi et papillons de l'Enfer pour Bleach, feuilles de Konoha pour Naruto, étincelles de ki pour Dragon Ball, vagues pour One Piece, aura de Nen pour Hunter × Hunter, énergie occulte pour Jujutsu Kaisen, trèfles pour Black Clover, plumes des Ailes de la liberté et cendres pour L'Attaque des Titans, pétales de cerisier sur l'accueil. Il reste léger, se met en pause quand l'onglet est caché et s'allège encore sur les machines peu puissantes." },
        { type: "improved", en: "More colour: the wall of characters behind each game takes its anime's colour, the panels get a glow of it and the title card shows the anime's emblem (卍, 忍, 海, 龍…).", fr: "Plus de couleur : le mur de persos derrière chaque jeu prend la couleur de son anime, les panneaux en gardent une lueur et la carte du titre affiche l'emblème de l'anime (卍, 忍, 海, 龍…)." },
      ],
    },
    {
      at: "2026-10-06T20:48",
      title: { en: "Bleach: the newest animated scenes", fr: "Bleach : les scènes animées les plus récentes" },
      items: [
        { type: "improved", game: "crew", en: "Bleach transformations now play the cut-scenes of Rebirth of Souls (2025), the most recent animation: Ichigo, Byakuya, Rukia, Renji, Hitsugaya, Komamura, Mayuri, Aizen, Yamamoto, Uryū, Grimmjow, Starrk, Harribel, Nelliel and Tosen. Zeno's 1999 clip was removed.", fr: "Les transformations de Bleach jouent maintenant les scènes de Rebirth of Souls (2025), l'animation la plus récente : Ichigo, Byakuya, Rukia, Renji, Hitsugaya, Komamura, Mayuri, Aizen, Yamamoto, Uryû, Grimmjow, Starrk, Harribel, Nelliel et Tosen. L'extrait de Zeno de 1999 a été retiré." },
      ],
    },
    {
      at: "2026-10-06T20:40",
      title: { en: "Fusions, 41 new characters and a big rebalance", fr: "Fusions, 41 nouveaux persos et un gros rééquilibrage" },
      items: [
        { type: "new", game: "dragonball", en: "New: Vegito, Gogeta, Kefla, Broly, Paragus, Gine, King Vegeta, Pan, Belmod and Moro.", fr: "Nouveaux : Vegetto, Gogeta, Kefla, Broly, Paragus, Gine, le roi Vegeta, Pan, Belmod et Moro." },
        { type: "new", game: "onepiece", en: "New: Rocks D. Xebec, Admiral Aramaki, Burgess, Vasco Shot, Catarina Devon, Pica, Diamante, Ideo, Don Chinjao, Makino, Dadan, Capone Bege, Hogback, Foxy, Caribou, Kawamatsu, Kanjuro, Ulti, Sasaki, Smoothie, Black Maria, Nezumi, Higuma and Mr. 5.", fr: "Nouveaux : Rocks D. Xebec, l'amiral Aramaki, Burgess, Vasco Shot, Catarina Devon, Pica, Diamante, Ideo, Don Chinjao, Makino, Dadan, Capone Bege, Hogback, Foxy, Caribou, Kawamatsu, Kanjuro, Ulti, Sasaki, Smoothie, Black Maria, Nezumi, Higuma et Mr. 5." },
        { type: "new", game: "onepiece", en: "Classic game: a new Species column (Human, Fish-Man, Mink, Giant, Lunarian…).", fr: "Jeu classique : nouvelle colonne Espèce (Humain, Homme-Poisson, Mink, Géant, Lunarien…)." },
        { type: "new", game: "bleach", en: "New: Dordoni, Cirucci, Gantenbainne, Kiyone Kotetsu, Sentarō Kotsubaki, Zennosuke Kurumadani and Ikumi Unagiya.", fr: "Nouveaux : Dordoni, Cirucci, Gantenbainne, Kiyone Kotetsu, Sentarô Kotsubaki, Zennosuke Kurumadani et Ikumi Unagiya." },
        { type: "new", game: "crew", en: "New transformations: Vegito and Gogeta fused in Super Saiyan Blue, Kefla, Legendary Super Saiyan Broly; Harribel's and Nelliel's Resurrección, Tosen's Grillar Grillo, Rukia's Bankai, the Quincies' Vollständig (Askin, Bambietta, Liltotto, As Nodt, Lille Barro…), Uryū's Letzt Stil, slim Hikifune, Yamamoto in flames; Rocks and Aramaki. Ichigo shows his final Getsuga Tenshō from the Fake Karakura arc and Byakuya his war look in the Blood War.", fr: "Nouvelles transformations : Vegetto et Gogeta fusionnés en Super Saiyan Blue, Kefla, Broly en Super Saiyan légendaire ; la Resurrección de Harribel et de Nelliel, le Grillar Grillo de Tosen, le Bankai de Rukia, les Vollständig des Quincy (Askin, Bambietta, Liltotto, As Nodt, Lille Barro…), le Letzt Stil d'Uryû, Hikifune affinée, Yamamoto en flammes ; Rocks et Aramaki. Ichigo montre son Getsuga Tenshô final dès l'arc de la Fausse Karakura et Byakuya son look de la guerre pendant la Guerre Sanglante." },
        { type: "balance", game: "crew", en: "Dragon Ball: Goku and Vegeta 9, Gohan 6, Goku Black 8 and many more; Arale is worth 10 as an Earthling and as a Cyborg; Beerus and Zamasu swap their God ratings, Jiren and Belmod join the gods; Zamasu, Whis and Vados become strategists.", fr: "Dragon Ball : Goku et Vegeta 9, Gohan 6, Goku Black 8 et bien d'autres ; Arale vaut 10 en Terrien et en Cyborg ; Beerus et Zamasu échangent leur note de dieu, Jiren et Belmod rejoignent les dieux ; Zamasu, Whis et Vados deviennent stratèges." },
        { type: "balance", game: "crew", en: "One Piece: new navigators (Garp, Sengoku, Tsuru), cooks (Makino, Dadan, Vasco Shot, Smoothie), doctors (Hogback 10, Bepo, Aramaki) and archaeologists (Oden 10, Blackbeard 9); Bepo, Moria, Neptune, Paulie, Tom and others lowered, Nami and Crocus raised.", fr: "One Piece : nouveaux navigateurs (Garp, Sengoku, Tsuru), cuisiniers (Makino, Dadan, Vasco Shot, Smoothie), médecins (Hogback 10, Bepo, Aramaki) et archéologues (Oden 10, Barbe Noire 9) ; Bepo, Moria, Neptune, Paulie, Tom et d'autres baissés, Nami et Crocus montés." },
        { type: "balance", game: "crew", en: "Bleach: Ichigo is worth 10 as a Visored and as a Quincy; Starrk 10, Nelliel 8, Yoruichi 8; the human slot becomes Human / Wandering Soul / Fullbringer; new healers and strategists (Ishida father and son, Tsukishima, Ginjo, Ichibe…). Attack on Titan: Ymir 8, Erwin 12 as commander. Black Clover: Licht can be captain.", fr: "Bleach : Ichigo vaut 10 en Visored et en Quincy ; Starrk 10, Nelliel 8, Yoruichi 8 ; la place humaine devient Humain / Âme errante / Fullbringer ; nouveaux soigneurs et stratèges (les Ishida père et fils, Tsukishima, Ginjo, Ichibe…). L'Attaque des Titans : Ymir 8, Erwin 12 en commandant. Black Clover : Licht peut être capitaine." },
        { type: "improved", en: "Blur mode: the portrait starts less blurred.", fr: "Mode flou : le portrait est moins flou au départ." },
        { type: "improved", en: "The \"new version\" banner now only appears when new content is out.", fr: "Le bandeau « nouvelle version » n'apparaît plus que quand du nouveau contenu sort." },
        { type: "fix", en: "Phones: lighter background to stop reload crashes; transformation pictures wait to be loaded and a clip the phone refuses to play no longer freezes.", fr: "Téléphones : fond allégé pour éviter les plantages au rechargement ; les images de transformation attendent d'être chargées et une vidéo que le téléphone refuse de lire ne reste plus figée." },
      ],
    },
    {
      at: "2026-10-06T00:28",
      title: { en: "Smoother everywhere, phone layout, every 10 transforms", fr: "Plus fluide partout, mise en page téléphone, tous les 10 se transforment" },
      items: [
        { type: "improved", en: "Much smoother scrolling, even on old computers: the page background is now painted once instead of being redrawn at every frame, and the constant effects that weighed on the Crew Roll board are gone. Weak machines automatically get a lighter version.", fr: "Défilement bien plus fluide, même sur les vieux PC : le fond des pages est maintenant peint une seule fois au lieu d'être redessiné à chaque image, et les effets permanents qui alourdissaient le plateau de Roll ton équipage sont partis. Les machines peu puissantes passent automatiquement en version allégée." },
        { type: "improved", en: "On phones and tablets, each guess now fits the screen: the portrait on the left and the clues on two lines next to it, each labelled with its column. Nothing is cut off on the right any more.", fr: "Sur téléphone et tablette, chaque essai tient dans l'écran : le portrait à gauche et les indices sur deux lignes à côté, chacun avec le nom de sa colonne. Plus rien n'est coupé à droite." },
        { type: "new", game: "crew", en: "Every character rated 10 now has a transformation or signature move with its cinematic: Yami's Dimension Slash, Yamamoto's Bankai, Shanks' and Roger's Divine Departure, Toji, Todo, Levi, Meruem, Beerus' Hakai, Whitebeard's tremors, Big Mom, Garp, Hashirama's Sage Mode and many more (43 in all), with anime clips for Roger, Zeno, Todo, Toji and Levi.", fr: "Tous les persos notés 10 ont maintenant une transformation ou leur attaque phare, avec sa cinématique : le Fendeur de dimensions de Yami, le Bankai de Yamamoto, le Kamusari de Shanks et de Roger, Toji, Todo, Livaï, Meruem, le Hakai de Beerus, les séismes de Barbe Blanche, Big Mom, Garp, le Mode Ermite de Hashirama et bien d'autres (43 en tout), avec des extraits de l'anime pour Roger, Zeno, Todo, Toji et Livaï." },
        { type: "fix", game: "crew", en: "Index: the \"not drawn yet\" tag no longer covers the transformation tag.", fr: "Index : l'étiquette « pas encore tirée » ne recouvre plus celle de la transformation." },
      ],
    },
    {
      at: "2026-10-05T23:56",
      title: { en: "New cinematics, latest looks, admirals and Espada", fr: "Nouvelles cinématiques, looks récents, amiraux et Espada" },
      items: [
        { type: "improved", game: "crew", en: "Transformation cinematics redone: a deep blue night scene in layers, the character cut out cleanly and uncovered by a diagonal mask, the name in big letters with the form and the group, a slow camera push-in, then diagonal panels that hand back to the site. A Skip button (or Escape) ends it at once.", fr: "Cinématiques de transformation refaites : une scène bleu nuit en plusieurs plans, le perso proprement détouré et dévoilé par un masque diagonal, son nom en grand avec la forme et son groupe, un lent travelling avant, puis des panneaux en diagonale qui ramènent au site. Un bouton Passer (ou Échap) l'arrête tout de suite." },
        { type: "improved", en: "Portraits in their most recent look: Naruto characters in Shippuden, Attack on Titan in the final season.", fr: "Portraits dans leur look le plus récent : les persos de Naruto en Shippuden, ceux de L'Attaque des Titans dans la saison finale." },
        { type: "new", game: "crew", en: "New transformations: the admirals' Logia (Akainu's magma, Aokiji's ice, Kizaru's light), Magellan's Venom Demon and Barragan's Arrogante.", fr: "Nouvelles transformations : les Logia des amiraux (magma d'Akainu, glace d'Aokiji, lumière de Kizaru), le Démon du venin de Magellan et l'Arrogante de Barragan." },
        { type: "new", game: "bleach", en: "Zommari Rureaux joins Bleach (Arrancar 7).", fr: "Zommari Rureaux rejoint Bleach (Arrancar 7)." },
      ],
    },
    {
      at: "2026-10-05T23:40",
      title: { en: "Black Clover devils", fr: "Les démons de Black Clover" },
      items: [
        { type: "new", game: "crew", en: "Crew Roll: every Black Clover devil transforms. Liebe, Zagred, Megicula and Lucifero fully manifest; Vanica, Zenon, Dante and Nacht reach their Devil Union; Asta now unites with Liebe.", fr: "Roll ton équipage : tous les démons de Black Clover se transforment. Liebe, Zagred, Megicula et Lucifero se manifestent entièrement ; Vanica, Zenon, Dante et Nacht passent en union démoniaque ; Asta fusionne maintenant avec Liebe." },
        { type: "balance", game: "onepiece", en: "One Piece: Blackbeard archaeologist 8.", fr: "One Piece : Barbe Noire archéologue 8." },
      ],
    },
    {
      at: "2026-10-05T23:15",
      title: { en: "Transformation cinematics, the Sunny and a new look", fr: "Cinématiques de transformation, le Sunny et un nouveau décor" },
      items: [
        { type: "new", game: "crew", en: "Every transformation in Crew Roll now plays a full-screen cinematic: cinema bars, lightning, sparks and speed lines, a blade of light, then the transformed character slams in with its kanji and name. 20 of them play the real anime scene first (Gear 5, Senbonzakura Kageyoshi, Daiguren Hyōrinmaru, Malevolent Shrine, Gon's transformation, the Titans…). Tap to skip.", fr: "Chaque transformation de Roll ton équipage lance une cinématique plein écran : bandes de cinéma, éclairs, étincelles et lignes de vitesse, une lame de lumière, puis le perso transformé débarque avec son kanji et son nom. 20 d'entre elles montrent d'abord la vraie scène de l'anime (Gear 5, Senbonzakura Kageyoshi, Daiguren Hyōrinmaru, Temple maléfique, la transformation de Gon, les Titans…). Touche l'écran pour passer." },
        { type: "new", game: "onepiece", en: "Imu gets his real face as a portrait, and transforms in Crew Roll (his form from the manga).", fr: "Imu a maintenant son vrai visage en portrait, et se transforme dans Roll ton équipage (sa forme du manga)." },
        { type: "improved", en: "Crew Roll's logo is now the Thousand Sunny, and two big characters of the anime frame every page.", fr: "Le logo de Roll ton équipage est maintenant le Thousand Sunny, et deux grands persos de l'animé encadrent chaque page." },
        { type: "balance", game: "bleach", en: "Bleach: Gin 8 (strategist 6), Izuru healer 7, Rukia healer 4.", fr: "Bleach : Gin 8 (stratège 6), Izuru soigneur 7, Rukia soigneuse 4." },
      ],
    },
    {
      at: "2026-10-05T22:54",
      title: { en: "Jack, Lucci and King", fr: "Jack, Lucci et King" },
      items: [
        { type: "new", game: "onepiece", en: "Jack the Drought joins One Piece (power 8 in Crew Roll).", fr: "Jack la Sécheresse rejoint One Piece (puissance 8 dans Roll ton équipage)." },
        { type: "new", game: "crew", en: "Crew Roll: Rob Lucci turns into his leopard form, King into his Pteranodon.", fr: "Roll ton équipage : Rob Lucci se transforme en léopard, King en Ptéranodon." },
      ],
    },
    {
      at: "2026-10-05T22:25",
      title: { en: "Achievements, collection and monthly seasons", fr: "Succès, collection et saisons mensuelles" },
      items: [
        { type: "new", en: "Achievements: 18 badges on your profile (bronze, silver, gold), from your first win to a season podium, with your progress on each. A banner pops up when you unlock one.", fr: "Succès : 18 badges sur ton profil (bronze, argent, or), de ta première victoire au podium de saison, avec ta progression pour chacun. Un bandeau s'affiche quand tu en débloques un." },
        { type: "new", game: "crew", en: "Collection: every card you draw in Crew Roll is kept (« ✨ New card! » the first time). The index shows which ones you have and which are left to find, and your profile shows your progress for each anime.", fr: "Collection : chaque carte tirée dans Roll ton équipage est gardée (« ✨ Nouvelle carte ! » la première fois). L'index montre celles que tu as et celles qui restent à trouver, et ton profil ta progression pour chaque animé." },
        { type: "new", en: "Monthly seasons: the leaderboard has a season of its own every month (best crews and most wins of the month), and last month's top 3 are shown as champions. The all-time leaderboard is still there.", fr: "Saisons mensuelles : le classement a sa propre saison chaque mois (meilleurs équipages et plus de victoires du mois), et le top 3 du mois précédent est affiché en champions. Le classement de tous les temps est toujours là." },
      ],
    },
    {
      at: "2026-10-05T22:15",
      title: { en: "42 new transformations", fr: "42 nouvelles transformations" },
      items: [
        { type: "new", game: "crew", en: "Crew Roll: 42 new transformations across every anime, with their own effects. Black Clover gets its first ones (Black Asta, Spirit Dive, Valkyrie Dress, Salamander, Dante's Devil Union); also Aizen, Kenpachi, Yhwach, Starrk, Komamura, Mayuri, Perfect Cell, Super Buu, Orange Piccolo, Jiren, Zamasu, Kale, Shukaku, Jiraiya, Minato, Obito, Madara, Kabuto, Monster Point Chopper, Marco, Sanji's Raid Suit, Katakuri, Kaidou, Megumi, Jogo, Maki, Hakari, Higuruma, Netero, Biscuit, Pitou, Youpi and five more Titans.", fr: "Roll ton équipage : 42 nouvelles transformations dans tous les animes, avec leurs propres effets. Black Clover a ses premières (Asta noir, Spirit Dive, Armure de Valkyrie, Salamandre, Dante en fusion démoniaque) ; et aussi Aizen, Kenpachi, Yhwach, Starrk, Komamura, Mayuri, Cell Super Parfait, Super Boo, Piccolo Orange, Jiren, Zamasu, Kale, Shukaku, Jiraiya, Minato, Obito, Madara, Kabuto, Chopper Monster Point, Marco, le Raid Suit de Sanji, Katakuri, Kaidou, Megumi, Jogo, Maki, Hakari, Higuruma, Netero, Biscuit, Pitou, Youpi et cinq Titans de plus." },
        { type: "balance", game: "onepiece", en: "One Piece: Saint Figarland Garling 10.", fr: "One Piece : Saint Figarland Garling 10." },
        { type: "balance", game: "hunterxhunter", en: "Hunter × Hunter: Biscuit 8.", fr: "Hunter × Hunter : Biscuit 8." },
      ],
    },
    {
      at: "2026-10-05T20:50",
      title: { en: "Lighter patch notes, faster on phones", fr: "Nouveautés plus légères, plus rapide sur téléphone" },
      items: [
        { type: "improved", en: "Faster on phones and PC: pictures stay in your browser between visits, leaderboard and index faces load only when you scroll to them, taps react at once and typing no longer zooms the page on iPhone.", fr: "Plus rapide sur téléphone et PC : les images restent dans ton navigateur d'une visite à l'autre, les visages du classement et de l'index ne chargent que quand tu descends jusqu'à eux, les appuis réagissent tout de suite et écrire ne zoome plus la page sur iPhone." },
        { type: "improved", en: "What's new is split by update (date and time) and into pages, and only opens by itself for what you have not seen yet. Everything else stays behind the What's new button.", fr: "Les Nouveautés sont rangées par mise à jour (date et heure) et en pages, et ne s'ouvrent toutes seules que pour ce que tu n'as pas encore vu. Le reste est derrière le bouton Nouveautés." },
      ],
    },
    {
      at: "2026-10-05T20:32",
      title: { en: "Smoother site and My stats", fr: "Site plus fluide et Mes stats" },
      items: [
        { type: "improved", en: "Smoother everywhere (60 fps): no more blur behind menus and the top bar, animations that no longer redraw the page, a much lighter Crew Roll index and draw, a background that loads only what fits on screen.", fr: "Plus fluide partout (60 fps) : plus de flou derrière les menus et la barre du haut, des animations qui ne redessinent plus la page, un index et un tirage de Roll ton équipage beaucoup plus légers, un fond qui ne charge que ce qui tient à l'écran." },
        { type: "new", en: "Profile: a My stats section with your games played, wins and win rate, rolls and rerolls, guesses, best streak, crews built, online matches, time played and favourite anime.", fr: "Profil : une section Mes stats avec tes parties jouées, victoires et taux de victoire, rolls et relances, essais, meilleure série, équipages construits, matchs en ligne, temps de jeu et animé préféré." },
      ],
    },
    {
      at: "2026-10-05T20:12",
      title: { en: "Blurred and Description games, team vs team", fr: "Jeux Flou et Description, équipe contre équipe" },
      items: [
        { type: "new", en: "Blurred game: guess the character from a blurred picture that gets sharper with every guess.", fr: "Jeu Flou : trouve le perso à partir d'une image floue qui se précise à chaque essai." },
        { type: "new", en: "Description game: a description of the character; after 3 guesses a technique or a place, after 5 a nickname or the first letter. 687 descriptions, spoiler-free.", fr: "Jeu Description : une description du perso ; après 3 essais une technique ou un lieu, après 5 un surnom ou la première lettre. 687 descriptions, sans spoiler." },
        { type: "new", en: "Team vs team online: red against blue in the guessing races (all three games) and in Crew Roll. The host turns it on in the room.", fr: "Équipe contre équipe en ligne : rouges contre bleus dans les courses (les trois jeux) et dans Roll ton équipage. L'hôte l'active dans la salle." },
        { type: "improved", en: "The strongest characters glow: a gold aura for power 10, violet for 9, in suggestions, guesses and results.", fr: "Les persos les plus forts brillent : aura dorée pour la puissance 10, violette pour 9, dans les suggestions, les essais et les résultats." },
      ],
    },
    {
      at: "2026-10-05T19:48",
      title: { en: "New characters and ratings for every anime", fr: "Nouveaux persos et notes pour chaque animé" },
      items: [
        { type: "new", game: "onepiece", en: "One Piece: Scopper Gaban, Den, Peepley Lulu, Gaimon, Charlos, Figarland Garling and Shamrock.", fr: "One Piece : Scopper Gaban, Den, Peepley Lulu, Gaimon, Charlos, Figarland Garling et Shamrock." },
        { type: "new", game: "dragonball", en: "Dragon Ball: Dr. Brief, Gamma 1 and 2, Saonel and Pirina.", fr: "Dragon Ball : Dr Brief, Gamma 1 et 2, Saonel et Pirina." },
        { type: "new", game: "attackontitan", en: "Attack on Titan: Marlo and Traute; the Garrison slot becomes Garrison / Military Police.", fr: "SNK : Marlo et Traute ; la case Garnison devient Garnison / Brigades spéciales." },
        { type: "new", game: "crew", en: "Gon transforms into Adult Gon in Crew Roll.", fr: "Gon se transforme en Gon adulte dans Roll ton équipage." },
        { type: "balance", game: "onepiece", en: "One Piece: Gaban 10 (navigator 9), Den and Lulu shipwrights 9; Ace, Crocodile, Kin'emon, Pedro, Cavendish, Dorry, Brogy, the Minks, Gin, Kalifa, Doc Q, Zeff and Shirahoshi down; Hawkins 7.", fr: "One Piece : Gaban 10 (navigateur 9), Den et Lulu charpentiers 9 ; Ace, Crocodile, Kin'emon, Pedro, Cavendish, Dorry, Brogy, les Minks, Gin, Kalifa, Doc Q, Zeff et Shirahoshi baissent ; Hawkins 7." },
        { type: "balance", game: "bleach", en: "Bleach: the Royal Guard at 9 (Ichibe stays 10), Ginjo 9, Tsukishima 8, Sado 7; Tosen 8 as Shinigami and 9 as Arrancar; Uryu 9 in Quincy; healers Isane and Hikifune 9, Hanataro 8; the Engineer slot becomes Strategist / Engineer (Yhwach 9).", fr: "Bleach : la Garde royale à 9 (Ichibe reste à 10), Ginjo 9, Tsukishima 8, Sado 7 ; Tosen 8 en Shinigami et 9 en Arrancar ; Uryū 9 en Quincy ; soigneurs Isane et Hikifune 9, Hanataro 8 ; la case Ingénieur devient Stratège / Ingénieur (Yhwach 9)." },
        { type: "balance", game: "hunterxhunter", en: "Hunter × Hunter: Gon, Ging and Zeno 10, Palm 7; Machi healer 9; Ging strategist 10.", fr: "Hunter × Hunter : Gon, Ging et Zeno 10, Palm 7 ; Machi soigneuse 9 ; Ging stratège 10." },
        { type: "balance", game: "dragonball", en: "Dragon Ball: Scientist becomes Scientist / Strategist (Piccolo and Roshi 10, Dr. Brief 9, Babidi 8); C-18 9 as Earthling and Android; Beerus, Champa and Toppo 7 and Whis 9 as God / Angel.", fr: "Dragon Ball : Scientifique devient Scientifique / Stratège (Piccolo et Tortue Géniale 10, Dr Brief 9, Babidi 8) ; C-18 9 en Terrien et Cyborg ; Beerus, Champa et Toppo 7 et Whis 9 en Dieu / Ange." },
        { type: "balance", game: "jujutsukaisen", en: "Jujutsu Kaisen: Kamo and Mechamaru 8 and Mai 7 at Kyoto, Higuruma 9 and Hana 8 as Freelance; Sukuna healer 9; Tengen and Kenjaku strategists 9.", fr: "Jujutsu Kaisen : Kamo et Mechamaru 8 et Mai 7 à Kyoto, Higuruma 9 et Hana 8 en Indépendants ; Sukuna soigneur 9 ; Tengen et Kenjaku stratèges 9." },
        { type: "balance", game: "blackclover", en: "Black Clover: Yami 10, Nozel 9 (11 as captain); William 9, Langris 8 and Klaus 7 in the Golden Dawn.", fr: "Black Clover : Yami 10, Nozel 9 (11 en capitaine) ; William 9, Langris 8 et Klaus 7 dans l'Aube Dorée." },
        { type: "balance", game: "attackontitan", en: "Attack on Titan: Hange 7 and Connie 6 in the Survey Corps; Rico 8 and Ian 6 in the Garrison.", fr: "SNK : Hange 7 et Connie 6 au Bataillon ; Rico 8 et Ian 6 à la Garnison." },
      ],
    },
    {
      at: "2026-10-05T17:46",
      title: { en: "Crew Roll index and leaderboard per anime", fr: "Index de Roll ton équipage et classement par animé" },
      items: [
        { type: "new", game: "crew", en: "Crew Roll index: every card of each anime with its rarity, its power and what it scores in every role. Search, filter by rarity and sort by role.", fr: "Index de Roll ton équipage : toutes les cartes de chaque animé avec leur rareté, leur puissance et ce qu'elles rapportent dans chaque rôle. Recherche, filtre par rareté et tri par rôle." },
        { type: "new", en: "Leaderboard per anime: the best Bleach crews, One Piece crews and so on, with each crew's faces.", fr: "Classement par animé : les meilleurs équipages Bleach, One Piece, etc., avec les visages de chaque équipage." },
      ],
    },
    {
      at: "2026-10-05T14:43",
      title: { en: "Steadier online play", fr: "Jeu en ligne plus stable" },
      items: [
        { type: "fix", en: "No more getting kicked offline: a connection that drops for a moment (phone in the background, network hiccup) now comes back by itself, and an online match carries on where it was.", fr: "Fini les déconnexions intempestives : une connexion qui saute un instant (téléphone en arrière-plan, réseau qui coupe) revient toute seule, et le match en ligne reprend où il en était." },
      ],
    },
    {
      at: "2026-10-05T14:02",
      title: { en: "Bleach and Black Clover ratings", fr: "Notes Bleach et Black Clover" },
      items: [
        { type: "new", game: "bleach", en: "Akon joins Bleach, as an engineer.", fr: "Akon rejoint Bleach, en ingénieur." },
        { type: "balance", game: "bleach", en: "Bleach: Visored and Quincy ratings spread out, Tenjiro healer 10, Kenpachi 10, Uryu 8, Tsukishima and Sasakibe 7.", fr: "Bleach : notes des Visored et Quincy plus variées, Tenjirō soigneur 10, Kenpachi 10, Uryū 8, Tsukishima et Sasakibe 7." },
        { type: "balance", game: "blackclover", en: "Black Clover: Rades healer 9.", fr: "Black Clover : Rades soigneur 9." },
      ],
    },
    {
      at: "2026-10-05T13:42",
      title: { en: "Attack on Titan", fr: "L'Attaque des Titans" },
      items: [
        { type: "new", game: "attackontitan", en: "Snkdle: 57 Attack on Titan characters over 7 anime arcs, spoiler-free (Titan shifters are only revealed with the anime).", fr: "Snkdle : 57 persos de L'Attaque des Titans sur 7 arcs, sans spoiler (les Titans Shifters ne sont révélés qu'avec l'anime)." },
        { type: "new", game: "crew", en: "Crew Roll Attack on Titan: Titans, Survey Corps, Strategist, Garrison, Marley, Commander and Wildcard, with 11 Titan transformations.", fr: "Roll ton équipage SNK : Titans, Bataillon, Stratège, Garnison, Mahr, Commandant et Joker, avec 11 transformations en Titan." },
        { type: "new", game: "onepiece", en: "19 new One Piece characters: Bepo, Laffitte, Crocus, Nico Olvia, Streusen, Sukiyaki, Benn Beckman, Lucky Roux, Yasopp, Oven, Perospero…", fr: "19 nouveaux persos One Piece : Bépo, Laffitte, Crocus, Nico Olvia, Streusen, Sukiyaki, Ben Beckman, Lucky Roux, Yasopp, Oven, Perospero…" },
        { type: "improved", en: "Portraits now come from the anime instead of the manga (Attack on Titan, Black Clover), in the characters' early look.", fr: "Les portraits viennent maintenant de l'anime et plus du manga (SNK, Black Clover), dans le look du début." },
      ],
    },
    {
      at: "2026-10-04T22:48",
      title: { en: "Black Clover, friends and turn-based duels", fr: "Black Clover, amis et duels au tour par tour" },
      items: [
        { type: "new", game: "blackclover", en: "Blackcloverdle: 70 Black Clover characters over 10 arcs, also in Crew Roll.", fr: "Blackcloverdle : 70 persos de Black Clover sur 10 arcs, aussi dans Roll ton équipage." },
        { type: "new", en: "Friends: add friends by their profile name, see who is online and where, join their room in one click or invite them, even when they are offline.", fr: "Amis : ajoute tes amis par leur pseudo, vois qui est en ligne et où, rejoins leur salle en un clic ou invite-les, même hors ligne." },
        { type: "new", game: "crew", en: "Online Crew Roll is turn by turn: watch every roll and placement of your opponent live; in 1v1 both boards sit side by side.", fr: "Roll ton équipage en ligne se joue chacun son tour : tu vois chaque tirage et placement de l'adversaire en direct ; en 1v1 les deux plateaux sont côte à côte." },
        { type: "new", game: "crew", en: "Role slots for every anime: healer, engineer, scientist, strategist… and a 10 in every slot.", fr: "Des rôles pour tous les animes : soigneur, ingénieur, scientifique, stratège… et un 10 dans chaque rubrique." },
        { type: "improved", en: "Online wins (races and Crew Roll matches) now count on your profile and the leaderboard.", fr: "Les victoires en ligne (courses et matchs Roll ton équipage) comptent sur ton profil et au classement." },
        { type: "balance", game: "crew", en: "Captains and first mates get a bonus that grows with their power (a 10 is worth 12).", fr: "Capitaines et seconds ont un bonus qui grandit avec leur puissance (un 10 vaut 12)." },
        { type: "balance", game: "onepiece", en: "One Piece: fish-men navigate, the Five Elders, Brûlée, Tom, Paulie, Doc Q and Imu join; Aokiji 10, Kuma 6, Kyros 5, Doflamingo 8.", fr: "One Piece : les hommes-poissons naviguent, le Gorosei, Brûlée, Tom, Paulie, Doc Q et Imu arrivent ; Aokiji 10, Kuma 6, Kyros 5, Doflamingo 8." },
        { type: "balance", game: "dragonball", en: "Dragon Ball ratings raised by one.", fr: "Notes de Dragon Ball augmentées d'un point." },
      ],
    },
    {
      at: "2026-10-02T17:35",
      title: { en: "Smoother Crew Roll", fr: "Roll ton équipage plus fluide" },
      items: [
        { type: "fix", game: "crew", en: "No more getting stuck with a character that fits nowhere: a free skip appears.", fr: "Plus de blocage avec un perso qui ne rentre nulle part : un bouton passer apparaît." },
        { type: "fix", game: "crew", en: "Online, every crew can be completed even when the pool runs dry.", fr: "En ligne, chaque équipage peut être complété même quand il n'y a plus de persos libres." },
        { type: "improved", en: "When a new version of the site is out, a banner offers to reload.", fr: "Quand une nouvelle version du site sort, un bandeau propose de recharger." },
      ],
    },
  ];

  const PAGE = 3;
  const T = {
    en: { title: "What's new", today: "Today", button: "What's new", close: "Let's go!", unseen: (n) => `${n} new update${n > 1 ? "s" : ""}`,
      prev: "Newer", next: "Older", page: (a, b) => `Page ${a} / ${b}`,
      types: { new: "New", improved: "Improved", balance: "Balance", fix: "Fix" }, crew: "Crew Roll" },
    fr: { title: "Nouveautés", today: "Aujourd'hui", button: "Nouveautés", close: "C'est parti !", unseen: (n) => `${n} nouvelle${n > 1 ? "s" : ""} mise${n > 1 ? "s" : ""} à jour`,
      prev: "Plus récent", next: "Plus ancien", page: (a, b) => `Page ${a} / ${b}`,
      types: { new: "Nouveau", improved: "Amélioré", balance: "Équilibrage", fix: "Correctif" }, crew: "Roll ton équipage" },
  };
  const KEY = "dle:changelog-seen";
  const lang = () => (window.DLE_LANG?.get() === "fr" ? "fr" : "en");
  const t = (k) => T[lang()][k];
  const ROOT = (document.currentScript?.src || "").replace(/shared\/changelog\.js.*$/, "");
  const GAMES = window.DLE_GAMES || [];
  const latest = LOG[0].at;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const longDate = (key) => new Date(`${key}T12:00:00`).toLocaleDateString(lang(), { weekday: "long", day: "numeric", month: "long" });
  const clock = (at) => (lang() === "fr" ? at.slice(11).replace(":", "h") : at.slice(11));
  // The last update seen. Older saves were "day#item count": that day's updates are seen up to that many items.
  const seen = () => {
    let v = "";
    try { v = localStorage.getItem(KEY) || ""; } catch {}
    const old = /^(\d{4}-\d{2}-\d{2})#(\d+)$/.exec(v);
    if (!old) return v;
    let mark = `${old[1]}T00:00`;
    let count = 0;
    for (const u of LOG.filter((x) => x.at.startsWith(old[1])).reverse()) {
      count += u.items.length;
      if (count > Number(old[2])) break;
      mark = u.at;
    }
    return LOG.some((x) => x.at.startsWith(old[1])) ? mark : `${old[1]}T23:59`;
  };
  const markSeen = () => { try { localStorage.setItem(KEY, latest); } catch {} renderButton(); };

  const ICONS = {
    new: "M12 3l2.2 5.6L20 10l-5.8 1.4L12 17l-2.2-5.6L4 10l5.8-1.4z",
    improved: "M12 19V5M5 12l7-7 7 7",
    balance: "M12 3v18M5 7h14M3 14l2-7 2 7a2 2 0 0 1-4 0zM17 14l2-7 2 7a2 2 0 0 1-4 0z",
    fix: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z",
  };
  const svg = (d, size = 16) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function badge(item) {
    const b = el("span", `cl-tag cl-${item.type}`);
    b.innerHTML = svg(ICONS[item.type], 13);
    b.append(t("types")[item.type]);
    return b;
  }
  function gameMark(id) {
    if (!id) return null;
    if (id === "crew") {
      const m = el("img", "cl-game cl-game-crew");
      m.src = `${ROOT}assets/logos/sunny.webp`;
      m.alt = "";
      m.title = t("crew");
      return m;
    }
    const g = GAMES.find((x) => x.id === id);
    if (!g) return null;
    const img = el("img", "cl-game");
    img.src = ROOT + g.logo;
    img.alt = g.anime;
    img.title = g.brand;
    return img;
  }

  function update(entry, { open, isNew }) {
    const box = el("details", `cl-day${isNew ? " is-new" : ""}`);
    box.open = open;
    const head = el("summary", "cl-day-head");
    const date = entry.at.slice(0, 10);
    const when = `${date === todayKey() ? `${t("today")} · ` : ""}${longDate(date)} · ${clock(entry.at)}`;
    head.append(el("span", "cl-date", when), el("span", "cl-day-title", entry.title[lang()]));
    box.append(head);
    const list = el("ul", "cl-list");
    entry.items.forEach((item, i) => {
      const li = el("li", "cl-item");
      li.style.animationDelay = `${60 + i * 40}ms`;
      const mark = gameMark(item.game);
      li.append(badge(item));
      if (mark) li.append(mark);
      li.append(el("p", "cl-text", item[lang()]));
      list.append(li);
    });
    box.append(list);
    return box;
  }

  let dialog = null;
  let view = { onlyNew: false, page: 0, lastSeen: "" };

  function render() {
    // A first visit only gets the latest update; the rest is behind the button.
    const entries = !view.onlyNew ? LOG : view.lastSeen ? LOG.filter((u) => u.at > view.lastSeen) : LOG.slice(0, 1);
    const pages = Math.max(1, Math.ceil(entries.length / PAGE));
    view.page = Math.min(Math.max(0, view.page), pages - 1);
    const shown = entries.slice(view.page * PAGE, view.page * PAGE + PAGE);

    const card = el("div", "cl-card");
    const glow = el("div", "cl-glow");
    const head = el("header", "cl-head");
    const spark = el("span", "cl-spark");
    spark.innerHTML = svg(ICONS.new, 28);
    const titles = el("div", "cl-titles");
    titles.append(el("h2", "cl-title", t("title")), el("p", "cl-sub", view.onlyNew ? t("unseen")(entries.length) : LOG[0].title[lang()]));
    const x = el("button", "cl-x", "✕");
    x.type = "button";
    x.setAttribute("aria-label", "Close");
    x.addEventListener("click", () => dialog.close());
    head.append(spark, titles, x);

    const body = el("div", "cl-body");
    shown.forEach((entry, i) => body.append(update(entry, { open: view.page === 0 && i === 0 || view.onlyNew || entry.items.length <= 4, isNew: entry.at > view.lastSeen })));

    card.append(glow, head, body);
    if (pages > 1) {
      const pager = el("nav", "cl-pager");
      const go = (p) => { view.page = p; render(); dialog.querySelector(".cl-body")?.scrollTo(0, 0); };
      const prev = el("button", "cl-page-btn", `‹ ${t("prev")}`);
      prev.type = "button";
      prev.disabled = view.page === 0;
      prev.addEventListener("click", () => go(view.page - 1));
      const dots = el("div", "cl-dots");
      for (let p = 0; p < pages; p++) {
        const d = el("button", `cl-dot${p === view.page ? " is-on" : ""}`, String(p + 1));
        d.type = "button";
        d.setAttribute("aria-label", t("page")(p + 1, pages));
        d.addEventListener("click", () => go(p));
        dots.append(d);
      }
      const next = el("button", "cl-page-btn", `${t("next")} ›`);
      next.type = "button";
      next.disabled = view.page === pages - 1;
      next.addEventListener("click", () => go(view.page + 1));
      pager.append(prev, dots, next);
      card.append(pager);
    }
    const close = el("button", "btn-primary cl-go", t("close"));
    close.type = "button";
    close.addEventListener("click", () => dialog.close());
    card.append(close);
    dialog.replaceChildren(card);
  }

  // onlyNew: just the updates not seen yet (the automatic opening); otherwise the whole history.
  function open({ onlyNew = false } = {}) {
    if (!dialog) {
      dialog = el("dialog", "cl-modal");
      dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener("close", markSeen);
      document.body.append(dialog);
    }
    view = { onlyNew, page: 0, lastSeen: seen() };
    render();
    if (!dialog.open) dialog.showModal();
  }

  // Header button, with a dot while there is something unread.
  let button = null;
  function renderButton() {
    const bar = document.querySelector(".topbar-actions");
    if (!bar) return;
    if (!button) {
      button = el("button", "cl-btn");
      button.type = "button";
      button.addEventListener("click", () => open());
      bar.prepend(button);
    }
    button.innerHTML = svg(ICONS.new, 18);
    button.append(el("span", "cl-btn-label", t("button")));
    button.title = t("button");
    button.classList.toggle("has-news", seen() < latest);
  }

  // Opens by itself only when an update was never seen, after any other window (name, arc picker…) is closed.
  function autoOpen() {
    if (seen() >= latest) return;
    const tryOpen = (left) => {
      if (document.querySelector("dialog[open]") && left > 0) { setTimeout(() => tryOpen(left - 1), 1000); return; }
      open({ onlyNew: true });
      window.DLE_FX?.play("win");
    };
    setTimeout(() => tryOpen(120), 900);
  }

  function init() {
    renderButton();
    autoOpen();
  }
  window.addEventListener("dle:lang", () => { renderButton(); if (dialog?.open) render(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.DLE_Changelog = { open };
})();
