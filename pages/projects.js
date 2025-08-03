import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/page-templates/Layout';
import { Search, Filter, BookOpen, Users, Calendar, ArrowUpRight } from 'lucide-react';
import { getProjects } from '@/services/projectService';

const ProjectsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, featured, recent, popular
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Function to fetch projects
  const fetchProjects = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      // Define filter options based on selected filter
      const options = {
        sortBy: filter === 'recent' ? 'recent' : 
               filter === 'popular' ? 'popular' : 'recent',
        featured: filter === 'featured',
        searchTerm: searchTerm,
        lastVisible: loadMore ? lastVisible : null,
        pageSize: 12
      };
      
      // Call the service function
      const result = await getProjects(options);
      
      if (loadMore) {
        // Append projects to existing list
        setProjects(prev => [...prev, ...result.projects]);
      } else {
        // Replace projects with new results
        setProjects(result.projects);
      }
      
      // Update pagination state
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
      
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, searchTerm, lastVisible]);

  // Initial data fetching
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  // Reset search when filter changes
  useEffect(() => {
    setSearchTerm('');
  }, [filter]);

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchProjects(true);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Determine status color class
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'planning':
      case 'Planning':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <Head>
        <title>Research Projects - OpenScholar Hub</title>
        <meta name="description" content="Explore research projects or start your own collaboration on OpenScholar Hub" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Research Projects</h1>
            <p className="mt-1 text-lg text-gray-500">
              Explore ongoing research or start your own collaborative project
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/projects/create">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create New Project
              </button>
            </Link>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-grow relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProjects()}
            />
          </div>
          <div className="sm:w-64 flex">
            <div className="w-full relative inline-block text-left">
              <div className="inline-flex shadow-sm rounded-md divide-x divide-gray-300 w-full">
                <div className="relative inline-flex items-center bg-white py-2 pl-3 pr-4 rounded-l-md shadow-sm text-gray-500 w-full">
                  <Filter className="h-5 w-5 text-gray-400 mr-2" />
                  <select
                    className="block w-full bg-transparent border-0 focus:outline-none focus:ring-0 sm:text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Projects</option>
                    <option value="featured">Featured</option>
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    <div className="mt-4 flex">
                      <div className="h-8 bg-gray-200 rounded w-20 mr-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => fetchProjects()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No projects found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? `No projects match "${searchTerm}"`
                  : "No projects available for the selected filter."
                }
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Clear filters
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Link href={`/projects/${project.id}`} key={project.id}>
                    <div className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-100 h-full">
                      <div className="px-4 py-5 sm:p-6 flex flex-col h-full">
                        <div className="flex justify-between">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {project.category}
                          </span>
                          {project.featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 text-lg font-medium text-gray-900 group-hover:text-blue-600">{project.title}</h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                        <div className="mt-4 flex-grow">
                          <div className="flex space-x-2 flex-wrap">
                            {project.tags && project.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{project.members} Members</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{formatDate(project.lastUpdated)}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <span className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                            View details <ArrowUpRight className="ml-1 h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {loadingMore ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : 'Load More Projects'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsPage;