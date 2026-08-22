<template>
  <div class="af-outer">
    <q-card flat bordered class="af-card">
      <q-card-section>
        <div class="af-grid2 af-welder-field">
          <div class="af-field">
            <div class="af-label">Сварщик</div>
            <q-select
              v-model="selectedWelderId"
              :options="welderOptions"
              emit-value
              map-options
              outlined
              dense
              placeholder="Выберите сварщика"
              :error="showErrors && !selectedWelderId"
              error-message="Обязательно"
              hide-bottom-space
            />
          </div>

          <div class="af-field">
            <div class="af-label">Вид аттестации</div>
            <q-select
              v-model="kind"
              :options="KIND_OPTIONS"
              emit-value
              map-options
              outlined
              dense
              hide-bottom-space
            />
          </div>
        </div>
        <div class="af-grid2">
          <div class="af-field">
            <div class="af-label">Способ сварки</div>
            <q-select
              v-model="form.methodId"
              :options="methodOptions"
              emit-value
              map-options
              outlined
              dense
              placeholder="Выберите способ"
              hide-bottom-space
            />
          </div>

          <div class="af-field">
            <div class="af-label">Группа материала</div>
            <q-select
              v-model="form.groupId"
              :options="groupOptions"
              emit-value
              map-options
              outlined
              dense
              :disable="!form.methodId"
              placeholder="Сначала выберите способ"
              hide-bottom-space
            />
          </div>
        </div>

        <div class="af-pairs" v-if="form.groupId">
          <div class="af-pairs__head">
            <span>Пары материалов (образцы)</span>
            <span class="af-pairs__count">{{ pairs.length }} из {{ MAX_PAIRS }}</span>
          </div>

          <div class="af-pairs__list">
            <PairCard
              v-for="(pair, i) in pairs"
              :key="pair.id"
              :model-value="pair"
              :index="i"
              :removable="canRemovePair"
              :material-options="materialOptions"
              :flux-options="fluxOptions"
              :wire-options="wireOptions"
              :gas-options="gasOptions"
              :show-errors="showErrors"
              @update:model-value="(v) => updatePair(i, v)"
              @remove="removePair(i)"
            />
          </div>

          <q-btn
            flat
            no-caps
            dense
            icon="add"
            label="Добавить пару"
            color="primary"
            class="af-add"
            :disable="!canAddPair"
            @click="addPair"
          />
        </div>
        <div class="af-controls" v-if="form.groupId">
          <div class="af-controls__head">Виды контроля</div>
          <div class="af-controls__grid">
            <q-checkbox
              v-for="opt in CONTROL_OPTIONS"
              :key="opt.value"
              v-model="controls"
              :val="opt.value"
              :label="opt.label"
              dense
            />
          </div>
        </div>

        <div class="af-footer" v-if="form.groupId">
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon-right="send"
            :label="editId ? 'Сохранить изменения' : 'Сохранить и отправить заявки'"
            class="af-submit"
            @click="onSubmit"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>

  <OrdersDialog
    v-model="ordersOpen"
    :welder-name="selectedWelderName"
    :welder-workshop="selectedWelderWorkshop"
    :method-name="selectedMethodName"
    :group-name="selectedGroupName"
    :pairs="pairs"
    :kind="kind"
    :controls="controls"
    :material-label="materialLabel"
  />
</template>

<script setup lang="ts">
import { computed, reactive, onMounted, watch, ref, nextTick } from 'vue';
import { useAttestationsStore } from '@/stores/attestations';
import { useQuasar } from 'quasar';
import type { AttestationDraft, AttestationListItem } from '@/shared/types/attestation';
import { storeToRefs } from 'pinia';
import { useEquipmentStore } from '@/stores/equipment';
import { useMaterialsStore } from '@/stores/materials';
import PairCard from './PairCard.vue';
import type { MaterialPair } from '@/shared/types/attestation';
import { blankPair } from '@/shared/types/attestation';
import { CONTROL_OPTIONS } from '@/shared/constants/attestation.js';
import type { Welder } from '@/shared/types/welders.js';
import OrdersDialog from '../OrdersDialog.vue';
import { useWelderDirectoryStore } from '@/stores/welderDirectory.js';
import { KIND_OPTIONS, type AttestationKind } from '@/shared/types/attestation';
import { useReferenceStore } from '@/stores/references.js';

const props = defineProps<{ welder: Welder | null; editItem?: AttestationListItem | null }>();

const equipmentStore = useEquipmentStore();
const materialsStore = useMaterialsStore();
const welderStore = useWelderDirectoryStore();
const referencesStore = useReferenceStore();
const { methods } = storeToRefs(equipmentStore);
const { groups } = storeToRefs(materialsStore);
const attestationsStore = useAttestationsStore();
const $q = useQuasar();

const form = reactive<{ methodId: string | null; groupId: number | null }>({
  methodId: null,
  groupId: null,
});

const controls = ref<string[]>([]);
const loadingEdit = ref(false);

const methodOptions = computed(() => methods.value.map((m) => ({ label: m.name, value: m.id })));
const groupOptions = computed(() => groups.value.map((g) => ({ label: g.code, value: g.id })));

const MAX_PAIRS = 5;
const pairs = reactive<MaterialPair[]>([blankPair()]);
const showErrors = ref(false);
const editId = ref<number | null>(null);
const canAddPair = computed(() => pairs.length < MAX_PAIRS);
const canRemovePair = computed(() => pairs.length > 1);
const ordersOpen = ref(false);
const selectedWelderId = ref<number | null>(null);
const kind = ref<AttestationKind>('первичная');

const gasOptions = computed(() =>
  (referencesStore.byCategory['gases'] ?? []).map((r) => ({ label: r.value, value: r.value })),
);

function addPair() {
  if (canAddPair.value) {
    pairs.push(blankPair());
  }
}

function updatePair(index: number, value: MaterialPair) {
  pairs[index] = value;
}

function removePair(index: number) {
  if (canRemovePair.value) pairs.splice(index, 1);
}

const selectedWelderName = computed(
  () => welderStore.items.find((w) => w.id === selectedWelderId.value)?.fio ?? '',
);
const selectedWelderWorkshop = computed(
  () => welderStore.items.find((w) => w.id === selectedWelderId.value)?.workshopName ?? '',
);

const groupMaterials = computed(() =>
  materialsStore.items.filter((m) => m.groupId === form.groupId),
);

const materialOptions = computed(() =>
  groupMaterials.value.map((m) => ({ label: m.marka, value: m.id })),
);

// флюсы выбранной группы + всегда «без флюса»
const fluxOptions = computed(() => {
  const group = materialsStore.groups.find((g) => g.id === form.groupId);
  const list = (group?.fluxes ?? []).map((f) => ({ label: f, value: f }));
  return [{ label: 'Без флюса', value: '' }, ...list];
});

const wireOptions = computed(() => {
  const group = materialsStore.groups.find((g) => g.id === form.groupId);
  return (group?.wires ?? []).map((w) => ({ label: w, value: w }));
});

function isPairComplete(p: MaterialPair): boolean {
  return (
    !!p.sampleNo &&
    !!p.material1Id &&
    (p.uniform || !!p.material2Id) &&
    p.thicknessMin !== null &&
    p.thicknessMax !== null &&
    !!p.wireValue &&
    p.fluxValue !== null &&
    !!p.gasValue &&
    !!p.position &&
    !!p.preheat &&
    !!p.heatTreatment
  );
}

function materialLabel(id: number | null): string {
  if (id === null) return '—';
  return materialsStore.items.find((m) => m.id === id)?.marka ?? '—';
}

const selectedMethodName = computed(
  () => methods.value.find((m) => m.id === form.methodId)?.name ?? '',
);
const selectedGroupName = computed(
  () => groups.value.find((g) => g.id === form.groupId)?.code ?? '',
);

async function onSubmit() {
  showErrors.value = false;
  if (!selectedWelderId.value) {
    showErrors.value = true;
    $q.notify({ type: 'negative', message: 'Выберите сварщика' });
    return;
  }

  if (!form.methodId || !form.groupId) {
    $q.notify({ type: 'negative', message: 'Выберите способ и группу' });
    return;
  }

  if (pairs.some((p) => !isPairComplete(p))) {
    showErrors.value = true;
    $q.notify({ type: 'negative', message: 'Заполните все поля в образцах' });
    return;
  }

  const draft: AttestationDraft = {
    welderId: selectedWelderId.value,
    kind: kind.value,
    methodId: form.methodId,
    groupId: form.groupId,
    controls: controls.value,
    items: pairs.map((p) => ({
      sampleNo: p.sampleNo,
      material1: p.material1Id!,
      material2: p.uniform ? p.material1Id! : p.material2Id!,
      uniform: p.uniform,
      thicknessMin: p.thicknessMin,
      thicknessMax: p.thicknessMax,
      wire: p.wireValue ?? '',
      flux: p.fluxValue ?? '',
      gas: p.gasValue ?? '',
      position: p.position ?? '',
      preheat: p.preheat ?? '',
      heatTreatment: p.heatTreatment ?? '',
    })),
  };

  const ok = editId.value
    ? await attestationsStore.updateDraft(editId.value, draft)
    : await attestationsStore.createDraft(draft);

  if (ok) {
    $q.notify({
      type: 'positive',
      message: editId.value ? 'Изменения сохранены' : 'Черновик сохранён, заявки сформированы',
    });
    ordersOpen.value = true;
  }
}

const welderOptions = computed(() => welderStore.items.map((w) => ({ label: w.fio, value: w.id })));

watch(
  () => form.groupId,
  () => {
    if (loadingEdit.value) return;
    pairs.forEach((p) => {
      p.material1Id = null;
      p.material2Id = null;
    });
  },
);

watch(
  () => props.editItem,
  async (item) => {
    if (!item) {
      editId.value = null;
      showErrors.value = false;
      kind.value = 'первичная';
      return;
    }
    loadingEdit.value = true;
    editId.value = item.id;
    form.methodId = item.methodId;
    form.groupId = item.groupId;
    controls.value = [...item.controls];
    kind.value = item.kind;
    pairs.splice(
      0,
      pairs.length,
      ...item.items.map((it, i) => ({
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
      })),
    );
    await nextTick(() => {
      loadingEdit.value = false;
    });
  },
  { immediate: true },
);

watch(
  [() => props.welder, () => props.editItem],
  () => {
    if (props.editItem) selectedWelderId.value = props.editItem.welderId;
    else if (props.welder) selectedWelderId.value = props.welder.id;
  },
  { immediate: true },
);

onMounted(() => {
  void materialsStore.fetchAll();
  void welderStore.fetchAll();
  void referencesStore.fetchAll();
});
</script>

<style scoped lang="scss">
.af-outer {
  display: flex;
  justify-content: center;
}
.af-card {
  width: 100%;
  max-width: 720px;
  background: var(--app-surface);
  border-radius: 14px;
}
.af-grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.af-field {
  min-width: 0;
}

.af-welder-field {
  margin-bottom: 20px;
}

.af-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--app-ink-soft);
  margin-bottom: 6px;
}
.af-pairs {
  margin-top: 22px;
}
.af-pairs__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--app-ink-soft);
  margin-bottom: 12px;
}
.af-pairs__count {
  color: var(--app-accent);
}
.af-pairs__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.af-add {
  margin-top: 12px;
}
:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
}

.af-controls {
  margin-top: 22px;
}
.af-controls__head {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--app-ink-soft);
  margin-bottom: 10px;
}
.af-controls__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px 12px;
}
.af-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
.af-submit {
  border-radius: 10px;
  padding-inline: 20px;
}
</style>
