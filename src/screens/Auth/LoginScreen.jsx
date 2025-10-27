import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';import GradientBackground from '../../components/GradientBackground';
import { colors } from '../../theme/colors';
import { useAuth } from '../../providers/AuthProviderLocal';
import Toast from 'react-native-toast-message';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const GoogleLogo = require('../../../assets/google.png'); // Ajusta esta ruta a donde tengas tu archivo
export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');     // autollenado demo
  const [pass, setPass] = useState('');

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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>EventMaster</Text>
          <Text style={styles.sub}>Inicia sesión con tu cuenta demo</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => alert('Entrar con Google (Demo)')}
            >
              {/* 👇 Reemplazamos el ícono por la imagen importada */}
              <Image source={GoogleLogo} style={styles.googleIcon} />
              <Text style={styles.googleBtnText}>Entrar con Google</Text>
            </TouchableOpacity>
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

            <TouchableOpacity style={styles.primaryBtn} onPress={onEmailLogin}>
              <MaterialIcons name="login" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Ingresar</Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <Text style={styles.linkTextTitle}>No tienes cuenta?</Text>

              <TouchableOpacity
                // Usamos un estilo de enlace de texto, no el primaryBtn grande
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.linkText}>Regístrate aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  sub: { color: '#fff', opacity: 0.9, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '100%', maxWidth: 420 },
  input: { backgroundColor: '#f0f0f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 10, color: '#111' },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  demoBox: { marginTop: 12, backgroundColor: '#f7f7f7', borderRadius: 10, padding: 10 },
  demoTitle: { fontWeight: '800', marginBottom: 4, color: '#222' },
  demoLine: { color: '#333' },
  linkContainer: {
    marginTop: 16,
    paddingTop: 8,
    alignItems: 'center',
  },
  linkTextTitle: {
    color: '#444',
    marginBottom: 4
  },
  linkText: {
    color: colors.primary, // Asegúrate de que colors.primary esté importado
    fontWeight: '700',
    fontSize: 16
  },
  googleBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10, // Espacio entre ícono y texto
    marginBottom: 10, // Espacio antes del separador
  },
  googleBtnText: {
    color: colors.primary, // Color azul de Google
    fontWeight: '700',
    fontSize: 16
  },
  separator: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  googleBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  // 👇 ESTILO PARA LA IMAGEN
  googleIcon: {
    width: 20, // Ajusta el tamaño según tu necesidad
    height: 20,
    resizeMode: 'contain',
  },
});
