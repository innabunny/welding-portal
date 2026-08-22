<template>
  <div class="os-root">
    <!-- ШАПКА: адресат слева, реквизиты справа -->
    <div class="os-head">
      <div class="os-head__to">
        <div class="os-cap">Кому</div>
        <div class="os-to">{{ addressee }}</div>
      </div>
      <div class="os-head__meta">
        <div class="os-meta-row">
          <span class="os-cap">Заявка №</span>
          <span class="os-meta-val">{{ orderNo }}</span>
        </div>
        <div class="os-meta-row">
          <span class="os-cap">Дата</span>
          <span class="os-meta-val">{{ dateLabel }}</span>
        </div>
      </div>
    </div>

    <div class="os-rule"></div>

    <!-- ЗАГОЛОВОК -->
    <h1 class="os-title">{{ title }}</h1>
    <p class="os-basis">{{ basis }}</p>

    <!-- ДАННЫЕ АТТЕСТАЦИИ -->
    <dl class="os-facts">
      <div class="os-fact">
        <dt>Сварщик</dt>
        <dd>{{ welderName }}</dd>
      </div>
      <div class="os-fact">
        <dt>Подразделение</dt>
        <dd>{{ welderWorkshop || '—' }}</dd>
      </div>
      <div class="os-fact">
        <dt>Вид аттестации</dt>
        <dd>{{ kind }}</dd>
      </div>
      <div class="os-fact">
        <dt>Способ сварки</dt>
        <dd>{{ methodName }}</dd>
      </div>
      <div class="os-fact">
        <dt>Группа материала</dt>
        <dd>{{ groupName }}</dd>
      </div>
      <div class="os-fact">
        <dt>Количество образцов</dt>
        <dd>{{ pairs.length }}</dd>
      </div>
    </dl>

    <!-- ТАБЛИЦА ОБРАЗЦОВ -->
    <div class="os-section-cap">{{ tableCaption }}</div>
    <table class="os-table">
      <thead>
        <tr>
          <th class="os-col-n">№</th>
          <th>№ образца</th>
          <th>Марка материала</th>
          <th>Толщина</th>
          <template v-if="type === 'welder'">
            <th>Проволока / электрод</th>
            <th>Флюс</th>
            <th>Защитный газ</th>
            <th>Положение</th>
            <th>Подогрев</th>
            <th>Термообработка</th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(p, i) in pairs" :key="p.id">
          <td class="os-col-n">{{ i + 1 }}</td>
          <td>{{ p.sampleNo || '—' }}</td>
          <td>{{ markaLabel(p) }}</td>
          <td>{{ thicknessLabel(p) }}</td>
          <template v-if="type === 'welder'">
            <td>{{ p.wireValue || '—' }}</td>
            <td>{{ p.fluxValue || 'Без флюса' }}</td>
            <td>{{ p.gasValue || '—' }}</td>
            <td>{{ p.position || '—' }}</td>
            <td>{{ p.preheat || '—' }}</td>
            <td>{{ p.heatTreatment || '—' }}</td>
          </template>
        </tr>
      </tbody>
    </table>

    <!-- ВИДЫ КОНТРОЛЯ — только в заявке на испытания -->
    <template v-if="type === 'tests'">
      <div class="os-section-cap">Провести контроль</div>
      <ul class="os-controls">
        <li v-for="c in controls" :key="c">{{ c }}</li>
        <li v-if="!controls.length" class="os-empty">виды контроля не указаны</li>
      </ul>
    </template>

    <!-- ПОДПИСЬ -->
    <div class="os-sign">
      <div class="os-sign__role">Мастер</div>
      <div class="os-sign__cell">
        <span class="os-sign__line"></span>
        <span class="os-cap">Подпись</span>
      </div>
      <div class="os-sign__cell">
        <span class="os-sign__line">{{ masterName }}</span>
        <span class="os-cap">Ф.И.О.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MaterialPair, AttestationKind } from '@/shared/types/attestation';

export type OrderType = 'samples' | 'tests' | 'welder';

const props = withDefaults(
  defineProps<{
    type: OrderType;
    welderName: string;
    welderWorkshop: string;
    methodName: string;
    groupName: string;
    kind: AttestationKind;
    pairs: MaterialPair[];
    controls: string[];
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

const TITLES: Record<OrderType, string> = {
  samples: 'Заявка на изготовление контрольных образцов',
  tests: 'Заявка на проведение испытаний',
  welder: 'Задание на выполнение сварочных работ',
};

const CAPTIONS: Record<OrderType, string> = {
  samples: 'Изготовить образцы',
  tests: 'Образцы, поступающие на испытания',
  welder: 'Выполнить сварку контрольных соединений',
};

const SUFFIX: Record<OrderType, string> = { samples: 'О', tests: 'И', welder: 'С' };

const title = computed(() => TITLES[props.type]);
const tableCaption = computed(() => CAPTIONS[props.type]);

const addressee = computed(() => {
  if (props.type === 'samples') return 'Цех-изготовитель образцов';
  if (props.type === 'tests') return 'Лаборатория контроля';
  return props.welderWorkshop || 'Цех сварщика';
});

const orderNo = computed(() =>
  props.attestationId ? `АТ-${props.attestationId}/${SUFFIX[props.type]}` : '______',
);

const dateLabel = computed(() =>
  new Date(props.createdAt ?? Date.now()).toLocaleDateString('ru-RU'),
);

const basis = computed(
  () =>
    `Основание: аттестация сварщика (${props.kind}) на способ «${props.methodName}».` +
    ' Образцы и параметры сварки приведены ниже.',
);

function markaLabel(p: MaterialPair): string {
  const m1 = props.materialLabel(p.material1Id);
  if (p.uniform) return m1;
  return `${m1} + ${props.materialLabel(p.material2Id)}`;
}

function thicknessLabel(p: MaterialPair): string {
  if (p.thicknessMin === null || p.thicknessMax === null) return '—';
  if (p.thicknessMin === p.thicknessMax) return `${p.thicknessMin} мм`;
  return `${p.thicknessMin}–${p.thicknessMax} мм`;
}
</script>

<style scoped lang="scss">
.os-root {
  font-family: 'Times New Roman', Georgia, serif;
  color: #000;
  background: #fff;
  padding: 14mm 16mm;
  font-size: 11.5pt;
  line-height: 1.45;
}

/* --- шапка --- */
.os-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}
.os-cap {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 7.5pt;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #444;
}
.os-to {
  font-size: 13pt;
  font-weight: 700;
  margin-top: 2px;
}
.os-head__meta {
  text-align: right;
  min-width: 150px;
}
.os-meta-row {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 8px;
}
.os-meta-val {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  font-weight: 700;
  min-width: 72px;
  text-align: left;
}
.os-rule {
  border-bottom: 1.5pt solid #000;
  margin: 8px 0 18px;
}

/* --- заголовок --- */
.os-title {
  font-size: 15pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  text-align: center;
  margin: 0 0 6px;
}
.os-basis {
  text-align: center;
  font-size: 10.5pt;
  font-style: italic;
  color: #333;
  margin: 0 0 20px;
}

/* --- блок данных: две колонки, подписи мелким --- */
.os-facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 32px;
  margin: 0 0 22px;
}
.os-fact {
  display: flex;
  align-items: baseline;
  gap: 8px;
  border-bottom: 0.4pt dotted #999;
  padding-bottom: 3px;
}
.os-fact dt {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 8pt;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #444;
  white-space: nowrap;
}
.os-fact dd {
  margin: 0;
  font-weight: 600;
  flex: 1;
  text-align: right;
}

/* --- таблица --- */
.os-section-cap {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 8pt;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #444;
  margin-bottom: 6px;
}
.os-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10pt;
  margin-bottom: 20px;
}
.os-table th,
.os-table td {
  border: 0.6pt solid #000;
  padding: 5px 7px;
  text-align: left;
  vertical-align: top;
}
.os-table th {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 8pt;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: #eee;
}
.os-col-n {
  width: 28px;
  text-align: center;
}

/* --- виды контроля --- */
.os-controls {
  margin: 0 0 20px;
  padding-left: 20px;
}
.os-controls li {
  margin-bottom: 2px;
}
.os-empty {
  font-style: italic;
  color: #666;
  list-style: none;
  margin-left: -20px;
}

/* --- подпись --- */
.os-sign {
  display: grid;
  grid-template-columns: auto 180px 220px;
  gap: 20px;
  align-items: end;
  margin-top: 32px;
}
.os-sign__role {
  font-weight: 600;
  padding-bottom: 2px;
}
.os-sign__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.os-sign__line {
  display: block;
  width: 100%;
  border-bottom: 0.8pt solid #000;
  text-align: center;
  padding-bottom: 2px;
  min-height: 18px;
}
</style>
