import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { PALETTE } from '../theme/theme';

const ProfileScreen = () => {
  const { logout, userInfo } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{userInfo?.name || 'Player'}</Text>

        <Text style={styles.label}>Points / Coins</Text>
        <Text style={styles.value}>{userInfo?.coins || 0} P</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.black, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: PALETTE.accent, marginBottom: 32, textAlign: 'center' },
  card: { backgroundColor: '#161B2E', padding: 24, borderRadius: 12, marginBottom: 32 },
  label: { color: '#888', fontSize: 14, marginBottom: 4 },
  value: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  logoutBtn: { backgroundColor: '#FF3B5C', padding: 16, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ProfileScreen;
