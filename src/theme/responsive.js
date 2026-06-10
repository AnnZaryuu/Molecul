/**
 * responsive.js
 * Hook untuk deteksi platform: mobile (iOS/Android) vs web (PC/Browser)
 * Tidak ada tablet breakpoint — cukup 2 mode: mobile dan web.
 */

import { Platform, useWindowDimensions } from 'react-native';

export const useLayout = () => {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isMobile = !isWeb;
  return { isWeb, isMobile, width, height };
};
