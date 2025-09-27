import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import apiService from '../../services/api';

interface DashboardStats {
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    recentlySubmitted: number;
    avgProcessingTime: number;
  };
  programs: {
    available: number;
    eligible: number;
    applied: number;
    newThisMonth: number;
    recommendedCount: number;
  };
  company: {
    profileCompletion: number;
    documentsStatus: 'complete' | 'incomplete' | 'pending';
    verificationStatus: 'verified' | 'pending' | 'rejected';
    lastUpdated: string;
    complianceScore: number;
  };
  financial: {
    totalRequested: number;
    totalApproved: number;
    totalReceived: number;
    pendingAmount: number;
    successRate: number;
    avgAmountRequested: number;
    monthlyTrend: Array<{ month: string; amount: number; }>;
  };
  performance: {
    applicationSuccessRate: number;
    avgResponseTime: number;
    totalFunding: number;
    rank: number;
    growthRate: number;
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

interface CompanySettings {
  general: {
    companyName: string;
    email: string;
    phone: string;
    website: string;
    language: 'fr' | 'en';
    timezone: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    applicationUpdates: boolean;
    programRecommendations: boolean;
    marketingEmails: boolean;
    weeklyReports: boolean;
  };
  dashboard: {
    defaultView: 'overview' | 'analytics' | 'performance';
    autoRefresh: boolean;
    refreshInterval: number;
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'selective';
    dataSharing: boolean;
    analyticsTracking: boolean;
    marketingCookies: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginNotifications: boolean;
  };
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
  const [showProfileGuide, setShowProfileGuide] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [dashboardView, setDashboardView] = useState<'overview' | 'analytics' | 'performance'>('overview');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'notifications' | 'dashboard' | 'privacy' | 'security'>('general');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Try to fetch real data from API, fallback to mock data if API is unavailable
      let statsData: DashboardStats;
      let applicationsData: Application[];
      let programsData: Program[];
      let notificationsData: Notification[];

      try {
        // Attempt to fetch real data from API
        const [statsResponse, appsResponse, progsResponse, notifsResponse] = await Promise.all([
          apiService.getDashboardStats(selectedTimeRange),
          apiService.getApplications(undefined, 10),
          apiService.getPrograms({ limit: 10 }),
          apiService.getNotifications()
        ]);

        if (statsResponse.success) {
          statsData = statsResponse.data;
        } else {
          throw new Error('API returned error');
        }

        applicationsData = appsResponse.success ? appsResponse.data : [];
        programsData = progsResponse.success ? progsResponse.data : [];
        notificationsData = notifsResponse.success ? notifsResponse.data : [];

      } catch (apiError) {
        console.log('API unavailable, using mock data:', apiError);

        // Fallback to enhanced mock dashboard stats
        statsData = {
        applications: {
          total: 8,
          pending: 2,
          approved: 4,
          rejected: 1,
          draft: 1,
          recentlySubmitted: 1,
          avgProcessingTime: 25
        },
        programs: {
          available: 12,
          eligible: 8,
          applied: 3,
          newThisMonth: 2,
          recommendedCount: 5
        },
        company: {
          profileCompletion: 85,
          documentsStatus: 'incomplete',
          verificationStatus: 'verified',
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          complianceScore: 92
        },
        financial: {
          totalRequested: 450000,
          totalApproved: 280000,
          totalReceived: 180000,
          pendingAmount: 100000,
          successRate: 62.2,
          avgAmountRequested: 56250,
          monthlyTrend: [
            { month: 'Jan', amount: 45000 },
            { month: 'Fév', amount: 67000 },
            { month: 'Mar', amount: 52000 },
            { month: 'Avr', amount: 78000 },
            { month: 'Mai', amount: 63000 },
            { month: 'Juin', amount: 85000 }
          ]
        },
        performance: {
          applicationSuccessRate: 75,
          avgResponseTime: 18,
          totalFunding: 180000,
          rank: 23,
          growthRate: 12.5
        }
      };

        // Mock applications (fallback)
        applicationsData = [
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

        // Mock available programs (fallback)
        programsData = [
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

        // Mock notifications (fallback)
        notificationsData = [
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

      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats(statsData);
      setApplications(applicationsData);
      setPrograms(programsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh functionality
  const refreshDashboard = async () => {
    setLoading(true);
    try {
      await apiService.refreshDashboard();
    } catch {
      console.log('Manual refresh via API failed, fetching data directly');
    }
    await fetchDashboardData();
  };

  // Export functionality
  const exportData = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setLoading(true);
      const blob = await apiService.exportDashboardData(format, selectedTimeRange);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const fileName = `dashboard-export-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.${format}`;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      // Fallback: generate simple CSV from current data
      if (format === 'csv') {
        generateLocalCSV();
      }
    } finally {
      setLoading(false);
    }
  };

  // Notification handling
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user?.id) return;

    try {
      await apiService.markAllNotificationsAsRead(user.id);
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await apiService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Get unread notification count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Settings management
  const fetchSettings = async () => {
    try {
      const response = await apiService.getCompanySettings();
      if (response.success) {
        setSettings(response.data);
      } else {
        // Set default settings if API fails
        setDefaultSettings();
      }
    } catch {
      console.log('Settings API unavailable, using defaults');
      setDefaultSettings();
    }
  };

  const setDefaultSettings = () => {
    const defaultSettings: CompanySettings = {
      general: {
        companyName: user?.email?.split('@')[0] || 'Mon Entreprise',
        email: user?.email || '',
        phone: '',
        website: '',
        language: 'fr',
        timezone: 'Europe/Paris'
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        applicationUpdates: true,
        programRecommendations: true,
        marketingEmails: false,
        weeklyReports: true
      },
      dashboard: {
        defaultView: 'overview',
        autoRefresh: true,
        refreshInterval: 30,
        theme: 'light',
        compactMode: false
      },
      privacy: {
        profileVisibility: 'private',
        dataSharing: false,
        analyticsTracking: true,
        marketingCookies: false
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginNotifications: true
      }
    };
    setSettings(defaultSettings);
  };

  const updateSettings = async (section: keyof CompanySettings, sectionSettings: any) => {
    if (!settings) return;

    try {
      const updatedSettings = {
        ...settings,
        [section]: { ...settings[section], ...sectionSettings }
      };

      // Update local state immediately for better UX
      setSettings(updatedSettings);

      // Try to save to API
      await apiService.updateCompanySettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Revert on error
      await fetchSettings();
    }
  };

  const resetAllSettings = async () => {
    try {
      await apiService.resetSettings();
      await fetchSettings();
    } catch (error) {
      console.error('Failed to reset settings:', error);
      setDefaultSettings();
    }
  };

  const exportSettings = async () => {
    try {
      const blob = await apiService.exportSettings();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `company-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export settings:', error);
      // Fallback: create local export
      if (settings) {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `company-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    }
  };

  // Fallback local CSV generation
  const generateLocalCSV = () => {
    if (!stats) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Applications', stats.applications.total.toString()],
      ['Pending Applications', stats.applications.pending.toString()],
      ['Approved Applications', stats.applications.approved.toString()],
      ['Rejected Applications', stats.applications.rejected.toString()],
      ['Total Requested', stats.financial.totalRequested.toString()],
      ['Total Approved', stats.financial.totalApproved.toString()],
      ['Total Received', stats.financial.totalReceived.toString()],
      ['Success Rate', stats.financial.successRate.toString() + '%'],
      ['Profile Completion', stats.company.profileCompletion.toString() + '%'],
      ['Compliance Score', stats.company.complianceScore.toString()]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-export-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Auto-refresh every 30 seconds for critical updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Only auto-refresh if user is on the page and not interacting
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchSettings();
  }, [selectedTimeRange]);

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

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
                {stats?.company.profileCompletion < 100 && (
                  <div className="mt-3 flex items-center space-x-2">
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.company.profileCompletion}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{stats.company.profileCompletion}% profil complet</span>
                    <button
                      onClick={() => setShowProfileGuide(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Compléter →
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {/* Refresh Button */}
                <button
                  onClick={refreshDashboard}
                  disabled={loading}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Actualiser les données"
                >
                  <svg className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                {/* Dashboard View Selector */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {[
                    { key: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
                    { key: 'analytics', label: 'Analyses', icon: '📈' },
                    { key: 'performance', label: 'Performance', icon: '🎯' }
                  ].map((view) => (
                    <button
                      key={view.key}
                      onClick={() => setDashboardView(view.key as any)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        dashboardView === view.key
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-1">{view.icon}</span>
                      {view.label}
                    </button>
                  ))}
                </div>
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
        {/* Alert Banner for Profile Completion */}
        {stats?.company.profileCompletion < 100 && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-amber-800">
                  Complétez votre profil pour maximiser vos chances d'approbation
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>Votre profil est complété à {stats.company.profileCompletion}%. {stats.company.documentsStatus === 'incomplete' ? 'Documents manquants.' : ''}</p>
                </div>
                <div className="mt-3">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      onClick={() => navigate('/profile')}
                      className="bg-amber-50 px-2 py-1.5 rounded-md text-sm font-medium text-amber-800 hover:bg-amber-100"
                    >
                      Compléter le profil
                    </button>
                    <button className="ml-3 bg-amber-50 px-2 py-1.5 rounded-md text-sm font-medium text-amber-800 hover:bg-amber-100">
                      Plus tard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className={`bg-white rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md cursor-pointer ${
              expandedCard === 'applications' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setExpandedCard(expandedCard === 'applications' ? null : 'applications')}
          >
            <div className="flex items-center justify-between">
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
              <div className="text-right">
                <div className="text-xs text-gray-500">Temps moyen</div>
                <div className="text-sm font-semibold text-gray-900">{stats?.applications.avgProcessingTime}j</div>
              </div>
            </div>
            {expandedCard === 'applications' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Brouillons:</span>
                    <span className="ml-2 font-medium">{stats?.applications.draft}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rejetées:</span>
                    <span className="ml-2 font-medium">{stats?.applications.rejected}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Récentes:</span>
                    <span className="ml-2 font-medium">{stats?.applications.recentlySubmitted}</span>
                  </div>
                  <div className="flex items-center">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate('/my-applications'); }}>
                      Voir tout
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className={`bg-white rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md cursor-pointer ${
              expandedCard === 'programs' ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => setExpandedCard(expandedCard === 'programs' ? null : 'programs')}
          >
            <div className="flex items-center justify-between">
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
              <div className="text-right">
                <div className="text-xs text-gray-500">Nouveaux</div>
                <div className="text-sm font-semibold text-green-600">+{stats?.programs.newThisMonth}</div>
              </div>
            </div>
            {expandedCard === 'programs' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Recommandés:</span>
                    <span className="ml-2 font-medium text-blue-600">{stats?.programs.recommendedCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Déjà candidaté:</span>
                    <span className="ml-2 font-medium">{stats?.programs.applied}</span>
                  </div>
                  <div className="col-span-2">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate('/programs'); }} className="w-full">
                      Parcourir tous les programmes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className={`bg-white rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md cursor-pointer ${
              expandedCard === 'financial' ? 'ring-2 ring-yellow-500' : ''
            }`}
            onClick={() => setExpandedCard(expandedCard === 'financial' ? null : 'financial')}
          >
            <div className="flex items-center justify-between">
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
              <div className="text-right">
                <div className="text-xs text-gray-500">Taux succès</div>
                <div className="text-sm font-semibold text-green-600">{stats?.financial.successRate.toFixed(1)}%</div>
              </div>
            </div>
            {expandedCard === 'financial' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total demandé:</span>
                    <span className="font-medium">{formatCurrency(stats?.financial.totalRequested || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total reçu:</span>
                    <span className="font-medium text-green-600">{formatCurrency(stats?.financial.totalReceived || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant moyen:</span>
                    <span className="font-medium">{formatCurrency(stats?.financial.avgAmountRequested || 0)}</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">Évolution sur 6 mois</div>
                    <div className="flex items-end space-x-1 h-8">
                      {stats?.financial.monthlyTrend.map((month, index) => (
                        <div key={index} className="flex-1 bg-yellow-200 rounded-t" style={{
                          height: `${(month.amount / Math.max(...(stats?.financial.monthlyTrend || []).map(m => m.amount))) * 100}%`,
                          minHeight: '4px'
                        }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className={`bg-white rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md cursor-pointer ${
              expandedCard === 'profile' ? 'ring-2 ring-purple-500' : ''
            }`}
            onClick={() => setExpandedCard(expandedCard === 'profile' ? null : 'profile')}
          >
            <div className="flex items-center justify-between">
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
              <div className="text-right">
                <div className="text-xs text-gray-500">Score</div>
                <div className="text-sm font-semibold text-gray-900">{stats?.company.complianceScore}/100</div>
              </div>
            </div>
            {expandedCard === 'profile' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span className={`font-medium ${
                      stats?.company.verificationStatus === 'verified' ? 'text-green-600' :
                      stats?.company.verificationStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {stats?.company.verificationStatus === 'verified' ? 'Vérifié' :
                       stats?.company.verificationStatus === 'pending' ? 'En attente' : 'Rejeté'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dernière MAJ:</span>
                    <span className="font-medium">{stats?.company.lastUpdated ? formatDate(stats.company.lastUpdated) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Documents:</span>
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}>
                      Gérer
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <React.Fragment>
        {dashboardView === 'overview' && (
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
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {unreadCount}
                      </span>
                    )}
                  </h2>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${
                      notification.type === 'warning' ? 'border-yellow-400 bg-yellow-50' :
                      notification.type === 'success' ? 'border-green-400 bg-green-50' :
                      notification.type === 'error' ? 'border-red-400 bg-red-50' :
                      'border-blue-400 bg-blue-50'
                    } ${!notification.read ? 'ring-2 ring-blue-200' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(notification.timestamp)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {notification.actionRequired && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Action requise
                            </span>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markNotificationAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                              title="Marquer comme lu"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            ✕
                          </button>
                        </div>
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
        )}

        {dashboardView === 'analytics' && (
          <div className="space-y-8">
            {/* Export Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => exportData('csv')}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={() => exportData('excel')}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel
              </button>
              <button
                onClick={() => exportData('pdf')}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export PDF
              </button>
            </div>

            {/* Financial Trends */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">📈 Analyse Financière</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Évolution des financements (6 mois)</h3>
                  <div className="h-64 flex items-end space-x-2">
                    {stats?.financial.monthlyTrend.map((month, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                          style={{
                            height: `${(month.amount / Math.max(...(stats?.financial.monthlyTrend || []).map(m => m.amount))) * 200}px`,
                            minHeight: '20px'
                          }}
                          title={`${month.month}: ${formatCurrency(month.amount)}`}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2">{month.month}</div>
                        <div className="text-xs font-medium text-gray-900">{formatCurrency(month.amount)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Statistiques détaillées</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Taux de succès global</span>
                      <span className="font-semibold text-green-600">{stats?.financial.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Montant moyen demandé</span>
                      <span className="font-semibold">{formatCurrency(stats?.financial.avgAmountRequested || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Temps de traitement moyen</span>
                      <span className="font-semibold">{stats?.applications.avgProcessingTime} jours</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Candidatures actives</span>
                      <span className="font-semibold text-blue-600">{stats?.applications.pending}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">📊 Répartition des Candidatures</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Approuvées', count: stats?.applications.approved || 0, color: 'bg-green-500', percentage: ((stats?.applications.approved || 0) / (stats?.applications.total || 1)) * 100 },
                  { label: 'En attente', count: stats?.applications.pending || 0, color: 'bg-yellow-500', percentage: ((stats?.applications.pending || 0) / (stats?.applications.total || 1)) * 100 },
                  { label: 'Rejetées', count: stats?.applications.rejected || 0, color: 'bg-red-500', percentage: ((stats?.applications.rejected || 0) / (stats?.applications.total || 1)) * 100 },
                  { label: 'Brouillons', count: stats?.applications.draft || 0, color: 'bg-gray-500', percentage: ((stats?.applications.draft || 0) / (stats?.applications.total || 1)) * 100 }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="2"></circle>
                        <circle
                          cx="18" cy="18" r="16" fill="none"
                          className={item.color.replace('bg-', 'stroke-')}
                          strokeWidth="2"
                          strokeDasharray={`${item.percentage}, 100`}
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold">{item.count}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">{item.label}</div>
                    <div className="text-xs font-medium">{item.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance View */}
        {dashboardView === 'performance' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">🎯 Indicateurs de Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats?.performance.applicationSuccessRate}%</div>
                  <div className="text-sm text-gray-600">Taux de succès</div>
                  <div className="text-xs text-gray-500 mt-1">Candidatures approuvées</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats?.performance.avgResponseTime}j</div>
                  <div className="text-sm text-gray-600">Réponse moyenne</div>
                  <div className="text-xs text-gray-500 mt-1">Temps de traitement</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">#{stats?.performance.rank}</div>
                  <div className="text-sm text-gray-600">Classement</div>
                  <div className="text-xs text-gray-500 mt-1">Parmi les entreprises</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-2">+{stats?.performance.growthRate}%</div>
                  <div className="text-sm text-gray-600">Croissance</div>
                  <div className="text-xs text-gray-500 mt-1">Financement obtenu</div>
                </div>
              </div>
            </div>

            {/* Comparison & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Comparaison Sectorielle</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Votre performance</span>
                      <span className="font-medium">{stats?.performance.applicationSuccessRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats?.performance.applicationSuccessRate}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Moyenne sectorielle</span>
                      <span className="font-medium">68%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-gray-400 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Top performers</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Recommandations</h3>
                <div className="space-y-3">
                  {[
                    { icon: '📄', title: 'Compléter le profil', desc: 'Augmentez vos chances de 15%', priority: 'high' },
                    { icon: '🔍', title: 'Cibler des programmes', desc: 'Focus sur votre secteur', priority: 'medium' },
                    { icon: '📊', title: 'Améliorer les dossiers', desc: 'Qualité des candidatures', priority: 'medium' },
                    { icon: '⏱️', title: 'Répondre rapidement', desc: 'Traiter les demandes vite', priority: 'low' }
                  ].map((rec, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                      rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-green-500 bg-green-50'
                    }`}>
                      <div className="flex items-start">
                        <span className="text-lg mr-3">{rec.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{rec.title}</div>
                          <div className="text-sm text-gray-600">{rec.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center justify-center p-4 text-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Paramètres
            </Button>
          </div>
        </div>
        </React.Fragment>

        <Modal
          isOpen={showProfileGuide}
          onClose={() => setShowProfileGuide(false)}
          title="Guide de Complétion du Profil"
        >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Optimisez votre profil</h3>
            <p className="text-gray-600">Un profil complet augmente vos chances de succès de 65%</p>
          </div>

          <div className="space-y-4">
            {[
              { step: 1, title: 'Informations de base', desc: 'Nom, SIRET, secteur d\'activité', completed: true },
              { step: 2, title: 'Détails financiers', desc: 'CA, nombre d\'employés, année de création', completed: true },
              { step: 3, title: 'Description détaillée', desc: 'Activités, objectifs, projets', completed: false },
              { step: 4, title: 'Documents légaux', desc: 'Kbis, comptes annuels, RIB', completed: false },
              { step: 5, title: 'Vérification', desc: 'Validation par nos équipes', completed: stats?.company.verificationStatus === 'verified' }
            ].map((step) => (
              <div key={step.step} className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.completed ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.step
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    step.completed ? 'text-gray-900' : 'text-gray-600'
                  }`}>{step.title}</div>
                  <div className="text-sm text-gray-500">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Conseil</h4>
            <p className="text-sm text-blue-800">
              Les entreprises avec un profil 100% complet reçoivent en moyenne 3x plus de financements.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowProfileGuide(false)} className="flex-1">
              Plus tard
            </Button>
            <Button onClick={() => { setShowProfileGuide(false); navigate('/profile'); }} className="flex-1">
              Compléter maintenant
            </Button>
          </div>
        </div>
      </Modal>

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

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Paramètres de l'entreprise"
        size="xl"
      >
        <div className="flex h-96">
          {/* Settings Tabs */}
          <div className="w-1/4 border-r border-gray-200 pr-4">
            <nav className="space-y-1">
              {[
                { key: 'general', label: 'Général', icon: '🏢' },
                { key: 'notifications', label: 'Notifications', icon: '🔔' },
                { key: 'dashboard', label: 'Tableau de bord', icon: '📊' },
                { key: 'privacy', label: 'Confidentialité', icon: '🔒' },
                { key: 'security', label: 'Sécurité', icon: '🛡️' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSettingsTab(tab.key as any)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeSettingsTab === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 pl-6 overflow-y-auto">
            {settings && (
              <React.Fragment>
                {/* General Settings */}
                {activeSettingsTab === 'general' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Informations générales</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
                        <input
                          type="text"
                          value={settings.general.companyName}
                          onChange={(e) => updateSettings('general', { companyName: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={settings.general.email}
                          onChange={(e) => updateSettings('general', { email: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                        <input
                          type="tel"
                          value={settings.general.phone}
                          onChange={(e) => updateSettings('general', { phone: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Site web</label>
                        <input
                          type="url"
                          value={settings.general.website}
                          onChange={(e) => updateSettings('general', { website: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Langue</label>
                        <select
                          value={settings.general.language}
                          onChange={(e) => updateSettings('general', { language: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeSettingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Préférences de notification</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'emailNotifications', label: 'Notifications par email', desc: 'Recevoir les notifications importantes par email' },
                        { key: 'pushNotifications', label: 'Notifications push', desc: 'Recevoir les notifications dans le navigateur' },
                        { key: 'applicationUpdates', label: 'Mises à jour des candidatures', desc: 'Être notifié des changements de statut' },
                        { key: 'programRecommendations', label: 'Recommandations de programmes', desc: 'Recevoir des suggestions de programmes adaptés' },
                        { key: 'marketingEmails', label: 'Emails marketing', desc: 'Recevoir les actualités et promotions' },
                        { key: 'weeklyReports', label: 'Rapports hebdomadaires', desc: 'Recevoir un résumé hebdomadaire de votre activité' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium text-gray-900">{setting.label}</h4>
                            </div>
                            <p className="text-sm text-gray-500">{setting.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateSettings('notifications', { [setting.key]: !settings.notifications[setting.key as keyof typeof settings.notifications] })}
                            className={`${
                              settings.notifications[setting.key as keyof typeof settings.notifications] ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                          >
                            <span
                              className={`${
                                settings.notifications[setting.key as keyof typeof settings.notifications] ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dashboard Settings */}
                {activeSettingsTab === 'dashboard' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Configuration du tableau de bord</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Vue par défaut</label>
                        <select
                          value={settings.dashboard.defaultView}
                          onChange={(e) => updateSettings('dashboard', { defaultView: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="overview">Vue d'ensemble</option>
                          <option value="analytics">Analyses</option>
                          <option value="performance">Performance</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Actualisation automatique</h4>
                          <p className="text-sm text-gray-500">Actualiser automatiquement les données du tableau de bord</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSettings('dashboard', { autoRefresh: !settings.dashboard.autoRefresh })}
                          className={`${
                            settings.dashboard.autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                          <span
                            className={`${
                              settings.dashboard.autoRefresh ? 'translate-x-5' : 'translate-x-0'
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />
                        </button>
                      </div>
                      {settings.dashboard.autoRefresh && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Intervalle d'actualisation (secondes)</label>
                          <select
                            value={settings.dashboard.refreshInterval}
                            onChange={(e) => updateSettings('dashboard', { refreshInterval: parseInt(e.target.value) })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value={10}>10 secondes</option>
                            <option value={30}>30 secondes</option>
                            <option value={60}>1 minute</option>
                            <option value={300}>5 minutes</option>
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Thème</label>
                        <select
                          value={settings.dashboard.theme}
                          onChange={(e) => updateSettings('dashboard', { theme: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="light">Clair</option>
                          <option value="dark">Sombre</option>
                          <option value="auto">Automatique</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Settings */}
                {activeSettingsTab === 'privacy' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Paramètres de confidentialité</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Visibilité du profil</label>
                        <select
                          value={settings.privacy.profileVisibility}
                          onChange={(e) => updateSettings('privacy', { profileVisibility: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="public">Public</option>
                          <option value="private">Privé</option>
                          <option value="selective">Sélectif</option>
                        </select>
                      </div>
                      {[
                        { key: 'dataSharing', label: 'Partage de données', desc: 'Permettre le partage de données anonymisées pour améliorer les services' },
                        { key: 'analyticsTracking', label: 'Suivi analytique', desc: 'Autoriser le suivi pour améliorer l\'expérience utilisateur' },
                        { key: 'marketingCookies', label: 'Cookies marketing', desc: 'Autoriser les cookies pour la personnalisation des publicités' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{setting.label}</h4>
                            <p className="text-sm text-gray-500">{setting.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateSettings('privacy', { [setting.key]: !settings.privacy[setting.key as keyof typeof settings.privacy] })}
                            className={`${
                              settings.privacy[setting.key as keyof typeof settings.privacy] ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                          >
                            <span
                              className={`${
                                settings.privacy[setting.key as keyof typeof settings.privacy] ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeSettingsTab === 'security' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Paramètres de sécurité</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Authentification à deux facteurs</h4>
                          <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire à votre compte</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSettings('security', { twoFactorAuth: !settings.security.twoFactorAuth })}
                          className={`${
                            settings.security.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                          <span
                            className={`${
                              settings.security.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Timeout de session (minutes)</label>
                        <select
                          value={settings.security.sessionTimeout}
                          onChange={(e) => updateSettings('security', { sessionTimeout: parseInt(e.target.value) })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 heure</option>
                          <option value={120}>2 heures</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Expiration du mot de passe (jours)</label>
                        <select
                          value={settings.security.passwordExpiry}
                          onChange={(e) => updateSettings('security', { passwordExpiry: parseInt(e.target.value) })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={30}>30 jours</option>
                          <option value={60}>60 jours</option>
                          <option value={90}>90 jours</option>
                          <option value={180}>180 jours</option>
                          <option value={365}>1 an</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Notifications de connexion</h4>
                          <p className="text-sm text-gray-500">Recevoir un email lors de nouvelles connexions</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSettings('security', { loginNotifications: !settings.security.loginNotifications })}
                          className={`${
                            settings.security.loginNotifications ? 'bg-blue-600' : 'bg-gray-200'
                          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        >
                          <span
                            className={`${
                              settings.security.loginNotifications ? 'translate-x-5' : 'translate-x-0'
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            )}
          </div>
        </div>

        {/* Settings Modal Footer */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={exportSettings}
              size="sm"
            >
              Exporter
            </Button>
            <Button
              variant="outline"
              onClick={resetAllSettings}
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Réinitialiser
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowSettingsModal(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={() => setShowSettingsModal(false)}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
};