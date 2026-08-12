import type { RefCategory, RefItem } from '@/shared/types/references';
import { api } from './api';

export const referenceApi = {
  async getAll(): Promise<RefItem[]> {
    const {data} = await api.get<RefItem[]>('/references/');
    return data;
  },

  async addValue(category: RefCategory, value: string): Promise<RefItem> {
      const {data} = await api.post<RefItem>('/references/', {category, value});
      return data;
  },

  async updateValue( id: number, value: string): Promise<RefItem> {
    const {data} = await api.patch<RefItem>(`/references/${id}/`, {value} )
    return data;
  },

  async removeValue(id: number): Promise<void> {
    await api.delete(`/references/${id}/`);
  }
};
