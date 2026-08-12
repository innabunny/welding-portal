import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/shared/types/user';
import { usersApi } from '@/shared/services/usersApi';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isLoggedIn = computed(() => user.value !== null);

  async function login(loginName: string, password: string): Promise<boolean> {
    const result = await usersApi.authenticate(loginName, password);
    if (!result || !result.token || !result.user) return false;

    user.value = result.user;
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return true;
  }

  function logout() {
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function restore() {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (!savedToken || !savedUser) {
      logout();
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);
      if (!parsed || typeof parsed !== 'object') {
        logout();
        return;
      }
      user.value = parsed as User;
    } catch {
      logout();
    }
  }

  return { user, isLoggedIn, login, logout, restore };
});
