/**
 * PHOENIX eSPORTS CAFE 网站主 JavaScript 文件
 *
 * 功能说明：
 * 1. 移动端导航菜单的展开/收起控制
 * 2. 页面滚动时的导航栏自动隐藏/显示
 * 3. Hero 区域的滚动进度动画效果
 * 4. 视差滚动效果（Parallax）
 * 5. 元素进入视口时的渐显动画
 * 6. 店内环境轮播图的初始化
 */

// FIX: Kill all ScrollTriggers before creating new ones to avoid DOM conflicts during reload
// 在页面加载或热重载时，立即清理所有现有的 ScrollTrigger 实例
if (typeof ScrollTrigger !== "undefined") {
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

// 等待 DOM 内容加载完成后执行
document.addEventListener("DOMContentLoaded", () => {
  // ============================================
  // NEW NAVIGATION SYSTEM: Floating HUD + Mobile Overlay
  // ============================================
  const hudHeader = document.querySelector(".hud-header");
  const menuBtn = document.querySelector(".hud-menu-btn");
  const mobileOverlay = document.querySelector(".mobile-menu-overlay");
  const mobileLinks = document.querySelectorAll(".mm-link");
  const heroSection = document.querySelector(".hero-section"); // Hero 区域

  // Global menu state for header auto-hide logic
  let globalMenuState = { isOpen: false };

  if (menuBtn && mobileOverlay) {
    menuBtn.addEventListener("click", () => {
      globalMenuState.isOpen = !globalMenuState.isOpen;
      menuBtn.classList.toggle("is-active", globalMenuState.isOpen);
      mobileOverlay.classList.toggle("is-open", globalMenuState.isOpen);
      document.body.style.overflow = globalMenuState.isOpen ? "hidden" : ""; // Lock scroll

      if (globalMenuState.isOpen) {
        // GSAP Enter Animation: Staggered reveal
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
        // GSAP Exit Animation
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

    // Close on link click
    if (mobileLinks.length > 0) {
      mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
          globalMenuState.isOpen = false;
          menuBtn.classList.remove("is-active");
          mobileOverlay.classList.remove("is-open");
          document.body.style.overflow = "";

          // Reset GSAP animation state
          if (typeof gsap !== "undefined") {
            gsap.set(mobileLinks, { y: "100%", opacity: 0 });
          }
        });
      });
    }
  }

  // Auto-hide header on scroll down
  // CRITICAL FIX: Do NOT hide header when mobile menu is open
  if (hudHeader) {
    let lastScroll = 0;

    window.addEventListener("scroll", () => {
      // CRITICAL: Don't hide header if mobile menu is open
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
    });
  }

  // ============================================
  // 页面滚动相关功能
  // ============================================
  let ticking = false; // 节流标志，防止滚动事件过于频繁触发

  /**
   * 更新 Hero 区域的滚动进度动画
   * 根据滚动位置计算进度值，更新 CSS 变量用于控制后续内容的堆叠效果
   */
  const updateHeroProgress = () => {
    if (!heroSection) return; // 安全检查

    const heroHeight = Math.max(heroSection.offsetHeight, 1); // Hero 区域高度
    // 计算滚动进度，范围 0-1
    const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);

    // 计算缓动后的堆叠进度值（使用幂函数实现缓动效果）
    // 这个变量用于控制环境区域的堆叠效果，需要保留
    const easedStack = Math.pow(progress, 0.75);
    // 更新 CSS 变量，用于控制后续内容的动态堆叠效果
    document.documentElement.style.setProperty(
      "--stack-progress",
      easedStack.toFixed(3)
    );
  };

  /**
   * 处理滚动事件的主函数
   * 更新 Hero 区域的滚动进度动画
   */
  const handleScroll = () => {
    updateHeroProgress(); // 更新 Hero 动画
    ticking = false; // 重置节流标志
  };

  // 监听滚动事件，使用 requestAnimationFrame 优化性能
  window.addEventListener("scroll", () => {
    if (ticking) return; // 如果正在处理，跳过本次事件
    ticking = true; // 设置处理标志
    window.requestAnimationFrame(handleScroll); // 在下一帧执行处理函数
  });

  // 初始化：页面加载时执行一次
  updateHeroProgress();

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
  // New Cinematic Hero Animations
  // ============================================
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    // 清理所有现有的 ScrollTrigger 实例（防止热重载时的 removeChild 错误）
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    // 注册 ScrollTrigger 插件
    gsap.registerPlugin(ScrollTrigger);

    // 1. 背景图视差缩放 (Cinematic Parallax Zoom)
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
    } else {
      console.warn("Hero image or section not found for parallax effect");
    }

    // 页面加载完成后刷新 ScrollTrigger（确保所有元素都已渲染）
    window.addEventListener("load", () => {
      ScrollTrigger.refresh();
    });

    // 2. 文字进场动画 (使用 autoAlpha 防止消失 Bug)
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
    } else {
      console.warn("Hero label-box not found");
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
    } else {
      console.warn("Hero title lines not found");
    }

    // 底部内容浮现
    const bottomRow = document.querySelector(".hero-section .bottom-row");
    if (bottomRow) {
      // 先设置初始状态
      gsap.set(bottomRow, { y: 30, autoAlpha: 0 });
      heroTimeline.to(bottomRow, { y: 0, autoAlpha: 1, duration: 1 }, "-=0.6");
    } else {
      console.warn("Hero bottom-row not found");
    }
  } else if (typeof gsap !== "undefined") {
    // Fallback: 如果没有 ScrollTrigger，使用基础 GSAP 动画
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
  // 店内环境轮播图初始化
  // ============================================
  /**
   * 使用 Swiper 库初始化店内环境图片轮播
   * 配置为淡入淡出效果，自动播放，带进度条和导航按钮
   */
  const envSwiperEl = document.querySelector(".environment-slider");
  if (envSwiperEl && window.Swiper) {
    // 检测是否为移动设备
    const isMobile = window.innerWidth <= 640;

    // Null safety: Check pagination and navigation elements exist
    const paginationEl = document.querySelector(".env-pagination");
    const nextBtn = document.querySelector(".env-next");
    const prevBtn = document.querySelector(".env-prev");

    const swiper = new Swiper(envSwiperEl, {
      effect: "fade", // 使用淡入淡出切换效果
      fadeEffect: { crossFade: true }, // 启用交叉淡入淡出
      speed: isMobile ? 600 : 1000, // 移动端更快切换
      parallax: !isMobile, // 移动端禁用视差效果以提升性能
      slidesPerView: 1,
      spaceBetween: 0,
      autoplay: {
        delay: isMobile ? 4000 : 5000, // 移动端更快切换
        disableOnInteraction: false, // 用户交互后不停止自动播放
        pauseOnMouseEnter: !isMobile, // 移动端不暂停
      },
      pagination: paginationEl
        ? {
            el: paginationEl, // 进度条容器
            type: "progressbar", // 使用进度条样式
          }
        : false,
      navigation:
        nextBtn && prevBtn
          ? {
              nextEl: nextBtn, // 下一个按钮
              prevEl: prevBtn, // 上一个按钮
            }
          : false,
      // 移动端触摸设置
      touchEventsTarget: "container",
      touchRatio: 1,
      touchAngle: 45,
      grabCursor: true,
      // 移动端优化
      watchOverflow: true,
      preventClicks: true,
      preventClicksPropagation: true,
      // Swiper 生命周期回调
      on: {
        // 初始化时，为当前活动幻灯片添加 is-active 类
        init(swiperInstance) {
          swiperInstance.slides.forEach((slide, idx) =>
            slide.classList.toggle(
              "is-active",
              idx === swiperInstance.activeIndex
            )
          );
        },
        // 切换开始时，移除所有 is-active 类
        slideChangeTransitionStart(swiperInstance) {
          swiperInstance.slides.forEach((slide) =>
            slide.classList.remove("is-active")
          );
        },
        // 切换结束时，为新的活动幻灯片添加 is-active 类
        slideChangeTransitionEnd(swiperInstance) {
          swiperInstance.slides[swiperInstance.activeIndex]?.classList.add(
            "is-active"
          );
        },
      },
    });
  }
});
