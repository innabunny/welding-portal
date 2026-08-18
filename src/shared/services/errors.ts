export function extractError(e: unknown, fallback = 'Что-то пошло не так'): string {
  // не объект — сразу fallback
  if (typeof e !== 'object' || e === null) return fallback;

  // нет поля response — считаем, что нет связи
  if (!('response' in e) || e.response == null) {
    return 'Нет связи с сервером. Проверьте подключение.';
  }

  const response = e.response as { status?: number; data?: unknown };
  const { status, data } = response;

  if (typeof data === 'string' && data.trim()) return data;

  if (data !== null && typeof data === 'object') {
    // DRF: { detail: "…" }
    if ('detail' in data && typeof data.detail === 'string') return data.detail;
    // DRF: { field: ["…"] } — берём первое сообщение
    const first = Object.values(data)[0];
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
    if (typeof first === 'string') return first;
  }

  if (typeof status === 'number') {
    if (status >= 500) return 'Ошибка на сервере. Попробуйте позже.';
    if (status === 403) return 'Недостаточно прав для этого действия.';
    if (status === 401) return 'Сессия истекла. Войдите заново.';
  }
  return fallback;
}
