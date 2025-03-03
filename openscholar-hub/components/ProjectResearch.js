// @/components/ProjectResearch.js
import { useState, useEffect } from 'react';
import { Book, BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const ProjectResearch = ({ projectId, projectTitle, projectTags = [] }) => {
  const [relatedResearch, setRelatedResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRelatedResearch = async () => {
      setLoading(true);
      
      // Generate search query from project title and tags
      let query = projectTitle;
      if (projectTags && projectTags.length > 0) {
        query = projectTags.slice(0, 3).join(' ') + ' ' + projectTitle.split(' ').slice(0, 3).join(' ');
      }
      
      setSearchQuery(query);
      
      try {
        // In a real application, this would call the API
        // For demo, use mock data with a delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        setRelatedResearch([
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
      } catch (error) {
        console.error('Error fetching related research:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (projectTitle) {
      fetchRelatedResearch();
    }
  }, [projectId, projectTitle, projectTags]);
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Related Research
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Academic literature related to this project
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded w-5/6"></div>
            ))}
          </div>
        ) : relatedResearch.length > 0 ? (
          <div className="space-y-4">
            {relatedResearch.map((paper) => (
              <div key={paper.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <Link 
                  href={`/research/article/${paper.id}`}
                  className="text-blue-600 hover:underline font-medium block mb-1"
                >
                  {paper.title}
                </Link>
                <p className="text-sm text-gray-600">
                  {paper.authors} • {paper.journal} ({paper.year})
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Cited by {paper.citations}
                </p>
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
          <div className="text-center py-6">
            <Book className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No related research found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try searching for academic literature to support this project.
            </p>
            <div className="mt-6">
              <Link
                href="/research"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Search Research
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <Link
              href={`/project/${projectId}/research/add`}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Add Related Papers
            </Link>
          </div>
          <div>
            <Link
              href="/research"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Scholar Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectResearch;