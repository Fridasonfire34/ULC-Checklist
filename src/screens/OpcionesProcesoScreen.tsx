import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    BackHandler,
    Image,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OpcionesProcesoScreen = () => {
    const route = useRoute();
    const { job } = route.params || {};
    const [statusLIDOK, setStatusLIDOK] = useState(false);
    const [statusTOPOK, setStatusTOPOK] = useState(false);
    const [statusBOTTOMOK, setStatusBOTTOMOK] = useState(false);
    const [statusMASTEROK, setStatusMASTEROK] = useState(false);
    const [activeButton, setActiveButton] = useState<number | null>(null);
    const navigation = useNavigation();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadUserData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };

        const fetchPesosStatus = async () => {
            try {
                const response = await fetch('http://192.168.16.146:3002/api/evaporador/getProcesos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ job }),
                });

                if (!response.ok) throw new Error('Error al consultar getProcesos');

                const data = await response.json();

                if (data.statusLid === 'OK') setStatusLIDOK(true);
                if (data.statusTop === 'OK') setStatusTOPOK(true);
                if (data.statusBottom === 'OK') setStatusBOTTOMOK(true);
                if (data.statusMaster === 'OK') setStatusMASTEROK(true);
            } catch (error) {
                console.error('Error al consultar getProcesos:', error);
                Alert.alert('Error', 'No se pudo obtener el estado de los procesos. Intenta más tarde.');
            }
        };

        loadUserData();
        fetchPesosStatus();
    }, []);

    const buttons = [
        { id: 0, label: 'Assembly Box, LID', screen: 'LIDScreen' },
        { id: 1, label: 'Assembly BOX, TOP', screen: 'TopScreen' },
        { id: 2, label: 'Assembly Box, BOTTOM', screen: 'BottomScreen' },
        { id: 3, label: 'Assembly Master', screen: 'MasterScreen' },
    ];
    

    const handlePress = (id: number, screen: string | null) => {
        const isAutoActive =
            (id === 0 && statusLIDOK) ||
            (id === 1 && statusTOPOK) ||
            (id === 2 && statusBOTTOMOK) ||
            (id === 3 && statusMASTEROK);

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

    return (
        <View style={styles.container}>

            {/* Job */}
            <View style={styles.infoRow}>
                <Text style={styles.bold2}>JOB: </Text>
                <Text style={styles.normal}>{job}</Text>
            </View>

            <View style={styles.buttonContainer}>
                            {buttons.map((button) => {
                                const isPressed = activeButton === button.id;
                                const isAutoActive =
                                    (button.id === 0 && statusLIDOK) ||
                                    (button.id === 1 && statusTOPOK) ||
                                    (button.id === 2 && statusBOTTOMOK) ||
                                    (button.id === 3 && statusMASTEROK);
            
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

export default OpcionesProcesoScreen;
