# Bleachdle

A daily Bleach character guessing game (Wordle-style), in English and French.

## Play

Open `index.html` in a browser; there is nothing to install. To publish it, upload the whole folder to any static host (GitHub Pages, Netlify, Vercel…).

## Features

- **Arc selection**: before playing, choose how far you've watched. Only characters introduced up to that arc can be picked, and spoiler-prone details (e.g. Ichigo's or Isshin's race, Aizen's residence) are shown as they were at that point.
- **Daily mode** (one character a day, per arc) and **Endless mode**.
- Hints unlock after 4 guesses (affiliation) and 8 guesses (blurred portrait).
- Statistics, streaks, weekly average, copyable emoji result.
- EN / FR toggle, responsive on mobile.

## Data

- `scripts/seed.mjs`: the character list and attributes (gender, race, age, hair, residence, first arc, affiliation). Edit this file to add characters.
- `scripts/scrape.mjs`: fetches portraits and official heights from the Bleach wiki (Fandom), then generates `data/characters.js` and `assets/characters/`.

```
node scripts/scrape.mjs
```

Fan-made game, not affiliated with Tite Kubo, Shueisha or Studio Pierrot.
