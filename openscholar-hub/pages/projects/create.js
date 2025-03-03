import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { withAuth } from '@/middleware/authMiddleware';
import { useAuth } from '@/context/AuthContext';
import ScholarSearch from '@/components/ScholarSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, Users, Calendar, Tag, BookOpen, ChevronRight, ChevronDown, Plus, Trash } from 'lucide-react';

const CreateProjectPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLiteratureSearch, setShowLiteratureSearch] = useState(false);
  
  // Project form state
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [],
    visibility: 'public',
    references: [],
    collaborators: []
  });
  
  // Tag input state
  const [tagInput, setTagInput] = useState('');
  
  // Collaborator input state
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle tag addition
  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !projectData.tags.includes(tagInput.trim())) {
      setProjectData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  // Handle tag removal
  const handleRemoveTag = (tag) => {
    setProjectData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };
  
  // Handle collaborator addition
  const handleAddCollaborator = (e) => {
    e.preventDefault();
    if (collaboratorEmail.trim() && !projectData.collaborators.includes(collaboratorEmail.trim())) {
      setProjectData(prev => ({
        ...prev,
        collaborators: [...prev.collaborators, collaboratorEmail.trim()]
      }));
      setCollaboratorEmail('');
    }
  };
  
  // Handle collaborator removal
  const handleRemoveCollaborator = (email) => {
    setProjectData(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter(c => c !== email)
    }));
  };
  
  // Handle paper reference addition from Scholar search
  const handleAddReference = (paper) => {
    if (!projectData.references.some(ref => ref.title === paper.title)) {
      setProjectData(prev => ({
        ...prev,
        references: [...prev.references, {
          title: paper.title,
          authors: paper.authors,
          link: paper.link,
          year: paper.publication_info?.summary || '',
          cited_by: paper.cited_by?.value || 0
        }]
      }));
    }
  };
  
  // Handle reference removal
  const handleRemoveReference = (index) => {
    setProjectData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!projectData.title || !projectData.description) {
      setError('Please provide at least a title and description for your project.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be replaced with an actual API call in production
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...projectData,
          ownerId: user.uid,
          createdAt: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      const data = await response.json();
      router.push(`/projects/${data.id}`);
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>Create Project - OpenScholar Hub</title>
        <meta name="description" content="Create a new research project on OpenScholar Hub" />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="mt-1 text-lg text-gray-500">
            Start a new research collaboration or publish your findings
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="p-4 border-b border-gray-200 bg-gray-50">
              <TabsTrigger value="details">Project Details</TabsTrigger>
              <TabsTrigger value="literature">Literature Review</TabsTrigger>
              <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit}>
              <TabsContent value="details" className="p-6">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={projectData.title}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="E.g., Climate Change Impact on Marine Ecosystems"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="4"
                      value={projectData.description}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Provide a detailed description of your research project"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Research Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={projectData.category}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select a category</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Biology">Biology</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Environmental Science">Environmental Science</option>
                      <option value="Social Sciences">Social Sciences</option>
                      <option value="Medicine">Medicine</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Economics">Economics</option>
                      <option value="Psychology">Psychology</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                      Tags
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 flex-grow block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                        placeholder="Add tags to help others find your project"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
                      >
                        Add
                      </button>
                    </div>
                    
                    {projectData.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {projectData.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                            >
                              <span className="sr-only">Remove tag {tag}</span>
                              <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                      Visibility
                    </label>
                    <select
                      id="visibility"
                      name="visibility"
                      value={projectData.visibility}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="public">Public - Visible to everyone</option>
                      <option value="protected">Protected - Visible to registered users</option>
                      <option value="private">Private - Visible only to collaborators</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveTab('literature')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next: Literature Review
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="literature" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Literature References</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add references to existing research papers for your project
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <button
                      type="button"
                      onClick={() => setShowLiteratureSearch(!showLiteratureSearch)}
                      className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      {showLiteratureSearch ? (
                        <ChevronDown className="mr-2 h-4 w-4" />
                      ) : (
                        <ChevronRight className="mr-2 h-4 w-4" />
                      )}
                      Search Google Scholar for papers
                    </button>
                    
                    {showLiteratureSearch && (
                      <div className="mt-4">
                        <ScholarSearch onPaperSelect={handleAddReference} />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Selected References</h3>
                    
                    {projectData.references.length > 0 ? (
                      <div className="space-y-4">
                        {projectData.references.map((reference, index) => (
                          <div key={index} className="flex justify-between items-start p-4 border border-gray-200 rounded-md">
                            <div className="flex-grow">
                              <h4 className="text-sm font-medium text-gray-900">{reference.title}</h4>
                              <p className="mt-1 text-xs text-gray-500">{reference.authors}</p>
                              <p className="mt-1 text-xs text-gray-500">{reference.year}</p>
                              {reference.cited_by > 0 && (
                                <p className="mt-1 text-xs text-gray-500">Cited by: {reference.cited_by}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveReference(index)}
                              className="ml-4 flex-shrink-0 text-red-500 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No references added</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Search Lookout to add references to your project
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Back to Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('collaborators')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next: Collaborators
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="collaborators" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Project Collaborators</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Invite others to collaborate on your research project
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="collaboratorEmail" className="block text-sm font-medium text-gray-700">
                      Add Collaborator by Email
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="email"
                        id="collaboratorEmail"
                        value={collaboratorEmail}
                        onChange={(e) => setCollaboratorEmail(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 flex-grow block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                        placeholder="Enter email address"
                      />
                      <button
                        type="button"
                        onClick={handleAddCollaborator}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </button>
                    </div>
                  </div>
                  
                  {projectData.collaborators.length > 0 ? (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {projectData.collaborators.map((email) => (
                          <li key={email}>
                            <div className="px-4 py-4 flex items-center sm:px-6">
                              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                  <div className="flex text-sm">
                                    <p className="font-medium text-blue-600 truncate">{email}</p>
                                    <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                      (Invitation will be sent)
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-5 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCollaborator(email)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No collaborators added</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Add collaborators by their email addresses
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveTab('literature')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Back to Literature
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Creating...' : 'Create Project'}
                    </button>
                  </div>
                </div>
              </TabsContent>
            </form>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

// Add authentication protection
export default withAuth(CreateProjectPage);