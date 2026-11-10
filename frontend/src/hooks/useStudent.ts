import { useContext } from 'react';
import { StudentContext, type StudentContextType } from '../context/StudentContextDefinition';

export const useStudent = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
