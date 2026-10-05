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
];
// The image CDN only serves files requested from the wiki itself.
const headers = (wiki) => ({ "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36", Referer: `https://${wiki}.fandom.com/` });

await mkdir(OUT, { recursive: true });
const paths = {};
for (const [wiki, game, id, file] of FILES) {
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
