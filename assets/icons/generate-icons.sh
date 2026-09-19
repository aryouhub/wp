#!/bin/bash
# Generate PNG icons from SVG using ImageMagick
convert -background none assets/icons/icon-512x512.svg -resize 72x72 assets/icons/icon-72x72.png
convert -background none assets/icons/icon-512x512.svg -resize 96x96 assets/icons/icon-96x96.png
convert -background none assets/icons/icon-512x512.svg -resize 128x128 assets/icons/icon-128x128.png
convert -background none assets/icons/icon-512x512.svg -resize 144x144 assets/icons/icon-144x144.png
convert -background none assets/icons/icon-512x512.svg -resize 152x152 assets/icons/icon-152x152.png
convert -background none assets/icons/icon-512x512.svg -resize 192x192 assets/icons/icon-192x192.png
convert -background none assets/icons/icon-512x512.svg -resize 384x384 assets/icons/icon-384x384.png
convert -background none assets/icons/icon-512x512.svg -resize 512x512 assets/icons/icon-512x512.png
echo "Icons generated successfully!"
