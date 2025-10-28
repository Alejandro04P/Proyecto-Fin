import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Modal, Alert, ScrollView } from 'react-native';


import GradientBackground from '../../components/GradientBackground';
import { colors } from '../../theme/colors';
import { useAuth } from '../../providers/AuthProviderLocal';
import Toast from 'react-native-toast-message';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
const isValidEmail = (email) => {
  // Regex simple para verificar la estructura: algo@algo.algo
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};
const GoogleLogo = require('../../../assets/google.png'); // Ajusta esta ruta a donde tengas tu archivo
export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');     // autollenado demo
  const [pass, setPass] = useState('');
  const [isGoogleModalVisible, setIsGoogleModalVisible] = useState(false); // <-- Nuevo estado para el modal
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePass, setGooglePass] = useState('');
  const onEmailLogin = async () => {
    try {
      
     try {
            // ... (tu lógica de validación) ...
            if (email.trim() === "" || pass.trim() === "") {
                const err = new Error('Los campos no pueden estar vacíos.');
                err.code = 'INVALID_CREDENTIALS';
                throw err;
            }
            // ... (el resto de tu lógica de signin) ...
        } catch (err) {
            // ... (Toast de error interno)
            throw err; // Re-lanza el error para que lo capture el catch externo
        }
    
      if (!isValidEmail(email)) {
        Toast.show({
          type: 'error',
          text1: 'Formato de correo inválido',
          text2: 'Por favor, ingresa un correo con formato correcto'
        });
        return;
      }
      await signIn(email, pass);
      Toast.show({ type: 'success', text1: 'Bienvenido' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'No pudimos iniciar sesión', text2: e.message });
    }
  };

  const onGoogleModalLogin = async () => {
    try {// 1. VALIDACIÓN: Usamos el estado del modal (googleEmail)

       if (googleEmail.trim() === "" || googlePass.trim() === "") {
        const err = new Error('Los campos no pueden estar vacíos.');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
      }
    
      if (!isValidEmail(googleEmail)) {
        Toast.show({
          type: 'error',
          text1: 'Formato de correo inválido',
          text2: 'Por favor, ingresa un correo con formato correcto'
        });
        return; // Detiene la función si el email es inválido.
      }

      await signIn(googleEmail, googlePass);
      setIsGoogleModalVisible(false); // Cierra el modal
      Toast.show({ type: 'success', text1: 'Bienvenido' });
    }
    catch (e) {
      Toast.show({ type: 'error', text1: 'No pudimos iniciar sesión', text2: e.message });
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.title}>EventMaster</Text>
            <Text style={styles.sub}>Inicia sesión con tu cuenta demo</Text>

            <View style={styles.card}>
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={() => {setIsGoogleModalVisible(true)
                    setGoogleEmail(""); 
                    setGooglePass("");  
                }} >
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
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={isGoogleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsGoogleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.googleModal}>
            <View style={styles.googleHeader}>
              <Image source={GoogleLogo} style={styles.googleModalLogo} />
              <Text style={styles.googleModalTitle}>Iniciar sesión</Text>
              <Text style={styles.googleModalSub}>Para continuar con EventMaster</Text>
            </View>

            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#888"
              // 👇 USAR ESTADO DEL MODAL
              value={googleEmail}
              onChangeText={setGoogleEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.modalInput}
            />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#888"
              // 👇 USAR ESTADO DEL MODAL
              value={googlePass}
              onChangeText={setGooglePass}
              secureTextEntry
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => { 
                  setIsGoogleModalVisible(false); 
                  setGoogleEmail(""); 
                  setGooglePass("");  
                }} 
              >
                <Text style={styles.modalLink}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={onGoogleModalLogin}
              >
                <Text style={styles.modalPrimaryBtnText}>Siguiente</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Toast />
        </View>
      </Modal>
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
  },// --- ESTILOS DEL MODAL DE GOOGLE ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  googleModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  googleHeader: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  googleModalLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  googleModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  googleModalSub: {
    color: '#5f6368',
    fontSize: 14,
    marginTop: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    color: '#222',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    gap: 20,
  },
  modalLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  modalPrimaryBtn: {
    backgroundColor: colors.primary, // O puedes usar un azul de Google: '#1a73e8'
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  modalPrimaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24 // Agrega espacio para que puedas desplazar un poco hacia arriba y abajo
  },

  // MODIFICADO: Quitamos flex y centrado, dejando solo el padding horizontal
  container: {
    // flex: 1, <--- ELIMINAR O COMENTAR ESTO
    alignItems: 'center',
    // justifyContent: 'center', <--- ELIMINAR O COMENTAR ESTO
    paddingHorizontal: 24
  },
});
