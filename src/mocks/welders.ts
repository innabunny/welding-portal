// import type { Welder } from '@/shared/types/welders';

// // даты специально: один действует, один скоро истекает, один просрочен
// const today = new Date();
// const iso = (offsetDays: number) => {
//   const d = new Date(today);
//   d.setDate(d.getDate() + offsetDays);
//   // дата аттестации = «сегодня + offset − 1 год», чтобы срок (att+1год) пришёлся на нужное место
//   d.setFullYear(d.getFullYear() - 1);
//   return d.toISOString().slice(0, 10);
// };

// export const mockWelders: Welder[] = [
//   {
//     id: 1,
//     fio: 'Иванов И.И.',
//     workshopId: 1,
//     method: 'rad',
//     production: 'основное',
//     thFrom: 2,
//     thTo: 12,
//     certNo: 'УД-0142',
//     attDate: iso(200),
//     kind: 'periodic',
//     protocol: {},
//   },
//   {
//     id: 2,
//     fio: 'Петров П.П.',
//     workshopId: 2,
//     method: 'mp',
//     production: 'основное',
//     thFrom: 3,
//     thTo: 20,
//     certNo: 'УД-0143',
//     attDate: iso(45),
//     kind: 'periodic',
//     protocol: {}, // истекает через ~45 дн
//   },
//   {
//     id: 3,
//     fio: 'Сидоров С.С.',
//     workshopId: 1,
//     method: 'mad',
//     production: 'вспомогательное',
//     thFrom: 1,
//     thTo: 8,
//     certNo: 'УД-0121',
//     attDate: iso(-30),
//     kind: 'periodic',
//     protocol: {}, // просрочен на ~30 дн
//   },
// ];
