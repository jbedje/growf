import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface DashboardStats {
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
  };
  programs: {
    available: number;
    eligible: number;
    applied: number;
  };
  company: {
    profileCompletion: number;
    documentsStatus: 'complete' | 'incomplete' | 'pending';
    verificationStatus: 'verified' | 'pending' | 'rejected';
  };
  financial: {
    totalRequested: number;
    totalApproved: number;
    totalReceived: number;
    pendingAmount: number;
  };
}

interface Application {
  id: string;
  programName: string;
  programType: string;
  status: 'draft' | 'pending' | 'in_review' | 'approved' | 'rejected';
  submittedAt: string;
  amount: number;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
}

interface Program {
  id: string;
  name: string;
  type: string;
  maxAmount: number;
  deadline: string;
  description: string;
  eligibility: string[];
  status: 'open' | 'closing_soon' | 'closed';
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
}

export const CompanyDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'30d' | '90d' | '1y'>('30d');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Mock dashboard stats for external users
      const mockStats: DashboardStats = {
        applications: {
          total: 8,
          pending: 2,
          approved: 4,
          rejected: 1,
          draft: 1
        },
        programs: {
          available: 12,
          eligible: 8,
          applied: 3
        },
        company: {
          profileCompletion: 85,
          documentsStatus: 'incomplete',
          verificationStatus: 'verified'
        },
        financial: {
          totalRequested: 450000,
          totalApproved: 280000,
          totalReceived: 180000,
          pendingAmount: 100000
        }
      };

      // Mock applications
      const mockApplications: Application[] = [
        {
          id: '1',
          programName: 'Programme Innovation 2024',
          programType: 'Innovation',
          status: 'pending',
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 150000,
          priority: 'high',
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          programName: 'Aide Numérique TPE',
          programType: 'Numérique',
          status: 'approved',
          submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 75000,
          priority: 'medium'
        },
        {
          id: '3',
          programName: 'Subvention Écologique',
          programType: 'Écologie',
          status: 'in_review',
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 95000,
          priority: 'medium'
        },
        {
          id: '4',
          programName: 'Soutien Création Emploi',
          programType: 'Emploi',
          status: 'draft',
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 120000,
          priority: 'low'
        }
      ];

      // Mock available programs
      const mockPrograms: Program[] = [
        {
          id: '1',
          name: 'France Relance PME 2024',
          type: 'Relance',
          maxAmount: 200000,
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Aide à la relance pour les PME françaises',
          eligibility: ['PME', 'TPE', 'Secteur privé'],
          status: 'open'
        },
        {
          id: '2',
          name: 'Transition Numérique',
          type: 'Numérique',
          maxAmount: 50000,
          deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Accompagnement transformation digitale',
          eligibility: ['Toutes entreprises', 'Secteur privé'],
          status: 'closing_soon'
        },
        {
          id: '3',
          name: 'Innovation Verte',
          type: 'Écologie',
          maxAmount: 300000,
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Soutien aux innovations environnementales',
          eligibility: ['Startup', 'PME', 'Innovation'],
          status: 'open'
        }
      ];

      // Mock notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Document manquant',
          message: 'Votre dossier pour le Programme Innovation 2024 nécessite des documents complémentaires',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionRequired: true
        },
        {
          id: '2',
          type: 'info',
          title: 'Nouveau programme disponible',
          message: 'Le programme "Transition Numérique" correspond à votre profil',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: '3',
          type: 'success',
          title: 'Candidature approuvée',
          message: 'Votre candidature pour l\'Aide Numérique TPE a été approuvée !',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats(mockStats);
      setApplications(mockApplications);
      setPrograms(mockPrograms);
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvée';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejetée';
      case 'in_review':
        return 'En examen';
      case 'draft':
        return 'Brouillon';
      default:
        return status;
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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Haute';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Basse';
      default:
        return priority;
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
                <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="mt-2 text-gray-600">
                  Bienvenue, {user?.email} • Suivez vos candidatures et découvrez de nouveaux programmes
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30d">30 derniers jours</option>
                  <option value="90d">90 derniers jours</option>
                  <option value="1y">12 derniers mois</option>
                </select>
                <Button onClick={() => navigate('/programs')} className="bg-blue-600 hover:bg-blue-700">
                  Découvrir les programmes
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
                <p className="text-xs text-green-600">
                  {stats?.applications.approved} approuvées • {stats?.applications.pending} en attente
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
                <p className="text-2xl font-bold text-gray-900">{stats?.programs.available}</p>
                <p className="text-xs text-blue-600">
                  {stats?.programs.eligible} éligibles • {stats?.programs.applied} candidatures
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Financement Approuvé</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.financial.totalApproved || 0)}</p>
                <p className="text-xs text-gray-600">
                  {formatCurrency(stats?.financial.pendingAmount || 0)} en attente
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profil</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.company.profileCompletion}%</p>
                <p className="text-xs text-gray-600">
                  {stats?.company.documentsStatus === 'complete' ? 'Documents OK' : 'Documents manquants'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Mes Candidatures</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/my-applications')}
                  >
                    Voir tout
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-gray-900">{application.programName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {getStatusLabel(application.status)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(application.priority)}`}>
                            {getPriorityLabel(application.priority)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                          <span>Montant: {formatCurrency(application.amount)}</span>
                          <span>Type: {application.programType}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Soumise le {formatDate(application.submittedAt)}
                          {application.deadline && ` • Échéance: ${formatDate(application.deadline)}`}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          Voir
                        </Button>
                        {application.status === 'draft' && (
                          <Button size="sm">
                            Compléter
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {applications.length === 0 && (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune candidature</h3>
                    <p className="mt-1 text-sm text-gray-500">Commencez par découvrir les programmes disponibles.</p>
                    <div className="mt-6">
                      <Button onClick={() => navigate('/programs')}>
                        Découvrir les programmes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${
                      notification.type === 'warning' ? 'border-yellow-400 bg-yellow-50' :
                      notification.type === 'success' ? 'border-green-400 bg-green-50' :
                      notification.type === 'error' ? 'border-red-400 bg-red-50' :
                      'border-blue-400 bg-blue-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(notification.timestamp)}</p>
                        </div>
                        {notification.actionRequired && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Action requise
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Voir toutes les notifications
                </Button>
              </div>
            </div>

            {/* Recommended Programs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Programmes Recommandés</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {programs.slice(0, 2).map((program) => (
                    <div key={program.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{program.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{program.type}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Max: {formatCurrency(program.maxAmount)} • Échéance: {formatDate(program.deadline)}
                          </p>
                          <div className="mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              program.status === 'open' ? 'bg-green-100 text-green-800' :
                              program.status === 'closing_soon' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {program.status === 'open' ? 'Ouvert' :
                               program.status === 'closing_soon' ? 'Clôture bientôt' : 'Fermé'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => navigate(`/programs/${program.id}`)}
                      >
                        Voir le programme
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate('/programs')}>
                  Voir tous les programmes
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/programs')}
              className="flex items-center justify-center p-4 text-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Chercher Programmes
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/my-applications')}
              className="flex items-center justify-center p-4 text-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Mes Candidatures
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center p-4 text-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Gérer Profil
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowApplicationModal(true)}
              className="flex items-center justify-center p-4 text-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Aide & Support
            </Button>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title="Aide et Support"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Comment candidater ?</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Recherchez les programmes qui correspondent à votre profil</li>
              <li>Consultez les critères d'éligibilité</li>
              <li>Préparez vos documents requis</li>
              <li>Complétez votre candidature en ligne</li>
              <li>Suivez l'état de votre candidature dans votre tableau de bord</li>
            </ol>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-2">Documents généralement requis</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Extrait Kbis de moins de 3 mois</li>
              <li>Comptes annuels des 3 dernières années</li>
              <li>Business plan ou plan de développement</li>
              <li>Devis des prestations à financer</li>
              <li>RIB de l'entreprise</li>
            </ul>
          </div>
          <div className="text-center">
            <Button variant="outline" onClick={() => setShowApplicationModal(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};