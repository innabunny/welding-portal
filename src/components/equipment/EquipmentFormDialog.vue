<template>
  <q-dialog v-model="open" @hide="showErrors = false">
    <q-card class="ef-card">
      <div class="ef-head">
        <div class="ef-head__glow" />
        <div class="ef-head__icon">
          <q-icon :name="props.item ? 'edit' : 'precision_manufacturing'" size="26px" />
        </div>
        <div class="ef-head__text">
          <div class="ef-head__title">
            {{ props.item ? 'Редактирование' : 'Новое оборудование' }}
          </div>
          <div class="ef-head__sub">Карточка оборудования</div>
        </div>
        <q-btn flat round dense icon="close" v-close-popup class="ef-head__close" />
      </div>

      <q-card-section class="ef-body">
        <div class="ef-label">Наименование</div>
        <q-input
          v-model="form.name"
          outlined
          dense
          autofocus
          :error="showErrors && !form.name"
          error-message="Укажите наименование"
        >
          <template #prepend><q-icon name="label" color="primary" /></template>
        </q-input>

        <div class="ef-label">Способ сварки</div>
        <q-select
          v-model="form.method"
          :options="methodOptions"
          emit-value
          map-options
          outlined
          dense
          :error="showErrors && !form.method"
          error-message="Выберите способ"
        >
          <template #prepend><q-icon name="bolt" color="primary" /></template>
        </q-select>

        <div class="ef-label">Цех</div>
        <q-select
          v-model="form.workshopId"
          :options="workshopOptions"
          emit-value
          map-options
          outlined
          dense
          clearable
        >
          <template #prepend><q-icon name="factory" color="primary" /></template>
        </q-select>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="ef-actions">
        <q-btn flat no-caps label="Отмена" color="grey-7" v-close-popup />
        <q-btn
          unelevated
          no-caps
          label="Сохранить"
          icon-right="check"
          color="primary"
          class="ef-submit"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useEquipmentStore } from '@/stores/equipment';
import { useWorkshopStore } from '@/stores/workshop';
import type { Equipment } from '@/shared/types/equipment';

const props = defineProps<{ modelValue: boolean; item: Equipment | null }>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [data: Omit<Equipment, 'id'>];
}>();

const store = useEquipmentStore();
const workshopStore = useWorkshopStore();

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const methodOptions = computed(() => store.methods.map((m) => ({ label: m.name, value: m.id })));
const workshopOptions = computed(() =>
  workshopStore.items.map((w) => ({ label: w.name, value: w.id })),
);

const form = reactive<Omit<Equipment, 'id'>>({ name: '', method: '', workshopId: null });
const showErrors = ref(false);

// при каждом открытии заполняем форму: из item (правка) или пустую (создание)
watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return;
    form.name = props.item?.name ?? '';
    form.method = props.item?.method ?? '';
    form.workshopId = props.item?.workshopId ?? null;
    showErrors.value = false;
  },
);

function onSubmit() {
  if (!form.name || !form.method) {
    showErrors.value = true;
    return;
  }
  emit('save', { ...form });
}
</script>

<style scoped lang="scss">
.ef-card {
  width: 480px;
  max-width: 92vw;
  border-radius: 18px;
  overflow: hidden;
  background: var(--app-surface);
  box-shadow: 0 24px 60px -20px rgba(16, 48, 42, 0.45);
}
.ef-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 22px;
  color: #fff;
  background: linear-gradient(135deg, var(--app-accent-dark) 0%, var(--app-accent) 100%);
  overflow: hidden;
}
.ef-head__glow {
  position: absolute;
  top: -60%;
  right: -10%;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22), transparent 70%);
  pointer-events: none;
}
.ef-head__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.14);
}
.ef-head__text {
  flex: 1;
}
.ef-head__title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
}
.ef-head__sub {
  font-size: 12.5px;
  opacity: 0.8;
  margin-top: 2px;
}
.ef-head__close {
  color: rgba(255, 255, 255, 0.85);
}

.ef-body {
  padding: 22px;
}
.ef-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--app-ink-soft);
  margin: 16px 0 6px;
  &:first-child {
    margin-top: 0;
  }
}
.ef-actions {
  padding: 14px 22px;
}
.ef-submit {
  border-radius: 10px;
  padding-inline: 18px;
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
}
</style>
