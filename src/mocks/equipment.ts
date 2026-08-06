import type { Equipment, WeldingMethod } from '@/shared/types/equipment';

export const mockMethods: WeldingMethod[] = [
  { id: 'rad', name: 'Ручная аргонодуговая сварка неплавящимся электродом', tpl: 'tig' },
  { id: 'mad', name: 'Механизированная аргонодуговая сварка неплавящимся электродом', tpl: 'orbital' },
  { id: 'mp', name: 'Механизированная сварка плавящимся электродом', tpl: 'mig' },
  { id: 'plasma', name: 'Механизированная плазменная сварка', tpl: 'plasma' },
  { id: 'ebw', name: 'Электронно-лучевая сварка', tpl: 'ebw' },
  { id: 'diff', name: 'Диффузионная сварка', tpl: 'diff' },
];

export const mockEquipment: Equipment[] = [
  { id: 1, name: 'УДГУ-351', method: 'rad', workshopId: 1 },
  { id: 2, name: 'УСГ-1800-1200-2000-КНВ', method: 'mad', workshopId: 3},
  { id: 3, name: 'ОДА-СП', method: 'mad', workshopId: 3 },
  { id: 4, name: 'ПДГ-508', method: 'mp', workshopId: 2 },
  { id: 5, name: 'УПС-301', method: 'plasma', workshopId: 1 },
  { id: 6, name: 'ЭЛУ-9Б', method: 'ebw', workshopId: 2 },
  { id: 7, name: 'СДВУ-50', method: 'diff', workshopId: 1},

];
