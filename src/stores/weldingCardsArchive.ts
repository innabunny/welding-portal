import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { WeldingCard } from '@/shared/types/weldingCard';
import { weldingCardApi } from '@/shared/services/weldingCardApi';

export const useWeldingCardsArchiveStore = defineStore('weldingCardsArchive', () => {
  const items = ref<WeldingCard[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      items.value = await weldingCardApi.list();
    } finally {
      loading.value = false;
    }
  }

  async function save(card: Omit<WeldingCard, 'id'>) {
    const saved = await weldingCardApi.create(card);
    items.value.unshift(saved);
    return saved;
  }

  async function remove(id: number) {
    await weldingCardApi.remove(id);
    items.value = items.value.filter((c) => c.id !== id);
  }
  async function update(id: number, card: Omit<WeldingCard, 'id'>) {
    const updated = await weldingCardApi.update(id, card);
    const idx = items.value.findIndex((c) => c.id === id);
    if (idx !== -1) items.value[idx] = updated;
    return updated;
  }

  return { items, loading, fetchAll, save, remove, update };
});
