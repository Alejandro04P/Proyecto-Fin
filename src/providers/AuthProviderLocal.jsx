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
    var found = true;
    if (email.trim() === "" && password.trim() === "") {
      found = false
    } 
    if (!found) {
      const err = new Error('Los campos no pueden estar vacios');
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }
    await AsyncStorage.setItem(KEY, JSON.stringify(found));
    setUser(found);
    return found;
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
