import React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import Layout from '@/components/page-templates/Layout';

const Contact: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Contact - OpenScholar Hub</title>
        <meta name="description" content="Get in touch with the OpenScholar Hub team" />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-1 text-gray-500">Get in touch with the OpenScholar Hub team</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-600">Contact page coming soon...</p>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
