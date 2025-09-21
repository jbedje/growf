import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-secondary-900 mb-4">404</h1>
        <p className="text-secondary-600 mb-8">Page non trouvée</p>
        <Link to="/" className="btn-primary">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};