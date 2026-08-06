// поле левого столбца ка// поле левого столбца карты
export interface TemplateField {
  k: string;        // ключ значения (mat, wolfram, filler...)
  l?: string;       // подпись (может отсутствовать)
  v?: string;       // значение по умолчанию
  t?: 'mat';        // особый тип поля (сочетание материалов)
  pair?: number;    // рендерить в пару (подпись слева, поле справа)
}

// блок правого столбца (род тока, термообработка...)
export interface TemplateBlock {
  t: string;              // заголовок блока
  f: [string, string][];  // строки: [подпись, значение по умолчанию]
}

// группа колонок в таблице проходов
export interface TemplatePassGroup {
  g: string;      // заголовок группы (Параметры сварки, Газ...)
  c: string[];    // колонки внутри группы
}

// шаблон карты целиком (привязан к способу сварки)
export interface WeldingTemplate {
  name: string;               // название способа
  left: TemplateField[];      // левый столбец
  right: TemplateBlock[];     // правый столбец
  pass: TemplatePassGroup[];  // структура таблицы проходов
}

// способ сварки → ключ шаблона
export interface WeldingMethod {
  id: string;    // 'rad', 'mad', 'mp'...
  name: string;
  tpl: string;   // ключ в наборе шаблонов
}

export interface TemplateField {
  k: string; // ключ значения (mat, wolfram, filler...)
  l?: string; // подпись (может отсутствовать)
  v?: string; // значение по умолчанию
  t?: 'mat'; // особый тип поля (сочетание материалов)
  pair?: number; // рендерить в пару (подпись слева, поле справа)
}

// блок правого столбца (род тока, термообработка...)
export interface TemplateBlock {
  t: string; // заголовок блока
  f: [string, string][]; // строки: [подпись, значение по умолчанию]
}

// группа колонок в таблице проходов
export interface TemplatePassGroup {
  g: string; // заголовок группы (Параметры сварки, Газ...)
  c: string[]; // колонки внутри группы
}

// шаблон карты целиком (привязан к способу сварки)
export interface WeldingTemplate {
  name: string; // название способа
  left: TemplateField[]; // левый столбец
  right: TemplateBlock[]; // правый столбец
  pass: TemplatePassGroup[]; // структура таблицы проходов
}

// способ сварки → ключ шаблона
export interface WeldingMethod {
  id: string; // 'rad', 'mad', 'mp'...
  name: string;
  tpl: string; // ключ в наборе шаблонов
}
