(function () {
  "use strict";

  /*==================================================
  CONFIG — TOUS LES RÉGLAGES PRINCIPAUX
  ==================================================*/

  const CONFIG = {
    selectors: {
      wrapper: ".h-hero__wrapper",
      hero: ".h-hero",
      header: ".h-hero .header",
      content: ".h-hero__content",
      imagesWrapper: ".h-hero__imgs__wrapper",
      background: ".h-hero__bg",
      embed: ".h-hero__embed",
      oldTextGrid: ".h-hero__text-grid",
      oldTextCard: ".h-hero__text-card",
      oldTitle: ".h-hero__title",
      cellsWrapper: ".hh__cells-wrapper",
      cellTitleOne: ".hh__cell-title.is--one",
      cellTitleTwo: ".hh__cell-title.is--two",
      targetWrapper: ".hh__target-wrapper",
      targetLottieWrapper: ".hh__target-lottie-wrapper",
      targetLottie: ".hh__target-lottie",
      targetMainOne: ".hh__target-main.is--one",
      targetMainTwo: ".hh__target-main.is--two",
      targetTitleOne: ".hh__target-title.is--one",
      targetTitleTwo: ".hh__target-title.is--two",
      targetParagraphOne: ".hh__target-p.is--one",
      targetParagraphTwo: ".hh__target-p.is--two",
      cancerWrapper: ".hh__cancer-wrapper"
    },

    imageSelectors: [
      ".h-hero__img-wrapper.is--one",
      ".h-hero__img-wrapper.is--two",
      ".h-hero__img-wrapper.is--three",
      ".h-hero__img-wrapper.is--four",
      ".h-hero__img-wrapper.is--five",
      ".h-hero__img-wrapper.is--six"
    ],

    cellSelectors: [
      ".hh__cells-lottie.is--one",
      ".hh__cells-lottie.is--two",
      ".hh__cells-lottie.is--three",
      ".hh__cells-lottie.is--four",
      ".hh__cells-lottie.is--five",
      ".hh__cells-lottie.is--six",
      ".hh__cells-lottie.is--seven",
      ".hh__cells-lottie.is--eight",
      ".hh__cells-lottie.is--nine",
      ".hh__cells-lottie.is--ten",
      ".hh__cells-lottie.is--eleven",
      ".hh__cells-lottie.is--twelve",
      ".hh__cells-lottie.is--thirteen"
    ],

    cancerCellSelectors: Array.from({ length: 23 }, function (_, index) {
      return ".hh__cencer-lottie.is--" + (index + 1);
    }),

    scroll: {
      headerStart: 0.005,
      headerEnd: 0.06,

      mediaRevealStart: 0.06,
      mediaRevealEnd: 0.19,

      orbitStart: 0.06,
      orbitEnd: 0.58,
      orbitTurns: 0.4,

      embedFadeStart: 0.065,
      embedFadeEnd: 0.105,

      oldTextStart: 0.06,
      oldTextEnd: 0.20,

      firstCellStart: 0.205,
      firstCellEnd: 0.265,
      cellsSpreadStart: 0.325,
      cellsSpreadLatestStart: 0.42,
      cellsSpreadDurationMin: 0.12,
      cellsSpreadDurationMax: 0.19,
      firstCellMoveDelay: 0.06,

      mediaExitStart: 0.49,
      mediaExitStagger: 0.012,
      mediaExitRandom: 0.005,
      mediaExitDurationMin: 0.065,
      mediaExitDurationMax: 0.09,

      titleOneIn: 0.60,
      titleOneOut: 0.72,
      titleTwoIn: 0.80,
      titleTwoOut: 0.89,

      cellsExitStart: 0.90,
      cellsExitLatestStart: 0.95,
      cellsExitDurationMin: 0.025,
      cellsExitDurationMax: 0.045
    },

    headerYPercent: -115,

    contentLift: {
      desktop: 64,
      tablet: 48,
      mobile: 32
    },

    mainVisual: {
      desktop: {
        scale: 0.32,
        aspectRatio: 1.50,
        boxHeight: 0.64,
        radius: 16
      },
      tablet: {
        scale: 0.35,
        aspectRatio: 1.50,
        boxHeight: 0.62,
        radius: 14
      },
      mobile: {
        scale: 0.26,
        aspectRatio: 1.45,
        boxHeight: 0.72,
        radius: 12
      }
    },

    orbit: {
      desktop: { radiusX: 0.47, radiusY: 0.42 },
      tablet: { radiusX: 0.45, radiusY: 0.40 },
      mobile: { radiusX: 0.49, radiusY: 0.43 }
    },

    imageScales: {
      desktop: [0.94, 0.78, 1.03, 0.84, 0.96, 0.75],
      tablet: [0.86, 0.72, 0.94, 0.78, 0.87, 0.70],
      mobile: [0.64, 0.56, 0.69, 0.59, 0.65, 0.54]
    },

    depth: {
      minimum: 0.78,
      maximum: 1.12
    },

    imageEntrance: {
      outsideDistance: 1.18,
      stagger: 0.011,
      random: 0.012,
      durationMin: 0.09,
      durationMax: 0.13
    },

    text: {
      oldPanelY: -34,
      lineY: 30,
      lineStagger: 0.01,
      lineDuration: 0.045
    },

    cellFloating: {
      start: 0,
      end: Number.POSITIVE_INFINITY,
      xDesktop: 12,
      yDesktop: 20,
      xMobile: 9,
      yMobile: 15,
      rotation: 1.5,
      durationMin: 2.8,
      durationMax: 4.6
    },

    /*
    Cette séquence commence après la disparition des 13 cellules.
    Les valeurs supérieures à 1 prolongent volontairement la timeline.
    */
    targetSequence: {
      mainOneIn: 1.02,
      mainTwoIn: 1.08,

      mainExitStart: 1.22,
      mainExitEnd: 1.34,
      lottieInStart: 1.22,
      lottieInEnd: 1.34,

      titleOneIn: 1.48,
      titleTwoIn: 1.59,
      titlesOutStart: 1.70,

      paragraphOneIn: 1.80,
      paragraphOneOut: 1.93,

      paragraphTwoIn: 2.03,
      paragraphTwoOut: 2.25,

      lottieOutStart: 1.70,
      lottieOutEnd: 1.80,

      end: 2.32,
      exitViewportDistance: 0.35,

      mobileLottieMargin: 24,
      mobileLottieSafeScale: 0.78,
      mobileLottieMinimumScale: 0.1
    },

    cancerSequence: {
      latestStartOffset: 0.09,
      durationMin: 0.10,
      durationMax: 0.18
    },

    resizeDebounce: 200,

    tiles: {
      startDelay: 150,
      stagger: 5,
      randomDelay: 150,
      flipDuration: 650,
      removeDelay: 150
    }
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const toRadians = function (degrees) {
    return degrees * Math.PI / 180;
  };

  function warnMissing(label, selector) {
    console.warn(
      "Hero : élément manquant — " + label + " (" + selector + ")."
    );
  }

  function deterministic(index, minimum, maximum, offset) {
    const raw = Math.sin(
      index * 12.9898 + offset * 78.233
    ) * 43758.5453;

    const normalized = raw - Math.floor(raw);
    return gsap.utils.interpolate(minimum, maximum, normalized);
  }

  /*==================================================
  GRILLE PERMANENTE ET INTRODUCTION DES TUILES
  ==================================================*/

  function getGridSettings() {
    if (window.matchMedia("(max-width: 767px)").matches) {
      return {
        columns: 8,
        rows: 14,
        gap: 1.25,
        padding: 2,
        radius: 7,
        maskInset: 0.15,
        textCard: {
          columnStart: 2,
          columnEnd: 8,
          rowStart: 10,
          rowEnd: 14
        }
      };
    }

    if (window.matchMedia("(max-width: 991px)").matches) {
      return {
        columns: 12,
        rows: 10,
        gap: 1.25,
        padding: 2,
        radius: 8,
        maskInset: 0.15,
        textCard: {
          columnStart: 2,
          columnEnd: 9,
          rowStart: 6,
          rowEnd: 10
        }
      };
    }

    return {
      columns: 20,
      rows: 11,
      gap: 1.5,
      padding: 2.5,
      radius: 10,
      maskInset: 0.2,
      textCard: {
        columnStart: 2,
        columnEnd: 9,
        rowStart: 7,
        rowEnd: 11
      }
    };
  }

  function initialiseTileGrid() {
    const wrapper = document.querySelector(".hero-tile-wrapper");
    const animatedGrid = document.querySelector(".hero-tile-grid");
    const textCard = document.querySelector(".h-hero__text-card");
    const overlay = document.querySelector(".hero-grid-overlay");
    const maskBackground = document.querySelector(".hero-mask-background");
    const maskHoles = document.querySelector(".hero-mask-holes");
    const blackRectangle = document.querySelector(".hero-grid-black");

    const required = [
      [wrapper, "wrapper de la grille", ".hero-tile-wrapper"],
      [animatedGrid, "grille animée", ".hero-tile-grid"],
      [overlay, "SVG", ".hero-grid-overlay"],
      [maskBackground, "fond du masque", ".hero-mask-background"],
      [maskHoles, "trous du masque", ".hero-mask-holes"],
      [blackRectangle, "rectangle noir", ".hero-grid-black"]
    ];

    const missing = required.filter(function (item) {
      return !item[0];
    });

    if (missing.length) {
      missing.forEach(function (item) {
        warnMissing(item[1], item[2]);
      });
      return null;
    }

    function getSquareGridMetrics(width, height, settings) {
      const horizontalGaps = settings.gap * (settings.columns - 1);
      const verticalGaps = settings.gap * (settings.rows - 1);
      const usableWidth = Math.max(
        width - settings.padding * 2 - horizontalGaps,
        1
      );
      const usableHeight = Math.max(
        height - settings.padding * 2 - verticalGaps,
        1
      );

      /*
      Équivalent de object-fit:cover : on retient la plus grande taille
      nécessaire pour couvrir à la fois la largeur et la hauteur.
      */
      const tileSize = Math.max(
        usableWidth / settings.columns,
        usableHeight / settings.rows
      );
      const gridWidth = settings.padding * 2 +
        tileSize * settings.columns + horizontalGaps;
      const gridHeight = settings.padding * 2 +
        tileSize * settings.rows + verticalGaps;

      return {
        tileSize: tileSize,
        gridWidth: gridWidth,
        gridHeight: gridHeight,
        gridLeft: (width - gridWidth) / 2,
        gridTop: (height - gridHeight) / 2
      };
    }

    function applySquareGridLayout(element, settings, metrics) {
      if (!element) {
        return;
      }

      gsap.set(element, {
        left: metrics.gridLeft,
        top: metrics.gridTop,
        right: "auto",
        bottom: "auto",
        width: metrics.gridWidth,
        height: metrics.gridHeight
      });

      element.style.gridTemplateColumns =
        "repeat(" + settings.columns + ", " + metrics.tileSize + "px)";
      element.style.gridTemplateRows =
        "repeat(" + settings.rows + ", " + metrics.tileSize + "px)";
      element.style.gap = settings.gap + "px";
      element.style.padding = settings.padding + "px";
    }

    function applyTextCardLayout(width, height, settings, metrics) {
      if (!textCard || !settings.textCard) {
        return;
      }

      const card = settings.textCard;
      const columnSpan = card.columnEnd - card.columnStart;
      const rowSpan = card.rowEnd - card.rowStart;
      const pitch = metrics.tileSize + settings.gap;
      const minimumBottomGap = Math.min(
        metrics.tileSize * 0.65,
        90
      );
      let adjustedRowStart = card.rowStart;

      function getTop(rowStart) {
        return metrics.gridTop + settings.padding +
          (rowStart - 1) * pitch;
      }

      const cardHeight = rowSpan * metrics.tileSize +
        Math.max(rowSpan - 1, 0) * settings.gap;
      const gridLineHalf = settings.gap / 2;
      const alignedCardHeight = cardHeight + settings.gap;

      /*
      Si le crop vertical rapproche le panneau du bas, on le remonte
      uniquement par rangées complètes. Il reste donc toujours aligné.
      */
      while (
        adjustedRowStart > 1 &&
        getTop(adjustedRowStart) - gridLineHalf + alignedCardHeight >
          height - minimumBottomGap
      ) {
        adjustedRowStart -= 1;
      }

      const left = metrics.gridLeft + settings.padding +
        (card.columnStart - 1) * pitch - gridLineHalf;
      const top = getTop(adjustedRowStart) - gridLineHalf;
      const cardWidth = columnSpan * metrics.tileSize +
        Math.max(columnSpan - 1, 0) * settings.gap;
      const alignedCardWidth = cardWidth + settings.gap;

      gsap.set(textCard, {
        position: "absolute",
        gridColumn: "auto",
        gridRow: "auto",
        left: left,
        top: top,
        right: "auto",
        bottom: "auto",
        width: alignedCardWidth,
        height: alignedCardHeight
      });
    }

    function buildPermanentGrid() {
      const settings = getGridSettings();
      const width = wrapper.clientWidth;
      const height = wrapper.clientHeight;

      if (!width || !height) {
        console.warn("Hero : dimensions nulles pour le masque SVG.");
        return;
      }

      const metrics = getSquareGridMetrics(width, height, settings);

      applySquareGridLayout(animatedGrid, settings, metrics);
      applyTextCardLayout(width, height, settings, metrics);

      overlay.setAttribute("viewBox", "0 0 " + width + " " + height);

      [maskBackground, blackRectangle].forEach(function (rectangle) {
        rectangle.setAttribute("x", "0");
        rectangle.setAttribute("y", "0");
        rectangle.setAttribute("width", String(width));
        rectangle.setAttribute("height", String(height));
      });

      maskHoles.innerHTML = "";

      for (let row = 0; row < settings.rows; row += 1) {
        for (let column = 0; column < settings.columns; column += 1) {
          const hole = document.createElementNS(SVG_NAMESPACE, "rect");
          const x = metrics.gridLeft + settings.padding +
            column * (metrics.tileSize + settings.gap) +
            settings.maskInset;
          const y = metrics.gridTop + settings.padding +
            row * (metrics.tileSize + settings.gap) +
            settings.maskInset;
          const holeSize = Math.max(
            metrics.tileSize - settings.maskInset * 2,
            0
          );
          const radius = Math.min(
            Math.max(settings.radius - settings.maskInset, 0),
            holeSize / 2
          );

          hole.setAttribute("x", String(x));
          hole.setAttribute("y", String(y));
          hole.setAttribute("width", String(holeSize));
          hole.setAttribute("height", String(holeSize));
          hole.setAttribute("rx", String(radius));
          hole.setAttribute("ry", String(radius));
          hole.setAttribute("fill", "black");
          maskHoles.appendChild(hole);
        }
      }
    }

    function createAnimatedTiles() {
      const settings = getGridSettings();
      const count = settings.columns * settings.rows;
      const tiles = [];

      animatedGrid.innerHTML = "";

      for (let index = 0; index < count; index += 1) {
        const tile = document.createElement("div");
        tile.className = "hero-tile";
        tile.innerHTML =
          '<div class="hero-tile-face hero-tile-front"></div>' +
          '<div class="hero-tile-face hero-tile-back"></div>';
        animatedGrid.appendChild(tile);
        tiles.push(tile);
      }

      return tiles;
    }

    buildPermanentGrid();

    if (prefersReducedMotion) {
      animatedGrid.remove();
      return buildPermanentGrid;
    }

    const shuffledTiles = createAnimatedTiles();

    for (let index = shuffledTiles.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const temporary = shuffledTiles[index];
      shuffledTiles[index] = shuffledTiles[randomIndex];
      shuffledTiles[randomIndex] = temporary;
    }

    shuffledTiles.forEach(function (tile, index) {
      const delay = CONFIG.tiles.startDelay +
        index * CONFIG.tiles.stagger +
        Math.random() * CONFIG.tiles.randomDelay;

      window.setTimeout(function () {
        tile.animate(
          [
            { transform: "rotateY(0deg)" },
            { transform: "rotateY(180deg)" }
          ],
          {
            duration: CONFIG.tiles.flipDuration,
            easing: "cubic-bezier(0.76, 0, 0.24, 1)",
            fill: "forwards"
          }
        );
      }, delay);
    });

    const totalDuration = CONFIG.tiles.startDelay +
      shuffledTiles.length * CONFIG.tiles.stagger +
      CONFIG.tiles.randomDelay +
      CONFIG.tiles.flipDuration;

    window.setTimeout(function () {
      if (animatedGrid.isConnected) {
        animatedGrid.remove();
      }
    }, totalDuration + CONFIG.tiles.removeDelay);

    return buildPermanentGrid;
  }

  document.addEventListener("DOMContentLoaded", function () {
    const rebuildGrid = initialiseTileGrid();

    if (!rebuildGrid) {
      return;
    }

    let gridResizeTimer = null;
    let gridViewportWidth = window.innerWidth;

    window.addEventListener("resize", function () {
      const nextWidth = window.innerWidth;

      /*
      Sur mobile, l’ouverture/fermeture de la barre du navigateur change
      uniquement la hauteur. On ne reconstruit donc pas le SVG pour cela.
      */
      if (
        nextWidth <= 991 &&
        Math.abs(nextWidth - gridViewportWidth) < 2
      ) {
        return;
      }

      gridViewportWidth = nextWidth;
      window.clearTimeout(gridResizeTimer);
      gridResizeTimer = window.setTimeout(
        rebuildGrid,
        CONFIG.resizeDebounce
      );
    });
  });

  /*==================================================
  ANIMATION PRINCIPALE
  ==================================================*/

  window.addEventListener("load", function () {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const selectors = CONFIG.selectors;
    const heroWrapper = document.querySelector(selectors.wrapper);
    const hero = document.querySelector(selectors.hero);
    const header = document.querySelector(selectors.header);
    const heroContent = document.querySelector(selectors.content);
    const imagesWrapper = document.querySelector(selectors.imagesWrapper);
    const heroBackground = document.querySelector(selectors.background);
    const heroEmbed = document.querySelector(selectors.embed);
    const oldTextGrid = document.querySelector(selectors.oldTextGrid);
    const oldTextCard = document.querySelector(selectors.oldTextCard);
    const oldTitle = document.querySelector(selectors.oldTitle);
    const cellsWrapper = document.querySelector(selectors.cellsWrapper);
    const titleOne = document.querySelector(selectors.cellTitleOne);
    const titleTwo = document.querySelector(selectors.cellTitleTwo);
    const targetWrapper = document.querySelector(selectors.targetWrapper);
    const targetLottieWrapper = document.querySelector(
      selectors.targetLottieWrapper
    );
    const targetLottie = document.querySelector(selectors.targetLottie);
    const targetMainOne = document.querySelector(selectors.targetMainOne);
    const targetMainTwo = document.querySelector(selectors.targetMainTwo);
    const targetTitleOne = document.querySelector(selectors.targetTitleOne);
    const targetTitleTwo = document.querySelector(selectors.targetTitleTwo);
    const targetParagraphOne = document.querySelector(
      selectors.targetParagraphOne
    );
    const targetParagraphTwo = document.querySelector(
      selectors.targetParagraphTwo
    );
    const cancerWrapper = document.querySelector(selectors.cancerWrapper);

    const imageItems = CONFIG.imageSelectors.map(function (selector) {
      const element = document.querySelector(selector);
      if (!element) {
        warnMissing("image orbitale", selector);
      }
      return element;
    }).filter(Boolean);

    const cells = CONFIG.cellSelectors.map(function (selector) {
      const element = document.querySelector(selector);
      if (!element) {
        warnMissing("cellule Lottie", selector);
      }
      return element;
    }).filter(Boolean);

    const cancerCells = CONFIG.cancerCellSelectors.map(function (selector) {
      const element = document.querySelector(selector);
      if (!element) {
        warnMissing("cellule cancer", selector);
      }
      return element;
    }).filter(Boolean);

    const essentialElements = [
      [heroWrapper, "wrapper du hero", selectors.wrapper],
      [hero, "hero sticky", selectors.hero],
      [heroContent, "contenu du hero", selectors.content],
      [imagesWrapper, "wrapper des médias", selectors.imagesWrapper],
      [heroBackground, "vidéo principale", selectors.background],
      [heroEmbed, "embed de la grille", selectors.embed],
      [cellsWrapper, "wrapper des cellules", selectors.cellsWrapper]
    ];

    const missingEssential = essentialElements.filter(function (item) {
      return !item[0];
    });

    if (missingEssential.length) {
      missingEssential.forEach(function (item) {
        warnMissing(item[1], item[2]);
      });
      return;
    }

    if (imageItems.length !== 6) {
      console.warn(
        "Hero : " + imageItems.length + "/6 images orbitales trouvées."
      );
    }

    if (cells.length !== 13) {
      console.warn(
        "Hero : " + cells.length + "/13 cellules Lottie trouvées."
      );
    }

    if (!cancerWrapper) {
      warnMissing("wrapper cancer", selectors.cancerWrapper);
    }

    if (cancerCells.length !== 23) {
      console.warn(
        "Hero : " + cancerCells.length + "/23 cellules cancer trouvées."
      );
    }

    const targetElements = [
      [targetWrapper, "wrapper target", selectors.targetWrapper],
      [
        targetLottieWrapper,
        "wrapper Lottie target",
        selectors.targetLottieWrapper
      ],
      [targetLottie, "Lottie target", selectors.targetLottie],
      [targetMainOne, "target main one", selectors.targetMainOne],
      [targetMainTwo, "target main two", selectors.targetMainTwo],
      [targetTitleOne, "target title one", selectors.targetTitleOne],
      [targetTitleTwo, "target title two", selectors.targetTitleTwo],
      [
        targetParagraphOne,
        "target paragraph one",
        selectors.targetParagraphOne
      ],
      [
        targetParagraphTwo,
        "target paragraph two",
        selectors.targetParagraphTwo
      ]
    ];

    targetElements.forEach(function (item) {
      if (!item[0]) {
        warnMissing(item[1], item[2]);
      }
    });

    const targetTextElements = [
      targetMainOne,
      targetMainTwo,
      targetTitleOne,
      targetTitleTwo,
      targetParagraphOne,
      targetParagraphTwo
    ].filter(Boolean);

    const originalTargetStyles = new Map();
    targetTextElements.forEach(function (element) {
      originalTargetStyles.set(element, element.getAttribute("style"));
    });

    const originalCellStyles = new Map();
    cells.forEach(function (cell) {
      originalCellStyles.set(cell, cell.getAttribute("style"));
    });

    const originalCancerCellStyles = new Map();
    cancerCells.forEach(function (cell) {
      originalCancerCellStyles.set(cell, cell.getAttribute("style"));
    });

    const splitSources = [
      oldTitle,
      titleOne,
      titleTwo,
      targetMainOne,
      targetMainTwo,
      targetTitleOne,
      targetTitleTwo,
      targetParagraphOne,
      targetParagraphTwo
    ].filter(Boolean);
    const originalTitleMarkup = new Map();
    splitSources.forEach(function (element) {
      originalTitleMarkup.set(element, element.innerHTML);
    });

    let timeline = null;
    let resizeTimer = null;
    let viewportWidth = window.innerWidth;
    let currentSettings = null;
    let cellMeasurements = [];
    let cancerCellMeasurements = [];
    let titleLines = new Map();
    let floatingTweens = [];
    let floatingTargets = [];
    let floatingActive = false;
    let originalMainRadius = "0px";
    let originalEmbedRadius = "0px";
    let targetMainOneDirection = -1;
    let targetMainTwoDirection = 1;

    const itemCount = imageItems.length + 1;
    const baseAngles = Array.from({ length: itemCount }, function (_, index) {
      return -90 + index * (360 / itemCount);
    });

    const orbitState = {
      reveal: 0,
      angle: 0
    };

    const imageReveal = imageItems.map(function () {
      return { value: 0 };
    });

    const mediaExit = Array.from(
      { length: itemCount },
      function () {
        return { value: 1 };
      }
    );

    const cellsProgress = cells.map(function () {
      return {
        position: 0,
        visibility: 0
      };
    });

    const cellExit = cells.map(function () {
      return { value: 1 };
    });

    const cancerProgress = cancerCells.map(function () {
      return { value: 0 };
    });

    function getResponsiveSettings() {
      if (window.innerWidth <= 767) {
        return {
          mode: "mobile",
          contentLift: CONFIG.contentLift.mobile,
          main: CONFIG.mainVisual.mobile,
          orbit: CONFIG.orbit.mobile,
          imageScales: CONFIG.imageScales.mobile
        };
      }

      if (window.innerWidth <= 991) {
        return {
          mode: "tablet",
          contentLift: CONFIG.contentLift.tablet,
          main: CONFIG.mainVisual.tablet,
          orbit: CONFIG.orbit.tablet,
          imageScales: CONFIG.imageScales.tablet
        };
      }

      return {
        mode: "desktop",
        contentLift: CONFIG.contentLift.desktop,
        main: CONFIG.mainVisual.desktop,
        orbit: CONFIG.orbit.desktop,
        imageScales: CONFIG.imageScales.desktop
      };
    }

    /*
    Le header reste dans le flux après sa sortie visuelle. On mesure donc
    la géométrie réelle du hero pour replacer le centre de son contenu
    exactement au centre du viewport, quelle que soit la hauteur du header.
    */
    function getContentCenterLift() {
      const hero = heroContent.closest(".h-hero");

      if (!hero) {
        return currentSettings.contentLift;
      }

      const heroHeight = hero.clientHeight || window.innerHeight;
      const contentHeight = heroContent.offsetHeight;
      const contentTop = heroContent.offsetTop;

      if (!heroHeight || !contentHeight) {
        return currentSettings.contentLift;
      }

      return Math.max(
        contentTop + contentHeight / 2 - heroHeight / 2,
        0
      );
    }

    /*==================================================
    DÉCOUPE VISUELLE DES TITRES — CONSERVE .blue_span
    ==================================================*/

    function restoreAndSplitTitle(element) {
      if (!element) {
        return [];
      }

      element.innerHTML = originalTitleMarkup.get(element);

      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function (node) {
            if (!node.nodeValue || !node.nodeValue.trim()) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const textNodes = [];
      let currentNode = walker.nextNode();

      while (currentNode) {
        textNodes.push(currentNode);
        currentNode = walker.nextNode();
      }

      textNodes.forEach(function (textNode) {
        const fragment = document.createDocumentFragment();
        const pieces = textNode.nodeValue.match(/\s+|[^\s]+/g) || [];

        pieces.forEach(function (piece) {
          if (/^\s+$/.test(piece)) {
            fragment.appendChild(document.createTextNode(piece));
            return;
          }

          const word = document.createElement("span");
          word.className = "hero-split-word";
          word.textContent = piece;
          fragment.appendChild(word);
        });

        textNode.parentNode.replaceChild(fragment, textNode);
      });

      const words = Array.from(
        element.querySelectorAll(".hero-split-word")
      );
      const groups = [];

      words.forEach(function (word) {
        const top = Math.round(word.getBoundingClientRect().top);
        let group = groups.find(function (candidate) {
          return Math.abs(candidate.top - top) <= 2;
        });

        if (!group) {
          group = { top: top, words: [] };
          groups.push(group);
        }

        group.words.push(word);
      });

      groups.sort(function (a, b) {
        return a.top - b.top;
      });

      return groups.map(function (group) {
        return group.words;
      });
    }

    function rebuildTitleLines() {
      titleLines = new Map();
      splitSources.forEach(function (element) {
        titleLines.set(element, restoreAndSplitTitle(element));
      });
    }

    function flattenLines(element) {
      const lines = titleLines.get(element) || [];
      return lines.reduce(function (all, line) {
        return all.concat(line);
      }, []);
    }

    function animateLinesIn(element, start) {
      const lines = titleLines.get(element) || [];

      lines.forEach(function (line, index) {
        timeline.to(
          line,
          {
            opacity: 1,
            yPercent: 0,
            duration: CONFIG.text.lineDuration
          },
          start + index * CONFIG.text.lineStagger
        );
      });
    }

    function animateLinesOut(element, start) {
      const lines = titleLines.get(element) || [];

      lines.forEach(function (line, index) {
        timeline.to(
          line,
          {
            opacity: 0,
            yPercent: -75,
            duration: CONFIG.text.lineDuration
          },
          start + index * CONFIG.text.lineStagger
        );
      });
    }

    function animateLinesSideOut(element, start, end, direction) {
      const lines = titleLines.get(element) || [];
      const duration = Math.max(end - start, 0.01);

      lines.forEach(function (line, index) {
        timeline.to(
          line,
          {
            x: function () {
              return direction *
                window.innerWidth *
                CONFIG.targetSequence.exitViewportDistance;
            },
            opacity: 0,
            duration: duration
          },
          start + index * CONFIG.text.lineStagger
        );
      });
    }

    /*==================================================
    MESURE DES POSITIONS WEBFLOW DES 13 CELLULES
    ==================================================*/

    function restoreCellStyle(cell) {
      const originalStyle = originalCellStyles.get(cell);
      if (originalStyle === null) {
        cell.removeAttribute("style");
      } else {
        cell.setAttribute("style", originalStyle);
      }
    }

    function restoreTargetStyles() {
      targetTextElements.forEach(function (element) {
        const originalStyle = originalTargetStyles.get(element);

        if (originalStyle === null) {
          element.removeAttribute("style");
        } else {
          element.setAttribute("style", originalStyle);
        }
      });

    }

    function measureTargetMainDirections() {
      if (!targetMainOne || !targetMainTwo) {
        return;
      }

      const oneRectangle = targetMainOne.getBoundingClientRect();
      const twoRectangle = targetMainTwo.getBoundingClientRect();
      const oneCenter = oneRectangle.left + oneRectangle.width / 2;
      const twoCenter = twoRectangle.left + twoRectangle.width / 2;

      /*
      On respecte l’ordre visuel défini dans Webflow : le bloc réellement
      placé à gauche sort à gauche, celui réellement placé à droite sort
      à droite, même si l’ordre des classes change plus tard.
      */
      if (oneCenter <= twoCenter) {
        targetMainOneDirection = -1;
        targetMainTwoDirection = 1;
      } else {
        targetMainOneDirection = 1;
        targetMainTwoDirection = -1;
      }
    }

    function fitTargetLottieOnMobile() {
      if (!targetLottie) {
        return;
      }

      const renderSurface = targetLottie.querySelector("svg, canvas");

      if (!renderSurface) {
        return;
      }

      /* On repart toujours de la taille Webflow avant de mesurer. */
      gsap.set(renderSurface, {
        scale: 1,
        transformOrigin: "50% 50%"
      });

      if (targetLottieWrapper) {
        gsap.set(targetLottieWrapper, {
          scale: 1,
          transformOrigin: "50% 50%"
        });
      }

      if (window.innerWidth > 767) {
        return;
      }

      const margin = CONFIG.targetSequence.mobileLottieMargin;
      const surfaceBounds = renderSurface.getBoundingClientRect();

      if (!surfaceBounds.width || !surfaceBounds.height) {
        return;
      }

      const safeBounds = targetWrapper
        ? targetWrapper.getBoundingClientRect()
        : {
          left: 0,
          top: 0,
          right: window.innerWidth,
          bottom: window.innerHeight
        };
      const centerX = surfaceBounds.left + surfaceBounds.width / 2;
      const centerY = surfaceBounds.top + surfaceBounds.height / 2;
      const availableHalfWidth = Math.max(
        Math.min(
          centerX - safeBounds.left - margin,
          safeBounds.right - margin - centerX
        ),
        1
      );
      const availableHalfHeight = Math.max(
        Math.min(
          centerY - safeBounds.top - margin,
          safeBounds.bottom - margin - centerY
        ),
        1
      );

      const fitScale = Math.min(
        availableHalfWidth * 2 / surfaceBounds.width,
        availableHalfHeight * 2 / surfaceBounds.height,
        CONFIG.targetSequence.mobileLottieSafeScale
      );

      gsap.set(targetLottieWrapper || targetLottie, {
        scale: Math.max(
          fitScale,
          CONFIG.targetSequence.mobileLottieMinimumScale
        ),
        transformOrigin: "50% 50%"
      });
    }

    function measureCells() {
      cells.forEach(restoreCellStyle);

      cellMeasurements = cells.map(function (cell) {
        const rectangle = cell.getBoundingClientRect();
        const centerX = rectangle.left + rectangle.width / 2;
        const centerY = rectangle.top + rectangle.height / 2;
        const targetX = Number(gsap.getProperty(cell, "x")) || 0;
        const targetY = Number(gsap.getProperty(cell, "y")) || 0;
        const targetRotation = Number(gsap.getProperty(cell, "rotation")) || 0;
        const targetScaleX = Number(gsap.getProperty(cell, "scaleX")) || 1;

        return {
          targetX: targetX,
          targetY: targetY,
          targetRotation: targetRotation,
          targetScale: targetScaleX,
          centerOffsetX: window.innerWidth / 2 - centerX,
          centerOffsetY: window.innerHeight / 2 - centerY
        };
      });
    }

    /*==================================================
    MESURE DES POSITIONS WEBFLOW DES 23 CELLULES CANCER
    ==================================================*/

    function restoreCancerCellStyle(cell) {
      const originalStyle = originalCancerCellStyles.get(cell);
      if (originalStyle === null) {
        cell.removeAttribute("style");
      } else {
        cell.setAttribute("style", originalStyle);
      }
    }

    function measureCancerCells() {
      if (!cancerCells.length) {
        cancerCellMeasurements = [];
        return;
      }

      cancerCells.forEach(restoreCancerCellStyle);

      const wrapperBounds = cancerWrapper
        ? cancerWrapper.getBoundingClientRect()
        : null;
      const centerX = wrapperBounds && wrapperBounds.width
        ? wrapperBounds.left + wrapperBounds.width / 2
        : window.innerWidth / 2;
      const centerY = wrapperBounds && wrapperBounds.height
        ? wrapperBounds.top + wrapperBounds.height / 2
        : window.innerHeight / 2;

      cancerCellMeasurements = cancerCells.map(function (cell) {
        const rectangle = cell.getBoundingClientRect();
        const cellCenterX = rectangle.left + rectangle.width / 2;
        const cellCenterY = rectangle.top + rectangle.height / 2;

        return {
          targetX: Number(gsap.getProperty(cell, "x")) || 0,
          targetY: Number(gsap.getProperty(cell, "y")) || 0,
          targetRotation: Number(gsap.getProperty(cell, "rotation")) || 0,
          targetScale: Number(gsap.getProperty(cell, "scaleX")) || 1,
          centerOffsetX: centerX - cellCenterX,
          centerOffsetY: centerY - cellCenterY
        };
      });
    }

    function positionCancerCells() {
      cancerCells.forEach(function (cell, index) {
        const measurement = cancerCellMeasurements[index];
        const progress = cancerProgress[index]
          ? cancerProgress[index].value
          : 0;

        if (!measurement) {
          return;
        }

        const startX = measurement.targetX + measurement.centerOffsetX;
        const startY = measurement.targetY + measurement.centerOffsetY;

        gsap.set(cell, {
          x: gsap.utils.interpolate(startX, measurement.targetX, progress),
          y: gsap.utils.interpolate(startY, measurement.targetY, progress),
          scale: measurement.targetScale * progress,
          rotation: measurement.targetRotation,
          opacity: 1,
          transformOrigin: "50% 50%"
        });
      });
    }

    /*==================================================
    POSITIONNEMENT DES MÉDIAS SUR L’ELLIPSE
    ==================================================*/

    function getDepthScale(radians) {
      const normalizedDepth = (Math.sin(radians) + 1) / 2;
      return gsap.utils.interpolate(
        CONFIG.depth.minimum,
        CONFIG.depth.maximum,
        normalizedDepth
      );
    }

    function positionMainVisual(radiusX, radiusY, bounds) {
      const angle = baseAngles[0] + orbitState.angle;
      const radians = toRadians(angle);
      const destinationX = Math.cos(radians) * radiusX;
      const destinationY = Math.sin(radians) * radiusY;
      const x = destinationX * orbitState.reveal;
      const y = destinationY * orbitState.reveal;
      const depth = getDepthScale(radians);
      const orbitScale = currentSettings.main.scale * depth;
      const scale = gsap.utils.interpolate(
        1,
        orbitScale,
        orbitState.reveal
      ) * mediaExit[0].value;

      const targetHeight = bounds.height * currentSettings.main.boxHeight;
      const targetWidth = targetHeight * currentSettings.main.aspectRatio;
      const width = gsap.utils.interpolate(
        bounds.width,
        targetWidth,
        orbitState.reveal
      );
      const height = gsap.utils.interpolate(
        bounds.height,
        targetHeight,
        orbitState.reveal
      );

      const compensatedRadius = currentSettings.main.radius /
        Math.max(scale, 0.001);
      const originalRadiusNumber = parseFloat(originalMainRadius) || 0;
      const radius = orbitState.reveal === 0
        ? originalMainRadius
        : gsap.utils.interpolate(
          originalRadiusNumber,
          compensatedRadius,
          orbitState.reveal
        ) + "px";

      const embedRadiusNumber = parseFloat(originalEmbedRadius) || 0;
      const embedRadius = orbitState.reveal === 0
        ? originalEmbedRadius
        : gsap.utils.interpolate(
          embedRadiusNumber,
          compensatedRadius,
          orbitState.reveal
        ) + "px";

      gsap.set(heroBackground, {
        left: "50%",
        top: "50%",
        right: "auto",
        bottom: "auto",
        width: width,
        height: height,
        xPercent: -50,
        yPercent: -50,
        x: x,
        y: y,
        scale: scale,
        rotation: 0,
        borderRadius: radius,
        transformOrigin: "50% 50%"
      });

      gsap.set(heroEmbed, {
        left: "50%",
        top: "50%",
        right: "auto",
        bottom: "auto",
        width: width,
        height: height,
        xPercent: -50,
        yPercent: -50,
        x: x,
        y: y,
        scale: scale,
        rotation: 0,
        borderRadius: embedRadius,
        transformOrigin: "50% 50%"
      });
    }

    function positionSecondaryImages(radiusX, radiusY, bounds) {
      imageItems.forEach(function (item, index) {
        const angle = baseAngles[index + 1] + orbitState.angle;
        const radians = toRadians(angle);
        const orbitX = Math.cos(radians) * radiusX;
        const orbitY = Math.sin(radians) * radiusY;
        const reveal = imageReveal[index].value;
        const outsideX = Math.cos(toRadians(baseAngles[index + 1])) *
          bounds.width * CONFIG.imageEntrance.outsideDistance;
        const outsideY = Math.sin(toRadians(baseAngles[index + 1])) *
          bounds.height * CONFIG.imageEntrance.outsideDistance;
        const x = gsap.utils.interpolate(outsideX, orbitX, reveal);
        const y = gsap.utils.interpolate(outsideY, orbitY, reveal);
        const baseScale = currentSettings.imageScales[index] || 1;
        const depth = getDepthScale(radians);
        const scale = baseScale * depth * reveal * mediaExit[index + 1].value;

        gsap.set(item, {
          xPercent: -50,
          yPercent: -50,
          x: x,
          y: y,
          scale: scale,
          rotation: 0,
          transformOrigin: "50% 50%"
        });
      });
    }

    function positionOrbitItems() {
      if (!currentSettings) {
        return;
      }

      const bounds = heroContent.getBoundingClientRect();
      const radiusX = bounds.width * currentSettings.orbit.radiusX;
      const radiusY = bounds.height * currentSettings.orbit.radiusY;

      positionMainVisual(radiusX, radiusY, bounds);
      positionSecondaryImages(radiusX, radiusY, bounds);
    }

    /*==================================================
    POSITIONNEMENT DES CELLULES
    ==================================================*/

    function positionCells() {
      cells.forEach(function (cell, index) {
        const measurement = cellMeasurements[index];
        if (!measurement) {
          return;
        }

        const progress = cellsProgress[index].position;
        const visibility = cellsProgress[index].visibility;
        const exitScale = cellExit[index].value;
        const startX = measurement.targetX + measurement.centerOffsetX;
        const startY = measurement.targetY + measurement.centerOffsetY;

        gsap.set(cell, {
          x: gsap.utils.interpolate(startX, measurement.targetX, progress),
          y: gsap.utils.interpolate(startY, measurement.targetY, progress),
          scale: measurement.targetScale * visibility * exitScale,
          rotation: measurement.targetRotation,
          opacity: visibility,
          transformOrigin: "50% 50%"
        });
      });
    }

    /*==================================================
    FLOTTEMENT LÉGER DES CELLULES UNE FOIS PLACÉES
    ==================================================*/

    function destroyFloating() {
      floatingTweens.forEach(function (tween) {
        tween.kill();
      });
      floatingTweens = [];

      if (floatingTargets.length) {
        gsap.set(floatingTargets, {
          clearProps: "x,y,rotation,transformOrigin"
        });
      }

      floatingTargets = [];
      floatingActive = false;
    }

    function createFloating() {
      destroyFloating();

      const mobile = window.innerWidth <= 767;
      const maximumX = mobile
        ? CONFIG.cellFloating.xMobile
        : CONFIG.cellFloating.xDesktop;
      const maximumY = mobile
        ? CONFIG.cellFloating.yMobile
        : CONFIG.cellFloating.yDesktop;

      cells.concat(cancerCells).forEach(function (cell, index) {
        const target = cell.querySelector("svg") || cell.firstElementChild;

        if (!target) {
          console.warn(
            "Hero : contenu flottant introuvable dans la cellule animée " +
            (index + 1) + "."
          );
          return;
        }

        const xDirection = index % 2 === 0 ? 1 : -1;
        const yDirection = index % 3 === 0 ? -1 : 1;
        const destinationX = deterministic(
          index,
          maximumX * 0.45,
          maximumX,
          1
        ) * xDirection;
        const destinationY = deterministic(
          index,
          maximumY * 0.50,
          maximumY,
          2
        ) * yDirection;
        const destinationRotation = deterministic(
          index,
          CONFIG.cellFloating.rotation * 0.35,
          CONFIG.cellFloating.rotation,
          3
        ) * xDirection;
        const duration = deterministic(
          index,
          CONFIG.cellFloating.durationMin,
          CONFIG.cellFloating.durationMax,
          4
        );

        gsap.set(target, {
          x: 0,
          y: 0,
          rotation: 0,
          transformOrigin: "50% 50%"
        });

        const tween = gsap.to(target, {
          x: destinationX,
          y: destinationY,
          rotation: destinationRotation,
          duration: duration,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          paused: false
        });

        tween.progress((index * 0.173 + 0.11) % 1).play();
        floatingTargets.push(target);
        floatingTweens.push(tween);
      });

      floatingActive = true;
    }

    function updateFloating(scrollProgress) {
      const shouldFloat = scrollProgress >= CONFIG.cellFloating.start &&
        scrollProgress < CONFIG.cellFloating.end;

      if (shouldFloat && !floatingActive) {
        floatingActive = true;
        floatingTweens.forEach(function (tween) {
          tween.resume();
        });
        return;
      }

      if (!shouldFloat && floatingActive) {
        floatingActive = false;
        floatingTweens.forEach(function (tween) {
          tween.pause();
        });

        if (scrollProgress < CONFIG.cellFloating.start) {
          gsap.set(floatingTargets, {
            x: 0,
            y: 0,
            rotation: 0
          });
        }
      }
    }

    /*==================================================
    ÉTAT INITIAL
    ==================================================*/

    function setInitialState() {
      currentSettings = getResponsiveSettings();
      orbitState.reveal = 0;
      orbitState.angle = 0;

      imageReveal.forEach(function (state) {
        state.value = 0;
      });
      mediaExit.forEach(function (state) {
        state.value = 1;
      });
      cellsProgress.forEach(function (state) {
        state.position = 0;
        state.visibility = 0;
      });
      cellExit.forEach(function (state) {
        state.value = 1;
      });
      cancerProgress.forEach(function (state) {
        state.value = 0;
      });

      const backgroundStyle = heroBackground.getAttribute("style");
      const embedStyle = heroEmbed.getAttribute("style");
      heroBackground.removeAttribute("style");
      heroEmbed.removeAttribute("style");
      originalMainRadius = window.getComputedStyle(heroBackground).borderRadius;
      originalEmbedRadius = window.getComputedStyle(heroEmbed).borderRadius;

      if (backgroundStyle !== null) {
        heroBackground.setAttribute("style", backgroundStyle);
      }
      if (embedStyle !== null) {
        heroEmbed.setAttribute("style", embedStyle);
      }

      /*
      Les positions Webflow doivent être mesurées sans le déplacement
      résiduel de la timeline précédente.

      Aucun transform ne doit rester sur .h-hero__content : sinon il devient
      le faux viewport des trois wrappers fixed et décale leurs positions
      Webflow vers le bas. Le déplacement du contenu utilise uniquement top.
      */
      gsap.set(heroContent, {
        clearProps: "transform",
        top: 0
      });

      if (cellsWrapper) {
        gsap.set(cellsWrapper, { clearProps: "transform" });
      }

      restoreTargetStyles();
      measureCells();
      measureCancerCells();
      rebuildTitleLines();
      measureTargetMainDirections();

      gsap.set(heroBackground, { opacity: 1 });
      gsap.set(heroEmbed, { opacity: 1 });

      gsap.set(imageItems, {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        rotation: 0,
        transformOrigin: "50% 50%"
      });

      if (header) {
        gsap.set(header, { yPercent: 0 });
      }

      fitTargetLottieOnMobile();
      window.requestAnimationFrame(fitTargetLottieOnMobile);

      if (oldTextGrid) {
        gsap.set(oldTextGrid, { opacity: 1, y: 0 });
      }

      if (oldTextCard) {
        gsap.set(oldTextCard, { opacity: 1, y: 0 });
      }

      [oldTitle, titleOne, titleTwo].filter(Boolean).forEach(function (title) {
        gsap.set(flattenLines(title), {
          opacity: title === oldTitle ? 1 : 0,
          yPercent: title === oldTitle ? 0 : 75
        });
      });

      targetTextElements.forEach(function (element) {
        gsap.set(element, { visibility: "visible" });
        gsap.set(flattenLines(element), {
          opacity: 0,
          yPercent: 75,
          x: 0
        });
      });

      if (targetLottieWrapper) {
        gsap.set(targetLottieWrapper, { opacity: 0 });
      }

      if (titleOne) {
        gsap.set(titleOne, { visibility: "visible" });
      }
      if (titleTwo) {
        gsap.set(titleTwo, { visibility: "visible" });
      }

      positionCells();
      positionCancerCells();
      positionOrbitItems();

      /* Anti-flash : on révèle seulement après tous les gsap.set initiaux. */
      document.documentElement.classList.add("hero-animation-ready");
    }

    /*==================================================
    TIMELINE
    ==================================================*/

    function createTimeline() {
      destroyFloating();

      if (timeline) {
        if (timeline.scrollTrigger) {
          timeline.scrollTrigger.kill();
        }
        timeline.kill();
      }

      setInitialState();

      if (prefersReducedMotion) {
        gsap.set(cells, { opacity: 1 });
        cellsProgress.forEach(function (state) {
          state.position = 1;
          state.visibility = 1;
        });
        positionCells();
        cancerProgress.forEach(function (state) {
          state.value = 1;
        });
        positionCancerCells();
        if (titleOne) {
          gsap.set(flattenLines(titleOne), { opacity: 1, yPercent: 0 });
        }
        targetTextElements.forEach(function (element) {
          gsap.set(flattenLines(element), { opacity: 1, yPercent: 0 });
        });
        if (targetLottieWrapper) {
          gsap.set(targetLottieWrapper, { opacity: 1 });
        }
        return;
      }

      /*
      Le floating tourne déjà pendant que les cellules sont à scale:0.
      Leur apparition hérite ainsi d’un mouvement continu, sans activation
      visible une fois leur placement terminé.
      */
      createFloating();

      const scroll = CONFIG.scroll;

      timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: heroWrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            updateFloating(timeline ? timeline.time() : 0);
          },
          onRefresh: function (self) {
            currentSettings = getResponsiveSettings();
            positionOrbitItems();
            positionCells();
            updateFloating(timeline ? timeline.time() : 0);
          }
        }
      });

      if (header) {
        timeline.to(header, {
          yPercent: CONFIG.headerYPercent,
          duration: scroll.headerEnd - scroll.headerStart
        }, scroll.headerStart);
      }

      timeline.to(heroContent, {
        top: function () {
          return -getContentCenterLift();
        },
        duration: scroll.headerEnd - scroll.headerStart
      }, scroll.headerStart);

      timeline.to(orbitState, {
        reveal: 1,
        duration: scroll.mediaRevealEnd - scroll.mediaRevealStart,
        onUpdate: positionOrbitItems
      }, scroll.mediaRevealStart);

      timeline.to(orbitState, {
        angle: 360 * scroll.orbitTurns,
        duration: scroll.orbitEnd - scroll.orbitStart,
        onUpdate: positionOrbitItems
      }, scroll.orbitStart);

      timeline.to(heroEmbed, {
        opacity: 0,
        duration: scroll.embedFadeEnd - scroll.embedFadeStart
      }, scroll.embedFadeStart);

      imageReveal.forEach(function (state, index) {
        const randomStart = deterministic(
          index,
          0,
          CONFIG.imageEntrance.random,
          8
        );
        const duration = deterministic(
          index,
          CONFIG.imageEntrance.durationMin,
          CONFIG.imageEntrance.durationMax,
          9
        );

        timeline.to(state, {
          value: 1,
          duration: duration,
          onUpdate: positionOrbitItems
        }, scroll.mediaRevealStart +
          index * CONFIG.imageEntrance.stagger +
          randomStart
        );
      });

      if (oldTextGrid) {
        timeline.to(oldTextGrid, {
          y: CONFIG.text.oldPanelY,
          opacity: 0,
          duration: scroll.oldTextEnd - scroll.oldTextStart
        }, scroll.oldTextStart);
      }

      if (oldTextCard) {
        timeline.to(oldTextCard, {
          opacity: 0,
          duration: scroll.oldTextEnd - scroll.oldTextStart
        }, scroll.oldTextStart);
      }

      if (oldTitle) {
        animateLinesOut(oldTitle, scroll.oldTextStart);
      }

      if (cells[0]) {
        timeline.to(cellsProgress[0], {
          visibility: 1,
          duration: scroll.firstCellEnd - scroll.firstCellStart,
          onUpdate: positionCells
        }, scroll.firstCellStart);
      }

      cellsProgress.forEach(function (state, index) {
        /*
        Les 13 cellules rejoignent leurs positions dans la même phase.
        Les départs et durées indépendants restent volontairement chevauchés :
        ni apparition simultanée, ni cascade mécanique dans l’ordre 1→13.
        */
        const organicStart = deterministic(
          index,
          scroll.cellsSpreadStart,
          scroll.cellsSpreadLatestStart,
          31
        );
        const start = index === 0
          ? organicStart + scroll.firstCellMoveDelay
          : organicStart;
        const duration = deterministic(
          index,
          scroll.cellsSpreadDurationMin,
          scroll.cellsSpreadDurationMax,
          32
        );

        if (index === 0) {
          /* .is--one est déjà visible au centre : seul son trajet commence. */
          timeline.to(state, {
            position: 1,
            duration: duration,
            onUpdate: positionCells
          }, start);
        } else {
          timeline.to(state, {
            position: 1,
            visibility: 1,
            duration: duration,
            onUpdate: positionCells
          }, start);
        }
      });

      if (titleOne) {
        animateLinesIn(titleOne, scroll.titleOneIn);
        animateLinesOut(titleOne, scroll.titleOneOut);
      }

      if (titleTwo) {
        animateLinesIn(titleTwo, scroll.titleTwoIn);
        animateLinesOut(titleTwo, scroll.titleTwoOut);
      }

      mediaExit.forEach(function (state, index) {
        const randomStart = deterministic(
          index,
          0,
          scroll.mediaExitRandom,
          13
        );
        const duration = deterministic(
          index,
          scroll.mediaExitDurationMin,
          scroll.mediaExitDurationMax,
          14
        );

        timeline.to(state, {
          value: 0,
          duration: duration,
          onUpdate: positionOrbitItems
        }, scroll.mediaExitStart +
          index * scroll.mediaExitStagger +
          randomStart
        );
      });

      cellExit.forEach(function (state, cellIndex) {
        /*
        Chaque cellule possède un départ et une durée indépendants.
        Les scale-down se chevauchent, sans ordre spatial ou numérique.
        */
        const start = deterministic(
          cellIndex,
          scroll.cellsExitStart,
          scroll.cellsExitLatestStart,
          21
        );
        const duration = deterministic(
          cellIndex,
          scroll.cellsExitDurationMin,
          scroll.cellsExitDurationMax,
          22
        );

        timeline.to(state, {
          value: 0,
          duration: duration,
          onUpdate: positionCells
        }, start);
      });

      /*================================================
      SÉQUENCE TARGET — APRÈS LES 13 CELLULES
      ================================================*/

      const targetTiming = CONFIG.targetSequence;

      if (targetMainOne) {
        animateLinesIn(targetMainOne, targetTiming.mainOneIn);
      }

      if (targetMainTwo) {
        animateLinesIn(targetMainTwo, targetTiming.mainTwoIn);
      }

      /*
      On anime les lignes internes, jamais les deux blocs principaux.
      Le placement Webflow et celui de leur parent restent donc intacts.
      */

      if (targetMainOne) {
        animateLinesSideOut(
          targetMainOne,
          targetTiming.mainExitStart,
          targetTiming.mainExitEnd,
          targetMainOneDirection
        );
      }

      if (targetMainTwo) {
        animateLinesSideOut(
          targetMainTwo,
          targetTiming.mainExitStart,
          targetTiming.mainExitEnd,
          targetMainTwoDirection
        );
      }

      if (targetLottieWrapper) {
        timeline.to(targetLottieWrapper, {
          opacity: 1,
          duration: targetTiming.lottieInEnd - targetTiming.lottieInStart
        }, targetTiming.lottieInStart);
      }

      /* Pause volontaire pour la future animation Lottie. */

      if (targetTitleOne) {
        animateLinesIn(targetTitleOne, targetTiming.titleOneIn);
      }

      if (targetTitleTwo) {
        animateLinesIn(targetTitleTwo, targetTiming.titleTwoIn);
      }

      /* Les deux titres disparaissent avant le premier paragraphe. */

      if (targetTitleOne) {
        animateLinesOut(targetTitleOne, targetTiming.titlesOutStart);
      }

      if (targetTitleTwo) {
        animateLinesOut(targetTitleTwo, targetTiming.titlesOutStart);
      }

      if (targetParagraphOne) {
        animateLinesIn(targetParagraphOne, targetTiming.paragraphOneIn);
        animateLinesOut(targetParagraphOne, targetTiming.paragraphOneOut);
      }

      /* Le second paragraphe attend la disparition complète du premier. */

      if (targetParagraphTwo) {
        animateLinesIn(targetParagraphTwo, targetTiming.paragraphTwoIn);
        animateLinesOut(targetParagraphTwo, targetTiming.paragraphTwoOut);
      }

      /*
      Les 23 cellules cancer apparaissent pendant le second paragraphe.
      Leurs départs et durées se chevauchent de façon déterministe afin
      d’obtenir un rythme organique tout en restant stable après resize.
      */
      cancerProgress.forEach(function (state, index) {
        const startOffset = deterministic(
          index,
          0,
          CONFIG.cancerSequence.latestStartOffset,
          81
        );
        const duration = deterministic(
          index,
          CONFIG.cancerSequence.durationMin,
          CONFIG.cancerSequence.durationMax,
          82
        );

        timeline.to(state, {
          value: 1,
          duration: duration,
          onUpdate: positionCancerCells
        }, targetTiming.paragraphTwoIn + startOffset);
      });

      /*
      La Lottie disparaît pendant la disparition des deux titres,
      précisément à partir du départ de .hh__target-title.is--two.
      */

      if (targetLottieWrapper) {
        timeline.to(targetLottieWrapper, {
          opacity: 0,
          duration: targetTiming.lottieOutEnd - targetTiming.lottieOutStart
        }, targetTiming.lottieOutStart);
      }

      /* Maintient le dernier état jusqu’à la fin du scroll du hero. */
      timeline.to({}, {
        duration: Math.max(
          targetTiming.end - targetTiming.paragraphTwoOut,
          0.01
        )
      }, targetTiming.paragraphTwoOut);
    }

    /*==================================================
    RESIZE
    ==================================================*/

    function handleResize(forceRebuild) {
      const nextWidth = window.innerWidth;

      /*
      Safari/Chrome mobile déclenchent resize lorsque leur barre d’adresse
      change de hauteur. Recréer la timeline à ce moment pouvait remettre
      certaines cellules à scale:0 pendant le scroll.
      */
      if (
        !forceRebuild &&
        nextWidth <= 991 &&
        Math.abs(nextWidth - viewportWidth) < 2
      ) {
        return;
      }

      viewportWidth = nextWidth;
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(function () {
        createTimeline();
        ScrollTrigger.refresh();
      }, CONFIG.resizeDebounce);
    }

    createTimeline();
    window.addEventListener("resize", function () {
      handleResize(false);
    });
    window.addEventListener("orientationchange", function () {
      window.setTimeout(function () {
        handleResize(true);
      }, 120);
    });
    ScrollTrigger.refresh();
  });
})();
+

/*==================================================
SECONDE SECTION — TIMELINE INDÉPENDANTE
==================================================*/

(function () {
  "use strict";

  const SECOND_CONFIG = {
    selectors: {
      wrapper: ".h-second__wrapper",
      parent: ".h-second__parent",
      paragraphOne: ".hs_p.is--one",
      paragraphTwo: ".hs_p.is--two",
      button: ".hs__button-wrapper",
      videoOne: ".hs__video.is--1",
      videoTwo: ".hs__video.is--2",
      videoThree: ".hs__video.is--3"
    },

    timing: {
      paragraphOneIn: 0,
      paragraphOneOut: 0.28,

      videoOneIn: 0.30,
      videoTwoIn: 0.303,
      videoThreeIn: 0.306,
      videoInDuration: 0.18,

      videoThreeOut: 0.68,
      videoTwoOut: 0.70,
      videoOneOut: 0.72,
      videoOutDuration: 0.10,

      paragraphTwoIn: 0.83,
      buttonIn: 0.92,
      end: 1
    },

    text: {
      lineDuration: 0.055,
      lineStagger: 0.018,
      hiddenYPercent: 70
    },

    videoStack: {
      startStep: 28,
      finalBlend: 0.65,
      gapDesktop: 30,
      gapTablet: 24,
      gapMobile: 16
    },

    buttonDuration: 0.07,
    resizeDebounce: 180
  };

  window.addEventListener("load", function () {
    if (
      typeof window.gsap === "undefined" ||
      typeof window.ScrollTrigger === "undefined"
    ) {
      console.warn(
        "Seconde section : GSAP ou ScrollTrigger est absent."
      );
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const selectors = SECOND_CONFIG.selectors;
    const wrapper = document.querySelector(selectors.wrapper);

    if (!wrapper) {
      return;
    }

    const parent = wrapper.querySelector(selectors.parent);
    const paragraphOne = wrapper.querySelector(selectors.paragraphOne);
    const paragraphTwo = wrapper.querySelector(selectors.paragraphTwo);
    const button = wrapper.querySelector(selectors.button);
    const videoOne = wrapper.querySelector(selectors.videoOne);
    const videoTwo = wrapper.querySelector(selectors.videoTwo);
    const videoThree = wrapper.querySelector(selectors.videoThree);
    const previousCancerWrapper = document.querySelector(
      ".hh__cancer-wrapper"
    );
    const previousCancerTargets = previousCancerWrapper
      ? Array.from(
          previousCancerWrapper.querySelectorAll(".hh__cencer-lottie")
        ).map(function (cell) {
          return cell.querySelector("svg") || cell.firstElementChild;
        }).filter(Boolean)
      : [];

    [
      [parent, selectors.parent],
      [paragraphOne, selectors.paragraphOne],
      [paragraphTwo, selectors.paragraphTwo],
      [button, selectors.button],
      [videoOne, selectors.videoOne],
      [videoTwo, selectors.videoTwo],
      [videoThree, selectors.videoThree]
    ].forEach(function (item) {
      if (!item[0]) {
        console.warn(
          "Seconde section : élément absent — " + item[1]
        );
      }
    });

    if (
      !parent ||
      !paragraphOne ||
      !paragraphTwo ||
      !button ||
      !videoOne ||
      !videoTwo ||
      !videoThree
    ) {
      return;
    }

    const paragraphs = [paragraphOne, paragraphTwo];
    const videos = [videoThree, videoTwo, videoOne];

    const originalParagraphMarkup = new Map();
    paragraphs.forEach(function (paragraph) {
      originalParagraphMarkup.set(paragraph, paragraph.innerHTML);
    });

    const originalVideoStyles = new Map();
    videos.forEach(function (video) {
      originalVideoStyles.set(video, video.getAttribute("style"));
    });

    const originalButtonStyle = button.getAttribute("style");

    let lines = new Map();
    let timeline = null;
    let resizeTimer = null;
    let viewportWidth = window.innerWidth;

    function restoreInlineStyle(element, originalStyle) {
      if (originalStyle === null) {
        element.removeAttribute("style");
      } else {
        element.setAttribute("style", originalStyle);
      }
    }

    function splitParagraphIntoLines(paragraph) {
      paragraph.innerHTML = originalParagraphMarkup.get(paragraph);

      const walker = document.createTreeWalker(
        paragraph,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function (node) {
            if (!node.nodeValue || !node.nodeValue.trim()) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const textNodes = [];
      let textNode = walker.nextNode();

      while (textNode) {
        textNodes.push(textNode);
        textNode = walker.nextNode();
      }

      textNodes.forEach(function (node) {
        const fragment = document.createDocumentFragment();
        const pieces = node.nodeValue.match(/\s+|[^\s]+/g) || [];

        pieces.forEach(function (piece) {
          if (/^\s+$/.test(piece)) {
            fragment.appendChild(document.createTextNode("\u200B"));
            return;
          }

          const word = document.createElement("span");
          word.className = "hs-split-word";
          word.textContent = piece;
          fragment.appendChild(word);
        });

        node.parentNode.replaceChild(fragment, node);
      });

      const lineGroups = [];

      Array.from(
        paragraph.querySelectorAll(".hs-split-word")
      ).forEach(function (word) {
        const top = Math.round(word.getBoundingClientRect().top);
        let line = lineGroups.find(function (candidate) {
          return Math.abs(candidate.top - top) <= 2;
        });

        if (!line) {
          line = { top: top, words: [] };
          lineGroups.push(line);
        }

        line.words.push(word);
      });

      lineGroups.sort(function (a, b) {
        return a.top - b.top;
      });

      return lineGroups.map(function (line) {
        return line.words;
      });
    }

    function rebuildLines() {
      lines = new Map();
      paragraphs.forEach(function (paragraph) {
        lines.set(paragraph, splitParagraphIntoLines(paragraph));
      });
    }

    function allWords(paragraph) {
      return (lines.get(paragraph) || []).reduce(
        function (words, line) {
          return words.concat(line);
        },
        []
      );
    }

    function animateLinesIn(paragraph, start) {
      const paragraphLines = lines.get(paragraph) || [];

      paragraphLines.forEach(function (line, index) {
        timeline.to(line, {
          opacity: 1,
          yPercent: 0,
          duration: SECOND_CONFIG.text.lineDuration
        }, start + index * SECOND_CONFIG.text.lineStagger);
      });
    }

    function animateLinesOut(paragraph, start) {
      const paragraphLines = lines.get(paragraph) || [];

      paragraphLines.forEach(function (line, index) {
        timeline.to(line, {
          opacity: 0,
          yPercent: -SECOND_CONFIG.text.hiddenYPercent,
          duration: SECOND_CONFIG.text.lineDuration
        }, start + index * SECOND_CONFIG.text.lineStagger);
      });
    }

    function restoreWebflowState() {
      videos.forEach(function (video) {
        restoreInlineStyle(video, originalVideoStyles.get(video));
      });
      restoreInlineStyle(button, originalButtonStyle);
      rebuildLines();
    }

    function getVideoStackGap() {
      if (window.innerWidth <= 767) {
        return SECOND_CONFIG.videoStack.gapMobile;
      }

      if (window.innerWidth <= 991) {
        return SECOND_CONFIG.videoStack.gapTablet;
      }

      return SECOND_CONFIG.videoStack.gapDesktop;
    }

    function createTimeline() {
      if (timeline) {
        if (timeline.scrollTrigger) {
          timeline.scrollTrigger.kill();
        }
        timeline.kill();
      }

      document.documentElement.classList.remove(
        "second-animation-ready"
      );

      restoreWebflowState();

      const finalVideoScales = new Map();
      const finalVideoY = new Map();
      const finalVideoYPercent = new Map();
      const videoRectangles = new Map();
      videos.forEach(function (video) {
        finalVideoScales.set(
          video,
          Number(gsap.getProperty(video, "scaleX")) || 1
        );
        finalVideoY.set(
          video,
          Number(gsap.getProperty(video, "y")) || 0
        );
        finalVideoYPercent.set(
          video,
          Number(gsap.getProperty(video, "yPercent")) || 0
        );
        videoRectangles.set(video, video.getBoundingClientRect());
      });

      const anchorRectangle = videoRectangles.get(videoOne);
      const anchorCenterY =
        anchorRectangle.top + anchorRectangle.height / 2;
      const stackGap = getVideoStackGap();
      const startSteps = new Map([
        [videoOne, 0],
        [videoTwo, -SECOND_CONFIG.videoStack.startStep],
        [videoThree, -SECOND_CONFIG.videoStack.startStep * 2]
      ]);
      const finalTopSteps = new Map([
        [videoOne, 0],
        [videoTwo, -stackGap],
        [videoThree, -stackGap * 2]
      ]);
      const videoDepth = new Map([
        [videoOne, 3],
        [videoTwo, 2],
        [videoThree, 1]
      ]);
      const startVideoY = new Map();
      const stackedVideoY = new Map();

      videos.forEach(function (video) {
        const rectangle = videoRectangles.get(video);
        const centerY = rectangle.top + rectangle.height / 2;

        startVideoY.set(
          video,
          finalVideoY.get(video) +
            anchorCenterY + startSteps.get(video) - centerY
        );
        stackedVideoY.set(
          video,
          finalVideoY.get(video) +
            (
              anchorRectangle.top +
              finalTopSteps.get(video) -
              rectangle.top
            ) * SECOND_CONFIG.videoStack.finalBlend
        );
      });

      gsap.set(allWords(paragraphOne), {
        opacity: 0,
        yPercent: SECOND_CONFIG.text.hiddenYPercent
      });

      gsap.set(allWords(paragraphTwo), {
        opacity: 0,
        yPercent: SECOND_CONFIG.text.hiddenYPercent
      });

      videos.forEach(function (video) {
        gsap.set(video, {
          y: startVideoY.get(video),
          yPercent: finalVideoYPercent.get(video),
          zIndex: videoDepth.get(video),
          scale: 0,
          transformOrigin: "50% 50%"
        });
      });

      gsap.set(button, {
        opacity: 0,
        y: 20
      });

      document.documentElement.classList.add(
        "second-animation-ready"
      );

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(allWords(paragraphTwo), {
          opacity: 1,
          yPercent: 0
        });
        gsap.set(button, {
          opacity: 1,
          y: 0
        });
        return;
      }

      const timing = SECOND_CONFIG.timing;

      timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true
        }
      });

      animateLinesIn(paragraphOne, timing.paragraphOneIn);
      animateLinesOut(paragraphOne, timing.paragraphOneOut);

      [
        [videoOne, timing.videoOneIn],
        [videoTwo, timing.videoTwoIn],
        [videoThree, timing.videoThreeIn]
      ].forEach(function (item) {
        const video = item[0];
        const start = item[1];

        timeline.to(video, {
          y: stackedVideoY.get(video),
          scale: finalVideoScales.get(video),
          duration: timing.videoInDuration,
          ease: "power2.out"
        }, start);
      });

      [
        [videoThree, timing.videoThreeOut],
        [videoTwo, timing.videoTwoOut],
        [videoOne, timing.videoOneOut]
      ].forEach(function (item) {
        timeline.to(item[0], {
          scale: 0,
          duration: timing.videoOutDuration,
          ease: "power2.in"
        }, item[1]);
      });

      animateLinesIn(paragraphTwo, timing.paragraphTwoIn);

      timeline.to(button, {
        opacity: 1,
        y: 0,
        duration: SECOND_CONFIG.buttonDuration,
        ease: "power2.out"
      }, timing.buttonIn);

      timeline.to({}, {
        duration: Math.max(timing.end - timing.buttonIn, 0.01)
      }, timing.buttonIn);
    }

    function createPreviousSectionTransition() {
      if (
        !previousCancerTargets.length ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      gsap.to(previousCancerTargets, {
        scale: 1.15,
        transformOrigin: "50% 50%",
        ease: "none",
        stagger: {
          each: 0.002,
          from: "random"
        },
        scrollTrigger: {
          trigger: wrapper,
          start: "top bottom",
          end: "top top",
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
    }

    function handleResize() {
      const nextWidth = window.innerWidth;

      if (
        nextWidth <= 991 &&
        Math.abs(nextWidth - viewportWidth) < 2
      ) {
        return;
      }

      viewportWidth = nextWidth;
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(function () {
        createTimeline();
        ScrollTrigger.refresh();
      }, SECOND_CONFIG.resizeDebounce);
    }

    createTimeline();
    createPreviousSectionTransition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", function () {
      window.setTimeout(handleResize, 120);
    });
    ScrollTrigger.refresh();
  });
})();
