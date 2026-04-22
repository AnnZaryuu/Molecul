// src/screens/TeamProfileScreen.js
import React from 'react';
import { 
  StyleSheet, Text, View, ScrollView, Image, 
  TouchableOpacity, SafeAreaView, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PALETTE, SIZES } from '../theme/theme';

const { width } = Dimensions.get('window');

const ROSTER = [
  { id: '1', name: 'KAIRI', role: 'JUNGLER', img: 'https://placehold.co/150x150/1a1a1a/white?text=KAIRI' },
  { id: '2', name: 'BUTSSS', role: 'EXP LANE', img: 'https://placehold.co/150x150/1a1a1a/white?text=BUTSSS' },
  { id: '3', name: 'SANZ', role: 'MID LANE', img: 'https://placehold.co/150x150/1a1a1a/white?text=SANZ' },
  { id: '4', name: 'CW', role: 'GOLD LANE', img: 'https://placehold.co/150x150/1a1a1a/white?text=CW' },
  { id: '5', name: 'KIBOY', role: 'ROAMER', img: 'https://placehold.co/150x150/1a1a1a/white?text=KIBOY' },
];

const TeamProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 1. HEADER NAV */}
        <View style={styles.headerNav}>
          <Ionicons name="search-outline" size={22} color="white" />
          <Text style={styles.logoText}>MOLECUL</Text>
          <View style={styles.profileCircle}>
            <Ionicons name="person" size={16} color="white" />
          </View>
        </View>

        {/* 2. HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: PALETTE.redNeon }]}>
              <Text style={styles.tagText}>MOBILE LEGENDS</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: '#333' }]}>
              <Text style={styles.tagText}>ID DIV</Text>
            </View>
          </View>

          <Text style={styles.teamBrand}>FNATIC</Text>
          <Text style={styles.teamName}>ONIC</Text>
          <Text style={styles.description}>
            A fusion of European heritage and Southeast Asian dominance. Fnatic ONIC represents the pinnacle of competitive synergy.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.btnFollow}>
              <Text style={styles.btnTextBold}>FOLLOW TEAM</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnFanZone}>
              <Text style={styles.btnText}>FAN ZONE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. TEAM LOGO CARD */}
        <View style={styles.logoContainer}>
            <Image 
                source={{ uri: 'https://placehold.co/200x200/000000/white?text=ONIC+LOGO' }} 
                style={styles.mainLogo} 
            />
        </View>

        {/* 4. ACTIVE ROSTER */}
        <View style={styles.sectionDivider}>
            <Text style={styles.sectionLabel}>ACTIVE ROSTER</Text>
        </View>

        <View style={styles.rosterGrid}>
          {ROSTER.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <View style={styles.playerImageWrapper}>
                <Image source={{ uri: player.img }} style={styles.playerImage} />
              </View>
              <Text style={styles.playerRole}>{player.role}</Text>
              <Text style={styles.playerName}>{player.name}</Text>
            </View>
          ))}
        </View>

        {/* 5. RECENT FORM (CHART) */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>RECENT FORM</Text>
          <View style={styles.chartRow}>
            <View style={[styles.bar, { height: 60, backgroundColor: PALETTE.redNeon }]} />
            <View style={[styles.bar, { height: 80, backgroundColor: PALETTE.redNeon }]} />
            <View style={[styles.bar, { height: 30, backgroundColor: '#333' }]} />
            <View style={[styles.bar, { height: 70, backgroundColor: PALETTE.redNeon }]} />
            <View style={[styles.bar, { height: 85, backgroundColor: PALETTE.redNeon }]} />
          </View>
          <View style={styles.winRateRow}>
            <Text style={styles.winRateLabel}>WIN RATE</Text>
            <Text style={styles.winRateValue}>84.2%</Text>
          </View>
        </View>

        {/* 6. DOMINANCE CHRONICLE (TIMELINE) */}
        <View style={styles.chronicleContainer}>
          <Text style={styles.cardTitle}>DOMINANCE CHRONICLE</Text>
          
          <View style={styles.timelineItem}>
            <View style={styles.timelinePoint} />
            <View>
              <Text style={styles.timelineTitle}>THE SONIC REIGN <Text style={styles.timelineYear}>2021-2023</Text></Text>
              <Text style={styles.timelineDesc}>Establishing absolute dominance in MPL ID, securing three consecutive titles.</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={[styles.timelinePoint, { backgroundColor: PALETTE.redNeon }]} />
            <View>
              <Text style={styles.timelineTitle}>THE FNATIC CONVERGENCE <Text style={styles.timelineYear}>2024</Text></Text>
              <Text style={styles.timelineDesc}>A historic partnership with the global giants Fnatic, aimed at international conquest.</Text>
            </View>
          </View>
        </View>

        {/* 7. STATS FOOTER */}
        <View style={styles.statsRow}>
            <View style={styles.statBox}><Text style={styles.statVal}>06</Text><Text style={styles.statLab}>MPL TITLES</Text></View>
            <View style={styles.statBox}><Text style={styles.statVal}>02</Text><Text style={styles.statLab}>MSL WINS</Text></View>
            <View style={styles.statBox}><Text style={[styles.statVal, {color: PALETTE.redNeon}]}>#01</Text><Text style={styles.statLab}>GLOBAL RANK</Text></View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  headerNav: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  logoText: { color: PALETTE.redNeon, fontWeight: 'bold', letterSpacing: 4, fontSize: 18 },
  profileCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },

  heroSection: { paddingHorizontal: 25, marginTop: 10 },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  tagText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  teamBrand: { color: 'white', fontSize: 42, fontWeight: 'bold' },
  teamName: { color: '#E58E26', fontSize: 42, fontWeight: 'bold', marginTop: -10 },
  description: { color: '#888', fontSize: 13, lineHeight: 20, marginTop: 15, width: '90%' },

  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 25 },
  btnFollow: { flex: 1, backgroundColor: PALETTE.redNeon, paddingVertical: 12, alignItems: 'center', borderRadius: 4 },
  btnFanZone: { flex: 1, borderWidth: 1, borderColor: '#333', paddingVertical: 12, alignItems: 'center', borderRadius: 4 },
  btnTextBold: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  btnText: { color: 'white', fontSize: 12 },

  logoContainer: { alignItems: 'center', marginVertical: 40 },
  mainLogo: { width: 180, height: 180, opacity: 0.8 },

  sectionDivider: { alignItems: 'center', marginBottom: 25 },
  sectionLabel: { color: '#555', letterSpacing: 2, fontSize: 12, fontWeight: 'bold' },

  rosterGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, justifyContent: 'space-between' },
  playerCard: { width: (width - 60) / 2, marginBottom: 25, alignItems: 'center' },
  playerImageWrapper: { width: '100%', aspectRatio: 1, borderWidth: 1, borderColor: '#E58E26', borderRadius: 8, overflow: 'hidden', backgroundColor: '#111' },
  playerImage: { width: '100%', height: '100%' },
  playerRole: { color: '#555', fontSize: 9, fontWeight: 'bold', marginTop: 10 },
  playerName: { color: 'white', fontSize: 14, fontWeight: 'bold' },

  formCard: { backgroundColor: '#111', marginHorizontal: 20, padding: 20, borderRadius: 8, marginBottom: 20 },
  cardTitle: { color: '#666', fontSize: 12, fontWeight: 'bold', marginBottom: 20 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 100, marginBottom: 20 },
  bar: { flex: 1, borderRadius: 2 },
  winRateRow: { borderTopWidth: 1, borderTopColor: '#222', paddingTop: 15, flexDirection: 'row', justifyContent: 'space-between' },
  winRateLabel: { color: '#444', fontSize: 11 },
  winRateValue: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  chronicleContainer: { paddingHorizontal: 25, marginBottom: 30 },
  timelineItem: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  timelinePoint: { width: 8, height: 8, backgroundColor: '#E58E26', marginTop: 5 },
  timelineTitle: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  timelineYear: { color: '#E58E26', fontSize: 12 },
  timelineDesc: { color: '#666', fontSize: 12, marginTop: 5, lineHeight: 18 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#111' },
  statBox: { alignItems: 'center' },
  statVal: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  statLab: { color: '#444', fontSize: 10, fontWeight: 'bold', marginTop: 5 },
});

export default TeamProfileScreen;