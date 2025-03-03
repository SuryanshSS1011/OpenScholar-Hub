// @/components/ScholarSearch.js
import { useState, useEffect } from 'react';
import { Search, BookOpen, User, Download, FileText, ExternalLink, Link as LinkIcon } from 'lucide-react';

const ScholarSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    author: '',
    publication: '',
    yearFrom: '',
    yearTo: '',
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim() && !filters.author.trim()) {
      setError('Please enter a search query or author name');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let url;
      
      if (showAdvanced) {
        // Advanced search with filters
        const queryParams = new URLSearchParams({
          action: 'advanced',
          filters: JSON.stringify({
            query: query.trim(),
            ...filters,
          }),
        });
        url = `/api/scholar?${queryParams}`;
      } else {
        // Simple search
        const queryParams = new URLSearchParams({
          action: 'search',
          query: query.trim(),
        });
        url = `/api/scholar?${queryParams}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      
      const data = await response.json();
      setResults(data.articles || []);
      
      if (data.articles?.length === 0) {
        setError('No results found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset filters when advanced search is toggled off
  useEffect(() => {
    if (!showAdvanced) {
      setFilters({
        author: '',
        publication: '',
        yearFrom: '',
        yearTo: '',
      });
    }
  }, [showAdvanced]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Academic Research</h2>
        <p className="text-gray-600">Search for scholarly articles, authors, and publications</p>
      </div>
      
      <form onSubmit={handleSearch}>
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for papers, topics, or keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none flex items-center"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide advanced search' : 'Show advanced search'}
            <span className="ml-1">{showAdvanced ? '▲' : '▼'}</span>
          </button>
        </div>
        
        {showAdvanced && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., J. Smith"
                  value={filters.author}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <label htmlFor="publication" className="block text-sm font-medium text-gray-700 mb-1">
                  Publication
                </label>
                <input
                  type="text"
                  id="publication"
                  name="publication"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Journal of Research"
                  value={filters.publication}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="yearFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  Year From
                </label>
                <input
                  type="number"
                  id="yearFrom"
                  name="yearFrom"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2018"
                  value={filters.yearFrom}
                  onChange={handleFilterChange}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label htmlFor="yearTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Year To
                </label>
                <input
                  type="number"
                  id="yearTo"
                  name="yearTo"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2023"
                  value={filters.yearTo}
                  onChange={handleFilterChange}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {results.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results</h3>
          <div className="space-y-5">
            {results.map((article, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-base font-medium text-blue-600 hover:underline">
                      <a href={article.link} target="_blank" rel="noopener noreferrer">
                        {article.title}
                      </a>
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">{article.author?.names || 'Unknown Author'}</p>
                    
                    {article.extras?.citations && (
                      <div className="mt-2 text-xs text-gray-500">
                        <a href={article.extras.citations.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:underline">
                          <LinkIcon className="h-3 w-3 mr-1" />
                          {article.extras.citations.count}
                        </a>
                      </div>
                    )}
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {article.doc?.link && (
                        <a
                          href={article.doc.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                          <Download className="h-3 w-3 mr-1" /> 
                          {article.doc.type || 'Download'}
                        </a>
                      )}
                      <a
                        href={article.cite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <FileText className="h-3 w-3 mr-1" /> Cite
                      </a>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" /> View
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarSearch;