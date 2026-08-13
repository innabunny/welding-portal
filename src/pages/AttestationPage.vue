<template>
  <q-page class="q-pa-lg">
    <div class="page-content">
      <div class="text-h6 text-weight-medium q-mb-md" style="color: var(--app-ink)">
        Аттестация сварщиков
      </div>

      <q-tabs
        v-model="tab"
        align="left"
        no-caps
        active-color="primary"
        indicator-color="primary"
        class="text-grey-7 q-mb-md"
      >
        <q-tab name="welders" label="Сварщики" />
        <q-tab name="registry" label="Реестр аттестаций" />
        <q-tab name="new" label="Новая аттестация" />
        <q-tab name="help" label="Как заполнять" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated class="bg-transparent">
        <q-tab-panel name="welders" class="q-pa-none">
          <WeldersTab />
        </q-tab-panel>

        <q-tab-panel name="registry" class="q-pa-none">
          <div class="text-grey-6">Реестр аттестаций — в работе.</div>
        </q-tab-panel>

        <q-tab-panel name="new" class="q-pa-none">
          <div class="text-grey-6">Новая аттестация — в работе.</div>
        </q-tab-panel>

        <q-tab-panel name="help" class="q-pa-none">
          <ProtocolHelp />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useWorkshopStore } from '@/stores/workshop';
import { useEquipmentStore } from '@/stores/equipment';
import ProtocolHelp from '@/components/attestation/ProtocolHelp.vue';
import WeldersTab from '@/components/attestation/welders/WeldersTab.vue';

const workshopStore = useWorkshopStore();
const equipmentStore = useEquipmentStore();

const tab = ref<'welders' | 'registry' | 'new' | 'help'>('welders');

onMounted(() => {
  // void store.fetchAll();
  void workshopStore.fetchAll(); // для имён цехов
  void equipmentStore.fetchAll(); // для имён способов сварки
});
</script>

<style scoped>
.attention {
  background: var(--app-bg);
  border: 1px solid var(--app-border);
  font-size: 13px;
}
.group-row {
  background: var(--app-bg);
  color: var(--app-ink);
  font-size: 13px;
  padding-top: 10px;
  padding-bottom: 6px;
}
</style>
