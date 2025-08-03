import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Input from '@/components/atoms/Input';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = 'Search...', 
  value: controlledValue, 
  onChange,
  className = '' 
}) => {
  const [internalValue, setInternalValue] = useState('');
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    } else {
      setInternalValue(e.target.value);
    }
  };
  return (
    <div className={`relative ${className}`}>
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        icon={<Search size={18} className="text-gray-400" />}
      />
    </div>
  );
};

export default SearchBar;