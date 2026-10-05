// Downloads the transformation portraits used by Crew Roll (crew/forms.js) from the Fandom wikis.
// Usage: node crew/scripts/forms.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "forms");
// [wiki, game id, character id, wiki file]
const FILES = [
  ["dragonball", "dragonball", "goku", "File:Super Saiyan Goku (Kai).png"],
  ["dragonball", "dragonball", "vegeta", "File:Vegeta Super Saiyan Form.JPG"],
  ["dragonball", "dragonball", "gohan", "File:Gohan-super-saiyan-2.jpg"],
  ["dragonball", "dragonball", "future-trunks", "File:Future-trunks-super-saiyan-2-i5.png"],
  ["dragonball", "dragonball", "frieza", "File:Golden Frieza full.png"],
  ["dragonball", "dragonball", "goku-black", "File:Super Saiyan Rose Goku Black.png"],
  ["bleach", "bleach", "ichigo-kurosaki", "File:163Ichigo's Bankai, Tensa Zangetsu.png"],
  ["bleach", "bleach", "byakuya-kuchiki", "File:Byakuya & Reigai-Byakuya After Exchanging Attacks With Bankai.png"],
  ["bleach", "bleach", "renji-abarai", "File:223Renji's Bankai, Hihio Zabimaru.png"],
  ["bleach", "bleach", "toshiro-hitsugaya", "File:170Hitsugaya's Bankai, Daiguren Hyorinmaru.png"],
  ["bleach", "bleach", "ulquiorra-cifer", "File:RoS Ulquiorra Segunda Etapa.png"],
  ["bleach", "bleach", "grimmjow-jaegerjaquez", "File:BBSArena Grimmjow.png"],
  ["naruto", "naruto", "naruto-uzumaki", "File:Naruto's Sage Mode.png"],
  ["naruto", "naruto", "sasuke-uchiha", "File:Sasuke's Fully body Susanoo.png"],
  ["naruto", "naruto", "itachi-uchiha", "File:Itachi Armoured Susanoo NXB.png"],
  ["naruto", "naruto", "kakashi-hatake", "File:Kakashi's Mangekyō Sharingan.png"],
  ["naruto", "naruto", "might-guy", "File:Guy's Eight Inner Gates.png"],
  ["naruto", "naruto", "rock-lee", "File:Eight Gates-Rock Lee.png"],
  ["onepiece", "onepiece", "monkey-d-luffy", "File:Luffy Activates Gear 5.png"],
  ["onepiece", "onepiece", "roronoa-zoro", "File:Zoro Defeating Kaku with Asura.png"],
  ["jujutsu-kaisen", "jujutsukaisen", "satoru-gojo", "File:Satoru Gojo targets weakened Hanami (Anime).png"],
  ["jujutsu-kaisen", "jujutsukaisen", "ryomen-sukuna", "File:Malevolent Shrine (SpecialZ).png"],
  ["jujutsu-kaisen", "jujutsukaisen", "yuta-okkotsu", "File:Rika's presence behind Yuta (Anime).png"],
  ["jujutsu-kaisen", "jujutsukaisen", "mahito", "File:Self-Embodiment of Perfection (SpecialZ).png"],
  ["hunterxhunter", "hunterxhunter", "killua-zoldyck", "File:129 - Godspeed Killua.png"],
  ["hunterxhunter", "hunterxhunter", "gon-freecss", "File:Adult Gon Anime.png"],
  ["hunterxhunter", "hunterxhunter", "kurapika", "File:Kurapika emperor time HXH 99 EP69.png"],
  ["attackontitan", "attackontitan", "eren-yeager", "File:Attack Titan character image (Eren Yeager).png"],
  ["attackontitan", "attackontitan", "annie-leonhart", "File:Female Titan character image (Annie Leonhart).png"],
  ["attackontitan", "attackontitan", "reiner-braun", "File:Armored Titan character image (Reiner Braun).png"],
  ["attackontitan", "attackontitan", "bertholdt-hoover", "File:Colossal Titan (Anime) character image (Bertholdt Hoover).png"],
  ["attackontitan", "attackontitan", "ymir", "File:Jaw Titan (Anime) character image (Ymir).png"],
  ["attackontitan", "attackontitan", "armin-arlert", "File:Colossal Titan (Anime) character image (Armin Arlelt).png"],
  ["attackontitan", "attackontitan", "zeke-yeager", "File:Beast Titan character image (Zeke Yeager).png"],
  ["attackontitan", "attackontitan", "porco-galliard", "File:Jaw Titan (Anime) character image (Porco Galliard).png"],
  ["attackontitan", "attackontitan", "pieck-finger", "File:Cart Titan character image (Pieck Finger).png"],
  ["attackontitan", "attackontitan", "lara-tybur", "File:War Hammer Titan character image (Lara Tybur).png"],
  ["attackontitan", "attackontitan", "falco-grice", "File:Jaw Titan (Anime) character image (Falco Grice).png"],
  ["bleach", "bleach", "sosuke-aizen", "File:Ep295AizenFirstFusion.png"],
  ["bleach", "bleach", "kenpachi-zaraki", "File:Ep410KenpachiBankaiFace.png"],
  ["bleach", "bleach", "sajin-komamura", "File:248Kokujo Tengen Myo'o stands.png"],
  ["bleach", "bleach", "coyote-starrk", "File:BBSResurreccion Starrk.png"],
  ["bleach", "bleach", "mayuri-kurotsuchi", "File:303Mayuri's Bankai, Konjiki Ashisogi Jizo.png"],
  ["bleach", "bleach", "yhwach", "File:Ep396TheAlmighty.png"],
  ["dragonball", "dragonball", "cell", "File:Cell-Super-Perfect.png"],
  ["dragonball", "dragonball", "majin-buu", "File:Super Buu.PNG"],
  ["dragonball", "dragonball", "piccolo", "File:Orange Piccolo full.PNG"],
  ["dragonball", "dragonball", "jiren", "File:Super Full Power Jiren (manga).png"],
  ["dragonball", "dragonball", "zamasu", "File:Fusion-Zamasu.jpg"],
  ["dragonball", "dragonball", "kale", "File:Kale True Legendary Super Saiyan.png"],
  ["naruto", "naruto", "gaara", "File:Full Shukaku Gaara.png"],
  ["naruto", "naruto", "jiraiya", "File:Sage mode.png"],
  ["naruto", "naruto", "madara-uchiha", "File:Madara Jinchuriki anime.png"],
  ["naruto", "naruto", "obito-uchiha", "File:Obito Juubi Jinchuriki.png"],
  ["naruto", "naruto", "minato-namikaze", "File:Minato's nine-tails chakra mode.png"],
  ["naruto", "naruto", "kabuto-yakushi", "File:Kabuto's Sage Mode.png"],
  ["onepiece", "onepiece", "sanji", "File:Sanji's Raid Suit.png"],
  ["onepiece", "onepiece", "tony-tony-chopper", "File:Post Timeskip Monster Point.png"],
  ["onepiece", "onepiece", "polo-marco", "File:Marco Phoenix Thousand Storm.png"],
  ["onepiece", "onepiece", "kaidou", "File:Kaidou Dragon Color Scheme.png"],
  ["onepiece", "onepiece", "rob-lucci", "File:Neko Neko no Mi, Model Leopard Human-Beast Form.png"],
  ["onepiece", "onepiece", "imu", "File:Imu Further Transformation.png"],
  ["onepiece", "onepiece", "king", "File:Ryu Ryu no Mi, Model Pteranodon Beast Form.png"],
  ["onepiece", "onepiece", "charlotte-katakuri", "File:Katakuri's Flame Haki.png"],
  ["jujutsu-kaisen", "jujutsukaisen", "megumi-fushiguro", "File:Chimera Shadow Garden inside Horizon of the Captivating Skandha (Anime).png"],
  ["jujutsu-kaisen", "jujutsukaisen", "jogo", "File:Coffin of the Iron Mountain (Anime).png"],
  ["jujutsu-kaisen", "jujutsukaisen", "maki-zen-in", "File:Maki Zenin vs. Ogi Zenin (Anime).png"],
  ["jujutsu-kaisen", "jujutsukaisen", "kinji-hakari", "File:Kinji Hakari's cursed energy (Anime).png"],
  ["jujutsu-kaisen", "jujutsukaisen", "hiromi-higuruma", "File:Deadly Sentencing (Anime).png"],
  ["hunterxhunter", "hunterxhunter", "isaac-netero", "File:2011 EP122 ED Card Netero Guanyin Bodhisattva.png"],
  ["hunterxhunter", "hunterxhunter", "biscuit-krueger", "File:2011 EP73 Biscuit True Form full appearance.png"],
  ["hunterxhunter", "hunterxhunter", "neferpitou", "File:Terpsichora 2011.png"],
  ["hunterxhunter", "hunterxhunter", "menthuthuyoupi", "File:118 - Knuckle vs. Youpi 1.png"],
  ["blackclover", "blackclover", "asta", "File:Black Asta.png"],
  ["blackclover", "blackclover", "yuno", "File:Spirit Dive Yuno - BCM.png"],
  ["blackclover", "blackclover", "noelle-silva", "File:Valkyrie Dress.png"],
  ["blackclover", "blackclover", "fuegoleon-vermillion", "File:Fuegoleon emerges with Salamander.png"],
  ["blackclover", "blackclover", "dante-zogratis", "File:Dante forms multiple arms.png"],
  ["attackontitan", "attackontitan", "rod-reiss", "File:Rod Reiss (Anime) character image (Titan).png"],
  ["attackontitan", "attackontitan", "dina-fritz", "File:Dina Fritz (Anime) character image (Titan).png"],
  ["attackontitan", "attackontitan", "ymir-fritz", "File:Founding Titan (Anime) character image (Ymir Fritz).png"],
  ["attackontitan", "attackontitan", "grisha-yeager", "File:Attack Titan (Anime) character image (Grisha Jaeger).png"],
  ["attackontitan", "attackontitan", "marcel-galliard", "File:Jaw Titan (Anime) character image (Marcel Galliard).png"],
];
// node crew/scripts/forms.mjs <game/id> … downloads only those.
const only = process.argv.slice(2);
// The image CDN only serves files requested from the wiki itself.
const headers = (wiki) => ({ "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", Referer: `https://${wiki}.fandom.com/` });

await mkdir(OUT, { recursive: true });
const paths = {};
for (const [wiki, game, id, file] of FILES) {
  if (only.length && !only.includes(`${game}/${id}`)) continue;
  try {
    const url = `https://${wiki}.fandom.com/api.php?` + new URLSearchParams({ action: "query", titles: file, prop: "imageinfo", iiprop: "url", iiurlwidth: "640", format: "json" });
    const info = await (await fetch(url, { headers: headers(wiki) })).json();
    const src = Object.values(info.query.pages)[0]?.imageinfo?.[0]?.thumburl;
    if (!src) throw new Error("no image");
    const buf = Buffer.from(await (await fetch(src, { headers: headers(wiki) })).arrayBuffer());
    const ext = buf.subarray(8, 12).toString() === "WEBP" ? "webp" : buf[0] === 0xff ? "jpg" : "png";
    const name = `${game}-${id}.${ext}`;
    await writeFile(join(OUT, name), buf);
    paths[`${game}/${id}`] = `assets/forms/${name}`;
    console.log(`✓ ${game}/${id} ${(buf.length / 1024).toFixed(0)} KB`);
  } catch (e) {
    console.log(`✗ ${game}/${id}: ${e.message}`);
  }
}
console.log(JSON.stringify(paths, null, 1));
