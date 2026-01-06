import React, { useEffect, useState } from 'react';
import { 
  View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchCamera } from 'react-native-image-picker';

const EvidenciasScreen = () => {
  const route = useRoute();
  const [folders, setFolders] = useState<string[]>([]);
  const { job } = route.params || {};
  const [folderOptionsVisible, setFolderOptionsVisible] = useState(false);
  const [folderSelectedForOptions, setFolderSelectedForOptions] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameFolderOldName, setRenameFolderOldName] = useState('');
  const [renameFolderNewName, setRenameFolderNewName] = useState('');
  const [loadingImages, setLoadingImages] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [images, setImages] = useState<{ nombreImagen: string; base64: string }[]>([]);
  const [modalImageVisible, setModalImageVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
  uri: string;
  nombreImagen: string;
} | null>(null);

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

    useEffect(() => {
        const loadUserData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };

        loadUserData();
        fetchCarpetasFromAPI();
    }, []);

    const fetchCarpetasFromAPI = async () => {
  if (!job) return;

  try {
    const response = await fetch(`http://192.168.15.161:3000/api/evaporador/carpetasPorJob?job=${encodeURIComponent(job)}`);
    if (!response.ok) {
      throw new Error('No se pudo obtener la lista de carpetas');
    }

    const result = await response.json();
    setFolders(result.carpetas); 

  } catch (error) {
    Alert.alert('No se pudieron cargar las carpetas. Intenta más tarde.');
  }
};
const openRenameModal = (folderName: string) => {
  setRenameFolderOldName(folderName);
  setRenameFolderNewName(folderName);
  setRenameModalVisible(true);
};

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
            </View>
        );
    }

  const handleRenameFolder = async () => {
  const newName = renameFolderNewName.trim();
  if (!newName || !job) return;

  try {
    const response = await fetch(`http://192.168.15.161:3000/api/evaporador/renombrarCarpeta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job,
        carpetaAntigua: renameFolderOldName,
        carpetaNueva: newName,
      }),
    });

    if (response.ok) {
  Alert.alert('✅ Carpeta renombrada');
  fetchCarpetasFromAPI();
} else {
  const errorData = await response.json();
  console.error('Error del servidor:', errorData);
  Alert.alert('❌ Error al renombrar carpeta');
}
  } catch (error) {
    console.error('Error al renombrar:', error);
    Alert.alert('Error', 'No se pudo renombrar la carpeta');
  } finally {
    setRenameModalVisible(false);
  }
};


const confirmDeleteFolder = (folderName: string) => {
  Alert.alert(
    'Eliminar carpeta',
    `¿Deseas eliminar la carpeta "${folderName}" y todas sus imágenes?`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => deleteFolder(folderName),
      },
    ]
  );
};

const deleteFolder = async (folderName: string) => {
  try {
    const response = await fetch(`http://192.168.15.161:3000/api/evaporador/eliminarCarpeta?job=${encodeURIComponent(job)}&carpeta=${encodeURIComponent(folderName)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job: job,
        nombreCarpeta: folderName,
        usuario: user?.Nomina,
      }),
    });

    if (response.ok) {
      Alert.alert('✅ Carpeta eliminada');
      fetchCarpetasFromAPI(); // Actualizar UI
    } else {
      Alert.alert('❌ No se pudo eliminar la carpeta');
    }
  } catch (error) {
    console.error('Error al eliminar carpeta:', error);
    Alert.alert('Error', 'No se pudo eliminar la carpeta');
  }
};


 const createFolder = async () => {
  const folderName = newFolderName.trim();

  if (folderName === '') return;

  try {
    const response = await fetch('http://192.168.15.161:3000/api/evaporador/crearCarpeta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job: job,
        nombreCarpeta: folderName,
        usuario: user?.Nomina,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      Alert.alert(result.message || 'Error al crear carpeta');
      return;
    }

    await fetchCarpetasFromAPI();

    setNewFolderName('');
    setModalVisible(false);

  } catch (error) {
    Alert.alert('Error al crear carpeta. Intenta nuevamente.');
  }
};

const fetchEvidencias = async (job: string, folderName: string) => {
  setLoadingImages(true); // Mostrar loader
  try {
    const response = await fetch(`http://192.168.15.161:3000/api/evaporador/getEvidencias?job=${encodeURIComponent(job)}&carpeta=${encodeURIComponent(folderName)}`);
    if (!response.ok) {
      throw new Error('No se pudieron cargar las evidencias');
    }

    const result = await response.json();
    setImages(result.imagenes || []);
  } catch (error) {
    console.error('Error al obtener evidencias:', error);
    Alert.alert('Error', 'No se pudieron obtener las evidencias.');
  } finally {
    setLoadingImages(false); // Ocultar loader
  }
};

const handleOpenFolder = (folderName: string) => {
  setSelectedFolder(folderName);
  fetchEvidencias(job, folderName); // <-- Agrega "job"
};

  const handleGoBack = () => {
    setSelectedFolder(null);
  };

  const handleTakePhoto = () => {
  const options = {
    mediaType: 'photo',
    saveToPhotos: false,
    includeBase64: true,
    cameraType: 'back',
  };

  console.log("📸 Abriendo cámara con options:", options);

  launchCamera(options, async (response) => {
    console.log("📸 Responsiva de la cámara:", response);

    if (response.didCancel) {
      console.log('Usuario canceló la cámara');
    } else if (response.errorCode) {
    } else {
      const asset = response.assets?.[0];
      if (!asset?.base64) {
        return;
      }

      if (selectedFolder && job) {
        const imageName = `IMG_${Math.floor(Math.random() * 1000000)}`;

        try {
          const result = await fetch('http://192.168.15.161:3000/api/evaporador/evidencias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              job,
              carpeta: selectedFolder,
              nombreImagen: imageName,
              imagenBase64: asset.base64,
            }),
          });
          if (result.ok) {
            await fetchEvidencias(job, selectedFolder);
} else {
}
        } catch (error) {
        }
      }
    }
  });
};

const handleDeleteImage = async () => {
  if (!selectedImage || !selectedFolder || !job) return;

  Alert.alert(
    'Eliminar imagen',
    '¿Estás seguro de que deseas eliminar esta imagen?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const url = `http://192.168.15.161:3000/api/evaporador/eliminarImagen?job=${encodeURIComponent(job)}&carpeta=${encodeURIComponent(selectedFolder)}&nombreImagen=${encodeURIComponent(selectedImage.nombreImagen)}`;

            const response = await fetch(url, {
              method: 'GET',
            });

            if (response.ok) {
              setModalImageVisible(false);
              await fetchEvidencias(job, selectedFolder);
            } else {
              Alert.alert('Error', 'No se pudo eliminar la imagen del servidor.');
            }
          } catch (error) {
            Alert.alert('Error', 'Ocurrió un error al eliminar la imagen.');
          }
        },
      },
    ]
  );
};

  return (
    <View style={styles.container}>
      {/* Botón para abrir modal */}
      {selectedFolder === null && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Crear Carpeta</Text>
        </TouchableOpacity>
      )}

      {/* Contenido */}
      {selectedFolder === null ? (
  <ScrollView contentContainerStyle={styles.folderContainer}>
    {folders.length === 0 ? (
      <>
        <View style={styles.infoRow}>
          <Text style={styles.bold2}>JOB: </Text>
          <Text style={styles.normal}>{job}</Text>
          <Text style={styles.bold2}>NOMINA: </Text>
          <Text style={styles.normal}>{user.Nomina}</Text>
        </View>
        <Text style={styles.emptyText}>No hay carpetas creadas aún.</Text>
      </>
    ) : (
      folders.map((name, index) => (
        <TouchableOpacity
          key={index}
          style={styles.folderItem}
          onPress={() => handleOpenFolder(name)}
           onLongPress={() => {
    setFolderSelectedForOptions(name);
    setFolderOptionsVisible(true);
    }}
        >
          <Image
            source={require('../assets/folder-icon.png')}
            style={styles.folderImage}
          />
          <Text style={styles.folderLabel}>{name}</Text>
        </TouchableOpacity>
      ))
    )}
  </ScrollView>
) : (
  <>
    <TouchableOpacity onPress={handleGoBack}>
      <Text style={styles.back}>⬅ Volver</Text>
    </TouchableOpacity>
    <Text style={styles.title}>📂 {selectedFolder}</Text>

    <ScrollView contentContainerStyle={styles.imageContainer}>
      {loadingImages ? (
  <ActivityIndicator size="large" color="#0011ff" style={{ marginTop: 30 }} />
) : images.length === 0 ? (
  <Text style={styles.emptyText}>No hay imágenes en esta carpeta.</Text>
) : (
  images.map((img, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => {setSelectedImage({
    uri: `data:image/jpeg;base64,${img.base64}`,
    nombreImagen: img.nombreImagen,
  });
  setModalImageVisible(true);
}}
            style={styles.imageThumbnailWrapper}
          >
            <Image
              source={{ uri: `data:image/jpeg;base64,${img.base64}` }}
              style={styles.imageThumbnail}
            />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>

    <View style={styles.fotoButtonContainer}>
      <TouchableOpacity
        style={styles.photoButton}
        onPress={handleTakePhoto}
      >
        <Text style={styles.photoButtonText}>📷 Tomar Fotografía</Text>
      </TouchableOpacity>
    </View>
  </>
)}
      {/* Modal para nombre de carpeta */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nombre de la carpeta</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Carpeta 1"
              value={newFolderName}
              onChangeText={setNewFolderName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={createFolder}
              >
                <Text style={styles.modalButtonText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para ver imagen */}
     <Modal
  visible={modalImageVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setModalImageVisible(false)}
>
  <View style={styles.modalImageOverlay}>
    <Image
      source={{ uri: selectedImage?.uri || '' }}
      style={styles.modalImage}
      resizeMode="contain"
    />
    <View style={styles.modalImageButtons}>
      <TouchableOpacity
        style={[styles.modalImageButton, { backgroundColor: '#ccc' }]}
        onPress={() => setModalImageVisible(false)}
      >
        <Text style={styles.modalImageButtonText}>Cerrar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.modalImageButton, { backgroundColor: '#dc3545' }]}
        onPress={handleDeleteImage}
      >
        <Text style={styles.modalImageButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
<Modal
  visible={folderOptionsVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setFolderOptionsVisible(false)}
>
  <View style={styles.optionsModalOverlay}>
    <View style={styles.optionsModalContent}>
      <TouchableOpacity
        style={styles.optionItem}
        onPress={() => {
          setFolderOptionsVisible(false);
          confirmDeleteFolder(folderSelectedForOptions!);
        }}
      >
        <Image
          source={require('../assets/delete-icon.png')}
          style={styles.optionIcon}
        />
        <Text style={styles.optionText}>Eliminar carpeta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionItem}
        onPress={() => {
          setFolderOptionsVisible(false);
          openRenameModal(folderSelectedForOptions!);
        }}
      >
        <Image
          source={require('../assets/edit-icon.png')}
          style={styles.optionIcon}
        />
        <Text style={styles.optionText}>Renombrar carpeta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionItem, { justifyContent: 'center' }]}
        onPress={() => setFolderOptionsVisible(false)}
      >
        <Text style={[styles.optionText, { color: '#007bff' }]}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
<Modal
  visible={renameModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setRenameModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Renombrar Carpeta</Text>
      <TextInput
        style={styles.input}
        value={renameFolderNewName}
        onChangeText={setRenameFolderNewName}
        placeholder="Nuevo nombre"
      />
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, styles.cancelButton]}
          onPress={() => setRenameModalVisible(false)}
        >
          <Text style={styles.modalButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, styles.createButton]}
          onPress={handleRenameFolder}
        >
          <Text style={styles.modalButtonText}>Renombrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>


    </View>
  );
};

const styles = StyleSheet.create({
  loadingText: {
           fontSize: 14,
           textAlign: 'center',
           marginTop: 80,
       },
       infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    normal: {
        fontSize: 14,
        color: '#a1a1a1ff',
        textAlign: 'center',
        marginRight: 50
    },
    bold2: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#a1a1a1ff',
        textAlign: 'center',
    },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#0011ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  folderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  folderItem: {
    width: '45%',
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    elevation: 3,
  },
  folderImage: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  folderLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
    color: '#777',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  createButton: {
    backgroundColor: '#0011ff',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
   back:{ 
    fontSize: 16,
    marginBottom: 10,
    color: '#0011ff'
    },
   fotoButtonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
},
photoButton: {
  backgroundColor: '#28a745',
  padding: 15,
  borderRadius: 8,
  width: '100%',
},

  photoButtonText: { 
    color: '#fff', 
    textAlign: 'center', 
    fontWeight: 'bold' 
},
  folder: { 
    padding: 15, 
    backgroundColor: '#f2f2f2', 
    marginBottom: 10, 
    borderRadius: 8 
},
  folderText: { 
    fontSize: 16 
},
imageContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  marginTop: 10,
},
imageThumbnailWrapper: {
  width: '45%',
  margin: 8,
  borderRadius: 8,
  overflow: 'hidden',
  elevation: 3,
  backgroundColor: '#fff',
},
imageThumbnail: {
  width: '100%',
  height: 150,
},
modalImageOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.9)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalImageCloseArea: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
},
modalImage: {
  width: '90%',
  height: '80%',
  borderRadius: 10,
},
modalImageButtons: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginTop: 20,
  width: '80%',
},
modalImageButton: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 6,
},
modalImageButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  textAlign: 'center',
},
optionsModalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},
optionsModalContent: {
  width: '80%',
  backgroundColor: '#fff',
  borderRadius: 10,
  paddingVertical: 20,
  paddingHorizontal: 15,
},
optionItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
},
optionIcon: {
  width: 24,
  height: 24,
  marginRight: 15,
},
optionText: {
  fontSize: 16,
},


});

export default EvidenciasScreen;
