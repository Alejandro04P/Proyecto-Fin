import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileMenu({
  visible,
  onClose,
  anchor = { x: 16, y: 80, width: 40, height: 40 },
  onOpenProfile,   // <- callback correcto
  onSignOut,
}) {
  const menuWidth = 220;
  const top = Math.max(10, (anchor.y || 0) + (anchor.height || 0) + 8);
  const left = Math.max(10, (anchor.x || 0) - menuWidth + (anchor.width || 0));

  const Item = ({ icon, label, onPress }) => (
    <TouchableOpacity
      onPress={() => {
        onClose?.();
        onPress?.();
      }}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14 }}
    >
      <MaterialIcons name={icon} size={20} style={{ marginRight: 12 }} />
      <Text style={{ fontSize: 16 }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }}>
          <View
            style={{
              position: 'absolute',
              top, left,
              width: menuWidth,
              backgroundColor: '#fff',
              borderRadius: 12,
              paddingVertical: 6,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 8,
            }}
          >
            <Item icon="person" label="Ver perfil" onPress={onOpenProfile} />
            {/* Agrega más opciones si quieres */}
            <Item icon="logout" label="Cerrar sesión" onPress={onSignOut} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
