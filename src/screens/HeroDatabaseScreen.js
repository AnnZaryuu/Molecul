import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, Image, 
  TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PALETTE, SIZES } from '../theme/theme';
import { MLBBApiService } from '../services/mlbbApiService';

const { width } = Dimensions.get('window');

const ROLES = ['ALL', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];

const HeroDatabaseScreen = ({ navigation }) => {
  const [heroes, setHeroes] = useState([]);
  const [filteredHeroes, setFilteredHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  useEffect(() => {
    fetchHeroes();
  }, []);

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

  const applyFilters = (searchText, role) => {
    let filtered = [...heroes];
    
    if (searchText) {
      filtered = filtered.filter(h => 
        h.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (role !== 'ALL') {
      filtered = filtered.filter(h => 
        h.type?.toLowerCase().includes(role.toLowerCase())
      );
    }
    
    setFilteredHeroes(filtered);
  };

  const handleSearch = (text) => {
    setSearch(text);
    applyFilters(text, selectedRole);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    applyFilters(search, role);
  };

  const renderHeroItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.heroCard}
      onPress={() => navigation.navigate('HeroDetail', { 
        heroId: item.id, 
        heroName: item.name,
        heroHead: item.head
      })}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.head || 'https://placehold.co/150/111/white?text=' + (item.name?.[0] || 'H') }} 
          style={styles.heroImage} 
          resizeMode="cover"
        />
      </View>
      <Text style={styles.heroName} numberOfLines={1}>{item.name.toUpperCase()}</Text>
    </TouchableOpacity>
  );

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
          renderItem={renderHeroItem}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.loaderContainer}>
              <Ionicons name="scan-outline" size={40} color="#222" />
              <Text style={styles.loadingText}>NO DATA IN THIS SECTOR</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    paddingVertical: 20,
  },
  headerSubtitle: { color: PALETTE.redNeon, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  refreshBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0a0a0a', 
    marginHorizontal: 20, 
    paddingHorizontal: 15, 
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#111',
    marginBottom: 15
  },
  searchInput: { flex: 1, color: 'white', fontSize: 11, fontWeight: 'bold' },

  roleFilterContainer: { marginBottom: 20, height: 35 },
  roleBtn: { 
    paddingHorizontal: 15, 
    height: 30, 
    justifyContent: 'center', 
    borderRadius: 15, 
    backgroundColor: '#0a0a0a', 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#111'
  },
  roleBtnActive: { backgroundColor: PALETTE.redNeon, borderColor: PALETTE.redNeon },
  roleBtnText: { color: '#555', fontSize: 9, fontWeight: '900' },
  roleBtnTextActive: { color: 'white' },

  listContent: { paddingHorizontal: 10, paddingBottom: 100 },
  heroCard: { 
    width: (width - 40) / 3, 
    margin: 5, 
    backgroundColor: '#0a0a0a', 
    borderRadius: 12, 
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#111'
  },
  imageContainer: { width: '100%', aspectRatio: 1, position: 'relative', marginBottom: 10 },
  heroImage: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#000' },
  roleTag: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8
  },
  roleTagText: { color: PALETTE.redNeon, fontSize: 7, fontWeight: '900', textAlign: 'center' },
  heroName: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#444', fontSize: 10, fontWeight: 'bold', marginTop: 15, letterSpacing: 2 }
});

export default HeroDatabaseScreen;
