import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, Modal } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { PALETTE } from '../theme/theme';
import api from '../services/api';
import { MLBBApiService } from '../services/mlbbApiService';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AdminDashboardScreen = ({ navigation }) => {
  const { userInfo, fetchProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('RESOLVE'); // 'RESOLVE', 'CREATE_DUMMY', 'USERS'
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // States for Resolve
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);

  // States for Create Dummy
  const [dummyName, setDummyName] = useState('');
  const [dummyTeamA, setDummyTeamA] = useState('');
  const [dummyTeamB, setDummyTeamB] = useState('');

  // States for Manage Users
  const [users, setUsers] = useState([]);
  const [showEditCoinModal, setShowEditCoinModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newCoinsInput, setNewCoinsInput] = useState('');

  useEffect(() => {
    if (userInfo && userInfo.role === 'admin') {
      if (activeTab === 'RESOLVE') fetchMatches();
      if (activeTab === 'USERS') fetchUsers();
    }
  }, [activeTab, userInfo]);

  const showNotify = (msg, type) => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- API CALLS ---
  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const [live, upcoming, dummyRes] = await Promise.all([
        MLBBApiService.getMLBBMatches('running', 10),
        MLBBApiService.getMLBBMatches('upcoming', 20),
        api.get('/dummy-matches').catch(() => ({ data: [] }))
      ]);
      const dummy = (dummyRes.data || []).map(d => ({
        id: d.id, 
        name: d.name, 
        isDummy: true,
        opponents: [
          { id: d.team_a_id, name: d.team_a_name },
          { id: d.team_b_id, name: d.team_b_name }
        ]
      }));
      setMatches([...dummy, ...(live || []), ...(upcoming || [])]);
    } catch (error) {
      console.log('Error fetching matches:', error);
    }
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data || []);
    } catch (error) {
      console.log('Error fetching users:', error);
    }
    setIsLoading(false);
  };

  const handleResolveMatch = async (winningTeamId) => {
    if (!selectedMatch || !winningTeamId) return;
    setIsLoading(true);
    try {
      const response = await api.post('/admin/resolve-match', {
        match_id: String(selectedMatch.id),
        winning_team_id: String(winningTeamId)
      });
      showNotify(`Berhasil! ${response.data.resolved_predictions_count} prediksi diproses.`, 'success');
      setShowResolveModal(false);
      fetchMatches();
      if (fetchProfile) fetchProfile();
    } catch (error) {
      showNotify(error.response?.data?.message || 'Gagal menghubungi server.', 'error');
    }
    setIsLoading(false);
  };

  const handleCreateDummy = async () => {
    if (!dummyName || !dummyTeamA || !dummyTeamB) {
      showNotify('Harap isi semua field.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/admin/dummy-matches', {
        name: dummyName,
        team_a_name: dummyTeamA,
        team_b_name: dummyTeamB
      });
      showNotify('Dummy Match berhasil dibuat!', 'success');
      setDummyName(''); setDummyTeamA(''); setDummyTeamB('');
    } catch (error) {
      showNotify('Gagal membuat dummy match.', 'error');
    }
    setIsLoading(false);
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      showNotify('User dihapus.', 'success');
      fetchUsers();
    } catch (error) {
      showNotify(error.response?.data?.message || 'Gagal hapus user.', 'error');
    }
  };

  const openEditCoinModal = (user) => {
    setEditingUser(user);
    setNewCoinsInput(String(user.coins));
    setShowEditCoinModal(true);
  };

  const submitEditCoins = async () => {
    const coins = parseInt(newCoinsInput, 10);
    if (!isNaN(coins) && editingUser) {
      setIsLoading(true);
      try {
        await api.put(`/admin/users/${editingUser.id}/coins`, { coins });
        showNotify('Koin berhasil diupdate.', 'success');
        fetchUsers();
        setShowEditCoinModal(false);
      } catch (error) {
        showNotify('Gagal update koin.', 'error');
      }
      setIsLoading(false);
    }
  };

  if (!userInfo || userInfo.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>UNAUTHORIZED</Text>
          <Text style={styles.subtitle}>You do not have admin access.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.title}>ADMIN DASHBOARD</Text>
        <Text style={styles.subtitle}>Manage matches and users</Text>
        
        {notification && (
          <View style={[styles.notificationBox, notification.type === 'error' ? styles.notificationError : styles.notificationSuccess]}>
            <Text style={[styles.notificationText, notification.type === 'error' ? styles.notificationTextError : styles.notificationTextSuccess]}>
              {notification.message}
            </Text>
          </View>
        )}

        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === 'RESOLVE' && styles.activeTab]} onPress={() => setActiveTab('RESOLVE')}>
            <Text style={[styles.tabText, activeTab === 'RESOLVE' && styles.activeTabText]}>RESOLVE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'CREATE_DUMMY' && styles.activeTab]} onPress={() => setActiveTab('CREATE_DUMMY')}>
            <Text style={[styles.tabText, activeTab === 'CREATE_DUMMY' && styles.activeTabText]}>DUMMY MATCH</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'USERS' && styles.activeTab]} onPress={() => setActiveTab('USERS')}>
            <Text style={[styles.tabText, activeTab === 'USERS' && styles.activeTabText]}>USERS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── TAB: RESOLVE MATCH ── */}
        {activeTab === 'RESOLVE' && (
          <View>
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchMatches}>
              <Ionicons name="sync" size={16} color={PALETTE.textMain} />
              <Text style={styles.refreshText}>REFRESH LIST</Text>
            </TouchableOpacity>

            {isLoading ? <ActivityIndicator color={PALETTE.redNeon} /> : matches.map((match) => (
              <TouchableOpacity 
                key={match.id} 
                style={[styles.matchCard, match.isDummy && { borderColor: PALETTE.accent }]}
                onPress={() => {
                  setSelectedMatch(match);
                  setShowResolveModal(true);
                }}
              >
                <Text style={styles.matchName}>{match.name} {match.isDummy ? '(DUMMY)' : ''}</Text>
                <Text style={styles.matchTeams}>
                  {match.opponents?.[0]?.name || 'TBD'} vs {match.opponents?.[1]?.name || 'TBD'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── TAB: CREATE DUMMY ── */}
        {activeTab === 'CREATE_DUMMY' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>CREATE DUMMY MATCH</Text>
            <TextInput style={styles.input} placeholder="Match Name (e.g. M6 Grand Final)" placeholderTextColor="#666" value={dummyName} onChangeText={setDummyName} />
            <TextInput style={styles.input} placeholder="Team A Name (e.g. RRQ HOSHI)" placeholderTextColor="#666" value={dummyTeamA} onChangeText={setDummyTeamA} />
            <TextInput style={styles.input} placeholder="Team B Name (e.g. ONIC ESPORTS)" placeholderTextColor="#666" value={dummyTeamB} onChangeText={setDummyTeamB} />
            <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleCreateDummy} disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? 'PROCESSING...' : 'CREATE MATCH'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── TAB: USERS ── */}
        {activeTab === 'USERS' && (
          <View>
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchUsers}>
              <Ionicons name="sync" size={16} color={PALETTE.textMain} />
              <Text style={styles.refreshText}>REFRESH USERS</Text>
            </TouchableOpacity>
            
            {isLoading ? <ActivityIndicator color={PALETTE.redNeon} /> : users.map(user => (
              <View key={user.id} style={styles.userCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{user.name} <Text style={{ color: PALETTE.textMuted, fontSize: 10 }}>({user.role})</Text></Text>
                  <Text style={styles.userCoins}>{user.coins} P</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEditCoinModal(user)}>
                    <Ionicons name="create-outline" size={18} color="#10b981" />
                  </TouchableOpacity>
                  {user.id !== userInfo.id && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteUser(user.id)}>
                      <Ionicons name="trash-outline" size={18} color={PALETTE.redNeon} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── RESOLVE MODAL ── */}
      <Modal visible={showResolveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalAccentBar, { backgroundColor: PALETTE.redNeon }]} />
            <Text style={styles.modalTitle}>RESOLVE MATCH</Text>
            <Text style={{ color: PALETTE.textMuted, fontSize: 12, marginBottom: 20, textAlign: 'center' }}>
              Select the winning team for {selectedMatch?.name}
            </Text>
            
            <View style={{ gap: 10 }}>
              {selectedMatch?.opponents?.map(team => (
                <TouchableOpacity 
                  key={team.id}
                  style={styles.teamSelectBtn}
                  onPress={() => handleResolveMatch(team.id)}
                >
                  <Text style={styles.teamSelectText}>{team.name} WINS</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={() => setShowResolveModal(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── EDIT COIN MODAL ── */}
      <Modal visible={showEditCoinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalAccentBar, { backgroundColor: '#10b981' }]} />
            <Text style={styles.modalTitle}>EDIT COINS</Text>
            <Text style={{ color: PALETTE.textMuted, fontSize: 12, marginBottom: 20, textAlign: 'center' }}>
              Masukkan jumlah koin baru untuk {editingUser?.name} (saat ini {editingUser?.coins} P):
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Jumlah Koin"
              placeholderTextColor="#666"
              value={newCoinsInput}
              onChangeText={setNewCoinsInput}
              keyboardType="numeric"
            />

            <View style={{ gap: 10 }}>
              <TouchableOpacity 
                style={[styles.teamSelectBtn, { backgroundColor: '#10b981', borderColor: '#10b981' }]}
                onPress={submitEditCoins}
                disabled={isLoading}
              >
                <Text style={[styles.teamSelectText, { color: '#000' }]}>{isLoading ? 'PROCESSING...' : 'SAVE CHANGES'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setShowEditCoinModal(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.black },
  header: { padding: 24, paddingBottom: 0, width: '100%', maxWidth: 500, alignSelf: 'center' },
  scrollContent: { padding: 24, paddingBottom: 100, width: '100%', maxWidth: 500, alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: PALETTE.redNeon, textAlign: 'center', marginBottom: 4, letterSpacing: 2 },
  subtitle: { fontSize: 12, color: '#aaa', textAlign: 'center', marginBottom: 20 },
  
  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderColor: PALETTE.lightGray, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderColor: PALETTE.redNeon },
  tabText: { color: PALETTE.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  activeTabText: { color: PALETTE.textMain },
  
  card: { backgroundColor: PALETTE.surface, padding: 24, borderWidth: 1, borderColor: PALETTE.lightGray, marginBottom: 16 },
  cardTitle: { color: PALETTE.textMain, fontSize: 14, fontWeight: '900', marginBottom: 16, letterSpacing: 1 },
  input: { backgroundColor: '#1e1e1e', padding: 16, color: '#fff', borderWidth: 1, borderColor: '#333', marginBottom: 16 },
  button: { backgroundColor: PALETTE.redNeon, padding: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },

  refreshBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 6, marginBottom: 16 },
  refreshText: { color: PALETTE.textMain, fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  matchCard: { padding: 16, backgroundColor: PALETTE.surface, borderWidth: 1, borderColor: PALETTE.lightGray, marginBottom: 10 },
  matchName: { color: PALETTE.textMain, fontSize: 12, fontWeight: '900', marginBottom: 4 },
  matchTeams: { color: PALETTE.textMuted, fontSize: 10, fontWeight: '700' },

  userCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: PALETTE.surface, borderWidth: 1, borderColor: PALETTE.lightGray, marginBottom: 10 },
  userName: { color: PALETTE.textMain, fontSize: 14, fontWeight: '900' },
  userCoins: { color: '#10b981', fontSize: 12, fontWeight: '900', marginTop: 4 },
  actionBtn: { padding: 8, backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: PALETTE.lightGray },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, backgroundColor: PALETTE.surface, padding: 24, position: 'relative' },
  modalAccentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  modalTitle: { color: PALETTE.textMain, fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 8, letterSpacing: 2 },
  teamSelectBtn: { backgroundColor: '#1e1e1e', padding: 16, borderWidth: 1, borderColor: PALETTE.lightGray, alignItems: 'center' },
  teamSelectText: { color: PALETTE.textMain, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  closeBtn: { marginTop: 24, paddingVertical: 10, borderWidth: 1, borderColor: PALETTE.lightGray },
  closeBtnText: { color: PALETTE.textDark, fontSize: 11, fontWeight: '900', textAlign: 'center', letterSpacing: 2 },

  notificationBox: { marginBottom: 16, padding: 12, borderWidth: 1, borderRadius: 0 },
  notificationSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981' },
  notificationError: { backgroundColor: 'rgba(255, 60, 60, 0.1)', borderColor: PALETTE.redNeon },
  notificationText: { fontSize: 12, textAlign: 'center', fontWeight: '900', letterSpacing: 1 },
  notificationTextSuccess: { color: '#10b981' },
  notificationTextError: { color: PALETTE.redNeon },
});

export default AdminDashboardScreen;
