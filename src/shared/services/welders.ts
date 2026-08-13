// services/welders.ts — фасад к API (подставь свой http-клиент, как в equipment)
import { api } from './api';
import type { Welder } from '@/shared/types/welders';
import type { WelderInput } from '@/components/attestation/welders/WelderFormDialog.vue';

export const weldersService = {
  list: () => api.get<Welder[]>('/welders/').then((r) => r.data),
  create: (data: WelderInput) => api.post<Welder>('/welders/', data).then((r) => r.data),
  update: (id: number, data: Partial<WelderInput>) =>
    api.patch<Welder>(`/welders/${id}/`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/welders/${id}/`),
};
