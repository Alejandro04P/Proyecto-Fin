import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, Platform
} from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { addEvento, getEventos } from '../lib/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapPicker from '../components/MapPicker';
import { Picker } from '@react-native-picker/picker';

const COLOR_OPTIONS = ['#6a11cb', '#ff6b6b', '#4ecdc4', '#ffd166', '#00b09b'];
const TIPO_OPTIONS = [
  'Cumpleaños', 'Boda', 'Fiesta', 'Reunión', 'Conferencia', 'Graduación',
  'Baby Shower', 'Deportivo', 'Concierto', 'Otro'
];

export default function CrearEventoScreen({ navigation }) {
  // Campos
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState(''); // seleccionado del Picker
  const [descripcion, setDescripcion] = useState('');

  // Fecha & Hora
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  // Ubicación
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState(null); // { latitude, longitude, address? }

  // Diseño
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [tema, setTema] = useState('elegante');

  // Errores por campo
  const [errors, setErrors] = useState({});

  // Helpers
  const fmtDate = (d) => (!d ? '' : d.toISOString().slice(0, 10)); // YYYY-MM-DD
  const fmtTime = (d) => (!d ? '' : d.toTimeString().slice(0, 5));   // HH:MM

  const todayMidnight = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  };

  const validateAll = async () => {
    const e = {};

    // Nombre
    if (!nombre || nombre.trim().length < 3) {
      e.nombre = 'El nombre debe tener al menos 3 caracteres.';
    }

    // Tipo
    if (!tipo) {
      e.tipo = 'Selecciona un tipo de evento.';
    } else if (!TIPO_OPTIONS.includes(tipo)) {
      e.tipo = 'Tipo inválido.';
    }

    // Descripción
    if (descripcion?.length > 300) {
      e.descripcion = 'La descripción no puede superar los 300 caracteres.';
    }

    // Fecha
    if (!fecha) {
      e.fecha = 'Selecciona una fecha.';
    } else if (fecha < todayMidnight()) {
      e.fecha = 'La fecha no puede ser anterior a hoy.';
    }

    // Hora
    if (!hora) {
      e.hora = 'Selecciona una hora.';
    } else if (fecha && fmtDate(fecha) === fmtDate(new Date())) {
      // Si el evento es hoy, la hora debe ser futura
      const now = new Date();
      // compón una fecha con la hora seleccionada
      const withTime = new Date();
      withTime.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
      if (withTime <= now) e.hora = 'La hora debe ser posterior a la actual.';
    }

    // Ubicación
    if (!address?.trim()) {
      e.address = 'Ingresa una dirección o usa el mapa.';
    }
    if (!coords?.latitude || !coords?.longitude) {
      e.coords = 'Selecciona un punto en el mapa o usa tu ubicación.';
    }

    // Duplicados (nombre + fecha)
    if (!e.nombre && !e.fecha) {
      const eventos = await getEventos();
      if (eventos.some(ev => ev.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()
        && ev.fecha === fmtDate(fecha))) {
        e.dup = 'Ya existe un evento con ese nombre y fecha.';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isFormBasicOK = useMemo(() =>
    nombre?.trim().length >= 3 &&
    !!tipo &&
    !!fecha &&
    !!hora &&
    !!address?.trim() &&
    !!coords?.latitude &&
    !!coords?.longitude,
    [nombre, tipo, fecha, hora, address, coords]
  );

  const onPickDate = (_, selected) => {
    setShowDate(false);
    if (selected) setFecha(selected);
  };

  const onPickTime = (_, selected) => {
    setShowTime(false);
    if (selected) setHora(selected);
  };

  async function onCrear() {
    const ok = await validateAll();
    if (!ok) {
      // muestra el primer error relevante
      const first = errors.nombre || errors.tipo || errors.descripcion ||
                    errors.fecha || errors.hora || errors.address || errors.coords || errors.dup;
      if (first) Alert.alert('Revisa los datos', first);
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      tipo,
      descripcion: descripcion?.trim() ?? '',
      fecha: fmtDate(fecha),
      hora: fmtTime(hora),
      ubicacion: address.trim(),
      color,
      tema,
      lat: coords?.latitude ?? null,
      lng: coords?.longitude ?? null,
    };

    await addEvento(payload);
    Alert.alert('Listo', 'Evento creado');
    navigation.replace('Gestion');
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nuevo Evento</Text>
          <Text style={styles.headerSub}>Crea una invitación increíble</Text>
        </View>

        {/* Información del evento */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información del Evento</Text>

          <TextInput
            placeholder="Nombre del evento"
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={(t) => { setNombre(t); if (errors.nombre) setErrors({ ...errors, nombre: undefined }); }}
            style={[styles.input, errors.nombre && styles.inputError]}
          />
          {errors.nombre && <Text style={styles.err}>{errors.nombre}</Text>}

          {/* Picker de TIPO */}
          <View style={[styles.pickerBox, errors.tipo && styles.inputError]}>
            <MaterialIcons name="category" size={18} color={colors.primary} />
            <Picker
              selectedValue={tipo}
              onValueChange={(v) => { setTipo(v); if (errors.tipo) setErrors({ ...errors, tipo: undefined }); }}
              style={{ flex: 1 }}
              dropdownIconColor={colors.primary}
            >
              <Picker.Item label="Selecciona un tipo..." value="" />
              {TIPO_OPTIONS.map(t => <Picker.Item key={t} label={t} value={t} />)}
            </Picker>
          </View>
          {errors.tipo && <Text style={styles.err}>{errors.tipo}</Text>}

          <TextInput
            placeholder="Descripción (máx. 300)"
            placeholderTextColor="#999"
            value={descripcion}
            onChangeText={(t) => {
              if (t.length <= 300) setDescripcion(t);
              if (errors.descripcion) setErrors({ ...errors, descripcion: undefined });
            }}
            style={[styles.input, { height: 80 }]}
            multiline
          />
          {errors.descripcion && <Text style={styles.err}>{errors.descripcion}</Text>}
        </View>

        {/* Fecha y Hora */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fecha y Hora</Text>

          <View style={styles.row2}>
            <TouchableOpacity style={[styles.input, styles.btnField, errors.fecha && styles.inputError]} onPress={() => setShowDate(true)}>
              <MaterialIcons name="calendar-today" size={18} color={colors.primary} />
              <Text style={styles.btnFieldText}>{fmtDate(fecha) || 'Seleccionar fecha'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.input, styles.btnField, errors.hora && styles.inputError]} onPress={() => setShowTime(true)}>
              <MaterialIcons name="schedule" size={18} color={colors.primary} />
              <Text style={styles.btnFieldText}>{fmtTime(hora) || 'Seleccionar hora'}</Text>
            </TouchableOpacity>
          </View>
          {errors.fecha && <Text style={styles.err}>{errors.fecha}</Text>}
          {errors.hora && <Text style={styles.err}>{errors.hora}</Text>}

          {showDate && (
            <DateTimePicker
              value={fecha || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onPickDate}
            />
          )}
          {showTime && (
            <DateTimePicker
              value={hora || new Date()}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onPickTime}
            />
          )}
        </View>

        {/* Ubicación */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ubicación</Text>
          <TextInput
            placeholder="Dirección / lugar"
            placeholderTextColor="#999"
            value={address}
            onChangeText={(t) => { setAddress(t); if (errors.address) setErrors({ ...errors, address: undefined }); }}
            style={[styles.input, errors.address && styles.inputError]}
          />
          {errors.address && <Text style={styles.err}>{errors.address}</Text>}

          <MapPicker
            value={coords}
            onChange={(c) => {
              setCoords(c);
              if (c?.address) setAddress(c.address);
              if (errors.coords) setErrors({ ...errors, coords: undefined });
            }}
          />
          {errors.coords && <Text style={[styles.err, { marginTop: 6 }]}>{errors.coords}</Text>}
        </View>

        {/* Diseño */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Diseño</Text>
          <Text style={styles.label}>Color principal</Text>
          <View style={styles.colorsRow}>
            {COLOR_OPTIONS.map(c => (
              <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorDot, { backgroundColor: c, borderWidth: color === c ? 3 : 0 }]} />
            ))}
          </View>
          <Text style={styles.label}>Tema</Text>
          <View style={styles.themesRow}>
            {['elegante', 'fiesta', 'natural', 'moderno'].map(t => (
              <TouchableOpacity key={t} onPress={() => setTema(t)} style={[styles.themePill, tema === t && { borderColor: colors.primary }]}>
                <Text style={[styles.themeText, tema === t && { color: colors.primary }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>{nombre || 'Mi Evento'}</Text>
          <Text style={styles.previewLine}>📅 {fmtDate(fecha) || 'Fecha no especificada'}</Text>
          <Text style={styles.previewLine}>⏰ {fmtTime(hora) || 'Hora no especificada'}</Text>
          <Text style={styles.previewLine}>📍 {address || 'Ubicación no especificada'}</Text>
          <Text style={styles.previewDesc}>{descripcion || 'Completa el formulario para ver la descripción.'}</Text>
        </View>

        {/* Crear */}
        <View style={{ paddingHorizontal: 16 }}>
          <TouchableOpacity
            style={[styles.primaryBtn, !isFormBasicOK && { opacity: 0.5 }]}
            disabled={!isFormBasicOK}
            onPress={onCrear}
          >
            <MaterialIcons name="add" size={20} color={colors.white} />
            <Text style={styles.primaryBtnText}>Crear Evento</Text>
          </TouchableOpacity>
          {errors.dup && <Text style={[styles.err, { textAlign: 'center', marginTop: 6 }]}>{errors.dup}</Text>}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: '800', marginTop: 12 },
  headerSub: { color: colors.white, opacity: 0.9 },

  card: { backgroundColor: colors.white, marginHorizontal: 16, marginVertical: 8, borderRadius: 16, padding: 16 },
  cardTitle: { fontWeight: '700', fontSize: 16, marginBottom: 8, color: colors.textDark },

  input: { backgroundColor: '#f0f0f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 8, color: '#222' },
  inputError: { borderWidth: 1.5, borderColor: '#f66' },
  err: { color: '#b00020', fontSize: 12, marginBottom: 6 },

  row2: { flexDirection: 'row', gap: 8 },
  btnField: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#eef0ff' },
  btnFieldText: { color: colors.textDark, fontWeight: '600' },

  pickerBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#eef0ff', borderRadius: 12, paddingHorizontal: 8, marginBottom: 8
  },

  label: { color: colors.textDark, marginTop: 6, marginBottom: 6, fontWeight: '600' },
  colorsRow: { flexDirection: 'row', gap: 10 },
  colorDot: { width: 34, height: 34, borderRadius: 17, borderColor: colors.textDark },
  themesRow: { flexDirection: 'row', gap: 8 },
  themePill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 2, borderColor: '#ddd', backgroundColor: '#fff' },
  themeText: { textTransform: 'capitalize', color: colors.textDark, fontWeight: '600' },

  preview: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  previewTitle: { fontSize: 18, fontWeight: '800', backgroundColor: 'transparent', color: colors.primary },
  previewLine: { marginTop: 6, color: colors.textDark },
  previewDesc: { marginTop: 10, color: colors.muted },

  primaryBtn: { marginTop: 8, marginBottom: 20, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  primaryBtnText: { color: colors.white, fontWeight: '800' },
});
