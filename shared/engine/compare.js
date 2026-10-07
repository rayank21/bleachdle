// Comparing a guess with the mystery character, column by column.

import { COLS, arcName, settings, tv } from "./core.js";

// ── Comparison ──
function compareSets(a, b) {
  const setA = new Set(a);
  const inter = b.filter((x) => setA.has(x)).length;
  if (inter === a.length && inter === b.length) return "correct";
  return inter > 0 ? "partial" : "wrong";
}

function compareCol(col, g, tg) {
  const a = g[col.key];
  const b = tg[col.key];
  switch (col.type) {
    case "name":
      return { status: g.id === tg.id ? "correct" : "wrong" };
    case "set":
      return { status: compareSets(a, b) };
    case "ordinal": {
      const ia = col.order.indexOf(a);
      const ib = col.order.indexOf(b);
      if (a === b) return { status: "correct" };
      return { status: "wrong", dir: ia >= 0 && ib >= 0 ? (ib > ia ? "up" : "down") : null };
    }
    case "number":
    case "arc":
      if (a === b) return { status: "correct" };
      return { status: "wrong", dir: a != null && b != null ? (b > a ? "up" : "down") : null };
    default:
      return { status: a === b ? "correct" : "wrong" };
  }
}

export function compare(g, tg) {
  const res = {};
  for (const col of COLS) res[col.key] = compareCol(col, g, tg);
  return res;
}

export function cellText(col, v) {
  const x = v[col.key];
  switch (col.type) {
    case "name": return v.name;
    case "set": return x.map(tv).join(", ");
    case "number": return x == null ? tv("Unknown") : col.format ? col.format(x, settings.lang, tv) : `${x}${col.unit || ""}`;
    case "arc": return arcName(x);
    default: return tv(x);
  }
}
