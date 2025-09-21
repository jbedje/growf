import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/Modal';

interface DashboardStats {
  users: { total: number; admins: number; analysts: number; companies: number; };
  programs: { total: number; active: number; archived: number; draft: number; };
  applications: { total: number; pending: number; approved: number; rejected: number; };
  organizations: { total: number; active: number; pending: number; };
  budget: { total: number; used: number; available: number; };
  system: { uptime: number; cpu: number; memory: number; status: string; };
}

interface Activity {
  id: string;
  type: 'user_created' | 'application_approved' | 'program_launched' | 'system_alert' | 'budget_update';
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  user?: string;
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const BackofficeDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  // const isOrganization = user?.role === 'ORGANIZATION';

  // Simulate API calls - Replace with real API calls
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);

      // Mock dashboard stats
      const mockStats: DashboardStats = {
        users: { total: 1247, admins: 3, analysts: 12, companies: 1232 },
        programs: { total: 28, active: 21, archived: 7, draft: 4 },
        applications: { total: 842, pending: 24, approved: 672, rejected: 146 },
        organizations: { total: 45, active: 42, pending: 3 },
        budget: { total: 2800000, used: 1680000, available: 1120000 },
        system: { uptime: 99.2, cpu: 45, memory: 62, status: 'operational' }
      };

      // Mock activities
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'application_approved',
          message: 'Application approuvée pour TechStart SAS (Programme Innovation 2024)',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          user: 'Admin Jean Dupont'
        },
        {
          id: '2',
          type: 'user_created',
          message: 'Nouvel utilisateur COMPANY inscrit: GreenTech SARL',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          priority: 'low'
        },
        {
          id: '3',
          type: 'program_launched',
          message: 'Nouveau programme lancé: Aide Numérique TPE 2024',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          user: 'SUPERADMIN Marie Martin'
        },
        {
          id: '4',
          type: 'system_alert',
          message: 'Seuil d\'alerte budget atteint pour Programme Innovation (70%)',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          priority: 'critical'
        },
        {
          id: '5',
          type: 'budget_update',
          message: 'Budget Programme Écologique augmenté de 200,000€',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          user: 'SUPERADMIN Marie Martin'
        }
      ];

      // Mock alerts
      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Budget Programme Innovation',
          message: 'Seuil de 70% atteint (850,000€ / 1,200,000€)',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: '2',
          type: 'error',
          title: '5 comptes en attente de validation',
          message: 'Comptes en attente depuis plus de 48h - Action requise',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: '3',
          type: 'info',
          title: 'Mise à jour système disponible',
          message: 'Version 2.1.0 avec améliorations de sécurité',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          resolved: false
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setStats(mockStats);
      setActivities(mockActivities);
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const handleManualRefresh = () => {
    fetchDashboardData();
  };

  const handleMaintenanceMode = () => {
    alert('Mode maintenance activé - Système en cours de maintenance');
    setShowMaintenanceModal(false);
  };

  const handleBackupSystem = () => {
    alert('Sauvegarde système lancée - Notification envoyée par email');
    setShowBackupModal(false);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'user_created': return '👥';
      case 'application_approved': return '✅';
      case 'program_launched': return '🚀';
      case 'system_alert': return '⚠️';
      case 'budget_update': return '💰';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: Activity['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours === 1) return 'Il y a 1 heure';
    if (diffInHours < 24) return `Il y a ${diffInHours} heures`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Il y a 1 jour';
    return `Il y a ${diffInDays} jours`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Erreur lors du chargement des données</p>
        <Button onClick={handleManualRefresh} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className={`bg-white p-6 rounded-lg shadow-sm ${isSuperAdmin ? 'border-l-4 border-red-500' : ''}`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-2xl font-bold mb-2 ${isSuperAdmin ? 'text-red-900' : 'text-gray-900'}`}>
              {isSuperAdmin ? '🔥 SUPERADMIN Dashboard' : 'Tableau de bord - Backoffice'}
            </h1>
            <p className="text-gray-600">
              Bienvenue {user?.email} ({user?.role})
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Dernière mise à jour: {formatTimeAgo(new Date().toISOString())}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">24 heures</option>
              <option value="7d">7 jours</option>
              <option value="30d">30 jours</option>
              <option value="90d">90 jours</option>
            </select>

            {/* Refresh Button */}
            <Button
              onClick={handleManualRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              {refreshing ? '🔄' : '↻'} Actualiser
            </Button>

            {/* System Status */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-800 font-medium">Système opérationnel</span>
            </div>
          </div>
        </div>

        {isSuperAdmin ? (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-red-800 font-medium">
                ⚡ Accès complet au système - Gestion de tous les utilisateurs et configurations
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMaintenanceModal(true)}
                  className="text-xs"
                >
                  🔧 Maintenance
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowBackupModal(true)}
                  className="text-xs"
                >
                  💾 Sauvegarde
                </Button>
              </div>
            </div>
          </div>
        ) : isAdmin && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-blue-500 mr-2">🏢</span>
                <p className="text-sm text-blue-800 font-medium">
                  Gestion des entreprises et organisations externes - Pas d'accès aux utilisateurs internes
                </p>
              </div>
              <div className="text-sm text-blue-600 font-medium">
                Portée: Comptes externes uniquement
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isSuperAdmin ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/backoffice/users')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-lg text-white">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Utilisateurs Système</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.users.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Admins: {stats.users.admins} | Analystes: {stats.users.analysts}</p>
                  </div>
                </div>
                <div className="text-green-500 text-xs font-medium">
                  +{Math.floor(Math.random() * 10) + 1} cette semaine
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/backoffice/companies')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-lg text-white">🏢</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Organisations</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.organizations.total}</p>
                    <p className="text-xs text-gray-500">Actives: {stats.organizations.active} | En attente: {stats.organizations.pending}</p>
                  </div>
                </div>
                <div className="text-blue-500 text-xs font-medium">
                  {((stats.organizations.active / stats.organizations.total) * 100).toFixed(1)}% actives
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/backoffice/programs')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-lg text-white">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Programmes Total</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.programs.total}</p>
                    <p className="text-xs text-gray-500">Actifs: {stats.programs.active} | Archivés: {stats.programs.archived}</p>
                  </div>
                </div>
                <div className="text-purple-500 text-xs font-medium">
                  {stats.programs.draft} brouillons
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-lg text-white">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Budget Alloué</h3>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.budget.total)}</p>
                    <p className="text-xs text-gray-500">Utilisé: {formatCurrency(stats.budget.used)} ({Math.round((stats.budget.used / stats.budget.total) * 100)}%)</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 relative">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-300"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-green-500"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${(stats.budget.used / stats.budget.total) * 100}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">{Math.round((stats.budget.used / stats.budget.total) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional SUPERADMIN Cards */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/backoffice/applications')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-lg text-white">📋</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Applications Total</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.applications.total}</p>
                    <p className="text-xs text-gray-500">En attente: {stats.applications.pending} | Approuvées: {stats.applications.approved}</p>
                  </div>
                </div>
                <div className="text-yellow-500 text-xs font-medium">
                  {Math.round((stats.applications.approved / stats.applications.total) * 100)}% succès
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-lg text-white">⚙️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Performance Système</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.system.uptime}%</p>
                    <p className="text-xs text-gray-500">CPU: {stats.system.cpu}% | RAM: {stats.system.memory}%</p>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    stats.system.uptime > 99 ? 'bg-green-500' :
                    stats.system.uptime > 95 ? 'bg-yellow-500' : 'bg-red-500'
                  } animate-pulse`}></div>
                  <span className="text-xs text-gray-500 mt-1">{stats.system.status}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-teal-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-lg text-white">🎯</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Taux d'Approbation</h3>
                    <p className="text-2xl font-semibold text-gray-900">{Math.round((stats.applications.approved / (stats.applications.approved + stats.applications.rejected)) * 100)}%</p>
                    <p className="text-xs text-gray-500">Sur les {stats.applications.approved + stats.applications.rejected} traitées</p>
                  </div>
                </div>
                <div className="text-teal-500 text-xs font-medium">
                  +{Math.floor(Math.random() * 5) + 1}% ce mois
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-pink-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-lg text-white">📈</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Croissance</h3>
                    <p className="text-2xl font-semibold text-gray-900">+{Math.floor(Math.random() * 20) + 10}%</p>
                    <p className="text-xs text-gray-500">Nouvelles inscriptions ce mois</p>
                  </div>
                </div>
                <div className="text-green-500 text-xs font-medium flex items-center">
                  ↗️ Tendance positive
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/backoffice/companies')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">🏢</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Entreprises Actives</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.users.companies.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-blue-500 text-xs font-medium">
                  +{Math.floor(Math.random() * 15) + 8} cette semaine
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/backoffice/companies')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">🏭</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">PME & TPE</h3>
                    <p className="text-2xl font-semibold text-gray-900">{Math.floor(stats.users.companies * 0.78).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-purple-500 text-xs font-medium">
                  78% du total
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/backoffice/applications')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">📋</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Applications en attente</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.applications.pending}</p>
                  </div>
                </div>
                <div className="text-orange-500 text-xs font-medium">
                  Action requise
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/backoffice/applications')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Applications approuvées</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.applications.approved}</p>
                  </div>
                </div>
                <div className="text-green-500 text-xs font-medium">
                  +{Math.floor(Math.random() * 10) + 5} cette semaine
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/backoffice/organizations')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">🏛️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Organisations</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.organizations.total}</p>
                  </div>
                </div>
                <div className="text-teal-500 text-xs font-medium">
                  {stats.organizations.pending} en validation
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/backoffice/programs')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Programmes actifs</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.programs.active}</p>
                  </div>
                </div>
                <div className="text-indigo-500 text-xs font-medium">
                  {stats.programs.total} total
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Enhanced Quick Actions */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-red-900 flex items-center">
              <span className="mr-2">⚡</span>
              Actions Rapides SUPERADMIN
            </h3>
            <div className="text-sm text-red-700">
              {alerts.filter(alert => !alert.resolved).length} alertes non résolues
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <button
              onClick={() => navigate('/backoffice/users')}
              className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-red-200 hover:border-red-300 hover:scale-105"
            >
              <span className="mr-3 text-lg">👤</span>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Gestion Admins</p>
                <p className="text-xs text-gray-600">Utilisateurs internes</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/backoffice/programs')}
              className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-green-200 hover:border-green-300 hover:scale-105"
            >
              <span className="mr-3 text-lg">🚀</span>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Nouveau Programme</p>
                <p className="text-xs text-gray-600">Lancement rapide</p>
              </div>
            </button>

            <button
              onClick={() => setShowBackupModal(true)}
              className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-blue-200 hover:border-blue-300 hover:scale-105"
            >
              <span className="mr-3 text-lg">💾</span>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Sauvegarde</p>
                <p className="text-xs text-gray-600">Système complet</p>
              </div>
            </button>

            <button
              onClick={() => alert('Rapport d\'analytics généré et envoyé par email')}
              className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-purple-200 hover:border-purple-300 hover:scale-105"
            >
              <span className="mr-3 text-lg">📊</span>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Analytics</p>
                <p className="text-xs text-gray-600">Rapport global</p>
              </div>
            </button>

            <button
              onClick={() => setShowMaintenanceModal(true)}
              className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-orange-200 hover:border-orange-300 hover:scale-105"
            >
              <span className="mr-3 text-lg">🔧</span>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Maintenance</p>
                <p className="text-xs text-gray-600">Mode système</p>
              </div>
            </button>

            <button
              onClick={() => alert('Export de toutes les données lancé - Notification par email dès completion')}
              className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-teal-200 hover:border-teal-300 hover:scale-105"
            >
              <span className="mr-3 text-lg">📤</span>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Export Data</p>
                <p className="text-xs text-gray-600">Toutes données</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Activity Feed & System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isSuperAdmin ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <span className="mr-2">👥</span>
                  Gestion Utilisateurs
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/backoffice/users')}
                >
                  Voir tout →
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded border-l-4 border-red-500">
                  <div>
                    <p className="font-medium text-gray-900">Admins Actifs</p>
                    <p className="text-sm text-gray-600">3 administrateurs connectés</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">3</p>
                    <p className="text-xs text-green-600">+1 cette semaine</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <div>
                    <p className="font-medium text-gray-900">Analystes Actifs</p>
                    <p className="text-sm text-gray-600">12 analystes en ligne</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">12</p>
                    <p className="text-xs text-green-600">+2 cette semaine</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                  <div>
                    <p className="font-medium text-gray-900">Entreprises Nouvelles</p>
                    <p className="text-sm text-gray-600">Inscriptions cette semaine</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">47</p>
                    <p className="text-xs text-green-600">+12% vs semaine précédente</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <span className="mr-2">📊</span>
                  Métriques Système
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Temps réel
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Système opérationnel</p>
                    <p className="text-xs text-gray-500">Dernière vérification: Il y a 2 min</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '98%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Base de données</p>
                    <p className="text-xs text-gray-500">Performance: Optimale</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-3 h-3 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Charge serveur</p>
                    <p className="text-xs text-gray-500">CPU: 45% | RAM: 62%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '62%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <span className="mr-2">🏢</span>
                  Gestion Entreprises
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/backoffice/companies')}
                >
                  Voir tout →
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <div>
                    <p className="font-medium text-gray-900">Entreprises Actives</p>
                    <p className="text-sm text-gray-600">{stats.users.companies.toLocaleString()} comptes validés</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{stats.users.companies.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+{Math.floor(Math.random() * 20) + 10} cette semaine</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                  <div>
                    <p className="font-medium text-gray-900">PME & TPE</p>
                    <p className="text-sm text-gray-600">Petites et moyennes entreprises</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">{Math.floor(stats.users.companies * 0.78).toLocaleString()}</p>
                    <p className="text-xs text-blue-600">78% du total</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-teal-50 rounded border-l-4 border-teal-500">
                  <div>
                    <p className="font-medium text-gray-900">Organisations</p>
                    <p className="text-sm text-gray-600">Structures d'accompagnement</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-teal-600">{stats.organizations.active}</p>
                    <p className="text-xs text-orange-600">{stats.organizations.pending} en attente</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
                <div className="text-sm text-gray-500">
                  Dernière mise à jour: {formatTimeAgo(activities[0]?.timestamp || new Date().toISOString())}
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className={`flex items-start space-x-3 p-2 rounded-lg border ${getPriorityColor(activity.priority)}`}>
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-lg">{getActivityIcon(activity.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                        {activity.user && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            {activity.user}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Enhanced System Alerts & Budget Overview */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💰</span>
              Répartition des Budgets par Programme
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm font-medium">Programme Innovation 2024</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">850,000€</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '68%'}}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm font-medium">Aide Écologique 2024</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">620,000€</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '49%'}}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm font-medium">Subvention Numérique</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">420,000€</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '34%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <span className="mr-2">⚠️</span>
                Alertes Système
              </h3>
              <span className="text-sm text-gray-500">
                {alerts.filter(alert => !alert.resolved).length} non résolues
              </span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alerts.filter(alert => !alert.resolved).map((alert) => (
                <div key={alert.id} className={`flex items-start justify-between p-3 rounded-lg border ${
                  alert.type === 'error' ? 'bg-red-50 border-red-200' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      alert.type === 'error' ? 'bg-red-500' :
                      alert.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        alert.type === 'error' ? 'text-red-800' :
                        alert.type === 'warning' ? 'text-yellow-800' :
                        'text-blue-800'
                      }`}>{alert.title}</p>
                      <p className={`text-xs ${
                        alert.type === 'error' ? 'text-red-700' :
                        alert.type === 'warning' ? 'text-yellow-700' :
                        'text-blue-700'
                      }`}>{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(alert.timestamp)}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolveAlert(alert.id)}
                    className="text-xs"
                  >
                    ✓
                  </Button>
                </div>
              ))}

              {alerts.filter(alert => !alert.resolved).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-2xl mb-2 block">✨</span>
                  <p className="text-sm">Aucune alerte système</p>
                  <p className="text-xs text-gray-400">Tout fonctionne parfaitement</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      <ConfirmModal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        onConfirm={handleMaintenanceMode}
        title="Mode Maintenance"
        message="Êtes-vous sûr de vouloir activer le mode maintenance ? Cela rendra le système inaccessible aux utilisateurs."
        confirmText="Activer la maintenance"
        type="warning"
      />

      {/* Backup Modal */}
      <ConfirmModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onConfirm={handleBackupSystem}
        title="Sauvegarde Système"
        message="Lancer une sauvegarde complète du système ? Cette opération peut prendre plusieurs minutes."
        confirmText="Lancer la sauvegarde"
        type="info"
      />
    </div>
  );
};