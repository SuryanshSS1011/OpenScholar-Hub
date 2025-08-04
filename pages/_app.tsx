import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/context/AuthContext';
import { ChatProvider } from '@/context/ChatContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Track page views (can be integrated with analytics later)
  useEffect(() => {
    const handleRouteChange = (url: string) => {
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
      <ChatProvider>
        <Component {...pageProps} />
      </ChatProvider>
    </AuthProvider>
  );
}
