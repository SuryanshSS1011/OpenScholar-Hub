// @/pages/projects/[id].js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { withAuth } from '@/middleware/authMiddleware';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import DiscordChat from '@/components/DiscordChat';
import ProjectResearch from '@/components/ProjectResearch';
import { ArrowLeft, Users, Calendar, ChevronRight, Globe, Lock, BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const ProjectDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discordSetup, setDiscordSetup] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // This would be replaced with an actual API call in production
        
        // Simulate API call with timeout
        setTimeout(() => {
          // Mock project data
          const projectData = {
            id,
            title: 'Neural Networks for Medical Diagnostics',
            description: 'This project is focused on developing advanced neural network models to improve early detection of diseases from medical imaging. Our team is working on optimizing algorithms for MRI and CT scan analysis, with a particular focus on brain tumors and lung nodules.',
            category: 'Computer Science',
            visibility: 'public',
            collaborators: [
              { id: 1, name: 'Jane Smith', role: 'Lead Researcher', avatar: '/images/avatar1.jpg' },
              { id: 2, name: 'John Doe', role: 'Data Scientist', avatar: '/images/avatar2.jpg' },
              { id: 3, name: 'Alice Johnson', role: 'Medical Expert', avatar: '/images/avatar3.jpg' }
            ],
            createdAt: '2025-01-15T12:00:00Z',
            updatedAt: '2025-02-25T09:30:00Z',
            tags: ['neural-networks', 'healthcare', 'machine-learning', 'medical-imaging'],
            progress: 65
          };
          
          setProject(projectData);
          setLoading(false);
        }, 1000);
        
        // Check Discord setup status
        try {
          const discordResponse = await fetch(`/api/discord/project?projectId=${id}`);
          const discordData = await discordResponse.json();
          setDiscordSetup(discordData.isSetup);
        } catch (discordError) {
          console.error('Error checking Discord setup:', discordError);
          setDiscordSetup(false);
        }
        
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id]);
  
  const handleSetupDiscord = async () => {
    if (!project) return;
    
    setSetupLoading(true);
    
    try {
      const response = await fetch('/api/discord/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: id,
          projectTitle: project.title,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to set up Discord channels');
      }
      
      const data = await response.json();
      setDiscordSetup(true);
      
      // Show success message or redirect to the chat
    } catch (err) {
      console.error('Error setting up Discord:', err);
      setError('Failed to set up Discord channels. Please try again later.');
    } finally {
      setSetupLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Link
              href="/projects"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!project) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="mt-2 text-lg font-medium text-gray-900">Project not found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <div className="mt-6">
              <Link
                href="/projects"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View All Projects
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };
  
  return (
    <Layout>
      <Head>
        <title>{project.title} | OpenScholar Hub</title>
        <meta name="description" content={project.description.substring(0, 160)} />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/projects" className="hover:text-blue-600">
              Projects
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>Project Details</span>
          </div>
          
          <Link 
            href="/projects" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Projects
          </Link>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <div className="mt-1 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  {project.category}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {project.visibility === 'public' ? (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-4">
                {project.collaborators.slice(0, 3).map((collaborator) => (
                  <div 
                    key={collaborator.id} 
                    className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
                  >
                    {collaborator.avatar ? (
                      <img 
                        src={collaborator.avatar} 
                        alt={collaborator.name} 
                        className="h-full w-full object-cover" 
                        width={32} 
                        height={32}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white font-medium">
                        {collaborator.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
                {project.collaborators.length > 3 && (
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                    +{project.collaborators.length - 3}
                  </div>
                )}
              </div>
              <Link
                href={`/projects/${id}/edit`}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Project
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {project.description}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(project.createdAt)}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last Updated
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(project.updatedAt)}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Collaborators
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {project.collaborators.map((collaborator) => (
                      <li 
                        key={collaborator.id}
                        className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full mr-3 bg-gray-200 overflow-hidden">
                            {collaborator.avatar ? (
                              <img 
                                src={collaborator.avatar} 
                                alt={collaborator.name} 
                                className="h-full w-full object-cover"
                                width={32}
                                height={32}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white font-medium">
                                {collaborator.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-medium">{collaborator.name}</span>
                            <p className="text-gray-500">{collaborator.role}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Tags</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Progress</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 mt-1">{project.progress}% complete</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Related Research Section */}
            <ProjectResearch
              projectId={id}
              projectTitle={project.title}
              projectTags={project.tags}
            />
            
            {/* Discord Chat Integration */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Project Discussion
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Collaborate in real-time with your team via Discord
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Link
                    href={`/projects/${id}/chat`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Open Full Chat
                  </Link>
                  {!discordSetup && (
                    <button
                      onClick={handleSetupDiscord}
                      disabled={setupLoading}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {setupLoading ? 'Setting up...' : 'Set up Discord Chat'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                {discordSetup ? (
                  <DiscordChat projectId={id} projectTitle={project.title} />
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Discord chat not set up</h3>
                    <p className="mt-1 text-gray-500 max-w-lg mx-auto">
                      Set up Discord integration to enable real-time collaboration with project members.
                      This will create dedicated channels for this project in your Discord server.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={handleSetupDiscord}
                        disabled={setupLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {setupLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Setting up Discord integration...
                          </>
                        ) : (
                          <>
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                            Set up Discord Integration
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Project Actions
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <nav className="space-y-1" aria-label="Project actions">
                  <Link
                    href={`/projects/${id}/edit`}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-900"
                  >
                    <svg className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Project Details
                  </Link>
                  <Link
                    href={`/projects/${id}/collaborators`}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-900"
                  >
                    <svg className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Manage Collaborators
                  </Link>
                  <Link
                    href={`/projects/${id}/datasets`}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-900"
                  >
                    <svg className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    Project Datasets
                  </Link>
                  <Link
                    href={`/projects/${id}/files`}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-900"
                  >
                    <svg className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Project Files
                  </Link>
                  <Link
                    href={`/projects/${id}/tasks`}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-900"
                  >
                    <svg className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Project Tasks
                  </Link>
                </nav>
              </div>
            </div>
            
            {/* Project Statistics */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Project Statistics
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium text-gray-700">Completion</div>
                    <div className="text-sm font-medium text-gray-700">{project.progress}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Collaborators
                    </div>
                    <div className="mt-1 text-xl font-semibold text-gray-900">
                      {project.collaborators.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Duration
                    </div>
                    <div className="mt-1 text-xl font-semibold text-gray-900">
                      {Math.ceil((new Date(project.updatedAt) - new Date(project.createdAt)) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Join Discord Server */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <h3 className="text-center text-lg font-medium text-indigo-900 mb-2">
                  Join our Discord Server
                </h3>
                <p className="text-center text-indigo-700 text-sm mb-4">
                  Connect with fellow researchers and collaborate in real-time via Discord.
                </p>
                <div className="flex justify-center">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => window.open('https://discord.gg/your-invite-link', '_blank')}
                  >
                    Join Server
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(ProjectDetailPage);