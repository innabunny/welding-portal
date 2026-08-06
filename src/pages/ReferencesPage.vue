<template>
  <q-page class="q-pa-lg">
    <div class="text-h6 text-weight-medium q-mb-md" style="color:var(--app-ink)">
      Справочники и способы сварки
    </div>

    <div v-if="store.data" class="row q-col-gutter-md">
      <!-- МАСТЕР: категории -->
      <div class="col-12 col-sm-4 col-md-3">
        <q-card flat bordered>
          <q-list separator>
            <q-item
              v-for="cat in categories"
              :key="cat"
              clickable
              :active="cat === selected"
              active-class="cat-active"
              @click="selected = cat"
            >
              <q-item-section>{{ titles[cat] }}</q-item-section>
              <q-item-section side>
                <q-badge color="grey-4" text-color="grey-8" :label="store.data[cat].length" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- ДЕТАЛЬ: значения выбранной категории -->
      <div class="col-12 col-sm-8 col-md-9">
        <q-card flat bordered>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-subtitle1 text-weight-medium">{{ titles[selected] }}</div>
            <q-space />
            <q-badge color="grey-4" text-color="grey-8" :label="`${store.data[selected].length} шт.`" />
          </q-card-section>

          <!-- добавление -->
          <q-card-section class="row q-gutter-sm items-center">
            <q-input
              v-model="newValue"
              dense outlined
              placeholder="Новая марка / значение"
              class="col"
              @keyup.enter="add"
            />
            <q-btn unelevated no-caps icon="add" label="Добавить"
              color="primary" :disable="!newValue.trim()" @click="add" />
          </q-card-section>

          <q-separator />

          <!-- список значений -->
          <q-list separator>
            <q-item v-for="value in store.data[selected]" :key="value">
              <q-item-section>{{ value }}</q-item-section>
              <q-item-section side>
                <q-btn flat dense round icon="delete" size="sm" color="red-5" @click="remove(value)" />
              </q-item-section>
            </q-item>
            <q-item v-if="store.data[selected].length === 0">
              <q-item-section class="text-grey-6">Список пуст</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useReferenceStore } from '@/stores/refernce';
import { REF_TITLES, type RefCategory } from '@/shared/types/reference';

const $q = useQuasar();
const store = useReferenceStore();

const titles = REF_TITLES;
const categories = Object.keys(REF_TITLES) as RefCategory[];
const selected = ref<RefCategory>('materials');
const newValue = ref('');

async function add() {
  const v = newValue.value.trim();
  if (!v) return;
  await store.addValue(selected.value, v);
  newValue.value = '';
}

function remove(value: string) {
  $q.dialog({
    title: 'Удаление',
    message: `Удалить «${value}» из справочника?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void store.removeValue(selected.value, value);
  });
}

onMounted(() => {
  void store.fetchAll();
});
</script>

<style scoped>
</style>
