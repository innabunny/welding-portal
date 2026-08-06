import type { RefCategory, References } from '@/shared/types/reference';
import { mockReferences } from '@/mocks/references';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// глубокая копия, чтобы правки не мутировали мок
const data: References = JSON.parse(JSON.stringify(mockReferences));

export const referenceApi = {
  async getAll(): Promise<References> {
    await delay();
    return JSON.parse(JSON.stringify(data));
  },
  async addValue(cat: RefCategory, value: string): Promise<void> {
    await delay();
    if (!data[cat].includes(value)) data[cat].push(value);
  },
  async removeValue(cat: RefCategory, value: string): Promise<void> {
    await delay();
    data[cat] = data[cat].filter((v) => v !== value);
  },
};
