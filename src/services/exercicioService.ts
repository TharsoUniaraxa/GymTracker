import BASE_URL from '../api';
import { Exercicio } from '../types';

export const exercicioService = {
  listAll: async (): Promise<Exercicio[]> => {
    const res = await fetch(`${BASE_URL}/exercicios`);
    if (!res.ok) throw new Error('listAll request failed');
    return res.json();
  },

  listForUsuario: async (usuarioId: number): Promise<Exercicio[]> => {
    const todos = await exercicioService.listAll();
    return todos.filter(e =>
      e.padrao || Number(e.usuarioId) === Number(usuarioId)
    );
  },

  getByIds: async (ids: Array<number | string>): Promise<Exercicio[]> => {
    const todos = await exercicioService.listAll();
    return ids
      .map(id => todos.find(e => String(e.id) === String(id)))
      .filter((e): e is Exercicio => Boolean(e));
  },

  save: async (exercicio: Omit<Exercicio, 'id'>): Promise<Exercicio> => {
    const res = await fetch(`${BASE_URL}/exercicios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exercicio),
    });
    if (!res.ok) throw new Error('save request failed');
    return res.json();
  },

  delete: async (id: number | string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/exercicios/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('delete request failed');
  },
};
