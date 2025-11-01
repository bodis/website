#!/bin/bash

# Image Optimization Script for macOS - Web Optimized
# Converts PNG to JPEG and WebP for dramatically smaller file sizes
# Usage: ./optimize_images.sh [input_directory] [thumbnail_width] [quality]

set -e

# Default values
INPUT_DIR="${1:-.}"
THUMB_WIDTH="${2:-300}"
QUALITY="${3:-85}"  # 85 is a good balance of quality/size for web
OUTPUT_DIR="${INPUT_DIR}/optimized"
THUMB_DIR="${INPUT_DIR}/thumbnails"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Image Optimization Script for Web${NC}"
echo "===================================="
echo "Input directory: $INPUT_DIR"
echo "Thumbnail width: ${THUMB_WIDTH}px"
echo "Quality: ${QUALITY}%"
echo ""

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo -e "${RED}Error: ImageMagick is not installed.${NC}"
    echo "Install it using: brew install imagemagick"
    exit 1
fi

# Determine the correct ImageMagick command
if command -v magick &> /dev/null; then
    CONVERT_CMD="magick"
else
    CONVERT_CMD="convert"
fi

# Check for WebP support
HAS_WEBP=false
if command -v cwebp &> /dev/null; then
    HAS_WEBP=true
    echo -e "${GREEN}✓ WebP support found - will generate WebP images${NC}"
else
    echo -e "${YELLOW}⚠ WebP tools not found - will skip WebP generation${NC}"
    echo "  Install with: brew install webp"
fi

# Create output directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$THUMB_DIR"

# Find all PNG files
PNG_FILES=$(find "$INPUT_DIR" -maxdepth 1 -type f -iname "*.png")

if [ -z "$PNG_FILES" ]; then
    echo -e "${RED}No PNG files found in $INPUT_DIR${NC}"
    exit 1
fi

echo ""

# Process each PNG file
TOTAL_ORIGINAL=0
TOTAL_SAVED=0
COUNT=0

while IFS= read -r file; do
    filename=$(basename "$file")
    name="${filename%.*}"
    
    echo -e "${BLUE}Processing: $filename${NC}"
    
    # Get original size
    original_size=$(stat -f%z "$file")
    TOTAL_ORIGINAL=$((TOTAL_ORIGINAL + original_size))
    COUNT=$((COUNT + 1))
    
    # === Full-size optimized JPEG ===
    jpeg_file="$OUTPUT_DIR/${name}.jpg"
    $CONVERT_CMD "$file" -strip -quality ${QUALITY} -sampling-factor 4:2:0 -interlace Plane "$jpeg_file"
    jpeg_size=$(stat -f%z "$jpeg_file")
    
    # === Full-size optimized WebP (if available) ===
    if [ "$HAS_WEBP" = true ]; then
        webp_file="$OUTPUT_DIR/${name}.webp"
        cwebp -q ${QUALITY} -m 6 -mt "$file" -o "$webp_file" 2>/dev/null
        webp_size=$(stat -f%z "$webp_file")
    fi
    
    # === Thumbnail JPEG ===
    thumb_jpeg="$THUMB_DIR/${name}_thumb.jpg"
    $CONVERT_CMD "$file" -strip -resize "${THUMB_WIDTH}x" -quality $((QUALITY - 5)) -sampling-factor 4:2:0 "$thumb_jpeg"
    thumb_jpeg_size=$(stat -f%z "$thumb_jpeg")
    
    # === Thumbnail WebP (if available) ===
    if [ "$HAS_WEBP" = true ]; then
        thumb_webp="$THUMB_DIR/${name}_thumb.webp"
        $CONVERT_CMD "$file" -strip -resize "${THUMB_WIDTH}x" /tmp/temp_thumb.png
        cwebp -q $((QUALITY - 5)) -m 6 "$file" -resize ${THUMB_WIDTH} 0 -o "$thumb_webp" 2>/dev/null
        thumb_webp_size=$(stat -f%z "$thumb_webp")
        rm -f /tmp/temp_thumb.png
    fi
    
    # Calculate savings
    jpeg_saved=$((original_size - jpeg_size))
    jpeg_percent=$(awk "BEGIN {printf \"%.1f\", ($jpeg_saved / $original_size) * 100}")
    TOTAL_SAVED=$((TOTAL_SAVED + jpeg_saved))
    
    # Display results
    echo "  Original PNG:     $(numfmt --to=iec-i --suffix=B $original_size 2>/dev/null || echo "${original_size} bytes")"
    echo "  ├─ Full JPEG:     $(numfmt --to=iec-i --suffix=B $jpeg_size 2>/dev/null || echo "${jpeg_size} bytes") (${jpeg_percent}% smaller)"
    
    if [ "$HAS_WEBP" = true ]; then
        webp_percent=$(awk "BEGIN {printf \"%.1f\", (($original_size - $webp_size) / $original_size) * 100}")
        echo "  ├─ Full WebP:     $(numfmt --to=iec-i --suffix=B $webp_size 2>/dev/null || echo "${webp_size} bytes") (${webp_percent}% smaller)"
    fi
    
    echo "  ├─ Thumb JPEG:    $(numfmt --to=iec-i --suffix=B $thumb_jpeg_size 2>/dev/null || echo "${thumb_jpeg_size} bytes")"
    
    if [ "$HAS_WEBP" = true ]; then
        echo "  └─ Thumb WebP:    $(numfmt --to=iec-i --suffix=B $thumb_webp_size 2>/dev/null || echo "${thumb_webp_size} bytes")"
    fi
    
    echo -e "  ${GREEN}✓ Saved: $(numfmt --to=iec-i --suffix=B $jpeg_saved 2>/dev/null || echo "${jpeg_saved} bytes") with JPEG${NC}"
    echo ""
    
done <<< "$PNG_FILES"

# Summary
echo "===================================="
echo -e "${GREEN}Optimization Complete!${NC}"
echo ""
echo "Files processed: $COUNT"
echo "Original total:  $(numfmt --to=iec-i --suffix=B $TOTAL_ORIGINAL 2>/dev/null || echo "${TOTAL_ORIGINAL} bytes")"
echo "Total saved:     $(numfmt --to=iec-i --suffix=B $TOTAL_SAVED 2>/dev/null || echo "${TOTAL_SAVED} bytes")"
OVERALL_PERCENT=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_SAVED / $TOTAL_ORIGINAL) * 100}")
echo "Overall savings: ${OVERALL_PERCENT}%"
echo ""
echo "Output locations:"
echo "  Optimized files: $OUTPUT_DIR"
echo "  Thumbnails:      $THUMB_DIR"
echo ""
echo -e "${YELLOW}Web Usage Tips:${NC}"
echo "  • Use WebP with JPEG fallback: <picture> tag"
echo "  • JPEG quality 85 is optimal for most web images"
echo "  • For photos: JPEG/WebP (lossy)"
echo "  • For graphics/logos: Keep original PNG"