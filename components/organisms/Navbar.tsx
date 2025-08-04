// @/components/organisms/Navbar.tsx - Updated with Chat Integration
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
  Settings,
  UserCircle,
  MessageCircle
} from 'lucide-react';
import Button from '@/components/atoms/Button';
import NavLink from '@/components/molecules/NavLink';
import SearchBar from '@/components/molecules/SearchBar';
import UserMenu from '@/components/molecules/UserMenu';
import Avatar from '@/components/atoms/Avatar';
import IconButton from '@/components/atoms/IconButton';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = (): void => {
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

  // Handle logout
  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logout();
      router.push('/');
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
  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu
  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

  const clearError = (): void => {
    setError(null);
  };

  // Navigation items with Chat added
  const navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: <Home size={18} className="mr-1.5" /> },
    { path: '/projects', label: 'Projects', icon: <BookOpen size={18} className="mr-1.5" /> },
    { path: '/research', label: 'Research', icon: <FileText size={18} className="mr-1.5" /> },
    { 
      path: '/chat', 
      label: 'Chat', 
      icon: <MessageCircle size={18} className="mr-1.5" />,
      badge: unreadMessages > 0 ? unreadMessages : undefined 
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
              onClick={clearError}
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
              <NavLink 
                key={item.path}
                href={item.path}
                icon={item.icon}
                badge={item.badge}
              >
                {item.label}
              </NavLink>
            ))}
            
            {/* Search Bar */}
            <SearchBar 
              placeholder="Search research..."
              className="mx-2 w-64"
            />
            
            {/* Auth Section */}
            {user ? (
              <UserMenu 
                user={user} 
                onLogout={handleLogout} 
                isLoading={isLoading} 
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="primary" size="medium">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="secondary" size="medium">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <IconButton
              icon={isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              onClick={toggleMenu}
              size="large"
              title={isMenuOpen ? 'Close menu' : 'Open menu'}
            />
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
            <NavLink
              key={item.path}
              href={item.path}
              icon={item.icon}
              badge={item.badge}
              isMobile={true}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
          
          {/* Dashboard Link (authenticated only) */}
          {user && (
            <NavLink
              href="/dashboard"
              icon={<User size={18} className="mr-1.5" />}
              isMobile={true}
              onClick={closeMenu}
            >
              Dashboard
            </NavLink>
          )}
          
          {/* Mobile Search Bar */}
          <div className="px-3 py-2">
            <SearchBar placeholder="Search research..." />
          </div>
          
          {/* Auth Section */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="px-3 space-y-3">
                {/* User info */}
                <div className="flex items-center">
                  <Avatar
                    src={user.photoURL}
                    alt={user.displayName || 'User profile'}
                    size="medium"
                  />
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
                <Link href="/auth/signin" onClick={closeMenu}>
                  <Button variant="primary" size="medium" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={closeMenu}>
                  <Button variant="secondary" size="medium" className="w-full">
                    Sign up
                  </Button>
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