// @/pages/research.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { NextPage } from 'next';
import { withAuth } from '@/middleware/authMiddleware';
import Layout from '@/components/page-templates/Layout';
import ScholarSearch from '@/components/organisms/ScholarSearch';
import ResearchRecommendations from '@/components/organisms/ResearchRecommendations';
import { BookOpen, Database, Download, Users } from 'lucide-react';

interface RouterQuery {
  q?: string;
}

const ResearchPage: NextPage = () => {
  const router = useRouter();
  const { q: initialQuery } = router.query as RouterQuery;
  const [query, setQuery] = useState<string>('');

  // Set initial query from URL parameter
  useEffect(() => {
    if (initialQuery && typeof initialQuery === 'string') {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  return (
    <Layout>
      <Head>
        <title>Research - OpenScholar Hub</title>
        <meta name="description" content="Search and discover academic research on OpenScholar Hub" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Research</h1>
            <p className="mt-1 text-gray-500">
              Discover and access academic literature from across the web
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main search column */}
          <div className="lg:col-span-2">
            <ScholarSearch />
          </div>

          {/* Sidebar */}
          <div>
            <ResearchRecommendations />
            
            <div className="bg-white shadow-md rounded-lg p-6 mb-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Popular Research Topics</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/research?q=artificial+intelligence" className="text-blue-600 hover:underline flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Artificial Intelligence
                  </Link>
                </li>
                <li>
                  <Link href="/research?q=climate+change" className="text-blue-600 hover:underline flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Climate Change
                  </Link>
                </li>
                <li>
                  <Link href="/research?q=quantum+computing" className="text-blue-600 hover:underline flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Quantum Computing
                  </Link>
                </li>
                <li>
                  <Link href="/research?q=renewable+energy" className="text-blue-600 hover:underline flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Renewable Energy
                  </Link>
                </li>
                <li>
                  <Link href="/research?q=machine+learning" className="text-blue-600 hover:underline flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Machine Learning
                  </Link>
                </li>
              </ul>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Research Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/datasets" className="text-blue-600 hover:underline flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Open Datasets
                  </a>
                </li>
                <li>
                  <a href="/tools" className="text-blue-600 hover:underline flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Research Tools
                  </a>
                </li>
                <li>
                  <a href="/collaborators" className="text-blue-600 hover:underline flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Find Collaborators
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(ResearchPage);
