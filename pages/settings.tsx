import React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { withAuth } from '@/middleware/authMiddleware';
import Layout from '@/components/page-templates/Layout';

const Settings: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Settings - OpenScholar Hub</title>
        <meta name="description" content="Manage your account settings and preferences" />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-500">Manage your account settings and preferences</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600">Settings page coming soon...</p>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(Settings);
