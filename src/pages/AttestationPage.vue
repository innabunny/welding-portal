<template>
  <q-page class="q-pa-lg">
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
      <q-tab name="periodic" label="Периодическая" />
      <q-tab name="primary" label="Первичная" />
      <q-tab name="help" label="Как заполнять" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <!-- ============ ПЕРИОДИЧЕСКАЯ: реестр ============ -->
      <q-tab-panel name="periodic" class="q-pa-none">
        <q-banner
          v-if="attention.overdue || attention.soon"
          dense
          rounded
          class="q-mb-md attention"
        >
          <template #avatar><q-icon name="warning_amber" color="orange-8" /></template>
          Требуют внимания:
          <b v-if="attention.overdue" class="text-red-8">просрочено {{ attention.overdue }}</b>
          <span v-if="attention.overdue && attention.soon">, </span>
          <b v-if="attention.soon" style="color: #8a6d2f">истекает {{ attention.soon }}</b>
          — пора переаттестовывать.
        </q-banner>

        <q-table
          :rows="sortedRows"
          :columns="columns"
          row-key="id"
          :loading="store.loading"
          flat
          bordered
          :rows-per-page-options="[0]"
          hide-pagination
        >
          <template #body="props">
            <!-- строка-заголовок цеха при смене группы -->
            <q-tr v-if="props.row.__groupStart" no-hover>
              <q-td colspan="100%" class="group-row">
                <q-icon name="factory" size="18px" class="q-mr-xs" color="grey-7" />
                <span class="text-weight-medium">{{ props.row.__group }}</span>
              </q-td>
            </q-tr>

            <q-tr :props="props">
              <q-td key="fio" :props="props" class="text-weight-medium">{{ props.row.fio }}</q-td>
              <q-td key="method" :props="props">{{
                equipmentStore.methodName(props.row.method)
              }}</q-td>
              <q-td key="thickness" :props="props">
                {{ props.row.thFrom ?? '' }}{{ props.row.thTo ? '–' + props.row.thTo : '' }}
              </q-td>
              <q-td key="attDate" :props="props">
                {{
                  props.row.attDate ? new Date(props.row.attDate).toLocaleDateString('ru-RU') : '—'
                }}
              </q-td>
              <q-td key="expDate" :props="props">{{ getExpiry(props.row.attDate).expDate }}</q-td>
              <q-td key="status" :props="props">
                <q-badge :style="chipStyle(props.row)">{{ chipLabel(props.row) }}</q-badge>
              </q-td>
              <q-td key="actions" :props="props" class="text-right" style="white-space: nowrap">
                <q-btn
                  flat
                  dense
                  no-caps
                  size="sm"
                  label="Продлить"
                  color="primary"
                  @click="renew(props.row)"
                />
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="description"
                  color="grey-7"
                  @click="openProtocol(props.row)"
                >
                  <q-tooltip>Протокол</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="badge"
                  color="grey-7"
                  @click="openCert(props.row)"
                >
                  <q-tooltip>Удостоверение</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="delete"
                  color="grey-6"
                  @click="removeWelder(props.row)"
                >
                  <q-tooltip>Удалить</q-tooltip>
                </q-btn>
              </q-td>
            </q-tr>
          </template>

          <template #no-data>
            <div class="full-width text-center text-grey-6 q-pa-md">
              Сварщиков пока нет — заведите на вкладке «Первичная».
            </div>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- ============ ПЕРВИЧНАЯ: форма нового ============ -->
      <q-tab-panel name="primary" class="q-pa-none">
        <q-card flat bordered style="max-width: 720px">
          <q-card-section class="text-subtitle1 text-weight-medium"
            >Первичная аттестация сварщика</q-card-section
          >
          <q-form @submit.prevent="submitPrimary">
            <q-card-section class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <q-input
                  class="col-12 col-sm-6"
                  v-model="form.fio"
                  label="ФИО"
                  outlined
                  dense
                  :rules="[(v: string) => !!v || 'Укажите ФИО']"
                />
                <q-select
                  class="col-12 col-sm-6"
                  v-model="form.workshopId"
                  label="Цех"
                  outlined
                  dense
                  :options="workshopOptions"
                  emit-value
                  map-options
                  clearable
                />
                <q-select
                  class="col-12 col-sm-6"
                  v-model="form.method"
                  label="Способ сварки"
                  outlined
                  dense
                  :options="methodOptions"
                  emit-value
                  map-options
                  :rules="[(v: string) => !!v || 'Выберите способ']"
                />
                <q-select
                  class="col-12 col-sm-6"
                  v-model="form.production"
                  label="Производство"
                  outlined
                  dense
                  :options="['основное', 'вспомогательное']"
                />
                <q-input
                  class="col-6 col-sm-3"
                  v-model.number="form.thFrom"
                  type="number"
                  label="Толщина от, мм"
                  outlined
                  dense
                />
                <q-input
                  class="col-6 col-sm-3"
                  v-model.number="form.thTo"
                  type="number"
                  label="Толщина до, мм"
                  outlined
                  dense
                />
                <q-input
                  class="col-12 col-sm-3"
                  v-model="form.certNo"
                  label="№ удостоверения"
                  outlined
                  dense
                />
                <q-input
                  class="col-12 col-sm-3"
                  v-model="form.attDate"
                  type="date"
                  label="Дата аттестации"
                  stack-label
                  outlined
                  dense
                />
              </div>

              <div class="text-subtitle2 text-weight-medium q-mt-md" style="color: var(--app-ink)">
                Результаты испытаний
              </div>
              <div class="row q-col-gutter-md">
                <q-input class="col-12 col-sm-6" v-model="proto.vik" label="ВИК" outlined dense />
                <q-input
                  class="col-12 col-sm-6"
                  v-model="proto.rk"
                  label="РК / УЗК"
                  outlined
                  dense
                />
                <q-input
                  class="col-12 col-sm-6"
                  v-model="proto.mech"
                  label="Механические испытания"
                  outlined
                  dense
                />
                <q-input
                  class="col-12 col-sm-6"
                  v-model="proto.metal"
                  label="Металлография"
                  outlined
                  dense
                />
                <q-input
                  class="col-12"
                  v-model="proto.concl"
                  label="Заключение (на что аттестован)"
                  outlined
                  dense
                />
                <q-input
                  class="col-12"
                  v-model="proto.commission"
                  label="Комиссия"
                  outlined
                  dense
                />
              </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn no-caps flat label="Очистить" color="grey-7" @click="resetForm" />
              <q-btn no-caps unelevated label="Аттестовать" type="submit" color="primary" />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-tab-panel>

      <q-tab-panel name="help" class="q-pa-none">
        <ProtocolHelp />
      </q-tab-panel>
    </q-tab-panels>

    <ProtocolDoc v-model="protocolOpen" :welder="selected" />
    <CertificateDoc v-model="certOpen" :welder="selected" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useWeldersStore } from '@/stores/welders';
import { useWorkshopStore } from '@/stores/workshop';
import { useEquipmentStore } from '@/stores/equipment';
import { getExpiry, STATUS_META } from '@/shared/composables/useAttestation';
import type { Welder, AttestationProtocol } from '@/shared/types/welders';
import ProtocolDoc from '@/components/attestation/ProtocolDoc.vue';
import CertificateDoc from '@/components/attestation/CertificateDoc.vue';
import ProtocolHelp from '@/components/attestation/ProtocolHelp.vue';

const $q = useQuasar();
const store = useWeldersStore();
const workshopStore = useWorkshopStore();
const equipmentStore = useEquipmentStore();

const tab = ref<'periodic' | 'primary'>('periodic');
const selected = ref<Welder | null>(null);
const protocolOpen = ref(false);
const certOpen = ref(false);

const columns: QTableColumn<Welder>[] = [
  { name: 'fio', label: 'ФИО', field: 'fio', align: 'left' },
  { name: 'method', label: 'Способ сварки', field: 'method', align: 'left' },
  { name: 'thickness', label: 'Толщины, мм', field: 'thFrom', align: 'left' },
  { name: 'attDate', label: 'Аттестован', field: 'attDate', align: 'left' },
  { name: 'expDate', label: 'Действует до', field: 'attDate', align: 'left' },
  { name: 'status', label: 'Статус', field: 'attDate', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

const sortedRows = computed(() => {
  const withGroup = store.items.map((w) => ({
    ...w,
    __group: w.workshopId ? workshopStore.workshopName(w.workshopId) : '(без цеха)',
  }));
  withGroup.sort((a, b) => a.__group.localeCompare(b.__group, 'ru'));

  let prev = '';
  return withGroup.map((w) => {
    const __groupStart = w.__group !== prev;
    prev = w.__group;
    return { ...w, __groupStart };
  });
});

const attention = computed(() => store.attention);
const workshopOptions = computed(() =>
  workshopStore.items.map((w) => ({ label: w.name, value: w.id })),
);
const methodOptions = computed(() =>
  equipmentStore.methods.map((m) => ({ label: m.name, value: m.id })),
);

// чипы статуса
const chipStyle = (w: Welder) => {
  const m = STATUS_META[getExpiry(w.attDate).status];
  return { backgroundColor: m.bg, color: m.fg, fontWeight: 500, padding: '4px 8px' };
};
const chipLabel = (w: Welder) => {
  const e = getExpiry(w.attDate);
  const m = STATUS_META[e.status];
  if (e.status === 'soon') return `${m.label} через ${e.days} дн`;
  if (e.status === 'overdue') return `${m.label} ${Math.abs(e.days!)} дн`;
  return m.label;
};

function openProtocol(w: Welder) {
  selected.value = w;
  protocolOpen.value = true;
}
function openCert(w: Welder) {
  selected.value = w;
  certOpen.value = true;
}

function renew(w: Welder) {
  $q.dialog({
    title: 'Продление аттестации',
    message: `Новая дата аттестации для «${w.fio}»:`,
    prompt: { model: new Date().toISOString().slice(0, 10), type: 'date' },
    cancel: true,
    persistent: true,
  }).onOk((date: string) => {
    void store
      .renew(w.id, date)
      .then(() => $q.notify({ type: 'positive', message: 'Аттестация продлена' }));
  });
}

function removeWelder(w: Welder) {
  $q.dialog({
    title: 'Удаление',
    message: `Удалить «${w.fio}»?`,
    cancel: true,
    persistent: true,
  }).onOk(() => void store.remove(w.id));
}

// форма первичной
const blank = () => ({
  fio: '',
  workshopId: null as number | null,
  method: '',
  production: 'основное' as 'основное' | 'вспомогательное',
  thFrom: null as number | null,
  thTo: null as number | null,
  certNo: '',
  attDate: new Date().toISOString().slice(0, 10),
});
const form = reactive(blank());
const proto = reactive<AttestationProtocol>({});

function resetForm() {
  Object.assign(form, blank());
  Object.keys(proto).forEach((k) => delete proto[k as keyof AttestationProtocol]);
}

async function submitPrimary() {
  await store.add({ ...form, kind: 'primary', protocol: { ...proto } });
  $q.notify({ type: 'positive', message: `Сварщик «${form.fio}» аттестован` });
  resetForm();
  tab.value = 'periodic'; // после аттестации показываем реестр
}

onMounted(() => {
  void store.fetchAll();
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
