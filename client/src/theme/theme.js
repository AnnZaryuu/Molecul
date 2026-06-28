// src/theme/theme.js

export const PALETTE = {
  // ── Backgrounds ────────────────────────────────────────────────────────────
  black: '#080B14',         // Primary background (deep navy)
  darkGray: '#0F1320',      // Card / elevated surface
  surface: '#0F1320',       // Alias — elevated cards
  surface2: '#161B2E',      // Secondary surface (modals, headers)
  lightGray: '#1E2540',     // Border / divider

  // ── Text ───────────────────────────────────────────────────────────────────
  textMain: '#EAEDF6',      // Primary text (cool white)
  textMuted: '#6B7394',     // Secondary / muted text
  textDark: '#3A4168',      // Very dim labels

  // ── Accents ────────────────────────────────────────────────────────────────
  accent: '#00D4FF',        // Primary accent (electric cyan)
  accentDim: 'rgba(0,212,255,0.12)',  // Accent tinted bg
  gold: '#FFB800',          // Trophy / rank gold
  redNeon: '#FF3B5C',       // Danger / live / CTA (vivid rose)
  redNeonDim: 'rgba(255,59,92,0.12)', // Red tinted bg
  blueInfo: '#60A5FA',      // Info / series labels

  // ── Semantic ───────────────────────────────────────────────────────────────
  win: '#34D399',           // Win stat green
  loss: '#F87171',          // Loss stat red
  goldRank: '#FFD700',      // 1st place
  silverRank: '#A8A8A8',    // 2nd place
  bronzeRank: '#CD7F32',    // 3rd place
};

// ── ANGULAR DESIGN SYSTEM ────────────────────────────────────────────────────
// Sharp, boxy, esports-military aesthetic — minimal rounding
export const SIZES = {
  radiusL: 3,       // Large containers — nearly square
  radiusM: 2,       // Cards, inputs
  radiusS: 1,       // Badges, pills, tags
  padding: 20,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT_SIZES = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 14,
  xl: 18,
  xxl: 24,
  hero: 40,
};

export const SHADOWS = {
  cardGlow: {
    shadowColor: '#00D4FF',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
};