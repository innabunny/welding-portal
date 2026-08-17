export interface MaterialGroup {
  id: number;
  code: string;
}

export interface Material {
  id: number;
  marka: string;
  groupId: number | null;
  groupCode: string | null;
  tensileStrength: number | null;
}
