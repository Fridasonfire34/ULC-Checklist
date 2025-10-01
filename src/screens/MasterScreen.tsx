import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ImageBackground, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Modal, Pressable } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';


const MasterScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [comentarios, setComentarios] = useState('');
    const [statusChecked, setStatusChecked] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [checkedItems, setCheckedItems] = useState(
    Array(10).fill(false)
);
    const { job } = route.params || {};
    const fechaISO = new Date().toISOString();
    const formatFechaLocal = (fechaISO: string) => {
    const date = new Date(fechaISO);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // enero es 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    useEffect(() => {
        if (checkedItems.every(item => item)) {
            setStatusChecked(true);
        } else {
            setStatusChecked(false);
        }
    }, [checkedItems]);

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

    const imageList = [
        { id: 1, src: require('../assets/MASTER1.png') },
        { id: 2, src: require('../assets/MASTER2.png') },
        { id: 3, src: require('../assets/MASTER3.png') },
        { id: 4, src: require('../assets/MASTER4.png') },
        { id: 5, src: require('../assets/MASTER5.png') },
        { id: 6, src: require('../assets/MASTER6.png') },
    ];

    const row1 = imageList.slice(0, 6);

    const handleIncomplete = () => {
              Alert.alert(
                'Verificación Incompleta',
                'No todos los puntos han sido verificados. ¿Deseas continuar?',
                [
                  {
                    text: 'Cancelar',
                    style: 'cancel',
                  },
                  {
                    text: 'Sí',
                    onPress: async () => {
                          const payload = {
                            job,
                            fecha: fechaISO,
                            nomina: user?.Nomina,
                            checkboxes: checkedItems,
                            comentarios
                          };
                        try { const response = await fetch('http://192.168.16.146:3002/api/evaporador/incompleteMaster',{
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                             body: JSON.stringify(payload),
                        });
                        console.log('Response: ', response);
                        const result = await response.json();
            
                         if (result.success) {
                                      Alert.alert('Enviado', 'Checklist enviado como INCOMPLETO.');
                        
                                      try {
                                        await fetch('http://192.168.16.146:3002/api/evaporador/completeJobs', {
                                          method: 'POST',
                                        });
                                      } catch (error) {
                                        console.error('Error al llamar a completeJobs:', error);
                                      }
                        
                                      navigation.navigate('ProcesoScreen', { job });
                        
                                    } else {
                                      Alert.alert('Error al registrar los datos');
                                    }
                                  } catch (error) {
                                    console.error('Error al guardar:', error);
                                    Alert.alert('Error', 'No se pudo enviar el checklist incompleto.');
                                  }
                                },
                              },
                            ]
                          );
                        };
        
            const handleComplete = async () => {
                    console.log('Payload enviado:', {
              job,
              fecha: fechaISO,
              nomina: user?.Nomina,
              checkboxes: checkedItems,
              comentarios
            });
            
                    try { const response = await fetch ('http://192.168.16.146:3002/api/evaporador/completeMaster', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                job,
                                fecha: fechaISO,
                                nomina: user?.Nomina,
                                checkboxes: checkedItems,
                                comentarios
                            }),
                        });
                        console.log('Response: ', response);
                        const result = await response.json();
                        if (result.success) {
                Alert.alert('Enviado', 'Checklist enviado como COMPLETO.');
                navigation.navigate('ProcesoScreen', { job })
            } else {
                console.log('Respuesta del servidor:', result);
                Alert.alert('Error al registrar los datos', result.message || 'Error desconocido');
            }
            
                    } catch (error) {
                        console.error('Error al guardar:', error);
                        Alert.alert('Error', 'No se pudo enviar el checklist completo.');
                    }
                };

    return (
    <ImageBackground source={require('../assets/bg1-eb.jpg')} style={{ flex: 1 }}>
 <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Registro de Lecturas */}
        <View style={styles.headerBox}>
            <Text style={styles.headerText}>BOM CONFIRMACION:</Text>
            <Text style={styles.headerText}>ASSEMBLY BOX, ᴍᴀsᴛᴇʀ</Text>
        </View>

        {/* Instrucciones */}
        <View style={styles.sectionBox}>
            <View style={styles.instructionsWrapper}>
                <Text style={styles.instructionText}>
                    <Text style={styles.bold}>Instrucciones: </Text>
                    Garantizar que todos los componentes necesarios se encuentren disponibles antes de iniciar el proceso de ensamble. Primero, identifique el componente en cuestión y compare la cantidad especificada en el check list de referencia con la cantidad disponible. Marque el recuadro correspondiente. En caso de que no se cuente con la cantidad adecuada, registre la discrepancia en el campo de observaciones.
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

            {/* Tabla insertada aquí */}
            <View style={styles.tableContainer}>
    {/* Encabezados */}
    <View style={styles.tableRowHeader}>
    <View style={styles.colItem}><Text style={styles.headerTABLE}>ITEM</Text></View>
    <View style={styles.colDesc}><Text style={styles.headerTABLE}>DESCRIPCIÓN</Text></View>
    <View style={styles.colPart}><Text style={styles.headerTABLE}>NUM. DE PARTE</Text></View>
    <View style={styles.colQty}><Text style={styles.headerTABLE}>QTY</Text></View>
    <View style={styles.colStatus}><Text style={styles.headerTABLE}>STATUS</Text></View>
</View>

    {/* Filas de datos */}
    {[
    [1, "ASSEMBLY, EVAP BOX LID, EC, ULC", "6700762", "1"],
    [2, "ASSEMBLY, EVAP BPOX, TOP", "4490384", "1"],
    [3, "ASSEMBLY, EVAP BOX, BOTTOM", "4490352", "1"],
    [4, 'GASKET, EVAP BOX, TOP', "8720080", "1"],
    [5, 'PANEL, DRAIN ACCESS', "9010387", "1"],
    [6, 'PASSTHRU, TOP, EVAP BOX, ULC', "9010630", "1"],
    [7, 'DRAW LATCH, ADJUSTABLE, ZP, 5-3/8", L x 1-5/16 W', "7410227", "2"],
    [8, 'SNAP BUSHING, 5/16", OD X 1/4" ID', '1640019', '1'],
    [9, 'PANEL PLUG, SNAP IN, 1/2" ID', '7410258', '6'],
    [10, 'SCREW, FPH, #10-32 X 3/4:, 18-8 SS', '7410231', '12']
].map(([item, desc, part, qty], idx) => (
    <TouchableOpacity
        key={idx}
        style={[
            styles.tableRow,
            { backgroundColor: checkedItems[idx] ? '#d0f0c0' : '#fff' }
        ]}
        onPress={() => {
            const updated = [...checkedItems];
            updated[idx] = !updated[idx];
            setCheckedItems(updated);
        }}
    >
        <View style={[styles.tableCellBase, styles.colItem]}>
            <Text style={styles.tableText}>{item}</Text>
        </View>
        <View style={[styles.tableCellBase, styles.colDesc]}>
            <Text style={styles.tableText}>{desc}</Text>
        </View>
        <View style={[styles.tableCellBase, styles.colPart]}>
            <Text style={styles.tableText}>{part}</Text>
        </View>
        <View style={[styles.tableCellBase,styles.colQty]}>
            <Text style={styles.tableText}>{qty}</Text>
        </View>
        <View style={[styles.tableCellBase, styles.colStatus]}>
            <CheckBox
                value={checkedItems[idx]}
                onValueChange={() => {
                    const updated = [...checkedItems];
                    updated[idx] = !updated[idx];
                    setCheckedItems(updated);
                }}
                tintColors={{ true: 'black', false: 'black' }}
            />
        </View>
    </TouchableOpacity>
))}
</View>

 <View style={styles.tableContainer}>
    <View style={styles.tableRow2}>
    <View style={[styles.tableCellBase3, styles.colOBS]}>
        <Text style={styles.tableText2}>OSERVACIONES Y COMENTARIOS</Text></View>
    <View style={[styles.tableCellBase3, styles.colStat]}>
        <Text style={styles.tableText2}>STATUS</Text></View>
    </View>

    <View style={styles.tableRow2}>
    <View style={[styles.tableCellBase3, styles.colOBST]}>
      <TextInput
                                style={styles.inputText}
                                multiline={true}
                                textAlignVertical="top"
                                placeholder="Escribe aquí..."
                                value={comentarios}
                                onChangeText={setComentarios}
                            />
    </View>
    <View style={[styles.tableCellBase3, styles.colStat]}>
      <CheckBox
          value={statusChecked}
          disabled={!checkedItems.every(item => item)}
          tintColors={{ true: 'black', false: 'gray' }}
      />
      
    </View>
  </View>
  </View>
            {/* Botón Guardar */}
             <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => {
                                      if (!statusChecked) {
                                        handleIncomplete();
                                      } else {
                                        handleComplete();
                                      }
                                    }}
                                    >
                                        <Text style={styles.saveButtonText}>GUARDAR</Text>
                                        </TouchableOpacity>

            {/* Imágenes */}
            <View style={styles.imageRow}>
    {row1.map((img) => (
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

        {/* Modal */}
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
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 50,
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
        marginLeft: 1
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginLeft: 1,
        textAlign: 'center'
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
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000ff',
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
    fullImage: {
        width: '90%',
        height: '70%',
        borderRadius: 12,
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#999',
        backgroundColor: '#ffffffff',
        marginHorizontal: 10,
    },
    closeButton: {
        marginBottom: 20,
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
    tableContainer: {
        marginVertical: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: 'black',
        backgroundColor: '#fff',
    },
    tableRow: {
        flexDirection: 'row',
        borderColor: 'black'
    },
    tableCellBase: {
        borderWidth: 1,
        borderColor: 'black',
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableRowHeader: {
        flexDirection: 'row',
        backgroundColor: '#e0e0e0',
        borderBottomWidth: 1,
        borderColor: 'black',
        alignItems: 'center'
    },
    headerCell: {
        flex: 1,
        padding: 6,
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
        borderRightWidth: 1,
        borderColor: 'black',
    },
    headerTABLE: {
        color: 'black',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableCell: {
        flex: 1,
        padding: 6,
        fontSize: 12,
        textAlign: 'center',
        borderRightWidth: 1,
        borderColor: 'black',
    },
    tableCellHeader: {
        flex: 1,
        padding: 8,
        backgroundColor: '#e0e0e0',
        fontWeight: 'bold',
        borderRightWidth: 1,
        borderColor: 'black',
        fontSize: 12,
        textAlign: 'center',
    },
    tableText: {
        fontSize: 12,
        textAlign: 'center',
    },
    tableText2: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    colItem: {
        width: 40,
    },
    colDesc: {
        flex: 1,
    },
    colPart: {
        width: 70,
    },
    colQty: {
        width: 40,
    },
    colStatus: {
        width: 55,
    },
    colBlow: {
        width: 60,
    },
    colVer: {
        width: 120,
    },
    colDist: {
        width: 80,
    },
    colMed:{
        width: 60,
    },
    colInput:{
        width: 60
    },
    colOBS:{
        flex: 4,
    },
    colOBST:{
        flex: 4,
        height: 70
    },
    colStat:{
        flex: 0.3
    },
    tableContainer2: {
        marginVertical: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: 'black',
        backgroundColor: '#fff',
    },
    tableRow2: {
        flexDirection: 'row',
    },
    tableCellBase3: {
        borderWidth: 1,
        borderColor: 'black',
        padding: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputText: {
        fontSize: 12,
        padding: 4,
        textAlign: 'center',
        width: '100%',
        color: 'black'
},

});

export default MasterScreen;
