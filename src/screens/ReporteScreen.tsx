import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native'
import RNPrint from 'react-native-print';
import axios from 'axios';
import RNFS from 'react-native-fs';

const ReporteScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const [user, setUser] = useState<any>(null);
    const { job } = route.params || {};
    const [fecha, setFecha] = useState('');

    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
};


        useEffect(() => {
        const loadUserData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };

const getFechaActual = () => {
            const hoy = new Date();
            const fechaFormateada = hoy.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            setFecha(fechaFormateada);
        };

        loadUserData();
        getFechaActual();
    }, []);

   const guardarReporte = async () => {
  try {
    const response = await fetch('http://192.168.15.161:3000/api/evaporador/saveReporte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job,
        fecha,
        nomina: user?.Nomina,
      }),
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('❌ Respuesta no JSON:', text);
      throw new Error('Respuesta no válida del servidor');
    }

    if (response.status === 200) {
      Alert.alert('✅ Éxito', data.message);
    } else if (response.status === 409) {
      Alert.alert('⚠️ Advertencia', data.message);
    } else {
      Alert.alert('❌ Error', 'No se pudo guardar el reporte');
    }

  } catch (error) {
    console.error('❌ Error al generar o guardar el PDF:', error);
    Alert.alert('❌ Error', 'Ocurrió un error al enviar el reporte');
  }
};

  const generarPDF = async () => {
  try {
    const payload = {
      job,
      fecha,
      nomina: user.Nomina,
    };

    const response = await axios.post(
      'http://192.168.15.161:3000/api/evaporador/Reporte',
      payload,
      { responseType: 'arraybuffer' }
    );

    if (response.status === 200) {
      const base64Data = arrayBufferToBase64(response.data);

      const filePath = `${RNFS.CachesDirectoryPath}/reporte_${job}.pdf`;
      await RNFS.writeFile(filePath, base64Data, 'base64');
      console.log('📄 PDF guardado en caché:', filePath);

      await RNPrint.print({ filePath });

    } else {
      Alert.alert('Error', 'No se pudo generar el PDF');
    }
  } catch (error) {
    console.error('❌ Error al generar o imprimir PDF:', error);
    Alert.alert('Error', 'No se pudo imprimir el reporte');
  }
};

     const salir = () => {
        navigation.navigate('Menu' as never, { job } as never);
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reporte generado para el Job: {job}</Text>
            <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.buttonSalir} onPress={salir}>
                    <Text style={styles.buttonText}>Salir</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonGuardar} onPress={guardarReporte}>
                    <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonImprimir} onPress={generarPDF}>
                    <Text style={styles.buttonText}>Print</Text>
                </TouchableOpacity>
                </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
      buttonGroup: {
  marginTop: 30,
  width: '100%',
  alignItems: 'center',
  gap: 10,
},
    buttonSalir: {
  backgroundColor: '#ccc',
  paddingVertical: 12,
  borderRadius: 8,
  marginBottom: 10,
  width: '90%',
  minHeight: 50,
},

buttonGuardar: {
  backgroundColor: '#28a745',
  paddingVertical: 12,
  borderRadius: 8,
  marginBottom: 10,
  width: '90%',
  minHeight: 50,
},

buttonImprimir: {
  backgroundColor: '#007bff',
  paddingVertical: 12,
  borderRadius: 8,
  marginBottom: 10,
  width: '90%',
  minHeight: 50,
},
    title: {
        fontSize: 20,
        marginBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 5,
        textAlign: 'center',
    },
        buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default ReporteScreen;
function arrayBufferToBase64(data: any) {
  throw new Error('Function not implemented.');
}

