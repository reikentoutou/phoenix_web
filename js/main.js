/**
 * PHOENIX eSPORTS CAFE 网站主 JavaScript 文件
 *
 * 功能说明：
 * 1. Floating HUD + Mobile Overlay 菜单控制（含滚动自动隐藏）
 * 2. IntersectionObserver：reveal-on-scroll / section-fade 进入视口渐显
 * 3. GSAP + ScrollTrigger：全站 gsap-fade-up / gsap-stagger-group + 首页 Hero 视差
 * 4. Access 沉浸式门店 parallax
 * 5. Swiper 初始化（仅相关区块存在时）
 */

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

// 等待 DOM 内容加载完成后执行
document.addEventListener("DOMContentLoaded", () => {
  // ============================================
  // 导航系统：悬浮 HUD + 全屏移动端遮罩菜单
  // ============================================
  const hudHeader = document.querySelector(".hud-header");
  const menuBtn = document.querySelector(".hud-menu-btn");
  const mobileOverlay = document.querySelector(".mobile-menu-overlay");
  const mobileCloseBtn = document.querySelector(".mm-close-btn");
  const mobileLinks = document.querySelectorAll(".mm-link");

  // 全局菜单状态：用于“滚动隐藏头部”逻辑判断（菜单打开时禁止隐藏）
  let globalMenuState = { isOpen: false };

  const closeMobileMenu = () => {
    if (!menuBtn || !mobileOverlay) return;
    globalMenuState.isOpen = false;
    menuBtn.classList.remove("is-active");
    mobileOverlay.classList.remove("is-open");
    document.body.style.overflow = "";

    // 重置 GSAP 菜单动效初始状态（确保下次打开能正常播放）
    if (typeof gsap !== "undefined" && mobileLinks.length > 0) {
      gsap.set(mobileLinks, { y: "100%", opacity: 0 });
    }
  };

  if (menuBtn && mobileOverlay) {
    menuBtn.addEventListener("click", () => {
      globalMenuState.isOpen = !globalMenuState.isOpen;
      menuBtn.classList.toggle("is-active", globalMenuState.isOpen);
      mobileOverlay.classList.toggle("is-open", globalMenuState.isOpen);
      // 打开菜单时锁定页面滚动；关闭时恢复（注意：这会影响 body 滚动，仅用于移动端全屏菜单）
      document.body.style.overflow = globalMenuState.isOpen ? "hidden" : "";

      if (globalMenuState.isOpen) {
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
      } else {
        // GSAP 退出动画：菜单项下移隐藏
        if (typeof gsap !== "undefined" && mobileLinks.length > 0) {
          gsap.to(mobileLinks, {
            y: "100%",
            opacity: 0,
            duration: 0.4,
            ease: "power3.in",
          });
        }
      }
    });

    // 点击菜单链接：立即关闭遮罩菜单（避免跳转后遮罩残留）
    if (mobileLinks.length > 0) {
      mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
          closeMobileMenu();
        });
      });
    }

    // 点击左上角 X：关闭遮罩菜单
    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener("click", closeMobileMenu);
    }

    // 点击背景遮罩：快速关闭（更符合移动端习惯）
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
  // 关键：菜单打开时禁止隐藏头部（否则用户会“找不到关闭入口”）
  if (hudHeader) {
    let lastScroll = 0;

    window.addEventListener(
      "scroll",
      () => {
        // 关键：菜单打开时，强制显示头部
        if (globalMenuState.isOpen) {
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
      },
      { passive: true }
    );
  }

  // ============================================
  // 元素进入视口时的渐显动画
  // ============================================
  // 获取所有需要滚动渐显效果的元素
  const revealTargets = document.querySelectorAll(".reveal-on-scroll"); // 滚动时渐显的元素
  const fadeTargets = document.querySelectorAll(".section-fade"); // 淡入淡出的区域
  const targets = [...revealTargets, ...fadeTargets]; // 合并所有目标元素

  if (targets.length) {
    /**
     * 显示元素的辅助函数
     * 添加 is-visible 类以触发 CSS 动画
     */
    const show = (el) => el.classList.add("is-visible");

    // 检查浏览器是否支持 IntersectionObserver API
    if (!("IntersectionObserver" in window)) {
      // 不支持时，直接显示所有元素（降级处理）
      targets.forEach(show);
    } else {
      /**
       * 使用 IntersectionObserver 监听元素进入视口
       * 当元素进入视口时触发渐显动画，离开时移除动画类
       */
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // 元素进入视口，显示动画
              show(entry.target);
            } else {
              // 元素离开视口，移除动画类（可选，用于重复触发）
              entry.target.classList.remove("is-visible");
            }
          });
        },
        {
          threshold: 0.2, // 当元素 20% 可见时触发
          rootMargin: "0px 0px 0px 0px", // 不扩展根边距
        }
      );

      // 开始观察所有目标元素
      targets.forEach((el) => observer.observe(el));
    }
  }

  // ============================================
  // GSAP 动画系统（全站）
  // ============================================
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    // 防止热重载：先清理旧 ScrollTrigger，避免 removeChild / 失效节点引用
    killAllScrollTriggers();

    // 注册 ScrollTrigger 插件（只在存在时执行）
    gsap.registerPlugin(ScrollTrigger);

    // ============================================
    // 全站通用：.gsap-fade-up 进入视口浮现
    // ============================================
    const fadeElements = document.querySelectorAll(".gsap-fade-up");
    if (fadeElements.length > 0) {
      fadeElements.forEach((el) => {
        if (!el) return;
        const delay = Number(el.dataset.delay || 0) || 0;
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 1,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }

    // 分组渐入：父容器加 .gsap-stagger-group，子元素按顺序 stagger 出场
    const staggerGroups = document.querySelectorAll(".gsap-stagger-group");
    if (staggerGroups.length > 0) {
      staggerGroups.forEach((group) => {
        if (!group || !group.children || group.children.length === 0) return;
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
    // Access 页：沉浸式视差（仅当页面存在 .immersive-store 时启用）
    // ============================================
    const immersiveSections = document.querySelectorAll(".immersive-store");
    if (immersiveSections.length > 0) {
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

    // 首页 Hero：背景视差缩放（电影感“缓慢推镜”效果）
    const heroImg = document.querySelector(".hero-bg img");
    const heroSec = document.querySelector(".hero-section");

    if (heroImg && heroSec) {
      // 确保元素存在且已渲染
      gsap.to(heroImg, {
        scale: 1.15, // 向下滚动时缓慢放大
        yPercent: 10, // 同时微微向下移动
        ease: "none", // 线性动画，保证跟手感
        scrollTrigger: {
          trigger: heroSec,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true, // 刷新时重新计算
        },
      });
    }

    // 页面加载完成后刷新 ScrollTrigger（确保所有元素都已渲染）
    window.addEventListener("load", () => {
      ScrollTrigger.refresh();
    });

    // 首页 Hero：文字进场动画（使用 autoAlpha 避免闪烁/消失）
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 标签淡入
    const labelBox = document.querySelector(".hero-section .label-box");
    if (labelBox) {
      // 先设置初始状态
      gsap.set(labelBox, { y: 20, autoAlpha: 0 });
      heroTimeline.to(labelBox, {
        y: 0,
        autoAlpha: 1,
        duration: 1,
        delay: 0.5,
      });
    }

    // 标题文字逐行浮现
    const titleLines = document.querySelectorAll(".hero-title .line");
    if (titleLines.length > 0) {
      // 先设置初始状态
      gsap.set(titleLines, {
        y: 100,
        autoAlpha: 0,
        skewY: 5,
      });
      heroTimeline.to(
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
      // 先设置初始状态
      gsap.set(bottomRow, { y: 30, autoAlpha: 0 });
      heroTimeline.to(bottomRow, { y: 0, autoAlpha: 1, duration: 1 }, "-=0.6");
    }
  } else if (typeof gsap !== "undefined") {
    // 降级：没有 ScrollTrigger 时，仅使用基础 GSAP 时间线（不做滚动驱动）
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    const labelBox = document.querySelector(".hero-section .label-box");
    if (labelBox) {
      gsap.set(labelBox, { y: 20, autoAlpha: 0 });
      heroTimeline.to(labelBox, {
        y: 0,
        autoAlpha: 1,
        duration: 1,
        delay: 0.5,
      });
    }

    const titleLines = document.querySelectorAll(".hero-title .line");
    if (titleLines.length > 0) {
      gsap.set(titleLines, { y: 100, autoAlpha: 0, skewY: 5 });
      heroTimeline.to(
        titleLines,
        { y: 0, autoAlpha: 1, skewY: 0, duration: 1.2, stagger: 0.2 },
        "-=0.8"
      );
    }

    const bottomRow = document.querySelector(".hero-section .bottom-row");
    if (bottomRow) {
      gsap.set(bottomRow, { y: 30, autoAlpha: 0 });
      heroTimeline.to(bottomRow, { y: 0, autoAlpha: 1, duration: 1 }, "-=0.8");
    }
  }

  // ============================================
  // 首页：店内环境电影感 Swiper（仅存在 .cinematic-swiper 时初始化）
  // ============================================
  const cinematicSwiperEl = document.querySelector(".cinematic-swiper");

  if (cinematicSwiperEl && window.Swiper) {
    const root =
      cinematicSwiperEl.closest(".store-environment-cinematic") || document;

    const fractionEl = root.querySelector(".swiper-pagination-fraction");
    const nextEl = root.querySelector(".swiper-button-next");
    const prevEl = root.querySelector(".swiper-button-prev");
    const progressBar = root.querySelector(".progress-bar-track");

    const isMobile = window.innerWidth <= 768;

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
        pauseOnMouseEnter: !isMobile,
      },
      pagination: fractionEl
        ? {
            el: fractionEl,
            type: "fraction",
            formatFractionCurrent(number) {
              return number < 10 ? "0" + number : number;
            },
            formatFractionTotal(number) {
              return number < 10 ? "0" + number : number;
            },
          }
        : false,
      navigation:
        nextEl && prevEl
          ? {
              nextEl,
              prevEl,
            }
          : false,
      on: {
        autoplayTimeLeft(s, time, progress) {
          if (!progressBar) return;
          progressBar.style.width = (1 - progress) * 100 + "%";
        },
        slideChangeTransitionStart() {
          if (!progressBar) return;
          progressBar.style.width = "0%";
        },
      },
    });
  }

  // ============================================
  // 首页：Schedule 横向滑动 Swiper（移动端可手指横滑）
  // ============================================
  const scheduleSwiperEl = document.querySelector(".schedule-swiper");
  if (scheduleSwiperEl && window.Swiper) {
    const root = scheduleSwiperEl.closest(".schedule-visual") || document;
    const scrollbarEl = root.querySelector(".schedule-scrollbar");

    new Swiper(scheduleSwiperEl, {
      slidesPerView: "auto",
      spaceBetween: 24,
      freeMode: true,
      // 移动端：在“纵向滚动页面”里提升横向滑动的可用性/手感
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
        320: { spaceBetween: 16 },
        640: { spaceBetween: 24 },
      },
    });
  }
});
