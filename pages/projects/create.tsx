// File path: @/pages/projects/create.tsx

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { NextPage } from 'next';
import { withAuth } from '@/middleware/authMiddleware';
import Layout from '@/components/page-templates/Layout';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, 
  Minus, 
  Book, 
  ArrowLeft, 
  Search,
  ChevronRight,
  BookOpen,
  X,
  AlertCircle,
  Loader
} from 'lucide-react';
import { createProject } from '@/services/projectService';
import { searchScholar, advancedSearch } from '@/utils/scholarApi';
import type { ResearchPaper } from '@/types';

interface FormData {
  title: string;
  description: string;
  category: string;
  visibility: 'private' | 'public';
  tags: string[];
  relatedResearch: Array<{ id: string; title: string }>;
  status: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
}

interface ResearchResult {
  id: string;
  title: string;
  authors: string;
  year: string | number;
}

interface RouterQuery {
  research_id?: string;
  research_title?: string;
}

const CreateProject: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { research_id, research_title } = router.query as RouterQuery;
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    visibility: 'private',
    tags: [],
    relatedResearch: [],
    status: 'planning'
  });
  
  const [tag, setTag] = useState<string>('');
  const [showResearchSearch, setShowResearchSearch] = useState<boolean>(false);
  const [researchQuery, setResearchQuery] = useState<string>('');
  const [researchResults, setResearchResults] = useState<ResearchResult[]>([]);
  const [researchLoading, setResearchLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Handle pre-populated research if coming from research article
  useEffect(() => {
    if (research_id && research_title) {
      setFormData(prev => ({
        ...prev,
        title: `Research on: ${research_title.substring(0, 50)}${research_title.length > 50 ? '...' : ''}`,
        relatedResearch: [
          ...prev.relatedResearch,
          {
            id: research_id,
            title: research_title
          }
        ]
      }));
    }
  }, [research_id, research_title]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const handleAddTag = () => {
    if (tag.trim() !== '' && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
      setTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };
  
  const handleRemoveResearch = (researchId: string) => {
    setFormData(prev => ({
      ...prev,
      relatedResearch: prev.relatedResearch.filter(r => r.id !== researchId)
    }));
  };
  
  const handleResearchSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!researchQuery.trim()) return;
    
    setResearchLoading(true);
    setSearchError(null);
    
    try {
      // Use the existing scholarApi utility to search for articles
      const data = await searchScholar(researchQuery);
      
      if (data && data.articles && data.articles.length > 0) {
        // Format the results for display
        const formattedResults: ResearchResult[] = data.articles.map((article: any) => ({
          id: article.id || `article_${Math.random().toString(36).substring(2, 10)}`,
          title: article.title || 'Unknown Title',
          authors: article.author?.names || 'Unknown Authors',
          year: article.year || new Date().getFullYear()
        }));
        
        setResearchResults(formattedResults);
      } else {
        setResearchResults([]);
        setSearchError('No results found. Try a different search term.');
      }
    } catch (error) {
      console.error('Error searching for research:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to search for articles. Please try again.';
      setSearchError(errorMessage);
    } finally {
      setResearchLoading(false);
    }
  };
  
  // Advanced search with filters if needed
  const handleAdvancedSearch = async (filters: any) => {
    setResearchLoading(true);
    setSearchError(null);
    
    try {
      // Use the advanced search functionality
      const articles = await advancedSearch(filters);
      
      if (articles && articles.length > 0) {
        const formattedResults: ResearchResult[] = articles.map((article: any) => ({
          id: article.id || `article_${Math.random().toString(36).substring(2, 10)}`,
          title: article.title || 'Unknown Title',
          authors: article.author?.names || 'Unknown Authors',
          year: article.year || new Date().getFullYear()
        }));
        
        setResearchResults(formattedResults);
      } else {
        setResearchResults([]);
        setSearchError('No results found with these filters. Try adjusting your search criteria.');
      }
    } catch (error) {
      console.error('Error with advanced search:', error);
      const errorMessage = error instanceof Error ? error.message : 'Advanced search failed. Please try again.';
      setSearchError(errorMessage);
    } finally {
      setResearchLoading(false);
    }
  };
  
  const handleAddResearch = (research: ResearchResult) => {
    if (!formData.relatedResearch.some(r => r.id === research.id)) {
      setFormData(prev => ({
        ...prev,
        relatedResearch: [...prev.relatedResearch, {
          id: research.id,
          title: research.title
        }]
      }));
    }
  };
  
  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Project title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Project description is required';
    }
    
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    
    return errors;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to the first error
      const firstErrorField = document.getElementById(Object.keys(errors)[0]);
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }
    
    if (!user || !user.uid) {
      setSubmitError('You must be logged in to create a project');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Prepare project data
      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        isPrivate: formData.visibility === 'private',
        tags: formData.tags,
        status: formData.status as 'active' | 'planning' | 'completed' | 'archived',
        relatedResearch: formData.relatedResearch.map(item => ({
          id: item.id,
          title: item.title,
          authors: '', // Provide default values for required fields
          year: new Date().getFullYear()
        }))
      };
      
      // Create project using our service
      const createdProject = await createProject(projectData, user.uid);
      
      console.log('Project created successfully:', createdProject);
      
      // Navigate to the new project page
      router.push(`/projects/${createdProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project. Please try again.';
      setSubmitError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>Create New Project - OpenScholar Hub</title>
        <meta name="description" content="Create a new research project on OpenScholar Hub" />
      </Head>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <span>Create Project</span>
          </div>
          
          <Link 
            href="/projects" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Projects
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="mt-1 text-gray-500">
            Start a new research project and invite collaborators
          </p>
        </div>
        
        {/* Error alert */}
        {submitError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {submitError}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Project Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Fill in the information below to create your project
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
            {/* Project Title */}
            <div className="w-full">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  formErrors.title 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:border-transparent transition duration-150`}
                placeholder="Enter a descriptive title for your project"
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
              )}
            </div>
            
            {/* Description */}
            <div className="w-full">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  formErrors.description 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:border-transparent transition duration-150 resize-y`}
                placeholder="Describe your research project, goals, and methodology..."
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>
            
            {/* Category */}
            <div className="w-full">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  formErrors.category 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:border-transparent transition duration-150 bg-white`}
              >
                <option value="">Select a category</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Environmental Science">Environmental Science</option>
                <option value="Biology">Biology</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Social Sciences">Social Sciences</option>
                <option value="Medicine">Medicine</option>
                <option value="Engineering">Engineering</option>
                <option value="Humanities">Humanities</option>
                <option value="Other">Other</option>
              </select>
              {formErrors.category && (
                <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
              )}
            </div>
            
            {/* Project Status */}
            <div className="w-full">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Project Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 bg-white"
              >
                <option value="planning">Planning</option>
                <option value="active">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            {/* Visibility Options */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center">
                  <input
                    id="visibility-private"
                    name="visibility"
                    type="radio"
                    value="private"
                    checked={formData.visibility === 'private'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 transition duration-150"
                  />
                  <label htmlFor="visibility-private" className="ml-3 block text-sm font-medium text-gray-700">
                    Private (Only visible to collaborators)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="visibility-public"
                    name="visibility"
                    type="radio"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 transition duration-150"
                  />
                  <label htmlFor="visibility-public" className="ml-3 block text-sm font-medium text-gray-700">
                    Public (Visible to all OpenScholar Hub users)
                  </label>
                </div>
              </div>
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="tags"
                  id="tags"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="w-full px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                  placeholder="Add keywords to help others find your project"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg shadow-sm text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                >
                  Add
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Press Enter or click Add to add a tag</p>
              
              {formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((t) => (
                    <span key={t} className="inline-flex rounded-full items-center py-0.5 pl-2.5 pr-1 text-sm font-medium bg-blue-100 text-blue-700">
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                      >
                        <span className="sr-only">Remove {t} tag</span>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Related Research Section */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Related Research</h3>
                  <p className="text-sm text-gray-500">
                    Link this project to existing academic research
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResearchSearch(!showResearchSearch)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                >
                  {showResearchSearch ? (
                    <>
                      <X className="mr-1.5 h-4 w-4 text-gray-500" />
                      Hide Search
                    </>
                  ) : (
                    <>
                      <Search className="mr-1.5 h-4 w-4 text-gray-500" />
                      Find Papers
                    </>
                  )}
                </button>
              </div>
              
              {/* Research Search */}
              {showResearchSearch && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <form onSubmit={handleResearchSearch} className="flex gap-2">
                    <div className="flex-grow relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={researchQuery}
                        onChange={(e) => setResearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                        placeholder="Search for papers, authors, or keywords..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={researchLoading || !researchQuery.trim()}
                      className="px-4 py-2 rounded-lg border border-transparent shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                    >
                      {researchLoading ? (
                        <span className="flex items-center">
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                          Searching...
                        </span>
                      ) : (
                        'Search'
                      )}
                    </button>
                  </form>
                  
                  {/* Search Error */}
                  {searchError && (
                    <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded-md flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{searchError}</span>
                    </div>
                  )}
                  
                  {/* Search Results */}
                  {researchResults.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Search Results</h4>
                      <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white">
                        {researchResults.map((result) => (
                          <div key={result.id} className="py-3 px-4 flex justify-between items-center">
                            <div className="pr-2">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{result.title}</h4>
                              <p className="text-xs text-gray-500">
                                {result.authors} • {result.year}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddResearch(result)}
                              disabled={formData.relatedResearch.some(r => r.id === result.id)}
                              className={`flex-shrink-0 inline-flex items-center px-2 py-1 text-xs font-medium rounded
                                ${formData.relatedResearch.some(r => r.id === result.id)
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                            >
                              {formData.relatedResearch.some(r => r.id === result.id) ? 'Added' : 'Add'}
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        <Link href="/research" className="text-blue-600 hover:underline inline-flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          View more results in Research
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Display selected research papers */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {formData.relatedResearch.length > 0 ? 'Selected Papers' : ''}
                </h4>
                
                {formData.relatedResearch.length > 0 ? (
                  <div className="space-y-2">
                    {formData.relatedResearch.map((paper) => (
                      <div key={paper.id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center bg-white">
                        <div className="flex items-start">
                          <BookOpen className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{paper.title}</h4>
                            <Link 
                              href={`/research/article/${paper.id}`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View paper
                            </Link>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveResearch(paper.id)}
                          className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition duration-150"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : !showResearchSearch && (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                    <Book className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-1 text-sm text-gray-500">
                      No research papers linked yet
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowResearchSearch(true)}
                      className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition duration-150"
                    >
                      <Search className="mr-1.5 h-3 w-3" />
                      Find Papers
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="pt-5 mt-6 border-t border-gray-200 flex flex-wrap justify-end gap-3">
              <Link
                href="/projects"
                className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-transparent shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(CreateProject);
