import React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import Layout from '@/components/page-templates/Layout';

const About: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>About - OpenScholar Hub</title>
        <meta name="description" content="Learn about OpenScholar Hub and our mission to democratize research collaboration" />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">About OpenScholar Hub</h1>
          <p className="mt-1 text-gray-500">Learn about our mission to democratize research collaboration</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              OpenScholar Hub is a research collaboration platform built to democratize access to academic research and enable seamless collaboration between researchers worldwide.
            </p>
            <p className="text-gray-600">
              Our platform enables students, researchers, and professionals to collaborate on research projects, share datasets, and publish findings in an open environment.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
