<template>
  <div v-if="draft" class="card-sheet">
    <!-- ТОНКАЯ ВЕРХНЯЯ СТРОКА: 4 ячейки -->
    <div class="toprow">
      <div class="tc">Оборудование</div>
      <div class="tc tc-title">
        Карта технологического процесса сварки №<input
          v-model="draft.cardNo"
          class="inp inp-inline"
        />
      </div>
      <div class="tc tc-num">
        <input v-model="draft.detailNo" class="inp inp-c" placeholder="№ детали" />
      </div>
      <div class="tc tc-op">Операция<input v-model="draft.oper" class="inp inp-c" /></div>
    </div>

    <!-- ТЕЛО: левый 18% | эскиз 69% | правый блок 13% (под Операцией) -->
    <div class="body">
      <!-- ЛЕВЫЙ СТОЛБЕЦ из tpl.left -->
      <div class="col col-left">
        <div class="row equip">{{ draft.equipment }}</div>
        <template v-for="f in tpl.left" :key="f.k">
          <div v-if="f.t === 'mat'" class="row mat">
            <div class="lab">Сочетание материалов</div>
            <div class="row2">
              <div class="pz">
                <input v-model="draft.values['mat_p1']" class="inp" placeholder="поз." />
              </div>
              <input
                v-model="draft.values['mat_m1']"
                class="inp"
                list="dl_materials"
                placeholder="марка"
              />
            </div>
            <div class="row2">
              <div class="pz">
                <input v-model="draft.values['mat_p2']" class="inp" placeholder="поз." />
              </div>
              <input
                v-model="draft.values['mat_m2']"
                class="inp"
                list="dl_materials"
                placeholder="марка"
              />
            </div>
          </div>
          <div v-else-if="f.pair" class="row fld2">
            <div class="lab">{{ f.l }}</div>
            <input v-model="draft.values[f.k]" class="inp" :list="dl(f.k)" />
          </div>
          <div v-else class="row">
            <div v-if="f.l" class="lab">{{ f.l }}</div>
            <input v-model="draft.values[f.k]" class="inp" :list="dl(f.k)" />
          </div>
        </template>
      </div>

      <!-- ЭСКИЗ -->
      <div class="col col-esk">
        <div v-if="draft.eskiz" class="esk-svg" v-html="draft.eskiz.svg"></div>
        <div v-else class="esk-empty lab">Эскиз не добавлен</div>
      </div>

      <!-- ПРАВЫЙ БЛОК под Операцией: Шов/Job + режимы из tpl.right -->
      <div class="col col-right">
        <div class="rj">
          <div class="lab">Шов №</div>
          <input v-model="draft.seam" class="inp inp-c" />
        </div>
        <div class="rj">
          <div class="lab">Job</div>
          <input v-model="draft.job" class="inp inp-c" />
        </div>
        <template v-for="(blk, bi) in tpl.right" :key="bi">
          <div class="blk-h">{{ blk.t }}</div>
          <div class="blk-row" :style="{ gridTemplateColumns: `repeat(${blk.f.length},1fr)` }">
            <div v-for="(pair, pi) in blk.f" :key="pi" class="bc">
              <div class="lab">{{ pair[0] }}</div>
              <input v-model="draft.values[`r_${bi}_${pi}`]" class="inp inp-c" />
            </div>
          </div>
        </template>
        <div class="tail"></div>
      </div>
    </div>

    <!-- ПРОХОДЫ из tpl.pass -->
    <table class="passes">
      <thead>
        <tr>
          <th class="cn" :rowspan="headerRows">№<br />прохода</th>
          <th v-for="(gr, gi) in tpl.pass" :key="gi" :colspan="leafCount(gr)">{{ gr.g }}</th>
          <th class="cd no-print" :rowspan="headerRows"></th>
        </tr>
        <tr>
          <template v-for="(gr, gi) in tpl.pass" :key="gi">
            <template v-for="(c, ci) in gr.c" :key="ci">
              <th v-if="typeof c === 'object'" :colspan="c.c.length">{{ c.g }}</th>
              <th v-else :rowspan="hasSub ? 2 : 1">{{ c }}</th>
            </template>
          </template>
        </tr>
        <tr v-if="hasSub">
          <template v-for="(gr, gi) in tpl.pass" :key="gi">
            <template v-for="(c, ci) in gr.c" :key="ci">
              <th v-for="(leaf, li) in typeof c === 'object' ? c.c : []" :key="li">{{ leaf }}</th>
            </template>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(p, i) in draft.passes" :key="i">
          <td class="cn">
            <input
              class="inp inp-c"
              :value="p.no ?? i + 1"
              @input="p.no = ($event.target as HTMLInputElement).value"
            />
          </td>
          <td v-for="n in leafTotal" :key="n">
            <input v-model="p[`c${n - 1}`]" class="inp inp-c" />
          </td>
          <td class="cd del no-print" @click="store.removePass(i)">×</td>
        </tr>
      </tbody>
    </table>

    <div class="passes-ctl no-print">
      <button class="add-pass" @click="store.addPass()">+ Проход</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWeldingCardStore } from '@/stores/weldingCard';
import { TPL, DICT_MAP } from '@/shared/services/weldingTemplates';

const store = useWeldingCardStore();
const draft = computed(() => store.draft);
const tpl = computed(() => {
  const key = store.draft?.tplKey;
  const t = key ? TPL[key] : undefined;
  if (!t) throw new Error('CardSheet: нет шаблона для ' + key);
  return t;
});

const dl = (k: string) => (DICT_MAP[k] ? `dl_${DICT_MAP[k]}` : undefined);
const hasSub = computed(() => tpl.value.pass.some((gr) => gr.c.some((c) => typeof c === 'object')));
const headerRows = computed(() => (hasSub.value ? 3 : 2));
const leafCount = (gr: { c: (string | { c: string[] })[] }) =>
  gr.c.reduce((m, c) => m + (typeof c === 'object' ? c.c.length : 1), 0);
const leafTotal = computed(() => tpl.value.pass.reduce((n, gr) => n + leafCount(gr), 0));
</script>

<style scoped>
.card-sheet {
  background: #fff;
  color: #111;
  font-size: 12px;
  border: 1.6px solid #000;
}
.inp {
  width: 100%;
  border: none;
  background: transparent;
  font: inherit;
  color: #111;
  padding: 1px 3px;
  outline: none;
}
.inp:focus {
  background: var(--app-focus, #eefaf5);
}
.inp-c {
  text-align: center;
}
.inp-inline {
  width: 40px;
  display: inline-block;
  border-bottom: 1px solid #888;
}
.lab {
  color: #333;
  font-size: 10px;
}

/* тонкая верхняя строка: 18 | 51 | 18 | 13 */
.toprow {
  display: grid;
  grid-template-columns: 18% 51% 18% 13%;
  border-bottom: 1px solid #000;
}
.toprow > .tc {
  border-right: 1px solid #000;
  padding: 2px 6px;
  text-align: center;
  font-size: 11px;
}
.toprow > .tc:last-child {
  border-right: none;
}
.tc-title {
  font-weight: 700;
}
.tc-num,
.tc-op {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* тело: левый 18 | эскиз 69 | правый блок 13 (под Операцией) */
.body {
  display: grid;
  grid-template-columns: 18% 69% 13%;
}
.body > .col {
  border-right: 1px solid #000;
}
.body > .col:last-child {
  border-right: none;
}

.col-left .row {
  border-bottom: 1px solid #000;
  padding: 2px 4px;
}
.col-left .row:last-child {
  border-bottom: none;
}
.col-left .equip {
  font-weight: 700;
  text-align: center;
}
.fld2 {
  display: grid;
  grid-template-columns: 56% 44%;
  padding: 0;
}
.fld2 .lab {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #000;
  padding: 2px 4px;
  text-align: center;
}
.mat .row2 {
  display: grid;
  grid-template-columns: 34% 66%;
  border-top: 1px solid #000;
}
.mat .row2 .pz {
  border-right: 1px solid #000;
}

.col-esk {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  min-height: 250px;
}
.col-esk :deep(svg) {
  max-width: 100%;
  height: auto;
}

.col-right {
  display: flex;
  flex-direction: column;
}
.rj {
  display: grid;
  grid-template-columns: 40% 60%;
  border-bottom: 1px solid #000;
}
.rj .lab {
  border-right: 1px solid #000;
  padding: 2px 6px;
  display: flex;
  align-items: center;
}
.blk-h {
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  padding: 3px 4px;
  border-bottom: 1px solid #000;
}
.blk-row {
  display: grid;
  border-bottom: 1px solid #000;
}
.blk-row .bc {
  border-right: 1px solid #000;
  padding: 2px 3px;
  text-align: center;
}
.blk-row .bc:last-child {
  border-right: none;
}
.col-right .tail {
  flex: 1;
}

.passes {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  border-top: 1px solid #000;
  font-size: 11px;
}
.passes th,
.passes td {
  border: 1px solid #000;
  padding: 2px 3px;
}
.passes th {
  font-weight: 700;
  text-align: center;
  vertical-align: middle;
  line-height: 1.15;
}
.passes td {
  padding: 0;
}
.passes td .inp {
  padding: 3px 2px;
}
.passes .cn {
  width: 50px;
  border-left: none;
}
.passes .cd {
  width: 22px;
}
.del {
  color: #c33;
  text-align: center;
  cursor: pointer;
}
.passes-ctl {
  padding: 6px;
}
.add-pass {
  border: 1px solid var(--app-border, #ccc);
  background: var(--app-bg, #fff);
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
}
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
