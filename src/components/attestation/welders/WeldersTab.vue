<template>
  <div>
    <div class="row items-center q-mb-md">
      <div class="text-subtitle1 text-weight-medium" style="color: var(--app-ink)">
        Справочник сварщиков
      </div>
      <q-space />
      <q-btn
        v-if="isAdmin"
        unelevated
        no-caps
        icon="add"
        label="Новый сварщик"
        color="primary"
        @click="openCreate"
      />
    </div>

    <q-table
      :rows="store.items"
      :columns="columns"
      row-key="id"
      :loading="store.loading"
      flat
      bordered
      :rows-per-page-options="[15, 0]"
    >
      <template #body-cell-fio="props">
        <q-td
          :props="props"
          class="text-weight-medium"
          :class="{ 'text-grey-5': !props.row.isActive }"
        >
          {{ props.row.fio }}
          <q-badge
            v-if="!props.row.isActive"
            color="grey-4"
            text-color="grey-8"
            label="неактивен"
            class="q-ml-sm"
          />
        </q-td>
      </template>
      <template #body-cell-age="props">
        <q-td :props="props">{{ props.row.age ?? '—' }}</q-td>
      </template>
      <template #body-cell-experienceYears="props">
        <q-td :props="props">{{
          props.row.experienceYears != null ? props.row.experienceYears + ' лет' : '—'
        }}</q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <q-btn
            v-if="isAdmin"
            flat
            dense
            round
            size="sm"
            icon="edit"
            color="grey-7"
            @click="openEdit(props.row)"
          >
            <q-tooltip>Редактировать</q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template #no-data>
        <div class="full-width text-center text-grey-6 q-pa-md">Сварщиков пока нет.</div>
      </template>
    </q-table>

    <WelderFormDialog
      v-model="dialogOpen"
      :item="editing"
      :workshop-options="workshopOptions"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useWelderDirectoryStore } from '@/stores/welderDirectory';
import { useWorkshopStore } from '@/stores/workshop';
import { useAuthStore } from '@/stores/auth';
import type { Welder } from '@/shared/types/welders';
import WelderFormDialog, {
  type WelderInput,
} from '@/components/attestation/welders/WelderFormDialog.vue';

const $q = useQuasar();
const store = useWelderDirectoryStore();
const workshopStore = useWorkshopStore();
const auth = useAuthStore();

const isAdmin = computed(() => auth.user?.role === 'admin');
const dialogOpen = ref(false);
const editing = ref<Welder | null>(null);
const workshopOptions = computed(() =>
  workshopStore.items.map((w) => ({ label: w.name, value: w.id })),
);

const columns: QTableColumn<Welder>[] = [
  { name: 'fio', label: 'ФИО', field: 'fio', align: 'left' },
  {
    name: 'workshopName',
    label: 'Цех',
    field: 'workshopName',
    align: 'left',
    format: (v) => v ?? '—',
  },
  { name: 'rank', label: 'Разряд', field: 'rank', align: 'left', format: (v) => v || '—' },
  {
    name: 'personalStamp',
    label: 'Клеймо',
    field: 'personalStamp',
    align: 'left',
    format: (v) => v || '—',
  },
  { name: 'age', label: 'Возраст', field: 'age', align: 'left' },
  { name: 'experienceYears', label: 'Стаж', field: 'experienceYears', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

function openCreate() {
  editing.value = null;
  dialogOpen.value = true;
}
function openEdit(w: Welder) {
  editing.value = w;
  dialogOpen.value = true;
}

async function handleSave(data: WelderInput) {
  const isEdit = !!editing.value;
  try {
    if (editing.value) await store.update(editing.value.id, data);
    else await store.add(data);
    dialogOpen.value = false;
    $q.notify({ type: 'positive', message: isEdit ? 'Сварщик обновлён' : 'Сварщик добавлен' });
  } catch {
    $q.notify({ type: 'negative', message: 'Не удалось сохранить сварщика' });
  }
}

onMounted(async () => {
  try {
    await Promise.all([store.fetchAll(), workshopStore.fetchAll()]);
  } catch {
    $q.notify({ type: 'negative', message: 'Не удалось загрузить сварщиков' });
  }
});
</script>
