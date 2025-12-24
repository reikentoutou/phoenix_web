## phoenix_web

PHOENIX eSPORTS CAFE 静态站点（HTML + SASS/CSS + JS）。

### 开发约定（合并后维护必读）

- **样式源文件**：优先修改 `css/style.sass`
- **输出文件**：`css/style.css`（运行/部署实际引用的文件）
- **同步规则**：改了 `css/style.sass`，请确保 `css/style.css` 也同步更新（避免“看起来改了但浏览器没变”的问题）
  - 使用 SASS 编译方式（例如编辑器的 Live Sass Compiler / 或本机 `sass` 命令）
  - 约定：不要手动长期维护 `css/style.css`，否则容易与编译结果冲突

### 脚本依赖策略

- **GSAP + ScrollTrigger**：全站使用（HUD 菜单动效、全局 reveal、Access parallax、首页 Hero）
- **Swiper**：仅 `index.html` 需要（店内环境轮播）；其它页面已移除 Swiper 依赖以减少体积与干扰

### 页面说明

- `index.html`：主站首页（cinematic sections 聚合）
- `rooms.html`：Rooms 页（单图贯穿 + 分区色调连续流）
- `access.html` / `system.html` / `guide.html`：独立信息页
- 说明：`specs.html` 已在清理阶段移除（规格展示已整合进 `index.html` 的 `#specs`）
