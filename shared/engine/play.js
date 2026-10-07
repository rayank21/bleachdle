// Game variants: the tabs under the modes, and the blurred portrait and description games.

import { S } from "./state.js";
import { $, CLUE_AT, DESC, NICK_AT, PLAYS, auraOf, isOnline, play, saveSettings, settings, t, view } from "./core.js";
import { ICONS, el, esc, thumb } from "./dom.js";
import { startGame } from "./ui.js";
import { rooms } from "./race.js";

// ── Game variants: tabs under the modes, and the panel of the blur and description games ──
export const PLAY_LABEL = { classic: "playClassic", blur: "playBlur", desc: "playDesc" };
const PLAY_ICON = {
  classic: `<svg viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  blur: `<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="2 2"/></svg>`,
  desc: `<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};
export function setupPlay() {
  const tabs = el("div", "play-tabs");
  tabs.id = "playTabs";
  tabs.setAttribute("role", "tablist");
  $(".mode-tabs").after(tabs);
  const box = el("section", "card play-box");
  box.id = "playBox";
  box.hidden = true;
  box.setAttribute("aria-live", "polite");
  $(".guess-box").before(box);
}
export function renderPlayTabs() {
  const tabs = $("#playTabs");
  if (!tabs) return;
  tabs.innerHTML = "";
  const inRoom = isOnline() && rooms?.myRoom;
  const current = isOnline() ? (S.race ? S.race.play : rooms?.myRoom?.meta?.play ?? settings.play) : settings.play;
  for (const p of PLAYS) {
    if (p === "desc" && !Object.keys(DESC).length) continue;
    const b = el("button", `play-tab${p === current ? " is-active" : ""}`, `${PLAY_ICON[p]}<span>${esc(t(PLAY_LABEL[p]))}</span>`);
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", p === current);
    // In a room, only the host picks the game, and not during a race.
    b.disabled = !!(S.race && isOnline()) || !!(inRoom && !rooms.isHost());
    b.addEventListener("click", () => {
      if (p === current) return;
      settings.play = p;
      saveSettings();
      if (inRoom) rooms.setMeta({ play: p });
      startGame();
    });
    tabs.append(b);
  }
}

const BLUR = [18, 13, 10, 7.5, 5.5, 4, 3, 2, 1.2, 0.6];
const ZOOM = [1.8, 1.6, 1.45, 1.32, 1.22, 1.14, 1.08, 1.04, 1.02, 1];
export function renderPlay(feedback) {
  const box = $("#playBox");
  if (!box) return;
  const p = play();
  box.hidden = !S.game || p === "classic";
  if (box.hidden) return;
  const tg = view(S.game.target);
  const n = S.game.guesses.length;
  const over = S.game.status !== "playing";
  box.innerHTML = "";
  box.dataset.play = p;
  if (p === "blur") {
    const step = Math.min(n, BLUR.length - 1);
    const frame = el("div", `blur-frame${over ? ` is-clear${auraOf(tg.id)}` : ""}${feedback === "wrong" ? " is-wrong" : ""}`);
    frame.style.setProperty("--blur", `${over ? 0 : BLUR[step]}px`);
    frame.style.setProperty("--zoom", over ? 1 : ZOOM[step]);
    frame.style.setProperty("--gray", over ? 0 : Math.max(0, 1 - n * 0.2));
    const img = el("img");
    img.src = tg.image;
    img.alt = "";
    img.draggable = false;
    frame.append(img);
    const meter = el("div", "blur-meter");
    for (let i = 0; i < BLUR.length; i++) meter.append(el("i", i <= step || over ? "is-on" : ""));
    box.append(el("p", "play-kicker", esc(t("blurKicker"))), frame, meter, el("p", "muted play-help", esc(over ? "" : t("blurHelp"))));
  } else {
    const d = DESC[S.game.target] ?? ["", "", null, null];
    const quote = el("blockquote", "desc-quote");
    quote.append(el("span", "desc-mark", "“"), el("p", null, esc(settings.lang === "fr" ? d[1] : d[0])));
    const clues = el("div", "desc-clues");
    clues.append(clueCard(clueOf(d[2]), CLUE_AT, n, over), clueCard(nickOf(d[3], tg), NICK_AT, n, over));
    box.append(el("p", "play-kicker", esc(t("descKicker"))), quote, clues);
    if (feedback === "wrong") { quote.classList.add("is-wrong"); }
  }
  // The wrong guesses so far, newest first.
  const tried = S.game.guesses.filter((id) => id !== S.game.target).reverse();
  if (tried.length) {
    const list = el("div", "tried");
    list.append(el("span", "tried-label", esc(t("tried"))));
    tried.forEach((id, i) => {
      const c = view(id);
      const chip = el("span", `tried-chip${i === 0 && feedback === "wrong" ? " is-new" : ""}`, `<span class="tried-face${auraOf(id)}">${thumb(c.image)}</span><span>${esc(c.name)}</span>`);
      list.append(chip);
    });
    box.append(list);
  }
}
// Clue after 3 guesses: a technique ("a:"), a place ("p:") or another fact ([en, fr]).
function clueOf(raw) {
  if (Array.isArray(raw)) return { label: t("clueInfo"), value: settings.lang === "fr" ? raw[1] : raw[0], icon: "spark" };
  const m = /^([ap]):(.+)$/.exec(raw ?? "");
  if (!m) return null;
  return m[1] === "a" ? { label: t("clueAtk"), value: m[2], icon: "spark" } : { label: t("cluePlace"), value: m[2], icon: "shield" };
}
// After 5 guesses: a nickname (or One Piece epithet), else the first letter of the name.
function nickOf(raw, tg) {
  const nick = Array.isArray(raw) ? (settings.lang === "fr" ? raw[1] : raw[0]) : raw;
  if (nick) return { label: t("clueNick"), value: settings.lang === "fr" ? `« ${nick} »` : `“${nick}”`, icon: "person" };
  return { label: t("clueLetter"), value: tg.name.trim()[0].toUpperCase(), icon: "person", letter: true };
}
function clueCard(clue, at, n, over) {
  const open = !!clue && (n >= at || over);
  const card = el("div", `desc-clue${open ? " is-open" : ""}${clue?.letter ? " is-letter" : ""}`);
  card.innerHTML = `${ICONS[clue?.icon ?? "spark"] ?? ""}<span class="desc-clue-label">${esc(clue ? clue.label : t("clueInfo"))}</span>`;
  if (open) card.append(el("strong", null, esc(clue.value)));
  else card.append(el("small", null, esc(clue ? t("hintIn")(at - n) : "—")));
  return card;
}
