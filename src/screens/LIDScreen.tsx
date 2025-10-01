import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ImageBackground, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Modal, Pressable } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';


const LIDScreen = () => {
    const navigation = useNavigation();
    const [blowerDistance, setBlowerDistance] = useState('');
    const [serieValue, setSerieValue] = useState('');
    const [modeloValue, setModeloValue] = useState('');
    const [torqueValue, setTorqueValue] = useState('');
    const route = useRoute();
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [user, setUser] = useState<any>(null);
    const [statusChecked, setStatusChecked] = useState(false);
    const [comentarios, setComentarios] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [checkedItems, setCheckedItems] = useState(
    Array(7).fill(false)
    );
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
    const { job } = route.params || {};

    useEffect(() => {
    if (checkedItems.every(item => item)) {
        setStatusChecked(true);
    } else {
        setStatusChecked(false);
    }
}, [checkedItems]);
 

    const imageList = [
        { id: 1, src: require('../assets/LID1.png') },
        { id: 2, src: require('../assets/LID2.png') },
        { id: 3, src: require('../assets/LID3.png') },
        { id: 4, src: require('../assets/LID4.png') },
        { id: 5, src: require('../assets/Imagen12.png') },
    ];

    const row1 = imageList.slice(0, 5);

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
                blowerDistance,
                torqueValue,
                serie: serieValue,
                modelo: modeloValue,
                comentarios
              };
            try { const response = await fetch('http://192.168.16.146:3002/api/evaporador/incompleteLid',{
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
  try {
    const response = await fetch('http://192.168.16.146:3002/api/evaporador/completeLid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job,
        fecha: fechaISO,
        nomina: user?.Nomina,
        checkboxes: checkedItems,
        blowerDistance,
        torqueValue,
        serie: serieValue,
        modelo: modeloValue,
        comentarios
      }),
    });

    const result = await response.json();

    if (result.success) {
      Alert.alert('Enviado', 'Checklist enviado como COMPLETO.');

      try {
        await fetch('http://192.168.16.146:3002/api/evaporador/completeJobs', {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error al llamar a completeJobs:', error);
      }

      // 👉 Navegar después de completar todo
      navigation.navigate('ProcesoScreen', { job });

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
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // o 'position' si no funciona bien
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20} // Ajusta según tu header si tienes
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Registro de Lecturas */}
        <View style={styles.headerBox}>
            <Text style={styles.headerText}>BOM CONFIRMACION:</Text>
            <Text style={styles.headerText}>ASSEMBLY BOX, LID</Text>
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
    [1, "ASSEMBLY, EVAP LID FRAME, ULC", "6700153", "1"],
    [2, "ASSEMBLY, BLOWER MOTOR, EC, ULC", "4490482", "1"],
    [3, "ASSEMBLY, FAN SHROUD, ULC", "490340", "1"],
    [4, 'IMPELLER, BI, CW ROTATION, 12 3/16" X 3 1/8", ALUMINUM', "6400777", "1"],
    [5, 'DOOR PULL, 5 3/4", STEEL, ZP', "7410200", "4"],
    [6, 'SCREW, HWH, SELF-DRILLING, #8-18 X 3/4", 410 SS', "7410222", "9"],
    [7, 'SCREW, PHP, #8-32 X 1/2", 18-8 SS', "2000021", "16"],
    [8, 'SCREW, FPH, #10-32 X 3/4", 18-8 SS', "7410231", "8"],
    [9, 'SCREW, PHP, #10-32 X 1", 18-8 SS', "2000013", "8"]
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
{/* Separador visual antes de BLOWER */}

{/* BLOWER y TORQUE */}
<View style={styles.tableContainer}>
  {/* BLOWER */}
  <View style={styles.tableRow}>
    <View style={[styles.tableCellBase3, styles.colBlow]}>
        <Text style={styles.tableText2}>BLOWER</Text>
        </View>
    <View style={[styles.tableCellBase3, styles.colVer]}>
        <Text style={styles.tableText2}>Verificación de distancia de blower</Text>
        </View>
    <View style={[styles.tableCellBase3, styles.colDist]}>
        <Text style={styles.tableText2}>Distancia requerida:{"\n"}0.25 in</Text>
        </View>
    <View style={[styles.tableCellBase3, styles.colMed]}>
        <Text style={styles.tableText2}>Medida actual</Text>
        </View>
    <View style={[styles.tableCellBase3, styles.colInput]}>
       <TextInput
        keyboardType='numeric'
  style={styles.inputText}
  value={blowerDistance}
  onChangeText={setBlowerDistance}
/>
    </View>
  </View>

  {/* TORQUE */}
  <View style={styles.tableRow2}>
    <View style={[styles.tableCellBase3, styles.colBlow]}>
        <Text style={styles.tableText2}>TORQUE</Text>
        </View>
    <View style={[styles.tableCellBase3, styles.colVer]}>
        <Text style={styles.tableText2}>Verificación de torque</Text>
        </View>
    <View style={[styles.tableCellBase3, styles.colDist]}>
        <Text style={styles.tableText2}>Torque requerido:{"\n"}13 FT-LB</Text>
        </View>
    <View style={[styles.tableCellBase3, styles.colMed]}>
        <Text style={styles.tableText2}>Medida actual</Text>
        </View>
    <View style={[styles.tableCellBase3, styles.colInput]}>
      <TextInput
      keyboardType='numeric'
  style={styles.inputText}
  value={torqueValue}
  onChangeText={setTorqueValue}
/>
    </View>
  </View>
</View>

{/* MOTOR */}
  {/* Encabezado */}
  <View style={styles.tableContainer}>
    <View style={styles.tableRow}>
        <View style={styles.tableCellBase3}>
            <Text style={styles.tableText2}>MOTOR</Text>
        </View>
        <View style={styles.tableCellBase3}>
            <Text style={styles.tableText2}>NUMERO DE SERIE/LOTE</Text>
        </View>
        <View style={styles.tableCellBase3}>
            <Text style={styles.tableText2}>MODELO</Text>
        </View>
    </View>

  {/* Fila con Inputs */}
    <View style={styles.tableRow2}>
        <View style={styles.tableCellBase3}>
            <Text style={styles.tableText}>MOTOR1</Text>
        </View>
        <View style={styles.tableCellBase3}>
           <TextInput
  style={styles.inputText}
  value={serieValue}
  onChangeText={setSerieValue}
/>
        </View>
        <View style={styles.tableCellBase3}>
            <TextInput
  style={styles.inputText}
  value={modeloValue}
  onChangeText={setModeloValue}
/>
        </View>
    </View>
  </View>

 <View style={styles.tableContainer}>
    <View style={styles.tableRow2}>
    <View style={[styles.tableCellBase4, styles.colOBS]}>
        <Text style={styles.tableText2}>OSERVACIONES Y COMENTARIOS</Text></View>
    <View style={[styles.tableCellBase4, styles.colStat]}>
        <Text style={styles.tableText2}>STATUS</Text></View>
    </View>

    <View style={styles.tableRow2}>
    <View style={[styles.tableCellBase4, styles.colOBST]}>
      <TextInput
          style={styles.inputText}
          multiline={true}
          textAlignVertical="top"
          placeholder="Escribe aquí..."
          value={comentarios}
          onChangeText={setComentarios}
      />
    </View>
    <View style={[styles.tableCellBase4, styles.colStat]}>
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
    flex: 4
},
colOBST:{
    flex: 4,
    height: 70
},
colStat:{
    width: 80
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
  flex:1
},
tableCellBase4: {
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
saveMessageText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
},

});

export default LIDScreen;
