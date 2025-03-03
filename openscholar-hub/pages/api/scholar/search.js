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

    // Log API key for debugging (don't log the full key in production)
    console.log('API Key present:', !!serplyApiKey);

    // Build the search URL with parameters in the URL
    // Notice we're using the search endpoint, not scholar/search
    const searchQuery = encodeURIComponent(query);
    const serplyUrl = `https://api.serply.io/v1/scholar/search/q=${searchQuery}&num=${limit}&start=${page * limit}`;
    
    console.log('Requesting URL:', serplyUrl);

    // Make the API request to Serply
    const serplyResponse = await fetch(serplyUrl, {
      method: 'GET', 
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
    console.error('Error in Scholar search API:', error);
    return res.status(500).json({ 
      message: 'Error processing request',
      error: error.message
    });
  }
}