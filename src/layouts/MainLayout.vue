<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="q-px-xl" style="background-color: #2d4a7c">
      <q-toolbar class="q-px-md">
        <q-toolbar-title class="text-weight-medium"> Сварочный портал предприятия </q-toolbar-title>

        <!-- всё, что после q-space, уезжает вправо -->
        <q-space />

        <q-btn flat no-caps icon="home" label="На главную" to="/" class="q-mr-sm" />

        <!-- имя залогиненного -->
        <div class="row items-center no-wrap q-mr-md">
          <q-avatar size="30px" color="white" text-color="primary" class="q-mr-sm">
            {{ initials }}
          </q-avatar>
          <span class="text-body2">{{ auth.user?.name }}</span>
        </div>

        <q-btn
          flat
          dense
          no-caps
          icon="logout"
          label="Выйти"
          @click="handleLogout"
          class="q-ml-xl"
        />
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

const auth = useAuthStore();
const router = useRouter();

const initials = computed(() => auth.user?.name?.charAt(0).toUpperCase() ?? '');

async function handleLogout() {
  auth.logout();
  await router.push('/login');
}
</script>

<style scoped>
.logout-btn {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  letter-spacing: 0.3px;
  transition: color 0.2s;
}

.logout-btn:hover {
  color: #fff;
}
</style>
