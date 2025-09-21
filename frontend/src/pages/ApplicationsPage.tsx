import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
// import { useAuthStore } from '../store/authStore';
import { ApplicationService } from '../services/applicationService';
import type { Application, ApplicationFilters } from '../types/application';
import { toast } from 'react-hot-toast';


interface ApplicationStats {
  total: number;
  draft: number;
  submitted: number;
  under_review: number;
  approved: number;
  rejected: number;
  totalAmountRequested: number;
  totalAmountApproved: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  // const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<ApplicationFilters>({
    page: 1,
    limit: 10
  });


  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await ApplicationService.getMyApplications(filters);
      setApplications(response.data.applications);
      setPagination(response.data.pagination);

      // Calculate stats from the loaded applications
      const applications = response.data.applications;
      const statResponse = await ApplicationService.getApplicationStatistics();
      setStats({
        total: applications.length,
        draft: applications.filter((a: Application) => a.status === 'DRAFT').length,
        submitted: applications.filter((a: Application) => a.status === 'SUBMITTED').length,
        under_review: applications.filter((a: Application) => a.status === 'UNDER_REVIEW').length,
        approved: applications.filter((a: Application) => a.status === 'APPROVED').length,
        rejected: applications.filter((a: Application) => a.status === 'REJECTED').length,
        totalAmountRequested: statResponse.data.totalApplications || 0,
        totalAmountApproved: applications.filter((a: Application) => a.status === 'APPROVED').length
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<ApplicationFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getStatusBadge = (status: Application['status']) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', label: '📝 Brouillon', icon: '📝' },
      SUBMITTED: { color: 'bg-blue-100 text-blue-800', label: '📤 Soumise', icon: '📤' },
      UNDER_REVIEW: { color: 'bg-yellow-100 text-yellow-800', label: '👁️ En cours d\'examen', icon: '👁️' },
      APPROVED: { color: 'bg-green-100 text-green-800', label: '✅ Approuvée', icon: '✅' },
      REJECTED: { color: 'bg-red-100 text-red-800', label: '❌ Rejetée', icon: '❌' },
      CANCELLED: { color: 'bg-gray-100 text-gray-600', label: '🚫 Annulée', icon: '🚫' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (application: Application) => {
    const amount = application.program.amountMax || 0;
    let priority: 'low' | 'medium' | 'high' = 'low';
    if (amount > 100000) priority = 'high';
    else if (amount > 50000) priority = 'medium';

    const priorityConfig = {
      low: { color: 'bg-green-100 text-green-800', label: '🟢 Faible' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: '🟡 Moyenne' },
      high: { color: 'bg-red-100 text-red-800', label: '🔴 Haute' }
    };

    const config = priorityConfig[priority];
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInDays = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Aujourd\'hui';
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffInDays / 30)} mois`;
  };

  const formatTimeLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffInDays = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays <= 0) return 'Expiré';
    if (diffInDays === 1) return '1 jour restant';
    if (diffInDays < 7) return `${diffInDays} jours restants`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semaines restantes`;
    return `${Math.floor(diffInDays / 30)} mois restants`;
  };

  const handleApplicationClick = (application: Application) => {
    if (application.status === 'DRAFT') {
      navigate(`/programs/${application.programId}/apply?applicationId=${application.id}`);
    } else {
      setSelectedApplication(application);
      setShowDetailsModal(true);
    }
  };

  const handleContinueApplication = (application: Application) => {
    navigate(`/programs/${application.programId}/apply?applicationId=${application.id}`);
  };

  const handleViewProgram = (programId: string) => {
    navigate(`/programs/${programId}`);
  };

  const handleCancelApplication = async (applicationId: string) => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette candidature ?')) {
      try {
        await ApplicationService.updateApplicationStatus(applicationId, 'CANCELLED');
        toast.success('Candidature annulée avec succès');
        loadApplications();
      } catch (error) {
        toast.error('Erreur lors de l\'annulation de la candidature');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Mes Candidatures
            </h1>
            <p className="text-gray-600">
              Suivez l'état de vos demandes de financement
            </p>
          </div>

          <Button
            onClick={() => navigate('/programs')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            📝 Nouvelle candidature
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total candidatures</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">En cours</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.submitted + stats.under_review}</p>
                <p className="text-xs text-gray-500">{stats.draft} brouillons</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-lg">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Approuvées</h3>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-xs text-gray-500">{formatCurrency(stats.totalAmountApproved)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Montant total demandé</h3>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalAmountRequested)}</p>
                <p className="text-xs text-gray-500">
                  Taux d'approbation: {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange({ status: e.target.value === 'all' ? undefined : e.target.value as Application['status'] })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="DRAFT">Brouillons</option>
            <option value="SUBMITTED">Soumises</option>
            <option value="UNDER_REVIEW">En examen</option>
            <option value="APPROVED">Approuvées</option>
            <option value="REJECTED">Rejetées</option>
          </select>

          <select
            value={pagination.limit}
            onChange={(e) => handleFilterChange({ limit: Number(e.target.value) })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5 par page</option>
            <option value={10}>10 par page</option>
            <option value={20}>20 par page</option>
            <option value={50}>50 par page</option>
          </select>

          <div className="text-sm text-gray-500 flex items-center">
            {pagination.total} candidature{pagination.total > 1 ? 's' : ''} au total
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((application) => (
          <div
            key={application.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleApplicationClick(application)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{application.program.title}</h3>
                  {getStatusBadge(application.status)}
                  {getPriorityBadge(application)}
                </div>
                <p className="text-sm text-gray-600 mb-1">{application.program.organization.name}</p>
                <div className="flex items-center space-x-4">
                  {application.program.amountMin && application.program.amountMax && (
                    <p className="text-lg font-medium text-green-600">
                      {formatCurrency(application.program.amountMin)} - {formatCurrency(application.program.amountMax)}
                    </p>
                  )}
                  {application.score && (
                    <span className="text-sm text-blue-600 font-medium">Score: {application.score}/100</span>
                  )}
                </div>
              </div>

              <div className="text-right space-y-2">
                {application.program.deadline && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Échéance:</span> {formatTimeLeft(application.program.deadline)}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Dernière activité:</span> {formatTimeAgo(application.updatedAt)}
                </div>
              </div>
            </div>

            {/* Document count for applications */}
            {application.documents && application.documents.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>📄 {application.documents.length} document{application.documents.length > 1 ? 's' : ''} joint{application.documents.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {/* Messages count */}
            {application.messages && application.messages.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <span>💬 {application.messages.length} message{application.messages.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {application.submittedAt && (
                  <span>Soumise le {new Date(application.submittedAt).toLocaleDateString('fr-FR')}</span>
                )}
                {application.reviewedAt && (
                  <span>• Évaluée le {new Date(application.reviewedAt).toLocaleDateString('fr-FR')}</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProgram(application.programId);
                  }}
                >
                  Voir programme
                </Button>

                {application.status === 'DRAFT' && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContinueApplication(application);
                    }}
                  >
                    Continuer →
                  </Button>
                )}

                {(application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelApplication(application.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Annuler
                  </Button>
                )}

                {application.status !== 'DRAFT' && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplicationClick(application);
                    }}
                  >
                    Voir détails →
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {applications.length === 0 && !loading && (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filters.status ? 'Aucune candidature avec ce statut' : 'Aucune candidature'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.status
              ? 'Modifiez le filtre pour voir d\'autres candidatures.'
              : 'Vous n\'avez pas encore soumis de candidature. Découvrez les programmes disponibles.'}
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate('/programs')}>
              📝 Nouvelle candidature
            </Button>
            {filters.status && (
              <Button variant="outline" onClick={() => handleFilterChange({ status: undefined })}>
                Voir toutes les candidatures
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Précédent
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Application Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedApplication ? `Détails - ${selectedApplication.program.title}` : ''}
      >
        {selectedApplication && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedApplication.program.title}</h3>
                <p className="text-gray-600">{selectedApplication.program.organization.name}</p>
              </div>
              {getStatusBadge(selectedApplication.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Montant du programme</h4>
                {selectedApplication.program.amountMin && selectedApplication.program.amountMax ? (
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(selectedApplication.program.amountMin)} - {formatCurrency(selectedApplication.program.amountMax)}
                  </p>
                ) : (
                  <p className="text-gray-500">Non spécifié</p>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Score</h4>
                {selectedApplication.score ? (
                  <p className="text-lg font-semibold text-blue-600">{selectedApplication.score}/100</p>
                ) : (
                  <p className="text-gray-500">Non évalué</p>
                )}
              </div>
            </div>

            {selectedApplication.submittedAt && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Date de soumission</h4>
                <p className="text-gray-600">{new Date(selectedApplication.submittedAt).toLocaleDateString('fr-FR')}</p>
              </div>
            )}

            {selectedApplication.reviewedAt && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Date d'évaluation</h4>
                <p className="text-gray-600">{new Date(selectedApplication.reviewedAt).toLocaleDateString('fr-FR')}</p>
              </div>
            )}

            {selectedApplication.program.description && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Description du programme</h4>
                <p className="text-gray-600">{selectedApplication.program.description}</p>
              </div>
            )}

            {selectedApplication.documents && selectedApplication.documents.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Documents joints</h4>
                <div className="space-y-2">
                  {selectedApplication.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">📄 {doc.originalName}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Fermer
              </Button>
              <Button onClick={() => {
                setShowDetailsModal(false);
                handleViewProgram(selectedApplication.programId);
              }}>
                Voir le programme
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};