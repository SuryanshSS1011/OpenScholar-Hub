// @/pages/research/article/[id].js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ArticleDetail from '@/components/ArticleDetail';
import SavedArticles from '@/components/SavedArticles';
import { ArrowLeft, Book, Users, Download, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const ArticlePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [articleTitle, setArticleTitle] = useState('Article Details');
  const { user } = useAuth();
  
  // Get article title if article data is loaded
  const handleArticleTitle = (title) => {
    if (title) {
      setArticleTitle(title);
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>{articleTitle} - OpenScholar Hub</title>
        <meta name="description" content="View research article details and citations" />
      </Head>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{articleTitle}</h1>
          <p className="mt-1 text-gray-500">
            View publication information, citations, and access the full paper
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main content column */}
          <div className="lg:col-span-3">
            <ArticleDetail articleId={id} onTitleLoad={handleArticleTitle} />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {user && <SavedArticles limit={3} />}
            
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
                <a 
                  href="#"
                  onClick={(e) => { e.preventDefault(); window.print(); }}
                  className="block text-blue-600 hover:underline flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Print article details
                </a>
              </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Save For Later</h3>
              <p className="text-gray-600 text-sm mb-4">
                Add this paper to your personal research library for future reference.
              </p>
              <button 
                onClick={() => document.querySelector('button:has(.bookmark-icon), button:has(.bookmarkplus-icon)').click()}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add to Library
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArticlePage;