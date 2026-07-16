import { Platform } from 'react-native';

export const PALETTE = {
  // Brand Colors
  primary: '#f2ca50',       // Gold/Brass (Pusaka Gold)
  secondary: '#d4af37',     // Darker Gold for accents
  tertiary: '#8c6b23',      // Even darker for depth
  accent: '#f2ca50',
  accentDim: 'rgba(242, 202, 80, 0.12)',

  // Surface Colors
  background: '#121212',    // Deep Charcoal/Black
  surface: '#1e1e1e',       // Card Background
  surfaceDim: '#181818',
  surfaceContainerLowest: '#0d0d0d',
  surfaceContainerLow: '#141414',
  surfaceContainer: '#1c1c1c',
  surfaceContainerHigh: '#2b2b2b',
  surfaceContainerHighest: '#333535',

  // Text Colors
  onPrimary: '#121212',     // Dark text on Gold
  onSecondary: '#121212',
  onSurface: '#e2e2e2',     // Off-white text on dark
  onSurfaceVariant: '#a0a0a0', // Muted text

  // Borders & Dividers
  outline: '#4a4a4a',
  outlineVariant: '#2a2a2a',

  // Semantic
  error: '#ef4444',
  errorContainer: '#7f1d1d',
  onError: '#ffffff',
  onErrorContainer: '#fecaca',
  success: '#22c55e',
  win: '#22c55e',
  loss: '#ef4444',
  
  // Backwards compat for old components that haven't been updated yet
  textMain: '#e2e2e2',
  textMuted: '#a0a0a0',
  textDark: '#888888',
  lightGray: '#2a2a2a',
  black: '#121212',
  surface2: '#1e1e1e',
};

export const TYPOGRAPHY = {
  displayLg: { fontFamily: 'Oswald_700Bold', fontSize: 57, lineHeight: 64 },
  displayMd: { fontFamily: 'Oswald_700Bold', fontSize: 45, lineHeight: 52 },
  displaySm: { fontFamily: 'Oswald_700Bold', fontSize: 36, lineHeight: 44 },
  
  headlineLg: { fontFamily: 'Oswald_700Bold', fontSize: 32, lineHeight: 40 },
  headlineMd: { fontFamily: 'Oswald_700Bold', fontSize: 28, lineHeight: 36 },
  headlineSm: { fontFamily: 'Oswald_700Bold', fontSize: 24, lineHeight: 32 },
  
  titleLg: { fontFamily: 'Oswald_700Bold', fontSize: 22, lineHeight: 28 },
  titleMd: { fontFamily: 'Oswald_600SemiBold', fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
  titleSm: { fontFamily: 'Oswald_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  
  bodyLg: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
  bodyMd: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  bodySm: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
  
  labelLg: { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  labelBold: { fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
  labelSmall: { fontFamily: 'Inter_600SemiBold', fontSize: 11, lineHeight: 16, letterSpacing: 0.5 },

  statValue: { fontFamily: 'Oswald_700Bold', fontSize: 24, lineHeight: 32, letterSpacing: 1 },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  marginMobile: 16,
  marginWeb: 40,
};

export const SIZES = {
  radiusNone: 0,
  radiusSm: 4,
  radiusBase: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusFull: 9999,
};

export const SHADOWS = {
  goldGlow: {
    shadowColor: PALETTE.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  }
};