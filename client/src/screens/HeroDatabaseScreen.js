import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, Text, View, FlatList, Image, 
  TouchableOpacity, TextInput, ActivityIndicator, Platform,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { PALETTE } from '../theme/theme';
import { MLBBApiService } from '../services/mlbbApiService';
import PatchNotesCarousel from '../components/PatchNotesCarousel';

const ROLES = ['ALL', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];
const isWeb = Platform.OS === 'web';

const HeroDatabaseScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const availableWidth = isWeb ? Math.max(300, width - 240) : width - 20;
  const numColumns = isWeb ? Math.max(3, Math.floor(availableWidth / 160)) : 3;
  const cardWidth = (availableWidth - (numColumns * 10)) / numColumns;
    
  const [heroes, setHeroes] = useState([]);
  const [filteredHeroes, setFilteredHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

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
    try {
      const data = await MLBBApiService.getHeroes();
      if (Array.isArray(data)) {
        setHeroes(data);
        setFilteredHeroes(data);
      }
    } catch (error) {
      console.error('Failed to fetch heroes:', error);
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
    if (role !== 'ALL') {
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

  const renderRoleItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.roleBtn, selectedRole === item && styles.roleBtnActive]}
      onPress={() => handleRoleSelect(item)}
    >
      <Text style={[styles.roleBtnText, selectedRole === item && styles.roleBtnTextActive]}>
        {item.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAccent} />
          <View>
            <Text style={styles.headerSubtitle}>DATABASE</Text>
            <Text style={styles.headerTitle}>HERO ARCHIVE</Text>
          </View>
        </View>
        <TouchableOpacity onPress={fetchHeroes} style={styles.refreshBtn}>
          <Ionicons name="sync" size={18} color={PALETTE.accent} />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={PALETTE.textDark} style={{ marginRight: 10 }} />
        <TextInput
          placeholder="SEARCH HERO UNIT..."
          placeholderTextColor={PALETTE.textDark}
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
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={PALETTE.accent} />
          <Text style={styles.loadingText}>ACCESSING ARCHIVES...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHeroes}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.heroCard, { width: cardWidth }]}
              onPress={() => navigation.navigate('HeroDetail', { heroId: item.id, heroName: item.name, heroHead: item.head })}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.head || `https://placehold.co/150/111/white?text=${encodeURIComponent(item.name?.[0] || 'H')}` }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>{(item.type || 'FIGHTER').toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.heroName} numberOfLines={2}>{(item.name || '').toUpperCase()}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          key={numColumns}
          numColumns={numColumns}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.loaderContainer}>
              <Ionicons name="scan-outline" size={40} color={PALETTE.lightGray} />
              <Text style={styles.loadingText}>NO DATA IN THIS SECTOR</Text>
            </View>
          )}
          ListHeaderComponent={<PatchNotesCarousel />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.black },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 25, paddingVertical: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAccent: { width: 3, height: 36, backgroundColor: PALETTE.accent },
  headerSubtitle: { color: PALETTE.accent, fontSize: 10, fontWeight: '900', letterSpacing: 3 },
  headerTitle: { color: PALETTE.textMain, fontSize: isWeb ? 28 : 22, fontWeight: '900', letterSpacing: 2 },
  refreshBtn: {
    width: 40, height: 40, borderRadius: 0,     // ← SHARP
    backgroundColor: PALETTE.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: PALETTE.lightGray,
  },
  
  // ── Search ─────────────────────────────────────────────────────────────────
  searchBar: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: PALETTE.surface, marginHorizontal: 20, 
    paddingHorizontal: 14, paddingVertical: 11,
    borderRadius: 0, borderWidth: 1, borderColor: PALETTE.lightGray,  // ← SHARP
    marginBottom: 15,
  },
  searchInput: { flex: 1, color: PALETTE.textMain, fontSize: 11, fontWeight: '800', letterSpacing: 1, outlineStyle: 'none' },

  // ── Role Filter ────────────────────────────────────────────────────────────
  roleFilterContainer: { marginBottom: 20, height: 34 },
  roleBtn: {
    paddingHorizontal: 16, height: 30, justifyContent: 'center',
    borderRadius: 0,                    // ← SHARP
    backgroundColor: PALETTE.surface, marginRight: 8,
    borderWidth: 1, borderColor: PALETTE.lightGray,
  },
  roleBtnActive: { backgroundColor: PALETTE.accent, borderColor: PALETTE.accent },
  roleBtnText: { color: PALETTE.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  roleBtnTextActive: { color: PALETTE.black },

  // ── Hero Grid ──────────────────────────────────────────────────────────────
  listContent: { paddingHorizontal: 10, paddingBottom: 100 },
  heroCard: {
    margin: 4,
    backgroundColor: PALETTE.surface,
    borderRadius: 2,                    // ← SHARP
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.lightGray,
  },
  imageContainer: { width: '100%', aspectRatio: 1, position: 'relative', marginBottom: 6 },
  heroImage: { width: '100%', height: '100%', borderRadius: 1, backgroundColor: PALETTE.surface2 },
  roleTag: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: 'rgba(8,11,20,0.88)', paddingVertical: 3,
    borderBottomLeftRadius: 1, borderBottomRightRadius: 1,
  },
  roleTagText: { color: PALETTE.accent, fontSize: isWeb ? 9 : 7, fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
  heroName: { color: PALETTE.textMain, fontSize: isWeb ? 12 : 10, fontWeight: '800', textAlign: 'center', marginTop: 4, letterSpacing: 0.5 },

  // ── States ─────────────────────────────────────────────────────────────────
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: PALETTE.textDark, fontSize: 10, fontWeight: '800', marginTop: 15, letterSpacing: 2 },
});

export default HeroDatabaseScreen;
