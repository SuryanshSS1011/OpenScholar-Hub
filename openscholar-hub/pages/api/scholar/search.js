/**
 * API endpoint for Google Scholar search via Serply API
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
    // Extract query parameters
    const { query, limit = 10, page = 0 } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Get the Serply API key from environment variables
    const serplyApiKey = process.env.SERPLY_API_KEY;
    
    if (!serplyApiKey) {
      console.error('Missing Serply API key');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Construct the Serply API request
    const serplyUrl = 'https://api.serply.io/v1/scholar/search';
    
    const serplyResponse = await fetch(serplyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': serplyApiKey,
        'X-Proxy-Location': 'US', // Can be configured based on user location
      },
      body: JSON.stringify({
        q: query,
        num: limit,
        start: page * limit,
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
      items: data.organic_results || [],
      totalResults: data.search_information?.total_results || 0,
      searchMetadata: {
        id: data.search_metadata?.id,
        status: data.search_metadata?.status,
        jsonEndpoint: data.search_metadata?.json_endpoint,
        createdAt: data.search_metadata?.created_at,
        processedAt: data.search_metadata?.processed_at,
        googleScholarUrl: data.search_metadata?.google_scholar_url,
        rawHtmlFile: data.search_metadata?.raw_html_file,
        totalTimeTaken: data.search_metadata?.total_time_taken,
      }
    };

    return res.status(200).json(formattedResults);
  } catch (error) {
    console.error('Error in Google Scholar search API:', error);
    return res.status(500).json({ 
      message: 'Error processing request',
      error: error.message
    });
  }
}