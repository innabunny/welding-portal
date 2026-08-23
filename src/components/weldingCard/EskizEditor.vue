<template>
  <q-dialog v-model="open" persistent>
    <q-card class="eskiz-dialog">
      <q-card-section class="eskiz-head">
        <div class="text-h6">Эскиз разделки — {{ params.jt }}</div>
        <q-space />
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-card-section class="eskiz-body">
        <div class="eskiz-fields">
          <NumberField v-model="params.s" label="Толщина s, мм" :step="0.5" :min="0.5" />
          <NumberField
            v-model="params.alpha"
            label="Угол разделки α, °"
            :step="5"
            :min="0"
            :max="180"
          />
          <NumberField v-model="params.b" label="Зазор b, мм" :step="0.5" :min="0" />
          <NumberField v-model="params.c" label="Притупление c, мм" :step="0.5" :min="0" />
          <NumberField v-model="params.n" label="Число проходов" :step="1" :min="1" />
          <NumberField v-model="params.g" label="Усиление g, мм" :step="0.5" :min="0" />
          <NumberField v-model="params.g1" label="Корень g₁, мм" :step="0.5" :min="0" />
          <NumberField v-model="params.f" label="Ширина шва f, мм" :step="0.5" :min="0" />
        </div>

        <div class="eskiz-preview">
          <div class="eskiz-preview__svg" v-html="preview" />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Отмена" v-close-popup />
        <q-btn color="primary" label="Вставить в карту" @click="insert" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue';
import { eskizSVG, type GrooveParams } from '@/shared/services/eskizGen';
import { useWeldingCardStore } from '@/stores/weldingCard';
import NumberField from '../common/NumberField.vue';

const open = defineModel<boolean>({ default: false });

const store = useWeldingCardStore();

const DEFAULTS: GrooveParams = {
  jt: 'С17',
  s: 11.5,
  alpha: 60,
  b: 2,
  c: 1.5,
  n: 6,
  g: 1,
  g1: 1,
  f: 1.5,
};

const params = reactive<GrooveParams>({ ...DEFAULTS });

// при открытии — подхватить параметры уже вставленного эскиза
watch(open, (isOpen) => {
  if (!isOpen) return;
  const existing = store.draft?.eskiz?.params;
  Object.assign(params, existing ?? DEFAULTS);
});

// нормализованные параметры (проходов — целое ≥ 1)
const safeParams = computed<GrooveParams>(() => ({
  ...params,
  n: Math.max(1, Math.round(params.n)),
}));

const preview = computed(() => eskizSVG(safeParams.value));

function insert(): void {
  store.setEskiz(safeParams.value);
  open.value = false;
}
</script>

<style scoped>
.eskiz-dialog {
  min-width: 800px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--app-surface);
}

/* шапка: свой фон, чтобы контент не просвечивал */
.eskiz-head {
  display: flex;
  align-items: center;
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
  padding: 14px 20px;
  flex: 0 0 auto;
}

/* тело: две колонки, отступ между ними */
.eskiz-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 210px 1fr;
  gap: 20px;
  align-items: start; /* обе колонки от верхней линии */
  padding: 20px;
}

.eskiz-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eskiz-preview {
  background: #fff;
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  /* min-width: 500px; */
}
.eskiz-preview__svg {
  width: 100%;
}
.eskiz-preview__svg :deep(svg) {
  width: 100%;
  height: auto;
  min-height: 300px;
}

.q-card__actions {
  flex: 0 0 auto;
  border-top: 1px solid var(--app-border);
  padding: 12px 20px;
}
</style>
