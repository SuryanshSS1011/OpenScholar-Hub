// @/pages/dashboard/index.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/middleware/authMiddleware';
import Layout from '@/components/Layout';
import SavedArticles from '@/components/SavedArticles';
import { format } from 'date-fns';
import { 
  Book, 
  Plus, 
  MessageCircle, 
  Users, 
  Calendar,
  Clock,
  Bell,
  ArrowUpRight,
  PenSquare,
  FileText,
  Search,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, these would be API calls
        // For demo, simulate API calls with timeouts
        const projectsPromise = new Promise(resolve => {
          setTimeout(() => {
            resolve([
              {
                id: '1',
                title: 'Climate Change Impact Analysis',
                status: 'In Progress',
                collaborators: 4,
                lastUpdated: '2025-02-28T10:30:00Z'
              },
              {
                id: '2',
                title: 'Machine Learning for Medical Diagnostics',
                status: 'Planning',
                collaborators: 3,
                lastUpdated: '2025-02-25T14:15:00Z'
              },
              {
                id: '3',
                title: 'Renewable Energy Optimization',
                status: 'Completed',
                collaborators: 5,
                lastUpdated: '2025-02-10T09:45:00Z'
              }
            ]);
          }, 800);
        });
        
        const chatsPromise = new Promise(resolve => {
          setTimeout(() => {
            resolve([
              {
                id: 'C0123',
                name: 'research-collaboration',
                type: 'channel',
                lastMessage: 'I just uploaded the newest dataset for our analysis.',
                sender: 'Robert Johnson',
                time: '2025-03-04T09:30:00Z',
                unread: true
              },
              {
                id: 'D0125',
                name: 'Emma Williams',
                type: 'direct',
                lastMessage: 'Could we schedule a call to discuss the methodology?',
                sender: 'Emma Williams',
                time: '2025-03-03T15:45:00Z',
                unread: false
              },
              {
                id: 'C0124',
                name: 'project-updates',
                type: 'channel',
                lastMessage: 'The latest paper has been accepted for publication!',
                sender: 'Jane Smith',
                time: '2025-03-02T11:20:00Z',
                unread: false
              }
            ]);
          }, 1000);
        });
        
        const notificationsPromise = new Promise(resolve => {
          setTimeout(() => {
            resolve([
              {
                id: '1',
                type: 'mention',
                message: 'Robert Johnson mentioned you in #research-collaboration',
                time: '2025-03-04T08:15:00Z',
                read: false
              },
              {
                id: '2',
                type: 'project',
                message: 'New paper added to "Climate Change Impact Analysis"',
                time: '2025-03-03T16:30:00Z',
                read: true
              },
              {
                id: '3',
                type: 'research',
                message: 'New citation for your paper "Machine Learning Applications"',
                time: '2025-03-03T11:45:00Z',
                read: true
              }
            ]);
          }, 1200);
        });
        
        // Wait for all promises to resolve
        const [projectsData, chatsData, notificationsData] = await Promise.all([
          projectsPromise,
          chatsPromise,
          notificationsPromise
        ]);
        
        setProjects(projectsData);
        setRecentChats(chatsData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Planning':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format chat time to relative time
  const formatChatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5; // hours
    
    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };
  
  // Get notification type icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'mention':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'project':
        return <Book className="h-5 w-5 text-green-500" />;
      case 'research':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Layout>
      <Head>
        <title>Dashboard - OpenScholar Hub</title>
        <meta name="description" content="View your research activities, projects and messages" />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.displayName || user?.email || 'valued researcher'}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link
              href="/projects/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Open Chat
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-12"></div>
                ) : (
                  projects.filter(project => project.status === 'In Progress').length
                )}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Collaborators</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-12"></div>
                ) : (
                  projects.reduce((total, project) => total + project.collaborators, 0)
                )}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Saved Articles</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">2</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Unread Messages</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-12"></div>
                ) : (
                  recentChats.filter(chat => chat.unread).length
                )}
              </dd>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Projects List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Your Research Projects</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage and collaborate on your ongoing research initiatives
                  </p>
                </div>
                <Link
                  href="/projects"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              {loading ? (
                <div className="px-4 py-10 sm:px-6 flex justify-center">
                  <div className="animate-pulse space-y-4 w-full">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <li key={project.id}>
                      <div className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-blue-600 truncate">{project.title}</p>
                              <div className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                                {project.status}
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <Link 
                                href={`/projects/${project.id}`}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                View
                              </Link>
                              <Link 
                                href={`/chat/C${project.id}`}
                                className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                              >
                                <MessageCircle className="mr-1 h-3 w-3" />
                                Chat
                              </Link>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                {project.collaborators} Collaborators
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              <p>
                                Last updated on <time dateTime={project.lastUpdated}>{format(new Date(project.lastUpdated), 'MMM d, yyyy')}</time>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              {projects.length === 0 && !loading && (
                <div className="px-4 py-10 sm:px-6 text-center">
                  <Book className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new research project.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/projects/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      New Project
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Recent Chat Activity */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Recent Chat Activity</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Stay updated on your research conversations
                  </p>
                </div>
                <Link
                  href="/chat"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Open Chat <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              {loading ? (
                <div className="px-4 py-6 sm:px-6">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : recentChats.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentChats.map((chat) => (
                    <li key={chat.id}>
                      <Link href={chat.type === 'channel' ? `/chat/${chat.id}` : `/chat/dm/${chat.id}`}>
                        <div className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 mr-2">
                                  {chat.type === 'channel' ? (
                                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-blue-100 text-blue-600">
                                      #
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-600">
                                      {chat.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 flex items-center">
                                    {chat.type === 'channel' ? `#${chat.name}` : chat.name}
                                    {chat.unread && (
                                      <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    <span className={chat.unread ? "font-medium" : ""}>
                                      {chat.type === 'direct' ? '' : `${chat.sender}: `}{chat.lastMessage}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="ml-2 text-xs text-gray-500 flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {formatChatTime(chat.time)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent chat activity</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start a conversation with your collaborators.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/chat"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <MessageCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Open Chat
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Notifications List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Recent activity and updates
                  </p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Mark all as read
                </button>
              </div>
              
              {loading ? (
                <div className="px-4 py-6 sm:px-6">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : notifications.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <li key={notification.id} className={notification.read ? 'bg-white' : 'bg-blue-50'}>
                      <div className="block px-4 py-4 sm:px-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${notification.read ? 'text-gray-800' : 'text-gray-900 font-medium'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatChatTime(notification.time)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="ml-2 flex-shrink-0">
                              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You&apos;re all caught up!
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Saved Articles */}
            <SavedArticles />
            
            {/* Quick Search */}
            <div className="bg-white shadow-md rounded-lg p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Search</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search papers, projects..."
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded">
                  Machine Learning
                </button>
                <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded">
                  Climate Research
                </button>
                <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded">
                  Recent Papers
                </button>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="bg-white shadow-md rounded-lg p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/research" className="text-blue-600 hover:underline flex items-center">
                    <Book className="h-4 w-4 mr-2" />
                    Search Academic Research
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="text-blue-600 hover:underline flex items-center">
                    <Book className="h-4 w-4 mr-2" />
                    Browse Projects
                  </Link>
                </li>
                <li>
                  <Link href="/chat" className="text-blue-600 hover:underline flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with Collaborators
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-blue-600 hover:underline flex items-center">
                    <PenSquare className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Recent Activities */}
            <div className="bg-white shadow-md rounded-lg p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
                <Link href="/activities" className="text-xs text-blue-600 hover:underline flex items-center">
                  View All <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-3">
                <div className="border-l-2 border-blue-500 pl-3 py-1">
                  <p className="text-sm text-gray-800">You downloaded &quot;Machine Learning Methods&quot; paper</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
                <div className="border-l-2 border-green-500 pl-3 py-1">
                  <p className="text-sm text-gray-800">You joined project &quot;Climate Change Impact Analysis&quot;</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
                <div className="border-l-2 border-purple-500 pl-3 py-1">
                  <p className="text-sm text-gray-800">You saved &quot;Renewable Energy Trends&quot; paper</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Wrap the Dashboard component with authentication protection
export default withAuth(Dashboard);