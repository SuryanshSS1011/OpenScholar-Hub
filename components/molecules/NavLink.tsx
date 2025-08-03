import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Badge from '@/components/atoms/Badge';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: number;
  isMobile?: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ 
  href, 
  children, 
  icon, 
  badge,
  isMobile = false,
  onClick 
}) => {
  const router = useRouter();
  const isActive = router.pathname === href || router.pathname.startsWith(`${href}/`);
  
  const classes = isMobile
    ? `block px-3 py-2 rounded-md text-base font-medium ${
        isActive 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
      }`
    : `px-3 py-2 rounded-md text-sm font-medium transition ${
        isActive 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
      }`;
  
  return (
    <Link href={href} className={classes} onClick={onClick}>
      <span className="flex items-center">
        {icon}
        {children}
        {badge && (
          <Badge variant="notification" size="small" className="ml-1.5">
            {badge}
          </Badge>
        )}
      </span>
    </Link>
  );
};

export default NavLink;