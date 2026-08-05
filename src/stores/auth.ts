// stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Credentials } from '@/shared/types/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref<boolean>(false);
  const isAuthenticated = computed<boolean>(() => !!user.value);

  function login(credentials: Credentials): Promise<void> {
    loading.value = true;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.login === 'admin' && credentials.password === 'admin') {
          user.value = {
            id: 1,
            login: credentials.login,
            role: 'admin',
            name: 'Администратор',
          };
          loading.value = false;
          resolve();
        } else if (credentials.login === 'технолог' && credentials.password === '1234') {
          user.value = {
            id: 2,
            login: credentials.login,
            role: 'user',
            name: 'Технолог',
          };
          loading.value = false;
          resolve();
        } else {
          loading.value = false;
          reject(new Error('Неверный логин или пароль'));
        }
      }, 800);
    });
  }

  function logout(): void {
    user.value = null;
    loading.value = false;
  }

  return { user, loading, isAuthenticated, login, logout };
});
