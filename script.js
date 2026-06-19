document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const pullCord = document.getElementById("pullCord");
  const clickStatus = document.getElementById("clickStatus");
  const btnRestart = document.getElementById("btnRestart");

  let reasonsSwiper = null;
  let momentsSwiper = null;
  let lightActivated = false;
  let lightSequenceRunning = false;
  let statusTimers = [];
  const jarAnimationTimers = new Map();
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const confettiColors = ["#FFB400", "#FFE1A0", "#FFFFFF", "#C9445C"];

  function initApp() {
    if (pullCord) {
      pullCord.onclick = handleLightSwitch;
      pullCord.dataset.busy = "false";
    }
  }

  function clearStatusTimers() {
    statusTimers.forEach((timerId) => window.clearTimeout(timerId));
    statusTimers = [];
  }

  function handleLightSwitch() {
    if (!pullCord || lightActivated || lightSequenceRunning) {
      return;
    }

    lightSequenceRunning = true;
    pullCord.dataset.busy = "true";
    pullCord.classList.remove("is-pulled");
    void pullCord.offsetWidth;
    pullCord.classList.add("is-pulled");

    window.setTimeout(() => {
      pullCord.classList.remove("is-pulled");
    }, 460);

    if ("vibrate" in navigator) {
      navigator.vibrate(35);
    }

    clearStatusTimers();
    if (clickStatus) {
      clickStatus.innerHTML = "";
    }

    statusTimers.push(window.setTimeout(() => renderStatusText("тик..."), 500));
    statusTimers.push(window.setTimeout(() => renderStatusText("тик..."), 1300));
    statusTimers.push(window.setTimeout(() => {
      renderStatusText('<span class="highlight">щёлк!</span>');
      activateWebsite();
    }, 2100));
  }

  function renderStatusText(html) {
    if (!clickStatus) {
      return;
    }

    const statusLine = document.createElement("p");
    statusLine.innerHTML = html;
    clickStatus.appendChild(statusLine);
  }

  function activateWebsite() {
    body.dataset.state = "activated";
    lightActivated = true;
    lightSequenceRunning = false;

    if (pullCord) {
      pullCord.dataset.busy = "false";
    }

    launchBigConfetti();

    window.setTimeout(() => {
      initSliders();
    }, 200);
  }

  function initSliders() {
    if (typeof window.Swiper !== "function") {
      return;
    }

    destroySliders();

    const reasonsEl = document.querySelector(".reasons-swiper");
    const momentsEl = document.querySelector(".moments-swiper");

    if (reasonsEl) {
      reasonsSwiper = new window.Swiper(reasonsEl, {
        slidesPerView: 1,
        spaceBetween: 18,
        watchOverflow: true,
        pagination: {
          el: ".reasons-pagination",
          clickable: true
        },
        navigation: {
          nextEl: "#btnNextReason"
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
            spaceBetween: 20
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 22
          }
        }
      });
    }

    if (momentsEl) {
      momentsSwiper = new window.Swiper(momentsEl, {
        effect: "coverflow",
        centeredSlides: true,
        slidesPerView: "auto",
        spaceBetween: 20,
        grabCursor: true,
        watchSlidesProgress: true,
        coverflowEffect: {
          rotate: 0,
          stretch: 0,
          depth: 135,
          modifier: 1.25,
          slideShadows: false
        },
        navigation: {
          nextEl: ".moments-swiper .swiper-button-next",
          prevEl: ".moments-swiper .swiper-button-prev"
        },
        pagination: {
          el: ".moments-pagination",
          clickable: true
        }
      });
    }
  }

  function destroySliders() {
    if (reasonsSwiper && typeof reasonsSwiper.destroy === "function") {
      reasonsSwiper.destroy(true, true);
      reasonsSwiper = null;
    }

    if (momentsSwiper && typeof momentsSwiper.destroy === "function") {
      momentsSwiper.destroy(true, true);
      momentsSwiper = null;
    }
  }

  function initJars() {
    document.querySelectorAll(".jar-item").forEach((jar) => {
      addJarFireflies(jar);
      jar.setAttribute("aria-expanded", jar.dataset.opened === "true" ? "true" : "false");

      jar.onclick = () => {
        openJar(jar);
      };
    });
  }

  function openJar(jar) {
    if (jar.dataset.opened === "true") {
      return;
    }

    clearJarTimers(jar);
    jar.dataset.opened = "true";
    jar.setAttribute("aria-expanded", "true");
    jar.classList.remove("is-formed");

    if (reducedMotionQuery.matches || typeof Element.prototype.animate !== "function") {
      jar.classList.add("is-formed");
      return;
    }

    jar.classList.add("is-forming");

    let formationScheduled = false;
    const scheduleFormation = () => {
      if (jar.dataset.opened !== "true" || formationScheduled) {
        return;
      }

      formationScheduled = true;
      scheduleJarTimer(jar, () => launchWishFireflies(jar), 280);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleFormation, scheduleFormation);
    } else {
      scheduleFormation();
    }

    scheduleJarTimer(jar, scheduleFormation, 700);
  }

  function addJarFireflies(jar) {
    const visual = jar.querySelector(".jar-visual");

    if (!visual || visual.querySelector(".jar-fireflies")) {
      return;
    }

    const layer = document.createElement("span");
    layer.className = "jar-fireflies";
    layer.setAttribute("aria-hidden", "true");

    for (let index = 1; index <= 12; index += 1) {
      const firefly = document.createElement("span");
      firefly.className = `jar-firefly jar-firefly-${index}`;
      layer.appendChild(firefly);
    }

    visual.appendChild(layer);
  }

  function launchWishFireflies(jar) {
    const visual = jar.querySelector(".jar-visual");
    const wish = jar.querySelector(".jar-wish");

    if (!visual || !wish || jar.dataset.opened !== "true") {
      finishJarFormation(jar);
      return;
    }

    const sampledText = sampleWishText(wish);

    if (!sampledText.points.length) {
      finishJarFormation(jar);
      return;
    }

    jar.querySelectorAll(".wish-firefly-flight").forEach((layer) => layer.remove());

    const jarRect = jar.getBoundingClientRect();
    const visualRect = visual.getBoundingClientRect();
    const wishRect = wish.getBoundingClientRect();
    const sourceX = visualRect.left - jarRect.left + visualRect.width / 2;
    const sourceY = visualRect.top - jarRect.top + visualRect.height * 0.18;
    const targetOffsetX = wishRect.left - jarRect.left + (wishRect.width - sampledText.width) / 2;
    const targetOffsetY = wishRect.top - jarRect.top;
    const flightLayer = document.createElement("span");
    let longestFlight = 0;

    flightLayer.className = "wish-firefly-flight";
    flightLayer.setAttribute("aria-hidden", "true");

    sampledText.points.forEach((point, index) => {
      const particle = document.createElement("span");
      const startX = sourceX + randomBetween(-10, 10);
      const startY = sourceY + randomBetween(-5, 8);
      const targetX = targetOffsetX + point.x;
      const targetY = targetOffsetY + point.y;
      const firstArcX = sourceX + (targetX - sourceX) * 0.2 + randomBetween(-54, 54);
      const firstArcY = sourceY - randomBetween(52, 96);
      const secondArcX = sourceX + (targetX - sourceX) * 0.7 + randomBetween(-28, 28);
      const secondArcY = targetY - randomBetween(24, 58);
      const delay = (index % 18) * 9 + randomBetween(0, 90);
      const duration = randomBetween(1050, 1320);

      longestFlight = Math.max(longestFlight, delay + duration);
      particle.className = "wish-firefly-particle";
      particle.style.setProperty("--particle-size", `${randomBetween(2.2, 4.2)}px`);
      flightLayer.appendChild(particle);

      particle.animate([
        {
          opacity: 0,
          transform: `translate3d(${startX}px, ${startY}px, 0) scale(0.3)`
        },
        {
          offset: 0.12,
          opacity: 1,
          transform: `translate3d(${startX}px, ${startY - 8}px, 0) scale(1)`
        },
        {
          offset: 0.4,
          opacity: 1,
          transform: `translate3d(${firstArcX}px, ${firstArcY}px, 0) scale(1.2)`
        },
        {
          offset: 0.72,
          opacity: 0.92,
          transform: `translate3d(${secondArcX}px, ${secondArcY}px, 0) scale(0.9)`
        },
        {
          opacity: 0.96,
          transform: `translate3d(${targetX}px, ${targetY}px, 0) scale(0.7)`
        }
      ], {
        duration,
        delay,
        easing: "cubic-bezier(0.2, 0.72, 0.22, 1)",
        fill: "forwards"
      });
    });

    jar.appendChild(flightLayer);

    scheduleJarTimer(jar, () => {
      finishJarFormation(jar, flightLayer);
    }, longestFlight + 700);
  }

  function sampleWishText(wish) {
    const rect = wish.getBoundingClientRect();
    const computed = window.getComputedStyle(wish);
    const fontSize = Number.parseFloat(computed.fontSize) || 24;
    const parsedLineHeight = Number.parseFloat(computed.lineHeight);
    const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fontSize * 1.14;
    const width = Math.max(120, Math.floor(rect.width));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      return { width, height: 0, points: [] };
    }

    context.font = `${computed.fontWeight} ${fontSize}px ${computed.fontFamily}`;
    const lines = wrapCanvasText(context, wish.textContent.trim(), width - 8);
    const height = Math.max(1, Math.ceil(lines.length * lineHeight + 4));

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#ffffff";
    context.font = `${computed.fontWeight} ${fontSize}px ${computed.fontFamily}`;
    context.textAlign = "center";
    context.textBaseline = "middle";

    lines.forEach((line, index) => {
      context.fillText(line, width / 2, 2 + lineHeight * (index + 0.5));
    });

    const pixels = context.getImageData(0, 0, width, height).data;
    const candidates = [];
    const sampleStep = window.innerWidth <= 520 ? 3 : 2;

    for (let y = 0; y < height; y += sampleStep) {
      for (let x = 0; x < width; x += sampleStep) {
        if (pixels[(y * width + x) * 4 + 3] > 90) {
          candidates.push({ x, y });
        }
      }
    }

    const particleLimit = window.innerWidth <= 520 ? 170 : 220;
    const desiredCount = clamp(Math.round(wish.textContent.trim().length * 6), 150, particleLimit);
    const pointCount = Math.min(desiredCount, candidates.length);
    const stride = candidates.length / pointCount;
    const points = [];

    for (let index = 0; index < pointCount; index += 1) {
      points.push(candidates[Math.floor(index * stride)]);
    }

    return {
      width,
      height,
      points
    };
  }

  function wrapCanvasText(context, text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";

    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;

      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });

    if (line) {
      lines.push(line);
    }

    return lines;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function finishJarFormation(jar, flightLayer = null) {
    if (jar.dataset.opened !== "true") {
      if (flightLayer) {
        flightLayer.remove();
      }
      return;
    }

    jar.classList.remove("is-forming");
    jar.classList.add("is-formed");

    if (flightLayer) {
      flightLayer.classList.add("is-fading");
      scheduleJarTimer(jar, () => flightLayer.remove(), 480);
    }
  }

  function scheduleJarTimer(jar, callback, delay) {
    const timers = jarAnimationTimers.get(jar) || new Set();
    const timerId = window.setTimeout(() => {
      timers.delete(timerId);
      if (timers.size === 0) {
        jarAnimationTimers.delete(jar);
      }
      callback();
    }, delay);

    timers.add(timerId);
    jarAnimationTimers.set(jar, timers);
  }

  function clearJarTimers(jar) {
    const timers = jarAnimationTimers.get(jar);

    if (!timers) {
      return;
    }

    timers.forEach((timerId) => window.clearTimeout(timerId));
    jarAnimationTimers.delete(jar);
  }

  function initStars() {
    document.querySelectorAll(".interactive-star").forEach((star) => {
      star.onclick = (event) => {
        if (star.classList.contains("is-collected")) {
          return;
        }

        star.classList.add("is-collected");
        star.style.pointerEvents = "none";
        star.setAttribute("aria-disabled", "true");
        launchPointConfetti(event.clientX, event.clientY, 28);
      };
    });
  }

  function initRestart() {
    if (!btnRestart) {
      return;
    }

    btnRestart.onclick = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      window.setTimeout(() => {
        body.dataset.state = "dark";
        clearStatusTimers();

        if (clickStatus) {
          clickStatus.innerHTML = "";
        }

        lightActivated = false;
        lightSequenceRunning = false;
        destroySliders();
        resetJars();
        resetStars();

        if (pullCord) {
          pullCord.classList.remove("is-pulled");
          pullCord.dataset.busy = "false";
        }

        initApp();
      }, 800);
    };
  }

  function resetJars() {
    document.querySelectorAll(".jar-item").forEach((jar) => {
      clearJarTimers(jar);
      jar.dataset.opened = "false";
      jar.setAttribute("aria-expanded", "false");
      jar.classList.remove("is-forming", "is-formed");
      jar.querySelectorAll(".wish-firefly-flight").forEach((layer) => layer.remove());
    });
  }

  function resetStars() {
    document.querySelectorAll(".interactive-star").forEach((star) => {
      star.classList.remove("is-collected");
      star.style.removeProperty("transform");
      star.style.removeProperty("opacity");
      star.style.removeProperty("pointer-events");
      star.removeAttribute("aria-disabled");
    });
  }

  function launchBigConfetti() {
    safeConfetti({
      particleCount: 95,
      spread: 72,
      startVelocity: 34,
      origin: { x: 0.5, y: 0.38 },
      colors: confettiColors
    });

    window.setTimeout(() => {
      safeConfetti({
        particleCount: 65,
        angle: 60,
        spread: 58,
        startVelocity: 28,
        origin: { x: 0.18, y: 0.5 },
        colors: confettiColors
      });
    }, 150);

    window.setTimeout(() => {
      safeConfetti({
        particleCount: 65,
        angle: 120,
        spread: 58,
        startVelocity: 28,
        origin: { x: 0.82, y: 0.5 },
        colors: confettiColors
      });
    }, 250);
  }

  function launchLocalConfetti(target, particleCount) {
    const rect = target.getBoundingClientRect();
    const x = clamp((rect.left + rect.width / 2) / window.innerWidth, 0, 1);
    const y = clamp((rect.top + rect.height / 2) / window.innerHeight, 0, 1);

    safeConfetti({
      particleCount,
      spread: 48,
      startVelocity: 22,
      ticks: 80,
      origin: { x, y },
      colors: confettiColors
    });
  }

  function launchPointConfetti(clientX, clientY, particleCount) {
    const x = clamp(clientX / window.innerWidth, 0, 1);
    const y = clamp(clientY / window.innerHeight, 0, 1);

    safeConfetti({
      particleCount,
      spread: 42,
      startVelocity: 20,
      ticks: 70,
      origin: { x, y },
      colors: confettiColors
    });
  }

  function safeConfetti(options) {
    if (typeof window.confetti === "function") {
      window.confetti(options);
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function initImageFallbacks() {
    document.querySelectorAll(".photo-img").forEach((img) => {
      const frame = img.closest(".photo-frame");

      const markLoaded = () => {
        if (frame) {
          frame.classList.add("is-loaded");
          frame.classList.remove("is-missing");
        }
      };

      const markMissing = () => {
        img.classList.add("image-missing");
        if (frame) {
          frame.classList.add("is-missing");
          frame.classList.remove("is-loaded");
        }
      };

      img.addEventListener("load", markLoaded, { once: true });
      img.addEventListener("error", markMissing, { once: true });

      if (img.complete) {
        if (img.naturalWidth > 0) {
          markLoaded();
        } else {
          markMissing();
        }
      }
    });

    document.querySelectorAll(".lamp-img, .cord-handle-img, .jar-image").forEach((img) => {
      const shell = img.closest("[data-asset-shell]") || img.parentElement;

      const markMissing = () => {
        img.classList.add("image-missing");
        if (shell) {
          shell.classList.add("has-missing-asset");
        }
      };

      img.addEventListener("error", markMissing, { once: true });

      if (img.complete && img.naturalWidth === 0) {
        markMissing();
      }
    });
  }

  initImageFallbacks();
  initApp();
  initJars();
  initStars();
  initRestart();
});
