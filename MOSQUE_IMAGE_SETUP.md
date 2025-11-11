# Mosque Hero Image Setup

## Image Location
The hero section is now configured to use a mosque background image.

## Required Action
Please save the mosque image you provided as:
```
c:\Users\hp\jemea-hub\public\mosque-hero.jpg
```

## What Was Changed
- Updated the hero section in `src/pages/LandingPage.tsx`
- Added a full-screen background image with dark overlay
- Enhanced text readability with drop shadows
- Added decorative amber and green glowing elements
- Increased hero section height to 600px minimum
- Made buttons more prominent with better shadows

## Hero Section Features
- **Background**: Mosque image with gradient overlay (black 60-80% opacity)
- **Text**: White with drop shadows for maximum readability
- **Decorative**: Subtle amber and green glowing orbs
- **Buttons**: White "Get Started" button and outlined "Explore Sectors" button
- **Responsive**: Adapts to all screen sizes

## Alternative
If you want to use a different image name or location, update line 245 in `LandingPage.tsx`:
```tsx
src="/mosque-hero.jpg"
```

Change it to your preferred path.
