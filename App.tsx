import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack';
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import axios from 'axios';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import LoginScreen from './src/screens/LoginScreen';
import InicioScreen from './src/screens/InicioScreen';
import MenuScreen from './src/screens/MenuScreen';
import RegistroLecturasScreen from './src/screens/RegistroLecturasScreen';
import PesosScreen from './src/screens/PesosScreen';
import OpcionesProcesoScreen from './src/screens/OpcionesProcesoScreen';
import LIDScreen from './src/screens/LIDScreen';
import TopScreen from './src/screens/TopScreen';
import PesosTapaScreen from './src/screens/PesosTapaScreen';
import PesosCuerpoScreen from './src/screens/PesosCuerpoScreen';
import PesosBaseScreen from './src/screens/PesosBaseScreen';
import BottomScreen from './src/screens/BottomScreen';
import MasterScreen from './src/screens/MasterScreen';
import FinalCheckScreen from './src/screens/FinalCheckScreen';
import EvidenciasScreen from './src/screens/EvidenciasScreen';
import ReporteScreen from './src/screens/ReporteScreen';

type RootStackParamList = {
  Login: undefined;
  Inicio: undefined;
  Menu: undefined;
  Pesos: undefined;
  RegistroLecturas: undefined;
  BottomScreen: undefined;
  EvidenciasScreen: undefined;
  FinalCheckScreen: undefined;
  FinalScreen: undefined;
  LIDScreen: undefined;
  MasterScreen: undefined;
  ProcesoScreen: undefined;
  PesosBaseScreen: undefined;
  PesosCuerpoScreen: undefined;
  PesosScreen: undefined;
  PesosTapaScreen: undefined;
  RegistroLecturasScreen: undefined;
  TopScreen: undefined;
  ReporteScreen: undefined;
  };

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  useEffect(() => {
    const requestCameraPermission = async (): Promise<void> => {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        if (result !== RESULTS.GRANTED) {
        }
      } else {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permiso denegado', 'La cámara es necesaria para continuar.');
        }
      }
    };

    requestCameraPermission();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Inicio"
          component={InicioScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Pesos"
          component={PesosScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RegistroLecturas"
          component={RegistroLecturasScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProcesoScreen"
          component={OpcionesProcesoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LIDScreen"
          component={LIDScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TopScreen"
          component={TopScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PesosTapaScreen"
          component={PesosTapaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PesosCuerpoScreen"
          component={PesosCuerpoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PesosBaseScreen"
          component={PesosBaseScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BottomScreen"
          component={BottomScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MasterScreen"
          component={MasterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FinalCheckScreen"
          component={FinalCheckScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EvidenciasScreen"
          component={EvidenciasScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReporteScreen"
          component={ReporteScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default App;
