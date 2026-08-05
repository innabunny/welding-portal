<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-md">
      <div class="text-h6 text-weight-medium page-title">Оборудование предприятия</div>
      <q-space />
      <q-btn unelevated no-caps icon="add" label="Добавить" class="add-btn" @click="openCreate" />
    </div>

    <q-table
      :rows="store.items"
      :columns="columns"
      row-key="id"
      :loading="store.loading"
      :filter="search"
      flat
      bordered
      :rows-per-page-options="[10, 20, 50, 0]"
    >
      <template #top-left>
        <q-input v-model="search" dense outlined debounce="300" placeholder="Поиск" style="min-width: 260px">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </template>

      <!-- способ показываем именем, а не id -->
      <template #body-cell-method="props">
        <q-td :props="props">{{ store.methodName(props.value) }}</q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <q-btn flat dense round icon="edit" size="sm" color="grey-7" @click="openEdit(props.row)" />
          <q-btn flat dense round icon="delete" size="sm" color="grey-7" @click="confirmRemove(props.row)" />
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width text-center text-grey-6 q-pa-md">Оборудование не найдено</div>
      </template>
    </q-table>

    <EquipmentFormDialog v-model="dialogOpen" :item="editing" @save="handleSave" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useEquipmentStore } from '@/stores/equipment';
import type { Equipment } from '@/shared/types/equipment';
import EquipmentFormDialog from '@/components/equipment/EquipmentFormDialog.vue';

const $q = useQuasar();
const store = useEquipmentStore();

const search = ref('');
const dialogOpen = ref(false);
const editing = ref<Equipment | null>(null); // null = режим создания

const columns: QTableColumn<Equipment>[] = [
  { name: 'name', label: 'Наименование', field: 'name', align: 'left', sortable: true },
  { name: 'method', label: 'Способ сварки', field: 'method', align: 'left', sortable: true },
  { name: 'shop', label: 'Цех', field: (r) => r.shop ?? '—', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

function openCreate() {
  editing.value = null;
  dialogOpen.value = true;
}

function openEdit(row: Equipment) {
  editing.value = row;
  dialogOpen.value = true;
}

async function handleSave(data: Omit<Equipment, 'id'>) {
  if (editing.value) {
    await store.edit(editing.value.id, data);
  } else {
    await store.add(data);
  }
  dialogOpen.value = false;
}

function confirmRemove(row: Equipment) {
  $q.dialog({
    title: 'Удаление',
    message: `Удалить «${row.name}»?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void store.remove(row.id);
  });
}

onMounted(() => {
  void store.fetchAll();
});
</script>

<style scoped>
.page-title { color: #1d2b45; }
.add-btn { background: #2d4a7c; color: #fff; }
</style>
