import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../providers/AuthProviderLocal';

export default function ProfileScreen() {
  const { user } = useAuth();
  const initial = (user?.name || user?.email || 'U')[0]?.toUpperCase?.() || 'U';

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
      <Text style={styles.email}>{user?.email || 'sin-correo@ejemplo.com'}</Text>
      {/* Aquí luego puedes añadir: editar perfil, cambiar contraseña, etc. */}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, alignItems:'center', justifyContent:'center', padding:24, backgroundColor:'#fff' },
  avatar:{ width:110, height:110, borderRadius:55, backgroundColor:'#7C4DFF', alignItems:'center', justifyContent:'center' },
  avatarText:{ color:'#fff', fontSize:42, fontWeight:'800' },
  name:{ marginTop:16, fontSize:22, fontWeight:'700' },
  email:{ marginTop:6, fontSize:14, color:'#666' },
});
