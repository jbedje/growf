import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="bg-white p-8">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenue sur GROWF
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Trouvez les programmes de financement parfaits pour votre PME ou startup
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/programs" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50">
                Explorer les programmes
              </Link>
              <Link to="/register" className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simple content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir GROWF ?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Notre plateforme connecte les entreprises avec les bonnes opportunités de financement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Recherche intelligente
              </h3>
              <p className="text-gray-600">
                Trouvez rapidement les programmes qui correspondent à votre profil grâce à nos filtres avancés
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Sécurisé et fiable
              </h3>
              <p className="text-gray-600">
                Vos données sont protégées et nous travaillons uniquement avec des organismes vérifiés
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Candidature simplifiée
              </h3>
              <p className="text-gray-600">
                Postulez en quelques clics avec nos formulaires intelligents et le suivi en temps réel
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};