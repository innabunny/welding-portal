export interface MaterialPair {
  id: number;
  sampleNo: string; // № образца/детали (руками)
  material1Id: number | null;
  material2Id: number | null;
  uniform: boolean; // 'однородный материал  material2 = material1'
  thicknessMin: number | null; // толщина от
  thicknessMax: number | null; // толщина до
  fluxValue: string | null; // марка флюса или null = «без флюса»
  gasValue: string | null; // защитный газ
  wireValue: string | null; // электрод/проволока из наборов группы
  position: string | null; // положение шва
  preheat: string | null; // подогрев
  heatTreatment: string | null;
}

let seq = 0;

export function blankPair(): MaterialPair {
  return {
    id: ++seq,
    sampleNo: '',
    material1Id: null,
    material2Id: null,
    uniform: false,
    thicknessMin: null,
    thicknessMax: null,
    gasValue: null,
    wireValue: null,
    fluxValue: null,
    position: null,
    preheat: null,
    heatTreatment: null,
  };
}

export interface AttestationDraft {
  welderId: number;
  kind: AttestationKind;
  methodId: string; // id способа — строковый ('rad', 'mad'...)
  groupId: number;
  controls: string[];
  items: {
    sampleNo: string;
    material1: number;
    material2: number;
    uniform: boolean;
    thicknessMin: number | null;
    thicknessMax: number | null;
    wire: string;
    gas: string;
    flux: string;
    position: string;
    preheat: string;
    heatTreatment: string;
  }[];
}

export type ExpiryState = '' | 'valid' | 'soon' | 'expired';

export const EXPIRY_META: Record<Exclude<ExpiryState, ''>, { color: string; label: string }> = {
  valid: { color: 'positive', label: 'Действует' },
  soon: { color: 'warning', label: 'Истекает' },
  expired: { color: 'negative', label: 'Просрочена' },
};
export interface AttestationListItem {
  id: number;
  welderId: number;
  kind: AttestationKind;
  methodId: string;
  groupId: number;
  controls: string[];
  status: string;
  createdAt: string; // ISO
  attestedAt: string | null;
  validUntil: string | null;
  protocolNo: string;
  certificateNo: string;
  expiryState: ExpiryState;
  items: {
    id: number;
    sampleNo: string;
    material1: number;
    material2: number;
    uniform: boolean;
    thicknessMin: string | null; // приходит строкой ('1.0')
    thicknessMax: string | null;
    wire: string;
    gas: string;
    flux: string;
    position: string;
    preheat: string;
    heatTreatment: string;
  }[];
}

export type AttestationKind = 'первичная' | 'периодическая';

export const KIND_OPTIONS: { label: string; value: AttestationKind }[] = [
  { label: 'Первичная', value: 'первичная' },
  { label: 'Периодическая', value: 'периодическая' },
];
