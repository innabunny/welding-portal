<template>
  <q-page class="q-pa-lg">
    <div class="page-content">
      <div class="text-h6 text-weight-medium q-mb-md" style="color: var(--app-ink)">
        Справочники и способы сварки
      </div>

      <div v-if="store.items" class="row q-col-gutter-md">
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
                  <q-badge
                    color="grey-4"
                    text-color="grey-8"
                    :label="store.byCategory[cat].length"
                  />
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
              <q-badge
                color="grey-4"
                text-color="grey-8"
                :label="`${store.byCategory[selected].length} шт.`"
              />
            </q-card-section>

            <!-- добавление -->
            <q-card-section class="row q-gutter-sm items-center">
              <q-input
                v-model="newValue"
                dense
                outlined
                placeholder="Новая марка / значение"
                class="col"
                @keyup.enter="add"
              />
              <q-btn
                unelevated
                no-caps
                icon="add"
                label="Добавить"
                color="primary"
                :disable="!newValue.trim()"
                @click="add"
              />
            </q-card-section>

            <q-separator />

            <!-- список значений -->
            <q-list separator>
              <q-item v-for="item in store.byCategory[selected]" :key="item.id">
                <template v-if="editingId === item.id">
                  <q-item-section>
                    <q-input
                      v-model="editValue"
                      dense
                      outlined
                      autofocus
                      @keyup.enter="saveEdit(item)"
                      @keyup.esc="cancelEdit"
                    />
                  </q-item-section>
                  <q-item-section side>
                    <div class="row q-gutter-xs">
                      <q-btn
                        flat
                        dense
                        round
                        icon="check"
                        size="sm"
                        color="positive"
                        @click="saveEdit(item)"
                      />
                      <q-btn
                        flat
                        dense
                        round
                        icon="close"
                        size="sm"
                        color="grey-7"
                        @click="cancelEdit"
                      />
                    </div>
                  </q-item-section>
                </template>

                <!-- обычный режим -->
                <template v-else>
                  <q-item-section>{{ item.value }}</q-item-section>
                  <q-item-section side>
                    <div class="row q-gutter-xs">
                      <q-btn
                        flat
                        dense
                        round
                        icon="edit"
                        size="sm"
                        color="grey-7"
                        @click="startEdit(item)"
                      />
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        size="sm"
                        color="red-5"
                        @click="remove(item)"
                      />
                    </div>
                  </q-item-section>
                </template>
              </q-item>
              <q-item v-if="store.byCategory[selected].length === 0">
                <q-item-section class="text-grey-6">Список пуст</q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useReferenceStore } from '@/stores/references';
import { REF_TITLES, type RefItem, type RefCategory } from '@/shared/types/references';

const $q = useQuasar();
const store = useReferenceStore();

const titles = REF_TITLES;
const categories = Object.keys(REF_TITLES) as RefCategory[];
const selected = ref<RefCategory>('materials');
const newValue = ref('');
const editingId = ref<number | null>(null); // id строки в режиме правки, null = никто
const editValue = ref('');

function startEdit(item: RefItem) {
  editingId.value = item.id;
  editValue.value = item.value;
}

function cancelEdit() {
  editingId.value = null;
  editValue.value = '';
}

async function saveEdit(item: RefItem) {
  const v = editValue.value.trim();
  if (!v || v === item.value) {
    cancelEdit();
    return;
  }
  try {
    await store.updateValue(item.id, v);
    cancelEdit();
    $q.notify({ type: 'positive', message: 'Поле изменено', position: 'bottom' });
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Не удалось изменить',
      position: 'bottom',
    });
  }
}

async function add() {
  const v = newValue.value.trim();
  if (!v) return;
  try {
    await store.addValue(selected.value, v);
    newValue.value = '';
    $q.notify({ type: 'positive', message: 'Марка добавлена', position: 'bottom' });
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Не удалось добавить — возможно, уже есть',
      position: 'bottom',
    });
  }
}

function remove(item: RefItem) {
  $q.dialog({
    title: 'Удаление',
    message: `Удалить «${item.value}» из справочника?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    try {
      void store.removeValue(item.id);
      $q.notify({ type: 'negative', message: 'Удалено', position: 'bottom' });
    } catch {
      $q.notify({
        type: 'negative',
        message: 'Не удалось удалить',
        position: 'bottom',
      });
    }
  });
}

onMounted(() => {
  void store.fetchAll();
});
</script>

<style scoped></style>
