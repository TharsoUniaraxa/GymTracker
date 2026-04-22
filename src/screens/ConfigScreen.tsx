import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Exercicio, GrupoMuscular, Equipamento } from '../types';
import { exercicioService } from '../services/exercicioService';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Config'>;
  route:      RouteProp<RootStackParamList, 'Config'>;
};

const GRUPOS: GrupoMuscular[] = [
  'quadriceps', 'isquiotibiais', 'gluteos', 'panturrilha',
  'peitoral', 'peitoral_superior', 'dorsal',
  'deltoide_anterior', 'deltoide_medial', 'deltoide_posterior',
  'biceps', 'triceps', 'abdomen', 'trapezio',
];

const EQUIPAMENTOS: Equipamento[] = [
  'barra', 'halteres', 'maquina', 'cabo', 'peso_corporal', 'outro',
];

const LIMITE_CUSTOM = 20;

export default function ConfigScreen({ navigation, route }: Props) {
  const { usuarioId } = route.params;

  const [customs, setCustoms]   = useState<Exercicio[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  const [nome, setNome]         = useState('');
  const [grupoFoco, setGrupoFoco]       = useState<GrupoMuscular>('peitoral');
  const [equipamento, setEquipamento]   = useState<Equipamento>('halteres');

  useEffect(() => {
    fetchCustoms();
  }, []);

  const fetchCustoms = async () => {
    try {
      setLoading(true);
      const todos = await exercicioService.listForUsuario(usuarioId);
      setCustoms(todos.filter(e => !e.padrao));
    } catch {
      Alert.alert('Error', 'Could not load exercises.');
    } finally {
      setLoading(false);
    }
  };

  const podeAdicionar = customs.length < LIMITE_CUSTOM;

  const adicionarCustom = async () => {
    if (!nome.trim()) {
      Alert.alert('Error', 'Give the exercise a name.');
      return;
    }
    if (!podeAdicionar) return;

    try {
      setSaving(true);
      const novo = await exercicioService.save({
        nome:             nome.trim(),
        grupoFoco,
        grupoSecundario:  null,
        equipamento,
        padrao:           false,
        usuarioId,
      });
      setCustoms(prev => [...prev, novo]);
      setNome('');
    } catch {
      Alert.alert('Error', 'Could not save exercise.');
    } finally {
      setSaving(false);
    }
  };

  const removerCustom = (ex: Exercicio) => {
    Alert.alert(
      'Delete exercise',
      `Delete "${ex.nome}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await exercicioService.delete(ex.id);
              setCustoms(prev => prev.filter(e => String(e.id) !== String(ex.id)));
            } catch {
              Alert.alert('Error', 'Could not delete exercise.');
            }
          },
        },
      ]
    );
  };

  const logout = async () => {
    await AsyncStorage.removeItem('usuario_logado');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#c8ff00" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <Text style={styles.sectionTitle}>Custom exercises ({customs.length}/{LIMITE_CUSTOM})</Text>

      {customs.length === 0 && (
        <Text style={styles.empty}>No custom exercises yet.</Text>
      )}

      {customs.map(ex => (
        <View key={String(ex.id)} style={styles.customRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.customName}>{ex.nome}</Text>
            <Text style={styles.customSub}>
              {ex.grupoFoco} · {ex.equipamento}
            </Text>
          </View>
          <TouchableOpacity onPress={() => removerCustom(ex)}>
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Add new</Text>

      <TextInput
        style={styles.input}
        placeholder="Exercise name"
        placeholderTextColor="#666"
        value={nome}
        onChangeText={setNome}
        editable={podeAdicionar}
      />

      <Text style={styles.label}>Primary muscle</Text>
      <View style={styles.chipRow}>
        {GRUPOS.map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, grupoFoco === g && styles.chipActive]}
            onPress={() => setGrupoFoco(g)}
          >
            <Text style={[styles.chipText, grupoFoco === g && styles.chipTextActive]}>
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Equipment</Text>
      <View style={styles.chipRow}>
        {EQUIPAMENTOS.map(eq => (
          <TouchableOpacity
            key={eq}
            style={[styles.chip, equipamento === eq && styles.chipActive]}
            onPress={() => setEquipamento(eq)}
          >
            <Text style={[styles.chipText, equipamento === eq && styles.chipTextActive]}>
              {eq}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.addBtn, (!podeAdicionar || saving) && styles.addBtnDisabled]}
        onPress={adicionarCustom}
        disabled={!podeAdicionar || saving}
      >
        {saving
          ? <ActivityIndicator color="#000" />
          : <Text style={styles.addBtnText}>
              {podeAdicionar ? 'Add Exercise' : 'Limit reached (20)'}
            </Text>
        }
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0d0d0d', paddingHorizontal: 20 },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0d0d' },
  header:         { paddingTop: 56, paddingBottom: 20 },
  back:           { color: '#c8ff00', fontSize: 15, marginBottom: 12 },
  title:          { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  sectionTitle:   { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 12, marginBottom: 10 },
  empty:          { color: '#555', fontSize: 13, marginBottom: 10 },
  customRow: {
    backgroundColor: '#1a1a1a', borderRadius: 10, padding: 14,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  customName:     { color: '#fff', fontSize: 15, fontWeight: '600' },
  customSub:      { color: '#666', fontSize: 12, marginTop: 2 },
  deleteIcon:     { fontSize: 18, paddingHorizontal: 6 },
  input: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 10, padding: 14, color: '#fff', fontSize: 16, marginBottom: 12,
  },
  label:          { color: '#666', fontSize: 12, marginBottom: 8, marginTop: 8 },
  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  chip: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  chipActive:     { backgroundColor: '#1e2200', borderColor: '#c8ff00' },
  chipText:       { color: '#888', fontSize: 12 },
  chipTextActive: { color: '#c8ff00' },
  addBtn:         { backgroundColor: '#c8ff00', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  addBtnDisabled: { backgroundColor: '#2a2a2a' },
  addBtnText:     { color: '#000', fontWeight: 'bold', fontSize: 16 },
  divider:        { height: 1, backgroundColor: '#2a2a2a', marginVertical: 28 },
  logoutBtn:      { backgroundColor: '#1a1a1a', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ff4444' },
  logoutText:     { color: '#ff4444', fontWeight: 'bold', fontSize: 15 },
});
