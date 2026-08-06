<template>
  <div v-if="draft && tpl" class="card-sheet">
    <!-- шапка -->
    <div class="sheet-head">
      <div class="head-cell">
        <div class="lab">Оборудование</div>
        <div class="val-static">{{ draft.equipment }}</div>
      </div>
      <div class="head-cell head-title">
        Карта технологического процесса сварки №
        <input v-model="draft.cardNo" class="val val-inline" placeholder="-" />
      </div>
      <div class="head-job">
        <div class="job-row">
          <span class="lab">Операция</span><input v-model="draft.oper" class="val" placeholder="-" />
        </div>
        <div class="job-row">
          <span class="lab">Шов №</span><input v-model="draft.seam" class="val" placeholder="-"/>
        </div>
        <div class="job-row">
          <span class="lab">Job</span><input v-model="draft.job" class="val" placeholder="-"/>
        </div>
      </div>
    </div>

    <!-- середина: левый столбец / эскиз / правый столбец -->
    <div class="sheet-mid">
      <!-- ЛЕВЫЙ: поля из tpl.left -->
      <div class="col-left">
        <template v-for="f in tpl.left" :key="f.k">
          <!-- особое поле: сочетание материалов -->
          <div v-if="f.t === 'mat'" class="fld-mat">
            <div class="lab">Сочетание материалов</div>
            <div class="mat-row">
              <input v-model="draft.values['mat_p1']" class="val" placeholder="поз." />
              <input
                v-model="draft.values['mat_m1']"
                class="val"
                placeholder="марка"
                list="dl-materials"
              />
            </div>
            <div class="mat-row">
              <input v-model="draft.values['mat_p2']" class="val" placeholder="поз." />
              <input
                v-model="draft.values['mat_m2']"
                class="val"
                placeholder="марка"
                list="dl-materials"
              />
            </div>
          </div>
          <!-- парное поле: подпись слева, значение справа -->
          <div v-else-if="f.pair" class="fld-pair">
            <div class="lab">{{ f.l }}</div>
            <input v-model="draft.values[f.k]" class="val" :list="dlFor(f.k)" placeholder="-" />
          </div>
          <!-- обычное поле: подпись сверху -->
          <div v-else class="fld">
            <div v-if="f.l" class="lab">{{ f.l }}</div>
            <input v-model="draft.values[f.k]" class="val" :list="dlFor(f.k)" placeholder="-" />
          </div>
        </template>
      </div>

      <!-- ЭСКИЗ: заглушка (этап F) -->
      <div class="col-eskiz">
        <div class="text-grey-6 text-caption">Эскиз не добавлен</div>
        <q-btn flat dense no-caps size="sm" color="primary" label="+ эскиз" disable />
      </div>

      <!-- ПРАВЫЙ: блоки из tpl.right -->
      <div class="col-right">
        <template v-for="(blk, bi) in tpl.right" :key="bi">
          <div class="blk-head">{{ blk.t }}</div>
          <div class="blk-grid">
            <div v-for="(pair, pi) in blk.f" :key="pi" class="blk-cell">
              <div class="lab">{{ pair[0] }}</div>
              <input v-model="draft.values[`r_${bi}_${pi}`]" class="val"  placeholder="-"/>
            </div>
          </div>
        </template>
      </div>
    </div>

    <PassTable />

    <!-- datalist подсказок из справочников (этап: подключим реальные) -->
    <datalist id="dl-materials"></datalist>
    <datalist id="dl-wires"></datalist>
    <datalist id="dl-gases"></datalist>
    <datalist id="dl-electrodes"></datalist>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWeldingCardStore } from '@/stores/weldingCard';
import PassTable from './PassTable.vue';

const store = useWeldingCardStore();
const draft = computed(() => store.draft);
const tpl = computed(() => store.template);

// связь поля со справочником-подсказкой (как DICT_MAP в прототипе)
const DICT_MAP: Record<string, string> = {
  wire: 'wires',
  filler: 'wires',
  gas: 'gases',
  pgas: 'gases',
  sgas: 'gases',
  wolfram: 'electrodes',
};
const dlFor = (k: string) => (DICT_MAP[k] ? `dl-${DICT_MAP[k]}` : undefined);
</script>
<style scoped>
.card-sheet {
  border: 1px solid var(--app-border);
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
  font-size: 13px;
  box-shadow: 0 2px 12px rgba(15, 122, 99, 0.06);
}

/* ШАПКА */
.sheet-head {
  display: grid;
  grid-template-columns: 1fr 1.6fr 1fr;
  border-bottom: 2px solid var(--q-primary);
  background: var(--app-bg);
  margin-bottom: 10px;
}
.head-cell,
.head-job {
  padding: 8px 12px;
  border-right: 1px solid var(--app-border);
}
.head-title {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 600;
  gap: 4px;
  color: var(--app-ink);
}
.job-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
}

.sheet-mid {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr 1.1fr;
}
.col-left,
.col-right {
  border-right: 1px solid var(--app-border);
}

.col-right {
  border-right: 1px solid var(--app-border);
  align-self: start;
}
.col-eskiz {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-right: 1px solid var(--app-border);
  padding: 12px;
  text-align: center;
  background: var(--app-bg);
}

.fld,
.fld-pair,
.fld-mat {
  border-bottom: 1px solid var(--app-border);
  padding: 8px 12px;
}
.fld-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 8px;
}
.mat-row {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 6px;
  margin-top: 4px;
}

/* ПОДПИСЬ поля */
.lab {
  font-size: 11px;
  color: #5a6b64;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 3px;
  font-weight: 500;
}

/* ПОЛЕ ВВОДА — теперь явно видно, что сюда пишут */
.val {
  width: 100%;
  border: 1px solid #a1beb1;
  border-radius: 6px;
  padding: 5px 8px;
  font: inherit;
  color: var(--app-ink);
  background: #fbfdfc;
  outline: none;
  transition:
    border-color 0.15s,
    background 0.15s,
    box-shadow 0.15s;
}
.val:hover {
}
.val:focus {
  background: #fff;
  box-shadow: 0 0 0 2px var(--status-valid-bg);
}
/* пустое поле — мягко подсвечиваем, что требует заполнения */
.val:placeholder-shown {
  background: #fff8ee;
  border-color: #e8c58a;
}

.val-static {
  padding: 5px 2px;
  font-weight: 600;
  color: var(--app-ink);
}
.val-inline {
  width: 56px;
  display: inline-block;
  text-align: center;
  border-radius: 6px;
  padding: 3px 4px;
}

/* БЛОКИ правого столбца */
.blk-head {
  font-weight: 600;
  font-size: 11px;
  padding: 6px 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: #fff;
  background: var(--q-primary);
  border-bottom: 1px solid var(--app-border);
  border-top: 1px solid var(--app-border);
}
.blk-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
.blk-cell {
  padding: 6px 8px;
  border-right: 1px solid var(--app-border);
  border-bottom: 1px solid var(--app-border);
}

.sheet-pass-stub {
  padding: 14px;
  border-top: 1px solid var(--app-border);
  text-align: center;
  background: var(--app-bg);
}
</style>
