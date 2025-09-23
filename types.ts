export enum Role {
  Admin = 'Administrator',
  Employee = 'Pracownik',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  overtimeBalance: number;
}

export interface Shift {
  id: number;
  userId: number;
  startTime: Date;
  endTime: Date;
  position: string;
  overtimeHours: number;
}

export enum LeaveType {
  Wypoczynkowy = 'Urlop Wypoczynkowy',
  L4 = 'Zwolnienie Lekarskie (L4)',
  NaZadanie = 'Urlop na Żądanie',
  Okolicznosciowy = 'Urlop Okolicznościowy',
}

export interface Leave {
  id: number;
  userId: number;
  date: Date;
  type: LeaveType;
  overtimeCorrection: number; // Stores the exact value of overtime adjustment for easy reversal
}

export enum Page {
    Schedule = 'Grafik',
    Employees = 'Pracownicy'
}