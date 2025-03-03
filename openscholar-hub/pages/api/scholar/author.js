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

    // Log API key presence for debugging
    console.log('API Key present:', !!serplyApiKey);

    // Build the author profile URL
    const serplyUrl = `https://api.serply.io/v1/scholar/author/id=${authorId}`;
    
    console.log('Requesting URL:', serplyUrl);

    // Make the API request to Serply
    const serplyResponse = await fetch(serplyUrl, {
      method: 'GET', // Changed from POST to GET
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': serplyApiKey
      }
    });

    // Log the response status for debugging
    console.log('Serply API Response Status:', serplyResponse.status);

    if (!serplyResponse.ok) {
      let errorMessage = 'Error from Scholar API';
      
      try {
        const errorData = await serplyResponse.json();
        console.error('Serply API error:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      
      return res.status(serplyResponse.status).json({ 
        message: errorMessage
      });
    }

    const data = await serplyResponse.json();
    console.log('Serply API data received:', Object.keys(data));
    
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