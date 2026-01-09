# PodcastProAI - Brand Assets

## Official Logo (Version 3)

**Selected Design**: Dark Theme Waveform  
**Rationale**: Modern, versatile, works on light/dark backgrounds, captures audio essence

---

## Logo Files

### Primary Logos
- **logo.svg** - Default logo for general use (dark text on light backgrounds)
- **logo-light-bg.svg** - Optimized for light backgrounds
- **logo-dark-bg.svg** - Optimized for dark backgrounds (white text)

### Icon & App Assets
- **logo-icon.svg** - Square app icon (100x100) with gradient background
- **favicon.svg** - 32x32 favicon for web
- **logo-social.svg** - 1200x630 social media preview (OG image)

---

## Usage Guidelines

### When to Use Each File

| File | Use Case |
|------|----------|
| logo.svg | Website headers, marketing materials, light backgrounds |
| logo-dark-bg.svg | Dark mode UI, presentations with dark backgrounds |
| logo-icon.svg | App icons, profile pictures, square formats |
| favicon.svg | Browser tab icons, PWA icons |
| logo-social.svg | Social media sharing (Twitter, Facebook, LinkedIn) |

### Size Recommendations

**Web/Digital**
- Navbar: 200px width
- Footer: 150px width
- Hero section: 400px width
- Favicon: 32x32px (use favicon.svg)

**Social Media**
- Profile image: Use logo-icon.svg (512x512 or 1024x1024)
- Cover/Banner: Use logo-social.svg (1200x630)
- Posts: Logo-icon.svg or logo-social.svg depending on format

**Print** (if needed)
- Business cards: 2-3 inches width
- Letterhead: 3-4 inches width
- Use SVG and export at 300 DPI minimum

### Clear Space
Maintain minimum clear space of 0.5x the height of the logo icon around all sides.

### Don'ts
- ❌ Don't distort or stretch the logo
- ❌ Don't rotate the logo
- ❌ Don't change the colors
- ❌ Don't add effects (shadows, outlines) unless specified in guidelines
- ❌ Don't place on busy backgrounds that reduce legibility

---

## Color Palette

### Primary Colors
```
Purple-Blue: #667eea
Purple: #764ba2
Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

### Accent Colors
```
Orange: #f59e0b
Red: #ef4444
Gradient: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)
```

### Neutral Colors
```
Dark: #1a1a2e (text, dark mode)
White: #ffffff (light mode, dark bg text)
Light Gray: #f8f9fa (backgrounds)
Gray: #6b7280 (secondary text)
```

### Utility Colors
```
Success: #10b981
Warning: #f59e0b
Error: #ef4444
Info: #3b82f6
```

---

## Typography

**Headers**: Inter, SF Pro Display, or Arial (Bold, 700)  
**Body**: Inter, SF Pro Text, or Arial (Regular, 400)  
**Code**: Fira Code, JetBrains Mono, or Courier New

---

## Export Instructions

### To Generate PNG Files from SVG

**Using Node.js/CLI:**
```bash
# Install sharp
npm install -g sharp-cli

# Generate various sizes
sharp -i logo.svg -o logo-192.png -w 192 -h 192
sharp -i logo.svg -o logo-512.png -w 512 -h 512
sharp -i logo-icon.svg -o app-icon-512.png -w 512 -h 512
sharp -i favicon.svg -o favicon-32.png -w 32 -h 32
sharp -i favicon.svg -o favicon-16.png -w 16 -h 16
```

**Using Online Tools:**
- CloudConvert: https://cloudconvert.com/svg-to-png
- Inkscape: File > Export PNG Image
- Adobe Illustrator: File > Export > Export As

### Recommended PNG Sizes

**Web App Icons:**
- 16x16 (favicon)
- 32x32 (favicon)
- 180x180 (Apple touch icon)
- 192x192 (Android icon)
- 512x512 (High-res icon)

**Marketing:**
- 1200x630 (Social media OG image)
- 1024x1024 (Profile pictures)
- Original SVG for print (export at 300 DPI)

---

## Version History

### Version 3 - Selected (Jan 9, 2026)
- Dark theme waveform design
- Purple-blue primary gradient
- Orange-red accent gradient
- Works on light and dark backgrounds
- Modern, clean aesthetic

---

## Brand Voice

**Tone**: Professional yet approachable  
**Style**: Technical but not overwhelming  
**Message**: Automation, simplicity, time-saving  
**Personality**: Confident without arrogance

---

## Questions?

For brand asset questions or custom formats, refer to the main project documentation or contact the brand team.

**Last Updated**: January 9, 2026
