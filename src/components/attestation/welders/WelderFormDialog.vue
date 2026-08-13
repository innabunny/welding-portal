<template>
  <q-dialog v-model="open" @hide="showErrors = false">
    <q-card class="wf-card">
      <div class="wf-head">
        <div class="wf-head__glow" />
        <div class="wf-head__icon">
          <q-icon :name="props.item ? 'edit' : 'engineering'" size="26px" />
        </div>
        <div class="wf-head__text">
          <div class="wf-head__title">{{ props.item ? 'Редактирование' : 'Новый сварщик' }}</div>
          <div class="wf-head__sub">Карточка сварщика</div>
        </div>
        <q-btn flat round dense icon="close" v-close-popup class="wf-head__close" />
      </div>

      <q-card-section class="wf-body">
        <div class="wf-label">ФИО</div>
        <q-input
          v-model="form.fio"
          outlined
          dense
          autofocus
          :error="showErrors && !form.fio"
          error-message="Укажите ФИО"
        >
          <template #prepend><q-icon name="badge" color="primary" /></template>
        </q-input>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <div class="wf-label">Дата рождения</div>
            <q-input v-model="form.birthDate" type="date" stack-label outlined dense />
          </div>
          <div class="col-12 col-sm-6">
            <div class="wf-label">Начало стажа</div>
            <q-input v-model="form.weldingSince" type="date" stack-label outlined dense />
          </div>
        </div>

        <div class="wf-label">Цех</div>
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

        <div class="row q-col-gutter-md q-mt-xs">
          <div class="col-12 col-sm-6">
            <div class="wf-label">Разряд</div>
            <q-input v-model="form.rank" outlined dense />
          </div>
          <div class="col-12 col-sm-6">
            <div class="wf-label">Личное клеймо</div>
            <q-input v-model="form.personalStamp" outlined dense />
          </div>
        </div>

        <q-toggle v-model="form.isActive" label="Активен" color="primary" class="q-mt-md" />
      </q-card-section>

      <q-separator />
      <q-card-actions align="right" class="wf-actions">
        <q-btn flat no-caps label="Отмена" color="grey-7" v-close-popup />
        <q-btn
          unelevated
          no-caps
          label="Сохранить"
          icon-right="check"
          color="primary"
          class="wf-submit"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { Welder } from '@/shared/types/welders';

export type WelderInput = Omit<Welder, 'id' | 'workshopName' | 'age' | 'experienceYears'>;

const props = defineProps<{
  modelValue: boolean;
  item: Welder | null;
  workshopOptions: { label: string; value: number }[];
}>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [data: WelderInput];
}>();

const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) });

const blank = (): WelderInput => ({
  fio: '',
  birthDate: null,
  workshopId: null,
  weldingSince: null,
  rank: '',
  personalStamp: '',
  isActive: true,
});
const form = reactive<WelderInput>(blank());
const showErrors = ref(false);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return;
    Object.assign(form, blank());
    if (props.item) {
      Object.assign(form, {
        fio: props.item.fio,
        birthDate: props.item.birthDate,
        workshopId: props.item.workshopId,
        weldingSince: props.item.weldingSince,
        rank: props.item.rank,
        personalStamp: props.item.personalStamp,
        isActive: props.item.isActive,
      });
    }
    showErrors.value = false;
  },
);

function onSubmit() {
  if (!form.fio) {
    showErrors.value = true;
    return;
  }
  emit('save', { ...form });
}
</script>

<style scoped lang="scss">
.wf-card {
  width: 520px;
  max-width: 92vw;
  border-radius: 18px;
  overflow: hidden;
  background: var(--app-surface);
  box-shadow: 0 24px 60px -20px rgba(16, 48, 42, 0.45);
}
.wf-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 22px;
  color: #fff;
  background: linear-gradient(135deg, var(--app-accent-dark) 0%, var(--app-accent) 100%);
  overflow: hidden;
}
.wf-head__glow {
  position: absolute;
  top: -60%;
  right: -10%;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22), transparent 70%);
  pointer-events: none;
}
.wf-head__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.14);
}
.wf-head__text {
  flex: 1;
}
.wf-head__title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
}
.wf-head__sub {
  font-size: 12.5px;
  opacity: 0.8;
  margin-top: 2px;
}
.wf-head__close {
  color: rgba(255, 255, 255, 0.85);
}
.wf-body {
  padding: 22px;
}
.wf-label {
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
.wf-actions {
  padding: 14px 22px;
}
.wf-submit {
  border-radius: 10px;
  padding-inline: 18px;
}
:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
}
</style>
