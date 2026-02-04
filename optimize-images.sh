#!/bin/bash
# ============================================
# PHOENIX 图片优化脚本
# 使用 ImageMagick 或 cwebp 压缩图片
# ============================================

echo "=== PHOENIX 图片优化脚本 ==="
echo ""

# 检查是否安装了必要工具
check_tools() {
    if command -v magick &> /dev/null; then
        echo "✓ ImageMagick 已安装"
        USE_IMAGEMAGICK=1
    elif command -v convert &> /dev/null; then
        echo "✓ ImageMagick (legacy) 已安装"
        USE_IMAGEMAGICK=1
    else
        echo "✗ ImageMagick 未安装"
        USE_IMAGEMAGICK=0
    fi

    if command -v cwebp &> /dev/null; then
        echo "✓ cwebp 已安装"
        USE_CWEBP=1
    else
        echo "✗ cwebp 未安装"
        USE_CWEBP=0
    fi
}

# 使用 ImageMagick 优化图片
optimize_with_imagemagick() {
    local input="$1"
    local max_width="$2"
    local quality="$3"
    local output="${input%.webp}_optimized.webp"
    
    echo "  处理: $(basename $input)"
    echo "    原始大小: $(du -h "$input" | cut -f1)"
    
    if command -v magick &> /dev/null; then
        magick "$input" -resize "${max_width}x>" -quality "$quality" "$output"
    else
        convert "$input" -resize "${max_width}x>" -quality "$quality" "$output"
    fi
    
    echo "    优化后: $(du -h "$output" | cut -f1)"
    echo ""
}

# 主要优化任务（高质量设置：质量85，肉眼无损）
optimize_images() {
    echo ""
    echo "=== 开始优化图片（高质量模式）==="
    echo ""
    
    # 优先级最高的图片（最大的几个）
    # custmer_play_pc.webp - 8MB -> 目标 300-500KB
    if [ -f "images/index/custmer_play_pc.webp" ]; then
        optimize_with_imagemagick "images/index/custmer_play_pc.webp" 2000 85
    fi
    
    # store_1_front.webp - 7.3MB -> 目标 200-400KB
    if [ -f "images/index/store_1_front.webp" ]; then
        optimize_with_imagemagick "images/index/store_1_front.webp" 1600 85
    fi
    
    # environment2.webp - 4.1MB -> 目标 200-400KB
    if [ -f "images/carousel/environment2.webp" ]; then
        optimize_with_imagemagick "images/carousel/environment2.webp" 1600 85
    fi
    
    # store_2_hall.webp - 1.9MB -> 目标 150-300KB
    if [ -f "images/index/store_2_hall.webp" ]; then
        optimize_with_imagemagick "images/index/store_2_hall.webp" 1600 85
    fi
    
    # begin_background.webp - 1.3MB -> 目标 300-500KB（首屏背景，保持较大）
    if [ -f "images/index/begin_background.webp" ]; then
        optimize_with_imagemagick "images/index/begin_background.webp" 2560 85
    fi
    
    # environment1.webp - 1MB -> 目标 150-300KB
    if [ -f "images/carousel/environment1.webp" ]; then
        optimize_with_imagemagick "images/carousel/environment1.webp" 1600 85
    fi
    
    # environment3.webp - 1MB -> 目标 150-300KB
    if [ -f "images/carousel/environment3.webp" ]; then
        optimize_with_imagemagick "images/carousel/environment3.webp" 2000 85
    fi
    
    # concept_bg.webp
    if [ -f "images/index/concept_bg.webp" ]; then
        optimize_with_imagemagick "images/index/concept_bg.webp" 2000 85
    fi
    
    # environment_background.webp
    if [ -f "images/index/environment_background.webp" ]; then
        optimize_with_imagemagick "images/index/environment_background.webp" 2000 85
    fi
    
    echo "=== 优化完成 ==="
    echo ""
    echo "优化后的图片保存为 *_optimized.webp"
    echo "请检查质量后，手动重命名替换原文件："
    echo ""
    echo "  mv images/index/custmer_play_pc_optimized.webp images/index/custmer_play_pc.webp"
    echo "  mv images/index/store_1_front_optimized.webp images/index/store_1_front.webp"
    echo "  # ... 以此类推"
}

# 显示安装说明
show_install_instructions() {
    echo ""
    echo "=== 安装说明 ==="
    echo ""
    echo "macOS:"
    echo "  brew install imagemagick"
    echo "  brew install webp"
    echo ""
    echo "Windows (使用 Chocolatey):"
    echo "  choco install imagemagick"
    echo "  choco install webp"
    echo ""
    echo "或者使用在线工具:"
    echo "  https://squoosh.app/"
    echo "  https://tinypng.com/"
    echo ""
}

# 主程序
main() {
    check_tools
    
    if [ $USE_IMAGEMAGICK -eq 0 ]; then
        show_install_instructions
        exit 1
    fi
    
    optimize_images
}

main
