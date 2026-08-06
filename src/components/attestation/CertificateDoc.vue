<template>
  <q-dialog v-model="open">
    <q-card class="q-pa-lg" style="width: min(620px, 92vw)">
      <div class="no-print row justify-end q-gutter-sm q-mb-md">
        <q-btn flat no-caps icon="print" label="Печать" color="primary" @click="printDoc" />
        <q-btn flat no-caps icon="close" label="Закрыть" color="grey-7" v-close-popup />
      </div>

      <div v-if="welder" class="q-mx-auto" style="max-width: 520px">
        <div class="text-h6 text-center text-weight-medium">УДОСТОВЕРЕНИЕ СВАРЩИКА</div>
        <div class="text-caption text-center text-grey-6 q-mb-md">
          № {{ welder.certNo || '—' }} · ОСТ 92-1107
        </div>

        <div class="row justify-between q-py-sm doc-line">
          <span class="text-grey-7">Фамилия, имя, отчество</span>
          <span class="text-weight-medium">{{ welder.fio }}</span>
        </div>
        <div class="row justify-between q-py-sm doc-line">
          <span class="text-grey-7">Год рождения</span>
          <span>{{ welder.protocol.birth || '—' }}</span>
        </div>
        <div class="row justify-between q-py-sm doc-line">
          <span class="text-grey-7">Разряд</span>
          <span>{{ welder.protocol.rank || '—' }}</span>
        </div>
        <div class="row justify-between q-py-sm doc-line">
          <span class="text-grey-7">Личное клеймо</span>
          <span>{{ welder.protocol.stamp || '—' }}</span>
        </div>
        <div class="row justify-between q-py-sm doc-line">
          <span class="text-grey-7">Цех / участок</span>
          <span>{{ workshopName }}</span>
        </div>
        <div class="row justify-between q-py-sm doc-line">
          <span class="text-grey-7">Способ сварки</span>
          <span>{{ methodName }}</span>
        </div>
        <div class="row justify-between q-py-sm doc-line">
          <span class="text-grey-7">Толщины, мм</span>
          <span>{{ thickness }}</span>
        </div>
        <div class="row justify-between q-py-sm doc-line">
          <span class="text-grey-7">Производство</span>
          <span>{{ welder.production }}</span>
        </div>
        <div class="row justify-between q-py-sm doc-line">
          <span class="text-grey-7">Аттестован</span>
          <span>{{ attDate }}</span>
        </div>
        <div class="row justify-between q-py-sm doc-line">
          <span class="text-grey-7">Действителен до</span>
          <span class="text-weight-medium">{{ expiry.expDate }}</span>
        </div>

        <div class="text-caption text-grey-6 q-mt-lg">М.П.&nbsp;&nbsp; Подпись ______________</div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Welder } from '@/shared/types/welders';
import { getExpiry } from '@/shared/composables/useAttestation';
import { useWorkshopStore } from '@/stores/workshop';
import { useEquipmentStore } from '@/stores/equipment';

const props = defineProps<{ modelValue: boolean; welder: Welder | null }>();
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>();

const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) });
const workshopStore = useWorkshopStore();
const equipmentStore = useEquipmentStore();

const workshopName = computed(() => workshopStore.workshopName(props.welder?.workshopId ?? null));
const methodName = computed(() => equipmentStore.methodName(props.welder?.method ?? ''));
const thickness = computed(() => {
  const w = props.welder;
  if (!w) return '';
  return `${w.thFrom ?? ''}${w.thTo ? '–' + w.thTo : ''}`;
});
const attDate = computed(() =>
  props.welder?.attDate ? new Date(props.welder.attDate).toLocaleDateString('ru-RU') : '—',
);
const expiry = computed(() => getExpiry(props.welder?.attDate ?? ''));

function printDoc() {
  window.print();
}
</script>

<style scoped>
.doc-line {
  border-bottom: 1px solid #eceef1;
}
</style>
