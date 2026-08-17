<template>
  <q-page class="q-pa-lg">
    <div class="page-content">
      <div class="text-h6 text-weight-medium q-mb-md" style="color: var(--app-ink)">
        Справочники и способы сварки
      </div>

      <div class="row q-col-gutter-md">
        <!-- категории -->
        <div class="col-12 col-sm-4 col-md-3">
          <q-card flat bordered>
            <q-list separator>
              <q-item
                v-for="nav in navItems"
                :key="nav.key"
                clickable
                :active="nav.key === selected"
                active-class="cat-active"
                @click="selected = nav.key"
              >
                <q-item-section>{{ nav.title }}</q-item-section>
                <q-item-section side>
                  <q-badge color="grey-4" text-color="grey-8" :label="nav.count" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <!-- деталь -->
        <div class="col-12 col-sm-8 col-md-9">
          <!-- новые панели -->
          <MaterialsPanel v-if="selected === 'materials'" />
          <MaterialGroupsPanel v-else-if="selected === 'material-groups'" />

          <!-- прежний список RefItem для остальных категорий -->
          <q-card v-else flat bordered>
            <q-card-section class="row items-center q-pb-none">
              <div class="text-subtitle1 text-weight-medium">{{ titles[refCategory] }}</div>
              <q-space />
              <q-badge
                color="grey-4"
                text-color="grey-8"
                :label="`${store.byCategory[refCategory].length} шт.`"
              />
            </q-card-section>

            <q-card-section class="row q-gutter-sm items-center">
              <q-input
                v-model="newValue"
                dense
                outlined
                placeholder="Новое значение"
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

            <q-list separator>
              <q-item v-for="item in store.byCategory[refCategory]" :key="item.id">
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

                <template v-else>
                  <q-item-section>{{ item.value }}</q-item-section>
                  <q-item-section side>
                    <div class="row q-gutter-xs">
                      <q-btn
                        flat
                        dense
                        round
                        icon="edit"
                        size="md"
                        color="grey-7"
                        @click="startEdit(item)"
                      />
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        size="md"
                        color="red-5"
                        @click="remove(item)"
                      />
                    </div>
                  </q-item-section>
                </template>
              </q-item>
              <q-item v-if="store.byCategory[refCategory].length === 0">
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
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useReferenceStore } from '@/stores/references';
import { useMaterialsStore } from '@/stores/materials';
import { REF_TITLES, type RefItem, type RefCategory } from '@/shared/types/references';
import MaterialsPanel from '@/components/references/MaterialsPanel.vue';
import MaterialGroupsPanel from '@/components/references/MaterialGroupsPanel.vue';

type NavKey = RefCategory | 'material-groups';

const $q = useQuasar();
const store = useReferenceStore();
const materials = useMaterialsStore();

const titles = REF_TITLES;
const categories = Object.keys(REF_TITLES) as RefCategory[];
const selected = ref<NavKey>('materials');
const newValue = ref('');
const editingId = ref<number | null>(null);
const editValue = ref('');

const refCategory = computed(() => selected.value as RefCategory);

const navItems = computed<{ key: NavKey; title: string; count: number }[]>(() => [
  ...categories.map((key) => ({
    key,
    title: titles[key],
    count: key === 'materials' ? materials.items.length : store.byCategory[key].length,
  })),
  { key: 'material-groups', title: 'Группы материалов', count: materials.groups.length },
]);

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
    $q.notify({ type: 'positive', message: 'Поле изменено' });
  } catch {
    $q.notify({ type: 'negative', message: 'Не удалось изменить' });
  }
}
async function add() {
  const v = newValue.value.trim();
  if (!v) return;
  try {
    await store.addValue(refCategory.value, v);
    newValue.value = '';
    $q.notify({ type: 'positive', message: 'Добавлено' });
  } catch {
    $q.notify({ type: 'negative', message: 'Не удалось добавить' });
  }
}
function remove(item: RefItem) {
  $q.dialog({
    title: 'Удаление',
    message: `Удалить «${item.value}» из справочника?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await store.removeValue(item.id);
        $q.notify({ type: 'negative', message: 'Удалено' });
      } catch {
        $q.notify({ type: 'negative', message: 'Не удалось удалить' });
      }
    });
  });
}

onMounted(() => {
  void store.fetchAll();
  void materials.fetchAll(); // счётчики марок/групп в левом списке
});
</script>
