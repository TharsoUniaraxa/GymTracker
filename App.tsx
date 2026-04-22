import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CriarFichaScreen from './src/screens/CriarFichaScreen.tsx';
import TreinoAtivoScreen from './src/screens/TreinoAtivoScreen.tsx';
import ResumoTreinoScreen from './src/screens/ResumoTreinoScreen';
import ConfigScreen from './src/screens/ConfigScreen';
import { RegistroHistorico } from './src/types';

export type RootStackParamList = {
  Login:        undefined;
  Home:         { usuarioId: number; usuarioNome: string };
  CriarFicha:   { usuarioId: number };
  TreinoAtivo:  { usuarioId: number; fichaId: number; fichaNome: string; exercicioIds: number[] };
  ResumoTreino: { registro: RegistroHistorico };
  Config:       { usuarioId: number };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login"        component={LoginScreen}       />
        <Stack.Screen name="Home"         component={HomeScreen}        />
        <Stack.Screen name="CriarFicha"   component={CriarFichaScreen}  />
        <Stack.Screen name="TreinoAtivo"  component={TreinoAtivoScreen} />
        <Stack.Screen name="ResumoTreino" component={ResumoTreinoScreen}/>
        <Stack.Screen name="Config"       component={ConfigScreen}      />
      </Stack.Navigator>
    </NavigationContainer>
  );
}