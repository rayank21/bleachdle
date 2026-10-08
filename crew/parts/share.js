// Sharing a crew: a picture of the team (rank, score, every member with its role and points), sent with the phone's
// share sheet, saved as a PNG, copied as text, posted in the live chat, or as a link that shows the same picture
// (crew/#team=…, nothing stored anywhere: the crew is in the link).

import { GAMES, ROOT, el, filledOf, rankOf, slotLabel, t, toast } from "./base.js";
import { packColours } from "./boosters.js";
import { copyText } from "./solo.js";

const W = 1080;
const H = 1350;
const RANK_RGB = { S: "255, 211, 77", A: "255, 122, 217", B: "90, 200, 255", C: "120, 230, 150", D: "190, 190, 200" };
const SITE = "bleachdlenaim.netlify.app/crew";

// A crew as plain data: { g: anime id, a: score, o: outcome text, m: [[name, role, points, picture]] }.
export function crewData(g, slots, avg, outcome = "") {
  return {
    g: g.id, a: Math.round(avg * 10) / 10, o: outcome,
    m: filledOf(slots).map((s) => [s.char.name, slotLabel(s), s.points, s.char.formImage || s.char.image]),
  };
}

const PIC = /^(\.\.\/[a-z]+\/assets\/characters\/|assets\/forms\/)[a-z0-9-]+\.webp$/;
const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64 = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));
export const crewLink = (d) => `${location.origin}${location.pathname}#team=${b64(JSON.stringify(d))}`;
// The crew in a link, checked (anything odd is dropped).
export function readCrewLink(hash) {
  const m = hash.match(/^#team=([A-Za-z0-9_-]{10,4000})$/);
  if (!m) return null;
  try {
    const d = JSON.parse(unb64(m[1]));
    if (!GAMES.some((g) => g.id === d.g) || !Array.isArray(d.m)) return null;
    const clip = (s, n) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, "").slice(0, n);
    const members = d.m.slice(0, 12).map((x) => [clip(x?.[0], 40), clip(x?.[1], 30), Math.min(10, Math.max(0, Math.round(+x?.[2] || 0))), PIC.test(x?.[3] ?? "") ? x[3] : null]).filter((x) => x[0]);
    return { g: d.g, a: Math.min(10, Math.max(0, +d.a || 0)), o: clip(d.o, 60), m: members };
  } catch { return null; }
}

const loadImg = (src) => new Promise((ok) => {
  if (!src) return ok(null);
  const img = new Image();
  img.onload = () => ok(img);
  img.onerror = () => ok(null);
  img.src = src;
});
// Draws a picture into a box, cropped like object-fit: cover (tall pictures keep the head).
function cover(ctx, img, x, y, w, h) {
  const r = Math.max(w / img.width, h / img.height);
  const sw = w / r;
  const sh = h / r;
  const sx = (img.width - sw) / 2;
  const sy = img.height > img.width * 1.15 ? 0 : (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
function round(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function fit(ctx, text, max) {
  let s = text;
  while (s.length > 1 && ctx.measureText(s).width > max) s = s.slice(0, -1);
  return s === text ? s : `${s.trimEnd()}…`;
}

// The picture of the crew, as a canvas.
export async function crewCanvas(d) {
  const g = GAMES.find((x) => x.id === d.g);
  const [c1, c2] = packColours(d.g) ?? ["255, 80, 80", "20, 4, 6"];
  const rank = rankOf(d.a);
  const rgb = RANK_RGB[rank];
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  // Background: the anime's colours, a glow behind the rank, light rays.
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, `rgb(${c2})`);
  bg.addColorStop(1, "#07070b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 250, 20, W / 2, 250, 620);
  glow.addColorStop(0, `rgba(${c1}, 0.55)`);
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    const a = (i / 18) * Math.PI * 2;
    ctx.moveTo(W / 2, 250);
    ctx.lineTo(W / 2 + Math.cos(a) * 1400, 250 + Math.sin(a) * 1400);
    ctx.lineTo(W / 2 + Math.cos(a + 0.09) * 1400, 250 + Math.sin(a + 0.09) * 1400);
    ctx.fill();
  }
  ctx.restore();

  const [logo, ...pics] = await Promise.all([loadImg(g ? ROOT + g.logo : null), ...d.m.map((x) => loadImg(x[3]))]);
  // Header: logo, title, anime.
  if (logo) { ctx.save(); ctx.beginPath(); ctx.arc(110, 100, 54, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); ctx.clip(); cover(ctx, logo, 56, 46, 108, 108); ctx.restore(); }
  ctx.fillStyle = "#fff";
  ctx.font = "italic 900 54px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(fit(ctx, t("title").toUpperCase(), 820), 190, 96);
  ctx.fillStyle = `rgb(${c1})`;
  ctx.font = "800 34px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(fit(ctx, g?.anime ?? "", 820), 192, 142);
  // The rank and the score.
  ctx.textAlign = "center";
  ctx.font = "italic 900 230px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.shadowColor = `rgba(${rgb}, 0.9)`;
  ctx.shadowBlur = 50;
  ctx.fillStyle = `rgb(${rgb})`;
  ctx.fillText(rank, W / 2, 400);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.font = "900 64px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(`${d.a.toFixed(1)} / 10`, W / 2, 480);
  if (d.o) { ctx.font = "800 34px system-ui, -apple-system, Segoe UI, sans-serif"; ctx.fillStyle = `rgb(${c1})`; ctx.fillText(fit(ctx, d.o, 900), W / 2, 530); }

  // The members: a grid of cards (4 per row), each with its picture, role, name and points.
  const n = d.m.length;
  const cols = n <= 6 ? 3 : 4;
  const rows = Math.ceil(n / cols) || 1;
  const top = 565;
  const gap = 22;
  const cw = (W - 80 - gap * (cols - 1)) / cols;
  const ch = Math.min((H - top - 90 - gap * (rows - 1)) / rows, cw * 1.45);
  d.m.forEach(([name, role, pts, pic], i) => {
    const r = Math.floor(i / cols);
    const inRow = Math.min(cols, n - r * cols);
    const x = (W - (inRow * cw + (inRow - 1) * gap)) / 2 + (i % cols) * (cw + gap);
    const y = top + r * (ch + gap);
    const tier = pts >= 9 ? "255, 211, 77" : pts >= 7 ? "200, 120, 255" : "150, 165, 190";
    ctx.save();
    round(ctx, x, y, cw, ch, 18);
    ctx.fillStyle = "#101018";
    ctx.fill();
    ctx.clip();
    if (pics[i]) cover(ctx, pics[i], x, y, cw, ch);
    const shade = ctx.createLinearGradient(0, y + ch * 0.45, 0, y + ch);
    shade.addColorStop(0, "rgba(0, 0, 0, 0)");
    shade.addColorStop(1, "rgba(0, 0, 0, 0.92)");
    ctx.fillStyle = shade;
    ctx.fillRect(x, y, cw, ch);
    ctx.restore();
    ctx.save();
    round(ctx, x, y, cw, ch, 18);
    ctx.lineWidth = 4;
    ctx.strokeStyle = `rgba(${tier}, 0.95)`;
    ctx.shadowColor = `rgba(${tier}, 0.7)`;
    ctx.shadowBlur = pts >= 7 ? 18 : 0;
    ctx.stroke();
    ctx.restore();
    // Points, top right.
    ctx.beginPath();
    ctx.arc(x + cw - 34, y + 34, 26, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${tier})`;
    ctx.fill();
    ctx.fillStyle = "#14100a";
    ctx.font = "italic 900 30px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(String(pts), x + cw - 34, y + 45);
    // Role and name, at the bottom.
    ctx.fillStyle = `rgb(${c1})`;
    ctx.font = "800 22px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(fit(ctx, role.toUpperCase(), cw - 20), x + cw / 2, y + ch - 50);
    ctx.fillStyle = "#fff";
    ctx.font = "900 28px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(fit(ctx, name, cw - 20), x + cw / 2, y + ch - 18);
  });
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.font = "700 28px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(SITE, W / 2, H - 34);
  return cv;
}

export const crewText = (d) => {
  const g = GAMES.find((x) => x.id === d.g);
  return `${t("title")} · ${g?.anime ?? ""} · ${rankOf(d.a)} ${d.a.toFixed(1)}/10${d.o ? ` · ${d.o}` : ""}\n${d.m.map(([n, r, p]) => `${r}: ${n} (${p})`).join("\n")}`;
};

// The share window: the picture, and every way to send it.
export async function openShare(d, { viewOnly = false } = {}) {
  document.querySelector(".share-dlg")?.remove();
  const dlg = el("dialog", "modal share-dlg");
  const inner = el("div", "modal-inner");
  const close = el("button", "modal-close", "×");
  close.type = "button";
  close.ariaLabel = t("close") ?? "Close";
  close.addEventListener("click", () => dlg.close());
  inner.append(close, el("h2", null, viewOnly ? t("shTheirCrew") : t("shTitle")));
  const shot = el("div", "share-shot is-loading");
  inner.append(shot);
  const acts = el("div", "share-acts");
  inner.append(acts);
  dlg.append(inner);
  document.body.append(dlg);
  dlg.addEventListener("close", () => dlg.remove());
  dlg.showModal();

  const cv = await crewCanvas(d);
  const blob = await new Promise((ok) => cv.toBlob(ok, "image/png"));
  const url = blob ? URL.createObjectURL(blob) : cv.toDataURL("image/png");
  dlg.addEventListener("close", () => { if (blob) URL.revokeObjectURL(url); });
  const img = el("img");
  img.src = url;
  img.alt = crewText(d);
  shot.classList.remove("is-loading");
  shot.append(img);
  const g = GAMES.find((x) => x.id === d.g);
  const file = blob ? new File([blob], `crew-${d.g}-${rankOf(d.a)}.png`, { type: "image/png" }) : null;
  const link = crewLink(d);
  const btn = (label, cls, fn) => { const b = el("button", cls, label); b.type = "button"; b.addEventListener("click", fn); acts.append(b); return b; };
  if (viewOnly) {
    btn(t("shPlay"), "btn-primary", () => { dlg.close(); window.dispatchEvent(new CustomEvent("crew:game", { detail: d.g })); });
    return;
  }
  // The phone's share sheet (with the picture when it can take files).
  if (navigator.share) btn(t("shShare"), "btn-primary", async () => {
    const data = { title: `${t("title")} · ${g?.anime ?? ""}`, text: crewText(d), url: link };
    try {
      if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ ...data, files: [file] });
      else await navigator.share(data);
    } catch {}
  });
  btn(t("shSave"), navigator.share ? "btn-ghost" : "btn-primary", () => {
    const a = el("a");
    a.href = url;
    a.download = file?.name ?? "crew.png";
    document.body.append(a);
    a.click();
    a.remove();
  });
  btn(t("shLink"), "btn-ghost", async () => { await copyText(link); });
  btn(t("share"), "btn-ghost", () => copyText(crewText(d)));
  btn(t("shChat"), "btn-ghost", () => {
    // The chat takes 200 characters: the score and the three best members (the picture and link go elsewhere).
    const best = [...d.m].sort((a, b) => b[2] - a[2]).slice(0, 3).map(([n, , p]) => `${n} ${p}`).join(", ");
    window.dispatchEvent(new CustomEvent("dle:say", { detail: { text: `${crewText(d).split("\n")[0]} · ${best}` } }));
    toast(t("shSent"));
  });
}

// A shared link opened: show that crew.
export function showSharedCrew() {
  const d = readCrewLink(location.hash);
  if (!d) return false;
  history.replaceState(null, "", location.pathname + location.search);
  openShare(d, { viewOnly: true });
  return true;
}
window.addEventListener("hashchange", () => { if (location.hash.startsWith("#team=")) showSharedCrew(); });
