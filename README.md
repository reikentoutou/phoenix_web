## phoenix_web

PHOENIX eSPORTS CAFE 静态站点（HTML + SASS/CSS + JS）。

---

### 开发约定（合并后维护必读）

- **样式源文件**：优先修改 `css/style.sass`
- **输出文件**：`css/style.css`（运行/部署实际引用的文件）
- **同步规则**：改了 `css/style.sass`，请确保 `css/style.css` 也同步更新（避免"看起来改了但浏览器没变"的问题）
  - 使用 SASS 编译方式（例如编辑器的 Live Sass Compiler / 或本机 `sass` 命令）
  - 约定：不要手动长期维护 `css/style.css`，否则容易与编译结果冲突

---

### 脚本依赖策略

- **GSAP + ScrollTrigger**：全站使用（HUD 菜单动效、全局 reveal、Access parallax、首页 Hero）
- **Swiper**：仅 `index.html` 需要（店内环境轮播）；其它页面已移除 Swiper 依赖以减少体积与干扰

---

### 页面说明

| 页面 | 说明 |
|------|------|
| `index.html` | 主站首页（cinematic sections 聚合） |
| `rooms.html` | Rooms 页（单图贯穿 + 分区色调连续流） |
| `access.html` | 门店访问页（沉浸式视差） |
| `system.html` | 价格系统页 |
| `guide.html` | 使用指南 / FAQ 页 |

> 说明：`specs.html` 已在清理阶段移除（规格展示已整合进 `index.html` 的 `#specs`）

---

### 代码架构

#### JavaScript (`js/main.js`)

采用函数封装模块化设计：

| 模块 | 功能 |
|------|------|
| `initNavigation()` | 导航栏 + 移动端菜单 |
| `initScrollReveal()` | IntersectionObserver 渐显动画 |
| `initGSAPAnimations()` | GSAP 动画系统 |
| `initHeroTextAnimations()` | Hero 文字进场动画 |
| `initImmersiveParallax()` | Access 页视差效果 |
| `initHeroParallax()` | 首页 Hero 背景视差 |
| `initCinematicSwiper()` | 电影感轮播 |
| `initScheduleSwiper()` | 日程横滑轮播 |

**工具函数：**
- `throttle()` - 节流函数
- `MediaQueryManager` - 响应式媒体查询管理器
- `killAllScrollTriggers()` - 热重载保护

#### SASS (`css/style.sass`)

**变量系统：**
```sass
// 品牌色
$color-primary: #ff4d4d

// 背景色
$color-bg-darkest: #020202
$color-bg-dark: #050505

// 字体
$font-heading: 'Oswald', sans-serif
$font-body: 'Noto Sans JP', sans-serif
```

**复用 Mixin：**
| Mixin | 用途 |
|-------|------|
| `+glass-effect()` | 玻璃拟态效果 |
| `+glass-gradient()` | 玻璃渐变背景 |
| `+hover-lift()` | 悬停提升效果 |
| `+fixed-background()` | 固定背景（带移动端降级） |
| `+text-stroke()` | 文字描边效果 |
| `+heading-font()` | 标题字体 |
| `+eyebrow-style()` | 眉标样式 |
| `+button-base()` | 按钮基础样式 |

---

### 性能优化

- **滚动事件**：使用 `{ passive: true }` + 节流函数
- **视口检测**：使用 `IntersectionObserver`（单次触发后取消观察）
- **GSAP 动画**：使用 `ScrollTrigger.batch()` 批量处理
- **移动端降级**：`background-attachment: fixed` 自动降级为 `scroll`
- **无障碍支持**：`prefers-reduced-motion` 媒体查询支持

---

### 浏览器兼容性

- 现代浏览器（Chrome、Firefox、Safari、Edge）
- iOS Safari：固定背景自动降级
- `backdrop-filter` 降级处理
- `dvh` 单位有 `vh` 回退

---

### 本地开发

```bash
# 如果没有自动编译插件，可手动编译 SASS
sass css/style.sass css/style.css --watch

# 或使用 npx
npx sass css/style.sass css/style.css --watch
```

推荐使用 VS Code / Cursor 的 **Live Sass Compiler** 插件自动编译。

---

### 目录结构

```
phoenix_web-main/
├── index.html          # 首页
├── rooms.html          # 房间页
├── access.html         # 访问页
├── system.html         # 价格页
├── guide.html          # 指南页
├── css/
│   ├── style.sass      # 样式源文件（主要编辑）
│   ├── style.css       # 编译输出（自动生成）
│   └── style.css.map   # Source Map
├── js/
│   └── main.js         # 主脚本
├── images/             # 图片资源
└── README.md           # 本文件
```
