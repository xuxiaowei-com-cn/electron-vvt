#!/bin/bash
set -e

cd "$(dirname "$0")"

ICONSET="icon.iconset"
OUTPUT="icon.icns"
SOURCE="1024x1024.png"

if [ ! -f "$SOURCE" ]; then
  echo "Error: $SOURCE not found in build/"
  exit 1
fi

mkdir -p "$ICONSET"

sips -z 16 16 "$SOURCE" --out "$ICONSET/icon_16x16.png"
sips -z 32 32 "$SOURCE" --out "$ICONSET/icon_16x16@2x.png"
sips -z 32 32 "$SOURCE" --out "$ICONSET/icon_32x32.png"
sips -z 64 64 "$SOURCE" --out "$ICONSET/icon_32x32@2x.png"
sips -z 128 128 "$SOURCE" --out "$ICONSET/icon_128x128.png"
sips -z 256 256 "$SOURCE" --out "$ICONSET/icon_128x128@2x.png"
sips -z 256 256 "$SOURCE" --out "$ICONSET/icon_256x256.png"
sips -z 512 512 "$SOURCE" --out "$ICONSET/icon_256x256@2x.png"
sips -z 512 512 "$SOURCE" --out "$ICONSET/icon_512x512.png"
sips -z 1024 1024 "$SOURCE" --out "$ICONSET/icon_512x512@2x.png"

iconutil -c icns "$ICONSET" -o "$OUTPUT"
# rm -rf "$ICONSET"

echo "Done: $OUTPUT"
