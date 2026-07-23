(function syncDynamicMobileViewport() {
  "use strict";

  const propertyName = "--imtx-viewport-height";
  let viewportTimer = null;

  function updateViewportHeight() {
    if (window.innerWidth > 991) {
      document.documentElement.style.removeProperty(propertyName);
      return;
    }

    const viewportHeight = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;

    if (!viewportHeight) {
      return;
    }

    document.documentElement.style.setProperty(
      propertyName,
      Math.ceil(viewportHeight) + "px"
    );
  }

  function queueViewportUpdate() {
    window.clearTimeout(viewportTimer);
    viewportTimer = window.setTimeout(updateViewportHeight, 30);
  }

  updateViewportHeight();
  window.addEventListener("resize", queueViewportUpdate, {
    passive: true
  });
  window.addEventListener("orientationchange", function () {
    window.setTimeout(updateViewportHeight, 120);
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener(
      "resize",
      queueViewportUpdate,
      { passive: true }
    );
  }
})();

/*==================================================
PRESS — PARENT STICKY, ALIGNEMENT GÉRÉ DANS WEBFLOW
==================================================*/

(function initPressStickyParent() {
  "use strict";

  const PRESS_CONFIG = {
    desktopQuery: "(min-width: 992px)",
    stickyTop: "0px"
  };

  window.addEventListener("load", function () {
    const parent = document.querySelector(".press__parent");
    const cards = [
      document.querySelector(".press__collection.is--one"),
      document.querySelector(".press__collection.is--two"),
      document.querySelector(".press__collection.is--three")
    ];

    if (!parent) {
      console.warn(
        "Press sticky : .press__parent est introuvable."
      );
      return;
    }

    if (cards.some(function (card) { return !card; })) {
      console.warn(
        "Press sticky : une ou plusieurs .press__collection sont absentes."
      );
      return;
    }

    const desktopMedia = window.matchMedia(
      PRESS_CONFIG.desktopQuery
    );

    function applyPressLayout() {
      /*
      Webflow est l'unique source de vérité pour la position
      des trois cartes. Aucun translate GSAP n'est conservé.
      */
      gsap.set(cards, {
        clearProps: "transform,willChange"
      });

      if (desktopMedia.matches) {
        parent.style.position = "sticky";
        parent.style.top = PRESS_CONFIG.stickyTop;
      } else {
        parent.style.removeProperty("position");
        parent.style.removeProperty("top");
      }

      ScrollTrigger.refresh();
    }

    applyPressLayout();

    if (typeof desktopMedia.addEventListener === "function") {
      desktopMedia.addEventListener("change", applyPressLayout);
    } else {
      desktopMedia.addListener(applyPressLayout);
    }
  });
})();

/*==================================================
DECODE — LOTTIE LIÉ AU SCROLL + 4 CARTES FLIP
==================================================*/

(function () {
  "use strict";

  const DECODE_CONFIG = {
    selectors: {
      wrapper: ".decode__wrapper",
      sticky: ".decode__sticky",
      lottie: ".decode__lottie",
      title: ".decode__p .decode__title",
      flipWrapper: ".flip__wrapper",
      flipBackground: ".flip__bg",
      cards: [
        ".flip.is--one",
        ".flip.is--two",
        ".flip.is--three",
        ".flip.is--four"
      ]
    },

    timing: {
      lottieStart: 0,
      lottieEnd: 0.46,
      titleIn: 0.08,
      titleOut: 0.52,
      wrapperIn: 0.47,
      wrapperInDuration: 0.055,
      backgroundIn: 0.47,
      backgroundInDuration: 0.18,
      backgroundRadiusStart: 0.60,
      backgroundOut: 0.805,
      backgroundOutDuration: 0.035,
      firstPairIn: 0.65,
      firstPairInDuration: 0.085,
      firstPairOut: 0.84,
      firstPairOutDuration: 0.07,
      secondPairIn: 0.90,
      secondPairInDuration: 0.085
    },

    text: {
      lineDuration: 0.055,
      lineStagger: 0.016,
      hiddenYPercent: 75
    },

    backgroundStartSquareRatio: 0.55,
    cardStagger: 0.018,
    cardTextFadeRatio: 0.65,
    resizeDebounce: 220,
    lottieLookupAttempts: 120,
    lottieLookupInterval: 50
  };

  window.addEventListener("load", function () {
    if (
      typeof window.gsap === "undefined" ||
      typeof window.ScrollTrigger === "undefined"
    ) {
      console.warn("Decode : GSAP ou ScrollTrigger est absent.");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const selectors = DECODE_CONFIG.selectors;
    const wrapper = document.querySelector(selectors.wrapper);

    if (!wrapper) {
      return;
    }

    const sticky = wrapper.querySelector(selectors.sticky);
    const lottieElement = wrapper.querySelector(selectors.lottie);
    const title = wrapper.querySelector(selectors.title);
    const flipWrapper = wrapper.querySelector(selectors.flipWrapper);
    const flipBackground = wrapper.querySelector(
      selectors.flipBackground
    );
    const cards = selectors.cards.map(function (selector) {
      return wrapper.querySelector(selector);
    });

    [
      [sticky, selectors.sticky],
      [lottieElement, selectors.lottie],
      [title, selectors.title],
      [flipWrapper, selectors.flipWrapper],
      [flipBackground, selectors.flipBackground]
    ].concat(
      cards.map(function (card, index) {
        return [card, selectors.cards[index]];
      })
    ).forEach(function (entry) {
      if (!entry[0]) {
        console.warn("Decode : élément absent — " + entry[1]);
      }
    });

    if (
      !sticky ||
      !lottieElement ||
      !title ||
      !flipWrapper ||
      !flipBackground ||
      cards.some(function (card) { return !card; })
    ) {
      return;
    }

    const cardTitles = cards.map(function (card) {
      return Array.from(card.querySelectorAll(".decode__title"));
    });
    const allCardTitles = cardTitles.reduce(function (all, titles) {
      return all.concat(titles);
    }, []);
    const originalTitleMarkup = title.innerHTML;
    const originalInlineStyles = new Map();

    [lottieElement, flipWrapper, flipBackground]
      .concat(cards, allCardTitles).forEach(
      function (element) {
        originalInlineStyles.set(
          element,
          element.getAttribute("style")
        );
      }
    );

    const lottieState = { progress: 0 };
    let lottieAnimation = null;
    let titleLines = [];
    let timeline = null;
    let resizeTimer = null;
    let viewportWidth = window.innerWidth;
    let lottieLookupCount = 0;

    function restoreInlineStyle(element) {
      const style = originalInlineStyles.get(element);

      if (style === null) {
        element.removeAttribute("style");
      } else {
        element.setAttribute("style", style);
      }
    }

    function getLottieRuntimes() {
      const runtimes = [];

      if (window.lottie) {
        runtimes.push(window.lottie);
      }

      if (window.Webflow && typeof window.Webflow.require === "function") {
        try {
          const module = window.Webflow.require("lottie");

          if (module && module.lottie) {
            runtimes.push(module.lottie);
          }
        } catch (error) {
          /* Le module Webflow n'est pas encore initialisé. */
        }
      }

      return runtimes;
    }

    function findLottieAnimation() {
      const runtimes = getLottieRuntimes();

      for (let runtimeIndex = 0;
        runtimeIndex < runtimes.length;
        runtimeIndex++) {
        const runtime = runtimes[runtimeIndex];
        const animations = typeof runtime.getRegisteredAnimations ===
          "function"
          ? runtime.getRegisteredAnimations()
          : [];

        const match = animations.find(function (animation) {
          const animationWrapper = animation.wrapper ||
            animation.container;

          return animationWrapper && (
            animationWrapper === lottieElement ||
            lottieElement.contains(animationWrapper) ||
            animationWrapper.contains(lottieElement)
          );
        });

        if (match) {
          return match;
        }
      }

      return null;
    }

    function renderLottieFrame() {
      if (!lottieAnimation) {
        lottieAnimation = findLottieAnimation();
      }

      if (!lottieAnimation) {
        return;
      }

      const frameCount = Math.max(
        Number(lottieAnimation.totalFrames) || 1,
        1
      );
      const frame = gsap.utils.clamp(
        0,
        frameCount - 1,
        lottieState.progress * (frameCount - 1)
      );

      if (typeof lottieAnimation.pause === "function") {
        lottieAnimation.pause();
      }

      if (typeof lottieAnimation.goToAndStop === "function") {
        lottieAnimation.goToAndStop(frame, true);
      }
    }

    function lockLottieToScroll() {
      lottieAnimation = findLottieAnimation();

      if (lottieAnimation) {
        renderLottieFrame();
        return;
      }

      lottieLookupCount += 1;

      if (lottieLookupCount < DECODE_CONFIG.lottieLookupAttempts) {
        window.setTimeout(
          lockLottieToScroll,
          DECODE_CONFIG.lottieLookupInterval
        );
      } else {
        console.warn(
          "Decode : impossible de récupérer l'instance du Lottie Webflow."
        );
      }
    }

    function splitTitleIntoLines() {
      title.innerHTML = originalTitleMarkup;

      const walker = document.createTreeWalker(
        title,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function (node) {
            return node.nodeValue && node.nodeValue.trim()
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          }
        }
      );
      const textNodes = [];
      let node = walker.nextNode();

      while (node) {
        textNodes.push(node);
        node = walker.nextNode();
      }

      textNodes.forEach(function (textNode) {
        const fragment = document.createDocumentFragment();
        const pieces = textNode.nodeValue.match(/\s+|[^\s]+/g) || [];

        pieces.forEach(function (piece) {
          if (/^\s+$/.test(piece)) {
            fragment.appendChild(document.createTextNode("\u200B"));
            return;
          }

          const word = document.createElement("span");
          word.className = "decode-split-word";
          word.textContent = piece;
          fragment.appendChild(word);
        });

        textNode.parentNode.replaceChild(fragment, textNode);
      });

      const groups = [];

      Array.from(title.querySelectorAll(".decode-split-word"))
        .forEach(function (word) {
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

      titleLines = groups.map(function (group) {
        return group.words;
      });
    }

    function allTitleWords() {
      return titleLines.reduce(function (words, line) {
        return words.concat(line);
      }, []);
    }

    function animateTitleIn(start) {
      titleLines.forEach(function (line, index) {
        timeline.to(line, {
          opacity: 1,
          yPercent: 0,
          duration: DECODE_CONFIG.text.lineDuration
        }, start + index * DECODE_CONFIG.text.lineStagger);
      });
    }

    function animateTitleOut(start) {
      titleLines.forEach(function (line, index) {
        timeline.to(line, {
          opacity: 0,
          yPercent: -DECODE_CONFIG.text.hiddenYPercent,
          duration: DECODE_CONFIG.text.lineDuration
        }, start + index * DECODE_CONFIG.text.lineStagger);
      });
    }

    function restoreWebflowState() {
      [lottieElement, flipWrapper, flipBackground]
        .concat(cards, allCardTitles).forEach(
        restoreInlineStyle
      );
      splitTitleIntoLines();
    }

    function createTimeline() {
      if (timeline) {
        if (timeline.scrollTrigger) {
          timeline.scrollTrigger.kill();
        }
        timeline.kill();
      }

      document.documentElement.classList.remove(
        "decode-animation-ready"
      );
      restoreWebflowState();

      const finalBackgroundRadius = window.getComputedStyle(
        flipBackground
      ).borderRadius;
      const backgroundBounds = flipBackground.getBoundingClientRect();
      const fallbackBounds = sticky.getBoundingClientRect();
      const backgroundWidth = backgroundBounds.width ||
        fallbackBounds.width;
      const backgroundHeight = backgroundBounds.height ||
        fallbackBounds.height;
      const backgroundSquareSize = Math.min(
        backgroundWidth,
        backgroundHeight
      ) * DECODE_CONFIG.backgroundStartSquareRatio;
      const backgroundClipX = Math.max(
        (backgroundWidth - backgroundSquareSize) / 2,
        0
      );
      const backgroundClipY = Math.max(
        (backgroundHeight - backgroundSquareSize) / 2,
        0
      );
      const backgroundSquareClipPath =
        "inset(" + backgroundClipY + "px " +
        backgroundClipX + "px round 0px)";
      const backgroundFinalClipPath =
        "inset(0px 0px round " + finalBackgroundRadius + ")";
      const firstPair = [cards[0], cards[1]];
      const secondPair = [cards[2], cards[3]];

      gsap.set(allTitleWords(), {
        opacity: 0,
        yPercent: DECODE_CONFIG.text.hiddenYPercent
      });
      gsap.set(lottieElement, { opacity: 1 });
      gsap.set(flipWrapper, { opacity: 0 });
      gsap.set(flipBackground, {
        opacity: 1,
        scale: 0,
        borderRadius: "0px",
        clipPath: backgroundSquareClipPath,
        WebkitClipPath: backgroundSquareClipPath,
        transformOrigin: "50% 50%"
      });
      gsap.set(firstPair, {
        opacity: 0,
        visibility: "hidden",
        rotationY: 0,
        transformPerspective: 1200,
        transformOrigin: "50% 50%"
      });
      gsap.set(secondPair, {
        opacity: 0,
        visibility: "hidden",
        rotationY: 90,
        transformPerspective: 1200,
        transformOrigin: "50% 50%"
      });
      gsap.set(allCardTitles, { opacity: 0 });

      lottieState.progress = 0;
      renderLottieFrame();
      document.documentElement.classList.add(
        "decode-animation-ready"
      );

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        lottieState.progress = 1;
        renderLottieFrame();
        gsap.set(lottieElement, { opacity: 0 });
        gsap.set(allTitleWords(), { opacity: 0, yPercent: 0 });
        gsap.set(flipWrapper, { opacity: 1 });
        gsap.set(flipBackground, {
          opacity: 0,
          scale: 1,
          clipPath: backgroundFinalClipPath,
          WebkitClipPath: backgroundFinalClipPath
        });
        gsap.set(firstPair, {
          opacity: 0,
          rotationY: -90,
          visibility: "hidden"
        });
        gsap.set(secondPair, {
          opacity: 1,
          rotationY: 0,
          visibility: "visible"
        });
        gsap.set(
          cardTitles[2].concat(cardTitles[3]),
          { opacity: 1 }
        );
        return;
      }

      const timing = DECODE_CONFIG.timing;

      timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrapper,
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: renderLottieFrame
        }
      });

      timeline.to(lottieState, {
        progress: 1,
        duration: timing.lottieEnd - timing.lottieStart,
        onUpdate: renderLottieFrame
      }, timing.lottieStart);

      animateTitleIn(timing.titleIn);
      animateTitleOut(timing.titleOut);

      timeline.to(flipWrapper, {
        opacity: 1,
        duration: timing.wrapperInDuration
      }, timing.wrapperIn);

      timeline.to(flipBackground, {
        scale: 1,
        duration: timing.backgroundInDuration
      }, timing.backgroundIn);

      timeline.to(flipBackground, {
        clipPath: backgroundFinalClipPath,
        WebkitClipPath: backgroundFinalClipPath,
        duration:
          timing.backgroundIn + timing.backgroundInDuration -
          timing.backgroundRadiusStart
      }, timing.backgroundRadiusStart);

      timeline.to(flipBackground, {
        opacity: 0,
        duration: timing.backgroundOutDuration
      }, timing.backgroundOut);

      timeline.to(lottieElement, {
        opacity: 0,
        duration: timing.backgroundOutDuration
      }, timing.backgroundOut);

      firstPair.forEach(function (card, index) {
        const cardStart = timing.firstPairIn +
          index * DECODE_CONFIG.cardStagger;

        timeline.set(card, {
          visibility: "visible"
        }, cardStart);

        timeline.to(card, {
          opacity: 1,
          duration: timing.firstPairInDuration,
          ease: "power1.out"
        }, cardStart);

        timeline.to(cardTitles[index], {
          opacity: 1,
          duration:
            timing.firstPairInDuration *
            DECODE_CONFIG.cardTextFadeRatio,
          ease: "power1.out"
        }, cardStart + timing.firstPairInDuration *
          (1 - DECODE_CONFIG.cardTextFadeRatio));
      });

      firstPair.forEach(function (card, index) {
        const cardStart = timing.firstPairOut +
          index * DECODE_CONFIG.cardStagger;

        timeline.to(cardTitles[index], {
          opacity: 0,
          duration:
            timing.firstPairOutDuration *
            DECODE_CONFIG.cardTextFadeRatio,
          ease: "power1.in"
        }, cardStart);

        timeline.to(card, {
          opacity: 0,
          rotationY: -90,
          duration: timing.firstPairOutDuration,
          ease: "power2.in"
        }, cardStart);

        timeline.set(card, {
          visibility: "hidden"
        }, cardStart + timing.firstPairOutDuration);
      });

      secondPair.forEach(function (card, index) {
        const cardStart = timing.secondPairIn +
          index * DECODE_CONFIG.cardStagger;

        timeline.set(card, {
          visibility: "visible"
        }, cardStart);

        timeline.to(card, {
          opacity: 1,
          rotationY: 0,
          duration: timing.secondPairInDuration,
          ease: "power2.out"
        }, cardStart);

        timeline.to(cardTitles[index + 2], {
          opacity: 1,
          duration:
            timing.secondPairInDuration *
            DECODE_CONFIG.cardTextFadeRatio,
          ease: "power1.out"
        }, cardStart + timing.secondPairInDuration *
          (1 - DECODE_CONFIG.cardTextFadeRatio));
      });

      timeline.to({}, { duration: 0.97 }, 0);
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
      }, DECODE_CONFIG.resizeDebounce);
    }

    createTimeline();
    lockLottieToScroll();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", function () {
      window.setTimeout(handleResize, 120);
    });
    ScrollTrigger.refresh();
  });
})();

/*==================================================
FINAL — 3 TITRES + ORBITE DES 8 VIDÉOS
==================================================*/

(function () {
  "use strict";

  const FINAL_CONFIG = {
    selectors: {
      wrapper: ".final__wrapper",
      sticky: ".final__sticky",
      content: ".final__content",
      images: ".final__images",
      titles: [
        ".final__title.is--one",
        ".final__title.is--two",
        ".final__title.is--three"
      ],
      videos: [
        ".final__bg-video.is--one",
        ".final__bg-video.is--two",
        ".final__bg-video.is--three",
        ".final__bg-video.is--four",
        ".final__bg-video.is--five",
        ".final__bg-video.is--six",
        ".final__bg-video.is--seven",
        ".final__bg-video.is--eight"
      ]
    },

    timing: {
      titleOneIn: 0.015,
      mediaInStart: 0.02,
      mediaInLatestStart: 0.12,
      mediaInDurationMin: 0.15,
      mediaInDurationMax: 0.22,
      orbitStart: 0.18,
      orbitEnd: 1,
      titleOneOut: 0.32,
      titleTwoIn: 0.35,
      titleTwoMoveStart: 0.44,
      titleTwoMoveDuration: 0.44,
      titleThreeRevealDuration: 0.07,
      orbitLiftDuration: 0.44
    },

    orbitTurns: 0.4,
    startAngle: -90,
    circleRadius: {
      desktop: 0.65,
      tablet: 0.66,
      mobile: 0.73
    },
    entranceScale: 0.72,
    outsideMarginDesktop: 80,
    outsideMarginMobile: 36,
    orbitLift: {
      desktop: 0.38,
      tablet: 0.34,
      mobile: 0.18
    },

    text: {
      lineDuration: 0.05,
      lineStagger: 0.014,
      hiddenYPercent: 70
    },

    resizeDebounce: 240
  };

  window.addEventListener("load", function () {
    if (
      typeof window.gsap === "undefined" ||
      typeof window.ScrollTrigger === "undefined"
    ) {
      console.warn("Final : GSAP ou ScrollTrigger est absent.");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const selectors = FINAL_CONFIG.selectors;
    const wrapper = document.querySelector(selectors.wrapper);

    if (!wrapper) {
      return;
    }

    const sticky = wrapper.querySelector(selectors.sticky);
    const content = wrapper.querySelector(selectors.content);
    const images = wrapper.querySelector(selectors.images);
    const titles = selectors.titles.map(function (selector) {
      return wrapper.querySelector(selector);
    });
    const videos = selectors.videos.map(function (selector) {
      return wrapper.querySelector(selector);
    });

    [
      [sticky, selectors.sticky],
      [content, selectors.content],
      [images, selectors.images]
    ].concat(
      titles.map(function (element, index) {
        return [element, selectors.titles[index]];
      }),
      videos.map(function (element, index) {
        return [element, selectors.videos[index]];
      })
    ).forEach(function (entry) {
      if (!entry[0]) {
        console.warn("Final : élément absent — " + entry[1]);
      }
    });

    if (
      !sticky ||
      !content ||
      !images ||
      titles.some(function (title) { return !title; }) ||
      videos.some(function (video) { return !video; })
    ) {
      return;
    }

    const originalTitleMarkup = new Map();
    const originalTitleStyles = new Map();
    const originalVideoStyles = new Map();

    titles.forEach(function (title) {
      originalTitleMarkup.set(title, title.innerHTML);
      originalTitleStyles.set(title, title.getAttribute("style"));
    });

    videos.forEach(function (video) {
      originalVideoStyles.set(video, video.getAttribute("style"));
    });

    const arrivalStates = videos.map(function () {
      return { value: 0 };
    });
    const orbitState = { angle: 0, offsetY: 0 };

    let titleLines = new Map();
    let videoMeasurements = [];
    let timeline = null;
    let exitOrbitTrigger = null;
    let resizeTimer = null;
    let viewportWidth = window.innerWidth;

    function deterministic(index, minimum, maximum, salt) {
      const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) *
        43758.5453;
      const normalized = value - Math.floor(value);
      return minimum + (maximum - minimum) * normalized;
    }

    function restoreInlineStyle(element, originalStyle) {
      if (originalStyle === null) {
        element.removeAttribute("style");
      } else {
        element.setAttribute("style", originalStyle);
      }
    }

    function splitTitleIntoLines(title) {
      title.innerHTML = originalTitleMarkup.get(title);

      const walker = document.createTreeWalker(
        title,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function (node) {
            return node.nodeValue && node.nodeValue.trim()
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          }
        }
      );
      const textNodes = [];
      let currentNode = walker.nextNode();

      while (currentNode) {
        textNodes.push(currentNode);
        currentNode = walker.nextNode();
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
          word.className = "final-split-word";
          word.textContent = piece;
          fragment.appendChild(word);
        });

        node.parentNode.replaceChild(fragment, node);
      });

      const groups = [];
      Array.from(title.querySelectorAll(".final-split-word"))
        .forEach(function (word) {
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
      titles.forEach(function (title) {
        titleLines.set(title, splitTitleIntoLines(title));
      });
    }

    function flattenLines(title) {
      return (titleLines.get(title) || []).reduce(
        function (words, line) {
          return words.concat(line);
        },
        []
      );
    }

    function animateLinesIn(title, start) {
      (titleLines.get(title) || []).forEach(function (line, index) {
        timeline.to(line, {
          opacity: 1,
          yPercent: 0,
          duration: FINAL_CONFIG.text.lineDuration
        }, start + index * FINAL_CONFIG.text.lineStagger);
      });
    }

    function animateLinesInOverRange(title, start, end) {
      const lines = titleLines.get(title) || [];

      if (!lines.length) {
        return;
      }

      const range = Math.max(end - start, 0.01);
      const overlapRatio = 0.65;
      const lineDuration = range /
        (1 + Math.max(lines.length - 1, 0) * overlapRatio);
      const lineStagger = lineDuration * overlapRatio;

      lines.forEach(function (line, index) {
        timeline.to(line, {
          opacity: 1,
          yPercent: 0,
          duration: lineDuration
        }, start + index * lineStagger);
      });
    }

    function animateLinesOut(title, start) {
      (titleLines.get(title) || []).forEach(function (line, index) {
        timeline.to(line, {
          opacity: 0,
          yPercent: -FINAL_CONFIG.text.hiddenYPercent,
          duration: FINAL_CONFIG.text.lineDuration
        }, start + index * FINAL_CONFIG.text.lineStagger);
      });
    }

    function measureVideos() {
      const contentRectangle = content.getBoundingClientRect();
      const halfWidth = contentRectangle.width / 2;
      const halfHeight = contentRectangle.height / 2;
      const radiusFactor = window.innerWidth <= 767
        ? FINAL_CONFIG.circleRadius.mobile
        : window.innerWidth <= 991
          ? FINAL_CONFIG.circleRadius.tablet
          : FINAL_CONFIG.circleRadius.desktop;
      const circleRadius = Math.min(
        contentRectangle.width,
        contentRectangle.height
      ) * radiusFactor;
      const outsideMargin = window.innerWidth <= 767
        ? FINAL_CONFIG.outsideMarginMobile
        : FINAL_CONFIG.outsideMarginDesktop;

      videoMeasurements = videos.map(function (video, index) {
        const rectangle = video.getBoundingClientRect();
        const angle = (
          FINAL_CONFIG.startAngle + index * 360 / videos.length
        ) * Math.PI / 180;
        const finalX = Math.cos(angle) * circleRadius;
        const finalY = Math.sin(angle) * circleRadius;
        const length = Math.hypot(finalX, finalY);
        const directionX = length > 1
          ? finalX / length
          : Math.cos(angle);
        const directionY = length > 1
          ? finalY / length
          : Math.sin(angle);
        const horizontalBoundary = Math.abs(directionX) > 0.001
          ? (halfWidth + rectangle.width / 2 + outsideMargin) /
            Math.abs(directionX)
          : Number.POSITIVE_INFINITY;
        const verticalBoundary = Math.abs(directionY) > 0.001
          ? (halfHeight + rectangle.height / 2 + outsideMargin) /
            Math.abs(directionY)
          : Number.POSITIVE_INFINITY;
        const outsideRadius = Math.min(
          horizontalBoundary,
          verticalBoundary
        );
        const entranceDistance = Math.max(outsideRadius - length, 0);

        return {
          finalX: finalX,
          finalY: finalY,
          entranceX: directionX * entranceDistance,
          entranceY: directionY * entranceDistance,
          baseRotation: Number(gsap.getProperty(video, "rotation")) || 0,
          finalScale: Number(gsap.getProperty(video, "scaleX")) || 1
        };
      });
    }

    function positionVideos() {
      const radians = orbitState.angle * Math.PI / 180;
      const cosine = Math.cos(radians);
      const sine = Math.sin(radians);

      videos.forEach(function (video, index) {
        const measurement = videoMeasurements[index];
        const reveal = arrivalStates[index].value;

        if (!measurement) {
          return;
        }

        const rotatedX =
          measurement.finalX * cosine - measurement.finalY * sine;
        const rotatedY =
          measurement.finalX * sine + measurement.finalY * cosine;
        const orbitX = rotatedX - measurement.finalX;
        const orbitY = rotatedY - measurement.finalY;

        gsap.set(video, {
          xPercent: -50,
          yPercent: -50,
          x: measurement.finalX +
            orbitX + measurement.entranceX * (1 - reveal),
          y: measurement.finalY +
            orbitY + measurement.entranceY * (1 - reveal) +
            orbitState.offsetY,
          scale: measurement.finalScale * gsap.utils.interpolate(
            FINAL_CONFIG.entranceScale,
            1,
            reveal
          ),
          rotation: measurement.baseRotation,
          visibility: reveal > 0.001 ? "visible" : "hidden",
          transformOrigin: "50% 50%"
        });
      });
    }

    function getTitleEnd(title, start) {
      const lineCount = (titleLines.get(title) || []).length;
      return start + Math.max(lineCount - 1, 0) *
        FINAL_CONFIG.text.lineStagger +
        FINAL_CONFIG.text.lineDuration;
    }

    function createTimeline() {
      document.documentElement.classList.remove("final-animation-ready");

      if (timeline) {
        if (timeline.scrollTrigger) {
          timeline.scrollTrigger.kill();
        }
        timeline.kill();
      }

      if (exitOrbitTrigger) {
        exitOrbitTrigger.kill();
        exitOrbitTrigger = null;
      }

      videos.forEach(function (video) {
        restoreInlineStyle(video, originalVideoStyles.get(video));
      });
      titles.forEach(function (title) {
        restoreInlineStyle(title, originalTitleStyles.get(title));
      });
      rebuildTitleLines();
      measureVideos();

      const contentRectangle = content.getBoundingClientRect();
      const titleTwoRectangle = titles[1].getBoundingClientRect();
      const titleOneFontSize = parseFloat(
        window.getComputedStyle(titles[0]).fontSize
      ) || 1;
      const titleTwoFontSize = parseFloat(
        window.getComputedStyle(titles[1]).fontSize
      ) || titleOneFontSize;
      const titleTwoFinalX = Number(
        gsap.getProperty(titles[1], "x")
      ) || 0;
      const titleTwoFinalY = Number(
        gsap.getProperty(titles[1], "y")
      ) || 0;
      const titleTwoFinalScale = Number(
        gsap.getProperty(titles[1], "scaleX")
      ) || 1;
      const titleTwoInitialScale = titleTwoFinalScale *
        titleOneFontSize / titleTwoFontSize;
      const titleTwoInitialX = titleTwoFinalX +
        contentRectangle.left + contentRectangle.width / 2 -
        (titleTwoRectangle.left + titleTwoRectangle.width / 2);
      const titleTwoInitialY = titleTwoFinalY +
        contentRectangle.top + contentRectangle.height / 2 -
        (titleTwoRectangle.top + titleTwoRectangle.height / 2);
      const orbitLiftFactor = window.innerWidth <= 767
        ? FINAL_CONFIG.orbitLift.mobile
        : window.innerWidth <= 991
          ? FINAL_CONFIG.orbitLift.tablet
          : FINAL_CONFIG.orbitLift.desktop;
      const finalOrbitLift = -contentRectangle.height * orbitLiftFactor;

      arrivalStates.forEach(function (state) {
        state.value = 0;
      });
      orbitState.angle = 0;
      orbitState.offsetY = 0;

      titles.forEach(function (title) {
        gsap.set(flattenLines(title), {
          opacity: 0,
          yPercent: FINAL_CONFIG.text.hiddenYPercent
        });
      });
      gsap.set(titles[1], {
        x: titleTwoInitialX,
        y: titleTwoInitialY,
        scale: titleTwoInitialScale,
        transformOrigin: "50% 50%"
      });
      positionVideos();

      document.documentElement.classList.add("final-animation-ready");

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        arrivalStates.forEach(function (state) {
          state.value = 1;
        });
        orbitState.offsetY = finalOrbitLift;
        positionVideos();
        gsap.set(titles[1], {
          x: titleTwoFinalX,
          y: titleTwoFinalY,
          scale: titleTwoFinalScale
        });
        gsap.set(
          flattenLines(titles[1]).concat(flattenLines(titles[2])),
          {
          opacity: 1,
          yPercent: 0
          }
        );
        return;
      }

      const timing = FINAL_CONFIG.timing;
      const titleOneEnd = getTitleEnd(titles[0], timing.titleOneOut);
      const titleTwoStart = timing.titleTwoIn;
      const titleTwoRevealEnd = getTitleEnd(
        titles[1],
        timing.titleTwoIn
      );
      const titleTwoMoveStart = Math.max(
        timing.titleTwoMoveStart,
        titleTwoRevealEnd + 0.01
      );
      const titleTwoMoveEnd =
        titleTwoMoveStart + timing.titleTwoMoveDuration;
      const titleThreeStart = Math.min(
        titleTwoMoveEnd + 0.01,
        timing.orbitEnd - timing.titleThreeRevealDuration
      );
      const titleThreeEnd = Math.min(
        titleThreeStart + timing.titleThreeRevealDuration,
        timing.orbitEnd
      );
      function syncTitleVisibility(progress) {
        titles[0].style.visibility = progress <= titleOneEnd
          ? "visible"
          : "hidden";
        titles[1].style.visibility =
          progress >= titleTwoStart - 0.001
            ? "visible"
            : "hidden";
        titles[2].style.visibility = progress >= titleThreeStart - 0.001
          ? "visible"
          : "hidden";
      }

      timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrapper,
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            syncTitleVisibility(self.progress);
          },
          onRefresh: function (self) {
            positionVideos();
            syncTitleVisibility(self.progress);
          }
        }
      });

      animateLinesIn(titles[0], timing.titleOneIn);

      videos.forEach(function (video, index) {
        const start = deterministic(
          index,
          timing.mediaInStart,
          timing.mediaInLatestStart,
          5
        );
        const duration = deterministic(
          index,
          timing.mediaInDurationMin,
          timing.mediaInDurationMax,
          9
        );

        timeline.to(arrivalStates[index], {
          value: 1,
          duration: duration,
          ease: "power2.out",
          onUpdate: positionVideos
        }, start);
      });

      timeline.to(orbitState, {
        angle: 360 * FINAL_CONFIG.orbitTurns,
        duration: timing.orbitEnd - timing.orbitStart,
        onUpdate: positionVideos
      }, timing.orbitStart);

      animateLinesOut(titles[0], timing.titleOneOut);
      animateLinesIn(titles[1], timing.titleTwoIn);

      timeline.to(titles[1], {
        x: titleTwoFinalX,
        y: titleTwoFinalY,
        scale: titleTwoFinalScale,
        duration: timing.titleTwoMoveDuration,
        ease: "power2.inOut"
      }, titleTwoMoveStart);

      animateLinesInOverRange(
        titles[2],
        titleThreeStart,
        titleThreeEnd
      );

      timeline.to(orbitState, {
        offsetY: finalOrbitLift,
        duration: timing.orbitLiftDuration,
        ease: "power2.inOut",
        onUpdate: positionVideos
      }, titleTwoMoveStart);

      timeline.to({}, {
        duration: Math.max(timing.orbitEnd - titleThreeStart, 0.01)
      }, titleThreeStart);

      const orbitEndAngle = 360 * FINAL_CONFIG.orbitTurns;
      const mainOrbitScrollDistance = Math.max(
        wrapper.getBoundingClientRect().height *
          (timing.orbitEnd - timing.orbitStart),
        window.innerHeight
      );
      const exitOrbitAngle = orbitEndAngle *
        window.innerHeight / mainOrbitScrollDistance;

      /*
      La timeline principale se termine quand le bas du wrapper atteint le
      bas du viewport. Cette seconde plage prolonge uniquement la révolution
      jusqu'à la sortie complète du wrapper, sans étirer les titres.
      */
      exitOrbitTrigger = ScrollTrigger.create({
        trigger: wrapper,
        start: "bottom bottom",
        end: "bottom top",
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          if (self.progress <= 0) {
            return;
          }

          orbitState.angle = orbitEndAngle +
            exitOrbitAngle * self.progress;
          positionVideos();
        },
        onRefresh: function (self) {
          if (self.progress <= 0) {
            return;
          }

          orbitState.angle = orbitEndAngle +
            exitOrbitAngle * self.progress;
          positionVideos();
        }
      });

      syncTitleVisibility(
        timeline.scrollTrigger ? timeline.scrollTrigger.progress : 0
      );
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
      }, FINAL_CONFIG.resizeDebounce);
    }

    createTimeline();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", function () {
      window.setTimeout(handleResize, 120);
    });
    ScrollTrigger.refresh();
  });
})();

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
      durationMax: 0.13,
      mobileVisibilityStart: 0.22,
      mobileVisibilityFull: 0.58
    },

    text: {
      oldPanelY: -56,
      oldPanelFadeDelayRatio: 0.32,
      oldPanelFadeDurationRatio: 0.68,
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
    Cette séquence commence pendant la disparition des 13 cellules.
    Les valeurs supérieures à 1 prolongent volontairement la timeline.
    */
    targetSequence: {
      mainOneIn: 0.91,
      mainTwoIn: 0.94,

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

      lottieOutStart: 1.70,
      lottieOutEnd: 1.80,

      lottieFrameStart: 1.22,
      lottieFrameEnd: 1.70,
      lottieLookupAttempts: 120,
      lottieLookupInterval: 50,

      end: 2.62,
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
      originX: 0.5,
      originY: 0,
      horizontalWeight: 1,
      verticalWeight: 1,
      waveDuration: 1050,
      randomDelay: 70,
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
        margin: 0,
        left: left,
        top: top,
        right: "auto",
        bottom: "auto",
        width: alignedCardWidth,
        height: alignedCardHeight,
        x: 0,
        xPercent: 0,
        y: 0,
        yPercent: 0
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
      wrapper.classList.add("is--grid-ready");
      document.documentElement.classList.add("hero-grid-mounted");
      return buildPermanentGrid;
    }

    const animatedTiles = createAnimatedTiles();

    /*
    On attend deux frames avant de retirer le fond noir de sécurité. La
    première laisse le navigateur calculer la grille, la seconde garantit que
    les faces noires ont été peintes avant que la vidéo redevienne visible.
    */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        window.setTimeout(function () {
          wrapper.classList.add("is--grid-ready");
          document.documentElement.classList.add("hero-grid-mounted");
        }, 60);
      });
    });
    const settings = getGridSettings();
    const waveTiles = animatedTiles.map(function (tile, index) {
      const row = Math.floor(index / settings.columns);
      const column = index % settings.columns;
      const normalizedX =
        ((column + 0.5) / settings.columns - CONFIG.tiles.originX) *
        2 * CONFIG.tiles.horizontalWeight;
      const normalizedY =
        ((row + 0.5) / settings.rows - CONFIG.tiles.originY) *
        CONFIG.tiles.verticalWeight;

      return {
        tile: tile,
        distance: Math.hypot(normalizedX, normalizedY)
      };
    });
    const maximumDistance = waveTiles.length
      ? Math.max.apply(
          null,
          waveTiles.map(function (entry) {
            return entry.distance;
          })
        )
      : 1;

    waveTiles.forEach(function (entry) {
      const delay = CONFIG.tiles.startDelay +
        entry.distance / maximumDistance * CONFIG.tiles.waveDuration +
        Math.random() * CONFIG.tiles.randomDelay;

      window.setTimeout(function () {
        entry.tile.animate(
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
      CONFIG.tiles.waveDuration +
      CONFIG.tiles.randomDelay +
      CONFIG.tiles.flipDuration;

    window.setTimeout(function () {
      if (animatedGrid.isConnected) {
        animatedGrid.remove();
      }
    }, totalDuration + CONFIG.tiles.removeDelay);

    return buildPermanentGrid;
  }

  function mountHeroTileGrid() {
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
  }

  /*
  Le fichier peut être chargé en async depuis Webflow.
  Dans ce cas, DOMContentLoaded peut déjà être passé :
  on initialise alors la grille immédiatement.
  */
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      mountHeroTileGrid,
      { once: true }
    );
  } else {
    mountHeroTileGrid();
  }

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
    const targetLottieState = { progress: 0 };
    let targetLottieAnimation = null;
    let targetLottieLookupCount = 0;

    function getTargetLottieRuntimes() {
      const runtimes = [];

      if (window.lottie) {
        runtimes.push(window.lottie);
      }

      if (window.Webflow && typeof window.Webflow.require === "function") {
        try {
          const module = window.Webflow.require("lottie");

          if (module && module.lottie) {
            runtimes.push(module.lottie);
          }
        } catch (error) {
          /* Le module Webflow Lottie n'est pas encore initialisé. */
        }
      }

      return runtimes;
    }

    function findTargetLottieAnimation() {
      if (!targetLottie) {
        return null;
      }

      const runtimes = getTargetLottieRuntimes();

      for (let runtimeIndex = 0;
        runtimeIndex < runtimes.length;
        runtimeIndex += 1) {
        const runtime = runtimes[runtimeIndex];
        const animations = typeof runtime.getRegisteredAnimations ===
          "function"
          ? runtime.getRegisteredAnimations()
          : [];
        const match = animations.find(function (animation) {
          const animationWrapper = animation.wrapper || animation.container;

          return animationWrapper && (
            animationWrapper === targetLottie ||
            targetLottie.contains(animationWrapper) ||
            animationWrapper.contains(targetLottie)
          );
        });

        if (match) {
          return match;
        }
      }

      return null;
    }

    function renderTargetLottieFrame() {
      if (!targetLottieAnimation) {
        targetLottieAnimation = findTargetLottieAnimation();
      }

      if (!targetLottieAnimation) {
        return;
      }

      const frameCount = Math.max(
        Number(targetLottieAnimation.totalFrames) || 1,
        1
      );
      const frame = gsap.utils.clamp(
        0,
        frameCount - 1,
        targetLottieState.progress * (frameCount - 1)
      );

      if (typeof targetLottieAnimation.pause === "function") {
        targetLottieAnimation.pause();
      }

      if (typeof targetLottieAnimation.goToAndStop === "function") {
        targetLottieAnimation.goToAndStop(frame, true);
      }
    }

    function lockTargetLottieToScroll() {
      if (!targetLottie) {
        return;
      }

      targetLottieAnimation = findTargetLottieAnimation();

      if (targetLottieAnimation) {
        renderTargetLottieFrame();
        return;
      }

      targetLottieLookupCount += 1;

      if (
        targetLottieLookupCount <
        CONFIG.targetSequence.lottieLookupAttempts
      ) {
        window.setTimeout(
          lockTargetLottieToScroll,
          CONFIG.targetSequence.lottieLookupInterval
        );
      } else {
        console.warn(
          "Hero target : impossible de récupérer l'instance du Lottie Webflow."
        );
      }
    }

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
        let entranceOpacity = 1;

        /*
        Sur mobile, une vidéo orbitale qui entre depuis un bord peut laisser
        apparaître une tranche de quelques pixels. Tant que son entrée n'est
        pas terminée, on calcule la portion réellement présente dans le hero
        et on ne la révèle qu'une fois suffisamment engagée dans le cadre.
        */
        if (window.innerWidth <= 767 && reveal < 0.999 && scale > 0) {
          const itemWidth = item.offsetWidth * scale;
          const itemHeight = item.offsetHeight * scale;
          const centerX = bounds.width / 2 + x;
          const centerY = bounds.height / 2 + y;
          const visibleWidth = Math.max(
            Math.min(centerX + itemWidth / 2, bounds.width) -
              Math.max(centerX - itemWidth / 2, 0),
            0
          );
          const visibleHeight = Math.max(
            Math.min(centerY + itemHeight / 2, bounds.height) -
              Math.max(centerY - itemHeight / 2, 0),
            0
          );
          const visibleRatio = Math.min(
            itemWidth ? visibleWidth / itemWidth : 0,
            itemHeight ? visibleHeight / itemHeight : 0
          );

          entranceOpacity = gsap.utils.clamp(
            0,
            1,
            (
              visibleRatio -
              CONFIG.imageEntrance.mobileVisibilityStart
            ) /
              (
                CONFIG.imageEntrance.mobileVisibilityFull -
                CONFIG.imageEntrance.mobileVisibilityStart
              )
          );
        }

        gsap.set(item, {
          xPercent: -50,
          yPercent: -50,
          x: x,
          y: y,
          scale: scale,
          opacity: entranceOpacity,
          visibility:
            reveal > 0.001 &&
            mediaExit[index + 1].value > 0.001 &&
            entranceOpacity > 0.001
              ? "visible"
              : "hidden",
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
      targetLottieState.progress = 0;
      renderTargetLottieFrame();

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
        targetLottieState.progress = 1;
        renderTargetLottieFrame();
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

      if (oldTextCard) {
        const oldTextDuration =
          scroll.oldTextEnd - scroll.oldTextStart;

        timeline.to(oldTextCard, {
          y: CONFIG.text.oldPanelY,
          duration: oldTextDuration,
          force3D: true
        }, scroll.oldTextStart);

        timeline.to(oldTextCard, {
          opacity: 0,
          duration:
            oldTextDuration *
            CONFIG.text.oldPanelFadeDurationRatio
        },
        scroll.oldTextStart +
          oldTextDuration *
          CONFIG.text.oldPanelFadeDelayRatio);
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
      SÉQUENCE TARGET — PENDANT LA SORTIE DES 13 CELLULES
      ================================================*/

      const targetTiming = CONFIG.targetSequence;

      if (targetLottie) {
        timeline.to(targetLottieState, {
          progress: 1,
          duration:
            targetTiming.lottieFrameEnd -
            targetTiming.lottieFrameStart,
          onUpdate: renderTargetLottieFrame
        }, targetTiming.lottieFrameStart);
      }

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

      /*
      Maintient le second paragraphe visible jusqu’à l’arrivée de la
      section suivante. Sa sortie est pilotée par le parallaxe ci-dessous.
      */
      timeline.to({}, {
        duration: 0.01
      }, targetTiming.end);
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
    lockTargetLottieToScroll();
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

/*==================================================
PIPELINE — GÉNÉRATION RESPONSIVE DES TUILES CARRÉES
==================================================*/

(function () {
  "use strict";

  const PIPELINE_GRID_CONFIG = {
    selectors: {
      wrapper: ".pipeline__wrapper",
      stage: ".pipeline__stage",
      tiles: ".pipeline__tiles",
      content: ".pipeline__content",
      items: [
        ".pipeline__item.is--one",
        ".pipeline__item.is--two",
        ".pipeline__item.is--three",
        ".pipeline__item.is--four"
      ]
    },

    desktop: {
      tileViewportRatio: 0.072,
      tileMin: 64,
      tileMax: 92,
      gap: 3,
      radius: 9,
      exclusionPadding: 18,
      cardCleanupPaddingRatio: 0.42,
      decorativeRevealRate: 0.075,
      reshuffleOutRate: 0.09,
      protrudingTilePositions: [0.62]
    },

    tablet: {
      tileViewportRatio: 0.09,
      tileMin: 56,
      tileMax: 74,
      gap: 3,
      radius: 8,
      exclusionPadding: 15,
      cardCleanupPaddingRatio: 0.42,
      decorativeRevealRate: 0.07,
      reshuffleOutRate: 0.085,
      protrudingTilePositions: [0.62]
    },

    mobile: {
      tileViewportRatio: 0.14,
      tileMin: 42,
      tileMax: 54,
      gap: 2,
      radius: 6,
      exclusionPadding: 9,
      cardCleanupPaddingRatio: 0.42,
      decorativeRevealRate: 0.06,
      reshuffleOutRate: 0.075,
      protrudingTilePositions: [0.62]
    },

    reveal: {
      reshuffleStart: "top 92%",
      reshuffleEnd: "top 52%",
      itemStart: "top 78%",
      itemEnd: "top 42%",
      tileStagger: 0.42,
      originX: 0.5,
      originY: 0,
      horizontalWeight: 1,
      verticalWeight: 1,
      organicVariation: 0.055,
      itemFadeAt: 0.42
    },

    resizeDebounce: 160
  };

  function initPipelineTileGrid(wrapper, wrapperIndex) {
    const selectors = PIPELINE_GRID_CONFIG.selectors;
    const stage = wrapper.querySelector(selectors.stage);
    const tileLayer = wrapper.querySelector(selectors.tiles);
    const content = wrapper.querySelector(selectors.content);

    if (!stage || !tileLayer || !content) {
      console.warn(
        "Pipeline grid " + (wrapperIndex + 1) +
        " : .pipeline__stage, .pipeline__tiles ou " +
        ".pipeline__content est absent."
      );
      return;
    }

    const contentItems = selectors.items.map(function (selector) {
      const item = content.querySelector(selector);

      if (!item) {
        console.warn(
          "Pipeline grid " + (wrapperIndex + 1) +
          " : élément absent — " + selector
        );
      }

      return item;
    }).filter(Boolean);

    tileLayer.setAttribute("aria-hidden", "true");

    let resizeTimer = null;
    let resizeObserver = null;
    let revealAnimations = [];

    function getSettings() {
      if (window.innerWidth <= 767) {
        return PIPELINE_GRID_CONFIG.mobile;
      }

      if (window.innerWidth <= 991) {
        return PIPELINE_GRID_CONFIG.tablet;
      }

      return PIPELINE_GRID_CONFIG.desktop;
    }

    function deterministicValue(row, column) {
      const value = Math.sin(
        (row + 1) * 12.9898 + (column + 1) * 78.233
      ) * 43758.5453;

      return value - Math.floor(value);
    }

    function rectanglesIntersect(tile, exclusion) {
      return (
        tile.right > exclusion.left &&
        tile.left < exclusion.right &&
        tile.bottom > exclusion.top &&
        tile.top < exclusion.bottom
      );
    }

    function getExclusionRectangles(stageRectangle, padding) {
      return contentItems.map(function (item, itemIndex) {
        const rectangle = item.getBoundingClientRect();

        if (!rectangle.width || !rectangle.height) {
          return null;
        }

        return {
          itemIndex: itemIndex,
          left: rectangle.left - stageRectangle.left - padding,
          top: rectangle.top - stageRectangle.top - padding,
          right: rectangle.right - stageRectangle.left + padding,
          bottom: rectangle.bottom - stageRectangle.top + padding
        };
      }).filter(Boolean);
    }

    function killRevealAnimations() {
      revealAnimations.forEach(function (animation) {
        if (animation.scrollTrigger) {
          animation.scrollTrigger.kill();
        }
        animation.kill();
      });
      revealAnimations = [];
    }

    function orderTilesFromWaveOrigin(
      tiles,
      originX,
      originY,
      seed
    ) {
      const stageRectangle = stage.getBoundingClientRect();
      const stageWidth = Math.max(stageRectangle.width, 1);
      const stageHeight = Math.max(stageRectangle.height, 1);
      const reveal = PIPELINE_GRID_CONFIG.reveal;

      function getWaveDistance(tile) {
        const left = parseFloat(tile.style.left) || 0;
        const top = parseFloat(tile.style.top) || 0;
        const width = parseFloat(tile.style.width) || 0;
        const height = parseFloat(tile.style.height) || 0;
        const row = Number(tile.dataset.pipelineRow) || 0;
        const column = Number(tile.dataset.pipelineColumn) || 0;
        const normalizedX =
          (left + width / 2 - originX) / stageWidth *
          reveal.horizontalWeight;
        const normalizedY =
          (top + height / 2 - originY) / stageHeight *
          reveal.verticalWeight;
        const organicOffset = (
          deterministicValue(
            row + seed * 7,
            column + seed * 11
          ) - 0.5
        ) * reveal.organicVariation;

        return Math.hypot(normalizedX, normalizedY) + organicOffset;
      }

      return tiles.slice().sort(function (tileA, tileB) {
        return getWaveDistance(tileA) - getWaveDistance(tileB);
      });
    }

    function createRevealAnimations() {
      killRevealAnimations();

      const coverTiles = Array.from(
        tileLayer.querySelectorAll(".pipeline__tile.is--content-cover")
      );
      const decorativeRevealTiles = Array.from(
        tileLayer.querySelectorAll(".pipeline__tile.is--decorative-reveal")
      );
      const reshuffleOutTiles = Array.from(
        tileLayer.querySelectorAll(".pipeline__tile.is--reshuffle-out")
      );

      if (
        typeof window.gsap === "undefined" ||
        typeof window.ScrollTrigger === "undefined"
      ) {
        coverTiles.forEach(function (tile) {
          tile.style.display = "none";
        });
        decorativeRevealTiles.forEach(function (tile) {
          tile.style.display = "none";
        });
        reshuffleOutTiles.forEach(function (tile) {
          tile.style.display = "none";
        });
        contentItems.forEach(function (item) {
          item.style.opacity = "1";
        });
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        gsap.set(coverTiles, { scale: 0 });
        gsap.set(decorativeRevealTiles, { scale: 0 });
        gsap.set(reshuffleOutTiles, { scale: 0 });
        gsap.set(contentItems, { opacity: 1 });
        return;
      }

      gsap.set(tileLayer.querySelectorAll(".pipeline__tile"), {
        scale: 1,
        rotationY: 0,
        transformOrigin: "50% 50%"
      });
      gsap.set(contentItems, { opacity: 0 });

      const reveal = PIPELINE_GRID_CONFIG.reveal;
      const stageRectangle = stage.getBoundingClientRect();
      const orderedReshuffleTiles = orderTilesFromWaveOrigin(
        reshuffleOutTiles,
        stageRectangle.width * reveal.originX,
        stageRectangle.height * reveal.originY,
        wrapperIndex + 1
      );
      const reshuffleTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: reveal.reshuffleStart,
          end: reveal.reshuffleEnd,
          scrub: 1,
          invalidateOnRefresh: true
        }
      });

      reshuffleTimeline.to(orderedReshuffleTiles, {
        rotationY: 180,
        duration: 0.72,
        stagger: orderedReshuffleTiles.length
          ? reveal.tileStagger / orderedReshuffleTiles.length
          : 0,
        ease: "power2.inOut"
      }, 0.12);

      revealAnimations.push(reshuffleTimeline);

      contentItems.forEach(function (item, itemIndex) {
        const itemTiles = coverTiles.filter(function (tile) {
          return Number(tile.dataset.pipelineCover) === itemIndex;
        }).concat(
          decorativeRevealTiles.filter(function (tile) {
            return Number(tile.dataset.pipelineDecorative) === itemIndex;
          })
        );
        const itemRectangle = item.getBoundingClientRect();
        const orderedTiles = orderTilesFromWaveOrigin(
          itemTiles,
          itemRectangle.left - stageRectangle.left +
            itemRectangle.width / 2,
          itemRectangle.top - stageRectangle.top +
            itemRectangle.height / 2,
          wrapperIndex * 17 + itemIndex + 1
        );

        const itemTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: reveal.itemStart,
            end: reveal.itemEnd,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });

        itemTimeline.to(orderedTiles, {
          rotationY: 180,
          duration: 0.68,
          stagger: orderedTiles.length
            ? reveal.tileStagger / orderedTiles.length
            : 0,
          ease: "power2.inOut"
        }, 0);

        itemTimeline.to(item, {
          opacity: 1,
          duration: 0.28,
          ease: "power2.out"
        }, reveal.itemFadeAt);

        revealAnimations.push(itemTimeline);
      });
    }

    function buildGrid() {
      const stageRectangle = stage.getBoundingClientRect();
      const width = stageRectangle.width;
      const height = stageRectangle.height;

      if (!width || !height) {
        return;
      }

      const settings = getSettings();
      const tileSize = Math.min(
        settings.tileMax,
        Math.max(
          settings.tileMin,
          width * settings.tileViewportRatio
        )
      );
      const step = tileSize + settings.gap;
      const columns = Math.max(
        1,
        Math.floor((width + settings.gap) / step)
      );
      const rows = Math.max(
        1,
        Math.floor((height + settings.gap) / step)
      );
      const gridWidth = (columns - 1) * step + tileSize;
      const gridHeight = (rows - 1) * step + tileSize;
      const originX = Math.max(0, (width - gridWidth) / 2);
      const originY = Math.max(0, (height - gridHeight) / 2);
      const exclusions = getExclusionRectangles(
        stageRectangle,
        settings.exclusionPadding
      );
      const cleanupPadding = step * settings.cardCleanupPaddingRatio;
      const cleanupExclusions = exclusions.map(function (exclusion) {
        return {
          itemIndex: exclusion.itemIndex,
          left: exclusion.left - cleanupPadding,
          top: exclusion.top - cleanupPadding,
          right: exclusion.right + cleanupPadding,
          bottom: exclusion.bottom + cleanupPadding
        };
      });
      const orderedExclusions = exclusions.slice().sort(function (
        exclusionA,
        exclusionB
      ) {
        return exclusionA.top - exclusionB.top;
      });
      const separatorRows = new Set();

      for (
        let separatorIndex = 0;
        separatorIndex < orderedExclusions.length - 1;
        separatorIndex++
      ) {
        const currentExclusion = orderedExclusions[separatorIndex];
        const nextExclusion = orderedExclusions[separatorIndex + 1];
        const availableGap = nextExclusion.top - currentExclusion.bottom;

        if (availableGap < tileSize * 0.6) {
          continue;
        }

        const separatorCenter =
          (currentExclusion.bottom + nextExclusion.top) / 2;
        const separatorRow = Math.min(
          rows - 1,
          Math.max(
            0,
            Math.round(
              (separatorCenter - originY - tileSize / 2) / step
            )
          )
        );

        separatorRows.add(separatorRow);
      }

      const fragment = document.createDocumentFragment();

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const isLastGridRow = row === rows - 1;
          const left = originX + column * step;
          const top = originY + row * step;
          const tileRectangle = {
            left: left,
            top: top,
            right: left + tileSize,
            bottom: top + tileSize
          };
          const contentOverlap = exclusions.find(function (exclusion) {
            return rectanglesIntersect(tileRectangle, exclusion);
          });
          const cleanupOverlap = cleanupExclusions.find(function (
            exclusion
          ) {
            return rectanglesIntersect(tileRectangle, exclusion);
          });
          const decorativeReveal = deterministicValue(
            row,
            column
          ) < settings.decorativeRevealRate;
          const reshuffleOut = deterministicValue(
            row + 73,
            column + 109
          ) < settings.reshuffleOutRate;
          const tileCenterX = left + tileSize / 2;
          const tileCenterY = top + tileSize / 2;
          const nearestExclusion = exclusions.reduce(function (
            nearest,
            exclusion
          ) {
            const exclusionCenterX = (exclusion.left + exclusion.right) / 2;
            const exclusionCenterY = (exclusion.top + exclusion.bottom) / 2;
            const distance = Math.hypot(
              tileCenterX - exclusionCenterX,
              tileCenterY - exclusionCenterY
            );

            if (!nearest || distance < nearest.distance) {
              return {
                itemIndex: exclusion.itemIndex,
                distance: distance
              };
            }

            return nearest;
          }, null);

          const tile = document.createElement("span");
          tile.className = "pipeline__tile";
          if (contentOverlap) {
            tile.classList.add("is--content-cover");
            tile.dataset.pipelineCover = String(
              contentOverlap.itemIndex
            );
          } else if (separatorRows.has(row)) {
            tile.classList.add("is--separator");
          } else if (cleanupOverlap && !isLastGridRow) {
            tile.classList.add("is--content-cover");
            tile.dataset.pipelineCover = String(
              cleanupOverlap.itemIndex
            );
          } else if (
            decorativeReveal &&
            nearestExclusion &&
            !isLastGridRow
          ) {
            tile.classList.add("is--decorative-reveal");
            tile.dataset.pipelineDecorative = String(
              nearestExclusion.itemIndex
            );
          } else if (reshuffleOut && !isLastGridRow) {
            tile.classList.add("is--reshuffle-out");
          }
          tile.style.left = left + "px";
          tile.style.top = top + "px";
          tile.style.width = tileSize + "px";
          tile.style.height = tileSize + "px";
          tile.style.borderRadius = settings.radius + "px";
          tile.dataset.pipelineRow = String(row);
          tile.dataset.pipelineColumn = String(column);
          fragment.appendChild(tile);
        }
      }

      const protrudingAtBottom = wrapper.classList.contains(
        "is--dark-green"
      );

      settings.protrudingTilePositions.forEach(function (
        position,
        index
      ) {
        const column = Math.round(
          Math.min(1, Math.max(0, position)) * (columns - 1)
        );
        const tile = document.createElement("span");
        tile.className = protrudingAtBottom
          ? "pipeline__tile is--protruding is--bottom"
          : "pipeline__tile is--protruding is--top";
        tile.style.left = originX + column * step + "px";
        tile.style.top = protrudingAtBottom
          ? originY + gridHeight + settings.gap + "px"
          : originY - step + "px";
        tile.style.width = tileSize + "px";
        tile.style.height = tileSize + "px";
        tile.style.borderRadius = settings.radius + "px";
        tile.dataset.pipelineRow = protrudingAtBottom
          ? String(rows)
          : "-1";
        tile.dataset.pipelineColumn = String(column + index);
        fragment.appendChild(tile);
      });

      tileLayer.replaceChildren(fragment);
      createRevealAnimations();
      if (typeof window.ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    }

    function queueBuild() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(
        buildGrid,
        PIPELINE_GRID_CONFIG.resizeDebounce
      );
    }

    buildGrid();

    window.addEventListener("resize", queueBuild);
    window.addEventListener("orientationchange", queueBuild);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", queueBuild);
    }

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(queueBuild);
      resizeObserver.observe(stage);
      contentItems.forEach(function (item) {
        resizeObserver.observe(item);
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(queueBuild);
    }
  }

  function initPipelineTileGrids() {
    const wrappers = Array.from(
      document.querySelectorAll(
        PIPELINE_GRID_CONFIG.selectors.wrapper
      )
    );

    if (!wrappers.length) {
      console.warn(
        "Pipeline grid : aucune .pipeline__wrapper trouvée."
      );
      return;
    }

    wrappers.forEach(function (wrapper, wrapperIndex) {
      initPipelineTileGrid(wrapper, wrapperIndex);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initPipelineTileGrids,
      { once: true }
    );
  } else {
    initPipelineTileGrids();
  }
})();

function initTwostepScalingNavigation() {
  const navElement = document.querySelector("[data-twostep-nav]")
  const navStatusEl = document.querySelector("[data-nav-status]");

  if (!navElement || !navStatusEl) return;

  const setNavStatus = (status) => {
    navStatusEl.setAttribute("data-nav-status", status);
  };

  const isActive = () => navStatusEl.getAttribute("data-nav-status") === "active";

  const openNav = () => {
    setNavStatus("active");
    // If you use Lenis, you could pause the scroll here:
    // Lenis.stop?.();
  };

  const closeNav = () => {
    setNavStatus("not-active");
    // If you use Lenis, you could resume scroll here:
    // Lenis.start?.();
  };

  const toggleNav = () => (isActive() ? closeNav() : openNav());

  // Toggle buttons
  document.querySelectorAll('[data-nav-toggle="toggle"]').forEach((btn) => {
    btn.addEventListener("click", toggleNav);
  });

  // Close buttons
  document.querySelectorAll('[data-nav-toggle="close"]').forEach((btn) => {
    btn.addEventListener("click", closeNav);
  });

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isActive()) closeNav();
  });
}

// Initialize Two-step Scaling Navigation
document.addEventListener("DOMContentLoaded", () => {
  initTwostepScalingNavigation();
});

/*==================================================
HOVERS GSAP — BOUTONS ET LIENS DE NAVIGATION
==================================================*/

(function () {
  "use strict";

  function initGsapTextHovers() {
    if (typeof window.gsap === "undefined") {
      console.warn(
        "Hover GSAP : GSAP est absent, les hovers texte ne sont pas initialisés."
      );
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const controls = document.querySelectorAll(
      ".button, .navbar__link, .button__nav, .footer__link"
    );

    controls.forEach(function (control) {
      if (control.classList.contains("imtx-gsap-hover-ready")) {
        return;
      }

      let textElement = null;

      if (control.matches(".navbar__link")) {
        textElement = control.querySelector(".nav__text");
      } else if (control.matches(".footer__link")) {
        textElement =
          control.querySelector(
            ".footer__link-text, .footer__text"
          ) || control;
      } else {
        textElement = control.querySelector(".button__text");
      }

      if (!textElement) {
        return;
      }

      const originalContent = textElement.innerHTML;
      const originalLine = document.createElement("span");
      const duplicateLine = document.createElement("span");

      originalLine.className =
        "imtx-hover-text-line imtx-hover-text-line--original";
      duplicateLine.className =
        "imtx-hover-text-line imtx-hover-text-line--duplicate";

      originalLine.innerHTML = originalContent;
      duplicateLine.innerHTML = originalContent;
      duplicateLine.setAttribute("aria-hidden", "true");

      textElement.replaceChildren(originalLine, duplicateLine);
      textElement.classList.add("imtx-hover-text-mask");
      control.classList.add("imtx-gsap-hover-ready");

      gsap.set(originalLine, {
        yPercent: 0
      });

      gsap.set(duplicateLine, {
        yPercent: 115
      });

      const hoverTimeline = gsap.timeline({
        paused: true,
        defaults: {
          duration: 0.46,
          ease: "power3.inOut",
          overwrite: "auto"
        }
      });

      hoverTimeline
        .to(
          originalLine,
          {
            yPercent: -115
          },
          0
        )
        .to(
          duplicateLine,
          {
            yPercent: 0
          },
          0
        );

      control.addEventListener("mouseenter", function () {
        hoverTimeline.play();
      });

      control.addEventListener("mouseleave", function () {
        hoverTimeline.reverse();
      });

      control.addEventListener("focusin", function () {
        hoverTimeline.play();
      });

      control.addEventListener("focusout", function () {
        hoverTimeline.reverse();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initGsapTextHovers,
      { once: true }
    );
  } else {
    initGsapTextHovers();
  }
})();

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
      paragraphOneOut: 0.23,

      videoOneIn: 0.15,
      videoTwoIn: 0.2,
      videoThreeIn: 0.25,
      videoInDuration: 0.2,

      videoThreeFullscreen: 0.54,
      videoThreeFullscreenDuration: 0.16,

      videoOneOut: 0.55,
      videoTwoOut: 0.57,
      videoThreeOut: 0.72,
      videoBackOutDuration: 0.08,
      videoThreeOutDuration: 0.16,

      paragraphTwoIn: 0.89,
      buttonIn: 0.95,
      end: 1
    },

    text: {
      lineDuration: 0.055,
      lineStagger: 0.018,
      hiddenYPercent: 70
    },

    videoStack: {
      gapDesktop: 48,
      gapTablet: 38,
      gapMobile: 26,
      entryOffsetDesktop: 110,
      entryOffsetTablet: 88,
      entryOffsetMobile: 64
    },

    previousSection: {
      cancerScale: 1.15,
      targetLiftViewport: 0.22,
      heroContentOpacity: 0.06,
      paragraphOneInStart: 0.48,
      paragraphOneInDuration: 0.24,
      paragraphOneLineStagger: 0.055,
      targetTextExitStart: 0.18,
      targetTextExitDuration: 0.15,
      targetTextLineStagger: 0.025
    },

    buttonDuration: 0.07,
    resizeDebounce: 260
  };

  function mountSecondSection() {
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
    const paragraphCandidates = Array.from(
      wrapper.querySelectorAll(".hs_p")
    );
    const videoCandidates = Array.from(
      wrapper.querySelectorAll(".hs__video")
    );
    const paragraphOne =
      wrapper.querySelector(selectors.paragraphOne) ||
      paragraphCandidates[0] ||
      null;
    const paragraphTwo =
      wrapper.querySelector(selectors.paragraphTwo) ||
      paragraphCandidates[1] ||
      null;
    const button = wrapper.querySelector(selectors.button);
    const videoOne =
      wrapper.querySelector(selectors.videoOne) ||
      videoCandidates[0] ||
      null;
    const videoTwo =
      wrapper.querySelector(selectors.videoTwo) ||
      videoCandidates[1] ||
      null;
    const videoThree =
      wrapper.querySelector(selectors.videoThree) ||
      videoCandidates[2] ||
      null;
    const previousCancerWrapper = document.querySelector(
      ".hh__cancer-wrapper"
    );
    const previousTargetWrapper = document.querySelector(
      ".hh__target-wrapper"
    );
    const previousTargetParagraphTwo = document.querySelector(
      ".hh__target-p.is--two"
    );
    const previousHeroContent = document.querySelector(
      ".h-hero__content"
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
      !videoOne ||
      !videoTwo ||
      !videoThree
    ) {
      /*
      État de secours : si une classe Webflow manque, le contenu reste visible
      au lieu de laisser toute la section blanche.
      */
      document.documentElement.classList.add(
        "second-animation-ready"
      );
      return;
    }

    const paragraphs = [paragraphOne, paragraphTwo];
    const videos = [videoOne, videoTwo, videoThree];

    const originalParagraphMarkup = new Map();
    paragraphs.forEach(function (paragraph) {
      originalParagraphMarkup.set(paragraph, paragraph.innerHTML);
    });

    const originalVideoStyles = new Map();
    videos.forEach(function (video) {
      originalVideoStyles.set(video, video.getAttribute("style"));
    });

    const originalButtonStyle = button
      ? button.getAttribute("style")
      : null;

    let lines = new Map();
    let timeline = null;
    let previousTransitionAnimations = [];
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
      if (button) {
        restoreInlineStyle(button, originalButtonStyle);
      }
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

    function getVideoEntryOffset() {
      if (window.innerWidth <= 767) {
        return SECOND_CONFIG.videoStack.entryOffsetMobile;
      }

      if (window.innerWidth <= 991) {
        return SECOND_CONFIG.videoStack.entryOffsetTablet;
      }

      return SECOND_CONFIG.videoStack.entryOffsetDesktop;
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
      const finalVideoX = new Map();
      const finalVideoY = new Map();
      const finalVideoXPercent = new Map();
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
        finalVideoX.set(
          video,
          Number(gsap.getProperty(video, "x")) || 0
        );
        finalVideoXPercent.set(
          video,
          Number(gsap.getProperty(video, "xPercent")) || 0
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
      const anchorCenterX =
        anchorRectangle.left + anchorRectangle.width / 2;
      const parentRectangle = parent.getBoundingClientRect();
      const parentCenterX =
        parentRectangle.left + parentRectangle.width / 2;
      const parentCenterY =
        parentRectangle.top + parentRectangle.height / 2;
      const stackGap = getVideoStackGap();
      const entryOffset = getVideoEntryOffset();
      const videoDepth = new Map([
        [videoOne, 1],
        [videoTwo, 2],
        [videoThree, 3]
      ]);
      const centeredVideoX = new Map();
      const centeredVideoY = new Map();
      const startVideoY = new Map();

      videos.forEach(function (video) {
        const rectangle = videoRectangles.get(video);
        const centerX = rectangle.left + rectangle.width / 2;
        const centerY = rectangle.top + rectangle.height / 2;

        centeredVideoX.set(
          video,
          finalVideoX.get(video) + anchorCenterX - centerX
        );
        centeredVideoY.set(
          video,
          finalVideoY.get(video) + anchorCenterY - centerY
        );
        startVideoY.set(
          video,
          centeredVideoY.get(video) + entryOffset
        );
      });

      const videoThreeRectangle = videoRectangles.get(videoThree);
      const videoThreeCenterX =
        videoThreeRectangle.left + videoThreeRectangle.width / 2;
      const videoThreeCenterY =
        videoThreeRectangle.top + videoThreeRectangle.height / 2;
      const videoThreeFullscreenScale =
        finalVideoScales.get(videoThree) * Math.max(
          parentRectangle.width / videoThreeRectangle.width,
          parentRectangle.height / videoThreeRectangle.height
        );
      const videoThreeFullscreenX =
        finalVideoX.get(videoThree) + parentCenterX - videoThreeCenterX;
      const videoThreeFullscreenY =
        finalVideoY.get(videoThree) + parentCenterY - videoThreeCenterY;

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
          x: centeredVideoX.get(video),
          y: startVideoY.get(video),
          xPercent: finalVideoXPercent.get(video),
          yPercent: finalVideoYPercent.get(video),
          zIndex: videoDepth.get(video),
          scale: 0,
          transformOrigin: "50% 50%"
        });
      });

      /*
      L'entrée et le décalage vertical de la pile se chevauchent.
      On anime donc deux progressions indépendantes, puis on compose
      leur résultat ici. Cela évite que deux tweens concurrents écrivent
      simultanément la propriété `y`, ce qui provoquait un saut visible.
      */
      const videoEntranceStates = new Map();

      videos.forEach(function (video) {
        videoEntranceStates.set(video, {
          entry: 0,
          stack: 0
        });
      });

      function renderVideoEntrance(video, stackDistance) {
        const state = videoEntranceStates.get(video);
        const startY = startVideoY.get(video);
        const centeredY = centeredVideoY.get(video);

        gsap.set(video, {
          y:
            startY +
            (centeredY - startY) * state.entry -
            stackDistance * state.stack,
          scale: finalVideoScales.get(video) * state.entry
        });
      }

      if (button) {
        gsap.set(button, {
          opacity: 0,
          y: 20
        });
      }

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
        if (button) {
          gsap.set(button, {
            opacity: 1,
            y: 0
          });
        }
        return;
      }

      const timing = SECOND_CONFIG.timing;
      const paragraphOneLineCount = (
        lines.get(paragraphOne) || []
      ).length;
      const paragraphOneExitEnd = timing.paragraphOneOut +
        Math.max(paragraphOneLineCount - 1, 0) *
          SECOND_CONFIG.text.lineStagger +
        SECOND_CONFIG.text.lineDuration;

      const videoVisibilityWindows = [
        [
          videoOne,
          timing.videoOneIn,
          timing.videoOneOut + timing.videoBackOutDuration
        ],
        [
          videoTwo,
          timing.videoTwoIn,
          timing.videoTwoOut + timing.videoBackOutDuration
        ],
        [
          videoThree,
          timing.videoThreeIn,
          timing.videoThreeOut + timing.videoThreeOutDuration
        ]
      ];

      /*
      Les deux paragraphes sont aussi touchés par la transition d’entrée
      de la section. Ce verrou de visibilité empêche qu’un ancien état
      GSAP les laisse affichés ensemble après un scroll arrière ou un
      refresh, sans modifier l’animation ligne par ligne active.
      */
      function syncParagraphVisibility(progress) {
        paragraphOne.style.visibility =
          progress <= paragraphOneExitEnd + 0.001
            ? "visible"
            : "hidden";
        paragraphTwo.style.visibility =
          progress >= timing.paragraphTwoIn - 0.001
            ? "visible"
            : "hidden";
      }

      /*
      Une vidéo Webflow peut conserver un calque matériel visible sur iOS,
      même avec scale:0. Chaque vidéo est donc réellement cachée en dehors de
      sa propre fenêtre d'animation, ce qui empêche la section suivante de
      dépasser sur le hero pendant le chargement ou un scroll arrière.
      */
      function syncVideoVisibility(progress) {
        videoVisibilityWindows.forEach(function (windowSettings) {
          const video = windowSettings[0];
          const start = windowSettings[1];
          const end = windowSettings[2];

          video.style.visibility =
            progress >= start - 0.001 && progress <= end + 0.001
              ? "visible"
              : "hidden";
        });
      }

      timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            syncParagraphVisibility(self.progress);
            syncVideoVisibility(self.progress);
          },
          onRefresh: function (self) {
            syncParagraphVisibility(self.progress);
            syncVideoVisibility(self.progress);
          }
        }
      });

      syncParagraphVisibility(
        timeline.scrollTrigger
          ? timeline.scrollTrigger.progress
          : 0
      );
      syncVideoVisibility(
        timeline.scrollTrigger
          ? timeline.scrollTrigger.progress
          : 0
      );

      animateLinesOut(paragraphOne, timing.paragraphOneOut);

      timeline.to(videoEntranceStates.get(videoOne), {
        entry: 1,
        duration: timing.videoInDuration,
        ease: "power2.out",
        onUpdate: function () {
          renderVideoEntrance(videoOne, stackGap * 2);
        }
      }, timing.videoOneIn);

      timeline.to(videoEntranceStates.get(videoOne), {
        stack: 1,
        duration: timing.videoInDuration,
        ease: "power2.inOut",
        onUpdate: function () {
          renderVideoEntrance(videoOne, stackGap * 2);
        }
      }, timing.videoTwoIn);

      timeline.to(videoEntranceStates.get(videoTwo), {
        entry: 1,
        duration: timing.videoInDuration,
        ease: "power2.out",
        onUpdate: function () {
          renderVideoEntrance(videoTwo, stackGap);
        }
      }, timing.videoTwoIn);

      timeline.to(videoEntranceStates.get(videoTwo), {
        stack: 1,
        duration: timing.videoInDuration,
        ease: "power2.inOut",
        onUpdate: function () {
          renderVideoEntrance(videoTwo, stackGap);
        }
      }, timing.videoThreeIn);

      timeline.to(videoEntranceStates.get(videoThree), {
        entry: 1,
        duration: timing.videoInDuration,
        ease: "power2.out",
        onUpdate: function () {
          renderVideoEntrance(videoThree, 0);
        }
      }, timing.videoThreeIn);

      timeline.to(videoThree, {
        x: videoThreeFullscreenX,
        y: videoThreeFullscreenY,
        scale: videoThreeFullscreenScale,
        duration: timing.videoThreeFullscreenDuration,
        ease: "power2.inOut"
      }, timing.videoThreeFullscreen);

      [
        [videoOne, timing.videoOneOut, timing.videoBackOutDuration, "power2.in"],
        [videoTwo, timing.videoTwoOut, timing.videoBackOutDuration, "power2.in"],
        [videoThree, timing.videoThreeOut, timing.videoThreeOutDuration, "power1.inOut"]
      ].forEach(function (item) {
        timeline.to(item[0], {
          scale: 0,
          duration: item[2],
          ease: item[3]
        }, item[1]);
      });

      animateLinesIn(paragraphTwo, timing.paragraphTwoIn);

      if (button) {
        timeline.to(button, {
          opacity: 1,
          y: 0,
          duration: SECOND_CONFIG.buttonDuration,
          ease: "power2.out"
        }, timing.buttonIn);
      }

      timeline.to({}, {
        duration: Math.max(timing.end - timing.buttonIn, 0.01)
      }, timing.buttonIn);
    }

    function createPreviousSectionTransition() {
      previousTransitionAnimations.forEach(function (animation) {
        if (animation.scrollTrigger) {
          animation.scrollTrigger.kill();
        }
        animation.kill();
      });
      previousTransitionAnimations = [];

      if (
        (
          !previousCancerTargets.length &&
          !previousTargetWrapper &&
          !previousHeroContent
        ) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      if (previousCancerTargets.length) {
        const cancerTransition = gsap.fromTo(previousCancerTargets, {
          scale: 1
        }, {
          scale: SECOND_CONFIG.previousSection.cancerScale,
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
        previousTransitionAnimations.push(cancerTransition);
      }

      const parallaxWrappers = [
        previousTargetWrapper,
        previousCancerWrapper
      ].filter(Boolean);

      if (
        parallaxWrappers.length ||
        previousHeroContent ||
        (lines.get(paragraphOne) || []).length
      ) {
        const entryTransition = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: "top bottom",
            end: "top top",
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
        previousTransitionAnimations.push(entryTransition);

        if (parallaxWrappers.length) {
          entryTransition.fromTo(parallaxWrappers, {
            y: 0
          }, {
            y: function () {
              const viewportHeight = window.visualViewport
                ? window.visualViewport.height
                : window.innerHeight;

              return -viewportHeight *
                SECOND_CONFIG.previousSection.targetLiftViewport;
            },
            ease: "none",
            duration: 1
          }, 0);
        }

        if (previousHeroContent) {
          entryTransition.fromTo(previousHeroContent, {
            opacity: 1
          }, {
            opacity:
              SECOND_CONFIG.previousSection.heroContentOpacity,
            ease: "none",
            duration: 1
          }, 0);
        }

        (lines.get(paragraphOne) || []).forEach(
          function (line, index) {
            entryTransition.to(line, {
              opacity: 1,
              yPercent: 0,
              duration:
                SECOND_CONFIG.previousSection.paragraphOneInDuration
            },
            SECOND_CONFIG.previousSection.paragraphOneInStart +
              index *
              SECOND_CONFIG.previousSection.paragraphOneLineStagger);
          }
        );

        if (previousTargetParagraphTwo) {
          const words = Array.from(
            previousTargetParagraphTwo.querySelectorAll(
              ".hero-split-word"
            )
          );
          const visualLines = [];

          words.forEach(function (word) {
            const top = Math.round(word.getBoundingClientRect().top);
            let line = visualLines.find(function (candidate) {
              return Math.abs(candidate.top - top) <= 2;
            });

            if (!line) {
              line = { top: top, words: [] };
              visualLines.push(line);
            }

            line.words.push(word);
          });

          visualLines.sort(function (a, b) {
            return a.top - b.top;
          });

          visualLines.forEach(function (line, index) {
            entryTransition.to(line.words, {
              opacity: 0,
              yPercent: -75,
              duration:
                SECOND_CONFIG.previousSection.targetTextExitDuration
            },
            SECOND_CONFIG.previousSection.targetTextExitStart +
              index *
              SECOND_CONFIG.previousSection.targetTextLineStagger);
          });
        }
      }
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
        createPreviousSectionTransition();
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
  }

  /*
  hero.js est hébergé sur GitHub Pages et peut finir de charger après
  l'événement window.load. Dans ce cas, on initialise immédiatement.
  */
  if (document.readyState === "complete") {
    mountSecondSection();
  } else {
    window.addEventListener("load", mountSecondSection, {
      once: true
    });
  }
})();
