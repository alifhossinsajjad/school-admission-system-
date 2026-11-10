import { createContext } from 'react';
import type { StudentProfile, StudentHold } from '../types';

export interface StudentContextType {
  student: StudentProfile;
  setStudent: (student: StudentProfile) => void;
  setCustomStudent: (brn: string, name?: string) => boolean;
  demoStudents: StudentProfile[];
  myHolds: StudentHold[];
  isLoadingHolds: boolean;
  refreshMyHolds: () => Promise<void>;
  hasActiveHoldInClass: (classId: string) => boolean;
}

export const StudentContext = createContext<StudentContextType | undefined>(undefined);

