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
    navigator: parse("nami:10 jinbe:9 silvers-rayleigh:7 enel:7 vegapunk:6 nojiko:4 bell-mere:4"),
    cook: parse("sanji:10 zeff:10 charlotte-pudding:8"),
    // Doc Q is Blackbeard's doctor; Reiju drew the poison out of Luffy; Marco heals with his flames.
    doctor: parse("tony-tony-chopper:10 trafalgar-law:10 kureha:10 polo-marco:8 doc-q:8 hiriluk:7 emporio-ivankov:6 vegapunk:6 vinsmoke-reiju:5 caesar-clown:4"),
    // Reading the poneglyphs or knowing the Void Century: the Kozuki family, Roger's crew, Imu, Blackbeard's hunt.
    archaeologist: parse("nico-robin:10 imu:9 gol-d-roger:9 kouzuki-oden:8 kouzuki-momonosuke:7 silvers-rayleigh:7 vegapunk:7 marshall-d-teach:7 kouzuki-hiyori:6 nefertari-vivi:4"),
    // Tom built the Oro Jackson; Paulie, Kaku and Lucci worked at Galley-La; Rayleigh coats ships; Usopp patched the Merry.
    shipwright: parse("franky:10 iceburg:10 tom:10 paulie:8 silvers-rayleigh:8 kaku:7 rob-lucci:6 usopp:5"),
  };
  const specialist = (role) => (c, power) => OP_SPECIALISTS[role][c.id] ?? Math.max(1, Math.round(power / 3));

  window.CREW_GAMES = {
    bleach: {
      slots: [
        { label: { en: "Shinigami", fr: "Shinigami" }, icon: "sword", count: 3, fits: (c) => has(c.race, "Shinigami", "Hybrid") },
        { label: { en: "Arrancar", fr: "Arrancar" }, icon: "skull", count: 2, fits: (c) => has(c.race, "Arrancar", "Hollow") },
        { label: { en: "Quincy", fr: "Quincy" }, icon: "star", count: 1, fits: (c) => has(c.race, "Quincy") },
        { label: { en: "Visored", fr: "Visored" }, icon: "mask", count: 1, fits: (c) => has(c.race, "Visored") },
        { label: { en: "Human / Fullbringer", fr: "Humain / Fullbringer" }, icon: "person", count: 1, fits: (c) => has(c.race, "Human", "Fullbringer", "Mod Soul", "Soul", "Hybrid") },
      ],
      power: parse(`ichigo-kurosaki:10 rukia-kuchiki:7 orihime-inoue:5 yasutora-sado:6 uryu-ishida:7 kon:2 kisuke-urahara:9 yoruichi-shihoin:9
        tessai-tsukabishi:6 isshin-kurosaki:8 masaki-kurosaki:5 karin-kurosaki:2 yuzu-kurosaki:1 tatsuki-arisawa:2 keigo-asano:1 mizuiro-kojima:1
        don-kanonji:2 renji-abarai:7 byakuya-kuchiki:9 ganju-shiba:3 kukaku-shiba:4 kaien-shiba:6 hanataro-yamada:2 genryusai-yamamoto:10
        chojiro-sasakibe:6 sui-feng:8 marechiyo-omaeda:4 gin-ichimaru:9 izuru-kira:5 retsu-unohana:9 isane-kotetsu:5 sosuke-aizen:10
        momo-hinamori:5 sajin-komamura:7 tetsuzaemon-iba:4 shunsui-kyoraku:9 nanao-ise:4 kaname-tosen:7 shuhei-hisagi:6 toshiro-hitsugaya:8
        rangiku-matsumoto:6 kenpachi-zaraki:9 yachiru-kusajishi:5 ikkaku-madarame:6 yumichika-ayasegawa:5 mayuri-kurotsuchi:8 nemu-kurotsuchi:5
        jushiro-ukitake:8 ryuken-ishida:7 shinji-hirako:8 hiyori-sarugaki:6 love-aikawa:6 rojuro-otoribashi:6 kensei-muguruma:7 mashiro-kuna:6
        lisa-yadomaru:6 hachigen-ushoda:6 ulquiorra-cifer:9 yammy-llargo:7 grimmjow-jaegerjaquez:8 coyote-starrk:9 barragan-louisenbairn:8
        tier-harribel:8 nnoitra-gilga:7 szayelaporro-granz:7 aaroniero-arruruerie:6 luppi-antenor:4 nelliel-tu-odelschwanck:7 loly-aivirrne:2
        wonderweiss-margela:6 lilynette-gingerbuck:3 emilou-apacci:3 ggio-vega:3 kugo-ginjo:7 shukuro-tsukishima:6 riruka-dokugamine:4
        yukio-hans-vorarlberna:4 jackie-tristan:4 giriko-kutsuzawa:4 yhwach:10 jugram-haschwalth:9 bazz-b:7 askin-nakk-le-vaar:8
        bambietta-basterbine:6 candice-catnipp:6 liltotto-lamperd:6 meninas-mcallon:5 giselle-gewelle:6 as-nodt:6 quilge-opie:6
        gremmy-thoumeaux:8 lille-barro:8 ichibe-hyosube:10 senjumaru-shutara:9 tenjiro-kirinji:8 oetsu-nimaiya:8 kirio-hikifune:8`),
    },

    hunterxhunter: {
      slots: [
        { label: { en: "Hunter", fr: "Hunter" }, icon: "card", count: 3, fits: (c) => has(c.aff, "Hunter Association") },
        { label: { en: "Chimera Ant", fr: "Fourmi-Chimère" }, icon: "bug", count: 2, fits: (c) => has(c.species, "Chimera Ant") },
        { label: { en: "Phantom Troupe", fr: "Brigade Fantôme" }, icon: "spider", count: 1, fits: (c) => has(c.aff, "Phantom Troupe") },
        { label: { en: "Zoldyck", fr: "Zoldyck" }, icon: "bolt", count: 1, fits: (c) => has(c.aff, "Zoldyck Family") },
        { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: () => true },
      ],
      power: parse(`gon-freecss:8 killua-zoldyck:8 kurapika:8 leorio-paradinight:4 hisoka:9 illumi-zoldyck:8 kite:7 mito-freecss:1 isaac-netero:10
        satotz:5 menchi:4 buhara:4 hanzo:5 pokkle:3 tonpa:1 bodoro:2 ponzu:3 lippo:4 beans:1 silva-zoldyck:9 zeno-zoldyck:9 kikyo-zoldyck:5
        milluki-zoldyck:3 kalluto-zoldyck:6 gotoh:5 canary:3 wing:6 zushi:3 gido:3 riehlvelt:3 sadaso:2 kastro:4 chrollo-lucilfer:9 uvogin:8
        nobunaga-hazama:7 feitan-portor:8 phinks-magcub:7 shalnark:6 franklin-bordeau:7 machi-komacine:6 pakunoda:5 shizuku-murasaki:6
        bonolenov-ndongo:5 kortopi:4 neon-nostrade:2 light-nostrade:1 senritsu:5 basho:5 squala:3 dalzollene:3 zepile:2 biscuit-krueger:7
        genthru:6 razor:7 tsezguerra:6 goreinu:4 abengane:4 binolt:3 meruem:10 neferpitou:9 shaiapouf:9 menthuthuyoupi:9 chimera-ant-queen:4
        komugi:2 knuckle-bine:6 shoot-mcmahon:6 morel-mackernasey:7 knov:6 palm-siberia:5 colt:5 meleoron:5 ikalgo:4 welfin:6 zazan:6
        cheetu:5 leol:6 bloster:5 ging-freecss:9 pariston-hill:8 cheadle-yorkshire:6 mizaistom-nana:6 botobai-gigante:7 cluck:4 ginta:4
        saiyu:4 kanzai:5 geru:5 pyon:4 saccho-kobayakawa:4 alluka-zoldyck:9 tsubone:7 amane:4`),
    },

    dragonball: {
      slots: [
        { label: { en: "Saiyan", fr: "Saïyen" }, icon: "flame", count: 2, fits: (c) => has(c.race, "Saiyan", "Half-Saiyan") },
        { label: { en: "Earthling", fr: "Terrien" }, icon: "person", count: 2, fits: (c) => has(c.race, "Human", "Animal") },
        { label: { en: "Namekian", fr: "Namek" }, icon: "leaf", count: 1, fits: (c) => has(c.race, "Namekian") },
        { label: { en: "Android", fr: "Cyborg" }, icon: "bolt", count: 1, fits: (c) => has(c.race, "Android", "Bio-Android") || c.id === "dr-gero" },
        { label: { en: "God / Angel", fr: "Dieu / Ange" }, icon: "star", count: 1, fits: (c) => has(c.race, "God", "Angel") || has(c.aff, "Gods") || c.id === "mr-popo" },
        { label: { en: "Villain", fr: "Méchant" }, icon: "skull", count: 1,
          fits: (c) => has(c.aff, "Frieza Force", "Red Ribbon Army", "Babidi's Army", "Demon Clan", "Pilaf Gang", "Team Zamasu") || has(c.race, "Majin", "Bio-Android", "Frieza Clan") || ["hit", "jiren"].includes(c.id) },
      ],
      power: parse(`goku:10 bulma:3 oolong:2 yamcha:5 puar:2 chi-chi:4 ox-king:4 master-roshi:6 turtle:2 emperor-pilaf:2 mai:2 shu:2 krillin:7
        launch:3 upa:2 bora:4 general-blue:4 commander-red:2 mercenary-tao:5 arale-norimaki:7 korin:5 yajirobe:5 tien-shinhan:7 chiaotzu:5
        king-piccolo:7 piccolo:9 kami:6 mr-popo:5 gohan:10 raditz:6 nappa:6 vegeta:10 king-kai:5 bardock:7 frieza:10 zarbon:6 dodoria:5
        captain-ginyu:7 recoome:6 burter:6 jeice:6 guldo:5 dende:3 nail:6 grand-elder-guru:3 king-cold:8 future-trunks:9 android-17:9
        android-18:8 android-16:8 android-19:6 dr-gero:6 cell:10 mr-satan:3 videl:4 goten:7 kid-trunks:8 majin-buu:10 babidi:4 dabura:8
        shin-supreme-kai:6 kibito:5 uub:7 beerus:10 whis:10 champa:10 vados:10 hit:9 cabba:8 caulifla:8 kale:9 zeno:10 goku-black:10
        zamasu:9 jiren:10 toppo:9 grand-priest:10`),
    },

    naruto: {
      slots: [
        { label: { en: "Konoha", fr: "Konoha" }, icon: "leaf", count: 3, fits: (c) => has(c.village, "Konohagakure") },
        { label: { en: "Akatsuki", fr: "Akatsuki" }, icon: "cloud", count: 2, fits: (c) => has(c.village, "Akatsuki") },
        { label: { en: "Kage", fr: "Kage" }, icon: "hat", count: 1, fits: (c) => c.rank === "Kage" },
        { label: { en: "Uchiha", fr: "Uchiha" }, icon: "eye", count: 1, fits: (c) => has(c.clan, "Uchiha") },
        { label: { en: "Outside Konoha", fr: "Hors de Konoha" }, icon: "globe", count: 1, fits: (c) => !has(c.village, "Konohagakure", "Akatsuki") },
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
        { label: { en: "Captain", fr: "Capitaine" }, icon: "crown", role: "captain", count: 1, fits: () => true },
        { label: { en: "First Mate", fr: "Second" }, icon: "swords", role: "first-mate", count: 1, fits: () => true },
        { label: { en: "Navigator", fr: "Navigateur" }, icon: "compass", role: "navigator", count: 1, fits: () => true, score: specialist("navigator") },
        { label: { en: "Cook", fr: "Cuisinier" }, icon: "chef", role: "cook", count: 1, fits: () => true, score: specialist("cook") },
        { label: { en: "Doctor", fr: "Médecin" }, icon: "cross", role: "doctor", count: 1, fits: () => true, score: specialist("doctor") },
        { label: { en: "Archaeologist", fr: "Archéologue" }, icon: "book", role: "archaeologist", count: 1, fits: () => true, score: specialist("archaeologist") },
        { label: { en: "Shipwright", fr: "Charpentier" }, icon: "hammer", role: "shipwright", count: 1, fits: () => true, score: specialist("shipwright") },
        { label: { en: "Combatant", fr: "Combattant" }, icon: "shield", role: "combatant", count: 3, fits: () => true },
      ],
      power: parse(`monkey-d-luffy:10 roronoa-zoro:9 nami:4 usopp:5 sanji:9 tony-tony-chopper:6 nico-robin:7 franky:7 brook:7 jinbe:8 shanks:10
        buggy:4 alvida:2 koby:6 helmeppo:3 morgan:3 kuro:4 krieg:3 zeff:6 arlong:4 nojiko:1 bell-mere:3 smoker:7 tashigi:5
        monkey-d-dragon:10 gol-d-roger:10 shimotsuki-kuina:2 dracule-mihawk:10 crocodile:8 daz-bonez:5 bentham:5 galdino:4 nefertari-vivi:2
        wapol:3 kureha:3 hiriluk:1 portgas-d-ace:8 enel:7 wyper:5 gan-fall:4 marshall-d-teach:10 kuzan:9 iceburg:3 rob-lucci:8 kaku:7
        kalifa:5 spandam:1 monkey-d-garp:10 gecko-moria:7 perona:5 bartholomew-kuma:9 silvers-rayleigh:10 eustass-kid:9 trafalgar-law:9
        killer:7 basil-hawkins:6 x-drake:7 jewelry-bonney:7 boa-hancock:9 emporio-ivankov:7 magellan:8 edward-newgate:10 polo-marco:9
        sengoku:10 sakazuki:10 borsalino:10 hody-jones:5 shirahoshi:6 neptune:6 fisher-tiger:7 caesar-clown:6 monet:5 vergo:7 kin-emon:7
        kouzuki-momonosuke:5 donquixote-doflamingo:9 issho:10 sabo:9 rebecca:5 kyros:7 bartolomeo:6 cavendish:7 carrot:6 pedro:7
        inuarashi:8 nekomamushi:8 charlotte-linlin:10 charlotte-katakuri:9 charlotte-pudding:3 charlotte-cracker:8 vinsmoke-judge:6
        vinsmoke-reiju:6 kaidou:10 king:9 queen:9 yamato:9 kouzuki-oden:10 kouzuki-hiyori:3 vegapunk:4
        tom:5 paulie:5 doc-q:5 imu:10`),
    },

    jujutsukaisen: {
      slots: [
        { label: { en: "Tokyo Jujutsu High", fr: "École de Tokyo" }, icon: "shield", count: 2, fits: (c) => has(c.aff, "Tokyo Jujutsu High") },
        { label: { en: "Kyoto Jujutsu High", fr: "École de Kyoto" }, icon: "book", count: 1, fits: (c) => has(c.aff, "Kyoto Jujutsu High") },
        // Naoya, Naobito and Ogi are "special grade 1", a rank below special grade.
        { label: { en: "Special Grade", fr: "Grade spécial" }, icon: "flame", count: 1, fits: (c) => c.grade === "Special Grade" && !["naoya-zen-in", "naobito-zen-in", "ogi-zen-in"].includes(c.id) },
        { label: { en: "Curse", fr: "Fléau" }, icon: "skull", count: 2, fits: (c) => has(c.race, "Cursed Spirit", "Death Painting", "Incarnated") || has(c.aff, "Curse Users") || c.id === "larue" },
        { label: { en: "Great Clan", fr: "Grand clan" }, icon: "eye", count: 1, fits: (c) => has(c.aff, "Zen'in Clan", "Gojo Clan", "Kamo Clan") || c.id === "megumi-fushiguro" },
        // Sorcerers outside the schools: freelancers (Mei Mei) and Culling Game players (Higuruma, Takaba…).
        { label: { en: "Freelance & Culling Game", fr: "Indépendants & Jeu d'extermination" }, icon: "dice", count: 1, fits: (c) => has(c.aff, "None") && has(c.race, "Human") && c.id !== "larue" },
      ],
      power: parse(`yuji-itadori:9 megumi-fushiguro:8 nobara-kugisaki:6 satoru-gojo:10 ryomen-sukuna:10 kento-nanami:8 maki-zen-in:9 toge-inumaki:7
        panda:6 yuta-okkotsu:10 masamichi-yaga:6 shoko-ieiri:3 kiyotaka-ijichi:2 aoi-todo:8 mai-zen-in:4 kasumi-miwa:3 noritoshi-kamo:6
        momo-nishimiya:4 mechamaru:6 utahime-iori:5 yoshinobu-gakuganji:6 mahito:9 jogo:8 hanami:8 dagon:7 junpei-yoshino:3 suguru-geto:9
        choso:8 eso:6 kechizu:4 mei-mei:7 ui-ui:4 atsuya-kusakabe:7 toji-fushiguro:10 riko-amanai:1 misato-kuroi:1 yu-haibara:4
        yuki-tsukumo:9 naoya-zen-in:7 naobito-zen-in:8 haruta-shigemo:3 takuma-ino:5 arata-nitta:3 uraume:8 miguel-oduol:7 larue:6
        tengen:7 tsumiki-fushiguro:4 hajime-kashimo:9 hiromi-higuruma:8 kinji-hakari:9 fumihiko-takaba:7 ryu-ishigori:8 takako-uro:7
        reggie-star:6 charles-bernard:6 hana-kurusu:7 kenjaku:9 ogi-zen-in:6 granny-ogami:4`),
    },

    blackclover: {
      slots: [
        { label: { en: "Black Bulls", fr: "Taureau Noir" }, icon: "flame", count: 2, fits: (c) => has(c.aff, "Black Bulls") },
        { label: { en: "Golden Dawn", fr: "Aube Dorée" }, icon: "star", count: 1, fits: (c) => has(c.aff, "Golden Dawn") },
        // Squad captains and the Wizard King (Mereoleona leads the Crimson Lions in Fuegoleon's place).
        { label: { en: "Captain", fr: "Capitaine" }, role: "captain", icon: "crown", count: 1,
          fits: (c) => ["yami-sukehiro", "william-vangeance", "nozel-silva", "fuegoleon-vermillion", "mereoleona-vermillion", "charlotte-roselei",
            "jack-the-ripper", "dorothy-unsworth", "kaiser-granvorka", "rill-boismortier", "julius-novachrono"].includes(c.id) },
        { label: { en: "Other squad", fr: "Autre escouade" }, icon: "shield", count: 1,
          fits: (c) => has(c.aff, "Silver Eagles", "Crimson Lion Kings", "Blue Rose", "Green Mantis", "Coral Peacock", "Purple Orca", "Aqua Deer") },
        { label: { en: "Elf", fr: "Elfe" }, icon: "leaf", count: 1, fits: (c) => has(c.race, "Elf") },
        { label: { en: "Enemy", fr: "Ennemi" }, icon: "skull", count: 1,
          fits: (c) => has(c.aff, "Eye of the Midnight Sun", "Dark Triad", "Eight Shining Generals") || has(c.country, "Diamond Kingdom", "Spade Kingdom") || (has(c.race, "Devil") && c.id !== "liebe") },
        { label: { en: "Wildcard", fr: "Joker" }, icon: "dice", count: 1, fits: () => true },
      ],
      power: parse(`asta:9 yami-sukehiro:9 noelle-silva:7 luck-voltia:6 magna-swing:5 vanessa-enoteca:6 finral-roulacase:5 gauche-adlai:6
        gordon-agrippa:5 grey:5 charmy-pappitson:6 zora-ideale:6 henry-legolant:5 secre-swallowtail:6 nacht-faust:9 sekke-bronzazza:3 liebe:8
        yuno:9 william-vangeance:8 klaus-lunettes:5 mimosa-vermillion:5 alecdora-sandler:4 langris-vaude:7 nozel-silva:8 solid-silva:4
        nebra-silva:4 fuegoleon-vermillion:8 leopold-vermillion:6 mereoleona-vermillion:9 charlotte-roselei:8 sol-marron:4 jack-the-ripper:8
        dorothy-unsworth:7 kahono:5 kiato:5 kirsch-vermillion:5 kaiser-granvorka:7 rill-boismortier:7 rebecca-scarlet:1 julius-novachrono:10
        marx-francois:4 damnatio-kira:6 sister-lily:2 patry:9 rhya:7 fana:7 vetto:8 sally:5 valtos:6 catherine:5 mars:7 lotus-whomalt:5
        fanzell-kruger:6 ladros:6 rades-spirito:5 moris-libardirt:6 witch-queen:8 licht:10 lumiere-silvamillion-clover:9 tetia:5 lolopechka:7
        gadjah:7 dante-zogratis:9 vanica-zogratis:9 zenon-zogratis:9 lucius-zogratis:10 morgen-faust:6 zagred:9 megicula:9 lucifero:10`),
    },
  };
  window.CREW_DEFAULT_POWER = DEFAULT_POWER;
})();
