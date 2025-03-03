/**
 * Utilities for interacting with the Serply API for Google Scholar data
 */

/**
 * Search for papers on Google Scholar via Serply API
 * 
 * @param {string} query - The search query
 * @param {Object} options - Additional search options
 * @param {number} options.limit - Number of results to return (default: 10)
 * @param {number} options.page - Page number for pagination (default: 0)
 * @returns {Promise<Object>} - Search results
 */
export async function searchScholarPapers(query, options = {}) {
  const { limit = 10, page = 0 } = options;
  
  try {
    // Include query parameters in the request body
    const response = await fetch('/api/scholar/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit,
        page,
      }),
    });

    // Check for errors and handle them appropriately
    if (!response.ok) {
      let errorMessage = 'Failed to search Google Scholar';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use default error message
        console.error('Error parsing error response:', e);
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching Google Scholar:', error);
    throw error;
  }
}

/**
 * Get citation data for a specific paper
 * 
 * @param {string} paperId - The ID of the paper to get citations for
 * @param {Object} options - Additional options
 * @param {number} options.limit - Number of results to return (default: 10)
 * @returns {Promise<Object>} - Citation data
 */
export async function getPaperCitations(paperId, options = {}) {
  const { limit = 10 } = options;
  
  try {
    const response = await fetch('/api/scholar/citations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paperId,
        limit,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to get citation data';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting citation data:', error);
    throw error;
  }
}

/**
 * Get author profile data
 * 
 * @param {string} authorId - The ID of the author
 * @returns {Promise<Object>} - Author profile data
 */
export async function getAuthorProfile(authorId) {
  try {
    const response = await fetch('/api/scholar/author', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authorId,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to get author profile';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting author profile:', error);
    throw error;
  }
}

/**
 * Get related papers for a specific paper
 * 
 * @param {string} paperId - The ID of the paper to get related papers for
 * @param {Object} options - Additional options
 * @param {number} options.limit - Number of results to return (default: 5)
 * @returns {Promise<Object>} - Related papers data
 */
export async function getRelatedPapers(paperId, options = {}) {
  const { limit = 5 } = options;
  
  try {
    const response = await fetch('/api/scholar/related', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paperId,
        limit,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to get related papers';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting related papers:', error);
    throw error;
  }
}