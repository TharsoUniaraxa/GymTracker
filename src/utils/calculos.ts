import { RegistroHistorico } from '../types';

const MULTIPLICADOR_RPE: Record<number, number> = {
  10: 4.5,
  9:  5.0,
  8:  3.5,
  7:  2.0,
  6:  0.75,
};

function getMultiplicador(rpe: number): number {
  if (rpe >= 10) return 4.5;
  if (rpe >= 9)  return 5.0;
  if (rpe >= 8)  return 3.5;
  if (rpe >= 7)  return 2.0;
  if (rpe >= 6)  return 0.75;
  return 0;
}

export function calcularRepsEfetivas(reps: number, rpe: number): number {
  const mult = getMultiplicador(rpe);
  return Math.min(reps, mult);
}

export function calcularEV(peso: number, repsEfetivas: number): number {
  return Math.round(peso * repsEfetivas);
}

export function calcularUmRM(peso: number, reps: number): number {
  return Math.round(peso * (1 + reps / 30));
}

export interface FeederSet {
  peso: number;
  descricao: string;
}

export function calcularFeederSets(umRM: number): FeederSet[] {
  return [
    { percentual: 0.40, descricao: 'Activation'   },
    { percentual: 0.55, descricao: 'Warm-up'      },
    { percentual: 0.70, descricao: 'Potentiation' },
    { percentual: 0.85, descricao: 'Approach'     },
  ].map(f => ({
    peso: Math.round((umRM * f.percentual) / 2.5) * 2.5,
    descricao: f.descricao,
  }));
}

export function buscarPRdoExercicio(
  historico: RegistroHistorico[],
  exercicioId: number,
  usuarioId: number
): number {
  let maiorUmRM = 0;

  historico
    .filter(h => h.usuarioId === usuarioId)
    .forEach(h => {
      h.series
        .filter(s => s.exercicioId === exercicioId)
        .forEach(s => {
          const umRM = calcularUmRM(s.peso, s.reps);
          if (umRM > maiorUmRM) maiorUmRM = umRM;
        });
    });

  return maiorUmRM;
}