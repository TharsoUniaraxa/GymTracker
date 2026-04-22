import BASE_URL from '../api';
import { Ficha } from '../types';

export const fichaService = {
  listByUsuario: async (usuarioId: number): Promise<Ficha[]> => {
    const res = await fetch(`${BASE_URL}/fichas?usuarioId=${usuarioId}`);
    if (!res.ok) throw new Error('listByUsuario request failed');
    const todas: Ficha[] = await res.json();
    return todas.filter(f => Number(f.usuarioId) === Number(usuarioId));
  },

  save: async (ficha: Omit<Ficha, 'id'>): Promise<Ficha> => {
    const res = await fetch(`${BASE_URL}/fichas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ficha),
    });
    if (!res.ok) throw new Error('save request failed');
    return res.json();
  },

  delete: async (id: number | string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/fichas/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('delete request failed');
  },
};
