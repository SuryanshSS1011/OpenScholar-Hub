// @/components/organisms/SavedArticles.tsx
import React, { useState, useEffect } from 'react';
import { BookOpen, Trash2, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface SavedArticle {
  id: string;
  title: string;
  authors: string;
  savedAt: string;
}

// Mock data for saved articles
const mockSavedArticles: SavedArticle[] = [
  {
    id: 'gVDgNAq_jJMJ',
    title: 'Survey of important issues in UAV communication networks',
    authors: 'L Gupta, R Jain, G Vaszkun',
    savedAt: '2025-02-15T10:30:00Z'
  },
  {
    id: 'XRt1dfhq2_8J',
    title: 'Introduction to UAV systems',
    authors: 'PG Fahlstrom, TJ Gleason, MH Sadraey',
    savedAt: '2025-02-20T14:45:00Z'
  }
];

const SavedArticles: React.FC = () => {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchSavedArticles = async (): Promise<void> => {
      if (!user) {
        setSavedArticles([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // In a real application, this would fetch from a database
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        setSavedArticles(mockSavedArticles);
      } catch (error) {
        console.error('Error fetching saved articles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedArticles();
  }, [user]);
  
  const handleRemove = (articleId: string): void => {
    // In a real application, this would remove from the database
    setSavedArticles(savedArticles.filter(article => article.id !== articleId));
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Saved Articles</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex">
              <div className="w-full">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Saved Articles</h3>
        <p className="text-gray-500">Sign in to save and access your articles.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Saved Articles</h3>
      
      {savedArticles.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t saved any articles yet.</p>
      ) : (
        <div className="space-y-4">
          {savedArticles.map((article) => (
            <div key={article.id} className="flex justify-between border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
              <div className="flex-1">
                <Link 
                  href={`/research/article/${article.id}`}
                  className="text-blue-600 hover:underline font-medium block mb-1"
                >
                  {article.title}
                </Link>
                <p className="text-sm text-gray-600">{article.authors}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Saved on {formatDate(article.savedAt)}</span>
                </div>
              </div>
              <div className="flex items-start ml-4 space-x-2">
                <Link
                  href={`/research/article/${article.id}`}
                  className="p-1 text-gray-400 hover:text-blue-500"
                  title="View Article"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleRemove(article.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="Remove from Saved"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          
          {savedArticles.length > 0 && (
            <div className="pt-2">
              <Link
                href="/dashboard/saved"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                View all saved articles
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedArticles;