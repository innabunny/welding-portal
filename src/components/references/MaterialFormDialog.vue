<template>
  <q-dialog v-model="open" @hide="showErrors = false">
    <q-card class="mat-card">
      <div class="mat-head">
        <div class="mat-head__glow" />
        <div class="mat-head__icon">
          <q-icon :name="props.item ? 'edit' : 'science'" size="26px" />
        </div>
        <div class="mat-head__text">
          <div class="mat-head__title">{{ props.item ? 'Редактирование' : 'Новая марка' }}</div>
          <div class="mat-head__sub">Основной материал</div>
        </div>
        <q-btn flat round dense icon="close" v-close-popup class="mat-head__close" />
      </div>

      <q-card-section class="mat-body">
        <div class="mat-label">Марка</div>
        <q-input
          v-model="form.marka"
          outlined
          dense
          autofocus
          :error="showErrors && !form.marka"
          error-message="Укажите марку"
        >
          <template #prepend><q-icon name="label" color="primary" /></template>
        </q-input>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <div class="mat-label">Группа</div>
            <q-select
              v-model="form.groupId"
              :options="groupOptions"
              emit-value
              map-options
              outlined
              dense
              clearable
            >
              <template #prepend><q-icon name="category" color="primary" /></template>
            </q-select>
          </div>
          <div class="col-12 col-sm-6">
            <div class="mat-label">Предел прочности, кгс/мм²</div>
            <q-input
              v-model.number="form.tensileStrength"
              type="number"
              step="0.1"
              outlined
              dense
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />
      <q-card-actions align="right" class="mat-actions">
        <q-btn flat no-caps label="Отмена" color="grey-7" v-close-popup />
        <q-btn
          unelevated
          no-caps
          label="Сохранить"
          icon-right="check"
          color="primary"
          class="mat-submit"
          @click="onSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { Material, MaterialGroup } from '@/shared/types/materials';

export type MaterialInput = Omit<Material, 'id' | 'groupCode'>;

const props = defineProps<{
  modelValue: boolean;
  item: Material | null;
  groups: MaterialGroup[];
}>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [data: MaterialInput];
}>();

const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) });
const groupOptions = computed(() => props.groups.map((g) => ({ label: g.code, value: g.id })));

const blank = (): MaterialInput => ({ marka: '', groupId: null, tensileStrength: null });
const form = reactive<MaterialInput>(blank());
const showErrors = ref(false);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return;
    Object.assign(form, blank());
    if (props.item)
      Object.assign(form, {
        marka: props.item.marka,
        groupId: props.item.groupId,
        tensileStrength: props.item.tensileStrength,
      });
    showErrors.value = false;
  },
);

function onSubmit() {
  if (!form.marka) {
    showErrors.value = true;
    return;
  }
  emit('save', { ...form });
}
</script>

<style scoped lang="scss">
.mat-card {
  width: 480px;
  max-width: 92vw;
  border-radius: 18px;
  overflow: hidden;
  background: var(--app-surface);
  box-shadow: 0 24px 60px -20px rgba(16, 48, 42, 0.45);
}
.mat-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 22px;
  color: #fff;
  background: linear-gradient(135deg, var(--app-accent-dark) 0%, var(--app-accent) 100%);
  overflow: hidden;
}
.mat-head__glow {
  position: absolute;
  top: -60%;
  right: -10%;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22), transparent 70%);
  pointer-events: none;
}
.mat-head__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.14);
}
.mat-head__text {
  flex: 1;
}
.mat-head__title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
}
.mat-head__sub {
  font-size: 12.5px;
  opacity: 0.8;
  margin-top: 2px;
}
.mat-head__close {
  color: rgba(255, 255, 255, 0.85);
}
.mat-body {
  padding: 22px;
}
.mat-label {
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
.mat-actions {
  padding: 14px 22px;
}
.mat-submit {
  border-radius: 10px;
  padding-inline: 18px;
}
:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
}
</style>
