import React from 'react';
import { UserStatus } from '../types';
import { CheckCircle2, AlertTriangle, AlertCircle, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: UserStatus;
  weeks: number;
  disabled?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, weeks, disabled }) => {
  if (disabled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
        <Ban className="w-3.5 h-3.5" />
        Desactivado
      </span>
    );
  }

  switch (status) {
    case UserStatus.ACTIVE:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Activo ({weeks < 1 ? '< 1 semana' : `${weeks.toFixed(1)} sem`})
        </span>
      );
    case UserStatus.WARNING:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          Inactivo ({weeks.toFixed(1)} sem)
        </span>
      );
    case UserStatus.INACTIVE:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <AlertCircle className="w-3.5 h-3.5" />
          Crítico ({weeks === Infinity ? 'Nunca' : `${weeks.toFixed(1)} sem`})
        </span>
      );
    default:
      return null;
  }
};