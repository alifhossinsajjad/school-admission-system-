import React, { useState, useEffect, useCallback } from 'react';
import type { StudentProfile, StudentHold } from '../types';
import { api } from '../services/api';
import { isValidBRN } from '../utils';
import { DEMO_STUDENTS } from '../constants/students';
import { StudentContext } from './StudentContextDefinition';

const STORAGE_KEY = 'school_admission_current_student';

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudentState] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id && isValidBRN(parsed.id)) return parsed;
      } catch {
        // Fallback to default
      }
    }
    return DEMO_STUDENTS[0];
  });

  const [myHolds, setMyHolds] = useState<StudentHold[]>([]);
  const [isLoadingHolds, setIsLoadingHolds] = useState<boolean>(false);

  const setStudent = useCallback((newStudent: StudentProfile) => {
    setStudentState(newStudent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStudent));
  }, []);

  const setCustomStudent = useCallback((brn: string, name?: string): boolean => {
    const cleanBrn = brn.trim();
    if (!isValidBRN(cleanBrn)) {
      return false;
    }
    const newStudent: StudentProfile = {
      id: cleanBrn,
      name: name?.trim() || `Applicant (${cleanBrn.slice(-4)})`,
    };
    setStudent(newStudent);
    return true;
  }, [setStudent]);

  const refreshMyHolds = useCallback(async () => {
    if (!student.id) return;
    setIsLoadingHolds(true);
    try {
      const data = await api.getMyHolds(student.id);
      setMyHolds(data || []);
    } catch {
      setMyHolds([]);
    } finally {
      setIsLoadingHolds(false);
    }
  }, [student.id]);

  useEffect(() => {
    let isCurrent = true;
    if (!student.id) return;

    api.getMyHolds(student.id)
      .then((data) => {
        if (isCurrent) setMyHolds(data || []);
      })
      .catch(() => {
        if (isCurrent) setMyHolds([]);
      });

    return () => {
      isCurrent = false;
    };
  }, [student.id]);

  const hasActiveHoldInClass = useCallback((classId: string): boolean => {
    return myHolds.some(
      (h) => h.classId === classId && (h.status === 'HELD' || h.status === 'CONFIRMED')
    );
  }, [myHolds]);

  return (
    <StudentContext.Provider
      value={{
        student,
        setStudent,
        setCustomStudent,
        demoStudents: DEMO_STUDENTS,
        myHolds,
        isLoadingHolds,
        refreshMyHolds,
        hasActiveHoldInClass,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};
