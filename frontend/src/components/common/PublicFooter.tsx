import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-primary-600">GROWF</span>
            </div>
            <p className="text-gray-600 max-w-md">
              Plateforme de financement pour accompagner la croissance des entreprises
              et connecter les porteurs de projets avec les organismes de financement.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary-600">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-gray-600 hover:text-primary-600">
                  Programmes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:contact@growf.fr" className="text-gray-600 hover:text-primary-600">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} GROWF. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};