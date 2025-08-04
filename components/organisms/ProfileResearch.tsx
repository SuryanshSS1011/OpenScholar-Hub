// @/components/organisms/ProfileResearch.tsx
import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, PenSquare } from 'lucide-react';
import Link from 'next/link';

interface ProfileResearchProps {
  userId: string;
}

const ProfileResearch: React.FC<ProfileResearchProps> = ({ userId }) => {
  const [researchInterests, setResearchInterests] = useState<string[]>([
    'Artificial Intelligence',
    'Machine Learning',
    'Computer Vision'
  ]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newInterest, setNewInterest] = useState<string>('');
  
  const handleAddInterest = (): void => {
    if (newInterest.trim() !== '' && !researchInterests.includes(newInterest.trim())) {
      setResearchInterests([...researchInterests, newInterest.trim()]);
      setNewInterest('');
    }
  };
  
  const handleRemoveInterest = (interest: string): void => {
    setResearchInterests(researchInterests.filter(item => item !== interest));
  };

  const toggleEditing = (): void => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = (): void => {
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewInterest(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest();
    }
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Research Interests
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Areas of academic interest that will help personalize research recommendations
          </p>
        </div>
        <button
          onClick={toggleEditing}
          className="inline-flex items-center p-1.5 border border-transparent rounded-full text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PenSquare className="h-5 w-5" />
        </button>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {isEditing ? (
          <div>
            <div className="mb-4">
              <label htmlFor="research-interest" className="block text-sm font-medium text-gray-700 mb-1">
                Add Research Interest
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="research-interest"
                  value={newInterest}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., Quantum Computing"
                />
                <button
                  onClick={handleAddInterest}
                  disabled={!newInterest.trim()}
                  className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {researchInterests.map((interest) => (
                <div key={interest} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{interest}</span>
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveChanges}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div>
            {researchInterests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {researchInterests.map((interest) => (
                  <Link
                    key={interest}
                    href={`/research?q=${encodeURIComponent(interest)}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    {interest}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No research interests added yet.</p>
            )}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50">
        <Link
          href="/research"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
        >
          <BookOpen className="h-4 w-4 mr-1" />
          Explore research based on your interests
        </Link>
      </div>
    </div>
  );
};

export default ProfileResearch;