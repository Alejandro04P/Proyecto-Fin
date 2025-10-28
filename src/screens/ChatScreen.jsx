import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { addChatMessage, getChatMessages } from '../lib/storage';
// Usaremos el AuthProvider para obtener el usuario actual
import { useAuth } from '../providers/AuthProviderLocal'; 

// --- Componente de un Mensaje ---
const ChatBubble = ({ message, isCurrentUser }) => (
  <View style={[
    styles.bubble,
    isCurrentUser ? styles.myBubble : styles.otherBubble,
  ]}>
    <Text style={isCurrentUser ? styles.myText : styles.otherText}>
      {message.text}
    </Text>
    {/* En un chat real, también mostrarías el nombre del usuario y la hora */}
  </View>
);
// ---------------------------------

export default function ChatScreen({ navigation, route }) {
  const { eventId, eventName } = route.params;
  const { user } = useAuth(); // Obtenemos el usuario logueado
  const currentUserId = user?.id || 'ANFITRION_LOCAL'; // Usamos un ID por defecto si no hay usuario
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

  const loadMessages = useCallback(async () => {
    const msgs = await getChatMessages(eventId);
    setMessages(msgs);
  }, [eventId]);

  useEffect(() => {
    loadMessages();
    // Aquí, en un escenario real, implementaríamos la suscripción a cambios (WebSocket/Firestore)
  }, [loadMessages]);

  const handleSend = async () => {
    if (newMessage.trim() === '') return;

    const messagePayload = {
      id: Date.now(),
      text: newMessage.trim(),
      userId: currentUserId,
      timestamp: new Date().toISOString(),
    };

    try {
      // 1. Añadir al almacenamiento local
      await addChatMessage(eventId, messagePayload);
      
      // 2. Actualizar el estado local
      setMessages(prev => [...prev, messagePayload]);
      setNewMessage('');
      
      // Asegurar que el scroll baje para ver el nuevo mensaje
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje localmente.');
    }
  };

  const renderMessage = ({ item }) => (
    <ChatBubble 
      message={item} 
      isCurrentUser={item.userId === currentUserId} 
    />
  );
  
  // Scrollear al final al cargar mensajes por primera vez
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  return (
    <GradientBackground>
      <View style={{ flex: 1 }}>
        {/* Header del Chat */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Chat: {eventName}</Text>
        </View>

        {/* Lista de Mensajes */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContainer}
        />

        {/* Input de Mensaje */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Ajuste para iOS
          style={styles.inputContainerWrapper}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#999"
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              enablesReturnKeyAutomatically
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!newMessage.trim()}>
              <MaterialIcons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: '800', flexShrink: 1 },

  listContainer: { paddingHorizontal: 16, paddingVertical: 10, flexGrow: 1 },
  
  // Estilos de Burbujas
  bubble: { 
    maxWidth: '80%', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 16, 
    marginVertical: 4, 
    elevation: 1 
  },
  myBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: colors.primary, // Color primario para mis mensajes
    borderBottomRightRadius: 2,
  },
  otherBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: colors.white, // Blanco para mensajes de otros
    borderBottomLeftRadius: 2,
  },
  myText: { color: colors.white },
  otherText: { color: colors.textDark },

  // Estilos del Input
  inputContainerWrapper: { 
    paddingHorizontal: 16, 
    paddingBottom: Platform.OS === 'ios' ? 30 : 10, // Padding extra para iOS por el notch
    backgroundColor: 'transparent'
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.white, 
    borderRadius: 24, 
    paddingHorizontal: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    elevation: 3 
  },
  input: { 
    flex: 1, 
    height: 48, 
    color: colors.textDark, 
    paddingHorizontal: 10, 
    fontSize: 16 
  },
  sendButton: { 
    backgroundColor: colors.primary, 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginLeft: 8 
  },
});