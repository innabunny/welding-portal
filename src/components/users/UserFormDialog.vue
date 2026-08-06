<template>
  <q-dialog v-model="open">
    <q-card style="min-width: 380px">
      <q-card-section class="text-subtitle1 text-weight-medium">Новый пользователь</q-card-section>
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Имя"
            outlined
            dense
            autofocus
            lazy-rules
            :rules="[(v: string) => !!v || 'Укажите имя']"
          />
          <q-input
            v-model="form.login"
            label="Логин"
            outlined
            dense
            lazy-rules
            :rules="[(v: string) => !!v || 'Укажите логин']"
          />
          <q-input
            v-model="form.password"
            label="Пароль"
            type="password"
            outlined
            dense
            lazy-rules
            :rules="[(v: string) => v?.length >= 4 || 'Минимум 4 символа']"
          />
          <q-select
            v-model="form.role"
            label="Роль"
            outlined
            dense
            :options="roleOptions"
            emit-value
            map-options
          />
          <q-select
            v-model="form.workshopId"
            label="Цех"
            outlined
            dense
            :options="workshopOptions"
            emit-value
            map-options
            clearable
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Отмена" color="grey-7" v-close-popup />
          <q-btn unelevated no-caps label="Создать" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { ROLE_LABELS, type User, type UserRole } from '@/shared/types/user';
import { useWorkshopStore } from '@/stores/workshop';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [data: Omit<User, 'id'>];
}>();

const workshopStore = useWorkshopStore();

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const roleOptions = (Object.keys(ROLE_LABELS) as UserRole[]).map((r) => ({
  label: ROLE_LABELS[r],
  value: r,
}));

const form = reactive<Omit<User, 'id'>>({
  name: '',
  login: '',
  password: '',
  role: 'technologist',
  active: true,
  workshopId: null,
});

const workshopOptions = computed(() =>
  workshopStore.items.map((w) => ({ label: w.name, value: w.id })),
);

watch(
  () => props.modelValue,
   (isOpen) => {
    if (!isOpen) return;
    Object.assign(form, {
      name: '',
      login: '',
      password: '',
      role: 'technologist',
      active: true,
      workshopId: null,
    });

  },
);

function onSubmit() {
  emit('save', { ...form });
}
</script>
