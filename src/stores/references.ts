import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { RefCategory, RefItem } from '@/shared/types/references';
import { referenceApi } from '@/shared/services/referenceApi';

export const useReferenceStore = defineStore('reference', () => {
  const loading = ref(false);
  const items = ref<RefItem[]>([]);

  const byCategory = computed<Record<RefCategory, RefItem[]>>(() => {
    const acc = { materials: [], wires: [], gases: [], electrodes: [], fluxes: [] } as Record<
      RefCategory,
      RefItem[]
    >;
    for (const item of items.value) {
      acc[item.category].push(item);
    }

    return acc;
  });

  async function fetchAll() {
    loading.value = true;
    try {
      items.value = await referenceApi.getAll();
    } finally {
      loading.value = false;
    }
  }

  async function addValue(category: RefCategory, value: string) {
    const created = await referenceApi.addValue(category, value);
    items.value.push(created);
  }

  async function updateValue(id: number, value: string) {
    const updated = await referenceApi.updateValue(id, value);
    const idx = items.value.findIndex((item) => item.id === id);
    if (idx !== -1) {
      items.value[idx] = updated;
    }
  }

  async function removeValue(id: number) {
    await referenceApi.removeValue(id);
    items.value = items.value.filter((item) => item.id !== id)
  }

  return { items, loading, fetchAll, addValue, updateValue, removeValue, byCategory };
});
