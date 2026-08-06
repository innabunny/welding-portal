import type { Workshop } from '@/shared/types/workhop';
import { mockWorkshops } from '@/mocks/workshops';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
let store: Workshop[] = JSON.parse(JSON.stringify(mockWorkshops));

export const workshopApi = {
  async list(): Promise<Workshop[]> {
    await delay();
    return [...store];
  },
  async create(data: Omit<Workshop, 'id'>): Promise<Workshop> {
    await delay();
    const item: Workshop = { ...data, id: Date.now() };
    store.push(item);
    return { ...item };
  },
  async update(id: number, data: Partial<Workshop>): Promise<Workshop> {
    await delay();
    const idx = store.findIndex((w) => w.id === id);
    if (idx === -1) throw new Error(`Цех id=${id} не найден`);
    store[idx] = { ...store[idx]!, ...data };
    return { ...store[idx] };
  },
  async remove(id: number): Promise<void> {
    await delay();
    store = store.filter((w) => w.id !== id);
  },
};
