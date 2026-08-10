import { defineRouter } from '#q-app';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
    routes: [
      {
        path: '/login',
        component: () => import('@/layouts/LoginLayout.vue'),
        children: [
          {
            path: '',
            component: () => import('@/pages/LoginPage.vue'),
          },
        ],
      },

      {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'), // ← оболочка со всем меню
        meta: { requiresAuth: true },
        children: [
          // всё, что здесь, рендерится внутри <router-view> MainLayout'а:
          { path: '', component: () => import('@/pages/DashboardPages.vue') }, // /
          {
            path: '/equipment',
            component: () => import('@/pages/EquipmentPage.vue'),
          },
           {
            path: '/references',
            component: () => import('@/pages/ReferencesPage.vue'),
          },
            {
            path: '/users',
            component: () => import('@/pages/UsersPage.vue'),
          },
           {
            path: '/certification',
            component: () => import('@/pages/AttestationPage.vue'),
          },
           {
            path: '/maintenance',
            component: () => import('@/pages/MaintenancePage.vue'),
          },
              {
            path: '/tech-process',
            component: () => import('@/pages/WeldingCard.Page.vue'),
          },
              {
            path: '/welding-cards',
            component: () => import('@/pages/WeldingCardsArchivePage.vue'),
          },
        ],
      },
      {
        path: '/:catchAll(.*)*',
        component: () => import('@/pages/ErrorNotFound.vue'),
      },
    ],
  });

  Router.beforeEach((to) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      return '/login';
    }
  });

  return Router;
});
