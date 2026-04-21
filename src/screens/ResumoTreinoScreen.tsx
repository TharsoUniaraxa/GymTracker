import React from 'react';
import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'ResumoTreino'>;
  route:      RouteProp<RootStackParamList, 'ResumoTreino'>;
};

function formatarDuracao(inicio: string, fim: string): string {
  const diff = new Date(fim).getTime() - new Date(inicio).getTime();
  const min  = Math.floor(diff / 60000);
  const sec  = Math.floor((diff % 60000) / 1000);
  return `${min}m ${sec}s`;
}

export default function ResumoTreinoScreen({ navigation, route }: Props) {
  const { registro } = route.params;

  const duracao    = formatarDuracao(registro.inicio, registro.fim);
  const totalSets  = registro.series.length;

  // Agrupar séries por exercício
  const porExercicio = registro.series.reduce((acc, s) => {
    if (!acc[s.exercicioNome]) acc[s.exercicioNome] = [];
    acc[s.exercicioNome].push(s);
    return acc;
  }, {} as Record<string, typeof registro.series>);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Complete 💪</Text>
        <Text style={styles.fichaNome}>{registro.fichaNome}</Text>
      </View>

      {/* Métricas principais */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{registro.evTotal}</Text>
          <Text style={styles.metricLabel}>Total EV (kg)</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{registro.umRmMax}</Text>
          <Text style={styles.metricLabel}>Best 1RM (kg)</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{duracao}</Text>
          <Text style={styles.metricLabel}>Duration</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{totalSets}</Text>
          <Text style={styles.metricLabel}>Total Sets</Text>
        </View>
      </View>

      {/* Detalhes por exercício */}
      <Text style={styles.sectionTitle}>Sets breakdown</Text>

      {Object.entries(porExercicio).map(([nome, series]) => {
        const evExercicio = series.reduce((acc, s) => acc + s.ev, 0);
        return (
          <View key={nome} style={styles.exercicioBlock}>
            <View style={styles.exercicioBlockHeader}>
              <Text style={styles.exercicioNome}>{nome}</Text>
              <Text style={styles.exercicioEV}>EV {evExercicio}</Text>
            </View>
            {series.map((s, i) => (
              <View key={i} style={styles.serieRow}>
                <Text style={styles.serieNum}>{i + 1}</Text>
                <Text style={styles.serieInfo}>
                  {s.peso}kg × {s.reps} @ RPE {s.rpe}
                </Text>
                <Text style={styles.serieEfetivas}>
                  {s.repsEfetivas.toFixed(2)} eff
                </Text>
                <Text style={styles.serieEV}>EV {s.ev}</Text>
              </View>
            ))}
          </View>
        );
      })}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#0d0d0d', paddingHorizontal: 20 },
  header:               { paddingTop: 56, paddingBottom: 24 },
  title:                { color: '#c8ff00', fontSize: 28, fontWeight: 'bold' },
  fichaNome:            { color: '#666', fontSize: 15, marginTop: 4 },
  metricsRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  metricCard:           { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, flex: 1, minWidth: '45%', alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  metricValue:          { color: '#c8ff00', fontSize: 22, fontWeight: 'bold' },
  metricLabel:          { color: '#666', fontSize: 12, marginTop: 4, textAlign: 'center' },
  sectionTitle:         { color: '#fff', fontSize: 17, fontWeight: 'bold', marginBottom: 14 },
  exercicioBlock:       { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#2a2a2a' },
  exercicioBlockHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  exercicioNome:        { color: '#fff', fontSize: 15, fontWeight: '600' },
  exercicioEV:          { color: '#c8ff00', fontSize: 14 },
  serieRow:             { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#2a2a2a' },
  serieNum:             { color: '#666', width: 22, fontSize: 13 },
  serieInfo:            { color: '#fff', fontSize: 13, flex: 1 },
  serieEfetivas:        { color: '#888', fontSize: 12, marginRight: 8 },
  serieEV:              { color: '#c8ff00', fontSize: 13 },
  button:               { backgroundColor: '#c8ff00', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText:           { color: '#000', fontWeight: 'bold', fontSize: 16 },
});