import { api } from '@/shared/services/api';   // поправь на твой axios-инстанс
import type { RuleMatchResult } from '@/shared/types/attestationRules';

export const attestationRulesService = {
  async match(method: string, group: string, thickness: number): Promise<RuleMatchResult> {
    const { data } = await api.get<RuleMatchResult>('/attestation-rules/match/', {
      params: { method, group, thickness },
    });
    return data;
  },
};
