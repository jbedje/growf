import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { Button } from '../../components/ui/Button';

interface Company {
  id: string;
  name: string;
  email: string;
  siret: string;
  sector: string;
  size: string;
  registrationDate: string;
  applicationsCount: number;
  status: 'active' | 'suspended' | 'pending';
}

export const CompanyManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');

  const mockCompanies: Company[] = [
    {
      id: '1',
      name: 'TechStart SAS',
      email: 'contact@techstart.fr',
      siret: '12345678901234',
      sector: 'Technologie',
      size: 'PME',
      registrationDate: '2024-01-15',
      applicationsCount: 3,
      status: 'active'
    },
    {
      id: '2',
      name: 'GreenTech SARL',
      email: 'info@greentech.fr',
      siret: '23456789012345',
      sector: 'Écologie',
      size: 'Startup',
      registrationDate: '2024-02-08',
      applicationsCount: 2,
      status: 'active'
    },
    {
      id: '3',
      name: 'InnovHealth',
      email: 'contact@innovhealth.fr',
      siret: '34567890123456',
      sector: 'Santé',
      size: 'PME',
      registrationDate: '2024-03-12',
      applicationsCount: 1,
      status: 'pending'
    },
    {
      id: '4',
      name: 'DigitalSolutions',
      email: 'hello@digitalsol.fr',
      siret: '45678901234567',
      sector: 'Numérique',
      size: 'Micro-entreprise',
      registrationDate: '2024-02-28',
      applicationsCount: 0,
      status: 'suspended'
    }
  ];

  const handleViewCompany = (company: Company) => {
    alert(`Voir détails de ${company.name}\nEmail: ${company.email}\nSiret: ${company.siret}\nSecteur: ${company.sector}`);
  };

  const handleEditCompany = (company: Company) => {
    const newName = prompt(`Modifier le nom de l'entreprise:`, company.name);
    if (newName && newName !== company.name) {
      alert(`Entreprise renommée de "${company.name}" vers "${newName}"`);
    }
  };

  const handleSuspendCompany = (company: Company) => {
    const action = company.status === 'active' ? 'suspendre' : 'réactiver';
    if (confirm(`Êtes-vous sûr de vouloir ${action} l'entreprise ${company.name} ?`)) {
      const newStatus = company.status === 'active' ? 'suspendue' : 'réactivée';
      alert(`Entreprise ${company.name} ${newStatus} avec succès`);
    }
  };

  const getStatusBadge = (status: Company['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: '🟢 Active' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: '⏱️ En attente' },
      suspended: { color: 'bg-red-100 text-red-800', label: '🚫 Suspendue' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const canManageCompanies = user?.role === UserRole.SUPERADMIN || user?.role === UserRole.ADMIN || user?.role === UserRole.ANALYST;

  if (!canManageCompanies) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Accès non autorisé
        </h2>
        <p className="text-red-600">
          Vous n'avez pas les permissions nécessaires pour gérer les entreprises.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">🏢</span>
          Gestion des Entreprises
        </h1>
        <p className="text-gray-600">
          Administrer les comptes entreprises et porteurs de projet
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🟢</span>
            <div>
              <p className="text-sm font-medium text-green-800">Entreprises Actives</p>
              <p className="text-xl font-bold text-green-900">
                {mockCompanies.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⏱️</span>
            <div>
              <p className="text-sm font-medium text-yellow-800">En Attente</p>
              <p className="text-xl font-bold text-yellow-900">
                {mockCompanies.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📄</span>
            <div>
              <p className="text-sm font-medium text-blue-800">Applications Total</p>
              <p className="text-xl font-bold text-blue-900">
                {mockCompanies.reduce((sum, c) => sum + c.applicationsCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📈</span>
            <div>
              <p className="text-sm font-medium text-purple-800">Nouvelles ce mois</p>
              <p className="text-xl font-bold text-purple-900">12</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="🔍 Rechercher une entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="pending">En attente</option>
            <option value="suspended">Suspendues</option>
          </select>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les secteurs</option>
            <option value="Technologie">Technologie</option>
            <option value="Écologie">Écologie</option>
            <option value="Santé">Santé</option>
            <option value="Numérique">Numérique</option>
          </select>
          <Button variant="outline">📤 Exporter</Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Secteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{company.name}</p>
                      <p className="text-sm text-gray-500">SIRET: {company.siret}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-gray-900">{company.email}</p>
                      <p className="text-sm text-gray-500">{company.size}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {company.sector}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-semibold">{company.applicationsCount}</span> applications
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(company.registrationDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(company.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewCompany(company)}
                    >
                      👁️ Voir
                    </Button>
                    {user?.role !== UserRole.ANALYST && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCompany(company)}
                        >
                          ✏️ Modifier
                        </Button>
                        {company.status === 'active' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleSuspendCompany(company)}
                          >
                            🚫 Suspendre
                          </Button>
                        )}
                        {company.status === 'suspended' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuspendCompany(company)}
                          >
                            ✅ Réactiver
                          </Button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Actions Rapides
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">📧</span>
            <span className="text-sm">Envoyer Newsletter</span>
          </Button>

          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">📊</span>
            <span className="text-sm">Rapport Secteur</span>
          </Button>

          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">🔍</span>
            <span className="text-sm">Audit Comptes</span>
          </Button>

          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">📤</span>
            <span className="text-sm">Export Complet</span>
          </Button>
        </div>
      </div>
    </div>
  );
};