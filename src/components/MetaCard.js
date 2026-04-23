import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { PALETTE, SIZES } from '../theme/theme';

const MetaCard = ({ heroName, winRate, pickRate, banRate, imageUrl, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress}>
      <Image source={{ uri: imageUrl }} style={styles.heroImage} />
      <View style={styles.infoContainer}>
        <Text style={styles.heroName}>{heroName}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>WR</Text>
            <Text style={styles.statValue}>{winRate}%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>PR</Text>
            <Text style={styles.statValue}>{pickRate}%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>BR</Text>
            <Text style={styles.statValue}>{banRate}%</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: PALETTE.darkGray,
    borderRadius: SIZES.radiusM,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PALETTE.lightGray,
    alignItems: 'center',
  },
  heroImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#222',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  heroName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    color: PALETTE.textDark,
    fontSize: 9,
    fontWeight: 'bold',
  },
  statValue: {
    color: PALETTE.textMain,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MetaCard;