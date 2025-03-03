import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import ScholarSearch from '@/components/ScholarSearch';
import PaperCitations from '@/components/PaperCitations';
import AuthorProfile from '@/components/AuthorProfile';
import RelatedPapers from '@/components/RelatedPapers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withAuth } from '@/middleware/authMiddleware';

const LookoutPage = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [paperId, setPaperId] = useState('');
  const [authorId, setAuthorId] = useState('');

  // Demo paper ID and author ID for testing purposes
  const handleDemoPaperClick = () => {
    setPaperId('ZJjQyFbm4j8C');
    setActiveTab('citations');
  };

  const handleDemoAuthorClick = () => {
    setAuthorId('hHmZB17AAAAJ');
    setActiveTab('author');
  };

  return (
    <Layout>
      <Head>
        <title>Research Lookout - OpenScholar Hub</title>
        <meta name="description" content="Discover and explore academic papers and research trends" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Research Lookout</h1>
            <p className="mt-1 text-lg text-gray-500">
              Stay updated on academic papers, citations, and research trends
            </p>
          </div>
        </div>

        <div className="mb-6">
          <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="search">Search Papers</TabsTrigger>
              <TabsTrigger value="citations">Paper Citations</TabsTrigger>
              <TabsTrigger value="author">Author Profile</TabsTrigger>
              <TabsTrigger value="related">Related Papers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search">
              <ScholarSearch />
            </TabsContent>
            
            <TabsContent value="citations">
              <div className="space-y-4">
                <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Paper Citations</h2>
                  
                  <div className="mb-6">
                    <label htmlFor="paperId" className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Paper ID
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="paperId"
                        value={paperId}
                        onChange={(e) => setPaperId(e.target.value)}
                        placeholder="e.g., ZJjQyFbm4j8C"
                        className="flex-grow focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={handleDemoPaperClick}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Try Demo
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      The paper ID can be found in Google Scholar paper URLs (e.g., scholar.google.com/citations?view_op=view_citation&citation_for_view=ZJjQyFbm4j8C)
                    </p>
                  </div>
                </div>
                
                {paperId && <PaperCitations paperId={paperId} />}
              </div>
            </TabsContent>
            
            <TabsContent value="author">
              <div className="space-y-4">
                <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Author Profile</h2>
                  
                  <div className="mb-6">
                    <label htmlFor="authorId" className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Author ID
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="authorId"
                        value={authorId}
                        onChange={(e) => setAuthorId(e.target.value)}
                        placeholder="e.g., hHmZB17AAAAJ"
                        className="flex-grow focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={handleDemoAuthorClick}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Try Demo
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      The author ID can be found in Google Scholar profile URLs (e.g., scholar.google.com/citations?user=hHmZB17AAAAJ)
                    </p>
                  </div>
                </div>
                
                {authorId && <AuthorProfile authorId={authorId} />}
              </div>
            </TabsContent>
            
            <TabsContent value="related">
              <div className="space-y-4">
                <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Related Papers</h2>
                  
                  <div className="mb-6">
                    <label htmlFor="relatedPaperId" className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Paper ID
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="relatedPaperId"
                        value={paperId}
                        onChange={(e) => setPaperId(e.target.value)}
                        placeholder="e.g., ZJjQyFbm4j8C"
                        className="flex-grow focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={handleDemoPaperClick}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Try Demo
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      The paper ID can be found in Google Scholar paper URLs (e.g., scholar.google.com/citations?view_op=view_citation&citation_for_view=ZJjQyFbm4j8C)
                    </p>
                  </div>
                </div>
                
                {paperId && <RelatedPapers paperId={paperId} />}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(LookoutPage);