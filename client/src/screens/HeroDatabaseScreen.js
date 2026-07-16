import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, Text, View, FlatList, Image, 
  TouchableOpacity, TextInput, ActivityIndicator, Platform,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { PALETTE, TYPOGRAPHY, SIZES, SPACING } from '../theme/theme';
import { MLBBApiService } from '../services/mlbbApiService';
import PatchNotesCarousel from '../components/PatchNotesCarousel';
import BaseLayout from '../components/BaseLayout';
import { LinearGradient } from 'expo-linear-gradient';
import CandiDivider from '../components/CandiDivider';

const ROLES = ['SEMUA', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];
const isWeb = Platform.OS === 'web';

const HeroDatabaseScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const availableWidth = isWeb ? Math.max(300, width - 240) : width - SPACING.marginMobile * 2;
  const numColumns = isWeb ? Math.max(3, Math.floor(availableWidth / 160)) : 2;
  const gap = SPACING.sm;
  const cardWidth = (availableWidth - (numColumns - 1) * gap) / numColumns;
    
  const [heroes, setHeroes] = useState([]);
  const [filteredHeroes, setFilteredHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('SEMUA');

  useEffect(() => {
    fetchHeroes();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setFilteredHeroes(prev => {
        if (prev.length === 0) return prev;
        return applyFiltersImmediate(heroes, search, selectedRole);
      });
    }, [heroes, search, selectedRole])
  );

  const fetchHeroes = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await MLBBApiService.getHeroes();
      if (Array.isArray(data)) {
        setHeroes(data);
        setFilteredHeroes(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to fetch heroes:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersImmediate = (heroList, searchText, role) => {
    let filtered = [...heroList];
    if (searchText) {
      filtered = filtered.filter(h =>
        h.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (role !== 'SEMUA') {
      filtered = filtered.filter(h =>
        h.type?.toLowerCase() === role.toLowerCase()
      );
    }
    return filtered;
  };

  const applyFilters = (searchText, role) => {
    setFilteredHeroes(applyFiltersImmediate(heroes, searchText, role));
  };

  const handleSearch = (text) => {
    setSearch(text);
    applyFilters(text, selectedRole);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    applyFilters(search, role);
  };

  const renderRoleItem = ({ item }) => {
    const isActive = selectedRole === item;
    return (
      <TouchableOpacity 
        style={[styles.roleBtn, isActive && styles.roleBtnActive]}
        onPress={() => handleRoleSelect(item)}
      >
        <Text style={[styles.roleBtnText, isActive && styles.roleBtnTextActive]}>
          {item.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'tank': return 'shield-half';
      case 'fighter': return 'hammer';
      case 'assassin': return 'flash';
      case 'mage': return 'color-wand';
      case 'marksman': return 'locate'; // replaced crosshairs with locate as it is valid for ionicons
      case 'support': return 'medkit';
      default: return 'person';
    }
  };

  return (
    <BaseLayout style={styles.container}>
      <View style={styles.contentContainer}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar} />
            <Text style={styles.headerTitle}>PUSAKA HEROES</Text>
          </View>
          <TouchableOpacity onPress={fetchHeroes} style={styles.refreshBtn}>
            <Ionicons name="settings" size={24} color={PALETTE.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* ── Search Bar ── */}
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color={PALETTE.onSurfaceVariant} style={styles.searchIcon} />
            <TextInput
              placeholder="Cari Pusaka Rimba..."
              placeholderTextColor={PALETTE.onSurfaceVariant}
              style={styles.searchInput}
              value={search}
              onChangeText={handleSearch}
            />
          </View>

          {/* ── Role Filter ── */}
          <View style={styles.roleFilterContainer}>
            <FlatList
              data={ROLES}
              renderItem={renderRoleItem}
              keyExtractor={item => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SPACING.marginMobile, gap: SPACING.xs }}
            />
          </View>

          <CandiDivider />

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={PALETTE.primary} />
              <Text style={styles.loadingText}>MENGGALI ARSIP...</Text>
            </View>
          ) : error ? (
            <View style={styles.loaderContainer}>
              <Ionicons name="cloud-offline-outline" size={48} color={PALETTE.error} style={{ marginBottom: SPACING.md }} />
              <Text style={styles.loadingText}>KONEKSI KE SERVER GAGAL</Text>
              <Text style={[styles.loadingText, { fontSize: 14, color: PALETTE.onSurfaceVariant, marginTop: 4, marginBottom: SPACING.lg, textTransform: 'none' }]}>
                Data pusaka tidak dapat diambil saat ini
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchHeroes}>
                <Ionicons name="refresh" size={18} color={PALETTE.onPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.retryBtnText}>COBA LAGI</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              ListHeaderComponent={<PatchNotesCarousel />}
              data={filteredHeroes}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.heroCard, { width: cardWidth }]}
                  onPress={() => navigation.navigate('HeroDetail', { heroId: item.id, heroName: item.name, heroHead: item.head })}
                >
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: item.head || `https://placehold.co/150/111/white?text=${encodeURIComponent(item.name?.[0] || 'H')}` }}
                      style={styles.heroImage}
                      resizeMode="cover"
                    />
                    <LinearGradient 
                      colors={['transparent', PALETTE.surfaceDim]} 
                      style={styles.cardGradient}
                    />
                  </View>
                  
                  {/* Fake clip-path triangle */}
                  <View style={styles.fakeTriangle} />

                  <View style={styles.heroInfo}>
                    <View style={styles.roleRow}>
                      <View style={styles.roleBadge}>
                        <Ionicons name={getRoleIcon(item.type)} size={12} color={PALETTE.secondary} />
                      </View>
                      <Text style={styles.roleText}>{(item.type || 'FIGHTER').toUpperCase()}</Text>
                    </View>
                    <Text style={styles.heroName} numberOfLines={1}>{(item.name || '').toUpperCase()}</Text>
                    <View style={styles.patchOverlay}>
                      <Text style={styles.patchText}>{item.patchInfo || 'BUFF v1.8.44'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              key={numColumns}
              numColumns={numColumns}
              contentContainerStyle={styles.listContent}
              columnWrapperStyle={{ gap: SPACING.sm, paddingHorizontal: SPACING.marginMobile, marginBottom: SPACING.sm }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.loaderContainer}>
                  <Ionicons name="scan-outline" size={40} color={PALETTE.onSurfaceVariant} />
                  <Text style={styles.loadingText}>TIDAK ADA PUSAKA DITEMUKAN</Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </BaseLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1, paddingTop: Platform.OS === 'ios' ? 40 : 20 },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: SPACING.marginMobile, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: PALETTE.outlineVariant,
    backgroundColor: PALETTE.surface,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerAvatar: {
    width: 40, height: 40, borderRadius: SIZES.radiusFull,
    borderWidth: 1, borderColor: PALETTE.primary,
    backgroundColor: PALETTE.surfaceContainerHighest,
  },
  headerTitle: { 
    ...TYPOGRAPHY.headlineMd,
    color: PALETTE.primary, letterSpacing: 1,
  },
  refreshBtn: { padding: 4 },
  
  body: { flex: 1, paddingTop: SPACING.lg },

  // ── Search ─────────────────────────────────────────────────────────────────
  searchBarContainer: { 
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: PALETTE.surfaceContainerHigh,
    borderWidth: 1, borderColor: PALETTE.outlineVariant,
    borderRadius: SIZES.radiusXl,
    marginHorizontal: SPACING.marginMobile,
    paddingHorizontal: SPACING.sm,
    height: 48,
    marginBottom: SPACING.md,
  },
  searchIcon: { marginRight: 8, marginLeft: 4 },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMd,
    color: PALETTE.onSurface,
    height: '100%',
    outlineStyle: 'none'
  },

  // ── Roles ──────────────────────────────────────────────────────────────────
  roleFilterContainer: { marginBottom: SPACING.sm },
  roleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: PALETTE.surfaceContainerHighest,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: PALETTE.outlineVariant,
  },
  roleBtnActive: {
    backgroundColor: PALETTE.primary,
    borderColor: PALETTE.primary,
  },
  roleBtnText: {
    ...TYPOGRAPHY.labelBold,
    color: PALETTE.onSurfaceVariant,
  },
  roleBtnTextActive: {
    color: PALETTE.onPrimaryContainer,
  },

  // ── List ───────────────────────────────────────────────────────────────────
  listContent: { paddingBottom: 100 },
  loaderContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 200, gap: SPACING.md },
  loadingText: { ...TYPOGRAPHY.labelBold, color: PALETTE.onSurfaceVariant, marginTop: SPACING.xs },

  // ── Card ───────────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: PALETTE.surfaceContainerHighest,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: PALETTE.outlineVariant,
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrapper: { width: '100%', height: 160 },
  heroImage: { width: '100%', height: '100%' },
  cardGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
  },
  
  // Fake clip-path via border trick
  fakeTriangle: {
    position: 'absolute',
    top: -1, right: -1, // slightly overlap border
    width: 0, height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 32,
    borderTopWidth: 32,
    borderRightColor: PALETTE.surface,
    borderTopColor: PALETTE.surface,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },

  heroInfo: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: SPACING.sm,
  },
  roleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4,
  },
  roleBadge: {
    width: 20, height: 20, borderRadius: SIZES.radiusFull,
    borderWidth: 1, borderColor: PALETTE.primary,
    backgroundColor: 'rgba(51, 53, 53, 0.8)', // surfaceContainerHighest with opacity
    alignItems: 'center', justifyContent: 'center',
  },
  roleText: {
    ...TYPOGRAPHY.labelBold,
    color: PALETTE.secondary,
  },
  heroName: {
    ...TYPOGRAPHY.statValue,
    color: PALETTE.onSurface,
  },
  patchOverlay: {
    marginTop: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: SIZES.radiusSm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: PALETTE.outlineVariant,
  },
  patchText: {
    ...TYPOGRAPHY.labelBold,
    color: PALETTE.onSurfaceVariant,
    fontSize: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: SIZES.radiusMd,
  },
  retryBtnText: {
    ...TYPOGRAPHY.labelBold,
    color: PALETTE.onPrimary,
  }
});

export default HeroDatabaseScreen;
