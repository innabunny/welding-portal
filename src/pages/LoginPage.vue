<template>
  <q-page class="login-page flex flex-center">
    <div class="bg-layer">
      <div class="grid" />
      <div class="glow glow-1" />
      <div class="glow glow-2" />
    </div>

    <q-card class="login-card" flat>
      <div class="brand q-mb-lg">
        <div class="brand-mark">
          <q-icon name="bolt" size="26px" color="white" />
        </div>
        <div class="brand-text">
          <div class="brand-title">Сварочный портал</div>
          <div class="brand-sub">Информационная система предприятия</div>
        </div>
      </div>

      <div class="text-h6 text-weight-medium q-mb-xs">Вход в систему</div>
      <div class="text-caption text-grey-7 q-mb-lg">Введите логин и пароль</div>

      <q-form @submit.prevent="handleLogin" class="login-form">
        <q-input
          v-model="credentials.login"
          label="Логин"
          outlined
          dense
          autofocus
          bg-color="white"
          lazy-rules
          :rules="[(val: string) => !!val || 'Введите логин']"
        >
          <template #prepend>
            <q-icon name="person_outline" color="grey-6" />
          </template>
        </q-input>

        <q-input
          v-model="credentials.password"
          label="Пароль"
          :type="isPasswordHidden ? 'password' : 'text'"
          outlined
          dense
          bg-color="white"
          lazy-rules
          :rules="[(val: string) => !!val || 'Введите пароль']"
        >
          <template #prepend>
            <q-icon name="lock_outline" color="grey-6" />
          </template>
          <template #append>
            <q-icon
              :name="isPasswordHidden ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              color="grey-6"
              @click="isPasswordHidden = !isPasswordHidden"
            />
          </template>
        </q-input>

        <transition name="shake">
          <q-banner
            v-if="errorMessage"
            dense
            rounded
            class="bg-red-1 text-red-8 text-caption q-px-sm error-banner"
          >
            <template #avatar>
              <q-icon name="error_outline" color="red-7" />
            </template>
            {{ errorMessage }}
          </q-banner>
        </transition>

        <q-btn
          label="Войти"
          type="submit"
          unelevated
          class="full-width q-py-sm q-mt-sm"
          color="primary"
          size="md"
          :loading="authStore.loading"
        />
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

interface Credentials {
  login: string;
  password: string;
}

const router = useRouter();
const authStore = useAuthStore();

const credentials = reactive<Credentials>({ login: '', password: '' });
const isPasswordHidden = ref<boolean>(true);
const errorMessage = ref<string>('');

const handleLogin = async (): Promise<void> => {
  errorMessage.value = '';
  try {
    await authStore.login(credentials);
    await router.push('/');
  } catch (e: unknown) {
    const err = e as { message?: string };
    errorMessage.value = err?.message || 'Неверный логин или пароль';
  }
};
</script>

<style scoped>
.login-page {
  --grid-line: rgba(15, 122, 99, 0.06);
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: var(--app-bg);
}

/* фоновый слой */
.bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* чертёжная сетка с мягким затуханием к краям */
.grid {
  position: absolute;
  inset: -2px;
  background-image:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: radial-gradient(ellipse at center, #000 40%, transparent 85%);
  mask-image: radial-gradient(ellipse at center, #000 40%, transparent 85%);
  animation: drift 40s linear infinite;
}

/* холодные световые пятна */
.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.55;
}

.glow-1 {
  width: 460px;
  height: 460px;
  background: #d6efe6; ;
  top: -140px;
  right: -120px;
  animation: float1 16s ease-in-out infinite;
}

.glow-2 {
  width: 380px;
  height: 380px;
  background:#d6efe6; ;
  bottom: -130px;
  left: -110px;
  animation: float2 20s ease-in-out infinite;
}

/* карточка */
.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 36px 32px 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(45, 74, 124, 0.1);
  box-shadow: 0 10px 30px rgba(45, 74, 124, 0.08);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(q-primary);
  box-shadow: 0 4px 12px rgba(15, 122, 99, 0.25);
  flex-shrink: 0;
}

.brand-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--app-ink);
  line-height: 1.2;
}

.brand-sub {
  font-size: 11px;
  color: var(--app-ink-soft);
  letter-spacing: 0.2px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-heading {
  color: var(--app-ink);
}
.error-banner {
  border: 1px solid rgba(198, 40, 40, 0.15);
}

/* анимации */
@keyframes drift {
  from {
    background-position:
      0 0,
      0 0;
  }
  to {
    background-position:
      44px 44px,
      44px 44px;
  }
}

@keyframes float1 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-24px, 18px) scale(1.06);
  }
}

@keyframes float2 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(18px, -14px) scale(1.08);
  }
}

.shake-enter-active {
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}
</style>
