// Crew game: slots and power ratings per anime.
// power: 1–10 (unlisted characters are worth DEFAULT_POWER).
// A slot accepts a character when its `fits` test passes on the character's spoiler-free attributes.
// `icon` names a role icon from crew.js.
// One Piece slots are roles: anyone can fill them, but specialists score high in their own role.
(() => {
  const DEFAULT_POWER = 3;
  const has = (v, ...xs) => [].concat(v ?? []).some((x) => xs.includes(x));
  const parse = (s) => Object.fromEntries(s.trim().split(/\s+/).map((p) => { const i = p.lastIndexOf(":"); return [p.slice(0, i), Number(p.slice(i + 1))]; }));

  // Specialist roles in One Piece: score in that role for the listed characters, everyone else gets a third of their power.
  const OP_SPECIALISTS = {
    // Nami charts every sea; Jinbe is the helmsman; Enel piloted the Ark Maxim to the moon; Rayleigh, Roger's
    // first mate, sailed to Laugh Tale; Vegapunk computes routes; Nojiko and Bell-mère raised a navigator.
    // Fish-men and merfolk read the currents of every sea; Dragon commands the winds; Wyper and Gan Fall sail the sky sea.
    // Laffitte charts Blackbeard's course; Bepo navigates the Polar Tang; Gaban sailed with Roger to Laugh Tale.
    navigator: parse(`nami:10 jinbe:9 laffitte:9 bepo:8 silvers-rayleigh:7 enel:7 fisher-tiger:7 arlong:6 neptune:6 vegapunk:6 monkey-d-dragon:6 hody-jones:5 tom:5
      shirahoshi:5 nojiko:4 bell-mere:4 wyper:4 gan-fall:4 scopper-gaban:9 den:6 monkey-d-garp:7 sengoku:5 tsuru:5`),
    // Cracker bakes his biscuits, Katakuri lives on doughnuts, Mihawk cooks for his guests at Kuraigana.
    // Big Mom bakes for her tea parties; Oden boiled his namesake dish in Wano.
    // Streusen bakes Big Mom's cakes; Lucky Roux is the Red Hair Pirates' cook; Oven bakes with his heat, Perospero makes candy.
    cook: parse("sanji:10 zeff:10 streusen:9 charlotte-pudding:8 lucky-roux:8 dracule-mihawk:7 charlotte-oven:7 charlotte-perospero:7 charlotte-katakuri:6 charlotte-cracker:6 charlotte-brulee:6 charlotte-linlin:5 kouzuki-oden:5 vasco-shot:6 makino:8 curly-dadan:7 charlotte-smoothie:7"),
    // Doc Q is Blackbeard's doctor; Reiju drew the poison out of Luffy; Marco heals with his flames;
    // Queen and Judge are MADS scientists (viruses, lineage factor); Kuma pushed Luffy's pain out of his body.
    // Crocus was the Roger Pirates' doctor.
    doctor: parse(`tony-tony-chopper:10 trafalgar-law:10 kureha:10 crocus:9 polo-marco:8 doc-q:8 hiriluk:7 queen:7 emporio-ivankov:6 vegapunk:6
      vinsmoke-judge:6 bartholomew-kuma:6 vinsmoke-reiju:5 caesar-clown:4 bepo:6 aramaki:6 hogback:10`),
    // Reading the poneglyphs or knowing the Void Century: the Kozuki family and their retainers (Zou's dukes keep a Road
    // Poneglyph), Roger's crew, Imu and the Five Elders, Blackbeard's hunt, the Shandia guarding Skypiea's poneglyph,
    // Crocodile's search for Pluton, Pedro's journey to read one.
    // Olvia, Robin's mother, studied the poneglyphs at Ohara; Sukiyaki was shogun with the Kozuki's secret; Crocus sailed to Laugh Tale.
    archaeologist: parse(`nico-robin:10 nico-olvia:9 imu:9 gol-d-roger:7 kouzuki-sukiyaki:8 charlotte-pudding:8 kouzuki-oden:10 crocus:5 kouzuki-momonosuke:7 silvers-rayleigh:7 vegapunk:7
      marshall-d-teach:9 jaygarcia-saturn:6 marcus-mars:6 topman-warcury:6 ethanbaron-v-nusjuro:6 shepherd-ju-peter:6 kouzuki-hiyori:6
      inuarashi:6 nekomamushi:6 wyper:6 shanks:5 crocodile:5 pedro:5 kin-emon:5 yamato:5 nefertari-vivi:4 buggy:4 figarland-garling:6 monkey-d-dragon:8 rocks-d-xebec:6 kawamatsu:4`),
    // Tom built the Oro Jackson; Paulie, Kaku and Lucci worked at Galley-La; Rayleigh coats ships; Queen builds
    // Kaidou's weapons and his own cyborg body; Vegapunk builds Seraphim and Egghead; Kid forges his own arm; Usopp
    // patched the Merry; Kalifa ran Galley-La's office. Den, Tom's brother, coated the Sunny for the trip down;
    // Peepley Lulu is a Galley-La foreman.
    shipwright: parse("franky:10 iceburg:10 tom:10 paulie:8 silvers-rayleigh:8 kaku:7 vegapunk:7 queen:6 eustass-kid:6 rob-lucci:6 usopp:5 kalifa:4 den:9 peepley-lulu:9 aramaki:6 capone-bege:6 foxy:4"),
  };
  const specialist = (role) => (c, power) => OP_SPECIALISTS[role][c.id] ?? Math.max(1, Math.round(power / 3));
  // Role slots of the other anime work the same way: anyone can fill them, the listed characters score high.
  const role = (table) => (c, power) => table[c.id] ?? Math.max(1, Math.round(power / 3));
  // A slot where some characters are worth more (or less) than their power, everyone else their power.
  const rated = (table) => (c, power) => table[c.id] ?? power;
  const ROLES = {
    bleach: {
      // Unohana and Orihime heal anything; Tenjiro's hot springs heal Captains in hours; Hikifune rebuilt Ichigo's body.
      healer: parse(`retsu-unohana:10 orihime-inoue:10 tenjiro-kirinji:10 isane-kotetsu:9 kirio-hikifune:9 hanataro-yamada:8 hachigen-ushoda:6
        nelliel-tu-odelschwanck:7 isshin-kurosaki:6 tessai-tsukabishi:7 kisuke-urahara:5 mayuri-kurotsuchi:8 nemu-kurotsuchi:5 giselle-gewelle:3 senjumaru-shutara:7 izuru-kira:7 rukia-kuchiki:4 ryuken-ishida:7 uryu-ishida:6 kiyone-kotetsu:5`),
      // Inventors and researchers: the Hogyoku, the SRDI, Szayel's lab, Oetsu's forge, Hikifune (12th Division before
      // Kisuke), Kukaku's fireworks cannon, Akon running the SRDI's lab. Strategists too: Yhwach sees the future,
      // Shunsui and Gin play their long games, Haschwalth runs the Sternritter.
      engineer: parse(`kisuke-urahara:10 mayuri-kurotsuchi:10 sosuke-aizen:9 szayelaporro-granz:9 oetsu-nimaiya:9 akon:8 kirio-hikifune:7
        senjumaru-shutara:9 kukaku-shiba:7 nemu-kurotsuchi:6 yukio-hans-vorarlberna:6 tessai-tsukabishi:5 uryu-ishida:7 yhwach:9 shunsui-kyoraku:7 jugram-haschwalth:7 gin-ichimaru:6 askin-nakk-le-vaar:6 jushiro-ukitake:6 shukuro-tsukishima:8 kugo-ginjo:7 ichibe-hyosube:8 ryuken-ishida:7 hachigen-ushoda:6`),
    },
    hunterxhunter: {
      // Leorio studies medicine; Nanika heals with a wish; Pitou operates as Doctor Blythe; Bisky's massages.
      // Machi sews severed limbs back with Nen threads; Kurapika's Holy Chain heals.
      healer: parse("leorio-paradinight:10 alluka-zoldyck:10 neferpitou:9 cheadle-yorkshire:8 machi-komacine:9 kurapika:8 biscuit-krueger:7 shaiapouf:4 senritsu:6 morel-mackernasey:5"),
      strategist: parse(`pariston-hill:10 komugi:9 meruem:9 ging-freecss:10 shaiapouf:8 morel-mackernasey:8 genthru:8 shalnark:8 kurapika:8
        chrollo-lucilfer:8 killua-zoldyck:7 milluki-zoldyck:7 knov:7 cheadle-yorkshire:7 isaac-netero:7 mizaistom-nana:7 tsezguerra:6
        welfin:6 kite:6 illumi-zoldyck:6 pakunoda:5`),
    },
    dragonball: {
      // Dende and Kibito heal with a touch; Korin grows the senzu beans; Whis rewinds time; Buu healed Bee.
      healer: parse("dende:10 kibito:9 korin:8 whis:8 majin-buu:8 grand-priest:7 kami:7 vados:6 yajirobe:5 grand-elder-guru:5 mr-popo:4"),
      // Bulma builds the Dragon Radar and the time machine; Dr. Gero built the androids and Cell.
      // Future Trunks keeps the time machine running.
      // Strategists: Piccolo plans the Z Fighters' battles, Roshi out-thinks his opponents at every Tournament,
      // Hit and Vegeta read a fight, King Piccolo plotted to conquer Earth.
      scientist: parse(`bulma:10 dr-gero:10 dr-brief:9 babidi:8 emperor-pilaf:5 future-trunks:5 kami:4 android-16:4 commander-red:3
        piccolo:10 master-roshi:10 hit:9 vegeta:8 king-piccolo:7 grand-priest:7 king-kai:6 frieza:6 gohan:6 zamasu:7 krillin:5
        captain-ginyu:5 shin-supreme-kai:5 cell:5 whis:7 vados:7 general-blue:4`),
    },
    naruto: {
      // Nagato's Rinne Rebirth brought Konoha back to life; Rin was Team Minato's medic.
      healer: parse(`tsunade:10 sakura-haruno:9 kabuto-yakushi:9 nagato:8 shizune:8 karin:7 chiyo:7 hashirama-senju:7 orochimaru:6
        rin-nohara:6 hagoromo-otsutsuki:6 ino-yamanaka:5 naruto-uzumaki:4`),
      strategist: parse(`shikamaru-nara:10 shikaku-nara:10 itachi-uchiha:8 minato-namikaze:8 tobirama-senju:8 kakashi-hatake:8 madara-uchiha:8
        sasori:9 orochimaru:8 obito-uchiha:8 danzo-shimura:7 kabuto-yakushi:7 hiruzen-sarutobi:7 jiraiya:7 yamato:7 kankuro:6 temari:6
        ibiki-morino:6 nagato:6 shino-aburame:6 shisui-uchiha:6 deidara:5 inoichi-yamanaka:5`),
    },
    jujutsukaisen: {
      // Reverse cursed technique on others (Shoko, Yuta); Nitta's technique stops wounds from worsening.
      healer: parse("shoko-ieiri:10 yuta-okkotsu:9 arata-nitta:8 ryomen-sukuna:9 satoru-gojo:7 kinji-hakari:7 hiromi-higuruma:4 uraume:4 choso:4 mahito:6 kenjaku:6"),
      // Yaga builds cursed corpses like Panda.
      strategist: parse(`kenjaku:9 suguru-geto:8 megumi-fushiguro:8 tengen:9 hiromi-higuruma:8 mechamaru:9 ryomen-sukuna:10 kento-nanami:7
        masamichi-yaga:8 mahito:7 mei-mei:7 aoi-todo:7 satoru-gojo:6 toji-fushiguro:6 yoshinobu-gakuganji:6 atsuya-kusakabe:6 noritoshi-kamo:6
        yuki-tsukumo:6 kiyotaka-ijichi:5 utahime-iori:5`),
    },
    blackclover: {
      // Mimosa's healing flowers; the Witch Queen healed Asta's arms; Charmy's food restores mana; Secre sealed the curse.
      // Rades's soul magic puts bodies back together; William's World Tree heals whole armies; Fana's flames mend; Moris rebuilds the bodies he experiments on.
      healer: parse(`mimosa-vermillion:10 witch-queen:9 william-vangeance:8 fana:7 charmy-pappitson:7 secre-swallowtail:7 lolopechka:7
        sister-lily:6 vanessa-enoteca:6 moris-libardirt:5 kirsch-vermillion:3 rades-spirito:9`),
      // Lucius planned everything; Marx and Damnatio serve the Wizard King; Zora sets traps. Engineers: Moris, the
      // Diamond Kingdom's mad scientist; Henry reshapes the Black Bulls' hideout; Rades reanimates corpses.
      // Kaiser plans the Purple Orcas' battles; Nacht is the Black Bulls' spy; Fanzell trained Asta and leads the resistance.
      strategist: parse(`lucius-zogratis:10 moris-libardirt:9 patry:9 kaiser-granvorka:9 julius-novachrono:8 marx-francois:8 damnatio-kira:8
        nacht-faust:8 zora-ideale:8 fanzell-kruger:7
        henry-legolant:8 klaus-lunettes:7 william-vangeance:7 fuegoleon-vermillion:7 licht:7 rades-spirito:6 gordon-agrippa:6 yami-sukehiro:6
        nozel-silva:6 finral-roulacase:5 sekke-bronzazza:4`),
    },
  };
  // Attack on Titan: Armin and Erwin plan every battle, Hange builds the thunder spears, Zeke and Willy play Marley,
  // Pixis bluffs a whole Garrison into holding Trost, Onyankopon flies the airship.
  ROLES.attackontitan = {
    strategist: parse(`armin-arlert:10 erwin-smith:10 zeke-yeager:9 hange-zoe:9 eren-yeager:8 pieck-finger:8 dot-pixis:8 willy-tybur:8
      eren-kruger:7 theo-magath:7 darius-zackly:7 yelena:7 jean-kirstein:7 onyankopon:7 kiyomi-azumabito:6 levi:6 kenny-ackerman:6
      grisha-yeager:6 floch-forster:6 reiner-braun:5 annie-leonhart:5 historia-reiss:5 rod-reiss:5 keith-shadis:5 marcel-galliard:5
      mikasa-ackerman:4 bertholdt-hoover:4 porco-galliard:4 nile-dok:4`),
  };
  const anyone = () => true;
  // Attack on Titan commanders, squad leaders and the heads of each faction.
  const SNK_LEADERS = ["erwin-smith", "hange-zoe", "levi", "mike-zacharias", "keith-shadis", "dot-pixis", "rico-brzenska", "ian-dietrich",
    "darius-zackly", "nile-dok", "kenny-ackerman", "rod-reiss", "historia-reiss", "eren-kruger", "zeke-yeager", "reiner-braun",
    "theo-magath", "willy-tybur", "yelena", "floch-forster", "eren-yeager", "kiyomi-azumabito"];
  const HEALER = { en: "Healer", fr: "Soigneur" };
  const STRATEGIST = { en: "Strategist / Engineer", fr: "Stratège / Ingénieur" };
  // The captain and the first mate lead the crew: the stronger they are, the bigger their bonus
  // (+1 from 5, +2 from 8: a 10 is worth 12). It can lift the crew above 10.
  const leader = (c, power) => power + Math.max(0, Math.round((power - 3) / 3));

  window.CREW_GAMES = {
    bleach: {
      slots: [
        { label: { en: "Shinigami", fr: "Shinigami" }, icon: "sword", count: 3, fits: (c) => has(c.race, "Shinigami", "Hybrid"),
          score: rated({ "kaname-tosen": 8, "tessai-tsukabishi": 7, "kiyone-kotetsu": 3, "sentaro-kotsubaki": 3, "zennosuke-kurumadani": 2 }) },
        // Tosen took a Hollow's power (Resurrección) against Komamura.
        { label: { en: "Arrancar", fr: "Arrancar" }, icon: "skull", count: 2, fits: (c) => has(c.race, "Arrancar", "Hollow") || c.id === "kaname-tosen",
          score: rated({ "kaname-tosen": 9 }) },
        // Ichigo inherited a Quincy's blood from his mother and wears a Hollow mask like the Visored.
        { label: { en: "Quincy", fr: "Quincy" }, icon: "star", count: 1, fits: (c) => has(c.race, "Quincy") || c.id === "ichigo-kurosaki",
          score: rated({ "uryu-ishida": 9, "lille-barro": 8, "ichigo-kurosaki": 10 }) },
        { label: { en: "Visored", fr: "Visored" }, icon: "mask", count: 1, fits: (c) => has(c.race, "Visored") || c.id === "ichigo-kurosaki",
          score: rated({ "ichigo-kurosaki": 10, "shinji-hirako": 9, "rojuro-otoribashi": 7, "mashiro-kuna": 4 }) },
        // Humans, wandering souls and Fullbringers; Isshin, Ryuken and Masaki live as humans in Karakura.
        { label: { en: "Human / Wandering Soul / Fullbringer", fr: "Humain / Âme errante / Fullbringer" }, icon: "person", count: 1,
          fits: (c) => has(c.race, "Human", "Fullbringer", "Mod Soul", "Soul", "Hybrid") || ["isshin-kurosaki", "ryuken-ishida", "masaki-kurosaki"].includes(c.id) },
        { label: HEALER, icon: "cross", role: "healer", count: 1, fits: anyone, score: role(ROLES.bleach.healer) },
        { label: STRATEGIST, icon: "chess", role: "engineer", count: 1, fits: anyone, score: role(ROLES.bleach.engineer) },
      ],
      power: parse(`ichigo-kurosaki:10 rukia-kuchiki:7 orihime-inoue:5 yasutora-sado:7 uryu-ishida:8 kon:2 kisuke-urahara:9 yoruichi-shihoin:8
        tessai-tsukabishi:6 isshin-kurosaki:8 masaki-kurosaki:5 karin-kurosaki:2 yuzu-kurosaki:1 tatsuki-arisawa:2 keigo-asano:1 mizuiro-kojima:1
        don-kanonji:2 renji-abarai:7 byakuya-kuchiki:8 ganju-shiba:3 kukaku-shiba:4 kaien-shiba:5 hanataro-yamada:2 genryusai-yamamoto:10
        chojiro-sasakibe:7 sui-feng:7 marechiyo-omaeda:4 gin-ichimaru:8 izuru-kira:5 retsu-unohana:9 isane-kotetsu:5 sosuke-aizen:10
        momo-hinamori:5 sajin-komamura:7 tetsuzaemon-iba:4 shunsui-kyoraku:9 nanao-ise:4 kaname-tosen:7 shuhei-hisagi:6 toshiro-hitsugaya:8
        rangiku-matsumoto:5 kenpachi-zaraki:10 yachiru-kusajishi:7 ikkaku-madarame:6 yumichika-ayasegawa:5 mayuri-kurotsuchi:8 nemu-kurotsuchi:5
        jushiro-ukitake:8 ryuken-ishida:7 shinji-hirako:9 hiyori-sarugaki:5 love-aikawa:7 rojuro-otoribashi:6 kensei-muguruma:8 mashiro-kuna:5
        lisa-yadomaru:6 hachigen-ushoda:7 ulquiorra-cifer:10 yammy-llargo:7 grimmjow-jaegerjaquez:8 coyote-starrk:10 barragan-louisenbairn:8
        tier-harribel:8 nnoitra-gilga:7 szayelaporro-granz:7 zommari-rureaux:6 aaroniero-arruruerie:6 luppi-antenor:4 nelliel-tu-odelschwanck:8 loly-aivirrne:2
        wonderweiss-margela:6 lilynette-gingerbuck:3 emilou-apacci:3 ggio-vega:3 kugo-ginjo:9 shukuro-tsukishima:8 riruka-dokugamine:4
        yukio-hans-vorarlberna:5 jackie-tristan:4 giriko-kutsuzawa:5 yhwach:10 jugram-haschwalth:9 bazz-b:7 askin-nakk-le-vaar:8
        bambietta-basterbine:7 candice-catnipp:6 liltotto-lamperd:7 meninas-mcallon:4 giselle-gewelle:5 as-nodt:8 quilge-opie:6
        gremmy-thoumeaux:9 lille-barro:9 ichibe-hyosube:10 senjumaru-shutara:9 tenjiro-kirinji:9 oetsu-nimaiya:9 kirio-hikifune:9 akon:3 dordoni-alessandro-del-socaccio:5 cirucci-sanderwicci:5 gantenbainne-mosqueda:5 kiyone-kotetsu:3 sentaro-kotsubaki:3 zennosuke-kurumadani:2 ikumi-unagiya:2`),
    },

    hunterxhunter: {
      slots: [
        { label: { en: "Hunter", fr: "Hunter" }, icon: "card", count: 3, fits: (c) => has(c.aff, "Hunter Association") },
        { label: { en: "Chimera Ant", fr: "Fourmi-Chimère" }, icon: "bug", count: 2, fits: (c) => has(c.species, "Chimera Ant") },
        { label: { en: "Phantom Troupe", fr: "Brigade Fantôme" }, icon: "spider", count: 1, fits: (c) => has(c.aff, "Phantom Troupe") },
        { label: { en: "Zoldyck", fr: "Zoldyck" }, icon: "bolt", count: 1, fits: (c) => has(c.aff, "Zoldyck Family") },
        { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: () => true },
        { label: { en: "Doctor", fr: "Médecin" }, icon: "cross", role: "healer", count: 1, fits: anyone, score: role(ROLES.hunterxhunter.healer) },
        { label: STRATEGIST, icon: "chess", role: "strategist", count: 1, fits: anyone, score: role(ROLES.hunterxhunter.strategist) },
      ],
      power: parse(`gon-freecss:10 killua-zoldyck:8 kurapika:8 leorio-paradinight:4 hisoka:9 illumi-zoldyck:8 kite:7 mito-freecss:1 isaac-netero:10
        satotz:5 menchi:4 buhara:4 hanzo:5 pokkle:3 tonpa:1 bodoro:2 ponzu:3 lippo:4 beans:1 silva-zoldyck:9 zeno-zoldyck:10 kikyo-zoldyck:5
        milluki-zoldyck:3 kalluto-zoldyck:6 gotoh:5 canary:3 wing:6 zushi:3 gido:3 riehlvelt:3 sadaso:2 kastro:4 chrollo-lucilfer:10 uvogin:8
        nobunaga-hazama:7 feitan-portor:8 phinks-magcub:7 shalnark:6 franklin-bordeau:7 machi-komacine:6 pakunoda:5 shizuku-murasaki:6
        bonolenov-ndongo:5 kortopi:4 neon-nostrade:2 light-nostrade:1 senritsu:5 basho:5 squala:3 dalzollene:3 zepile:2 biscuit-krueger:8
        genthru:6 razor:7 tsezguerra:6 goreinu:4 abengane:4 binolt:3 meruem:10 neferpitou:9 shaiapouf:9 menthuthuyoupi:9 chimera-ant-queen:4
        komugi:2 knuckle-bine:6 shoot-mcmahon:6 morel-mackernasey:7 knov:6 palm-siberia:7 colt:5 meleoron:5 ikalgo:4 welfin:6 zazan:6
        cheetu:5 leol:6 bloster:5 ging-freecss:10 pariston-hill:8 cheadle-yorkshire:6 mizaistom-nana:6 botobai-gigante:7 cluck:4 ginta:4
        saiyu:4 kanzai:5 geru:5 pyon:4 saccho-kobayakawa:4 alluka-zoldyck:10 tsubone:7 amane:4`),
    },

    dragonball: {
      slots: [
        { label: { en: "Saiyan", fr: "Saïyen" }, icon: "flame", count: 2, fits: (c) => has(c.race, "Saiyan", "Half-Saiyan") },
        { label: { en: "Earthling", fr: "Terrien" }, icon: "person", count: 2, fits: (c) => has(c.race, "Human", "Animal") || ["android-17", "android-18", "arale-norimaki"].includes(c.id),
          score: rated({ "android-18": 9, "master-roshi": 7, krillin: 8, "arale-norimaki": 10, "android-17": 9 }) },
        { label: { en: "Namekian", fr: "Namek" }, icon: "leaf", count: 1, fits: (c) => has(c.race, "Namekian") },
        { label: { en: "Android", fr: "Cyborg" }, icon: "bolt", count: 1, fits: (c) => has(c.race, "Android", "Bio-Android") || c.id === "dr-gero",
          score: rated({ "android-18": 9, "arale-norimaki": 10, cell: 9 }) },
        { label: { en: "God / Angel", fr: "Dieu / Ange" }, icon: "star", count: 1, fits: (c) => has(c.race, "God", "Angel") || has(c.aff, "Gods") || ["mr-popo", "jiren"].includes(c.id),
          score: rated({ champa: 7, toppo: 6, whis: 9, beerus: 9, zamasu: 7, jiren: 7, belmod: 7 }) },
        { label: { en: "Villain", fr: "Méchant" }, icon: "skull", count: 1,
          fits: (c) => has(c.aff, "Frieza Force", "Red Ribbon Army", "Babidi's Army", "Demon Clan", "Pilaf Gang", "Team Zamasu", "Galactic Bandit Brigade") || has(c.race, "Majin", "Bio-Android", "Frieza Clan") || ["hit", "jiren"].includes(c.id) },
        { label: HEALER, icon: "cross", role: "healer", count: 1, fits: anyone, score: role(ROLES.dragonball.healer) },
        { label: { en: "Scientist / Strategist", fr: "Scientifique / Stratège" }, icon: "flask", role: "scientist", count: 1, fits: anyone, score: role(ROLES.dragonball.scientist) },
      ],
      power: parse(`goku:9 bulma:3 oolong:2 yamcha:5 puar:2 chi-chi:4 ox-king:4 master-roshi:6 turtle:2 emperor-pilaf:2 mai:2 shu:2 krillin:7
        launch:3 upa:2 bora:4 general-blue:4 commander-red:2 mercenary-tao:5 arale-norimaki:7 korin:5 yajirobe:5 tien-shinhan:7 chiaotzu:5
        king-piccolo:7 piccolo:10 kami:6 mr-popo:5 gohan:6 raditz:4 nappa:3 vegeta:9 king-kai:5 bardock:7 frieza:10 zarbon:6 dodoria:5
        captain-ginyu:7 recoome:6 burter:6 jeice:6 guldo:5 dende:3 nail:6 grand-elder-guru:3 king-cold:8 future-trunks:9 android-17:10
        android-18:8 android-16:8 android-19:6 dr-gero:6 cell:10 mr-satan:3 videl:4 goten:7 kid-trunks:5 majin-buu:10 babidi:4 dabura:8
        shin-supreme-kai:6 kibito:5 uub:7 beerus:10 whis:10 champa:10 vados:10 hit:9 cabba:6 caulifla:7 kale:8 zeno:10 goku-black:8
        zamasu:9 jiren:10 toppo:9 grand-priest:10 dr-brief:1 gamma-1:8 gamma-2:8 saonel:9 pirina:9
        vegito:10 gogeta:10 broly:10 kefla:8 moro:9 paragus:2 gine:1 king-vegeta:4 pan:4 belmod:9`),
    },

    naruto: {
      slots: [
        { label: { en: "Konoha", fr: "Konoha" }, icon: "leaf", count: 3, fits: (c) => has(c.village, "Konohagakure") },
        { label: { en: "Akatsuki", fr: "Akatsuki" }, icon: "cloud", count: 2, fits: (c) => has(c.village, "Akatsuki") },
        { label: { en: "Kage", fr: "Kage" }, icon: "hat", count: 1, fits: (c) => c.rank === "Kage" },
        { label: { en: "Uchiha", fr: "Uchiha" }, icon: "eye", count: 1, fits: (c) => has(c.clan, "Uchiha") },
        { label: { en: "Outside Konoha", fr: "Hors de Konoha" }, icon: "globe", count: 1, fits: (c) => !has(c.village, "Konohagakure", "Akatsuki") },
        { label: { en: "Medical ninja", fr: "Ninja médecin" }, icon: "cross", role: "healer", count: 1, fits: anyone, score: role(ROLES.naruto.healer) },
        { label: STRATEGIST, icon: "chess", role: "strategist", count: 1, fits: anyone, score: role(ROLES.naruto.strategist) },
      ],
      power: parse(`naruto-uzumaki:10 sasuke-uchiha:10 sakura-haruno:7 kakashi-hatake:9 iruka-umino:3 hiruzen-sarutobi:8 konohamaru-sarutobi:4
        mizuki:2 zabuza-momochi:6 haku:5 tazuna:1 inari:1 gato:1 minato-namikaze:9 rock-lee:7 neji-hyuga:7 tenten:5 might-guy:9
        hinata-hyuga:6 kiba-inuzuka:5 shino-aburame:5 kurenai-yuhi:5 shikamaru-nara:6 choji-akimichi:6 ino-yamanaka:5 asuma-sarutobi:7
        gaara:8 kankuro:6 temari:6 kabuto-yakushi:8 orochimaru:9 anko-mitarashi:5 ibiki-morino:4 hayate-gekko:4 dosu-kinuta:3 zaku-abumi:3
        kin-tsuchi:2 baki:5 hiashi-hyuga:6 hanabi-hyuga:3 shikaku-nara:6 inoichi-yamanaka:5 choza-akimichi:6 itachi-uchiha:9
        kisame-hoshigaki:8 jiraiya:9 tsunade:9 shizune:4 kimimaro:7 tayuya:5 sakon:5 jirobo:5 kidomaru:5 gamabunta:7 sai:6 yamato:7
        deidara:8 sasori:8 chiyo:7 hidan:7 kakuzu:8 nagato:9 konan:7 obito-uchiha:10 suigetsu-hozuki:6 karin:4 jugo:6 killer-b:9
        a-fourth-raikage:9 onoki:8 mei-terumi:8 darui:7 ao:6 kurotsuchi:6 danzo-shimura:8 fukasaku:6 yugito-nii:7 madara-uchiha:10
        hashirama-senju:10 tobirama-senju:9 kushina-uzumaki:7 kaguya-otsutsuki:10 shisui-uchiha:8 rin-nohara:4 utakata:7 yagura-karatachi:8
        hagoromo-otsutsuki:10 kinkaku:8 ginkaku:8 chojuro:6 omoi:5 karui:5 samui:6`),
    },

    onepiece: {
      slots: [
        { label: { en: "Captain", fr: "Capitaine" }, icon: "crown", role: "captain", count: 1, fits: () => true, score: leader },
        { label: { en: "First Mate", fr: "Second" }, icon: "swords", role: "first-mate", count: 1, fits: () => true, score: leader },
        { label: { en: "Navigator", fr: "Navigateur" }, icon: "compass", role: "navigator", count: 1, fits: () => true, score: specialist("navigator") },
        { label: { en: "Cook", fr: "Cuisinier" }, icon: "chef", role: "cook", count: 1, fits: () => true, score: specialist("cook") },
        { label: { en: "Doctor", fr: "Médecin" }, icon: "cross", role: "doctor", count: 1, fits: () => true, score: specialist("doctor") },
        { label: { en: "Archaeologist", fr: "Archéologue" }, icon: "book", role: "archaeologist", count: 1, fits: () => true, score: specialist("archaeologist") },
        { label: { en: "Shipwright", fr: "Charpentier" }, icon: "hammer", role: "shipwright", count: 1, fits: () => true, score: specialist("shipwright") },
        { label: { en: "Combatant", fr: "Combattant" }, icon: "shield", role: "combatant", count: 3, fits: () => true },
      ],
      power: parse(`monkey-d-luffy:10 roronoa-zoro:9 nami:5 usopp:5 sanji:9 tony-tony-chopper:6 nico-robin:7 franky:7 brook:7 jinbe:8 shanks:10
        buggy:4 alvida:2 koby:6 helmeppo:3 morgan:3 kuro:4 krieg:3 zeff:3 arlong:4 nojiko:1 bell-mere:3 smoker:7 tashigi:5
        monkey-d-dragon:10 gol-d-roger:10 shimotsuki-kuina:2 dracule-mihawk:10 crocodile:7 daz-bonez:5 bentham:4 galdino:4 nefertari-vivi:2
        wapol:3 kureha:3 hiriluk:1 portgas-d-ace:6 enel:7 wyper:5 gan-fall:4 marshall-d-teach:10 kuzan:10 iceburg:3 rob-lucci:8 kaku:7
        kalifa:4 spandam:1 monkey-d-garp:10 gecko-moria:6 perona:5 bartholomew-kuma:6 silvers-rayleigh:10 eustass-kid:9 trafalgar-law:9
        killer:7 basil-hawkins:7 x-drake:7 jewelry-bonney:7 boa-hancock:9 emporio-ivankov:7 magellan:8 edward-newgate:10 polo-marco:9
        sengoku:10 sakazuki:10 borsalino:10 hody-jones:5 shirahoshi:2 neptune:5 fisher-tiger:7 caesar-clown:6 monet:5 vergo:7 kin-emon:6
        kouzuki-momonosuke:5 donquixote-doflamingo:8 issho:10 sabo:9 rebecca:5 kyros:4 bartolomeo:6 cavendish:6 carrot:6 pedro:6
        inuarashi:7 nekomamushi:7 charlotte-linlin:10 charlotte-katakuri:9 charlotte-pudding:3 charlotte-cracker:8 vinsmoke-judge:6
        vinsmoke-reiju:6 kaidou:10 king:9 queen:9 jack:8 yamato:9 kouzuki-oden:10 kouzuki-hiyori:3 vegapunk:4
        tom:4 paulie:3 doc-q:3 imu:10 crocus:5 nico-olvia:3 dorry:5 brogy:5 bellamy:5 gin:3 laffitte:7 tsuru:8 jozu:8 bepo:5 urouge:7
        scratchmen-apoo:7 benn-beckman:9 lucky-roux:8 yasopp:8 streusen:4 charlotte-perospero:7 charlotte-oven:8 kouzuki-sukiyaki:3 charlotte-brulee:4 jaygarcia-saturn:9 marcus-mars:9 topman-warcury:9
        ethanbaron-v-nusjuro:9 shepherd-ju-peter:9 scopper-gaban:10 den:3 charlos:1 gaimon:1 peepley-lulu:4 figarland-garling:10 figarland-shamrock:9 rocks-d-xebec:10 jesus-burgess:8 vasco-shot:6 catarina-devon:7 pica:5 diamante:6 ideo:4 don-chinjao:7 aramaki:10 makino:1 curly-dadan:2 capone-bege:7 hogback:3 foxy:3 caribou:4 kawamatsu:7 kanjuro:6 ulti:7 sasaki:6 charlotte-smoothie:8 black-maria:6 nezumi:3 higuma:2 gem-mr-5:3`),
    },

    jujutsukaisen: {
      slots: [
        { label: { en: "Tokyo Jujutsu High", fr: "École de Tokyo" }, icon: "shield", count: 2, fits: (c) => has(c.aff, "Tokyo Jujutsu High") },
        { label: { en: "Kyoto Jujutsu High", fr: "École de Kyoto" }, icon: "book", count: 1, fits: (c) => has(c.aff, "Kyoto Jujutsu High"),
          score: rated({ "noritoshi-kamo": 8, mechamaru: 8, "mai-zen-in": 7 }) },
        // Naoya, Naobito and Ogi are "special grade 1", a rank below special grade.
        { label: { en: "Special Grade", fr: "Grade spécial" }, icon: "flame", count: 1, fits: (c) => c.grade === "Special Grade" && !["naoya-zen-in", "naobito-zen-in", "ogi-zen-in"].includes(c.id) },
        { label: { en: "Curse", fr: "Fléau" }, icon: "skull", count: 2, fits: (c) => has(c.race, "Cursed Spirit", "Death Painting", "Incarnated") || has(c.aff, "Curse Users") || c.id === "larue" },
        { label: { en: "Great Clan", fr: "Grand clan" }, icon: "eye", count: 1, fits: (c) => has(c.aff, "Zen'in Clan", "Gojo Clan", "Kamo Clan") || c.id === "megumi-fushiguro" },
        // Sorcerers outside the schools: freelancers (Mei Mei) and Culling Game players (Higuruma, Takaba…).
        { label: { en: "Freelance & Culling Game", fr: "Indépendants & Jeu d'extermination" }, icon: "dice", count: 1, fits: (c) => has(c.aff, "None") && has(c.race, "Human") && c.id !== "larue",
          score: rated({ "hiromi-higuruma": 9, "hana-kurusu": 8 }) },
        { label: HEALER, icon: "cross", role: "healer", count: 1, fits: anyone, score: role(ROLES.jujutsukaisen.healer) },
        { label: STRATEGIST, icon: "chess", role: "strategist", count: 1, fits: anyone, score: role(ROLES.jujutsukaisen.strategist) },
      ],
      power: parse(`yuji-itadori:9 megumi-fushiguro:8 nobara-kugisaki:6 satoru-gojo:10 ryomen-sukuna:10 kento-nanami:8 maki-zen-in:9 toge-inumaki:7
        panda:6 yuta-okkotsu:10 masamichi-yaga:6 shoko-ieiri:3 kiyotaka-ijichi:2 aoi-todo:10 mai-zen-in:4 kasumi-miwa:3 noritoshi-kamo:6
        momo-nishimiya:4 mechamaru:6 utahime-iori:5 yoshinobu-gakuganji:6 mahito:9 jogo:8 hanami:8 dagon:7 junpei-yoshino:3 suguru-geto:9
        choso:8 eso:6 kechizu:4 mei-mei:7 ui-ui:4 atsuya-kusakabe:7 toji-fushiguro:10 riko-amanai:1 misato-kuroi:1 yu-haibara:4
        yuki-tsukumo:10 naoya-zen-in:7 naobito-zen-in:8 haruta-shigemo:3 takuma-ino:5 arata-nitta:3 uraume:8 miguel-oduol:7 larue:6
        tengen:7 tsumiki-fushiguro:4 hajime-kashimo:9 hiromi-higuruma:8 kinji-hakari:9 fumihiko-takaba:7 ryu-ishigori:8 takako-uro:7
        reggie-star:6 charles-bernard:6 hana-kurusu:7 kenjaku:9 ogi-zen-in:6 granny-ogami:4`),
    },

    blackclover: {
      slots: [
        { label: { en: "Black Bulls", fr: "Taureau Noir" }, icon: "flame", count: 2, fits: (c) => has(c.aff, "Black Bulls") },
        { label: { en: "Golden Dawn", fr: "Aube Dorée" }, icon: "star", count: 1, fits: (c) => has(c.aff, "Golden Dawn"),
          score: rated({ "william-vangeance": 9, "langris-vaude": 8, "klaus-lunettes": 7 }) },
        // Squad captains, the Wizard King (Mereoleona leads the Crimson Lions in Fuegoleon's place), Lucius, who leads the Paladins, and Licht, the elves' leader.
        { label: { en: "Captain", fr: "Capitaine" }, role: "captain", icon: "crown", count: 1, score: leader,
          fits: (c) => ["yami-sukehiro", "william-vangeance", "nozel-silva", "fuegoleon-vermillion", "mereoleona-vermillion", "charlotte-roselei",
            "jack-the-ripper", "dorothy-unsworth", "kaiser-granvorka", "rill-boismortier", "julius-novachrono", "lucius-zogratis", "licht"].includes(c.id) },
        { label: { en: "Other squad", fr: "Autre escouade" }, icon: "shield", count: 1,
          fits: (c) => has(c.aff, "Silver Eagles", "Crimson Lion Kings", "Blue Rose", "Green Mantis", "Coral Peacock", "Purple Orca", "Aqua Deer") },
        { label: { en: "Elf", fr: "Elfe" }, icon: "leaf", count: 1, fits: (c) => has(c.race, "Elf") },
        { label: { en: "Enemy", fr: "Ennemi" }, icon: "skull", count: 1,
          fits: (c) => has(c.aff, "Eye of the Midnight Sun", "Dark Triad", "Eight Shining Generals") || has(c.country, "Diamond Kingdom", "Spade Kingdom") || (has(c.race, "Devil") && c.id !== "liebe") },
        { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: () => true },
        { label: HEALER, icon: "cross", role: "healer", count: 1, fits: anyone, score: role(ROLES.blackclover.healer) },
        { label: STRATEGIST, icon: "chess", role: "strategist", count: 1, fits: anyone, score: role(ROLES.blackclover.strategist) },
      ],
      power: parse(`asta:10 yami-sukehiro:10 noelle-silva:7 luck-voltia:6 magna-swing:5 vanessa-enoteca:6 finral-roulacase:5 gauche-adlai:6
        gordon-agrippa:5 grey:5 charmy-pappitson:6 zora-ideale:6 henry-legolant:5 secre-swallowtail:6 nacht-faust:9 sekke-bronzazza:3 liebe:8
        yuno:10 william-vangeance:8 klaus-lunettes:5 mimosa-vermillion:5 alecdora-sandler:4 langris-vaude:7 nozel-silva:9 solid-silva:4
        nebra-silva:4 fuegoleon-vermillion:8 leopold-vermillion:6 mereoleona-vermillion:10 charlotte-roselei:8 sol-marron:4 jack-the-ripper:8
        dorothy-unsworth:7 kahono:5 kiato:5 kirsch-vermillion:5 kaiser-granvorka:7 rill-boismortier:7 rebecca-scarlet:1 julius-novachrono:10
        marx-francois:4 damnatio-kira:6 sister-lily:2 patry:9 rhya:7 fana:7 vetto:8 sally:5 valtos:6 catherine:5 mars:7 lotus-whomalt:5
        fanzell-kruger:6 ladros:6 rades-spirito:5 moris-libardirt:6 witch-queen:8 licht:10 lumiere-silvamillion-clover:9 tetia:5 lolopechka:7
        gadjah:7 dante-zogratis:9 vanica-zogratis:9 zenon-zogratis:9 lucius-zogratis:10 morgen-faust:6 zagred:9 megicula:9 lucifero:10`),
    },

    attackontitan: {
      slots: [
        // Titan shifters (and the Smiling Titan): only once the anime has revealed them.
        { label: { en: "Titan", fr: "Titan" }, icon: "flame", count: 2, fits: (c) => has(c.race, "Titan Shifter", "Titan") },
        { label: { en: "Survey Corps", fr: "Bataillon d'exploration" }, icon: "swords", count: 2, fits: (c) => has(c.aff, "Survey Corps"),
          score: rated({ "hange-zoe": 7, "connie-springer": 6 }) },
        { label: STRATEGIST, icon: "chess", role: "strategist", count: 1, fits: anyone, score: role(ROLES.attackontitan.strategist) },
        // The Garrison (Pixis commands it) and the Military Police, with its Interior squad.
        { label: { en: "Garrison / Military Police", fr: "Garnison / Brigades spéciales" }, icon: "shield", count: 1,
          fits: (c) => has(c.aff, "Garrison", "Military Police", "Interior Police"),
          score: rated({ "dot-pixis": 10, "rico-brzenska": 8, "ian-dietrich": 6 }) },
        // Marley's side: the Warriors (once the anime has unmasked them), its army and the Tybur family.
        { label: { en: "Marley", fr: "Mahr" }, icon: "skull", count: 1, fits: (c) => has(c.aff, "Warriors", "Marley", "Tybur Family") },
        // Commanders and squad leaders, with the captains' bonus; Erwin, the Survey Corps' commander, is worth 12 there (10 with the bonus).
        { label: { en: "Commander / Leader", fr: "Commandant / Leader" }, icon: "crown", role: "captain", count: 1,
          fits: (c) => SNK_LEADERS.includes(c.id), score: (c, power) => Math.max(c.id === "erwin-smith" ? 12 : 0, leader(c, power)) },
        { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: anyone },
      ],
      power: parse(`eren-yeager:10 mikasa-ackerman:9 armin-arlert:8 levi:10 erwin-smith:7 hange-zoe:6 jean-kirstein:6 connie-springer:5
        sasha-blouse:5 historia-reiss:4 ymir:8 mike-zacharias:7 petra-ral:5 oluo-bozado:5 eld-jinn:5 gunther-schultz:4 moblit-berner:3
        floch-forster:4 reiner-braun:9 bertholdt-hoover:9 annie-leonhart:9 marco-bott:3 keith-shadis:4 dot-pixis:5 hannes:3
        rico-brzenska:4 ian-dietrich:4 anka-rheinberger:3 nile-dok:3 hitch-dreyse:2 darius-zackly:3 kenny-ackerman:8 djel-sannes:3
        rod-reiss:6 frieda-reiss:8 kaya:1 grisha-yeager:7 carla-yeager:1 dina-fritz:4 eren-kruger:7 zeke-yeager:10 marcel-galliard:7
        pieck-finger:7 porco-galliard:8 gabi-braun:4 falco-grice:6 colt-grice:3 theo-magath:4 willy-tybur:3 lara-tybur:8 niccolo:2
        yelena:5 onyankopon:3 kiyomi-azumabito:2 ymir-fritz:10 marlo-freudenberg:4 traute-carven:6`),
    },
  };
  window.CREW_DEFAULT_POWER = DEFAULT_POWER;
})();
