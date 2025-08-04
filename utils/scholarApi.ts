// @/utils/scholarApi.ts
/**
 * Service to interact with Google Scholar via Serply API
 */

import type { ScholarSearchParams, ScholarArticle, CitationData, ApiError } from '@/types';

// Internal types for Scholar API
interface ScholarApiOptions {
  proxyLocation?: string;
  userAgent?: string;
}

interface SerplyApiResponse {
  articles?: Array<{
    id?: string;
    title?: string;
    authors?: string;
    year?: string;
    journal?: string;
    abstract?: string;
    link?: string;
    citations?: number;
    extras?: {
      citations?: {
        count?: string;
      };
    };
  }>;
}

interface AdvancedSearchFilters {
  query?: string;
  author?: string;
  publication?: string;
  yearFrom?: number;
  yearTo?: number;
}

/**
 * Search for scholarly articles based on the query
 * @param query - The search query
 * @param options - Optional parameters
 * @returns Promise resolving to the search results
 */
export const searchScholar = async (
  query: string, 
  options: ScholarApiOptions = {}
): Promise<SerplyApiResponse> => {
  const {
    proxyLocation = 'US',
    userAgent = 'desktop',
  } = options;

  // Ensure query is properly encoded - if it's not already encoded
  const encodedQuery = query.includes('%') ? query : encodeURIComponent(query);
  
  try {
    if (!process.env.NEXT_PUBLIC_SERPLY_API_URL) {
      const error: ApiError = { 
        message: 'SERPLY_API_URL environment variable is not configured',
        code: 'CONFIG_ERROR'
      };
      throw error;
    }

    if (!process.env.SERPLY_API_KEY) {
      const error: ApiError = { 
        message: 'SERPLY_API_KEY environment variable is not configured',
        code: 'CONFIG_ERROR'
      };
      throw error;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SERPLY_API_URL}/v1/scholar/q=${encodedQuery}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Agent': userAgent,
        'X-Proxy-Location': proxyLocation,
        'X-Api-Key': process.env.SERPLY_API_KEY,
      },
    });

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use the default error message
      }
      
      const error: ApiError = { 
        message: errorMessage,
        status: response.status
      };
      throw error;
    }

    const data: SerplyApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from Scholar API:', error);
    throw error;
  }
};

/**
 * Get a specific article by ID
 * @param articleId - The Google Scholar article ID
 * @returns Promise resolving to the article details
 */
export const getArticleById = async (articleId: string): Promise<ScholarArticle> => {
  try {
    if (!articleId) {
      const error: ApiError = { message: 'Article ID is required' };
      throw error;
    }

    // Using the ID to create a specific query
    const query = `as_q=&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_vis=0&as_sdt=1,5&as_sdtp=&as_cites=${articleId}`;
    
    const data = await searchScholar(query);
    
    if (data.articles && data.articles.length > 0) {
      const article = data.articles[0];
      return {
        id: article.id || articleId,
        title: article.title || 'Untitled Article',
        authors: article.authors || 'Unknown Authors',
        year: article.year || 'Unknown Year',
        journal: article.journal,
        abstract: article.abstract,
        url: article.link,
        citations: article.citations || (article.extras?.citations?.count ? Number(article.extras.citations.count.replace('Cited by ', '')) : 0) || 0,
        extras: article.extras
      };
    }
    
    const error: ApiError = { message: 'Article not found' };
    throw error;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
};

/**
 * Get articles by author name
 * @param authorName - The author name to search for
 * @returns Promise resolving to array of articles by the author
 */
export const getArticlesByAuthor = async (authorName: string): Promise<ScholarArticle[]> => {
  try {
    if (!authorName) {
      const error: ApiError = { message: 'Author name is required' };
      throw error;
    }

    const query = `as_q=&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=${encodeURIComponent(authorName)}&as_publication=&as_ylo=&as_yhi=&as_vis=0&as_sdt=1,5&as_sdtp=`;
    
    const data = await searchScholar(query);
    
    if (!data.articles) {
      return [];
    }

    return data.articles.map(article => ({
      id: article.id || Math.random().toString(36).substring(2, 10),
      title: article.title || 'Untitled Article',
      authors: article.authors || 'Unknown Authors',
      year: article.year || 'Unknown Year',
      journal: article.journal,
      abstract: article.abstract,
      url: article.link,
      citations: article.citations || Number(article.extras?.citations?.count?.replace('Cited by ', '')) || 0,
      extras: article.extras
    }));
  } catch (error) {
    console.error('Error fetching articles by author:', error);
    throw error;
  }
};

/**
 * Search for articles with advanced filters
 * @param filters - Search filters
 * @returns Promise resolving to filtered search results
 */
export const advancedSearch = async (filters: AdvancedSearchFilters): Promise<ScholarArticle[]> => {
  const {
    query = '',
    author = '',
    publication = '',
    yearFrom,
    yearTo,
  } = filters;

  try {
    const advQuery = `as_q=${encodeURIComponent(query)}&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=${encodeURIComponent(author)}&as_publication=${encodeURIComponent(publication)}&as_ylo=${yearFrom || ''}&as_yhi=${yearTo || ''}&as_vis=0&as_sdt=1,5&as_sdtp=`;
    
    const data = await searchScholar(advQuery);
    
    if (!data.articles) {
      return [];
    }

    return data.articles.map(article => ({
      id: article.id || Math.random().toString(36).substring(2, 10),
      title: article.title || 'Untitled Article',
      authors: article.authors || 'Unknown Authors',
      year: article.year || 'Unknown Year',
      journal: article.journal,
      abstract: article.abstract,
      url: article.link,
      citations: article.citations || Number(article.extras?.citations?.count?.replace('Cited by ', '')) || 0,
      extras: article.extras
    }));
  } catch (error) {
    console.error('Error performing advanced search:', error);
    throw error;
  }
};

/**
 * Get citation data for an article
 * @param articleId - The Google Scholar article ID
 * @returns Promise resolving to citation data including count and citing articles
 */
export const getCitations = async (articleId: string): Promise<CitationData> => {
  try {
    if (!articleId) {
      const error: ApiError = { message: 'Article ID is required' };
      throw error;
    }

    const query = `cites=${articleId}`;
    
    const data = await searchScholar(query);
    
    // Process the citation data
    const citationData: CitationData = {
      count: 0,
      citingArticles: [],
    };
    
    if (data.articles) {
      // The first result might contain citation count in extras
      if (data.articles[0]?.extras?.citations?.count) {
        const countString = data.articles[0].extras.citations.count;
        const countMatch = countString.match(/\\d+/);
        citationData.count = countMatch ? parseInt(countMatch[0], 10) : 0;
      }
      
      citationData.citingArticles = data.articles.map(article => ({
        id: article.id || Math.random().toString(36).substring(2, 10),
        title: article.title || 'Untitled Article',
        authors: article.authors || 'Unknown Authors',
        year: article.year || 'Unknown Year',
        journal: article.journal,
        abstract: article.abstract,
        url: article.link,
        citations: article.citations || (article.extras?.citations?.count ? Number(article.extras.citations.count.replace('Cited by ', '')) : 0) || 0,
        extras: article.extras
      }));
    }
    
    return citationData;
  } catch (error) {
    console.error('Error fetching citation data:', error);
    throw error;
  }
};

// Export types for use in other files
export type { ScholarApiOptions, SerplyApiResponse, AdvancedSearchFilters };