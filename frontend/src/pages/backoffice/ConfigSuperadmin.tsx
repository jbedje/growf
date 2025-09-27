import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Toggle';

interface SuperadminConfig {
  systemMaintenance: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    plannedMaintenanceDate: string;
    emergencyContact: string;
  };
  security: {
    forcePasswordReset: boolean;
    enableTwoFactor: boolean;
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
    enableAuditLog: boolean;
  };
  platformSettings: {
    allowNewRegistrations: boolean;
    requireEmailVerification: boolean;
    enableGuestAccess: boolean;
    maxUsersPerOrganization: number;
    dataRetentionDays: number;
    enableDataExport: boolean;
  };
  notifications: {
    emailNotificationsEnabled: boolean;
    smsNotificationsEnabled: boolean;
    pushNotificationsEnabled: boolean;
    criticalAlertsOnly: boolean;
    notificationFrequency: 'immediate' | 'hourly' | 'daily';
  };
  advanced: {
    enableBetaFeatures: boolean;
    allowApiAccess: boolean;
    enableWebhooks: boolean;
    debugMode: boolean;
    performanceMonitoring: boolean;
    autoBackupEnabled: boolean;
    backupFrequencyHours: number;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

export const ConfigSuperadmin: React.FC = () => {
  const { user } = useAuthStore();
  const [config, setConfig] = useState<SuperadminConfig>({
    systemMaintenance: {
      maintenanceMode: false,
      maintenanceMessage: 'Maintenance programmée du système. Retour prévu dans 2 heures.',
      plannedMaintenanceDate: '',
      emergencyContact: 'tech@growf.fr'
    },
    security: {
      forcePasswordReset: false,
      enableTwoFactor: false,
      sessionTimeoutMinutes: 120,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 30,
      enableAuditLog: true
    },
    platformSettings: {
      allowNewRegistrations: true,
      requireEmailVerification: true,
      enableGuestAccess: false,
      maxUsersPerOrganization: 100,
      dataRetentionDays: 365,
      enableDataExport: true
    },
    notifications: {
      emailNotificationsEnabled: true,
      smsNotificationsEnabled: false,
      pushNotificationsEnabled: true,
      criticalAlertsOnly: false,
      notificationFrequency: 'immediate'
    },
    advanced: {
      enableBetaFeatures: false,
      allowApiAccess: true,
      enableWebhooks: false,
      debugMode: false,
      performanceMonitoring: true,
      autoBackupEnabled: true,
      backupFrequencyHours: 24
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof SuperadminConfig>('systemMaintenance');

  // Seul le SUPERADMIN peut accéder à cette page
  if (user?.role !== UserRole.SUPERADMIN) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Accès non autorisé
        </h2>
        <p className="text-red-600">
          Seuls les super-administrateurs peuvent accéder à la configuration avancée.
        </p>
      </div>
    );
  }

  // Validation functions
  const validateConfig = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (config.security.sessionTimeoutMinutes < 15 || config.security.sessionTimeoutMinutes > 480) {
      newErrors.sessionTimeoutMinutes = 'Doit être entre 15 et 480 minutes';
    }

    if (config.security.maxLoginAttempts < 3 || config.security.maxLoginAttempts > 10) {
      newErrors.maxLoginAttempts = 'Doit être entre 3 et 10 tentatives';
    }

    if (config.security.lockoutDurationMinutes < 5 || config.security.lockoutDurationMinutes > 1440) {
      newErrors.lockoutDurationMinutes = 'Doit être entre 5 et 1440 minutes';
    }

    if (config.platformSettings.maxUsersPerOrganization < 1 || config.platformSettings.maxUsersPerOrganization > 1000) {
      newErrors.maxUsersPerOrganization = 'Doit être entre 1 et 1000 utilisateurs';
    }

    if (config.platformSettings.dataRetentionDays < 30 || config.platformSettings.dataRetentionDays > 2555) {
      newErrors.dataRetentionDays = 'Doit être entre 30 et 2555 jours (7 ans)';
    }

    if (config.advanced.backupFrequencyHours < 1 || config.advanced.backupFrequencyHours > 168) {
      newErrors.backupFrequencyHours = 'Doit être entre 1 et 168 heures';
    }

    if (!config.systemMaintenance.emergencyContact.includes('@')) {
      newErrors.emergencyContact = 'Email de contact invalide';
    }

    return newErrors;
  };

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [config]);

  // Reset changes tracker on initial load
  useEffect(() => {
    setHasUnsavedChanges(false);
  }, []);

  const handleSaveConfig = async () => {
    const validationErrors = validateConfig();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert('Veuillez corriger les erreurs avant de sauvegarder');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('Sauvegarde de la configuration superadmin:', config);

      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Configuration superadmin sauvegardée avec succès !');
      setHasUnsavedChanges(false);
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (section: keyof SuperadminConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { key: 'systemMaintenance', label: 'Maintenance Système', icon: '🔧' },
    { key: 'security', label: 'Sécurité Avancée', icon: '🛡️' },
    { key: 'platformSettings', label: 'Paramètres Plateforme', icon: '⚙️' },
    { key: 'notifications', label: 'Notifications', icon: '🔔' },
    { key: 'advanced', label: 'Configuration Avancée', icon: '⚡' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
        <h1 className="text-2xl font-bold text-purple-900 mb-2 flex items-center">
          <span className="mr-2">🏛️</span>
          Configuration Superadmin
          {hasUnsavedChanges && (
            <span className="ml-3 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
              ⚠️ Modifications non sauvegardées
            </span>
          )}
        </h1>
        <p className="text-gray-600">
          Configuration avancée de la plateforme GROWF - Accès Superadmin uniquement
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as keyof SuperadminConfig)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Maintenance Système Tab */}
          {activeTab === 'systemMaintenance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Système</h3>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-800">Mode Maintenance</p>
                    <p className="text-sm text-yellow-600">Active le mode maintenance pour tous les utilisateurs</p>
                  </div>
                  <Toggle
                    checked={config.systemMaintenance.maintenanceMode}
                    onChange={(checked) => updateConfig('systemMaintenance', 'maintenanceMode', checked)}
                    size="md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message de maintenance
                </label>
                <textarea
                  value={config.systemMaintenance.maintenanceMessage}
                  onChange={(e) => updateConfig('systemMaintenance', 'maintenanceMessage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Message affiché aux utilisateurs pendant la maintenance"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de maintenance planifiée
                  </label>
                  <input
                    type="datetime-local"
                    value={config.systemMaintenance.plannedMaintenanceDate}
                    onChange={(e) => updateConfig('systemMaintenance', 'plannedMaintenanceDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact d'urgence
                  </label>
                  <input
                    type="email"
                    value={config.systemMaintenance.emergencyContact}
                    onChange={(e) => updateConfig('systemMaintenance', 'emergencyContact', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.emergencyContact
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                  />
                  {errors.emergencyContact && (
                    <p className="mt-1 text-sm text-red-600">{errors.emergencyContact}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sécurité Avancée Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Sécurité Avancée</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout de session (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    value={config.security.sessionTimeoutMinutes}
                    onChange={(e) => updateConfig('security', 'sessionTimeoutMinutes', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.sessionTimeoutMinutes
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                  />
                  {errors.sessionTimeoutMinutes && (
                    <p className="mt-1 text-sm text-red-600">{errors.sessionTimeoutMinutes}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tentatives de connexion max
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée de verrouillage (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={config.security.lockoutDurationMinutes}
                    onChange={(e) => updateConfig('security', 'lockoutDurationMinutes', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Forcer réinitialisation mot de passe</p>
                    <p className="text-sm text-gray-600">Obliger tous les utilisateurs à changer leur mot de passe</p>
                  </div>
                  <Toggle
                    checked={config.security.forcePasswordReset}
                    onChange={(checked) => updateConfig('security', 'forcePasswordReset', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Authentification à deux facteurs</p>
                    <p className="text-sm text-gray-600">Activer 2FA pour tous les comptes administrateurs</p>
                  </div>
                  <Toggle
                    checked={config.security.enableTwoFactor}
                    onChange={(checked) => updateConfig('security', 'enableTwoFactor', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Journal d'audit activé</p>
                    <p className="text-sm text-gray-600">Enregistrer toutes les actions administratives</p>
                  </div>
                  <Toggle
                    checked={config.security.enableAuditLog}
                    onChange={(checked) => updateConfig('security', 'enableAuditLog', checked)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paramètres Plateforme Tab */}
          {activeTab === 'platformSettings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Paramètres Plateforme</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilisateurs max par organisation
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={config.platformSettings.maxUsersPerOrganization}
                    onChange={(e) => updateConfig('platformSettings', 'maxUsersPerOrganization', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rétention des données (jours)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="2555"
                    value={config.platformSettings.dataRetentionDays}
                    onChange={(e) => updateConfig('platformSettings', 'dataRetentionDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Nouvelles inscriptions autorisées</p>
                    <p className="text-sm text-gray-600">Permettre aux nouveaux utilisateurs de s'inscrire</p>
                  </div>
                  <Toggle
                    checked={config.platformSettings.allowNewRegistrations}
                    onChange={(checked) => updateConfig('platformSettings', 'allowNewRegistrations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Vérification email obligatoire</p>
                    <p className="text-sm text-gray-600">Exiger la vérification d'email pour l'activation</p>
                  </div>
                  <Toggle
                    checked={config.platformSettings.requireEmailVerification}
                    onChange={(checked) => updateConfig('platformSettings', 'requireEmailVerification', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Accès invité activé</p>
                    <p className="text-sm text-gray-600">Permettre la consultation sans compte</p>
                  </div>
                  <Toggle
                    checked={config.platformSettings.enableGuestAccess}
                    onChange={(checked) => updateConfig('platformSettings', 'enableGuestAccess', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Export de données autorisé</p>
                    <p className="text-sm text-gray-600">Permettre aux utilisateurs d'exporter leurs données</p>
                  </div>
                  <Toggle
                    checked={config.platformSettings.enableDataExport}
                    onChange={(checked) => updateConfig('platformSettings', 'enableDataExport', checked)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuration des Notifications</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence des notifications
                </label>
                <select
                  value={config.notifications.notificationFrequency}
                  onChange={(e) => updateConfig('notifications', 'notificationFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="immediate">Immédiate</option>
                  <option value="hourly">Horaire</option>
                  <option value="daily">Quotidienne</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Notifications email</p>
                    <p className="text-sm text-gray-600">Envoyer des notifications par email</p>
                  </div>
                  <Toggle
                    checked={config.notifications.emailNotificationsEnabled}
                    onChange={(checked) => updateConfig('notifications', 'emailNotificationsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Notifications SMS</p>
                    <p className="text-sm text-gray-600">Envoyer des notifications par SMS</p>
                  </div>
                  <Toggle
                    checked={config.notifications.smsNotificationsEnabled}
                    onChange={(checked) => updateConfig('notifications', 'smsNotificationsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Notifications push</p>
                    <p className="text-sm text-gray-600">Envoyer des notifications push sur mobile</p>
                  </div>
                  <Toggle
                    checked={config.notifications.pushNotificationsEnabled}
                    onChange={(checked) => updateConfig('notifications', 'pushNotificationsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Alertes critiques uniquement</p>
                    <p className="text-sm text-gray-600">Limiter aux notifications urgentes</p>
                  </div>
                  <Toggle
                    checked={config.notifications.criticalAlertsOnly}
                    onChange={(checked) => updateConfig('notifications', 'criticalAlertsOnly', checked)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Configuration Avancée Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuration Avancée</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence de sauvegarde (heures)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={config.advanced.backupFrequencyHours}
                  onChange={(e) => updateConfig('advanced', 'backupFrequencyHours', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Fonctionnalités bêta</p>
                    <p className="text-sm text-gray-600">Activer les nouvelles fonctionnalités en test</p>
                  </div>
                  <Toggle
                    checked={config.advanced.enableBetaFeatures}
                    onChange={(checked) => updateConfig('advanced', 'enableBetaFeatures', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Accès API autorisé</p>
                    <p className="text-sm text-gray-600">Permettre l'accès via API externe</p>
                  </div>
                  <Toggle
                    checked={config.advanced.allowApiAccess}
                    onChange={(checked) => updateConfig('advanced', 'allowApiAccess', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Webhooks activés</p>
                    <p className="text-sm text-gray-600">Permettre les intégrations webhook</p>
                  </div>
                  <Toggle
                    checked={config.advanced.enableWebhooks}
                    onChange={(checked) => updateConfig('advanced', 'enableWebhooks', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Mode débogage</p>
                    <p className="text-sm text-gray-600">Afficher les informations de débogage</p>
                  </div>
                  <Toggle
                    checked={config.advanced.debugMode}
                    onChange={(checked) => updateConfig('advanced', 'debugMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Monitoring des performances</p>
                    <p className="text-sm text-gray-600">Surveiller les performances système</p>
                  </div>
                  <Toggle
                    checked={config.advanced.performanceMonitoring}
                    onChange={(checked) => updateConfig('advanced', 'performanceMonitoring', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Sauvegarde automatique</p>
                    <p className="text-sm text-gray-600">Effectuer des sauvegardes automatiques</p>
                  </div>
                  <Toggle
                    checked={config.advanced.autoBackupEnabled}
                    onChange={(checked) => updateConfig('advanced', 'autoBackupEnabled', checked)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Annuler
          </Button>
          <Button
            onClick={handleSaveConfig}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? '⏳ Sauvegarde...' : '💾 Sauvegarder la configuration'}
          </Button>
        </div>
      </div>
    </div>
  );
};