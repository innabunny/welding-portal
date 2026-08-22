<template>
  <q-dialog v-model="open">
    <q-card class="od-card">
      <div class="od-head">
        <q-icon name="description" size="24px" />
        <div class="od-head__text">
          <div class="od-head__title">Заявки сформированы</div>
          <div class="od-head__sub">{{ welderName }} · {{ kind }} · {{ methodName }}</div>
        </div>
        <q-btn flat round dense icon="print" @click="printOrders" class="od-print-btn">
          <q-tooltip>Печать</q-tooltip>
        </q-btn>
        <q-btn flat round dense icon="close" v-close-popup />
      </div>

      <q-tabs
        v-model="tab"
        align="left"
        no-caps
        active-color="primary"
        indicator-color="primary"
        class="od-tabs"
      >
        <q-tab name="samples" label="На образцы" />
        <q-tab name="tests" label="На испытания" />
        <q-tab name="welder" label="Сварщику" />
      </q-tabs>
      <q-separator />

      <div class="od-body">
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="samples">
            <pre class="od-text">{{ samplesOrder }}</pre>
          </q-tab-panel>
          <q-tab-panel name="tests">
            <pre class="od-text">{{ testsOrder }}</pre>
          </q-tab-panel>
          <q-tab-panel name="welder">
            <pre class="od-text">{{ welderOrder }}</pre>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <q-separator />
      <q-card-actions align="right" class="od-actions">
        <q-btn flat no-caps label="Закрыть" color="grey-7" v-close-popup />
        <q-btn
          unelevated
          no-caps
          icon="print"
          label="Печать"
          color="primary"
          @click="printOrders"
        />
      </q-card-actions>
    </q-card>

    <!-- Источник для печати: на экране скрыт, в DOM есть.
         Печатается в отдельном окне — все три листа подряд. -->
    <div class="od-print-src" ref="printRef">
      <div v-for="(t, i) in ORDER_TYPES" :key="t" :class="{ 'od-page-break': i < 2 }">
        <OrderSheet :type="t" v-bind="sheetProps" />
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MaterialPair, AttestationKind } from '@/shared/types/attestation';
import OrderSheet, { type OrderType } from './OrderSheet.vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    welderName: string;
    welderWorkshop: string; // цех сварщика (welder.workshopName)
    methodName: string;
    groupName: string;
    pairs: MaterialPair[];
    controls: string[];
    kind: AttestationKind;
    materialLabel: (id: number | null) => string;
    attestationId?: number | null;
    createdAt?: string | null;
    masterName?: string;
  }>(),
  {
    attestationId: null,
    createdAt: null,
    masterName: '',
  },
);

const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>();
const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) });

const tab = ref('samples');
const printRef = ref<HTMLElement | null>(null);

const ORDER_TYPES: OrderType[] = ['samples', 'tests', 'welder'];

/* ---------- пропсы для печатных бланков ---------- */

const sheetProps = computed(() => ({
  welderName: props.welderName,
  welderWorkshop: props.welderWorkshop,
  methodName: props.methodName,
  groupName: props.groupName,
  kind: props.kind,
  pairs: props.pairs,
  controls: props.controls,
  materialLabel: props.materialLabel,
  attestationId: props.attestationId,
  createdAt: props.createdAt,
  masterName: props.masterName,
}));

/* ---------- текстовый вид для экрана ---------- */

function pairLine(p: MaterialPair, i: number): string {
  const m1 = props.materialLabel(p.material1Id);
  const m2 = p.uniform ? m1 : props.materialLabel(p.material2Id);
  const th = `${p.thicknessMin ?? '?'}–${p.thicknessMax ?? '?'} мм`;
  return `  ${i + 1}. Образец №${p.sampleNo || '—'}: ${m1} + ${m2}, толщина ${th}`;
}

function welderPairLine(p: MaterialPair, i: number): string {
  const m1 = props.materialLabel(p.material1Id);
  const m2 = p.uniform ? m1 : props.materialLabel(p.material2Id);
  return (
    `  ${i + 1}. Образец №${p.sampleNo || '—'}: ${m1} + ${m2}\n` +
    `     проволока: ${p.wireValue || '—'}, флюс: ${p.fluxValue || 'без флюса'}, газ: ${p.gasValue || '—'}\n` +
    `     положение: ${p.position || '—'}, подогрев: ${p.preheat || '—'}, ТО: ${p.heatTreatment || '—'}`
  );
}

const samplesOrder = computed(() =>
  [
    'ЗАКАЗ НА ИЗГОТОВЛЕНИЕ КОНТРОЛЬНЫХ ОБРАЗЦОВ',
    'Кому: Цех-изготовитель образцов',
    '',
    `Сварщик: ${props.welderName}`,
    `Способ сварки: ${props.methodName}`,
    `Группа материала: ${props.groupName}`,
    '',
    'Изготовить образцы:',
    ...props.pairs.map(pairLine),
  ].join('\n'),
);

const testsOrder = computed(() =>
  [
    'ЗАКАЗ НА ПРОВЕДЕНИЕ ИСПЫТАНИЙ',
    'Кому: Лаборатория контроля',
    '',
    `Сварщик: ${props.welderName}`,
    `Способ сварки: ${props.methodName}`,
    '',
    `Виды контроля: ${props.controls.join(', ') || '—'}`,
    '',
    'Образцы для испытаний:',
    ...props.pairs.map(pairLine),
  ].join('\n'),
);

const welderOrder = computed(() =>
  [
    'ЗАДАНИЕ НА ВЫПОЛНЕНИЕ СВАРОЧНЫХ РАБОТ',
    `Кому: ${props.welderWorkshop || 'Цех сварщика'}`,
    '',
    `Сварщик: ${props.welderName}`,
    `Вид аттестации: ${props.kind}`,
    `Способ сварки: ${props.methodName}`,
    `Группа материала: ${props.groupName}`,
    '',
    'Выполнить сварку контрольных соединений:',
    ...props.pairs.map(welderPairLine),
  ].join('\n'),
);

/* ---------- печать: отдельное окно, три листа ---------- */

function printOrders() {
  const node = printRef.value;
  if (!node) return;

  // стили приложения нужны (в них живут scoped-стили OrderSheet),
  // но их @media print — нет: они рассчитаны на пряталки внутри SPA
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n')
    .replace(/@media\s+print\s*\{(?:[^{}]|\{[^{}]*\})*\}/g, '');

  const w = window.open('', '_blank', 'width=1000,height=800');
  console.log('листов:', node.children.length, node.innerHTML.length);
  if (!w) return;

  w.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Заявки</title>
        ${styles}
        <style>
          /* поля задаёт сам бланк (padding в мм) — здесь нулевые, иначе сложатся */
          @page { size: A4 portrait; margin: 0; }
          body { margin: 0; background: #fff; }
          .od-print-src { display: block !important; }
          .od-print-src > div {
              page-break-after: always;
              break-after: page;
          }
          .od-print-src > div:last-child {
          page-break-after: auto;
          break-after: auto;
          }
          .od-print-src > div { min-height: 297mm; }
        </style>
      </head>
      <body><div class="od-print-src">${node.innerHTML}</div></body>
    </html>
  `);
  w.document.close();

  setTimeout(() => {
    w.focus();
    w.print();
    w.close();
  }, 300);
}
</script>

<style scoped lang="scss">
.od-card {
  width: 640px;
  max-width: 92vw;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.od-head,
.od-tabs,
.od-actions {
  flex: 0 0 auto;
}
.od-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  color: #fff;
  background: linear-gradient(135deg, var(--app-accent-dark), var(--app-accent));
}
.od-head__text {
  flex: 1;
}
.od-head__title {
  font-size: 17px;
  font-weight: 600;
}
.od-head__sub {
  font-size: 12.5px;
  opacity: 0.8;
}
.od-print-btn {
  color: rgba(255, 255, 255, 0.9);
}
.od-tabs {
  padding: 0 12px;
}
.od-body {
  flex: 1 1 auto;
  min-height: 0; /* ← иначе flex-элемент не даст себя сжать */
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
}
.od-text {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 13.5px;
  color: var(--app-ink);
  line-height: 1.6;
  margin: 0;
  padding: 6px 4px;
}
.od-actions {
  padding: 12px 20px;
}

/* источник печати — в DOM есть, на экране не виден */
.od-print-src {
  display: none;
}
</style>
