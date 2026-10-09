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
        nelliel-tu-odelschwanck:7 isshin-kurosaki:6 tessai-tsukabishi:7 kisuke-urahara:5 mayuri-kurotsuchi:8 nemu-kurotsuchi:5 giselle-gewelle:3 senjumaru-shutara:7 izuru-kira:7 rukia-kuchiki:4 ryuken-ishida:7 uryu-ishida:6 kiyone-kotetsu:6 momo-hinamori:6`),
      // Inventors and researchers: the Hogyoku, the SRDI, Szayel's lab, Oetsu's forge, Hikifune (12th Division before
      // Kisuke), Kukaku's fireworks cannon, Akon running the SRDI's lab. Strategists too: Yhwach sees the future,
      // Shunsui and Gin play their long games, Haschwalth runs the Sternritter.
      engineer: parse(`kisuke-urahara:10 mayuri-kurotsuchi:10 sosuke-aizen:9 szayelaporro-granz:9 oetsu-nimaiya:9 akon:8 kirio-hikifune:7
        senjumaru-shutara:9 kukaku-shiba:7 nemu-kurotsuchi:6 yukio-hans-vorarlberna:8 tessai-tsukabishi:5 uryu-ishida:7 yhwach:9 shunsui-kyoraku:7 jugram-haschwalth:7 gin-ichimaru:6 askin-nakk-le-vaar:6 jushiro-ukitake:6 shukuro-tsukishima:8 kugo-ginjo:7 ichibe-hyosube:8 ryuken-ishida:7 hachigen-ushoda:6`),
    },
    hunterxhunter: {
      // Leorio studies medicine; Nanika heals with a wish; Pitou operates as Doctor Blythe; Bisky's massages.
      // Machi sews severed limbs back with Nen threads; Kurapika's Holy Chain heals.
      healer: parse("leorio-paradinight:10 alluka-zoldyck:10 neferpitou:9 cheadle-yorkshire:8 machi-komacine:9 kurapika:8 biscuit-krueger:7 shaiapouf:4 senritsu:6 morel-mackernasey:5"),
      strategist: parse(`pariston-hill:10 maha-zoldyck:8 komugi:9 meruem:9 ging-freecss:10 shaiapouf:8 morel-mackernasey:8 genthru:8 shalnark:8 kurapika:8
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
      // Diamond Kingdom's mad scientist, and Sally, the Eye of the Midnight Sun's; Henry reshapes the Black Bulls' hideout; Rades reanimates corpses.
      // Kaiser plans the Purple Orcas' battles; Nacht is the Black Bulls' spy; Fanzell trained Asta and leads the resistance.
      strategist: parse(`lucius-zogratis:10 sally:9 moris-libardirt:9 patry:9 kaiser-granvorka:9 julius-novachrono:8 marx-francois:8 damnatio-kira:8
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
        { label: { en: "Shinigami", fr: "Shinigami" }, icon: "sword", count: 2, fits: (c) => has(c.race, "Shinigami", "Hybrid"),
          score: rated({ "kaname-tosen": 8, "tessai-tsukabishi": 7, "kiyone-kotetsu": 3, "sentaro-kotsubaki": 3, "zennosuke-kurumadani": 2 }) },
        // Tosen took a Hollow's power (Resurrección) against Komamura.
        { label: { en: "Arrancar", fr: "Arrancar" }, icon: "skull", count: 2, fits: (c) => has(c.race, "Arrancar", "Hollow") || c.id === "kaname-tosen",
          score: rated({ "kaname-tosen": 9 }) },
        // Ichigo inherited a Quincy's blood from his mother and wears a Hollow mask like the Visored.
        // Gerard and Pernida are the Soul King's heart and left arm, in Yhwach's royal guard.
        { label: { en: "Quincy", fr: "Quincy" }, icon: "star", count: 2, fits: (c) => has(c.race, "Quincy") || c.id === "ichigo-kurosaki",
          score: rated({ "uryu-ishida": 10, "lille-barro": 9, "gremmy-thoumeaux": 8, "liltotto-lamperd": 6, "ichigo-kurosaki": 10, "gerard-valkyrie": 9, "pernida-parnkgjas": 9 }) },
        { label: { en: "Visored", fr: "Visored" }, icon: "mask", count: 1, fits: (c) => has(c.race, "Visored") || c.id === "ichigo-kurosaki",
          score: rated({ "ichigo-kurosaki": 10, "shinji-hirako": 10, "kensei-muguruma": 9, "hachigen-ushoda": 8, "rojuro-otoribashi": 7, "mashiro-kuna": 4 }) },
        // Humans, wandering souls and Fullbringers; Isshin, Ryuken and Masaki live as humans in Karakura.
        { label: { en: "Human / Wandering Soul / Fullbringer", fr: "Humain / Âme errante / Fullbringer" }, icon: "person", count: 1,
          fits: (c) => has(c.race, "Human", "Fullbringer", "Mod Soul", "Soul", "Hybrid") || ["isshin-kurosaki", "ryuken-ishida", "masaki-kurosaki"].includes(c.id),
          score: rated({ "kukaku-shiba": 5, "kugo-ginjo": 10, "shukuro-tsukishima": 9 }) },
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
        bambietta-basterbine:7 candice-catnipp:6 liltotto-lamperd:6 meninas-mcallon:4 giselle-gewelle:5 as-nodt:7 quilge-opie:6
        gremmy-thoumeaux:8 lille-barro:9 pernida-parnkgjas:9 gerard-valkyrie:9 ichibe-hyosube:10 senjumaru-shutara:9 tenjiro-kirinji:9 oetsu-nimaiya:9 kirio-hikifune:9 akon:3 dordoni-alessandro-del-socaccio:5 cirucci-sanderwicci:5 gantenbainne-mosqueda:5 kiyone-kotetsu:3 sentaro-kotsubaki:3 zennosuke-kurumadani:2 ikumi-unagiya:2`),
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
        satotz:5 menchi:4 buhara:4 hanzo:5 pokkle:3 tonpa:1 bodoro:2 ponzu:3 lippo:4 beans:1 silva-zoldyck:9 zeno-zoldyck:10 maha-zoldyck:10 kikyo-zoldyck:5
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
        vegito:10 gogeta:10 broly:10 kefla:8 moro:9 paragus:2 gine:1 king-vegeta:4 pan:4 belmod:9 granolah:9`),
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
        buggy:4 alvida:2 koby:6 helmeppo:3 morgan:3 fullbody:3 kuro:4 krieg:3 zeff:3 arlong:4 nojiko:1 bell-mere:3 smoker:7 tashigi:5
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
  // ── The six anime added in October 2026 ──
  // Pokémon: a team of starters, legends and types, drawn among the fully evolved Pokémon and the legends (plus Pikachu
  // and Eevee), so a team isn't full of first stages. Every Pokémon's power comes with the data (pokemon/scripts/build.py:
  // its base stats), the few below are set by hand.
  // Healing and strategy are side roles for a Pokémon: one that isn't listed still brings 60 % of its power.
  const pokeRole = (table) => (c, power) => table[c.id] ?? Math.max(1, Math.round(power * 0.6));
  window.CREW_GAMES.pokemon = {
    pool: (c) => c.final || ["Legendary", "Mythical"].includes(c.category) || ["pikachu", "eevee"].includes(c.id),
    slots: [
      { label: { en: "Starter", fr: "Starter" }, icon: "star", count: 1, fits: (c) => c.starter === true },
      { label: { en: "Legendary / Mythical", fr: "Légendaire / Fabuleux" }, icon: "crown", count: 1, fits: (c) => ["Legendary", "Mythical"].includes(c.category) },
      { label: { en: "Fire / Electric", fr: "Feu / Électrik" }, icon: "flame", count: 1, fits: (c) => has(c.types, "Fire", "Electric") },
      { label: { en: "Water / Ice", fr: "Eau / Glace" }, icon: "globe", count: 1, fits: (c) => has(c.types, "Water", "Ice") },
      { label: { en: "Grass / Ground / Rock", fr: "Plante / Sol / Roche" }, icon: "leaf", count: 1, fits: (c) => has(c.types, "Grass", "Ground", "Rock") },
      { label: { en: "Dragon / Psychic / Ghost", fr: "Dragon / Psy / Spectre" }, icon: "eye", count: 1, fits: (c) => has(c.types, "Dragon", "Psychic", "Ghost") },
      // The Pokémon Centre's nurses and the great healers of the games.
      { label: HEALER, icon: "cross", role: "healer", count: 1, fits: anyone,
        score: pokeRole(parse(`blissey:10 chansey:9 audino:8 comfey:7 alomomola:7 sylveon:7 togekiss:7 hatterene:7 florges:6 clefable:6
          indeedee:6 happiny:5 wigglytuff:5 miltank:5 lumineon:4 bellossom:4`)) },
      // The cleverest: Alakazam's IQ of 5000, Metagross's four brains, Slowking's crown.
      { label: STRATEGIST, icon: "chess", role: "strategist", count: 1, fits: anyone,
        score: pokeRole(parse(`alakazam:10 mewtwo:10 metagross:9 slowking:9 necrozma:8 hoopa:8 deoxys:8 xatu:7 espeon:7 gardevoir:7 lucario:7
          beheeyem:6 kadabra:6 bronzong:6 porygon-z:6 rotom:5 abra:4`)) },
      { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: anyone },
    ],
    power: parse(`pikachu:6 raichu:7 charizard:8 gengar:8 lucario:8 eevee:4 greninja:8 snorlax:8 gyarados:8 lapras:7`),
  };

  Object.assign(window.CREW_GAMES, {
    demonslayer: {
      slots: [
        { label: { en: "Hashira", fr: "Pilier" }, icon: "crown", count: 2, fits: (c) => ["Hashira", "Former Hashira"].includes(c.rank) },
        { label: { en: "Demon Slayer", fr: "Pourfendeur" }, icon: "sword", count: 2, fits: (c) => has(c.aff, "Demon Slayer Corps") },
        { label: { en: "Upper Moon", fr: "Lune supérieure" }, icon: "skull", count: 1, fits: (c) => ["Upper Moon", "Demon King"].includes(c.rank) },
        { label: { en: "Demon", fr: "Démon" }, icon: "flame", count: 1, fits: (c) => has(c.race, "Demon") },
        // Tamayo's medicine, Shinobu's poisons and the Butterfly Mansion's care; Nezuko's blood burns away poison.
        { label: HEALER, icon: "cross", role: "healer", count: 1, fits: anyone,
          score: role(parse("tamayo:10 shinobu-kocho:9 aoi-kanzaki:8 kanae-kocho:8 nezuko-kamado:7 yushiro:6 kanao-tsuyuri:5 kagaya-ubuyashiki:4")) },
        // Kagaya reads the future and leads the Corps; Muzan has hidden for a thousand years; Tengen reads a fight like a score.
        { label: STRATEGIST, icon: "chess", role: "strategist", count: 1, fits: anyone,
          score: role(parse(`kagaya-ubuyashiki:10 muzan-kibutsuji:9 tamayo:8 tengen-uzui:8 doma:7 shinobu-kocho:7 yushiro:7 sakonji-urokodaki:6
            gyomei-himejima:6 nakime:6 tanjiro-kamado:6 giyu-tomioka:5 obanai-iguro:5 hotaru-haganezuka:4`)) },
        { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: anyone },
      ],
      power: parse(`tanjiro-kamado:9 nezuko-kamado:7 zenitsu-agatsuma:7 inosuke-hashibira:7 kanao-tsuyuri:7 genya-shinazugawa:6 murata:3 aoi-kanzaki:2
        sabito:6 makomo:4 giyu-tomioka:9 shinobu-kocho:7 kyojuro-rengoku:9 tengen-uzui:8 mitsuri-kanroji:8 muichiro-tokito:9 gyomei-himejima:10
        sanemi-shinazugawa:9 obanai-iguro:8 kanae-kocho:7 sakonji-urokodaki:6 jigoro-kuwajima:6 shinjuro-rengoku:6 yoriichi-tsugikuni:10
        kagaya-ubuyashiki:2 senjuro-rengoku:2 hotaru-haganezuka:3 kotetsu:1 makio:4 suma:3 hinatsuru:4 tamayo:5 yushiro:4 muzan-kibutsuji:10
        kokushibo:10 doma:9 akaza:9 hantengu:8 gyokko:7 daki:6 gyutaro:8 nakime:7 rui:6 enmu:5 kyogai:4 susamaru:4 yahaba:4 hand-demon:3`),
    },

    myheroacademia: {
      slots: [
        { label: { en: "Class 1-A", fr: "Classe 1-A" }, icon: "star", count: 2, fits: (c) => has(c.aff, "Class 1-A"), score: rated({ "fumikage-tokoyami": 8 }) },
        { label: { en: "Pro Hero", fr: "Héros pro" }, icon: "shield", count: 2, fits: (c) => c.status === "Pro Hero", score: rated({ "sir-nighteye": 5, hawks: 9 }) },
        { label: { en: "Villain", fr: "Vilain" }, icon: "skull", count: 2, fits: (c) => c.status === "Villain", score: rated({ "mr-compress": 5, moonfish: 4, mustard: 4 }) },
        { label: { en: "U.A.", fr: "Yuei" }, icon: "book", count: 1, fits: (c) => has(c.aff, "Class 1-B", "General Studies", "U.A. Big Three", "U.A. Teachers", "U.A. High School") },
        // Recovery Girl's kiss, Eri's rewind, Overhaul rebuilds bodies; Garaki keeps All For One alive, Thirteen and
        // Tsuyu are rescue heroes, Momo creates bandages and medicine.
        { label: HEALER, icon: "cross", role: "healer", count: 1, fits: anyone,
          score: role(parse("recovery-girl:10 eri:9 overhaul:8 kyudai-garaki:7 thirteen:6 tsuyu-asui:6 all-for-one:5 momo-yaoyorozu:5")) },
        { label: STRATEGIST, icon: "chess", role: "strategist", count: 1, fits: anyone,
          score: role(parse(`nezu:10 all-for-one:10 sir-nighteye:9 tomura-shigaraki:8 momo-yaoyorozu:9 izuku-midoriya:8 shota-aizawa:7 hawks:7
            katsuki-bakugo:6 overhaul:7 re-destro:7 tenya-iida:6 best-jeanist:6 lady-nagant:5 star-and-stripe:9 all-might:9 fumikage-tokoyami:6 mirio-togata:4`)) },
        { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: anyone },
      ],
      power: parse(`izuku-midoriya:10 katsuki-bakugo:9 shoto-todoroki:9 ochaco-uraraka:7 tenya-iida:7 eijiro-kirishima:7 momo-yaoyorozu:7
        tsuyu-asui:6 denki-kaminari:6 kyoka-jiro:5 fumikage-tokoyami:7 mina-ashido:6 minoru-mineta:3 yuga-aoyama:5 mezo-shoji:5 hanta-sero:5
        rikido-sato:5 koji-koda:3 toru-hagakure:3 mashirao-ojiro:4 neito-monoma:6 itsuka-kendo:6 tetsutetsu-tetsutetsu:6 hitoshi-shinso:6
        mirio-togata:9 tamaki-amajiki:7 nejire-hado:7 eri:6 all-might:10 shota-aizawa:8 present-mic:6 midnight:6 cementoss:7 nezu:3
        recovery-girl:2 endeavor:9 hawks:8 best-jeanist:7 mirko:8 edgeshot:7 gran-torino:7 sir-nighteye:6 fatgum:6 star-and-stripe:10
        lady-nagant:7 tomura-shigaraki:10 all-for-one:10 kurogiri:7 dabi:9 himiko-toga:7 twice:8 mr-compress:6 spinner:6 magne:6
        gigantomachia:9 muscular:7 stain:7 overhaul:8 re-destro:8 thirteen:6 moonfish:4 mustard:4 kyudai-garaki:3`),
    },

    // A volleyball team: one setter, two spikers, two middle blockers, a libero, the captain and the bench.
    haikyuu: {
      slots: [
        { label: { en: "Captain", fr: "Capitaine" }, icon: "crown", role: "captain", count: 1, score: (c, p) => ({ "yuji-terushima": 7 })[c.id] ?? leader(c, p),
          fits: (c) => ["daichi-sawamura", "toru-oikawa", "tetsuro-kuroo", "kotaro-bokuto", "wakatoshi-ushijima", "shinsuke-kita", "yuji-terushima",
            "kenji-futakuchi", "korai-hoshiumi", "chikara-ennoshita"].includes(c.id) },
        { label: { en: "Setter", fr: "Passeur" }, icon: "star", count: 1, fits: (c) => c.position === "Setter", score: rated({ "atsumu-miya": 10, "kenjiro-shirabu": 5 }) },
        { label: { en: "Spiker", fr: "Attaquant" }, icon: "bolt", count: 2, fits: (c) => ["Wing Spiker", "Opposite"].includes(c.position), score: rated({ "osamu-miya": 10, "akira-kunimi": 5, "takahiro-hanamaki": 5 }) },
        { label: { en: "Middle Blocker", fr: "Central" }, icon: "shield", count: 2, fits: (c) => c.position === "Middle Blocker",
          score: rated({ "tadashi-yamaguchi": 4, "yutaro-kindaichi": 5, "lev-haiba": 6, "takanobu-aone": 7 }) },
        { label: { en: "Libero", fr: "Libéro" }, icon: "eye", count: 1, fits: (c) => c.position === "Libero",
          score: rated({ "yu-nishinoya": 10, "hayato-yamagata": 7, "haruki-komi": 5, "michinari-akagi": 5, "kosuke-sakunami": 4 }) },
        { label: { en: "Coach / Manager", fr: "Coach / Manager" }, icon: "book", count: 1, fits: (c) => ["Coach", "Advisor", "Manager", "Supporter"].includes(c.position),
          score: rated({ "keishin-ukai": 10, "ikkei-ukai": 9, "kiyoko-shimizu": 8, "ittetsu-takeda": 7, "hitoka-yachi": 7, "tanji-washijo": 6, "yasufumi-nekomata": 6, "saeko-tanaka": 5 }) },
        { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: (c) => !["Coach", "Advisor", "Manager", "Supporter"].includes(c.position) },
      ],
      power: parse(`shoyo-hinata:9 tobio-kageyama:10 kei-tsukishima:8 tadashi-yamaguchi:5 daichi-sawamura:7 koshi-sugawara:6 asahi-azumane:8
        yu-nishinoya:9 ryunosuke-tanaka:7 chikara-ennoshita:5 hisashi-kinoshita:3 kazuhito-narita:3 kiyoko-shimizu:2 hitoka-yachi:2
        ittetsu-takeda:2 keishin-ukai:5 saeko-tanaka:2 toru-oikawa:10 hajime-iwaizumi:8 issei-matsukawa:6 takahiro-hanamaki:6
        yutaro-kindaichi:6 akira-kunimi:6 kentaro-kyotani:7 shinji-watari:6 tetsuro-kuroo:9 kenma-kozume:8 morisuke-yaku:9 lev-haiba:7
        taketora-yamamoto:7 nobuyuki-kai:6 kotaro-bokuto:10 keiji-akaashi:8 kenji-futakuchi:7 takanobu-aone:8 yuji-terushima:7
        wakatoshi-ushijima:10 satori-tendo:9 kenjiro-shirabu:7 eita-semi:7 tsutomu-goshiki:7 atsumu-miya:10 osamu-miya:9 shinsuke-kita:7
        rintaro-suna:8 aran-ojiro:9 kiyoomi-sakusa:10 motoya-komori:8 korai-hoshiumi:9 sachiro-hirugami:8 ikkei-ukai:3 yasufumi-nekomata:3 tanji-washijo:3 hayato-yamagata:7 michinari-akagi:6 haruki-komi:6 kosuke-sakunami:4`),
    },

    fireforce: {
      slots: [
        { label: { en: "Company 8", fr: "8e brigade" }, icon: "flame", count: 2, fits: (c) => has(c.aff, "Company 8"), score: rated({ "lisa-isaribi": 5 }) },
        { label: { en: "Captain", fr: "Capitaine" }, icon: "crown", role: "captain", count: 1, fits: (c) => c.role === "Captain",
          score: (c, p) => ({ "akitaru-obi": 10, hibana: 9, "gustav-honda": 6, "kayoko-huang": 6, "soichiro-hague": 5 })[c.id] ?? leader(c, p) },
        { label: { en: "Other company", fr: "Autre brigade" }, icon: "shield", count: 1, fits: (c) => has(c.aff, "Company 1", "Company 2", "Company 3", "Company 4", "Company 5", "Company 6", "Company 7") },
        { label: { en: "White Clad", fr: "Hommes en blanc" }, icon: "skull", count: 1, fits: (c) => has(c.aff, "White Clad") || c.role === "Pillar" },
        { label: { en: "Adolla Burst", fr: "Adolla Burst" }, icon: "eye", count: 1, fits: (c) => c.adolla === "Yes" },
        // Second generation: they bend existing flames (Maki, Hibana, Hinawa, Karim, Haumea; Benimaru is both).
        { label: { en: "2nd generation", fr: "2e génération" }, icon: "bolt", count: 1, fits: (c) => /Second/.test(c.gen ?? ""),
          score: rated({ "benimaru-shinmon": 10, "haumea": 8, "karim-flam": 6, "takehisa-hinawa": 5 }) },
        // Vulcan builds Company 8's gear, Licht studies combustion, Giovanni his insect weapons; Joker plays everyone.
        { label: { en: "Scientist / Strategist", fr: "Scientifique / Stratège" }, icon: "flask", role: "strategist", count: 1, fits: anyone,
          score: role(parse("vulcan-joseph:10 viktor-licht:10 giovanni:8 joker:8 akitaru-obi:7 takehisa-hinawa:7 kurono:6 haumea:6 leonard-burns:6 iris:4")) },
        { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: anyone },
      ],
      power: parse(`shinra-kusakabe:10 arthur-boyle:9 akitaru-obi:7 takehisa-hinawa:6 maki-oze:7 iris:3 tamaki-kotatsu:6 viktor-licht:3
        vulcan-joseph:3 ogun-montgomery:7 lisa-isaribi:6 hibana:7 benimaru-shinmon:10 konro-sagamiya:7 leonard-burns:9 karim-flam:7
        rekka-hoshimiya:7 giovanni:7 joker:9 sho-kusakabe:9 haumea:8 charon:8 arrow:6 assault:4 dragon:10 yona:7 inca-kasugatani:5
        nataku-son:7 kurono:7 gustav-honda:5 kayoko-huang:5 soichiro-hague:4`),
    },

    slime: {
      slots: [
        { label: { en: "Tempest", fr: "Tempest" }, icon: "leaf", count: 3, fits: (c) => has(c.aff, "Tempest"),
          score: rated({ benimaru: 8, ranga: 7, geld: 6, gabiru: 5 }) },
        { label: { en: "Demon Lord", fr: "Seigneur démon" }, icon: "crown", count: 2, fits: (c) => c.title === "Demon Lord",
          score: rated({ "rimuru-tempest": 10, "guy-crimson": 9, "milim-nava": 9, "leon-cromwell": 8, dagruel: 8, carrion: 7, frey: 6, clayman: 5 }) },
        { label: { en: "Demon / Dragon", fr: "Démon / Dragon" }, icon: "flame", count: 1, fits: (c) => has(c.race, "Demon", "Dragon", "Dragonoid"),
          score: rated({ velzard: 10, "veldora-tempest": 9, "milim-nava": 9, diablo: 8, "guy-crimson": 8, testarossa: 7, ultima: 6, carrera: 6 }) },
        { label: { en: "Human", fr: "Humain" }, icon: "person", count: 1, fits: (c) => has(c.race, "Human"),
          score: rated({ "chloe-aubert": 10, "hinata-sakaguchi": 8, "granbell-rozzo": 8, shizu: 7 }) },
        { label: HEALER, icon: "cross", role: "healer", count: 1, fits: anyone,
          score: role(parse("shuna:10 luminous-valentine:9 rimuru-tempest:8 treyni:7 ramiris:6 hinata-sakaguchi:6 shizu:5")) },
        { label: STRATEGIST, icon: "chess", role: "strategist", count: 1, fits: anyone,
          // Kurobe forges Tempest's weapons; Granbell schemed for centuries behind the Western Nations.
          score: role(parse(`diablo:10 kurobe:10 rimuru-tempest:9 benimaru:9 guy-crimson:9 yuuki-kagurazaka:9 testarossa:9 souei:8 luminous-valentine:8
            gazel-dwargo:8 elmesia-el-ru-sarion:8 clayman:8 granbell-rozzo:8 shuna:7 laplace:6 hakuro:6 rigurd:5 fuze:5`)) },
        { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: anyone },
      ],
      power: parse(`rimuru-tempest:10 veldora-tempest:10 benimaru:9 shuna:6 shion:8 souei:7 hakuro:7 kurobe:3 ranga:8 rigurd:4 gobta:5 rigur:5
        gabiru:7 geld:8 kaijin:3 treyni:6 diablo:10 testarossa:9 ultima:9 carrera:9 mjurran:5 milim-nava:10 carrion:8 frey:7 clayman:6
        guy-crimson:10 leon-cromwell:9 ramiris:4 luminous-valentine:9 dino:8 dagruel:9 shizu:6 hinata-sakaguchi:9 masayuki-honjo:3
        yuuki-kagurazaka:9 chloe-aubert:9 fuze:4 youm:5 gazel-dwargo:8 elmesia-el-ru-sarion:6 edmaris:2 razen:6 gelmud:3 phobio:5
        laplace:6 footman:5 velzard:10 granbell-rozzo:8`),
    },

    onepunchman: {
      slots: [
        { label: { en: "S-Class", fr: "Classe S" }, icon: "crown", count: 2, fits: (c) => c.rank === "S-Class" },
        { label: { en: "Hero", fr: "Héros" }, icon: "shield", count: 2, fits: (c) => has(c.aff, "Hero Association") },
        { label: { en: "Monster", fr: "Monstre" }, icon: "skull", count: 2, fits: (c) => has(c.race, "Monster", "Alien") || has(c.aff, "Monster Association") },
        { label: { en: "Free fighter", fr: "Combattant libre" }, icon: "swords", count: 1, fits: (c) => has(c.aff, "None") && has(c.race, "Human") },
        // Kuseno built and repairs Genos; Genus grows bodies; Metal Knight fixes machines; Mumen Rider gives first aid.
        { label: HEALER, icon: "cross", role: "healer", count: 1, fits: anyone,
          score: role(parse("dr-kuseno:10 dr-genus:9 metal-knight:7 child-emperor:6 zombieman:4 mumen-rider:4 sitch:3")) },
        { label: STRATEGIST, icon: "chess", role: "strategist", count: 1, fits: anyone,
          score: role(parse("child-emperor:10 metal-knight:10 dr-genus:9 psykos:9 king:8 bang:7 amai-mask:6 fubuki:6 atomic-samurai:5 sitch:4")) },
        { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: anyone },
      ],
      power: parse(`saitama:10 genos:8 mumen-rider:2 king:1 tatsumaki:10 fubuki:7 bang:9 atomic-samurai:8 child-emperor:7 metal-knight:8
        zombieman:6 drive-knight:8 pig-god:7 superalloy-darkshine:8 watchdog-man:9 flashy-flash:8 metal-bat:8 tank-top-master:6
        puri-puri-prisoner:6 amai-mask:8 stinger:4 iaian:6 death-gatling:5 snek:3 sitch:1 sonic:7 garou:10 charanko:3 suiryu:8
        dr-genus:3 vaccine-man:5 mosquito-girl:4 carnage-kabuto:7 deep-sea-king:6 boros:10 melzargard:8 geryuganshoop:7 orochi:9
        gouketsu:8 psykos:9 elder-centipede:8 homeless-emperor:8 black-sperm:8 bomb:9 bakuzan:6 choze:5 dr-kuseno:2`),
    },
    sololeveling: {
      slots: [
        { label: { en: "S-Rank hunter", fr: "Chasseur de rang S" }, icon: "crown", count: 2, fits: (c) => has(c.race, "Human") && has(c.rank, "S-Rank", "National Level") },
        { label: { en: "Hunter", fr: "Chasseur" }, icon: "sword", count: 2, fits: (c) => has(c.race, "Human") && !has(c.rank, "Unranked") },
        { label: { en: "Shadow soldier", fr: "Soldat de l'ombre" }, icon: "mask", count: 1, fits: (c) => has(c.race, "Shadow") },
        { label: { en: "Monster / Monarch", fr: "Monstre / Monarque" }, icon: "skull", count: 2, fits: (c) => !has(c.race, "Human", "Shadow") },
        // Min Byung-Gyu is Korea's best healer; Akari Shimizu heals the Japanese raid team; Han Semi, Jung Yerim and
        // Lee Joohee are A/B-rank healers; Beru takes Min's healing; Jinwoo heals himself with potions and the System.
        { label: HEALER, icon: "cross", role: "healer", count: 1, fits: anyone,
          score: role(parse("min-byung-gyu:10 akari-shimizu:9 sung-jinwoo:9 beru:9 han-semi:8 jung-yerim:8 lee-joohee:8 ant-queen:6 esil-radiru:5 go-gunhee:5")) },
        // Go Gunhee and Woo Jinchul run the Association; Norma sees the future; Bellion and Igris command the shadows.
        { label: STRATEGIST, icon: "chess", role: "strategist", count: 1, fits: anyone,
          score: role(parse("go-gunhee:9 ashborn:9 sung-jinwoo:8 yogumunt:9 bellion:8 antares:8 woo-jinchul:7 norma-selner:7 choi-jong-in:7 igris:7 thomas-andre:6 adam-white:6 goto-ryuji:6 statue-of-god:6 kang-taeshik:5")) },
        { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: anyone },
      ],
      // S-rank hunters spread from the national level ones (Thomas Andre, Liu Zhigang) down to the Korean guild masters;
      // monsters from the dungeon bosses to the dragon Kamish; the Monarchs below Ashborn and Antares.
      power: parse(`sung-jinwoo:10 sung-jinah:1 park-kyung-hye:1 sung-il-hwan:9 cha-hae-in:8 choi-jong-in:7 baek-yoonho:7 go-gunhee:8 woo-jinchul:6
        kang-taeshik:5 yoo-jinho:3 yoo-myunghan:1 song-chi-yul:3 lee-joohee:3 kim-sangshik:2 han-song-yi:2 hwang-dongsuk:3 park-heejin:4 kim-chul:5
        min-byung-gyu:6 lim-tae-gyu:6 ma-dongwook:6 hwang-dongsoo:7 thomas-andre:9 goto-ryuji:7 liu-zhigang:9 christopher-reed:8 siddharth-bachchan:8
        lennart-niermann:8 norma-selner:2 adam-white:2 son-kihoon:5 han-semi:4 jung-yerim:4 akari-shimizu:6
        statue-of-god:8 kasaka:3 baruka:6 kargalgan:6 cerberus:5 vulcan:6 esil-radiru:6 kamish:9 baran:8 ant-queen:7
        igris:9 iron:6 tank:6 tusk:7 kaisel:6 beru:10 bellion:9 greed:7 jima:7 frost-monarch:8 rakan:8 ashborn:10 antares:10 querehsha:8 legia:8
        tarnak:8 yogumunt:9`),
    },
    // Vinland Saga: a war band of Vikings, farmhands and explorers. Leaders are the kings and chiefs, the captains of the
    // bands (Askeladd, Thorkell, the Jomsviking commanders), Snake who heads Ketil's guards and Thorfinn's expedition.
    vinlandsaga: {
      slots: [
        { label: { en: "Leader", fr: "Chef" }, icon: "crown", role: "captain", count: 1, score: leader,
          fits: (c) => has(c.job, "Royalty", "Landowner", "Chief") || ["askeladd", "thorkell", "floki", "sigvaldi", "vagn", "thors", "leif-ericson", "snake", "thorfinn", "asgeir", "ragnar", "wulf"].includes(c.id) },
        { label: { en: "Warrior", fr: "Guerrier" }, icon: "swords", count: 3, fits: (c) => has(c.job, "Warrior", "Mercenary") },
        { label: { en: "Viking band", fr: "Bande de Vikings" }, icon: "skull", count: 1, fits: (c) => has(c.aff, "Askeladd's Band", "Jomsvikings", "Thorkell's Army") },
        { label: { en: "Farmhand / Slave", fr: "Paysan / Esclave" }, icon: "leaf", count: 1, fits: (c) => has(c.job, "Farmer", "Slave", "Servant") },
        { label: { en: "Explorer", fr: "Explorateur" }, icon: "compass", count: 1, fits: (c) => has(c.aff, "Thorfinn's Expedition") || has(c.job, "Sailor") },
        // The Lnu shaman heals with herbs and visions; Arnheid nurses old Sverkel; Helga and Ylva keep the family alive.
        { label: HEALER, icon: "cross", role: "healer", count: 1, fits: anyone,
          score: role(parse("miskwekepu-j:10 niskawaji-j:8 arnheid:7 helga:6 ylva:6 willibald:6 gudrid:6 pater:5 leif-ericson:5 sverkel:4")) },
        // Askeladd plays kings against each other; Canute and Sweyn rule by cunning; Hild builds crossbows and traps.
        { label: STRATEGIST, icon: "chess", role: "strategist", count: 1, fits: anyone,
          score: role(parse(`askeladd:10 canute:10 sweyn:9 floki:9 halfdan:8 hild:8 eadric:7 leif-ericson:7 thorfinn:7 snake:6 styrk:6 wulf:6
            sigvaldi:6 gudrid:6 ragnar:5 vagn:5 einar:5`)) },
        { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: anyone },
      ],
      // Thors and Thorkell are the strongest warriors of the saga; Garm and Snake the best fighters of the later arcs.
      power: parse(`thorfinn:9 thors:10 ylva:2 helga:1 leif-ericson:3 halfdan:4 askeladd:9 bjorn:7 atli:4 torgrim:4 floki:6 sigvaldi:6
        thorkell:10 asgeir:6 canute:6 sweyn:5 harald:3 ragnar:5 willibald:2 gratianus:6 lydia:1 olaf:6 einar:5 ketil:4 olmar:3 thorgil:6
        sverkel:2 pater:2 arnheid:1 gardar:6 snake:8 fox:5 badger:4 edmund:5 ethelred:2 eadric:3 wulf:6 estrid:2 gudrid:4 karli:1 hild:7
        sigurd:4 garm:9 baldr:2 vagn:7 ivar:4 styrk:3 cordelia:4 miskwekepu-j:2 niskawaji-j:2 kitpui:3`),
    },
  });
  window.CREW_DEFAULT_POWER = DEFAULT_POWER;
})();
