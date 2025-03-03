/**
 * API endpoint for Google Scholar citations via Serply API
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
    const { paperId, limit = 10 } = req.body;

    if (!paperId) {
      return res.status(400).json({ message: 'Paper ID is required' });
    }

    // Get the Serply API key from environment variables
    const serplyApiKey = process.env.SERPLY_API_KEY;
    
    if (!serplyApiKey) {
      console.error('Missing Serply API key');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Log API key presence for debugging
    console.log('API Key present:', !!serplyApiKey);

    // Build the citations URL
    const serplyUrl = `https://api.serply.io/v1/scholar/citations/id=${paperId}&num=${limit}`;
    
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
      citations: data.citations || [],
      totalCitations: data.total_citations || 0,
      metadata: data.metadata || {},
    };

    return res.status(200).json(formattedResults);
  } catch (error) {
    console.error('Error in Google Scholar citations API:', error);
    return res.status(500).json({ 
      message: 'Error processing request',
      error: error.message
    });
  }
}