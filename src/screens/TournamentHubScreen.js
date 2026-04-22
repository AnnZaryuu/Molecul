import React from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PALETTE, SIZES } from '../theme/theme';
import StandingRow from '../components/StandingRow';
import MatchCard from '../components/MatchCard';
import MetaCard from '../components/MetaCard';

const DUMMY_TEAMS = [
  { id: '1', rank: '01', name: 'RRQ HOSHI', m: '8 - 1', g: '17 - 4', p: 24, logo: 'https://placehold.co/40/FF4D4D/white?text=RRQ' },
  { id: '2', rank: '02', name: 'ONIC ESPORTS', m: '7 - 2', g: '15 - 6', p: 21, logo: 'https://placehold.co/40/FFD700/black?text=ONIC' },
  { id: '3', rank: '03', name: 'BIGETRON ALPHA', m: '6 - 3', g: '14 - 8', p: 18, logo: 'https://placehold.co/40/FF4D4D/white?text=BTR' },
  { id: '4', rank: '04', name: 'EVOS GLORY', m: '5 - 4', g: '12 - 10', p: 15, logo: 'https://placehold.co/40/4FACFE/white?text=EVOS' },
  { id: '5', rank: '05', name: 'ALTER EGO', m: '4 - 5', g: '10 - 12', p: 12, logo: 'https://placehold.co/40/000000/white?text=AE' },
];

const TournamentHubScreen = () => {

  const renderListHeader = () => (
    <View>
      {/* 1. TOP HEADER */}
      <View style={styles.mainHeader}>
        <Ionicons name="search-outline" size={24} color={PALETTE.textMain} />
        <Text style={styles.moleculLogo}>MOLECUL</Text>
        <View style={styles.profileBox}>
          <Ionicons name="person" size={18} color="white" />
        </View>
      </View>

      {/* 2. LIVE TOURNAMENT BANNER */}
      <LinearGradient colors={['#1a1a1a', '#000000']} style={styles.bannerCard}>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>SEASON 12 | LIVE TOURNAMENT</Text>
        </View>
        <Text style={styles.bannerTitle}>MPL ID PRO LEAGUE</Text>
        <Text style={styles.bannerDesc}>The pinnacle of Indonesian Mobile Legends. 9 Teams. One Throne.</Text>
        <View style={styles.bannerInfoRow}>
          <View><Text style={styles.infoLabel}>PRIZE POOL</Text><Text style={styles.infoValue}>$300,000</Text></View>
          <View>
            <Text style={styles.infoLabel}>STATUS</Text>
            <Text style={[styles.infoValue, { color: PALETTE.blueInfo }]}>GROUP STAGE</Text>
          </View>
        </View>
      </LinearGradient>

      {/* 3. SECTION: STANDINGS */}
      <View style={styles.sectionHeader}>
        <View style={styles.redBar} />
        <View>
          <Text style={styles.sectionTitle}>GROUP STAGE STANDINGS</Text>
          <Text style={styles.sectionSubTitle}>W-L (MATCHES) / W-L (GAMES) / POINTS</Text>
        </View>
      </View>
      
      <View style={styles.tableCardContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.headerLabel, { width: 40, textAlign: 'center' }]}>RANK</Text>
          <Text style={[styles.headerLabel, { flex: 3, paddingLeft: 10 }]}>TEAM</Text>
          <Text style={[styles.headerLabel, { flex: 1, textAlign: 'center' }]}>M</Text>
          <Text style={[styles.headerLabel, { flex: 1, textAlign: 'center' }]}>G</Text>
          <Text style={[styles.headerLabel, { flex: 1, textAlign: 'center' }]}>P</Text>
        </View>
      </View>
    </View>
  );

  const renderListFooter = () => (
    <View style={{ marginTop: 25, paddingBottom: 100 }}>
      {/* SECTION: NEXT MATCH */}
      <View style={[styles.sectionHeader, { marginBottom: 15 }]}>
        <View style={styles.redBar} />
        <Text style={styles.sectionTitle}>NEXT MATCH</Text>
      </View>
      <View style={styles.matchesRow}>
        <MatchCard time="16:00" teamA="RRQ" teamB="EVOS" isLive={true} />
        <MatchCard time="19:00" teamA="ONIC" teamB="BTR" isLive={false} />
      </View>

      {/* SECTION: META ANALYSIS */}
      <View style={[styles.sectionHeader, { marginTop: 30, marginBottom: 15 }]}>
        <View style={styles.redBar} />
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>META ANALYSIS</Text>
          <TouchableOpacity>
             <Text style={{ color: PALETTE.redNeon, fontSize: 12, fontWeight: 'bold' }}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: SIZES.padding }}>
        <MetaCard heroName="LING" winRate="65.2" pickRate="12.4" banRate="88.1" imageUrl="https://placehold.co/100/black/white?text=LING" />
        <MetaCard heroName="VALENTINA" winRate="58.9" pickRate="24.1" banRate="45.3" imageUrl="https://placehold.co/100/black/white?text=VAL" />
      </View>

      {/* MVP TRACKER SECTION */}
      <View style={[styles.sectionHeader, { marginTop: 30, marginBottom: 15 }]}>
        <View style={styles.redBar} />
        <Text style={styles.sectionTitle}>MVP TRACKER</Text>
      </View>
      
      <View style={styles.mvpContainer}>
         <LinearGradient colors={['#FF3B3B', '#800000']} style={styles.mvpCard}>
            <Text style={styles.mvpTitle}>PLAYER OF THE WEEK</Text>
            <Text style={styles.playerName}>RRQ ALBERTTT</Text>
            <View style={styles.mvpStatsRow}>
               <Text style={styles.mvpStatText}>KDA: 12.5</Text>
               <Text style={styles.mvpStatText}>KP: 85%</Text>
            </View>
         </LinearGradient>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={DUMMY_TEAMS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tableRowWrapper}>
            <StandingRow 
              rank={item.rank}
              teamName={item.name}
              logoUrl={item.logo}
              matches={item.m}
              games={item.g}
              points={item.p}
            />
          </View>
        )}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.black },
  listContent: { paddingTop: 10 },
  
  mainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.padding, marginBottom: 25 },
  moleculLogo: { color: PALETTE.redNeon, fontSize: 22, fontWeight: 'bold', letterSpacing: 4 },
  profileBox: { width: 35, height: 35, backgroundColor: '#333', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  
  bannerCard: { padding: 20, borderRadius: SIZES.radiusL, borderWidth: 1, borderColor: '#333', marginHorizontal: SIZES.padding, marginBottom: 30 },
  liveBadge: { backgroundColor: PALETTE.redNeon, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: 10 },
  liveText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  bannerTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  bannerDesc: { color: PALETTE.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 20 },
  bannerInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: '#666', fontSize: 10, fontWeight: 'bold' },
  infoValue: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.padding, marginBottom: 10 },
  redBar: { width: 3, height: 25, backgroundColor: PALETTE.redNeon, marginRight: 10, borderRadius: 2 },
  sectionTitle: { color: PALETTE.textMain, fontSize: 18, fontWeight: 'bold' },
  sectionSubTitle: { color: PALETTE.textMuted, fontSize: 11, marginTop: 2 },
  
  tableCardContainer: { 
    backgroundColor: PALETTE.darkGray, 
    marginHorizontal: SIZES.padding, 
    borderTopLeftRadius: SIZES.radiusM, 
    borderTopRightRadius: SIZES.radiusM, 
    padding: 10, 
    paddingBottom: 0 
  },
  tableRowWrapper: { 
    backgroundColor: PALETTE.darkGray, 
    marginHorizontal: SIZES.padding,
    paddingHorizontal: 10 
  }, 
  tableHeaderRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  headerLabel: { color: '#666', fontSize: 11, fontWeight: '500' },
  
  matchesRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SIZES.padding },

  mvpContainer: { paddingHorizontal: SIZES.padding },
  mvpCard: { padding: 20, borderRadius: SIZES.radiusM, height: 120, justifyContent: 'center' },
  mvpTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  playerName: { color: 'white', fontSize: 24, fontWeight: '900', marginVertical: 5 },
  mvpStatsRow: { flexDirection: 'row', gap: 15 },
  mvpStatText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
});

export default TournamentHubScreen;