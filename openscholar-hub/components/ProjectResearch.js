// @/components/ProjectResearch.js

import { useState, useEffect } from 'react';
import { Book, BookOpen, ExternalLink, Loader, AlertCircle, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { getProjectResearch } from '@/services/projectService';
import { useAuth } from '@/context/AuthContext';

const ProjectResearch = ({ projectId, projectTitle, projectTags = [] }) => {
  const { user } = useAuth();
  const [relatedResearch, setRelatedResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchRelatedResearch = async () => {
      if (!projectId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch related research from Firestore
        const researchData = await getProjectResearch(projectId);
        setRelatedResearch(researchData);
        
        // Generate search query from project title and tags
        let query = projectTitle;
        if (projectTags && projectTags.length > 0) {
          query = projectTags.slice(0, 3).join(' ') + ' ' + projectTitle.split(' ').slice(0, 3).join(' ');
        }
        
        setSearchQuery(query);
      } catch (err) {
        console.error('Error fetching related research:', err);
        setError('Failed to load related research. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRelatedResearch();
  }, [projectId, projectTitle, projectTags]);
  
  // Handle research search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // In a real implementation, this would call your Scholar API
      // For demo purposes, simulate an API call with some mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSearchResults([
        {
          id: 'gVDgNAq_jJMJ',
          title: 'Survey of important issues in UAV communication networks',
          authors: 'L Gupta, R Jain, G Vaszkun',
          journal: 'IEEE communications surveys & tutorials',
          year: 2015,
          citations: 2444
        },
        {
          id: 'XRt1dfhq2_8J',
          title: 'Introduction to UAV systems',
          authors: 'PG Fahlstrom, TJ Gleason, MH Sadraey',
          journal: 'Textbook',
          year: 2022,
          citations: 757
        },
        {
          id: 'AYl-XXuZligJ',
          title: 'Review of the current state of UAV regulations',
          authors: 'C Stöcker, R Bennett, F Nex, M Gerke, J Zevenbergen',
          journal: 'Remote sensing',
          year: 2017,
          citations: 678
        }
      ]);
    } catch (err) {
      console.error('Error searching for research:', err);
      setError('Failed to search for related research.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Add a research paper to the project
  const handleAddResearch = async (paper) => {
    // In a real implementation, this would call your API to add the paper to the project
    // For now, just add it to the local state for demonstration
    setRelatedResearch(prev => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        researchId: paper.id,
        title: paper.title,
        addedBy: user?.uid,
        addedAt: new Date().toISOString()
      }
    ]);
    
    // Close the search modal
    setIsSearchModalOpen(false);
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Related Research
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Academic literature related to this project
          </p>
        </div>
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Search className="h-4 w-4 mr-1.5" />
          Find Papers
        </button>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading research...</span>
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        ) : relatedResearch.length > 0 ? (
          <div className="space-y-4">
            {relatedResearch.map((paper) => (
              <div key={paper.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <Link 
                  href={`/research/article/${paper.researchId}`}
                  className="text-blue-600 hover:underline font-medium block mb-1 flex items-start"
                >
                  <BookOpen className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                  <span>{paper.title}</span>
                </Link>
                <div className="text-xs text-gray-500 ml-6 flex items-center justify-between">
                  <span>Added {new Date(paper.addedAt).toLocaleDateString()}</span>
                  <Link
                    href={`/research/article/${paper.researchId}`}
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View paper
                  </Link>
                </div>
              </div>
            ))}
            
            <div className="mt-4 pt-2 border-t border-gray-100">
              <Link
                href={`/research?q=${encodeURIComponent(searchQuery)}`}
                className="text-blue-600 hover:underline flex items-center text-sm"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Find more related research
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Book className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No related research found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try searching for academic literature to support this project.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Search className="mr-2 h-4 w-4" />
                Search Research
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Find Related Research</h3>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex space-x-2">
                <div className="flex-grow relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 border-gray-300 rounded-md"
                    placeholder="Search academic papers..."
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSearching ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {projectTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Search Results</h4>
                  
                  {searchResults.map((paper) => (
                    <div key={paper.id} className="p-4 border border-gray-200 rounded-md">
                      <div className="flex justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{paper.title}</h5>
                          <p className="text-sm text-gray-600">{paper.authors}</p>
                          <div className="mt-1 text-xs text-gray-500">
                            {paper.journal} ({paper.year}) • Cited by {paper.citations}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            onClick={() => handleAddResearch(paper)}
                            disabled={relatedResearch.some(r => r.researchId === paper.id)}
                            className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium 
                              ${
                                relatedResearch.some(r => r.researchId === paper.id)
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }
                            `}
                          >
                            <Plus className="h-4 w-4 mr-1.5" />
                            {relatedResearch.some(r => r.researchId === paper.id) ? 'Added' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery && !isSearching ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
                  <p className="text-sm text-gray-500 mt-2">Try different keywords or browse the research hub</p>
                </div>
              ) : !isSearching && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Enter search terms to find relevant papers</p>
                </div>
              )}
              
              {isSearching && (
                <div className="flex justify-center items-center py-12">
                  <Loader className="h-8 w-8 text-blue-500 animate-spin" />
                  <span className="ml-2 text-gray-500">Searching...</span>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
              <Link
                href={`/research?q=${encodeURIComponent(searchQuery)}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Search className="mr-1.5 h-4 w-4" />
                Advanced Search
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectResearch;