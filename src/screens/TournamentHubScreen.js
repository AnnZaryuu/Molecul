import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Image, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PALETTE } from '../theme/theme';
import { TEAM_LOGOS } from '../theme/teamLogos';
import { MLBBApiService } from '../services/mlbbApiService';
import { useNavigation } from '@react-navigation/native';

const CROWN_IMG = require('../../assets/crown.png');

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

  const RANK_COLORS = { 1: '#FFD700', 2: '#A8A8A8', 3: '#CD7F32' };

  const renderTop3 = () => {
    const top3 = standings.slice(0, 3);
    if (top3.length === 0) return null;

    // Podium visual order: [#2 left, #1 center, #3 right]
    const podium = [
      { team: top3[1] || null, rank: 2 },
      { team: top3[0],          rank: 1 },
      { team: top3[2] || null, rank: 3 },
    ];

    return (
      <View style={styles.top3Container}>
        {podium.map(({ team, rank }) => {
          if (!team) return <View key={rank} style={styles.top3CardWrap} />;
          const isFirst = rank === 1;
          const rankColor = RANK_COLORS[rank];
          const totalGames = team.wins + team.losses;
          const winRate = totalGames > 0 ? ((team.wins / totalGames) * 100).toFixed(0) : '0';

          return (
            <View key={rank} style={[styles.top3CardWrap, isFirst && styles.top3CardWrapFirst]}>
              {/* Crown above #1 */}
              {isFirst && (
                <View style={styles.crownWrap}>
                  <Image source={CROWN_IMG} style={styles.crownImg} resizeMode="contain" />
                </View>
              )}

              {/* Rank pill for #2 and #3 */}
              {!isFirst && (
                <View style={[styles.rankPill, { borderColor: rankColor + '55', backgroundColor: rankColor + '18' }]}>
                  <Text style={[styles.rankPillText, { color: rankColor }]}>#{rank}</Text>
                </View>
              )}

              {/* Card */}
              <View style={[
                styles.top3Card,
                { borderColor: rankColor + (isFirst ? 'ff' : '66') },
                isFirst && styles.firstPlaceCard,
              ]}>
                {/* WR badge */}
                <View style={[styles.top3Badge, { backgroundColor: rankColor + '20' }]}>
                  <Text style={[styles.top3BadgeText, { color: rankColor }]}>{winRate}% WR</Text>
                </View>

                {/* Logo */}
                <View style={[styles.top3LogoBg, { borderColor: rankColor + '55' }, isFirst && styles.top3LogoBgFirst]}>
                  <Image
                    source={TEAM_LOGOS[team.acronym] ? TEAM_LOGOS[team.acronym] : (team.logo ? { uri: team.logo } : { uri: `https://placehold.co/100/111/white?text=${team.acronym || '?'}` })}
                    style={styles.top3Logo}
                    resizeMode="contain"
                  />
                </View>

                {/* Rank number inside card (#1 only) */}
                {isFirst && (
                  <Text style={[styles.top3RankCenter, { color: rankColor }]}>#1</Text>
                )}

                <Text style={[styles.top3Name, isFirst && styles.top3NameFirst]} numberOfLines={1}>
                  {team.acronym || team.teamName.split(' ')[0]}
                </Text>
                <Text style={[styles.top3Points, isFirst && styles.top3PointsFirst]}>
                  {team.wins}W – {team.losses}L
                </Text>
                <Text style={styles.top3SubStat}>{team.gameWins} GWINS</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

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

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.tableHeadRank}>#</Text>
      <View style={styles.tableHeadLogo} />
      <Text style={[styles.tableHeadLabel, { flex: 1 }]}>TEAM</Text>
      <Text style={styles.tableHeadStat}>W</Text>
      <Text style={styles.tableHeadStat}>L</Text>
      <Text style={styles.tableHeadStat}>WR</Text>
      <Text style={styles.tableHeadStatGW}>GW</Text>
    </View>
  );

  const renderStandingItem = (item, index) => {
    const rank = index + 4;
    const totalGames = item.wins + item.losses || 1;
    const wr = ((item.wins / totalGames) * 100).toFixed(0);
    const logoSrc = TEAM_LOGOS[item.acronym]
      ? TEAM_LOGOS[item.acronym]
      : (item.logo ? { uri: item.logo } : { uri: `https://placehold.co/40/111/white?text=${item.acronym || '?'}` });

    return (
      <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
        {/* Rank */}
        <Text style={styles.tableRank}>{rank < 10 ? `0${rank}` : rank}</Text>

        {/* Logo */}
        <View style={styles.tableLogoBox}>
          <Image source={logoSrc} style={styles.tableLogoImg} resizeMode="contain" />
        </View>

        {/* Team name */}
        <Text style={styles.tableName} numberOfLines={1}>
          {(item.teamName || 'UNKNOWN').toUpperCase()}
        </Text>

        {/* W */}
        <Text style={[styles.tableStat, { color: '#4ade80' }]}>{item.wins}</Text>
        {/* L */}
        <Text style={[styles.tableStat, { color: '#f87171' }]}>{item.losses}</Text>
        {/* WR */}
        <Text style={styles.tableStatWR}>{wr}%</Text>
        {/* GW */}
        <Text style={styles.tableStatGW}>{item.gameWins}</Text>
      </View>
    );
  };

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
              {/* Compact table */}
              <View style={styles.tableContainer}>
                {renderTableHeader()}
                {standings.slice(3).map((item, index) => renderStandingItem(item, index))}
              </View>
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
            {/* Compact table */}
            <View style={styles.tableContainer}>
              {renderTableHeader()}
              {standings.slice(3).map((item, index) => renderStandingItem(item, index))}
            </View>
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

  // ── Top 3 Podium ───────────────────────────────────────────────────────────
  top3Container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',       // floor-align: podium effect
    marginTop: 24,
    gap: isWeb ? 14 : 8,
    paddingHorizontal: isWeb ? 60 : 10,
  },
  top3CardWrap: {
    flex: 1,
    alignItems: 'center',
    maxWidth: isWeb ? 175 : undefined,
  },
  top3CardWrapFirst: {
    zIndex: 1,
  },

  // Crown
  crownWrap: {
    alignItems: 'center',
    marginBottom: -10,
    zIndex: 2,
  },
  crownImg: {
    width: isWeb ? 52 : 44,
    height: isWeb ? 44 : 36,
  },

  // Rank pill (#2 and #3)
  rankPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  rankPillText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  // Cards
  top3Card: {
    width: '100%',
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingTop: 28,
    paddingBottom: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  firstPlaceCard: {
    backgroundColor: '#16120a',
    paddingTop: 36,
    paddingBottom: 18,
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },

  // WR badge
  top3Badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  top3BadgeText: { fontSize: 7, fontWeight: '800' },

  // Rank number inside #1 card
  top3RankCenter: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: 2, marginBottom: 4 },

  // Logo circles
  top3LogoBg: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#000', marginBottom: 8,
    padding: 5, borderWidth: 1.5,
  },
  top3LogoBgFirst: { width: 70, height: 70, borderRadius: 35 },
  top3Logo: { width: '100%', height: '100%' },

  // Name
  top3Name: { color: '#999', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  top3NameFirst: { color: 'white', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },

  // W-L record
  top3Points: { color: '#666', fontSize: 10, fontWeight: '700', marginTop: 4 },
  top3PointsFirst: { color: '#ddd', fontSize: 12, fontWeight: '800', marginTop: 5 },

  top3SubStat: { color: '#333', fontSize: 8, marginTop: 3, fontWeight: '700' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 25, marginTop: 40, marginBottom: 20 },
  sectionTitleMain: { color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  sectionTitleSub: { color: '#444', fontSize: 9, fontWeight: 'bold' },
  viewMoreText: { color: PALETTE.redNeon, fontSize: 10, fontWeight: 'bold' },

  // ── Compact Table Standings ──────────────────────────────────────────────────────
  tableContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#161616',
    backgroundColor: '#080808',
  },

  // Header row
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  tableHeadRank:  { color: '#2a2a2a', fontSize: 9, fontWeight: '900', width: 28, letterSpacing: 0.5 },
  tableHeadLogo:  { width: 28, marginRight: 10 },
  tableHeadLabel: { color: '#333', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  tableHeadStat:  { color: '#2a2a2a', fontSize: 9, fontWeight: '700', width: 28, textAlign: 'right', letterSpacing: 0.5 },
  tableHeadStatGW:{ color: '#2a2a2a', fontSize: 9, fontWeight: '700', width: 32, textAlign: 'right', letterSpacing: 0.5 },

  // Data rows
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  tableRowAlt: { backgroundColor: '#0c0c0c' },

  tableRank: { color: '#2e2e2e', fontSize: 11, fontWeight: '900', width: 28, letterSpacing: 0.5 },

  tableLogoBox: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#0d0d0d',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
    borderWidth: 1, borderColor: '#1a1a1a',
    padding: 2,
  },
  tableLogoImg: { width: '100%', height: '100%' },

  tableName: {
    flex: 1,
    color: '#ccc',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  tableStat: {
    width: 28,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },

  tableStatWR: {
    width: 28,
    color: '#555',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'right',
  },

  tableStatGW: {
    width: 32,
    color: PALETTE.redNeon,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'right',
  },

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