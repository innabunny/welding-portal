<template>
  <div class="pair-card">
    <div class="pair-card__head">
      <div class="pair-card__title-wrap">
        <span class="pair-card__title">Образец {{ index + 1 }}</span>
        <q-input
          :model-value="modelValue.sampleNo"
          @update:model-value="(v) => patch({ sampleNo: String(v ?? '') })"
          outlined
          dense
          placeholder="№ образца"
          class="pair-card__no"
          :error="showErrors && !modelValue.sampleNo"
          hide-bottom-space
        />
      </div>
      <q-btn
        flat
        round
        dense
        size="sm"
        icon="close"
        color="grey-6"
        :disable="!removable"
        @click="$emit('remove')"
      />
    </div>

    <div class="pair-card__grid">
      <div class="pf">
        <div class="pf__label">Материал 1</div>
        <q-select
          :model-value="modelValue.material1Id"
          @update:model-value="
            (v) => patch({ material1Id: v, ...(modelValue.uniform ? { material2Id: v } : {}) })
          "
          :options="materialOptions"
          emit-value
          map-options
          outlined
          dense
          :error="showErrors && !modelValue.material1Id"
          error-message="Обязательно"
          hide-bottom-space
        />
      </div>

      <div class="pf">
        <div class="pf__label">Материал 2</div>
        <q-select
          :model-value="modelValue.material2Id"
          @update:model-value="(v) => patch({ material2Id: v })"
          :options="materialOptions"
          emit-value
          map-options
          outlined
          dense
          :disable="modelValue.uniform"
          :error="showErrors && !modelValue.uniform && !modelValue.material2Id"
          error-message="Обязательно"
          hide-bottom-space
        />
      </div>

      <div class="pf">
        <div class="pf__label">Толщина, мм</div>
        <div class="pf__range">
          <q-input
            :model-value="modelValue.thicknessMin"
            @update:model-value="(v) => patch({ thicknessMin: toNum(v) })"
            type="number"
            step="0.5"
            min="0"
            outlined
            dense
            placeholder="от"
            :error="showErrors && modelValue.thicknessMin === null"
            hide-bottom-space
          />
          <span class="pf__dash">–</span>
          <q-input
            :model-value="modelValue.thicknessMax"
            @update:model-value="(v) => patch({ thicknessMax: toNum(v) })"
            type="number"
            step="0.5"
            min="0"
            outlined
            dense
            placeholder="до"
            :error="showErrors && modelValue.thicknessMax === null"
            hide-bottom-space
          />
        </div>
      </div>

      <div class="pf">
        <div class="pf__label">Электрод / проволока</div>
        <q-select
          :model-value="modelValue.wireValue"
          @update:model-value="(v) => patch({ wireValue: v })"
          :options="wireOptions"
          emit-value
          map-options
          outlined
          dense
          :error="showErrors && !modelValue.wireValue"
          error-message="Обязательно"
          hide-bottom-space
        />
      </div>

      <div class="pf">
        <div class="pf__label">Флюс</div>
        <q-select
          :model-value="modelValue.fluxValue"
          @update:model-value="(v) => patch({ fluxValue: v })"
          :options="fluxOptions"
          emit-value
          map-options
          outlined
          dense
          :error="showErrors && modelValue.fluxValue === null"
          error-message="Обязательно"
          hide-bottom-space
        />
      </div>

      <div class="pf">
        <div class="pf__label">Защитный газ</div>
        <q-select
          :model-value="modelValue.gasValue"
          @update:model-value="(v) => patch({ gasValue: v })"
          :options="gasOptions"
          emit-value
          map-options
          outlined
          dense
          :error="showErrors && modelValue.gasValue === null"
          error-message="Обязательно"
          hide-bottom-space
        />
      </div>

      <div class="pf">
        <div class="pf__label">Положение шва</div>
        <q-select
          :model-value="modelValue.position"
          @update:model-value="(v) => patch({ position: v })"
          :options="POSITION_OPTIONS"
          emit-value
          map-options
          outlined
          dense
          :error="showErrors && !modelValue.position"
          error-message="Обязательно"
          hide-bottom-space
        />
      </div>

      <div class="pf">
        <div class="pf__label">Подогрев</div>
        <q-select
          :model-value="modelValue.preheat"
          @update:model-value="(v) => patch({ preheat: v })"
          :options="PREHEAT_OPTIONS"
          emit-value
          map-options
          outlined
          dense
          :error="showErrors && !modelValue.preheat"
          error-message="Обязательно"
          hide-bottom-space
        />
      </div>

      <div class="pf">
        <div class="pf__label">Термообработка</div>
        <q-select
          :model-value="modelValue.heatTreatment"
          @update:model-value="(v) => patch({ heatTreatment: v })"
          :options="HEAT_TREATMENT_OPTIONS"
          emit-value
          map-options
          outlined
          dense
          :error="showErrors && !modelValue.heatTreatment"
          error-message="Обязательно"
          hide-bottom-space
        />
      </div>
    </div>

    <q-checkbox
      :model-value="modelValue.uniform"
      @update:model-value="
        (v) => patch({ uniform: v, ...(v ? { material2Id: modelValue.material1Id } : {}) })
      "
      label="Однородное соединение"
      dense
      class="pair-card__uniform"
    />
  </div>
</template>

<script setup lang="ts">
import type { MaterialPair } from '@/shared/types/attestation';
import {
  POSITION_OPTIONS,
  PREHEAT_OPTIONS,
  HEAT_TREATMENT_OPTIONS,
} from '@/shared/constants/attestation';

const props = defineProps<{
  modelValue: MaterialPair;
  index: number;
  removable: boolean;
  showErrors: boolean;
  materialOptions: { label: string; value: number }[];
  wireOptions: { label: string; value: string }[];
  fluxOptions: { label: string; value: string }[];
  gasOptions: { label: string; value: string }[];
}>();
const emit = defineEmits<{
  'update:modelValue': [value: MaterialPair];
  remove: [];
}>();

function patch(part: Partial<MaterialPair>) {
  emit('update:modelValue', { ...props.modelValue, ...part });
}
function toNum(v: string | number | null): number | null {
  if (v === '' || v === null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
</script>

<style scoped lang="scss">
.pair-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 14px 16px;
}
.pair-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 12px;
}
.pair-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pair-card__title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--app-accent);
  white-space: nowrap;
}
.pair-card__no {
  width: 130px;
}
.pair-card__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 14px;
}
.pf__label {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--app-ink-soft);
  margin-bottom: 5px;
}
.pf__range {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pf__dash {
  color: var(--app-ink-soft);
}
.pair-card__uniform {
  margin-top: 14px;
}
:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
}
</style>
