<template>
  <q-dialog v-model="open" class="orders-print-root">
    <q-card class="od-card">
      <div class="od-head no-print">
        <q-icon name="description" size="24px" />
        <div class="od-head__text">
          <div class="od-head__title">Заявки сформированы</div>
          <div class="od-head__sub">{{ welderName }} · {{ methodName }}</div>
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
        class="od-tabs no-print"
      >
        <q-tab name="samples" label="На образцы" />
        <q-tab name="tests" label="На испытания" />
        <q-tab name="welder" label="Сварщику" />
      </q-tabs>
      <q-separator class="no-print" />

      <div class="od-body" id="od-print-area">
        <q-tab-panels v-model="tab" animated class="print-all">
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

      <q-separator class="no-print" />
      <q-card-actions align="right" class="od-actions no-print">
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
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { MaterialPair } from '@/shared/types/attestation';

const props = defineProps<{
  modelValue: boolean;
  welderName: string;
  welderWorkshop: string; // цех сварщика (welder.workshopName)
  methodName: string;
  groupName: string;
  pairs: MaterialPair[];
  controls: string[];
  materialLabel: (id: number | null) => string;
}>();
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>();
const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) });

const tab = ref('samples');

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
    `Способ сварки: ${props.methodName}`,
    `Группа материала: ${props.groupName}`,
    '',
    'Выполнить сварку контрольных соединений:',
    ...props.pairs.map(welderPairLine),
  ].join('\n'),
);

function printOrders() {
  window.print();
}
</script>

<style scoped lang="scss">
.od-card {
  width: 640px;
  max-width: 92vw;
  border-radius: 16px;
  overflow: hidden;
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
  min-height: 200px;
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
</style>
