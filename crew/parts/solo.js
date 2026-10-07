// Solo mode.

import { S } from "./state.js";
import { $, DEFAULT_POWER, REROLLS, average, el, filledOf, fitsIn, icon, loadGame, makePool, makeSlots, openSlots, playerArc, pointsFor, rankOf, slotLabel, t, toast } from "./base.js";
import { burst, countUp, fly, sfx } from "./fx.js";
import { makeReel } from "./reel.js";
import { popSlot, renderBoard, slotFace } from "./board.js";

// ════════════════════ SOLO ════════════════════
export let solo = null;
let soloReel = null;

export async function startSolo() {
  const g = S.currentGame;
  const data = await loadGame(g);
  const arc = playerArc(data.config) ?? data.config.arcs.length - 1;
  const pool = makePool(g, data, arc);
  solo = { g, pool, arc, slots: makeSlots(g, pool), rolled: null, rerolls: REROLLS, done: false, rolling: false };
  renderSolo(true);
  window.dispatchEvent(new Event("dle:admin-refresh"));
}

export function soloCandidates(exclude) {
  const used = new Set(filledOf(solo.slots).map((s) => s.char.id));
  return solo.pool.filter((c) => !used.has(c.id) && c.id !== exclude && fitsIn(solo.slots, c));
}

// One random character of the list. With the admin panel's luck (shared/admin.js, unlocked browsers only) above 1,
// characters worth more in the places still free weigh more.
export function draw(list, slots = null) {
  const luck = Math.min(Math.max(Number(window.DLE_ADMIN_LUCK) || 1, 1), 5);
  if (luck === 1) return list[Math.floor(Math.random() * list.length)];
  // What a character is worth here: the most it would score in one of the places still free on the board (so a
  // strong character useless in the missing roles doesn't count as strong). Each 2.5 points above 5 multiply the
  // odds by `luck` (below 5 divide them): at ×5, most draws are worth 8 or more in a free place.
  const open = slots ? openSlots(slots) : [];
  const worth = (c) => {
    const fit = open.filter((sl) => sl.def.fits(c));
    return fit.length ? Math.max(...fit.map((sl) => pointsFor(sl, c))) : c.power ?? DEFAULT_POWER;
  };
  const weights = list.map((c) => luck ** ((Math.min(worth(c), 10) - 5) / 2.5));
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) if ((r -= weights[i]) < 0) return list[i];
  return list[list.length - 1];
}

// `forced`: a character picked in the admin panel instead of a random draw.
export async function soloRoll(isReroll, forced = null) {
  // No draw while a portrait is still flying to its slot: that slot is not filled yet.
  if (solo.rolling || solo.placing || solo.done) return;
  let list = soloCandidates(solo.rolled?.id);
  // Rerolling the only character that still fits gives it back rather than ending the crew.
  if (!list.length && solo.rolled) list = soloCandidates();
  if (!list.length && forced) list = [forced];
  if (!list.length) return soloFinish();
  if (isReroll) solo.rerolls--;
  window.DLE_Profile?.count(isReroll ? "rerolls" : "rolls");
  const pick = forced ?? draw(list, solo.slots);
  const run = solo;
  run.rolling = true;
  run.rolled = null;
  renderSoloActions();
  renderBoard($("#crewBoard"), run.slots);
  await soloReel.spin(list, pick, { game: run.g.id, arc: run.arc });
  if (solo !== run) return; // a new crew was started meanwhile
  run.rolling = false;
  // Safety net: a draw that no longer fits (or is already on the board) is redrawn for free.
  if (!forced && (!fitsIn(run.slots, pick) || filledOf(run.slots).some((x) => x.char.id === pick.id))) return soloRoll(false);
  run.rolled = pick;
  const fresh = window.DLE_Profile?.collect(run.g.id, pick.id);
  soloReel.hint(fresh ? `${t("newCard")} ${t("chooseSlot")}` : t("chooseSlot"));
  renderBoard($("#crewBoard"), run.slots, { rolled: pick, onPlace: soloPlace });
  renderSoloActions();
}

async function soloPlace(i) {
  const run = solo;
  const c = run.rolled;
  if (!c) return;
  run.rolled = null;
  run.placing = true;
  soloReel.hint("");
  renderSoloActions();
  const target = slotFace($("#crewBoard"), i);
  renderBoard($("#crewBoard"), run.slots);
  await fly(soloReel.window, target, c.formImage || c.image);
  run.placing = false;
  if (solo !== run) return;
  const slot = run.slots[i];
  slot.char = c;
  slot.points = pointsFor(slot, c);
  soloReel.idle();
  renderBoard($("#crewBoard"), run.slots);
  popSlot($("#crewBoard"), i, slot.points);
  renderSoloStatus();
  if (!openSlots(run.slots).length || !soloCandidates().length) soloFinish();
  else renderSoloActions();
}

function soloFinish() {
  solo.done = true;
  solo.rolled = null;
  renderBoard($("#crewBoard"), solo.slots);
  renderSoloStatus();
  const panel = $("#rollPanel");
  panel.textContent = "";
  panel.append(resultBlock(average(solo.slots), solo.slots, {
    title: t("resultTitle"),
    actions: [[t("share"), "btn-ghost", () => copyText(shareSolo())], [t("again"), "btn-primary", startSolo]],
  }));
  // Saved once per crew to the player's profile (best crew and leaderboard).
  if (!solo.recorded) {
    solo.recorded = true;
    setTimeout(() => window.DLE_Profile?.earnBooster?.(1, "crew"), 1600);
    const avg = average(solo.slots);
    window.DLE_Profile?.recordCrew({
      anime: solo.g.id,
      rank: rankOf(avg),
      score: avg,
      members: filledOf(solo.slots).map((s) => ({ id: s.char.id, name: s.char.name, role: slotLabel(s), points: s.points })),
    });
  }
}

export function resultBlock(avg, slots, { title, actions, outcome }) {
  const rank = rankOf(avg);
  const f = filledOf(slots);
  const best = [...f].sort((a, b) => b.points - a.points)[0];
  const worst = [...f].sort((a, b) => a.points - b.points)[0];
  const box = el("div", "crew-result");
  box.append(el("p", "result-kicker", title));
  if (outcome) box.append(el("p", `duel-outcome is-${outcome.kind}`, outcome.text));
  const r = el("div", `crew-rank rank-${rank}`);
  setTimeout(() => sfx(rank === "S" || rank === "A" ? "win" : "stamp"), 150);
  r.append(el("span", null, rank));
  box.append(r);
  const avgEl = el("p", "crew-avg");
  const num = el("span", null, "0.0");
  avgEl.append(num, " / 10");
  box.append(avgEl);
  countUp(num, avg, 1, 900);
  if (best) box.append(el("p", "muted", `${t("best")}: ${best.char.name} (${slotLabel(best)}, ${best.points})`));
  if (worst && worst !== best) box.append(el("p", "muted", `${t("worst")}: ${worst.char.name} (${slotLabel(worst)}, ${worst.points})`));
  const row = el("div", "roll-actions");
  for (const [label, cls, fn] of actions) {
    const b = el("button", cls, label);
    b.type = "button";
    b.addEventListener("click", fn);
    row.append(b);
  }
  box.append(row);
  setTimeout(() => {
    const rect = r.getBoundingClientRect();
    if (rank === "S" || rank === "A" || outcome?.kind === "win") burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, 380);
  return box;
}

function renderSoloStatus() {
  const f = filledOf(solo.slots).length;
  const total = solo.slots.filter((s) => !s.locked).length;
  const score = $("#crewScore");
  if (f) countUp(score, average(solo.slots));
  else { score.textContent = "–"; score.dataset.value = 0; }
  $("#crewFilled").textContent = t("filled")(f, total);
  // The ring shows the score out of 10; one pip per place, coloured by its points.
  $("#crewRing").style.strokeDasharray = `${f ? average(solo.slots) * 10 : 0} 100`;
  const rank = $("#crewLiveRank");
  rank.hidden = !f;
  if (f) {
    const letter = rankOf(average(solo.slots));
    // The badge stamps in again whenever the rank changes.
    const changed = rank.textContent !== letter;
    rank.textContent = letter;
    rank.className = `crew-live-rank rank-${letter}${changed ? " stamp" : ""}`;
  } else rank.textContent = "";
  const pips = $("#crewPips");
  pips.textContent = "";
  for (const s of solo.slots) {
    if (s.locked) continue;
    const pip = el("span", s.char ? `crew-pip is-filled p${Math.min(10, Math.round(s.points))}` : "crew-pip");
    pip.title = slotLabel(s);
    pips.append(pip);
  }
}

export function renderSoloActions() {
  const box = $("#rollActions");
  if (!box) return;
  box.textContent = "";
  if (solo.done) return;
  if (!solo.rolled) {
    const b = el("button", "btn-primary roll-btn", solo.rolling ? t("rolling") : t("roll"));
    b.prepend(icon("dice"));
    b.type = "button";
    b.disabled = solo.rolling || solo.placing;
    b.addEventListener("click", () => soloRoll(false));
    box.append(b);
  } else {
    // A drawn character with nowhere to go can always be skipped, so the crew never gets stuck.
    const stuck = !fitsIn(solo.slots, solo.rolled);
    const b = el("button", "btn-ghost", stuck ? t("skip") : t("reroll")(solo.rerolls));
    b.type = "button";
    b.disabled = !stuck && solo.rerolls <= 0;
    b.addEventListener("click", () => soloRoll(!stuck));
    box.append(b);
  }
}

export function renderSolo(stagger) {
  const panel = $("#rollPanel");
  panel.textContent = "";
  soloReel = makeReel();
  panel.append(soloReel.el);
  if (solo.rolled) { soloReel.show(solo.rolled); soloReel.hint(t("chooseSlot")); } else soloReel.idle();
  const actions = el("div", "roll-actions");
  actions.id = "rollActions";
  panel.append(actions);
  renderBoard($("#crewBoard"), solo.slots, { stagger, rolled: solo.rolled, onPlace: solo.rolled ? soloPlace : null });
  renderSoloStatus();
  renderSoloActions();
  if (solo.done) soloFinish();
}

function shareSolo() {
  const avg = average(solo.slots);
  const lines = filledOf(solo.slots).map((s) => `${slotLabel(s)}: ${s.char.name} (${s.points})`);
  return `${t("title")} · ${solo.g.anime} · ${rankOf(avg)} ${avg.toFixed(1)}/10\n${lines.join("\n")}`;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = el("textarea");
    ta.value = text;
    document.body.append(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  toast(t("copied"));
}
