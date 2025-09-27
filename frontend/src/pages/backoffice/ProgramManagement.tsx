import React, { useState, useEffect, useCallback } from 'react';
// import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ProgramService } from '../../services/programService';
import type { Program, CreateProgramData } from '../../types/program';
import toast from 'react-hot-toast';

interface ProgramQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'file';
  required: boolean;
  options?: string[];
}

interface ProgramFormData {
  title: string;
  description: string;
  sector: string[];
  amountMin: number;
  amountMax: number;
  deadline: string;
  criteria: {
    eligibilityCriteria: string[];
    requiredDocuments: string[];
  };
  applicationForm: {
    questions: ProgramQuestion[];
  };
  companySize: string[];
  location: string[];
  tags: string[];
}

export const ProgramManagement: React.FC = () => {
  // const { user } = useAuthStore();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [formData, setFormData] = useState<ProgramFormData>({
    title: '',
    description: '',
    sector: [],
    amountMin: 0,
    amountMax: 0,
    deadline: '',
    criteria: {
      eligibilityCriteria: [],
      requiredDocuments: []
    },
    applicationForm: {
      questions: []
    },
    companySize: [],
    location: [],
    tags: []
  });

  const [newCriterion, setNewCriterion] = useState('');
  const [newDocument, setNewDocument] = useState('');
  const [newQuestion, setNewQuestion] = useState<ProgramQuestion>({
    id: '',
    question: '',
    type: 'text',
    required: false,
    options: []
  });

  // Load programs from API
  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedSector && { sector: selectedSector }),
        ...(searchTerm && { search: searchTerm })
      };

      const response = await ProgramService.getPrograms(filters);
      setPrograms(response.data.programs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
      toast.error('Erreur lors du chargement des programmes');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, selectedStatus, selectedSector, searchTerm]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  // Helper functions
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      sector: [],
      amountMin: 0,
      amountMax: 0,
      deadline: '',
      criteria: {
        eligibilityCriteria: [],
        requiredDocuments: []
      },
      applicationForm: {
        questions: []
      },
      companySize: [],
      location: [],
      tags: []
    });
    setNewCriterion('');
    setNewDocument('');
    setNewQuestion({
      id: '',
      question: '',
      type: 'text',
      required: false,
      options: []
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (program: Program) => {
    setSelectedProgram(program);
    setFormData({
      title: program.title,
      description: program.description,
      sector: program.sector,
      amountMin: program.amountMin || 0,
      amountMax: program.amountMax || 0,
      deadline: program.deadline ? program.deadline.split('T')[0] : '',
      criteria: program.criteria || { eligibilityCriteria: [], requiredDocuments: [] },
      applicationForm: program.applicationForm || { questions: [] },
      companySize: program.companySize || [],
      location: program.location || [],
      tags: program.tags || []
    });
    setShowEditModal(true);
  };

  const openViewModal = (program: Program) => {
    setSelectedProgram(program);
    setShowViewModal(true);
  };

  // CRUD operations
  const handleCreate = async () => {
    try {
      const createData: CreateProgramData = {
        title: formData.title,
        description: formData.description,
        criteria: formData.criteria,
        amountMin: formData.amountMin,
        amountMax: formData.amountMax,
        deadline: formData.deadline,
        sector: formData.sector,
        companySize: formData.companySize,
        location: formData.location,
        tags: formData.tags,
        applicationForm: formData.applicationForm
      };

      await ProgramService.createProgram(createData);
      toast.success('Programme créé avec succès');
      setShowCreateModal(false);
      loadPrograms();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création du programme');
    }
  };

  const handleUpdate = async () => {
    if (!selectedProgram) return;

    try {
      const updateData: Partial<CreateProgramData> = {
        title: formData.title,
        description: formData.description,
        criteria: formData.criteria,
        amountMin: formData.amountMin,
        amountMax: formData.amountMax,
        deadline: formData.deadline,
        sector: formData.sector,
        companySize: formData.companySize,
        location: formData.location,
        tags: formData.tags,
        applicationForm: formData.applicationForm
      };

      await ProgramService.updateProgram(selectedProgram.id, updateData);
      toast.success('Programme mis à jour avec succès');
      setShowEditModal(false);
      loadPrograms();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du programme');
    }
  };

  const handleDelete = async (programId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) return;

    try {
      await ProgramService.deleteProgram(programId);
      toast.success('Programme supprimé avec succès');
      loadPrograms();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du programme');
    }
  };

  const handleStatusChange = async (programId: string, newStatus: Program['status']) => {
    try {
      await ProgramService.updateProgramStatus(programId, newStatus);
      toast.success('Statut mis à jour avec succès');
      loadPrograms();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDuplicate = async (programId: string) => {
    try {
      await ProgramService.duplicateProgram(programId);
      toast.success('Programme dupliqué avec succès');
      loadPrograms();
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      toast.error('Erreur lors de la duplication du programme');
    }
  };

  // Form helpers
  const addCriterion = () => {
    if (newCriterion.trim()) {
      setFormData(prev => ({
        ...prev,
        criteria: {
          ...prev.criteria,
          eligibilityCriteria: [...prev.criteria.eligibilityCriteria, newCriterion.trim()]
        }
      }));
      setNewCriterion('');
    }
  };

  const removeCriterion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        eligibilityCriteria: prev.criteria.eligibilityCriteria.filter((_, i) => i !== index)
      }
    }));
  };

  const addDocument = () => {
    if (newDocument.trim()) {
      setFormData(prev => ({
        ...prev,
        criteria: {
          ...prev.criteria,
          requiredDocuments: [...prev.criteria.requiredDocuments, newDocument.trim()]
        }
      }));
      setNewDocument('');
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        requiredDocuments: prev.criteria.requiredDocuments.filter((_, i) => i !== index)
      }
    }));
  };

  const addQuestion = () => {
    if (newQuestion.question.trim()) {
      const questionWithId = {
        ...newQuestion,
        id: Date.now().toString(),
        question: newQuestion.question.trim()
      };
      setFormData(prev => ({
        ...prev,
        applicationForm: {
          ...prev.applicationForm,
          questions: [...prev.applicationForm.questions, questionWithId]
        }
      }));
      setNewQuestion({
        id: '',
        question: '',
        type: 'text',
        required: false,
        options: []
      });
    }
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      applicationForm: {
        ...prev.applicationForm,
        questions: prev.applicationForm.questions.filter((_, i) => i !== index)
      }
    }));
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '' || program.status === selectedStatus;
    const matchesSector = selectedSector === '' || program.sector.includes(selectedSector);

    return matchesSearch && matchesStatus && matchesSector;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      closed: 'bg-red-100 text-red-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  const getStatusText = (status: string) => {
    const texts = {
      draft: 'Brouillon',
      published: 'Publié',
      closed: 'Fermé',
      archived: 'Archivé'
    };
    return texts[status as keyof typeof texts] || status;
  };

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
          <h1 className="text-2xl font-bold text-secondary-900">Gestion des Programmes</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Gérez vos programmes de financement et subventions
          </p>
        </div>
        <Button onClick={openCreateModal} className="mt-4 sm:mt-0">
          Créer un programme
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
              <p className="text-sm font-medium text-secondary-600">Publiés</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {filteredPrograms.filter(p => p.status === 'PUBLISHED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Brouillons</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {filteredPrograms.filter(p => p.status === 'DRAFT').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Fermés</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {filteredPrograms.filter(p => p.status === 'CLOSED').length}
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
              placeholder="Rechercher un programme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Statut
            </label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
              <option value="CLOSED">Fermé</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Secteur
            </label>
            <select
              className="form-select"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              <option value="">Tous les secteurs</option>
              <option value="Numérique">Numérique</option>
              <option value="Energie">Énergie</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Industrie">Industrie</option>
              <option value="Services">Services</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('');
                setSelectedSector('');
              }}
              className="w-full"
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Programme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Secteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Date limite
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Candidatures
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {filteredPrograms.map((program) => (
                <tr key={program.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-secondary-900">
                        {program.title}
                      </div>
                      <div className="text-sm text-secondary-500 truncate max-w-xs">
                        {program.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {program.sector.map((sect, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {sect}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {program.amountMin && program.amountMax ?
                      `${program.amountMin.toLocaleString()}€ - ${program.amountMax.toLocaleString()}€` :
                      'Non spécifié'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {program.deadline ?
                      new Date(program.deadline).toLocaleDateString('fr-FR') :
                      'Non définie'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(program.status)}`}>
                      {getStatusText(program.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {program._count?.applications || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewModal(program)}
                      >
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(program)}
                      >
                        Modifier
                      </Button>
                      <div className="relative inline-block text-left">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newStatus = program.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';
                            handleStatusChange(program.id, newStatus);
                          }}
                        >
                          {program.status === 'DRAFT' ? 'Publier' : 'Dépublier'}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(program.id)}
                      >
                        Dupliquer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(program.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Supprimer
                      </Button>
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
                  {/* Page numbers */}
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

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Créer un nouveau programme
                    </h3>

                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Titre du programme *
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date limite
                          </label>
                          <input
                            type="date"
                            className="form-input"
                            value={formData.deadline}
                            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          className="form-textarea"
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          required
                        />
                      </div>

                      {/* Financial Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Montant minimum (€)
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            value={formData.amountMin}
                            onChange={(e) => setFormData(prev => ({ ...prev, amountMin: Number(e.target.value) }))}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Montant maximum (€)
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            value={formData.amountMax}
                            onChange={(e) => setFormData(prev => ({ ...prev, amountMax: Number(e.target.value) }))}
                          />
                        </div>
                      </div>

                      {/* Sectors */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Secteurs éligibles
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {['Numérique', 'Energie', 'Agriculture', 'Industrie', 'Services', 'Commerce'].map((sector) => (
                            <label key={sector} className="flex items-center">
                              <input
                                type="checkbox"
                                className="form-checkbox"
                                checked={formData.sector.includes(sector)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData(prev => ({ ...prev, sector: [...prev.sector, sector] }));
                                  } else {
                                    setFormData(prev => ({ ...prev, sector: prev.sector.filter(s => s !== sector) }));
                                  }
                                }}
                              />
                              <span className="ml-2 text-sm text-gray-700">{sector}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Eligibility Criteria */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Critères d'éligibilité
                        </label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="form-input flex-1"
                              placeholder="Ajouter un critère..."
                              value={newCriterion}
                              onChange={(e) => setNewCriterion(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addCriterion();
                                }
                              }}
                            />
                            <Button type="button" onClick={addCriterion}>
                              Ajouter
                            </Button>
                          </div>
                          {formData.criteria.eligibilityCriteria.map((criterion, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">{criterion}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeCriterion(index)}
                              >
                                Supprimer
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Required Documents */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Documents requis
                        </label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="form-input flex-1"
                              placeholder="Ajouter un document..."
                              value={newDocument}
                              onChange={(e) => setNewDocument(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addDocument();
                                }
                              }}
                            />
                            <Button type="button" onClick={addDocument}>
                              Ajouter
                            </Button>
                          </div>
                          {formData.criteria.requiredDocuments.map((document, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">{document}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeDocument(index)}
                              >
                                Supprimer
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Application Questions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Questions du formulaire de candidature
                        </label>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Question..."
                              value={newQuestion.question}
                              onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                            />
                            <select
                              className="form-select"
                              value={newQuestion.type}
                              onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value as any }))}
                            >
                              <option value="text">Texte</option>
                              <option value="number">Nombre</option>
                              <option value="boolean">Oui/Non</option>
                              <option value="select">Choix multiple</option>
                              <option value="file">Fichier</option>
                            </select>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="form-checkbox"
                                  checked={newQuestion.required}
                                  onChange={(e) => setNewQuestion(prev => ({ ...prev, required: e.target.checked }))}
                                />
                                <span className="ml-1 text-sm">Requis</span>
                              </label>
                              <Button type="button" onClick={addQuestion}>
                                Ajouter
                              </Button>
                            </div>
                          </div>
                          {formData.applicationForm.questions.map((question, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                              <div>
                                <span className="text-sm font-medium">{question.question}</span>
                                <div className="text-xs text-gray-500">
                                  Type: {question.type} | {question.required ? 'Requis' : 'Optionnel'}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeQuestion(index)}
                              >
                                Supprimer
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleCreate}
                  className="w-full sm:w-auto sm:ml-3"
                  disabled={!formData.title || !formData.description}
                >
                  Créer le programme
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
      {showEditModal && selectedProgram && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Modifier le programme
                    </h3>

                    {/* Same form content as create modal */}
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Titre du programme *
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date limite
                          </label>
                          <input
                            type="date"
                            className="form-input"
                            value={formData.deadline}
                            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          className="form-textarea"
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          required
                        />
                      </div>

                      {/* Financial Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Montant minimum (€)
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            value={formData.amountMin}
                            onChange={(e) => setFormData(prev => ({ ...prev, amountMin: Number(e.target.value) }))}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Montant maximum (€)
                          </label>
                          <input
                            type="number"
                            className="form-input"
                            value={formData.amountMax}
                            onChange={(e) => setFormData(prev => ({ ...prev, amountMax: Number(e.target.value) }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleUpdate}
                  className="w-full sm:w-auto sm:ml-3"
                  disabled={!formData.title || !formData.description}
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
      {showViewModal && selectedProgram && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Détails du programme
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">{selectedProgram.title}</h4>
                        <p className="text-sm text-gray-600">{selectedProgram.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Secteurs</h5>
                          <div className="flex flex-wrap gap-1">
                            {selectedProgram.sector.map((sect, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {sect}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Montant</h5>
                          <p className="text-sm text-gray-600">
                            {selectedProgram.amountMin && selectedProgram.amountMax ?
                              `${selectedProgram.amountMin.toLocaleString()}€ - ${selectedProgram.amountMax.toLocaleString()}€` :
                              'Non spécifié'
                            }
                          </p>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Date limite</h5>
                          <p className="text-sm text-gray-600">
                            {selectedProgram.deadline ?
                              new Date(selectedProgram.deadline).toLocaleDateString('fr-FR') :
                              'Non définie'
                            }
                          </p>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Statut</h5>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedProgram.status)}`}>
                            {getStatusText(selectedProgram.status)}
                          </span>
                        </div>
                      </div>

                      {selectedProgram.criteria && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Critères d'éligibilité</h5>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {(selectedProgram.criteria as any).eligibilityCriteria?.map((criterion: string, index: number) => (
                              <li key={index}>{criterion}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedProgram.applicationForm && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Questions du formulaire</h5>
                          <div className="space-y-2">
                            {(selectedProgram.applicationForm as any).questions?.map((question: any, index: number) => (
                              <div key={index} className="bg-gray-50 p-3 rounded">
                                <p className="text-sm font-medium">{question.question}</p>
                                <p className="text-xs text-gray-500">
                                  Type: {question.type} | {question.required ? 'Requis' : 'Optionnel'}
                                </p>
                              </div>
                            ))}
                          </div>
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