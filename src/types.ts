export type GrupoMuscular =
  | 'quadriceps'
  | 'isquiotibiais'
  | 'gluteos'
  | 'panturrilha'
  | 'peitoral'
  | 'peitoral_superior'
  | 'dorsal'
  | 'deltoide_anterior'
  | 'deltoide_medial'
  | 'deltoide_posterior'
  | 'biceps'
  | 'triceps'
  | 'abdomen'
  | 'trapezio';

export type Equipamento =
  | 'barra'
  | 'halteres'
  | 'maquina'
  | 'cabo'
  | 'peso_corporal'
  | 'outro';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
}

export interface Exercicio {
  id: number;
  nome: string;
  grupoFoco: GrupoMuscular;
  grupoSecundario: GrupoMuscular | null;
  equipamento: Equipamento;
  padrao: boolean;
  usuarioId: number | null;
}

export interface Ficha {
  id: number;
  nome: string;
  usuarioId: number;
  exercicioIds: number[];
  criadoEm: string;
}

export interface SerieRegistrada {
  exercicioId: number;
  exercicioNome: string;
  grupoFoco: GrupoMuscular;
  peso: number;
  reps: number;
  rpe: number;
  repsEfetivas: number;
  ev: number;
}

export interface RegistroHistorico {
  id: number;
  usuarioId: number;
  fichaId: number;
  fichaNome: string;
  inicio: string;
  fim: string;
  series: SerieRegistrada[];
  evTotal: number;
  umRmMax: number;
}

export interface FeederSet {
  peso: number;
  descricao: string;
}