// src/lib/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clave donde el Auth local guarda al usuario (debe coincidir con AuthProviderLocal.jsx)
 * No se exporta desde el provider para evitar dependencia circular.
 */
const AUTH_KEY = 'eventmaster_auth_user';

/** Lee el usuario actual del almacenamiento y devuelve su id (uid). */
async function getCurrentUid() {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    if (!raw) return 'anon';
    const u = JSON.parse(raw);
    return u?.id || 'anon';
  } catch {
    return 'anon';
  }
}

/** Construye la clave de eventos namespeada por usuario. */
function eventosKey(uid) {
  return `eventos_${uid || 'anon'}`;
}

/** Obtiene todos los eventos del usuario actual. */
export async function getEventos() {
  const uid = await getCurrentUid();
  const raw = await AsyncStorage.getItem(eventosKey(uid));
  return raw ? JSON.parse(raw) : [];
}

/** Guarda toda la lista de eventos del usuario actual. */
export async function saveEventos(list) {
  const uid = await getCurrentUid();
  await AsyncStorage.setItem(eventosKey(uid), JSON.stringify(list || []));
}

/** Agrega un evento a la lista del usuario actual. Devuelve el evento creado (con id). */
export async function addEvento(evt) {
  const list = await getEventos();
  const nextId = list.length ? Math.max(...list.map(e => e.id)) + 1 : 1;
  const nuevo = {
    id: nextId,
    confirmaciones: { confirmados: 0, rechazados: 0, talvez: 0 },
    ...evt,
  };
  const updated = [...list, nuevo];
  await saveEventos(updated);
  return nuevo;
}

/** Elimina un evento por id para el usuario actual. */
export async function deleteEvento(id) {
  const list = await getEventos();
  const updated = list.filter(e => e.id !== id);
  await saveEventos(updated);
}

/** Obtiene un evento por id del usuario actual (o null si no existe). */
export async function getEventoById(id) {
  const list = await getEventos();
  return list.find(e => e.id === id) || null;
}

/** Actualiza parcialmente un evento por id para el usuario actual. Devuelve el evento actualizado o null. */
export async function updateEvento(id, patch) {
  const list = await getEventos();
  const idx = list.findIndex(e => e.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...patch };
  const next = [...list];
  next[idx] = updated;
  await saveEventos(next);
  return updated;
}



// Simulación de AsyncStorage o cualquier otra librería de almacenamiento local
// Reemplaza esto con tu lógica real de almacenamiento si es diferente.


const CHATS_KEY = '@EventMaster:Chats';

// Función auxiliar para obtener todos los chats
async function getChatsStorage() {
  try {
    const data = await AsyncStorage.getItem(CHATS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error al obtener chats:', e);
    return {};
  }
}

// Función auxiliar para guardar todos los chats
async function saveChatsStorage(chats) {
  try {
    await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  } catch (e) {
    console.error('Error al guardar chats:', e);
  }
}

/**
 * Carga los mensajes de chat para un evento específico.
 * @param {string} eventId - El ID del evento.
 * @returns {Array} Lista de mensajes.
 */
export async function getChatMessages(eventId) {
  const allChats = await getChatsStorage();
  // Los mensajes se almacenan en orden de envío, pero retornamos una copia.
  return allChats[eventId] ? [...allChats[eventId]] : [];
}

/**
 * Añade un nuevo mensaje a un evento y lo guarda.
 * @param {string} eventId - El ID del evento.
 * @param {object} message - El objeto del mensaje ({ id, text, userId, timestamp }).
 */
export async function addChatMessage(eventId, message) {
  const allChats = await getChatsStorage();
  const eventMessages = allChats[eventId] || [];

  // Agregar el nuevo mensaje (lo ponemos al final)
  eventMessages.push(message);

  allChats[eventId] = eventMessages;
  await saveChatsStorage(allChats);
}