import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Layout from './components/Layout';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <Layout>
      <Head>
        <title>OpenScholar Hub - Democratizing Research Collaboration</title>
        <meta name="description" content="A web platform enabling students, researchers, and professionals to collaborate on research projects, share datasets, and publish findings in an open environment." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* Hero Section */}
        <div className="relative bg-blue-600">
          <div className="absolute inset-0">
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-blue-800 mix-blend-multiply" />
          </div>
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">OpenScholar Hub</h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl">
              A platform that democratizes research collaboration by creating a secure, transparent, and accessible environment for knowledge sharing.
            </p>
            <div className="mt-10 max-w-sm sm:flex sm:max-w-none">
              {loading ? (
                <div className="animate-pulse h-12 w-40 bg-white/20 rounded-md"></div>
              ) : user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 sm:px-8"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 sm:px-8"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Features</h2>
              <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
                Why Use OpenScholar Hub?
              </p>
              <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                Our platform provides powerful tools for researchers and academics to collaborate effectively.
              </p>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Collaborative Research</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Work together with peers on research projects regardless of institutional affiliation or geographical location.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Secure Data Sharing</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Share research data securely with version control and access management.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Open Access Publishing</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Publish and discover research findings in an open-access environment with proper attribution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to start collaborating?</span>
              <span className="block">Join OpenScholar Hub today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-200">
              Sign up and connect with researchers worldwide. Share your work, collaborate on projects, and accelerate scientific discovery.
            </p>
            <div className="mt-8 flex justify-center">
              {loading ? (
                <div className="animate-pulse h-12 w-40 bg-white/20 rounded-md"></div>
              ) : user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                >
                  Sign Up for Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
