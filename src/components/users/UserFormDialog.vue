<template>
  <q-dialog v-model="open" transition-show="jump-up" transition-hide="jump-down">
    <q-card class="user-dialog">
      <!-- Шапка с изумрудным акцентом -->
      <div class="user-dialog__header">
        <div class="user-dialog__header-icon">
          <q-icon name="person_add" size="24px" />
        </div>
        <div>
          <div class="user-dialog__title">Новый пользователь</div>
          <div class="user-dialog__subtitle">Сотрудник или администратор портала</div>
        </div>
      </div>

      <q-form ref="formRef" @submit.prevent="onSubmit" class="user-dialog__form">
        <q-card-section class="q-pa-md user-dialog__body">
          <!-- Блок: учётные данные -->
          <div class="user-dialog__group-label q-pb-sm">Учётные данные</div>

          <q-input
            v-model="form.login"
            label="Логин"
            outlined
            dense
            autofocus
            lazy-rules
            :rules="[(v: string) => !!v || 'Укажите логин']"
            class="q-mb-md"
          >
            <template #prepend><q-icon name="badge" /></template>
          </q-input>

          <q-input
            v-model="form.password"
            label="Пароль"
            :type="showPassword ? 'text' : 'password'"
            outlined
            dense
            lazy-rules
            :rules="[(v: string) => (v?.length ?? 0) >= 4 || 'Минимум 4 символа']"
            class="q-mb-md"
          >
            <template #prepend><q-icon name="lock" /></template>
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- Блок: профиль -->
          <div class="user-dialog__group-label q-pb-sm">Профиль</div>

          <q-input
            v-model="form.name"
            label="ФИО"
            outlined
            dense
            lazy-rules
            :rules="[(v: string) => !!v || 'Укажите ФИО']"
            class="q-mb-md"
          >
            <template #prepend><q-icon name="person" /></template>
          </q-input>

          <!-- Роль: не дропдаун, а плитки с иконками -->
          <div class="q-mb-md">
            <div class="user-dialog__field-label">Роль</div>
            <div class="role-grid">
              <button
                v-for="opt in roleOptions"
                :key="opt.value"
                type="button"
                class="role-card"
                :class="{ 'role-card--active': form.role === opt.value }"
                @click="form.role = opt.value"
              >
                <q-icon :name="opt.icon" size="22px" />
                <span>{{ opt.label }}</span>
              </button>
            </div>
          </div>

          <!-- Цех: появляется только для не-админа -->
          <q-slide-transition name="fade">
            <div v-if="!isAdmin" key="workshop">
              <q-select
                v-model="form.workshopId"
                label="Цех"
                outlined
                dense
                :options="workshopOptions"
                emit-value
                map-options
                lazy-rules
                :rules="workshopRules"
              >
                <template #prepend><q-icon name="factory" /></template>
              </q-select>
            </div>
          </q-slide-transition>

          <q-slide-transition>
            <div v-if="isAdmin" key="admin-note" class="admin-note">
              <q-icon name="info" size="18px" />
              <span>Администратор не привязан к цеху — доступ ко всему порталу</span>
            </div>
          </q-slide-transition>
        </q-card-section>

        <q-card-actions align="right" class="user-dialog__actions">
          <q-btn flat no-caps label="Отмена" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Создать"
            type="submit"
            color="primary"
            :disable="!isFilled"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, nextTick } from 'vue';
import type { QForm } from 'quasar';
import { ROLE_LABELS, type User, type UserRole } from '@/shared/types/user';
import { useWorkshopStore } from '@/stores/workshop';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [data: Omit<User, 'id'>];
}>();

const workshopStore = useWorkshopStore();
const formRef = ref<QForm | null>(null);
const showPassword = ref(false);

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const ROLE_ICONS: Record<UserRole, string> = {
  admin: 'admin_panel_settings',
  technologist: 'architecture',
  master: 'supervisor_account',
  mechanic: 'build',
};

const roleOptions = (Object.keys(ROLE_LABELS) as UserRole[]).map((r) => ({
  label: ROLE_LABELS[r],
  value: r,
  icon: ROLE_ICONS[r],
}));

const initialForm = (): Omit<User, 'id'> => ({
  name: '',
  login: '',
  password: '',
  role: 'technologist',
  active: true,
  workshopId: null,
});

const form = reactive<Omit<User, 'id'>>(initialForm());

const isAdmin = computed(() => form.role === 'admin');

const workshopOptions = computed(() =>
  workshopStore.items.map((w) => ({ label: w.name, value: w.id })),
);

// то самое правило: цех обязателен всем, кроме админа
const workshopRules = computed(() =>
  isAdmin.value ? [] : [(v: number | null) => v != null || 'Выберите цех'],
);

// для disabled-состояния кнопки (не про безопасность, только UX)
const isFilled = computed(
  () =>
    !!form.name &&
    !!form.login &&
    (form.password?.length ?? 0) >= 4 &&
    (isAdmin.value || form.workshopId != null),
);

// сменили роль на админа — цех больше не нужен, чистим
watch(
  () => form.role,
  (role) => {
    if (role === 'admin') form.workshopId = null;
  },
);

// открыли диалог — сброс формы и старых ошибок валидации
watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return;
    Object.assign(form, initialForm());
    showPassword.value = false;
    void nextTick(() => formRef.value?.resetValidation());
  },
);

function onSubmit() {
  emit('save', { ...form });
}
</script>

<style scoped lang="scss">
.user-dialog {
  width: 420px;
  max-width: 80vw;
  border-radius: 14px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  &__form {
    flex: 1;
    min-height: 0; // ← разрешает форме сжаться (иначе скролла не будет)
    display: flex;
    flex-direction: column;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 24px;
    color: #fff;
    background: linear-gradient(135deg, var(--app-accent), var(--app-accent-dark));
    flex-shrink: 0;
  }

  &__header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.18);
  }

  &__title {
    font-size: 1.05rem;
    font-weight: 600;
    line-height: 1.2;
  }

  &__subtitle {
    font-size: 0.8rem;
    opacity: 0.85;
  }

  &__group-label {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--app-accent);
    margin: 2px;
  }

  &__field-label {
    font-size: 0.85rem;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 8px;
    padding-left: 0px;
  }

  &__actions {
    padding: 15px;
  }
}

.role-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.role-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.7);
  transition: all 0.18s ease;

  &:hover {
    border-color: var(--app-accent);
  }

  &--active {
    border-color: var(--app-accent);
    background: color-mix(in srgb, var(--app-accent) 10%, transparent);
    color: var(--app-accent-dark);
    font-weight: 600;
  }
}

.admin-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--app-accent);
  background: color-mix(in srgb, var(--app-accent) 8%, transparent);
}
</style>
