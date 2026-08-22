<template>
  <q-dialog v-model="open" maximized class="protocol-print-root">
    <q-card class="pd-card">
      <div class="pd-scroll">
        <div class="pd-sheet" ref="sheetRef">
          <ProtocolSheet
            :welder="welder"
            :method-name="methodName"
            :pairs="pairs"
            :protocol-no="protocolNo"
            :sign-date="signDate"
            :row-no="rowNo"
            :org-name="orgName"
            :members-count="membersCount"
            :material-label="materialLabel"
            :tensile-by-material="tensileByMaterial"
          />
        </div>
      </div>

      <q-card-actions align="right" class="no-print">
        <q-btn flat no-caps label="Закрыть" color="grey-7" v-close-popup />
        <q-btn
          unelevated
          no-caps
          icon="print"
          label="Печать"
          color="primary"
          @click="printProtocol"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ProtocolSheet from './ProtocolSheet.vue';
import type { MaterialPair } from '@/shared/types/attestation';
import type { Welder } from '@/shared/types/welders';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    welder: Welder | null;
    methodName: string;
    pairs: MaterialPair[];
    protocolNo?: string;
    signDate?: string | null;
    rowNo?: number;
    orgName?: string;
    membersCount?: number;
    materialLabel: (id: number | null) => string;
    tensileByMaterial?: (id: number | null) => string | number | null;
  }>(),
  {
    protocolNo: '',
    signDate: null,
    rowNo: 1,
    orgName: '',
    membersCount: 3,
    tensileByMaterial: () => null,
  },
);

const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>();
const sheetRef = ref<HTMLElement | null>(null);

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

function printProtocol() {
  const node = sheetRef.value;
  if (!node) return;

  // собираем все стили страницы — вместе с scoped-стилями ProtocolSheet
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n')
    // вырезаем ВСЕ @media print из основного приложения —
    // в окне печати они не нужны и только прячут содержимое
    .replace(/@media\s+print\s*\{(?:[^{}]|\{[^{}]*\})*\}/g, '');

  const w = window.open('', '_blank', 'width=1200,height=800');
  if (!w) return;

  w.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Протокол аттестации</title>
        ${styles}
         <style>
          @page { size: A4 landscape; margin: 8mm; }
          body { margin: 0; background: #fff; }
          </style>
      </head>
      <body>${node.innerHTML}</body>
    </html>
  `);

  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
    w.close();
  }, 300);
}
</script>

<style lang="scss" scoped>
.pd-scroll {
  flex: 1 1 auto;
  overflow: auto;
  background: #f0f0f0;
  padding: 16px;
}
.pd-sheet {
  width: 1400px;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
.pd-card {
  display: flex;
  flex-direction: column;
}
</style>
