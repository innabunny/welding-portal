import type { Equipment, WeldingMethod } from '../types/equipment';
import { api } from './api';

export const equipmentApi = {
  async list(): Promise<Equipment[]> {
    const {data} = await api.get<Equipment[]>('/equipment/');
    return data
  },

  async methods(): Promise<WeldingMethod[]> {
    const {data} = await api.get<WeldingMethod[]>('/welding-methods/');
    return data
  },

  async create(data: Omit<Equipment, 'id'>): Promise<Equipment> {
    const res = await api.post<Equipment>('/equipment/', data);
    return res.data;
  },

  async update(id: number, data: Partial<Equipment>): Promise<Equipment> {
    const res = await api.patch<Equipment>(`/equipment/${id}/`, data);
    return res.data;

  },

  async remove(id: number): Promise<void> {
    await api.delete<Equipment>(`/equipment/${id}/`)
  },
};
