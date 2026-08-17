<template>
  <div style="max-width: 420px">
    <div class="text-subtitle1 text-weight-medium q-mb-md" style="color: var(--app-ink)">
      Группы материалов
    </div>

    <div v-if="isAdmin" class="row q-gutter-sm q-mb-md">
      <q-input
        v-model="newCode"
        dense
        outlined
        placeholder="Новая группа (М01, М61…)"
        class="col"
        @keyup.enter="addGroup"
      />
      <q-btn unelevated no-caps icon="add" label="Добавить" color="primary" @click="addGroup" />
    </div>

    <q-list bordered separator>
      <q-item v-for="g in store.groups" :key="g.id">
        <q-item-section>{{ g.code }}</q-item-section>
        <q-item-section side v-if="isAdmin">
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="delete"
            color="grey-6"
            @click="removeMaterialGroup(g)"
          />
        </q-item-section>
      </q-item>
      <q-item v-if="!store.groups.length">
        <q-item-section class="text-grey-6">Групп пока нет.</q-item-section>
      </q-item>
    </q-list>
  </div>

  <ConfirmDeleteDialog
    v-model="confirmOpen"
    message="Удалить группу?"
    :highlight="toDelete?.code"
    @confirm="doRemove"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useMaterialsStore } from '@/stores/materials';
import { useAuthStore } from '@/stores/auth';
import type { MaterialGroup } from '@/shared/types/materials';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog.vue';

const $q = useQuasar();
const store = useMaterialsStore();
const auth = useAuthStore();
const isAdmin = computed(() => auth.user?.role === 'admin');
const newCode = ref('');
const confirmOpen = ref(false);
const toDelete = ref<MaterialGroup | null>(null);

async function addGroup() {
  const code = newCode.value.trim();
  if (!code) return;
  try {
    await store.addGroup(code);
    newCode.value = '';
  } catch {
    $q.notify({ type: 'negative', message: 'Не удалось добавить группу' });
  }
}

function removeMaterialGroup(m: MaterialGroup) {
  confirmOpen.value = true;
  toDelete.value = m;
}

async function doRemove() {
  if (!toDelete.value) return;
  try {
    await store.removeGroup(toDelete.value.id);
    $q.notify({ type: 'positive', message: 'Марка удалена' });
  } catch {
    $q.notify({ type: 'negative', message: 'Группа используется марками — сначала отвяжите' });
  }
}

onMounted(() => {
  if (!store.groups.length) void store.fetchAll();
});
</script>
