import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { OrganizationService } from '../../services/organizationService';
import type { Organization, CreateOrganizationData } from '../../services/organizationService';
import toast from 'react-hot-toast';

interface OrganizationFormData {
  name: string;
  email: string;
  password: string;
  type: string;
  description: string;
  website: string;
  phone: string;
  address: string;
}

export const OrganizationManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    email: '',
    password: '',
    type: '',
    description: '',
    website: '',
    phone: '',
    address: ''
  });

  // Load organizations from API
  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        ...(selectedType && { type: selectedType }),
        ...(searchTerm && { search: searchTerm })
      };

      const response = await OrganizationService.getAllOrganizations(filters);
      setOrganizations(response.data.organizations);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erreur lors du chargement des organisations:', error);
      toast.error('Erreur lors du chargement des organisations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === UserRole.SUPERADMIN || user?.role === UserRole.ADMIN) {
      loadOrganizations();
    }
  }, [pagination.page, selectedType, searchTerm, user]);

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      type: '',
      description: '',
      website: '',
      phone: '',
      address: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (organization: Organization) => {
    setSelectedOrganization(organization);
    setFormData({
      name: organization.name,
      email: organization.email,
      password: '', // Password should not be pre-filled
      type: organization.type,
      description: organization.description || '',
      website: organization.website || '',
      phone: organization.phone || '',
      address: organization.address || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (organization: Organization) => {
    setSelectedOrganization(organization);
    setShowViewModal(true);
  };

  // CRUD operations
  const handleCreate = async () => {
    try {
      const createData: CreateOrganizationData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        type: formData.type,
        description: formData.description,
        website: formData.website,
        phone: formData.phone,
        address: formData.address
      };

      await OrganizationService.createOrganization(createData);
      toast.success('Organisation créée avec succès');
      setShowCreateModal(false);
      loadOrganizations();
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      const message = error?.response?.data?.message || 'Erreur lors de la création de l\'organisation';
      toast.error(message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedOrganization) return;

    try {
      const updateData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        website: formData.website,
        phone: formData.phone,
        address: formData.address
      };

      await OrganizationService.updateOrganization(selectedOrganization.id, updateData);
      toast.success('Organisation mise à jour avec succès');
      setShowEditModal(false);
      loadOrganizations();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      const message = error?.response?.data?.message || 'Erreur lors de la mise à jour de l\'organisation';
      toast.error(message);
    }
  };

  const handleDelete = async (organizationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette organisation ? Cette action est irréversible.')) return;

    try {
      await OrganizationService.deleteOrganization(organizationId);
      toast.success('Organisation supprimée avec succès');
      loadOrganizations();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      const message = error?.response?.data?.message || 'Erreur lors de la suppression de l\'organisation';
      toast.error(message);
    }
  };

  const getStatusBadge = (isActive: boolean, isVerified?: boolean) => {
    if (!isActive) {
      return 'bg-red-100 text-red-800';
    }
    if (isVerified === false) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isActive: boolean, isVerified?: boolean) => {
    if (!isActive) {
      return 'Suspendu';
    }
    if (isVerified === false) {
      return 'En attente de vérification';
    }
    return 'Actif';
  };

  // Check authorization
  if (user?.role !== UserRole.SUPERADMIN && user?.role !== UserRole.ADMIN) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Accès refusé</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Gestion des Organisations</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Gérez les organisations partenaires et leurs accès
          </p>
        </div>
        {user?.role === UserRole.SUPERADMIN && (
          <Button onClick={openCreateModal} className="mt-4 sm:mt-0">
            Créer une organisation
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m14 0v-5H5v5" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total</p>
              <p className="text-2xl font-semibold text-secondary-900">{pagination.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Actives</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {organizations.filter(org => org.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">En attente</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {organizations.filter(org => org.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Programmes</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {organizations.reduce((sum, org) => sum + (org._count?.programs || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Recherche
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher une organisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Type
            </label>
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="Agence Publique">Agence Publique</option>
              <option value="Organisme Consulaire">Organisme Consulaire</option>
              <option value="Banque Publique">Banque Publique</option>
              <option value="Collectivité Territoriale">Collectivité Territoriale</option>
              <option value="Établissement Public">Établissement Public</option>
              <option value="Association">Association</option>
              <option value="Privé">Privé</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
              }}
              className="w-full"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Organisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Programmes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {organizations.map((organization) => (
                <tr key={organization.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-secondary-900">
                        {organization.name}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {organization.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {organization.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    <div>
                      {organization.phone && (
                        <div className="text-sm text-secondary-900">{organization.phone}</div>
                      )}
                      {organization.website && (
                        <div className="text-sm text-secondary-500">
                          <a href={organization.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                            {organization.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(organization.status === 'ACTIVE', true)}`}>
                      {getStatusText(organization.status === 'ACTIVE', true)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {organization._count?.programs || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {new Date(organization.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewModal(organization)}
                      >
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(organization)}
                      >
                        Modifier
                      </Button>
                      {user?.role === UserRole.SUPERADMIN && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(organization.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-secondary-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
              >
                Suivant
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-secondary-700">
                  Affichage de{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                  {' '}à{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>
                  {' '}sur{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="rounded-l-md"
                  >
                    Précédent
                  </Button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? 'primary' : 'outline'}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className="border-l-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="rounded-r-md border-l-0"
                  >
                    Suivant
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Créer une nouvelle organisation
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom de l'organisation *
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mot de passe *
                        </label>
                        <input
                          type="password"
                          className="form-input"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type d'organisation *
                        </label>
                        <select
                          className="form-select"
                          value={formData.type}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                          required
                        >
                          <option value="">Sélectionner un type</option>
                          <option value="Agence Publique">Agence Publique</option>
                          <option value="Organisme Consulaire">Organisme Consulaire</option>
                          <option value="Banque Publique">Banque Publique</option>
                          <option value="Collectivité Territoriale">Collectivité Territoriale</option>
                          <option value="Établissement Public">Établissement Public</option>
                          <option value="Association">Association</option>
                          <option value="Privé">Privé</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          className="form-textarea"
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            className="form-input"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Site web
                          </label>
                          <input
                            type="url"
                            className="form-input"
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse
                        </label>
                        <textarea
                          className="form-textarea"
                          rows={2}
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleCreate}
                  className="w-full sm:w-auto sm:ml-3"
                  disabled={!formData.name || !formData.email || !formData.password || !formData.type}
                >
                  Créer l'organisation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOrganization && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Modifier l'organisation
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom de l'organisation *
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-input"
                          value={formData.email}
                          disabled
                          title="L'email ne peut pas être modifié"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type d'organisation *
                        </label>
                        <select
                          className="form-select"
                          value={formData.type}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                          required
                        >
                          <option value="">Sélectionner un type</option>
                          <option value="Agence Publique">Agence Publique</option>
                          <option value="Organisme Consulaire">Organisme Consulaire</option>
                          <option value="Banque Publique">Banque Publique</option>
                          <option value="Collectivité Territoriale">Collectivité Territoriale</option>
                          <option value="Établissement Public">Établissement Public</option>
                          <option value="Association">Association</option>
                          <option value="Privé">Privé</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          className="form-textarea"
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Téléphone
                          </label>
                          <input
                            type="tel"
                            className="form-input"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Site web
                          </label>
                          <input
                            type="url"
                            className="form-input"
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse
                        </label>
                        <textarea
                          className="form-textarea"
                          rows={2}
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleUpdate}
                  className="w-full sm:w-auto sm:ml-3"
                  disabled={!formData.name || !formData.type}
                >
                  Mettre à jour
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedOrganization && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Détails de l'organisation
                    </h3>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Nom</h5>
                          <p className="text-sm text-gray-600">{selectedOrganization.name}</p>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Email</h5>
                          <p className="text-sm text-gray-600">{selectedOrganization.email}</p>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Type</h5>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {selectedOrganization.type}
                          </span>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Statut</h5>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedOrganization.status === 'ACTIVE', true)}`}>
                            {getStatusText(selectedOrganization.status === 'ACTIVE', true)}
                          </span>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Téléphone</h5>
                          <p className="text-sm text-gray-600">{selectedOrganization.phone || 'Non renseigné'}</p>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Site web</h5>
                          <p className="text-sm text-gray-600">
                            {selectedOrganization.website ? (
                              <a href={selectedOrganization.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                                {selectedOrganization.website}
                              </a>
                            ) : 'Non renseigné'}
                          </p>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Programmes</h5>
                          <p className="text-sm text-gray-600">{selectedOrganization._count?.programs || 0}</p>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Date de création</h5>
                          <p className="text-sm text-gray-600">
                            {new Date(selectedOrganization.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      {selectedOrganization.description && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Description</h5>
                          <p className="text-sm text-gray-600">{selectedOrganization.description}</p>
                        </div>
                      )}

                      {selectedOrganization.address && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Adresse</h5>
                          <p className="text-sm text-gray-600">{selectedOrganization.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                  className="w-full sm:w-auto"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};