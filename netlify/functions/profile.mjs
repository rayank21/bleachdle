// Player profiles, stored in Netlify Blobs.
// A profile has a public part (name, avatar, stats, best crew) and a secret token kept only as a
// hash. The browser keeps the token; "id.token" is the recovery code used to log in elsewhere.
//
//   GET  /api/profile?id=…                 public profile
//   GET  /api/profile?leaderboard=1        best crews and most wins
//   POST /api/profile {action: "create", name, avatar}
//   POST /api/profile {action: "login", code}
//   POST /api/profile {action: "update", id, token, name?, avatar?, stats?, crew?}
//   POST /api/profile {action: "friends", id, token}                  my friends and friend requests
//   POST /api/profile {action: "friend-add", id, token, name}         send a request (or accept theirs)
//   POST /api/profile {action: "friend-accept" | "friend-remove", id, token, other}
import { getStore } from "@netlify/blobs";
import { createHash, randomBytes } from "node:crypto";

const GAMES = ["bleach", "hunterxhunter", "dragonball", "naruto", "onepiece", "jujutsukaisen", "blackclover"];
const MODES = ["daily", "endless"];
const RANKS = ["S", "A", "B", "C", "D"];
const MAX_FRIENDS = 100;

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

const publicView = (p) => ({ id: p.id, name: p.name, avatar: p.avatar, created: p.created, stats: p.stats, crew: p.crew });

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
    }
  }
  p.updated = Date.now();
  await s.setJSON(`p/${p.id}`, p);
  return json({ profile: publicView(p) });
}

const totalWins = (stats = {}) => Object.values(stats).reduce((a, modes) => a + Object.values(modes).reduce((b, x) => b + (x.wins || 0), 0), 0);

async function leaderboard() {
  const s = store();
  const { blobs } = await s.list({ prefix: "p/" });
  const all = (await Promise.all(blobs.slice(0, 500).map((b) => s.get(b.key, { type: "json" })))).filter(Boolean);
  const row = (p) => ({ id: p.id, name: p.name, avatar: p.avatar });
  const crews = all.filter((p) => p.crew?.best).sort((a, b) => b.crew.best.score - a.crew.best.score).slice(0, 20)
    .map((p) => ({ ...row(p), score: p.crew.best.score, rank: p.crew.best.rank, anime: p.crew.best.anime }));
  const wins = all.map((p) => ({ ...row(p), wins: totalWins(p.stats) })).filter((p) => p.wins > 0).sort((a, b) => b.wins - a.wins).slice(0, 20);
  return json({ crews, wins, players: all.length });
}

// ── Friends: mutual, after a request. Each profile keeps `friends` and the `requests` it received. ──
const mini = (p) => ({ id: p.id, name: p.name, avatar: p.avatar });
const ids = (list) => (Array.isArray(list) ? list.filter((x) => typeof x === "string") : []);

async function friendsView(p) {
  const s = store();
  const load = async (list) => (await Promise.all(ids(list).map((id) => s.get(`p/${id}`, { type: "json" })))).filter(Boolean).map(mini);
  const [friends, requests] = await Promise.all([load(p.friends), load(p.requests)]);
  return json({ friends, requests });
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
    return fail("action");
  } catch (e) {
    console.error(e);
    return fail("server", 500);
  }
};

export const config = { path: "/api/profile" };
