import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../../components/ui/Spinner';

export const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { verifyEmail } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (token) {
      verifyEmail(token)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    } else {
      setStatus('error');
    }
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary-600">GROWF</h1>
          </Link>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <Spinner size="lg" className="mx-auto" />
            <h2 className="text-xl font-semibold text-secondary-900">
              Vérification de votre email...
            </h2>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="h-16 w-16 text-success-600 mx-auto" />
            <h2 className="text-xl font-semibold text-secondary-900">
              Email vérifié avec succès !
            </h2>
            <p className="text-secondary-600">
              Votre compte a été activé. Vous pouvez maintenant vous connecter.
            </p>
            <Link to="/login" className="btn-primary">
              Se connecter
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <XCircle className="h-16 w-16 text-danger-600 mx-auto" />
            <h2 className="text-xl font-semibold text-secondary-900">
              Erreur de vérification
            </h2>
            <p className="text-secondary-600">
              Le lien de vérification est invalide ou a expiré.
            </p>
            <Link to="/login" className="btn-primary">
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};