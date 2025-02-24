import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import Navbar from './components/Navbar';

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>OpenScholar Hub</title>
      </Head>
      <Navbar />
      <main className="mt-16 p-4">
        <h1 className="text-3xl font-bold mb-4">Welcome to OpenScholar Hub!</h1>
        {user ? (
          <p className="text-xl">Hello, {user.displayName || 'Scholar'}! Explore your dashboard and continue your research journey.</p>
        ) : (
          <p className="text-xl">Sign in to access personalized features and collaborate with peers.</p>
        )}
      </main>
    </>
  );
}
