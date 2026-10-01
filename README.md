# Bleachdle & friends: anime guessing games

Daily anime character guessing games (Wordle-style), in English and French. Each anime is its own category:

| Category | Page | Characters |
| --- | --- | --- |
| **Bleachdle** (Bleach) | `bleach/` | 97 |
| **Hunterdle** (Hunter × Hunter) | `hunterxhunter/` | 92 |
| **Dragonballdle** (Dragon Ball, Z, Super) | `dragonball/` | 77 |
| **Narutodle** (Naruto, Shippūden) | `naruto/` | 93 |
| **Onepiecedle** (One Piece) | `onepiece/` | 99 |
| **Jujutsudle** (Jujutsu Kaisen) | `jujutsukaisen/` | 60 |

Plus **Crew Roll** (`crew/`): pick an anime, roll random characters and place them in your crew (factions or One Piece roles); every character has a 1–10 rating and the crew's average is your score.

## Play

Open `index.html` (the category picker) in a browser; there is nothing to install. To publish, upload the whole folder to any static host (GitHub Pages, Netlify, Vercel…).

## Features

- **Arc selection**: before playing, choose how far you've watched. Only characters introduced up to that arc can come up, and spoiler-prone details stay hidden (e.g. Ichigo's race in Bleach, Nen types in HxH until the arc that reveals them).
- **Daily mode** (one character a day, per arc), **Endless mode** and an **Online race**: rooms of 2 to 8 players get the same mystery character, the first to find it wins (players only see each other's tile colours, never the names tried).
- Hints after 4 guesses (Bleach: affiliation, HxH: ability) and 8 guesses (blurred portrait).
- Statistics, streaks, weekly average, copyable emoji result.
- EN / FR toggle (shared across categories), responsive on mobile. Dragon Ball characters also have their French dub names.
- **Player names and live “online” bar**: each player picks a name (kept in their browser); the bar under the header lists who is on the site right now and which game they are playing. Players connect directly to each other (WebRTC) with [Trystero](https://github.com/dmotz/trystero), using public Nostr relays to find each other: no server or account needed. As with any peer-to-peer connection, players’ IP addresses are visible to each other.

## Online play

Rooms (`shared/rooms.js`) are peer to peer: players connect directly with [Trystero](https://github.com/dmotz/trystero) (WebRTC, public Nostr relays to find each other), so no server is needed. The player who creates a room hosts it; a match uses the lowest arc among the players so nobody gets spoiled. In Crew Roll online, everyone rolls on their own with 3 rerolls, and a character rolled or placed by one player can't be rolled by the others. Players in the lobby can be invited with one click (a room is created if needed), or joined directly when they already wait in a room. A room can also be shared with an invite link (`#join=<room id>`), has its own chat (also on the end-of-match screen), and in Crew Roll its host can change the anime at any time between matches: the others follow. A live chat for everyone on the site sits in the bottom left corner of every page. Lobbies are shared by every anime: Crew Roll picks the anime when creating a room, and joining a race room of another game opens that game. A finished player keeps re-sending their final state for a minute, so one lost message never leaves a room waiting.

## Structure

```
index.html             category picker
shared/                game engine, styles, interface text, category list (games.js), online rooms and presence
crew/                  Crew Roll (ratings and slots in roster.js)
assets/logos/          one logo per category
bleach/                config.js, data/, assets/characters/, scripts/
hunterxhunter/         config.js, data/, assets/characters/, scripts/
```

Each category has a `config.js` (columns, arcs, hints, FR translations) read by `shared/engine.js`.

## Data

- `<category>/scripts/seed.mjs`: the character list and the hand-curated attributes.
- `<category>/scripts/scrape.mjs`: fetches portraits (and heights for Bleach, or gender/age/hair/Nen/abilities/first arc for HxH) from the Fandom wikis, then generates `data/characters.js` and `assets/characters/`.

```
node bleach/scripts/scrape.mjs
node hunterxhunter/scripts/scrape.mjs
node dragonball/scripts/scrape.mjs
node naruto/scripts/scrape.mjs
```

## Adding a category

1. Copy `hunterxhunter/` and adapt `config.js` and `scripts/`.
2. Add the logo to `assets/logos/`.
3. Register it in `shared/games.js`.

Fan-made games, not affiliated with the authors, publishers or studios.
