import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Usuario } from '../types';
import { usuarioService } from '../services/usuarioService';

const STORAGE_KEY = 'usuario_logado';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail]           = useState('');
  const [senha, setSenha]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const u: Usuario = JSON.parse(raw);
          navigation.replace('Home', {
            usuarioId:   Number(u.id),
            usuarioNome: u.nome,
          });
          return;
        }
      } catch {
        // ignora: segue pro login manual
      }
      setBootstrapping(false);
    })();
  }, []);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Error', 'Fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const usuario = await usuarioService.login(email, senha);

      if (usuario) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
        navigation.replace('Home', {
          usuarioId:   Number(usuario.id),
          usuarioNome: usuario.nome,
        });
      } else {
        Alert.alert('Error', 'Invalid email or password.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  if (bootstrapping) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#c8ff00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GymTracker</Text>
      <Text style={styles.subtitle}>Track smarter. Train harder.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#000" />
          : <Text style={styles.buttonText}>Enter</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#c8ff00',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#c8ff00',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});