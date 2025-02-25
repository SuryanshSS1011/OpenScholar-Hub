import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, User, LogOut, BookOpen, Home, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, googleSignIn, logout } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignIn = async () => {
    try {
      await googleSignIn();
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navbarClasses = useMemo(() => 
    `fixed w-full z-10 top-0 left-0 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm'
    }`, [scrolled]);

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-blue-600 font-bold text-2xl">OS</span>
              <span className="text-gray-900 font-bold text-2xl">Hub</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                router.pathname === '/' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center">
                <Home size={18} className="mr-1" />
                Home
              </span>
            </Link>
            
            <Link 
              href="/projects" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                router.pathname === '/projects' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center">
                <BookOpen size={18} className="mr-1" />
                Projects
              </span>
            </Link>
            
            <div className="relative mx-2">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search size={18} className="text-gray-400" />
              </span>
              <input
                className="block w-full bg-gray-100 border border-transparent rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-blue-300 focus:ring-1 transition"
                placeholder="Search research..."
                type="search"
              />
            </div>
            
            {user ? (
              <div className="ml-3 relative flex items-center">
                <div className="flex space-x-2">
                  <Link 
                    href="/dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      router.pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  
                  <div className="flex items-center space-x-2 ml-2">
                    <Link href="/profile" className="relative">
                      <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt={user.displayName || 'User profile'} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={20} className="h-full w-full p-1 text-gray-600" />
                        )}
                      </span>
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <LogOut size={16} className="mr-1" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleSignIn}
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.2 }}
        className="md:hidden overflow-hidden"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
          <Link 
            href="/" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              router.pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
            onClick={closeMenu}
          >
            Home
          </Link>
          
          <Link 
            href="/projects" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              router.pathname === '/projects' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
            onClick={closeMenu}
          >
            Projects
          </Link>
          
          {user && (
            <Link 
              href="/dashboard" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                router.pathname === '/dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
              onClick={closeMenu}
            >
              Dashboard
            </Link>
          )}
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="flex items-center px-3">
                <div className="flex-shrink-0">
                  {user.photoURL ? (
                    <img 
                      className="h-10 w-10 rounded-full" 
                      src={user.photoURL} 
                      alt={user.displayName || 'User profile'} 
                    />
                  ) : (
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-200">
                      <User size={24} className="text-gray-600" />
                    </span>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.displayName || 'Scholar'}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <LogOut size={16} className="mr-1" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-3 py-3">
                <button 
                  onClick={handleSignIn}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign In with Google
                </button>
                <p className="mt-2 text-xs text-center text-gray-500">
                  Sign in to access all features
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;