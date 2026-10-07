// Player profiles, stored in Netlify Blobs.
// A profile has a public part (name, avatar, stats, best crew) and a secret token kept only as a
// hash. The browser keeps the token; "id.token" is the recovery code used to log in elsewhere.
//
//   GET  /api/profile?id=…                 public profile
//   GET  /api/profile?leaderboard=1        best crews (overall and per anime) and most wins
//   POST /api/profile {action: "create", name, avatar}
//   POST /api/profile {action: "login", code}
//   POST /api/profile {action: "update", id, token, name?, avatar?, stats?, crew?, duel?: {won}, add?: {rolls, rerolls, guesses, seconds, …},
//                      cards?: {anime: [character ids got from boosters]}, showcase?: [{g, id, n, p, f}] (3 cards at most)}
//   Boosters: add.boostEarn (packs earned) and add.boostOpen (packs opened); the stock is the difference.
//
// Seasons: every month (Paris time) has its own leaderboard: the wins earned and the best crews built that month.
//   POST /api/profile {action: "friends", id, token}                  my friends and friend requests
//   POST /api/profile {action: "friend-add", id, token, name}         send a request (or accept theirs)
//   POST /api/profile {action: "friend-accept" | "friend-remove", id, token, other}
//   POST /api/profile {action: "friend-invite", id, token, other, room}  invite a friend into my room, even offline
//   POST /api/profile {action: "invite-clear", id, token, from}           drop an invitation I got
//
// Cards: p.cards[anime] lists the different cards got from boosters, p.dupes[anime][id] the extra copies of each.
//   update {dupes: {anime: {id: n}}}                                       copies got again (counted, not listed twice)
//   POST /api/profile {action: "trades", id, token}                        trade offers I got and sent
//   POST /api/profile {action: "trade-offer", id, token, other, give: {g, id}, want: {g, id} | null}   to a friend
//   POST /api/profile {action: "trade-answer", id, token, tid, accept}     accept (the cards change hands) or decline
//   POST /api/profile {action: "trade-cancel", id, token, tid}             take back an offer I sent
import { getStore } from "@netlify/blobs";
import { createHash, randomBytes } from "node:crypto";

const GAMES = ["bleach", "hunterxhunter", "dragonball", "naruto", "onepiece", "jujutsukaisen", "blackclover", "attackontitan", "demonslayer", "myheroacademia", "haikyuu", "fireforce", "slime", "onepunchman"];
const MODES = ["daily", "endless", "online"];
const RANKS = ["S", "A", "B", "C", "D"];
const MAX_FRIENDS = 100;
// Activity counters sent as increments (rolls, rerolls, guesses, seconds played), capped per request.
const COUNTERS = { rolls: 2000, rerolls: 2000, guesses: 5000, seconds: 6 * 3600, oneShot: 200, blurWins: 500, descWins: 500, boostEarn: 60, boostOpen: 60, cardDuels: 50, cardWins: 50 };
const MAX_COLLECTION = 400; // cards kept per anime
const MAX_DUPES = 99; // extra copies kept per card
const MAX_TRADES = 20; // offers kept per profile, received and sent
const TRADE_TTL = 7 * 24 * 3600 * 1000; // an unanswered offer is dropped after a week
const SEASONS_KEPT = 6; // months of season results kept on a profile
// The current season: "2026-10", the month in Paris.
const seasonId = (d = new Date()) => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit" }).format(d).slice(0, 7);
// Profiles kept out of the leaderboards (their profile itself still works): na3na3, brybry, Nam.
const HIDDEN = new Set(["e18fe181d75c", "fbcf10b48ab5", "f9cae1589a3f"]);
const INVITE_TTL = 30 * 60 * 1000; // an invitation is kept 30 minutes (the room is probably gone after that)

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const fail = (error, status = 400) => json({ error }, status);
const hash = (s) => createHash("sha256").update(s).digest("hex");
const store = () => getStore({ name: "profiles", consistency: "strong" });

// Same rules as the pseudo in the online bar: printable, 2–20 characters.
function cleanName(s) {
  const name = String(s ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 20);
  return name.length >= 2 ? name : null;
}
const nameKey = (name) => `n/${name.toLowerCase()}`;

function cleanAvatar(a) {
  if (!a || !GAMES.includes(a.game) || !/^[a-z0-9-]{1,60}$/.test(a.char ?? "")) return null;
  return { game: a.game, char: a.char };
}

const num = (v) => (Number.isFinite(+v) && +v >= 0 ? Math.min(Math.floor(+v), 1e6) : 0);
function cleanStats(s) {
  const out = {};
  for (const g of GAMES) {
    const src = s?.[g];
    if (!src) continue;
    out[g] = {};
    for (const m of MODES) {
      const x = src[m] ?? {};
      out[g][m] = { played: num(x.played), wins: num(x.wins), max: num(x.max) };
    }
  }
  return out;
}
// A device only raises numbers: a phone with fewer games never wipes the PC's stats.
function mergeStats(oldS = {}, newS = {}) {
  const out = structuredClone(oldS);
  for (const [g, modes] of Object.entries(newS)) {
    out[g] ??= {};
    for (const [m, x] of Object.entries(modes)) {
      const o = out[g][m] ?? { played: 0, wins: 0, max: 0 };
      out[g][m] = { played: Math.max(o.played, x.played), wins: Math.max(o.wins, x.wins), max: Math.max(o.max, x.max) };
    }
  }
  return out;
}

function cleanCrew(c) {
  if (!c || !GAMES.includes(c.anime) || !RANKS.includes(c.rank)) return null;
  const score = Math.round(Math.min(10, Math.max(0, +c.score || 0)) * 10) / 10;
  const members = (Array.isArray(c.members) ? c.members : []).slice(0, 10).map((m) => ({
    id: String(m.id ?? "").slice(0, 60).replace(/[^a-z0-9-]/g, ""),
    name: String(m.name ?? "").slice(0, 40),
    role: String(m.role ?? "").slice(0, 30),
    points: num(m.points),
  }));
  return { anime: c.anime, rank: c.rank, score, members, at: Date.now() };
}

const publicView = (p) => ({
  id: p.id, name: p.name, avatar: p.avatar, created: p.created, stats: p.stats, crew: p.crew, counters: p.counters ?? {},
  // The collection is the cards from boosters (p.cards); the old Crew Roll draw lists (p.collection) no longer count.
  collection: p.cards ?? {}, dupes: p.dupes ?? {}, seasons: p.seasons ?? {}, showcase: owned(p, p.showcase),
});

// Only cards the player got from a booster can be in the showcase.
const owned = (p, list) => (Array.isArray(list) ? list : []).filter((c) => (p.cards?.[c?.g] ?? []).includes(c?.id));

// Profile showcase: up to 3 cards of the player's collection, shown to whoever opens the profile.
function cleanShowcase(list) {
  return (Array.isArray(list) ? list : []).slice(0, 3).map((c) => ({
    g: GAMES.includes(c?.g) ? c.g : null,
    id: /^[a-z0-9-]{1,60}$/.test(c?.id ?? "") ? c.id : null,
    n: String(c?.n ?? "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 40),
    p: Math.min(10, Math.max(1, Math.round(+c?.p || 1))),
    f: c?.f === true,
  })).filter((c) => c.g && c.id && c.n);
}

// Card collection: the ids got from boosters, added to what the profile already has.
function addCards(p, add) {
  p.cards ??= {};
  for (const g of GAMES) {
    const list = Array.isArray(add?.[g]) ? add[g] : [];
    const ok = list.map((x) => String(x)).filter((x) => /^[a-z0-9-]{1,60}$/.test(x));
    if (!ok.length) continue;
    p.cards[g] = [...new Set([...(p.cards[g] ?? []), ...ok])].slice(0, MAX_COLLECTION);
  }
}

// Copies got again: counted per card, for cards the profile has.
function addDupes(p, add) {
  for (const g of GAMES) {
    const src = add?.[g];
    if (!src || typeof src !== "object") continue;
    for (const [id, n] of Object.entries(src)) {
      const k = Math.min(20, num(n));
      if (!k || !/^[a-z0-9-]{1,60}$/.test(id) || !(p.cards?.[g] ?? []).includes(id)) continue;
      p.dupes ??= {};
      p.dupes[g] ??= {};
      p.dupes[g][id] = Math.min(MAX_DUPES, (p.dupes[g][id] ?? 0) + k);
    }
  }
}
// How many copies of a card the profile has; taking one leaves the card when a copy remains.
const copies = (p, c) => ((p.cards?.[c.g] ?? []).includes(c.id) ? 1 + (p.dupes?.[c.g]?.[c.id] ?? 0) : 0);
function takeCard(p, c) {
  const extra = p.dupes?.[c.g]?.[c.id] ?? 0;
  if (extra > 0) {
    if (extra > 1) p.dupes[c.g][c.id] = extra - 1;
    else delete p.dupes[c.g][c.id];
    return;
  }
  p.cards[c.g] = (p.cards[c.g] ?? []).filter((x) => x !== c.id);
  // The last copy leaves the showcase too.
  p.showcase = (p.showcase ?? []).filter((x) => !(x.g === c.g && x.id === c.id));
}
function giveCard(p, c) {
  p.cards ??= {};
  const list = p.cards[c.g] ?? [];
  if (list.includes(c.id)) {
    p.dupes ??= {};
    p.dupes[c.g] ??= {};
    p.dupes[c.g][c.id] = Math.min(MAX_DUPES, (p.dupes[c.g][c.id] ?? 0) + 1);
  } else p.cards[c.g] = [...list, c.id].slice(0, MAX_COLLECTION);
}

// This month's entry; older months beyond SEASONS_KEPT are dropped.
function seasonOf(p) {
  const id = seasonId();
  p.seasons ??= {};
  p.seasons[id] ??= { wins: 0, best: null, bests: {} };
  for (const k of Object.keys(p.seasons).sort().slice(0, -SEASONS_KEPT)) delete p.seasons[k];
  return p.seasons[id];
}

async function readProfile(id) {
  if (!/^[a-z0-9]{10,20}$/.test(id ?? "")) return null;
  return store().get(`p/${id}`, { type: "json" });
}
async function authed(id, token) {
  const p = await readProfile(id);
  if (!p || typeof token !== "string" || hash(token) !== p.tokenHash) return null;
  return p;
}

async function create(body) {
  const name = cleanName(body.name);
  if (!name) return fail("name");
  const s = store();
  if (await s.get(nameKey(name))) return fail("taken", 409);
  const id = randomBytes(8).toString("hex").slice(0, 12);
  const token = randomBytes(18).toString("base64url");
  const p = {
    id, name, avatar: cleanAvatar(body.avatar), created: Date.now(), updated: Date.now(),
    tokenHash: hash(token),
    stats: cleanStats(body.stats),
    crew: { played: 0, best: null },
  };
  await s.setJSON(`p/${id}`, p);
  await s.set(nameKey(name), id);
  return json({ profile: publicView(p), token });
}

async function login(body) {
  const [id, token] = String(body.code ?? "").trim().split(".");
  const p = await authed(id, token);
  if (!p) return fail("code", 401);
  return json({ profile: publicView(p), token });
}

async function update(body) {
  const p = await authed(body.id, body.token);
  if (!p) return fail("auth", 401);
  const s = store();
  const winsBefore = totalWins(p);
  if (body.name != null) {
    const name = cleanName(body.name);
    if (!name) return fail("name");
    if (name.toLowerCase() !== p.name.toLowerCase()) {
      const owner = await s.get(nameKey(name));
      if (owner && owner !== p.id) return fail("taken", 409);
      await s.delete(nameKey(p.name));
      await s.set(nameKey(name), p.id);
    }
    p.name = name;
  }
  if (body.avatar != null) p.avatar = cleanAvatar(body.avatar) ?? p.avatar;
  if (body.stats != null) p.stats = mergeStats(p.stats, cleanStats(body.stats));
  if (body.crew != null) {
    const c = cleanCrew(body.crew);
    if (c) {
      p.crew.played = (p.crew.played ?? 0) + 1;
      if (!p.crew.best || c.score > p.crew.best.score) p.crew.best = c;
      // Best crew of each anime too, for the per-anime leaderboards.
      p.crew.bests = bestsOf(p);
      if (!p.crew.bests[c.anime] || c.score > p.crew.bests[c.anime].score) p.crew.bests[c.anime] = c;
      const season = seasonOf(p);
      if (!season.best || c.score > season.best.score) season.best = c;
      if (!season.bests[c.anime] || c.score > season.bests[c.anime].score) season.bests[c.anime] = c;
    }
  }
  // body.collect (Crew Roll draws, sent by pages from before boosters) is ignored, and the old lists are dropped.
  delete p.collection;
  if (body.cards && typeof body.cards === "object") addCards(p, body.cards);
  if (body.dupes && typeof body.dupes === "object") addDupes(p, body.dupes);
  if (body.showcase != null) p.showcase = owned(p, cleanShowcase(body.showcase));
  if (body.add && typeof body.add === "object") {
    p.counters ??= {};
    for (const [k, cap] of Object.entries(COUNTERS)) {
      const v = Math.min(cap, num(body.add[k]));
      if (v) p.counters[k] = (p.counters[k] ?? 0) + v;
    }
  }
  // A team match just ended: the team's result, kept under its name (a player keeps at most 30 teams).
  if (body.team != null && typeof body.team === "object") {
    const name = cleanName(body.team.name);
    if (name) {
      p.teams ??= {};
      const key = name.toLowerCase();
      const t = (p.teams[key] ??= { name, wins: 0, played: 0, best: 0 });
      t.name = name;
      t.played++;
      if (body.team.won === true) t.wins++;
      else if (body.team.draw === true) t.draws = (t.draws ?? 0) + 1;
      // Head to head: the record against each team met (by name; the unnamed red / blue teams don't count).
      const rival = cleanName(body.team.vs);
      if (rival && rival.toLowerCase() !== key) {
        t.vs ??= {};
        const v = (t.vs[rival.toLowerCase()] ??= { name: rival, wins: 0, draws: 0, played: 0 });
        v.name = rival;
        v.played++;
        if (body.team.won === true) v.wins++;
        else if (body.team.draw === true) v.draws++;
        const rivals = Object.keys(t.vs).sort((a, b) => t.vs[b].played - t.vs[a].played);
        for (const k of rivals.slice(20)) delete t.vs[k];
      }
      const score = Math.min(10, Math.max(0, Number(body.team.score) || 0));
      if (score > t.best) t.best = Math.round(score * 10) / 10;
      t.at = Date.now();
      const keys = Object.keys(p.teams).sort((a, b) => (p.teams[b].at ?? 0) - (p.teams[a].at ?? 0));
      for (const k of keys.slice(30)) delete p.teams[k];
    }
  }
  // A Crew Roll online match just ended.
  if (body.duel != null) {
    p.crew.duels = (p.crew.duels ?? 0) + 1;
    if (body.duel.won === true) p.crew.duelWins = (p.crew.duelWins ?? 0) + 1;
  }
  // Wins earned by this update count for the month's season.
  const gained = totalWins(p) - winsBefore;
  if (gained > 0) seasonOf(p).wins += Math.min(gained, 50);
  p.updated = Date.now();
  await s.setJSON(`p/${p.id}`, p);
  return json({ profile: publicView(p) });
}

// Every win: guessing games (daily, endless, online races) and Crew Roll online matches.
const totalWins = (p) => Object.values(p.stats ?? {}).reduce((a, modes) => a + Object.values(modes).reduce((b, x) => b + (x.wins || 0), 0), 0) + (p.crew?.duelWins || 0);

// Best crew per anime; profiles from before it existed only have their overall best.
function bestsOf(p) {
  const out = { ...(p.crew?.bests ?? {}) };
  const best = p.crew?.best;
  if (best && GAMES.includes(best.anime) && (!out[best.anime] || best.score > out[best.anime].score)) out[best.anime] = best;
  return out;
}

async function leaderboard() {
  const s = store();
  const { blobs } = await s.list({ prefix: "p/" });
  const all = (await Promise.all(blobs.slice(0, 500).map((b) => s.get(b.key, { type: "json" })))).filter((p) => p && !HIDDEN.has(p.id));
  const row = (p) => ({ id: p.id, name: p.name, avatar: p.avatar });
  const crewRow = (p, c) => ({ ...row(p), score: c.score, rank: c.rank, anime: c.anime, members: (c.members ?? []).map((m) => ({ id: m.id, points: m.points })) });
  // Ties: the crew made first stays ahead.
  const byScore = (a, b) => b.c.score - a.c.score || (a.c.at ?? 0) - (b.c.at ?? 0);
  const crews = all.filter((p) => p.crew?.best).map((p) => ({ p, c: p.crew.best })).sort(byScore).slice(0, 20).map(({ p, c }) => crewRow(p, c));
  const byAnime = {};
  for (const g of GAMES) {
    byAnime[g] = all.map((p) => ({ p, c: bestsOf(p)[g] })).filter((x) => x.c).sort(byScore).slice(0, 20).map(({ p, c }) => crewRow(p, c));
  }
  const wins = all.map((p) => ({ ...row(p), wins: totalWins(p) })).filter((p) => p.wins > 0).sort((a, b) => b.wins - a.wins).slice(0, 20);

  // A season's boards: best crews (overall and per anime) and most wins that month.
  const seasonBoard = (id, size) => {
    const of = (p) => p.seasons?.[id];
    const seasonCrews = all.filter((p) => of(p)?.best).map((p) => ({ p, c: of(p).best })).sort(byScore).slice(0, size).map(({ p, c }) => crewRow(p, c));
    const seasonByAnime = {};
    for (const g of GAMES) seasonByAnime[g] = all.map((p) => ({ p, c: of(p)?.bests?.[g] })).filter((x) => x.c).sort(byScore).slice(0, size).map(({ p, c }) => crewRow(p, c));
    const seasonWins = all.map((p) => ({ ...row(p), wins: of(p)?.wins || 0 })).filter((p) => p.wins > 0).sort((a, b) => b.wins - a.wins).slice(0, size);
    return { id, crews: seasonCrews, byAnime: seasonByAnime, wins: seasonWins };
  };
  const now = seasonId();
  const season = seasonBoard(now, 20);
  // The podiums of the last finished seasons.
  const past = [...new Set(all.flatMap((p) => Object.keys(p.seasons ?? {})))].filter((id) => id < now).sort().reverse().slice(0, 3);
  const podiums = past.map((id) => { const b = seasonBoard(id, 3); return { id, crews: b.crews, wins: b.wins }; });
  // Teams: every member records the same match, so a team counts the best record among its members.
  const teamMap = new Map();
  for (const p of all) {
    for (const t of Object.values(p.teams ?? {})) {
      const key = String(t.name ?? "").toLowerCase();
      if (!key) continue;
      const row = teamMap.get(key) ?? { name: t.name, wins: 0, draws: 0, played: 0, best: 0, members: [], vs: {} };
      // The member who played the most matches has the fullest record of the team.
      if ((t.played || 0) > row.played) { row.wins = t.wins || 0; row.draws = t.draws || 0; row.played = t.played || 0; }
      row.best = Math.max(row.best, t.best || 0);
      for (const [k, v] of Object.entries(t.vs ?? {})) {
        if (!row.vs[k] || (v.played || 0) > row.vs[k].played) row.vs[k] = { name: v.name, wins: v.wins || 0, draws: v.draws || 0, played: v.played || 0 };
      }
      if (!row.members.includes(p.name)) row.members.push(p.name);
      teamMap.set(key, row);
    }
  }
  // Ranked by wins, then by win rate; each with its record against every team it met.
  const rate = (r) => r.wins / Math.max(1, r.played);
  const teams = [...teamMap.values()].filter((r) => r.played > 0).sort((a, b) => b.wins - a.wins || rate(b) - rate(a) || b.best - a.best).slice(0, 20)
    .map((r) => ({ ...r, members: r.members.slice(0, 6), vs: Object.values(r.vs).sort((a, b) => b.played - a.played).slice(0, 12) }));
  return json({ crews, byAnime, wins, teams, players: all.length, season, podiums });
}

// ── Friends: mutual, after a request. Each profile keeps `friends` and the `requests` it received. ──
const mini = (p) => ({ id: p.id, name: p.name, avatar: p.avatar });
const ids = (list) => (Array.isArray(list) ? list.filter((x) => typeof x === "string") : []);

async function friendsView(p) {
  const s = store();
  const load = async (list) => (await Promise.all(ids(list).map((id) => s.get(`p/${id}`, { type: "json" })))).filter(Boolean).map(mini);
  const [friends, requests] = await Promise.all([load(p.friends), load(p.requests)]);
  return json({ friends, requests, invites: freshInvites(p) });
}

const freshInvites = (p) => (Array.isArray(p.invites) ? p.invites : []).filter((i) => Date.now() - i.at < INVITE_TTL);
function cleanRoom(r) {
  const code = String(r?.code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const channel = ["crew", "race", "cards"].includes(r?.channel) ? r.channel : null;
  const game = GAMES.includes(r?.game) ? r.game : null;
  return code && channel && (channel !== "race" || game) ? { code, channel, game } : null;
}

async function friendInvite(body) {
  const p = await authed(body.id, body.token);
  if (!p) return fail("auth", 401);
  const room = cleanRoom(body.room);
  if (!room) return fail("room");
  const other = ids(p.friends).includes(body.other) ? await readProfile(body.other) : null;
  if (!other || !ids(other.friends).includes(p.id)) return fail("friend", 403);
  // One invitation per friend: the newest replaces the previous one.
  other.invites = [...freshInvites(other).filter((i) => i.from !== p.id), { from: p.id, name: p.name, avatar: p.avatar, room, at: Date.now() }].slice(-10);
  await store().setJSON(`p/${other.id}`, other);
  return json({ ok: true });
}

async function inviteClear(body) {
  const p = await authed(body.id, body.token);
  if (!p) return fail("auth", 401);
  p.invites = freshInvites(p).filter((i) => i.from !== body.from);
  await store().setJSON(`p/${p.id}`, p);
  return friendsView(p);
}

async function befriend(a, b) {
  const s = store();
  for (const [x, y] of [[a, b], [b, a]]) {
    x.friends = [...new Set([...ids(x.friends), y.id])].slice(-MAX_FRIENDS);
    x.requests = ids(x.requests).filter((id) => id !== y.id);
    await s.setJSON(`p/${x.id}`, x);
  }
}

async function friends(body) {
  const p = await authed(body.id, body.token);
  if (!p) return fail("auth", 401);
  return friendsView(p);
}

async function friendAdd(body) {
  const p = await authed(body.id, body.token);
  if (!p) return fail("auth", 401);
  const name = cleanName(body.name);
  const otherId = name && (await store().get(nameKey(name)));
  const other = otherId && (await readProfile(otherId));
  if (!other) return fail("nobody", 404);
  if (other.id === p.id) return fail("self");
  if (ids(p.friends).includes(other.id)) return friendsView(p);
  // They already asked me: that's a yes.
  if (ids(p.requests).includes(other.id)) { await befriend(p, other); return friendsView(p); }
  if (ids(other.requests).length >= MAX_FRIENDS) return fail("full", 409);
  other.requests = [...new Set([...ids(other.requests), p.id])];
  await store().setJSON(`p/${other.id}`, other);
  return json({ ...(await (await friendsView(p)).json()), sent: mini(other) });
}

async function friendAccept(body) {
  const p = await authed(body.id, body.token);
  if (!p) return fail("auth", 401);
  const other = ids(p.requests).includes(body.other) ? await readProfile(body.other) : null;
  if (other) await befriend(p, other);
  else { p.requests = ids(p.requests).filter((id) => id !== body.other); await store().setJSON(`p/${p.id}`, p); }
  return friendsView(p);
}

// Removes a friend, or declines a request.
async function friendRemove(body) {
  const p = await authed(body.id, body.token);
  if (!p) return fail("auth", 401);
  const s = store();
  p.friends = ids(p.friends).filter((id) => id !== body.other);
  p.requests = ids(p.requests).filter((id) => id !== body.other);
  await s.setJSON(`p/${p.id}`, p);
  const other = await readProfile(body.other);
  if (other && ids(other.friends).includes(p.id)) {
    other.friends = ids(other.friends).filter((id) => id !== p.id);
    await s.setJSON(`p/${other.id}`, other);
  }
  return friendsView(p);
}

// ── Trades between friends: one card for one card (or a gift). The offer waits on both profiles; when the friend
// accepts, both still need their card, then each card changes hands (a duplicate goes first). ──
const cleanCard = (c) => (c && GAMES.includes(c.g) && /^[a-z0-9-]{1,60}$/.test(c.id ?? "") ? { g: c.g, id: c.id } : null);
const freshTrades = (list) => (Array.isArray(list) ? list : []).filter((x) => Date.now() - x.at < TRADE_TTL);
// done: my offers that were accepted (the page tells me once).
const tradesView = (p, extra = {}) => json({ in: freshTrades(p.tradesIn), out: freshTrades(p.tradesOut), done: freshTrades(p.tradesDone), ...extra });

async function trades(body) {
  const p = await authed(body.id, body.token);
  if (!p) return fail("auth", 401);
  return tradesView(p, { profile: publicView(p) });
}

async function tradeOffer(body) {
  const p = await authed(body.id, body.token);
  if (!p) return fail("auth", 401);
  const give = cleanCard(body.give);
  const want = body.want == null ? null : cleanCard(body.want);
  if (!give || (body.want != null && !want)) return fail("card");
  const other = ids(p.friends).includes(body.other) ? await readProfile(body.other) : null;
  if (!other || !ids(other.friends).includes(p.id)) return fail("friend", 403);
  if (!copies(p, give)) return fail("mine", 409);
  if (want && !copies(other, want)) return fail("theirs", 409);
  const offer = { tid: randomBytes(6).toString("hex"), from: mini(p), to: mini(other), give, want, at: Date.now() };
  p.tradesOut = [...freshTrades(p.tradesOut), offer].slice(-MAX_TRADES);
  other.tradesIn = [...freshTrades(other.tradesIn), offer].slice(-MAX_TRADES);
  const s = store();
  await s.setJSON(`p/${other.id}`, other);
  await s.setJSON(`p/${p.id}`, p);
  return tradesView(p);
}

async function tradeAnswer(body) {
  const p = await authed(body.id, body.token);
  if (!p) return fail("auth", 401);
  const offer = freshTrades(p.tradesIn).find((x) => x.tid === body.tid);
  if (!offer) return fail("gone", 404);
  const other = await readProfile(offer.from.id);
  const drop = (q) => {
    q.tradesIn = freshTrades(q.tradesIn).filter((x) => x.tid !== offer.tid);
    q.tradesOut = freshTrades(q.tradesOut).filter((x) => x.tid !== offer.tid);
  };
  drop(p);
  let error = null;
  if (other) {
    drop(other);
    if (body.accept === true) {
      // Both cards must still be there (a card may have been traded away meanwhile).
      if (!copies(other, offer.give)) error = "theirs";
      else if (offer.want && !copies(p, offer.want)) error = "mine";
      else {
        takeCard(other, offer.give);
        giveCard(p, offer.give);
        if (offer.want) { takeCard(p, offer.want); giveCard(other, offer.want); }
        const done = { ...offer, done: Date.now() };
        other.tradesDone = [...(other.tradesDone ?? []), done].slice(-10);
      }
    }
    await store().setJSON(`p/${other.id}`, other);
  } else if (body.accept === true) error = "theirs";
  await store().setJSON(`p/${p.id}`, p);
  if (error) return fail(error, 409);
  return tradesView(p, { profile: publicView(p) });
}

async function tradeCancel(body) {
  const p = await authed(body.id, body.token);
  if (!p) return fail("auth", 401);
  const offer = freshTrades(p.tradesOut).find((x) => x.tid === body.tid);
  p.tradesOut = freshTrades(p.tradesOut).filter((x) => x.tid !== body.tid);
  await store().setJSON(`p/${p.id}`, p);
  if (offer) {
    const other = await readProfile(offer.to.id);
    if (other) { other.tradesIn = freshTrades(other.tradesIn).filter((x) => x.tid !== offer.tid); await store().setJSON(`p/${other.id}`, other); }
  }
  return tradesView(p);
}

export default async (req) => {
  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      if (url.searchParams.has("leaderboard")) return leaderboard();
      const p = await readProfile(url.searchParams.get("id"));
      return p ? json({ profile: publicView(p) }) : fail("not found", 404);
    }
    if (req.method !== "POST") return fail("method", 405);
    const text = await req.text();
    if (text.length > 20000) return fail("too large", 413);
    const body = JSON.parse(text || "{}");
    if (body.action === "create") return create(body);
    if (body.action === "login") return login(body);
    if (body.action === "update") return update(body);
    if (body.action === "friends") return friends(body);
    if (body.action === "friend-add") return friendAdd(body);
    if (body.action === "friend-accept") return friendAccept(body);
    if (body.action === "friend-remove") return friendRemove(body);
    if (body.action === "friend-invite") return friendInvite(body);
    if (body.action === "invite-clear") return inviteClear(body);
    if (body.action === "trades") return trades(body);
    if (body.action === "trade-offer") return tradeOffer(body);
    if (body.action === "trade-answer") return tradeAnswer(body);
    if (body.action === "trade-cancel") return tradeCancel(body);
    return fail("action");
  } catch (e) {
    console.error(e);
    return fail("server", 500);
  }
};

export const config = { path: "/api/profile" };
