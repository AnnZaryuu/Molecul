import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { PALETTE } from '../theme/theme';

const LoginScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login, isLoading } = useContext(AuthContext);

  const handleLogin = async () => {
    setErrorMessage('');
    if (!name || !password) {
      setErrorMessage('Silakan isi nama dan password.');
      return;
    }
    try {
      await login(name, password);
      navigation.navigate('TOURNEY');
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat login.';
      setErrorMessage(msg);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MOLECUL</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>



        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.black },
  content: { flex: 1, justifyContent: 'center', padding: 24, width: '100%', maxWidth: 400, alignSelf: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: PALETTE.accent, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 32 },
  inputContainer: { marginBottom: 16 },
  label: { color: '#ccc', marginBottom: 8, fontSize: 14 },
  input: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333'
  },
  button: {
    backgroundColor: PALETTE.accent,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#aaa' },
  footerLink: { color: PALETTE.accent, fontWeight: 'bold' },
  errorBox: { backgroundColor: 'rgba(255, 60, 60, 0.1)', borderColor: PALETTE.redNeon, borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: PALETTE.redNeon, fontSize: 13, textAlign: 'center', fontWeight: 'bold' }
});

export default LoginScreen;
