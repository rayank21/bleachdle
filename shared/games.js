// Categories of the site. Paths are relative to the site root.
window.DLE_GAMES = [
  { id: "bleach", storage: "bleachdle", brand: "Bleachdle", anime: "Bleach", path: "bleach/", logo: "assets/logos/bleachdle.webp", count: 106, arcs: 7,
    featured: ["ichigo-kurosaki", "rukia-kuchiki", "sosuke-aizen", "kenpachi-zaraki", "byakuya-kuchiki", "ulquiorra-cifer"] },
  { id: "hunterxhunter", storage: "hunterdle", brand: "Hunterdle", anime: "Hunter × Hunter", path: "hunterxhunter/", logo: "assets/logos/hunterdle.webp", count: 93, arcs: 7,
    featured: ["gon-freecss", "killua-zoldyck", "kurapika", "hisoka", "chrollo-lucilfer", "meruem"] },
  { id: "dragonball", storage: "dragonballdle", brand: "Dragonballdle", anime: "Dragon Ball", path: "dragonball/", logo: "assets/logos/dragonballdle.webp", count: 92, arcs: 9,
    featured: ["goku", "vegeta", "piccolo", "frieza", "cell", "majin-buu"] },
  { id: "naruto", storage: "narutodle", brand: "Narutodle", anime: "Naruto", path: "naruto/", logo: "assets/logos/narutodle.webp", count: 93, arcs: 9,
    featured: ["naruto-uzumaki", "sasuke-uchiha", "sakura-haruno", "kakashi-hatake", "itachi-uchiha", "gaara"] },
  { id: "onepiece", storage: "onepiecedle", brand: "Onepiecedle", anime: "One Piece", path: "onepiece/", logo: "assets/logos/onepiecedle.webp", count: 161, arcs: 11,
    featured: ["monkey-d-luffy", "roronoa-zoro", "nami", "sanji", "shanks", "trafalgar-law"] },
  { id: "jujutsukaisen", storage: "jujutsudle", brand: "Jujutsudle", anime: "Jujutsu Kaisen", path: "jujutsukaisen/", logo: "assets/logos/jujutsudle.webp", count: 60, arcs: 7,
    featured: ["yuji-itadori", "megumi-fushiguro", "nobara-kugisaki", "satoru-gojo", "ryomen-sukuna", "kento-nanami"] },
  { id: "blackclover", storage: "blackcloverdle", brand: "Blackcloverdle", anime: "Black Clover", path: "blackclover/", logo: "assets/logos/blackcloverdle.webp", count: 70, arcs: 10,
    featured: ["asta", "yuno", "yami-sukehiro", "noelle-silva", "julius-novachrono", "mereoleona-vermillion"] },
  { id: "attackontitan", storage: "snkdle", brand: "Snkdle", anime: "Attack on Titan", path: "attackontitan/", logo: "assets/logos/snkdle.webp", count: 57, arcs: 7,
    featured: ["eren-yeager", "mikasa-ackerman", "armin-arlert", "levi", "erwin-smith", "hange-zoe"] },
  { id: "demonslayer", storage: "demonslayerdle", brand: "Demonslayerdle", anime: "Demon Slayer", path: "demonslayer/", logo: "assets/logos/demonslayerdle.webp", count: 48, arcs: 8,
    featured: ["tanjiro-kamado", "nezuko-kamado", "zenitsu-agatsuma", "inosuke-hashibira", "kyojuro-rengoku", "muzan-kibutsuji"] },
  { id: "myheroacademia", storage: "mhadle", brand: "Mhadle", anime: "My Hero Academia", path: "myheroacademia/", logo: "assets/logos/mhadle.webp", count: 59, arcs: 9,
    featured: ["izuku-midoriya", "katsuki-bakugo", "shoto-todoroki", "ochaco-uraraka", "all-might", "tomura-shigaraki"] },
  { id: "haikyuu", storage: "haikyudle", brand: "Haikyudle", anime: "Haikyuu!!", path: "haikyuu/", logo: "assets/logos/haikyudle.webp", count: 50, arcs: 6,
    featured: ["shoyo-hinata", "tobio-kageyama", "kei-tsukishima", "yu-nishinoya", "toru-oikawa", "kotaro-bokuto"] },
  { id: "fireforce", storage: "fireforcedle", brand: "Fireforcedle", anime: "Fire Force", path: "fireforce/", logo: "assets/logos/fireforcedle.webp", count: 29, arcs: 5,
    featured: ["shinra-kusakabe", "arthur-boyle", "maki-oze", "benimaru-shinmon", "tamaki-kotatsu", "akitaru-obi"] },
  { id: "slime", storage: "slimedle", brand: "Slimedle", anime: "That Time I Got Reincarnated as a Slime", path: "slime/", logo: "assets/logos/slimedle.webp", count: 46, arcs: 5,
    featured: ["rimuru-tempest", "benimaru", "shuna", "shion", "milim-nava", "diablo"] },
  { id: "onepunchman", storage: "onepunchdle", brand: "Onepunchdle", anime: "One Punch Man", path: "onepunchman/", logo: "assets/logos/onepunchdle.webp", count: 43, arcs: 5,
    featured: ["saitama", "genos", "tatsumaki", "garou", "bang", "boros"] },
];

// Link to the Crew Roll mini-game, shown after the categories in every header (its logo: the Thousand Sunny).
window.DLE_CREW_LINK = (root, label) =>
  `<a class="cat cat-crew" href="${root}crew/" title="${label}"><span class="cat-logo cat-dice cat-sunny"><img src="${root}assets/logos/sunny.webp" alt=""></span><span class="cat-name">${label}</span></a>`;

// A portrait's small copy (160 px wide, made by scripts/thumbs.mjs), for the places that show it small. Anything
// that isn't a character portrait (Crew Roll forms…) is returned as is.
window.DLE_THUMB = (url) => String(url ?? "").replace(/assets\/(characters|forms)\/([^/]+\.webp)$/, "assets/$1/sm/$2");
// On an <img> showing a small copy: falls back to the full portrait if the small copy is missing.
window.DLE_THUMB_FALLBACK = "if(this.src.includes('/sm/')){this.onerror=null;this.src=this.src.replace('/sm/','/')}";
window.DLE_SMALL_IMG = (img, url) => {
  const small = window.DLE_THUMB(url);
  if (small !== url) img.addEventListener("error", () => { if (img.src.includes("/sm/")) img.src = url; }, { once: true });
  img.src = small;
  return img;
};

// A player's name as an element: the top 3 of the leaderboard shine (shared/profile.js), others are plain text.
// pid: their profile id, when known. Names are untrusted: always set as text.
window.DLE_NAME = (text, pid, cls = "") => {
  const made = window.DLE_Profile?.nameEl?.(text, pid, cls);
  if (made) return made;
  const node = document.createElement("span");
  if (cls) node.className = cls;
  node.textContent = text;
  return node;
};

// Nostr relays used to find other players (Trystero). Pinned so a dead default relay can't keep players apart.
window.DLE_RELAYS = ["wss://nos.lol", "wss://relay.snort.social", "wss://nostr.mom", "wss://relay.primal.net", "wss://relay.damus.io",
  "wss://relay.nostr.net", "wss://nostr.oxtr.dev"];

// The real time, from the site's server. A computer whose clock is off (days behind) gets every message refused by
// the relays as "expired", so nobody sees that player: messages are dated with this offset instead of the local clock.
// DLE_CLOCK.ready resolves once measured; DLE_CLOCK.now() is the corrected Date.now(); DLE_CLOCK.offset in ms.
window.DLE_CLOCK = (() => {
  const clock = { offset: 0, measured: false, now: () => Date.now() + clock.offset };
  clock.ready = (async () => {
    if (location.protocol === "file:") return clock;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const t0 = Date.now();
      const res = await fetch(`${location.origin}/?clock=${t0}`, { method: "HEAD", cache: "no-store", signal: ctrl.signal });
      clearTimeout(timer);
      const t1 = Date.now();
      const server = Date.parse(res.headers.get("date") || "");
      if (Number.isFinite(server)) {
        // The Date header is rounded down to the second: aim for the middle of that second and of the round trip.
        const offset = server + 500 - (t0 + t1) / 2;
        // A few seconds don't matter; only correct a real gap, so small rounding never moves anything.
        clock.offset = Math.abs(offset) > 5000 ? Math.round(offset) : 0;
        clock.measured = true;
      }
    } catch {}
    return clock;
  })();
  return clock;
})();

// TURN relays (from /api/turn) for players who can't connect directly, e.g. two devices on the same box.
// Asked once per page and kept for the tab a few hours; never waits more than 3 s, and [] means direct only.
window.DLE_TURN = (() => {
  let pending = null;
  return () => (pending ??= (async () => {
    try {
      const kept = JSON.parse(sessionStorage.getItem("dle:turn") || "null");
      if (kept && kept.until > Date.now() && Array.isArray(kept.servers)) return kept.servers;
    } catch {}
    if (location.protocol === "file:") return [];
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3000);
      const res = await fetch("/api/turn", { signal: ctrl.signal });
      clearTimeout(timer);
      const servers = res.ok ? (await res.json()).iceServers : [];
      const clean = Array.isArray(servers) ? servers.filter((s) => s && s.urls) : [];
      try { sessionStorage.setItem("dle:turn", JSON.stringify({ servers: clean, until: Date.now() + (clean.length ? 5 * 3600e3 : 600e3) })); } catch {}
      return clean;
    } catch {
      return [];
    }
  })());
})();

// The anime strip in the header scrolls sideways when it doesn't fit: the mouse wheel scrolls it too, and the
// current anime is brought into view once the strip is drawn.
(() => {
  document.addEventListener("wheel", (e) => {
    const nav = e.target.closest?.(".categories");
    if (!nav || nav.scrollWidth <= nav.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    nav.scrollLeft += e.deltaY;
  }, { passive: false });
  const reveal = () => {
    const nav = document.querySelector(".categories");
    const cur = nav?.querySelector(".cat.is-current:not(.cat-crew)");
    if (!cur || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollLeft = cur.offsetLeft - nav.offsetLeft - nav.clientWidth / 2 + cur.offsetWidth / 2;
  };
  addEventListener("load", () => setTimeout(reveal, 50));
})();
