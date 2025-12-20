#!/usr/bin/env python3
"""
图片格式转换脚本
将 images 目录下的 JPG/PNG 图片转换为 WebP 格式

功能：
- 扫描 images 文件夹及其所有子文件夹
- 将 JPG/JPEG 转换为 WebP（质量 80%）
- 将 PNG 转换为 WebP（保留透明通道，无损模式）
- 保存为同名 .webp 文件
- 显示转换进度和体积节省比例
"""

import os
from pathlib import Path
from PIL import Image
import sys

# 支持的输入格式
SUPPORTED_FORMATS = {'.jpg', '.jpeg', '.png'}

# 统计信息
stats = {
    'total': 0,
    'converted': 0,
    'skipped': 0,
    'errors': 0,
    'total_original_size': 0,
    'total_webp_size': 0,
}

def get_file_size(filepath):
    """获取文件大小（字节）"""
    return os.path.getsize(filepath)

def format_size(size_bytes):
    """格式化文件大小显示"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"

def convert_to_webp(input_path, output_path, is_png=False):
    """
    将图片转换为 WebP 格式
    
    Args:
        input_path: 输入图片路径
        output_path: 输出 WebP 路径
        is_png: 是否为 PNG 格式（需要保留透明通道）
    
    Returns:
        tuple: (success: bool, original_size: int, webp_size: int)
    """
    try:
        # 打开图片
        with Image.open(input_path) as img:
            # 如果图片有透明通道（RGBA），确保保留
            if img.mode in ('RGBA', 'LA'):
                # PNG 需要保留透明通道
                if is_png:
                    # 使用无损模式保留完美透明度
                    img.save(
                        output_path,
                        'WEBP',
                        lossless=True,
                        method=6,  # 最高压缩级别（0-6）
                    )
                else:
                    # 非 PNG 但有多通道，转换为 RGB
                    rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'RGBA':
                        rgb_img.paste(img, mask=img.split()[3])  # 使用 alpha 通道作为 mask
                    else:
                        rgb_img.paste(img)
                    rgb_img.save(
                        output_path,
                        'WEBP',
                        quality=80,
                        method=6,
                    )
            else:
                # RGB 或其他模式
                if is_png:
                    # PNG 转 RGB 后转换为 WebP（高质量）
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    img.save(
                        output_path,
                        'WEBP',
                        quality=85,  # PNG 转 WebP 使用较高质量
                        method=6,
                    )
                else:
                    # JPG 转换为 WebP（质量 80%）
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    img.save(
                        output_path,
                        'WEBP',
                        quality=80,
                        method=6,
                    )
        
        # 获取文件大小
        original_size = get_file_size(input_path)
        webp_size = get_file_size(output_path)
        
        return True, original_size, webp_size
        
    except Exception as e:
        print(f"  ❌ 转换失败: {e}")
        return False, 0, 0

def process_image(input_path):
    """处理单张图片"""
    input_path_obj = Path(input_path)
    
    # 检查文件扩展名
    ext = input_path_obj.suffix.lower()
    if ext not in SUPPORTED_FORMATS:
        return False
    
    # 跳过已存在的 WebP 文件
    output_path = input_path_obj.with_suffix('.webp')
    if output_path.exists():
        print(f"⏭️  跳过（已存在）: {input_path_obj.name}")
        stats['skipped'] += 1
        return False
    
    # 判断是否为 PNG
    is_png = ext == '.png'
    
    # 显示转换信息
    format_type = "PNG (透明)" if is_png else "JPG"
    print(f"🔄 转换中: {input_path_obj.name} ({format_type})")
    
    # 转换图片
    success, original_size, webp_size = convert_to_webp(input_path, output_path, is_png)
    
    if success:
        stats['converted'] += 1
        stats['total_original_size'] += original_size
        stats['total_webp_size'] += webp_size
        
        # 计算节省比例
        savings = ((original_size - webp_size) / original_size * 100) if original_size > 0 else 0
        savings_symbol = "📉" if savings > 0 else "📈"
        
        print(f"  ✅ 完成: {input_path_obj.name}")
        print(f"     原始大小: {format_size(original_size)}")
        print(f"     WebP 大小: {format_size(webp_size)}")
        print(f"     {savings_symbol} 节省: {savings:.1f}%")
        print()
        
        return True
    else:
        stats['errors'] += 1
        return False

def scan_and_convert(directory):
    """扫描目录并转换所有图片"""
    directory_path = Path(directory)
    
    if not directory_path.exists():
        print(f"❌ 错误: 目录 '{directory}' 不存在")
        return
    
    if not directory_path.is_dir():
        print(f"❌ 错误: '{directory}' 不是一个目录")
        return
    
    print(f"📁 开始扫描目录: {directory_path.absolute()}")
    print("=" * 60)
    print()
    
    # 遍历所有文件
    for root, dirs, files in os.walk(directory_path):
        for file in files:
            file_path = Path(root) / file
            stats['total'] += 1
            
            # 处理图片
            process_image(file_path)
    
    # 打印统计信息
    print("=" * 60)
    print("📊 转换统计:")
    print(f"  总文件数: {stats['total']}")
    print(f"  成功转换: {stats['converted']}")
    print(f"  跳过文件: {stats['skipped']}")
    print(f"  错误数量: {stats['errors']}")
    print()
    
    if stats['total_original_size'] > 0:
        total_savings = ((stats['total_original_size'] - stats['total_webp_size']) / 
                        stats['total_original_size'] * 100)
        print(f"💾 总体积统计:")
        print(f"  原始总大小: {format_size(stats['total_original_size'])}")
        print(f"  WebP 总大小: {format_size(stats['total_webp_size'])}")
        print(f"  📉 总节省: {total_savings:.1f}%")
        print(f"  💰 节省空间: {format_size(stats['total_original_size'] - stats['total_webp_size'])}")

def main():
    """主函数"""
    # 检查是否安装了 Pillow
    try:
        import PIL
    except ImportError:
        print("❌ 错误: 未安装 Pillow 库")
        print("请运行: pip install Pillow")
        sys.exit(1)
    
    # 确定 images 目录路径
    script_dir = Path(__file__).parent
    images_dir = script_dir / 'images'
    
    # 如果提供了命令行参数，使用参数作为目录
    if len(sys.argv) > 1:
        images_dir = Path(sys.argv[1])
    
    # 开始转换
    scan_and_convert(images_dir)

if __name__ == '__main__':
    main()

