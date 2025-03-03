import { useState, useEffect } from 'react';
import { Book, User, Calendar, ExternalLink, AlertCircle } from 'lucide-react';
import { getPaperCitations } from '@/utils/serplyApi';

const PaperCitations = ({ paperId }) => {
  const [citations, setCitations] = useState([]);
  const [totalCitations, setTotalCitations] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCitations = async () => {
      if (!paperId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getPaperCitations(paperId, { limit: 10 });
        setCitations(data.citations);
        setTotalCitations(data.totalCitations);
      } catch (err) {
        setError('Failed to load citations. Please try again.');
        console.error('Citations error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCitations();
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
              Paper ID is required to show citations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Citations</h2>
          {totalCitations > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {totalCitations} total citations
            </span>
          )}
        </div>

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
        ) : citations.length > 0 ? (
          <div className="space-y-5">
            {citations.map((citation, index) => (
              <div key={index} className="border-b border-gray-200 pb-5 last:border-b-0 last:pb-0">
                <h3 className="text-md font-medium text-blue-600 hover:underline">
                  <a href={citation.link} target="_blank" rel="noopener noreferrer" className="flex items-start">
                    <Book className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{citation.title}</span>
                  </a>
                </h3>
                
                <div className="mt-1 flex flex-wrap text-sm text-gray-600">
                  {citation.authors && (
                    <div className="flex items-center mr-4 mb-1">
                      <User className="h-4 w-4 mr-1" />
                      <span>{citation.authors}</span>
                    </div>
                  )}
                  
                  {citation.publication_info?.summary && (
                    <div className="flex items-center mr-4 mb-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{citation.publication_info.summary}</span>
                    </div>
                  )}
                </div>
                
                {citation.snippet && (
                  <p className="mt-2 text-sm text-gray-600">{citation.snippet}</p>
                )}
                
                <div className="mt-3 flex flex-wrap text-xs">
                  {citation.cited_by?.value > 0 && (
                    <span className="inline-flex items-center mr-3 mb-1 px-2 py-1 rounded-md bg-blue-100 text-blue-800">
                      Cited by: {citation.cited_by.value}
                    </span>
                  )}
                  
                  {citation.resources && citation.resources.map((resource, idx) => (
                    <a 
                      key={idx}
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mr-2 mb-1 px-2 py-1 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {resource.name || 'View'}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Book className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No citations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              This paper has not been cited yet or citation data is unavailable.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperCitations;