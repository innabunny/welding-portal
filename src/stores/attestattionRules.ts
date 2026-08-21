// stores/attestationRules.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { attestationRulesService } from '@/shared/services/attestationRules';
import type { RuleMatchResult } from '@/shared/types/attestationRules';
import { extractError } from '@/shared/services/errors';
export const useAttestationRulesStore = defineStore('attestationRules', () => {
  const loading = ref(false);

  async function match(
    method: string,
    group: string,
    thickness: number,
  ): Promise<RuleMatchResult | null> {
    loading.value = true;
    try {
      return await attestationRulesService.match(method, group, thickness);
    } catch (e) {
      extractError(e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { loading, match };
});
