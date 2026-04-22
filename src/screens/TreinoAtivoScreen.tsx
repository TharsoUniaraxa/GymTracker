import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Image, Modal
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../../App';
import { Exercicio, SerieRegistrada, RegistroHistorico } from '../types';
import {
  calcularRepsEfetivas, calcularEV, calcularUmRM,
  calcularFeederSets, buscarPRdoExercicio
} from '../utils/calculos';
import { muscleImages } from '../muscleImages';
import { exercicioService } from '../services/exercicioService';
import { historicoService } from '../services/historicoService';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'TreinoAtivo'>;
  route:      RouteProp<RootStackParamList, 'TreinoAtivo'>;
};

export default function TreinoAtivoScreen({ navigation, route }: Props) {
  const { usuarioId, fichaId, fichaNome, exercicioIds } = route.params;

  const [exercicios, setExercicios]         = useState<Exercicio[]>([]);
  const [indexAtual, setIndexAtual]         = useState(0);
  const [series, setSeries]                 = useState<SerieRegistrada[]>([]);
  const [peso, setPeso]                     = useState('');
  const [reps, setReps]                     = useState('');
  const [rpe, setRpe]                       = useState('');
  const [historico, setHistorico]           = useState<RegistroHistorico[]>([]);
  const [inicio]                            = useState(new Date().toISOString());
  const [tooltipRpe10Visible, setTooltipRpe10Visible] = useState(false);
  const exerciciosComTooltipMostrado        = useRef<Set<number>>(new Set());

  const ultimaInteracao = useRef(Date.now());

  // Haptic timer — 5min e 6min sem input
  useEffect(() => {
    const intervalo = setInterval(() => {
      const minutos = (Date.now() - ultimaInteracao.current) / 1000 / 60;
      if (minutos >= 5 && minutos < 5.1) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      if (minutos >= 6 && minutos < 6.1) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  // Atualiza timestamp a cada interação
  const registrarInteracao = () => {
    ultimaInteracao.current = Date.now();
  };

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    try {
      const [filtrados, histRaw] = await Promise.all([
        exercicioService.getByIds(exercicioIds),
        historicoService.listByUsuario(usuarioId),
      ]);
      setExercicios(filtrados);
      setHistorico(histRaw);
    } catch {
      Alert.alert('Error', 'Could not load exercises.');
    }
  };

  const exercicioAtual = exercicios[indexAtual];

  const prAtual = exercicioAtual
    ? buscarPRdoExercicio(historico, exercicioAtual.id, usuarioId)
    : 0;

  const feederSets = prAtual > 0 ? calcularFeederSets(prAtual) : [];

  // Cálculo em tempo real do EV da série atual
  const pesoNum = parseFloat(peso) || 0;
  const repsNum = parseInt(reps)   || 0;
  const rpeNum  = parseFloat(rpe)  || 0;

  const repsEfetivas  = calcularRepsEfetivas(repsNum, rpeNum);
  const evSerie       = calcularEV(pesoNum, repsEfetivas);
  const umRmSerie     = calcularUmRM(pesoNum, repsNum);

  const evTotal = series.reduce((acc, s) => acc + s.ev, 0);

  const adicionarSerie = () => {
    if (!pesoNum || !repsNum || !rpeNum) {
      Alert.alert('Error', 'Fill in weight, reps and RPE.');
      return;
    }
    if (rpeNum < 1 || rpeNum > 10) {
      Alert.alert('Error', 'RPE must be between 1 and 10.');
      return;
    }

    const novaSerie: SerieRegistrada = {
      exercicioId:   exercicioAtual.id,
      exercicioNome: exercicioAtual.nome,
      grupoFoco:     exercicioAtual.grupoFoco,
      peso:          pesoNum,
      reps:          repsNum,
      rpe:           rpeNum,
      repsEfetivas,
      ev:            evSerie,
    };

    setSeries(prev => [...prev, novaSerie]);
    setPeso('');
    setReps('');
    setRpe('');
    registrarInteracao();

    if (rpeNum >= 10 && !exerciciosComTooltipMostrado.current.has(exercicioAtual.id)) {
      exerciciosComTooltipMostrado.current.add(exercicioAtual.id);
      setTooltipRpe10Visible(true);
    }
  };

  const removerSerie = (index: number) => {
    Alert.alert(
      'Remove set',
      'Remove this set?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setSeries(prev => prev.filter((_, i) => i !== index)),
        },
      ]
    );
  };

  const proximoExercicio = () => {
    if (indexAtual < exercicios.length - 1) {
      setIndexAtual(prev => prev + 1);
      registrarInteracao();
    }
  };

  const exercicioAnterior = () => {
    if (indexAtual > 0) {
      setIndexAtual(prev => prev - 1);
      registrarInteracao();
    }
  };

  const finalizarTreino = async () => {
    if (series.length === 0) {
      Alert.alert('Error', 'Log at least one set before finishing.');
      return;
    }

    const umRmMax = Math.max(
      ...series.map(s => calcularUmRM(s.peso, s.reps))
    );

    const registro = {
      usuarioId,
      fichaId,
      fichaNome,
      inicio,
      fim:     new Date().toISOString(),
      series,
      evTotal: series.reduce((acc, s) => acc + s.ev, 0),
      umRmMax,
    };

    try {
      const salvo = await historicoService.save(registro);
      navigation.replace('ResumoTreino', { registro: salvo });
    } catch {
      Alert.alert('Error', 'Could not save workout.');
    }
  };

  const seriesDoExercicioAtual = series.filter(
    s => s.exercicioId === exercicioAtual?.id
  );

  if (!exercicioAtual) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.fichaNome}>{fichaNome}</Text>
        <Text style={styles.evTotal}>EV {evTotal} kg</Text>
      </View>

      {/* Navegação de exercícios */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, indexAtual === 0 && styles.navBtnDisabled]}
          onPress={exercicioAnterior}
          disabled={indexAtual === 0}
        >
          <Text style={styles.navBtnText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.exercicioIndex}>
          {indexAtual + 1} / {exercicios.length}
        </Text>

        <TouchableOpacity
          style={[styles.navBtn, indexAtual === exercicios.length - 1 && styles.navBtnDisabled]}
          onPress={proximoExercicio}
          disabled={indexAtual === exercicios.length - 1}
        >
          <Text style={styles.navBtnText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Card do exercício atual */}
      <View style={styles.exercicioCard}>
        <View style={styles.exercicioInfo}>
          <Text style={styles.exercicioNome}>{exercicioAtual.nome}</Text>
          <Text style={styles.exercicioGrupo}>
            {exercicioAtual.grupoFoco}
            {exercicioAtual.grupoSecundario ? ` · ${exercicioAtual.grupoSecundario}` : ''}
          </Text>
          <Text style={styles.equipamento}>{exercicioAtual.equipamento}</Text>
        </View>

        <Image
          source={muscleImages[exercicioAtual.grupoFoco] ?? muscleImages['quadriceps']}
          style={styles.muscleImage}
          resizeMode="contain"
        />
      </View>

      {/* PR e Feeder Sets */}
      {prAtual > 0 && (
        <View style={styles.prCard}>
          <Text style={styles.prTitle}>PR — Est. 1RM: {prAtual} kg</Text>
          <View style={styles.feederRow}>
            {feederSets.map((f, i) => (
              <View key={i} style={styles.feederItem}>
                <Text style={styles.feederPeso}>{f.peso}kg</Text>
                <Text style={styles.feederDesc}>{f.descricao}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Inputs */}
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={peso}
            onChangeText={v => { setPeso(v); registrarInteracao(); }}
            placeholderTextColor="#666"
            placeholder="0"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reps</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={reps}
            onChangeText={v => { setReps(v); registrarInteracao(); }}
            placeholderTextColor="#666"
            placeholder="0"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>RPE</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={rpe}
            onChangeText={v => { setRpe(v); registrarInteracao(); }}
            placeholderTextColor="#666"
            placeholder="0"
          />
        </View>
      </View>

      {/* Preview EV em tempo real */}
      {pesoNum > 0 && repsNum > 0 && rpeNum > 0 && (
        <View style={styles.evPreview}>
          <Text style={styles.evPreviewText}>
            Eff. Reps: {repsEfetivas.toFixed(2)}  ·  EV: {evSerie} kg  ·  Est. 1RM: {umRmSerie} kg
          </Text>
        </View>
      )}

      {/* Botão adicionar série */}
      <TouchableOpacity style={styles.addButton} onPress={adicionarSerie}>
        <Text style={styles.addButtonText}>Add Set</Text>
      </TouchableOpacity>

      {/* Séries do exercício atual */}
      {seriesDoExercicioAtual.length > 0 && (
        <View style={styles.seriesContainer}>
          <Text style={styles.seriesTitle}>Sets logged</Text>
          {seriesDoExercicioAtual.map((s, i) => {
            const indexGlobal = series.findIndex(
              (x, xi) => x.exercicioId === s.exercicioId && xi === series.indexOf(s)
            );
            return (
              <View key={i} style={styles.serieRow}>
                <Text style={styles.serieNum}>{i + 1}</Text>
                <Text style={styles.serieInfo}>
                  {s.peso}kg × {s.reps} @ RPE {s.rpe}
                </Text>
                <Text style={styles.serieEV}>EV {s.ev}</Text>
                <TouchableOpacity
                  onPress={() => removerSerie(series.indexOf(s))}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {/* Finalizar treino */}
      <TouchableOpacity style={styles.finishButton} onPress={finalizarTreino}>
        <Text style={styles.finishButtonText}>Finish Workout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>

    <Modal
      transparent
      visible={tooltipRpe10Visible}
      animationType="fade"
      onRequestClose={() => setTooltipRpe10Visible(false)}
    >
      <TouchableOpacity
        style={styles.tooltipBackdrop}
        activeOpacity={1}
        onPress={() => setTooltipRpe10Visible(false)}
      >
        <View style={styles.tooltipCard}>
          <Text style={styles.tooltipTitle}>Great effort!</Text>
          <Text style={styles.tooltipText}>
            Next set, try stopping one rep short — RPE 9 is actually the sweet spot for growth.
          </Text>
          <Text style={styles.tooltipDismiss}>Tap anywhere to dismiss</Text>
        </View>
      </TouchableOpacity>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#0d0d0d', paddingHorizontal: 20 },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0d0d' },
  loadingText:     { color: '#fff', fontSize: 16 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingBottom: 16 },
  fichaNome:       { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 },
  evTotal:         { color: '#c8ff00', fontSize: 18, fontWeight: 'bold' },
  navRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  navBtn:          { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  navBtnDisabled:  { opacity: 0.3 },
  navBtnText:      { color: '#fff', fontSize: 18 },
  exercicioIndex:  { color: '#666', fontSize: 14 },
  exercicioCard:   { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  exercicioInfo:   { flex: 1 },
  exercicioNome:   { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  exercicioGrupo:  { color: '#c8ff00', fontSize: 13, marginBottom: 4 },
  equipamento:     { color: '#666', fontSize: 12 },
  muscleImage:     { width: 90, height: 90, marginLeft: 12 },
  prCard:          { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  prTitle:         { color: '#c8ff00', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  feederRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  feederItem:      { alignItems: 'center' },
  feederPeso:      { color: '#fff', fontSize: 14, fontWeight: '600' },
  feederDesc:      { color: '#666', fontSize: 10, marginTop: 2 },
  inputRow:        { flexDirection: 'row', gap: 12, marginBottom: 12 },
  inputGroup:      { flex: 1 },
  inputLabel:      { color: '#666', fontSize: 12, marginBottom: 6 },
  input:           { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 10, padding: 14, color: '#fff', fontSize: 18, textAlign: 'center' },
  evPreview:       { backgroundColor: '#1e2200', borderRadius: 8, padding: 10, marginBottom: 12, alignItems: 'center' },
  evPreviewText:   { color: '#c8ff00', fontSize: 13 },
  addButton:       { backgroundColor: '#c8ff00', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 20 },
  addButtonText:   { color: '#000', fontWeight: 'bold', fontSize: 16 },
  seriesContainer: { marginBottom: 20 },
  seriesTitle:     { color: '#666', fontSize: 13, marginBottom: 10 },
  serieRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, marginBottom: 8 },
  serieNum:        { color: '#666', fontSize: 14, width: 24 },
  serieInfo:       { color: '#fff', fontSize: 14, flex: 1 },
  serieEV:         { color: '#c8ff00', fontSize: 13 },
  finishButton:    { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#c8ff00', marginBottom: 16 },
  finishButtonText:{ color: '#c8ff00', fontWeight: 'bold', fontSize: 16 },
  removeBtn:     { paddingLeft: 10 },
  removeBtnText: { color: '#ff4444', fontSize: 14 },
  tooltipBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  tooltipCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#c8ff00',
  },
  tooltipTitle:   { color: '#c8ff00', fontSize: 17, fontWeight: 'bold', marginBottom: 8 },
  tooltipText:    { color: '#fff', fontSize: 14, lineHeight: 20 },
  tooltipDismiss: { color: '#666', fontSize: 11, marginTop: 14, textAlign: 'center' },
});