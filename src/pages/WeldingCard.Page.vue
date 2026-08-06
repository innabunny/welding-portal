<template>
  <q-page class="q-pa-lg">
    <div class="text-h6 text-weight-medium q-mb-md" style="color: var(--app-ink)">
      Разработка технологической карты
    </div>
    <template v-if="!cardStore.draft">
      <q-card flat bordered style="max-width: 720px">
        <q-card-section class="q-gutter-md">
          <!-- шаг 1: способ сварки -->
          <q-select
            v-model="method"
            label="Способ сварки"
            outlined
            :options="cardStore.methods"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            @update:model-value="onMethodChange"
          />

          <!-- шаг 2: оборудование этого способа -->
          <template v-if="method">
            <div class="text-subtitle2 text-grey-7">Оборудование</div>
            <div v-if="equipmentForMethod.length" class="eq-grid">
              <q-card
                v-for="eq in equipmentForMethod"
                :key="eq.id"
                flat
                bordered
                class="eq-card"
                :class="{ 'eq-card--sel': cardStore.selectedEquipment?.id === eq.id }"
                @click="cardStore.selectEquipment(eq)"
              >
                <div class="text-weight-medium">{{ eq.name }}</div>
                <div class="text-caption text-grey-6">{{ methodName }}</div>
              </q-card>
            </div>
            <q-banner v-else rounded class="warn-banner">
              <template #avatar><q-icon name="info" color="orange-8" /></template>
              Нет оборудования для этого способа. Добавьте его в разделе «Оборудование».
            </q-banner>
          </template>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            unelevated
            no-caps
            label="Начать карту"
            color="primary"
            :disable="!cardStore.canStart()"
            @click="startCard"
          />
        </q-card-actions>
      </q-card>
    </template>

    <template v-else>
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-weight-medium" style="color: var(--app-ink)">
          Карта · {{ cardStore.draft.equipment }}
        </div>
        <q-space />
        <q-btn
          v-if="cardStore.isFromArchive"
          flat
          no-caps
          icon="arrow_back"
          label="В архив"
          color="grey-7"
          class="q-mr-sm"
          @click="backToArchive"
        />
        <q-btn
          v-else
          flat
          no-caps
          icon="arrow_back"
          label="К выбору"
          color="grey-7"
          @click="cardStore.resetCard()"
        />
        <q-btn
          unelevated
          no-caps
          icon="save"
          label="Сохранить"
          color="primary"
          :loading="saving"
          @click="saveCard"
        />
      </div>
      <CardConstructor />
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useWeldingCardStore } from '@/stores/weldingCard';
import { useEquipmentStore } from '@/stores/equipment';
import { useAuthStore } from '@/stores/auth';
import { useWeldingCardsArchiveStore } from '@/stores/weldingCardsArchive';
import CardConstructor from '@/components/weldingCard/CardConstructor.vue';

const cardStore = useWeldingCardStore();
const equipmentStore = useEquipmentStore();
const $q = useQuasar();
const auth = useAuthStore();
const archive = useWeldingCardsArchiveStore();
const saving = ref(false);
const router = useRouter();

const method = computed({
  get: () => cardStore.selectedMethod?.id ?? null,
  set: (id: string | null) => {
    const m = id ? (cardStore.methods.find((x) => x.id === id) ?? null) : null;
    cardStore.selectMethod(m);
  },
});

// оборудование выбранного способа (у оборудования method = id способа)
const equipmentForMethod = computed(() =>
  method.value ? equipmentStore.items.filter((e) => e.method === method.value) : [],
);

const methodName = computed(() => cardStore.methods.find((m) => m.id === method.value)?.name ?? '');

function onMethodChange(id: string) {
  const m = cardStore.methods.find((x) => x.id === id) ?? null;
  cardStore.selectMethod(m);
}

async function startCard() {
  await cardStore.startCard(); // разворачивает draft по шаблону
}

async function saveCard() {
  const draft = cardStore.draft;
  if (!draft) return;

  // минимальная проверка — номер карты обязателен
  if (!draft.cardNo.trim()) {
    $q.notify({ type: 'warning', message: 'Укажите номер карты' });
    return;
  }

  saving.value = true;
  try {
    const { id, ...cardData } = draft;
    const payload = {
      ...cardData,
      savedAt: new Date().toISOString().slice(0, 10),
      authorName: auth.user?.name ?? '',
    };
    const cameFromArchive = cardStore.isFromArchive;
    if (id != null) {
      await archive.update(id, payload);
      $q.notify({ type: 'positive', message: `Карта №${draft.cardNo} обновлена` });
    } else {
      await archive.save(payload);
      $q.notify({ type: 'positive', message: `Карта №${draft.cardNo} сохранена` });
    }
    cardStore.resetCard();
    if (cameFromArchive) void router.push('/welding-cards');
  } finally {
    saving.value = false;
  }
}

function backToArchive() {
  cardStore.resetCard();
  void router.push('/welding-cards'); // на страницу архива
}

onMounted(() => {
  void cardStore.loadMethods();
  void equipmentStore.fetchAll();
});
</script>

<style scoped>
.eq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}
.eq-card {
  padding: 12px 14px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.eq-card:hover {
  border-color: var(--q-primary);
}
.eq-card--sel {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 1px var(--q-primary);
  background: var(--status-valid-bg);
}
.warn-banner {
  background: var(--status-soon-bg);
  color: var(--status-soon-fg);
}
</style>
