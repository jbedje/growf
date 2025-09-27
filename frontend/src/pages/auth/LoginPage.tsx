import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import type { LoginRequest } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import cipmeLogoPng from '../../assets/images/logo-ci-pme.png';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data as LoginRequest);
      toast.success('Connexion réussie');

      // Get the user from the store after successful login
      const { user } = useAuthStore.getState();

      // Determine redirect path based on user role
      let redirectPath = from;

      if (user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' ||
          user?.role === 'ANALYST' || user?.role === 'ORGANIZATION') {
        // For backoffice users, redirect to backoffice which will handle role-based routing
        redirectPath = '/backoffice';
      } else {
        // For companies and other users, redirect to dashboard
        redirectPath = from === '/dashboard' ? '/dashboard' : from;
      }

      console.log('Login successful, redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    } catch {
      // Error is handled by the store and toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-teal-400/10"></div>
      <div className="relative max-w-md w-full space-y-8">
        {/* Card Background */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100/50 p-8">
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="inline-block mb-6">
              <img
                src={cipmeLogoPng}
                alt="Côte d'Ivoire PME"
                className="h-16 mx-auto"
              />
            </Link>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-teal-600 mb-2">
              GROWF
            </h1>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Connectez-vous à votre compte
            </h2>
            <p className="text-sm text-gray-600">
              Ou{' '}
              <Link to="/register" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
                créez un nouveau compte
              </Link>
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-teal-600 hover:text-teal-500 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Spinner size="sm" className="mr-2" />
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              En vous connectant, vous acceptez nos{' '}
              <a href="#" className="text-orange-600 hover:text-orange-500 transition-colors">
                conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="#" className="text-orange-600 hover:text-orange-500 transition-colors">
                politique de confidentialité
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};