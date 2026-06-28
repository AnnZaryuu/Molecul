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
        <ActivityIndicator size="large" color={PALETTE.accent} />
        <Text style={styles.loadingText}>SYNCHRONIZING COMBAT UNIT...</Text>
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.loaderContainer}>
        <Ionicons name="alert-circle-outline" size={40} color={PALETTE.textDark} />
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
        <View style={styles.sectionTitleWrap}>
          <View style={styles.sectionAccentBar} />
          <Text style={styles.sectionTitle}>BASE ATTRIBUTES</Text>
        </View>
        <View style={styles.statsCard}>
          {Object.entries(details.attribute || {}).map(([key, value], index) => {
            const colors = [PALETTE.goldRank, '#FF4500', PALETTE.accent, '#9400D3'];
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
        <View style={styles.sectionTitleWrap}>
          <View style={styles.sectionAccentBar} />
          <Text style={styles.sectionTitle}>COMBAT ABILITIES</Text>
        </View>

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
          <Text style={{ color: PALETTE.textDark, fontSize: 10 }}>DATA NOT AVAILABLE IN THIS ARCHIVE</Text>
        )}
      </View>

      {/* STORY */}
      {details.story ? (
        <View style={styles.section}>
          <View style={styles.sectionTitleWrap}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionTitle}>BACKGROUND ARCHIVE</Text>
          </View>
          <View style={styles.storyCard}>
            <Text style={styles.storyText}>{details.story}</Text>
          </View>
        </View>
      ) : null}

      {/* COUNTER */}
      {details.relation?.strong?.desc ? (
        <View style={styles.section}>
          <View style={styles.sectionTitleWrap}>
            <View style={[styles.sectionAccentBar, { backgroundColor: PALETTE.win }]} />
            <Text style={styles.sectionTitle}>COMBAT ADVANTAGE</Text>
          </View>
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
          <LinearGradient colors={['transparent', 'rgba(8,11,20,0.6)', PALETTE.black]} style={styles.bannerGradient} />
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
        <LinearGradient colors={['transparent', 'rgba(8,11,20,0.6)', PALETTE.black]} style={styles.bannerGradient} />
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
  container: { flex: 1, backgroundColor: PALETTE.black },
  loaderContainer: { flex: 1, backgroundColor: PALETTE.black, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: PALETTE.textDark, fontSize: 10, fontWeight: '800', marginTop: 15, letterSpacing: 2 },

  // Web Layout
  webContainer: { flex: 1, flexDirection: 'row', backgroundColor: PALETTE.black },
  webLeftPane: { flex: 1, position: 'relative', overflow: 'hidden' },
  webRightPane: { flex: 1, backgroundColor: PALETTE.black },
  webHeroImg: { width: '100%', height: '100%', position: 'absolute' },

  // Banner (Mobile)
  bannerContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: BANNER_HEIGHT, overflow: 'hidden', zIndex: 0 },
  bannerImg: { width: '100%', height: BANNER_HEIGHT + 80, position: 'absolute', top: 0 },
  bannerGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: BANNER_HEIGHT * 0.7 },
  bannerInfo: { position: 'absolute', bottom: 16, left: 25, right: 25 },
  heroType: { color: PALETTE.accent, fontSize: 12, fontWeight: '900', letterSpacing: 4 },
  heroNameLarge: { color: PALETTE.textMain, fontSize: 38, fontWeight: '900', marginTop: 2, letterSpacing: 1 },

  // Nav overlay
  safeNav: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  floatingBack: {
    marginTop: 10, marginLeft: 20,
    width: 42, height: 42, borderRadius: 0,     // ← SHARP
    backgroundColor: 'rgba(8,11,20,0.7)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: PALETTE.lightGray,
    zIndex: 100, position: 'absolute', top: isWeb ? 20 : undefined,
  },

  // Content body
  contentBody: { backgroundColor: PALETTE.black, borderTopLeftRadius: 0, borderTopRightRadius: 0, paddingTop: isWeb ? 20 : 8 },

  // ── Section Headers ────────────────────────────────────────────────────────
  section: { paddingHorizontal: 25, marginTop: 24 },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionAccentBar: { width: 3, height: 16, backgroundColor: PALETTE.accent },
  sectionTitle: { color: PALETTE.textDark, fontSize: 10, fontWeight: '900', letterSpacing: 3 },

  // ── Stats Card ─────────────────────────────────────────────────────────────
  statsCard: {
    backgroundColor: PALETTE.surface, padding: 20,
    borderRadius: 2, borderWidth: 1, borderColor: PALETTE.lightGray,  // ← SHARP
  },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  statLabel: { color: PALETTE.textMuted, fontSize: 8, fontWeight: '800', width: 80, letterSpacing: 0.5 },
  barContainer: { flex: 1, height: 4, marginHorizontal: 15, position: 'relative', justifyContent: 'center' },
  barBg: { height: '100%', backgroundColor: PALETTE.lightGray, borderRadius: 0 },    // ← SHARP
  barFill: { height: '100%', position: 'absolute', left: 0, borderRadius: 0 },       // ← SHARP
  statValue: { color: PALETTE.textMain, fontSize: 10, fontWeight: '900', width: 30, textAlign: 'right' },

  // ── Skill Cards ────────────────────────────────────────────────────────────
  skillCard: {
    flexDirection: 'row', backgroundColor: PALETTE.surface,
    padding: 16, borderRadius: 2, marginBottom: 10,       // ← SHARP
    borderWidth: 1, borderColor: PALETTE.lightGray,
    position: 'relative', overflow: 'hidden',
  },
  passiveBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: PALETTE.accentDim, paddingHorizontal: 10, paddingVertical: 4,
    borderBottomLeftRadius: 0,                             // ← SHARP
  },
  passiveBadgeText: { color: PALETTE.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  skillIcon: { width: 48, height: 48, borderRadius: 2, backgroundColor: PALETTE.surface2 },  // ← SHARP
  skillInfo: { flex: 1, marginLeft: 14 },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skillName: { color: PALETTE.textMain, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  skillCost: { color: PALETTE.textDark, fontSize: 8, fontWeight: '800' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  tagBadge: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 0, marginRight: 5, marginBottom: 5 },  // ← SHARP
  tagText: { fontSize: 7, fontWeight: '800', letterSpacing: 0.5 },
  skillDesc: { color: PALETTE.textMuted, fontSize: 11, marginTop: 4, lineHeight: 18 },

  // ── Story Card ─────────────────────────────────────────────────────────────
  storyCard: {
    backgroundColor: PALETTE.surface, padding: 20,
    borderRadius: 2, borderWidth: 1, borderColor: PALETTE.lightGray,  // ← SHARP
  },
  storyText: { color: PALETTE.textMuted, fontSize: 12, lineHeight: 20 },
  relationDesc: { color: PALETTE.textMuted, fontSize: 11, fontStyle: 'italic', lineHeight: 18 },

  backBtn: {
    marginTop: 30, paddingHorizontal: 25, paddingVertical: 12,
    backgroundColor: PALETTE.accent, borderRadius: 0,      // ← SHARP
  },
  backBtnText: { color: PALETTE.black, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
});

export default HeroDetailScreen;
