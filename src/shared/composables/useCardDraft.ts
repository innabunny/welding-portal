// shared/composables/useCardDraft.ts
import { computed } from 'vue';
import { useWeldingCardStore } from '@/stores/weldingCard';

export function useCardDraft() {
  const store = useWeldingCardStore();
  const draft = computed(() => {
    if (!store.draft) {
      throw new Error('Card component rendered without an active draft');
    }
    return store.draft;
  });
  return { store, draft };
}
