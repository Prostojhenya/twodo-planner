import React from 'react';
import { useSpaces } from './SpaceContext';

export const SpaceSelector: React.FC = () => {
  const { spaces, currentSpace, setCurrentSpace } = useSpaces();

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
      {spaces.map(space => (
        <button
          key={space.id}
          onClick={() => setCurrentSpace(space)}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all
            ${
              currentSpace?.id === space.id
                ? 'bg-black text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
        >
          {space.title}
        </button>
      ))}
    </div>
  );
};
