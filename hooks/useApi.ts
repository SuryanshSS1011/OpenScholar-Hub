import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  type UseQueryOptions,
  type UseMutationOptions 
} from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { queryKeys } from '@/lib/query-client';
import { useNotifications } from '@/store/ui';

/**
 * Enhanced API hooks with optimistic updates and error handling
 */

// Projects hooks
export function useProjects(filters?: any) {
  return useQuery({
    queryKey: queryKeys.projects.list(JSON.stringify(filters || {})),
    queryFn: () => apiClient.get('/projects'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useProject(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => apiClient.get(`/projects/${id}`),
    enabled: enabled && !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (data: any) => apiClient.post('/projects', data),
    onSuccess: (newProject: any) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      
      // Add the new project to the cache
      queryClient.setQueryData(
        queryKeys.projects.detail(newProject.id),
        newProject
      );
      
      addNotification({
        type: 'success',
        title: 'Project created',
        message: 'Your project has been created successfully.',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to create project',
        message: error.message || 'Something went wrong.',
      });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (data: any) => apiClient.put(`/projects/${id}`, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.detail(id) });

      // Snapshot previous value
      const previousProject = queryClient.getQueryData(queryKeys.projects.detail(id));

      // Optimistically update
      queryClient.setQueryData(queryKeys.projects.detail(id), (old: any) => ({
        ...old,
        ...newData,
      }));

      return { previousProject };
    },
    onError: (error, newData, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(queryKeys.projects.detail(id), context.previousProject);
      }
      
      addNotification({
        type: 'error',
        title: 'Failed to update project',
        message: error.message || 'Something went wrong.',
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
    },
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Project updated',
        message: 'Your project has been updated successfully.',
      });
    },
  });
}

// Research hooks
export function useResearchSearch(query: string, filters?: any) {
  return useQuery({
    queryKey: queryKeys.research.search(query, filters),
    queryFn: () => apiClient.get('/scholar', { params: { q: query, ...filters } }),
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes for search results
  });
}

export function useArticle(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.research.article(id),
    queryFn: () => apiClient.get(`/articles/${id}`),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // Articles don't change often
  });
}

export function useSavedArticles() {
  return useQuery({
    queryKey: queryKeys.research.saved(),
    queryFn: () => apiClient.get('/saved-articles'),
  });
}

export function useSaveArticle() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ articleId, notes, tags }: any) => 
      apiClient.post('/saved-articles', { articleId, notes, tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.research.saved() });
      addNotification({
        type: 'success',
        title: 'Article saved',
        message: 'Article has been added to your saved articles.',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Failed to save article',
        message: error.message || 'Something went wrong.',
      });
    },
  });
}

export function useRemoveSavedArticle() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (articleId: string) => apiClient.delete(`/saved-articles/${articleId}`),
    onMutate: async (articleId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.research.saved() });
      
      const previousSaved = queryClient.getQueryData(queryKeys.research.saved());
      
      // Optimistically remove from saved articles
      queryClient.setQueryData(queryKeys.research.saved(), (old: any[]) =>
        old?.filter((article) => article.id !== articleId) || []
      );
      
      return { previousSaved };
    },
    onError: (error, articleId, context) => {
      if (context?.previousSaved) {
        queryClient.setQueryData(queryKeys.research.saved(), context.previousSaved);
      }
      addNotification({
        type: 'error',
        title: 'Failed to remove article',
        message: error.message || 'Something went wrong.',
      });
    },
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Article removed',
        message: 'Article has been removed from your saved articles.',
      });
    },
  });
}

// Generic hooks for common patterns
export function useApiQuery<T>(
  key: any[],
  url: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: key,
    queryFn: () => apiClient.get<T>(url),
    ...options,
  });
}

export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn,
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Operation failed',
        message: error.message || 'Something went wrong.',
      });
    },
    ...options,
  });
}