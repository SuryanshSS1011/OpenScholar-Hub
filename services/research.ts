import { apiClient } from './api';

// Research-related types
export interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  publishedDate: string;
  citations: number;
  journal?: string;
  tags?: string[];
}

export interface SearchParams {
  query: string;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'citations';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SearchResponse {
  articles: Article[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface SavedArticle extends Article {
  savedAt: string;
  notes?: string;
  tags?: string[];
}

// Research API service
export const researchService = {
  // Search for articles
  searchArticles: async (params: SearchParams): Promise<SearchResponse> => {
    return apiClient.get<SearchResponse>(`/scholar?${new URLSearchParams(params as any).toString()}`);
  },

  // Get article details
  getArticle: async (id: string): Promise<Article> => {
    return apiClient.get<Article>(`/articles/${id}`);
  },

  // Save article
  saveArticle: async (articleId: string, notes?: string, tags?: string[]): Promise<SavedArticle> => {
    return apiClient.post<SavedArticle>('/saved-articles', {
      articleId,
      notes,
      tags,
    });
  },

  // Get saved articles
  getSavedArticles: async (): Promise<SavedArticle[]> => {
    return apiClient.get<SavedArticle[]>('/saved-articles');
  },

  // Remove saved article
  removeSavedArticle: async (articleId: string): Promise<void> => {
    return apiClient.delete<void>(`/saved-articles/${articleId}`);
  },

  // Update saved article notes/tags
  updateSavedArticle: async (articleId: string, updates: { notes?: string; tags?: string[] }): Promise<SavedArticle> => {
    return apiClient.patch<SavedArticle>(`/saved-articles/${articleId}`, updates);
  },

  // Get recommendations
  getRecommendations: async (limit = 10): Promise<Article[]> => {
    return apiClient.get<Article[]>(`/recommendations?limit=${limit}`);
  },

  // Get trending articles
  getTrendingArticles: async (limit = 10): Promise<Article[]> => {
    return apiClient.get<Article[]>(`/trending?limit=${limit}`);
  },
};

export default researchService;