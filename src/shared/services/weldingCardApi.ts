import type { WeldingCard } from '@/shared/types/weldingCard';
import { mockWeldingCards } from '@/mocks/weldingCards';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
let store: WeldingCard[] = JSON.parse(JSON.stringify(mockWeldingCards));

export const weldingCardApi = {
  async list(): Promise<WeldingCard[]> {
    await delay();
    return JSON.parse(JSON.stringify(store));
  },
  async create(data: Omit<WeldingCard, 'id'>): Promise<WeldingCard> {
    await delay();
    const item: WeldingCard = { ...data, id: Date.now() };
    store.push(item);
    return { ...item };
  },
  async remove(id: number): Promise<void> {
    await delay();
    store = store.filter((c) => c.id !== id);
  },
  async update(id: number, data: Omit<WeldingCard, 'id'>): Promise<WeldingCard> {
    await delay();
    const idx = store.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Карта id=${id} не найдена`);
    store[idx] = { ...data, id };
    return { ...store[idx] };
  },
};
