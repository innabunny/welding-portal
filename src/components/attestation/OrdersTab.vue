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
          <q-btn
            flat
            dense
            no-caps
            size="sm"
            icon="description"
            label="Протокол"
            color="primary"
            @click="openProtocol(cellProps.row)"
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
    :kind="selected.kind"
    :pairs="selected.pairs"
    :controls="selected.controls"
    :attestation-id="selected.attestationId"
    :created-at="selected.createdAt"
    :master-name="masterName"
    :material-label="materialLabel"
  />

  <ProtocolDialog
    v-model="protocolOpen"
    :welder="selected.welder"
    :method-name="selected.methodName"
    :pairs="selected.pairs"
    :material-label="materialLabel"
    :tensile-by-material="tensileByMaterial"
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
import type { MaterialPair, AttestationKind } from '@/shared/types/attestation';
import type { Welder } from '@/shared/types/welders.js';
import ProtocolDialog from './ProtocolDialog.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const attestationsStore = useAttestationsStore();
const materialsStore = useMaterialsStore();
const equipmentStore = useEquipmentStore();
const welderStore = useWelderDirectoryStore();
const { items, loading } = storeToRefs(attestationsStore);

const emit = defineEmits<{ edit: [item: AttestationListItem] }>();

const protocolOpen = ref(false);

const columns = [
  { name: 'welder', label: 'Сварщик', field: 'welder', align: 'left' as const },
  { name: 'kind', label: 'Вид', field: 'kind', align: 'left' as const },
  { name: 'method', label: 'Способ сварки', field: 'method', align: 'left' as const },
  { name: 'created', label: 'Дата', field: 'created', align: 'left' as const },
  { name: 'status', label: 'Статус', field: 'status', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const masterName = computed(() => authStore.user?.name ?? '');

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
  welder: Welder | null;
  welderName: string;
  welderWorkshop: string;
  methodName: string;
  groupName: string;
  kind: AttestationKind;
  pairs: MaterialPair[];
  controls: string[];
  attestationId: number | null;
  createdAt: string | null;
}>({
  welder: null,
  welderName: '',
  welderWorkshop: '',
  methodName: '',
  groupName: '',
  kind: 'первичная',
  pairs: [],
  controls: [],
  attestationId: null,
  createdAt: null,
});

function fillSelected(a: AttestationListItem) {
  const welder = welderStore.items.find((w) => w.id === a.welderId) ?? null;
  selected.welder = welder;
  selected.welderName = welder?.fio ?? `#${a.welderId}`;
  selected.welderWorkshop = welder?.workshopName ?? '';
  selected.methodName = methodName(a.methodId);
  selected.groupName = groupName(a.groupId);
  selected.controls = [...a.controls];
  selected.kind = a.kind;
  selected.attestationId = a.id;
  selected.createdAt = a.createdAt;
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
    gasValue: it.gas,
    position: it.position,
    preheat: it.preheat,
    heatTreatment: it.heatTreatment,
  }));
}

function openOrders(a: AttestationListItem) {
  fillSelected(a);
  ordersOpen.value = true;
}

function openProtocol(a: AttestationListItem) {
  fillSelected(a);
  protocolOpen.value = true;
}

function editRow(row: AttestationListItem) {
  emit('edit', row);
}

function tensileByMaterial(id: number | null): string | null {
  if (id === null) return null;
  const m = materialsStore.items.find((x) => x.id === id);
  return m?.tensileStrength ?? null;
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
