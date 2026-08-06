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
  workshopId: number | null; // ссылка на справочник цехов
  method: string; // id способа сварки
  production: 'основное' | 'вспомогательное';
  thFrom: number | null; // толщина от, мм
  thTo: number | null; // толщина до, мм
  certNo: string; // № удостоверения
  attDate: string; // дата аттестации (ISO)
  kind: AttestationKind; // как аттестован в последний раз
  protocol: AttestationProtocol;
}
