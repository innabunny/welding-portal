import { api } from '@/shared/services/api'; // тот же клиент, что в welders
import type { Material, MaterialGroup } from '@/shared/types/materials';

type MaterialInput = Omit<Material, 'id' | 'groupCode'>;

export const materialsService = {
  listGroups: () => api.get<MaterialGroup[]>('/material-groups/').then((r) => r.data),
  createGroup: (code: string) =>
    api.post<MaterialGroup>('/material-groups/', { code }).then((r) => r.data),
  removeGroup: (id: number) => api.delete(`/material-groups/${id}/`),
  list: () => api.get<Material[]>('/materials/').then((r) => r.data),
  create: (data: MaterialInput) => api.post<Material>('/materials/', data).then((r) => r.data),
  update: (id: number, data: Partial<MaterialInput>) =>
    api.patch<Material>(`/materials/${id}/`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/materials/${id}/`),
};
