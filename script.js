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

      jar.onclick = () => {
        if (jar.dataset.opened === "true") {
          return;
        }

        jar.dataset.opened = "true";
      };
    });
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
      jar.dataset.opened = "false";
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
