import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { UserRole, type RegisterRequest } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import cipmeLogoPng from '../../assets/images/logo-ci-pme.png';

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      'Le mot de passe doit contenir au moins une lettre minuscule, une majuscule, un chiffre et un caractère spécial'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;
      // Tous les comptes créés via l'inscription publique sont des comptes COMPANY
      const finalData = { ...registerData, role: UserRole.COMPANY };
      await registerUser(finalData as RegisterRequest);
      toast.success('Compte créé avec succès ! Vérifiez votre email pour activer votre compte.');
      navigate('/login');
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
              Créer votre compte entreprise
            </h2>
            <p className="text-sm text-gray-600 mb-1">
              Rejoignez GROWF en tant qu'entreprise ou porteur de projet
            </p>
            <p className="text-sm text-gray-600">
              Ou{' '}
              <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
                connectez-vous à votre compte existant
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
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Spinner size="sm" className="mr-2" />
                  Création du compte...
                </div>
              ) : (
                'Créer le compte'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              En créant un compte, vous acceptez nos{' '}
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