import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, TrendingUp, Shield, Zap } from 'lucide-react';
import cipmeLogoJpg from '../assets/images/cipme-logo.jpg';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={cipmeLogoJpg}
                  alt="Côte d'Ivoire PME"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-orange-600">GROWF</h1>
                <p className="text-xs text-gray-600">Plateforme de Financement des PME</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-amber-400/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Financez l'avenir de votre
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 block">
                entreprise en Côte d'Ivoire
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              GROWF connecte les PME ivoiriennes avec les opportunités de financement adaptées.
              Accompagner l'audace et l'ambition de nos entrepreneur.e.s vers la croissance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center group"
              >
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/programs"
                className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Découvrir les programmes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Une plateforme complète pour votre croissance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              GROWF simplifie l'accès au financement pour les PME ivoiriennes avec des outils modernes et efficaces.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl border border-orange-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Candidature Rapide</h3>
              <p className="text-gray-600">
                Soumettez vos demandes de financement en quelques minutes avec notre interface intuitive.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl border border-orange-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Accompagnement Expert</h3>
              <p className="text-gray-600">
                Bénéficiez du soutien d'experts en financement des PME tout au long de votre parcours.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl border border-orange-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Suivi en Temps Réel</h3>
              <p className="text-gray-600">
                Suivez l'évolution de vos candidatures et recevez des notifications instantanées.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              L'impact de GROWF en chiffres
            </h2>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Notre plateforme transforme l'écosystème entrepreneurial ivoirien
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-orange-100">PME accompagnées</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50M+</div>
              <div className="text-orange-100">FCFA financés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">25+</div>
              <div className="text-orange-100">Programmes actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">85%</div>
              <div className="text-orange-100">Taux de satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Trois étapes simples pour accéder au financement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Inscrivez-vous</h3>
              <p className="text-gray-600">
                Créez votre profil entreprise et complétez vos informations en quelques minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Candidatez</h3>
              <p className="text-gray-600">
                Explorez les programmes disponibles et soumettez vos candidatures adaptées à vos besoins.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Obtenez le financement</h3>
              <p className="text-gray-600">
                Suivez l'évaluation de votre dossier et recevez le financement approuvé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir GROWF ?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Sécurité garantie</h3>
                    <p className="text-gray-600">Vos données sont protégées avec les plus hauts standards de sécurité.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Expertise locale</h3>
                    <p className="text-gray-600">Une connaissance approfondie du marché ivoirien et de ses spécificités.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Transparence totale</h3>
                    <p className="text-gray-600">Critères clairs, processus transparent et communication régulière.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Support continu</h3>
                    <p className="text-gray-600">Accompagnement avant, pendant et après l'obtention du financement.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl p-8 text-white">
                <Shield className="h-16 w-16 mb-6 opacity-80" />
                <h3 className="text-2xl font-bold mb-4">Plateforme certifiée</h3>
                <p className="text-orange-100 mb-6">
                  GROWF est une plateforme officielle soutenue par Côte d'Ivoire PME, garantissant
                  la fiabilité et la légitimité de tous nos programmes de financement.
                </p>
                <div className="text-sm text-orange-200">
                  ✓ Certifiée par les autorités ivoiriennes<br />
                  ✓ Partenariats avec les institutions financières<br />
                  ✓ Conformité réglementaire assurée
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-amber-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à développer votre entreprise ?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Rejoignez des centaines d'entrepreneurs ivoiriens qui ont déjà fait confiance à GROWF pour leur financement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Créer mon compte gratuit
            </Link>
            <Link
              to="/programs"
              className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Explorer les programmes
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={cipmeLogoJpg}
                  alt="Côte d'Ivoire PME"
                  className="h-8 w-auto object-contain filter brightness-0 invert"
                />
                <span className="text-xl font-bold">GROWF</span>
              </div>
              <p className="text-gray-400 text-sm">
                Accompagner l'audace et l'ambition de nos entrepreneur.e.s vers la croissance et la réussite.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Plateforme</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/programs" className="hover:text-white transition-colors">Programmes</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Tableau de bord</Link></li>
                <li><Link to="/applications" className="hover:text-white transition-colors">Mes candidatures</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 GROWF - Côte d'Ivoire PME. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;