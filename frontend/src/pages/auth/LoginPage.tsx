import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import type { LoginRequest } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary-600">GROWF</h1>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-secondary-900">
            Connectez-vous à votre compte
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Ou{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              créez un nouveau compte
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="form-input"
                {...register('email')}
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="form-input"
                {...register('password')}
              />
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary"
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
        <div className="text-center">
          <p className="text-xs text-secondary-500">
            En vous connectant, vous acceptez nos{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};