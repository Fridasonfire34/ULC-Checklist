import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logo from '../assets/Tafco-logo.png';

const InicioScreen = () => {
    const [user, setUser] = useState<any>(null);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [jobsData, setJobsData] = useState([]);

    useEffect(() => {
        const loadUserData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };

        loadUserData();
        fetchJobsFromAPI();
    }, []);

    const fetchJobsFromAPI = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://192.168.15.161:3000/api/evaporador/job');
            if (!response.ok) {
                throw new Error('Error al obtener los jobs');
            }
            const data = await response.json();

            setJobsData(data.jobs || data);
        } catch (error) {
            console.error('Error al cargar jobs:', error);
            Alert.alert('Error', 'No se pudieron cargar los jobs. Intenta más tarde.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading user info...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>ULC Inspection Check List</Text>
                <Text style={styles.welcomeText}> {user.ID}</Text>
            </View>
            <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Elige un job:</Text>
            </View>
            {/* Tabla de Jobs */}
            <View style={styles.tableWrapper}>
                {loading ? (
                    <ActivityIndicator size="large" color="#000000ff" />
                ) : (
                    <>

                        {/* Filas */}
                        <FlatList
    data={jobsData}
    keyExtractor={(item, index) => index.toString()}
    renderItem={({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('Menu', {
                jobid: item["Job ID"],
                job: item["Job Number"],
                project: item["Project"],
                id: user.ID,
            })}
        >
            <View style={styles.card}>
                <Text style={styles.cardText}>{item["Job Number"]}</Text>
                <Text style={styles.cardText}>{item["Job ID"]}</Text>
            </View>
        </TouchableOpacity>
    )}
    contentContainerStyle={{ paddingBottom: 120, flexGrow: 1, }}
/>
                    </>
                )}
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
        backgroundColor: '#fff',
    },
    headerBox: {
        backgroundColor: '#0011ffff',
        padding: 15,
        marginBottom: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    headerText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    welcomeText: {
        position: 'absolute',
        right: 15,
        top: 15,
        color: '#ffffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    sectionBox: {
        marginBottom: 10,
        alignItems: 'center',
        marginLeft: 1
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginLeft: 1
    },
    instructionText: {
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'justify'
    },
    bold: {
        fontWeight: 'bold',
    },
    instructionsWrapper: {
        marginLeft: 5,
        marginRight: 5,
    },
    tableWrapper: {
        marginHorizontal: 10,
        marginTop: 5,
        paddingBottom: 10,
        marginBottom: 120,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        color: 'black'
    },

    tableHeaderText: {
        color: '#black',
        fontWeight: 'bold',
    },

    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },

    tableCell: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 5,
    },
    card: {
        backgroundColor: '#f5f5f5', // Color de fondo del recuadro
        padding: 15,
        marginBottom: 10, // separación entre cada recuadro
        borderRadius: 8, // bordes redondeados
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2, // sombra en Android
        shadowColor: '#000', // sombra en iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    cardText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center'
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


export default InicioScreen;
