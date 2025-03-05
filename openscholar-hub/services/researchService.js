// File path: @/services/researchService.js

/**
 * Service to interact with academic research APIs and Firestore
 */

import { collection, addDoc, query, where, getDocs, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebaseconfig';

/**
 * Search for academic papers
 * @param {string} searchQuery - The search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of research paper objects
 */
export const searchResearch = async (searchQuery, options = {}) => {
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
      queryParams.append('yearFrom', options.yearFrom);
    }
    
    if (options.yearTo) {
      queryParams.append('yearTo', options.yearTo);
    }
    
    const response = await fetch(`/api/scholar?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Structure papers into a consistent format
    const papers = (data.articles || []).map(article => ({
      id: article.id || Math.random().toString(36).substring(2, 10),
      title: article.title || 'Untitled Paper',
      authors: article.author?.names || article.authors || 'Unknown Authors',
      year: article.year || article.publicationYear || 'Unknown Year',
      journal: article.journal || article.publication || '',
      abstract: article.abstract || '',
      url: article.link || '',
      citations: article.citations || article.extras?.citations?.count || 0
    }));
    
    return { papers };
  } catch (error) {
    console.error('Error in searchResearch:', error);
    throw error;
  }
};

/**
 * Get details for a specific paper
 * @param {string} paperId - The paper ID
 * @returns {Promise<Object>} Paper details
 */
export const getPaperDetails = async (paperId) => {
  try {
    // First check if we have this paper stored in Firestore
    const paperRef = doc(db, 'research_papers', paperId);
    const paperDoc = await getDoc(paperRef);
    
    if (paperDoc.exists()) {
      return {
        id: paperDoc.id,
        ...paperDoc.data(),
        storedInFirestore: true
      };
    }
    
    // Otherwise fetch from external API
    const response = await fetch(`/api/scholar?action=article&id=${paperId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch paper details: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format paper data consistently
    return {
      id: data.id || paperId,
      title: data.title || 'Untitled Paper',
      authors: data.author?.names || data.authors || 'Unknown Authors',
      year: data.year || data.publicationYear || 'Unknown Year',
      journal: data.journal || data.publication || '',
      abstract: data.abstract || '',
      url: data.link || '',
      citations: data.citations || data.extras?.citations?.count || 0,
      storedInFirestore: false
    };
  } catch (error) {
    console.error('Error in getPaperDetails:', error);
    throw error;
  }
};

/**
 * Save a paper to a user's saved articles
 * @param {string} userId - The user ID
 * @param {Object} paperData - The paper data to save
 * @returns {Promise<Object>} The saved paper reference
 */
export const savePaper = async (userId, paperData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to save a paper');
    }
    
    if (!paperData || !paperData.id || !paperData.title) {
      throw new Error('Invalid paper data');
    }
    
    // Check if paper already exists in the research_papers collection
    const paperQuery = query(
      collection(db, 'research_papers'),
      where('originalId', '==', paperData.id)
    );
    
    const existingPapers = await getDocs(paperQuery);
    let paperId;
    
    if (existingPapers.empty) {
      // Store the paper in the research_papers collection
      const paperRef = await addDoc(collection(db, 'research_papers'), {
        originalId: paperData.id,
        title: paperData.title,
        authors: paperData.authors,
        year: paperData.year,
        journal: paperData.journal,
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
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of saved paper objects
 */
export const getSavedPapers = async (userId) => {
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
      savedSnapshot.docs.map(async (doc) => {
        const savedData = doc.data();
        const paperDoc = await getDoc(doc(db, 'research_papers', savedData.paperId));
        
        if (!paperDoc.exists()) {
          return null;
        }
        
        const paperData = paperDoc.data();
        
        return {
          id: doc.id,
          paperId: savedData.paperId,
          savedAt: savedData.savedAt?.toDate().toISOString() || null,
          title: paperData.title,
          authors: paperData.authors,
          year: paperData.year,
          journal: paperData.journal,
          abstract: paperData.abstract || '',
          url: paperData.url || '',
          citations: paperData.citations || 0
        };
      })
    );
    
    // Filter out any nulls from papers that couldn't be found
    return savedPapers.filter(Boolean);
  } catch (error) {
    console.error('Error in getSavedPapers:', error);
    throw error;
  }
};

/**
 * Remove a paper from user's saved collection
 * @param {string} savedId - The saved paper ID to remove
 * @returns {Promise<void>}
 */
export const removeSavedPaper = async (savedId) => {
  try {
    await db.collection('saved_papers').doc(savedId).delete();
  } catch (error) {
    console.error('Error in removeSavedPaper:', error);
    throw error;
  }
};