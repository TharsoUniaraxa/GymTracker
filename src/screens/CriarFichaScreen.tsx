import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Exercicio } from '../types';
import { exercicioService } from '../services/exercicioService';
import { fichaService } from '../services/fichaService';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'CriarFicha'>;
  route:      RouteProp<RootStackParamList, 'CriarFicha'>;
};

export default function CriarFichaScreen({ navigation, route }: Props) {
  const { usuarioId } = route.params;

  const [exercicios, setExercicios]     = useState<Exercicio[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [nomeFicha, setNomeFicha]       = useState('');
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    fetchExercicios();
  }, []);

  const fetchExercicios = async () => {
    try {
      const visiveis = await exercicioService.listForUsuario(usuarioId);
      setExercicios(visiveis);
    } catch {
      Alert.alert('Error', 'Could not load exercises.');
    } finally {
      setLoading(false);
    }
  };

const toggleExercicio = (id: any) => {
    const strId = String(id);
    setSelecionados(prev =>
      prev.map(String).includes(strId)
        ? prev.filter(x => String(x) !== strId)
        : [...prev, id]
    );
  };

  const salvarFicha = async () => {
    if (!nomeFicha.trim()) {
      Alert.alert('Error', 'Give your workout plan a name.');
      return;
    }
    if (selecionados.length === 0) {
      Alert.alert('Error', 'Select at least one exercise.');
      return;
    }

    try {
      setSaving(true);
      await fichaService.save({
        nome:         nomeFicha.trim(),
        usuarioId,
        exercicioIds: selecionados,
        criadoEm:     new Date().toISOString(),
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save workout plan.');
    } finally {
      setSaving(false);
    }
  };

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Workout Plan</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Plan name (e.g. Push A)"
        placeholderTextColor="#666"
        value={nomeFicha}
        onChangeText={setNomeFicha}
      />

      <Text style={styles.label}>
        Select exercises ({selecionados.length} selected)
      </Text>

      <FlatList
        data={exercicios}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => {
          const selected = selecionados.map(String).includes(String(item.id));
          return (
            <TouchableOpacity
              style={[styles.card, selected && styles.cardSelected]}
              onPress={() => toggleExercicio(item.id)}
            >
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle}>{item.nome}</Text>
                {selected && <Text style={styles.check}>✓</Text>}
              </View>
              <Text style={styles.cardSub}>
                {item.grupoFoco}{item.grupoSecundario ? ` · ${item.grupoSecundario}` : ''} · {item.equipamento}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={salvarFicha}
        disabled={saving}
      >
        {saving
          ? <ActivityIndicator color="#000" />
          : <Text style={styles.buttonText}>Save Plan</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0d0d0d', paddingHorizontal: 20 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0d0d' },
  header:       { paddingTop: 56, paddingBottom: 20 },
  back:         { color: '#c8ff00', fontSize: 15, marginBottom: 12 },
  title:        { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 10, padding: 14,
    color: '#fff', fontSize: 16, marginBottom: 20,
  },
  label:        { color: '#666', fontSize: 13, marginBottom: 12 },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10, padding: 14,
    marginBottom: 10,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  cardSelected: { borderColor: '#c8ff00', backgroundColor: '#1e2200' },
  cardRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:    { color: '#fff', fontSize: 16, fontWeight: '600' },
  cardSub:      { color: '#666', fontSize: 12, marginTop: 4 },
  check:        { color: '#c8ff00', fontSize: 18, fontWeight: 'bold' },
  button: {
    position: 'absolute', bottom: 32, left: 20, right: 20,
    backgroundColor: '#c8ff00', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#2a2a2a' },
  buttonText:     { color: '#000', fontWeight: 'bold', fontSize: 16 },
});