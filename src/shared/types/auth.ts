export interface User {
  id: number;
  login: string;
  role: 'admin' | 'user';
  name?: string;
}

export interface Credentials {
  login: string;
  password: string;
}
