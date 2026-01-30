import { useMemo } from 'react';
import { useSpaces } from './SpaceContext';
import { Task, Note, Event, ShoppingItem } from '../types';

/**
 * Хук для фильтрации данных по текущему пространству
 * Это ключевая интеграция Spaces с существующими данными
 */
export const useSpaceData = <T extends { spaceId?: string }>(items: T[]): T[] => {
  const { currentSpace } = useSpaces();

  return useMemo(() => {
    if (!currentSpace) return [];
    
    // Фильтруем только элементы текущего пространства
    // Для обратной совместимости: если spaceId не указан, показываем в первом пространстве
    return items.filter(item => 
      item.spaceId === currentSpace.id || 
      (!item.spaceId && currentSpace.type === 'personal')
    );
  }, [items, currentSpace]);
};

/**
 * Хук для получения ID текущего пространства (для создания новых элементов)
 */
export const useCurrentSpaceId = (): string | null => {
  const { currentSpace } = useSpaces();
  return currentSpace?.id || null;
};
