import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USERS } from '../config/users';

const KEY = 'eventmaster_auth_user';
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProviderLocal({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setUser(JSON.parse(raw));
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  async function signIn(email, password) {
    // 1. **VALIDACIÓN SIMPLE (Solo campos vacíos)**
    if (email.trim() === "" || password.trim() === "") {
        const err = new Error('Los campos no pueden estar vacíos.');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }
    
    // 2. EXTRAER DATO ÚTIL
    const usernameFromEmail = email.split('@')[0];
    
    // 3. CREAR OBJETO SIMPLIFICADO
    // Creamos un objeto simple solo con el nombre y el email para que HomeScreen no falle
    const userToStore = {
        name: usernameFromEmail, // Usamos el username como nombre principal
        email: email,
        isSimpleLogin: true,
    };
    
    // 🛑 CLAVE: Establecer el estado con el objeto
    setUser(userToStore); 
    
    return userToStore;
}

  async function signOut() {
    await AsyncStorage.removeItem(KEY);
    setUser(null);
  }

  // registro deshabilitado en “usuarios quemados”
  async function signUp() {
    const err = new Error('Registro deshabilitado en modo demo');
    err.code = 'SIGNUP_DISABLED';
    throw err;
  }

  const value = useMemo(() => ({
    user,
    initializing,
    signIn,
    signOut,
    signUp, // presente, pero lanza error a propósito
  }), [user, initializing]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
