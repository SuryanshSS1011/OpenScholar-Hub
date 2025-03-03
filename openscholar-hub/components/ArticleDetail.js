// @/components/ArticleDetail.js
import { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Users, 
  Download, 
  ExternalLink, 
  Calendar, 
  BookOpen, 
  ChevronRight,
  Share2,
  Bookmark,
  BookmarkPlus,
  Loader,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const ArticleDetail = ({ articleId, onTitleLoad }) => {
  const [article, setArticle] = useState(null);
  const [citations, setCitations] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();

  // Function to fetch article data
  const fetchArticleData = useCallback(async () => {
    if (!articleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch article details
      const articleRes = await fetch(`/api/scholar?action=article&id=${articleId}`);
      
      if (!articleRes.ok) {
        throw new Error('Failed to fetch article details');
      }
      
      const articleData = await articleRes.json();
      setArticle(articleData);
      
      // Call onTitleLoad callback if provided
      if (onTitleLoad && typeof onTitleLoad === 'function' && articleData.title) {
        onTitleLoad(articleData.title);
      }
      
      // Fetch citation data
      const citationsRes = await fetch(`/api/scholar?action=citations&id=${articleId}`);
      
      if (citationsRes.ok) {
        const citationsData = await citationsRes.json();
        setCitations(citationsData);
        
        // Use citations to get related articles
        if (citationsData.citingArticles && citationsData.citingArticles.length > 0) {
          setRelatedArticles(citationsData.citingArticles.slice(0, 3));
        }
      }

      // Check if article is saved (in a real app, this would check user's saved articles)
      if (user) {
        // Mock saved status check - in a real app, query the database
        const isSaved = localStorage.getItem(`saved_${articleId}_${user.uid}`);
        setSaved(!!isSaved);
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err.message || 'An error occurred while retrieving the article');
    } finally {
      setLoading(false);
    }
  }, [articleId, user, onTitleLoad]);

  // Fetch data when component mounts or articleId changes
  useEffect(() => {
    fetchArticleData();
  }, [fetchArticleData]);

  const handleSave = async () => {
    if (!user) {
      // Redirect to login or show a message
      alert('Please sign in to save articles');
      return;
    }
    
    // Toggle saved state
    setSaved(!saved);
    
    // In a real app, this would call an API to save/unsave
    // For now, use localStorage to simulate
    if (!saved) {
      localStorage.setItem(`saved_${articleId}_${user.uid}`, 'true');
    } else {
      localStorage.removeItem(`saved_${articleId}_${user.uid}`);
    }
  };

  const handleShare = () => {
    if (!article) return;
    
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: `Check out this research paper: ${article.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support sharing
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy link:', err);
        });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center h-64">
        <Loader className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading article details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-500 mb-2">Error</div>
        <p className="text-gray-700">{error}</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (!article) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">No article information available</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Article Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center text-sm text-gray-500">
          <Link href="/research" className="hover:text-blue-600">
            Research
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Article Details</span>
        </div>
      </div>
      
      {/* Article Content */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{article.title}</h1>
        
        {/* Authors */}
        <div className="flex items-center mt-3 mb-4">
          <Users className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-gray-700">{article.author?.names || 'Unknown Author'}</span>
        </div>
        
        {/* Publication Info */}
        {article.description && (
          <div className="mb-6 text-gray-600">
            <p>{article.description}</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 mb-8">
          {article.doc?.link && (
            <a
              href={article.doc.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              {article.doc.type || 'Download Paper'}
            </a>
          )}
          
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Source
          </a>
          
          <a
            href={article.cite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FileText className="h-4 w-4 mr-2" />
            Cite
          </a>
          
          <button
            onClick={handleSave}
            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              saved 
                ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            {saved ? <Bookmark className="h-4 w-4 mr-2" /> : <BookmarkPlus className="h-4 w-4 mr-2" />}
            {saved ? 'Saved' : 'Save'}
          </button>
          
          <button
            onClick={handleShare}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>
        
        {/* Tags / Keywords (extracted from article data if available) */}
        {article.extras && (
          <div className="mt-4 mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {article.id.split('_').map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">
                  {tag}
                </span>
              ))}
              {article.description && article.description.split(' ').slice(0, 3).map((word, index) => (
                <span key={`desc-${index}`} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">
                  {word.replace(/[^a-zA-Z0-9]/g, '')}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Citation Information */}
        {citations && (
          <div className="mt-6 bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Citations</h3>
            <p className="text-gray-700 mb-4">
              This paper has been cited <span className="font-semibold">{citations.count || '0'}</span> times.
            </p>
            
            {citations.citingArticles && citations.citingArticles.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Top Citing Papers:</h4>
                <ul className="space-y-3">
                  {citations.citingArticles.slice(0, 3).map((cite, index) => (
                    <li key={index} className="border-b border-gray-200 pb-2">
                      <a 
                        href={cite.link} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-start"
                      >
                        <BookOpen className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                        <span>{cite.title}</span>
                      </a>
                      <p className="text-sm text-gray-500 ml-6 mt-1">{cite.author?.names || 'Unknown Author'}</p>
                    </li>
                  ))}
                </ul>
                
                {citations.citingArticles.length > 3 && (
                  <a
                    href={article.extras?.citations?.link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm text-blue-600 hover:underline"
                  >
                    View all {citations.count} citations
                  </a>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* References section (if available) */}
        {relatedArticles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Related Research</h3>
            <div className="space-y-4">
              {relatedArticles.map((related, index) => (
                <div key={index} className="border-l-2 border-blue-100 pl-4">
                  <Link 
                    href={`/research/article/${related.id}`}
                    className="text-blue-600 hover:underline font-medium block"
                  >
                    {related.title}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">{related.author?.names || 'Unknown Author'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Abstract or additional information (if available) */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Source</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {article.description ? article.description.split('-').pop().trim() : 'Unknown'}
              </dd>
            </div>
            {article.extras?.citations && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Citation Count</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a 
                    href={article.extras.citations.link} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <LinkIcon className="h-3 w-3 mr-1" />
                    {article.extras.citations.count || '0'}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Added to OpenScholar</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(new Date().toISOString())}</dd>
            </div>
            {article.doc?.type && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Available Format</dt>
                <dd className="mt-1 text-sm text-gray-900">{article.doc.type}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;