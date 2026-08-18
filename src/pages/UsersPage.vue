<template>
  <q-page class="q-pa-lg">
    <div class="page-content">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-weight-medium" style="color: var(--app-ink)">Пользователи</div>
        <q-space />
        <q-btn unelevated no-caps icon="add" label="Добавить" color="primary" @click="openCreate" />
      </div>

      <q-table
        :rows="store.items"
        :columns="columns"
        row-key="id"
        :loading="store.loading"
        flat
        bordered
        :rows-per-page-options="[10, 20, 0]"
        table-header-style="table-layout: fixed"
        class="fixed-table"
      >
        <!-- инлайн-смена роли -->
        <template #body-cell-role="props">
          <q-td :props="props">
            <q-select
              :model-value="props.row.role"
              :options="roleOptions"
              emit-value
              map-options
              dense
              borderless
              :disable="isSelf(props.row)"
              @update:model-value="(val) => onRoleChange(props.row, val)"
            />
          </q-td>
        </template>

        <!-- инлайн-смена цеха -->
        <template #body-cell-workshop="props">
          <q-td :props="props">
            <q-select
              :model-value="props.row.workshopId"
              :options="workshopOptions"
              emit-value
              map-options
              dense
              borderless
              clearable
              @update:model-value="(val) => onWorkshopChange(props.row, val)"
            />
          </q-td>
        </template>

        <template #body-cell-active="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.active ? 'green-2' : 'red-2'"
              :text-color="props.row.active ? 'green-9' : 'red-9'"
              :label="props.row.active ? 'Активен' : 'Заблокирован'"
            />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn
              flat
              dense
              round
              size="sm"
              color="grey-7"
              icon="edit"
              @click="openEdit(props.row)"
            >
              <q-tooltip>Изменить</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              size="sm"
              color="grey-7"
              icon="key"
              @click="openResetPassword(props.row)"
            >
              <q-tooltip>Сбросить пароль</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              size="sm"
              :color="props.row.active ? 'orange-8' : 'green-8'"
              :icon="props.row.active ? 'block' : 'check_circle'"
              :disable="isSelf(props.row)"
              @click="store.toggleActive(props.row.id)"
            >
              <q-tooltip>{{ props.row.active ? 'Заблокировать' : 'Разблокировать' }}</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              size="sm"
              color="red-5"
              icon="delete"
              :disable="isSelf(props.row)"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Удалить</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>

      <UserFormDialog
        v-model="dialogOpen"
        :item="editingUser"
        @save="handleSave"
        @hide="editingUser = null"
      />
      <ConfirmDeleteDialog
        v-model="confirmDialog"
        :message="`Удалить «${toDelete?.name}»?`"
        :highlight="toDelete?.login"
        @confirm="doRemove"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useUsersStore } from '@/stores/users';
import { useAuthStore } from '@/stores/auth';
import { useWorkshopStore } from '@/stores/workshop';
import { ROLE_LABELS, type User, type UserRole } from '@/shared/types/user';
import UserFormDialog from '@/components/users/UserFormDialog.vue';
import ConfirmDeleteDialog from '@/components/common/ConfirmDeleteDialog.vue';
import { extractError } from '@/shared/services/errors';

const $q = useQuasar();
const store = useUsersStore();
const workshopStore = useWorkshopStore();
const auth = useAuthStore();
const confirmDialog = ref(false);
const toDelete = ref<User | null>(null);
const editingUser = ref<User | null>(null);

const dialogOpen = ref(false);

const roleOptions = (Object.keys(ROLE_LABELS) as UserRole[]).map((r) => ({
  label: ROLE_LABELS[r],
  value: r,
}));

const workshopOptions = computed(() =>
  workshopStore.items.map((w) => ({ label: w.name, value: w.id })),
);

const columns: QTableColumn<User>[] = [
  {
    name: 'name',
    label: 'Имя',
    field: 'name',
    align: 'left',
    sortable: true,
    style: 'width: 15%',
    headerStyle: 'width: 15%',
  },
  {
    name: 'login',
    label: 'Логин',
    field: 'login',
    align: 'left',
    sortable: true,
    style: 'width: 10%',
    headerStyle: 'width: 10%',
  },
  {
    name: 'role',
    label: 'Роль',
    field: 'role',
    align: 'left',
    sortable: true,
    style: 'width: 18%',
    headerStyle: 'width: 18%',
  },
  {
    name: 'workshop',
    label: 'Цех',
    field: 'workshopId',
    align: 'left',
    sortable: true,
    style: 'width: 22%',
    headerStyle: 'width: 22%',
  },
  {
    name: 'active',
    label: 'Статус',
    field: 'active',
    align: 'left',
    sortable: true,
    style: 'width: 12%',
    headerStyle: 'width: 12%',
  },
  {
    name: 'actions',
    label: '',
    field: 'id',
    align: 'right',
    style: 'width: 13%',
    headerStyle: 'width: 13%',
  },
];

const isSelf = (row: User) => row.id === auth.user?.id;

function openCreate() {
  editingUser.value = null;
  dialogOpen.value = true;
}
function openEdit(row: User) {
  editingUser.value = row;
  dialogOpen.value = true;
}
function confirmDelete(row: User) {
  toDelete.value = row;
  confirmDialog.value = true;
}

async function handleSave(data: Omit<User, 'id'>) {
  const editing = editingUser.value;

  const loginTaken = store.items.some(
    (u) => u.login.toLowerCase() === data.login.toLowerCase() && u.id !== editing?.id,
  );
  if (loginTaken) {
    $q.notify({ type: 'warning', message: `Логин «${data.login}» уже занят` });
    return;
  }
  try {
    if (editing) await store.update(editing.id, data);
    else await store.add(data);
    dialogOpen.value = false;
    editingUser.value = null;
    $q.notify({
      type: 'positive',
      message: editing ? 'Пользователь обновлён' : 'Пользователь добавлен',
    });
  } catch (e) {
    $q.notify({ type: 'negative', message: extractError(e, 'Не удалось сохранить') });
  }
}

async function onRoleChange(row: User, role: UserRole) {
  try {
    await store.changeRole(row.id, role);
    $q.notify({ type: 'positive', message: `Роль «${row.name}» → ${ROLE_LABELS[role]}` });
  } catch (e) {
    $q.notify({ type: 'negative', message: extractError(e, 'Не удалось сменить роль') });
  }
}

async function onWorkshopChange(row: User, workshopId: number | null) {
  try {
    await store.changeWorkshop(row.id, workshopId);
    const name = workshopId ? workshopStore.workshopName(workshopId) : 'без цеха';
    $q.notify({ type: 'positive', message: `Цех «${row.name}» → ${name}` });
  } catch (e) {
    $q.notify({ type: 'negative', message: extractError(e, 'Не удалось сменить цех') });
  }
}

function openResetPassword(row: User) {
  $q.dialog({
    title: 'Сброс пароля',
    message: `Новый пароль для «${row.name}»:`,
    prompt: { model: '', type: 'password', isValid: (v: string) => v.length >= 4 },
    cancel: true,
    persistent: true,
  }).onOk((password: string) => {
    void (async () => {
      try {
        await store.resetPassword(row.id, password);
        $q.notify({ type: 'positive', message: 'Пароль обновлён' });
      } catch (e) {
        $q.notify({ type: 'negative', message: extractError(e, 'Не удалось сбросить пароль') });
      }
    })();
  });
}

async function doRemove() {
  if (!toDelete.value) return;
  try {
    await store.remove(toDelete.value.id);
    $q.notify({ type: 'positive', message: 'Пользователь удалён' });
  } catch (e) {
    $q.notify({ type: 'negative', message: extractError(e, 'Не удалось удалить') });
  }
}

onMounted(() => {
  void store.fetchAll();
  void workshopStore.fetchAll();
});
</script>

<style scoped>
.fixed-table :deep(table) {
  table-layout: fixed;
}
.fixed-table :deep(td) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
