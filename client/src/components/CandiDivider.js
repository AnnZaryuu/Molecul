import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PALETTE } from '../theme/theme';

const CandiDivider = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.line} />
      <View style={styles.diamond} />
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: PALETTE.outlineVariant,
  },
  diamond: {
    width: 6,
    height: 6,
    backgroundColor: PALETTE.primary,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 12,
  },
});

export default CandiDivider;
