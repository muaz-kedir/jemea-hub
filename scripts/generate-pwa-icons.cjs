/**
 * PWA Icon Generator Script
 * 
 * This script creates sized SVG icons for PWA since sharp has dependency issues.
 * For production, use an online tool like realfavicongenerator.net
 * 
 * Usage:
 *   node scripts/generate-pwa-icons.cjs
 */

const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// SVG template for the icon
const createSvgIcon = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1A9BA8"/>
      <stop offset="100%" style="stop-color:#0d7377"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" fill="url(#bgGradient)" rx="64"/>
  
  <!-- Mosque Dome -->
  <path d="M 128 192 Q 256 128 384 192 L 384 288 L 128 288 Z" fill="none" stroke="white" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Minaret Left -->
  <rect x="96" y="224" width="32" height="128" fill="white" rx="4"/>
  <path d="M 96 224 L 112 192 L 128 224" fill="white"/>
  
  <!-- Minaret Right -->
  <rect x="384" y="224" width="32" height="128" fill="white" rx="4"/>
  <path d="M 384 224 L 400 192 L 416 224" fill="white"/>
  
  <!-- Crescent and Star -->
  <g transform="translate(256, 96)">
    <path d="M 0 -32 Q -24 -24 -24 0 Q -24 24 0 32 Q -8 24 -8 0 Q -8 -24 0 -32" fill="white"/>
    <polygon points="24,0 28,8 36,8 30,14 32,22 24,18 16,22 18,14 12,8 20,8" fill="white"/>
  </g>
  
  <!-- Base/Platform -->
  <rect x="80" y="352" width="352" height="32" fill="white" rx="8"/>
  
  <!-- HUMSJ Text -->
  <text x="256" y="440" font-size="72" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">HUMSJ</text>
</svg>`;

function generateIcons() {
  console.log('🎨 Generating PWA icons (SVG format)...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate each size as SVG
  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.svg`);
    
    try {
      fs.writeFileSync(outputPath, createSvgIcon(size));
      console.log(`✅ Generated: icon-${size}x${size}.svg`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size}:`, error.message);
    }
  }

  console.log('\n🎉 SVG Icon generation complete!');
  console.log('\n⚠️  Note: For production, convert these SVGs to PNGs using:');
  console.log('   - https://realfavicongenerator.net/');
  console.log('   - https://cloudconvert.com/svg-to-png');
  console.log('   - Or use Inkscape/ImageMagick locally');
  console.log('\nGenerated icons:');
  ICON_SIZES.forEach(size => {
    console.log(`   - public/icons/icon-${size}x${size}.svg`);
  });
}

generateIcons();
