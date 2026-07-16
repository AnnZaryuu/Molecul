import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Image, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PALETTE } from '../theme/theme';
import { TEAM_LOGOS } from '../theme/teamLogos';
import { MLBBApiService } from '../services/mlbbApiService';
import { useNavigation } from '@react-navigation/native';

// ── Region config with BOTH regular + playoff slugs ──────────────────────────
const REGIONS = [
  {
    id: 'ID', name: 'INDONESIA', league: 'MPL ID S17',
    regularSlug: 'mlbb-mpl-indonesia-17-2026-regular-season',
    playoffSlug: 'mlbb-mpl-indonesia-17-2026-playoffs',
  },
  {
    id: 'PH', name: 'PHILIPPINES', league: 'MPL PH S17',
    regularSlug: 'mlbb-mpl-philippines-17-2026-regular-season',
    playoffSlug: 'mlbb-mpl-philippines-17-2026-playoffs',
  },
  {
    id: 'MY', name: 'MALAYSIA', league: 'MPL MY S17',
    regularSlug: 'mlbb-mpl-malaysia-17-2026-regular-season',
    playoffSlug: 'mlbb-mpl-malaysia-17-2026-playoffs',
  },
];

const isWeb = Platform.OS === 'web';

const TournamentHubScreen = () => {
  const navigation = useNavigation();
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [nextMatches, setNextMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [activePhase, setActivePhase] = useState('REGULAR SEASON'); // tracks which phase has data

  useEffect(() => {
    fetchData();
  }, [selectedRegion]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch matches in parallel
      const matchesPromise = MLBBApiService.getMLBBMatches('not_started', 10);

      // ── Try PLAYOFF first, fallback to REGULAR SEASON ──────────────────────
      let stand = [];
      let phase = 'REGULAR SEASON';

      // Try playoff slug first
      if (selectedRegion.playoffSlug) {
        const playoffStand = await MLBBApiService.getMLBBStandings(selectedRegion.playoffSlug);
        if (playoffStand && playoffStand.length > 0) {
          stand = playoffStand;
          phase = 'PLAYOFFS';
        }
      }

      // Fallback to regular season if playoff has no data
      if (stand.length === 0 && selectedRegion.regularSlug) {
        const regularStand = await MLBBApiService.getMLBBStandings(selectedRegion.regularSlug);
        if (regularStand && regularStand.length > 0) {
          stand = regularStand;
          phase = 'REGULAR SEASON';
        }
      }

      const matches = await matchesPromise;
      if (matches) setNextMatches(matches);

      if (stand.length > 0) {
        setStandings(stand.sort((a, b) => a.rank - b.rank));
      } else {
        setStandings([]);
      }
      setActivePhase(phase);
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

  const RANK_COLORS = { 1: PALETTE.goldRank, 2: PALETTE.silverRank, 3: PALETTE.bronzeRank };

  const renderTop3 = () => {
    const top3 = standings.slice(0, 3);
    if (top3.length === 0) return null;

    const podium = [
      { team: top3[1] || null, rank: 2 },
      { team: top3[0], rank: 1 },
      { team: top3[2] || null, rank: 3 },
    ];

    return (
      <View style={styles.top3Container}>
        {podium.map(({ team, rank }) => {
          if (!team) return <View key={rank} style={styles.top3CardWrap} />;
          const isFirst = rank === 1;
          const rankColor = RANK_COLORS[rank];

          return (
            <View key={rank} style={[styles.top3CardWrap, isFirst && styles.top3CardWrapFirst]}>
              {/* All ranks get the same rank pill style */}
              <View style={[styles.rankPill, { borderColor: rankColor + '55', backgroundColor: rankColor + '18' }]}>
                <Text style={[styles.rankPillText, { color: rankColor }]}>#{rank}</Text>
              </View>

              <View style={[
                styles.top3Card,
                { borderColor: rankColor + (isFirst ? 'ff' : '44') },
                isFirst && styles.firstPlaceCard,
              ]}>
                {/* Accent top bar */}
                <View style={[styles.top3AccentBar, { backgroundColor: rankColor }]} />

                {team.winRate !== null && (
                  <View style={[styles.top3Badge, { backgroundColor: rankColor + '20' }]}>
                    <Text style={[styles.top3BadgeText, { color: rankColor }]}>{team.winRate}% WR</Text>
                  </View>
                )}

                <View style={[styles.top3LogoBg, { borderColor: rankColor + '55' }, isFirst && styles.top3LogoBgFirst]}>
                  <Image
                    source={TEAM_LOGOS[team.acronym] ? TEAM_LOGOS[team.acronym] : (team.logo ? { uri: team.logo } : { uri: `https://placehold.co/100/111/white?text=${team.acronym || '?'}` })}
                    style={styles.top3Logo}
                    resizeMode="contain"
                  />
                </View>

                <Text style={[styles.top3Name, isFirst && styles.top3NameFirst]} numberOfLines={1}>
                  {team.acronym || team.teamName.split(' ')[0]}
                </Text>
                {team.wins !== null && (
                  <>
                    <Text style={[styles.top3Points, isFirst && styles.top3PointsFirst]}>
                      {team.wins}W – {team.losses}L
                    </Text>
                    <Text style={styles.top3SubStat}>{team.gameWins} GWINS</Text>
                  </>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      <LinearGradient colors={[PALETTE.surface2, PALETTE.black]} style={styles.heroHeader}>
        <View style={styles.topNav}>
          <View style={styles.brandWrap}>
            <Image source={require('../../assets/molecul.png')} style={{ width: 24, height: 24, backgroundColor: 'transparent' }} resizeMode="contain" />
            <Text style={styles.brandTitle}>MOLECUL</Text>
          </View>
          <TouchableOpacity onPress={() => setShowRegionModal(true)} style={styles.globeIcon}>
            <Ionicons name="globe-outline" size={22} color={PALETTE.accent} />
            <View style={styles.regionBadge}><Text style={styles.regionBadgeText}>{selectedRegion.id}</Text></View>
          </TouchableOpacity>
        </View>

        <View style={styles.heroTextContainer}>
          {/* Phase badge — shows PLAYOFFS or REGULAR SEASON dynamically */}
          <View style={styles.phaseBadgeRow}>
            <View style={[
              styles.phaseBadge,
              activePhase === 'PLAYOFFS' && styles.phaseBadgePlayoff,
            ]}>
              <Ionicons
                name={activePhase === 'PLAYOFFS' ? 'flame' : 'football-outline'}
                size={10}
                color={activePhase === 'PLAYOFFS' ? PALETTE.redNeon : PALETTE.accent}
              />
              <Text style={[
                styles.phaseBadgeText,
                activePhase === 'PLAYOFFS' && styles.phaseBadgeTextPlayoff,
              ]}>
                {activePhase}
              </Text>
            </View>
            <Text style={styles.heroLeagueLabel}>{selectedRegion.league}</Text>
          </View>

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
      {activePhase !== 'PLAYOFFS' && (
        <>
          <Text style={styles.tableHeadStat}>W</Text>
          <Text style={styles.tableHeadStat}>L</Text>
          <Text style={styles.tableHeadStat}>WR</Text>
          <Text style={styles.tableHeadStatGW}>GW</Text>
        </>
      )}
    </View>
  );

  const renderStandingItem = (item, index) => {
    const rank = index + 4;
    const logoSrc = TEAM_LOGOS[item.acronym]
      ? TEAM_LOGOS[item.acronym]
      : (item.logo ? { uri: item.logo } : { uri: `https://placehold.co/40/111/white?text=${item.acronym || '?'}` });

    return (
      <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
        <Text style={styles.tableRank}>{rank < 10 ? `0${rank}` : rank}</Text>
        <View style={styles.tableLogoBox}>
          <Image source={logoSrc} style={styles.tableLogoImg} resizeMode="contain" />
        </View>
        <Text style={styles.tableName} numberOfLines={1}>
          {(item.teamName || 'UNKNOWN').toUpperCase()}
        </Text>
        {activePhase !== 'PLAYOFFS' && (
          <>
            <Text style={[styles.tableStat, { color: PALETTE.win }]}>{item.wins}</Text>
            <Text style={[styles.tableStat, { color: PALETTE.loss }]}>{item.losses}</Text>
            <Text style={styles.tableStatWR}>{item.winRate}%</Text>
            <Text style={styles.tableStatGW}>{item.gameWins}</Text>
          </>
        )}
      </View>
    );
  };

  // ── Section title label changes based on phase ─────────────────────────────
  const standingsLabel = activePhase;
  const standingsSub = activePhase === 'PLAYOFFS'
    ? 'PLAYOFF BRACKET STANDINGS'
    : 'OFFICIAL RANKINGS';

  const renderUpcoming = () => (
    <View style={styles.upcomingContainer}>
      <View style={[styles.sectionHeader, { marginTop: isWeb ? 0 : 40 }]}>
        <View style={styles.sectionTitleWrap}>
          <View style={styles.sectionAccentBar} />
          <Text style={styles.sectionTitleMain}>UPCOMING</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('SCHEDULE')} style={styles.viewMoreBtn}>
          <Text style={styles.viewMoreText}>FULL SCHEDULE</Text>
          <Ionicons name="chevron-forward" size={12} color={PALETTE.accent} />
        </TouchableOpacity>
      </View>

      <View style={isWeb ? styles.matchesColWeb : styles.matchesRow}>
        {nextMatches.slice(0, isWeb ? 4 : 2).map((match, idx) => (
          <TouchableOpacity key={idx} style={styles.smallMatchCard}>
            <View style={styles.matchCardAccent} />
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
          <View style={styles.webTwoPane}>
            <View style={styles.webLeftPane}>
              <View style={[styles.sectionHeader, { marginTop: 0 }]}>
                <View style={styles.sectionTitleWrap}>
                  <View style={[styles.sectionAccentBar, activePhase === 'PLAYOFFS' && { backgroundColor: PALETTE.redNeon }]} />
                  <Text style={styles.sectionTitleMain}>{standingsLabel}</Text>
                </View>
                <Text style={styles.sectionTitleSub}>{standingsSub}</Text>
              </View>
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
          <View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWrap}>
                <View style={[styles.sectionAccentBar, activePhase === 'PLAYOFFS' && { backgroundColor: PALETTE.redNeon }]} />
                <Text style={styles.sectionTitleMain}>{standingsLabel}</Text>
              </View>
              <Text style={styles.sectionTitleSub}>{standingsSub}</Text>
            </View>
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
            <View style={styles.modalAccentBar} />
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
                {selectedRegion.id === region.id && <Ionicons name="checkmark" size={18} color={PALETTE.accent} />}
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
  container: { flex: 1, backgroundColor: PALETTE.black },
  heroHeader: { paddingBottom: 40, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25 },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandAccent: { width: 3, height: 24, backgroundColor: PALETTE.accent },
  brandTitle: { color: PALETTE.textMain, fontSize: 22, fontWeight: '900', letterSpacing: 6 },
  globeIcon: {
    width: 44, height: 44, borderRadius: 0,
    backgroundColor: PALETTE.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: PALETTE.lightGray, position: 'relative',
  },
  regionBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: PALETTE.accent, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 0 },
  regionBadgeText: { color: PALETTE.black, fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },

  heroTextContainer: { paddingHorizontal: 30, marginTop: 10 },

  // ── Phase Badge ────────────────────────────────────────────────────────────
  phaseBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  phaseBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: PALETTE.accentDim,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 0,
    borderWidth: 1, borderColor: PALETTE.accent + '40',
  },
  phaseBadgePlayoff: {
    backgroundColor: PALETTE.redNeonDim,
    borderColor: PALETTE.redNeon + '40',
  },
  phaseBadgeText: { color: PALETTE.accent, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  phaseBadgeTextPlayoff: { color: PALETTE.redNeon },
  heroLeagueLabel: { color: PALETTE.textDark, fontSize: 10, fontWeight: '800', letterSpacing: 2 },

  heroTitle: { color: PALETTE.textMain, fontSize: isWeb ? 48 : 36, fontWeight: '900', lineHeight: isWeb ? 52 : 40 },

  // ── Top 3 Podium ───────────────────────────────────────────────────────────
  top3Container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 28,
    gap: isWeb ? 12 : 6,
    paddingHorizontal: isWeb ? 60 : 10,
  },
  top3CardWrap: { flex: 1, alignItems: 'center', maxWidth: isWeb ? 175 : undefined },
  top3CardWrapFirst: { zIndex: 1 },

  rankPill: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 0,
    borderWidth: 1, marginBottom: 6,
  },
  rankPillText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  top3Card: {
    width: '100%',
    backgroundColor: PALETTE.surface,
    paddingHorizontal: 10, paddingTop: 26, paddingBottom: 14,
    borderRadius: 2,
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  top3AccentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  firstPlaceCard: {
    backgroundColor: '#12100a',
    paddingTop: 30, paddingBottom: 18,
    shadowColor: PALETTE.goldRank, shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 0 }, elevation: 12,
  },

  top3Badge: {
    position: 'absolute', top: 10, right: 8,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 0,
  },
  top3BadgeText: { fontSize: 7, fontWeight: '800' },

  top3LogoBg: {
    width: 50, height: 50, borderRadius: 2,
    backgroundColor: PALETTE.black, marginBottom: 8,
    padding: 5, borderWidth: 1,
  },
  top3LogoBgFirst: { width: 66, height: 66, borderRadius: 2 },
  top3Logo: { width: '100%', height: '100%' },

  top3Name: { color: PALETTE.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  top3NameFirst: { color: PALETTE.textMain, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  top3Points: { color: PALETTE.textDark, fontSize: 10, fontWeight: '700', marginTop: 4 },
  top3PointsFirst: { color: '#ddd', fontSize: 12, fontWeight: '800', marginTop: 5 },
  top3SubStat: { color: PALETTE.textDark, fontSize: 8, marginTop: 3, fontWeight: '700' },

  // ── Section Headers ────────────────────────────────────────────────────────
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginTop: 40, marginBottom: 20 },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionAccentBar: { width: 3, height: 22, backgroundColor: PALETTE.accent },
  sectionTitleMain: { color: PALETTE.textMain, fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  sectionTitleSub: { color: PALETTE.textDark, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  viewMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewMoreText: { color: PALETTE.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  // ── Compact Table ──────────────────────────────────────────────────────────
  tableContainer: {
    marginHorizontal: 16, borderRadius: 0, overflow: 'hidden',
    borderWidth: 1, borderColor: PALETTE.lightGray, backgroundColor: PALETTE.surface,
  },
  tableHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: PALETTE.surface2,
    borderBottomWidth: 2, borderBottomColor: PALETTE.accent + '30',
  },
  tableHeadRank: { color: PALETTE.textDark, fontSize: 9, fontWeight: '900', width: 28, letterSpacing: 1 },
  tableHeadLogo: { width: 28, marginRight: 10 },
  tableHeadLabel: { color: PALETTE.textDark, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  tableHeadStat: { color: PALETTE.textDark, fontSize: 9, fontWeight: '800', width: 28, textAlign: 'right', letterSpacing: 1 },
  tableHeadStatGW: { color: PALETTE.textDark, fontSize: 9, fontWeight: '800', width: 32, textAlign: 'right', letterSpacing: 1 },

  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: PALETTE.lightGray + '40',
  },
  tableRowAlt: { backgroundColor: PALETTE.surface2 + '50' },
  tableRank: { color: PALETTE.textDark, fontSize: 11, fontWeight: '900', width: 28, letterSpacing: 1 },
  tableLogoBox: {
    width: 26, height: 26, borderRadius: 2,
    backgroundColor: PALETTE.black,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10, borderWidth: 1, borderColor: PALETTE.lightGray, padding: 2,
  },
  tableLogoImg: { width: '100%', height: '100%' },
  tableName: { flex: 1, color: PALETTE.textMain, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  tableStat: { width: 28, fontSize: 11, fontWeight: '800', textAlign: 'right' },
  tableStatWR: { width: 28, color: PALETTE.textMuted, fontSize: 9, fontWeight: '700', textAlign: 'right' },
  tableStatGW: { width: 32, color: PALETTE.accent, fontSize: 11, fontWeight: '900', textAlign: 'right' },

  // ── Upcoming Matches ───────────────────────────────────────────────────────
  upcomingContainer: { flex: 1 },
  matchesRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 25 },
  matchesColWeb: { flexDirection: 'column', gap: 12, paddingHorizontal: 25 },
  smallMatchCard: {
    flex: 1, backgroundColor: PALETTE.surface,
    padding: 16, borderRadius: 0,
    borderWidth: 1, borderColor: PALETTE.lightGray,
    position: 'relative', overflow: 'hidden',
  },
  matchCardAccent: { position: 'absolute', top: 0, left: 0, width: 3, height: '100%', backgroundColor: PALETTE.accent },
  matchTime: { color: PALETTE.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginLeft: 8 },
  matchTeams: { color: PALETTE.textMain, fontSize: 13, fontWeight: '900', marginVertical: 8, marginLeft: 8, letterSpacing: 0.5 },
  matchLeague: { color: PALETTE.textDark, fontSize: 8, fontWeight: '800', letterSpacing: 1, marginLeft: 8 },

  emptyStandings: { padding: 40, alignItems: 'center' },
  emptyText: { color: PALETTE.textDark, fontSize: 12, fontWeight: '800', letterSpacing: 2 },

  webTwoPane: { flexDirection: 'row', marginTop: 40, paddingHorizontal: 20 },
  webLeftPane: { flex: 2, paddingRight: 20 },
  webRightPane: { flex: 1 },

  // ── Modal ──────────────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(4,6,14,0.88)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    width: 300, backgroundColor: PALETTE.surface,
    borderRadius: 0, padding: 28,
    borderWidth: 1, borderColor: PALETTE.lightGray,
    position: 'relative', overflow: 'hidden',
  },
  modalAccentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: PALETTE.accent },
  modalTitle: { color: PALETTE.textMain, fontSize: 16, fontWeight: '900', marginBottom: 20, letterSpacing: 3 },
  regionItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: PALETTE.lightGray + '60',
  },
  selectedRegionItem: { backgroundColor: PALETTE.accentDim, paddingHorizontal: 10, borderRadius: 0 },
  regionItemText: { color: PALETTE.textMuted, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  selectedRegionItemText: { color: PALETTE.textMain },
  closeBtn: { marginTop: 24, paddingVertical: 10, borderWidth: 1, borderColor: PALETTE.lightGray },
  closeBtnText: { color: PALETTE.textDark, fontSize: 11, fontWeight: '900', textAlign: 'center', letterSpacing: 2 },
});

export default TournamentHubScreen;