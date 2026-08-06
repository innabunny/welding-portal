import type { ServiceRequest } from '@/shared/types/serviceRequest';
import { mockServiceRequests } from '@/mocks/serviceRequest';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
let store: ServiceRequest[] = JSON.parse(JSON.stringify(mockServiceRequests));

export const serviceRequestApi = {
  async list(): Promise<ServiceRequest[]> {
    await delay();
    return JSON.parse(JSON.stringify(store));
  },
  async create(data: Omit<ServiceRequest, 'id'>): Promise<ServiceRequest> {
    await delay();
    const item: ServiceRequest = { ...data, id: Date.now() };
    store.push(item);
    return { ...item };
  },
  async update(id: number, data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    await delay();
    const idx = store.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Заявка id=${id} не найдена`);
    store[idx] = { ...store[idx]!, ...data };
    return { ...store[idx] };
  },
  async remove(id: number): Promise<void> {
    await delay();
    store = store.filter((r) => r.id !== id);
  },
};
