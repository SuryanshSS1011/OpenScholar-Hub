import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/Toaster';
import ErrorBoundary from '@/components/organisms/ErrorBoundary';
import { queryClient } from '@/lib/query-client';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Root application layout with providers and error boundaries
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        
        {/* Global toast notifications */}
        <Toaster />
        
        {/* React Query DevTools in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </ErrorBoundary>
    </QueryClientProvider>
  );
}