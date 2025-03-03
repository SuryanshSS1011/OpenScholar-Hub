// @/pages/projects/[id]/chat.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { withAuth } from '@/middleware/authMiddleware';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import DiscordChat from '@/components/DiscordChat';
import { ArrowLeft, ChevronRight, Loader, AlertTriangle } from 'lucide-react';

const ProjectChatPage = () => {
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
            category: 'Computer Science',
          };
          
          setProject(projectData);
          setLoading(false);
        }, 500);
        
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
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-blue-500 animate-spin" />
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
              <AlertTriangle className="h-6 w-6 text-red-400 mr-2" />
              <div>
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Link
              href={`/projects/${id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Project
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
  
  return (
    <Layout>
      <Head>
        <title>Project Chat | {project.title}</title>
        <meta name="description" content={`Chat and collaborate on ${project.title}`} />
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
            <Link href={`/projects/${id}`} className="hover:text-blue-600">
              Project Details
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>Chat</span>
          </div>
          
          <Link 
            href={`/projects/${id}`} 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Project
          </Link>
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <div className="flex items-center mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {project.category}
            </span>
            <span className="mx-2 text-gray-500">•</span>
            <span className="text-gray-500">Project Chat</span>
          </div>
        </div>
        
        {discordSetup ? (
          <DiscordChat projectId={id} projectTitle={project.title} />
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="mx-auto h-16 w-16 text-indigo-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Discord Chat Not Set Up</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              To enable real-time chat for this project, you need to set up Discord integration. 
              This will create dedicated channels for this project in your Discord server.
            </p>
            <button
              onClick={handleSetupDiscord}
              disabled={setupLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
        )}
        
        <div className="mt-8">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  This chat is synchronized with your Discord server. Messages posted here will appear in Discord and vice versa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(ProjectChatPage);