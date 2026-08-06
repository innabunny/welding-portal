export interface ExpiryInfo {
  expDate: string; // дата окончания, локальная строка
  days: number | null; // сколько дней осталось (минус = просрочено)
  status: 'valid' | 'soon' | 'overdue' | 'none';
}

export function getExpiry(attDate: string): ExpiryInfo {
  if (!attDate) return { expDate: '—', days: null, status: 'none' };
  const d = new Date(attDate);
  d.setFullYear(d.getFullYear() + 1); // срок действия — год от аттестации
  const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  const status = days < 0 ? 'overdue' : days <= 60 ? 'soon' : 'valid';
  return { expDate: d.toLocaleDateString('ru-RU'), days, status };
}

// подписи и цвета статуса — переиспользуем в чипах таблицы
export const STATUS_META: Record<ExpiryInfo['status'], { label: string; bg: string; fg: string }> =
  {
    valid: { label: 'действует', bg: 'var(--status-valid-bg)', fg: 'var(--status-valid-fg)' },
    soon: { label: 'истекает', bg: 'var(--status-soon-bg)', fg: 'var(--status-soon-fg)' },
    overdue: {
      label: 'просрочено',
      bg: 'var(--status-overdue-bg)',
      fg: 'var(--status-overdue-fg)',
    },
    none: { label: 'нет даты', bg: 'var(--status-none-bg)', fg: 'var(--status-none-fg)' },
  };

  export const PROTOCOL_HELP: { field: string; hint: string }[] = [
  { field: 'Протокол № / дата', hint: 'Регистрационный номер и дата заседания аттестационной комиссии.' },
  { field: 'Предприятие', hint: 'Полное наименование организации.' },
  { field: 'ФИО, год рождения, разряд, клеймо', hint: 'Данные сварщика и его личное клеймо.' },
  { field: 'Способ сварки', hint: 'По классификации — тот, на который аттестуется.' },
  { field: 'Область распространения', hint: 'На что распространяется аттестация: марки, типы соединений, положения, диапазон толщин/диаметров.' },
  { field: 'Марка основного материала, толщина', hint: 'Материал и толщина контрольного соединения.' },
  { field: 'Тип соединения, положение шва', hint: 'Стыковое/угловое/тавровое; нижнее, вертикальное, потолочное и т.д.' },
  { field: 'Сварочные материалы', hint: 'Марка электрода/проволоки, защитный газ, флюс.' },
  { field: 'ВИК', hint: 'Результат визуально-измерительного контроля.' },
  { field: 'РК / УЗК', hint: 'Результат радиографического или ультразвукового контроля.' },
  { field: 'Механические испытания', hint: 'Изгиб, растяжение и т.п.: результат «годен / не годен».' },
  { field: 'Металлография', hint: 'При необходимости.' },
  { field: 'Заключение', hint: 'Итог: на какой способ, толщины и производство аттестован.' },
  { field: 'Комиссия', hint: 'Председатель и члены комиссии, подписи.' },
];
