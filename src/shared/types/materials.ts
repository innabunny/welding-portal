export interface MaterialGroup {
  id: number;
  code: string; // 'стали', 'титан'...
  wires: string[]; // допустимые проволоки
  fluxes: string[]; // допустимые флюсы
}

export interface Material {
  id: number;
  marka: string;
  groupId: number | null;
  groupCode: string | null;
  tensileStrength: number | null;
}
