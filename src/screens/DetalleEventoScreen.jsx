// src/screens/DetalleEventoScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { deleteEvento, getEventoById } from '../lib/storage';


export default function DetalleEventoScreen({ navigation, route }) {
  const { id } = route.params;
  const [evento, setEvento] = useState(null);

  async function cargar() {
    const e = await getEventoById(id);
    setEvento(e);
  }

  useEffect(() => {
    cargar();
  }, [id]);

  if (!evento) {
    return (
      <GradientBackground>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff' }}>Cargando…</Text>
        </View>
      </GradientBackground>
    );
  }

  const onDelete = () => {
    Alert.alert('Eliminar', '¿Deseas eliminar este evento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          await deleteEvento(evento.id);
          navigation.navigate('Gestion');
        }
      }
    ]);
  };

  const onShare = async () => {
    const msg =
      `🎉 *${evento.nombre}* (${evento.tipo})
📅 ${evento.fecha}  ⏰ ${evento.hora}
📍 ${evento.ubicacion || 'Sin dirección'}

¡Te espero!`;
    await Share.share({ message: msg });
  };

  const hasCoords = Number.isFinite(evento.lat) && Number.isFinite(evento.lng);

  return (
    <GradientBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{evento.nombre}</Text>
        <Text style={styles.headerSub}>{evento.tipo} • {evento.fecha} • {evento.hora}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{evento.nombre}</Text>
        <Text style={styles.line}>📅 {evento.fecha}   ⏰ {evento.hora}</Text>
        <Text style={styles.line}>📍 {evento.ubicacion || 'Sin dirección'}</Text>
        {!!evento.descripcion && <Text style={styles.desc}>{evento.descripcion}</Text>}

        {hasCoords && (
          <View style={styles.mapWrap}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: evento.lat,
                longitude: evento.lng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              pointerEvents="none"
            >
              <Marker coordinate={{ latitude: evento.lat, longitude: evento.lng }} />
            </MapView>
          </View>
        )}
      </View>

      <View style={styles.actions}>

        <TouchableOpacity style={[styles.btn, styles.edit]} onPress={() => navigation.navigate('EditarEvento', { id: evento.id })}>
          <MaterialIcons name="edit" size={20} color={colors.white} />
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.share]} onPress={onShare}>
          <MaterialIcons name="share" size={20} color={colors.white} />
          <Text style={styles.btnText}>Compartir</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.delete]} onPress={onDelete}>
          <MaterialIcons name="delete" size={20} color={colors.white} />
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actions}> {/* Reutilizamos styles.actions para la fila y el margen */}
        <TouchableOpacity
          style={[styles.btn, styles.uploadBtn]}
          onPress={() => Alert.alert('Fotos', 'Aquí se suben fotos')}
        >
          <MaterialIcons name="cloud-upload" size={20} color={colors.warn} />
          <Text style={styles.btnTxt}>Subir Fotos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.viewGalleryBtn]}
          onPress={() => Alert.alert('Galería', 'Aquí se ve la galería')}
        >
          <MaterialIcons name="photo-library" size={20} color={colors.warn} />

          <Text style={styles.btnTxt}>Ver Galería</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={[styles.btn, styles.chatBtn]} // <--- Nuevo estilo
        onPress={() => navigation.navigate('Chat', { eventId: evento.id, eventName: evento.nombre })} // <--- Navegación al Chat
>
        <MaterialIcons name="chat" size={20} color={colors.primary} />
        <Text style={styles.btnTxt}>Chat Evento</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 12 },
  headerSub: { color: '#fff', opacity: 0.9 },

  card: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: colors.primary, marginBottom: 6 },
  line: { color: '#222', marginTop: 4 },
  desc: { color: '#666', marginTop: 10 },
  mapWrap: { height: 180, borderRadius: 12, overflow: 'hidden', marginTop: 12 },
  btnTxt: { color: '#000000ff', fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10, marginHorizontal: 16,marginBottom: 10},
  btn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  btnText: { color: '#fff', fontWeight: '800' },
  edit: { backgroundColor: colors.primary },
  share: { backgroundColor: '#2b8a3e' },
  delete: { backgroundColor: '#d0003a' },
  uploadBtn: { backgroundColor: '#ffffffff' }, // Verde cian para subir
  viewGalleryBtn: { backgroundColor: '#ffffffff' }, // Azul para ver
  

  //Estilo para la seccion de chat
chatBtn: { backgroundColor: colors.white },
});
