import React, { useState } from 'react';
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
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx']
  });
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Intégrer avec l'API backend
      console.log('Sauvegarde des paramètres:', settings);

      // Simulation d'un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Configuration sauvegardée avec succès !');
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🚨</span>
          Actions Système
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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