import type { ServiceRequest } from '@/shared/types/serviceRequest';
import { api } from './api';

export const serviceRequestApi = {
  async list(): Promise<ServiceRequest[]> {
    const { data } = await api.get<ServiceRequest[]>('/maintenance/');
    return data;
  },
  async create(data: Omit<ServiceRequest, 'id'>): Promise<ServiceRequest> {
    const res = await api.post<ServiceRequest>('/maintenance/', data );
    return res.data;
  },
  async update(id: number, data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const res = await api.patch<ServiceRequest>(`/maintenance/${id}/`, data);
    return res.data;
  },
  async remove(id: number): Promise<void> {
    await api.delete<ServiceRequest>(`/maintenance/${id}/`)
  },
};
