# Bleachdle & friends: anime guessing games

Daily anime character guessing games (Wordle-style), in English and French. Each anime is its own category:

| Category | Page | Characters |
| --- | --- | --- |
| **Bleachdle** (Bleach) | `bleach/` | 108 |
| **Hunterdle** (Hunter × Hunter) | `hunterxhunter/` | 92 |
| **Dragonballdle** (Dragon Ball, Z, Super) | `dragonball/` | 93 |
| **Narutodle** (Naruto, Shippūden) | `naruto/` | 93 |
| **Onepiecedle** (One Piece) | `onepiece/` | 135 |
| **Jujutsudle** (Jujutsu Kaisen) | `jujutsukaisen/` | 60 |
| **Blackcloverdle** (Black Clover) | `blackclover/` | 70 |
| **Snkdle** (Attack on Titan) | `attackontitan/` | 57 |
| **Demonslayerdle** (Demon Slayer) | `demonslayer/` | 48 |
| **Mhadle** (My Hero Academia) | `myheroacademia/` | 63 |
| **Haikyudle** (Haikyuu!!) | `haikyuu/` | 57 |
| **Fireforcedle** (Fire Force) | `fireforce/` | 32 |
| **Slimedle** (That Time I Got Reincarnated as a Slime) | `slime/` | 48 |
| **Onepunchdle** (One Punch Man) | `onepunchman/` | 47 |
| **Sololevelingdle** (Solo Leveling) | `sololeveling/` | 62 |
| **Vinlanddle** (Vinland Saga) | `vinlandsaga/` | 51 |
| **Pokédle** (Pokémon, generations 1–9) | `pokemon/` | 1025 |

Plus **Crew Roll** (`crew/`): pick an anime, roll random characters and place them in your crew (factions, plus roles such as healer, engineer or strategist that anyone can fill but specialists score high in; One Piece is all roles); every character has a 1–10 rating and the crew's average is your score. Iconic characters transform when drawn (Super Saiyan, Bankai, Susanoo, domain expansions…), only from the arc where the form appears; the forms are listed in `crew/forms.js` and their portraits fetched by `node crew/scripts/forms.mjs`.

## Play

Serve the folder with any static server and open it in a browser, e.g. `npx serve .` then http://localhost:3000/ (the game engine and Crew Roll are ES modules, which browsers don't run from a `file://` page). To publish, upload the whole folder to any static host (GitHub Pages, Netlify, Vercel…); profiles and the TURN relay need Netlify (`netlify/functions/`).

## Features

- **Arc selection**: before playing, choose how far you've watched. Only characters introduced up to that arc can come up, and spoiler-prone details stay hidden (e.g. Ichigo's race in Bleach, Nen types in HxH until the arc that reveals them).
- **Daily mode** (one character a day, per arc), **Endless mode** and an **Online race**: rooms of 2 to 8 players get the same mystery character, the first to find it wins (players only see each other's tile colours, never the names tried).
- Hints after 4 guesses (Bleach: affiliation, HxH: ability) and 8 guesses (blurred portrait).
- Statistics, streaks, weekly average, copyable emoji result.
- EN / FR toggle (shared across categories), responsive on mobile. Dragon Ball characters also have their French dub names.
- **Friends**: with a profile, add friends by their profile name (they accept the request). The friends list shows who is online, where, and the open room they wait in: one click joins it, and a friend can be invited into your room: a banner shows up on their page, whatever page it is, or, if they are offline, the invitation waits on their profile (30 minutes) and pops up when they come back.
- **What's new**: patch notes (`shared/changelog.js`, newest day on top) open by themselves when something changed since the player's last visit, and stay one click away in the header.
- **Player names and live “online” bar**: each player picks a name (kept in their browser); the bar under the header lists who is on the site right now and which game they are playing. Players connect directly to each other (WebRTC) with [Trystero](https://github.com/dmotz/trystero), using public Nostr relays to find each other: no server or account needed. As with any peer-to-peer connection, players’ IP addresses are visible to each other.

## Online play

Rooms (`shared/rooms.js`) are peer to peer: players connect directly with [Trystero](https://github.com/dmotz/trystero) (WebRTC, public Nostr relays to find each other), so no server is needed. The player who creates a room hosts it; a match uses the lowest arc among the players so nobody gets spoiled. In Crew Roll online, players take turns (each roll and placement plays out live on every screen, 45 s per turn before auto-play), with 3 rerolls each, and a character rolled or placed by one player can't be rolled by the others. Players in the lobby can be invited with one click (a room is created if needed), or joined directly when they already wait in a room. A room can also be shared with an invite link (`#join=<room id>`), has its own chat (also on the end-of-match screen), and in Crew Roll its host can change the anime at any time between matches: the others follow. A live chat for everyone on the site sits in the bottom left corner of every page. Lobbies are shared by every anime: Crew Roll picks the anime when creating a room, and joining a race room of another game opens that game. A finished player keeps re-sending their final state for a minute, so one lost message never leaves a room waiting. Each room also has a 5-character code that can be typed in any lobby to join it. On phones, the category bar becomes a scrolling strip of logos and the board uses smaller tiles.

## Structure

```
index.html             category picker
shared/                styles, interface text, category list (games.js), online rooms and presence, profiles
shared/engine.js       the guessing game (ES module); its parts in shared/engine/ (core, stats, compare, render, guess, ui, race, play)
crew/                  Crew Roll (ratings and slots in roster.js, forms.js); crew.js and its parts in crew/parts/ (ES modules)
assets/logos/          one logo per category (webp)
assets/og/             link preview pictures (1200×630), one per page
bleach/                config.js, data/, assets/characters/, scripts/
hunterxhunter/         config.js, data/, assets/characters/, scripts/
```

Each category has a `config.js` (columns, arcs, hints, FR translations) read by `shared/engine.js`.

## Data

- `<category>/scripts/seed.mjs`: the character list and the hand-curated attributes.
- Portraits come from the anime (in the character's early look, so later designs don't spoil anything); the manga is only used for characters the anime never showed.
- `<category>/scripts/scrape.mjs`: fetches portraits (and heights for Bleach, or gender/age/hair/Nen/abilities/first arc for HxH) from the Fandom wikis, then generates `data/characters.js` and `assets/characters/`.

```
node bleach/scripts/scrape.mjs
node hunterxhunter/scripts/scrape.mjs
node dragonball/scripts/scrape.mjs
node naruto/scripts/scrape.mjs
node onepiece/scripts/scrape.mjs
node jujutsukaisen/scripts/scrape.mjs
node blackclover/scripts/scrape.mjs
node attackontitan/scripts/scrape.mjs
# The newer games share one scraper; their attributes are curated in <game>/scripts/seed.mjs
node scripts/simple-scrape.mjs demonslayer   # also myheroacademia, haikyuu, fireforce, slime, onepunchman, sololeveling
```

After a scrape, make the portraits' small copies (160 px, in `assets/characters/sm/`), used wherever a portrait is shown small; a missing one falls back to the full portrait:

```
npm install
node scripts/thumbs.mjs            # or: node scripts/thumbs.mjs bleach
```

## Adding a category

1. Copy `hunterxhunter/` and adapt `config.js` and `scripts/`.
2. Add the logo to `assets/logos/`.
3. Register it in `shared/games.js`.

Fan-made games, not affiliated with the authors, publishers or studios.
