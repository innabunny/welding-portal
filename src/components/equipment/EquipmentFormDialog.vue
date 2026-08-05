<template>
  <q-dialog v-model="open">
    <q-card style="min-width: 380px">
      <q-card-section class="text-subtitle1 text-weight-medium">
        {{ props.item ? 'Редактирование' : 'Новое оборудование' }}
      </q-card-section>

      <q-form @submit.prevent="onSubmit">
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Наименование"
            outlined dense autofocus
            lazy-rules
            :rules="[(v: string) => !!v || 'Укажите наименование']"
          />
          <q-select
            v-model="form.method"
            label="Способ сварки"
            outlined dense
            :options="methodOptions"
            emit-value map-options
            lazy-rules
            :rules="[(v: string) => !!v || 'Выберите способ']"
          />
          <q-input v-model="form.shop" label="Цех" outlined dense />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Отмена" color="grey-7" v-close-popup />
          <q-btn unelevated no-caps label="Сохранить" type="submit" style="background:#2d4a7c;color:#fff" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useEquipmentStore } from '@/stores/equipment';
import type { Equipment } from '@/shared/types/equipment';

const props = defineProps<{
  modelValue: boolean;
  item: Equipment | null;
}>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [data: Omit<Equipment, 'id'>];
}>();

const store = useEquipmentStore();

// проксируем v-model диалога
const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const methodOptions = computed(() =>
  store.methods.map((m) => ({ label: m.name, value: m.id })),
);

const form = reactive<Omit<Equipment, 'id'>>({ name: '', method: '', shop: '' });

// при каждом открытии заполняем форму: из item (правка) или пустую (создание)
watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return;
    form.name = props.item?.name ?? '';
    form.method = props.item?.method ?? '';
    form.shop = props.item?.shop ?? '';
  },
);

function onSubmit() {
  emit('save', { ...form });
}
</script>
