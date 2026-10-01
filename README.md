# Bleachdle, Hunterdle, Dragonballdle & Narutodle

Daily anime character guessing games (Wordle-style), in English and French. Each anime is its own category:

| Category | Page | Characters |
| --- | --- | --- |
| **Bleachdle** (Bleach) | `bleach/` | 97 |
| **Hunterdle** (Hunter × Hunter) | `hunterxhunter/` | 92 |
| **Dragonballdle** (Dragon Ball, Z, Super) | `dragonball/` | 77 |
| **Narutodle** (Naruto, Shippūden) | `naruto/` | 93 |

## Play

Open `index.html` (the category picker) in a browser; there is nothing to install. To publish, upload the whole folder to any static host (GitHub Pages, Netlify, Vercel…).

## Features

- **Arc selection**: before playing, choose how far you've watched. Only characters introduced up to that arc can come up, and spoiler-prone details stay hidden (e.g. Ichigo's race in Bleach, Nen types in HxH until the arc that reveals them).
- **Daily mode** (one character a day, per arc) and **Endless mode**.
- Hints after 4 guesses (Bleach: affiliation, HxH: ability) and 8 guesses (blurred portrait).
- Statistics, streaks, weekly average, copyable emoji result.
- EN / FR toggle (shared across categories), responsive on mobile. Dragon Ball characters also have their French dub names.
- **Player names and live “online” bar**: each player picks a name (kept in their browser); the bar under the header lists who is on the site right now and which game they are playing. Players connect directly to each other (WebRTC) with [Trystero](https://github.com/dmotz/trystero), using public Nostr relays to find each other: no server or account needed. As with any peer-to-peer connection, players’ IP addresses are visible to each other.

## Structure

```
index.html             category picker
shared/                game engine, styles, interface text, category list (games.js)
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
