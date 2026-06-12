import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, Linking, Platform, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PALETTE } from '../theme/theme';
import { TEAM_LOGOS } from '../theme/teamLogos';
import { MLBBApiService } from '../services/mlbbApiService';

const REGIONS = [
  { id: 'ALL', name: 'GLOBAL FEED', league: 'ALL' },
  { id: 'ID', name: 'INDONESIA', slug: 'mlbb-mpl-indonesia-17-2026-regular-season', league: 'MPL ID S17' },
  { id: 'PH', name: 'PHILIPPINES', slug: 'mlbb-mpl-philippines-17-2026-regular-season', league: 'MPL PH S17' },
  { id: 'MY', name: 'MALAYSIA', slug: 'mlbb-mpl-malaysia-17-2026-regular-season', league: 'MPL MY S17' },
];

const isWeb = Platform.OS === 'web';

const ScheduleScreen = () => {
  const { width } = useWindowDimensions();
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegionModal, setShowRegionModal] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, [selectedRegion]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const [live, upcoming] = await Promise.all([
        MLBBApiService.getMLBBMatches('running', 10),
        MLBBApiService.getMLBBMatches('upcoming', 50)
      ]);

      let filteredLive = live || [];
      let filteredUpcoming = upcoming || [];

      if (selectedRegion.id !== 'ALL') {
        filteredLive = filteredLive.filter(m => 
          m.league?.toUpperCase().includes(selectedRegion.id) || 
          m.league?.toUpperCase().includes(selectedRegion.name)
        );
        filteredUpcoming = filteredUpcoming.filter(m => 
          m.league?.toUpperCase().includes(selectedRegion.id) || 
          m.league?.toUpperCase().includes(selectedRegion.name)
        );
      }

      setLiveMatches(filteredLive);
      setUpcomingMatches(filteredUpcoming);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
    setLoading(false);
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    
    const now = new Date();
    const jakartaMatchDate = date.toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta' });
    const jakartaToday = now.toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta' });
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const jakartaTomorrow = tomorrow.toLocaleDateString('en-US', { timeZone: 'Asia/Jakarta' });

    let dayStr;
    if (jakartaMatchDate === jakartaToday) {
      dayStr = 'TODAY';
    } else if (jakartaMatchDate === jakartaTomorrow) {
      dayStr = 'TOMORROW';
    } else {
      dayStr = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Jakarta' }).toUpperCase();
    }

    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta', hour12: false });
    return `${dayStr} ${timeStr} WIB`;
  };

  const renderMatchCard = (match, isLive = false) => {
    const opponents = match.opponents || [];
    const teamA = opponents[0];
    const teamB = opponents[1];
    
    const teamAName = teamA?.name || 'TBD';
    const teamBName = teamB?.name || 'TBD';
    
    const teamALogo = TEAM_LOGOS[teamA?.acronym] ? TEAM_LOGOS[teamA?.acronym] : (teamA?.logo ? { uri: teamA.logo } : { uri: `https://placehold.co/60/222/white?text=${teamA?.acronym || '?'}` });
    const teamBLogo = TEAM_LOGOS[teamB?.acronym] ? TEAM_LOGOS[teamB?.acronym] : (teamB?.logo ? { uri: teamB.logo } : { uri: `https://placehold.co/60/222/white?text=${teamB?.acronym || '?'}` });

    return (
      <View key={match.id} style={[styles.matchCard, isWeb && styles.matchCardWeb, isLive && styles.liveBorder]}>
        <View style={styles.cardHeader}>
          <View style={styles.leagueInfo}>
            {match.leagueLogo && <Image source={{ uri: match.leagueLogo }} style={styles.leagueLogo} />}
            <Text style={styles.leagueName}>{(match.league || "UNKNOWN LEAGUE").toUpperCase()}</Text>
          </View>
          {isLive && (
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          )}
        </View>

        <Text style={styles.seriesText}>{(match.matchType || 'BO3').toUpperCase()} - {match.numberOfGames || 3} GAMES</Text>

        <View style={styles.scoreRow}>
          <View style={styles.teamInfo}>
            <Image source={teamALogo} style={styles.teamLogo} />
            <Text style={styles.teamName}>{teamAName}</Text>
          </View>

          <View style={styles.scoreCounter}>
            {isLive ? (
              <>
                <Text style={styles.scoreActive}>{match.results?.[0]?.score || 0}</Text>
                <Text style={styles.vsText}>-</Text>
                <Text style={styles.scoreActive}>{match.results?.[1]?.score || 0}</Text>
              </>
            ) : (
              <View style={styles.vsContainer}>
                <Text style={styles.timeText}>{formatTime(match.beginAt)}</Text>
                <Text style={styles.vsLarge}>VS</Text>
              </View>
            )}
          </View>

          <View style={styles.teamInfo}>
            <Image source={teamBLogo} style={styles.teamLogo} />
            <Text style={styles.teamName}>{teamBName}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={isLive ? styles.watchBtn : styles.reminderBtn}
          onPress={() => {
            if (isLive) {
              const url = match.streamUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(match.name + ' MLBB Live')}`;
              Linking.openURL(url);
            }
          }}
        >
          <Text style={isLive ? styles.watchText : styles.reminderText}>
            {isLive ? 'WATCH STREAM' : 'ADD TO CALENDAR'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logoText}>MOLECUL</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={fetchMatches} style={styles.headerIconBtn}>
              <Ionicons name="sync" size={20} color={PALETTE.redNeon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowRegionModal(true)} style={styles.headerIconBtn}>
              <Ionicons name="globe-outline" size={22} color="white" />
              <View style={styles.regionBadge}><Text style={styles.regionBadgeText}>{selectedRegion.id}</Text></View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.heroContainer}>
          <Text style={styles.heroTitle}>{selectedRegion.id === 'ALL' ? 'GLOBAL' : selectedRegion.id}</Text>
          <Text style={styles.heroTitle}>SCHEDULE</Text>
        </View>

        {loading ? (
          <View style={{ marginTop: 50 }}>
            <ActivityIndicator size="large" color={PALETTE.redNeon} />
            <Text style={styles.loadingText}>COLLECTING GLOBAL INTEL...</Text>
          </View>
        ) : (
          <View>
            {liveMatches.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.sectionTitle}>LIVE IN {selectedRegion.name}</Text>
                <View style={isWeb ? styles.gridContainer : undefined}>
                  {liveMatches.map(m => renderMatchCard(m, true))}
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>UPCOMING TOURNAMENTS</Text>
            {upcomingMatches.length > 0 ? (
              <View style={isWeb ? styles.gridContainer : undefined}>
                {upcomingMatches.map(m => renderMatchCard(m, false))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={40} color="#222" />
                <Text style={styles.noMatchText}>NO UPCOMING MATCHES FOR {selectedRegion.name}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.footerSource}>
          <Text style={styles.sourceText}>DATA SOURCE: PANDASCORE GLOBAL API</Text>
          <Text style={styles.lastUpdate}>V 1.0.4 - MATCH CENTRAL HUB</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showRegionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>FILTER REGION</Text>
            {REGIONS.map((region) => (
              <TouchableOpacity 
                key={region.id} 
                style={[styles.regionItem, selectedRegion.id === region.id && styles.selectedRegionItem]}
                onPress={() => {
                  setSelectedRegion(region);
                  setShowRegionModal(false);
                }}
              >
                <Text style={[styles.regionItemText, selectedRegion.id === region.id && styles.selectedRegionItemText]}>
                  {region.name}
                </Text>
                {selectedRegion.id === region.id && <Ionicons name="checkmark-circle" size={20} color={PALETTE.redNeon} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowRegionModal(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 25, alignItems: 'center' },
  logoText: { color: 'white', fontWeight: 'bold', letterSpacing: 4, fontSize: 18 },
  headerRight: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  headerIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222', position: 'relative' },
  regionBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: PALETTE.redNeon, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  regionBadgeText: { color: 'white', fontSize: 8, fontWeight: 'bold' },

  heroContainer: { paddingHorizontal: 30, marginVertical: 20 },
  heroTitle: { color: 'white', fontSize: isWeb ? 52 : 42, fontWeight: 'bold', lineHeight: isWeb ? 55 : 45 },

  sectionTitle: { color: 'white', fontSize: 11, fontWeight: 'bold', letterSpacing: 2, marginHorizontal: 20, marginBottom: 15, opacity: 0.4 },
  
  // Grid implementation for Web
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  matchCard: { backgroundColor: '#111', marginHorizontal: 20, padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#1a1a1a' },
  matchCardWeb: { width: 'calc(50% - 30px)', marginHorizontal: 10, marginVertical: 10 }, // 2 columns

  liveBorder: { borderColor: PALETTE.redNeon },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  leagueInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leagueLogo: { width: 18, height: 18, borderRadius: 9 },
  leagueName: { color: '#888', fontSize: 10, fontWeight: 'bold' },

  liveBadge: { backgroundColor: PALETTE.redNeon, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 2 },
  liveBadgeText: { color: 'white', fontSize: 8, fontWeight: 'bold' },

  seriesText: { color: '#4FACFE', fontSize: 8, fontWeight: 'bold', marginBottom: 15 },

  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  teamInfo: { alignItems: 'center', width: '35%' },
  teamLogo: { width: 50, height: 50, resizeMode: 'contain', marginBottom: 10 },
  teamName: { color: 'white', fontSize: 11, fontWeight: 'bold', textAlign: 'center' },

  scoreCounter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '30%', gap: 10 },
  scoreActive: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  vsText: { color: '#333', fontSize: 20, fontWeight: 'bold' },
  vsContainer: { alignItems: 'center', width: '100%' },
  vsLarge: { color: '#222', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  timeText: { color: PALETTE.redNeon, fontSize: 11, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },

  watchBtn: { backgroundColor: PALETTE.redNeon, paddingVertical: 10, borderRadius: 6 },
  watchText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 10 },
  reminderBtn: { borderWidth: 1, borderColor: '#222', paddingVertical: 10, borderRadius: 6 },
  reminderText: { color: '#666', textAlign: 'center', fontWeight: 'bold', fontSize: 10 },

  loadingText: { color: '#444', fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  noMatchText: { color: '#333', fontSize: 12, textAlign: 'center', marginTop: 15, fontWeight: 'bold' },

  footerSource: { alignItems: 'center', marginTop: 30, opacity: 0.3 },
  sourceText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  lastUpdate: { color: 'white', fontSize: 8, marginTop: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: isWeb ? 400 : '80%', backgroundColor: '#111', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#222' },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', letterSpacing: 2 },
  regionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  selectedRegionItem: { backgroundColor: '#1a1010', paddingHorizontal: 10, borderRadius: 8 },
  regionItemText: { color: '#888', fontSize: 14, fontWeight: 'bold' },
  selectedRegionItemText: { color: 'white' },
  closeBtn: { marginTop: 25, alignItems: 'center', paddingVertical: 10 },
  closeBtnText: { color: '#444', fontSize: 12, fontWeight: 'bold' },
});

export default ScheduleScreen;