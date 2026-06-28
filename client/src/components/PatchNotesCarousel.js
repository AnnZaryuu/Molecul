import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Animated, StyleSheet, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PALETTE } from '../theme/theme';
import { MLBBApiService } from '../services/mlbbApiService';

const isWeb = Platform.OS === 'web';

// ── Static Patch Notes ────────────────────────────────────────────────────────
const PATCH_DATA = {
  version: '1.9.44',
  date: 'Jun 10, 2026',
  heroes: [
    {
      name: 'Esmeralda',
      role: 'Tank / Mage',
      color: '#4FC3F7',
      icon: 'sparkles',
      changes: [
        { skill: 'Frostmoon Shield', type: 'BUFF', detail: 'Shield value +150 at all levels' },
        { skill: 'Stardust Dance', type: 'NERF', detail: 'Cooldown +1s at early levels' },
      ],
    },
    {
      name: 'Yu Zhong',
      role: 'Fighter',
      color: '#EF5350',
      icon: 'flame',
      changes: [
        { skill: 'Dragon Tail', type: 'BUFF', detail: 'Cooldown reduced by 2s' },
        { skill: 'Soul Grip', type: 'BUFF', detail: 'Slow effect +10%' },
      ],
    },
    {
      name: 'Gusion',
      role: 'Assassin',
      color: '#CE93D8',
      icon: 'flash',
      changes: [
        { skill: 'Shadowblade Slaughter', type: 'NERF', detail: 'Base damage -50' },
        { skill: 'Incandescence', type: 'NERF', detail: 'Duration -0.5s' },
      ],
    },
    {
      name: 'Chou',
      role: 'Fighter',
      color: '#FF8A65',
      icon: 'body',
      changes: [
        { skill: 'Shunpo', type: 'BUFF', detail: 'Movement speed +10%' },
      ],
    },
    {
      name: 'Lunox',
      role: 'Mage',
      color: '#7986CB',
      icon: 'moon',
      changes: [
        { skill: 'Chaos Assault', type: 'BUFF', detail: 'Chaos-state damage +10%' },
        { skill: 'Starlight Pulse', type: 'BUFF', detail: 'Healing +8%' },
      ],
    },
    {
      name: 'Mathilda',
      role: 'Support',
      color: '#81C784',
      icon: 'leaf',
      changes: [
        { skill: 'Guiding Wind', type: 'NERF', detail: 'Shield duration -0.5s' },
      ],
    },
  ],
};

// ── Patch Hero Card ───────────────────────────────────────────────────────────
const PatchCard = ({ hero, delay, heroImageMap }) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 240, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 240, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const buffCount = hero.changes.filter(c => c.type === 'BUFF').length;
  const nerfCount = hero.changes.filter(c => c.type === 'NERF').length;

  const dynamicImage = heroImageMap[hero.name.toLowerCase()] || hero.image;

  return (
    <Animated.View style={[s.patchCard, { opacity: fade, transform: [{ translateY: slide }] }]}>
      {/* Background Image or Gradient Placeholder */}
      {dynamicImage ? (
        <Image
          source={{ uri: dynamicImage }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={[PALETTE.surface2, PALETTE.black]}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <LinearGradient
        colors={['rgba(8,11,20,0.0)', 'rgba(8,11,20,0.8)', 'rgba(8,11,20,0.95)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Hero info */}
      <View style={[{ paddingTop: 90 }, s.patchInfo]}>
        <Text style={s.patchHeroName}>{hero.name}</Text>
        <Text style={s.patchHeroRole}>{hero.role}</Text>

        {/* Buff/Nerf count badges */}
        <View style={s.patchBadgeRow}>
          {buffCount > 0 && (
            <View style={s.buffBadge}>
              <Ionicons name="arrow-up" size={8} color={PALETTE.win} />
              <Text style={[s.patchBadgeText, { color: PALETTE.win }]}>{buffCount} BUFF</Text>
            </View>
          )}
          {nerfCount > 0 && (
            <View style={s.nerfBadge}>
              <Ionicons name="arrow-down" size={8} color={PALETTE.loss} />
              <Text style={[s.patchBadgeText, { color: PALETTE.loss }]}>{nerfCount} NERF</Text>
            </View>
          )}
        </View>

        {/* Skill changes */}
        {hero.changes.map((change, i) => (
          <View key={i} style={s.patchChange}>
            <View style={[
              s.patchChangeIcon,
              { backgroundColor: change.type === 'BUFF' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)' }
            ]}>
              <Ionicons
                name={change.type === 'BUFF' ? 'trending-up' : 'trending-down'}
                size={10}
                color={change.type === 'BUFF' ? PALETTE.win : PALETTE.loss}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.patchSkillName}>{change.skill}</Text>
              <Text style={s.patchSkillDetail}>{change.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

// ── Section Header ────────────────────────────────────────────────────────────
const SectionTitle = ({ title, sub }) => (
  <View style={s.sectionTitleRow}>
    <View style={s.sectionAccent} />
    <View>
      <Text style={s.sectionTitle}>{title}</Text>
      {sub && <Text style={s.sectionSub}>{sub}</Text>}
    </View>
  </View>
);

export default function PatchNotesCarousel() {
  const [heroImageMap, setHeroImageMap] = React.useState({});

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const heroes = await MLBBApiService.getHeroes();
        if (heroes && heroes.length > 0) {
          const map = {};
          heroes.forEach(h => {
            if (h.name) {
              map[h.name.toLowerCase()] = h.smallmap || h.head;
            }
          });
          setHeroImageMap(map);
        }
      } catch (err) {
        console.warn('Failed to fetch hero images for patch notes', err);
      }
    };
    fetchImages();
  }, []);

  return (
    <View>
      <SectionTitle
        title="PATCH TERBARU"
        sub={`VERSI ${PATCH_DATA.version} · ${PATCH_DATA.date}`}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.patchRow}
      >
        {PATCH_DATA.heroes.map((hero, i) => (
          <PatchCard key={hero.name} hero={hero} delay={i * 70} heroImageMap={heroImageMap} />
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  sectionAccent:   { width: 3, height: 24, backgroundColor: PALETTE.accent },
  sectionTitle:    { color: PALETTE.textMain, fontSize: isWeb ? 17 : 14, fontWeight: '900', letterSpacing: 2 },
  sectionSub:      { color: PALETTE.textDark, fontSize: 8, fontWeight: '800', letterSpacing: 1.5, marginTop: 2 },

  patchRow:  { paddingHorizontal: 16, gap: 10, paddingBottom: 20 },
  patchCard: {
    position: 'relative',
    width: isWeb ? 260 : 230,
    backgroundColor: PALETTE.surface,
    borderRadius: 2,                    // ← SHARP
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PALETTE.lightGray,
  },

  patchInfo:      { padding: 14, gap: 8 },
  patchHeroName:  { color: PALETTE.textMain, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  patchHeroRole:  { color: PALETTE.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginTop: -4 },
  patchBadgeRow:  { flexDirection: 'row', gap: 6 },
  buffBadge:      {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(52,211,153,0.1)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.25)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 0,   // ← SHARP
  },
  nerfBadge:      {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.25)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 0,   // ← SHARP
  },
  patchBadgeText: { fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  patchChange:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  patchChangeIcon:{ width: 20, height: 20, borderRadius: 0, justifyContent: 'center', alignItems: 'center', marginTop: 1 },  // ← SHARP
  patchSkillName: { color: PALETTE.textMain, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  patchSkillDetail:{ color: PALETTE.textMuted, fontSize: 9, fontWeight: '600', marginTop: 1 },
});
