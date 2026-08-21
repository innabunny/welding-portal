<template>
  <q-card flat bordered class="af-card">
    <q-card-section>
      <div class="af-row">
        <div class="af-field">
          <div class="af-label">Способ сварки</div>
          <q-select
            v-model="form.methodId"
            :options="methodOptions"
            emit-value
            map-options
            outlined
            dense
            placeholder="Выберите способ"
          />
        </div>

        <div class="af-field">
          <div class="af-label">Группа материала</div>
          <q-select
            v-model="form.groupId"
            :options="groupOptions"
            emit-value
            map-options
            outlined
            dense
            :disable="!form.methodId"
            placeholder="Сначала выберите способ"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useEquipmentStore } from '@/stores/equipment';
import { useMaterialsStore } from '@/stores/materials';



const equipmentStore = useEquipmentStore();
const materialsStore = useMaterialsStore();
const { methods } = storeToRefs(equipmentStore);
const { groups } = storeToRefs(materialsStore);

const form = reactive<{ methodId: string | null; groupId: number | null }>({
  methodId: null,
  groupId: null,
});

const methodOptions = computed(() => methods.value.map((m) => ({ label: m.name, value: m.id })));
const groupOptions = computed(() => groups.value.map((g) => ({ label: g.code, value: g.id })));

onMounted(() => {
  void materialsStore.fetchAll();
});
</script>

<style scoped lang="scss">
.af-card {
  background: var(--app-surface);
  border-radius: 14px;
}
.af-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.af-field {
  flex: 1 1 240px;
}
.af-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--app-ink-soft);
  margin-bottom: 6px;
}
.af-wrap {
  padding: 4px 2px;
}
.af-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.af-field {
  flex: 1 1 240px;
}
.af-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--app-ink-soft);
  margin-bottom: 6px;
}
</style>
