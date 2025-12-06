import React from 'react';
import { UserWithStatus, UserStatus } from '../types';
import { Users, UserCheck, UserX, AlertOctagon } from 'lucide-react';

interface DashboardStatsProps {
  users: UserWithStatus[];
  onFilterChange: (status: UserStatus | 'ALL') => void;
  currentFilter: UserStatus | 'ALL';
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ users, onFilterChange, currentFilter }) => {
  const total = users.length;
  const active = users.filter(u => u.status === UserStatus.ACTIVE).length;
  const warning = users.filter(u => u.status === UserStatus.WARNING).length;
  const inactive = users.filter(u => u.status === UserStatus.INACTIVE).length;

  const StatCard = ({ title, count, total, colorClass, icon: Icon, filterType, activeRingClass }: any) => {
    const isActive = currentFilter === filterType;
    
    return (
      <button 
        onClick={() => onFilterChange(filterType)}
        className={`
            w-full text-left bg-white rounded-xl shadow-sm border transition-all duration-200 p-5 flex items-start justify-between group cursor-pointer outline-none active:scale-[0.99]
            ${isActive ? `ring-2 ring-offset-2 ${activeRingClass} border-transparent` : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}
        `}
      >
        <div>
          <p className="text-sm font-medium text-slate-500 group-hover:text-slate-700 mb-1 transition-colors">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-800">{count}</h3>
          {total > 0 && (
              <p className="text-xs text-slate-400 mt-2">
                  {Math.round((count / total) * 100)}% del total
              </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClass} transition-colors`}>
          <Icon className="w-6 h-6" />
        </div>
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        title="Total Usuarios" 
        count={total} 
        total={0} 
        colorClass="bg-slate-100 text-slate-600" 
        activeRingClass="ring-slate-400"
        icon={Users}
        filterType="ALL"
      />
      <StatCard 
        title="Activos (< 4 sem)" 
        count={active} 
        total={total} 
        colorClass="bg-green-100 text-green-600" 
        activeRingClass="ring-green-500"
        icon={UserCheck} 
        filterType={UserStatus.ACTIVE}
      />
      <StatCard 
        title="Riesgo (4-6 sem)" 
        count={warning} 
        total={total} 
        colorClass="bg-yellow-100 text-yellow-600" 
        activeRingClass="ring-yellow-400"
        icon={AlertOctagon} 
        filterType={UserStatus.WARNING}
      />
      <StatCard 
        title="Inactivos (> 6 sem)" 
        count={inactive} 
        total={total} 
        colorClass="bg-red-100 text-red-600" 
        activeRingClass="ring-red-500"
        icon={UserX} 
        filterType={UserStatus.INACTIVE}
      />
    </div>
  );
};