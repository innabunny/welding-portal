import type { RequestPriority, RequestStatus } from '@/shared/types/serviceRequest';

export const PRIORITY_META: Record<RequestPriority, { bg: string; fg: string }> = {
  низкая: { bg: 'var(--status-valid-bg)', fg: 'var(--status-valid-fg)' },
  средняя: { bg: 'var(--status-soon-bg)', fg: 'var(--status-soon-fg)' },
  высокая: { bg: 'var(--status-overdue-bg)', fg: 'var(--status-overdue-fg)' },
};

export const STATUS_META: Record<RequestStatus, { bg: string; fg: string }> = {
  новая: { bg: 'var(--status-none-bg)', fg: 'var(--status-none-fg)' },
  'в работе': { bg: 'var(--status-soon-bg)', fg: 'var(--status-soon-fg)' },
  выполнена: { bg: 'var(--status-valid-bg)', fg: 'var(--status-valid-fg)' },
  отменена: { bg: '#eceff1', fg: '#78909c' },
};

export const REASONS = ['ремонт', 'диагностика', 'неисправность'] as const;
export const PRIORITIES = ['низкая', 'средняя', 'высокая'] as const;
export const STATUSES = ['новая', 'в работе', 'выполнена'] as const;
