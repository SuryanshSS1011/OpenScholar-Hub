// @/components/molecules/UserMenu.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  Home, 
  UserCircle, 
  Settings, 
  LogOut 
} from 'lucide-react';
import Avatar from '@/components/atoms/Avatar';
import { User } from '@/types';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
  isLoading?: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, isLoading = false }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.user-menu')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = (): void => setIsOpen(!isOpen);
  const closeMenu = (): void => setIsOpen(false);

  const handleLogout = (): void => {
    closeMenu();
    onLogout();
  };

  const handleLinkClick = (): void => {
    closeMenu();
  };

  return (
    <div className="relative ml-3 user-menu">
      <button
        onClick={toggleMenu}
        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <span className="sr-only">Open user menu</span>
        <div className="flex items-center">
          <Avatar
            src={user.photoURL}
            alt={user.displayName || 'User profile'}
            size="small"
          />
          <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-900 hidden sm:block">
            {user.displayName || user.email?.split('@')[0] || 'User'}
          </span>
          <ChevronDown size={16} className="ml-1 text-gray-400" />
        </div>
      </button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
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
              onClick={handleLinkClick}
            >
              <Home size={16} className="mr-2 text-gray-500" />
              Dashboard
            </Link>
            
            <Link 
              href="/profile" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={handleLinkClick}
            >
              <UserCircle size={16} className="mr-2 text-gray-500" />
              Your Profile
            </Link>
            
            <Link 
              href="/settings" 
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={handleLinkClick}
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
  );
};

export default UserMenu;