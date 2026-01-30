import React from 'react';
import { useCurrentSpaceId } from './useSpaceData';
import { Task, Note, Event, ShoppingItem } from '../types';

/**
 * HOC для автоматического добавления spaceId к создаваемым элементам
 * Это обеспечивает, что все новые данные привязываются к текущему пространству
 */

interface WithSpaceId {
  spaceId: string;
}

export const useSpaceAwareActions = () => {
  const currentSpaceId = useCurrentSpaceId();

  const withSpaceId = <T extends object>(item: T): T & WithSpaceId => {
    if (!currentSpaceId) {
      throw new Error('No active space. Cannot create items without a space.');
    }
    return { ...item, spaceId: currentSpaceId };
  };

  return { withSpaceId, currentSpaceId };
};
