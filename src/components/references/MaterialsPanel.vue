<template>
  <div >
    <div class="row items-center q-mb-md">
      <div class="text-subtitle1 text-weight-medium" style="color: var(--app-ink)">
        Основные материалы
      </div>
      <q-space />
      <q-btn
        v-if="isAdmin"
        unelevated
        no-caps
        icon="add"
        label="Новая марка"
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
      <template #body-cell-groupCode="props">
        <q-td :props="props">
          <q-badge
            v-if="props.row.groupCode"
            color="grey-3"
            text-color="grey-9"
            :label="props.row.groupCode"
          />
          <span v-else class="text-grey-5">—</span>
        </q-td>
      </template>
      <template #body-cell-tensileStrength="props">
        <q-td :props="props">{{
          props.row.tensileStrength != null ? props.row.tensileStrength : '—'
        }}</q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props" class="text-right" style="white-space: nowrap">
          <q-btn
            v-if="isAdmin"
            flat
            size="md"
            padding="6px"
            icon="edit"
            color="grey-7"
            @click="openEdit(props.row)"
          >
            <q-tooltip>Редактировать</q-tooltip>
          </q-btn>
          <q-btn
            v-if="isAdmin"
            flat
            size="md"
            padding="6px"
            icon="delete"
            color="red-5"
            @click="removeMaterial(props.row)"
          >
            <q-tooltip>Удалить</q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template #no-data>
        <div class="full-width text-center text-grey-6 q-pa-md">Марок пока нет.</div>
      </template>
    </q-table>

    <MaterialFormDialog
      v-model="dialogOpen"
      :item="editing"
      :groups="store.groups"
      @save="handleSave"
    />

    <ConfirmDeleteDialog
      v-model="confirmOpen"
      message="Удалить марку из справочника?"
      :highlight="toDelete?.marka"
      @confirm="doRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useMaterialsStore } from '@/stores/materials';
import { useAuthStore } from '@/stores/auth';
import type { Material } from '@/shared/types/materials';
import MaterialFormDialog, {
  type MaterialInput,
} from '@/components/references/MaterialFormDialog.vue';
import ConfirmDeleteDialog from '../common/ConfirmDeleteDialog.vue';

const $q = useQuasar();
const store = useMaterialsStore();
const auth = useAuthStore();

const isAdmin = computed(() => auth.user?.role === 'admin');
const dialogOpen = ref(false);
const editing = ref<Material | null>(null);

const columns: QTableColumn<Material>[] = [
  { name: 'marka', label: 'Марка', field: 'marka', align: 'left' },
  { name: 'groupCode', label: 'Группа', field: 'groupCode', align: 'left' },
  { name: 'tensileStrength', label: 'Прочность, кгс/мм²', field: 'tensileStrength', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

const confirmOpen = ref(false);
const toDelete = ref<Material | null>(null);

function removeMaterial(m: Material) {
  toDelete.value = m;
  confirmOpen.value = true;
}
async function doRemove() {
  if (!toDelete.value) return;
  try {
    await store.remove(toDelete.value.id);
    $q.notify({ type: 'positive', message: 'Марка удалена' });
  } catch {
    $q.notify({ type: 'negative', message: 'Не удалось удалить' });
  }
}

function openCreate() {
  editing.value = null;
  dialogOpen.value = true;
}
function openEdit(m: Material) {
  editing.value = m;
  dialogOpen.value = true;
}

async function handleSave(data: MaterialInput) {
  const isEdit = !!editing.value;
  try {
    if (editing.value) await store.update(editing.value.id, data);
    else await store.add(data);
    dialogOpen.value = false;
    $q.notify({ type: 'positive', message: isEdit ? 'Марка обновлена' : 'Марка добавлена' });
  } catch {
    $q.notify({ type: 'negative', message: 'Не удалось сохранить марку' });
  }
}

onMounted(async () => {
  try {
    await store.fetchAll();
  } catch {
    $q.notify({ type: 'negative', message: 'Не удалось загрузить материалы' });
  }
});
</script>
