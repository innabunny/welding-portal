<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-md">
      <div class="text-h6 text-weight-medium" style="color: var(--app-ink)">Пользователи</div>
      <q-space />
      <q-btn
        unelevated
        no-caps
        icon="add"
        label="Добавить"
        color="primary"
        @click="dialogOpen = true"
      />
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
            color="grey-7"
            icon="delete"
            :disable="isSelf(props.row)"
            @click="onRemove(props.row)"
          >
            <q-tooltip>Удалить</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <UserFormDialog v-model="dialogOpen" @save="handleCreate" />
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

const $q = useQuasar();
const store = useUsersStore();
const workshopStore = useWorkshopStore();
const auth = useAuthStore();

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

async function onRoleChange(row: User, role: UserRole) {
  await store.changeRole(row.id, role);
  $q.notify({ type: 'positive', message: `Роль «${row.name}» → ${ROLE_LABELS[role]}` });
}

async function onWorkshopChange(row: User, workshopId: number | null) {
  await store.changeWorkshop(row.id, workshopId);
  const name = workshopId ? workshopStore.workshopName(workshopId) : 'без цеха';
  $q.notify({ type: 'positive', message: `Цех «${row.name}» → ${name}` });
}

async function handleCreate(data: Omit<User, 'id'>) {
  await store.add(data);
  dialogOpen.value = false;
  $q.notify({ type: 'positive', message: 'Пользователь добавлен' });
}

function openResetPassword(row: User) {
  $q.dialog({
    title: 'Сброс пароля',
    message: `Новый пароль для «${row.name}»:`,
    prompt: { model: '', type: 'password', isValid: (v: string) => v.length >= 4 },
    cancel: true,
    persistent: true,
  }).onOk((password: string) => {
    void store
      .resetPassword(row.id, password)
      .then(() => $q.notify({ type: 'positive', message: 'Пароль обновлён' }));
  });
}

function onRemove(row: User) {
  $q.dialog({
    title: 'Удаление',
    message: `Удалить «${row.name}»?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void store
      .remove(row.id)
      .then(() => $q.notify({ type: 'positive', message: 'Пользователь удалён' }));
  });
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
