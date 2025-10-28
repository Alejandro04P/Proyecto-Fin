import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { getEventoById, getEventos, updateEvento } from '../lib/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapPicker from '../components/MapPicker';
import { Picker } from '@react-native-picker/picker';
import TimeScrollPicker from '../components/TimeScrollPicker'; // ⏰ rueda vertical

const COLOR_OPTIONS = ['#6a11cb', '#ff6b6b', '#4ecdc4', '#ffd166', '#00b09b'];
const TIPO_OPTIONS = ['Cumpleaños','Boda','Fiesta','Reunión','Conferencia','Graduación','Baby Shower','Deportivo','Concierto','Otro'];

export default function EditarEventoScreen({ navigation, route }) {
  const { id } = route.params;

  // Campos
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [otroTipo, setOtroTipo] = useState(''); // texto libre si eligen "Otro"
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

  // Helpers (local)
  const fmtDate = (d) => (!d ? '' : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
  const fmtTime = (d) => (!d ? '' : `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`);

  const todayMidnight = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  };

  useEffect(() => {
    (async () => {
      const e = await getEventoById(id);
      if (!e) { navigation.goBack(); return; }

      setNombre(e.nombre || '');

      // tipo / otroTipo
      if (e.tipo && TIPO_OPTIONS.includes(e.tipo)) {
        setTipo(e.tipo);
      } else if (e.tipo) {
        setTipo('Otro');
        setOtroTipo(e.tipo); // si antes se guardó un tipo libre
      } else {
        setTipo('');
      }

      setDescripcion(e.descripcion || '');

      // reconstruir Date (normaliza fecha a mediodía)
      if (e.fecha) {
        const [Y, M, D] = e.fecha.split('-').map(Number);
        const d = new Date(Y, (M || 1) - 1, D || 1);
        d.setHours(12, 0, 0, 0);
        setFecha(d);
      }
      if (e.hora) {
        const [hh, mm] = e.hora.split(':').map(Number);
        const t = new Date();
        t.setHours(hh || 0, mm || 0, 0, 0);
        setHora(t);
      }

      setAddress(e.ubicacion || '');
      if (Number.isFinite(e.lat) && Number.isFinite(e.lng)) setCoords({ latitude: e.lat, longitude: e.lng });

      setColor(e.color || COLOR_OPTIONS[0]);
      setTema(e.tema || 'elegante');
    })();
  }, [id, navigation]);

  const isFormOK = useMemo(() =>
    nombre?.trim().length >= 3 &&
    !!tipo &&
    (tipo !== 'Otro' ? true : otroTipo.trim().length >= 3) &&
    !!fecha && !!hora &&
    !!address?.trim() &&
    !!coords?.latitude && !!coords?.longitude
  , [nombre,tipo,otroTipo,fecha,hora,address,coords]);

  const onPickDate = (_, selected) => {
    setShowDate(false);
    if (selected) {
      const local = new Date(selected);
      local.setHours(12, 0, 0, 0); // evita que se corra un día
      setFecha(local);
      if (errors.fecha) setErrors({ ...errors, fecha: undefined });
    }
  };

  // (Dejamos onPickTime por compatibilidad si quieres volver a DateTimePicker)
  const onPickTime = (_, selected) => {
    setShowTime(false);
    if (selected) setHora(selected);
  };

  async function onGuardar() {
    // Validaciones alineadas con "Crear"
    const e = {};

    if (!nombre || nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres.';
    if (!tipo) e.tipo = 'Selecciona un tipo.';
    else if (!TIPO_OPTIONS.includes(tipo) && tipo !== 'Otro') e.tipo = 'Tipo inválido.';
    if (tipo === 'Otro' && (!otroTipo || otroTipo.trim().length < 3)) e.otroTipo = 'Escribe el tipo de evento.';

    if (!fecha) e.fecha = 'Selecciona una fecha.';
    else if (fecha < todayMidnight()) e.fecha = 'La fecha no puede ser anterior a hoy.';

    if (!hora) e.hora = 'Selecciona una hora.';
    else if (fecha && fmtDate(fecha) === fmtDate(new Date())) {
      const now = new Date();
      const withTime = new Date();
      withTime.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
      if (withTime <= now) e.hora = 'La hora debe ser posterior a la actual.';
    }

    if (!address?.trim()) e.address = 'Ingresa una dirección o usa el mapa.';
    if (!coords?.latitude || !coords?.longitude) e.coords = 'Selecciona un punto en el mapa o usa tu ubicación.';

    // Duplicados (excepto el mismo id)
    const eventos = await getEventos();
    if (!e.nombre && !e.fecha) {
      if (eventos.some(ev => ev.id !== id &&
        ev.nombre.trim().toLowerCase() === nombre.trim().toLowerCase() &&
        ev.fecha === fmtDate(fecha))) {
        e.dup = 'Ya existe un evento con ese nombre y fecha.';
      }
    }

    setErrors(e);
    if (Object.keys(e).length) {
      const first = e.nombre || e.tipo || e.otroTipo || e.fecha || e.hora || e.address || e.coords || e.dup;
      if (first) Alert.alert('Revisa los datos', first);
      return;
    }

    const tipoFinal = (tipo === 'Otro') ? otroTipo.trim() : tipo;

    const payload = {
      nombre: nombre.trim(),
      tipo: tipoFinal,
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

          <TextInput
            placeholder="Nombre"
            value={nombre}
            onChangeText={(t) => { setNombre(t); if (errors.nombre) setErrors({ ...errors, nombre: undefined }); }}
            style={[styles.input, errors?.nombre && styles.inputError]}
          />

          <View style={[styles.pickerBox, errors?.tipo && styles.inputError]}>
            <MaterialIcons name="category" size={18} color={colors.primary} />
            <Picker
              selectedValue={tipo}
              onValueChange={(v) => { setTipo(v); if (v !== 'Otro') setOtroTipo(''); if (errors.tipo) setErrors({ ...errors, tipo: undefined }); }}
              style={{ flex:1 }}
              dropdownIconColor={colors.primary}
            >
              <Picker.Item label="Selecciona un tipo..." value="" />
              {TIPO_OPTIONS.map(t => <Picker.Item key={t} label={t} value={t} />)}
            </Picker>
          </View>
          {errors?.tipo && <Text style={styles.err}>{errors.tipo}</Text>}

          {/* Campo libre cuando es "Otro" */}
          {tipo === 'Otro' && (
            <>
              <TextInput
                placeholder="Escribe el tipo de evento"
                value={otroTipo}
                onChangeText={(t) => { setOtroTipo(t); if (errors.otroTipo) setErrors({ ...errors, otroTipo: undefined }); }}
                style={[styles.input, errors?.otroTipo && styles.inputError]}
              />
              {errors?.otroTipo && <Text style={styles.err}>{errors.otroTipo}</Text>}
            </>
          )}

          <TextInput
            placeholder="Descripción"
            value={descripcion}
            onChangeText={(t) => { setDescripcion(t); if (errors.descripcion) setErrors({ ...errors, descripcion: undefined }); }}
            style={[styles.input, { height:80 }]}
            multiline
          />
          {errors?.descripcion && <Text style={styles.err}>{errors.descripcion}</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fecha y Hora</Text>
          <View style={styles.row2}>
            <TouchableOpacity style={[styles.input, styles.btnField, errors?.fecha && styles.inputError]} onPress={() => setShowDate(true)}>
              <MaterialIcons name="calendar-today" size={18} color={colors.primary} />
              <Text style={styles.btnFieldText}>{fmtDate(fecha) || 'Seleccionar fecha'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.input, styles.btnField, errors?.hora && styles.inputError]} onPress={() => setShowTime(true)}>
              <MaterialIcons name="schedule" size={18} color={colors.primary} />
              <Text style={styles.btnFieldText}>{fmtTime(hora) || 'Seleccionar hora'}</Text>
            </TouchableOpacity>
          </View>

          {errors?.fecha && <Text style={styles.err}>{errors.fecha}</Text>}
          {errors?.hora && <Text style={styles.err}>{errors.hora}</Text>}

          {showDate && (
            <DateTimePicker
              value={fecha || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onPickDate}
              minimumDate={todayMidnight()} // 🔒 bloquea días previos
            />
          )}

          {/* ⏰ Rueda de hora */}
          <TimeScrollPicker
            visible={showTime}
            initialDate={hora || new Date()}
            onCancel={() => setShowTime(false)}
            onConfirm={(d) => {
              setHora(d);
              if (errors.hora) setErrors({ ...errors, hora: undefined });
              setShowTime(false);
            }}
          />

          {/* Si quieres volver a usar el DateTimePicker de hora, descomenta:
          {showTime && (
            <DateTimePicker
              value={hora || new Date()}
              mode="time"
              is24Hour
              onChange={onPickTime}
            />
          )}
          */}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ubicación</Text>
          <TextInput
            placeholder="Dirección"
            value={address}
            onChangeText={(t) => { setAddress(t); if (errors.address) setErrors({ ...errors, address: undefined }); }}
            style={[styles.input, errors?.address && styles.inputError]}
          />
          {errors?.address && <Text style={styles.err}>{errors.address}</Text>}

          <MapPicker
            value={coords}
            onChange={(c) => { setCoords(c); if (c?.address) setAddress(c.address); if (errors.coords) setErrors({ ...errors, coords: undefined }); }}
          />
          {errors?.coords && <Text style={styles.err}>{errors.coords}</Text>}
        </View>

        <View style={{ paddingHorizontal:16 }}>
          <TouchableOpacity style={[styles.primaryBtn, !isFormOK && { opacity: 0.5 }]} disabled={!isFormOK} onPress={onGuardar}>
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
  inputError: { borderWidth: 1.5, borderColor: '#f66' },
  row2: { flexDirection:'row', gap:8 },
  btnField: { flex:1, flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#eef0ff' },
  btnFieldText: { color:'#222', fontWeight:'600' },
  pickerBox: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#eef0ff', borderRadius:12, paddingHorizontal:8, marginBottom:8 },

  primaryBtn: { marginTop:8, marginBottom:20, backgroundColor:colors.primary, borderRadius:14, paddingVertical:14, alignItems:'center', flexDirection:'row', justifyContent:'center', gap:8 },
  primaryBtnText: { color:'#fff', fontWeight:'800' },
  err: { color: '#b00020', fontSize: 12, marginBottom: 6 },
});
