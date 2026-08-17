<template>
  <q-dialog v-model="open">
    <q-card class="cd-card">
      <div class="cd-head">
        <div class="cd-head__icon"><q-icon name="warning_amber" size="24px" /></div>
        <div class="cd-head__title">{{ title }}</div>
      </div>

      <q-card-section class="cd-body">
        {{ message }}
        <div v-if="highlight" class="cd-highlight">{{ highlight }}</div>
      </q-card-section>

      <q-card-actions align="right" class="cd-actions">
        <q-btn flat no-caps label="Отмена" color="grey-7" v-close-popup />
        <q-btn unelevated no-caps :label="confirmLabel" class="cd-confirm" @click="confirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    message?: string;
    highlight?: string | undefined; // что именно удаляем — выделим отдельной плашкой
    confirmLabel?: string;
  }>(),
  {
    title: 'Удаление',
    message: 'Вы уверены? Действие необратимо.',
    confirmLabel: 'Удалить',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) });

function confirm() {
  emit('confirm');
  open.value = false;
}
</script>

<style scoped lang="scss">
.cd-card {
  width: 400px;
  max-width: 92vw;
  border-radius: 16px;
  overflow: hidden;
  background: var(--app-surface);
  box-shadow: 0 24px 60px -20px rgba(16, 48, 42, 0.45);
}
.cd-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  color: #fff;
  background: linear-gradient(135deg, #8a3b3b 0%, var(--negative, #9c4b45) 100%);
}
.cd-head__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.16);
}
.cd-head__title {
  font-size: 17px;
  font-weight: 600;
}
.cd-body {
  padding: 20px;
  color: var(--app-ink);
  font-size: 14px;
  line-height: 1.5;
}
.cd-highlight {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--status-overdue-bg);
  color: var(--status-overdue-fg);
  font-weight: 500;
}
.cd-actions {
  padding: 12px 20px;
}
.cd-confirm {
  border-radius: 8px;
  padding-inline: 16px;
  background: var(--negative, #9c4b45);
  color: #fff;
}
</style>
