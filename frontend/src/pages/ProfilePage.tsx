import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

interface CompanyProfile {
  id: string;
  name: string;
  siret: string;
  sector: string;
  size: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE';
  revenue: number | null;
  location: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  foundedYear: number | null;
  employeeCount: number | null;
  legalForm: string;
  email: string;
  isVerified: boolean;
}

interface UserInfo {
  email: string;
  isVerified: boolean;
  createdAt: string;
}

const sizeLabels = {
  MICRO: 'Micro entreprise (< 10 employés)',
  SMALL: 'Petite entreprise (10-49 employés)',
  MEDIUM: 'Moyenne entreprise (50-249 employés)',
  LARGE: 'Grande entreprise (250+ employés)'
};

const sectorOptions = [
  'Agriculture',
  'Industrie',
  'Construction',
  'Commerce',
  'Transport',
  'Hébergement et restauration',
  'Information et communication',
  'Activités financières',
  'Activités immobilières',
  'Activités spécialisées',
  'Services administratifs',
  'Administration publique',
  'Enseignement',
  'Santé',
  'Arts et spectacles',
  'Autres services'
];

const legalFormOptions = [
  'SARL',
  'SAS',
  'SA',
  'EURL',
  'SASU',
  'SNC',
  'SCS',
  'Auto-entreprise',
  'Association',
  'Autre'
];

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'company' | 'account' | 'security'>('company');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    id: 'company-1',
    name: 'TechCorp Solutions',
    siret: '12345678901234',
    sector: 'Information et communication',
    size: 'SMALL',
    revenue: 1200000,
    location: 'Paris',
    address: '123 Rue de la Tech, 75001 Paris',
    phone: '+33 1 23 45 67 89',
    website: 'https://techcorp-solutions.fr',
    description: 'Société spécialisée dans le développement de solutions logicielles innovantes pour les entreprises.',
    foundedYear: 2018,
    employeeCount: 25,
    legalForm: 'SAS',
    email: user?.email || '',
    isVerified: true
  });

  const [userInfo, setUserInfo] = useState<UserInfo>({
    email: user?.email || '',
    isVerified: true,
    createdAt: '2024-01-15T10:30:00Z'
  });

  const [formData, setFormData] = useState(companyProfile);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    if (user?.email) {
      setUserInfo(prev => ({ ...prev, email: user.email }));
      setCompanyProfile(prev => ({ ...prev, email: user.email }));
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleInputChange = (field: keyof CompanyProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCompanyProfile(formData);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(companyProfile);
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Votre demande de suppression a été prise en compte. Vous recevrez un email de confirmation.');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-header bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p className="mt-2 text-gray-600">Gérez vos informations personnelles et les paramètres de votre compte</p>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Modifications enregistrées avec succès !</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'company', name: 'Informations Entreprise', icon: '🏢' },
                { id: 'account', name: 'Compte Utilisateur', icon: '👤' },
                { id: 'security', name: 'Sécurité', icon: '🔒' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Company Information Tab */}
            {activeTab === 'company' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Informations de l'entreprise</h2>
                    <p className="text-gray-600">Gérez les informations de votre entreprise</p>
                  </div>
                  <div className="flex space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Modifier
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'entreprise *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{companyProfile.name}</p>
                    )}
                  </div>

                  {/* SIRET */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SIRET
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.siret}
                        onChange={(e) => handleInputChange('siret', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="14 chiffres"
                        maxLength={14}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{companyProfile.siret || 'Non spécifié'}</p>
                    )}
                  </div>

                  {/* Sector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secteur d'activité *
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.sector}
                        onChange={(e) => handleInputChange('sector', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {sectorOptions.map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">{companyProfile.sector}</p>
                    )}
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taille de l'entreprise *
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.size}
                        onChange={(e) => handleInputChange('size', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {Object.entries(sizeLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">{sizeLabels[companyProfile.size]}</p>
                    )}
                  </div>

                  {/* Employee Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre d'employés
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.employeeCount || ''}
                        onChange={(e) => handleInputChange('employeeCount', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{companyProfile.employeeCount || 'Non spécifié'}</p>
                    )}
                  </div>

                  {/* Revenue */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chiffre d'affaires annuel
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.revenue || ''}
                        onChange={(e) => handleInputChange('revenue', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="En euros"
                        min="0"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formatCurrency(companyProfile.revenue)}</p>
                    )}
                  </div>

                  {/* Founded Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Année de création
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.foundedYear || ''}
                        onChange={(e) => handleInputChange('foundedYear', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{companyProfile.foundedYear || 'Non spécifié'}</p>
                    )}
                  </div>

                  {/* Legal Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Forme juridique
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.legalForm}
                        onChange={(e) => handleInputChange('legalForm', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {legalFormOptions.map(form => (
                          <option key={form} value={form}>{form}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2">{companyProfile.legalForm}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localisation *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ville ou région"
                        required
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{companyProfile.location}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+33 1 23 45 67 89"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{companyProfile.phone || 'Non spécifié'}</p>
                    )}
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site web
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {companyProfile.website ? (
                          <a href={companyProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {companyProfile.website}
                          </a>
                        ) : (
                          'Non spécifié'
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Adresse complète de l'entreprise"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{companyProfile.address || 'Non spécifié'}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description de l'entreprise
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Décrivez votre entreprise, ses activités et ses objectifs..."
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{companyProfile.description || 'Non spécifié'}</p>
                  )}
                </div>
              </div>
            )}

            {/* Account Information Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Informations du compte</h2>
                  <p className="text-gray-600">Consultez les informations de votre compte utilisateur</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse email
                      </label>
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-900">{userInfo.email}</p>
                        {userInfo.isVerified && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Vérifié
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de compte
                      </label>
                      <p className="text-gray-900">Entreprise</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de création
                      </label>
                      <p className="text-gray-900">{formatDate(userInfo.createdAt)}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statut du compte
                      </label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Actif
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Actions du compte</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Exporter mes données</h4>
                        <p className="text-sm text-gray-600">Téléchargez une copie de toutes vos données</p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Exporter
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Désactiver le compte</h4>
                        <p className="text-sm text-gray-600">Suspendre temporairement votre compte</p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Désactiver
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Sécurité</h2>
                  <p className="text-gray-600">Gérez la sécurité de votre compte</p>
                </div>

                {/* Change Password */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Au moins 8 caractères"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      disabled={!currentPassword || !newPassword || !confirmPassword || isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? 'Modification...' : 'Changer le mot de passe'}
                    </button>
                  </div>
                </div>

                {/* Login Activity */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Activité de connexion</h3>
                  <div className="space-y-3">
                    {[
                      { date: '2024-01-20 14:30', location: 'Paris, France', device: 'Chrome sur Windows' },
                      { date: '2024-01-19 09:15', location: 'Paris, France', device: 'Firefox sur Windows' },
                      { date: '2024-01-18 16:45', location: 'Lyon, France', device: 'Safari sur iPhone' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.device}</p>
                          <p className="text-xs text-gray-600">{activity.location} • {activity.date}</p>
                        </div>
                        {index === 0 && (
                          <span className="text-xs text-green-600 font-medium">Session actuelle</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delete Account */}
                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                  <h3 className="text-lg font-medium text-red-900 mb-2">Zone de danger</h3>
                  <p className="text-sm text-red-700 mb-4">
                    La suppression de votre compte est irréversible. Toutes vos données seront définitivement perdues.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isSaving ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};