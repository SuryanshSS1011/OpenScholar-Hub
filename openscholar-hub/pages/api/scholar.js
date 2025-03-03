// @/pages/api/scholar.js
import { searchScholar, getArticleById, getArticlesByAuthor, advancedSearch, getCitations } from '@/utils/scholarApi';
import { withApiAuth, withRateLimit } from '@/utils/apiMiddleware';

async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, query, id, author, filters } = req.query;

    switch (action) {
      case 'search':
        if (!query) {
          return res.status(400).json({ error: 'Query parameter is required' });
        }
        const searchResults = await searchScholar(query);
        return res.status(200).json(searchResults);

      case 'article':
        if (!id) {
          return res.status(400).json({ error: 'Article ID is required' });
        }
        const article = await getArticleById(id);
        return res.status(200).json(article);

      case 'author':
        if (!author) {
          return res.status(400).json({ error: 'Author name is required' });
        }
        const authorArticles = await getArticlesByAuthor(author);
        return res.status(200).json(authorArticles);

      case 'advanced':
        if (!filters) {
          return res.status(400).json({ error: 'Filters are required' });
        }
        const filterParams = JSON.parse(filters);
        const advancedResults = await advancedSearch(filterParams);
        return res.status(200).json(advancedResults);

      case 'citations':
        if (!id) {
          return res.status(400).json({ error: 'Article ID is required' });
        }
        const citationData = await getCitations(id);
        return res.status(200).json(citationData);

      default:
        return res.status(400).json({ error: 'Invalid action parameter' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred while processing your request' });
  }
}

// Apply middleware - rate limit all requests, and specific routes require authentication
export default withRateLimit(
  withApiAuth(handler, { requireAuth: false }), 
  { limit: 50, window: 60000 } // 50 requests per minute
);