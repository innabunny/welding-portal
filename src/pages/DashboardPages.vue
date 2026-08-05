<template>
  <q-page class="dashboard q-pa-lg">
    <h1 class="greeting">Здравствуйте, {{ auth.user?.name }}!</h1>

    <div class="cards-grid">
      <q-card
        v-for="section in visibleSections"
        :key="section.key"
        class="section-card"
        :class="{ 'section-card--wip': section.wip }"
        @click="openSection(section)"
      >
        <q-badge
          v-if="section.wip"
          class="wip-badge"
          color="orange-4"
          text-color="orange-10"
          label="в разработке"
        />

        <div class="icon-tile">
          <q-icon :name="section.icon" size="26px" />
        </div>

        <div class="section-title">{{ section.title }}</div>
        <div class="section-subtitle">{{ section.subtitle }}</div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

type Role = 'admin' | 'user';

interface DashboardSection {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  to: string;
  roles?: Role[]; // не указано — видно всем ролям
  wip?: boolean; // "в разработке" — карточка неактивна
}

const auth = useAuthStore();
const router = useRouter();

// весь инвентарь разделов — единый источник правды
const sections: DashboardSection[] = [
  {
    key: 'tech-process',
    title: 'Режим разработки технологического процесса',
    subtitle: 'Создание технологических карт сварки',
    icon: 'settings',
    to: '/tech-process',
  },
  {
    key: 'certification',
    title: 'Аттестация сварщиков',
    subtitle: 'Удостоверения, допуски, сроки',
    icon: 'school',
    to: '/certification',
  },
  {
    key: 'maintenance',
    title: 'Заявка на обслуживание оборудования',
    subtitle: 'Подача и отслеживание заявок',
    icon: 'build',
    to: '/maintenance',
  },
  {
    key: 'equipment',
    title: 'Оборудование предприятия',
    subtitle: 'Реестр сварочного оборудования',
    icon: 'factory',
    to: '/equipment',
  },
  {
    key: 'materials',
    title: 'Анализ сварочных материалов',
    subtitle: 'Учёт и анализ материалов',
    icon: 'science',
    to: '/materials',
    wip: true,
  },
  {
    key: 'cards-archive',
    title: 'Архив технологических карт',
    subtitle: 'Поиск по деталям, материалам, толщинам',
    icon: 'inventory_2',
    to: '/welding-cards',
  },
  {
    key: 'telemetry',
    title: 'Телеметрия оборудования',
    subtitle: 'Параметры сварки в реальном времени',
    icon: 'sensors',
    to: '/telemetry',
  },
  {
    key: 'references',
    title: 'Справочники и способы сварки',
    subtitle: 'Материалы, проволоки, газы, способы, оборудование',
    icon: 'menu_book',
    to: '/references',
  },
  {
    key: 'users',
    title: 'Пользователи',
    subtitle: 'Учётные записи и роли',
    icon: 'manage_accounts',
    to: '/users',
    roles: ['admin'], // только админ
  },
];

const visibleSections = computed(() =>
  sections.filter((s) => {
    if (!s.roles) return true;
    const role = auth.user?.role;
    return role ? s.roles.includes(role) : false;
  }),
);

function openSection(section: DashboardSection): void {
  if (section.wip) return; // раздел в разработке — никуда не ведём
  void router.push(section.to);
}
</script>

<style scoped>
.dashboard {
  --steel: #2d4a7c;
  --steel-soft: rgba(45, 74, 124, 0.08);
  background: #f3f6fa;
  min-height: 100%;
}

.greeting {
  font-size: 22px;
  font-weight: 600;
  color: #1d2b45;
  margin: 4px 0 24px;
}

/* сетка сама раскладывает карточки по ширине, без возни с брейкпоинтами */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.section-card {
  position: relative;
  height: 100%;
  padding: 22px 20px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(45, 74, 124, 0.452);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.section-card:hover {
  transform: translateY(-3px);
  border-color: rgba(45, 74, 124, 0.671);
  box-shadow: 0 8px 22px rgba(45, 74, 124, 0.1);
}

/* карточка "в разработке" — приглушённая и некликабельная на вид */
.section-card--wip {
  cursor: default;
  opacity: 0.65;
}

.section-card--wip:hover {
  transform: none;
  box-shadow: none;
  border-color: rgba(45, 74, 124, 0.08);
}

.wip-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  font-weight: 600;
}

.icon-tile {
  width: 46px;
  height: 46px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--steel-soft);
  color: var(--steel);
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2b45;
  line-height: 1.3;
  margin-bottom: 6px;
}

.section-subtitle {
  font-size: 12.5px;
  color: #6b7a90;
  line-height: 1.4;
}
</style>
