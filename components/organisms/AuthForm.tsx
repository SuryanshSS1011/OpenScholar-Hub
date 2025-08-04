import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import * as yup from 'yup';
import FormProvider from '@/components/molecules/FormProvider';
import FormField from '@/components/molecules/FormField';
import FormSubmit from '@/components/molecules/FormSubmit';
import Button from '@/components/atoms/Button';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface AuthFormProps {
  type: 'signin' | 'signup' | 'forgot-password';
  onSubmit: (data: any) => Promise<void>;
  onGoogleAuth?: () => Promise<void>;
}

// Validation schemas
const signinSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const signupSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const forgotPasswordSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

/**
 * Unified authentication form component
 */
function AuthForm({ type, onSubmit, onGoogleAuth }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { error } = useAuthStore();

  const getSchema = () => {
    switch (type) {
      case 'signup':
        return signupSchema;
      case 'forgot-password':
        return forgotPasswordSchema;
      default:
        return signinSchema;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'signup':
        return 'Create your account';
      case 'forgot-password':
        return 'Reset your password';
      default:
        return 'Welcome back';
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case 'signup':
        return 'Join OpenScholar Hub to start your research journey';
      case 'forgot-password':
        return 'Enter your email to receive a password reset link';
      default:
        return 'Sign in to your OpenScholar Hub account';
    }
  };

  const getDefaultValues = () => {
    switch (type) {
      case 'signup':
        return { name: '', email: '', password: '', confirmPassword: '' };
      case 'forgot-password':
        return { email: '' };
      default:
        return { email: '', password: '' };
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <span className="text-blue-600 font-bold text-3xl">OS</span>
            <span className="text-gray-900 font-bold text-3xl">Hub</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {getTitle()}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getSubtitle()}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
          <FormProvider
            schema={getSchema()}
            defaultValues={getDefaultValues()}
            onSubmit={onSubmit}
          >
            <div className="space-y-6">
              {type === 'signup' && (
                <FormField
                  name="name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  icon={<User size={18} />}
                  required
                />
              )}

              <FormField
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                icon={<Mail size={18} />}
                required
              />

              {type !== 'forgot-password' && (
                <>
                  <FormField
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    icon={<Lock size={18} />}
                    required
                  >
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} className="text-gray-400" />
                        ) : (
                          <Eye size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </FormField>

                  {type === 'signup' && (
                    <FormField
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      icon={<Lock size={18} />}
                      required
                    />
                  )}
                </>
              )}

              <FormSubmit className="w-full" size="lg">
                {type === 'signup' ? 'Create Account' :
                  type === 'forgot-password' ? 'Send Reset Link' :
                    'Sign In'}
              </FormSubmit>

              {type !== 'forgot-password' && onGoogleAuth && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="large"
                    className="w-full"
                    onClick={onGoogleAuth}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign {type === 'signup' ? 'up' : 'in'} with Google
                  </Button>
                </>
              )}
            </div>
          </FormProvider>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            {type === 'signin' && (
              <>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
                <div className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500">
                    Sign up
                  </Link>
                </div>
              </>
            )}

            {type === 'signup' && (
              <div className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </div>
            )}

            {type === 'forgot-password' && (
              <div className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthForm;