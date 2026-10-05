// Page decor: two big characters on the sides of the background, fading into it. On a game page they come from
// that anime's featured characters; on the home page and Crew Roll, from two different anime. New ones each visit.
(() => {
  "use strict";

  const GAMES = window.DLE_GAMES || [];
  const ROOT = (document.currentScript?.src || "").replace(/shared\/decor\.js.*$/, "");
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  function render() {
    const bg = document.querySelector(".bg");
    if (!bg || !GAMES.length || bg.querySelector(".decor")) return;
    const here = GAMES.find((g) => location.pathname.includes(`/${g.path}`));
    let chars;
    if (here) {
      const a = pick(here.featured);
      const b = pick(here.featured.filter((x) => x !== a));
      chars = [[here, a], [here, b]];
    } else {
      const g1 = pick(GAMES);
      const g2 = pick(GAMES.filter((g) => g !== g1));
      chars = [[g1, pick(g1.featured)], [g2, pick(g2.featured)]];
    }
    const box = document.createElement("div");
    box.className = "decor";
    chars.forEach(([g, id], i) => {
      const img = document.createElement("img");
      img.className = `decor-char ${i ? "is-right" : "is-left"}`;
      img.alt = "";
      img.decoding = "async";
      img.src = `${ROOT}${g.path}assets/characters/${id}.webp`;
      img.onload = () => img.classList.add("is-in");
      box.append(img);
    });
    bg.append(box);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
