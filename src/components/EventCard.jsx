import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';

export default function EventCard({ event }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: event.color || colors.primary }]} />
        <Text style={styles.title}>{event.nombre}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{event.tipo || 'Evento'}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <MaterialIcons name="calendar-today" size={18} color={colors.primary} />
        <Text style={styles.rowText}>{event.fecha || 'Fecha'}</Text>
      </View>
      <View style={styles.row}>
        <MaterialIcons name="schedule" size={18} color={colors.primary} />
        <Text style={styles.rowText}>{event.hora || 'Hora'}</Text>
      </View>
      <View style={styles.row}>
        <MaterialIcons name="place" size={18} color={colors.primary} />
        <Text style={styles.rowText} numberOfLines={1}>{event.ubicacion || 'Ubicación'}</Text>
      </View>
      <View style={styles.confirmRow}>
        <Text style={[styles.chip, { backgroundColor: 'rgba(0,176,155,0.2)' }]}>
          ✅ {event?.confirmaciones?.confirmados || 0}
        </Text>
        <Text style={[styles.chip, { backgroundColor: 'rgba(231,57,70,0.2)' }]}>
          ❌ {event?.confirmaciones?.rechazados || 0}
        </Text>
        <Text style={[styles.chip, { backgroundColor: 'rgba(255,209,102,0.4)' }]}>
          ❓ {event?.confirmaciones?.talvez || 0}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 16, height: 16, borderRadius: 8, marginRight: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.textDark },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(106,17,203,0.15)' },
  badgeText: { color: colors.primary, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  rowText: { marginLeft: 6, color: colors.textDark },
  confirmRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, fontSize: 12, color: colors.textDark },
});
