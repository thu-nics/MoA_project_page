(function () {
  function revealOnScroll() {
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((element) => {
      const windowHeight = window.innerHeight;
      const elementTop = element.getBoundingClientRect().top;
      if (elementTop < windowHeight - 150) {
        element.classList.add("active");
      }
    });
  }

  function initializeNavigation() {
    const navGlobal = document.getElementById("navGlobal");
    const navLocal = document.getElementById("navLocal");
    const hero = document.querySelector(".hero");
    const scrollTop = document.getElementById("scrollTop");
    const navLogoWrapper = document.getElementById("navLogoWrapper");
    const navLinks = document.getElementById("navLinks");
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");

    function updateChrome() {
      const currentScrollY = window.scrollY;
      const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;

      if (currentScrollY > heroBottom - 100) {
        navLocal && navLocal.classList.add("nav-visible", "nav-sticky");
        navGlobal && navGlobal.classList.add("hidden");
      } else {
        navLocal && navLocal.classList.remove("nav-visible", "nav-sticky");
        navGlobal && navGlobal.classList.remove("hidden");
      }

      if (scrollTop) {
        scrollTop.classList.toggle("visible", currentScrollY > 500);
      }
    }

    window.addEventListener("scroll", () => {
      updateChrome();
      revealOnScroll();
    }, { passive: true });

    if (navLogoWrapper) {
      const navLogo = navLogoWrapper.querySelector(".nav-logo");
      navLogo && navLogo.addEventListener("click", (event) => {
        if (window.innerWidth <= 700) {
          event.preventDefault();
          navLogoWrapper.classList.toggle("open");
        }
      });

      document.addEventListener("click", (event) => {
        if (!navLogoWrapper.contains(event.target)) {
          navLogoWrapper.classList.remove("open");
        }
      });
    }

    if (mobileMenuToggle && navLinks) {
      mobileMenuToggle.addEventListener("click", () => {
        mobileMenuToggle.classList.toggle("active");
        navLinks.classList.toggle("mobile-open");
      });

      navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 768) {
            mobileMenuToggle.classList.remove("active");
            navLinks.classList.remove("mobile-open");
          }
        });
      });
    }

    updateChrome();
  }

  window.toggleExpand = function toggleExpand(header) {
    const section = header && header.parentElement;
    if (!section) return;
    section.classList.toggle("open");
  };

  window.scrollToTop = function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.copyBibtex = function copyBibtex() {
    const code = document.getElementById("bibtexCode");
    const button = document.querySelector(".copy-btn");
    if (!code || !button) return;

    const text = code.textContent;
    const markCopied = () => {
      button.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => {
        button.innerHTML = '<i class="fas fa-copy"></i> Copy BibTeX';
      }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(markCopied).catch(() => {
        fallbackCopy(text);
        markCopied();
      });
    } else {
      fallbackCopy(text);
      markCopied();
    }
  };

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  // ── Observation 02: N×N attention matrices growing with input length ──
  // Three heads share one growing causal matrix; their kept regions follow
  // S = α + β·N. Heads B and C look identical at short lengths and diverge
  // as the input grows, the core of the second observation.
  function initMatrixObservation() {
    const stage = document.getElementById("matrixStage");
    if (!stage) return;

    const MAX_CELLS = 32;              // 16k tokens, 0.5k per cell
    const SINK_CELLS = 1;              // unmasked initial tokens
    const LEVELS = [
      { label: "4k", cells: 8 },
      { label: "8k", cells: 16 },
      { label: "12k", cells: 24 },
      { label: "16k", cells: 32 },
    ];
    const HOLD = 2.0;                  // s at each length level
    const GROW = 1.2;                  // s to grow to the next level
    const RESET_FADE = 0.6;            // s fade-out before looping

    // Span rules in cells (1 cell = 0.5k tokens): S = alpha + beta·N
    const HEADS = [
      { canvas: "matrixHeadA", readout: "matrixReadoutA", alpha: 3.2, beta: 0 },
      { canvas: "matrixHeadB", readout: "matrixReadoutB", alpha: 11.2, beta: 0 },
      { canvas: "matrixHeadC", readout: "matrixReadoutC", alpha: 0, beta: 0.9 },
    ].map((h) => {
      const el = document.getElementById(h.canvas);
      return el ? { ...h, el, ctx: el.getContext("2d") } : null;
    }).filter(Boolean);
    if (HEADS.length === 0) return;

    const lengthValue = document.getElementById("matrixLengthValue");
    const ticks = Array.from(document.querySelectorAll("#matrixLengthTicks span"));

    // Deterministic per-cell texture so cells don't flicker between frames
    function cellNoise(i, j) {
      const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
      return x - Math.floor(x);
    }

    function setupCanvas(head) {
      const dpr = window.devicePixelRatio || 1;
      const size = head.el.clientWidth || 240;
      head.el.width = size * dpr;
      head.el.height = size * dpr;
      head.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      head.size = size;
    }

    function drawHead(head, nF, fade) {
      const ctx = head.ctx;
      const size = head.size;
      ctx.clearRect(0, 0, size, size);

      const cell = size / MAX_CELLS;
      const pad = Math.max(0.6, cell * 0.12);
      const span = head.alpha + head.beta * nF;
      const rows = Math.min(MAX_CELLS, Math.ceil(nF));

      for (let i = 0; i < rows; i++) {
        // Frontier rows fade in as the matrix grows
        const rowAlpha = Math.max(0, Math.min(1, nF - i)) * fade;
        if (rowAlpha <= 0.01) continue;
        for (let j = 0; j <= i; j++) {
          const kept = j < SINK_CELLS || (i - j) < span;
          const noise = cellNoise(i, j);
          let a, color;
          if (kept) {
            a = (0.55 + 0.35 * noise) * rowAlpha;
            color = `rgba(10, 132, 255, ${a})`;
          } else {
            a = 0.07 * rowAlpha;
            color = `rgba(255, 255, 255, ${a})`;
          }
          ctx.fillStyle = color;
          ctx.fillRect(j * cell + pad / 2, i * cell + pad / 2, cell - pad, cell - pad);
        }
      }
    }

    function updateReadouts(levelIdx, nF) {
      const tokensK = nF * 0.5;
      if (lengthValue) lengthValue.textContent = `${Math.round(tokensK)}k`;
      ticks.forEach((tick, i) => tick.classList.toggle("active", i === levelIdx));
      for (const head of HEADS) {
        const el = document.getElementById(head.readout);
        if (!el) continue;
        const span = head.alpha + head.beta * nF;
        const pct = Math.min(1, span / nF);
        el.textContent = `${Math.round(pct * 100)}% of input`;
      }
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function drawAll(nF, fade, levelIdx) {
      for (const head of HEADS) drawHead(head, nF, fade);
      updateReadouts(levelIdx, nF);
    }

    function resizeAll() {
      for (const head of HEADS) setupCanvas(head);
    }

    resizeAll();
    window.addEventListener("resize", () => {
      resizeAll();
      if (reducedMotion) drawAll(MAX_CELLS, 1, LEVELS.length - 1);
    });

    if (reducedMotion) {
      // Static frame at the longest input, where the contrast is maximal
      drawAll(MAX_CELLS, 1, LEVELS.length - 1);
      return;
    }

    // Timeline: hold L0, grow, hold L1, grow, ... hold L3, fade, loop
    const CYCLE = LEVELS.length * HOLD + (LEVELS.length - 1) * GROW + RESET_FADE;
    const easeInOut = (t) => t * t * (3 - 2 * t);

    let running = true;
    let start = performance.now();

    function frame(now) {
      if (!running) return;
      let t = ((now - start) / 1000) % CYCLE;

      let nF = LEVELS[0].cells;
      let fade = 1;
      let levelIdx = 0;

      const growPhase = HOLD + GROW;
      if (t >= LEVELS.length * HOLD + (LEVELS.length - 1) * GROW) {
        // Reset fade at the end of the cycle
        nF = LEVELS[LEVELS.length - 1].cells;
        levelIdx = LEVELS.length - 1;
        const ft = (t - (LEVELS.length * HOLD + (LEVELS.length - 1) * GROW)) / RESET_FADE;
        fade = 1 - easeInOut(Math.min(1, ft));
      } else {
        const seg = Math.min(LEVELS.length - 1, Math.floor(t / growPhase));
        const segT = t - seg * growPhase;
        if (segT < HOLD || seg === LEVELS.length - 1) {
          nF = LEVELS[seg].cells;
          levelIdx = seg;
        } else {
          const gT = easeInOut((segT - HOLD) / GROW);
          nF = LEVELS[seg].cells + (LEVELS[seg + 1].cells - LEVELS[seg].cells) * gT;
          levelIdx = gT > 0.5 ? seg + 1 : seg;
        }
      }

      drawAll(nF, fade, levelIdx);
      requestAnimationFrame(frame);
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        const visible = entries[0].isIntersecting;
        if (visible && !running) {
          running = true;
          requestAnimationFrame(frame);
        } else if (!visible) {
          running = false;
        }
      }, { threshold: 0.05 });
      io.observe(stage);
    }

    requestAnimationFrame(frame);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initializeNavigation();
    initMatrixObservation();
  });

  window.addEventListener("load", () => {
    requestAnimationFrame(revealOnScroll);
  }, { once: true });
})();
