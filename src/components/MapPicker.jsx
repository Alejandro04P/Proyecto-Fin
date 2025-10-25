import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const ECUADOR_REGION = {
  latitude: -1.831239,        // aprox centro de Ecuador
  longitude: -78.183406,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

export default function MapPicker({ value, onChange }) {
  const [region, setRegion] = useState(ECUADOR_REGION);
  const [marker, setMarker] = useState(value || { latitude: ECUADOR_REGION.latitude, longitude: ECUADOR_REGION.longitude });
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  // Si llega un valor desde fuera, colócalo
  useEffect(() => {
    if (value?.latitude && value?.longitude) {
      setMarker(value);
      setRegion(r => ({ ...r, latitude: value.latitude, longitude: value.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }));
    }
  }, [value]);

  const reverse = async (coords) => {
    try {
      const res = await Location.reverseGeocodeAsync(coords);
      const addr = res?.[0];
      const text = addr
        ? `${addr.name ?? ''} ${addr.street ?? ''}, ${addr.subregion ?? ''}, ${addr.region ?? ''}`.trim()
        : '';
      return text;
    } catch {
      return '';
    }
  };

  const pickHere = async (coords) => {
    setMarker(coords);
    const address = await reverse(coords);
    onChange?.({ ...coords, address });
  };

  const useMyLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setRegion(r => ({ ...r, ...coords, latitudeDelta: 0.02, longitudeDelta: 0.02 }));
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 600);
      await pickHere(coords);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        mapType={Platform.OS === 'android' ? 'standard' : 'standard'}
      >
        <Marker
          coordinate={marker}
          draggable
          onDragEnd={(e) => pickHere(e.nativeEvent.coordinate)}
        />
      </MapView>

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.myBtn} onPress={useMyLocation}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="my-location" size={16} color="#fff" />
              <Text style={styles.myText}>Usar mi ubicación</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <MaterialIcons name="place" size={18} color="#fff" />
        <Text style={styles.footerText}>
          Lat: {marker.latitude.toFixed(5)}  Lng: {marker.longitude.toFixed(5)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { height: 220, borderRadius: 16, overflow: 'hidden' },
  map: { width: '100%', height: '100%' },
  topBar: { position: 'absolute', top: 10, left: 10, right: 10, alignItems: 'flex-end' },
  myBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 14, elevation: 3
  },
  myText: { color: '#fff', fontWeight: '700' },
  footer: {
    position: 'absolute', bottom: 10, left: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6
  },
  footerText: { color: '#fff', fontWeight: '600' },
});
