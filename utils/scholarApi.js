// @/utils/scholarApi.js
/**
 * Service to interact with Google Scholar via Serply API
 */

/**
 * Search for scholarly articles based on the query
 * @param {string} query - The search query
 * @param {object} options - Optional parameters
 * @param {string} options.proxyLocation - Country code for proxy location (default: 'US')
 * @param {string} options.userAgent - Device type (default: 'desktop')
 * @returns {Promise<object>} The search results
 */
export const searchScholar = async (query, options = {}) => {
  const {
    proxyLocation = 'US',
    userAgent = 'desktop',
  } = options;

  // Ensure query is properly encoded - if it's not already encoded
  const encodedQuery = query.includes('%') ? query : encodeURIComponent(query);
  
  try {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from Scholar API:', error);
    throw error;
  }
};

/**
 * Get a specific article by ID
 * @param {string} articleId - The Google Scholar article ID
 * @returns {Promise<object>} The article details
 */
export const getArticleById = async (articleId) => {
  try {
    // Using the ID to create a specific query
    const query = `as_q=&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=&as_yhi=&as_vis=0&as_sdt=1,5&as_sdtp=&as_cites=${articleId}`;
    
    const data = await searchScholar(query);
    if (data.articles && data.articles.length > 0) {
      return data.articles[0];
    }
    throw new Error('Article not found');
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
};

/**
 * Get articles by author name
 * @param {string} authorName - The author name to search for
 * @returns {Promise<Array>} Array of articles by the author
 */
export const getArticlesByAuthor = async (authorName) => {
  try {
    const query = `as_q=&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=${encodeURIComponent(authorName)}&as_publication=&as_ylo=&as_yhi=&as_vis=0&as_sdt=1,5&as_sdtp=`;
    
    const data = await searchScholar(query);
    return data.articles || [];
  } catch (error) {
    console.error('Error fetching articles by author:', error);
    throw error;
  }
};

/**
 * Search for articles with advanced filters
 * @param {object} filters - Search filters
 * @param {string} filters.query - Main search query
 * @param {string} filters.author - Author name
 * @param {string} filters.publication - Publication name
 * @param {number} filters.yearFrom - Starting year
 * @param {number} filters.yearTo - Ending year
 * @returns {Promise<Array>} Filtered search results
 */
export const advancedSearch = async (filters) => {
  const {
    query = '',
    author = '',
    publication = '',
    yearFrom = '',
    yearTo = '',
  } = filters;

  try {
    const advQuery = `as_q=${encodeURIComponent(query)}&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=${encodeURIComponent(author)}&as_publication=${encodeURIComponent(publication)}&as_ylo=${yearFrom}&as_yhi=${yearTo}&as_vis=0&as_sdt=1,5&as_sdtp=`;
    
    const data = await searchScholar(advQuery);
    return data.articles || [];
  } catch (error) {
    console.error('Error performing advanced search:', error);
    throw error;
  }
};

/**
 * Get citation data for an article
 * @param {string} articleId - The Google Scholar article ID
 * @returns {Promise<object>} Citation data including count and citing articles
 */
export const getCitations = async (articleId) => {
  try {
    const query = `cites=${articleId}`;
    
    const data = await searchScholar(query);
    
    // Process the citation data
    const citationData = {
      count: 0,
      citingArticles: [],
    };
    
    if (data.articles) {
      // The first result might contain citation count in extras
      if (data.articles[0]?.extras?.citations?.count) {
        citationData.count = parseInt(data.articles[0].extras.citations.count.replace('Cited by ', ''));
      }
      
      citationData.citingArticles = data.articles;
    }
    
    return citationData;
  } catch (error) {
    console.error('Error fetching citation data:', error);
    throw error;
  }
};