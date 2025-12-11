document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelector(".nav_links");
  const navToggle = document.querySelector(".nav_toggle");
  const heroSection = document.querySelector(".begining");
  const heroMessage = document.querySelector(".begining_message");
  const heroLines = heroMessage
    ? heroMessage.querySelectorAll(".scroll-slide-right, .scroll-slide-left")
    : [];

  if (navLinks && navToggle) {
    const closeNav = () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.addEventListener("click", (e) => {
      if (e.target.classList.contains("nav-link")) {
        closeNav();
      }
    });

    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        closeNav();
      }
    });
  }

  const header = document.querySelector("header");
  let lastScrollY = window.scrollY;
  let ticking = false;
  const parallaxTargets = Array.from(document.querySelectorAll(".parallax-bg"));

  const updateParallax = () => {
    if (!parallaxTargets.length) return;
    const viewportHeight = window.innerHeight || 1;
    parallaxTargets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;
      const clamped = Math.max(-1, Math.min(1, distanceFromCenter / viewportHeight));
      const offset = -clamped * 35;
      el.style.transform = `translateY(${offset}px)`;
    });
  };

  const updateHeroProgress = () => {
    if (!heroSection || !heroMessage) return;
    const heroHeight = Math.max(heroSection.offsetHeight, 1);
    const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);

    if (progress <= 0.02) {
      heroMessage.classList.remove("is-sliding-out");
      heroLines.forEach((el) => {
        el.style.transform = "";
        el.style.opacity = "";
      });
      return;
    }

    heroMessage.classList.toggle("is-sliding-out", progress > 0.12);

    heroLines.forEach((el) => {
      const dir = el.classList.contains("scroll-slide-left") ? -1 : 1;
      const offset = Math.min(90 * progress, 90);
      const yShift = -32 * progress;
      const scale = 1 - progress * 0.1;
      el.style.transform = `translateY(${yShift}px) translateX(${
        dir * offset
      }px) scale(${scale})`;
      el.style.opacity = `${Math.max(0, 1 - progress * 1.4)}`;
    });

    const easedStack = Math.pow(progress, 0.75);
    document.documentElement.style.setProperty(
      "--stack-progress",
      easedStack.toFixed(3)
    );
  };

  const handleScroll = () => {
    updateHeroProgress();
    updateParallax();

    const currentY = window.scrollY;
    const navIsOpen = navLinks?.classList.contains("open");

    // Keep header visible when menu is open
    if (navIsOpen) {
      header?.classList.remove("nav-hidden");
      lastScrollY = currentY;
      ticking = false;
      return;
    }

    const scrolledDown = currentY > lastScrollY + 10 && currentY > 80;
    const scrolledUp = currentY < lastScrollY - 10;

    if (scrolledDown) {
      header?.classList.add("nav-hidden");
    } else if (scrolledUp) {
      header?.classList.remove("nav-hidden");
    }

    lastScrollY = currentY;
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(handleScroll);
  });

  updateHeroProgress();
  updateParallax();
  window.addEventListener("resize", updateParallax);

  const revealTargets = document.querySelectorAll(".reveal-on-scroll");
  const fadeTargets = document.querySelectorAll(".section-fade");
  const targets = [...revealTargets, ...fadeTargets];
  if (targets.length) {
    // Staggered initial reveal for hero lines so animation is visible immediately
    const revealLines = document.querySelectorAll(
      ".scroll-slide-right, .scroll-slide-left"
    );
    revealLines.forEach((el, idx) => {
      setTimeout(() => el.classList.add("is-visible"), idx * 200);
    });

    const show = (el) => el.classList.add("is-visible");

    if (!("IntersectionObserver" in window)) {
      targets.forEach(show);
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              show(entry.target);
            } else {
              entry.target.classList.remove("is-visible");
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: "0px 0px 0px 0px",
        }
      );

      targets.forEach((el) => observer.observe(el));
    }
  }

  // Environment Swiper (cinematic autoplay slider)
  const envSwiperEl = document.querySelector(".environment-slider");
  if (envSwiperEl && window.Swiper) {
    const swiper = new Swiper(envSwiperEl, {
      effect: "fade",
      fadeEffect: { crossFade: true },
      speed: 1000,
      parallax: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: ".env-pagination",
        type: "progressbar",
      },
      navigation: {
        nextEl: ".env-next",
        prevEl: ".env-prev",
      },
      on: {
        init(swiperInstance) {
          swiperInstance.slides.forEach((slide, idx) =>
            slide.classList.toggle("is-active", idx === swiperInstance.activeIndex)
          );
        },
        slideChangeTransitionStart(swiperInstance) {
          swiperInstance.slides.forEach((slide) =>
            slide.classList.remove("is-active")
          );
        },
        slideChangeTransitionEnd(swiperInstance) {
          swiperInstance.slides[swiperInstance.activeIndex]?.classList.add(
            "is-active"
          );
        },
      },
    });
  }
});
