// @/pages/projects/[id].js

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { withAuth } from '@/middleware/authMiddleware';
import Layout from '@/components/page-templates/Layout';
import { useAuth } from '@/context/AuthContext';
import ProjectResearch from '@/components/organisms/ProjectResearch';
import { 
  Users, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Share2, 
  MessageCircle,
  UserPlus,
  Loader,
  AlertCircle,
  Shield,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { getProjectById, getProjectMembers, deleteProject } from '@/services/projectService';

const ProjectDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get project details
        const projectData = await getProjectById(id);
        setProject(projectData);
        
        // Get project members
        const membersData = await getProjectMembers(id);
        setMembers(membersData);
        
        // Determine user's role in the project
        const userMembership = membersData.find(member => member.userId === user.uid);
        setUserRole(userMembership ? userMembership.role : null);
        
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError(err.message || 'Failed to load project. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchProjectData();
    }
  }, [id, user]);
  
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
  
  // Check if user is project admin
  const isAdmin = userRole === 'admin';
  
  // Get status display badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'planning':
      case 'Planning':
        return 'bg-blue-100 text-blue-800';
      case 'active':
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!isAdmin) return;
    
    setIsDeleting(true);
    
    try {
      await deleteProject(id);
      router.push('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err.message || 'Failed to delete project. Please try again.');
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };
  
  // Handle sharing the project
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: `Check out this research project: ${project.title}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Project link copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy link:', err);
        });
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>{project ? `${project.title} - Project` : 'Project Details'} - OpenScholar Hub</title>
        <meta name="description" content={project ? `${project.title} - ${project.description.substring(0, 150)}...` : 'Project details on OpenScholar Hub'} />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
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
            <span className="truncate max-w-xs">
              {project ? project.title : 'Loading...'}
            </span>
          </div>
          
          <Link 
            href="/projects" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Projects
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <Loader className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading project details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="max-w-md p-6 bg-red-50 rounded-lg text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </button>
                <Link href="/projects">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Back to Projects
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : project ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project header */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex flex-wrap justify-between items-start mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 mr-4">{project.title}</h1>
                    <div className="flex space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                        {project.status === 'active' ? 'In Progress' : 
                         project.status === 'planning' ? 'Planning' : 
                         project.status === 'completed' ? 'Completed' : 
                         project.status}
                      </span>
                      {project.isPrivate && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags && project.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap text-sm text-gray-500 gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      Created {formatDate(project.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      Updated {formatDate(project.lastUpdated)}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      {project.members} {project.members === 1 ? 'Member' : 'Members'}
                    </div>
                  </div>
                </div>
                
                {/* Project actions */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3">
                  {isAdmin && (
                    <>
                      <Link href={`/projects/${id}/edit`}>
                        <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <Edit className="h-4 w-4 mr-1.5" />
                          Edit Project
                        </button>
                      </Link>
                      
                      <button 
                        onClick={() => setIsConfirmingDelete(true)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </button>
                    </>
                  )}
                  
                  <Link href={`/chat/project-${id}`}>
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <MessageCircle className="h-4 w-4 mr-1.5" />
                      Chat
                    </button>
                  </Link>
                  
                  <button 
                    onClick={handleShare}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Share2 className="h-4 w-4 mr-1.5" />
                    Share
                  </button>
                </div>
              </div>
              
              {/* Project research */}
              <ProjectResearch 
                projectId={id} 
                projectTitle={project.title} 
                projectTags={project.tags} 
              />
              
              {/* Project activity feed - placeholder for future implementation */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Activity
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Latest updates and changes to this project
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="text-center py-10 text-gray-500">
                    Activity feed coming soon
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Team members */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Team Members
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {project.members} {project.members === 1 ? 'person' : 'people'} working on this project
                    </p>
                  </div>
                  {isAdmin && (
                    <button 
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <UserPlus className="h-4 w-4 mr-1.5" />
                      Invite
                    </button>
                  )}
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {/* Placeholder for team members list - would be populated from actual user data */}
                  <div className="space-y-3">
                    {members.length > 0 ? (
                      members.map((member, index) => (
                        <div key={member.id || index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <Users className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {member.userId === project.createdBy ? 'Project Creator' : `Member ${index + 1}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {member.role === 'admin' ? 'Admin' : 'Member'}
                              </p>
                            </div>
                          </div>
                          {isAdmin && member.userId !== user.uid && (
                            <button className="text-sm text-red-600 hover:text-red-800">
                              Remove
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No members found
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Project details */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Project Details
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="mt-1 text-sm text-gray-900">{project.category || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created By</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {project.createdBy === user.uid ? 'You' : 'Another Researcher'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        <Shield className="h-4 w-4 mr-1.5 text-gray-400" />
                        {project.isPrivate ? 'Private' : 'Public'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {/* Related projects placeholder */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Related Projects
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="text-center py-6 text-gray-500">
                    <BookOpen className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    No related projects yet
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <p className="text-gray-500">Project not found</p>
              <Link href="/projects">
                <button
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Projects
                </button>
              </Link>
            </div>
          </div>
        )}
        
        {/* Delete confirmation modal */}
        {isConfirmingDelete && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Project</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this project? This action cannot be undone and all project data will be permanently lost.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="flex items-center">
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Deleting...
                    </span>
                  ) : (
                    'Delete Project'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(ProjectDetail);