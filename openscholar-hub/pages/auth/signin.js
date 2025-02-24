import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

const SignIn = () => {
  const { user, googleSignIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
        <button
          onClick={googleSignIn}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default SignIn;