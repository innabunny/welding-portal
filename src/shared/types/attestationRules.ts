export interface RuleSample {
  field: string;          // 'растяжение' | 'изгиб' | 'ударный_изгиб' | ...
  count: number;
  heatTreatment: boolean; // camelCase — мост сам преобразует из heat_treatment
}

export interface RuleRequiredOutput {
  controls: string[];     // ['вик', 'рк', ...]
  samples: RuleSample[];
}

export interface RuleMatchResult {
  matched: boolean;
  ruleId?: number;
  requiredOutput: RuleRequiredOutput | null;
}
