import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Welder } from '@/shared/types/welders';
import { weldersApi } from '@/shared/services/weldersApi';
import { getExpiry } from '@/shared/composables/useAttestation';

export const useWeldersStore = defineStore('welders', () => {
  const items = ref<Welder[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      items.value = await weldersApi.list();
    } finally {
      loading.value = false;
    }
  }

  async function add(data: Omit<Welder, 'id'>) {
    items.value.push(await weldersApi.create(data));
  }

  async function edit(id: number, data: Partial<Welder>) {
    const updated = await weldersApi.update(id, data);
    const idx = items.value.findIndex((w) => w.id === id);
    if (idx !== -1) items.value[idx] = updated;
  }

  async function remove(id: number) {
    await weldersApi.remove(id);
    items.value = items.value.filter((w) => w.id !== id);
  }

  // продление: новая дата аттестации → срок сдвигается на год вперёд
  async function renew(id: number, newDate: string) {
    await edit(id, { attDate: newDate, kind: 'periodic' });
  }

  // сводка для плашки «требуют внимания»
  const attention = computed(() => {
    let soon = 0,
      overdue = 0;
    for (const w of items.value) {
      const s = getExpiry(w.attDate).status;
      if (s === 'soon') soon++;
      else if (s === 'overdue') overdue++;
    }
    return { soon, overdue };
  });

  return { items, loading, fetchAll, add, edit, remove, renew, attention };
});
