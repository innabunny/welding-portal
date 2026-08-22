import { defineStore } from 'pinia';
import { ref } from 'vue';
import { attestationsService } from '@/shared/services/attestations';
import type { AttestationDraft, AttestationListItem } from '@/shared/types/attestation';
import { extractError } from '@/shared/services/errors';

export const useAttestationsStore = defineStore('attestations', () => {
  const saving = ref(false);
  const items = ref<AttestationListItem[]>([]);
  const loading = ref(false);

  async function createDraft(data: AttestationDraft): Promise<boolean> {
    saving.value = true;
    try {
      await attestationsService.createDraft(data);
      return true;
    } catch (e) {
      extractError(e);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function updateDraft(id: number, data: AttestationDraft): Promise<boolean> {
    saving.value = true;
    try {
      await attestationsService.update(id, data);
      return true;
    } catch (e) {
      extractError(e);
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function fetchAll() {
    loading.value = true;
    try {
      items.value = await attestationsService.list();
    } catch (e) {
      extractError(e);
    } finally {
      loading.value = false;
    }
  }

  return { saving, items, loading, createDraft, updateDraft, fetchAll };
});
