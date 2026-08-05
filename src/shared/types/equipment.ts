export interface WeldingMethod {
  id: string;   // 'rad', 'mad', 'mp'...
  name: string;
  tpl: string;  // ключ шаблона карты в TPL — пригодится в конструкторе
}

export interface Equipment {
  id: number;
  name: string;
  method: string;  // ссылка на WeldingMethod.id
  shop?: string;   // цех — опционально (в прототипе есть не у всех)
}
