// ключи категорий фиксированы — это не произвольные строки
export type RefCategory = 'materials' | 'wires' | 'gases' | 'electrodes' | 'fluxes';

// справочник целиком: категория → список марок
export type References = Record<RefCategory, string[]>;

// человекочитаемые заголовки категорий
export const REF_TITLES: Record<RefCategory, string> = {
  materials: 'Основные материалы',
  wires: 'Проволоки / присадки',
  gases: 'Защитные / плазмообразующие газы',
  electrodes: 'Вольфрамовые электроды',
  fluxes: 'Флюсы',
};
