import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import GradientBackground from '../../components/GradientBackground';
import { colors } from '../../theme/colors';
import { useAuth } from '../../providers/AuthProviderLocal';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('admin@demo.com');     // autollenado demo
  const [pass, setPass] = useState('admin123');

  const onEmailLogin = async () => {
    try {
      await signIn(email, pass);
      Toast.show({ type: 'success', text1: 'Bienvenido' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'No pudimos iniciar sesión', text2: e.message });
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex:1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>EventMaster</Text>
          <Text style={styles.sub}>Inicia sesión con tu cuenta demo</Text>

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
              placeholder="Contraseña"
              placeholderTextColor="#888"
              value={pass}
              onChangeText={setPass}
              secureTextEntry
              style={styles.input}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={onEmailLogin} disabled={!email || !pass}>
              <MaterialIcons name="login" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Ingresar</Text>
            </TouchableOpacity>

            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>Usuarios demo:</Text>
              <Text style={styles.demoLine}>admin@demo.com / admin123</Text>
              <Text style={styles.demoLine}>invitado@demo.com / invitado123</Text>
            </View>
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
  demoBox: { marginTop:12, backgroundColor:'#f7f7f7', borderRadius:10, padding:10 },
  demoTitle: { fontWeight:'800', marginBottom:4, color:'#222' },
  demoLine: { color:'#333' },
});
