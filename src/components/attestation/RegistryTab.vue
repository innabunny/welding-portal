<template>
  <q-card flat bordered class="rt-card">
    <div class="rt-filters">
      <q-input
        v-model="search"
        dense
        outlined
        clearable
        placeholder="Поиск по ФИО"
        class="rt-search"
      >
        <template #prepend><q-icon name="search" /></template>
      </q-input>
      <q-select
        v-model="methodFilter"
        :options="methodOptions"
        emit-value
        map-options
        dense
        outlined
        clearable
        label="Способ сварки"
        class="rt-filter"
      />
      <q-select
        v-model="expiryFilter"
        :options="EXPIRY_FILTER_OPTIONS"
        emit-value
        map-options
        dense
        outlined
        clearable
        label="Срок действия"
        class="rt-filter"
      />
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      :rows-per-page-options="[10, 20, 50]"
      no-data-label="Аттестаций пока нет"
    >
      <template #body-cell-expiry="cellProps">
        <q-td :props="cellProps">
          <q-chip
            v-if="expiryMeta(cellProps.row.expiryState)"
            dense
            square
            :color="expiryMeta(cellProps.row.expiryState)!.color"
            text-color="white"
            class="rt-chip"
          >
            {{ expiryMeta(cellProps.row.expiryState)!.label }}
          </q-chip>
          <span v-else class="rt-muted">—</span>
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAttestationsStore } from '@/stores/attestations';
import { useEquipmentStore } from '@/stores/equipment';
import { useMaterialsStore } from '@/stores/materials';
import { useWelderDirectoryStore } from '@/stores/welderDirectory';
import { EXPIRY_META, type ExpiryState } from '@/shared/types/attestation';

const attestationsStore = useAttestationsStore();
const equipmentStore = useEquipmentStore();
const materialsStore = useMaterialsStore();
const welderStore = useWelderDirectoryStore();
const { items, loading } = storeToRefs(attestationsStore);

const search = ref('');
const methodFilter = ref<string | null>(null);
const expiryFilter = ref<ExpiryState | null>(null);

const EXPIRY_FILTER_OPTIONS = [
  { label: 'Действует', value: 'valid' },
  { label: 'Истекает', value: 'soon' },
  { label: 'Просрочена', value: 'expired' },
];

const methodOptions = computed(() =>
  equipmentStore.methods.map((m) => ({ label: m.name, value: m.id })),
);

const columns = [
  { name: 'welder', label: 'Сварщик', field: 'welder', align: 'left' as const, sortable: true },
  { name: 'workshop', label: 'Цех', field: 'workshop', align: 'left' as const },
  { name: 'kind', label: 'Вид', field: 'kind', align: 'left' as const },
  { name: 'method', label: 'Способ сварки', field: 'method', align: 'left' as const },
  { name: 'group', label: 'Группа', field: 'group', align: 'left' as const },
  { name: 'status', label: 'Статус', field: 'status', align: 'left' as const },
  {
    name: 'attested',
    label: 'Дата аттестации',
    field: 'attested',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'until', label: 'Действует до', field: 'until', align: 'left' as const, sortable: true },
  { name: 'expiry', label: 'Срок', field: 'expiryState', align: 'left' as const },
];
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
function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('ru-RU') : '—';
}

const rows = computed(() =>
  items.value
    .filter((a) => !methodFilter.value || a.methodId === methodFilter.value)
    .filter((a) => !expiryFilter.value || a.expiryState === expiryFilter.value)
    .map((a) => {
      const welder = welderStore.items.find((w) => w.id === a.welderId);
      return {
        ...a,
        welder: welder?.fio ?? `#${a.welderId}`,
        workshop: welder?.workshopName ?? '—',
        method: equipmentStore.methods.find((m) => m.id === a.methodId)?.name ?? a.methodId,
        group: materialsStore.groups.find((g) => g.id === a.groupId)?.code ?? '',
        attested: fmtDate(a.attestedAt),
        until: fmtDate(a.validUntil),
         status: statusLabel(a.status),
      };
    })
    .filter((r) => !search.value || r.welder.toLowerCase().includes(search.value.toLowerCase())),
);

function expiryMeta(state: ExpiryState) {
  return state ? EXPIRY_META[state] : null;
}

onMounted(() => {
  void attestationsStore.fetchAll();
  void equipmentStore.fetchAll();
  void materialsStore.fetchAll();
  void welderStore.fetchAll();
});
</script>

<style scoped lang="scss">
.rt-card {
  border-radius: 14px;
  background: var(--app-surface);
}
.rt-filters {
  display: flex;
  gap: 12px;
  padding: 14px 14px 4px;
}
.rt-search {
  max-width: 260px;
  flex: 1;
}
.rt-filter {
  min-width: 200px;
}
.rt-chip {
  font-size: 11px;
  font-weight: 600;
}
.rt-muted {
  color: var(--app-ink-soft);
}
</style>
