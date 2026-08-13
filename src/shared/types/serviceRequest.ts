export type RequestReason = 'ремонт' | 'диагностика' | 'неисправность';
export type RequestPriority = 'низкая' | 'средняя' | 'высокая';
export type RequestStatus = 'новая' | 'в работе' | 'выполнена' | 'отменена';

export interface ServiceRequest {
  id: number;
  date: string; // дата подачи (ISO)
  equipmentId: number;
  equipmentName: string; // денормализованное имя — чтобы не резолвить постоянно
  workshopId: number | null;
  masterLogin: string; // кто подал
  masterName: string;
  reason: RequestReason;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  closedBy?: string | null; // кто перевёл в «выполнена» (имя механика)
  closedAt?: string | null; // когда закрыта (ISO-дата)
}
