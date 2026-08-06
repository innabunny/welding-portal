export type UserRole = 'admin' | 'technologist' | 'master' | 'mechanic';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Администратор',
  technologist: 'Технолог',
  master: 'Мастер',
  mechanic: 'Механик',
};

export interface User {
  id: number;
  login: string;
  password: string;
  name: string;
  role: UserRole;
  active: boolean;  // false = вход заблокирован
  workshopId?: number | null; 
}
