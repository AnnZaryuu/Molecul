// src/components/MatchCard.js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PALETTE, SIZES } from '../theme/theme';

const MatchCard = ({ time, teamA, teamB, isLive }) => {
  // Border merah menyala jika sedang live
  const cardBorderStyle = isLive ? { borderColor: PALETTE.redNeon, borderWidth: 1.5 } : {};

  return (
    <View style={[styles.card, cardBorderStyle]}>
      <View style={styles.header}>
        <Text style={styles.timeText}>{time} WIB</Text>
        {isLive && <View style={styles.liveBadge} />}
      </View>
      
      <View style={styles.teamsRow}>
        <View style={styles.teamBox}><Text style={styles.teamText}>{teamA}</Text></View>
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.teamBox}><Text style={styles.teamText}>{teamB}</Text></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: PALETTE.darkGray,
    width: '48%', // Agar muat 2 kartu berjajar
    padding: 15,
    borderRadius: SIZES.radiusM,
    borderColor: PALETTE.lightGray,
    borderWidth: 1,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  timeText: { color: PALETTE.textMuted, fontSize: 10, fontWeight: 'bold' },
  liveBadge: { width: 6, height: 6, borderRadius: 3, backgroundColor: PALETTE.redNeon },
  teamsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  teamBox: { 
    backgroundColor: '#000', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 4, 
    width: '40%', 
    alignItems: 'center' 
  },
  teamText: { color: PALETTE.textMain, fontSize: 11, fontWeight: 'bold' },
  vsText: { color: PALETTE.textDark, fontSize: 10, fontWeight: 'bold' },
});

export default MatchCard;