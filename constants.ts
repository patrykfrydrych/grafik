import { User, Shift, Role, Leave } from './types';

export const USERS: User[] = [
  { id: 1, name: 'Jan Kowalski', email: 'admin@example.com', role: Role.Admin, avatarUrl: 'https://picsum.photos/id/1005/100/100', overtimeBalance: 0 },
  { id: 2, name: 'Anna Nowak', email: 'anna.nowak@example.com', role: Role.Employee, avatarUrl: 'https://picsum.photos/id/1011/100/100', overtimeBalance: 8 },
  { id: 3, name: 'Piotr Zieliński', email: 'piotr.zielinski@example.com', role: Role.Employee, avatarUrl: 'https://picsum.photos/id/1025/100/100', overtimeBalance: -4 },
  { id: 4, name: 'Ewa Wiśniewska', email: 'ewa.wisniewska@example.com', role: Role.Employee, avatarUrl: 'https://picsum.photos/id/1027/100/100', overtimeBalance: 12 },
  { id: 5, name: 'Marek Jankowski', email: 'marek.jankowski@example.com', role: Role.Employee, avatarUrl: 'https://picsum.photos/id/1028/100/100', overtimeBalance: 0 },
];

const today = new Date();
const getShiftDate = (dayOffset: number, hour: number, minutes: number = 0) => {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    date.setHours(hour, minutes, 0, 0);
    return date;
};

export const SHIFTS: Shift[] = [
  // Today
  { id: 1, userId: 2, startTime: getShiftDate(0, 8), endTime: getShiftDate(0, 16), position: 'Obsługa klienta', overtimeHours: 2 },
  { id: 2, userId: 3, startTime: getShiftDate(0, 9), endTime: getShiftDate(0, 17), position: 'Kasjer', overtimeHours: 0 },
  { id: 3, userId: 4, startTime: getShiftDate(0, 14), endTime: getShiftDate(0, 22), position: 'Magazynier', overtimeHours: 1 },
  
  // Tomorrow
  { id: 4, userId: 2, startTime: getShiftDate(1, 8), endTime: getShiftDate(1, 16), position: 'Obsługa klienta', overtimeHours: 0 },
  { id: 5, userId: 5, startTime: getShiftDate(1, 10), endTime: getShiftDate(1, 18), position: 'Manager sali', overtimeHours: 4 },
  
  // Day after tomorrow
  { id: 6, userId: 3, startTime: getShiftDate(2, 9), endTime: getShiftDate(2, 17), position: 'Kasjer', overtimeHours: 0 },
  { id: 7, userId: 4, startTime: getShiftDate(2, 12), endTime: getShiftDate(2, 20), position: 'Magazynier', overtimeHours: 0 },
  { id: 8, userId: 5, startTime: getShiftDate(2, 14), endTime: getShiftDate(2, 22), position: 'Manager sali', overtimeHours: 2 },

  // Yesterday
  { id: 9, userId: 4, startTime: getShiftDate(-1, 14), endTime: getShiftDate(-1, 22), position: 'Magazynier', overtimeHours: 0 },
  { id: 10, userId: 2, startTime: getShiftDate(-1, 8), endTime: getShiftDate(-1, 16), position: 'Obsługa klienta', overtimeHours: 1 },

  // +3 days
  { id: 11, userId: 3, startTime: getShiftDate(3, 9), endTime: getShiftDate(3, 17), position: 'Kasjer', overtimeHours: 0 },
  { id: 12, userId: 5, startTime: getShiftDate(3, 10), endTime: getShiftDate(3, 18), position: 'Manager sali', overtimeHours: 0 },
  
  // +4 days
  { id: 13, userId: 2, startTime: getShiftDate(4, 8), endTime: getShiftDate(4, 16), position: 'Obsługa klienta', overtimeHours: 3 },
  { id: 14, userId: 4, startTime: getShiftDate(4, 12), endTime: getShiftDate(4, 20), position: 'Magazynier', overtimeHours: 0 },
];

export const LEAVES: Leave[] = [
    // Example leave for next week
    // { id: 1, userId: 2, date: getShiftDate(7, 0) }
];