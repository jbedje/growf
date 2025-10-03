import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Star,
  Play,
  Award,
  Target,
  PieChart,
  Globe,
  ChevronRight,
  Building2,
  Banknote,
  FileText,
  Clock
} from 'lucide-react';
import cipmeLogoPng from '../assets/images/logo-ci-pme.png';

export const LandingPageNew: React.FC = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const stats = [
    { value: '500+', label: 'PME accompagnées', icon: Building2 },
    { value: '50M+', label: 'FCFA financés', icon: Banknote },
    { value: '25+', label: 'Programmes actifs', icon: FileText },
    { value: '85%', label: 'Taux de satisfaction', icon: Star }
  ];

  const testimonials = [
    {
      name: "Aissata Koné",
      company: "Koné Textile SARL",
      text: "Grâce à GROWF, j'ai pu obtenir un financement de 15M FCFA pour développer mon atelier de confection. Le processus était simple et transparent.",
      rating: 5
    },
    {
      name: "Mamadou Diallo",
      company: "Tech Solutions CI",
      text: "L'accompagnement personnalisé de GROWF m'a permis de structurer mon business plan et d'obtenir le financement pour lancer ma startup tech.",
      rating: 5
    },
    {
      name: "Fatou Traoré",
      company: "Agro Bio Ivoire",
      text: "Excellent service ! J'ai été financée en seulement 3 semaines pour mon projet d'agriculture biologique. Je recommande vivement.",
      rating: 5
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Modern Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm border-b border-orange-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={cipmeLogoPng}
                  alt="Côte d'Ivoire PME"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  GROWF
                </h1>
                <p className="text-xs text-gray-600">Plateforme de Financement des PME</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animation */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden pt-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-amber-200 rounded-full opacity-30 animate-bounce delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-yellow-200 rounded-full opacity-25 animate-pulse delay-500"></div>
          <div className="absolute bottom-40 right-1/3 w-24 h-24 bg-orange-300 rounded-full opacity-20 animate-bounce delay-700"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-6">
                <Award className="w-4 h-4 mr-2" />
                Plateforme certifiée par Côte d'Ivoire PME
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Transformez votre
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 block animate-gradient-x">
                  vision en réalité
                </span>
              </h1>

              <p className="text-xl text-gray-600 max-w-2xl mb-8 leading-relaxed">
                GROWF révolutionne l'accès au financement pour les PME ivoiriennes.
                Une plateforme intelligente qui connecte l'ambition entrepreneuriale aux opportunités de croissance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  to="/register"
                  className="group bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  Démarrer maintenant
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center">
                  <Play className="mr-2 h-5 w-5" />
                  Voir la démo
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-600">2min</div>
                  <div className="text-sm text-gray-600">Inscription</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">48h</div>
                  <div className="text-sm text-gray-600">Réponse moyenne</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">100%</div>
                  <div className="text-sm text-gray-600">Gratuit</div>
                </div>
              </div>
            </div>

            {/* Right Content - Interactive Dashboard Preview */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Tableau de bord</h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>

                  {/* Animated Stat Card */}
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 text-white mb-4 transform transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">{stats[currentStat].value}</div>
                        <div className="text-orange-100 text-sm">{stats[currentStat].label}</div>
                      </div>
                      {React.createElement(stats[currentStat].icon, { className: "h-8 w-8 text-orange-200" })}
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Profil complété</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full w-4/5 animate-pulse"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Candidatures</span>
                        <span>3/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-3/5"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-bounce">
                  Nouveau financement!
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  Dossier approuvé
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-4">
              <Target className="w-4 h-4 mr-2" />
              Fonctionnalités
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Une plateforme pensée pour
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600"> votre succès</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              GROWF combine technologie de pointe et expertise locale pour révolutionner l'accès au financement des PME ivoiriennes.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "IA & Matching Intelligent",
                description: "Notre algorithme d'IA analyse votre profil et vous connecte automatiquement aux programmes les plus adaptés à vos besoins.",
                color: "orange"
              },
              {
                icon: Users,
                title: "Écosystème Collaboratif",
                description: "Rejoignez une communauté d'entrepreneurs, mentors et investisseurs pour maximiser vos chances de succès.",
                color: "blue"
              },
              {
                icon: PieChart,
                title: "Analytics Avancées",
                description: "Tableaux de bord intelligents pour suivre vos KPIs, analyser vos performances et optimiser votre croissance.",
                color: "green"
              },
              {
                icon: Shield,
                title: "Sécurité Bancaire",
                description: "Chiffrement de niveau bancaire et conformité GDPR pour protéger vos données sensibles et financières.",
                color: "purple"
              },
              {
                icon: Globe,
                title: "Réseau International",
                description: "Accédez à un réseau de partenaires internationaux pour développer votre business au-delà des frontières.",
                color: "indigo"
              },
              {
                icon: Clock,
                title: "Traitement Express",
                description: "Réduction de 70% des délais de traitement grâce à notre processus digitalisé et automatisé.",
                color: "red"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 ${
                  feature.color === 'orange' ? 'bg-orange-100' :
                  feature.color === 'blue' ? 'bg-blue-100' :
                  feature.color === 'green' ? 'bg-green-100' :
                  feature.color === 'purple' ? 'bg-purple-100' :
                  feature.color === 'indigo' ? 'bg-indigo-100' :
                  'bg-red-100'
                } rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {React.createElement(feature.icon, {
                    className: `h-8 w-8 ${
                      feature.color === 'orange' ? 'text-orange-600' :
                      feature.color === 'blue' ? 'text-blue-600' :
                      feature.color === 'green' ? 'text-green-600' :
                      feature.color === 'purple' ? 'text-purple-600' :
                      feature.color === 'indigo' ? 'text-indigo-600' :
                      'text-red-600'
                    }`
                  })}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronRight className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-orange-900 to-amber-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-amber-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              L'impact de GROWF en chiffres
            </h2>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Des résultats concrets qui transforment l'écosystème entrepreneurial ivoirien
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "PME accompagnées", icon: Building2, prefix: "" },
              { value: "50", label: "Millions FCFA financés", icon: Banknote, prefix: "" },
              { value: "25+", label: "Programmes actifs", icon: FileText, prefix: "" },
              { value: "85", label: "Taux de satisfaction", icon: Star, prefix: "%" }
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-all duration-300"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <stat.icon className="h-12 w-12 text-orange-300 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-4xl font-bold text-white mb-2">
                    {stat.value}{stat.prefix}
                  </div>
                  <div className="text-orange-100">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-4">
              <Star className="w-4 h-4 mr-2" />
              Témoignages
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-orange-600">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à révolutionner votre business ?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Rejoignez l'élite des entrepreneurs ivoiriens qui transforment leurs idées en succès avec GROWF.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center group"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/programs"
              className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              Explorer les programmes
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex justify-center items-center space-x-8 text-orange-100">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              <span className="text-sm">100% Sécurisé</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">Certifié CI-PME</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              <span className="text-sm">500+ Entreprises</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src={cipmeLogoPng}
                  alt="Côte d'Ivoire PME"
                  className="h-10 w-auto object-contain filter brightness-0 invert"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  GROWF
                </span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                La première plateforme intelligente de financement des PME en Côte d'Ivoire.
                Nous accompagnons l'audace entrepreneuriale vers la réussite et l'impact.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center hover:bg-orange-700 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center hover:bg-orange-700 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center hover:bg-orange-700 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">@</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-orange-400">Plateforme</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/programs" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Programmes</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Tableau de bord</Link></li>
                <li><Link to="/applications" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Candidatures</Link></li>
                <li><Link to="/community" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Communauté</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-orange-400">Support</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Webinaires</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-orange-400">Entreprise</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Presse</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200">Partenaires</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400 mb-4 md:mb-0">
                &copy; 2024 GROWF - Côte d'Ivoire PME. Tous droits réservés.
              </p>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a>
                <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageNew;