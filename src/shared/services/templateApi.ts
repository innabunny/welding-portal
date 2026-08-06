import type { WeldingTemplate, WeldingMethod } from '@/shared/types/weldingTemplate';
import { WELDING_TEMPLATES, WELDING_METHODS } from '@/shared/config/weldingTemplates';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const templateApi = {
  async listMethods(): Promise<WeldingMethod[]> {
    await delay();
    return [...WELDING_METHODS];
  },
  // шаблон по ключу способа: method.tpl → WELDING_TEMPLATES[tpl]
  async getTemplate(tplKey: string): Promise<WeldingTemplate | null> {
    await delay();
    return WELDING_TEMPLATES[tplKey] ?? null;
  },
};
