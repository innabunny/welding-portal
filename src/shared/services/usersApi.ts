import type { User } from '@/shared/types/user';
import { api } from './api';

export interface LoginResult {
  token: string;
  user: User;
}

export const usersApi = {
  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users/');
    return data;
  },

  async create(data: Omit<User, 'id'>): Promise<User> {
    const res = await api.post<User>('/users/', data);
    return res.data;
  },

  async update(id: number, data: Partial<User>): Promise<User> {
    const res = await api.patch<User>(`/users/${id}/`, data);
    return res.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete<User>(`/users/${id}/`);
  },
  
  async authenticate(login: string, password: string): Promise<LoginResult | null> {
    const { data } = await api.post<LoginResult>('/auth/login/', { login, password });
    return data;
  },
};
