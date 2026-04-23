import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, Image, 
  TouchableOpacity, SafeAreaView, ActivityIndicator, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PALETTE, SIZES } from '../theme/theme';
import { MLBBApiService } from '../services/mlbbApiService';

const { width } = Dimensions.get('window');

const HeroDetailScreen = ({ route, navigation }) => {
  const { heroId, heroName, heroHead } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [heroId]);

  const fetchData = async () => {
    setLoading(true);
    const detailsData = await MLBBApiService.getHeroDetails(heroId);
    // Use the passed head as the ultimate fallback if API head is missing
    if (detailsData) {
      detailsData.fallbackHead = heroHead;
    }
    setDetails(detailsData);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={PALETTE.redNeon} />
        <Text style={styles.loadingText}>SYNCHRONIZING COMBAT UNIT...</Text>
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.loaderContainer}>
        <Ionicons name="alert-circle-outline" size={40} color="#333" />
        <Text style={styles.loadingText}>DATA SECTOR CORRUPTED</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>REBOOT SYSTEM</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO BANNER */}
        <View style={styles.bannerContainer}>
          <Image 
            source={{ uri: details.painting || details.head || details.fallbackHead }} 
            style={styles.bannerImg} 
          />
          <LinearGradient 
            colors={['transparent', 'rgba(0,0,0,0.8)', '#000']} 
            style={styles.bannerGradient} 
          />
          
          <TouchableOpacity style={styles.floatingBack} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.bannerInfo}>
            <Text style={styles.heroType}>{details.type?.toUpperCase()}</Text>
            <Text style={styles.heroNameLarge}>{details.name?.toUpperCase()}</Text>
          </View>
        </View>

        {/* STATS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BASE ATTRIBUTES</Text>
          <View style={styles.statsCard}>
            {Object.entries(details.attribute || {}).map(([key, value], index) => {
              const colors = ['#FFD700', '#FF4500', '#00BFFF', '#9400D3']; // Gold, Red, Blue, Purple
              return (
                <View key={key} style={styles.statRow}>
                  <Text style={styles.statLabel}>{key === 'MAGIC POWER' ? 'ABILITY EFFECTS' : key}</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.barBg, { width: '100%' }]} />
                    <View style={[styles.barFill, { width: `${value}%`, backgroundColor: colors[index % colors.length] }]} />
                  </View>
                  <Text style={styles.statValue}>{value}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* SKILLS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMBAT ABILITIES</Text>
          
          {/* PASSIVE SKILL */}
          {details.passive ? (
            <View style={styles.skillCard}>
              <View style={styles.passiveBadge}><Text style={styles.passiveBadgeText}>PASSIVE</Text></View>
              <Image source={{ uri: details.passive.skillicon }} style={styles.skillIcon} />
              <View style={styles.skillInfo}>
                <Text style={styles.skillName}>{details.passive.skillname?.toUpperCase()}</Text>
                <Text style={styles.skillDesc}>{details.passive.skilldesc?.replace(/<[^>]*>?/gm, '')}</Text>
              </View>
            </View>
          ) : null}

          {/* ACTIVE SKILLS */}
          {details.skills && details.skills.length > 0 ? (
            details.skills.map((skill, idx) => (
              <View key={idx} style={styles.skillCard}>
                <Image source={{ uri: skill.skillicon }} style={styles.skillIcon} />
                <View style={styles.skillInfo}>
                  <View style={styles.activeHeader}>
                    <Text style={styles.skillName}>{skill.skillname?.toUpperCase()}</Text>
                    <Text style={styles.skillCost}>{skill['skillcd&cost']}</Text>
                  </View>
                  
                  {/* SKILL TAGS */}
                  <View style={styles.tagRow}>
                    {skill.skilltag?.map((tag, tIdx) => (
                      <View key={tIdx} style={[styles.tagBadge, { borderColor: `rgb(${tag.tagrgb})` }]}>
                        <Text style={[styles.tagText, { color: `rgb(${tag.tagrgb})` }]}>{tag.tagname?.toUpperCase()}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.skillDesc}>{skill.skilldesc?.replace(/<[^>]*>?/gm, '')}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: '#333', fontSize: 10 }}>DATA NOT AVAILABLE IN THIS ARCHIVE</Text>
          )}
        </View>

        {/* STORY SECTION */}
        {details.story && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BACKGROUND ARCHIVE</Text>
            <View style={styles.storyCard}>
              <Text style={styles.storyText}>{details.story}</Text>
            </View>
          </View>
        )}

        {/* COUNTER DATA */}
        {details.relation?.strong && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMBAT ADVANTAGE</Text>
            <Text style={styles.relationDesc}>{details.relation.strong.desc}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loaderContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#444', fontSize: 10, fontWeight: 'bold', marginTop: 15, letterSpacing: 2 },
  
  bannerContainer: { width: width, height: 280, position: 'relative', backgroundColor: '#000', overflow: 'hidden' },
  bannerImg: { width: '100%', height: 500, position: 'absolute', top: 0, resizeMode: 'cover' },
  bannerGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 300 },
  floatingBack: { position: 'absolute', top: 50, left: 20, width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  
  bannerInfo: { position: 'absolute', bottom: 10, left: 25, right: 25 },
  heroType: { color: PALETTE.redNeon, fontSize: 12, fontWeight: '900', letterSpacing: 3 },
  heroNameLarge: { color: 'white', fontSize: 40, fontWeight: '900', marginTop: 2 },

  section: { paddingHorizontal: 25, marginTop: 20 },
  sectionTitle: { color: '#333', fontSize: 10, fontWeight: 'bold', letterSpacing: 3, marginBottom: 20 },
  
  statsCard: { backgroundColor: '#0a0a0a', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#111' },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  statLabel: { color: '#666', fontSize: 8, fontWeight: 'bold', width: 80 },
  barContainer: { flex: 1, height: 3, marginHorizontal: 15, position: 'relative', justifyContent: 'center' },
  barBg: { height: '100%', backgroundColor: '#1a1a1a', borderRadius: 1.5 },
  barFill: { height: '100%', position: 'absolute', left: 0, borderRadius: 1.5 },
  statValue: { color: 'white', fontSize: 10, fontWeight: '900', width: 30, textAlign: 'right' },

  skillCard: { flexDirection: 'row', backgroundColor: '#0a0a0a', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#111', position: 'relative', overflow: 'hidden' },
  passiveBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#1a1010', paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: 10 },
  passiveBadgeText: { color: PALETTE.redNeon, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  skillIcon: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#000' },
  skillInfo: { flex: 1, marginLeft: 15 },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skillName: { color: 'white', fontSize: 13, fontWeight: 'bold' },
  skillCost: { color: '#444', fontSize: 8, fontWeight: 'bold' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  tagBadge: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 5, marginBottom: 5 },
  tagText: { fontSize: 7, fontWeight: 'bold' },
  skillDesc: { color: '#888', fontSize: 11, marginTop: 4, lineHeight: 18 },

  storyCard: { backgroundColor: '#0a0a0a', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#111' },
  storyText: { color: '#777', fontSize: 12, lineHeight: 20 },

  relationDesc: { color: '#666', fontSize: 11, fontStyle: 'italic', lineHeight: 18 },

  backBtn: { marginTop: 30, paddingHorizontal: 25, paddingVertical: 12, backgroundColor: PALETTE.redNeon, borderRadius: 8 },
  backBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' }
});

export default HeroDetailScreen;
