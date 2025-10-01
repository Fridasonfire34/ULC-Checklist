import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ImageBackground,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const PesosTapaScreen = () => {
    const navigation = useNavigation();
    const [approvalStatus, setApprovalStatus] = useState(null);
    const [user, setUser] = useState<any>(null);
    const route = useRoute();
    const {job } = route.params || {};
    const fechaISO = new Date().toISOString(); // Ej: "2025-08-21T19:32:00.000Z"
    const formatFechaLocal = (fechaISO: string) => {
    const date = new Date(fechaISO);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // enero es 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

    const [data, setData] = useState({
        item: '',
        ensamble: '',
        temperatura: '',
        pesoAntes: '',
        pesoDespues: '',
        maquinado: '',
        termometroId: '',
        comentarios: '',
    });

     useEffect(() => {
        const loadUserData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };

        loadUserData();
    }, []);

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
            </View>
        );
    }

    const handleChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const onSave = async () => {
    try {
        const payload = {
            job,
            fecha: fechaISO,
            nomina: user.Nomina,
            temperatura: data.temperatura,
            pesoAntes: data.pesoAntes,
            pesoDespues: data.pesoDespues,
            maquinado: data.maquinado,
            termometroId: data.termometroId,
            comentarios: data.comentarios,
            aprobado: approvalStatus === 'approved' ? 'SI' : 'NO'
        };

        const response = await fetch('http://192.168.16.146:3002/api/evaporador/pesosTapa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
            Alert.alert('Registro guardado con éxito.');
            navigation.navigate('Pesos', { job });
            setData({
                    item: '',
                    ensamble: '',
                    temperatura: '',
                    pesoAntes: '',
                    pesoDespues: '',
                    maquinado: '',
                    termometroId: '',
                    comentarios: '',
                    });
                    setApprovalStatus(null);

        } else {
            console.error('Error del servidor:', result.message);
            Alert.alert('Error al guardar. Revisa los datos.');
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        Alert.alert('Error de conexión o del servidor.');
    }
};

    return (
        <ImageBackground source={require('../assets/bg1-eb.jpg')} style={{ flex: 1 }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // o 'position' si no funciona bien
                  style={{ flex: 1 }}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20} // Ajusta según tu header si tienes
                >
                  <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>Registro de Pesos y Espumado: ᴛᴀᴘᴀ</Text>
            </View>

            {/* Job y Fecha */}
            <View style={styles.infoRow}>
                            <Text style={styles.bold2}>FECHA: </Text>
                            <Text style={styles.normal}>{formatFechaLocal(fechaISO)}</Text>
                            <Text style={styles.bold2}>JOB: </Text>
                            <Text style={styles.normal}>{job}</Text>
                            <Text style={styles.bold2}>NOMINA: </Text>
                            <Text style={styles.normal}>{user.Nomina}</Text>
                        </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Temperatura */}
                <View style={styles.view}>
                <Text style={styles.label}>Temperatura de Molde °F</Text>
                <Text style={styles.subLabel}>Tolerancia 105° - 125°:</Text>
                <TextInput
                    style={[styles.input, { width: 300 }]}
                    value={data.temperatura}
                    onChangeText={text => handleChange('temperatura', text)}
                    keyboardType="numeric"
                />
                </View>

                <View style={styles.pairItemASSY}>
                                        
                                    </View>

                {/* Pesos */}
                <Text style={styles.labelPesos}>Pesos (Libras):</Text>
                <View style={[styles.rowPair, { width: width * 0.9 }]}>
                    <View style={styles.pairItem}>
                        <Text style={styles.label}>Antes:</Text>
                        <TextInput
                            style={[styles.input, { width: 300 }]}
                            value={data.pesoAntes}
                            onChangeText={text => handleChange('pesoAntes', text)}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.pairItem}>
                        <Text style={styles.label}>Después:</Text>
                        <TextInput
                            style={[styles.input, { width: 300 }]}
                            value={data.pesoDespues}
                            onChangeText={text => handleChange('pesoDespues', text)}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Maquinado - Termómetro */}
                <View style={[styles.rowPair, { width: width * 0.9 }]}>
  {/* Columna izquierda */}
  <View style={styles.pairItem}>
    <Text style={styles.label}>Maquina Espumado</Text>
    <Picker
      selectedValue={data.maquinado}
      style={styles.picker}
      placeholder='Seleccione una opcion'
      onValueChange={(itemValue) => handleChange('maquinado', itemValue)}
    >
    <Picker.Item label="Seleccione una opcion" value="" />
      <Picker.Item label="1" value="1" />
      <Picker.Item label="2" value="2" />
      <Picker.Item label="3" value="3" />
    </Picker>
  </View>

  {/* Columna derecha */}
  <View style={styles.pairItem}>
    <Text style={styles.label}>ID Termometro</Text>
    <TextInput
      style={[styles.input, { width: 300 }]}
      value={data.termometroId}
      onChangeText={(text) => handleChange('termometroId', text)}
    />
  </View>
</View>

<View style={styles.tableContainer}>
    <View style={styles.tableRow2}>
        <View style={[styles.tableCellBase, { flex: 1 }]}>
            <Text style={styles.tableText2}>OBSERVACIONES Y COMENTARIOS</Text>
        </View>
    </View>

    <View style={styles.tableRow2}>
        <View style={[styles.tableCellBase, { flex: 1 }]}>
           <TextInput
    style={styles.inputText}
    multiline={true}
    textAlignVertical="top"
    placeholder="Escribe aquí..."
    value={data.comentarios}
    onChangeText={text => handleChange('comentarios', text)}
/>

        </View>
    </View>
</View>

<View style={styles.checkboxContainer}>
        <TouchableOpacity
            style={[
                styles.checkbox,
                approvalStatus === 'approved' && { backgroundColor: 'green' }
            ]}
            onPress={() => setApprovalStatus('approved')}
        >
            <Text style={styles.checkboxLabel}>APROBADO</Text>
        </TouchableOpacity>
    
        <TouchableOpacity
            style={[
                styles.checkbox,
                approvalStatus === 'notApproved' && { backgroundColor: 'red' }
            ]}
            onPress={() => setApprovalStatus('notApproved')}
        >
            <Text style={styles.checkboxLabel}>NO APROBADO</Text>
        </TouchableOpacity>
    </View>

                {/* Guardar */}
                <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
            </ScrollView>
            </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground >
    );
};

const styles = StyleSheet.create({
    container: {
            flex: 1,
            backgroundColor: '#fff',
            paddingTop: 10,
        },
        loadingText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 80,
    },
    welcomeText: {
        position: 'absolute',
        right: 15,
        color: '#ffffffff',
        fontSize: 14,  
    },
    view:{
        alignItems: 'center'
    },
    keyboardAvoiding: {
        flex: 1,
    },
    tableContainer: {
        marginVertical: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#999',
        backgroundColor: '#fff',
    },
    colOBS:{
        width: 300
    },
    colOBST:{
        width: 300,
        height: 70
    },
    tableRow2: {
        flex:1,
    },
    tableCellBase: {
        borderWidth: 1,
        borderColor: '#999',
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableText2: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    inputText: {
        fontSize: 12,
        padding: 4,
        textAlign: 'center',
        width: '100%',
        height: 70,
        color: 'black'
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 50,
        paddingHorizontal: 2,
        alignContent: 'center'
    },
    headerBox: {
        backgroundColor: '#0011ff',
        padding: 15,
        alignItems: 'center',
    },
    picker: {
        height: 50,
        borderWidth: 2,
        borderColor: '#4e4e4e73',
        borderRadius: 10,
        width: 300,
        //color: 'black',
        justifyContent: 'center',
        backgroundColor: '#c2c2c2ff',
      },
      
    headerText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        paddingVertical: 5,
    },
    normal: {
        fontSize: 14,
        color: 'white',
        marginRight: 50
    },
    bold2: {
        fontWeight: 'bold',
        fontSize: 14,
        color: 'white',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    labelPesos: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
        marginTop: 15,
        textAlign: 'center'
    },
    subLabel: {
        fontSize: 12,
        marginBottom: 4,
        fontStyle: 'italic',
        color: '#444',
    },
    rowPair: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    pairItem: {
        width: '40%',
    },
    pairItemASSY: {
        width: '65%',
    },
    pairItemME: {
        width: '60%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        backgroundColor: '#fff',
        color: 'black',
        height: 45,
    },
    inputOp: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 8,
        fontSize: 14,
        backgroundColor: '#fff',
        color: 'black'
    },
    saveButton: {
        backgroundColor: '#0011ff',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkboxContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    }, 
    checkbox: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#f0f0f0',
    },
    checkboxLabel: {
        color: '#000',
        fontWeight: 'bold',
    },
});

export default PesosTapaScreen;

