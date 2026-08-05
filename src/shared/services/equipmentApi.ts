import type { Equipment, WeldingMethod } from '../types/equipment';
import { mockEquipment, mockMethods } from '@/mocks/equipment';

// имитация задержки сети, чтобы был виден loading
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

let store = [...mockEquipment]; // локальная копия, чтобы правки не мутировали мок-массив

export const equipmentApi = {
  async list(): Promise<Equipment[]> {
    await delay();
    return [...store];
  },
  async methods(): Promise<WeldingMethod[]> {
    await delay();
    return [...mockMethods];
  },
  async create(data: Omit<Equipment, 'id'>): Promise<Equipment> {
    await delay();
    const item: Equipment = { ...data, id: Date.now() };
    store.push(item);
    return item;
  },
  async update(id: number, data: Partial<Equipment>): Promise<Equipment> {
    await delay();
    const idx = store.findIndex((e) => e.id === id);
    if (idx === -1) {
      throw new Error(`Оборудование с id=${id} не найдено`);
    }
    const updated: Equipment = { ...store[idx]!, ...data };
    store[idx] = updated;
    return updated;
  },
  async remove(id: number): Promise<void> {
    await delay();
    store = store.filter((e) => e.id !== id);
  },
};
