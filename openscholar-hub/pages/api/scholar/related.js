/**
 * API endpoint for Google Scholar related papers via Serply API
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
    const { paperId, limit = 5 } = req.body;

    if (!paperId) {
      return res.status(400).json({ message: 'Paper ID is required' });
    }

    // Get the Serply API key from environment variables
    const serplyApiKey = process.env.SERPLY_API_KEY;
    
    if (!serplyApiKey) {
      console.error('Missing Serply API key');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Construct the Serply API request for related papers
    const serplyUrl = 'https://api.serply.io/v1/scholar/related';
    
    const serplyResponse = await fetch(serplyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': serplyApiKey,
        'X-Proxy-Location': 'US', // Can be configured based on user location
      },
      body: JSON.stringify({
        paperId: paperId,
        num: limit,
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
      relatedPapers: data.related_papers || [],
      metadata: data.metadata || {},
    };

    return res.status(200).json(formattedResults);
  } catch (error) {
    console.error('Error in Google Scholar related papers API:', error);
    return res.status(500).json({ 
      message: 'Error processing request',
      error: error.message
    });
  }
}