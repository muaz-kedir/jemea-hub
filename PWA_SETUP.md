# PWA Setup Guide for HUMSJ Academic Platform

## Overview

This document explains the Progressive Web App (PWA) setup for the HUMSJ application, enabling users to install it on their mobile devices like a native app.

## File Structure

```
public/
├── manifest.json          # PWA manifest configuration
├── sw.js                  # Service worker for caching & offline
├── offline.html           # Offline fallback page
├── icons/
│   ├── icon.svg           # Source SVG icon
│   ├── icon-72x72.png     # Required icon sizes
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png   # Required for Android
│   ├── icon-384x384.png
│   └── icon-512x512.png   # Required for splash screen
└── screenshots/
    ├── screenshot-wide.png
    └── screenshot-mobile.png

src/
├── hooks/
│   └── usePWA.ts          # PWA hook for install prompt & status
├── components/
│   └── PWAInstallPrompt.tsx  # Install prompt UI component
└── main.tsx               # Service worker registration
```

## Generating Icons

You need to generate PNG icons from the SVG. Use one of these methods:

### Option 1: Online Tool
1. Go to https://realfavicongenerator.net/
2. Upload `public/icons/icon.svg`
3. Download the generated icons
4. Place them in `public/icons/`

### Option 2: Using Sharp (Node.js)
```bash
npm install sharp
```

Create `scripts/generate-icons.js`:
```javascript
const sharp = require('sharp');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp('public/icons/icon.svg')
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
});
```

### Option 3: Using Inkscape CLI
```bash
for size in 72 96 128 144 152 192 384 512; do
  inkscape public/icons/icon.svg -w $size -h $size -o public/icons/icon-${size}x${size}.png
done
```

## Features

### 1. Manifest Configuration (`manifest.json`)
- **name**: Full app name shown during install
- **short_name**: Name shown on home screen
- **display**: `standalone` - opens like a native app
- **theme_color**: Status bar color (#1A9BA8)
- **background_color**: Splash screen background (#0f172a)
- **icons**: Multiple sizes for different devices
- **shortcuts**: Quick actions from app icon long-press

### 2. Service Worker (`sw.js`)
- **Precaching**: Essential assets cached on install
- **Runtime caching**: Dynamic content cached on fetch
- **Offline support**: Shows offline.html when network unavailable
- **Push notifications**: Handles push events
- **Background sync**: Syncs data when back online

### 3. Install Prompt (`PWAInstallPrompt.tsx`)
- Shows install banner after 30 seconds
- Remembers if user dismissed
- Shows offline/online status toast
- Shows update available notification

### 4. PWA Hook (`usePWA.ts`)
- `isInstallable`: Can show install prompt
- `isInstalled`: App is already installed
- `isOnline`: Network status
- `installPWA()`: Trigger install prompt
- `updateServiceWorker()`: Apply pending update

## Testing PWA

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Check "Manifest" section for errors
4. Check "Service Workers" for registration
5. Use "Lighthouse" for PWA audit

### Testing Install Prompt
1. Open in Chrome/Edge
2. Wait 30 seconds or trigger manually
3. Click "Install" button
4. App should install to device

### Testing Offline
1. Go to DevTools > Network
2. Select "Offline" checkbox
3. Refresh page
4. Should see offline.html

## iOS Specific Notes

iOS Safari has limited PWA support:
- No install prompt (users must use "Add to Home Screen")
- Limited background sync
- No push notifications (as of iOS 16+, limited support)

The app includes iOS-specific meta tags:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">
```

## Troubleshooting

### Install prompt not showing
- Must be served over HTTPS (or localhost)
- Must have valid manifest.json
- Must have registered service worker
- User must have interacted with page

### Service worker not updating
- Clear browser cache
- Unregister old service worker in DevTools
- Hard refresh (Ctrl+Shift+R)

### Icons not showing
- Ensure all icon sizes exist
- Check paths in manifest.json
- Icons must be PNG format

## Deployment Checklist

- [ ] Generate all icon sizes from SVG
- [ ] Test manifest.json validity
- [ ] Verify service worker registers
- [ ] Test offline functionality
- [ ] Test install prompt on mobile
- [ ] Run Lighthouse PWA audit
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
