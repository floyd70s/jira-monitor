import { UserStatus } from '../types';
import { WEEKS_ACTIVE_THRESHOLD, WEEKS_WARNING_THRESHOLD } from '../constants';

export const calculateWeeksSince = (dateString: string | null): number => {
  if (!dateString) return Infinity;
  
  const now = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffWeeks = diffTime / (1000 * 60 * 60 * 24 * 7);
  
  return diffWeeks;
};

export const determineStatus = (weeks: number): UserStatus => {
  if (weeks < WEEKS_ACTIVE_THRESHOLD) {
    return UserStatus.ACTIVE;
  } else if (weeks >= WEEKS_ACTIVE_THRESHOLD && weeks <= WEEKS_WARNING_THRESHOLD) {
    return UserStatus.WARNING;
  } else {
    return UserStatus.INACTIVE;
  }
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Nunca ha iniciado sesión';
  return new Date(dateString).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
