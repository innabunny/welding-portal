import type { User } from '@/shared/types/user';
import { mockUsers } from '@/mocks/users';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

let store: User[] = JSON.parse(JSON.stringify(mockUsers));

export const usersApi = {
  async list(): Promise<User[]> {
    await delay();
    return JSON.parse(JSON.stringify(store));
  },
  async authenticate(login: string, password: string): Promise<User | null> {
    await delay();
    const found = store.find((u) => u.login === login && u.password === password);
    return found ? { ...found } : null;
  },
  async create(data: Omit<User, 'id'>): Promise<User> {
    await delay();
    const item: User = { ...data, id: Date.now() };
    store.push(item);
    return { ...item };
  },
  async update(id: number, data: Partial<User>): Promise<User> {
    await delay();
    const idx = store.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error(`Пользователь id=${id} не найден`);
    const updated: User = {...store[idx]!, ...data};
    store[idx] = updated;
    return updated;
  },
  async remove(id: number): Promise<void> {
    await delay();
    store = store.filter((u) => u.id !== id);
  },
};
