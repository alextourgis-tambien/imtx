/* Introduction en tuiles des pages intérieures. Aucun sélecteur du hero d'accueil. */
(function () {
  "use strict";

  const SELECTOR = ".page-hero__embed";
  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  let maskCount = 0;
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
      return {
        columns: 8, rows: 14, gap: 1.25, padding: 2,
        radius: 7, maskInset: 0.15
      };
    }

    if (window.matchMedia("(max-width: 991px)").matches) {
      return {
        columns: 12, rows: 10, gap: 1.25, padding: 2,
        radius: 8, maskInset: 0.15
      };
    }

    return {
      columns: 20, rows: 11, gap: 1.5, padding: 2.5,
      radius: 10, maskInset: 0.2
    };
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

    return {
      width: width,
      height: height,
      tileSize: tileSize,
      gridLeft: (width - gridWidth) / 2,
      gridTop: (height - gridHeight) / 2
    };
  }

  function createPermanentMask() {
    maskCount += 1;

    const id = "imtx-page-hero-mask-" + maskCount;
    const svg = document.createElementNS(SVG_NAMESPACE, "svg");
    const definitions = document.createElementNS(SVG_NAMESPACE, "defs");
    const mask = document.createElementNS(SVG_NAMESPACE, "mask");
    const maskBackground = document.createElementNS(SVG_NAMESPACE, "rect");
    const holes = document.createElementNS(SVG_NAMESPACE, "g");
    const blueCover = document.createElementNS(SVG_NAMESPACE, "rect");

    svg.classList.add("imtx-page-hero-mask");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("preserveAspectRatio", "none");
    mask.setAttribute("id", id);
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    mask.setAttribute("maskContentUnits", "userSpaceOnUse");
    maskBackground.setAttribute("fill", "white");
    mask.appendChild(maskBackground);
    mask.appendChild(holes);
    definitions.appendChild(mask);
    blueCover.setAttribute("fill", "#cce7ff");
    blueCover.setAttribute("mask", "url(#" + id + ")");
    svg.appendChild(definitions);
    svg.appendChild(blueCover);

    function render(settings, metrics) {
      const width = metrics.width;
      const height = metrics.height;

      svg.setAttribute("viewBox", "0 0 " + width + " " + height);
      mask.setAttribute("x", "0");
      mask.setAttribute("y", "0");
      mask.setAttribute("width", String(width));
      mask.setAttribute("height", String(height));

      [maskBackground, blueCover].forEach(function (rectangle) {
        rectangle.setAttribute("x", "0");
        rectangle.setAttribute("y", "0");
        rectangle.setAttribute("width", String(width));
        rectangle.setAttribute("height", String(height));
      });

      const fragment = document.createDocumentFragment();

      for (let row = 0; row < settings.rows; row += 1) {
        for (let column = 0; column < settings.columns; column += 1) {
          /* Quelques cases restent bleu clair, toujours aux mêmes endroits. */
          const missingValue = Math.sin(
            (row + 1) * 33.731 + (column + 1) * 91.167
          ) * 43758.5453;

          if (missingValue - Math.floor(missingValue) < 0.055) {
            continue;
          }

          const hole = document.createElementNS(SVG_NAMESPACE, "rect");
          const holeSize = Math.max(
            metrics.tileSize - settings.maskInset * 2,
            0
          );
          const x = metrics.gridLeft + settings.padding +
            column * (metrics.tileSize + settings.gap) +
            settings.maskInset;
          const y = metrics.gridTop + settings.padding +
            row * (metrics.tileSize + settings.gap) +
            settings.maskInset;

          hole.setAttribute("x", String(x));
          hole.setAttribute("y", String(y));
          hole.setAttribute("width", String(holeSize));
          hole.setAttribute("height", String(holeSize));
          hole.setAttribute("rx", String(Math.min(
            settings.radius - settings.maskInset,
            holeSize / 2
          )));
          hole.setAttribute("ry", hole.getAttribute("rx"));
          hole.setAttribute("fill", "black");
          fragment.appendChild(hole);
        }
      }

      holes.replaceChildren(fragment);
    }

    return { element: svg, render: render };
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

    const settings = getSettings();
    const grid = document.createElement("div");
    grid.className = "imtx-page-hero-grid";
    grid.setAttribute("aria-hidden", "true");

    const metrics = layoutGrid(embed, grid, settings);

    if (!metrics) {
      embed.classList.add("imtx-page-hero-finished");
      console.warn("Page hero : .page-hero__embed doit couvrir la zone du hero.");
      return;
    }

    const permanentMask = createPermanentMask();
    permanentMask.render(settings, metrics);
    embed.appendChild(permanentMask.element);

    function updateGeometry() {
      const activeSettings = grid.isConnected ? settings : getSettings();
      const nextMetrics = layoutGrid(embed, grid, activeSettings);

      if (nextMetrics) {
        permanentMask.render(activeSettings, nextMetrics);
      }
    }

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(updateGeometry);

    if (resizeObserver) {
      resizeObserver.observe(embed);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      embed.classList.add("imtx-page-hero-finished");
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
      grid.remove();
      updateGeometry();
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
