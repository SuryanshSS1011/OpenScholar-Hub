// File path: @/services/researchService.ts

/**
 * Service to interact with academic research APIs and Firestore
 */

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  serverTimestamp,
  deleteDoc,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebaseconfig';
import type { 
  ResearchPaper, 
  SavedPaper, 
  ScholarSearchParams,
  ApiError 
} from '@/types';

// Internal types for research service
interface ResearchSearchOptions {
  author?: string;
  yearFrom?: string | number;
  yearTo?: string | number;
}

interface ResearchSearchResponse {
  papers: ResearchPaper[];
}

interface ScholarApiResponse {
  articles?: Array<{
    id?: string;
    title?: string;
    author?: { names?: string };
    authors?: string;
    year?: string | number;
    publicationYear?: string | number;
    journal?: string;
    publication?: string;
    abstract?: string;
    link?: string;
    citations?: number;
    extras?: {
      citations?: {
        count?: string | number;
      };
    };
  }>;
}

interface SavedPaperData {
  id: string;
  title: string;
  authors?: string;
  year?: string | number;
  journal?: string;
  abstract?: string;
  url?: string;
  citations?: number;
}

interface SavedPaperResponse {
  id: string;
  paperId: string;
  savedAt: string;
}

/**
 * Search for academic papers
 * @param searchQuery - The search query
 * @param options - Search options
 * @returns Promise resolving to array of research paper objects
 */
export const searchResearch = async (
  searchQuery: string, 
  options: ResearchSearchOptions = {}
): Promise<ResearchSearchResponse> => {
  try {
    if (!searchQuery || !searchQuery.trim()) {
      return { papers: [] };
    }
    
    // This would typically be a call to an external scholarly API
    // For this implementation, we'll use our internal API endpoint
    const queryParams = new URLSearchParams({
      action: 'search',
      query: searchQuery,
    });
    
    // Add any additional filter parameters
    if (options.author) {
      queryParams.append('author', options.author);
    }
    
    if (options.yearFrom) {
      queryParams.append('yearFrom', options.yearFrom.toString());
    }
    
    if (options.yearTo) {
      queryParams.append('yearTo', options.yearTo.toString());
    }
    
    const response = await fetch(`/api/scholar?${queryParams}`);
    
    if (!response.ok) {
      const error: ApiError = {
        message: `Search failed: ${response.statusText}`,
        status: response.status
      };
      throw error;
    }
    
    const data: ScholarApiResponse = await response.json();
    
    // Structure papers into a consistent format
    const papers: ResearchPaper[] = (data.articles || []).map(article => ({
      id: article.id || Math.random().toString(36).substring(2, 10),
      title: article.title || 'Untitled Paper',
      authors: article.author?.names || article.authors || 'Unknown Authors',
      year: article.year || article.publicationYear || 'Unknown Year',
      journal: article.journal || article.publication || '',
      abstract: article.abstract || '',
      url: article.link || '',
      citations: article.citations || Number(article.extras?.citations?.count) || 0
    }));
    
    return { papers };
  } catch (error) {
    console.error('Error in searchResearch:', error);
    throw error;
  }
};

/**
 * Get details for a specific paper
 * @param paperId - The paper ID
 * @returns Promise resolving to paper details
 */
export const getPaperDetails = async (paperId: string): Promise<ResearchPaper> => {
  try {
    // First check if we have this paper stored in Firestore
    const paperRef = doc(db, 'research_papers', paperId);
    const paperDoc = await getDoc(paperRef);
    
    if (paperDoc.exists()) {
      const data = paperDoc.data();
      return {
        id: paperDoc.id,
        title: data.title || 'Untitled Paper',
        authors: data.authors || 'Unknown Authors',
        year: data.year || 'Unknown Year',
        journal: data.journal || '',
        abstract: data.abstract || '',
        url: data.url || '',
        citations: data.citations || 0,
        originalId: data.originalId,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        storedInFirestore: true
      };
    }
    
    // Otherwise fetch from external API
    const response = await fetch(`/api/scholar?action=article&id=${paperId}`);
    
    if (!response.ok) {
      const error: ApiError = {
        message: `Failed to fetch paper details: ${response.statusText}`,
        status: response.status
      };
      throw error;
    }
    
    const data: any = await response.json();
    
    // Format paper data consistently
    return {
      id: data?.id || paperId,
      title: data?.title || 'Untitled Paper',
      authors: data?.author?.names || data?.authors || 'Unknown Authors',
      year: data?.year || data?.publicationYear || 'Unknown Year',
      journal: data?.journal || data?.publication || '',
      abstract: data?.abstract || '',
      url: data?.link || '',
      citations: data?.citations || Number(data?.extras?.citations?.count) || 0,
      storedInFirestore: false
    };
  } catch (error) {
    console.error('Error in getPaperDetails:', error);
    throw error;
  }
};

/**
 * Save a paper to a user's saved articles
 * @param userId - The user ID
 * @param paperData - The paper data to save
 * @returns Promise resolving to the saved paper reference
 */
export const savePaper = async (
  userId: string, 
  paperData: SavedPaperData
): Promise<SavedPaperResponse> => {
  try {
    if (!userId) {
      const error: ApiError = { message: 'User ID is required to save a paper' };
      throw error;
    }
    
    if (!paperData || !paperData.id || !paperData.title) {
      const error: ApiError = { message: 'Invalid paper data' };
      throw error;
    }
    
    // Check if paper already exists in the research_papers collection
    const paperQuery = query(
      collection(db, 'research_papers'),
      where('originalId', '==', paperData.id)
    );
    
    const existingPapers = await getDocs(paperQuery);
    let paperId: string;
    
    if (existingPapers.empty) {
      // Store the paper in the research_papers collection
      const paperRef = await addDoc(collection(db, 'research_papers'), {
        originalId: paperData.id,
        title: paperData.title,
        authors: paperData.authors || 'Unknown Authors',
        year: paperData.year || 'Unknown Year',
        journal: paperData.journal || '',
        abstract: paperData.abstract || '',
        url: paperData.url || '',
        citations: paperData.citations || 0,
        createdAt: serverTimestamp()
      });
      
      paperId = paperRef.id;
    } else {
      // Use the existing paper ID
      paperId = existingPapers.docs[0].id;
    }
    
    // Add to user's saved papers
    const savedRef = await addDoc(collection(db, 'saved_papers'), {
      userId,
      paperId,
      savedAt: serverTimestamp()
    });
    
    return {
      id: savedRef.id,
      paperId,
      savedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in savePaper:', error);
    throw error;
  }
};

/**
 * Get papers saved by a user
 * @param userId - The user ID
 * @returns Promise resolving to array of saved paper objects
 */
export const getSavedPapers = async (userId: string): Promise<SavedPaper[]> => {
  try {
    if (!userId) {
      return [];
    }
    
    // Query user's saved papers
    const savedQuery = query(
      collection(db, 'saved_papers'),
      where('userId', '==', userId)
    );
    
    const savedSnapshot = await getDocs(savedQuery);
    
    if (savedSnapshot.empty) {
      return [];
    }
    
    // Get the full paper details for each saved paper
    const savedPapers = await Promise.all(
      savedSnapshot.docs.map(async (docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
        const savedData = docSnapshot.data();
        const paperDoc = await getDoc(doc(db, 'research_papers', savedData.paperId));
        
        if (!paperDoc.exists()) {
          return null;
        }
        
        const paperData = paperDoc.data();
        
        const savedPaper: SavedPaper = {
          id: docSnapshot.id,
          paperId: savedData.paperId,
          userId: savedData.userId,
          savedAt: savedData.savedAt instanceof Timestamp 
            ? savedData.savedAt.toDate().toISOString() 
            : savedData.savedAt || new Date().toISOString(),
          title: paperData.title || 'Untitled Paper',
          authors: paperData.authors || 'Unknown Authors',
          year: paperData.year || 'Unknown Year',
          journal: paperData.journal || '',
          abstract: paperData.abstract || '',
          url: paperData.url || '',
          citations: paperData.citations || 0,
          originalId: paperData.originalId
        };
        
        return savedPaper;
      })
    );
    
    // Filter out any nulls from papers that couldn't be found
    return savedPapers.filter((paper): paper is SavedPaper => paper !== null);
  } catch (error) {
    console.error('Error in getSavedPapers:', error);
    throw error;
  }
};

/**
 * Remove a paper from user's saved collection
 * @param savedId - The saved paper ID to remove
 * @returns Promise that resolves when the paper is removed
 */
export const removeSavedPaper = async (savedId: string): Promise<void> => {
  try {
    const savedPaperRef = doc(db, 'saved_papers', savedId);
    await deleteDoc(savedPaperRef);
  } catch (error) {
    console.error('Error in removeSavedPaper:', error);
    throw error;
  }
};
