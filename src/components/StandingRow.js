// src/components/StandingRow.js
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { PALETTE, FONT_WEIGHT } from '../theme/theme';

const StandingRow = ({ rank, teamName, logoUrl, matches, games, points }) => {
  // Logic warna poin sesuai desain
  const pointColor = points >= 18 ? PALETTE.blueInfo : PALETTE.textMain;

  return (
    <View style={styles.rowContainer}>
      <View style={styles.rankCol}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      <View style={styles.teamCol}>
        <Image 
          source={{ uri: logoUrl || 'https://placehold.co/40' }} 
          style={styles.teamLogo} 
        />
        <Text style={styles.teamNameText} numberOfLines={1}>{teamName}</Text>
      </View>
      <View style={styles.statCol}><Text style={styles.statText}>{matches}</Text></View>
      <View style={styles.statCol}><Text style={styles.statText}>{games}</Text></View>
      <View style={styles.statCol}>
        <Text style={[styles.statText, { color: pointColor, fontWeight: '700' }]}>
          {points}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: PALETTE.lightGray },
  rankCol: { width: 40, alignItems: 'center' },
  rankText: { color: PALETTE.redNeon, fontWeight: '700', fontSize: 16 },
  teamCol: { flex: 3, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  teamLogo: { width: 24, height: 24, marginRight: 10, borderRadius: 12 },
  teamNameText: { color: PALETTE.textMain, fontSize: 14, fontWeight: '500' },
  statCol: { flex: 1, alignItems: 'center' },
  statText: { color: PALETTE.textMain, fontSize: 13 },
});

export default StandingRow;