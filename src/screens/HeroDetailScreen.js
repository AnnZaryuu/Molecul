import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, Animated, Image,
  TouchableOpacity, ActivityIndicator, Dimensions, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PALETTE } from '../theme/theme';
import { MLBBApiService } from '../services/mlbbApiService';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 320;
const PARALLAX_FACTOR = 0.45;

const isWeb = Platform.OS === 'web';

const HeroDetailScreen = ({ route, navigation }) => {
  const { heroId, heroName, heroHead } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const scrollY = useRef(new Animated.Value(0)).current;

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-BANNER_HEIGHT, 0, BANNER_HEIGHT],
    outputRange: [BANNER_HEIGHT * PARALLAX_FACTOR, 0, -BANNER_HEIGHT * PARALLAX_FACTOR],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, BANNER_HEIGHT * 0.6],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    fetchData();
  }, [heroId]);

  const fetchData = async () => {
    setLoading(true);
    const detailsData = await MLBBApiService.getHeroDetails(heroId);
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

  const imageUri = details.painting || details.head || details.fallbackHead;

  const renderContentBody = () => (
    <View style={styles.contentBody}>
      {/* STATS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BASE ATTRIBUTES</Text>
        <View style={styles.statsCard}>
          {Object.entries(details.attribute || {}).map(([key, value], index) => {
            const colors = ['#FFD700', '#FF4500', '#00BFFF', '#9400D3'];
            const pct = Math.min(Math.max(parseInt(value, 10) || 0, 0), 100);
            return (
              <View key={key} style={styles.statRow}>
                <Text style={styles.statLabel}>{key === 'MAGIC POWER' ? 'ABILITY EFFECTS' : key}</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.barBg, { width: '100%' }]} />
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors[index % colors.length] }]} />
                </View>
                <Text style={styles.statValue}>{pct}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* SKILLS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>COMBAT ABILITIES</Text>

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

        {details.skills && details.skills.length > 0 ? (
          details.skills.map((skill, idx) => (
            <View key={idx} style={styles.skillCard}>
              <Image source={{ uri: skill.skillicon }} style={styles.skillIcon} />
              <View style={styles.skillInfo}>
                <View style={styles.activeHeader}>
                  <Text style={styles.skillName}>{skill.skillname?.toUpperCase()}</Text>
                  <Text style={styles.skillCost}>{skill['skillcd&cost']}</Text>
                </View>
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

      {/* STORY */}
      {details.story ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BACKGROUND ARCHIVE</Text>
          <View style={styles.storyCard}>
            <Text style={styles.storyText}>{details.story}</Text>
          </View>
        </View>
      ) : null}

      {/* COUNTER */}
      {details.relation?.strong?.desc ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMBAT ADVANTAGE</Text>
          <Text style={styles.relationDesc}>{details.relation.strong.desc}</Text>
        </View>
      ) : null}

      <View style={{ height: 120 }} />
    </View>
  );

  if (isWeb) {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webLeftPane}>
          <Image source={{ uri: imageUri }} style={styles.webHeroImg} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', '#000']} style={styles.bannerGradient} />
          <TouchableOpacity style={styles.floatingBack} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.bannerInfo}>
            <Text style={styles.heroType}>{details.type?.toUpperCase()}</Text>
            <Text style={styles.heroNameLarge}>{details.name?.toUpperCase()}</Text>
          </View>
        </View>
        <ScrollView style={styles.webRightPane} showsVerticalScrollIndicator={false}>
          {renderContentBody()}
        </ScrollView>
      </View>
    );
  }

  // Mobile Parallax Layout
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bannerContainer, { opacity: headerOpacity }]}>
        <Animated.Image source={{ uri: imageUri }} style={[styles.bannerImg, { transform: [{ translateY: imageTranslateY }] }]} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', '#000']} style={styles.bannerGradient} />
        <View style={styles.bannerInfo}>
          <Text style={styles.heroType}>{details.type?.toUpperCase()}</Text>
          <Text style={styles.heroNameLarge}>{details.name?.toUpperCase()}</Text>
        </View>
      </Animated.View>

      <SafeAreaView style={styles.safeNav} pointerEvents="box-none">
        <TouchableOpacity style={styles.floatingBack} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        contentContainerStyle={{ paddingTop: BANNER_HEIGHT }}
      >
        {renderContentBody()}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loaderContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#444', fontSize: 10, fontWeight: 'bold', marginTop: 15, letterSpacing: 2 },

  // Web Layout
  webContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#000' },
  webLeftPane: { flex: 1, position: 'relative', overflow: 'hidden' },
  webRightPane: { flex: 1, backgroundColor: '#000' },
  webHeroImg: { width: '100%', height: '100%', position: 'absolute' },

  // Banner absolute di belakang scroll (Mobile)
  bannerContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: BANNER_HEIGHT, overflow: 'hidden', zIndex: 0 },
  bannerImg: { width: '100%', height: BANNER_HEIGHT + 80, position: 'absolute', top: 0 },
  bannerGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: BANNER_HEIGHT * 0.7 },
  bannerInfo: { position: 'absolute', bottom: 16, left: 25, right: 25 },
  heroType: { color: PALETTE.redNeon, fontSize: 12, fontWeight: '900', letterSpacing: 3 },
  heroNameLarge: { color: 'white', fontSize: 40, fontWeight: '900', marginTop: 2 },

  // Nav overlay
  safeNav: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  floatingBack: { marginTop: 10, marginLeft: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333', zIndex: 100, position: 'absolute', top: isWeb ? 20 : undefined },

  // Content body
  contentBody: { backgroundColor: '#000', borderTopLeftRadius: isWeb ? 0 : 24, borderTopRightRadius: isWeb ? 0 : 24, paddingTop: isWeb ? 20 : 8 },

  section: { paddingHorizontal: 25, marginTop: 22 },
  sectionTitle: { color: '#333', fontSize: 10, fontWeight: 'bold', letterSpacing: 3, marginBottom: 18 },

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
  skillIcon: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#111' },
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
  backBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
});

export default HeroDetailScreen;
