<template>
  <q-dialog v-model="open">
    <q-card class="q-pa-lg" style="width: min(620px, 92vw)">
      <div class="no-print row justify-end q-pa-sm q-gutter-sm">
        <q-btn flat no-caps icon="save" label="Сохранить" color="primary" @click="save" />
        <q-btn flat no-caps icon="print" label="Печать" color="grey-8" @click="printDoc" />
        <q-btn flat no-caps icon="close" label="Закрыть" color="grey-7" v-close-popup />
      </div>

      <div v-if="welder" class="q-mx-auto" style="max-width: 520px">
        <div class="text-h6 text-center text-weight-medium">ПРОТОКОЛ<br />аттестации сварщика</div>
        <div  class="text-caption text-center text-grey-6 q-mb-md">Форма по ОСТ 92-1107</div>

        <!-- шапка из данных сварщика (не редактируется здесь) -->
        <div class="justify-between q-py-sm doc-line">
          <span class="text-grey-7">ФИО </span><b>{{ welder.fio }}</b>
        </div>
        <div class="row justify-between q-py-sm doc-line">
          <span class="text-grey-7">Цех / участок</span><span>{{ workshopName }}</span>
        </div>
        <div class="row justify-between q-py-sm doc-line">
          <span class="text-grey-7">Способ сварки</span><span>{{ methodName }}</span>
        </div>

        <!-- редактируемые поля протокола -->
        <div v-for="f in fields" :key="f.key" class="q-mt-sm">
          <q-input
            v-model="form[f.key]"
            :label="f.label"
            :type="f.date ? 'date' : 'text'"
            outlined
            dense
            :stack-label="f.date"
          />
        </div>

        <div class="text-caption text-grey-6 q-mt-lg">Подписи членов комиссии: ______________________</div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { Welder, AttestationProtocol } from '@/shared/types/welders';
import { useWorkshopStore } from '@/stores/workshop';
import { useEquipmentStore } from '@/stores/equipment';
import { useWeldersStore } from '@/stores/welders';

const props = defineProps<{ modelValue: boolean; welder: Welder | null }>();
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>();

const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) });
const workshopStore = useWorkshopStore();
const equipmentStore = useEquipmentStore();
const store = useWeldersStore();

const workshopName = computed(() => workshopStore.workshopName(props.welder?.workshopId ?? null));
const methodName = computed(() => equipmentStore.methodName(props.welder?.method ?? ''));

// список редактируемых полей протокола
const fields: { key: keyof AttestationProtocol; label: string; date?: boolean }[] = [
  { key: 'protNo', label: 'Протокол №' },
  { key: 'protDate', label: 'Дата протокола', date: true },
  { key: 'org', label: 'Предприятие' },
  { key: 'birth', label: 'Год рождения' },
  { key: 'rank', label: 'Разряд' },
  { key: 'stamp', label: 'Личное клеймо' },
  { key: 'area', label: 'Область распространения аттестации' },
  { key: 'material', label: 'Марка основного материала' },
  { key: 'joint', label: 'Тип сварного соединения' },
  { key: 'pos', label: 'Положение шва' },
  { key: 'cons', label: 'Сварочные материалы' },
  { key: 'vik', label: 'ВИК' },
  { key: 'rk', label: 'РК / УЗК' },
  { key: 'mech', label: 'Механические испытания' },
  { key: 'metal', label: 'Металлография' },
  { key: 'concl', label: 'Заключение' },
  { key: 'commission', label: 'Комиссия' },
];

const form = reactive<Record<string, string>>({});

// при открытии — залить значения протокола в форму
watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen || !props.welder) return;
    const p = props.welder.protocol || {};
    for (const f of fields) form[f.key] = p[f.key] ?? '';
  },
);

async function save() {
  if (!props.welder) return;
  const protocol: AttestationProtocol = {};
  for (const f of fields) protocol[f.key] = form[f.key] ?? '';
  await store.edit(props.welder.id, { protocol });
  open.value = false;
}
function printDoc() {
  window.print();
}
</script>

<style scoped>
.doc-line { border-bottom: 1px solid #eceef1; }
</style>
