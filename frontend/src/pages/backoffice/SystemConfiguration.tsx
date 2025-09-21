import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { Button } from '../../components/ui/Button';

interface SystemSettings {
  maxApplicationsPerUser: number;
  applicationDeadlineDays: number;
  emailNotifications: boolean;
  autoArchivePrograms: boolean;
  maintenanceMode: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  // Nouveaux paramètres avancés
  platformName: string;
  platformLogo: string;
  supportEmail: string;
  maxProgramsPerOrganization: number;
  autoReviewEnabled: boolean;
  reviewScoreThreshold: number;
  sessionTimeoutMinutes: number;
  rateLimitPerHour: number;
  backupFrequencyHours: number;
  analyticsEnabled: boolean;
  multiLanguageEnabled: boolean;
  defaultLanguage: string;
  currencyCode: string;
  minApplicationAmount: number;
  maxApplicationAmount: number;
  requireDocumentVerification: boolean;
  allowPublicRegistration: boolean;
  passwordMinLength: number;
}

interface ValidationErrors {
  [key: string]: string;
}

export const SystemConfiguration: React.FC = () => {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<SystemSettings>({
    maxApplicationsPerUser: 10,
    applicationDeadlineDays: 30,
    emailNotifications: true,
    autoArchivePrograms: false,
    maintenanceMode: false,
    maxFileSize: 50,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    // Nouveaux paramètres avec valeurs par défaut
    platformName: 'GROWF - Plateforme de Financement',
    platformLogo: '/logo-growf.png',
    supportEmail: 'support@growf.fr',
    maxProgramsPerOrganization: 25,
    autoReviewEnabled: false,
    reviewScoreThreshold: 75,
    sessionTimeoutMinutes: 120,
    rateLimitPerHour: 1000,
    backupFrequencyHours: 24,
    analyticsEnabled: true,
    multiLanguageEnabled: false,
    defaultLanguage: 'fr',
    currencyCode: 'EUR',
    minApplicationAmount: 1000,
    maxApplicationAmount: 500000,
    requireDocumentVerification: true,
    allowPublicRegistration: true,
    passwordMinLength: 8
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Seul le SUPERADMIN peut accéder à cette page
  if (user?.role !== UserRole.SUPERADMIN) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Accès non autorisé
        </h2>
        <p className="text-red-600">
          Seuls les super-administrateurs peuvent accéder à la configuration système.
        </p>
      </div>
    );
  }

  // Validation functions
  const validateSettings = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (settings.maxApplicationsPerUser < 1 || settings.maxApplicationsPerUser > 50) {
      newErrors.maxApplicationsPerUser = 'Doit être entre 1 et 50';
    }

    if (settings.applicationDeadlineDays < 7 || settings.applicationDeadlineDays > 90) {
      newErrors.applicationDeadlineDays = 'Doit être entre 7 et 90 jours';
    }

    if (settings.maxFileSize < 1 || settings.maxFileSize > 100) {
      newErrors.maxFileSize = 'Doit être entre 1 et 100 MB';
    }

    if (settings.platformName.trim().length < 3) {
      newErrors.platformName = 'Minimum 3 caractères';
    }

    if (!settings.supportEmail.includes('@')) {
      newErrors.supportEmail = 'Email invalide';
    }

    if (settings.minApplicationAmount < 0) {
      newErrors.minApplicationAmount = 'Doit être positif';
    }

    if (settings.maxApplicationAmount <= settings.minApplicationAmount) {
      newErrors.maxApplicationAmount = 'Doit être supérieur au montant minimum';
    }

    if (settings.maxProgramsPerOrganization < 1) {
      newErrors.maxProgramsPerOrganization = 'Minimum 1 programme';
    }

    if (settings.passwordMinLength < 6 || settings.passwordMinLength > 20) {
      newErrors.passwordMinLength = 'Doit être entre 6 et 20 caractères';
    }

    if (settings.sessionTimeoutMinutes < 15 || settings.sessionTimeoutMinutes > 480) {
      newErrors.sessionTimeoutMinutes = 'Doit être entre 15 et 480 minutes';
    }

    if (settings.rateLimitPerHour < 100 || settings.rateLimitPerHour > 10000) {
      newErrors.rateLimitPerHour = 'Doit être entre 100 et 10000';
    }

    if (settings.reviewScoreThreshold < 0 || settings.reviewScoreThreshold > 100) {
      newErrors.reviewScoreThreshold = 'Doit être entre 0 et 100%';
    }

    if (settings.backupFrequencyHours < 1 || settings.backupFrequencyHours > 168) {
      newErrors.backupFrequencyHours = 'Doit être entre 1 et 168 heures';
    }

    return newErrors;
  };

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [settings]);

  // Reset changes tracker on initial load
  useEffect(() => {
    setHasUnsavedChanges(false);
  }, []);

  const handleSaveSettings = async () => {
    const validationErrors = validateSettings();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert('Veuillez corriger les erreurs avant de sauvegarder');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Intégrer avec l'API backend
      console.log('Sauvegarde des paramètres:', settings);

      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Configuration sauvegardée avec succès !');
      setHasUnsavedChanges(false);
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaintenanceToggle = () => {
    setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
        <h1 className="text-2xl font-bold text-red-900 mb-2 flex items-center">
          <span className="mr-2">⚙️</span>
          Configuration Système
          {hasUnsavedChanges && (
            <span className="ml-3 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
              ⚠️ Modifications non sauvegardées
            </span>
          )}
        </h1>
        <p className="text-gray-600">
          Paramètres globaux de la plateforme GROWF
        </p>
      </div>

      {/* État du système */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Statut Système</p>
              <p className="text-xl font-bold text-green-900">🟢 Opérationnel</p>
            </div>
            <Button
              onClick={handleMaintenanceToggle}
              variant={settings.maintenanceMode ? "danger" : "outline"}
              size="sm"
            >
              {settings.maintenanceMode ? '🔧 Maintenance ON' : '🔧 Maintenance OFF'}
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📈</span>
            <div>
              <p className="text-sm font-medium text-blue-800">Performances</p>
              <p className="text-xl font-bold text-blue-900">Excellentes</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔒</span>
            <div>
              <p className="text-sm font-medium text-purple-800">Sécurité</p>
              <p className="text-xl font-bold text-purple-900">Sécurisé</p>
            </div>
          </div>
        </div>
      </div>

      {/* Paramètres Applications */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📄</span>
          Paramètres des Applications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre maximum d'applications par utilisateur
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.maxApplicationsPerUser}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                maxApplicationsPerUser: parseInt(e.target.value)
              }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.maxApplicationsPerUser
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.maxApplicationsPerUser && (
              <p className="mt-1 text-sm text-red-600">{errors.maxApplicationsPerUser}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Délai de traitement (jours)
            </label>
            <input
              type="number"
              min="7"
              max="90"
              value={settings.applicationDeadlineDays}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                applicationDeadlineDays: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Paramètres Fichiers */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📎</span>
          Paramètres des Fichiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taille maximale des fichiers (MB)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.maxFileSize}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                maxFileSize: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Types de fichiers autorisés
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md bg-gray-50">
              {settings.allowedFileTypes.map((type, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  .{type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Paramètres Notifications */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📧</span>
          Paramètres des Notifications
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Notifications par email</p>
              <p className="text-sm text-gray-600">Envoyer des notifications automatiques par email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  emailNotifications: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Archivage automatique des programmes</p>
              <p className="text-sm text-gray-600">Archiver automatiquement les programmes expirés</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoArchivePrograms}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  autoArchivePrograms: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Paramètres de la Plateforme */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🏢</span>
          Paramètres de la Plateforme
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la plateforme
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                platformName: e.target.value
              }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.platformName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.platformName && (
              <p className="mt-1 text-sm text-red-600">{errors.platformName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de support
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                supportEmail: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code de devise
            </label>
            <select
              value={settings.currencyCode}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                currencyCode: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - Dollar US</option>
              <option value="GBP">GBP - Livre Sterling</option>
              <option value="CHF">CHF - Franc Suisse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Langue par défaut
            </label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                defaultLanguage: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      </div>

      {/* Paramètres Financiers */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">💰</span>
          Paramètres Financiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant minimum des candidatures ({settings.currencyCode})
            </label>
            <input
              type="number"
              min="0"
              value={settings.minApplicationAmount}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                minApplicationAmount: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant maximum des candidatures ({settings.currencyCode})
            </label>
            <input
              type="number"
              min="0"
              value={settings.maxApplicationAmount}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                maxApplicationAmount: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum de programmes par organisation
            </label>
            <input
              type="number"
              min="1"
              value={settings.maxProgramsPerOrganization}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                maxProgramsPerOrganization: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Paramètres de Sécurité */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🔒</span>
          Paramètres de Sécurité
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longueur minimale du mot de passe
            </label>
            <input
              type="number"
              min="6"
              max="20"
              value={settings.passwordMinLength}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                passwordMinLength: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout de session (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="480"
              value={settings.sessionTimeoutMinutes}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                sessionTimeoutMinutes: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite de requêtes par heure
            </label>
            <input
              type="number"
              min="100"
              max="10000"
              value={settings.rateLimitPerHour}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                rateLimitPerHour: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Vérification des documents obligatoire</p>
              <p className="text-sm text-gray-600">Exiger la vérification des documents pour toutes les candidatures</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireDocumentVerification}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  requireDocumentVerification: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Inscription publique autorisée</p>
              <p className="text-sm text-gray-600">Permettre aux utilisateurs de s'inscrire sans invitation</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowPublicRegistration}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  allowPublicRegistration: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Paramètres Avancés */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Paramètres Avancés
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seuil de score pour revue automatique (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.reviewScoreThreshold}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                reviewScoreThreshold: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fréquence de sauvegarde (heures)
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={settings.backupFrequencyHours}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                backupFrequencyHours: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Revue automatique activée</p>
              <p className="text-sm text-gray-600">Activer la revue automatique des candidatures avec IA</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoReviewEnabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  autoReviewEnabled: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Analytics activées</p>
              <p className="text-sm text-gray-600">Collecter des données analytiques sur l'utilisation de la plateforme</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.analyticsEnabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  analyticsEnabled: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Support multilingue</p>
              <p className="text-sm text-gray-600">Activer le support pour plusieurs langues sur la plateforme</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.multiLanguageEnabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  multiLanguageEnabled: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🚨</span>
          Actions Système
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">🗄️</span>
            <span className="text-sm">Sauvegarde DB</span>
          </Button>

          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">🧹</span>
            <span className="text-sm">Nettoyage Cache</span>
          </Button>

          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">📊</span>
            <span className="text-sm">Rapport Système</span>
          </Button>

          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">🔄</span>
            <span className="text-sm">Redémarrer</span>
          </Button>
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-end space-x-4">
          <Button variant="outline">
            Annuler
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? '⏳ Sauvegarde...' : '💾 Sauvegarder la configuration'}
          </Button>
        </div>
      </div>
    </div>
  );
};