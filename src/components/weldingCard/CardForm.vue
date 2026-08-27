<template>
  <div v-if="draft" class="cf-outer">
    <q-card flat bordered class="cf-card">
      <q-card-section>
        <!-- ШАПКА КАРТЫ -->
        <div class="cf-section">Реквизиты карты</div>
        <div class="cf-grid3">
          <div class="cf-field">
            <div class="cf-label">Номер карты</div>
            <q-input
              v-model="draft.cardNo"
              outlined
              dense
              hide-bottom-space
              placeholder="например, 1247"
              :error="showErrors && !draft.cardNo.trim()"
              error-message="Обязательно"
            />
          </div>
          <div class="cf-field">
            <div class="cf-label">№ детали</div>
            <q-input v-model="draft.detailNo" outlined dense hide-bottom-space />
          </div>
          <div class="cf-field">
            <div class="cf-label">Операция</div>
            <q-input v-model="draft.oper" outlined dense hide-bottom-space />
          </div>
          <div class="cf-field">
            <div class="cf-label">Шов №</div>
            <q-input v-model="draft.seam" outlined dense hide-bottom-space />
          </div>
          <div class="cf-field">
            <div class="cf-label">Job</div>
            <q-input v-model="draft.job" outlined dense hide-bottom-space />
          </div>
          <div class="cf-field">
            <div class="cf-label">Оборудование</div>
            <q-input :model-value="draft.equipment" outlined dense hide-bottom-space readonly />
          </div>
        </div>

        <!-- СОЧЕТАНИЕ МАТЕРИАЛОВ -->
        <div class="cf-section">Сочетание материалов</div>
        <div class="cf-mat">
          <div class="cf-mat__row">
            <q-input
              v-model="draft.values['mat_p1']"
              outlined
              dense
              hide-bottom-space
              placeholder="поз."
              class="cf-mat__pos"
            />
            <q-select
              v-model="draft.values['mat_m1']"
              :options="optionsFor('materials')"
              outlined
              dense
              hide-bottom-space
              use-input
              fill-input
              hide-selected
              new-value-mode="add-unique"
              placeholder="марка материала"
              @filter="filterFn"
            />
          </div>
          <div class="cf-mat__row">
            <q-input
              v-model="draft.values['mat_p2']"
              outlined
              dense
              hide-bottom-space
              placeholder="поз."
              class="cf-mat__pos"
            />
            <q-select
              v-model="draft.values['mat_m2']"
              :options="optionsFor('materials')"
              outlined
              dense
              hide-bottom-space
              use-input
              fill-input
              hide-selected
              new-value-mode="add-unique"
              placeholder="марка материала"
              @filter="filterFn"
            />
          </div>
        </div>

        <!-- ПОЛЯ ШАБЛОНА (левый столбец бланка) -->
        <div class="cf-section">Сварочные материалы и режим</div>
        <div class="cf-grid2">
          <div v-for="f in plainFields" :key="f.k" class="cf-field">
            <div class="cf-label">{{ f.l || '—' }}</div>
            <q-select
              v-if="DICT_MAP[f.k]"
              v-model="draft.values[f.k]"
              :options="optionsFor(DICT_MAP[f.k]!)"
              outlined
              dense
              hide-bottom-space
              use-input
              fill-input
              hide-selected
              new-value-mode="add-unique"
              @filter="filterFn"
            />
            <q-input v-else v-model="draft.values[f.k]" outlined dense hide-bottom-space />
          </div>
        </div>

        <!-- БЛОКИ ПРАВОГО СТОЛБЦА -->
        <template v-for="(blk, bi) in tpl.right" :key="bi">
          <div class="cf-section">{{ blk.t }}</div>
          <div class="cf-grid3">
            <div v-for="(pair, pi) in blk.f" :key="pi" class="cf-field">
              <div class="cf-label">{{ pair[0] }}</div>
              <q-input v-model="draft.values[`r_${bi}_${pi}`]" outlined dense hide-bottom-space />
            </div>
          </div>
        </template>

        <!-- ЭСКИЗ -->
        <div class="cf-section">Эскиз разделки</div>
        <div class="cf-eskiz">
          <div v-if="draft.eskiz" class="cf-eskiz__preview" v-html="draft.eskiz.svg" />
          <div v-else class="cf-eskiz__empty">Эскиз не добавлен</div>
          <q-btn
            flat
            no-caps
            dense
            :icon="draft.eskiz ? 'edit' : 'add'"
            :label="draft.eskiz ? 'Изменить эскиз' : 'Добавить эскиз'"
            color="primary"
            @click="eskizOpen = true"
          />
        </div>
        <EskizEditor v-model="eskizOpen" />

        <!-- ПРОХОДЫ -->
        <div class="cf-section cf-section--row">
          <span>Проходы</span>
          <span class="cf-count">{{ draft.passes.length }}</span>
        </div>
        <div class="cf-passes">
          <div v-for="(p, i) in draft.passes" :key="i" class="cf-pass">
            <div class="cf-pass__head">
              <span class="cf-pass__no">Проход {{ p.no ?? i + 1 }}</span>
              <q-btn
                v-if="draft.passes.length > 1"
                flat
                dense
                round
                size="sm"
                icon="close"
                color="grey-7"
                @click="store.removePass(i)"
              />
            </div>
            <div class="cf-grid4">
              <div v-for="(col, ci) in passColumns" :key="ci" class="cf-field">
                <div class="cf-label">{{ col.label }}</div>
                <q-input v-model="p[`c${ci}`]" outlined dense hide-bottom-space />
              </div>
            </div>
          </div>
        </div>
        <q-btn
          flat
          no-caps
          dense
          icon="add"
          label="Добавить проход"
          color="primary"
          class="cf-add"
          @click="store.addPass()"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useWeldingCardStore } from '@/stores/weldingCard';
import { useReferenceStore } from '@/stores/references';
import { TPL, DICT_MAP } from '@/shared/services/weldingTemplates';
import EskizEditor from './EskizEditor.vue';
import type { RefCategory } from '@/shared/types/references.js';

onMounted(() => {
  void referencesStore.fetchAll();
});

defineProps<{ showErrors?: boolean }>();

const store = useWeldingCardStore();
const referencesStore = useReferenceStore();
const draft = computed(() => store.draft);
const eskizOpen = ref(false);

const tpl = computed(() => {
  const key = store.draft?.tplKey;
  const t = key ? TPL[key] : undefined;
  if (!t) throw new Error('CardForm: нет шаблона для ' + key);
  return t;
});

/** поля левого столбца без «сочетания материалов» — оно вынесено в свой блок */
const plainFields = computed(() => tpl.value.left.filter((f) => f.t !== 'mat'));

/** плоский список колонок проходов с учётом вложенных групп */
const passColumns = computed(() => {
  const out: { label: string; group: string }[] = [];
  tpl.value.pass.forEach((gr) => {
    gr.c.forEach((c) => {
      if (typeof c === 'object') {
        c.c.forEach((leaf) => out.push({ label: `${c.g}: ${leaf}`, group: gr.g }));
      } else {
        out.push({ label: c, group: gr.g });
      }
    });
  });
  return out;
});

function optionsFor(category: RefCategory): string[] {
  return (referencesStore.byCategory[category] ?? []).map((r) => r.value);
}

// q-select с use-input требует обработчик filter, иначе список не открывается
function filterFn(_val: string, update: (fn: () => void) => void) {
  update(() => {
    /* фильтрацию делает сам q-select по подстроке */
  });
}
</script>

<style scoped lang="scss">
.cf-outer {
  display: flex;
  justify-content: center;
}
.cf-card {
  width: 100%;
  max-width: 900px;
  background: var(--app-surface);
  border-radius: 14px;
}

.cf-section {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--app-ink-soft);
  margin: 24px 0 12px;

  &:first-child {
    margin-top: 0;
  }
}
.cf-section--row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cf-count {
  color: var(--app-accent);
}

.cf-grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
}
.cf-grid3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px 16px;
}
.cf-grid4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px 12px;
}
.cf-field {
  min-width: 0;
}
.cf-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--app-ink-soft);
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* сочетание материалов */
.cf-mat {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cf-mat__row {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 12px;
}

/* эскиз */
.cf-eskiz {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--app-border);
  border-radius: 10px;
  background: #fff;
}
.cf-eskiz__preview {
  width: 100%;
  max-width: 560px;

  :deep(svg) {
    width: 100%;
    height: auto;
  }
}
.cf-eskiz__empty {
  color: var(--app-ink-soft);
  font-size: 13px;
  padding: 20px 0;
}

/* проходы */
.cf-passes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cf-pass {
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 12px 14px;
  background: var(--app-bg);
}
.cf-pass__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.cf-pass__no {
  font-size: 12px;
  font-weight: 600;
  color: var(--app-ink);
}
.cf-add {
  margin-top: 12px;
}
</style>
