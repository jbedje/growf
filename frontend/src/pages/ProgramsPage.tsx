import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useAuthStore } from '../store/authStore';
import { ProgramService } from '../services/programService';
import type { Program } from '../types/program';
import toast from 'react-hot-toast';

interface Filters {
  search: string;
  sector: string;
  location: string;
}

export const ProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    sector: '',
    location: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [sortBy, setSortBy] = useState<'deadline' | 'newest' | 'relevance'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load programs from API
  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const apiFilters = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.sector && { sector: filters.sector }),
        ...(filters.location && { location: filters.location })
      };

      const response = await ProgramService.getPublicPrograms(apiFilters);
      setPrograms(response.data.programs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erreur lors du chargement des programmes:', error);
      toast.error('Erreur lors du chargement des programmes');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.search, filters.sector, filters.location]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  // Helper functions
  const formatAmount = (min?: number, max?: number) => {
    if (!min && !max) return 'Non spécifié';
    if (min && max) {
      return `${min.toLocaleString()}€ - ${max.toLocaleString()}€`;
    }
    if (min) return `À partir de ${min.toLocaleString()}€`;
    if (max) return `Jusqu'à ${max.toLocaleString()}€`;
    return 'Non spécifié';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expiré';
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Demain';
    if (diffDays <= 7) return `Dans ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (deadline?: string) => {
    if (!deadline) return { class: 'bg-gray-100 text-gray-800', text: 'Ouvert' };

    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { class: 'bg-red-100 text-red-800', text: 'Fermé' };
    if (diffDays <= 7) return { class: 'bg-orange-100 text-orange-800', text: 'Ferme bientôt' };
    return { class: 'bg-green-100 text-green-800', text: 'Ouvert' };
  };

  const handleViewProgram = (programId: string) => {
    navigate(`/programs/${programId}`);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      sector: '',
      location: ''
    });
  };

  // Sorted programs based on sortBy
  const sortedPrograms = [...programs].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'relevance':
      default:
        return 0; // Keep API order
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Programmes de financement
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Découvrez les opportunités de financement disponibles pour votre entreprise.
            Trouvez le programme qui correspond à vos besoins et développez votre activité.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Programmes disponibles</p>
                <p className="text-2xl font-semibold text-secondary-900">{pagination.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Ouverts actuellement</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {programs.filter(p => !p.deadline || new Date(p.deadline) > new Date()).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m14 0v-5H5v5" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Secteurs couverts</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {new Set(programs.flatMap(p => p.sector)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Recherche
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Rechercher un programme..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Secteur
              </label>
              <select
                className="form-select"
                value={filters.sector}
                onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
              >
                <option value="">Tous les secteurs</option>
                <option value="Numérique">Numérique</option>
                <option value="Industrie">Industrie</option>
                <option value="Services">Services</option>
                <option value="Commerce">Commerce</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Énergie">Énergie</option>
                <option value="Santé">Santé</option>
                <option value="Éducation">Éducation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Localisation
              </label>
              <select
                className="form-select"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              >
                <option value="">Toutes les régions</option>
                <option value="Île-de-France">Île-de-France</option>
                <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</option>
                <option value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</option>
                <option value="Occitanie">Occitanie</option>
                <option value="Hauts-de-France">Hauts-de-France</option>
                <option value="Provence-Alpes-Côte d'Azur">PACA</option>
                <option value="Grand Est">Grand Est</option>
                <option value="Pays de la Loire">Pays de la Loire</option>
                <option value="Normandie">Normandie</option>
                <option value="Bourgogne-Franche-Comté">Bourgogne-Franche-Comté</option>
                <option value="Bretagne">Bretagne</option>
                <option value="Centre-Val de Loire">Centre-Val de Loire</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full"
              >
                Réinitialiser
              </Button>
            </div>
          </div>

          {/* Sort and View Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-secondary-200">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-secondary-700">Trier par:</span>
                <select
                  className="form-select text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="relevance">Pertinence</option>
                  <option value="deadline">Date limite</option>
                  <option value="newest">Plus récents</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary-700">Affichage:</span>
              <div className="flex border border-secondary-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-secondary-600 hover:text-secondary-900'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-secondary-600 hover:text-secondary-900'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Programs Display */}
        {sortedPrograms.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-secondary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">Aucun programme trouvé</h3>
            <p className="text-secondary-600 mb-4">
              Aucun programme ne correspond à vos critères de recherche.
            </p>
            <Button onClick={resetFilters} variant="outline">
              Réinitialiser les filtres
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPrograms.map((program) => {
              const status = getStatusBadge(program.deadline);
              return (
                <div key={program.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-1 line-clamp-2">
                          {program.title}
                        </h3>
                        <p className="text-sm text-secondary-600">{program.organization.name}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.class} ml-2`}>
                        {status.text}
                      </span>
                    </div>

                    <p className="text-secondary-700 text-sm mb-4 line-clamp-3">
                      {program.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-secondary-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        {formatAmount(program.amountMin, program.amountMax)}
                      </div>

                      <div className="flex items-center text-sm text-secondary-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0l-1 8h8l-1-8" />
                        </svg>
                        {formatDate(program.deadline)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {program.sector.slice(0, 3).map((sect, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {sect}
                        </span>
                      ))}
                      {program.sector.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          +{program.sector.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-secondary-500">
                        {program._count?.applications || 0} candidature{(program._count?.applications || 0) !== 1 ? 's' : ''}
                      </div>
                      <Button
                        onClick={() => handleViewProgram(program.id)}
                        size="sm"
                      >
                        Voir le programme
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-secondary-200">
              {sortedPrograms.map((program) => {
                const status = getStatusBadge(program.deadline);
                return (
                  <div key={program.id} className="p-6 hover:bg-secondary-50 transition-colors duration-150">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                              {program.title}
                            </h3>
                            <p className="text-sm text-secondary-600 mb-2">{program.organization.name}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.class} ml-4`}>
                            {status.text}
                          </span>
                        </div>

                        <p className="text-secondary-700 mb-3 line-clamp-2">
                          {program.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600 mb-3">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            {formatAmount(program.amountMin, program.amountMax)}
                          </div>

                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0l-1 8h8l-1-8" />
                            </svg>
                            {formatDate(program.deadline)}
                          </div>

                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {program._count?.applications || 0} candidature{(program._count?.applications || 0) !== 1 ? 's' : ''}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {program.sector.slice(0, 4).map((sect, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {sect}
                              </span>
                            ))}
                            {program.sector.length > 4 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                +{program.sector.length - 4}
                              </span>
                            )}
                          </div>

                          <Button
                            onClick={() => handleViewProgram(program.id)}
                            size="sm"
                          >
                            Voir le programme
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
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
                  {' '}programmes
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

        {/* Call to Action */}
        {!user && (
          <div className="mt-12 bg-primary-50 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
              Prêt à postuler ?
            </h3>
            <p className="text-secondary-600 mb-6 max-w-2xl mx-auto">
              Créez votre compte entreprise pour postuler aux programmes de financement
              et suivre vos candidatures en temps réel.
            </p>
            <div className="space-x-4">
              <Button onClick={() => navigate('/register')}>
                Créer un compte
              </Button>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Se connecter
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};