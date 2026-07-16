---
name: Pusaka Legend
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#38393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#ffb4ac'
  on-secondary: '#690007'
  secondary-container: '#960711'
  on-secondary-container: '#ff9f95'
  tertiary: '#d0cdcd'
  on-tertiary: '#313030'
  tertiary-container: '#b4b2b2'
  on-tertiary-container: '#454544'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ac'
  on-secondary-fixed: '#410003'
  on-secondary-fixed-variant: '#92030f'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  headline-lg:
    fontFamily: Anybody
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Anybody
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 32px
  headline-md:
    fontFamily: Anybody
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
  stat-value:
    fontFamily: Anybody
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
---

## Brand & Style
The design system fuses the high-octane energy of competitive mobile gaming with the regal, ancient aesthetic of Indonesian heritage. The brand personality is **Heroic, Mystical, and Disciplined**. It aims to evoke a sense of national pride and legendary status, positioning every player as a modern-day warrior within a digital archipelago.

The visual style is a hybrid of **Modern-Futuristic** and **Tactile Heritage**. We employ deep layers, metallic textures, and intricate patterns to create a "Techno-Ethnic" atmosphere. This is achieved through:
- **Intricate Geometry:** Integrating Megamendung (cloud) and Parang (slope) patterns into functional UI containers.
- **Royal Finishes:** Using golden filigree inspired by Candi (temple) stone carvings to frame key interactive elements.
- **Glassmorphism with a Twist:** Using frosted dark surfaces that reveal faint batik watermarks beneath the glass.

## Colors
The palette is rooted in the "Kental Indonesia" concept, utilizing a high-contrast dark mode to make the legendary gold and red accents pop.

- **Primary (Majapahit Gold - #D4AF37):** Used for call-to-action buttons, active states, and decorative "Kraton" borders. It represents victory and divinity.
- **Secondary (Heritage Crimson - #B22222):** Used for critical alerts, "Live" indicators, and secondary branding elements. It symbolizes bravery and the spirit of "Semangat."
- **Tertiary (Charcoal Obsidian - #1A1A1A):** The foundation for all backgrounds. It provides a deep, matte canvas that allows foreground elements to shine.
- **Neutral (Parchment White - #F5F5F5):** Used primarily for typography and icons to ensure maximum legibility against dark backgrounds.

## Typography
The typography system balances "Heroic Impact" with "Modern Utility."

- **Headlines:** Use **Anybody** with a high width/weight axis. This font delivers the aggressive, competitive feel of esports while maintaining a clean, contemporary edge.
- **Body & Labels:** Use **Plus Jakarta Sans**. As an Indonesian-designed typeface, it fits the narrative perfectly—providing a soft, approachable, yet professional reading experience for data-heavy sections like stats and schedules.
- **Stylistic Rule:** Use all-caps for labels and titles to reinforce the authoritative tone.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for thumb-reach on mobile devices.

- **Grid:** A 4-column grid for mobile with 16px gutters. 
- **Safe Zones:** 20px horizontal margins to ensure content doesn't bleed into curved edges or notches.
- **Rhythm:** Spacing follows a 4px baseline. Use `lg` (24px) for separating logical sections and `sm` (12px) for internal component padding.
- **Visual Weight:** Center-aligned layouts are preferred for "Tournament" and "Hero" splash screens to emphasize importance. Lists and tables use left-aligned content for rapid scanning.

## Elevation & Depth
Depth is created through **Tonal Layering and Material Texture** rather than standard drop shadows.

- **Base Layer:** Pure #1A1A1A with a subtle Parang batik pattern overlay at 3% opacity.
- **Surface Layer:** #252525 with a 1px inner "Gold Dust" stroke (Primary color at 20% opacity).
- **Interactive Layer:** Active cards feature a subtle radial gradient glowing from the bottom-center in Heritage Crimson.
- **Depth Markers:** Use golden "Gunungan" (Wayang mountain) silhouettes as decorative footers or dividers to separate content blocks, creating a vertical sense of progression.

## Shapes
The shape language is **Angular and Sharp**, reflecting the edge of a Keris (traditional blade). 

- **Primary Radius:** 0.25rem (Soft) for most containers to maintain a serious, professional tone.
- **Accents:** Use clipped corners (45-degree chamfers) on primary buttons and hero cards to mimic traditional stone-cut architecture.
- **Borders:** Containers should use a dual-border system: a thick dark outer border and a hair-line golden inner border for a premium "artifact" feel.

## Components

### Bottom Navigation Bar
- **Structure:** 3 fixed tabs (Tourney, Heroes, Schedule).
- **Style:** Dark translucent glass background. Active tab uses a golden icon with a "Megamendung" cloud glow behind it.
- **Indicator:** A golden horizontal line above the active icon.

### Hero List Items
- **Visuals:** Rectangular cards with a clipped top-right corner. 
- **Badges:** Role badges (Assassin, Tank, etc.) use gold-framed hexagonal shapes with Heritage Crimson icons.
- **Typography:** Hero name in `headline-md`, Role in `label-bold`.

### Tournament Standings Table
- **Header:** Deep charcoal background with gold uppercase text.
- **Rows:** Alternating subtle dark-grey stripes. 
- **Highlight:** The user’s team or the #1 rank is highlighted with a gold left-border accent.

### Match Schedule Cards
- **Content:** Team Logo A vs Team Logo B.
- **Background:** Subtle "Parang" pattern watermark.
- **Centerpiece:** The time/date is housed in a Heritage Crimson pill-shaped badge in the center of the card.

### Batik Borders & Backgrounds
- Use a persistent vertical Batik Parang pattern on the far-left and far-right edges of the screen (5px width) to "frame" the mobile experience.
- Dividers are not simple lines; they are horizontal golden filigree lines with a central "Candi" diamond motif.