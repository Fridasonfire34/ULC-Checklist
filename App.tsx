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
import TopScreen from './src/screens/TopScreen';
import EvidenciasScreen from './src/screens/EvidenciasScreen';
import ReporteScreen from './src/screens/ReporteScreen';
import ChecklistScreen from './src/screens/ChecklistScreen';

type RootStackParamList = {
  Login: undefined;
  Inicio: undefined;
  Menu: undefined;
  RegistroLecturas: undefined;
  EvidenciasScreen: undefined;
  FinalCheckScreen: undefined;
  FinalScreen: undefined;
  PesosBaseScreen: undefined;
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
          name="RegistroLecturas"
          component={RegistroLecturasScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TopScreen"
          component={TopScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChecklistScreen"
          component={ChecklistScreen}
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
