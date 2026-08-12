import type { Workshop } from '@/shared/types/workhop';
import { api } from './api';

export const workshopApi = {
  async list(): Promise<Workshop[]> {
    const { data } = await api.get<Workshop[]>('/workshops/');
    return data;
  },

  async create(data: Omit<Workshop, 'id'>): Promise<Workshop> {
    const res  = await api.post<Workshop>('/workshops/', data);
    return res.data
  },

  async update(id: number, data: Partial<Workshop>): Promise<Workshop> {
    const  res  = await api.patch<Workshop>(`/workshops/${id}/`, data)
    return res.data
  },

  async remove(id: number): Promise<void> {
    await api.delete<Workshop>(`/workshops/${id}/`);
  },
};
