<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-md">
      <div class="text-h6 text-weight-medium" style="color: var(--app-ink)">
        Архив технологических карт
      </div>
      <q-space />
      <q-btn unelevated no-caps icon="add" label="Новая карта" color="primary" @click="goNew" />
    </div>

    <q-table
      :rows="archive.items"
      :columns="columns"
      row-key="id"
      :loading="archive.loading"
      :filter="search"
      flat
      bordered
      :rows-per-page-options="[10, 20, 50, 0]"
    >
      <template #top-left>
        <q-input
          v-model="search"
          dense
          outlined
          debounce="300"
          placeholder="Поиск по №, детали, оборудованию"
          style="min-width: 300px"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </template>

      <!-- способ показываем именем -->
      <template #body-cell-method="props">
        <q-td :props="props">{{ methodName(props.row.method) }}</q-td>
      </template>

      <template #body-cell-savedAt="props">
        <q-td :props="props">{{ new Date(props.row.savedAt).toLocaleDateString('ru-RU') }}</q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="visibility"
            color="grey-7"
            @click="openCard(props.row)"
          >
            <q-tooltip>Открыть</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="delete"
            color="grey-6"
            @click="removeCard(props.row)"
          >
            <q-tooltip>Удалить</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width text-center text-grey-6 q-pa-md">
          Сохранённых карт нет. Создайте первую в «Разработке техкарты».
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, type QTableColumn } from 'quasar';
import { useWeldingCardsArchiveStore } from '@/stores/weldingCardsArchive';
import { useWeldingCardStore } from '@/stores/weldingCard';
import type { WeldingCard } from '@/shared/types/weldingCard';

const $q = useQuasar();
const router = useRouter();
const archive = useWeldingCardsArchiveStore();
const cardStore = useWeldingCardStore();

const search = ref('');

const columns: QTableColumn<WeldingCard>[] = [
  { name: 'cardNo', label: '№ карты', field: 'cardNo', align: 'left', sortable: true },
  { name: 'detail', label: 'Деталь', field: 'detail', align: 'left', sortable: true },
  { name: 'method', label: 'Способ сварки', field: 'method', align: 'left', sortable: true },
  { name: 'equipment', label: 'Оборудование', field: 'equipment', align: 'left', sortable: true },
  { name: 'thickness', label: 'Толщина, мм', field: 'thickness', align: 'left', sortable: true },
  { name: 'savedAt', label: 'Сохранена', field: 'savedAt', align: 'left', sortable: true },
  { name: 'authorName', label: 'Автор', field: 'authorName', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

const methodName = (id: string) => cardStore.methods.find((m) => m.id === id)?.name ?? id;

function goNew() {
  cardStore.resetCard();
  void router.push('/tech-process');
}

async function openCard(card: WeldingCard) {
  await cardStore.openCard(card);
  void router.push('/tech-process'); // конструктор покажет загруженный draft
}

function removeCard(card: WeldingCard) {
  $q.dialog({
    title: 'Удаление',
    message: `Удалить карту №${card.cardNo}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void archive
      .remove(card.id)
      .then(() => $q.notify({ type: 'positive', message: 'Карта удалена' }));
  });
}

onMounted(() => {
  void archive.fetchAll();
  void cardStore.loadMethods(); // для methodName
});
</script>
