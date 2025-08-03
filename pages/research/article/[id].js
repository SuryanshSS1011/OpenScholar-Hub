// @/pages/research/article/[id].js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/page-templates/Layout';
import ArticleDetail from '@/components/organisms/ArticleDetail';
import SavedArticles from '@/components/organisms/SavedArticles';
import ArticleChatWidget from '@/components/organisms/ArticleChatWidget';
import { 
  ArrowLeft, 
  Book, 
  Users, 
  Download, 
  ChevronRight, 
  FileText, 
  ExternalLink,
  MessageCircle,
  Share2, 
  Bookmark,
  BookmarkPlus,
  ThumbsUp,
  Loader
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const ArticlePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [articleTitle, setArticleTitle] = useState('Article Details');
  const [articleData, setArticleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  
  // Fetch article data
  useEffect(() => {
    if (!id) return;
    
    const fetchArticleData = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, this would call your API
        // For demo, simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Mock article data
        const articleData = {
          id: id,
          title: "Advances in Machine Learning for Climate Prediction Models",
          author: "Jane Smith, Robert Johnson, Emma Williams",
          journal: "Journal of Computational Climate Science",
          year: "2024",
          abstract: "This paper presents novel machine learning approaches for enhancing climate prediction models. By integrating deep learning techniques with traditional climate modeling, our approach demonstrates significant improvements in prediction accuracy across multiple time scales. The results have important implications for climate change research and policy planning.",
          doi: "10.1234/jccs.2024.01.0123",
          citations: 8,
          views: 432,
          downloads: 56,
          publication_date: "2024-01-15",
          keywords: ["machine learning", "climate prediction", "deep learning", "neural networks", "climate modeling"],
          full_text_url: "https://example.com/papers/advances-ml-climate-prediction.pdf",
          figures: [
            {
              id: "fig1",
              caption: "Comparison of prediction accuracy between traditional and ML-enhanced models",
              url: "/images/figure1.jpg"
            },
            {
              id: "fig2",
              caption: "Neural network architecture for climate prediction",
              url: "/images/figure2.jpg"
            }
          ],
          references: 42
        };
        
        setArticleData(articleData);
        setArticleTitle(articleData.title);
        
        // Check if article is saved
        if (user) {
          // Mock saved status check - in a real app, query the database
          const isSaved = localStorage.getItem(`saved_${id}_${user.uid}`);
          setSaved(!!isSaved);
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticleData();
  }, [id, user]);
  
  // Handle saving/unsaving the article
  const handleSave = () => {
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
      localStorage.setItem(`saved_${id}_${user.uid}`, 'true');
    } else {
      localStorage.removeItem(`saved_${id}_${user.uid}`);
    }
  };
  
  // Handle sharing the article
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: articleTitle,
        text: `Check out this research paper: ${articleTitle}`,
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
  
  return (
    <Layout>
      <Head>
        <title>{articleTitle} - OpenScholar Hub</title>
        <meta name="description" content="View research article details and citations" />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs and back button */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/research" className="hover:text-blue-600">
              Research
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>Article</span>
          </div>
          
          <Link 
            href="/research" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Research
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading article details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => router.push('/research')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Back to Research
              </button>
            </div>
          </div>
        ) : articleData ? (
          <>
            {/* Article header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{articleData.title}</h1>
              <div className="mt-2 flex flex-wrap items-center text-gray-700 gap-x-4 gap-y-2">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{articleData.author}</span>
                </div>
                <div>
                  <span>{articleData.journal}, {articleData.year}</span>
                </div>
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{articleData.citations} citations</span>
                </div>
              </div>
            </div>
            
            {/* Main layout grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Main article column */}
              <div className="lg:col-span-3 space-y-6">
                {/* Article content */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="p-6">
                    {/* Abstract */}
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Abstract</h2>
                      <p className="text-gray-700">{articleData.abstract}</p>
                    </div>
                    
                    {/* Keywords */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {articleData.keywords.map((keyword, idx) => (
                          <Link 
                            key={idx}
                            href={`/research?q=${encodeURIComponent(keyword)}`}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
                          >
                            {keyword}
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Publication Details</h3>
                      <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 gap-x-6">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">DOI</dt>
                          <dd className="mt-1 text-sm text-gray-900">{articleData.doi}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Publication Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">{articleData.publication_date}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Citations</dt>
                          <dd className="mt-1 text-sm text-gray-900">{articleData.citations}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">References</dt>
                          <dd className="mt-1 text-sm text-gray-900">{articleData.references}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    {/* Download and citation buttons */}
                    <div className="flex flex-wrap gap-3 mt-6">
                      <a
                        href={articleData.full_text_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </a>
                      
                      <button
                        onClick={() => window.open(`https://doi.org/${articleData.doi}`, '_blank')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Source
                      </button>
                      
                      <button
                        onClick={() => window.open(`https://www.doi.org/${articleData.doi}`, '_blank')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Cite
                      </button>
                      
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
                  </div>
                </div>
                
                {/* Related Articles Section */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Related Articles
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Papers that cite this research or share similar topics
                    </p>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <ul className="divide-y divide-gray-200">
                      <li className="py-4">
                        <div className="flex">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-blue-600 hover:underline">
                              <Link href={`/research/article/related1`}>
                                Interpretable Machine Learning Models for Climate Prediction
                              </Link>
                            </p>
                            <p className="text-sm text-gray-500">
                              Maria Rodriguez, et al. • Published in Journal of Climate Informatics (2023)
                            </p>
                          </div>
                        </div>
                      </li>
                      <li className="py-4">
                        <div className="flex">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-blue-600 hover:underline">
                              <Link href={`/research/article/related2`}>
                                Neural Networks for Improving Regional Climate Predictions
                              </Link>
                            </p>
                            <p className="text-sm text-gray-500">
                              Alex Chen, David Wilson • Published in AI for Earth Systems (2024)
                            </p>
                          </div>
                        </div>
                      </li>
                      <li className="py-4">
                        <div className="flex">
                          <div className="ml-3">
                            <p className="text-sm font-medium text-blue-600 hover:underline">
                              <Link href={`/research/article/related3`}>
                                Ensemble Methods for Robust Climate Forecasting
                              </Link>
                            </p>
                            <p className="text-sm text-gray-500">
                              James Peterson • Published in Computational Sustainability (2023)
                            </p>
                          </div>
                        </div>
                      </li>
                    </ul>
                    
                    <div className="mt-6">
                      <Link
                        href={`/research?related=${encodeURIComponent(id)}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
                      >
                        View more related papers
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Article Chat Widget */}
                <ArticleChatWidget 
                  articleId={id}
                  articleTitle={articleTitle}
                />
                
                {/* Research Actions */}
                <div className="bg-white shadow-md rounded-lg p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Research Actions</h3>
                  <div className="space-y-4">
                    <Link 
                      href="/projects/create"
                      className="block text-blue-600 hover:underline flex items-center"
                    >
                      <Book className="h-4 w-4 mr-2" />
                      Start a project based on this paper
                    </Link>
                    <Link 
                      href={`/research?q=${encodeURIComponent(articleTitle.split(' ').slice(0, 3).join(' '))}`}
                      className="block text-blue-600 hover:underline flex items-center"
                    >
                      <Book className="h-4 w-4 mr-2" />
                      Find similar papers
                    </Link>
                    <Link 
                      href="/collaborators"
                      className="block text-blue-600 hover:underline flex items-center"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Find potential collaborators
                    </Link>
                    <button 
                      onClick={() => window.print()}
                      className="block text-blue-600 hover:underline flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Print article details
                    </button>
                  </div>
                </div>
                
                {/* Saved Articles */}
                {user && <SavedArticles limit={3} />}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500">Article not found</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ArticlePage;