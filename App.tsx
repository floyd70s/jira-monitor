import React, { useState, useMemo, useEffect } from 'react';
import { generateMockUsers } from './services/geminiService';
import { JiraUser, UserWithStatus, UserStatus } from './types';
import { calculateWeeksSince, determineStatus, formatDate } from './utils/dateUtils';
import { DashboardStats } from './components/DashboardStats';
import { StatusBadge } from './components/StatusBadge';
import { 
  Search, 
  RefreshCw, 
  Filter, 
  ChevronDown, 
  Loader2, 
  LayoutDashboard,
  Trash2,
  Ban,
  CheckSquare,
  Square,
  MinusSquare
} from 'lucide-react';

const App: React.FC = () => {
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'ALL'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const processUsers = (rawUsers: JiraUser[]): UserWithStatus[] => {
    return rawUsers.map(user => {
      const weeks = calculateWeeksSince(user.lastLogin);
      return {
        ...user,
        weeksSinceLogin: weeks,
        status: determineStatus(weeks)
      };
    }).sort((a, b) => {
        // Sort by status priority (Red -> Yellow -> Green) then by weeks descending
        const statusOrder = { [UserStatus.INACTIVE]: 0, [UserStatus.WARNING]: 1, [UserStatus.ACTIVE]: 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }
        return b.weeksSinceLogin - a.weeksSinceLogin;
    });
  };

  const handleGenerateData = async () => {
    setLoading(true);
    setError(null);
    setSelectedIds(new Set()); // Reset selection on new data
    try {
      const rawUsers = await generateMockUsers();
      const processed = processUsers(rawUsers);
      setUsers(processed);
    } catch (err) {
      setError("Error al generar datos con Gemini. Por favor verifica tu API Key o intenta nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and status
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'ALL' || user.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, filterStatus]);

  // Selection Logic
  const handleSelectUser = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedIds(new Set());
    } else {
      const newSelected = new Set(filteredUsers.map(u => u.id));
      setSelectedIds(newSelected);
    }
  };

  // Updates the filter when a dashboard card is clicked
  const handleFilterChange = (status: UserStatus | 'ALL') => {
    setFilterStatus(status);
    setSelectedIds(new Set()); // Reset selection when changing views to avoid confusion
  };

  const handleDeleteSelected = () => {
    if (confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.size} usuarios?`)) {
      setUsers(users.filter(u => !selectedIds.has(u.id)));
      setSelectedIds(new Set());
    }
  };

  const handleDeactivateSelected = () => {
    setUsers(users.map(u => {
      if (selectedIds.has(u.id)) {
        return { ...u, disabled: true };
      }
      return u;
    }));
    setSelectedIds(new Set());
  };

  // Determine "Select All" checkbox state
  const isAllSelected = filteredUsers.length > 0 && selectedIds.size === filteredUsers.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < filteredUsers.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 text-white p-1.5 rounded-lg">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Gasco <span className="text-slate-500 font-medium">Jira Monitor</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
               <button 
                onClick={handleGenerateData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {users.length === 0 ? 'Generar Informe' : 'Regenerar Datos'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && users.length === 0 && !error && (
            <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutDashboard className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">No hay datos para mostrar</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Utiliza la inteligencia artificial de Gemini para generar un reporte simulado del estado de los usuarios de Jira en Gasco.
                </p>
                <button 
                    onClick={handleGenerateData}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5"
                >
                    <RefreshCw className="w-5 h-5" />
                    Generar Reporte IA
                </button>
            </div>
        )}

        {/* Dashboard Content */}
        {users.length > 0 && (
          <>
            <div className="mb-2">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">Resumen de Actividad</h2>
                <DashboardStats 
                  users={users.filter(u => !u.disabled)}
                  onFilterChange={handleFilterChange}
                  currentFilter={filterStatus}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
              
              {/* Conditional Header: Bulk Actions OR Filters */}
              {selectedIds.size > 0 ? (
                <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold">{selectedIds.size} seleccionados</span>
                        <div className="h-4 w-px bg-slate-700"></div>
                        <button 
                            onClick={() => setSelectedIds(new Set())}
                            className="text-xs text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white transition-all"
                        >
                            Cancelar selección
                        </button>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                            onClick={handleDeactivateSelected}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors border border-slate-600"
                        >
                            <Ban className="w-4 h-4" />
                            Desactivar
                        </button>
                        <button 
                            onClick={handleDeleteSelected}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                            Borrar
                        </button>
                    </div>
                </div>
              ) : (
                <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <h3 className="text-lg font-semibold text-slate-800">Usuarios Jira</h3>
                        <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
                        <span className="text-sm text-slate-500 hidden sm:block">{filteredUsers.length} mostrados</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Buscar usuario o email..." 
                                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select 
                                className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white w-full sm:w-48 cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value as any);
                                    setSelectedIds(new Set()); // Clear selection on manual filter change too
                                }}
                            >
                                <option value="ALL">Todos los estados</option>
                                <option value={UserStatus.ACTIVE}>🟢 Activos (&lt; 4 sem)</option>
                                <option value={UserStatus.WARNING}>🟡 Riesgo (4-6 sem)</option>
                                <option value={UserStatus.INACTIVE}>🔴 Inactivos (&gt; 6 sem)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        </div>
                    </div>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-medium">
                      <th className="px-6 py-4 w-12">
                         <button 
                            onClick={handleSelectAll}
                            className="flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                         >
                            {isAllSelected ? (
                                <CheckSquare className="w-5 h-5 text-red-600" />
                            ) : isIndeterminate ? (
                                <MinusSquare className="w-5 h-5 text-red-600" />
                            ) : (
                                <Square className="w-5 h-5" />
                            )}
                         </button>
                      </th>
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Rol / Dept</th>
                      <th className="px-6 py-4">Último Acceso</th>
                      <th className="px-6 py-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                            const isSelected = selectedIds.has(user.id);
                            return (
                                <tr 
                                    key={user.id} 
                                    className={`
                                        transition-colors cursor-pointer
                                        ${isSelected ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}
                                        ${user.disabled ? 'opacity-60 bg-slate-50/50 grayscale-[0.5]' : ''}
                                    `}
                                    onClick={() => handleSelectUser(user.id)}
                                >
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <button 
                                            onClick={() => handleSelectUser(user.id)}
                                            className="flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {isSelected ? (
                                                <CheckSquare className="w-5 h-5 text-red-600" />
                                            ) : (
                                                <Square className="w-5 h-5" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-slate-600 font-bold shrink-0 ${isSelected ? 'bg-red-200 text-red-700' : 'bg-slate-200'}`}>
                                            {user.fullName.charAt(0)}
                                            </div>
                                            <div>
                                            <div className="font-semibold text-slate-900">{user.fullName}</div>
                                            <div className="text-slate-500 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-900 font-medium">{user.role}</div>
                                        <div className="text-slate-500 text-xs">{user.department}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-700 font-medium">{formatDate(user.lastLogin)}</div>
                                        {user.lastLogin && (
                                            <div className="text-xs text-slate-400">
                                                hace {Math.floor(user.weeksSinceLogin)} semanas
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={user.status} weeks={user.weeksSinceLogin} disabled={user.disabled} />
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                No se encontraron usuarios que coincidan con los filtros.
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
                <span>Mostrando {filteredUsers.length} de {users.length} registros</span>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Activo</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Riesgo</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Inactivo</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Desactivado</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;