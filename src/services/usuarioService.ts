import BASE_URL from '../api';
import { Usuario } from '../types';

export const usuarioService = {
  login: async (email: string, senha: string): Promise<Usuario | null> => {
    const res = await fetch(`${BASE_URL}/usuarios`);
    if (!res.ok) throw new Error('Login request failed');
    const todos: Usuario[] = await res.json();

    const match = todos.find(
      u =>
        u.email.toLowerCase() === email.toLowerCase().trim() &&
        u.senha === senha
    );
    return match ?? null;
  },

  getById: async (id: number): Promise<Usuario | null> => {
    const res = await fetch(`${BASE_URL}/usuarios/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('getById request failed');
    return res.json();
  },
};
