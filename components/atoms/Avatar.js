import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

const Avatar = ({ 
  src, 
  alt = 'User avatar', 
  size = 'medium',
  className = '' 
}) => {
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };
  
  const iconSizes = {
    small: 20,
    medium: 24,
    large: 28
  };
  
  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-gray-200 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size === 'small' ? 32 : size === 'medium' ? 40 : 48}
          height={size === 'small' ? 32 : size === 'medium' ? 40 : 48}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <User size={iconSizes[size]} className="text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default Avatar;