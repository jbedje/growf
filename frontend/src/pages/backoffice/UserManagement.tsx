import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserRole, type UserRoleType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal, ConfirmModal } from '../../components/ui/Modal';

interface CreateUserForm {
  email: string;
  password: string;
  role: UserRoleType;
}

interface BackofficeUser {
  id: string;
  email: string;
  role: UserRoleType;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
  name: string;
}

export const UserManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateUserForm>({
    email: '',
    password: '',
    role: UserRole.ANALYST
  });

  // États pour les modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BackofficeUser | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<BackofficeUser>>({});

  // Liste des utilisateurs
  const [users, setUsers] = useState<BackofficeUser[]>([
    {
      id: '1',
      email: 'admin@growf.fr',
      role: UserRole.ADMIN,
      status: 'active',
      lastLogin: '2024-03-20T14:30:00Z',
      createdAt: '2024-01-15T10:00:00Z',
      name: 'Admin Principal'
    },
    {
      id: '2',
      email: 'analyste1@growf.fr',
      role: UserRole.ANALYST,
      status: 'active',
      lastLogin: '2024-03-19T16:45:00Z',
      createdAt: '2024-02-10T09:30:00Z',
      name: 'Analyste Senior'
    },
    {
      id: '3',
      email: 'analyste2@growf.fr',
      role: UserRole.ANALYST,
      status: 'pending',
      lastLogin: undefined,
      createdAt: '2024-03-12T11:15:00Z',
      name: 'Analyste Junior'
    }
  ]);

  // Seul le SUPERADMIN peut accéder à cette page
  if (user?.role !== UserRole.SUPERADMIN) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Accès non autorisé
        </h2>
        <p className="text-red-600">
          Seuls les super-administrateurs peuvent gérer les comptes utilisateurs.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Création du compte:', formData);

      // Simulation de la création d'utilisateur
      const newUser: BackofficeUser = {
        id: Date.now().toString(),
        email: formData.email,
        role: formData.role,
        status: 'pending',
        createdAt: new Date().toISOString(),
        name: formData.email.split('@')[0]
      };

      setUsers(prev => [...prev, newUser]);
      alert(`Compte ${formData.role.toLowerCase()} créé pour ${formData.email}`);

      // Reset form
      setFormData({
        email: '',
        password: '',
        role: UserRole.ANALYST
      });
      setShowCreateForm(false);
    } catch {
      alert('Erreur lors de la création du compte');
    }
  };

  const handleEditUser = (user: BackofficeUser) => {
    setSelectedUser(user);
    setEditFormData({
      email: user.email,
      role: user.role,
      name: user.name,
      status: user.status
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (selectedUser && editFormData) {
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, ...editFormData }
          : u
      ));
      alert(`Utilisateur ${selectedUser.email} modifié avec succès`);
      setShowEditModal(false);
    }
  };

  const handleDeleteUser = (user: BackofficeUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleViewActivity = (user: BackofficeUser) => {
    setSelectedUser(user);
    setShowActivityModal(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      alert(`Utilisateur ${selectedUser.email} supprimé avec succès`);
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u =>
      u.id === userId
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ));
  };

  const resendInvitation = (user: BackofficeUser) => {
    alert(`Invitation renvoyée à ${user.email}`);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const getStatusBadge = (status: BackofficeUser['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: '🟢 Actif' },
      inactive: { color: 'bg-red-100 text-red-800', label: '🔴 Inactif' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: '⏱️ En attente' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role: UserRoleType) => {
    const roleConfig: Record<string, { color: string; label: string }> = {
      [UserRole.ADMIN]: { color: 'bg-purple-100 text-purple-800', label: '👨‍💼 Administrateur' },
      [UserRole.ANALYST]: { color: 'bg-blue-100 text-blue-800', label: '🔍 Analyste' }
    };

    const config = roleConfig[role];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des utilisateurs
            </h1>
            <p className="text-gray-600">
              Gérer les comptes analystes et administrateurs
            </p>
          </div>

          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showCreateForm ? 'Annuler' : 'Créer un compte'}
          </Button>
        </div>

        {showCreateForm && (
          <div className="border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Créer un compte backoffice
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRoleType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={UserRole.ANALYST}>Analyste</option>
                  <option value={UserRole.ADMIN}>Administrateur</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe temporaire
                </label>
                <div className="flex space-x-2">
                  <input
                    id="password"
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    onClick={generatePassword}
                    variant="outline"
                  >
                    Générer
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  L'utilisateur devra changer ce mot de passe lors de sa première connexion
                </p>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Créer le compte
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Statistiques des utilisateurs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <span className="text-2xl mr-3">👨‍💼</span>
              <div>
                <p className="text-sm font-medium text-blue-800">Administrateurs</p>
                <p className="text-xl font-bold text-blue-900">
                  {users.filter(u => u.role === UserRole.ADMIN).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🔍</span>
              <div>
                <p className="text-sm font-medium text-green-800">Analystes</p>
                <p className="text-xl font-bold text-green-900">
                  {users.filter(u => u.role === UserRole.ANALYST).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⏱️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">En attente</p>
                <p className="text-xl font-bold text-yellow-900">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Rechercher par email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous les rôles</option>
              <option value="ADMIN">Administrateurs</option>
              <option value="ANALYST">Analystes</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>

        {/* Liste des utilisateurs existants */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👥</span>
            Comptes backoffice existants
          </h3>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière connexion
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            userItem.role === UserRole.ADMIN ? 'bg-purple-500' : 'bg-blue-500'
                          }`}>
                            <span className="text-white text-sm font-medium">
                              {userItem.role === UserRole.ADMIN ? 'AD' : 'AN'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{userItem.email}</p>
                            <p className="text-sm text-gray-500">{userItem.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(userItem.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(userItem.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userItem.lastLogin
                          ? new Date(userItem.lastLogin).toLocaleDateString('fr-FR')
                          : 'Jamais connecté'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(userItem)}
                        >
                          ✏️ Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewActivity(userItem)}
                        >
                          📊 Activité
                        </Button>
                        {userItem.status === 'pending' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resendInvitation(userItem)}
                            >
                              📧 Renvoyer invitation
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteUser(userItem)}
                            >
                              ❌ Supprimer
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant={userItem.status === 'active' ? 'danger' : 'outline'}
                              onClick={() => toggleUserStatus(userItem.id)}
                            >
                              {userItem.status === 'active' ? '🚫 Désactiver' : '✅ Activer'}
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier l'utilisateur"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              <select
                value={editFormData.role || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value as UserRoleType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={UserRole.ANALYST}>Analyste</option>
                <option value={UserRole.ADMIN}>Administrateur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={editFormData.status || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'pending' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="pending">En attente</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveEdit}>
                Sauvegarder
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal d'activité */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Activité de l'utilisateur"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Informations générales</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Rôle:</span>
                  <span className="ml-2 font-medium">{selectedUser.role}</span>
                </div>
                <div>
                  <span className="text-gray-600">Statut:</span>
                  <span className="ml-2 font-medium">{selectedUser.status}</span>
                </div>
                <div>
                  <span className="text-gray-600">Dernière connexion:</span>
                  <span className="ml-2 font-medium">
                    {selectedUser.lastLogin
                      ? new Date(selectedUser.lastLogin).toLocaleDateString('fr-FR')
                      : 'Jamais connecté'
                    }
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Activités récentes</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center p-2 bg-green-50 rounded">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <span>Connexion réussie</span>
                  <span className="ml-auto text-gray-500">Il y a 2 heures</span>
                </div>
                <div className="flex items-center p-2 bg-blue-50 rounded">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  <span>Application analysée</span>
                  <span className="ml-auto text-gray-500">Il y a 4 heures</span>
                </div>
                <div className="flex items-center p-2 bg-purple-50 rounded">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  <span>Profil mis à jour</span>
                  <span className="ml-auto text-gray-500">Il y a 1 jour</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteUser}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur ${selectedUser?.email} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="danger"
      />
    </div>
  );
};