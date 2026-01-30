import React, { createContext, useContext, useState, useEffect } from 'react';
import { Space } from '../types';

interface SpaceContextValue {
  spaces: Space[];
  currentSpace: Space | null;
  setCurrentSpace: (space: Space) => void;
  addSpace: (space: Space) => void;
}

const SpaceContext = createContext<SpaceContextValue | null>(null);

export const SpaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);

  // Инициализация: создаем дефолтное личное пространство
  useEffect(() => {
    if (spaces.length === 0) {
      const defaultSpace: Space = {
        id: crypto.randomUUID(),
        title: 'Я',
        type: 'personal',
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSpaces([defaultSpace]);
      setCurrentSpace(defaultSpace);
    }
  }, []);

  const addSpace = (space: Space) => {
    setSpaces(prev => [...prev, space]);
    setCurrentSpace(space);
  };

  return (
    <SpaceContext.Provider
      value={{
        spaces,
        currentSpace,
        setCurrentSpace,
        addSpace,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};

export const useSpaces = (): SpaceContextValue => {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error('useSpaces must be used within SpaceProvider');
  }
  return context;
};
