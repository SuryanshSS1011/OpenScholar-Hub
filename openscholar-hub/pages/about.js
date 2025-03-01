import Head from 'next/head';
import Link from 'next/link';
import Layout from './components/Layout';
import { Users, BookOpen, Database, Shield, GraduationCap, Globe } from 'lucide-react';

const AboutPage = () => {
  return (
    <Layout>
      <Head>
        <title>About - OpenScholar Hub</title>
        <meta name="description" content="Learn about OpenScholar Hub's mission to democratize research collaboration" />
      </Head>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Our Mission</h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl">
              OpenScholar Hub is dedicated to democratizing research collaboration by creating a secure, 
              transparent, and accessible platform for knowledge sharing across institutions and borders.
            </p>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Vision</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Breaking Down Barriers to Knowledge
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              We believe research and knowledge should be accessible to all, regardless of institutional affiliations or geographical boundaries.
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Collaborative Research</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Our platform enables researchers worldwide to collaborate across institutional boundaries, bringing diverse perspectives to complex problems.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Open Access Publishing</h3>
                  <p className="mt-2 text-base text-gray-500">
                    We support the open access movement by providing infrastructure for publishing research findings in an accessible manner while ensuring proper attribution.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Database className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Data Sharing</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Share datasets and research materials securely with version control, making reproducible research a reality.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Trust & Transparency</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Our future decentralized features will ensure data integrity and open-access research using blockchain and decentralized storage solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Story</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              From Idea to Reality
            </p>
          </div>

          <div className="mt-10">
            <div className="prose prose-blue prose-lg text-gray-500 mx-auto">
              <p>
                OpenScholar Hub began with a simple observation: despite living in an age of unprecedented connectivity, research collaboration remains fragmented by institutional, geographical, and economic barriers.
              </p>
              
              <p>
                Founded in 2024 by a team of researchers, technologists, and open science advocates, our platform was born from the frustration of being unable to easily collaborate across institutional boundaries and the belief that knowledge should be accessible to all.
              </p>
              
              <p>
                We started by creating a centralized platform with robust authentication, cloud storage, and API integrations. Our roadmap includes developing decentralized features to ensure data integrity and truly open access research.
              </p>
              
              <p>
                Today, OpenScholar Hub connects thousands of researchers worldwide, enabling collaboration on groundbreaking projects across disciplines. Our community is building a future where research is more collaborative, transparent, and accessible.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Values</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What We Stand For
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white mx-auto">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">Open Access</h3>
                <p className="mt-2 text-base text-gray-500">
                  We believe knowledge should be freely accessible to everyone, regardless of institutional affiliation or financial resources.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white mx-auto">
                  <Globe className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">Global Collaboration</h3>
                <p className="mt-2 text-base text-gray-500">
                  We&apos;re committed to creating tools that enable seamless collaboration across geographical, institutional, and disciplinary boundaries.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white mx-auto">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg leading-6 font-medium text-gray-900">Integrity & Trust</h3>
                <p className="mt-2 text-base text-gray-500">
                  We uphold the highest standards of academic integrity, data security, and transparent attribution of contributions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Join Our Community</span>
            <span className="block">Be Part of Open Science</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Sign up and connect with researchers worldwide. Share your work, collaborate on projects, and help democratize research.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Create Your Account
              </Link>
            </div>
            <div className="ml-3 inline-flex">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;