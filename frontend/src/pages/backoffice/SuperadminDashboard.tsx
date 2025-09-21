import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

interface SuperadminStats {
  users: { total: number; admins: number; analysts: number; companies: number; organizations: number; };
  applications: { total: number; pending: number; approved: number; rejected: number; };
  programs: { total: number; active: number; archived: number; draft: number; };
  organizations: { total: number; active: number; pending: number; };
  system: { uptime: number; cpu: number; memory: number; status: string; };
  budget: { total: number; used: number; available: number; };
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const SuperadminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SuperadminStats | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  const fetchSuperadminData = async () => {
    try {
      setLoading(true);

      // Mock superadmin stats
      const mockStats: SuperadminStats = {
        users: { total: 234, admins: 8, analysts: 12, companies: 189, organizations: 25 },
        applications: { total: 1247, pending: 89, approved: 876, rejected: 282 },
        programs: { total: 45, active: 32, archived: 8, draft: 5 },
        organizations: { total: 25, active: 22, pending: 3 },
        system: { uptime: 99.8, cpu: 45, memory: 67, status: 'healthy' },
        budget: { total: 50000000, used: 32500000, available: 17500000 }
      };

      // Mock system alerts
      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Utilisation mémoire élevée',
          message: 'Le serveur utilise 67% de la mémoire disponible',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: '2',
          type: 'info',
          title: 'Sauvegarde programmée',
          message: 'Sauvegarde automatique prévue à 02:00 cette nuit',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: '3',
          type: 'error',
          title: 'Erreur de synchronisation',
          message: 'Échec de synchronisation avec le service de notification',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          resolved: true
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats(mockStats);
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching superadmin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperadminData();
  }, [selectedTimeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-400 bg-red-50';
      case 'warning':
        return 'border-yellow-400 bg-yellow-50';
      case 'info':
        return 'border-blue-400 bg-blue-50';
      default:
        return 'border-gray-400 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMaintenance = () => {
    console.log('Maintenance mode activated');
    setShowMaintenanceModal(false);
  };

  const handleBackup = () => {
    console.log('Manual backup initiated');
    setShowBackupModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-header bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Superadmin</h1>
                <p className="mt-2 text-gray-600">
                  Bienvenue, {user?.email} • Administration système GROWF
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24h">24 dernières heures</option>
                  <option value="7d">7 derniers jours</option>
                  <option value="30d">30 derniers jours</option>
                  <option value="90d">90 derniers jours</option>
                </select>
                <Button onClick={() => setShowMaintenanceModal(true)} variant="outline" className="text-orange-600">
                  Mode Maintenance
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">État du Système</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stats?.system.status || 'unknown')}`}>
              {stats?.system.status === 'healthy' ? 'Sain' : stats?.system.status}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-green-600">{stats?.system.uptime}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CPU</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.system.cpu}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mémoire</p>
              <p className="text-2xl font-bold text-yellow-600">{stats?.system.memory}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Budget Utilisé</p>
              <p className="text-2xl font-bold text-purple-600">
                {((stats?.budget.used || 0) / (stats?.budget.total || 1) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.users.total}</p>
                <p className="text-xs text-blue-600">
                  {stats?.users.companies} entreprises • {stats?.users.organizations} organisations
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Candidatures</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.applications.total}</p>
                <p className="text-xs text-green-600">
                  {stats?.applications.approved} approuvées • {stats?.applications.pending} en attente
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Programmes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.programs.total}</p>
                <p className="text-xs text-yellow-600">
                  {stats?.programs.active} actifs • {stats?.programs.draft} brouillons
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Budget</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.budget.total || 0)}</p>
                <p className="text-xs text-purple-600">
                  {formatCurrency(stats?.budget.available || 0)} disponible
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Administrative Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Administratives</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/backoffice/users')}
                  className="flex items-center justify-center p-4 text-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  Gérer Utilisateurs
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/backoffice/admin')}
                  className="flex items-center justify-center p-4 text-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuration Système
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/backoffice/analytics')}
                  className="flex items-center justify-center p-4 text-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics Avancées
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBackupModal(true)}
                  className="flex items-center justify-center p-4 text-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v1m1 0h4m-4 0h4m-4 0v3m0 0h4m0-3v3" />
                  </svg>
                  Sauvegarder Système
                </Button>
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertes Système</h2>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${getAlertColor(alert.type)} ${alert.resolved ? 'opacity-50' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(alert.timestamp)}</p>
                      </div>
                      {alert.resolved && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Résolu
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Voir toutes les alertes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Modal */}
      <Modal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        title="Mode Maintenance"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir activer le mode maintenance ?
            Cela rendra la plateforme temporairement indisponible pour tous les utilisateurs.
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowMaintenanceModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleMaintenance} className="bg-orange-600 hover:bg-orange-700">
              Activer Maintenance
            </Button>
          </div>
        </div>
      </Modal>

      {/* Backup Modal */}
      <Modal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        title="Sauvegarde Système"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Lancer une sauvegarde manuelle du système ? Cette opération peut prendre quelques minutes.
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowBackupModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleBackup} className="bg-blue-600 hover:bg-blue-700">
              Démarrer Sauvegarde
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};