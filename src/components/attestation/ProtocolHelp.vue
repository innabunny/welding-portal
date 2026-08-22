<template>
  <q-card flat bordered>
    <q-card-section class="row items-center q-gutter-sm">
      <q-icon name="help_outline" color="primary" size="22px" />
      <div>
        <div class="text-subtitle1 text-weight-medium">Как заполнять протокол</div>
        <div class="text-caption text-grey-7">Форма по ОСТ 92-1107</div>
      </div>
    </q-card-section>

    <q-separator />

    <q-list dense class="q-pt-md">
      <q-item v-for="row in help" :key="row.field" class="q-mb-sm">
        <q-item-section>
          <q-item-label class="text-weight-medium">{{ row.field }}</q-item-label>
          <q-item-label caption>{{ row.hint }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <q-banner
      dense
      class="q-ma-md"
      style="background: var(--status-soon-bg); color: var(--status-soon-fg); border-radius: 8px"
    >
      <template #avatar
        ><q-icon name="info" :style="{ color: 'var(--status-soon-fg)' }"
      /></template>
      Это ориентир по составу строк. Точную официальную форму и формулировки сверьте с действующим
      ОСТ 92-1107 — набор полей в редакторе протокола можно расширить под неё.
    </q-banner>
  </q-card>
</template>

<script setup lang="ts">
import { PROTOCOL_HELP } from '@/shared/composables/useAttestation';
const help = PROTOCOL_HELP;
</script>
