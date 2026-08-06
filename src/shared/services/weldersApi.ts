import type { Welder } from '@/shared/types/welders';
import { mockWelders } from '@/mocks/welders';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
let store: Welder[] = JSON.parse(JSON.stringify(mockWelders));

export const weldersApi = {
  async list(): Promise<Welder[]> {
    await delay();
    return JSON.parse(JSON.stringify(store));
  },
  async create(data: Omit<Welder, 'id'>): Promise<Welder> {
    await delay();
    const item: Welder = { ...data, id: Date.now() };
    store.push(item);
    return { ...item };
  },
  async update(id: number, data: Partial<Welder>): Promise<Welder> {
    await delay();
    const idx = store.findIndex((w) => w.id === id);
    if (idx === -1) throw new Error(`Сварщик id=${id} не найден`);
    const updated: Welder = {...store[idx]!, ...data};
    store[idx] = updated;
    return updated;
  },
  async remove(id: number): Promise<void> {
    await delay();
    store = store.filter((w) => w.id !== id);
  },
};
