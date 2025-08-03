import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import NavLink from '@/components/molecules/NavLink';
import SearchBar from '@/components/molecules/SearchBar';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';

interface MobileMenuProps {
  isOpen: boolean;
  navItems: Array<{
    path: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }>;
  user: any;
  onClose: () => void;
  onLogout: () => void;
  isLoading: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  navItems,
  user,
  onClose,
  onLogout,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen' : 'max-h-0'
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
              onClick={onClose}
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
              onClick={onClose}
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
                    onClick={onClose}
                  >
                    <User size={18} className="mr-1.5" />
                    Your Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center"
                    onClick={onClose}
                  >
                    <User size={18} className="mr-1.5" />
                    Settings
                  </Link>
                  <button
                    onClick={onLogout}
                    disabled={isLoading}
                    className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center">
                      <User size={18} className="mr-1.5" />
                      {isLoading ? 'Signing out...' : 'Sign out'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-3 py-3 space-y-2">
                <Link href="/auth/signin" onClick={onClose}>
                  <Button 
                    variant="primary" 
                    size="medium" 
                    className="w-full"
                    onClick={() => {}}
                    aria-label="Sign in"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={onClose}>
                  <Button 
                    variant="secondary" 
                    size="medium" 
                    className="w-full"
                    onClick={() => {}}
                    aria-label="Sign up"
                  >
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Backdrop for mobile menu */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 md:hidden z-40"
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  );
};

export default MobileMenu;