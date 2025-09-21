import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { UserRole, type RegisterRequest } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/,
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
      const { confirmPassword, ...registerData } = data;
      // Tous les comptes créés via l'inscription publique sont des comptes COMPANY
      const finalData = { ...registerData, role: UserRole.COMPANY };
      await registerUser(finalData as RegisterRequest);
      toast.success('Compte créé avec succès ! Vérifiez votre email pour activer votre compte.');
      navigate('/login');
    } catch (error) {
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
            Créer votre compte entreprise
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Rejoignez GROWF en tant qu'entreprise ou porteur de projet
          </p>
          <p className="mt-1 text-sm text-secondary-600">
            Ou{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              connectez-vous à votre compte existant
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
                autoComplete="new-password"
                className="form-input"
                {...register('password')}
              />
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="form-input"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary"
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
        <div className="text-center">
          <p className="text-xs text-secondary-500">
            En créant un compte, vous acceptez nos{' '}
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