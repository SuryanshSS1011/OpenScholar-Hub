import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { withAuth } from '@/middleware/authMiddleware';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { 
  FileText, 
  Download, 
  MessageCircle, 
  Users, 
  Book, 
  ThumbsUp, 
  Search, 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  Filter,
  User
} from 'lucide-react';

const ActivitiesPage = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      
      try {
        // In a real app, this would call your API
        // For demo, use mock data with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock activities data
        const mockActivities = [
          {
            id: '1',
            type: 'research',
            action: 'download',
            title: 'Machine Learning Methods',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            details: {
              id: 'paper123',
              source: 'Journal of Machine Learning'
            }
          },
          {
            id: '2',
            type: 'project',
            action: 'join',
            title: 'Climate Change Impact Analysis',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            details: {
              id: 'project1',
              role: 'Researcher'
            }
          },
          {
            id: '3',
            type: 'chat',
            action: 'message',
            title: 'research-collaboration',
            timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
            details: {
              id: 'C0123',
              messageCount: 5
            }
          },
          {
            id: '4',
            type: 'research',
            action: 'save',
            title: 'Renewable Energy Trends',
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            details: {
              id: 'paper456',
              source: 'Energy Science Journal'
            }
          },
          {
            id: '5',
            type: 'project',
            action: 'update',
            title: 'Machine Learning for Medical Diagnostics',
            timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            details: {
              id: 'project2',
              changes: 'Added new dataset'
            }
          },
          {
            id: '6',
            type: 'citation',
            action: 'cited',
            title: 'Your paper "Machine Learning Applications" was cited',
            timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
            details: {
              citingPaper: 'Advanced Neural Networks in Healthcare',
              citingAuthor: 'Dr. Jane Smith'
            }
          },
          {
            id: '7',
            type: 'chat',
            action: 'dm',
            title: 'Direct message with Emma Williams',
            timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
            details: {
              id: 'D0125',
              user: 'Emma Williams'
            }
          },
          {
            id: '8',
            type: 'project',
            action: 'comment',
            title: 'Comment on Climate Change Impact Analysis',
            timestamp: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
            details: {
              id: 'project1',
              comment: 'Great progress on the analysis!'
            }
          },
          {
            id: '9',
            type: 'research',
            action: 'search',
            title: 'Searched for "quantum computing applications"',
            timestamp: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
            details: {
              query: 'quantum computing applications',
              resultCount: 42
            }
          },
          {
            id: '10',
            type: 'account',
            action: 'profile',
            title: 'Updated profile information',
            timestamp: new Date(Date.now() - 691200000).toISOString(), // 8 days ago
            details: {
              fields: ['institution', 'bio']
            }
          }
        ];
        
        setActivities(mockActivities);
        setTotalPages(Math.ceil(mockActivities.length / 5));
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [user]);
  
  // Filter and search activities
  const filteredActivities = activities.filter(activity => {
    // Apply type filter
    if (filter !== 'all' && activity.type !== filter) {
      return false;
    }
    
    // Apply search
    if (searchQuery.trim() !== '') {
      return activity.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });
  
  // Paginate activities
  const paginatedActivities = filteredActivities.slice((currentPage - 1) * 5, currentPage * 5);
  
  // Format timestamp to relative time
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5; // hours
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      if (days < 7) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  };
  
  // Get icon based on activity type
  const getActivityIcon = (activity) => {
    const { type, action } = activity;
    
    switch (type) {
      case 'research':
        if (action === 'download') return <Download className="h-5 w-5 text-blue-500" />;
        if (action === 'save') return <Book className="h-5 w-5 text-blue-500" />;
        if (action === 'search') return <Search className="h-5 w-5 text-blue-500" />;
        return <FileText className="h-5 w-5 text-blue-500" />;
      
      case 'project':
        return <Book className="h-5 w-5 text-green-500" />;
      
      case 'chat':
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      
      case 'citation':
        return <ThumbsUp className="h-5 w-5 text-yellow-500" />;
      
      case 'account':
        return <User className="h-5 w-5 text-gray-500" />;
      
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get link based on activity type
  const getActivityLink = (activity) => {
    const { type, details } = activity;
    
    switch (type) {
      case 'research':
        return `/research/article/${details.id}`;
      
      case 'project':
        return `/projects/${details.id}`;
      
      case 'chat':
        if (activity.action === 'dm') {
          return `/chat/dm/${details.id}`;
        }
        return `/chat/${details.id}`;
      
      case 'citation':
        return `/research/citations`;
      
      case 'account':
        return `/profile`;
      
      default:
        return '#';
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>Activity History - OpenScholar Hub</title>
        <meta name="description" content="View your recent activities on OpenScholar Hub" />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Activities</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your recent actions and interactions on OpenScholar Hub
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/dashboard">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="mb-6 bg-white p-4 shadow rounded-lg">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="sm:w-64">
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="filter"
                  name="filter"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                  className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Activities</option>
                  <option value="research">Research</option>
                  <option value="project">Projects</option>
                  <option value="chat">Chat</option>
                  <option value="citation">Citations</option>
                  <option value="account">Account</option>
                </select>
              </div>
            </div>
            
            <div className="flex-grow">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Activities
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page when search changes
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Activities List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="py-12">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
              <p className="text-center mt-4 text-gray-500">Loading your activities...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No activities found</h3>
              <p className="mt-1 text-gray-500">
                {searchQuery || filter !== 'all' ? 
                  'Try changing your search or filter to see more results.' : 
                  'Your recent activities will appear here.'}
              </p>
              {(searchQuery || filter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('all');
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {paginatedActivities.map((activity) => (
                  <li key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <Link href={getActivityLink(activity)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                          <div className="flex-shrink-0">
                            {getActivityIcon(activity)}
                          </div>
                          <div className="min-w-0 flex-1 px-4">
                            <p className="text-sm font-medium text-blue-600 truncate">{activity.title}</p>
                            <p className="text-sm text-gray-500">
                              {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} • {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="ml-5 flex-shrink-0">
                          <div className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * 5 + 1}</span> to <span className="font-medium">{Math.min(currentPage * 5, filteredActivities.length)}</span> of{' '}
                        <span className="font-medium">{filteredActivities.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === i + 1
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(ActivitiesPage);