import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ImageBackground, Alert, KeyboardAvoidingView, Platform} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const FinalCheckScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const [comentarios, setComentarios] = useState('');
    const [user, setUser] = useState<any>(null);
    const [statusChecked, setStatusChecked] = useState(false);
    const [checkedCleaning, setCheckedCleaning] = useState(Array(4).fill(false));
    const [checkedBlower, setCheckedBlower] = useState(Array(2).fill(false));
    const [checkedItems, setCheckedItems] = useState(
        Array(7).fill(false)
    );
    const fechaISO = new Date().toISOString();
    const formatFechaLocal = (fechaISO: string) => {
    const date = new Date(fechaISO);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
    };
    const { job } = route.params || {};

    useEffect(() => {
    const allItemsChecked = checkedItems.every(item => item);
    const allCleaningChecked = checkedCleaning.every(item => item);
    const allBlowerChecked = checkedBlower.every(item => item);

    if (allItemsChecked && allCleaningChecked && allBlowerChecked) {
        setStatusChecked(true);
    } else {
        setStatusChecked(false);
    }
}, [checkedItems, checkedCleaning, checkedBlower]);


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
            checkboxes: [...checkedItems, ...checkedCleaning, ...checkedBlower],
            comentarios
          };

          try {
            const response = await fetch('http://192.168.16.146:3002/api/evaporador/incompleteFinal', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });

            console.log('Total checkboxes:', [...checkedItems, ...checkedCleaning, ...checkedBlower].length);
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

              navigation.navigate('Menu', { job });
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
    checkboxes: [...checkedItems, ...checkedCleaning, ...checkedBlower],
    comentarios
  });

  try {
    const response = await fetch('http://192.168.16.146:3002/api/evaporador/completeFinal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job,
        fecha: fechaISO,
        nomina: user?.Nomina,
        checkboxes: [...checkedItems, ...checkedCleaning, ...checkedBlower],
        comentarios
      }),
    });

    console.log('Total checkboxes:', [...checkedItems, ...checkedCleaning, ...checkedBlower].length);
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

      navigation.navigate('Menu', { job });
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
        {/* Tu contenido aquí */}
        {/* Registro de Lecturas */}
        <View style={styles.headerBox}>
            <Text style={styles.headerText}>BOM CONFIRMACION:</Text>
            <Text style={styles.headerText}>Checklist Final</Text>
        </View>

        {/* Instrucciones */}
        <View style={styles.sectionBox}>
            <View style={styles.instructionsWrapper}>
                <Text style={styles.instructionText}>
                    <Text style={styles.bold}>Instrucciones: </Text>
                    Examine cada apartado del checklist, que incluye secciones especificas para verificar la ausencia de rayones, golpes y otros defectos críticos.
                    Cada sección debe ser inspeccionada minuciosamente y compara con los estándares de calidad establecidos.
                    Al completar la revisión de cada criterio, marque la casilla correspondiente, si el componente cumple con los requisitos o no la marque si presenta algún defecto.
                    Registre cualquier incidencia en el espacio designado para comentarios y observaciones.
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

  {/* Filas de datos */}
  <View style={styles.tableContainer}>
  {/* Encabezados */}
  <View style={styles.tableRowHeader}>
    <View style={styles.colItem}>
      <Text style={styles.headerTABLE}>VERIFICACIÓN</Text>
    </View>
    <View style={styles.colDesc}>
      <Text style={styles.headerTABLE}>DESCRIPCIÓN</Text>
    </View>
    <View style={styles.colStatus}>
      <Text style={styles.headerTABLE}>STATUS</Text>
    </View>
  </View>

  {[
  ["1. Confirmación de subensamble", "El ensamblaje final debe contener todos los subensambles completos y correctamente instalados"],
  ["2. Inspección de remaches", "Todos los remaches deben estar presentes, correctamente instalados y asegurados. Verificar que no haya remaches sueltos o mal colocados"],
  ["3. Revisión de daños físicos", "El ensamblaje no debe presentar golpes, abolladuras ni deformaciones. Inspeccionar cuidadosamente todas las superficies visibles para detectar daños estructurales"],
  ["4. Revisión de rayaduras", "El ensamblaje de piezas de aluminio y Versitex debe estar libre de rayaduras, marcas o defectos en la superficie. Es necesario verificar todas las áreas expuestas para asegurar una presentación impecable y una funcionalidad óptima."]
].map(([item, desc], idx) => (
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

  {/* Sección 5: Limpieza general (Simula rowspan) */}
<View style={styles.tableRow}>
  <View style={[styles.tableCellBase, styles.colItemLimp]}>
    <Text style={[styles.tableText]}>5. Limpieza General</Text>
  </View>
  <View style={[styles.tableCellBase, styles.colDesc]}>
    <Text style={styles.tableText}>Realizar una limpieza completa del ensamblaje para eliminar cualquier residuo como:</Text>
  </View>
  <View style={[styles.tableCellBase, styles.colStatus]} />
</View>

{["A) Espuma", "B) Silicón", "C) Soldadura o cualquier otro material", "Asegurarse que no queden restos de material que puedan afectar la funcionalidad o apariencia de marcas o trazos"].map((label, idx) => (
  <TouchableOpacity
    key={`clean-${idx}`}
    style={[
      styles.tableRow,
      { backgroundColor: checkedCleaning[idx] ? '#d0f0c0' : '#fff' }
    ]}
    onPress={() => {
      const updated = [...checkedCleaning];
      updated[idx] = !updated[idx];
      setCheckedCleaning(updated);
    }}
  >
    <View style={styles.colItemLimp} />
    <View style={[styles.tableCellBase, styles.colDesc5]}>
      <Text style={styles.tableText}>{label}</Text>
    </View>
    <View style={[styles.tableCellBase, styles.colStatus]}>
      <CheckBox
        value={checkedCleaning[idx]}
        onValueChange={() => {
          const updated = [...checkedCleaning];
          updated[idx] = !updated[idx];
          setCheckedCleaning(updated);
        }}
        tintColors={{ true: 'black', false: 'black' }}
      />
    </View>
  </TouchableOpacity>
))}

{/* Sección 6: Verificación del Blower (Simula rowspan) */}
<TouchableOpacity
  style={[
    styles.tableRow,
    { backgroundColor: checkedBlower[0] ? '#d0f0c0' : '#fff' }
  ]}
  onPress={() => {
    const updated = [...checkedBlower];
    updated[0] = !updated[0];
    setCheckedBlower(updated);
  }}
>
  <View style={[styles.tableCellBase, styles.colItemBLOW]}>
    <Text style={styles.tableText}>6. Verificación del Blower</Text>
  </View>
  <View style={[styles.tableCellBase, styles.colDesc7]}>
    <Text style={styles.tableText}>A) Torque 13 FT-LB</Text>
  </View>
  <View style={[styles.tableCellBase, styles.colStatus]}>
    <CheckBox
      value={checkedBlower[0]}
      onValueChange={() => {
        const updated = [...checkedBlower];
        updated[0] = !updated[0];
        setCheckedBlower(updated);
      }}
      tintColors={{ true: 'black', false: 'black' }}
    />
  </View>
</TouchableOpacity>

<TouchableOpacity
  style={[
    styles.tableRow,
    { backgroundColor: checkedBlower[1] ? '#d0f0c0' : '#fff' }
  ]}
  onPress={() => {
    const updated = [...checkedBlower];
    updated[1] = !updated[1];
    setCheckedBlower(updated);
  }}
>
  <View style={styles.colItemLimp2} />
  <View style={[styles.tableCellBase, styles.colDesc6]}>
    <Text style={styles.tableText}>B) Verificar que el blower se coloque a una distancia de 1/4"</Text>
  </View>
  <View style={[styles.tableCellBase, styles.colStatus]}>
    <CheckBox
      value={checkedBlower[1]}
      onValueChange={() => {
        const updated = [...checkedBlower];
        updated[1] = !updated[1];
        setCheckedBlower(updated);
      }}
      tintColors={{ true: 'black', false: 'black' }}
    />
  </View>
</TouchableOpacity>


  {[
  ["7. Verificación de ajustes y alineación", "Comprobar que todos los componentes estén correctamente alineados y ajustados según las especificaciones del diseño."],
  ["8. Continuidad del circuito", "Verificación de la continuidad del circuito utilizando un multímetro, garantizando que la lectura de ohmios esté dentro de las especificaciones toleradas."],
  ["9. Documentación y etiquetado", "Asegurar que el ensamblaje esté debidamente documentado y etiquetado, conforme a los procedimientos de calidad."]
].map(([item, desc], idx) => (
  <TouchableOpacity
    key={idx + 6}
    style={[
      styles.tableRow,
      { backgroundColor: checkedItems[idx + 4] ? '#d0f0c0' : '#fff' }
    ]}
    onPress={() => {
      const updated = [...checkedItems];
      updated[idx + 4] = !updated[idx + 4];
      setCheckedItems(updated);
    }}
  >
    <View style={[styles.tableCellBase, styles.colItem7]}>
      <Text style={styles.tableText}>{item}</Text>
    </View>
    <View style={[styles.tableCellBase, styles.colDesc]}>
      <Text style={styles.tableText}>{desc}</Text>
    </View>
    <View style={[styles.tableCellBase, styles.colStatus]}>
      <CheckBox
        value={checkedItems[idx + 4]}
        onValueChange={() => {
          const updated = [...checkedItems];
          updated[idx + 4] = !updated[idx + 4];
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
    disabled={!(
  checkedItems.every(item => item) &&
  checkedCleaning.every(item => item) &&
  checkedBlower.every(item => item)
)}
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
        </ScrollView>
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
        fontSize: 13,
    },
    tableText2: {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    colItem: {
        width: 115,
    },
    colItem7: {
        width: 115,
        borderTopWidth:1
    },
    colItemLimp: {
        width: 115,
        borderRightWidth: 1,
        borderLeftWidth: 1,
        borderBottomColor: 'white'
    },
    colItemLimp2: {
        width: 115,
        borderRightWidth: 1,
        borderLeftWidth: 1,
        borderBottomWidth:1,
        borderBottomColor: 'black'
    },
    colItemBLOW: {
        width: 115,
        borderRightWidth: 1,
        borderLeftWidth: 1,
        borderTopWidth: 2,
        borderTopColor: 'black',
        borderBottomColor: 'white'
    },
    colItem5: {
        width: 115,
        borderWidth: 0,
    },
    colDesc5: {
        flex: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderBottomColor: 'white',
        borderTopWidth: 0.5
    },
    colDesc6: {
        flex: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderBottomColor: 'black'
    },
    colDesc7: {
        flex: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 2,
        borderTopColor: 'black',
        borderLeftColor: 'black',
        borderRightColor: 'black'
    },
    colDesc4: {
        flex: 1,
       // borderLeftWidth: 1,
     //   borderBottomColor: 'black'
    },
    colDesc: {
        flex: 1,
    },
    colStatus: {
        width: 60,
    },
    colOBS:{
        flex: 4,
    },
    colOBST:{
        flex: 4,
        height: 70
    },
    colStat:{
        flex: 0.5
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
        fontSize: 13,
        padding: 4,
        textAlign: 'center',
        width: '100%',
        color: 'black'
},
    input: {
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 4,
        fontSize: 12,
        width: '100%',
},


});

export default FinalCheckScreen;
