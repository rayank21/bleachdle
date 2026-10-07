// A crew's board: its places and the characters in them.

import { ROLE_RGB, el, icon, isCaptain, pointsFor, slotLabel, t } from "./base.js";
import { burst, ensureFilters, sfx, shockwave } from "./fx.js";

// ── Board ──
export function renderBoard(container, slots, { rolled = null, onPlace = null, mini = false, stagger = false } = {}) {
  container.textContent = "";
  container.classList.toggle("is-mini", mini);
  // Two rows: 10 roles make a 5 × 2 grid.
  container.style.setProperty("--cols", Math.max(1, Math.ceil(slots.filter((s) => !s.locked).length / 2)));
  slots.forEach((slot, i) => {
    if (slot.locked) return;
    const card = el("button", "crew-slot");
    card.type = "button";
    card.classList.toggle("is-captain", isCaptain(slot));
    const rgb = ROLE_RGB[slot.def.icon];
    if (rgb) { card.style.setProperty("--role-rgb", rgb[0]); card.style.setProperty("--role2-rgb", rgb[1]); }
    const ic = el("span", "crew-icon");
    ic.append(icon(slot.def.icon));
    card.append(ic);
    if (isCaptain(slot) && !mini) card.append(el("span", "crew-captain-tag", t("captainTag")));
    if (stagger) { card.classList.add("enter"); card.style.animationDelay = `${i * 45}ms`; }
    const canPlace = !!(onPlace && rolled && !slot.char && !slot.locked && slot.def.fits(rolled));
    card.classList.toggle("is-filled", !!slot.char);
    card.classList.toggle("is-target", canPlace);
    if (canPlace) card.style.setProperty("--d", `${i * 50}ms`); // targets light up in a wave
    card.classList.toggle("is-locked", slot.locked);
    card.disabled = !canPlace;
    card.dataset.index = i;

    const face = el("span", "crew-face");
    if (slot.char) {
      const img = el("img");
      img.src = slot.char.formImage || slot.char.image;
      if (slot.char.form) { ensureFilters(); card.classList.add("is-transformed"); card.style.setProperty("--fx1", slot.char.form.c1); card.style.setProperty("--fx2", slot.char.form.c2); }
      img.alt = "";
      face.append(img);
    } else {
      face.textContent = "?";
    }
    card.append(face);
    card.append(el("span", "crew-name", slot.char ? slot.char.name : t("empty")));
    card.append(el("span", "crew-role", slotLabel(slot)));
    if (slot.char) card.append(el("span", `crew-points p${Math.min(10, Math.round(slot.points))}`, String(slot.points)));
    else if (canPlace) card.append(el("span", "crew-points is-preview", `+${pointsFor(slot, rolled)}`));
    card.setAttribute("aria-label", `${slotLabel(slot)}: ${slot.char ? `${slot.char.name}, ${slot.points}` : canPlace ? t("chooseSlot") : t("empty")}`);
    if (canPlace) card.addEventListener("click", () => onPlace(i));
    container.append(card);
  });
  const hidden = slots.filter((s) => s.locked);
  if (hidden.length && !mini) {
    const roles = [...new Set(hidden.map(slotLabel))].join(", ");
    container.append(el("p", "crew-note", t("lockedNote")(roles)));
  }
}

export const slotFace = (container, i) => container.querySelector(`[data-index="${i}"] .crew-face`);
// Landing in a slot: the card pops, a ring spreads from the face, strong picks throw sparks.
export function popSlot(container, i, points = 0) {
  const card = container.querySelector(`[data-index="${i}"]`);
  if (!card) return;
  card.classList.add("pop");
  sfx("place");
  const face = card.querySelector(".crew-face");
  shockwave(face, points >= 8 ? "is-legend" : "is-epic");
  if (points >= 8) {
    const r = face.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, { count: 22, spread: 120, gold: points >= 9 });
  }
}
