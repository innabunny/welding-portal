<template>
  <q-dialog v-model="open">
    <q-card style="min-width: 480px">
      <q-card-section class="text-subtitle1 text-weight-medium">Новая заявка</q-card-section>
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="q-gutter-md">
          <q-select
            v-model="form.equipmentId"
            label="Оборудование"
            outlined
            dense
            :options="equipmentOptions"
            emit-value
            map-options
            :rules="[(v: number) => !!v || 'Выберите оборудование']"
          />
          <q-select v-model="form.reason" label="Причина" outlined dense :options="REASONS" />
          <q-input
            v-model="form.description"
            label="Описание проблемы"
            type="textarea"
            outlined
            dense
            autogrow
          />
          <q-select
            v-model="form.priority"
            label="Срочность"
            outlined
            dense
            :options="PRIORITIES"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Отмена" color="grey-7" v-close-popup />
          <q-btn unelevated no-caps label="Отправить" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { REASONS, PRIORITIES } from '@/shared/composables/useServiceRequests';
import type { RequestReason, RequestPriority } from '@/shared/types/serviceRequest';

const props = defineProps<{
  modelValue: boolean;
  equipmentOptions: { label: string; value: number }[];
}>();
const emit = defineEmits<{
  'update:modelValue': [v: boolean];
  save: [
    data: {
      equipmentId: number;
      reason: RequestReason;
      description: string;
      priority: RequestPriority;
    },
  ];
}>();

const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) });

const blank = () => ({
  equipmentId: null as number | null,
  reason: 'ремонт' as RequestReason,
  description: '',
  priority: 'средняя' as RequestPriority,
});
const form = reactive(blank());

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) Object.assign(form, blank());
  },
);

function onSubmit() {
  if (!form.equipmentId) return;
  emit('save', { ...form, equipmentId: form.equipmentId });
}
</script>
