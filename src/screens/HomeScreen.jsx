import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../providers/AuthProviderLocal';

export default function HomeScreen({ navigation }) {
  const { user, signOut } = useAuth();

  const onSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: signOut },
    ]);
  };

  // Inicial para “avatar” textual
  const initial = (user?.name || user?.email || 'U')[0]?.toUpperCase?.() || 'U';

  return (
    <GradientBackground>
      {/* Header con perfil y cerrar sesión */}
      <View style={styles.header}>
        <View style={styles.userBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.hello}>Hola,</Text>
            <Text style={styles.username} numberOfLines={1}>
              {user?.name || user?.email}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onSignOut} style={styles.signoutBtn} accessibilityLabel="Cerrar sesión">
          <MaterialIcons name="logout" size={18} color="#fff" />
          <Text style={styles.signoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>EventMaster</Text>
        <Text style={styles.subtitle}>Organiza tus eventos de forma espectacular</Text>

        {/* Acciones principales */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => navigation.navigate('Gestion')}
            accessibilityLabel="Ver mis eventos"
          >
            <MaterialIcons name="list" size={20} color="#fff" />
            <Text style={styles.btnText}>Ver Mis Eventos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => navigation.navigate('CrearEvento')}
            accessibilityLabel="Crear nuevo evento"
          >
            <MaterialIcons name="add" size={20} color={colors.primary} />
            <Text style={[styles.btnText, { color: colors.primary }]}>Crear Nuevo Evento</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureTitle}>Rápido</Text>
            <Text style={styles.featureText}>Crea eventos en minutos</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔗</Text>
            <Text style={styles.featureTitle}>Comparte</Text>
            <Text style={styles.featureText}>Invitaciones fáciles</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Organiza</Text>
            <Text style={styles.featureText}>Gestiona confirmaciones</Text>
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CrearEvento')}
        accessibilityLabel="Crear evento"
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  userBox: { flexDirection: 'row', alignItems: 'center', maxWidth: '70%' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800' },
  hello: { color: '#fff', opacity: 0.9, fontSize: 12 },
  username: { color: '#fff', fontWeight: '800', fontSize: 16, maxWidth: 200 },

  signoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  signoutText: { color: '#fff', fontWeight: '700' },

  container: { padding: 24, alignItems: 'center', paddingBottom: 120 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#fff', opacity: 0.9, marginBottom: 24, textAlign: 'center' },

  actions: { width: '100%', maxWidth: 420, gap: 12, marginBottom: 24, marginTop: 8 },
  btn: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  btnPrimary: { backgroundColor: 'rgba(255,255,255,0.20)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  btnSecondary: { backgroundColor: '#fff' },
  btnText: { fontWeight: '800', color: '#fff', fontSize: 16 },

  features: { flexDirection: 'row', gap: 12, marginTop: 12 },
  feature: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', padding: 12, borderRadius: 12, width: 110, alignItems: 'center' },
  featureIcon: { fontSize: 20, color: '#fff', marginBottom: 6 },
  featureTitle: { fontWeight: '700', color: '#fff' },
  featureText: { fontSize: 12, color: '#fff', opacity: 0.85, textAlign: 'center' },

  fab: {
    position: 'absolute', right: 20, bottom: 30,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
});
