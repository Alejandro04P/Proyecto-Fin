// src/screens/Auth/RegisterScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ScrollView, Modal } from 'react-native';
import GradientBackground from '../../components/GradientBackground';
import { colors } from '../../theme/colors';
import { useAuth } from '../../providers/AuthProviderLocal';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
const GoogleLogo = require('../../../assets/google.png'); // Ajusta esta ruta a donde tengas tu archivo

const isValidEmail = (email) => {
  // Regex: comprueba que tenga caracteres + @ + caracteres + . + caracteres
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  // Regex: ^[0-9]{7,}$
  // Solo permite dígitos [0-9] y requiere un mínimo de 7 (ajusta el {7,} según sea necesario).
  const phoneRegex = /^[0-9]{7,}$/;
  return phoneRegex.test(phone.trim());
};

const isValidName = (text) => {
  // Regex: ^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$
  // Permite letras (mayúsculas/minúsculas), letras acentuadas, la ñ, espacios, guiones y apóstrofos.
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
  return nameRegex.test(text.trim());
};
export default function RegisterScreen({ navigation }) {
  const { signIn } = useAuth();
  const [name, setName] = useState('');      // Nuevo estado
  const [lastName, setLastName] = useState('');  // Nuevo estado
  const [phone, setPhone] = useState('');      // Nuevo estado
  const [email, setEmail] = useState('');     // Estado existente para Correo
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [isGoogleModalVisible, setIsGoogleModalVisible] = useState(false); // <-- Nuevo estado para el modal
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePass, setGooglePass] = useState('');

  const onRegister = async () => {
    if (name.trim() === "" ||
      lastName.trim() === "" ||
      phone.trim() === "" ||
      email.trim() === "" ||
      pass === "" ||
      pass2 === "") {
      Toast.show({
        type: 'error',
        text1: 'Faltan campos',
        text2: 'Por favor, rellena todos los campos obligatorios para continuar.'
      });
      return; // Detiene la ejecución
    }
    // 🛑 2. VALIDACIÓN DE FORMATO DE CORREO (Añadido)
    if (!isValidName(name)) {
      Toast.show({
        type: 'error',
        text1: 'Nombre inválido',
        text2: 'El nombre solo debe contener letras.'
      });
      return;
    }

    // 3. ✅ VALIDACIÓN DE FORMATO: APELLIDO (¡Asegúrate de que el Toast diga 'Apellido'!)
    if (!isValidName(lastName)) {
      Toast.show({
        type: 'error',
        text1: 'Apellido inválido', // 👈 CORRECCIÓN: Usar Apellido
        text2: 'El apellido solo debe contener letras.' // 👈 CORRECCIÓN: Usar Apellido
      });
      return;
    }

    // 4. ✅ VALIDACIÓN DE FORMATO: TELÉFONO
    if (!isValidPhone(phone)) {
      Toast.show({
        type: 'error',
        text1: 'Teléfono inválido',
        text2: 'El número de teléfono debe contener solo dígitos y al menos 7 caracteres.'
      });
      return;
    }

    // 5. ✅ VALIDACIÓN DE FORMATO: CORREO
    if (!isValidEmail(email)) {
      Toast.show({ type: 'error', text1: 'Correo inválido', text2: 'Ingresa un correo con formato correcto.' });
      return;
    }

    // 6. ✅ VALIDACIÓN DE SEGURIDAD: LARGO DE CONTRASEÑA
    if (pass.length < 6) {
      Toast.show({ type: 'error', text1: 'Contraseña débil', text2: 'La contraseña debe tener 6+ caracteres' });
      return;
    }

    // 7. ✅ VALIDACIÓN DE SEGURIDAD: COINCIDENCIA DE CONTRASEÑAS
    if (pass !== pass2) {
      Toast.show({ type: 'error', text1: 'Las contraseñas no coinciden' });
      return;
    }

    try {
      // 🛑 Llama a signUp con TODOS los datos si tu AuthProvider lo requiere
      //await signUp(email.trim(), pass);
      await signIn(email, pass);
      Toast.show({ type: 'success', text1: 'Cuenta creada' });
      // 🛑 Redirección al Home/Dashboard
      // Lo más lógico es redirigir al usuario directamente a la aplicación principal (Dashboard) 
      // después de un registro exitoso, ya que la sesión está guardada.
      // navigation.replace('Login'); 
    } catch (e) {
      Toast.show({ type: 'error', text1: 'No pudimos registrar', text2: e.message });
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
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.sub}>Regístrate para usar EventMaster</Text>

            <View style={styles.card}>
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={() => {
                  setIsGoogleModalVisible(true)
                  setGoogleEmail("");
                  setGooglePass("");
                }} >
                {/* 👇 Reemplazamos el ícono por la imagen importada */}
                <Image source={GoogleLogo} style={styles.googleIcon} />
                <Text style={styles.googleBtnText}>Entrar con Google</Text>
              </TouchableOpacity>
              <TextInput
                placeholder="Nombre"
                placeholderTextColor="#888"
                value={name} // 🛑 Usar estado 'name'
                onChangeText={setName} // 🛑 Usar 'setName'
                autoCapitalize="words" // Mejor para nombres
                style={styles.input}
              />
              <TextInput
                placeholder="Apellido"
                placeholderTextColor="#888"
                value={lastName} // 🛑 Usar estado 'lastName'
                onChangeText={setLastName} // 🛑 Usar 'setLastName'
                autoCapitalize="words" // Mejor para apellidos
                style={styles.input}
              />
              <TextInput
                placeholder="Número celular"
                placeholderTextColor="#888"
                value={phone} // 🛑 Usar estado 'phone'
                onChangeText={setPhone} // 🛑 Usar 'setPhone'
                keyboardType="phone-pad" // Mejor para teléfono
                style={styles.input}
              />
              <TextInput
                placeholder="Correo electrónico"
                placeholderTextColor="#888"
                value={email} // ✓ Mantener 'email'
                onChangeText={setEmail} // ✓ Mantener 'setEmail'
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


              <TouchableOpacity style={styles.primaryBtn} onPress={onRegister}>
                <MaterialIcons name="person-add" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Crear cuenta</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
              </TouchableOpacity>
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
  link: { color: colors.primary, fontWeight: '700', textAlign: 'center', marginTop: 8 },
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24 // Añade espacio superior/inferior para el scroll
  },

  // 👇 MODIFICADO: Quitamos flex y centrado para que se centre dentro del scrollContainer
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    // Asegúrate de que no tenga flex: 1 aquí
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
});
