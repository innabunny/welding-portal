import type { WeldingCard } from '@/shared/types/weldingCard';

export const mockWeldingCards: WeldingCard[] = [

  {
    id: 1,
    detailNo: '105555',
    method: 'rad',
    tplKey: 'tig',
    equipment: 'УДГУ-351',
    cardNo: '001',
    oper: 'Сварка корневого шва',
    seam: 'Ш-1',
    job: '',
    detail: 'Обечайка Ø250',
    thickness: '8',
    values: {},
    passes: [],
    savedAt: new Date().toISOString().slice(0, 10),
    authorName: 'Петров П.П.',
    eskiz: null
  },
];
