import React, { useState } from 'react';
import { useSpaces } from './SpaceContext';
import { Space, SpaceType } from '../types';
import { Plus, X } from 'lucide-react';

interface SpaceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpaceCreateModal: React.FC<SpaceCreateModalProps> = ({ isOpen, onClose }) => {
  const { addSpace } = useSpaces();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SpaceType>('personal');

  if (!isOpen) return null;

  const createSpace = () => {
    if (!title.trim()) return;

    const newSpace: Space = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addSpace(newSpace);
    setTitle('');
    setDescription('');
    setType('personal');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Новое пространство</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Например: Мы с Аней"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание (опционально)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Краткое описание пространства"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип пространства
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as SpaceType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="personal">Личное</option>
              <option value="shared">Совместное (пара/семья)</option>
              <option value="group">Группа / проект</option>
            </select>
          </div>

          <button
            onClick={createSpace}
            disabled={!title.trim()}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Создать пространство
          </button>
        </div>
      </div>
    </div>
  );
};

// Кнопка для открытия модалки
export const SpaceCreateButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-gray-300 transition-all"
      >
        <Plus size={16} />
        Новое пространство
      </button>
      <SpaceCreateModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
