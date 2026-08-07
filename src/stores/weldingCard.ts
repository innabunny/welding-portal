import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { WeldingMethod, WeldingTemplate } from '@/shared/types/weldingTemplate';
import type { WeldingCardDraft } from '@/shared/types/weldingCard';
import type { Equipment } from '@/shared/types/equipment';
import { templateApi } from '@/shared/services/templateApi';
import type { WeldingCard, WeldPass } from '@/shared/types/weldingCard';

function makePass(): WeldPass {
  return {};
}

export const useWeldingCardStore = defineStore('weldingCard', () => {
  const methods = ref<WeldingMethod[]>([]);
  const selectedMethod = ref<WeldingMethod | null>(null);
  const selectedEquipment = ref<Equipment | null>(null);
  const isFromArchive = ref(false);

  // активный шаблон и черновик карты
  const template = ref<WeldingTemplate | null>(null);
  const draft = ref<WeldingCardDraft | null>(null);

  async function loadMethods() {
    methods.value = await templateApi.listMethods();
  }
  function selectMethod(m: WeldingMethod | null) {
    selectedMethod.value = m;
    selectedEquipment.value = null;
  }
  function selectEquipment(e: Equipment | null) {
    selectedEquipment.value = e;
  }

  function passColCount(): number {
    if (!template.value) return 0;
    return template.value.pass.reduce((sum, g) => sum + g.c.length, 0);
  }

  function addPass() {
    if (!draft.value) return;
    draft.value.passes.push(makePass());
  }

  function removePass(index: number) {
    if (!draft.value) return;
    draft.value.passes.splice(index, 1);
  }

  const canStart = () => !!selectedMethod.value && !!selectedEquipment.value;

  // развернуть черновик по шаблону выбранного способа
  async function startCard() {
    if (!selectedMethod.value || !selectedEquipment.value) return;
    const tpl = await templateApi.getTemplate(selectedMethod.value.tpl);
    if (!tpl) return;

    template.value = tpl;
    isFromArchive.value = false;

    // заполняем values дефолтами из шаблона
    const values: Record<string, string> = {};
    tpl.left.forEach((f) => {
      if (f.v != null) values[f.k] = f.v;
    });
    tpl.right.forEach((blk, bi) =>
      blk.f.forEach((pair, pi) => {
        values[`r_${bi}_${pi}`] = pair[1] ?? '';
      }),
    );

    draft.value = {
      method: selectedMethod.value.id,
      tplKey: selectedMethod.value.tpl,
      equipment: selectedEquipment.value.name,
      detailNo: '',
      cardNo: '',
      oper: '',
      seam: '',
      job: '',
      detail: '',
      thickness: '',
      values,
      passes: [makePass(), makePass()],
      eskiz: null,
    };
  }

  function resetCard() {
    template.value = null;
    draft.value = null;
    isFromArchive.value = false;
    // selectedMethod.value = null;
    // selectedEquipment.value = null;
  }

  async function openCard(card: WeldingCard) {
    const tpl = await templateApi.getTemplate(card.tplKey);
    if (!tpl) return;
    template.value = tpl;
    // клонируем, чтобы правки в конструкторе не меняли архив напрямую
    draft.value = JSON.parse(JSON.stringify(card));
    isFromArchive.value = true;
  }

  return {
    methods,
    selectedMethod,
    selectedEquipment,
    template,
    draft,
    loadMethods,
    selectMethod,
    selectEquipment,
    canStart,
    startCard,
    resetCard,
    passColCount,
    addPass,
    removePass,
    openCard,
    isFromArchive,
  };
});
