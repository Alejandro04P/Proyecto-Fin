import React, { useState } from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function TimeScrollPicker({ visible, onCancel, onConfirm, initialDate }) {
  const init = initialDate ? new Date(initialDate) : new Date();

  const [hour, setHour] = useState(init.getHours() % 12 || 12);
  const [minute, setMinute] = useState(init.getMinutes());
  const [period, setPeriod] = useState(init.getHours() >= 12 ? 'PM' : 'AM');

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  const handleConfirm = () => {
    let h = hour;
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const selected = new Date(init);
    selected.setHours(h);
    selected.setMinutes(minute);
    selected.setSeconds(0);
    onConfirm(selected);
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Seleccionar hora</Text>
          <View style={styles.scrollContainer}>
            {/* Horas */}
            <FlatList
              data={hours}
              keyExtractor={(item) => item.toString()}
              showsVerticalScrollIndicator={false}
              style={styles.list}
              getItemLayout={(_, index) => ({ length: 50, offset: 50 * index, index })}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setHour(item)}>
                  <Text style={[styles.item, hour === item && styles.selectedItem]}>
                    {item.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              )}
            />
            {/* Minutos */}
            <FlatList
              data={minutes}
              keyExtractor={(item) => item.toString()}
              showsVerticalScrollIndicator={false}
              style={styles.list}
              getItemLayout={(_, index) => ({ length: 50, offset: 50 * index, index })}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setMinute(item)}>
                  <Text style={[styles.item, minute === item && styles.selectedItem]}>
                    {item.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              )}
            />
            {/* AM/PM */}
            <FlatList
              data={periods}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              style={[styles.list, { width: 60 }]}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setPeriod(item)}>
                  <Text style={[styles.item, period === item && styles.selectedItem]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.okBtn} onPress={handleConfirm}>
              <Text style={styles.okText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '85%',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
    color: colors.textDark || '#222',
    marginBottom: 12,
  },
  scrollContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    height: 150,
    width: 70,
    marginHorizontal: 10,
  },
  item: {
    fontSize: 20,
    textAlign: 'center',
    paddingVertical: 6,
    color: '#666',
  },
  selectedItem: {
    color: colors.primary || '#6a11cb',
    fontWeight: '700',
    fontSize: 22,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
  cancelBtn: {
    backgroundColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  okBtn: {
    backgroundColor: colors.primary || '#6a11cb',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  cancelText: { color: '#333', fontWeight: '600' },
  okText: { color: '#fff', fontWeight: '700' },
});
