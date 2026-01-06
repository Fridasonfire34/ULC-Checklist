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
import logo from '../assets/Tafco-logo.png';

const MenuScreen = () => {
    const route = useRoute();
    const { jobid, job, project } = route.params || {};
    const [activeButton, setActiveButton] = useState<number | null>(null);
    const [statusChecklistFinalOK, setStatusChecklistFinalOK] = useState(false);
    const navigation = useNavigation();
    const [user, setUser] = useState<any>(null);

    // Botón dinámico según el proyecto
    const getDimensionsLabel = () => {
        if (project === 'ULC-190') return 'ULC-190 Dimensions';
        if (project === 'ULC-259') return 'ULC-259 Dimensions';
        if (project === 'ULC-328') return 'ULC-328 Dimensions';
        return null;
    };

    const dynamicDimensionsLabel = getDimensionsLabel();

    // Botones principales
    const buttons = [
        { id: 1, label: 'Inspection Check List', screen: 'ChecklistScreen' },
        ...(dynamicDimensionsLabel
            ? [{ id: 4, label: dynamicDimensionsLabel, screen: 'DimensionsScreen' }]
            : []),
        { id: 2, label: 'Evidence', screen: 'EvidenciasScreen' },
        { id: 3, label: 'Report', screen: 'ReporteScreen' }
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
            const onBackPress = () => {
                navigation.navigate('Inicio' as never);
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [navigation])
    );

    const handlePress = (id: number, screen: string) => {
        setActiveButton(id);
        navigation.navigate(screen as never, { jobid, job, project } as never);
    };

    const canEnableReporte = () => {
        return statusChecklistFinalOK;
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading user information...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Job */}
            <View style={styles.infoRow}>
                <Text style={styles.bold2}>JOB: </Text>
                <Text style={styles.normal}>{job}</Text>
                <Text style={styles.projectText}>{jobid}</Text>
                <Text style={styles.projectText}>{user.ID}</Text>
                <Text style={styles.bold2}>{project}</Text>
            </View>

            <View style={styles.buttonContainer}>
                {buttons.map((button) => {
                    const isPressed = activeButton === button.id;

                    const isAutoActive = button.id === 1 && statusChecklistFinalOK;
                    const isActive = isPressed || isAutoActive;

                    const hasCheckList = button.label.includes('Inspection');
                    const hasEvidencia = button.label.includes('Evidence');
                    const isReporte = button.label.includes('Report');
                    const isDimensions = button.label.includes('Dimensions');

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
                                        'Checklist Final completo',
                                        'Ya completaste este checklist.\nSi lo contestas de nuevo, se borrará la información anterior.\n\n¿Deseas continuar?',
                                        [
                                            { text: 'No', style: 'cancel' },
                                            { text: 'Sí', onPress: () => handlePress(button.id, button.screen) }
                                        ]
                                    );
                                } else if (!isDisabled) {
                                    handlePress(button.id, button.screen);
                                } else if (isReporte) {
                                    Alert.alert('No permitido', 'Debes completar el Checklist Final antes del reporte.');
                                }
                            }}
                            disabled={isDisabled}
                        >
                            <View style={styles.contentRow}>
                                
                                {hasCheckList && (
                                    <Image
                                        source={require('../assets/checklist.png')}
                                        style={styles.buttonImageRegistro}
                                    />
                                )}

                                {isDimensions && (
                                    <Image
                                       source={require('../assets/Regla.png')}  // ícono sugerido, puedes cambiarlo
                                        style={styles.buttonImageCamera}
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
            <Image
    style={styles.footerLogo}
    source={logo}
/>
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
        color: '#ffffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    projectText: {
        position: 'relative',
        left: 12,
        top: 15,
        color: '#ffffffff',
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
        marginTop: 10,
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
    footerLogo: {
    position: 'absolute',
    bottom: 20,       // separacion desde abajo
    alignSelf: 'center',
    width: 300,
    height: 125,
    resizeMode: 'contain',
},
});

export default MenuScreen;
