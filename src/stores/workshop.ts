import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Workshop } from '@/shared/types/workhop';
import { workshopApi } from '@/shared/services/workShopsApi';

export const useWorkshopStore = defineStore('workshop', () => {
  const items = ref<Workshop[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      items.value = await workshopApi.list();
    } finally {
      loading.value = false;
    }
  }
  async function add(data: Omit<Workshop, 'id'>) {
    items.value.push(await workshopApi.create(data));
  }
  async function remove(id: number) {
    await workshopApi.remove(id);
    items.value = items.value.filter((w) => w.id !== id);
  }

  const workshopName = (id: number |  null | undefined) =>
    items.value.find((w) => w.id === Number(id))?.name ?? '—';

  return { items, loading, fetchAll, add, remove, workshopName };
});
