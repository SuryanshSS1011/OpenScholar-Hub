import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Layout from './components/Layout';
import { Search, Filter, BookOpen, Users, Calendar, ArrowUpRight } from 'lucide-react';

const ProjectsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, featured, recent, popular

  useEffect(() => {
    // Simulated fetch of project data
    const fetchProjects = async () => {
      try {
        // This would be replaced with an API call in production
        setTimeout(() => {
          setProjects([
            {
              id: '1',
              title: 'Climate Change Impact on Ocean Ecosystems',
              description: 'Comprehensive study of global warming effects on marine biodiversity and ecosystem stability.',
              category: 'Environmental Science',
              members: 12,
              status: 'active',
              featured: true,
              lastUpdated: '2025-02-18',
              tags: ['climate', 'marine', 'biodiversity'],
            },
            {
              id: '2',
              title: 'Neural Networks for Medical Diagnosis',
              description: 'Developing advanced neural network models to improve early detection of diseases from medical imaging.',
              category: 'Computer Science',
              members: 8,
              status: 'active',
              featured: true,
              lastUpdated: '2025-02-20',
              tags: ['ai', 'healthcare', 'neural-networks'],
            },
            {
              id: '3',
              title: 'Sustainable Urban Planning Models',
              description: 'Research on integrating renewable energy and green infrastructure in urban development.',
              category: 'Urban Planning',
              members: 15,
              status: 'active',
              featured: false,
              lastUpdated: '2025-01-25',
              tags: ['sustainability', 'urban', 'renewable'],
            },
            {
              id: '4',
              title: 'Blockchain for Academic Publishing',
              description: 'Exploring blockchain technology to improve transparency and credit in academic publishing.',
              category: 'Information Science',
              members: 6,
              status: 'planning',
              featured: false,
              lastUpdated: '2025-02-12',
              tags: ['blockchain', 'publishing', 'academia'],
            },
            {
              id: '5',
              title: 'Quantum Computing Applications in Cryptography',
              description: 'Research on implications of quantum computing for current cryptographic methods and development of quantum-resistant algorithms.',
              category: 'Computer Science',
              members: 9,
              status: 'active',
              featured: true,
              lastUpdated: '2025-02-22',
              tags: ['quantum', 'cryptography', 'security'],
            },
            {
              id: '6',
              title: 'Vaccine Development for Emerging Diseases',
              description: 'Collaborative research on methods to accelerate vaccine development for new and emerging infectious diseases.',
              category: 'Biology',
              members: 24,
              status: 'active',
              featured: false,
              lastUpdated: '2025-01-30',
              tags: ['vaccines', 'infectious-disease', 'public-health'],
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter and search projects
  useEffect(() => {
    let result = [...projects];
    
    // Apply category filter
    if (filter === 'featured') {
      result = result.filter(project => project.featured);
    } else if (filter === 'recent') {
      result = result.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    } else if (filter === 'popular') {
      result = result.sort((a, b) => b.members - a.members);
    }
    
    // Apply search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        project =>
          project.title.toLowerCase().includes(lowerSearchTerm) ||
          project.description.toLowerCase().includes(lowerSearchTerm) ||
          project.category.toLowerCase().includes(lowerSearchTerm) ||
          project.tags.some(tag => tag.includes(lowerSearchTerm))
      );
    }
    
    setFilteredProjects(result);
  }, [projects, searchTerm, filter]);

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
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No projects found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter to find what you&apos;re looking for.
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Link href={`/projects/${project.id}`} key={project.id}>
                  <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 cursor-pointer border border-gray-100">
                    <div className="px-4 py-5 sm:p-6">
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
                      <div className="mt-4">
                        <div className="flex space-x-2 flex-wrap">
                          {project.tags.map((tag) => (
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
                          <span>{project.lastUpdated}</span>
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsPage;