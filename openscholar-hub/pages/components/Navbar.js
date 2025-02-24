import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, login, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg fixed w-full z-10 top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <h1 className="text-xl font-bold cursor-pointer">OpenScholar Hub</h1>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-black">Home</Link>
            <Link href="/about" className="text-gray-600 hover:text-black">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-black">Contact</Link>
            {user ? (
              <button 
                onClick={logout} 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            ) : (
              <button 
                onClick={login} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Sign In
              </button>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="md:hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block text-gray-600 hover:text-black">Home</Link>
            <Link href="/about" className="block text-gray-600 hover:text-black">About</Link>
            <Link href="/contact" className="block text-gray-600 hover:text-black">Contact</Link>
            {user ? (
              <button 
                onClick={logout} 
                className="w-full text-left px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            ) : (
              <button 
                onClick={login} 
                className="w-full text-left px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Sign In
              </button>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;