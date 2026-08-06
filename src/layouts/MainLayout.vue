<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="app-header q-px-xl">
      <q-toolbar class="q-px-lg" style="min-height: 60px">
        <div class="row items-center no-wrap q-px-md">
          <div class="brand-mark q-mr-sm">
            <q-icon name="bolt" size="20px" color="white" />
          </div>
          <div class="column">
            <div class="brand-title">Сварочный портал</div>
            <div class="brand-sub">Информационная система предприятия</div>
          </div>
        </div>

        <q-space />

        <q-btn flat no-caps icon="home" label="На главную" to="/" class="header-btn" />

        <!-- вертикальный разделитель -->
        <div class="header-divider q-mx-md" />

        <!-- юзер-чип: аватар + имя + роль -->
        <div class="row items-center no-wrap q-mr-md">
          <q-avatar size="34px" color="white" text-color="primary" class="q-mr-sm text-weight-medium">
            {{ initials }}
          </q-avatar>
          <div class="column">
            <span class="text-body2 text-weight-medium" style="line-height:1.1">{{ auth.user?.name }}</span>
            <span class="user-role">{{ roleLabel }}</span>
          </div>
        </div>

        <q-btn flat dense no-caps icon="logout" label="Выйти" class="header-btn" @click="handleLogout" />
      </q-toolbar>
    </q-header>

    <q-page-container>
        <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ROLE_LABELS } from '@/shared/types/user';

const auth = useAuthStore();
const router = useRouter();

const initials = computed(() => auth.user?.name?.charAt(0).toUpperCase() ?? '');
const roleLabel = computed(() => (auth.user?.role ? ROLE_LABELS[auth.user.role] : ''));

async function handleLogout() {
  auth.logout();
  await router.push('/login');
}
</script>

<style scoped>
.app-header {
  background: var(--q-primary);

}

.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.brand-title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.15;
  color: #fff;
}

.brand-sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.2px;
}

.header-btn {
  color: rgba(255, 255, 255, 0.85);
}
.header-btn:hover {
  color: #fff;
}

.header-divider {
  width: 1px;
  height: 26px;
  background: rgba(255, 255, 255, 0.2);
}

.user-role {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.1;
}
</style>
