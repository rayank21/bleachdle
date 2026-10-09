# Builds Pokédle's data from PokeAPI's open data (https://github.com/PokeAPI/pokeapi, data/v2/csv) and its official
# artwork (https://github.com/PokeAPI/sprites): every Pokémon of generations 1 to 9, with its English and French names,
# types, colour, evolution stage, height, weight, category and generation; a Pokédex entry (in both languages, the
# Pokémon's name hidden) for the description game; and the pictures (320 px, plus 160 px copies).
# Usage: python pokemon/scripts/build.py [--no-images]   (needs Pillow)
import csv, io, json, os, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
CSV = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/{}.csv"
ART = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{}.png"
EN, FR = 9, 5


def table(name):
    with urllib.request.urlopen(CSV.format(name)) as r:
        return list(csv.DictReader(io.TextIOWrapper(r, encoding="utf-8")))


species = table("pokemon_species")
names = table("pokemon_species_names")
mons = {int(p["id"]): p for p in table("pokemon") if p["is_default"] == "1"}
types = table("pokemon_types")
type_names = table("type_names")
colour_names = table("pokemon_color_names")
flavour = table("pokemon_species_flavor_text")

name_of = {(int(n["pokemon_species_id"]), int(n["local_language_id"])): n for n in names}
type_en = {int(t["type_id"]): t["name"] for t in type_names if t["local_language_id"] == str(EN)}
type_fr = {int(t["type_id"]): t["name"] for t in type_names if t["local_language_id"] == str(FR)}
colour_en = {int(c["pokemon_color_id"]): c["name"] for c in colour_names if c["local_language_id"] == str(EN)}
colour_fr = {int(c["pokemon_color_id"]): c["name"] for c in colour_names if c["local_language_id"] == str(FR)}
types_of = {}
for t in sorted(types, key=lambda t: int(t["slot"])):
    types_of.setdefault(int(t["pokemon_id"]), []).append(int(t["type_id"]))
by_id = {int(s["id"]): s for s in species}


def stage(s):
    n = 0
    while s["evolves_from_species_id"]:
        s = by_id[int(s["evolves_from_species_id"])]
        n += 1
    return ["Base", "Stage 1", "Stage 2"][min(n, 2)]


def category(s):
    if s["is_mythical"] == "1": return "Mythical"
    if s["is_legendary"] == "1": return "Legendary"
    if s["is_baby"] == "1": return "Baby"
    return "Regular"


# The latest Pokédex entry in each language (versions are numbered in release order), the name replaced by "???".
dex = {}
for f in flavour:
    k = (int(f["species_id"]), int(f["language_id"]))
    if k[1] in (EN, FR) and int(f["version_id"]) >= dex.get(k, (0, ""))[0]:
        dex[k] = (int(f["version_id"]), f["flavor_text"])


def clean(text, name):
    text = re.sub(r"\s+", " ", text.replace("­", "").replace("\x0c", " ")).strip()
    return re.sub(re.escape(name), "???", text, flags=re.I)


slug = lambda s: re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
chars, fr_names, descs = [], {}, {}
for s in sorted(species, key=lambda s: int(s["id"])):
    sid = int(s["id"])
    m = mons[sid]
    en = name_of[(sid, EN)]["name"]
    fr = name_of[(sid, FR)]["name"]
    cid = slug(s["identifier"])
    t = types_of[sid]
    chars.append({
        "id": cid, "name": en, "dex": sid, "image": f"assets/characters/{cid}.webp",
        "types": [type_en[x] for x in t], "colour": colour_en[int(s["color_id"])], "stage": stage(s), "category": category(s),
        "height": int(m["height"]) / 10, "weight": int(m["weight"]) / 10, "arc": int(s["generation_id"]) - 1,
        "stats": None,
    })
    if fr != en: fr_names[en] = fr
    g_en = name_of[(sid, EN)]["genus"]
    g_fr = name_of[(sid, FR)]["genus"]
    if (sid, EN) in dex and (sid, FR) in dex:
        descs[cid] = [clean(dex[(sid, EN)][1], en), clean(dex[(sid, FR)][1], fr), [g_en, g_fr], None]

# Crew Roll: power 1–10 from the base stat total (legendary and mythical Pokémon at least 8, babies at most 2), and
# the starters' evolution lines.
total = {}
for st in table("pokemon_stats"):
    total[int(st["pokemon_id"])] = total.get(int(st["pokemon_id"]), 0) + int(st["base_stat"])
STARTERS = {1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501, 650, 653, 656, 722, 725, 728, 810, 813, 816, 906, 909, 912}
starter_chains = {by_id[i]["evolution_chain_id"] for i in STARTERS}
for c in chars:
    s = by_id[c["dex"]]
    c["stats"] = total[c["dex"]]
    p = max(1, min(10, round((c["stats"] - 180) / 54)))
    if c["category"] in ("Legendary", "Mythical"): p = max(p, 8)
    if c["category"] == "Baby": p = min(p, 2)
    c["power"] = p
    c["starter"] = s["evolution_chain_id"] in starter_chains

values_fr = {**{type_en[k]: type_fr[k] for k in type_en if k in type_fr}, **{colour_en[k]: colour_fr[k] for k in colour_en}}
os.makedirs(os.path.join(GAME, "data"), exist_ok=True)
with open(os.path.join(GAME, "data", "characters.js"), "w", encoding="utf-8", newline="\n") as f:
    f.write("// Generated by pokemon/scripts/build.py from PokeAPI's data. Every Pokémon, its French name and translations.\n")
    f.write("window.DLE_POKE_FR = " + json.dumps({"names": fr_names, "values": values_fr}, ensure_ascii=False) + ";\n")
    f.write("window.DLE_CHARACTERS = " + json.dumps(chars, indent=1, ensure_ascii=False) + ";\n")
with open(os.path.join(GAME, "data", "descriptions.js"), "w", encoding="utf-8", newline="\n") as f:
    f.write("// Pokédex entries (PokeAPI), the Pokémon's name hidden: [English, French, [category EN, FR], nickname].\n")
    f.write("window.DLE_DESCRIPTIONS = {\n" + "".join(f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},\n" for k, v in descs.items()) + "};\n")
print(len(chars), "Pokémon,", len(descs), "Pokédex entries")

if "--no-images" in sys.argv: sys.exit()
big = os.path.join(GAME, "assets", "characters")
small = os.path.join(big, "sm")
os.makedirs(small, exist_ok=True)


def picture(c):
    out = os.path.join(big, c["id"] + ".webp")
    if os.path.exists(out): return
    with urllib.request.urlopen(ART.format(c["dex"])) as r:
        im = Image.open(io.BytesIO(r.read())).convert("RGBA")
    im = im.crop(im.getbbox() or (0, 0, im.width, im.height))
    side = max(im.size)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    sq.resize((320, 320), Image.LANCZOS).save(out, quality=82, method=6)
    sq.resize((160, 160), Image.LANCZOS).save(os.path.join(small, c["id"] + ".webp"), quality=80, method=6)


with ThreadPoolExecutor(16) as pool:
    for i, _ in enumerate(pool.map(picture, chars)):
        if i % 100 == 0: print(i)
print("pictures done")
