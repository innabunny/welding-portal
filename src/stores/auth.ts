import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/shared/types/user';
import { usersApi } from '@/shared/services/usersApi';
import { extractError } from '@/shared/services/errors';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isLoggedIn = computed(() => user.value !== null);

  async function login(loginName: string, password: string): Promise<void> {
    try {
      const result = await usersApi.authenticate(loginName, password);

      if (!result?.token || !result?.user) {
        throw new Error('Сервер вернул некорректный ответ');
      }

      user.value = result.user;
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 400) {
        throw new Error('Неверный логин или пароль');
      }
      throw new Error(extractError(e, 'Не удалось войти. Попробуйте ещё раз'));
    }
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
