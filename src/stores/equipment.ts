// src/modules/equipment/stores/equipmentStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Equipment, WeldingMethod } from '@/shared/types/equipment';
import { equipmentApi } from '@/shared/services/equipmentApi';

export const useEquipmentStore = defineStore('equipment', () => {
  const items = ref<Equipment[]>([]);
  const methods = ref<WeldingMethod[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      [items.value, methods.value] = await Promise.all([
        equipmentApi.list(),
        equipmentApi.methods(),
      ]);
    } finally {
      loading.value = false;
    }
  }

  async function add(data: Omit<Equipment, 'id'>) {
    const item = await equipmentApi.create(data);
    items.value.push(item);
  }

  async function edit(id: number, data: Partial<Equipment>) {
    const updated = await equipmentApi.update(id, data);
    const idx = items.value.findIndex((e) => e.id === id);
    if (idx !== -1) items.value[idx] = updated;
  }

  async function remove(id: number) {
    await equipmentApi.remove(id);
    items.value = items.value.filter((e) => e.id !== id);
  }

  // способ хранится как id ('rad') — а показывать надо имя. Хелпер для таблицы.
  const methodName = (id: string) =>
    methods.value.find((m) => m.id === id)?.name ?? id;

  return { items, methods, loading, fetchAll, add, edit, remove, methodName };
});
