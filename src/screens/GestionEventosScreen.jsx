import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, TextInput } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { colors } from '../theme/colors';
import EventCard from '../components/EventCard';
import { getEventos, deleteEvento, saveEventos } from '../lib/storage';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// Helpers para fecha/hora
function parseEventDateTime(e) {
  // e.fecha: YYYY-MM-DD, e.hora: HH:MM
  try {
    if (!e?.fecha) return null;
    const [y, m, d] = e.fecha.split('-').map(Number);
    let hh = 0, mm = 0;
    if (e?.hora) {
      const parts = e.hora.split(':').map(Number);
      hh = parts[0] ?? 0; mm = parts[1] ?? 0;
    }
    return new Date(y, (m || 1) - 1, d, hh, mm, 0, 0);
  } catch {
    return null;
  }
}

function compareByFechaAsc(a, b) {
  const da = parseEventDateTime(a);
  const db = parseEventDateTime(b);
  if (!da && !db) return 0;
  if (!da) return 1;
  if (!db) return -1;
  return da - db;
}
function compareByFechaDesc(a, b) {
  return -compareByFechaAsc(a, b);
}
function compareByNombreAsc(a, b) {
  return (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
}

export default function GestionEventosScreen({ navigation }) {
  // Datos base
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // UI/UX controles
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('todos'); // 'todos' | 'proximos' | 'pasados'
  const [sort, setSort] = useState('fechaAsc');  // 'fechaAsc' | 'fechaDesc' | 'nombreAsc'

  const [lastDeleted, setLastDeleted] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getEventos();
      setEventos(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', cargar);
    return unsub;
  }, [navigation, cargar]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  }, [cargar]);

  // Búsqueda
  const listBuscada = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return eventos;
    return eventos.filter(e =>
      (e.nombre || '').toLowerCase().includes(term) ||
      (e.tipo || '').toLowerCase().includes(term) ||
      (e.ubicacion || '').toLowerCase().includes(term) ||
      (e.fecha || '').includes(term)
    );
  }, [q, eventos]);

  // Filtro Próximos/Pasados
  const listFiltrada = useMemo(() => {
    if (filter === 'todos') return listBuscada;
    const now = new Date();
    now.setSeconds(0, 0);
    return listBuscada.filter(e => {
      const dt = parseEventDateTime(e);
      if (!dt) return filter === 'pasados'; // sin fecha lo tratamos como pasado
      return filter === 'proximos' ? dt >= now : dt < now;
    });
  }, [listBuscada, filter]);

  // Ordenación
  const listOrdenada = useMemo(() => {
    const copy = [...listFiltrada];
    if (sort === 'fechaAsc') copy.sort(compareByFechaAsc);
    else if (sort === 'fechaDesc') copy.sort(compareByFechaDesc);
    else if (sort === 'nombreAsc') copy.sort(compareByNombreAsc);
    return copy;
  }, [listFiltrada, sort]);

  // Eliminar con deshacer
  const handleEliminar = async (id) => {
    const list = [...eventos];
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return;
    const removed = list[idx];
    list.splice(idx, 1);
    setEventos(list);
    await saveEventos(list);
    setLastDeleted(removed);

    Toast.show({
      type: 'info',
      text1: 'Evento eliminado',
      text2: 'Toca para deshacer',
      onPress: async () => {
        const restored = [...list, removed];
        await saveEventos(restored);
        setEventos(restored);
        setLastDeleted(null);
        Toast.show({ type: 'success', text1: 'Eliminación deshecha' });
      },
      position: 'bottom',
      autoHide: true,
      visibilityTime: 5000,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Detalle', { id: item.id })}
      onLongPress={() => handleEliminar(item.id)}
      activeOpacity={0.9}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${item.nombre}`}
    >
      <EventCard event={item} />
    </TouchableOpacity>
  );

  // Cambia ciclo de ordenación al pulsar el chip
  const cycleSort = () => {
    if (sort === 'fechaAsc') setSort('fechaDesc');
    else if (sort === 'fechaDesc') setSort('nombreAsc');
    else setSort('fechaAsc');
  };

  const sortLabel = sort === 'fechaAsc' ? 'Fecha ↑'
                   : sort === 'fechaDesc' ? 'Fecha ↓'
                   : 'Nombre A→Z';

  return (
    <GradientBackground>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityLabel="Volver">
          <MaterialIcons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Eventos</Text>
        <Text style={styles.headerSub}>Gestiona y filtra tus eventos</Text>
      </View>

      <View style={styles.container}>
        {/* Búsqueda */}
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            placeholder="Buscar por nombre, fecha, lugar…"
            placeholderTextColor="#888"
            value={q}
            onChangeText={setQ}
            style={{ flex: 1, color: '#111' }}
            returnKeyType="search"
            accessibilityLabel="Buscar eventos"
          />
          {q ? (
            <TouchableOpacity onPress={() => setQ('')} accessibilityLabel="Limpiar búsqueda">
              <MaterialIcons name="close" size={18} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filtros + Orden */}
        <View style={styles.filtersRow}>
          <View style={styles.segment}>
            <TouchableOpacity
              style={[styles.segBtn, filter === 'todos' && styles.segBtnActive]}
              onPress={() => setFilter('todos')}
              accessibilityLabel="Todos"
            >
              <Text style={[styles.segText, filter === 'todos' && styles.segTextActive]}>Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segBtn, filter === 'proximos' && styles.segBtnActive]}
              onPress={() => setFilter('proximos')}
              accessibilityLabel="Próximos"
            >
              <Text style={[styles.segText, filter === 'proximos' && styles.segTextActive]}>Próximos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segBtn, filter === 'pasados' && styles.segBtnActive]}
              onPress={() => setFilter('pasados')}
              accessibilityLabel="Pasados"
            >
              <Text style={[styles.segText, filter === 'pasados' && styles.segTextActive]}>Pasados</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sortChip} onPress={cycleSort} accessibilityLabel={`Orden actual: ${sortLabel}`}>
            <MaterialIcons name="sort" size={18} color={colors.primary} />
            <Text style={styles.sortText}>{sortLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* Crear */}
        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CrearEvento')} accessibilityLabel="Crear nuevo evento">
          <MaterialIcons name="add" size={20} color={colors.primary} />
          <Text style={styles.createText}>Crear Nuevo Evento</Text>
        </TouchableOpacity>

        {/* Lista / Vacíos */}
        {(!listOrdenada || listOrdenada.length === 0) && !loading ? (
          <View style={styles.empty}>
            <MaterialIcons name="event-busy" size={64} color={'rgba(255,255,255,0.8)'} />
            <Text style={styles.emptyText}>
              {q ? 'Sin resultados para tu búsqueda' : filter === 'proximos' ? 'No hay eventos próximos' : filter === 'pasados' ? 'No hay eventos pasados' : 'No tienes eventos'}
            </Text>
            <TouchableOpacity style={styles.emptyCta} onPress={() => navigation.navigate('CrearEvento')}>
              <MaterialIcons name="add" size={18} color={colors.primary} />
              <Text style={styles.emptyCtaText}>Crear evento</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={listOrdenada}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={<RefreshControl tintColor="#fff" refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={loading ? <Text style={{ color:'#fff', marginBottom:8 }}>Cargando…</Text> : null}
          />
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CrearEvento')}
        accessibilityLabel="Crear evento"
        accessibilityHint="Abre el formulario para crear un evento"
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: '800', marginTop: 12 },
  headerSub: { color: colors.white, opacity: 0.9 },

  container: { flex: 1, padding: 16 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', paddingHorizontal: 12, borderRadius: 12, marginBottom: 10, height: 44
  },

  filtersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  segment: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 2,
    flexDirection: 'row',
    gap: 2,
  },
  segBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  segBtnActive: { backgroundColor: '#fff' },
  segText: { color: '#fff', fontWeight: '700' },
  segTextActive: { color: colors.primary },

  sortChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)'
  },
  sortText: { color: colors.primary, fontWeight: '800' },

  createBtn: {
    flexDirection: 'row', gap: 8, backgroundColor: colors.white,
    padding: 14, borderRadius: 14, alignItems: 'center', marginBottom: 12
  },
  createText: { color: colors.primary, fontWeight: '700' },

  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: colors.white, marginTop: 8, marginBottom: 12, textAlign: 'center' },
  emptyCta: {
    backgroundColor: colors.white, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', gap: 8
  },
  emptyCtaText: { color: colors.primary, fontWeight: '800' },

  fab: {
    position: 'absolute', right: 20, bottom: 30,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
});
