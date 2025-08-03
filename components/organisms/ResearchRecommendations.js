// @/components/ResearchRecommendations.js
import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const mockRecommendations = [
  {
    id: 'gVDgNAq_jJMJ',
    title: 'Survey of important issues in UAV communication networks',
    author: 'L Gupta, R Jain, G Vaszkun',
    journal: 'IEEE communications surveys & tutorials',
    year: 2015,
    citations: 2444,
    relevance: 'High',
    tags: ['UAV', 'communication', 'networking']
  },
  {
    id: 'XRt1dfhq2_8J',
    title: 'Introduction to UAV systems',
    author: 'PG Fahlstrom, TJ Gleason, MH Sadraey',
    journal: 'Book',
    year: 2022,
    citations: 757,
    relevance: 'High',
    tags: ['UAV', 'systems', 'introduction']
  },
  {
    id: 'AYl-XXuZligJ',
    title: 'Review of the current state of UAV regulations',
    author: 'C Stöcker, R Bennett, F Nex, M Gerke, J Zevenbergen',
    journal: 'Remote sensing',
    year: 2017,
    citations: 678,
    relevance: 'Medium',
    tags: ['UAV', 'regulations', 'policy']
  }
];

const ResearchRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      
      try {
        // In a real application, this would call an API endpoint that returns
        // personalized recommendations based on the user's interests and history
        // For now, we'll use mock data with a simulated delay
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use mock data
        setRecommendations(mockRecommendations);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [user]);
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended for You</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended for You</h3>
      
      {recommendations.length === 0 ? (
        <p className="text-gray-500">
          No recommendations available yet. Try searching for some papers to get started.
        </p>
      ) : (
        <div className="space-y-4">
          {recommendations.map((paper) => (
            <div key={paper.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
              <Link 
                href={`/research/article/${paper.id}`}
                className="text-blue-600 hover:underline font-medium block mb-1"
              >
                {paper.title}
              </Link>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <User className="h-3 w-3 mr-1" />
                <span>{paper.author}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {paper.citations} citations
                </span>
                
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  {paper.relevance} relevance
                </span>
                
                {paper.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <Link 
              href="/research/recommendations"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              View all recommendations
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchRecommendations;