import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RefCategory, References } from '@/shared/types/reference';
import { referenceApi } from '@/shared/services/referenceApi';

export const useReferenceStore = defineStore('reference', () => {
  const data = ref<References | null>(null);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      data.value = await referenceApi.getAll();
    } finally {
      loading.value = false;
    }
  }

  async function addValue(cat: RefCategory, value: string) {
    await referenceApi.addValue(cat, value);
    if (data.value && !data.value[cat].includes(value)) {
      data.value[cat].push(value);
    }
  }

  async function removeValue(cat: RefCategory, value: string) {
    await referenceApi.removeValue(cat, value);
    if (data.value) {
      data.value[cat] = data.value[cat].filter((v) => v !== value);
    }
  }

  return { data, loading, fetchAll, addValue, removeValue };
});
