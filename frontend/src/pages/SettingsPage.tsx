import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Key, Download, Upload, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import apiService from '../services/api';

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

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<keyof CompanySettings>('general');
  const [settings, setSettings] = useState<CompanySettings>({
    general: {
      companyName: 'Mon Entreprise',
      email: 'contact@monentreprise.fr',
      phone: '+33 1 23 45 67 89',
      website: 'https://www.monentreprise.fr',
      language: 'fr',
      timezone: 'Europe/Paris',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      applicationUpdates: true,
      programRecommendations: true,
      marketingEmails: false,
      weeklyReports: true,
    },
    dashboard: {
      defaultView: 'overview',
      autoRefresh: true,
      refreshInterval: 300,
      theme: 'light',
      compactMode: false,
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: true,
      analyticsTracking: true,
      marketingCookies: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginNotifications: true,
    },
  });

  const tabs = [
    { key: 'general', label: 'Général', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'dashboard', label: 'Tableau de bord', icon: Palette },
    { key: 'privacy', label: 'Confidentialité', icon: Shield },
    { key: 'security', label: 'Sécurité', icon: Key },
  ] as const;

  const handleSave = async () => {
    try {
      await apiService.updateCompanySettings(settings);
      alert('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiService.exportSettings();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'settings.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      const fallbackData = JSON.stringify(settings, null, 2);
      const blob = new Blob([fallbackData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'settings.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings({ ...settings, ...importedSettings });
          alert('Paramètres importés avec succès');
        } catch (error) {
          console.error('Erreur lors de l\'import:', error);
          alert('Erreur lors de l\'import des paramètres');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      // Reset to default values
      setSettings({
        general: {
          companyName: '',
          email: '',
          phone: '',
          website: '',
          language: 'fr',
          timezone: 'Europe/Paris',
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          applicationUpdates: true,
          programRecommendations: true,
          marketingEmails: false,
          weeklyReports: true,
        },
        dashboard: {
          defaultView: 'overview',
          autoRefresh: true,
          refreshInterval: 300,
          theme: 'light',
          compactMode: false,
        },
        privacy: {
          profileVisibility: 'public',
          dataSharing: false,
          analyticsTracking: false,
          marketingCookies: false,
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordExpiry: 90,
          loginNotifications: true,
        },
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                value={settings.general.companyName}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, companyName: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de contact
              </label>
              <input
                type="email"
                value={settings.general.email}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, email: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={settings.general.phone}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, phone: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site web
              </label>
              <input
                type="url"
                value={settings.general.website}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, website: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Langue
              </label>
              <select
                value={settings.general.language}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, language: e.target.value as 'fr' | 'en' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Notifications par email</h3>
                <p className="text-sm text-gray-500">Recevoir les notifications importantes par email</p>
              </div>
              <Toggle
                checked={settings.notifications.emailNotifications}
                onChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, emailNotifications: checked }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Notifications push</h3>
                <p className="text-sm text-gray-500">Recevoir les notifications dans le navigateur</p>
              </div>
              <Toggle
                checked={settings.notifications.pushNotifications}
                onChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, pushNotifications: checked }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Mises à jour des candidatures</h3>
                <p className="text-sm text-gray-500">Être notifié des changements de statut</p>
              </div>
              <Toggle
                checked={settings.notifications.applicationUpdates}
                onChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, applicationUpdates: checked }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Recommandations de programmes</h3>
                <p className="text-sm text-gray-500">Recevoir des suggestions de programmes adaptés</p>
              </div>
              <Toggle
                checked={settings.notifications.programRecommendations}
                onChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, programRecommendations: checked }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Emails marketing</h3>
                <p className="text-sm text-gray-500">Recevoir les newsletters et promotions</p>
              </div>
              <Toggle
                checked={settings.notifications.marketingEmails}
                onChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, marketingEmails: checked }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Rapports hebdomadaires</h3>
                <p className="text-sm text-gray-500">Recevoir un résumé hebdomadaire de votre activité</p>
              </div>
              <Toggle
                checked={settings.notifications.weeklyReports}
                onChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, weeklyReports: checked }
                })}
              />
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vue par défaut
              </label>
              <select
                value={settings.dashboard.defaultView}
                onChange={(e) => setSettings({
                  ...settings,
                  dashboard: { ...settings.dashboard, defaultView: e.target.value as 'overview' | 'analytics' | 'performance' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="overview">Vue d'ensemble</option>
                <option value="analytics">Analytics</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Actualisation automatique</h3>
                <p className="text-sm text-gray-500">Actualiser automatiquement les données</p>
              </div>
              <Toggle
                checked={settings.dashboard.autoRefresh}
                onChange={(checked) => setSettings({
                  ...settings,
                  dashboard: { ...settings.dashboard, autoRefresh: checked }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervalle d'actualisation (secondes)
              </label>
              <input
                type="number"
                min="30"
                max="3600"
                value={settings.dashboard.refreshInterval}
                onChange={(e) => setSettings({
                  ...settings,
                  dashboard: { ...settings.dashboard, refreshInterval: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thème
              </label>
              <select
                value={settings.dashboard.theme}
                onChange={(e) => setSettings({
                  ...settings,
                  dashboard: { ...settings.dashboard, theme: e.target.value as 'light' | 'dark' | 'auto' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="auto">Automatique</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Mode compact</h3>
                <p className="text-sm text-gray-500">Affichage plus dense des informations</p>
              </div>
              <Toggle
                checked={settings.dashboard.compactMode}
                onChange={(checked) => setSettings({
                  ...settings,
                  dashboard: { ...settings.dashboard, compactMode: checked }
                })}
              />
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibilité du profil
              </label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, profileVisibility: e.target.value as 'public' | 'private' | 'selective' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="public">Public</option>
                <option value="private">Privé</option>
                <option value="selective">Sélectif</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Partage de données</h3>
                <p className="text-sm text-gray-500">Autoriser le partage de données anonymes</p>
              </div>
              <Toggle
                checked={settings.privacy.dataSharing}
                onChange={(checked) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, dataSharing: checked }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Suivi analytique</h3>
                <p className="text-sm text-gray-500">Autoriser le suivi pour améliorer l'expérience</p>
              </div>
              <Toggle
                checked={settings.privacy.analyticsTracking}
                onChange={(checked) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, analyticsTracking: checked }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Cookies marketing</h3>
                <p className="text-sm text-gray-500">Autoriser les cookies pour la publicité ciblée</p>
              </div>
              <Toggle
                checked={settings.privacy.marketingCookies}
                onChange={(checked) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, marketingCookies: checked }
                })}
              />
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Authentification à deux facteurs</h3>
                <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
              </div>
              <Toggle
                checked={settings.security.twoFactorAuth}
                onChange={(checked) => setSettings({
                  ...settings,
                  security: { ...settings.security, twoFactorAuth: checked }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Délai d'expiration de session (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration du mot de passe (jours)
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={settings.security.passwordExpiry}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, passwordExpiry: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Notifications de connexion</h3>
                <p className="text-sm text-gray-500">Être notifié lors de nouvelles connexions</p>
              </div>
              <Toggle
                checked={settings.security.loginNotifications}
                onChange={(checked) => setSettings({
                  ...settings,
                  security: { ...settings.security, loginNotifications: checked }
                })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        </div>
        <p className="text-gray-600">Gérez vos préférences et paramètres de compte</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex h-96">
          {/* Settings Tabs */}
          <div className="w-1/4 border-r border-gray-200 pr-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.key
                        ? 'bg-primary-100 text-primary-700 border-primary-300'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {tabs.find(tab => tab.key === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-500">
                Configurez vos préférences pour cette section
              </p>
            </div>

            <div className="space-y-6 max-h-80 overflow-y-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Settings Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <div>
                <input
                  id="import-settings"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById('import-settings')?.click()}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </Button>
              </div>
              <Button onClick={handleReset} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
            <Button onClick={handleSave} className="bg-primary-600 text-white hover:bg-primary-700">
              Sauvegarder les modifications
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};