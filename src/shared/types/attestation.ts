export interface MaterialPair {
  id: number;
  sampleNo: string; // № образца/детали (руками)
  material1Id: number | null;
  material2Id: number | null;
  uniform: boolean; // 'однородный материал  material2 = material1'
  thicknessMin: number | null; // толщина от
  thicknessMax: number | null; // толщина до
  fluxValue: string | null; // марка флюса или null = «без флюса»
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
    wireValue: null,
    fluxValue: null,
    position: null,
    preheat: null,
    heatTreatment: null,
  };
}

export interface AttestationDraft {
  welderId: number;
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
    flux: string;
    position: string;
    preheat: string;
    heatTreatment: string;
  }[];
}

export interface AttestationListItem {
  id: number;
  welderId: number;
  methodId: string;
  groupId: number;
  controls: string[];
  status: string;
  createdAt: string; // ISO
  items: {
    id: number;
    sampleNo: string;
    material1: number;
    material2: number;
    uniform: boolean;
    thicknessMin: string | null; // приходит строкой ('1.0')
    thicknessMax: string | null;
    wire: string;
    flux: string;
    position: string;
    preheat: string;
    heatTreatment: string;
  }[];
}
