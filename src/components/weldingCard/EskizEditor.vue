<template>
  <q-dialog v-model="open" persistent>
    <q-card class="eskiz-dialog">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Эскиз разделки — {{ params.jt }}</div>
        <q-space />
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-card-section class="row q-col-gutter-md">
        <!-- параметры слева -->
        <div class="col-12 col-sm-4 column q-gutter-sm">
          <q-input v-model.number="params.s" type="number" label="Толщина s, мм" dense filled />
          <q-input
            v-model.number="params.alpha"
            type="number"
            label="Угол разделки α, °"
            dense
            filled
          />
          <q-input v-model.number="params.b" type="number" label="Зазор b, мм" dense filled />
          <q-input v-model.number="params.c" type="number" label="Притупление c, мм" dense filled />
          <q-input
            v-model.number="params.n"
            type="number"
            label="Число проходов"
            dense
            filled
            min="1"
          />
          <q-input v-model.number="params.g" type="number" label="Усиление g, мм" dense filled />
          <q-input v-model.number="params.g1" type="number" label="Корень g₁, мм" dense filled />
          <q-input v-model.number="params.f" type="number" label="Ширина шва f, мм" dense filled />
        </div>

        <!-- живое превью справа -->
        <div class="col-12 col-sm-8 flex flex-center eskiz-preview">
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
  min-width: 720px;
  max-width: 95vw;
}
.eskiz-preview {
  background: #fff;
  border: 1px solid #dcdfe3;
  border-radius: 6px;
  min-height: 260px;
}
.eskiz-preview__svg {
  width: 100%;
}
.eskiz-preview__svg :deep(svg) {
  width: 100%;
  height: auto;
}
</style>
