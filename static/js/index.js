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

  // ── Hero: heterogeneous elastic attention field ──────────────────
  // Each cropped causal matrix represents one attention head. Heads share
  // the same growing context length N, while their kept spans follow
  // different S = alpha + beta * N rules. Fixed and elastic heads therefore
  // look similar at short contexts and separate as the field expands.
  function initHeroAttentionField() {
    const canvas = document.getElementById("moaHeroCanvas");
    const hero = canvas && canvas.closest(".hero");
    const ctx = canvas && canvas.getContext("2d");
    if (!canvas || !hero || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -1000, y: -1000, nx: 0, ny: 0, tx: 0, ty: 0 };
    const timing = { shortHold: 1.5, grow: 5.4, longHold: 3.4, return: 2.4 };
    const cycle = timing.shortHold + timing.grow + timing.longHold + timing.return;
    const refreshOrderSeed = Math.random() * 10000;
    let width = 0;
    let height = 0;
    let maxCells = 26;
    let minCells = 10;
    let heads = [];
    let running = true;
    let startTime = performance.now();

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const lerp = (a, b, amount) => a + (b - a) * amount;
    const smoothstep = (amount) => {
      const t = clamp(amount, 0, 1);
      return t * t * (3 - 2 * t);
    };

    function cellNoise(seed, row, col) {
      const value = Math.sin(seed * 91.7 + row * 127.1 + col * 311.7) * 43758.5453;
      return value - Math.floor(value);
    }

    function buildHeads() {
      const mobile = width < 700;
      maxCells = mobile ? 21 : 26;
      minCells = mobile ? 8 : 10;

      const desktopHeads = [
        { x: -0.035, y: 0.105, step: 11.8, angle: -0.055, alpha: 4.2, beta: 0, seed: 2, depth: 0.65, accent: "blue" },
        { x: 0.245, y: -0.07, step: 10.8, angle: 0.052, alpha: 0.8, beta: 0.82, seed: 7, depth: 0.35, accent: "indigo" },
        { x: 0.835, y: 0.07, step: 11.7, angle: 0.07, alpha: 8.2, beta: 0, seed: 13, depth: 0.7, accent: "blue" },
        { x: -0.025, y: 0.63, step: 12.3, angle: 0.04, alpha: 1.8, beta: 0.56, seed: 19, depth: 0.8, accent: "indigo" },
        { x: 0.37, y: 0.845, step: 10.9, angle: -0.035, alpha: 5.2, beta: 0, seed: 29, depth: 0.45, accent: "blue" },
        { x: 0.805, y: 0.625, step: 12.1, angle: -0.072, alpha: 0.5, beta: 0.88, seed: 37, depth: 0.75, accent: "indigo" },
      ];

      const mobileHeads = [
        { x: -0.22, y: 0.07, step: 8.8, angle: -0.055, alpha: 3.6, beta: 0, seed: 2, depth: 0.5, accent: "blue" },
        { x: 0.76, y: 0.095, step: 8.7, angle: 0.062, alpha: 0.6, beta: 0.82, seed: 7, depth: 0.6, accent: "indigo" },
        { x: -0.18, y: 0.78, step: 9.1, angle: 0.045, alpha: 1.4, beta: 0.56, seed: 19, depth: 0.7, accent: "indigo" },
        { x: 0.74, y: 0.77, step: 9, angle: -0.068, alpha: 6.5, beta: 0, seed: 29, depth: 0.55, accent: "blue" },
      ];

      const sourceHeads = mobile ? mobileHeads : desktopHeads;
      const revealOrder = sourceHeads
        .map((head) => ({ seed: head.seed, order: cellNoise(refreshOrderSeed, head.seed, 0) }))
        .sort((a, b) => a.order - b.order);
      const revealRanks = new Map(revealOrder.map((head, index) => [head.seed, index]));

      heads = sourceHeads.map((head) => ({
        ...head,
        px: head.x * width,
        py: head.y * height,
        introRank: revealRanks.get(head.seed),
      }));
    }

    function resize() {
      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildHeads();
      if (reducedMotion) draw(maxCells, 1, performance.now());
    }

    function rgbaForCell(head, kept, noise, accent, alpha) {
      if (!kept) return `rgba(29, 29, 31, ${alpha})`;
      if (!accent) return `rgba(134, 134, 139, ${alpha})`;
      if (head.accent === "indigo") return `rgba(102, 126, 234, ${alpha})`;
      return `rgba(0, 113, 227, ${alpha})`;
    }

    function drawHead(head, nFloat, fieldFade, now) {
      const rows = Math.min(maxCells, Math.ceil(nFloat));
      const span = clamp(head.alpha + head.beta * nFloat, 1, nFloat);
      const step = head.step;
      const cellSize = Math.max(2.2, step * 0.62);
      const elapsed = now / 1000;
      const introElapsed = (now - startTime) / 1000;
      const introDelay = 0.12 + head.introRank * 0.18;
      const headReveal = reducedMotion ? 1 : smoothstep((introElapsed - introDelay) / 0.68);
      const effectiveFade = fieldFade * headReveal;
      const driftX = Math.sin(elapsed * 0.24 + head.seed) * 2.1 + pointer.nx * head.depth * 5;
      const driftY = Math.cos(elapsed * 0.19 + head.seed * 0.7) * 1.7 + pointer.ny * head.depth * 4;
      const cos = Math.cos(head.angle);
      const sin = Math.sin(head.angle);
      const pulseRow = ((elapsed * 1.35 + head.seed * 0.43) % Math.max(1, nFloat + 5)) - 2.5;

      ctx.save();
      ctx.translate(head.px + driftX, head.py + driftY);
      ctx.rotate(head.angle);

      for (let row = 0; row < rows; row += 1) {
        const rowFade = smoothstep(nFloat - row);
        if (rowFade <= 0.001) continue;

        for (let col = 0; col <= row; col += 1) {
          const distanceFromDiagonal = row - col;
          const kept = col === 0 || distanceFromDiagonal < span;
          const noise = cellNoise(head.seed, row, col);
          const pulse = Math.max(0, 1 - Math.abs(row - pulseRow) / 1.8);
          const accent = kept && (noise > 0.83 || pulse > 0.48);

          const localX = col * step + step * 0.5;
          const localY = row * step + step * 0.5;
          const globalX = head.px + driftX + localX * cos - localY * sin;
          const globalY = head.py + driftY + localX * sin + localY * cos;
          const pointerDistance = Math.hypot(globalX - pointer.x, globalY - pointer.y);
          const pointerLift = Math.max(0, 1 - pointerDistance / 145) * 0.035;

          let alpha;
          if (kept) {
            alpha = accent
              ? 0.078 + noise * 0.052 + pulse * 0.032
              : 0.065 + noise * 0.045;
          } else {
            alpha = 0.018 + noise * 0.025;
          }
          alpha = (alpha + pointerLift) * rowFade * effectiveFade;

          ctx.fillStyle = rgbaForCell(head, kept, noise, accent, alpha);
          ctx.fillRect(
            col * step + (step - cellSize) / 2,
            row * step + (step - cellSize) / 2,
            cellSize,
            cellSize
          );
        }
      }

      ctx.restore();
    }

    function draw(nFloat, fieldFade, now) {
      ctx.clearRect(0, 0, width, height);
      pointer.nx = lerp(pointer.nx, pointer.tx, 0.035);
      pointer.ny = lerp(pointer.ny, pointer.ty, 0.035);
      for (const head of heads) drawHead(head, nFloat, fieldFade, now);
    }

    function frame(now) {
      if (!running || reducedMotion) return;
      const elapsed = (now - startTime) / 1000;
      const t = elapsed % cycle;
      let nFloat = minCells;
      const fieldFade = 1;

      if (t < timing.shortHold) {
        nFloat = minCells;
      } else if (t < timing.shortHold + timing.grow) {
        const progress = smoothstep((t - timing.shortHold) / timing.grow);
        nFloat = lerp(minCells, maxCells, progress);
      } else if (t < timing.shortHold + timing.grow + timing.longHold) {
        nFloat = maxCells;
      } else {
        const progress = smoothstep((t - timing.shortHold - timing.grow - timing.longHold) / timing.return);
        nFloat = lerp(maxCells, minCells, progress);
      }

      draw(nFloat, fieldFade, now);
      requestAnimationFrame(frame);
    }

    hero.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.tx = pointer.x / rect.width - 0.5;
      pointer.ty = pointer.y / rect.height - 0.5;
    });

    hero.addEventListener("pointerleave", () => {
      pointer.x = -1000;
      pointer.y = -1000;
      pointer.tx = 0;
      pointer.ty = 0;
    });

    window.addEventListener("resize", resize);
    resize();

    if (reducedMotion) return;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries[0].isIntersecting;
        if (visible && !running) {
          running = true;
          requestAnimationFrame(frame);
        } else if (!visible) {
          running = false;
        }
      }, { threshold: 0.01 });
      observer.observe(hero);
    }

    requestAnimationFrame(frame);
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
          const currentLevel = LEVELS[seg] || LEVELS[LEVELS.length - 1];
          const nextLevel = LEVELS[seg + 1] || currentLevel;
          const gT = easeInOut((segT - HOLD) / GROW);
          nF = currentLevel.cells + (nextLevel.cells - currentLevel.cells) * gT;
          levelIdx = gT > 0.5 ? Math.min(seg + 1, LEVELS.length - 1) : seg;
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
    initHeroAttentionField();
    initMatrixObservation();
  });

  window.addEventListener("load", () => {
    requestAnimationFrame(revealOnScroll);
  }, { once: true });
})();
