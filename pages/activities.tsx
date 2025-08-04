import React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { withAuth } from '@/middleware/authMiddleware';
import Layout from '@/components/page-templates/Layout';

const Activities: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Activities - OpenScholar Hub</title>
        <meta name="description" content="View your recent activities and updates" />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="mt-1 text-gray-500">View your recent activities and updates</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600">Activities page coming soon...</p>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(Activities);
