<template>
  <q-dialog v-model="open" @hide="reset">
    <q-card class="mf-card">
      <div class="mf-head">
        <div class="mf-head__glow" />
        <div class="mf-head__icon"><q-icon name="build_circle" size="26px" /></div>
        <div class="mf-head__text">
          <div class="mf-head__title">Новая заявка</div>
          <div class="mf-head__sub">Обслуживание оборудования</div>
        </div>
        <q-btn flat round dense icon="close" v-close-popup class="mf-head__close" />
      </div>

      <q-card-section class="mf-body">
        <div class="mf-label">Оборудование</div>
        <q-select
          v-model="form.equipmentId"
          :options="equipmentOptions"
          emit-value
          map-options
          outlined
          dense
          :error="showErrors && form.equipmentId == null"
          error-message="Выберите оборудование"
        >
          <template #prepend><q-icon name="precision_manufacturing" color="primary" /></template>
        </q-select>

        <div class="mf-label">Причина обращения</div>
        <q-select
          v-model="form.reason"
          :options="reasonOptions"
          emit-value
          map-options
          outlined
          dense
          :error="showErrors && !form.reason"
          error-message="Укажите причину"
        >
          <template #prepend><q-icon name="handyman" color="primary" /></template>
        </q-select>

        <div class="mf-label">Срочность</div>
        <q-btn-toggle
          v-model="form.priority"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          color="grey-2"
          text-color="grey-8"
          :options="priorityOptions"
          class="mf-toggle"
        />

        <div class="mf-label">Описание</div>
        <q-input
          v-model="form.description"
          type="textarea"
          outlined
          autogrow
          :input-style="{ minHeight: '72px' }"
          placeholder="Что случилось, симптомы, когда заметили…"
          counter
          maxlength="500"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="mf-actions">
        <q-btn flat no-caps label="Отмена" color="grey-7" v-close-popup />
        <q-btn
          unelevated
          no-caps
          label="Отправить заявку"
          icon-right="send"
          color="primary"
          class="mf-submit"
          @click="submit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { RequestReason, RequestPriority } from '@/shared/types/serviceRequest';

const open = defineModel<boolean>({ required: true });
defineProps<{ equipmentOptions: { label: string; value: number }[] }>();
const emit = defineEmits<{
  save: [
    payload: {
      equipmentId: number;
      reason: RequestReason;
      description: string;
      priority: RequestPriority;
    },
  ];
}>();

const reasonOptions = [
  { label: 'Ремонт', value: 'ремонт' },
  { label: 'Диагностика', value: 'диагностика' },
  { label: 'Неисправность', value: 'неисправность' },
];
const priorityOptions = [
  { label: 'Низкая', value: 'низкая' },
  { label: 'Средняя', value: 'средняя' },
  { label: 'Высокая', value: 'высокая' },
];

const blank = () => ({
  equipmentId: null as number | null,
  reason: '' as RequestReason | '',
  description: '',
  priority: 'средняя' as RequestPriority,
});
const form = reactive(blank());
const showErrors = ref(false);

function reset() {
  Object.assign(form, blank());
  showErrors.value = false;
}
function submit() {
  if (form.equipmentId == null || !form.reason) {
    showErrors.value = true;
    return;
  }
  emit('save', {
    equipmentId: form.equipmentId,
    reason: form.reason,
    description: form.description,
    priority: form.priority,
  });
}
</script>

<style scoped lang="scss">
.mf-card {
  width: 520px;
  max-width: 92vw;
  border-radius: 18px;
  overflow: hidden;
  background: var(--app-surface);
  box-shadow: 0 24px 60px -20px rgba(16, 48, 42, 0.45);
}
.mf-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 22px;
  color: #fff;
  background: linear-gradient(135deg, var(--app-accent-dark) 0%, var(--app-accent) 100%);
  overflow: hidden;
}
.mf-head__glow {
  position: absolute;
  top: -60%;
  right: -10%;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22), transparent 70%);
  pointer-events: none;
}
.mf-head__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.14);
}
.mf-head__text {
  flex: 1;
}
.mf-head__title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
}
.mf-head__sub {
  font-size: 12.5px;
  opacity: 0.8;
  margin-top: 2px;
}
.mf-head__close {
  color: rgba(255, 255, 255, 0.85);
}

.mf-body {
  padding: 22px;
}
.mf-label {
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
.mf-toggle {
  border: 1px solid var(--app-border);
  border-radius: 10px;
  overflow: hidden;
}
.mf-actions {
  padding: 14px 22px;
}
.mf-submit {
  border-radius: 10px;
  padding-inline: 18px;
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
}
</style>
