import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';

interface AdminStats {
  applications: { total: number; pending: number; approved: number; rejected: number; };
  programs: { total: number; active: number; draft: number; closed: number; };
  companies: { total: number; active: number; pending: number; };
  organizations: { total: number; active: number; pending: number; };
}

interface Activity {
  id: string;
  type: 'application_submitted' | 'program_created' | 'company_verified' | 'organization_added';
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  user?: string;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const isOrganization = user?.role === 'ORGANIZATION';
  // const isAdmin = user?.role === 'ADMIN';
  const isAnalyst = user?.role === 'ANALYST';

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Mock admin stats
      const mockStats: AdminStats = {
        applications: { total: 156, pending: 23, approved: 98, rejected: 35 },
        programs: { total: 12, active: 8, draft: 2, closed: 2 },
        companies: { total: 89, active: 76, pending: 13 },
        organizations: { total: 5, active: 4, pending: 1 }
      };

      // Mock recent activities
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'application_submitted',
          message: 'Nouvelle candidature pour "Innovation Numérique PME 2024"',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          user: 'TechStart Solutions'
        },
        {
          id: '2',
          type: 'program_created',
          message: 'Nouveau programme "Aide Export 2024" créé',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          user: 'CCI France'
        },
        {
          id: '3',
          type: 'company_verified',
          message: 'Entreprise "GreenTech SARL" vérifiée',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          priority: 'low'
        },
        {
          id: '4',
          type: 'organization_added',
          message: 'Nouvelle organisation "Région Bretagne" ajoutée',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium'
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats(mockStats);
      setActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [selectedTimeRange]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application_submitted':
        return '📄';
      case 'program_created':
        return '🆕';
      case 'company_verified':
        return '✅';
      case 'organization_added':
        return '🏛️';
      default:
        return '📌';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                <h1 className="text-3xl font-bold text-gray-900">
                  Tableau de bord {isOrganization ? 'Organisation' : isAnalyst ? 'Analyste' : 'Admin'}
                </h1>
                <p className="mt-2 text-gray-600">
                  Bienvenue, {user?.email} • Vue d'ensemble de la plateforme GROWF
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
                </select>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Actualiser
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Candidatures</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.applications.total}</p>
                <p className="text-xs text-blue-600">
                  {stats?.applications.pending} en attente • {stats?.applications.approved} approuvées
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Programmes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.programs.total}</p>
                <p className="text-xs text-green-600">
                  {stats?.programs.active} actifs • {stats?.programs.draft} brouillons
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entreprises</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.companies.total}</p>
                <p className="text-xs text-yellow-600">
                  {stats?.companies.active} actives • {stats?.companies.pending} en attente
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Organisations</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.organizations.total}</p>
                <p className="text-xs text-purple-600">
                  {stats?.organizations.active} actives • {stats?.organizations.pending} en attente
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isAnalyst && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/backoffice/programs')}
                    className="flex items-center justify-center p-4 text-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Gérer les Programmes
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate('/backoffice/applications')}
                  className="flex items-center justify-center p-4 text-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Examiner Candidatures
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/backoffice/companies')}
                  className="flex items-center justify-center p-4 text-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Gérer Entreprises
                </Button>
                {isOrganization && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/backoffice/organizations')}
                    className="flex items-center justify-center p-4 text-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    Mon Organisation
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate('/backoffice/analytics')}
                  className="flex items-center justify-center p-4 text-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Voir Analytics
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h2>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                          {activity.priority}
                        </span>
                      </div>
                      {activity.user && (
                        <p className="text-xs text-blue-600 mt-1">{activity.user}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Voir toute l'activité
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};