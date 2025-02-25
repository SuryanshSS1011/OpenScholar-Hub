import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import '@/styles/globals.css';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Track page views (can be integrated with analytics later)
  useEffect(() => {
    const handleRouteChange = (url) => {
      // This is where you would typically track page views with analytics
      console.log(`Page navigated to: ${url}`);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}