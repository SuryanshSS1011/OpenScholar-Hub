// Updates to @/pages/profile.js

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/middleware/authMiddleware';
import Layout from '@/components/Layout';
import ProfileResearch from '@/components/ProfileResearch';
import SavedArticles from '@/components/SavedArticles';
import { User, Mail, BookOpen, Calendar, MapPin, Globe, PenSquare } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    institution: '',
    role: '',
    location: '',
    website: '',
    bio: '',
    joinDate: ''
  });
  
  useEffect(() => {
    // In a real app, this would fetch profile data from the database
    // For now, populate with user data from auth
    if (user) {
      setUserProfile({
        name: user.displayName || 'Anonymous Researcher',
        email: user.email || '',
        institution: 'Example University',
        role: 'PhD Candidate',
        location: 'San Francisco, CA',
        website: 'https://example.com',
        bio: 'Researcher focused on artificial intelligence and machine learning applications.',
        joinDate: user.metadata?.creationTime || new Date().toISOString()
      });
    }
  }, [user]);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };
  
  return (
    <Layout>
      <Head>
        <title>Profile - OpenScholar Hub</title>
        <meta name="description" content="Manage your personal and academic information" />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="mt-1 text-gray-500">Manage your personal and academic information</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PenSquare className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main profile information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Researcher Profile
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Personal and academic details
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified Researcher
                </span>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Full name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userProfile.name}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userProfile.email}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Institution
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userProfile.institution}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Role/Position
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userProfile.role}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userProfile.location}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <a href={userProfile.website} className="text-blue-600 hover:underline">
                        {userProfile.website}
                      </a>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Joined
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(userProfile.joinDate)}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      About
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userProfile.bio}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Research Interests Section */}
            <ProfileResearch userId={user?.uid} />
            
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Saved Articles Section */}
            <SavedArticles limit={5} />
            
            {/* Quick Links */}
            <div className="bg-white shadow-md rounded-lg p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Research Tools</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/research" className="text-blue-600 hover:underline flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Search Academic Literature
                  </a>
                </li>
                <li>
                  <a href="/dashboard/saved" className="text-blue-600 hover:underline flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View All Saved Articles
                  </a>
                </li>
                <li>
                  <a href="/profile/publications" className="text-blue-600 hover:underline flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Publications
                  </a>
                </li>
                <li>
                  <a href="/profile/citations" className="text-blue-600 hover:underline flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Track Citations
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

export default withAuth(Profile);