// src/screens/TransfersScreen.js
import React from 'react';
import { 
  StyleSheet, Text, View, ScrollView, Image, 
  TouchableOpacity, SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PALETTE, SIZES } from '../theme/theme';

const NEWS_LIST = [
  { id: '1', tag: 'TEAM CONFLICT', title: 'INTERNAL STRIFE AT TEAM GARUDA', desc: 'Leadership issues arise as team struggles during the mid-season exit.', color: '#FF3B3B' },
  { id: '2', tag: 'SYSTEM UPDATE', title: 'PATCH 7.34: META SHIFT ANALYSIS', desc: 'Deep dive into how the new jungle timings favor aggressive early-game.', color: '#4FACFE' },
  { id: '3', tag: 'ROSTER ALERT', title: 'FREE AGENT POOL GROWS', desc: 'Three former champions are currently without active rosters.', color: '#E58E26' },
];

const TRANSFERS = [
  { id: '1', player: 'VIPER-X', to: 'EQUINOX ESPORTS', cost: '$450,000', initial: 'V' },
  { id: '2', player: 'ZERO-G', to: 'PARADOX ACADEMY', cost: 'Loan', initial: 'Z' },
  { id: '3', player: 'MAESTRO', to: 'STALWART GAMING', cost: 'N/A', initial: 'M' },
];

const TransfersScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="search-outline" size={22} color="white" />
          <Text style={styles.logoText}>MOLECUL</Text>
          <Ionicons name="notifications-outline" size={22} color="white" />
        </View>

        {/* HERO TITLE */}
        <View style={styles.heroContainer}>
          <View style={styles.liveBadge}><Text style={styles.liveText}>LIVE OPERATIONS</Text></View>
          <Text style={styles.heroTitle}>ROSTER</Text>
          <Text style={[styles.heroTitle, { color: '#4FACFE', marginTop: -10 }]}>REVOLUTION</Text>
          <Text style={styles.heroSub}>The post-major shuffle has begun. Track every tactical pivot and record-breaking buyout.</Text>
        </View>

        {/* MAIN FEATURED NEWS (KRIET Buyout) */}
        <View style={styles.featuredCard}>
          <Image 
            source={{ uri: 'https://placehold.co/400x200/111/white?text=STADIUM' }} 
            style={styles.featuredImg} 
          />
          <View style={styles.featuredOverlay}>
            <View style={styles.tagRow}>
              <Text style={styles.breakingTag}>BREAKING</Text>
              <Text style={styles.transferTag}>TRANSFERS</Text>
            </View>
            <Text style={styles.featuredTitle}>"KRIET" JOINS NEXUS GAMING IN $2M BUYOUT</Text>
            <Text style={styles.featuredFooter}>OFFICIAL CONFIRMATION: CONTRACT SIGNED UNTIL 2026</Text>
          </View>
        </View>

        {/* SECONDARY NEWS (Keyboard/Tournament) */}
        <View style={styles.secondaryCard}>
           <Image 
             source={{ uri: 'https://placehold.co/400x150/222/white?text=TOURNAMENT' }} 
             style={styles.secondaryImg} 
           />
           <View style={styles.secondaryContent}>
              <Text style={styles.secondaryTag}>TOURNEY</Text>
              <Text style={styles.secondaryTitle}>SOLO MASTERS 2024: JAKARTA QUALIFIERS ANNOUNCED</Text>
              <TouchableOpacity style={styles.btnDetail}>
                <Text style={styles.btnDetailText}>REGISTRATION DETAILS</Text>
              </TouchableOpacity>
           </View>
        </View>

        {/* LIST NEWS WITH SIDE INDICATOR */}
        <View style={styles.newsListContainer}>
          {NEWS_LIST.map((item) => (
            <View key={item.id} style={styles.newsItem}>
              <View style={[styles.sideBar, { backgroundColor: item.color }]} />
              <View style={styles.newsTextContent}>
                <Text style={[styles.itemTag, { color: item.color }]}>{item.tag}</Text>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* RECENT TRANSFERS SECTION */}
        <View style={styles.transferSection}>
           <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>RECENT TRANSFERS</Text>
              <Text style={styles.viewAll}>VIEW ALL ARCHIVE</Text>
           </View>
           
           {TRANSFERS.map((tr) => (
             <View key={tr.id} style={styles.trRow}>
                <View style={styles.trAvatar}>
                    <Text style={styles.trInitial}>{tr.initial}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.trPlayer}>{tr.player}</Text>
                    <Text style={styles.trTo}>TO {tr.to}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.trCost}>{tr.cost}</Text>
                    <Text style={styles.trStatus}>REPORTED</Text>
                </View>
             </View>
           ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  logoText: { color: PALETTE.redNeon, fontWeight: 'bold', letterSpacing: 4, fontSize: 18 },
  
  heroContainer: { paddingHorizontal: 25, marginVertical: 20 },
  liveBadge: { backgroundColor: PALETTE.redNeon, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 2, marginBottom: 10 },
  liveText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  heroTitle: { color: 'white', fontSize: 38, fontWeight: 'bold', letterSpacing: 1 },
  heroSub: { color: '#666', fontSize: 13, lineHeight: 20, marginTop: 15 },

  featuredCard: { marginHorizontal: 20, height: 250, borderRadius: 8, overflow: 'hidden', backgroundColor: '#111' },
  featuredImg: { width: '100%', height: '100%', opacity: 0.5 },
  featuredOverlay: { position: 'absolute', bottom: 0, padding: 20, width: '100%' },
  tagRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  breakingTag: { color: '#4FACFE', fontWeight: 'bold', fontSize: 10, borderBottomWidth: 1, borderBottomColor: '#4FACFE' },
  transferTag: { color: 'white', fontSize: 10, opacity: 0.6 },
  featuredTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  featuredFooter: { color: '#444', fontSize: 9, marginTop: 10, fontWeight: 'bold' },

  secondaryCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: '#111', borderRadius: 8, overflow: 'hidden' },
  secondaryImg: { width: '100%', height: 120 },
  secondaryContent: { padding: 15 },
  secondaryTag: { color: '#E58E26', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  secondaryTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  btnDetail: { borderWidth: 1, borderColor: '#333', paddingVertical: 10, alignItems: 'center', borderRadius: 4 },
  btnDetailText: { color: '#888', fontSize: 10, fontWeight: 'bold' },

  newsListContainer: { paddingHorizontal: 20, marginTop: 30 },
  newsItem: { flexDirection: 'row', backgroundColor: '#151515', marginBottom: 15, borderRadius: 4, overflow: 'hidden' },
  sideBar: { width: 4 },
  newsTextContent: { padding: 15, flex: 1 },
  itemTag: { fontSize: 9, fontWeight: 'bold', marginBottom: 5 },
  itemTitle: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  itemDesc: { color: '#666', fontSize: 11, marginTop: 5, lineHeight: 16 },

  transferSection: { marginTop: 40, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 15, marginBottom: 15 },
  sectionTitle: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  viewAll: { color: '#444', fontSize: 10, fontWeight: 'bold' },
  trRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  trAvatar: { width: 40, height: 40, backgroundColor: '#222', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  trInitial: { color: '#4FACFE', fontWeight: 'bold' },
  trPlayer: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  trTo: { color: '#444', fontSize: 10, fontWeight: 'bold' },
  trCost: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  trStatus: { color: '#444', fontSize: 9 },
});

export default TransfersScreen;