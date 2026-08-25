<template>
  <q-page class="q-pa-lg">
    <div class="page-content">
      <!-- ================= МАСТЕР: подача заявок ================= -->
      <template v-if="canSubmit">
        <div class="row items-center q-mb-md">
          <div class="text-h6 text-weight-medium" style="color: var(--app-ink)">
            Заявка на обслуживание оборудования
          </div>
          <q-space />
          <q-btn
            v-if="canCreate"
            unelevated
            no-caps
            icon="add"
            label="Новая заявка"
            color="primary"
            @click="dialogOpen = true"
          />
        </div>
        <!-- заглушка, если мастеру не назначен цех -->
        <q-banner
          v-if="isMaster && auth.user?.workshopId == null"
          rounded
          class="q-mb-md warn-banner"
        >
          <template #avatar><q-icon name="warning_amber" color="orange-8" /></template>
          Вашей учётной записи не назначен цех. Обратитесь к администратору.
        </q-banner>

        <q-banner
          v-else-if="isMaster && availableEquipment.length === 0"
          rounded
          class="q-mb-md warn-banner"
        >
          <template #avatar><q-icon name="info" color="orange-8" /></template>
          За вашим цехом не числится оборудование. Обратитесь к администратору.
        </q-banner>

        <q-banner
          v-else-if="isAdmin && availableEquipment.length === 0"
          rounded
          class="q-mb-md warn-banner"
        >
          <template #avatar><q-icon name="info" color="orange-8" /></template>
          В справочнике нет оборудования — добавьте его, чтобы подавать заявки.
        </q-banner>

        <div class="text-subtitle1 text-weight-medium q-mb-sm" style="color: var(--app-ink)">
          Мои заявки
        </div>
        <q-table
          :rows="myRequests"
          :columns="masterColumns"
          row-key="id"
          :loading="store.loading"
          flat
          bordered
          :rows-per-page-options="[10, 0]"
        >
          <template #body-cell-priority="props">
            <q-td :props="props"
              ><q-badge :style="chip(PRIORITY_META, props.row.priority)">{{
                props.row.priority
              }}</q-badge></q-td
            >
          </template>
          <template #body-cell-status="props">
            <q-td :props="props"
              ><q-badge :style="chip(STATUS_META, props.row.status)">{{
                props.row.status
              }}</q-badge></q-td
            >
          </template>
          <template #no-data>
            <div class="full-width text-center text-grey-6 q-pa-md">Вы ещё не подавали заявок.</div>
          </template>
        </q-table>

        <MaintenanceFormDialog
          v-model="dialogOpen"
          :equipment-options="equipmentOptions"
          @save="handleCreate"
        />
      </template>

      <!-- ============= МЕХАНИК / АДМИН: обработка ============= -->
      <template v-if="canManage">
        <div class="row items-center q-my-md">
          <div class="text-h6 text-weight-medium" style="color: var(--app-ink)">
            Заявки на ремонт оборудования
          </div>
          <q-space />
          <q-badge
            v-if="store.openCount"
            color="deep-orange-6"
            text-color="white"
            :label="`открытых: ${store.openCount}`"
          />
        </div>

        <q-table
          :rows="store.items"
          :columns="manageColumns"
          row-key="id"
          :loading="store.loading"
          flat
          bordered
          :rows-per-page-options="[10, 20, 0]"
          table-header-style="table-layout: fixed"
          class="fixed-table"
        >
          <template #body-cell-priority="props">
            <q-td :props="props"
              ><q-badge :style="chip(PRIORITY_META, props.row.priority)">{{
                props.row.priority
              }}</q-badge></q-td
            >
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <q-select
                v-if="['mechanic', 'admin'].includes(auth.user?.role ?? '')"
                :model-value="props.row.status"
                :options="STATUSES"
                dense
                borderless
                emit-value
                @update:model-value="(val) => changeStatus(props.row, val)"
              />
              <q-badge v-else :style="chip(STATUS_META, props.row.status)">{{
                props.row.status
              }}</q-badge>
            </q-td>
          </template>

          <template #body-cell-closed="props">
            <q-td :props="props">
              <span v-if="props.row.status === 'выполнена'">
                {{ props.row.closedBy || '—' }}<br />
                <span class="text-grey-6" style="font-size: 11px">
                  {{
                    props.row.closedAt
                      ? new Date(props.row.closedAt).toLocaleDateString('ru-RU')
                      : ''
                  }}
                </span>
              </span>
              <span v-else class="text-grey-5">—</span>
            </q-td>
          </template>
        </q-table>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useServiceStore } from '@/stores/service';
import { useAuthStore } from '@/stores/auth';
import { useEquipmentStore } from '@/stores/equipment';
import { useWorkshopStore } from '@/stores/workshop';
import { PRIORITY_META, STATUS_META, STATUSES } from '@/shared/composables/useServiceRequests';
import type {
  ServiceRequest,
  RequestReason,
  RequestPriority,
  RequestStatus,
} from '@/shared/types/serviceRequest';
import MaintenanceFormDialog from '@/components/maintenance/MaintenanceFormDialog.vue';

const $q = useQuasar();
const store = useServiceStore();
const auth = useAuthStore();
const equipmentStore = useEquipmentStore();
const workhopStore = useWorkshopStore();

const isMaster = computed(() => auth.user?.role === 'master');
const canSubmit = computed(() => ['master', 'admin'].includes(auth.user?.role ?? ''));
const canManage = computed(() => ['mechanic', 'admin'].includes(auth.user?.role ?? ''));
const isAdmin = computed(() => auth.user?.role === 'admin');

const dialogOpen = ref(false);
const canCreate = computed(
  () => availableEquipment.value.length > 0 && (isAdmin.value || auth.user?.workshopId != null),
);

async function handleCreate(data: {
  equipmentId: number;
  reason: RequestReason;
  description: string;
  priority: RequestPriority;
}) {
  if (!auth.user) return;
  const eq = availableEquipment.value.find((e) => e.id === data.equipmentId);
  await store.add({
    date: new Date().toISOString().slice(0, 10),
    equipmentId: data.equipmentId,
    equipmentName: eq?.name ?? '',
    workshopId: eq?.workshopId ?? auth.user.workshopId ?? null,
    masterLogin: auth.user.login,
    masterName: auth.user.name,
    reason: data.reason,
    description: data.description,
    priority: data.priority,
    status: 'новая',
    closedBy: null,
    closedAt: null,
  });
  dialogOpen.value = false;
  $q.notify({ type: 'positive', message: 'Заявка отправлена' });
}

// оборудование цеха мастера
const availableEquipment = computed(() =>
  isAdmin.value
    ? equipmentStore.items
    : equipmentStore.items.filter((e) => e.workshopId === auth.user?.workshopId),
);

const equipmentOptions = computed(() =>
  availableEquipment.value.map((e) => ({
    label: isAdmin.value ? `${e.name} — ${workhopStore.workshopName(e.workshopId)}` : e.name,
    value: e.id,
  })),
);

// заявки текущего мастера
const myRequests = computed(() => (auth.user ? store.byMaster(auth.user.login) : []));

const chip = (meta: Record<string, { bg: string; fg: string }>, key: string) => {
  const m = meta[key];
  return { backgroundColor: m?.bg, color: m?.fg, fontWeight: 500, padding: '4px 10px' };
};

function changeStatus(row: ServiceRequest, status: RequestStatus) {
  void store
    .setStatus(row.id, status, auth.user?.name)
    .then(() => $q.notify({ type: 'positive', message: `Статус заявки → ${status}` }));
}

const masterColumns: QTableColumn<ServiceRequest>[] = [
  {
    name: 'date',
    label: 'Дата',
    field: 'date',
    align: 'left',
    style: 'width: 10%',
    headerStyle: 'width: 10%',
    format: (v) => new Date(v).toLocaleDateString('ru-RU'),
  },
  {
    name: 'equipmentName',
    label: 'Оборудование',
    field: 'equipmentName',
    align: 'left',
    style: 'width: 10%',
    headerStyle: 'width: 10%',
  },
  {
    name: 'reason',
    label: 'Причина',
    field: 'reason',
    align: 'left',
    style: 'width: 15%',
    headerStyle: 'width: 15%',
  },
  {
    name: 'description',
    label: 'Описание',
    field: 'description',
    align: 'left',
    style: 'width: 15%',
    headerStyle: 'width: 15%',
  },
  {
    name: 'priority',
    label: 'Срочность',
    field: 'priority',
    align: 'left',
    style: 'width: 15%',
    headerStyle: 'width: 15%',
  },
  {
    name: 'status',
    label: 'Статус',
    field: 'status',
    align: 'left',
    style: 'width: 15%',
    headerStyle: 'width: 15%',
  },
];

const manageColumns: QTableColumn<ServiceRequest>[] = [
  {
    name: 'date',
    label: 'Дата',
    field: 'date',
    align: 'left',
    format: (v) => new Date(v).toLocaleDateString('ru-RU'),
  },
  { name: 'masterName', label: 'Заявитель', field: 'masterName', align: 'left' },
  { name: 'equipmentName', label: 'Оборудование', field: 'equipmentName', align: 'left' },
  { name: 'reason', label: 'Причина', field: 'reason', align: 'left' },
  { name: 'description', label: 'Описание', field: 'description', align: 'left' },
  { name: 'priority', label: 'Срочность', field: 'priority', align: 'left' },
  { name: 'status', label: 'Статус', field: 'status', align: 'left' },
  { name: 'closed', label: 'Кто закрыл', field: 'closedBy', align: 'left' },
];

onMounted(() => {
  void store.fetchAll();
  void equipmentStore.fetchAll(); // для оборудования цеха мастера
  void workhopStore.fetchAll();
});
</script>

<style scoped>
.warn-banner {
  background: var(--status-soon-bg);
  color: var(--status-soon-fg);
}
.fixed-table :deep(table) {
  table-layout: fixed;
}
.fixed-table :deep(td) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
