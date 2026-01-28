/**
 * PHOENIX eSPORTS CAFE 网站主 JavaScript 文件
 *
 * 功能说明：
 * 1. Floating HUD + Mobile Overlay 菜单控制（含滚动自动隐藏）
 * 2. IntersectionObserver：reveal-on-scroll / section-fade 进入视口渐显
 * 3. GSAP + ScrollTrigger：全站 gsap-fade-up / gsap-stagger-group + 首页 Hero 视差
 * 4. Access 沉浸式门店 parallax
 * 5. Swiper 初始化（仅相关区块存在时）
 *
 * 重构优化：
 * - 函数封装模块化，提升可维护性
 * - 使用 matchMedia 响应式判断
 * - ScrollTrigger.batch() 批量处理优化性能
 * - IntersectionObserver 单次触发，避免重复动画
 */

// ============================================
// 工具函数
// ============================================

/**
 * 节流函数：限制函数执行频率
 * @param {Function} fn - 要节流的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(fn, wait) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 响应式媒体查询管理器
 * 使用 matchMedia 替代静态宽度判断，支持屏幕旋转等场景
 */
const MediaQueryManager = {
  mobile: window.matchMedia("(max-width: 768px)"),
  tablet: window.matchMedia("(max-width: 1024px)"),

  get isMobile() {
    return this.mobile.matches;
  },

  get isTablet() {
    return this.tablet.matches;
  },

  /**
   * 监听媒体查询变化
   * @param {string} type - 'mobile' 或 'tablet'
   * @param {Function} callback - 变化时的回调函数
   */
  onChange(type, callback) {
    if (this[type]) {
      this[type].addEventListener("change", callback);
    }
  },
};

/**
 * 修复：在创建新的 ScrollTrigger 前，先清理旧实例，避免热重载/局部刷新时出现 DOM 冲突
 * 说明：某些开发环境下（例如热重载），旧的 ScrollTrigger 仍持有已卸载节点的引用，会导致报错或动画异常。
 */
function killAllScrollTriggers() {
  if (typeof ScrollTrigger === "undefined") return;
  try {
    ScrollTrigger.getAll().forEach((t) => t.kill());
  } catch (_) {
    // 忽略：热重载边缘情况（DOM 正在销毁）可能抛错，这里不影响最终功能
  }
}

// ============================================
// 导航模块
// ============================================

/**
 * 初始化导航系统：悬浮 HUD + 全屏移动端遮罩菜单
 */
function initNavigation() {
  const hudHeader = document.querySelector(".hud-header");
  const menuBtn = document.querySelector(".hud-menu-btn");
  const mobileOverlay = document.querySelector(".mobile-menu-overlay");
  const mobileCloseBtn = document.querySelector(".mm-close-btn");
  const mobileLinks = document.querySelectorAll(".mm-link");

  // 全局菜单状态：用于"滚动隐藏头部"逻辑判断（菜单打开时禁止隐藏）
  const menuState = { isOpen: false };

  /**
   * 关闭移动端菜单
   */
  const closeMobileMenu = () => {
    if (!menuBtn || !mobileOverlay) return;
    menuState.isOpen = false;
    menuBtn.classList.remove("is-active");
    mobileOverlay.classList.remove("is-open");
    document.body.style.overflow = "";

    // 重置 GSAP 菜单动效初始状态（确保下次打开能正常播放）
    if (typeof gsap !== "undefined" && mobileLinks.length > 0) {
      gsap.set(mobileLinks, { y: "100%", opacity: 0 });
    }
  };

  /**
   * 打开移动端菜单
   */
  const openMobileMenu = () => {
    if (!menuBtn || !mobileOverlay) return;
    menuState.isOpen = true;
    menuBtn.classList.add("is-active");
    mobileOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";

    // GSAP 进入动画：菜单项逐个上移显示
    if (typeof gsap !== "undefined" && mobileLinks.length > 0) {
      gsap.to(mobileLinks, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2,
      });
    }
  };

  /**
   * 切换菜单状态
   */
  const toggleMenu = () => {
    if (menuState.isOpen) {
      // GSAP 退出动画
      if (typeof gsap !== "undefined" && mobileLinks.length > 0) {
        gsap.to(mobileLinks, {
          y: "100%",
          opacity: 0,
          duration: 0.4,
          ease: "power3.in",
        });
      }
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  // 绑定菜单按钮事件
  if (menuBtn && mobileOverlay) {
    menuBtn.addEventListener("click", toggleMenu);

    // 点击菜单链接：立即关闭遮罩菜单
    mobileLinks.forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    // 点击左上角 X：关闭遮罩菜单
    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener("click", closeMobileMenu);
    }

    // 点击背景遮罩：快速关闭
    const bg = mobileOverlay.querySelector(".mm-bg");
    if (bg) {
      bg.addEventListener("click", closeMobileMenu);
    }

    // ESC：关闭遮罩菜单（桌面端辅助）
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobileMenu();
    });
  }

  // 向下滚动自动隐藏头部
  if (hudHeader) {
    let lastScroll = 0;

    const handleScroll = throttle(() => {
      // 菜单打开时，强制显示头部
      if (menuState.isOpen) {
        hudHeader.classList.remove("is-hidden");
        return;
      }

      const current = window.scrollY;
      if (current > lastScroll && current > 50) {
        hudHeader.classList.add("is-hidden");
      } else {
        hudHeader.classList.remove("is-hidden");
      }
      lastScroll = current;
    }, 16); // 约 60fps

    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  return { closeMobileMenu, menuState };
}

// ============================================
// 视口渐显模块
// ============================================

/**
 * 初始化 IntersectionObserver 渐显动画
 * 优化：元素只触发一次动画，之后取消观察
 */
function initScrollReveal() {
  const revealTargets = document.querySelectorAll(".reveal-on-scroll");
  const fadeTargets = document.querySelectorAll(".section-fade");
  const targets = [...revealTargets, ...fadeTargets];

  if (targets.length === 0) return;

  const show = (el) => el.classList.add("is-visible");

  // 检查浏览器是否支持 IntersectionObserver API
  if (!("IntersectionObserver" in window)) {
    // 不支持时，直接显示所有元素（降级处理）
    targets.forEach(show);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          // 优化：只触发一次，之后取消观察，避免重复动画和性能开销
          obs.unobserve(entry.target);
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

// ============================================
// GSAP 动画模块
// ============================================

/**
 * 初始化 Hero 区域文字进场动画
 * 提取为独立函数，消除重复代码
 * @param {gsap.core.Timeline} timeline - GSAP 时间线
 */
function initHeroTextAnimations(timeline) {
  // 标签淡入
  const labelBox = document.querySelector(".hero-section .label-box");
  if (labelBox) {
    gsap.set(labelBox, { y: 20, autoAlpha: 0 });
    timeline.to(labelBox, {
      y: 0,
      autoAlpha: 1,
      duration: 1,
      delay: 0.5,
    });
  }

  // 标题文字逐行浮现
  const titleLines = document.querySelectorAll(".hero-title .line");
  if (titleLines.length > 0) {
    gsap.set(titleLines, {
      y: 100,
      autoAlpha: 0,
      skewY: 5,
    });
    timeline.to(
      titleLines,
      {
        y: 0,
        autoAlpha: 1,
        skewY: 0,
        duration: 1.4,
        stagger: 0.15,
        ease: "power4.out",
      },
      "-=0.8"
    );
  }

  // 底部内容浮现
  const bottomRow = document.querySelector(".hero-section .bottom-row");
  if (bottomRow) {
    gsap.set(bottomRow, { y: 30, autoAlpha: 0 });
    timeline.to(bottomRow, { y: 0, autoAlpha: 1, duration: 1 }, "-=0.6");
  }
}

/**
 * 初始化 GSAP 动画系统
 */
function initGSAPAnimations() {
  if (typeof gsap === "undefined") return;

  const hasScrollTrigger = typeof ScrollTrigger !== "undefined";

  if (hasScrollTrigger) {
    // 防止热重载：先清理旧 ScrollTrigger
    killAllScrollTriggers();
    gsap.registerPlugin(ScrollTrigger);
  }

  // ============================================
  // 全站通用：.gsap-fade-up 批量处理（性能优化）
  // ============================================
  const fadeElements = document.querySelectorAll(".gsap-fade-up");

  if (fadeElements.length > 0 && hasScrollTrigger) {
    // 使用 ScrollTrigger.batch() 批量处理，比逐个创建更高效
    ScrollTrigger.batch(".gsap-fade-up", {
      onEnter: (batch) => {
        batch.forEach((el, index) => {
          const delay = Number(el.dataset.delay || 0) + index * 0.1;
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 1,
            delay,
            ease: "power3.out",
          });
        });
      },
      onLeave: (batch) => {
        gsap.to(batch, { y: 50, opacity: 0, duration: 0.5 });
      },
      onEnterBack: (batch) => {
        gsap.to(batch, { y: 0, opacity: 1, duration: 0.5 });
      },
      onLeaveBack: (batch) => {
        gsap.to(batch, { y: 50, opacity: 0, duration: 0.5 });
      },
      start: "top 85%",
      end: "bottom 15%",
    });
  } else if (fadeElements.length > 0) {
    // 降级：无 ScrollTrigger 时直接显示
    gsap.to(fadeElements, { y: 0, opacity: 1, duration: 1, stagger: 0.1 });
  }

  // ============================================
  // 分组渐入：.gsap-stagger-group
  // ============================================
  const staggerGroups = document.querySelectorAll(".gsap-stagger-group");

  if (staggerGroups.length > 0 && hasScrollTrigger) {
    staggerGroups.forEach((group) => {
      if (!group?.children?.length) return;
      gsap.to(group.children, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: group,
          start: "top 85%",
        },
      });
    });
  }

  // ============================================
  // Access 页：沉浸式视差
  // ============================================
  if (hasScrollTrigger) {
    initImmersiveParallax();
    initHeroParallax();
  }

  // ============================================
  // 首页 Hero：文字进场动画
  // ============================================
  const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  initHeroTextAnimations(heroTimeline);

  // 页面加载完成后刷新 ScrollTrigger
  if (hasScrollTrigger) {
    window.addEventListener("load", () => {
      ScrollTrigger.refresh();
    });
  }
}

/**
 * 初始化 Access 页沉浸式视差效果
 */
function initImmersiveParallax() {
  const immersiveSections = document.querySelectorAll(".immersive-store");
  if (immersiveSections.length === 0) return;

  immersiveSections.forEach((section) => {
    if (!section) return;
    const bgImg = section.querySelector(".parallax-img");
    const bigNum = section.querySelector(".huge-number");

    // 背景图视差
    if (bgImg) {
      gsap.fromTo(
        bgImg,
        { yPercent: -15 },
        {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }

    // 大数字视差（增强纵深层次）
    if (bigNum) {
      const speed = Number(bigNum.dataset.speed || 0.2) || 0.2;
      gsap.to(bigNum, {
        y: 100 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  });
}

/**
 * 初始化首页 Hero 背景视差缩放
 */
function initHeroParallax() {
  const heroImg = document.querySelector(".hero-bg img");
  const heroSec = document.querySelector(".hero-section");

  if (!heroImg || !heroSec) return;

  gsap.to(heroImg, {
    scale: 1.15,
    yPercent: 10,
    ease: "none",
    scrollTrigger: {
      trigger: heroSec,
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
}

// ============================================
// Swiper 模块
// ============================================

/**
 * 初始化电影感 Swiper（首页店内环境）
 */
function initCinematicSwiper() {
  const cinematicSwiperEl = document.querySelector(".cinematic-swiper");
  if (!cinematicSwiperEl || !window.Swiper) return;

  const root =
    cinematicSwiperEl.closest(".store-environment-cinematic") || document;

  const fractionEl = root.querySelector(".swiper-pagination-fraction");
  const nextEl = root.querySelector(".swiper-button-next");
  const prevEl = root.querySelector(".swiper-button-prev");
  const progressBar = root.querySelector(".progress-bar-track");

  new Swiper(cinematicSwiperEl, {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    speed: 800,
    effect: "fade",
    fadeEffect: { crossFade: true },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: !MediaQueryManager.isMobile,
    },
    pagination: fractionEl
      ? {
          el: fractionEl,
          type: "fraction",
          formatFractionCurrent: (n) => (n < 10 ? "0" + n : n),
          formatFractionTotal: (n) => (n < 10 ? "0" + n : n),
        }
      : false,
    navigation: nextEl && prevEl ? { nextEl, prevEl } : false,
    on: {
      autoplayTimeLeft(s, time, progress) {
        if (progressBar) {
          progressBar.style.width = (1 - progress) * 100 + "%";
        }
      },
      slideChangeTransitionStart() {
        if (progressBar) {
          progressBar.style.width = "0%";
        }
      },
    },
  });

  // 响应屏幕变化，更新 pauseOnMouseEnter 设置
  MediaQueryManager.onChange("mobile", (e) => {
    // Swiper 不支持动态修改 autoplay 配置，此处仅作为示例
    // 如需完整支持，需要销毁重建 Swiper 实例
  });
}

/**
 * 初始化 Schedule 横向滑动 Swiper
 */
function initScheduleSwiper() {
  const scheduleSwiperEl = document.querySelector(".schedule-swiper");
  if (!scheduleSwiperEl || !window.Swiper) return;

  const root = scheduleSwiperEl.closest(".schedule-visual") || document;
  const scrollbarEl = root.querySelector(".schedule-scrollbar");

  new Swiper(scheduleSwiperEl, {
    slidesPerView: "auto",
    spaceBetween: 24,
    freeMode: true,
    allowTouchMove: true,
    simulateTouch: true,
    touchEventsTarget: "container",
    touchStartPreventDefault: false,
    touchAngle: 30,
    scrollbar: scrollbarEl
      ? {
          el: scrollbarEl,
          draggable: true,
          hide: false,
        }
      : undefined,
    breakpoints: {
      320: { spaceBetween: 12 },
      480: { spaceBetween: 16 },
      640: { spaceBetween: 20 },
      768: { spaceBetween: 24 },
      1024: { spaceBetween: 32 },
    },
  });
}

// ============================================
// 主入口
// ============================================

/**
 * 应用初始化
 * 等待 DOM 内容加载完成后执行
 */
document.addEventListener("DOMContentLoaded", () => {
  // 初始化各模块
  initNavigation();
  initScrollReveal();
  initGSAPAnimations();
  initCinematicSwiper();
  initScheduleSwiper();
});
