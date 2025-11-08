# HUMSJ Logo Setup Instructions

## Logo Image Required

The application has been updated to use the HUMSJ logo throughout. You need to add the actual logo image file.

## Steps to Add the Logo

1. **Save the HUMSJ logo image** that was provided (the one with the mosque, crescent moon, and HUMSJ text)

2. **Convert/Save it as PNG format** with the filename: `humsj-logo.png`

3. **Place the file in the public folder**:
   - Copy `humsj-logo.png` to: `c:\Users\admin\jemea-hub\public\humsj-logo.png`

4. **Recommended logo specifications**:
   - Format: PNG with transparent background
   - Size: 512x512 pixels (or similar square dimensions)
   - File size: Keep under 100KB for optimal loading

## Where the Logo is Used

The HUMSJ logo now appears in:

1. **Browser Tab** (Favicon)
   - File: `index.html`
   - Shows in browser tabs and bookmarks

2. **Landing Page Navigation Bar**
   - File: `src/pages/LandingPage.tsx`
   - Top left corner with "HUMSJ" text

3. **Splash Screen**
   - File: `src/pages/Splash.tsx`
   - Large centered logo when app loads

4. **Footer**
   - File: `src/pages/LandingPage.tsx`
   - Bottom of landing page

## Branding Updates Made

✅ **Title Changed**: "TEACH-ME" → "HUMSJ - Haramaya University Muslim Students Jema'a"

✅ **Removed Lovable Branding**: All references to Lovable removed from meta tags

✅ **Updated All Text**:
- Hero section: "Haramaya University Muslim Students Jema'a"
- Tagline: "Academic Excellence Through Faith and Knowledge"
- About section: Updated to reflect HUMSJ identity
- Footer: HUMSJ copyright and description

## Testing

After adding the logo file:

1. Restart the dev server if it's running
2. Clear browser cache (Ctrl + Shift + R)
3. Check that the logo appears in:
   - Browser tab (favicon)
   - Navigation bar
   - Splash screen
   - Footer

## Fallback

If the logo doesn't load immediately:
- Check the file path is correct: `/public/humsj-logo.png`
- Verify the file name is exactly: `humsj-logo.png` (lowercase)
- Check file permissions
- Try hard refresh (Ctrl + Shift + R)

## Alternative Formats

If you have the logo in different formats:
- **SVG**: Best for scalability, save as `humsj-logo.svg`
- **JPG**: Works but PNG is preferred for logos
- **WebP**: Modern format, good compression

Update the file extension in the code if using a different format.
