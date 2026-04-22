import BASE_URL from '../api';
import { RegistroHistorico } from '../types';

export const historicoService = {
  listByUsuario: async (usuarioId: number): Promise<RegistroHistorico[]> => {
    const res = await fetch(`${BASE_URL}/historico?usuarioId=${usuarioId}`);
    if (!res.ok) throw new Error('listByUsuario request failed');
    const todos: RegistroHistorico[] = await res.json();
    return todos.filter(h => Number(h.usuarioId) === Number(usuarioId));
  },

  save: async (registro: Omit<RegistroHistorico, 'id'>): Promise<RegistroHistorico> => {
    const res = await fetch(`${BASE_URL}/historico`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registro),
    });
    if (!res.ok) throw new Error('save request failed');
    return res.json();
  },
};
