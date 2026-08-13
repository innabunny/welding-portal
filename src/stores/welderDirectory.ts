import { defineStore } from 'pinia';
import { ref } from 'vue';
import { weldersService } from '@/shared/services/welders';
import type { Welder } from '@/shared/types/welders';
import type { WelderInput } from '@/components/attestation/welders/WelderFormDialog.vue';

export const useWelderDirectoryStore = defineStore('welderDirectory', () => {
  const items = ref<Welder[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try { items.value = await weldersService.list(); } finally { loading.value = false; }
  }
  async function add(data: WelderInput) { items.value.push(await weldersService.create(data)); }
  async function update(id: number, data: Partial<WelderInput>) {
    const w = await weldersService.update(id, data);
    const i = items.value.findIndex((x) => x.id === id);
    if (i >= 0) items.value[i] = w;
  }
  async function remove(id: number) {
    await weldersService.remove(id);
    items.value = items.value.filter((x) => x.id !== id);
  }
  return { items, loading, fetchAll, add, update, remove };
});
