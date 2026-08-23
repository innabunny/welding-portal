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
        <q-tab name="orders" label="Заявки" />
        <q-tab name="help" label="Как заполнять" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated class="bg-transparent">
        <q-tab-panel name="welders" class="q-pa-none">
          <WeldersTab @attest="startAttestation" />
        </q-tab-panel>

        <q-tab-panel name="registry" class="q-pa-none">
          <RegistryTab />
        </q-tab-panel>

        <q-tab-panel name="new" class="q-pa-none">
          <AttestationForm :welder="attestTarget" :edit-item="editTarget" />
        </q-tab-panel>

        <q-tab-panel name="orders" class="q-pa-none">
          <OrdersTab @edit="startEdit" />
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
import AttestationForm from '@/components/attestation/attestation-form/AttestationForm.vue';
import type { Welder } from '@/shared/types/welders';
import OrdersTab from '@/components/attestation/OrdersTab.vue';
import type { AttestationListItem } from '@/shared/types/attestation';
import RegistryTab from '@/components/attestation/RegistryTab.vue';

const workshopStore = useWorkshopStore();
const equipmentStore = useEquipmentStore();

const tab = ref<'welders' | 'registry' | 'new' | 'orders' | 'help'>('welders');
const editTarget = ref<AttestationListItem | null>(null);

const attestTarget = ref<Welder | null>(null);
function startAttestation(w: Welder) {
  attestTarget.value = w;
  tab.value = 'new';
}

function startEdit(item: AttestationListItem) {
  editTarget.value = item;
  attestTarget.value = null;
  tab.value = 'new';
}

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
