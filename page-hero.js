/* Introduction en tuiles des pages intérieures. Aucun sélecteur du hero d'accueil. */
(function () {
  "use strict";

  const SELECTOR = ".page-hero__embed";
  const TIMING = {
    startDelay: 0,
    originX: 0.5,
    originY: 0,
    horizontalWeight: 1,
    verticalWeight: 1,
    waveDuration: 1050,
    randomDelay: 70,
    flipDuration: 650,
    removeDelay: 150
  };

  function getSettings() {
    if (window.matchMedia("(max-width: 767px)").matches) {
      return { columns: 8, rows: 14, gap: 1.25, padding: 2, radius: 7 };
    }

    if (window.matchMedia("(max-width: 991px)").matches) {
      return { columns: 12, rows: 10, gap: 1.25, padding: 2, radius: 8 };
    }

    return { columns: 20, rows: 11, gap: 1.5, padding: 2.5, radius: 10 };
  }

  function layoutGrid(embed, grid, settings) {
    const width = embed.clientWidth;
    const height = embed.clientHeight;

    if (!width || !height) {
      return false;
    }

    const horizontalGaps = settings.gap * (settings.columns - 1);
    const verticalGaps = settings.gap * (settings.rows - 1);
    const tileSize = Math.max(
      (width - settings.padding * 2 - horizontalGaps) / settings.columns,
      (height - settings.padding * 2 - verticalGaps) / settings.rows,
      1
    );
    const gridWidth = settings.padding * 2 +
      tileSize * settings.columns + horizontalGaps;
    const gridHeight = settings.padding * 2 +
      tileSize * settings.rows + verticalGaps;

    grid.style.left = (width - gridWidth) / 2 + "px";
    grid.style.top = (height - gridHeight) / 2 + "px";
    grid.style.width = gridWidth + "px";
    grid.style.height = gridHeight + "px";
    grid.style.gridTemplateColumns =
      "repeat(" + settings.columns + ", " + tileSize + "px)";
    grid.style.gridTemplateRows =
      "repeat(" + settings.rows + ", " + tileSize + "px)";
    grid.style.gap = settings.gap + "px";
    grid.style.padding = settings.padding + "px";

    return true;
  }

  function mount(embed) {
    if (embed.dataset.pageHeroTilesMounted === "true") {
      return;
    }

    embed.dataset.pageHeroTilesMounted = "true";

    const parent = embed.parentElement;

    if (parent && window.getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      embed.classList.add("imtx-page-hero-finished");
      return;
    }

    const settings = getSettings();
    const grid = document.createElement("div");
    grid.className = "imtx-page-hero-grid";
    grid.setAttribute("aria-hidden", "true");

    if (!layoutGrid(embed, grid, settings)) {
      embed.classList.add("imtx-page-hero-finished");
      console.warn("Page hero : .page-hero__embed doit couvrir la zone du hero.");
      return;
    }

    const fragment = document.createDocumentFragment();
    const tiles = [];

    for (let row = 0; row < settings.rows; row += 1) {
      for (let column = 0; column < settings.columns; column += 1) {
        const axisValue = Math.sin(
          (row + 1) * 12.9898 + (column + 1) * 78.233
        ) * 43758.5453;
        const axis = axisValue - Math.floor(axisValue) < 0.5 ? "X" : "Y";
        const tile = document.createElement("div");
        tile.className = "imtx-page-hero-tile is-flip-" + axis.toLowerCase();
        tile.style.borderRadius = settings.radius + "px";
        tile.innerHTML =
          '<div class="imtx-page-hero-face imtx-page-hero-front"></div>' +
          '<div class="imtx-page-hero-face imtx-page-hero-back"></div>';
        fragment.appendChild(tile);

        const normalizedX =
          ((column + 0.5) / settings.columns - TIMING.originX) *
          2 * TIMING.horizontalWeight;
        const normalizedY =
          ((row + 0.5) / settings.rows - TIMING.originY) *
          TIMING.verticalWeight;

        tiles.push({
          element: tile,
          axis: axis,
          distance: Math.hypot(normalizedX, normalizedY)
        });
      }
    }

    grid.appendChild(fragment);
    embed.appendChild(grid);

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(function () {
        layoutGrid(embed, grid, settings);
      });

    if (resizeObserver) {
      resizeObserver.observe(embed);
    }

    /* La grille est peinte avant d'ôter le fond, sans délai ajouté. */
    function revealGrid() {
      if (grid.isConnected) {
        embed.classList.add("imtx-page-hero-ready");
      }
    }

    window.requestAnimationFrame(function () {
      revealGrid();
    });
    window.setTimeout(revealGrid, 50);

    const maximumDistance = Math.max.apply(
      null,
      tiles.map(function (tile) { return tile.distance; })
    );

    tiles.forEach(function (tile) {
      const delay = TIMING.startDelay +
        tile.distance / maximumDistance * TIMING.waveDuration +
        Math.random() * TIMING.randomDelay;

      window.setTimeout(function () {
        tile.element.animate(
          [
            { transform: "rotate" + tile.axis + "(0deg)" },
            { transform: "rotate" + tile.axis + "(180deg)" }
          ],
          {
            duration: TIMING.flipDuration,
            easing: "cubic-bezier(0.76, 0, 0.24, 1)",
            fill: "forwards"
          }
        );
      }, delay);
    });

    window.setTimeout(function () {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      grid.remove();
      embed.classList.add("imtx-page-hero-finished");
    }, TIMING.startDelay + TIMING.waveDuration + TIMING.randomDelay +
      TIMING.flipDuration + TIMING.removeDelay);
  }

  function init() {
    document.querySelectorAll(SELECTOR).forEach(mount);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
