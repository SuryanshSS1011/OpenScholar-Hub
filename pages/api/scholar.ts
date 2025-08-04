import type { NextApiRequest, NextApiResponse } from 'next';
import { searchScholar } from '@/utils/scholarApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { q, author, publication, yearFrom, yearTo } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    // Build enhanced query with filters
    let enhancedQuery = q;
    if (typeof author === 'string' && author) {
      enhancedQuery += ` author:${author}`;
    }
    if (typeof publication === 'string' && publication) {
      enhancedQuery += ` source:${publication}`;
    }
    if (typeof yearFrom === 'string' && yearFrom) {
      enhancedQuery += ` after:${yearFrom}`;
    }
    if (typeof yearTo === 'string' && yearTo) {
      enhancedQuery += ` before:${yearTo}`;
    }

    const results = await searchScholar(enhancedQuery);

    res.status(200).json(results);
  } catch (error) {
    console.error('Scholar API error:', error);
    res.status(500).json({ message: 'Failed to search articles' });
  }
}
