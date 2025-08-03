import { QueryClient } from '@tanstack/react-query';

/**
 * Optimized React Query client configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data for 10 minutes when component unmounts
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Refetch when reconnecting to network
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Network failures should be retried
      retryDelay: 1000,
    },
  },
});

// Query keys factory for consistent key generation
export const queryKeys = {
  // Auth
  auth: {
    user: () => ['auth', 'user'] as const,
    profile: (userId: string) => ['auth', 'profile', userId] as const,
  },
  
  // Projects
  projects: {
    all: () => ['projects'] as const,
    lists: () => [...queryKeys.projects.all(), 'list'] as const,
    list: (filters: string) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    stats: () => [...queryKeys.projects.all(), 'stats'] as const,
  },
  
  // Research
  research: {
    all: () => ['research'] as const,
    searches: () => [...queryKeys.research.all(), 'search'] as const,
    search: (query: string, filters?: any) => [...queryKeys.research.searches(), query, filters] as const,
    articles: () => [...queryKeys.research.all(), 'article'] as const,
    article: (id: string) => [...queryKeys.research.articles(), id] as const,
    saved: () => [...queryKeys.research.all(), 'saved'] as const,
    recommendations: () => [...queryKeys.research.all(), 'recommendations'] as const,
    trending: () => [...queryKeys.research.all(), 'trending'] as const,
  },
  
  // Chat
  chat: {
    all: () => ['chat'] as const,
    channels: () => [...queryKeys.chat.all(), 'channels'] as const,
    messages: (channelId: string) => [...queryKeys.chat.all(), 'messages', channelId] as const,
    directMessages: (userId: string) => [...queryKeys.chat.all(), 'dm', userId] as const,
  },
} as const;