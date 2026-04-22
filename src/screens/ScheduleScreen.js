// src/screens/ScheduleScreen.js
import React from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PALETTE, SIZES } from '../theme/theme';

const ScheduleScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER AREA */}
        <View style={styles.header}>
          <Ionicons name="search-outline" size={22} color="white" />
          <Text style={styles.logoText}>MOLECUL</Text>
          <View style={styles.profileBox}>
            <Ionicons name="person" size={16} color="white" />
          </View>
        </View>

        {/* HERO TITLE */}
        <View style={styles.heroContainer}>
          <Text style={styles.syncText}>GLOBAL SYNCHRONIZATION ACTIVE</Text>
          <Text style={styles.heroTitle}>MATCH</Text>
          <Text style={styles.heroTitle}>SCHEDULE</Text>
          <Text style={styles.heroSub}>
            Live Feed from <Text style={{color: PALETTE.redNeon}}>Liquipedia</Text> Command Hub
          </Text>

          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.activeFilter}>
              <Text style={styles.filterText}>FILTER HUB</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inactiveFilter}>
              <Text style={styles.filterText}>REGIONAL: SEA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. LIVE MATCH CARD */}
        <View style={[styles.matchCard, styles.liveBorder]}>
          <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>LIVE</Text></View>
          <Text style={styles.mapText}>MAP 2</Text>
          <Text style={styles.seriesText}>BO3 SERIES</Text>

          <View style={styles.scoreRow}>
            <View style={styles.teamInfo}>
              <View style={styles.logoPlaceholder} />
              <Text style={styles.teamName}>REX REGUM</Text>
            </View>

            <View style={styles.scoreCounter}>
              <Text style={styles.scoreActive}>1</Text>
              <Text style={styles.vsText}>VS</Text>
              <Text style={styles.scoreInactive}>0</Text>
            </View>

            <View style={styles.teamInfo}>
              <View style={styles.logoPlaceholder} />
              <Text style={styles.teamName}>EVOS GLORY</Text>
            </View>
          </View>

          <Text style={styles.roundInfo}>ROUND 12 / 24</Text>
          
          <TouchableOpacity style={styles.watchBtn}>
            <Text style={styles.watchText}>WATCH STREAM</Text>
          </TouchableOpacity>
        </View>

        {/* 2. UPCOMING MATCH CARD (14:30) */}
        <View style={styles.matchCard}>
          <Text style={styles.timeText}>14:30</Text>
          <Text style={styles.countdownText}>STARTS IN 02:14:05</Text>

          <View style={[styles.scoreRow, { marginTop: 30 }]}>
            <View style={styles.teamInfo}>
              <View style={styles.logoPlaceholderDim} />
              <Text style={styles.teamNameDim}>BIGETRON</Text>
            </View>
            <View style={styles.vsContainer}>
              <Text style={styles.vsLarge}>VS</Text>
              <Text style={styles.seriesSmall}>BO5 SERIES</Text>
            </View>
            <View style={styles.teamInfo}>
              <View style={styles.logoPlaceholderDim} />
              <Text style={styles.teamNameDim}>ONIC ESPORTS</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.reminderBtn}>
            <Text style={styles.reminderText}>SET REMINDER</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER DATA SOURCE */}
        <View style={styles.footerSource}>
          <View style={styles.sourceRow}>
            <Ionicons name="globe-outline" size={14} color="#444" />
            <Text style={styles.sourceText}>LIQUIPEDIA SYNCHRONIZED</Text>
          </View>
          <Text style={styles.lastUpdate}>LAST UPDATE: 2M AGO</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  logoText: { color: PALETTE.redNeon, fontWeight: 'bold', letterSpacing: 4, fontSize: 18 },
  profileBox: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },

  heroContainer: { paddingHorizontal: 30, marginVertical: 20 },
  syncText: { color: '#4FACFE', fontSize: 9, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10 },
  heroTitle: { color: 'white', fontSize: 42, fontWeight: 'bold', lineHeight: 45 },
  heroSub: { color: '#666', fontSize: 13, marginTop: 15 },

  filterRow: { flexDirection: 'row', gap: 10, marginTop: 25 },
  activeFilter: { backgroundColor: PALETTE.redNeon, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 2 },
  inactiveFilter: { borderWidth: 1, borderColor: '#333', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 2 },
  filterText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  matchCard: { backgroundColor: '#111', marginHorizontal: 20, padding: 25, borderRadius: 4, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
  liveBorder: { borderColor: '#4FACFE' },
  liveBadge: { backgroundColor: '#4FACFE', alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 2, marginBottom: 15 },
  liveBadgeText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  
  mapText: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  seriesText: { color: '#4FACFE', fontSize: 10, textAlign: 'center', fontWeight: 'bold', marginTop: 5 },

  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  teamInfo: { alignItems: 'center', width: '35%' },
  logoPlaceholder: { width: 60, height: 60, backgroundColor: '#222', borderRadius: 4, marginBottom: 10 },
  logoPlaceholderDim: { width: 50, height: 50, backgroundColor: '#1a1a1a', borderRadius: 4, marginBottom: 10 },
  teamName: { color: 'white', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  teamNameDim: { color: '#555', fontSize: 11, fontWeight: 'bold' },

  scoreCounter: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  scoreActive: { color: '#4FACFE', fontSize: 36, fontWeight: 'bold' },
  scoreInactive: { color: 'white', fontSize: 36, fontWeight: 'bold' },
  vsText: { color: '#444', fontSize: 12, fontWeight: 'bold' },

  roundInfo: { color: '#444', fontSize: 10, textAlign: 'center', marginVertical: 10 },
  watchBtn: { backgroundColor: '#4FACFE', paddingVertical: 12, borderRadius: 2, marginTop: 10 },
  watchText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 11, letterSpacing: 1 },

  timeText: { color: 'white', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  countdownText: { color: PALETTE.redNeon, fontSize: 10, textAlign: 'center', fontWeight: 'bold', marginTop: 5 },
  vsLarge: { color: '#333', fontSize: 24, fontWeight: 'bold' },
  vsContainer: { alignItems: 'center' },
  seriesSmall: { color: '#444', fontSize: 8, fontWeight: 'bold' },
  
  reminderBtn: { borderWidth: 1, borderColor: '#333', paddingVertical: 12, borderRadius: 2, marginTop: 20 },
  reminderText: { color: '#666', textAlign: 'center', fontWeight: 'bold', fontSize: 10 },

  footerSource: { alignItems: 'center', marginTop: 30 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sourceText: { color: '#444', fontSize: 10, fontWeight: 'bold' },
  lastUpdate: { color: '#222', fontSize: 9, marginTop: 5 },
});

export default ScheduleScreen;