// src/screens/Auth/RegisterScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import GradientBackground from '../../components/GradientBackground';
import { colors } from '../../theme/colors';
import { useAuth } from '../../providers/AuthProvider';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function RegisterScreen({ navigation }) {
  const { emailPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');

  const onRegister = async () => {
    if (pass !== pass2) {
      Toast.show({ type: 'error', text1: 'Las contraseñas no coinciden' });
      return;
    }
    if (pass.length < 6) {
      Toast.show({ type: 'error', text1: 'La contraseña debe tener 6+ caracteres' });
      return;
    }
    try {
      await emailPassword.signUp(email.trim(), pass);
      Toast.show({ type: 'success', text1: 'Cuenta creada' });
      navigation.replace('Login');
    } catch (e) {
      Toast.show({ type: 'error', text1: 'No pudimos registrar', text2: e.message });
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex:1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.sub}>Regístrate para usar EventMaster</Text>

          <View style={styles.card}>
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              placeholder="Contraseña (6+)"
              placeholderTextColor="#888"
              value={pass}
              onChangeText={setPass}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              placeholder="Repite tu contraseña"
              placeholderTextColor="#888"
              value={pass2}
              onChangeText={setPass2}
              secureTextEntry
              style={styles.input}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={onRegister} disabled={!email || !pass || !pass2}>
              <MaterialIcons name="person-add" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Crear cuenta</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, alignItems:'center', justifyContent:'center', padding:24 },
  title: { fontSize:28, fontWeight:'800', color:'#fff' },
  sub: { color:'#fff', opacity:0.9, marginBottom:16 },
  card: { backgroundColor:'#fff', borderRadius:16, padding:16, width:'100%', maxWidth:420 },
  input: { backgroundColor:'#f0f0f0', borderRadius:12, paddingHorizontal:12, paddingVertical:12, marginBottom:10, color:'#111' },
  primaryBtn: { backgroundColor: colors.primary, borderRadius:12, paddingVertical:12, alignItems:'center', flexDirection:'row', justifyContent:'center', gap:8, marginBottom:8 },
  primaryBtnText: { color:'#fff', fontWeight:'800' },
  link: { color: colors.primary, fontWeight:'700', textAlign:'center', marginTop:8 },
});
