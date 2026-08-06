// stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usersApi } from '@/shared/services/usersApi';
import type { User } from '@/shared/types/user';

interface Credentials {
  login: string;
  password: string;
}

type SafeUser = Omit<User, 'password'>;

export const useAuthStore = defineStore('auth', () => {
  const user = ref<SafeUser | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const loading = ref<boolean>(false);
  const isAuthenticated = computed<boolean>(() => !!user.value);

  async function login(credentials: Credentials): Promise<void> {
    loading.value = true;

    try {
      const found = await usersApi.authenticate(credentials.login, credentials.password);
      if (!found) throw new Error('Неверный логин или пароль');
      if (!found.active) throw new Error('Учётная запись заблокирована');
      user.value = {
        id: found.id,
        login: found.login,
        name: found.name,
        role: found.role,
        active: found.active,
        workshopId: found.workshopId ?? null,
      };

      localStorage.setItem('user', JSON.stringify(user.value));
    } finally {
      loading.value = false;
    }
  }

  function logout(): void {
    user.value = null;
    loading.value = false;
    localStorage.removeItem('user');
  }

  return { user, loading, isAuthenticated, login, logout };
});
