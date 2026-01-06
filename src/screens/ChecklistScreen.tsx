import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ImageBackground, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logo from '../assets/Tafco-logo.png';

const checkpointsList = [
  "Verify ceiling hole locations using Template",
  "Caulk all panel/seams (ceiling)",
  "Check caulking - Door Frame, Ceiling, Trim (interior/exterior)",
  "Clean metal Shavings",
  "Remove film ceiling / Floor",
  "Cardboard on floor",
  "Check, Retap threaded holes (Ceiling 5/16-18)(Floor 1/2-13)",
  "Cut gasket relief",
  "Adjust doors for gasket compress",
  "Verify ductwork is installed",
  "Verify VRP is installed",
  "Middle box, Terminal box, Screens, Wiring all Installed",
  "Test Screens/Wiring with Install test box",
  "Stack Light in middle box",
  "FARRAR/Forced Air Convection Labels installed and in correct location",
  "UL tags with serial numbers",
  "Pilasters and Inner Doors",
  "Remote Contact Label",
  "Verify ceiling hole locations using Template",
  "Caulk all panel/seams (ceiling)",
  "Energy Star label ULC-190 ONLY",
  "Check special rear top trim ULC-190 ONLY"
];

const ChecklistScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [checkedItems, setCheckedItems] = useState(Array(checkpointsList.length).fill(false));
  const [observaciones, setObservaciones] = useState(Array(checkpointsList.length).fill(''));
  const [statusChecked, setStatusChecked] = useState(false);
  const [comentariosGenerales, setComentariosGenerales] = useState('');
  const fechaISO = new Date().toISOString();
  const { jobid, job, project } = route.params || {};

  useEffect(() => {
    const allItemsChecked = checkedItems.every(item => item);
    setStatusChecked(allItemsChecked);
  }, [checkedItems]);

  useEffect(() => {
    const loadUserData = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    };
    loadUserData();
  }, []);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading user information...</Text>
      </View>
    );
  }

  const handleSave = async (status) => {
  const payload = {
    jobid: jobid,
    userID: user?.ID,
    fecha: fechaISO,
    status,
    generalComment: comentariosGenerales,   // ✅ AHORA SÍ EXISTE
    checkpoints: observaciones.map((obs, idx) => ({
      checkpointID: idx + 1,
      value: checkedItems[idx],
      comment: obs || ""
    }))
  };

  console.log("📤 PAYLOAD ENVIADO:", payload);

  try {
    const response = await fetch(
      'http://192.168.15.161:3000/api/evaporador/saveJobCheckpoints',
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (result.success) {
      Alert.alert("Saved", `Checklist saved as ${status}.`);
      navigation.navigate("Menu", { job });
    } else {
      Alert.alert("Error saving data", result.message || "Unknown error");
    }

  } catch (error) {
    console.error("Error saving:", error);
    Alert.alert("Error", "Unable to save checklist.");
  }
};


  const formatFechaLocal = (fechaISO: string) => {
    const date = new Date(fechaISO);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  };

  return (
    <ImageBackground source={require('../assets/bg1-eb.jpg')} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerBox}>
            <Text style={styles.headerText}>Inspection Check List</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.bold2}>Date: </Text>
            <Text style={styles.normal}>{formatFechaLocal(fechaISO)}</Text>
            <Text style={styles.bold2}>JOB: </Text>
            <Text style={styles.normal}>{job}</Text>
            <Text style={styles.normal}>{jobid}</Text>
            <Text style={styles.bold2}>ID: </Text>
            <Text style={styles.normal}>{user.ID}</Text>
          </View>

          <View style={styles.tableContainer}>
            {/* Headers */}
            <View style={styles.tableRowHeader}>
              <View style={styles.colDesc}><Text style={styles.headerTABLE}>POINT INSPECTION</Text></View>
              <View style={styles.colStatus}><Text style={styles.headerTABLE}>STATUS</Text></View>
              <View style={styles.colComm}><Text style={styles.headerTABLE}>Observations</Text></View>
            </View>

            {checkpointsList.map((desc, idx) => (
              <View key={idx} style={styles.tableRow}>
                {/* Description */}
                <View style={[styles.tableCellBase, styles.colDesc]}>
                  <Text style={styles.tableText}>{desc.replace('ULC-190 ONLY', '').trim()}</Text>
                  {desc.includes('ULC-190 ONLY') && <Text style={{ color: 'red', fontWeight: 'bold' }}>ULC-190 ONLY</Text>}
                </View>

                {/* Checkbox */}
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

                {/* Comment */}
                <View style={[styles.tableCellBase, styles.colComm]}>
                  <TextInput
                    style={styles.inputText}
                    multiline
                    value={observaciones[idx]}
                    onChangeText={(text) => {
                      const updated = [...observaciones];
                      updated[idx] = text;
                      setObservaciones(updated);
                    }}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            ))}
          </View>

<View style={styles.CommentsContainer}>
    <View style={styles.tableRow2}>
    <View style={[styles.tableCellBase3, styles.colOBS]}>
        <Text style={styles.tableText2}>GENERAL OSERVATIONS</Text></View>
    <View style={[styles.tableCellBase3, styles.colStat]}>
        <Text style={styles.tableText2}>STATUS</Text></View>
    </View>

    <View style={styles.tableRow2}>
    <View style={[styles.tableCellBase3, styles.colOBST]}>
      <TextInput
                  style={styles.inputText}
                  multiline
                  value={comentariosGenerales}
                  onChangeText={setComentariosGenerales}
                  placeholder="Write something..."
                  textAlignVertical="top"
                />
    </View>
    <View style={[styles.tableCellBase3, styles.colStat]}>
       <CheckBox value={statusChecked} disabled={!checkedItems.every(item => item)} tintColors={{ true: 'black', false: 'gray' }} />
              </View>
            </View>
          </View>

          <Image style={styles.footerLogo} source={logo} />

          <TouchableOpacity style={styles.saveButton} onPress={() => {
  if (!statusChecked) {
    handleSave("INCOMPLETE");
  } else {
    handleSave("COMPLETE");
  }
}}>
            <Text style={styles.saveButtonText}>GUARDAR</Text>
          </TouchableOpacity>
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
    backgroundColor: '#404dfdff',
    padding: 15,
    marginBottom: 1,
    alignItems: 'center'
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
    // marginTop: 50,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#fff',
  },
  CommentsContainer: {
    marginVertical: 10,
    marginHorizontal: 5,
    marginTop: 50,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#fff',
  },
  colComm: {
    flex: 0.7,
    minHeight: 45,
    justifyContent: "center",
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
  headerTABLE: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableText: {
    fontSize: 16,
  },
  tableText2: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  colDesc: {
    flex: 0.7,   // si lo usa otra fila
    alignItems: 'flex-start'
  },
  colStatus: {
    flex: 0.13,   // 30% del ancho
    alignItems: 'center',
    justifyContent: 'center'
  },
  colOBS:{
    flex: 4,
  },
  colOBST:{
    flex: 4,
    height: 70
  },
  colStat:{
    flex: 0.43
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
  footerLogo: {
    position: 'absolute',
    bottom: 100,       // separacion desde abajo
    alignSelf: 'center',
    width: 400,
    height: 200,
    resizeMode: 'contain',
    opacity: 0.2,
  },

});

export default ChecklistScreen;
