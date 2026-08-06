<template>
  <div v-if="tpl && draft" class="pass-wrap">
    <table class="pass-table">
      <thead>
        <!-- верхний ряд: № + группы -->
        <tr>
          <th rowspan="2" class="col-no">№</th>
          <th v-for="(grp, gi) in tpl.pass" :key="gi" :colspan="grp.c.length" class="grp-head">
            {{ grp.g }}
          </th>
          <th rowspan="2" class="col-del"></th>
        </tr>
        <!-- нижний ряд: колонки внутри групп -->
        <tr>
          <template v-for="(grp, gi) in tpl.pass" :key="gi">
            <th v-for="(col, ci) in grp.c" :key="`${gi}-${ci}`" class="col-head">{{ col }}</th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(pass, ri) in draft.passes" :key="ri">
          <td class="col-no">
            <input v-model="pass.no" class="pval" placeholder="-" />
          </td>
          <td v-for="ci in colCount" :key="ci - 1">
            <input v-model="pass[`c${ci - 1}`]" class="pval" placeholder="—" />
          </td>
          <td class="col-del">
            <q-btn
              flat
              dense
              round
              size="xs"
              icon="close"
              color="grey-6"
              @click="store.removePass(ri)"
            />
          </td>
        </tr>
        <tr v-if="draft.passes.length === 0">
          <td :colspan="colCount + 2" class="empty-row">Проходы не добавлены</td>
        </tr>
      </tbody>
    </table>

    <div class="pass-actions">
      <q-btn
        flat
        dense
        no-caps
        size="sm"
        icon="add"
        label="Проход"
        color="primary"
        @click="store.addPass()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWeldingCardStore } from '@/stores/weldingCard';

const store = useWeldingCardStore();
const tpl = computed(() => store.template);
const draft = computed(() => store.draft);
const colCount = computed(() => store.passColCount());
</script>

<style scoped>
.pass-wrap {
  border-top: 1px solid var(--app-border);
}
.pass-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.pass-table th,
.pass-table td {
  border: 1px solid var(--app-border);
  text-align: center;
  padding: 3px;
}
.grp-head {
  background: var(--q-primary);
  color: #fff;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 5px 8px;
}
.col-head {
  background: var(--status-valid-bg);
  color: var(--app-ink);
  font-weight: 500;
  padding: 4px 6px;
}
.col-no {
  width: 40px;
  background: var(--app-bg);
}
.col-del {
  width: 34px;
}
.pval {
  width: 100%;
  border: 1px solid #cdd8d3;
  padding: 5px 4px;
  font: inherit;
  text-align: center;
  background: #fff;
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.pval:hover {
  border-color: var(--q-primary);
}
.pval:focus {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 2px var(--status-valid-bg);
}
.empty-row {
  padding: 12px;
  color: var(--app-ink-soft);
}
.pass-actions {
  padding: 8px 12px;
}

.pval:placeholder-shown {
  background: #fff8ee;
  border-color: #e8c58a;
}
</style>
