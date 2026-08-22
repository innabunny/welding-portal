<template>
  <q-card flat bordered class="ot-card">
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      :rows-per-page-options="[10, 20, 50]"
      no-data-label="Заявок пока нет"
      @row-click="(_, row) => openOrders(row)"
    >
      <template #body-cell-status="cellProps">
        <q-td :props="cellProps">
          <q-chip dense square color="primary" text-color="white" class="ot-status">
            {{ statusLabel(cellProps.row.status) }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-actions="cellProps">
        <q-td :props="cellProps" @click.stop>
          <q-btn
            v-if="cellProps.row.status === 'draft'"
            flat
            dense
            no-caps
            size="sm"
            icon="edit"
            label="Редактировать"
            color="primary"
            @click="editRow(cellProps.row)"
          />
        </q-td>
      </template>
    </q-table>
  </q-card>

  <OrdersDialog
    v-model="ordersOpen"
    :welder-name="selected.welderName"
    :welder-workshop="selected.welderWorkshop"
    :method-name="selected.methodName"
    :group-name="selected.groupName"
    :pairs="selected.pairs"
    :controls="selected.controls"
    :material-label="materialLabel"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAttestationsStore } from '@/stores/attestations';
import { useMaterialsStore } from '@/stores/materials';
import { useEquipmentStore } from '@/stores/equipment';
import { useWelderDirectoryStore } from '@/stores/welderDirectory';
import OrdersDialog from './OrdersDialog.vue';
import type { AttestationListItem } from '@/shared/types/attestation';
import type { MaterialPair } from '@/shared/types/attestation';

const attestationsStore = useAttestationsStore();
const materialsStore = useMaterialsStore();
const equipmentStore = useEquipmentStore();
const welderStore = useWelderDirectoryStore();
const { items, loading } = storeToRefs(attestationsStore);

const emit = defineEmits<{ edit: [item: AttestationListItem] }>();

const columns = [
  { name: 'welder', label: 'Сварщик', field: 'welder', align: 'left' as const },
  { name: 'method', label: 'Способ сварки', field: 'method', align: 'left' as const },
  { name: 'created', label: 'Дата', field: 'created', align: 'left' as const },
  { name: 'status', label: 'Статус', field: 'status', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

function welderName(id: number): string {
  return welderStore.items.find((w) => w.id === id)?.fio ?? `#${id}`;
}
function methodName(id: string): string {
  return equipmentStore.methods.find((m) => m.id === id)?.name ?? id;
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
}
function statusLabel(s: string): string {
  const map: Record<string, string> = {
    draft: 'Черновик',
    testing: 'Ждём испытаний',
    protocol: 'Протокол',
    review: 'Согласование',
    done: 'Аттестован',
  };
  return map[s] ?? s;
}

const rows = computed(() =>
  items.value.map((a) => ({
    ...a,
    welder: welderName(a.welderId),
    method: methodName(a.methodId),
    created: fmtDate(a.createdAt),
  })),
);

function materialLabel(id: number | null): string {
  if (id === null) return '—';
  return materialsStore.items.find((m) => m.id === id)?.marka ?? '—';
}
function groupName(id: number): string {
  return materialsStore.groups.find((g) => g.id === id)?.code ?? '';
}

// данные для модалки по выбранной строке
const ordersOpen = ref(false);
const selected = reactive<{
  welderName: string;
  welderWorkshop: string;
  methodName: string;
  groupName: string;
  pairs: MaterialPair[];
  controls: string[];
}>({
  welderName: '',
  welderWorkshop: '',
  methodName: '',
  groupName: '',
  pairs: [],
  controls: [],
});

function openOrders(a: AttestationListItem) {
  const welder = welderStore.items.find((w) => w.id === a.welderId);
  selected.welderName = welder?.fio ?? `#${a.welderId}`;
  selected.welderWorkshop = welder?.workshopName ?? '';
  selected.methodName = methodName(a.methodId);
  selected.groupName = groupName(a.groupId);
  selected.controls = a.controls;
  selected.pairs = a.items.map((it, i) => ({
    id: i,
    sampleNo: it.sampleNo,
    material1Id: it.material1,
    material2Id: it.material2,
    uniform: it.uniform,
    thicknessMin: it.thicknessMin === null ? null : Number(it.thicknessMin),
    thicknessMax: it.thicknessMax === null ? null : Number(it.thicknessMax),
    wireValue: it.wire,
    fluxValue: it.flux,
    position: it.position,
    preheat: it.preheat,
    heatTreatment: it.heatTreatment,
  }));
  ordersOpen.value = true;
}

function editRow(row: AttestationListItem) {
  emit('edit', row);
}

onMounted(() => {
  void attestationsStore.fetchAll();
  void materialsStore.fetchAll();
  void welderStore.fetchAll();
  void equipmentStore.fetchAll();
});
</script>

<style scoped lang="scss">
.ot-card {
  border-radius: 14px;
  background: var(--app-surface);
}
.ot-status {
  font-size: 11px;
  font-weight: 600;
}
:deep(.q-table tbody tr) {
  cursor: pointer;
}
:deep(.q-table tbody tr:hover) {
  background: var(--app-bg);
}
</style>
