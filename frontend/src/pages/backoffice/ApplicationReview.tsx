import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Users,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { ApplicationService } from '../../services/applicationService';
import { DocumentService } from '../../services/documentService';
import type { Application } from '../../types/application';
import type { Document } from '../../services/documentService';
import { toast } from 'react-hot-toast';
import MessageThread from '../../components/ui/MessageThread';
import FileUpload from '../../components/ui/FileUpload';
import { useAuthStore } from '../../store/authStore';

const ApplicationReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [comments, setComments] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'messages'>('details');

  useEffect(() => {
    if (id) {
      loadApplication();
      loadDocuments();
    }
  }, [id, loadApplication, loadDocuments]);

  const loadApplication = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApplicationService.getApplicationById(id!);
      if (response.success) {
        setApplication(response.data);
        setScore(response.data.score || 0);
      } else {
        toast.error('Erreur lors du chargement de la candidature');
        navigate('/backoffice/admin');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement de la candidature');
      navigate('/backoffice/admin');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const loadDocuments = useCallback(async () => {
    try {
      setDocumentsLoading(true);
      const response = await DocumentService.getApplicationDocuments(id!);
      if (response.success) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setDocumentsLoading(false);
    }
  }, [id]);

  const handleFileUpload = async (file: File, description?: string) => {
    try {
      const response = await DocumentService.uploadDocument(id!, file, description);
      if (response.success) {
        setDocuments(prev => [...prev, response.data]);
        setShowUpload(false);
        toast.success('Document uploadé avec succès');
      } else {
        toast.error('Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload');
    }
  };

  const handleDocumentDownload = async (documentId: string, filename: string) => {
    try {
      const response = await DocumentService.downloadDocument(documentId);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      const response = await DocumentService.deleteDocument(documentId);
      if (response.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast.success('Document supprimé');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleStatusUpdate = async (newStatus: Application['status']) => {
    if (!application) return;

    try {
      const response = await ApplicationService.updateApplicationStatus(application.id, newStatus);
      if (response.success) {
        setApplication(prev => prev ? { ...prev, status: newStatus, reviewedAt: new Date().toISOString() } : null);
        toast.success('Statut mis à jour avec succès');
      } else {
        toast.error('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleReview = async () => {
    if (!application) return;

    try {
      setReviewing(true);
      const response = await ApplicationService.reviewApplication(application.id, score, comments);
      if (response.success) {
        setApplication(prev => prev ? {
          ...prev,
          score,
          status: 'UNDER_REVIEW',
          reviewedAt: new Date().toISOString()
        } : null);
        setShowReviewForm(false);
        toast.success('Évaluation enregistrée avec succès');
      } else {
        toast.error('Erreur lors de l\'enregistrement de l\'évaluation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'évaluation');
    } finally {
      setReviewing(false);
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'DRAFT': return 'text-gray-600 bg-gray-100';
      case 'SUBMITTED': return 'text-blue-600 bg-blue-100';
      case 'UNDER_REVIEW': return 'text-yellow-600 bg-yellow-100';
      case 'APPROVED': return 'text-green-600 bg-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'CANCELLED': return 'text-gray-600 bg-gray-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: Application['status']) => {
    switch (status) {
      case 'DRAFT': return 'Brouillon';
      case 'SUBMITTED': return 'Soumise';
      case 'UNDER_REVIEW': return 'En cours d\'examen';
      case 'APPROVED': return 'Approuvée';
      case 'REJECTED': return 'Rejetée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setScore(star) : undefined}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Candidature non trouvée</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/backoffice/admin')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Évaluation de candidature
            </h1>
            <p className="text-gray-600">{application.program.title}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
          {getStatusLabel(application.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg border mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Détails
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'documents'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Upload className="h-4 w-4 inline mr-2" />
                  Documents ({documents.length})
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'messages'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Messages
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Company Information */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      Informations sur l'entreprise
                    </h2>
                    {application.company && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Nom</label>
                          <p className="text-gray-900">{application.company.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Secteur</label>
                          <p className="text-gray-900">{application.company.sector}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Taille</label>
                          <p className="text-gray-900 flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {application.company.size}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Localisation</label>
                          <p className="text-gray-900 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {application.company.location}
                          </p>
                        </div>
                        {application.company.description && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-500">Description</label>
                            <p className="text-gray-900 mt-1">{application.company.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Application Data */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Données de candidature
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">
                        {JSON.stringify(application.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold flex items-center">
                        <Upload className="h-5 w-5 mr-2" />
                        Documents de candidature
                      </h2>
                      {user?.role === 'COMPANY' && (
                        <button
                          onClick={() => setShowUpload(!showUpload)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Ajouter un document
                        </button>
                      )}
                    </div>

                    {showUpload && (
                      <div className="mb-6">
                        <FileUpload
                          onFileSelect={() => {}}
                          onUpload={handleFileUpload}
                          className="mb-4"
                        />
                      </div>
                    )}
                  </div>

                  {/* Documents List */}
                  <div>
                    {documentsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Chargement des documents...</p>
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="text-center py-8">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Aucun document uploadé</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Les documents apparaîtront ici une fois uploadés
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">{doc.originalName}</p>
                                <p className="text-sm text-gray-500">
                                  {(doc.size / 1024 / 1024).toFixed(2)} MB •
                                  {new Date(doc.uploadedAt).toLocaleDateString()}
                                  {doc.description && ` • ${doc.description}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDocumentDownload(doc.id, doc.originalName)}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Télécharger"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              {user?.role === 'COMPANY' && (
                                <button
                                  onClick={() => handleDocumentDelete(doc.id)}
                                  className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div>
                  <MessageThread
                    applicationId={application.id}
                    className="h-96"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Program Info */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Informations du programme</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Programme</label>
                <p className="text-gray-900">{application.program.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Organisation</label>
                <p className="text-gray-900">{application.program.organization.name}</p>
              </div>
              {application.program.deadline && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Date limite</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(application.program.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
              {application.program.amountMin && application.program.amountMax && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Montant</label>
                  <p className="text-gray-900">
                    {application.program.amountMin.toLocaleString()} € - {application.program.amountMax.toLocaleString()} €
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Application Timeline */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Chronologie</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Candidature créée</p>
                  <p className="text-xs text-gray-500">
                    {new Date(application.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {application.submittedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Candidature soumise</p>
                    <p className="text-xs text-gray-500">
                      {new Date(application.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {application.reviewedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Candidature évaluée</p>
                    <p className="text-xs text-gray-500">
                      {new Date(application.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Score */}
          {application.score !== undefined && application.score > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Score actuel</h3>
              <div className="flex items-center space-x-2">
                {renderStars(application.score)}
                <span className="text-lg font-semibold">{application.score}/5</span>
              </div>
            </div>
          )}

          {/* Review Form */}
          {application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW' ? (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Évaluation</h3>
              {!showReviewForm ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Star className="h-4 w-4 inline mr-2" />
                  Évaluer cette candidature
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Score (1-5 étoiles)
                    </label>
                    {renderStars(score, true)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaires
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Ajoutez vos commentaires d'évaluation..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleReview}
                      disabled={reviewing || score === 0}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {reviewing ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Actions */}
          {application.status !== 'APPROVED' && application.status !== 'REJECTED' && application.status !== 'CANCELLED' && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="space-y-2">
                {application.status === 'SUBMITTED' && (
                  <button
                    onClick={() => handleStatusUpdate('UNDER_REVIEW')}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mettre en examen
                  </button>
                )}
                {(application.status === 'UNDER_REVIEW' || application.status === 'SUBMITTED') && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate('APPROVED')}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('REJECTED')}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationReview;