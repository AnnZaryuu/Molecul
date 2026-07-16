import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, Linking, Platform, useWindowDimensions, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PALETTE } from '../theme/theme';
import { TEAM_LOGOS } from '../theme/teamLogos';
import { MLBBApiService } from '../services/mlbbApiService';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const REGIONS = [
  { id: 'ALL', name: 'GLOBAL FEED', league: 'ALL' },
  { id: 'ID', name: 'INDONESIA', slug: 'mlbb-mpl-indonesia-17-2026-regular-season', league: 'MPL ID S17' },
  { id: 'PH', name: 'PHILIPPINES', slug: 'mlbb-mpl-philippines-17-2026-regular-season', league: 'MPL PH S17' },
  { id: 'MY', name: 'MALAYSIA', slug: 'mlbb-mpl-malaysia-17-2026-regular-season', league: 'MPL MY S17' },
];

const isWeb = Platform.OS === 'web';

const ScheduleScreen = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const { userToken, userInfo, fetchProfile } = useContext(AuthContext);
  const isLoggedIn = userToken && userToken !== 'GUEST';
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegionModal, setShowRegionModal] = useState(false);

  // Predict State
  const [showPredictModal, setShowPredictModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [predictedTeamId, setPredictedTeamId] = useState(null);
  const [wager, setWager] = useState('100');
  const [predictLoading, setPredictLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const resettingRef = useRef(new Set());

  useEffect(() => {
    if (userInfo?.predictions) {
      const lostPredictions = userInfo.predictions.filter(p => p.status === 'lost');
      lostPredictions.forEach(p => {
        if (!resettingRef.current.has(p.id)) {
          resettingRef.current.add(p.id);
          setTimeout(async () => {
            try {
              await api.delete(`/predict/${p.id}`);
              setNotification({ message: 'This is test: Prediction reset!', type: 'success' });
              if (fetchProfile) fetchProfile();
              setTimeout(() => setNotification(null), 3000);
            } catch (e) {
              console.log('Error resetting prediction:', e);
            }
          }, 5000);
        }
      });
    }
  }, [userInfo?.predictions]);
  const [existingPredictionForModal, setExistingPredictionForModal] = useState(null);

  const handleOpenPredict = (match, existingPrediction) => {
    setSelectedMatch(match);
    if (existingPrediction) {
      setPredictedTeamId(String(existingPrediction.predicted_team_id));
      setExistingPredictionForModal(existingPrediction);
    } else {
      setPredictedTeamId(null);
      setExistingPredictionForModal(null);
    }
    setWager('100');
    setShowPredictModal(true);
  };

  const handlePredict = async () => {
    if (!predictedTeamId || !wager) return;
    setPredictLoading(true);
    try {
      const response = await api.post('/predict', {
        match_id: String(selectedMatch.id),
        predicted_team_id: String(predictedTeamId),
        wager: parseInt(wager)
      });
      setNotification({ message: 'Tebakan berhasil disimpan!', type: 'success' });
      setShowPredictModal(false);
      if (fetchProfile) fetchProfile();
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ message: error.response?.data?.message || 'Terjadi kesalahan saat memprediksi', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
    setPredictLoading(false);
  };

  const handleClaimPoints = async (predictionId) => {
    try {
      await api.post(`/predict/${predictionId}/claim`);
      setNotification({ message: 'Points claimed successfully!', type: 'success' });
      if (fetchProfile) fetchProfile();
      fetchMatches();
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ message: error.response?.data?.message || 'Failed to claim points', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [selectedRegion]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const [live, upcoming, dummyRes] = await Promise.all([
        MLBBApiService.getMLBBMatches('running', 10),
        MLBBApiService.getMLBBMatches('upcoming', 50),
        api.get('/dummy-matches').catch(() => ({ data: [] }))
      ]);

      let filteredLive = live || [];
      let filteredUpcoming = upcoming || [];

      // Format dummy matches
      const dummyMatches = (dummyRes.data || []).map(d => ({
        id: d.id,
        name: d.name,
        beginAt: d.begin_at,
        status: d.status,
        league: 'DUMMY LEAGUE',
        serie: 'TEST SERIES',
        matchType: 'BO3',
        numberOfGames: 3,
        results: [{ score: 0 }, { score: 0 }],
        opponents: [
          { id: d.team_a_id, name: d.team_a_name, acronym: d.team_a_name.substring(0, 4).toUpperCase() },
          { id: d.team_b_id, name: d.team_b_name, acronym: d.team_b_name.substring(0, 4).toUpperCase() }
        ]
      }));

      // Combine dummy matches at the top of upcoming
      filteredUpcoming = [...dummyMatches, ...filteredUpcoming];

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

    const prediction = userInfo?.predictions?.find(p => p.match_id === String(match.id));

    return (
      <View key={match.id} style={[styles.matchCard, isWeb && styles.matchCardWeb, isLive && styles.liveBorder]}>
        {/* Accent left bar */}
        <View style={[styles.cardAccentLeft, { backgroundColor: isLive ? PALETTE.redNeon : PALETTE.lightGray }]} />

        <View style={styles.cardHeader}>
          <View style={styles.leagueInfo}>
            {match.leagueLogo && <Image source={{ uri: match.leagueLogo }} style={styles.leagueLogo} />}
            <Text style={styles.leagueName}>{(match.league || "UNKNOWN LEAGUE").toUpperCase()}</Text>
          </View>
          {isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          )}
        </View>

        <Text style={styles.seriesText}>{(match.matchType || 'BO3').toUpperCase()} — {match.numberOfGames || 3} GAMES</Text>

        <View style={styles.scoreRow}>
          <View style={styles.teamInfo}>
            <Image source={teamALogo} style={styles.teamLogo} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.teamName}>{teamAName}</Text>
              {prediction?.predicted_team_id === String(teamA?.id) && (
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              )}
            </View>
          </View>

          <View style={styles.scoreCounter}>
            {isLive ? (
              <>
                <Text style={styles.scoreActive}>{match.results?.[0]?.score || 0}</Text>
                <Text style={styles.vsText}>—</Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.teamName}>{teamBName}</Text>
              {prediction?.predicted_team_id === String(teamB?.id) && (
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              )}
            </View>
          </View>
        </View>

        {(() => {
          if (isLive) {
            return (
              <TouchableOpacity
                style={styles.watchBtn}
                onPress={() => {
                  const url = match.streamUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(match.name + ' MLBB Live')}`;
                  Linking.openURL(url);
                }}
              >
                <Text style={styles.watchText}>WATCH STREAM</Text>
              </TouchableOpacity>
            );
          }

          if (!isLoggedIn) {
            return (
              <TouchableOpacity style={styles.reminderBtn} onPress={() => navigation.navigate('PROFILE')}>
                <Text style={styles.reminderText}>LOGIN TO PREDICT</Text>
              </TouchableOpacity>
            );
          }

          if (prediction) {
            if (prediction.status === 'won') {
              return (
                <TouchableOpacity style={styles.claimBtn} onPress={() => handleClaimPoints(prediction.id)}>
                  <Text style={styles.claimText}>CLAIM POINTS</Text>
                </TouchableOpacity>
              );
            }
            if (prediction.status === 'claimed') {
              return (
                <View style={styles.claimedBtn}>
                  <Text style={styles.claimedText}>POINTS CLAIMED</Text>
                </View>
              );
            }
            if (prediction.status === 'lost') {
              return (
                <View style={styles.lostBtn}>
                  <Text style={styles.lostText}>INCORRECT PREDICTION</Text>
                </View>
              );
            }
            // pending
            return (
              <TouchableOpacity style={styles.predictedBtn} onPress={() => handleOpenPredict(match, prediction)}>
                <Text style={styles.predictedText}>PREDICTED ({prediction.wager} P)</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity style={styles.reminderBtn} onPress={() => handleOpenPredict(match, null)}>
              <Text style={styles.reminderText}>PREDICT</Text>
            </TouchableOpacity>
          );
        })()}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.brandWrap}>
            <Image source={require('../../assets/molecul.png')} style={{ width: 24, height: 24, backgroundColor: 'transparent' }} resizeMode="contain" />
            <Text style={styles.logoText}>MOLECUL</Text>
          </View>
          <View style={styles.headerRight}>
            {isLoggedIn && (
              <View style={styles.coinBadge}>
                <Text style={{ color: PALETTE.black, fontWeight: '900', fontSize: 14 }}>P</Text>
                <Text style={styles.coinText}>{userInfo?.coins || 0}</Text>
              </View>
            )}
            <TouchableOpacity onPress={fetchMatches} style={styles.headerIconBtn}>
              <Ionicons name="sync" size={18} color={PALETTE.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowRegionModal(true)} style={styles.headerIconBtn}>
              <Ionicons name="globe-outline" size={20} color={PALETTE.textMain} />
              <View style={styles.regionBadge}><Text style={styles.regionBadgeText}>{selectedRegion.id}</Text></View>
            </TouchableOpacity>
          </View>
        </View>

        {notification && (
          <View style={[styles.notificationBox, notification.type === 'error' ? styles.notificationError : styles.notificationSuccess]}>
            <Text style={[styles.notificationText, notification.type === 'error' ? styles.notificationTextError : styles.notificationTextSuccess]}>
              {notification.message}
            </Text>
          </View>
        )}

        {/* ── Hero Title ── */}
        <View style={styles.heroContainer}>
          <Text style={styles.heroTitle}>{selectedRegion.id === 'ALL' ? 'GLOBAL' : selectedRegion.id}</Text>
          <Text style={styles.heroTitle}>SCHEDULE</Text>
          <View style={styles.heroUnderline} />
        </View>

        {loading ? (
          <View style={{ marginTop: 50 }}>
            <ActivityIndicator size="large" color={PALETTE.accent} />
            <Text style={styles.loadingText}>COLLECTING GLOBAL INTEL...</Text>
          </View>
        ) : (
          <View>
            {liveMatches.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <View style={styles.sectionTitleWrap}>
                  <View style={[styles.sectionAccentBar, { backgroundColor: PALETTE.redNeon }]} />
                  <Text style={styles.sectionTitle}>LIVE IN {selectedRegion.name}</Text>
                </View>
                <View style={isWeb ? styles.gridContainer : undefined}>
                  {liveMatches.map(m => renderMatchCard(m, true))}
                </View>
              </View>
            )}

            <View style={styles.sectionTitleWrap}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionTitle}>UPCOMING TOURNAMENTS</Text>
            </View>
            {upcomingMatches.length > 0 ? (
              <View style={isWeb ? styles.gridContainer : undefined}>
                {upcomingMatches.map(m => renderMatchCard(m, false))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={40} color={PALETTE.lightGray} />
                <Text style={styles.noMatchText}>NO UPCOMING MATCHES FOR {selectedRegion.name}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.footerSource}>
          <Text style={styles.sourceText}>DATA SOURCE: PANDASCORE GLOBAL API</Text>
          <Text style={styles.lastUpdate}>V 1.0.4 — MATCH CENTRAL HUB</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Region Modal ── */}
      <Modal visible={showRegionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalAccentBar} />
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
                {selectedRegion.id === region.id && <Ionicons name="checkmark" size={18} color={PALETTE.accent} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowRegionModal(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Predict Modal ── */}
      <Modal visible={showPredictModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalAccentBar, { backgroundColor: PALETTE.redNeon }]} />
            <Text style={styles.modalTitle}>{existingPredictionForModal ? 'ADD WAGER' : 'PREDICT MATCH'}</Text>

            {selectedMatch && (
              <View>
                <Text style={styles.predictSubtitle}>{existingPredictionForModal ? 'Locked winner (from previous prediction):' : 'Select winner:'}</Text>
                <View style={styles.predictTeamRow}>
                  {selectedMatch.opponents.map((team, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.predictTeamBtn,
                        predictedTeamId === String(team.id) && styles.predictTeamBtnActive,
                        existingPredictionForModal && predictedTeamId !== String(team.id) && { opacity: 0.2, borderColor: 'transparent' }
                      ]}
                      onPress={() => {
                        if (existingPredictionForModal) return;
                        setPredictedTeamId(String(team.id));
                      }}
                      disabled={!!existingPredictionForModal}
                    >
                      <Text style={[
                        styles.predictTeamText,
                        predictedTeamId === String(team.id) && styles.predictTeamTextActive
                      ]}>{team.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.predictSubtitle}>{existingPredictionForModal ? 'Add Wager (Coins):' : 'Wager (Coins):'}</Text>
                <TextInput
                  style={styles.predictInput}
                  keyboardType="numeric"
                  value={wager}
                  onChangeText={setWager}
                />

                <TouchableOpacity
                  style={[styles.predictSubmitBtn, predictLoading && { opacity: 0.5 }]}
                  onPress={handlePredict}
                  disabled={predictLoading}
                >
                  <Text style={styles.predictSubmitText}>{predictLoading ? 'PROCESSING...' : 'CONFIRM PREDICTION'}</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={() => setShowPredictModal(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.black },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 25, alignItems: 'center' },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandAccent: { width: 3, height: 20, backgroundColor: PALETTE.accent },
  logoText: { color: PALETTE.textMain, fontWeight: '900', letterSpacing: 5, fontSize: 16 },
  headerRight: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  coinBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: PALETTE.accent, paddingHorizontal: 10, paddingVertical: 4, gap: 5 },
  coinText: { color: PALETTE.black, fontSize: 12, fontWeight: '900' },
  headerIconBtn: {
    width: 38, height: 38, borderRadius: 0,     // ← SHARP
    backgroundColor: PALETTE.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: PALETTE.lightGray, position: 'relative',
  },
  regionBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: PALETTE.accent, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 0 },
  regionBadgeText: { color: PALETTE.black, fontSize: 8, fontWeight: '900' },

  // ── Hero Title ─────────────────────────────────────────────────────────────
  heroContainer: { paddingHorizontal: 30, marginVertical: 16 },
  heroTitle: { color: PALETTE.textMain, fontSize: isWeb ? 48 : 38, fontWeight: '900', lineHeight: isWeb ? 52 : 42, letterSpacing: 1 },
  heroUnderline: { width: 60, height: 3, backgroundColor: PALETTE.accent, marginTop: 12 },

  // ── Section Titles ─────────────────────────────────────────────────────────
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginBottom: 14 },
  sectionAccentBar: { width: 3, height: 16, backgroundColor: PALETTE.accent },
  sectionTitle: { color: PALETTE.textMain, fontSize: 11, fontWeight: '900', letterSpacing: 2, opacity: 0.5 },

  // ── Grid (Web) ─────────────────────────────────────────────────────────────
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },

  // ── Match Card ─────────────────────────────────────────────────────────────
  matchCard: {
    backgroundColor: PALETTE.surface, marginHorizontal: 20, padding: 20,
    borderRadius: 0, marginBottom: 12,            // ← SHARP
    borderWidth: 1, borderColor: PALETTE.lightGray,
    position: 'relative', overflow: 'hidden',
  },
  matchCardWeb: { width: 'calc(50% - 30px)', marginHorizontal: 10, marginVertical: 8 },
  cardAccentLeft: { position: 'absolute', top: 0, left: 0, width: 3, height: '100%' },

  liveBorder: { borderColor: PALETTE.redNeon + '60' },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginLeft: 8 },
  leagueInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leagueLogo: { width: 16, height: 16, borderRadius: 0 },
  leagueName: { color: PALETTE.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: PALETTE.redNeonDim, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 0,                              // ← SHARP
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PALETTE.redNeon },
  liveBadgeText: { color: PALETTE.redNeon, fontSize: 8, fontWeight: '900', letterSpacing: 1 },

  seriesText: { color: PALETTE.blueInfo, fontSize: 8, fontWeight: '800', marginBottom: 14, letterSpacing: 1, marginLeft: 8 },

  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  teamInfo: { alignItems: 'center', width: '35%' },
  teamLogo: { width: 48, height: 48, resizeMode: 'contain', marginBottom: 10 },
  teamName: { color: PALETTE.textMain, fontSize: 11, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },

  scoreCounter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '30%', gap: 8 },
  scoreActive: { color: PALETTE.textMain, fontSize: 24, fontWeight: '900' },
  vsText: { color: PALETTE.textDark, fontSize: 16, fontWeight: '900' },
  vsContainer: { alignItems: 'center', width: '100%' },
  vsLarge: { color: PALETTE.lightGray, fontSize: 16, fontWeight: '900', textAlign: 'center', letterSpacing: 2 },
  timeText: { color: PALETTE.accent, fontSize: 11, fontWeight: '800', marginBottom: 4, textAlign: 'center', letterSpacing: 1 },

  watchBtn: { backgroundColor: PALETTE.redNeon, paddingVertical: 10, borderRadius: 0 },   // ← SHARP
  watchText: { color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 10, letterSpacing: 1 },
  reminderBtn: { borderWidth: 1, borderColor: PALETTE.lightGray, paddingVertical: 10, borderRadius: 0 },  // ← SHARP
  reminderText: { color: PALETTE.textMuted, textAlign: 'center', fontWeight: '800', fontSize: 10, letterSpacing: 1 },

  loadingText: { color: PALETTE.textDark, fontSize: 10, fontWeight: '800', textAlign: 'center', marginTop: 10, letterSpacing: 2 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  noMatchText: { color: PALETTE.textDark, fontSize: 12, textAlign: 'center', marginTop: 15, fontWeight: '800', letterSpacing: 1 },

  footerSource: { alignItems: 'center', marginTop: 30, opacity: 0.3 },
  sourceText: { color: PALETTE.textMain, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  lastUpdate: { color: PALETTE.textMain, fontSize: 8, marginTop: 5, letterSpacing: 1 },

  // ── Modal ──────────────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(4,6,14,0.88)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    width: isWeb ? 400 : '80%', backgroundColor: PALETTE.surface,
    borderRadius: 0, padding: 28,             // ← SHARP
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

  predictSubtitle: { color: PALETTE.textMuted, fontSize: 11, fontWeight: '800', marginBottom: 10, letterSpacing: 1 },
  predictTeamRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  predictTeamBtn: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: PALETTE.lightGray, alignItems: 'center' },
  predictTeamBtnActive: { backgroundColor: PALETTE.accentDim, borderColor: PALETTE.accent },
  predictTeamText: { color: PALETTE.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  predictTeamTextActive: { color: PALETTE.textMain },
  predictInput: { backgroundColor: PALETTE.black, color: PALETTE.textMain, borderWidth: 1, borderColor: PALETTE.lightGray, padding: 12, marginBottom: 20, fontSize: 14, fontWeight: '800' },
  predictSubmitBtn: { backgroundColor: PALETTE.redNeon, paddingVertical: 14 },
  predictSubmitText: { color: 'white', textAlign: 'center', fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  notificationBox: { marginHorizontal: 20, marginBottom: 16, padding: 12, borderWidth: 1 },
  notificationSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981' },
  notificationError: { backgroundColor: 'rgba(255, 60, 60, 0.1)', borderColor: PALETTE.redNeon },
  notificationText: { fontSize: 12, textAlign: 'center', fontWeight: '900', letterSpacing: 1 },
  notificationTextSuccess: { color: '#10b981' },
  notificationTextError: { color: PALETTE.redNeon },

  predictedBtn: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981', paddingVertical: 12, borderWidth: 1, marginTop: 16 },
  predictedText: { color: '#10b981', fontSize: 11, fontWeight: '900', textAlign: 'center', letterSpacing: 2 },

  claimBtn: { backgroundColor: 'rgba(255, 215, 0, 0.15)', borderColor: '#FFD700', paddingVertical: 12, borderWidth: 1, marginTop: 16 },
  claimText: { color: '#FFD700', fontSize: 11, fontWeight: '900', textAlign: 'center', letterSpacing: 2 },

  claimedBtn: { backgroundColor: 'transparent', borderColor: '#444', paddingVertical: 12, borderWidth: 1, marginTop: 16 },
  claimedText: { color: '#888', fontSize: 11, fontWeight: '900', textAlign: 'center', letterSpacing: 2 },

  lostBtn: { backgroundColor: 'rgba(255, 60, 60, 0.1)', borderColor: PALETTE.redNeon, paddingVertical: 12, borderWidth: 1, marginTop: 16 },
  lostText: { color: PALETTE.redNeon, fontSize: 11, fontWeight: '900', textAlign: 'center', letterSpacing: 2 },
});

export default ScheduleScreen;