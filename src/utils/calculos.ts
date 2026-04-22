import { RegistroHistorico, FeederSet } from '../types';

function getMultiplicador(rpe: number): number {
  if (rpe >= 10) return 4.5;
  if (rpe >= 9)  return 5.0;
  if (rpe >= 8)  return 4.0;
  if (rpe >= 7)  return 2.0;
  if (rpe >= 6)  return 1.0;
  return 0;
}

export function calcularRepsEfetivas(reps: number, rpe: number): number {
  return Math.min(reps, getMultiplicador(rpe));
}

export function calcularEV(peso: number, repsEfetivas: number): number {
  return Math.round(peso * repsEfetivas);
}

export function calcularUmRM(peso: number, reps: number): number {
  return Math.round(peso * (1 + reps / 30));
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
    .filter(h => Number(h.usuarioId) === Number(usuarioId))
    .forEach(h => {
      h.series
        .filter(s => Number(s.exercicioId) === Number(exercicioId))
        .forEach(s => {
          const umRM = calcularUmRM(s.peso, s.reps);
          if (umRM > maiorUmRM) maiorUmRM = umRM;
        });
    });

  return maiorUmRM;
}
