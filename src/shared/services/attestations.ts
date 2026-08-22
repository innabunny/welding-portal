import { api } from './api';
import type { AttestationDraft } from '@/shared/types/attestation';

export const attestationsService = {
  createDraft: (data: AttestationDraft) => api.post('/attestations/', data).then((r) => r.data),
  
  list: () => api.get('/attestations/').then((r) => r.data),

  update: (id: number, data: AttestationDraft) =>
    api.put(`/attestations/${id}/`, data).then((r) => r.data),
};
