import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ServiceRequest, RequestStatus } from '@/shared/types/serviceRequest';
import { serviceRequestApi } from '@/shared/services/serviceRequestApi';

export const useServiceStore = defineStore('service', () => {
  const items = ref<ServiceRequest[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      items.value = await serviceRequestApi.list();
    } finally {
      loading.value = false;
    }
  }

  async function add(data: Omit<ServiceRequest, 'id'>) {
    items.value.unshift(await serviceRequestApi.create(data)); // новые сверху
  }

  async function setStatus(id: number, status: RequestStatus, closedBy?: string) {
    const patch: Partial<ServiceRequest> =
      status === 'выполнена'
        ? { status, closedBy: closedBy ?? null, closedAt: new Date().toISOString().slice(0, 10) }
        : { status, closedBy: null, closedAt: null }; // вернули в работу — снимаем отметку
    const updated = await serviceRequestApi.update(id, patch);
    const idx = items.value.findIndex((r) => r.id === id);
    if (idx !== -1) items.value[idx] = updated;
  }

  async function remove(id: number) {
    await serviceRequestApi.remove(id);
    items.value = items.value.filter((r) => r.id !== id);
  }

  // заявки конкретного мастера (для его вкладки)
  const byMaster = (login: string) => items.value.filter((r) => r.masterLogin === login);

  // счётчик открытых (для механика)
  const openCount = computed(() => items.value.filter((r) => r.status !== 'выполнена').length);

  return { items, loading, fetchAll, add, setStatus, remove, byMaster, openCount };
});
