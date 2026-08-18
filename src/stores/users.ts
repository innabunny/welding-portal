import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User, UserRole } from '@/shared/types/user';
import { usersApi } from '@/shared/services/usersApi';

export const useUsersStore = defineStore('users', () => {
  const items = ref<User[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      items.value = await usersApi.list();
    } finally {
      loading.value = false;
    }
  }

  function replaceLocal(updated: User) {
    const idx = items.value.findIndex((u) => u.id === updated.id);
    if (idx !== -1) items.value[idx] = updated;
  }

  async function update(id: number, data: Partial<Omit<User, 'id'>>) {
    replaceLocal(await usersApi.update(id, data));
  }

  async function add(data: Omit<User, 'id'>) {
    items.value.push(await usersApi.create(data));
  }
  async function changeRole(id: number, role: UserRole) {
    replaceLocal(await usersApi.update(id, { role }));
  }

  async function changeWorkshop(id: number, workshopId: number | null) {
    replaceLocal(await usersApi.update(id, { workshopId }));
  }

  async function resetPassword(id: number, password: string) {
    await usersApi.update(id, { password });
  }
  async function toggleActive(id: number) {
    const current = items.value.find((u) => u.id === id);
    if (!current) return;
    replaceLocal(await usersApi.update(id, { active: !current.active }));
  }
  async function remove(id: number) {
    await usersApi.remove(id);
    items.value = items.value.filter((u) => u.id !== id);
  }

  return {
    items,
    loading,
    fetchAll,
    add,
    changeRole,
    changeWorkshop,
    resetPassword,
    toggleActive,
    remove,
    update,
  };
});
