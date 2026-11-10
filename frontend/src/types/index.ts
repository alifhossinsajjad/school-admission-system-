export type HoldStatus = 'HELD' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';

export interface SchoolClass {
  id: string;
  name: string;
  totalSeats: number;
  heldSeats: number;
  confirmedSeats: number;
  availableSeats: number;
}

export interface CreateClassPayload {
  name: string;
  totalSeats: number;
}

export interface CreateClassResponse {
  id: string;
  name: string;
  totalSeats: number;
}

export interface CreateHoldResponse {
  holdId: string;
  classId: string;
  studentId: string;
  status: HoldStatus;
  expiresAt: string;
}

export interface HoldResponse {
  holdId: string;
  classId: string;
  status: HoldStatus;
  expiresAt: string;
}

export interface ConfirmHoldResponse {
  holdId: string;
  status: HoldStatus;
}

export interface StudentHold {
  holdId: string;
  classId: string;
  className: string;
  status: HoldStatus;
  expiresAt: string;
}

export interface ApiErrorResponse {
  status: number;
  error: string;
}

export type ViewType = 'classes' | 'my-applications' | 'admin';

export interface StudentProfile {
  id: string; // 17-digit National Birth Registration Number (BRN)
  name: string;
  avatarSeed?: string;
}

