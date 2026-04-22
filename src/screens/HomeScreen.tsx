import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { RootStackParamList } from '../../App';
import { Ficha } from '../types';
import { fichaService } from '../services/fichaService';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
  route:      RouteProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation, route }: Props) {
  const { usuarioId, usuarioNome } = route.params;

  const [fichas, setFichas]     = useState<Ficha[]>([]);
  const [loading, setLoading]   = useState(true);

useFocusEffect(
  useCallback(() => {
    fetchFichas();
  }, [])
);

const fetchFichas = async () => {
    try {
      setLoading(true);
      const filtradas = await fichaService.listByUsuario(usuarioId);
      setFichas(filtradas);
    } catch (e) {
      Alert.alert('Error', 'Could not load workout plans.');
    } finally {
      setLoading(false);
    }
  };

  const podeAdicionarFicha = fichas.length < 10;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#c8ff00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Hey, {usuarioNome.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>Your workout plans</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Config', { usuarioId })}
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={fichas}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No workout plans yet. Create your first one!</Text>
        }
renderItem={({ item }) => (
  <View style={styles.card}>
    <TouchableOpacity
      style={{ flex: 1 }}
      onPress={() => navigation.navigate('TreinoAtivo', {
        usuarioId,
        fichaId:      item.id,
        fichaNome:    item.nome,
        exercicioIds: item.exercicioIds,
      })}
    >
      <Text style={styles.cardTitle}>{item.nome}</Text>
      <Text style={styles.cardSub}>{item.exercicioIds.length} exercises</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.deleteBtn}
      onPress={() =>
        Alert.alert(
          'Delete plan',
          `Delete "${item.nome}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await fichaService.delete(item.id);
                  setFichas(prev => prev.filter(f => String(f.id) !== String(item.id)));
                } catch {
                  Alert.alert('Error', 'Could not delete plan.');
                }
              },
            },
          ]
        )
      }
    >
      <Text style={styles.deleteBtnText}>🗑</Text>
    </TouchableOpacity>
  </View>
)}
      />

      <TouchableOpacity
        style={[styles.fab, !podeAdicionarFicha && styles.fabDisabled]}
        disabled={!podeAdicionarFicha}
        onPress={() => navigation.navigate('CriarFicha', { usuarioId })}
      >
        <Text style={styles.fabText}>
          {podeAdicionarFicha ? '+ New Plan' : 'Limit reached (10)'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0d0d0d', paddingHorizontal: 20 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0d0d' },
  header:      { paddingTop: 60, paddingBottom: 24 },
  headerRow:   { flexDirection: 'row', alignItems: 'center' },
  greeting:    { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle:    { fontSize: 14, color: '#666', marginTop: 4 },
  settingsBtn: { padding: 8 },
  settingsIcon:{ fontSize: 22, color: '#c8ff00' },
  empty:       { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 15 },
card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBtn: {
    paddingLeft: 12,
  },
  deleteBtnText: {
    fontSize: 20,
  },
  cardTitle:   { color: '#fff', fontSize: 17, fontWeight: '600' },
  cardSub:     { color: '#666', fontSize: 13, marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    backgroundColor: '#c8ff00',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  fabDisabled: { backgroundColor: '#2a2a2a' },
  fabText:     { color: '#000', fontWeight: 'bold', fontSize: 16 },
});