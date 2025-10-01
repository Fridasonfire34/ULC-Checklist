import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    BackHandler,
    Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuScreen = () => {
    const route = useRoute();
    const { job } = route.params || {};
    const [activeButton, setActiveButton] = useState<number | null>(null);
    const [statusLecturasOK, setStatusLecturasOK] = useState(false);
    const [statusPesosOK, setStatusPesosOK] = useState(false);
    const [statusProcesoOK, setStatusProcesoOK] = useState(false);
    const [statusChecklistFinalOK, setStatusChecklistFinalOK] = useState(false);
    const navigation = useNavigation();
    const [user, setUser] = useState<any>(null);

    const buttons = [
        { id: 0, label: 'Registro de lecturas', screen: 'RegistroLecturas' },
        { id: 1, label: 'Registro de Pesos y Espumado', screen: 'Pesos' },
        { id: 2, label: 'Checklist Proceso', screen: 'ProcesoScreen' },
        { id: 3, label: 'Checklist Final', screen: 'FinalCheckScreen' },
        { id: 4, label: 'Evidencias', screen: 'EvidenciasScreen' },
        { id: 5, label: 'Reporte', screen: 'ReporteScreen'}
    ];

    useEffect(() => {
        const loadUserData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };
        loadUserData();
    }, []);

    useFocusEffect(
      useCallback(() => {
        const fetchLecturasYChecklist = async () => {
          try {
            const response = await fetch('http://192.168.16.146:3002/api/evaporador/getLecturasyCFinal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ job }),
            });

            const data = await response.json();

            setStatusLecturasOK(data.statusLecturas === 'OK');
            setStatusChecklistFinalOK(data.statusChecklistFinal === 'OK');
            setStatusPesosOK(data.statusPesos === 'OK');
            setStatusProcesoOK(data.statusProceso === 'OK');
          } catch (error) {
            Alert.alert('Error', 'No se pudo obtener el estado del trabajo.');
          }
        };

        fetchLecturasYChecklist();
      }, [job])
    );

    useFocusEffect(
      useCallback(() => {
        const onBackPress = () => {
          navigation.navigate('Inicio' as never);
          return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
      }, [navigation])
    );

    const handlePress = (id: number, screen: string | null) => {
        setActiveButton(id);
        if (screen) {
            navigation.navigate(screen as never, { job } as never);
        }
    };

    const canEnableReporte = () => {
        const statuses = [
            statusLecturasOK,
            statusPesosOK,
            statusProcesoOK,
            statusChecklistFinalOK,
        ];
        const okCount = statuses.filter(Boolean).length;
        return okCount === 4;
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
            {/* Job */}
            <View style={styles.infoRow}>
                <Text style={styles.bold2}>JOB: </Text>
                <Text style={styles.normal}>{job}</Text>
                <Text style={styles.welcomeText}>{user.Nomina}</Text>
            </View>

            <View style={styles.buttonContainer}>
                {buttons.map((button) => {
                    const isPressed = activeButton === button.id;
                    
                    const isAutoActive =
                        (button.id === 0 && statusLecturasOK) ||
                        (button.id === 1 && statusPesosOK) ||
                        (button.id === 2 && statusProcesoOK) ||
                        (button.id === 3 && statusChecklistFinalOK);

                    const isActive = isPressed || isAutoActive;

                    const hasRegistro = button.label.includes('Registro');
                    const hasCheckList = button.label.includes('Checklist');
                    const hasEvidencia = button.label.includes('Evidencias');
                    const isReporte = button.label.includes('Reporte');
                    
                    const isDisabled = isReporte && !canEnableReporte();

                    return (
                        <TouchableOpacity
                            key={button.id}
                            style={[
                                styles.button,
                                isActive && styles.activeButton,
                                isDisabled && styles.disabledButton
                            ]}
                            onPress={() => {
                                if (isAutoActive) {
                                    Alert.alert(
                                        'Checklist completo',
                                        'Este checklist ya está completado y guardado.\nContestarlo de nuevo borrará la información anterior,\n\n¿Deseas continuar?',
                                        [
                                            { text: 'No', style: 'cancel' },
                                            { text: 'Sí', onPress: () => handlePress(button.id, button.screen) }
                                        ]
                                    );
                                } else if (!isDisabled) {
                                    handlePress(button.id, button.screen);
                                } else if (isReporte) {
                                    Alert.alert('Acción no permitida', 'Debes completar todos los pasos antes de generar el reporte.');
                                }
                            }}
                            disabled={isDisabled}
                        >
                            <View style={styles.contentRow}>
                                {hasRegistro && (
                                    <Image
                                        source={require('../assets/Registro.png')}
                                        style={styles.buttonImage}
                                    />
                                )}
                                {hasCheckList && (
                                    <Image
                                        source={require('../assets/checklist.png')}
                                        style={styles.buttonImageRegistro}
                                    />
                                )}
                                {hasEvidencia && (
                                    <Image
                                        source={require('../assets/camara.png')}
                                        style={styles.buttonImageCamera}
                                    />
                                )}
                                {isReporte && (
                                    <Image
                                    source={require('../assets/ok.png')}
                                    style={styles.buttonImageOK}
                                    />
                                )}
                                <Text style={[
                                    styles.buttonText,
                                    isActive && styles.activeButtonText,
                                    isDisabled && styles.disabledButtonText
                                ]}>
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
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 10,
    },
    welcomeText: {
        position: 'absolute',
        right: 15,
        top: 15,
        color: '#000000ff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingTop: 30
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
    buttonImageOK: {
        width: 60,
        height: 60,
        marginRight: 2,
        resizeMode: 'contain',
        marginTop: 2
    },
    infoRow: {
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
    disabledButton: {
        backgroundColor: '#cccccc',
        borderColor: '#999',
    },
    disabledButtonText: {
        color: '#666666',
    },
});

export default MenuScreen;
