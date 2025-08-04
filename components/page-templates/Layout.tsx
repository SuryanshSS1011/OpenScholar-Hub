import React from 'react';
import Navbar from '@/components/organisms/Navbar';
import ErrorBoundary from '@/components/organisms/ErrorBoundary';
import Link from 'next/link';
import { LayoutProps } from '@/types';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <ErrorBoundary>
        <main className="pt-16">
          {children}
        </main>
      </ErrorBoundary>
      <footer className="bg-gray-800 text-white text-center p-4 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="font-semibold text-lg mb-1">OpenScholar Hub</p>
              <p className="text-sm text-gray-300">Democratizing research collaboration</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-gray-300 hover:text-white">
                About
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-400">© 2025 OpenScholar Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Layout;