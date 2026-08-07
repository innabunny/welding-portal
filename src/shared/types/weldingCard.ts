export interface CardPass {
  no?: string; // № прохода
  [col: string]: string | undefined; // значения колонок (c0, c1...)
}

export interface WeldEskiz { svg: string; params?: Record<string, unknown> }

export interface WeldingCardDraft {
  id?: number | null,
  detailNo: string,
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
  passes: WeldPass[]; // проходы (этап C)
    eskiz: WeldEskiz | null;
}

// export interface WeldPass {
//   no: string;            // № прохода
//   current: string;       // Сила тока, Iсв.
//   voltStart: string;     // Напряжение при старте
//   voltWeld: string;      // Напряжение при сварке
//   wireSpeed: string;     // Скорость подачи проволоки, Vпп
//   weldSpeedRpm: string;  // Скорость сварки, об/мин
//   weldSpeedMh: string;   // Скорость сварки, м/ч
//   oscA: string;          // Aколеб.
//   oscV: string;          // Vколеб.
//   t1: string;
//   t2: string;
//   gasHe: string;         // Гелий (Не) в горелку
//   gasAr: string;         // Аргон (Ar) на поддув
// }

export type WeldPass = { no?: string } & Record<`c${number}`, string>;

export interface WeldingCard extends WeldingCardDraft {
  id: number;
  savedAt: string;      // дата сохранения (ISO)
  authorName: string;   // кто создал
}
