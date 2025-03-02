import { useState } from 'react';
import { Search, Book, ExternalLink, User, Calendar, AlertCircle } from 'lucide-react';
import { searchScholarPapers } from '@/utils/serplyApi';

const ScholarSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 10;

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchScholarPapers(query, { limit, page });
      setResults(data.items);
      setTotalResults(data.totalResults);
    } catch (err) {
      setError('Failed to search Google Scholar. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    setPage(prevPage => prevPage + 1);
    handleSearch({ preventDefault: () => {} });
  };

  const handlePrevPage = () => {
    setPage(prevPage => Math.max(0, prevPage - 1));
    handleSearch({ preventDefault: () => {} });
  };

  return (
    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Google Scholar Search</h2>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 border-gray-300 rounded-l-md"
                placeholder="Search for academic papers..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="mb-4 text-sm text-gray-600">
              Showing {page * limit + 1}-{Math.min((page + 1) * limit, totalResults)} of {totalResults} results
            </div>
            
            <div className="space-y-6">
              {results.map((paper, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <h3 className="text-lg font-medium text-blue-600 hover:underline">
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
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{paper.snippet}</p>
                  )}
                  
                  <div className="mt-3 flex flex-wrap text-xs">
                    {paper.cited_by?.value > 0 && (
                      <span className="inline-flex items-center mr-3 mb-1 px-2 py-1 rounded-md bg-blue-100 text-blue-800">
                        Cited by: {paper.cited_by.value}
                      </span>
                    )}
                    
                    {paper.resources && paper.resources.map((resource, idx) => (
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
            
            {/* Pagination */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={handlePrevPage}
                disabled={page === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button
                onClick={handleNextPage}
                disabled={(page + 1) * limit >= totalResults}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        ) : query && !loading ? (
          <div className="py-8 text-center">
            <Book className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No results found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search query or using different keywords.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ScholarSearch;