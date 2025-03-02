/**
 * API endpoint for Google Scholar author profile via Serply API
 */
import { initFirebaseAdmin } from '@/utils/firebaseAdmin';

// Initialize Firebase Admin for authentication verification
initFirebaseAdmin();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Extract parameters
    const { authorId } = req.body;

    if (!authorId) {
      return res.status(400).json({ message: 'Author ID is required' });
    }

    // Get the Serply API key from environment variables
    const serplyApiKey = process.env.SERPLY_API_KEY;
    
    if (!serplyApiKey) {
      console.error('Missing Serply API key');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Construct the Serply API request for author profile
    const serplyUrl = 'https://api.serply.io/v1/scholar/author';
    
    const serplyResponse = await fetch(serplyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': serplyApiKey,
        'X-Proxy-Location': 'US', // Can be configured based on user location
      },
      body: JSON.stringify({
        authorId: authorId,
      }),
    });

    if (!serplyResponse.ok) {
      const errorData = await serplyResponse.json();
      console.error('Serply API error:', errorData);
      return res.status(serplyResponse.status).json({ 
        message: 'Error from Google Scholar API',
        error: errorData
      });
    }

    const data = await serplyResponse.json();
    
    // Process and format the response data
    const formattedResults = {
      authorInfo: {
        name: data.name,
        affiliations: data.affiliations,
        interests: data.interests,
        thumbnailUrl: data.thumbnail,
        citationsAll: data.cited_by?.all || 0,
        citationsSince2019: data.cited_by?.since_2019 || 0,
        hIndexAll: data.h_index?.all || 0,
        hIndexSince2019: data.h_index?.since_2019 || 0,
        i10IndexAll: data.i10_index?.all || 0,
        i10IndexSince2019: data.i10_index?.since_2019 || 0,
      },
      articles: data.articles || [],
      coAuthors: data.co_authors || [],
      metadata: data.metadata || {},
    };

    return res.status(200).json(formattedResults);
  } catch (error) {
    console.error('Error in Google Scholar author API:', error);
    return res.status(500).json({ 
      message: 'Error processing request',
      error: error.message
    });
  }
}