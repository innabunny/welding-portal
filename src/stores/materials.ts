import { defineStore } from 'pinia';
import { ref } from 'vue';
import { materialsService } from '@/shared/services/materials';
import type { Material, MaterialGroup } from '@/shared/types/materials';

type MaterialInput = Omit<Material, 'id' | 'groupCode'>;

export const useMaterialsStore = defineStore('materials', () => {
  const items = ref<Material[]>([]);
  const groups = ref<MaterialGroup[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      [items.value, groups.value] = await Promise.all([
        materialsService.list(),
        materialsService.listGroups(),
      ]);
    } finally {
      loading.value = false;
    }
  }
  async function add(data: MaterialInput) {
    items.value.push(await materialsService.create(data));
  }
  async function update(id: number, data: Partial<MaterialInput>) {
    const m = await materialsService.update(id, data);
    const i = items.value.findIndex((x) => x.id === id);
    if (i >= 0) items.value[i] = m;
  }
  async function remove(id: number) {
    await materialsService.remove(id);
    items.value = items.value.filter((x) => x.id !== id);
  }
  async function addGroup(code: string) {
    groups.value.push(await materialsService.createGroup(code));
  }
  async function removeGroup(id: number) {
    await materialsService.removeGroup(id);
    groups.value = groups.value.filter((x) => x.id !== id);
  }
  return { items, groups, loading, fetchAll, add, update, remove, addGroup, removeGroup };
});
