import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ImageBackground, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Modal, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegistroLecturasScreen = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState<any>(null);
    const [approvalStatus, setApprovalStatus] = useState(null);
    const route = useRoute();
    const { job } = route.params || {};
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [comentarios, setComentarios] = useState('');
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
        drainA: {
            ambiente: '',
            tc1: '',
            tc2: '',
            linea3: '',
        },
        drainB: {
            ambiente: '',
            tc1: '',
            tc2: '',
            linea3: '',
        },
    });

    const imageList = [
        { id: 1, src: require('../assets/multimetro.png') },
        { id: 2, src: require('../assets/Imagen1_REPLECT.png') },
        { id: 3, src: require('../assets/Imagen2_REPLECT.png') },
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

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
            </View>
        );
    }

    const handleChange = (section, key, value) => {
    setData(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            [key]: value,
        },
    }));
};

const handleSave = async () => {
  const payload = {
    job: job,
    fecha: fechaISO,
    nomina: user.Nomina,
    drainA: data.drainA,
    drainB: data.drainB,
    comentarios,
    aprobado: approvalStatus === 'approved' ? 'SI' : 'NO',
  };

  try {
    const response = await fetch('http://192.168.15.161:3000/api/evaporador/registroLecturas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Response:', response);
    const result = await response.json();

    if (result.success) {
      Alert.alert('Lectura registrada correctamente');

      try {
        await fetch('http://192.168.15.161:3000/api/evaporador/completeJobs', {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error al llamar a completeJobs:', error);
      }

      navigation.navigate('Menu', { job });
    } else {
      Alert.alert('Error al registrar lectura');
    }

  } catch (error) {
    console.error('Error al guardar:', error);
    Alert.alert('Error de conexión al servidor');
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
            {/* Registro de Lecturas */}
            <View style={styles.headerBox}>
                <Text style={styles.headerText}>Registro de Lecturas</Text>
            </View>

            {/* DRAIN PAN */}
            <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>DRAIN PAN</Text>
            </View>

            {/* Instrucciones */}
            <View style={styles.sectionBox}>
                <View style={styles.instructionsWrapper}>
                    <Text style={styles.instructionText}>
                        <Text style={styles.bold}>Instrucciones: </Text>
                        Anote la temperatura ambiental antes de registrar las lecturas de los sensores. Luego, verifique y anote cada lectura, asegurándose de sean iguales o con tolerancia ±2 grados. Si hay diferencias entre los valores, repita la medición de dos a tres veces y, si la discrepancia persiste, informe al área de Calidad de Evaporador Box.
                    </Text>

                    <Text style={styles.instructionText}>
                        <Text style={styles.bold}>NOTA:
                            Si la lectura se encuentra fuera de tolerancia, segregar componente y notificar a supervisor. Utilizar equipo: I-CAL-011</Text>
                    </Text>
                </View>
            </View>
            {/* Job */}
            <View style={styles.infoRow}>
                <Text style={styles.bold2}>FECHA: </Text>
                <Text style={styles.normal}>{formatFechaLocal(fechaISO)}</Text>
                <Text style={styles.bold2}>JOB: </Text>
                <Text style={styles.normal}>{job}</Text>
                <Text style={styles.bold2}>NOMINA: </Text>
                <Text style={styles.normal}>{user.Nomina}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* DRAIN PAN A */}
                <Text style={styles.sectionTitle}>DRAIN PAN A:</Text>
                <View style={styles.inputRow}>
                    <Text style={styles.label}>Temperatura Ambiente (°C):</Text>
                    <TextInput
                        style={styles.inputSmall}
                        value={data.drainA.ambiente}
                        onChangeText={text => handleChange('drainA', 'ambiente', text)}
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.rowPair}>
                    <View style={styles.pairItem}>
                        <Text style={styles.label}>TC #1:</Text>
                        <TextInput
                            style={styles.inputSmall}
                            value={data.drainA.tc1}
                            onChangeText={text => handleChange('drainA', 'tc1', text)}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.pairItem}>
                        <Text style={styles.label}>TC #2:</Text>
                        <TextInput
                            style={styles.inputSmall}
                            value={data.drainA.tc2}
                            onChangeText={text => handleChange('drainA', 'tc2', text)}
                            keyboardType="numeric"
                        />
                    </View>
                </View>
                <View style={styles.inputRow}>
    <Text style={styles.label}>Línea #3:</Text>
    <View style={styles.pickerContainer}>
        <Picker
            selectedValue={data.drainA.linea3}
            onValueChange={(itemValue) => handleChange('drainA', 'linea3', itemValue)}
        >
            <Picker.Item label="Seleccione..." value="Selec..." />
            <Picker.Item label="Sí" value="sí" />
            <Picker.Item label="No" value="no" />
        </Picker>
    </View>
</View>

                {/* DRAIN PAN B */}
                <Text style={styles.sectionTitle}>DRAIN PAN B:</Text>
                <View style={styles.inputRow}>
                    <Text style={styles.label}>Temperatura Ambiente (°C):</Text>
                    <TextInput
                        style={styles.inputSmall}
                        value={data.drainB.ambiente}
                        onChangeText={text => handleChange('drainB', 'ambiente', text)}
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.rowPair}>
                    <View style={styles.pairItem}>
                        <Text style={styles.label}>TC #1:</Text>
                        <TextInput
                            style={styles.inputSmall}
                            value={data.drainB.tc1}
                            onChangeText={text => handleChange('drainB', 'tc1', text)}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.pairItem}>
                        <Text style={styles.label}>TC #2:</Text>
                        <TextInput
                            style={styles.inputSmall}
                            value={data.drainB.tc2}
                            onChangeText={text => handleChange('drainB', 'tc2', text)}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Línea #3 */}
                <View style={styles.inputRow}>
    <Text style={styles.label}>Línea #3:</Text>
    <View style={styles.pickerContainer}>
        <Picker 
        placeholder='Seleccione una opcion'
            selectedValue={data.drainB.linea3}
            onValueChange={(itemValue) => handleChange('drainB', 'linea3', itemValue)}
        >
            <Picker.Item label="Seleccione..." value="" />
            <Picker.Item label="Sí" value="sí" />
            <Picker.Item label="No" value="no" />
        </Picker>
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
    value={comentarios}
    onChangeText={setComentarios}
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

                {/* Botón Guardar */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
    <Text style={styles.saveButtonText}>GUARDAR</Text>
</TouchableOpacity>

                {/* Imágenes (3) debajo de Línea #3 */}
                <View style={styles.imageRow}>
                    {imageList.map((img) => (
                        <Pressable
                            key={img.id}
                            onPress={() => {
                                setSelectedImageId(img.id);
                                setModalVisible(true);
                            }}
                        >
                            <Image source={img.src} style={styles.image} resizeMode="cover" />
                        </Pressable>
                    ))}
                </View>
                 
            </ScrollView>
            
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    {selectedImageId !== null && (
                        <View style={styles.modalContent}>
                            <Image
                                source={imageList.find(img => img.id === selectedImageId).src}
                                style={styles.fullImage}
                                resizeMode="contain"
                                enableSwipeDown
                                renderIndicator={() => null}
                            />
                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButtonText}>CERRAR</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>
            </ScrollView>
                </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    loadingText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 80,
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
        fontSize: 13,
        padding: 4,
        textAlign: 'center',
        width: '100%',
        height: 70,
        color: 'black'
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 50,
        marginLeft: 5,
        marginRight: 5,
        alignContent: 'center'
    },
    container: {
        flexGrow: 1,
        paddingBottom: 50,
    },
    headerBox: {
        backgroundColor: '#0011ffff',
        padding: 15,
        marginBottom: 1,
        alignItems: 'center'
    },
    headerText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    sectionBox: {
        marginBottom: 10,
        alignItems: 'center',
        marginLeft: 2,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginLeft: 1,
        textAlign: 'center'
    },
    instructionText: {
        fontSize: 13,
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
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap-reverse',
        marginBottom: 10,
        alignItems: 'center',
        backgroundColor: '#000000ff',
        justifyContent: 'center',
        paddingVertical: 5,
    },
    RegisterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    normal: {
        fontSize: 14,
        color: 'white',
        marginRight: 50
    },
    bold2: {
        fontWeight: 'bold',
        fontSize: 14,
        color: 'white'
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        marginLeft: 5
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 8,
    },
    rowPair: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 0,
    },
    pairItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 0.48,
        marginLeft: 5
    },
    inputSmall: {
        borderWidth: 1,
        borderColor: '#4e4e4e73',
        borderRadius: 5,
        paddingVertical: 3,
        paddingHorizontal: 8,
        width: 90,
        height: 35,
        backgroundColor: '#c2c2c2ff',
        color: 'black'
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#4e4e4e73',
        borderRadius: 5,
        width: 120,
        height: 35,
        justifyContent: 'center',
        backgroundColor: '#c2c2c2ff',
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#4e4e4e73',
        borderRadius: 5,
        backgroundColor: '#c2c2c2ff',
        width: 120,
        height: 35,
        justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: '#0011ff',
        padding: 15,
        borderRadius: 8,
        margin: 20,
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
    fullImage: {
        width: '90%',
        height: '70%',
        borderRadius: 12,
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 20,
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#999',
        backgroundColor: '#ffffffff',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#ff0000cc',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 10,
        elevation: 3,
    },

    closeButtonText: {
        color: '#ffffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },


});

export default RegistroLecturasScreen;

