import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { AvatarProps } from '@/types';

const Avatar: React.FC<AvatarProps> = ({ 
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
  
  const imageSizes = {
    small: 32,
    medium: 40,
    large: 48
  };
  
  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-gray-200 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={imageSizes[size]}
          height={imageSizes[size]}
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