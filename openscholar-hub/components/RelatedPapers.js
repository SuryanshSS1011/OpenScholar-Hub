import { useState, useEffect } from 'react';
import { Book, User, Calendar, Link2, AlertCircle } from 'lucide-react';
import { getRelatedPapers } from '@/utils/serplyApi';

const RelatedPapers = ({ paperId }) => {
  const [relatedPapers, setRelatedPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedPapers = async () => {
      if (!paperId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getRelatedPapers(paperId, { limit: 5 });
        setRelatedPapers(data.relatedPapers);
      } catch (err) {
        setError('Failed to load related papers. Please try again.');
        console.error('Related papers error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPapers();
  }, [paperId]);

  if (!paperId) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Paper ID is required to show related papers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Related Research</h2>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : relatedPapers.length > 0 ? (
          <div className="space-y-4">
            {relatedPapers.map((paper, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <h3 className="text-md font-medium text-blue-600 hover:underline">
                  <a href={paper.link} target="_blank" rel="noopener noreferrer" className="flex items-start">
                    <Book className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{paper.title}</span>
                  </a>
                </h3>
                
                <div className="mt-1 flex flex-wrap text-sm text-gray-600">
                  {paper.authors && (
                    <div className="flex items-center mr-4 mb-1">
                      <User className="h-4 w-4 mr-1" />
                      <span>{paper.authors}</span>
                    </div>
                  )}
                  
                  {paper.publication_info?.summary && (
                    <div className="flex items-center mr-4 mb-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{paper.publication_info.summary}</span>
                    </div>
                  )}
                </div>
                
                {paper.snippet && (
                  <p className="mt-2 text-sm text-gray-600">{paper.snippet}</p>
                )}
                
                <div className="mt-3 flex flex-wrap text-xs">
                  {paper.cited_by?.value > 0 && (
                    <span className="inline-flex items-center mr-3 mb-1 px-2 py-1 rounded-md bg-blue-100 text-blue-800">
                      Cited by: {paper.cited_by.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            <div className="mt-6">
              <a 
                href={`https://scholar.google.com/scholar?q=related:${paperId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Link2 className="h-4 w-4 mr-2" />
                View more related papers
              </a>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <Book className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No related papers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No related research papers could be found for this paper.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedPapers;