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
  // Increase base width divisor on web so cards are larger and text fits
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
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>DATABASE</Text>
          <Text style={styles.headerTitle}>HERO ARCHIVE</Text>
        </View>
        <TouchableOpacity onPress={fetchHeroes} style={styles.refreshBtn}>
          <Ionicons name="sync" size={18} color={PALETTE.redNeon} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#444" style={{ marginRight: 10 }} />
        <TextInput
          placeholder="SEARCH HERO UNIT..."
          placeholderTextColor="#444"
          style={styles.searchInput}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

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
          <ActivityIndicator size="large" color={PALETTE.redNeon} />
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
              <Ionicons name="scan-outline" size={40} color="#222" />
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
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 25, paddingVertical: 20,
  },
  headerSubtitle: { color: PALETTE.redNeon, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  headerTitle: { color: 'white', fontSize: isWeb ? 32 : 24, fontWeight: '900', letterSpacing: 1 },
  refreshBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  
  searchBar: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#0a0a0a', marginHorizontal: 20, 
    paddingHorizontal: 15, paddingVertical: 12,
    borderRadius: 8, borderWidth: 1, borderColor: '#111', marginBottom: 15
  },
  searchInput: { flex: 1, color: 'white', fontSize: 11, fontWeight: 'bold', outlineStyle: 'none' },

  roleFilterContainer: { marginBottom: 20, height: 35 },
  roleBtn: { paddingHorizontal: 15, height: 30, justifyContent: 'center', borderRadius: 15, backgroundColor: '#0a0a0a', marginRight: 10, borderWidth: 1, borderColor: '#111' },
  roleBtnActive: { backgroundColor: PALETTE.redNeon, borderColor: PALETTE.redNeon },
  roleBtnText: { color: '#555', fontSize: 9, fontWeight: '900' },
  roleBtnTextActive: { color: 'white' },

  listContent: { paddingHorizontal: 10, paddingBottom: 100 },
  heroCard: {
    margin: 5,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#111'
  },
  imageContainer: { width: '100%', aspectRatio: 1, position: 'relative', marginBottom: 8 },
  heroImage: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#111' },
  roleTag: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: 'rgba(0,0,0,0.8)', paddingVertical: 4,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8
  },
  roleTagText: { color: PALETTE.redNeon, fontSize: isWeb ? 9 : 7, fontWeight: '900', textAlign: 'center', letterSpacing: 0.5 },
  heroName: { color: 'white', fontSize: isWeb ? 13 : 10, fontWeight: 'bold', textAlign: 'center', marginTop: 4 },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#444', fontSize: 10, fontWeight: 'bold', marginTop: 15, letterSpacing: 2 }
});

export default HeroDatabaseScreen;
