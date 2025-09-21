import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { Button } from '../../components/ui/Button';

export const Analytics: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedChart, setSelectedChart] = useState('applications');

  const canViewAnalytics = user?.role === UserRole.SUPERADMIN || user?.role === UserRole.ADMIN;

  if (!canViewAnalytics) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Accès non autorisé
        </h2>
        <p className="text-red-600">
          Seuls les administrateurs peuvent consulter les statistiques.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-2">📈</span>
              Analytics & Rapports
            </h1>
            <p className="text-gray-600">
              Analyses détaillées et rapports de performance de la plateforme
            </p>
          </div>

          <div className="flex space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="3m">3 derniers mois</option>
              <option value="12m">12 derniers mois</option>
            </select>
            <Button variant="outline">📤 Exporter</Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Applications Totales</p>
              <p className="text-3xl font-bold text-blue-900">1,247</p>
              <p className="text-sm text-blue-600 mt-1">+12% vs période précédente</p>
            </div>
            <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📄</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Taux d'Approbation</p>
              <p className="text-3xl font-bold text-green-900">67%</p>
              <p className="text-sm text-green-600 mt-1">+3% vs période précédente</p>
            </div>
            <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Budget Distribué</p>
              <p className="text-3xl font-bold text-purple-900">2.1M€</p>
              <p className="text-sm text-purple-600 mt-1">+18% vs période précédente</p>
            </div>
            <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Temps Moyen</p>
              <p className="text-3xl font-bold text-orange-900">14j</p>
              <p className="text-sm text-orange-600 mt-1">-2j vs période précédente</p>
            </div>
            <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">⏱️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique principal */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Évolution des Applications</h3>
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="applications">Applications</option>
              <option value="approvals">Approbations</option>
              <option value="budget">Budget</option>
            </select>
          </div>

          {/* Graphique simulé */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <span className="text-4xl">📊</span>
              <p className="text-gray-500 mt-2">Graphique en temps réel</p>
              <p className="text-sm text-gray-400">Évolution sur {selectedPeriod}</p>
            </div>
          </div>
        </div>

        {/* Répartition par secteur */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Secteur</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm font-medium">Technologie</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
                <span className="text-sm text-gray-600 w-12">45%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm font-medium">Écologie</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '28%'}}></div>
                </div>
                <span className="text-sm text-gray-600 w-12">28%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm font-medium">Santé</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: '15%'}}></div>
                </div>
                <span className="text-sm text-gray-600 w-12">15%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm font-medium">Autres</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: '12%'}}></div>
                </div>
                <span className="text-sm text-gray-600 w-12">12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables d'analyse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top programmes */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Programmes les Plus Demandés
          </h3>

          <div className="space-y-3">
            {[
              { name: 'Programme Innovation 2024', applications: 156, budget: '2.5M€' },
              { name: 'Aide Écologique 2024', applications: 203, budget: '1.8M€' },
              { name: 'Subvention Numérique', applications: 87, budget: '1.2M€' },
              { name: 'Aide Export', applications: 64, budget: '800K€' }
            ].map((program, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{program.name}</p>
                  <p className="text-sm text-gray-600">{program.applications} applications</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">{program.budget}</p>
                  <p className="text-xs text-gray-500">Budget</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance par région */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🗺️</span>
            Performance par Région
          </h3>

          <div className="space-y-3">
            {[
              { region: 'Île-de-France', applications: 342, taux: 72 },
              { region: 'Auvergne-Rhône-Alpes', applications: 198, taux: 68 },
              { region: 'Nouvelle-Aquitaine', applications: 156, taux: 65 },
              { region: 'Occitanie', applications: 134, taux: 71 }
            ].map((region, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{region.region}</p>
                  <p className="text-sm text-gray-600">{region.applications} applications</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{region.taux}%</p>
                  <p className="text-xs text-gray-500">Taux succès</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rapports spéciaux pour SUPERADMIN */}
      {user?.role === UserRole.SUPERADMIN && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Rapports Spécialisés SUPERADMIN
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">👥</span>
                <h4 className="font-medium">Rapport Utilisateurs</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Analyse complète de l'activité des utilisateurs</p>
              <Button size="sm" variant="outline" className="w-full">Générer</Button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">💰</span>
                <h4 className="font-medium">Rapport Financier</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Analyse des budgets et distributions</p>
              <Button size="sm" variant="outline" className="w-full">Générer</Button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">🔒</span>
                <h4 className="font-medium">Rapport Sécurité</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Logs de sécurité et accès système</p>
              <Button size="sm" variant="outline" className="w-full">Générer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Alertes et recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">💡</span>
          Recommandations & Alertes
        </h3>

        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <span className="text-yellow-500 text-lg">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Budget Programme Innovation bientôt épuisé</p>
              <p className="text-sm text-yellow-700">75% du budget utilisé. Considérer un rallongement.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-blue-500 text-lg">💡</span>
            <div>
              <p className="font-medium text-blue-800">Augmentation des demandes dans le secteur santé</p>
              <p className="text-sm text-blue-700">+35% ce mois. Opportunité de créer un programme dédié.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <span className="text-green-500 text-lg">📈</span>
            <div>
              <p className="font-medium text-green-800">Performance excellente en Île-de-France</p>
              <p className="text-sm text-green-700">Taux d'approbation de 72%, le plus élevé cette année.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};