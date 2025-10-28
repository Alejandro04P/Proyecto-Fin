import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import AuthProviderLocal, { useAuth } from './src/providers/AuthProviderLocal';

// Auth
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
// (Opcional) Una RegisterScreen que diga “registro deshabilitado”.

// App
import HomeScreen from './src/screens/HomeScreen';
import GestionEventosScreen from './src/screens/GestionEventosScreen';
import CrearEventoScreen from './src/screens/CrearEventoScreen';
import DetalleEventoScreen from './src/screens/DetalleEventoScreen';
import EditarEventoScreen from './src/screens/EditarEventoScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen}/>
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Gestion" component={GestionEventosScreen} />
      <Stack.Screen name="CrearEvento" component={CrearEventoScreen} />
      <Stack.Screen name="Detalle" component={DetalleEventoScreen} />
      <Stack.Screen name="EditarEvento" component={EditarEventoScreen} />
      <Stack.Screen name="Perfil" component={ProfileScreen} options={{ headerShown: true, title: 'Mi Perfil' }} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  return user ? <AppStack /> : <AuthStack />;
}

export default function App() {
  return (
    <>
      <AuthProviderLocal>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProviderLocal>
      <Toast />
    </>
  );
}
