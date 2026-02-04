# 图片优化指南（高质量版 - WordPress 兼容）

## 问题分析

当前图片的问题是 **尺寸远超显示需求**，而不是需要重度压缩：

| 图片               | 原始尺寸  | 实际显示 | 问题      |
| ------------------ | --------- | -------- | --------- |
| store_1_front.webp | 2695×3664 | 992×662  | 超标 4 倍 |
| environment2.webp  | 4107×5981 | 721×1081 | 超标 5 倍 |

**解决方案：缩小到合理尺寸 + 高质量压缩 = 文件变小但画质几乎无损**

---

## 高质量优化方案

| 图片                        | 当前   | 建议尺寸      | 质量 | 目标大小   |
| --------------------------- | ------ | ------------- | ---- | ---------- |
| custmer_play_pc.webp        | 8.0 MB | **2000×1333** | 85   | 300-500 KB |
| store_1_front.webp          | 7.3 MB | **1600×1067** | 85   | 200-400 KB |
| environment2.webp           | 4.1 MB | **1600×2400** | 85   | 200-400 KB |
| store_2_hall.webp           | 1.9 MB | **1600×1067** | 85   | 150-300 KB |
| begin_background.webp       | 1.3 MB | **2560×1707** | 85   | 300-500 KB |
| environment1.webp           | 1.0 MB | **1600×2400** | 85   | 150-300 KB |
| environment3.webp           | 1.0 MB | **2000×1333** | 85   | 150-300 KB |
| concept_bg.webp             | 1.2 MB | **2000×1125** | 85   | 200-350 KB |
| environment_background.webp | 0.9 MB | **2000×1125** | 85   | 150-300 KB |

### 质量说明

- **质量 85** = 肉眼几乎看不出与原图区别
- **质量 75** = 仔细看可能有轻微差异
- **质量 60** = 明显能看出压缩痕迹

> 推荐使用 **质量 85**，这是专业网站的标准配置

---

## 方法一：Squoosh（推荐，最简单）

1. 打开 https://squoosh.app/
2. 拖入图片
3. 设置：
   - 格式：**WebP**
   - Quality：**85**（不要低于 80）
   - Resize：参考上表尺寸
4. 下载替换原文件

---

## 方法二：Photoshop / Figma

### Photoshop

1. 文件 → 导出 → 导出为
2. 格式选 WebP
3. 质量 85
4. 调整图像大小

### Figma

1. 选中图片
2. 右下角 Export
3. 选择 WebP，2x 或指定尺寸

---

## 方法三：命令行（高质量设置）

```bash
# 安装 ImageMagick (macOS)
brew install imagemagick

# 高质量压缩命令（质量 85）
cd /Users/reiken/Phoenix/phoenix_web-main

magick images/index/custmer_play_pc.webp -resize 2000x -quality 85 images/index/custmer_play_pc_new.webp
magick images/index/store_1_front.webp -resize 1600x -quality 85 images/index/store_1_front_new.webp
magick images/carousel/environment2.webp -resize 1600x -quality 85 images/carousel/environment2_new.webp
magick images/index/store_2_hall.webp -resize 1600x -quality 85 images/index/store_2_hall_new.webp
magick images/index/begin_background.webp -resize 2560x -quality 85 images/index/begin_background_new.webp
magick images/carousel/environment1.webp -resize 1600x -quality 85 images/carousel/environment1_new.webp
magick images/carousel/environment3.webp -resize 2000x -quality 85 images/carousel/environment3_new.webp
magick images/index/concept_bg.webp -resize 2000x -quality 85 images/index/concept_bg_new.webp
magick images/index/environment_background.webp -resize 2000x -quality 85 images/index/environment_background_new.webp
```

---

## WordPress 建议

### 保留原图策略

```
images/
├── originals/          ← 保留原始高清图（本地备份，不上传）
│   └── store_1_front.webp (7.3MB, 2695×3664)
│
└── web/                ← 优化后的网站用图
    └── store_1_front.webp (300KB, 1600×1067)
```

### WordPress 会自动生成缩略图

上传 1600-2000px 宽的图片，WordPress 会自动生成：

- thumbnail (150×150)
- medium (300×300)
- large (1024×1024)
- full (原尺寸)

所以你只需要上传优化后的版本即可。

---

## 预期效果

| 指标           | 优化前  | 优化后                 |
| -------------- | ------- | ---------------------- |
| 总图片大小     | 26.7 MB | **2-4 MB**             |
| PageSpeed 分数 | ~40     | **75-90**              |
| LCP 时间       | 6s+     | **2-3s**               |
| 图片质量       | 100%    | **~99%**（肉眼无区别） |
