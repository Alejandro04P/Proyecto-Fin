// src/screens/EditarEventoScreen.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { getEventoById, getEventos, updateEvento } from '../lib/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapPicker from '../components/MapPicker';
import { Picker } from '@react-native-picker/picker';

const COLOR_OPTIONS = ['#6a11cb', '#ff6b6b', '#4ecdc4', '#ffd166', '#00b09b'];
const TIPO_OPTIONS = ['Cumpleaños','Boda','Fiesta','Reunión','Conferencia','Graduación','Baby Shower','Deportivo','Concierto','Otro'];

export default function EditarEventoScreen({ navigation, route }) {
  const { id } = route.params;

  // Campos
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null);
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState(null);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [tema, setTema] = useState('elegante');

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [errors, setErrors] = useState({});

  const fmtDate = (d) => (!d ? '' : d.toISOString().slice(0,10));
  const fmtTime = (d) => (!d ? '' : d.toTimeString().slice(0,5));

  useEffect(() => {
    (async () => {
      const e = await getEventoById(id);
      if (!e) { navigation.goBack(); return; }
      setNombre(e.nombre || '');
      setTipo(e.tipo || '');
      setDescripcion(e.descripcion || '');
      // reconstruir objetos Date
      if (e.fecha) {
        const parts = e.fecha.split('-'); // YYYY-MM-DD
        setFecha(new Date(parts[0], parts[1]-1, parts[2]));
      }
      if (e.hora) {
        const [hh, mm] = e.hora.split(':').map(Number);
        const d = new Date(); d.setHours(hh, mm, 0, 0); setHora(d);
      }
      setAddress(e.ubicacion || '');
      if (Number.isFinite(e.lat) && Number.isFinite(e.lng)) setCoords({ latitude: e.lat, longitude: e.lng });
      setColor(e.color || COLOR_OPTIONS[0]);
      setTema(e.tema || 'elegante');
    })();
  }, [id]);

  const isFormOK = useMemo(() =>
    nombre?.trim().length >= 3 && !!tipo && !!fecha && !!hora && !!address?.trim() &&
    !!coords?.latitude && !!coords?.longitude, [nombre,tipo,fecha,hora,address,coords]);

  const onPickDate = (_, selected) => { setShowDate(false); if (selected) setFecha(selected); };
  const onPickTime = (_, selected) => { setShowTime(false); if (selected) setHora(selected); };

  async function onGuardar() {
    // Duplicados (excepto el mismo id)
    const eventos = await getEventos();
    if (eventos.some(ev => ev.id !== id &&
      ev.nombre.trim().toLowerCase() === nombre.trim().toLowerCase() &&
      ev.fecha === fmtDate(fecha))) {
      Alert.alert('Duplicado', 'Ya existe un evento con ese nombre y fecha.');
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      tipo,
      descripcion: descripcion?.trim() ?? '',
      fecha: fmtDate(fecha),
      hora: fmtTime(hora),
      ubicacion: address.trim(),
      color, tema,
      lat: coords?.latitude ?? null,
      lng: coords?.longitude ?? null,
    };
    await updateEvento(id, payload);
    Alert.alert('Guardado', 'Cambios actualizados');
    navigation.replace('Detalle', { id });
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Evento</Text>
          <Text style={styles.headerSub}>Actualiza la información</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información</Text>
          <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
          <View style={styles.pickerBox}>
            <MaterialIcons name="category" size={18} color={colors.primary} />
            <Picker selectedValue={tipo} onValueChange={setTipo} style={{ flex:1 }} dropdownIconColor={colors.primary}>
              <Picker.Item label="Selecciona un tipo..." value="" />
              {TIPO_OPTIONS.map(t => <Picker.Item key={t} label={t} value={t} />)}
            </Picker>
          </View>
          <TextInput placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} style={[styles.input, { height:80 }]} multiline />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fecha y Hora</Text>
          <View style={styles.row2}>
            <TouchableOpacity style={[styles.input, styles.btnField]} onPress={() => setShowDate(true)}>
              <MaterialIcons name="calendar-today" size={18} color={colors.primary} />
              <Text style={styles.btnFieldText}>{fmtDate(fecha) || 'Seleccionar fecha'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.input, styles.btnField]} onPress={() => setShowTime(true)}>
              <MaterialIcons name="schedule" size={18} color={colors.primary} />
              <Text style={styles.btnFieldText}>{fmtTime(hora) || 'Seleccionar hora'}</Text>
            </TouchableOpacity>
          </View>
          {showDate && <DateTimePicker value={fecha || new Date()} mode="date" onChange={onPickDate} />}
          {showTime && <DateTimePicker value={hora || new Date()} mode="time" is24Hour onChange={onPickTime} />}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ubicación</Text>
          <TextInput placeholder="Dirección" value={address} onChangeText={setAddress} style={styles.input} />
          <MapPicker value={coords} onChange={(c) => { setCoords(c); if (c?.address) setAddress(c.address); }} />
        </View>

        <View style={{ paddingHorizontal:16 }}>
          <TouchableOpacity style={styles.primaryBtn} disabled={!isFormOK} onPress={onGuardar}>
            <MaterialIcons name="save" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Guardar cambios</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop:60, paddingHorizontal:16, paddingBottom:12 },
  backBtn: { width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.2)' },
  headerTitle: { color:'#fff', fontSize:22, fontWeight:'800', marginTop:12 },
  headerSub: { color:'#fff', opacity:0.9 },

  card: { backgroundColor:'#fff', marginHorizontal:16, marginVertical:8, borderRadius:16, padding:16 },
  cardTitle: { fontWeight:'700', fontSize:16, marginBottom:8, color:'#222' },

  input: { backgroundColor:'#f0f0f0', borderRadius:12, paddingHorizontal:12, paddingVertical:12, marginBottom:8, color:'#222' },
  row2: { flexDirection:'row', gap:8 },
  btnField: { flex:1, flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#eef0ff' },
  btnFieldText: { color:'#222', fontWeight:'600' },
  pickerBox: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#eef0ff', borderRadius:12, paddingHorizontal:8, marginBottom:8 },

  primaryBtn: { marginTop:8, marginBottom:20, backgroundColor:colors.primary, borderRadius:14, paddingVertical:14, alignItems:'center', flexDirection:'row', justifyContent:'center', gap:8 },
  primaryBtnText: { color:'#fff', fontWeight:'800' },
});
