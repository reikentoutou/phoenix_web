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

// 等待 DOM 内容加载完成后执行
document.addEventListener("DOMContentLoaded", () => {
  // ============================================
  // 导航菜单相关元素选择
  // ============================================
  const navLinks = document.querySelector(".nav_links"); // 导航链接容器
  const navToggle = document.querySelector(".nav_toggle"); // 移动端菜单切换按钮
  const heroSection = document.querySelector(".begining"); // Hero 区域
  const heroMessage = document.querySelector(".begining_message"); // Hero 消息容器
  // 获取所有需要滚动动画的文字行
  const heroLines = heroMessage
    ? heroMessage.querySelectorAll(".scroll-slide-right, .scroll-slide-left")
    : [];

  // ============================================
  // 移动端导航菜单控制功能
  // ============================================
  if (navLinks && navToggle) {
    /**
     * 关闭导航菜单
     * 移除 open 类并更新 aria-expanded 属性
     */
    const closeNav = () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    // 点击菜单切换按钮时，切换菜单的显示/隐藏状态
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // 点击导航链接时，自动关闭菜单（移动端体验优化）
    navLinks.addEventListener("click", (e) => {
      if (e.target.classList.contains("nav-link")) {
        closeNav();
      }
    });

    // 点击菜单外部区域时，自动关闭菜单
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        closeNav();
      }
    });
  }

  // ============================================
  // 页面滚动相关功能
  // ============================================
  const header = document.querySelector("header"); // 页头元素
  let lastScrollY = window.scrollY; // 记录上次滚动位置，用于判断滚动方向
  let ticking = false; // 节流标志，防止滚动事件过于频繁触发
  // 获取所有需要视差效果的元素（当前代码中未使用，保留用于未来扩展）
  const parallaxTargets = Array.from(document.querySelectorAll(".parallax-bg"));

  /**
   * 更新视差滚动效果
   * 根据元素在视口中的位置，动态调整其垂直偏移量
   * 实现元素随滚动速度不同而移动的视差效果
   */
  const updateParallax = () => {
    if (!parallaxTargets.length) return; // 如果没有视差元素，直接返回
    const viewportHeight = window.innerHeight || 1; // 视口高度
    parallaxTargets.forEach((el) => {
      const rect = el.getBoundingClientRect(); // 获取元素位置信息
      const elementCenter = rect.top + rect.height / 2; // 元素中心点位置
      const viewportCenter = viewportHeight / 2; // 视口中心点位置
      const distanceFromCenter = elementCenter - viewportCenter; // 距离视口中心的距离
      // 将距离标准化到 -1 到 1 之间
      const clamped = Math.max(
        -1,
        Math.min(1, distanceFromCenter / viewportHeight)
      );
      const offset = -clamped * 35; // 计算偏移量（最大 35px）
      el.style.transform = `translateY(${offset}px)`; // 应用变换
    });
  };

  /**
   * 更新 Hero 区域的滚动进度动画
   * 根据滚动位置计算进度值，并更新文字的位置、透明度和缩放
   * 同时更新 CSS 变量用于控制后续内容的堆叠效果
   */
  const updateHeroProgress = () => {
    if (!heroSection || !heroMessage) return; // 安全检查
    const heroHeight = Math.max(heroSection.offsetHeight, 1); // Hero 区域高度
    // 计算滚动进度，范围 0-1
    const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);

    // 如果滚动很少（接近顶部），重置所有动画效果
    if (progress <= 0.02) {
      heroMessage.classList.remove("is-sliding-out");
      heroLines.forEach((el) => {
        el.style.transform = "";
        el.style.opacity = "";
      });
      return;
    }

    // 当进度超过 12% 时，添加滑出效果类
    heroMessage.classList.toggle("is-sliding-out", progress > 0.12);

    // 为每个文字行应用滚动动画
    heroLines.forEach((el) => {
      const dir = el.classList.contains("scroll-slide-left") ? -1 : 1; // 确定滑动方向
      const offset = Math.min(90 * progress, 90); // 水平偏移量（最大 90px）
      const yShift = -32 * progress; // 垂直偏移量
      const scale = 1 - progress * 0.1; // 缩放比例（最小 0.9）
      // 应用变换：垂直移动、水平移动、缩放
      el.style.transform = `translateY(${yShift}px) translateX(${
        dir * offset
      }px) scale(${scale})`;
      // 透明度随进度递减
      el.style.opacity = `${Math.max(0, 1 - progress * 1.4)}`;
    });

    // 计算缓动后的堆叠进度值（使用幂函数实现缓动效果）
    const easedStack = Math.pow(progress, 0.75);
    // 更新 CSS 变量，用于控制后续内容的动态堆叠效果
    document.documentElement.style.setProperty(
      "--stack-progress",
      easedStack.toFixed(3)
    );
  };

  /**
   * 处理滚动事件的主函数
   * 整合所有滚动相关的更新操作，并控制导航栏的显示/隐藏
   */
  const handleScroll = () => {
    updateHeroProgress(); // 更新 Hero 动画
    updateParallax(); // 更新视差效果

    const currentY = window.scrollY; // 当前滚动位置
    const navIsOpen = navLinks?.classList.contains("open"); // 检查菜单是否打开

    // 如果菜单打开，保持导航栏可见（不隐藏）
    if (navIsOpen) {
      header?.classList.remove("nav-hidden");
      lastScrollY = currentY;
      ticking = false;
      return;
    }

    // 判断滚动方向
    // 向下滚动：当前位置大于上次位置 + 10px，且已滚动超过 80px
    const scrolledDown = currentY > lastScrollY + 10 && currentY > 80;
    // 向上滚动：当前位置小于上次位置 - 10px
    const scrolledUp = currentY < lastScrollY - 10;

    // 根据滚动方向显示/隐藏导航栏
    if (scrolledDown) {
      header?.classList.add("nav-hidden"); // 向下滚动时隐藏
    } else if (scrolledUp) {
      header?.classList.remove("nav-hidden"); // 向上滚动时显示
    }

    lastScrollY = currentY; // 更新上次滚动位置
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
  updateParallax();
  // 窗口大小改变时重新计算视差效果
  window.addEventListener("resize", updateParallax);

  // ============================================
  // 元素进入视口时的渐显动画
  // ============================================
  // 获取所有需要滚动渐显效果的元素
  const revealTargets = document.querySelectorAll(".reveal-on-scroll"); // 滚动时渐显的元素
  const fadeTargets = document.querySelectorAll(".section-fade"); // 淡入淡出的区域
  const targets = [...revealTargets, ...fadeTargets]; // 合并所有目标元素

  if (targets.length) {
    /**
     * Hero 区域的文字行初始渐显动画
     * 使用错开的时间延迟，让文字依次出现，营造层次感
     */
    const revealLines = document.querySelectorAll(
      ".scroll-slide-right, .scroll-slide-left"
    );
    revealLines.forEach((el, idx) => {
      // 每个元素延迟 200ms 显示，实现错开效果
      setTimeout(() => el.classList.add("is-visible"), idx * 200);
    });

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
  // 店内环境轮播图初始化
  // ============================================
  /**
   * 使用 Swiper 库初始化店内环境图片轮播
   * 配置为淡入淡出效果，自动播放，带进度条和导航按钮
   */
  const envSwiperEl = document.querySelector(".environment-slider");
  if (envSwiperEl && window.Swiper) {
    const swiper = new Swiper(envSwiperEl, {
      effect: "fade", // 使用淡入淡出切换效果
      fadeEffect: { crossFade: true }, // 启用交叉淡入淡出
      speed: 1000, // 切换动画时长 1 秒
      parallax: true, // 启用视差效果
      autoplay: {
        delay: 5000, // 每 5 秒自动切换
        disableOnInteraction: false, // 用户交互后不停止自动播放
        pauseOnMouseEnter: true, // 鼠标悬停时暂停
      },
      pagination: {
        el: ".env-pagination", // 进度条容器
        type: "progressbar", // 使用进度条样式
      },
      navigation: {
        nextEl: ".env-next", // 下一个按钮
        prevEl: ".env-prev", // 上一个按钮
      },
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
