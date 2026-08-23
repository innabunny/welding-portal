// протокол аттестации — 17 полей формы ОСТ 92-1107 (расширяемо)
export interface AttestationProtocol {
  protNo?: string; // Протокол №
  protDate?: string; // Дата протокола
  org?: string; // Предприятие
  birth?: string; // Год рождения
  rank?: string; // Разряд
  stamp?: string; // Личное клеймо
  area?: string; // Область распространения аттестации
  material?: string; // Марка основного материала
  joint?: string; // Тип сварного соединения
  pos?: string; // Положение шва
  cons?: string; // Сварочные материалы
  vik?: string; // ВИК
  rk?: string; // РК / УЗК
  mech?: string; // Механические испытания
  metal?: string; // Металлография
  concl?: string; // Заключение
  commission?: string; // Комиссия
}

export type AttestationKind = 'primary' | 'periodic'; // первичная / периодическая

export interface Welder {
  id: number;
  fio: string;
  birthDate: string | null; // ISO
  workshopId: number | null;
  workshopName: string | null; // read-only
  workshopNumber: string | null;  // read-only
  weldingSince: string | null; // ISO
  rank: string;
  isActive: boolean;
  age: number | null; // read-only, считается сервером
  experienceYears: number | null; // read-only, считается сервером
  isAttested: boolean;
  education: string;
}
