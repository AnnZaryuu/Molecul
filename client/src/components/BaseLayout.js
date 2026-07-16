import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { PALETTE, SIZES, SPACING } from '../theme/theme';

const isWeb = Platform.OS === 'web';

const BaseLayout = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Background Pattern - Batik Parang abstraction */}
      <View style={styles.patternOverlay}>
        <View style={styles.batikLines} />
      </View>
      
      {/* Content */}
      <View style={styles.contentWrapper}>
        {children}
      </View>

      {/* Frame Corners */}
      {isWeb && (
        <>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
    position: 'relative',
    overflow: 'hidden',
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    pointerEvents: 'none',
  },
  batikLines: {
    flex: 1,
    backgroundColor: 'transparent',
    ...(isWeb && {
      backgroundImage: 'repeating-linear-gradient(45deg, #f2ca50 0, #f2ca50 2px, transparent 2px, transparent 12px)',
    }),
  },
  contentWrapper: {
    flex: 1,
    zIndex: 1,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: PALETTE.primary,
    pointerEvents: 'none',
    zIndex: 10,
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  topRight: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
});

export default BaseLayout;
