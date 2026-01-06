import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Animated,
    Image,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import logo from '../assets/Tafco-logo.png';
import Icon from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
    Login: undefined;
    Inicio: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [ID, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusPassword, setFocusPassword] = useState(false);
    const [error, setError] = useState('');
    const [focusID, setFocusID] = useState(false);
    const passwordRef = useRef<TextInput>(null);

    const animID = useRef(new Animated.Value(ID ? 1 : 0)).current;
    const animPassword = useRef(new Animated.Value(password ? 1 : 0)).current;

    
    const handleFocus = (field: string) => {
        if (field === 'ID') {
            setFocusID(true);
            Animated.timing(animID, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false
            }).start();
        } else {
            setFocusPassword(true);
            Animated.timing(animPassword, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false
            }).start();
        }
    };

    const handleBlur = (field: string) => {
        if (field === 'ID' && !ID) {
            setFocusID(false);
            Animated.timing(animID, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start();
        } else if (field === 'password' && !password) {
            setFocusPassword(false);
            Animated.timing(animPassword, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start();
        }
    };

    const getLabelStyle = (animation: Animated.Value) => ({
        position: 'absolute' as const,
        left: 10,
        top: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [18, -30]
        }),
        fontSize: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 14]
        }),
        color: '#666',
        paddingHorizontal: 1,
        fontFamily: 'Gayathri-Regular'
    });

    const handleLogin = async () => {
    try {
        setError('');

        const response = await fetch('http://192.168.15.161:3000/api/evaporador/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ID, password }), // <-- CORREGIDO
        });

        const data = await response.json();

        if (!response.ok) {
            const message = data.message || 'There was an error';
            if (response.status === 401) {
                Alert.alert('Wrong user or password', message);
            } else {
                Alert.alert('Error on server: ', message);
            }
            return;
        }

        if (data?.user) {
            await AsyncStorage.setItem('user', JSON.stringify(data.user));

            setId('');
            setPassword('');

            navigation.navigate('Inicio');
        } else {
            Alert.alert('Invalid response from server');
        }

    } catch (err) {
        console.log('Error:', err);
        Alert.alert('Unable to connect to server. Check your connection');
    }
};


    return (
        <ImageBackground
            source={require('../assets/bg1-eb.jpg')}
            resizeMode="cover"
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>ULC Inspection Check List</Text>
            </View>

            <Text style={styles.subtitle}>Login</Text>
            <View style={styles.inputContainer}>
                <View style={{ width: '95%', marginBottom: 40 }}>

                    <Animated.Text style={getLabelStyle(animID)}>ID</Animated.Text>
                    <TextInput
                        style={styles.input}
                        value={ID}
                        keyboardType='numeric'
                        onChangeText={setId}
                        onFocus={() => handleFocus('ID')}
                        onBlur={() => handleBlur('ID')}
                        placeholder={focusID ? '' : 'ID'}
                        onSubmitEditing={() => passwordRef?.current?.focus()}
                    />
                </View>

                <View style={{ width: '95%', marginBottom: 20 }}>
    <Animated.Text style={getLabelStyle(animPassword)}>Password</Animated.Text>
    <View style={styles.passwordContainer}>
        <TextInput
            style={styles.input}
            value={password}
            ref={passwordRef}
            onChangeText={setPassword}
            onFocus={() => handleFocus('password')}
            onBlur={() => handleBlur('password')}
            placeholder={focusPassword ? '' : 'Password'}
            onSubmitEditing={handleLogin}
            secureTextEntry={!showPassword}
        />
        <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setShowPassword(!showPassword)}
        >
            <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color="#3b7fb8"
            />
        </TouchableOpacity>
            </View>
        </View>
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>→</Text>
                </TouchableOpacity>
            </View>
            <Image style={{ marginTop: 1, width: 300, height: 125 }} source={logo} />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
        backgroundColor: 'white',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        marginTop: 10,
        fontSize: 30,
        color: '#333',
        fontFamily: 'Poppins-Regular'
    },
    subtitle: {
        fontSize: 22,
        color: '#000000ff',
        alignSelf: 'flex-start',
        marginLeft: 15,
        marginBottom: 50,
        fontFamily: 'Gayathri-Regular'
    },
    inputContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 0.7,
    },
   passwordContainer: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
},
iconContainer: {
    position: 'absolute',
    right: 10,
    top: 22,
    padding: 5,
},

    input: {
        width: '100%',
        height: 65,
        borderColor: '#e2e0e0',
        borderWidth: 2,
        paddingLeft: 10,
        borderRadius: 10,
        backgroundColor: 'white',
        color: 'black',
        fontFamily: 'Gayathri-Regular',
        fontSize: 14
    },
    button: {
        marginTop: 30,
        width: 70,
        height: 70,
        borderRadius: 40,
        backgroundColor: '#3b7fb8',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginRight: 20
    },
    buttonText: {
        fontSize: 30,
        color: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },

});

export default LoginScreen;