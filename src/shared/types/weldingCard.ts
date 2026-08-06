export interface CardPass {
  no?: string; // № прохода
  [col: string]: string | undefined; // значения колонок (c0, c1...)
}

export interface WeldingCardDraft {
  id?: number | null,
  method: string; // id способа
  tplKey: string; // ключ шаблона
  equipment: string; // имя оборудования
  cardNo: string; // № карты
  oper: string; // операция
  seam: string; // шов №
  job: string;
  detail: string; // деталь/узел
  thickness: string; // толщина
  values: Record<string, string>; // значения полей формы (по ключам k / r_bi_pi)
  passes: CardPass[]; // проходы (этап C)
}

export interface WeldingCard extends WeldingCardDraft {
  id: number;
  savedAt: string;      // дата сохранения (ISO)
  authorName: string;   // кто создал
}
