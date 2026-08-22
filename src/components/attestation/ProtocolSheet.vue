<template>
  <div class="ps-root">
    <!-- ШАПКА ДОКУМЕНТА -->
    <div class="ps-title">ПРОТОКОЛ № {{ protocolNo || '______' }}</div>
    <div class="ps-subtitle">заседания постоянно действующей комиссии при АО "{{ orgName }}"</div>
    <div class="ps-subtitle">
      по аттестации, произведённой в соответствии с Правилами аттестации сварщиков
    </div>
    <div class="ps-date">от "{{ signDay }}" {{ signMonth }} {{ signYear }} г.</div>

    <!-- ТАБЛИЦА 28 КОЛОНОК -->
    <table class="ps-table">
      <colgroup>
        <col v-for="(w, i) in COL_WIDTHS" :key="i" :style="{ width: w + '%' }" />
      </colgroup>

      <thead>
        <!-- полоса групповых заголовков -->
        <tr class="ps-group-row">
          <th :colspan="8" class="ps-nb"></th>
          <th :colspan="4">Материалы образцов</th>
          <th :colspan="3">Свар. материалы</th>
          <th :colspan="3" class="ps-nb"></th>
          <th :colspan="6">Результаты испытаний сварных образцов</th>
          <th :colspan="4" class="ps-nb"></th>
        </tr>

        <!-- полоса вертикальных подписей -->
        <tr class="ps-label-row">
          <th class="ps-h-horiz">№<br />№<br />п/п</th>
          <th class="ps-h-horiz">Фамилия, имя и отчество сварщика</th>
          <th><span class="ps-vert">№ подразделения</span></th>
          <th><span class="ps-vert">Год рождения</span></th>
          <th><span class="ps-vert">Образование</span></th>
          <th><span class="ps-vert">Стаж работы по сварке</span></th>
          <th><span class="ps-vert">Клеймо присвоенное сварщику (разряд)</span></th>
          <th><span class="ps-vert">Способ сварки</span></th>
          <th><span class="ps-vert">Деталь</span></th>
          <th><span class="ps-vert">Марка материала</span></th>
          <th><span class="ps-vert">Толщина, мм, Диаметр мм</span></th>
          <th><span class="ps-vert">Предел прочности по ТУ или стандарту, кгс/мм²</span></th>
          <th><span class="ps-vert">Электрод, присадочн. проволока марка и тип</span></th>
          <th><span class="ps-vert">Марка флюса</span></th>
          <th><span class="ps-vert">Защитный газ</span></th>
          <th><span class="ps-vert">Положение шва при сварке</span></th>
          <th><span class="ps-vert">Режим предварит. и сопутв. подогрева после сварки</span></th>
          <th><span class="ps-vert">Режим термообработки</span></th>
          <th><span class="ps-vert">Внешний осмотр и измерение</span></th>
          <th><span class="ps-vert">Физические методы контроля</span></th>
          <th><span class="ps-vert">Металлографические исследования</span></th>
          <th><span class="ps-vert">Предел прочности кгс/мм² (место разрыва)</span></th>
          <th><span class="ps-vert">Угол загиба, градусы</span></th>
          <th><span class="ps-vert">Ударная вязкость кгс·м/см²</span></th>
          <th><span class="ps-vert">Другие методы испытаний</span></th>
          <th><span class="ps-vert">Оценка практических навыков</span></th>
          <th><span class="ps-vert">№ удостоверения</span></th>
          <th>
            <span class="ps-vert">
              Заключение о допуске сварщика к сварочным работам по данной специализации на изделиях
            </span>
          </th>
        </tr>

        <!-- полоса номеров колонок -->
        <tr class="ps-num-row">
          <th v-for="n in 28" :key="n">{{ n }}</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(pair, i) in pairs" :key="pair.id">
          <!-- колонки 1–8: общие на всю аттестацию, объединены по строкам -->
          <template v-if="i === 0">
            <td :rowspan="pairs.length" class="ps-c">{{ rowNo }}</td>
            <td :rowspan="pairs.length" class="ps-fio">{{ welder?.fio || '' }}</td>
            <td :rowspan="pairs.length" class="ps-c">{{ welder?.workshopName || '' }}</td>
            <td :rowspan="pairs.length" class="ps-c">{{ birthYear }}</td>
            <td :rowspan="pairs.length">
              <span class="ps-vert">{{ welder?.education || '' }}</span>
            </td>
            <td :rowspan="pairs.length" class="ps-c">{{ welder?.experienceYears ?? '' }}</td>
            <td :rowspan="pairs.length" class="ps-c">{{ welder?.rank || '' }}</td>
            <td :rowspan="pairs.length">
              <span class="ps-vert">{{ methodName }}</span>
            </td>
          </template>

          <!-- колонки 9–18: по каждому образцу -->
          <td>
            <span class="ps-vert">{{ pair.sampleNo || '' }}</span>
          </td>
          <td>
            <span class="ps-vert">{{ markaLabel(pair) }}</span>
          </td>
          <td>
            <span class="ps-vert">{{ thicknessLabel(pair) }}</span>
          </td>
          <td>
            <span class="ps-vert">{{ tensileLabel(pair) }}</span>
          </td>
          <td>
            <span class="ps-vert">{{ pair.wireValue || '' }}</span>
          </td>
          <td>
            <span class="ps-vert">{{ pair.fluxValue || 'Без флюса' }}</span>
          </td>
          <td>
            <span class="ps-vert">{{ pair.gasValue || '' }}</span>
          </td>
          <td>
            <span class="ps-vert">{{ pair.position || '' }}</span>
          </td>
          <td>
            <span class="ps-vert">{{ pair.preheat || '' }}</span>
          </td>
          <td>
            <span class="ps-vert">{{ pair.heatTreatment || '' }}</span>
          </td>

          <!-- колонки 19–25: результаты испытаний, ФАЗА 2 — пусто -->
          <td v-for="k in 7" :key="'r' + k"></td>

          <!-- колонки 26–28: итог по аттестации, ФАЗА 2 — пусто -->
          <template v-if="i === 0">
            <td :rowspan="pairs.length"></td>
            <td :rowspan="pairs.length"></td>
            <td :rowspan="pairs.length"></td>
          </template>
        </tr>
      </tbody>
    </table>

    <!-- ПОДПИСИ КОМИССИИ -->
    <div class="ps-signs">
      <div class="ps-sign-row">
        <div class="ps-sign-role">Председатель комиссии</div>
        <div class="ps-sign-cell">
          <span class="ps-sign-line"></span><span class="ps-sign-cap">Ф.И.О</span>
        </div>
        <div class="ps-sign-cell">
          <span class="ps-sign-line"></span><span class="ps-sign-cap">Подпись</span>
        </div>
      </div>
      <div v-for="(m, i) in memberSlots" :key="i" class="ps-sign-row">
        <div class="ps-sign-role">{{ i === 0 ? 'Члены комиссии' : '' }}</div>
        <div class="ps-sign-cell">
          <span class="ps-sign-line"></span><span class="ps-sign-cap">Ф.И.О</span>
        </div>
        <div class="ps-sign-cell">
          <span class="ps-sign-line"></span><span class="ps-sign-cap">Подпись</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MaterialPair } from '@/shared/types/attestation';
import type { Welder } from '@/shared/types/welders';

const props = withDefaults(
  defineProps<{
    welder: Welder | null;
    methodName: string;
    pairs: MaterialPair[];
    protocolNo?: string;
    signDate?: string | null;
    rowNo?: number;
    orgName?: string;
    membersCount?: number;
    /** марка по id — та же функция, что уже ходит в OrdersDialog */
    materialLabel: (id: number | null) => string;
    /** предел прочности по id марки; вернуть null, если неизвестен */
    tensileByMaterial?: (id: number | null) => string | number | null;
  }>(),
  {
    protocolNo: '',
    signDate: null,
    rowNo: 1,
    orgName: '',
    membersCount: 3,
    tensileByMaterial: () => null,
  },
);

/**
 * Ширины 28 колонок в процентах — сняты пиксельно с эталонного бланка
 * (Сварка_Попков_СВ_2026). Сумма = 100. НЕ править на глаз.
 */
const COL_WIDTHS = [
  1.89, 15.32, 2.49, 3.06, 2.66, 3.5, 3.06, 3.5, 4.97, 3.69, 3.4, 3.0, 3.13, 3.27, 3.35, 3.28, 3.23,
  3.43, 2.86, 2.66, 2.73, 3.84, 2.73, 2.73, 2.73, 2.66, 2.32, 4.51,
];

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const memberSlots = computed(() => Array.from({ length: props.membersCount }));

const birthYear = computed(() =>
  props.welder?.birthDate ? new Date(props.welder.birthDate).getFullYear() : '',
);

const signed = computed(() => (props.signDate ? new Date(props.signDate) : null));
const signDay = computed(() => (signed.value ? String(signed.value.getDate()) : '____'));
const signMonth = computed(() =>
  signed.value ? (MONTHS[signed.value.getMonth()] ?? '') : '______________',
);
const signYear = computed(() =>
  signed.value ? signed.value.getFullYear() : new Date().getFullYear(),
);

function markaLabel(p: MaterialPair): string {
  const m1 = props.materialLabel(p.material1Id);
  if (p.uniform) return m1;
  const m2 = props.materialLabel(p.material2Id);
  return `${m1} + ${m2}`;
}

function thicknessLabel(p: MaterialPair): string {
  if (p.thicknessMin === null || p.thicknessMax === null) return '';
  return `S от ${p.thicknessMin} до ${p.thicknessMax} мм.`;
}

function tensileLabel(p: MaterialPair): string {
  const v = props.tensileByMaterial(p.material1Id);
  return v === null || v === undefined || v === '' ? '' : String(v);
}
</script>

<style scoped lang="scss">
/* Бланк рассчитан на альбомную ориентацию. Печать — window.print(). */
.ps-root {
  font-family: Arial, Helvetica, sans-serif;
  color: #000;
  background: #fff;
  padding: 8mm 6mm;
}

.ps-title {
  text-align: center;
  font-size: 13pt;
  font-weight: 700;
  margin-bottom: 4px;
}
.ps-subtitle {
  text-align: center;
  font-size: 10pt;
  font-weight: 600;
  line-height: 1.5;
}
.ps-date {
  text-align: center;
  font-size: 10pt;
  font-weight: 600;
  margin: 6px 0 10px;
}

.ps-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 7pt;
}
.ps-table th,
.ps-table td {
  border: 0.6pt solid #000;
  padding: 1px;
  vertical-align: middle;
  text-align: center;
  overflow: hidden;
}

/* групповая полоса: ячейки без рамки там, где в эталоне пусто */
.ps-group-row th {
  height: 22px;
  font-size: 7.5pt;
  font-weight: 400;
}
.ps-group-row .ps-nb {
  border-left: none;
  border-right: none;
  border-top: none;
}

/* полоса вертикальных подписей */
.ps-label-row th {
  height: 200px;
  font-weight: 400;
}
.ps-h-horiz {
  writing-mode: horizontal-tb;
  font-weight: 600;
}

/* полоса номеров колонок */
.ps-num-row th {
  height: 16px;
  font-weight: 400;
  background: #d9d9d9;
}

/* вертикальный текст — снизу вверх, как в эталоне */
.ps-vert {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  display: inline-block;
  white-space: normal;
  max-height: 190px;
  line-height: 1.15;
}

tbody td {
  height: 420px;
  vertical-align: bottom;
  padding-bottom: 4px;
}
tbody td .ps-vert {
  max-height: 410px;
}
.ps-c {
  vertical-align: middle;
}
.ps-fio {
  vertical-align: middle;
  text-align: center;
}

/* подписи комиссии */
.ps-signs {
  margin-top: 18px;
  font-size: 9pt;
}
.ps-sign-row {
  display: grid;
  grid-template-columns: 1fr 220px 160px;
  gap: 24px;
  align-items: end;
  margin-bottom: 14px;
}
.ps-sign-role {
  text-align: right;
  padding-right: 8px;
}
.ps-sign-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ps-sign-line {
  display: block;
  width: 100%;
  border-bottom: 0.8pt solid #000;
}
.ps-sign-cap {
  font-size: 7pt;
  margin-top: 2px;
}

@media print {
  .ps-root {
    padding: 0;
  }
  @page {
    size: A4 landscape;
    margin: 8mm;
  }
}

tbody td {
  height: 250px;
  vertical-align: middle;
  padding-bottom: 2px;
}
tbody td .ps-vert {
  max-height: 240px;
}
</style>
