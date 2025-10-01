import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    Alert,
    BackHandler,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const PesosScreen = () => {
    const route = useRoute();
    const { job } = route.params || {};
    const navigation = useNavigation();
    const [activeButton, setActiveButton] = useState<number | null>(null);
    const [statusTapaOK, setStatusTapaOK] = useState(false);
    const [statusCuerpoOK, setStatusCuerpoOK] = useState(false);
    const [statusBaseOK, setStatusBaseOK] = useState(false);
    const [user, setUser] = useState<any>(null);

    useFocusEffect(
  useCallback(() => {
    const onBackPress = async () => {
      try {
        await fetch('http://192.168.16.146:3002/api/evaporador/completeJobs', {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error al llamar a completeJobs desde botón atrás:', error);
      }

      navigation.navigate('Menu' as never, { job } as never);
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => subscription.remove();
  }, [navigation, job])
);


    useEffect(() => {
        const loadUserData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };

        const fetchPesosStatus = async () => {
            try {
                const response = await fetch('http://192.168.16.146:3002/api/evaporador/getPesos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ job }),
                });

                if (!response.ok) throw new Error('Error al consultar getPesos');

                const data = await response.json();

                if (data.statusTapas === 'OK') setStatusTapaOK(true);
                if (data.statusCuerpo === 'OK') setStatusCuerpoOK(true);
                if (data.statusBase === 'OK') setStatusBaseOK(true);
            } catch (error) {
                console.error('Error al consultar getPesos:', error);
                Alert.alert('Error', 'No se pudo obtener el estado de pesos. Intenta más tarde.');
            }
        };

        loadUserData();
        fetchPesosStatus();
    }, []);

    const buttons = [
        { id: 0, label: 'Registro de Pesos y Espumado: TAPA', screen: 'PesosTapaScreen' },
        { id: 1, label: 'Registro de Pesos y Espumado: CUERPO', screen: 'PesosCuerpoScreen' },
        { id: 2, label: 'Registro de Pesos y Espumado: BASE', screen: 'PesosBaseScreen' },
    ];

    const handlePress = (id: number, screen: string | null) => {
        const isAutoActive =
            (id === 0 && statusTapaOK) ||
            (id === 1 && statusCuerpoOK) ||
            (id === 2 && statusBaseOK);

        if (isAutoActive) {
            Alert.alert(
                'Checklist completo',
                'Este checklist ya está completado y guardado.\nContestarlo de nuevo borrará la información anterior,\n\n¿Deseas continuar?',
                [
                    { text: "No", style: "cancel" },
                    {
                        text: "Sí",
                        onPress: () => {
                            setActiveButton(id);
                            if (screen) {
                                navigation.navigate(screen as never, { job } as never);
                            }
                        },
                    },
                ]
            );
        } else {
            setActiveButton(id);
            if (screen) {
                navigation.navigate(screen as never, { job } as never);
            }
        }
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Job Info */}
            <View style={styles.infoRow}>
                <Text style={styles.bold2}>JOB: </Text>
                <Text style={styles.normal}>{job}</Text>
                <Text style={styles.welcomeText}>{user.Nomina}</Text>
            </View>

            <View style={styles.buttonContainer}>
                {buttons.map((button) => {
                    const isPressed = activeButton === button.id;
                    const isAutoActive =
                        (button.id === 0 && statusTapaOK) ||
                        (button.id === 1 && statusCuerpoOK) ||
                        (button.id === 2 && statusBaseOK);

                    const isActive = isPressed || isAutoActive;

                    return (
                        <TouchableOpacity
                            key={button.id}
                            style={[styles.button, isActive && styles.activeButton]}
                            onPress={() => handlePress(button.id, button.screen)}
                        >
                            <View style={styles.contentRow}>
                                <Image
                                    source={require('../assets/checklist.png')}
                                    style={styles.buttonImage}
                                />
                                <Text style={[styles.buttonText, isActive && styles.activeButtonText]}>
                                    {button.label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};
    
    const styles = StyleSheet.create({
        loadingText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 80,
    },
    welcomeText: {
        position: 'absolute',
        right: 15,
        top: 15,
        color: '#ffffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
        container: {
            flex: 1,
            backgroundColor: '#fff',
            paddingTop: 10,
        },
        header: {
            position: 'absolute',
            top: 10,
            alignItems: 'center',
            width: '100%',
        },
        text: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 25,
        },
        buttonContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            paddingTop: 100
        },
        button: {
            backgroundColor: '#0000beff',
            paddingVertical: 10,
            borderRadius: 10,
            marginVertical: 10,
            width: '80%',
            height: 100,
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: 'white',
            borderWidth: 2,
        },
        contentRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonText: {
            color: '#fff',
            fontSize: 18,
            fontWeight: '600',
        },
        activeButton: {
            backgroundColor: '#ffffff',
            borderColor: 'blue',
            borderWidth: 2,
        },
        activeButtonText: {
            color: '#000000',
        },
        buttonImage: {
            width: 80,
            height: 80,
            marginRight: 2,
            resizeMode: 'contain',
        },
        buttonImageRegistro: {
            width: 60,
            height: 60,
            marginRight: 2,
            resizeMode: 'contain',
        },
        buttonImageCamera: {
            width: 50,
            height: 50,
            marginRight: 2,
            resizeMode: 'contain',
        },
        infoRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        RegisterRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        normal: {
            fontSize: 24,
            color: 'black'
        },
        bold2: {
            fontWeight: 'bold',
            fontSize: 24,
            color: 'black'
        },
    });

export default PesosScreen;
