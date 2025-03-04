// @/components/Navbar.js - Updated with Chat Integration
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  BookOpen, 
  Home, 
  Search, 
  FileText, 
  AlertCircle,
  ChevronDown,
  Settings,
  UserCircle,
  MessageCircle
} from 'lucide-react';

const Navbar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    // Clean up
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for unread messages
  useEffect(() => {
    if (user) {
      // In a real implementation, we would fetch unread count from API
      // For demo, just set a random number occasionally
      const interval = setInterval(() => {
        // Simulate getting new messages 30% of the time
        if (Math.random() > 0.7) {
          setUnreadMessages(prev => prev + 1);
        }
      }, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.profile-menu')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      router.push('/');
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to sign out. Please try again.');
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Toggle profile dropdown
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Close profile dropdown
  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  // Determine active link styles
  const getLinkStyles = (path) => {
    const isActive = router.pathname === path || router.pathname.startsWith(`${path}/`);
    return {
      desktop: `px-3 py-2 rounded-md text-sm font-medium transition ${
        isActive 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
      }`,
      mobile: `block px-3 py-2 rounded-md text-base font-medium ${
        isActive 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
      }`
    };
  };

  // Navigation items with Chat added
  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={18} className="mr-1.5" /> },
    { path: '/projects', label: 'Projects', icon: <BookOpen size={18} className="mr-1.5" /> },
    { path: '/research', label: 'Research', icon: <FileText size={18} className="mr-1.5" /> },
    { 
      path: '/chat', 
      label: 'Chat', 
      icon: <MessageCircle size={18} className="mr-1.5" />,
      badge: unreadMessages > 0 ? unreadMessages : null 
    }
  ];

  // Main navbar classes based on scroll state
  const navbarClasses = `fixed w-full z-50 top-0 left-0 transition-all duration-300 ${
    isScrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm'
  }`;

  return (
    <nav className={navbarClasses}>
      {/* Error notification */}
      {error && (
        <div className="absolute top-16 left-0 right-0 mx-auto w-full max-w-md px-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded shadow-md flex justify-between items-center">
            <div className="flex items-center">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center" onClick={closeMenu}>
              <span className="text-blue-600 font-bold text-2xl">OS</span>
              <span className="text-gray-900 font-bold text-2xl">Hub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {/* Nav Links */}
            {navItems.map(item => (
              <Link 
                key={item.path}
                href={item.path}
                className={getLinkStyles(item.path).desktop}
              >
                <span className="flex items-center">
                  {item.icon}
                  {item.label}
                  {item.badge && (
                    <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </span>
              </Link>
            ))}
            
            {/* Search Bar */}
            <div className="relative mx-2">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </span>
              <input
                className="block w-full bg-gray-100 border border-transparent rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-blue-300 focus:ring-1 transition"
                placeholder="Search research..."
                type="search"
              />
            </div>
            
            {/* Auth Section */}
            {user ? (
              <div className="relative ml-3 profile-menu">
                {/* User Profile Button */}
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="flex items-center">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt={user.displayName || 'User profile'}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-full w-full p-1 text-gray-600" />
                      )}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-900 hidden sm:block">
                      {user.displayName || user.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown size={16} className="ml-1 text-gray-400" />
                  </div>
                </button>
                
                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 profile-menu">
                    <div 
                      className="py-1"
                      role="menu" 
                      aria-orientation="vertical" 
                      aria-labelledby="user-menu"
                    >
                      <div className="px-4 py-2 text-xs text-gray-500">
                        Signed in as
                        <div className="font-medium text-gray-900 truncate">
                          {user.email}
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100"></div>
                      
                      <Link 
                        href="/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={closeProfileMenu}
                      >
                        <Home size={16} className="mr-2 text-gray-500" />
                        Dashboard
                      </Link>
                      
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={closeProfileMenu}
                      >
                        <UserCircle size={16} className="mr-2 text-gray-500" />
                        Your Profile
                      </Link>
                      
                      <Link 
                        href="/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={closeProfileMenu}
                      >
                        <Settings size={16} className="mr-2 text-gray-500" />
                        Settings
                      </Link>
                      
                      <div className="border-t border-gray-100"></div>
                      
                      <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin h-4 w-4 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing out...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <LogOut size={16} className="mr-2 text-gray-500" />
                            Sign out
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition"
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
          {/* Nav Links */}
          {navItems.map(item => (
            <Link
              key={item.path}
              href={item.path}
              className={getLinkStyles(item.path).mobile}
              onClick={closeMenu}
            >
              <span className="flex items-center">
                {item.icon}
                {item.label}
                {item.badge && (
                  <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </span>
            </Link>
          ))}
          
          {/* Dashboard Link (authenticated only) */}
          {user && (
            <Link
              href="/dashboard"
              className={getLinkStyles('/dashboard').mobile}
              onClick={closeMenu}
            >
              <span className="flex items-center">
                <User size={18} className="mr-1.5" />
                Dashboard
              </span>
            </Link>
          )}
          
          {/* Mobile Search Bar */}
          <div className="px-3 py-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </span>
              <input
                className="block w-full bg-gray-100 border border-transparent rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-blue-300 focus:ring-1"
                placeholder="Search research..."
                type="search"
              />
            </div>
          </div>
          
          {/* Auth Section */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="px-3 space-y-3">
                {/* User info */}
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {user.photoURL ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={user.photoURL}
                          alt={user.displayName || 'User profile'}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-200">
                        <User size={24} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user.displayName || 'Scholar'}
                    </div>
                    <div className="text-sm font-medium text-gray-500 truncate max-w-[200px]">
                      {user.email}
                    </div>
                  </div>
                </div>
                
                {/* User actions */}
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
                    onClick={closeMenu}
                  >
                    <UserCircle size={18} className="mr-1.5" />
                    Your Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
                    onClick={closeMenu}
                  >
                    <Settings size={18} className="mr-1.5" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center">
                      <LogOut size={18} className="mr-1.5" />
                      {isLoading ? 'Signing out...' : 'Sign out'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-3 py-3 space-y-2">
                <Link
                  href="/auth/signin"
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={closeMenu}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={closeMenu}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 md:hidden z-40"
          onClick={closeMenu}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;