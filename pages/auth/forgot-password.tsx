import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import type { NextPage } from 'next';
import { useAuth } from '@/context/AuthContext';
import { withPublicAuth } from '@/middleware/authMiddleware';

const ForgotPassword: NextPage = () => {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Form state
  const [email, setEmail] = useState<string>('');

  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <>
      <Head>
        <title>Forgot Password - OpenScholar Hub</title>
        <meta name="description" content="Reset your OpenScholar Hub password" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-blue-600">OpenScholar Hub</h1>
            <h2 className="mt-3 text-xl font-semibold text-gray-700">Reset your password</h2>
            <p className="mt-2 text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {success ? (
              <div className="text-center">
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                  Password reset email sent! Check your inbox for further instructions.
                </div>
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium">
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handlePasswordReset}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Email'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Wrap with withPublicAuth to redirect authenticated users away from this page
export default withPublicAuth(ForgotPassword);
