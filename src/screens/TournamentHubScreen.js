import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Image, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PALETTE } from '../theme/theme';
import { TEAM_LOGOS } from '../theme/teamLogos';
import { MLBBApiService } from '../services/mlbbApiService';
import { useNavigation } from '@react-navigation/native';

const REGIONS = [
  { id: 'ID', name: 'INDONESIA', slug: 'mlbb-mpl-indonesia-17-2026-regular-season', league: 'MPL ID S17' },
  { id: 'PH', name: 'PHILIPPINES', slug: 'mlbb-mpl-philippines-17-2026-regular-season', league: 'MPL PH S17' },
  { id: 'MY', name: 'MALAYSIA', slug: 'mlbb-mpl-malaysia-17-2026-regular-season', league: 'MPL MY S17' },
];

const isWeb = Platform.OS === 'web';

const TournamentHubScreen = () => {
  const navigation = useNavigation();
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [nextMatches, setNextMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegionModal, setShowRegionModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedRegion]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matches, stand] = await Promise.all([
        MLBBApiService.getMLBBMatches('not_started', 10),
        MLBBApiService.getMLBBStandings(selectedRegion.slug)
      ]);

      if (matches) setNextMatches(matches);
      if (stand && stand.length > 0) {
        const sortedStandings = stand.sort((a, b) => a.rank - b.rank);
        setStandings(sortedStandings);
      } else {
        setStandings([]);
      }
    } catch (error) {
      console.error('Failed to fetch tournament data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day} ${time}`;
  };

  const renderTop3 = () => (
    <View style={styles.top3Container}>
      {standings.slice(0, 3).map((team, idx) => {
        const totalGames = team.wins + team.losses;
        const winRate = totalGames > 0 ? ((team.wins / totalGames) * 100).toFixed(0) : '0';
        return (
          <View key={idx} style={[styles.top3Card, idx === 0 && styles.firstPlace]}>
            <View style={styles.top3Badge}>
              <Text style={styles.top3BadgeText}>{winRate}% WR</Text>
            </View>
            <Text style={styles.top3Rank}>#{idx + 1}</Text>
            <View style={styles.top3LogoBg}>
              <Image
                source={TEAM_LOGOS[team.acronym] ? TEAM_LOGOS[team.acronym] : (team.logo ? { uri: team.logo } : { uri: `https://placehold.co/100/111/white?text=${team.acronym || '?'}` })}
                style={styles.top3Logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.top3Name} numberOfLines={1}>{team.acronym || team.teamName.split(' ')[0]}</Text>
            <Text style={styles.top3Points}>{team.wins}W - {team.losses}L</Text>
            <Text style={styles.top3SubStat}>{team.gameWins} GWINS</Text>
          </View>
        );
      })}
    </View>
  );

  const renderHeader = () => (
    <View>
      <LinearGradient colors={['#1a1a1a', '#000']} style={styles.heroHeader}>
        <View style={styles.topNav}>
          <Text style={styles.brandTitle}>MOLECUL</Text>
          <TouchableOpacity onPress={() => setShowRegionModal(true)} style={styles.globeIcon}>
            <Ionicons name="globe-outline" size={24} color={PALETTE.redNeon} />
            <View style={styles.regionBadge}><Text style={styles.regionBadgeText}>{selectedRegion.id}</Text></View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroSubtitle}>REGULAR SEASON | {selectedRegion.league}</Text>
          <Text style={styles.heroTitle}>{selectedRegion.name}</Text>
          <Text style={styles.heroTitle}>POWER RANK</Text>
        </View>

        {standings.length > 0 ? renderTop3() : (
          <View style={styles.emptyStandings}><Text style={styles.emptyText}>NO DATA FOR {selectedRegion.name}</Text></View>
        )}
      </LinearGradient>
    </View>
  );

  const renderStandingItem = (item, index) => (
    <View key={index} style={styles.standingCard}>
      <View style={styles.standingLeft}>
        <Text style={styles.rankNumber}>{(index + 4) < 10 ? `0${index + 4}` : (index + 4)}</Text>
        <View style={styles.vLine} />
        <View style={styles.teamBrand}>
          <View style={styles.miniLogoBox}>
            <Image 
              source={TEAM_LOGOS[item.acronym] ? TEAM_LOGOS[item.acronym] : (item.logo ? { uri: item.logo } : { uri: `https://placehold.co/100/111/white?text=${item.acronym || '?'}` })} 
              style={styles.miniLogo} 
              resizeMode="contain"
            />
          </View>
            <View>
              <Text style={styles.teamNameMain}>{(item.teamName || 'UNKNOWN').toUpperCase()}</Text>
              <Text style={styles.teamWLR}>{item.wins}W - {item.losses}L ({((item.wins / (item.wins + item.losses || 1)) * 100).toFixed(0)}% WR)</Text>
            </View>
        </View>
      </View>
      <View style={styles.standingRight}>
        <Text style={styles.statMain}>{item.gameWins}</Text>
        <Text style={styles.statSub}>G.WINS</Text>
      </View>
    </View>
  );

  const renderUpcoming = () => (
    <View style={styles.upcomingContainer}>
      <View style={[styles.sectionHeader, { marginTop: isWeb ? 0 : 40 }]}>
        <Text style={styles.sectionTitleMain}>UPCOMING</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SCHEDULE')}>
          <Text style={styles.viewMoreText}>FULL SCHEDULE</Text>
        </TouchableOpacity>
      </View>

      <View style={isWeb ? styles.matchesColWeb : styles.matchesRow}>
        {nextMatches.slice(0, isWeb ? 4 : 2).map((match, idx) => (
          <TouchableOpacity key={idx} style={styles.smallMatchCard}>
            <Text style={styles.matchTime}>{formatTime(match.beginAt)}</Text>
            <Text style={styles.matchTeams}>{match.opponents?.[0]?.acronym || 'TBD'} VS {match.opponents?.[1]?.acronym || 'TBD'}</Text>
            <Text style={styles.matchLeague}>{(match.league || 'PRO').substring(0, 10).toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        {renderHeader()}
        
        {isWeb ? (
          /* WEB TWO-PANE LAYOUT */
          <View style={styles.webTwoPane}>
            <View style={styles.webLeftPane}>
              <View style={[styles.sectionHeader, { marginTop: 0 }]}>
                <Text style={styles.sectionTitleMain}>{selectedRegion.league}</Text>
                <Text style={styles.sectionTitleSub}>OFFICIAL TOURNAMENT RANKINGS</Text>
              </View>
              {standings.slice(3).map((item, index) => renderStandingItem(item, index))}
            </View>
            <View style={styles.webRightPane}>
              {renderUpcoming()}
            </View>
          </View>
        ) : (
          /* MOBILE SINGLE COLUMN LAYOUT */
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleMain}>{selectedRegion.league}</Text>
              <Text style={styles.sectionTitleSub}>OFFICIAL TOURNAMENT RANKINGS</Text>
            </View>
            {standings.slice(3).map((item, index) => renderStandingItem(item, index))}
            {renderUpcoming()}
          </View>
        )}
      </ScrollView>

      <Modal visible={showRegionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>SWITCH REGION</Text>
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
  container: { flex: 1, backgroundColor: '#000' },
  heroHeader: { paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25 },
  brandTitle: { color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: 5 },
  globeIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222', position: 'relative' },
  regionBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: PALETTE.redNeon, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  regionBadgeText: { color: 'white', fontSize: 8, fontWeight: 'bold' },

  heroTextContainer: { paddingHorizontal: 30, marginTop: 10 },
  heroSubtitle: { color: PALETTE.redNeon, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 5 },
  heroTitle: { color: 'white', fontSize: isWeb ? 48 : 38, fontWeight: '900', lineHeight: isWeb ? 52 : 40 },

  top3Container: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, gap: isWeb ? 20 : 10 },
  top3Card: { flex: 1, maxWidth: isWeb ? 200 : undefined, backgroundColor: '#111', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#222', position: 'relative', marginHorizontal: isWeb ? 10 : 0 },
  firstPlace: { borderColor: PALETTE.redNeon, backgroundColor: '#1a1010' },
  top3Badge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#222', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  top3BadgeText: { color: PALETTE.redNeon, fontSize: 7, fontWeight: 'bold' },
  top3Rank: { color: PALETTE.redNeon, fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  top3LogoBg: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#000', marginBottom: 10, padding: 5 },
  top3Logo: { width: '100%', height: '100%' },
  top3Name: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  top3Points: { color: '#eee', fontSize: 11, fontWeight: 'bold', marginTop: 5 },
  top3SubStat: { color: '#444', fontSize: 8, marginTop: 2, fontWeight: 'bold' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 25, marginTop: 40, marginBottom: 20 },
  sectionTitleMain: { color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  sectionTitleSub: { color: '#444', fontSize: 9, fontWeight: 'bold' },
  viewMoreText: { color: PALETTE.redNeon, fontSize: 10, fontWeight: 'bold' },

  standingCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a0a0a', marginHorizontal: 20, padding: 20, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#111' },
  standingLeft: { flexDirection: 'row', alignItems: 'center' },
  rankNumber: { color: '#333', fontSize: 18, fontWeight: '900', width: 30 },
  vLine: { width: 1, height: 20, backgroundColor: '#222', marginHorizontal: 15 },
  teamBrand: { flexDirection: 'row', alignItems: 'center' },
  miniLogoBox: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#000', padding: 5, marginRight: 12 },
  miniLogo: { width: '100%', height: '100%' },
  teamNameMain: { color: 'white', fontSize: 12, fontWeight: '700' },
  teamWLR: { color: '#555', fontSize: 9, fontWeight: 'bold', marginTop: 2 },
  standingRight: { alignItems: 'flex-end' },
  statMain: { color: 'white', fontSize: 18, fontWeight: '900' },
  statSub: { color: '#444', fontSize: 8, fontWeight: 'bold' },

  upcomingContainer: { flex: 1 },
  matchesRow: { flexDirection: 'row', gap: 15, paddingHorizontal: 25 },
  matchesColWeb: { flexDirection: 'column', gap: 15, paddingHorizontal: 25 },
  smallMatchCard: { flex: 1, backgroundColor: '#0a0a0a', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#111' },
  matchTime: { color: PALETTE.redNeon, fontSize: 10, fontWeight: 'bold' },
  matchTeams: { color: 'white', fontSize: 12, fontWeight: 'bold', marginVertical: 8 },
  matchLeague: { color: '#444', fontSize: 8, fontWeight: 'bold' },

  emptyStandings: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#444', fontSize: 12, fontWeight: 'bold' },

  // Web Specific
  webTwoPane: { flexDirection: 'row', marginTop: 40, paddingHorizontal: 20 },
  webLeftPane: { flex: 2, paddingRight: 20 },
  webRightPane: { flex: 1 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 300, backgroundColor: '#111', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#222' },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', letterSpacing: 2 },
  regionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  selectedRegionItem: { backgroundColor: '#1a1010', paddingHorizontal: 10, borderRadius: 8 },
  regionItemText: { color: '#888', fontSize: 14, fontWeight: 'bold' },
  selectedRegionItemText: { color: 'white' },
  closeBtn: { marginTop: 25, alignItems: 'center', paddingVertical: 10 },
  closeBtnText: { color: '#444', fontSize: 12, fontWeight: 'bold' },
});

export default TournamentHubScreen;