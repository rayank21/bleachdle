# Anime portraits for Vinlanddle: the wiki's infobox pictures are mostly manga panels, so the characters of the two
# anime seasons take their portrait from AniList (colour anime shots) instead; the others keep the wiki's. Also makes
# the small copies (assets/characters/sm/, 160 px wide) of every portrait.
# Run after scripts/simple-scrape.mjs:   python vinlandsaga/scripts/anime-portraits.py   (needs Pillow)
import io, json, os, urllib.parse, urllib.request
from PIL import Image

DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "characters")
# Our id -> AniList character id.
ANILIST = {
    "thorfinn": 10138, "askeladd": 13020, "canute": 17438, "thors": 13021, "thorkell": 17440, "bjorn": 19485, "leif-ericson": 19486,
    "willibald": 20704, "ylva": 27876, "sweyn": 27957, "ragnar": 82533, "floki": 82537, "halfdan": 140356, "helga": 141589,
    "asgeir": 141590, "torgrim": 141591, "atli": 141592, "lydia": 156501, "olaf": 156502, "gratianus": 156515,
    "arnheid": 75590, "snake": 79913, "ketil": 223346, "thorgil": 82535, "olmar": 224512, "sverkel": 255607, "pater": 296851,
    "fox": 296842, "badger": 296843, "ethelred": 298105, "eadric": 298107, "wulf": 300482, "estrid": 300483, "harald": 300484,
    "gardar": 301732,
}

# Better pictures from the wiki, cropped (left, top, right, bottom): Einar's anime design, Styrk and Karli in colour,
# Vagn without his speech bubble, Garm's colour profile, Sigvaldi on his throne.
WIKI = {
    "einar": ("Einar S2 anime design.png", (110, 0, 380, 300)),
    "styrk": ("Stork color.png", (0, 0, 692, 640)),
    "vagn": ("Vagn Portrait.jpeg", (200, 0, 700, 560)),
    "garm": ("Garm profile image.png", None),
    "karli": ("Karli.jpg", None),
    "sigvaldi": ("22305E95-A05B-4327-B315-2494B24B08CB.jpeg", (110, 25, 300, 290)),
}
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"


def get(url, data=None, referer=None):
    headers = {"content-type": "application/json", "accept": "application/json", "User-Agent": UA}
    if referer: headers["Referer"] = referer
    with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=headers)) as r:
        return r.read()


for cid, (name, box) in WIKI.items():
    q = json.loads(get("https://vinlandsaga.fandom.com/api.php?" + urllib.parse.urlencode({"action": "query", "titles": "File:" + name, "prop": "imageinfo", "iiprop": "url", "format": "json"})))
    url = list(q["query"]["pages"].values())[0]["imageinfo"][0]["url"]
    im = Image.open(io.BytesIO(get(url, referer="https://vinlandsaga.fandom.com/"))).convert("RGB")
    (im.crop(box) if box else im).save(os.path.join(DIR, cid + ".webp"), quality=86, method=6)
    print("ok", cid, "(wiki)")


query = {"query": "query($ids:[Int]){Page(perPage:50){characters(id_in:$ids){id image{large}}}}", "variables": {"ids": list(ANILIST.values())}}
found = {c["id"]: c["image"]["large"] for c in json.loads(get("https://graphql.anilist.co", json.dumps(query).encode()))["data"]["Page"]["characters"]}
for cid, al in ANILIST.items():
    url = found.get(al)
    if not url:
        print("x", cid)
        continue
    Image.open(io.BytesIO(get(url))).convert("RGB").save(os.path.join(DIR, cid + ".webp"), quality=86, method=6)
    print("ok", cid)

os.makedirs(os.path.join(DIR, "sm"), exist_ok=True)
for f in os.listdir(DIR):
    if f.endswith(".webp"):
        im = Image.open(os.path.join(DIR, f)).convert("RGB")
        im.resize((160, max(1, round(im.height * 160 / im.width))), Image.LANCZOS).save(os.path.join(DIR, "sm", f), quality=80, method=6)
print("small copies done")
