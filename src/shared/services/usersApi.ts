import type { User } from '@/shared/types/user';
import {http} from './http'

export interface LoginResult {
  token: string;
  user: User;
}

export const usersApi = {
  async list(): Promise<User[]> {
    const {data} = await http.get<User[]>('/users/')
    return data
  },

  async create(data: Omit<User, 'id'>): Promise<User> {
    const res = await http.post<User>('/users/', data);
    return res.data
  },
  async update(id: number, data: Partial<User>): Promise<User> {
    const res = await http.patch<User>(`/users/${id}/`, data)
    return res.data
  },
  async remove(id: number): Promise<void> {
    await http.delete<User>(`/users/${id}/`)
  },
   async authenticate(login: string, password: string): Promise<LoginResult | null> {
    const {data} = await http.post<LoginResult>('/auth/login/', {login, password })
    return data
  },
};
