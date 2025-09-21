import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuthStore } from '../store/authStore';

interface ProgramDetails {
  id: string;
  title: string;
  description: string;
  organizationName: string;
  organizationType: string;
  amountMin: number;
  amountMax: number;
  deadline: string;
  status: 'open' | 'closing_soon' | 'closed';
  sector: string[];
  companySize: string[];
  location: string[];
  tags: string[];
  type: string;
  createdAt: string;
  eligibilityCount: number;
  applicationsCount: number;
  successRate: number;
  averageAmount: number;
  processingTime: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;

  // Detailed information
  objectives: string[];
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  evaluationCriteria: string[];
  timeline: {
    phase: string;
    description: string;
    duration: string;
  }[];
  applicationProcess: string[];
  benefits: string[];
  obligations: string[];
  examples: {
    companyName: string;
    sector: string;
    amount: number;
    description: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
}

interface UserApplication {
  id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string | null;
  completionPercentage: number;
}

export const ProgramDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [userApplication, setUserApplication] = useState<UserApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'process' | 'examples' | 'faq'>('overview');

  // Mock data for program details
  const mockPrograms: { [key: string]: ProgramDetails } = {
    '1': {
      id: '1',
      title: 'France Relance PME 2024',
      description: 'Programme national de soutien à la relance économique destiné aux PME françaises. Cette aide vise à accompagner les entreprises dans leur développement, leur modernisation et leur croissance post-COVID. Le programme offre un financement flexible adapté aux besoins spécifiques de chaque entreprise.',
      organizationName: 'Bpifrance',
      organizationType: 'Établissement public',
      amountMin: 50000,
      amountMax: 500000,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'open',
      sector: ['Tous secteurs', 'Industrie', 'Services', 'Commerce', 'Artisanat'],
      companySize: ['PME', 'TPE'],
      location: ['France métropolitaine', 'Île-de-France', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine'],
      tags: ['Relance', 'Croissance', 'Innovation', 'Post-COVID', 'Modernisation'],
      type: 'Subvention',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      eligibilityCount: 8,
      applicationsCount: 1247,
      successRate: 68,
      averageAmount: 180000,
      processingTime: '45-60 jours',
      contactEmail: 'relance-pme@bpifrance.fr',
      contactPhone: '01 41 79 80 00',
      website: 'https://www.bpifrance.fr/nos-solutions/financement/pret-participatif-relance',

      objectives: [
        'Soutenir la reprise d\'activité des PME post-COVID',
        'Faciliter les investissements de modernisation',
        'Accompagner la croissance et le développement',
        'Renforcer la trésorerie des entreprises',
        'Favoriser l\'innovation et la transformation digitale'
      ],

      eligibilityCriteria: [
        'Être une PME (moins de 250 salariés)',
        'Avoir un chiffre d\'affaires inférieur à 50M€',
        'Être établie en France métropolitaine',
        'Avoir au moins 2 ans d\'existence',
        'Présenter un projet de développement viable',
        'Ne pas être en difficulté financière',
        'Avoir des comptes certifiés sur les 2 derniers exercices',
        'Respecter la réglementation sociale et environnementale'
      ],

      requiredDocuments: [
        'Dossier de candidature complété',
        'Kbis de moins de 3 mois',
        'Comptes annuels des 2 derniers exercices',
        'Business plan détaillé',
        'Prévisionnel financier sur 3 ans',
        'CV du dirigeant',
        'Attestations sociales et fiscales',
        'Justificatifs du projet (devis, études, etc.)'
      ],

      evaluationCriteria: [
        'Viabilité économique du projet (30%)',
        'Impact sur l\'emploi (25%)',
        'Innovation et différenciation (20%)',
        'Solidité financière de l\'entreprise (15%)',
        'Expérience de l\'équipe dirigeante (10%)'
      ],

      timeline: [
        {
          phase: 'Dépôt du dossier',
          description: 'Soumission du dossier complet avec tous les documents requis',
          duration: 'J0'
        },
        {
          phase: 'Instruction administrative',
          description: 'Vérification de la complétude et de la conformité du dossier',
          duration: 'J+15'
        },
        {
          phase: 'Analyse technique',
          description: 'Évaluation du projet par les experts de Bpifrance',
          duration: 'J+30'
        },
        {
          phase: 'Comité de décision',
          description: 'Présentation en comité et décision finale',
          duration: 'J+45'
        },
        {
          phase: 'Notification',
          description: 'Communication de la décision et mise en place des financements',
          duration: 'J+60'
        }
      ],

      applicationProcess: [
        'Pré-évaluation de votre éligibilité en ligne',
        'Préparation et rassemblement des documents requis',
        'Remplissage du dossier de candidature détaillé',
        'Soumission du dossier complet avant la date limite',
        'Suivi de l\'instruction via votre espace personnel',
        'Éventuels compléments d\'information demandés',
        'Notification de la décision finale',
        'Signature de la convention de financement si accepté'
      ],

      benefits: [
        'Financement sans garantie personnelle',
        'Taux d\'intérêt préférentiel',
        'Accompagnement personnalisé',
        'Réseau d\'experts et de partenaires',
        'Possibilité de financement complémentaire',
        'Délai de grâce possible sur le remboursement'
      ],

      obligations: [
        'Utiliser les fonds conformément au projet',
        'Fournir un reporting trimestriel',
        'Maintenir l\'emploi pendant 3 ans',
        'Respecter les engagements environnementaux',
        'Autoriser les contrôles de Bpifrance',
        'Informer de tout changement significatif'
      ],

      examples: [
        {
          companyName: 'TechMétal Solutions',
          sector: 'Métallurgie',
          amount: 250000,
          description: 'Modernisation de l\'outil de production et acquisition d\'une ligne robotisée pour améliorer la productivité et la qualité.'
        },
        {
          companyName: 'EcoLogistique',
          sector: 'Transport',
          amount: 180000,
          description: 'Transition vers une flotte électrique et développement d\'une plateforme de gestion optimisée des livraisons.'
        },
        {
          companyName: 'InnoSoft',
          sector: 'Services numériques',
          amount: 120000,
          description: 'Développement d\'une solution SaaS innovante et recrutement d\'une équipe de développeurs.'
        }
      ],

      faq: [
        {
          question: 'Quel est le délai moyen de traitement ?',
          answer: 'Le délai moyen de traitement est de 45 à 60 jours à compter de la réception du dossier complet.'
        },
        {
          question: 'Puis-je postuler si j\'ai déjà bénéficié d\'autres aides publiques ?',
          answer: 'Oui, ce programme est cumulable avec d\'autres dispositifs publics sous certaines conditions. Le montant total des aides ne peut excéder les plafonds européens.'
        },
        {
          question: 'Le financement est-il remboursable ?',
          answer: 'Il s\'agit d\'une subvention non remboursable, sous réserve du respect des engagements pris dans la convention.'
        },
        {
          question: 'Puis-je modifier mon projet en cours d\'instruction ?',
          answer: 'Des modifications mineures sont possibles mais doivent être signalées rapidement. Des changements majeurs nécessitent une nouvelle candidature.'
        }
      ]
    },

    '2': {
      id: '2',
      title: 'Innovation Verte 2024',
      description: 'Programme de financement dédié aux projets innovants dans le domaine de la transition écologique et énergétique. Soutien aux technologies propres, énergies renouvelables et solutions durables.',
      organizationName: 'ADEME',
      organizationType: 'Agence publique',
      amountMin: 100000,
      amountMax: 2000000,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'closing_soon',
      sector: ['Écologie', 'Énergie', 'Cleantech', 'Agriculture', 'Économie circulaire'],
      companySize: ['Startup', 'PME', 'ETI'],
      location: ['France entière', 'Outre-mer'],
      tags: ['Écologie', 'Innovation', 'Transition énergétique', 'Développement durable', 'Cleantech'],
      type: 'Prêt à taux zéro',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      eligibilityCount: 12,
      applicationsCount: 456,
      successRate: 45,
      averageAmount: 650000,
      processingTime: '60-90 jours',
      contactEmail: 'innovation-verte@ademe.fr',
      contactPhone: '01 47 65 20 00',
      website: 'https://www.ademe.fr/entreprises-monde-economique/financer-projets',

      objectives: [
        'Accélérer la transition écologique des entreprises',
        'Développer les technologies propres et durables',
        'Réduire l\'impact environnemental des activités économiques',
        'Favoriser l\'économie circulaire et l\'efficacité énergétique',
        'Soutenir l\'innovation en matière de développement durable'
      ],

      eligibilityCriteria: [
        'Projet à fort impact environnemental positif',
        'Innovation technologique avérée',
        'Entreprise établie en France ou dans les DOM-TOM',
        'Faisabilité technique et économique démontrée',
        'Équipe projet compétente et expérimentée',
        'Respect des normes environnementales',
        'Potentiel de réplication et de marché',
        'Compatibilité avec les objectifs climatiques français'
      ],

      requiredDocuments: [
        'Dossier technique détaillé du projet',
        'Étude d\'impact environnemental',
        'Business plan et modèle économique',
        'CV de l\'équipe projet',
        'Partenariats techniques et commerciaux',
        'Budget prévisionnel détaillé',
        'Planning de réalisation',
        'Lettres d\'intention de clients ou partenaires',
        'Brevets ou propriété intellectuelle',
        'Comptes de l\'entreprise',
        'Kbis et statuts',
        'Attestations réglementaires'
      ],

      evaluationCriteria: [
        'Impact environnemental (35%)',
        'Innovation et différenciation technologique (25%)',
        'Faisabilité technique (20%)',
        'Potentiel de marché et modèle économique (15%)',
        'Compétences de l\'équipe (5%)'
      ],

      timeline: [
        {
          phase: 'Pré-candidature',
          description: 'Soumission d\'un dossier de pré-candidature simplifié',
          duration: 'J0'
        },
        {
          phase: 'Sélection initiale',
          description: 'Évaluation préliminaire et sélection des projets éligibles',
          duration: 'J+20'
        },
        {
          phase: 'Dossier complet',
          description: 'Soumission du dossier technique et financier détaillé',
          duration: 'J+30'
        },
        {
          phase: 'Expertise technique',
          description: 'Évaluation par des experts sectoriels de l\'ADEME',
          duration: 'J+60'
        },
        {
          phase: 'Comité de sélection',
          description: 'Présentation devant le comité et décision finale',
          duration: 'J+90'
        }
      ],

      applicationProcess: [
        'Vérification de l\'éligibilité du projet',
        'Soumission de la pré-candidature en ligne',
        'Attente de la sélection pour la phase 2',
        'Préparation du dossier technique complet',
        'Soumission du dossier détaillé',
        'Présentation devant le comité d\'experts',
        'Notification de la décision',
        'Signature de la convention de financement'
      ],

      benefits: [
        'Prêt à taux zéro avec différé de remboursement',
        'Accompagnement technique par les experts ADEME',
        'Labellisation et reconnaissance',
        'Accès au réseau d\'entreprises innovantes',
        'Possibilité de financements complémentaires',
        'Visibilité sur les salons et événements ADEME'
      ],

      obligations: [
        'Réaliser le projet selon les spécifications',
        'Fournir un rapport d\'avancement semestriel',
        'Communiquer sur le soutien de l\'ADEME',
        'Partager les résultats et retours d\'expérience',
        'Respecter les engagements environnementaux',
        'Maintenir l\'activité en France pendant 5 ans'
      ],

      examples: [
        {
          companyName: 'GreenTech Energie',
          sector: 'Énergies renouvelables',
          amount: 1200000,
          description: 'Développement d\'une nouvelle technologie de stockage d\'énergie par batteries organiques recyclables.'
        },
        {
          companyName: 'CircuPlast',
          sector: 'Économie circulaire',
          amount: 800000,
          description: 'Innovation dans le recyclage chimique des plastiques complexes en nouvelles matières premières.'
        }
      ],

      faq: [
        {
          question: 'Mon projet est-il éligible s\'il n\'est qu\'en phase de recherche ?',
          answer: 'Le projet doit avoir atteint un niveau de maturité technologique suffisant (TRL 6 minimum) avec une preuve de concept validée.'
        },
        {
          question: 'Puis-je candidater plusieurs fois ?',
          answer: 'Une seule candidature par session est autorisée. En cas de refus, vous pouvez repostuler lors de la session suivante avec un projet modifié.'
        }
      ]
    }
  };

  // Mock user application data
  const mockUserApplications: { [key: string]: UserApplication } = {
    '1': {
      id: 'app-1',
      status: 'draft',
      submittedAt: null,
      completionPercentage: 45
    }
  };

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      if (id && mockPrograms[id]) {
        setProgram(mockPrograms[id]);

        // Check if user has an existing application
        if (mockUserApplications[id]) {
          setUserApplication(mockUserApplications[id]);
        }
      } else {
        // Program not found
        setProgram(null);
      }
    } catch (error) {
      console.error('Error fetching program details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramDetails();
  }, [id]);

  const getStatusBadge = (status: ProgramDetails['status']) => {
    const statusConfig = {
      open: { color: 'bg-green-100 text-green-800', label: '🟢 Ouvert' },
      closing_soon: { color: 'bg-orange-100 text-orange-800', label: '⚠️ Clôture proche' },
      closed: { color: 'bg-red-100 text-red-800', label: '🔒 Fermé' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${config.color}`}>
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

  const handleStartApplication = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (userApplication?.status === 'draft') {
      navigate(`/programs/${id}/apply?applicationId=${userApplication.id}`);
    } else {
      setShowApplicationModal(true);
    }
  };

  const handleConfirmNewApplication = () => {
    setShowApplicationModal(false);
    navigate(`/programs/${id}/apply`);
  };

  const getApplicationButtonText = () => {
    if (!userApplication) return 'Postuler maintenant';

    switch (userApplication.status) {
      case 'draft': return 'Continuer ma candidature';
      case 'submitted': return 'Candidature soumise';
      case 'under_review': return 'En cours d\'examen';
      case 'approved': return 'Candidature approuvée';
      case 'rejected': return 'Nouvelle candidature';
      default: return 'Postuler maintenant';
    }
  };

  const canApply = () => {
    if (!program) return false;
    if (program.status === 'closed') return false;
    if (!user) return true; // Will redirect to login
    if (!userApplication) return true;
    return userApplication.status === 'draft' || userApplication.status === 'rejected';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des détails du programme...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Programme introuvable</h2>
        <p className="text-gray-600 mb-6">Le programme demandé n'existe pas ou n'est plus disponible.</p>
        <Button onClick={() => navigate('/programs')}>
          ← Retour aux programmes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <button onClick={() => navigate('/programs')} className="hover:text-blue-600">
          Programmes de financement
        </button>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{program.title}</span>
      </nav>

      {/* Header */}
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">{program.title}</h1>
              {getStatusBadge(program.status)}
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
              <span>
                <span className="font-medium">Organisme:</span> {program.organizationName}
              </span>
              <span>•</span>
              <span>
                <span className="font-medium">Type:</span> {program.type}
              </span>
              <span>•</span>
              <span>
                <span className="font-medium">Échéance:</span> {formatTimeLeft(program.deadline)}
              </span>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {program.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(program.amountMin)} - {formatCurrency(program.amountMax)}
                </div>
                <div className="text-sm text-gray-600">Montant du financement</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{program.successRate}%</div>
                <div className="text-sm text-gray-600">Taux de succès</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{program.processingTime}</div>
                <div className="text-sm text-gray-600">Délai de traitement</div>
              </div>
            </div>
          </div>

          <div className="ml-8 space-y-4">
            {canApply() && (
              <Button
                onClick={handleStartApplication}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                size="lg"
              >
                {getApplicationButtonText()}
              </Button>
            )}

            {userApplication && userApplication.status === 'draft' && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="text-sm font-medium text-yellow-800 mb-1">
                  Candidature en cours
                </div>
                <div className="text-xs text-yellow-700 mb-2">
                  Progression: {userApplication.completionPercentage}%
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${userApplication.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Applications:</span>
                <span className="font-medium">{program.applicationsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant moyen:</span>
                <span className="font-medium">{formatCurrency(program.averageAmount)}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate('/applications')}
                className="w-full"
                size="sm"
              >
                📋 Mes candidatures
              </Button>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {program.tags.map((tag, index) => (
            <span key={index} className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: '📋 Vue d\'ensemble', icon: '📋' },
              { id: 'eligibility', label: '✓ Éligibilité', icon: '✓' },
              { id: 'process', label: '🔄 Processus', icon: '🔄' },
              { id: 'examples', label: '💡 Exemples', icon: '💡' },
              { id: 'faq', label: '❓ FAQ', icon: '❓' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 Objectifs du programme</h3>
                <ul className="space-y-2">
                  {program.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-3 text-blue-500 mt-1">•</span>
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🏢 Secteurs éligibles</h3>
                <div className="flex flex-wrap gap-2">
                  {program.sector.map((sector, index) => (
                    <span key={index} className="inline-flex px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📍 Zones géographiques</h3>
                <div className="flex flex-wrap gap-2">
                  {program.location.map((loc, index) => (
                    <span key={index} className="inline-flex px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🎁 Avantages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {program.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
                      <span className="mr-3 text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📞 Contact</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Email:</div>
                      <a href={`mailto:${program.contactEmail}`} className="text-blue-600 hover:text-blue-800">
                        {program.contactEmail}
                      </a>
                    </div>
                    {program.contactPhone && (
                      <div>
                        <div className="font-medium text-gray-900 mb-1">Téléphone:</div>
                        <a href={`tel:${program.contactPhone}`} className="text-blue-600 hover:text-blue-800">
                          {program.contactPhone}
                        </a>
                      </div>
                    )}
                    {program.website && (
                      <div className="md:col-span-2">
                        <div className="font-medium text-gray-900 mb-1">Site web:</div>
                        <a href={program.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {program.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eligibility' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">✅ Critères d'éligibilité</h3>
                <div className="space-y-3">
                  {program.eligibilityCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-start p-3 border border-gray-200 rounded-lg">
                      <span className="mr-3 text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">{criteria}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📋 Documents requis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {program.requiredDocuments.map((doc, index) => (
                    <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                      <span className="mr-3 text-blue-500 mt-1">📄</span>
                      <span className="text-gray-700">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">⚖️ Critères d'évaluation</h3>
                <div className="space-y-3">
                  {program.evaluationCriteria.map((criteria, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <span className="text-gray-700">{criteria}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📝 Obligations du bénéficiaire</h3>
                <div className="space-y-2">
                  {program.obligations.map((obligation, index) => (
                    <div key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                      <span className="mr-3 text-yellow-500 mt-1">⚠️</span>
                      <span className="text-gray-700">{obligation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'process' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">⏱️ Calendrier de traitement</h3>
                <div className="space-y-4">
                  {program.timeline.map((phase, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-24 text-right">
                        <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {phase.duration}
                        </span>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="font-medium text-gray-900">{phase.phase}</div>
                        <div className="text-sm text-gray-600 mt-1">{phase.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🔄 Étapes de candidature</h3>
                <div className="space-y-3">
                  {program.applicationProcess.map((step, index) => (
                    <div key={index} className="flex items-start p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">💡 Exemples de projets financés</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {program.examples.map((example, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{example.companyName}</h4>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {example.sector}
                      </span>
                    </div>
                    <div className="text-lg font-medium text-green-600 mb-3">
                      {formatCurrency(example.amount)}
                    </div>
                    <p className="text-gray-700 text-sm">{example.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">❓ Questions fréquentes</h3>
              <div className="space-y-4">
                {program.faq.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900">{item.question}</h4>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-700">{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom action bar for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        {canApply() && (
          <Button
            onClick={handleStartApplication}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {getApplicationButtonText()}
          </Button>
        )}
      </div>

      {/* Application Confirmation Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title="Nouvelle candidature"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Vous êtes sur le point de commencer une nouvelle candidature pour le programme "{program.title}".
          </p>

          {userApplication && userApplication.status !== 'draft' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Note:</span> Vous avez déjà une candidature en statut "{userApplication.status}" pour ce programme.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowApplicationModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmNewApplication}>
              Commencer la candidature
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};