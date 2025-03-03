import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Book, Search, ExternalLink, ChevronRight } from 'lucide-react';
import { searchScholarPapers } from '@/utils/serplyApi';
import { useAuth } from '@/context/AuthContext';

const DashboardLookoutWidget = ({ userInterests = [] }) => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendedPapers = async () => {
      if (!userInterests || userInterests.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Create a search query based on user interests
        // This would ideally be more sophisticated, but we'll use a simple approach for now
        const searchQuery = userInterests.slice(0, 2).join(' ');
        
        // Get papers related to user interests
        const data = await searchScholarPapers(searchQuery, { limit: 5 });
        setPapers(data.items || []);
      } catch (err) {
        console.error('Error fetching recommended papers:', err);
        setError('Failed to load recommended papers');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedPapers();
  }, [userInterests]);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Research Lookout
        </h3>
        <Link 
          href="/lookout" 
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Explore more
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-500">Papers based on your interests</span>
        </div>
      </div>
      
      {loading ? (
        <div className="px-4 py-5 sm:p-6 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="px-4 py-5 sm:p-6 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <Link 
            href="/lookout" 
            className="inline-flex items-center mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Go to Research Lookout
          </Link>
        </div>
      ) : papers.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {papers.map((paper, index) => (
            <li key={index}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-start">
                  <Book className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <a 
                      href={paper.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline flex items-start"
                    >
                      {paper.title}
                      <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0 mt-1" />
                    </a>
                    
                    {paper.publication_info?.summary && (
                      <p className="mt-1 text-xs text-gray-500">
                        {paper.publication_info.summary}
                      </p>
                    )}
                    
                    {paper.cited_by?.value > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        Cited by: {paper.cited_by.value}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-5 sm:p-6 text-center">
          <Book className="mx-auto h-8 w-8 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No papers found</h3>
          <p className="mt-1 text-xs text-gray-500">
            Update your research interests to get recommendations
          </p>
          <Link 
            href="/profile" 
            className="inline-flex items-center mt-3 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Update interests
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardLookoutWidget;