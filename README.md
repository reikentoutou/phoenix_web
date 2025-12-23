## phoenix_web

PHOENIX eSPORTS CAFE 静态站点（HTML + SASS/CSS + JS）。

### 开发约定（合并后维护必读）

- **样式源文件**：优先修改 `css/style.sass`
- **输出文件**：`css/style.css`（运行/部署实际引用的文件）
- **同步规则**：改了 `css/style.sass`，请确保 `css/style.css` 也同步更新（避免“看起来改了但浏览器没变”的问题）
  - 使用 SASS 编译方式（例如编辑器的 Live Sass Compiler / 或本机 `sass` 命令）

### 脚本依赖策略

- **GSAP + ScrollTrigger**：全站使用（HUD 菜单动效、全局 reveal、Access parallax、首页 Hero）
- **Swiper**：仅 `index.html` 需要（店内环境轮播）；其它页面已移除 Swiper 依赖以减少体积与干扰
