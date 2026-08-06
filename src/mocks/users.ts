import type { User } from '@/shared/types/user';

export const mockUsers: User[] = [
  { id: 1, login: 'admin', password: 'admin', name: 'Администратор', role: 'admin', active: true },
  {
    id: 2,
    login: 'tehnolog',
    password: '1234',
    name: 'Иванов И.И.',
    role: 'technologist',
    active: true,
    workshopId: 1,
  },
  {
    id: 3,
    login: 'master',
    password: '1234',
    name: 'Петров П.П.',
    role: 'master',
    active: true,
    workshopId: 2,
  },
  {
    id: 4,
    login: 'mehanik',
    password: '1234',
    name: 'Сидоров С.С.',
    role: 'mechanic',
    active: false,
    workshopId: 2,
  },
  {
    id: 5,
    login: 'technologist',
    password: '1234',
    name: 'Михайлов Д.С.',
    role: 'technologist',
    active: true,
    workshopId: 2,
  },
];
