import React, { useState } from 'react';
import { ShoppingItem, ShoppingList, Assignee, User } from '../types';
import { Card, AssigneeAvatar, SectionHeader, Modal, Input } from './UI';
import { ShoppingCart, Plus, Trash2, Check, GripVertical, FolderPlus, ChevronDown } from 'lucide-react';

interface ShoppingProps {
  items: ShoppingItem[];
  lists: ShoppingList[];
  activeListId: string;
  onSelectList: (listId: string) => void;
  onCreateList: (title: string, icon: string) => void;
  onDeleteList: (listId: string) => void;
  addItem: (item: Omit<ShoppingItem, 'id' | 'isBought' | 'addedBy'>) => void;
  toggleItem: (id: string) => void;
  deleteItem: (id: string) => void;
  currentUser: User;
  partner: User;
}

export const ShoppingView: React.FC<ShoppingProps> = ({ 
  items, 
  lists, 
  activeListId, 
  onSelectList, 
  onCreateList, 
  onDeleteList,
  addItem, 
  toggleItem, 
  deleteItem, 
  currentUser, 
  partner 
}) => {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListIcon, setNewListIcon] = useState('🛒');
  const [showListDropdown, setShowListDropdown] = useState(false);
  
  const activeList = lists.find(l => l.id === activeListId) || lists[0];
  
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    addItem({
      title: newItemTitle,
      category: 'General',
      listId: activeListId
    });
    setNewItemTitle('');
  };

  const handleCreateList = () => {
    if (!newListTitle.trim()) return;
    onCreateList(newListTitle, newListIcon);
    setIsListModalOpen(false);
    setNewListTitle('');
    setNewListIcon('🛒');
  };

  const boughtItems = items.filter(i => i.isBought);
  const activeItems = items.filter(i => !i.isBought);

  return (
    <div className="pt-8 px-6 pb-28">
      {/* Header with List Selector */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_black]">
              <ShoppingCart size={24} className="text-black" />
            </div>
            <h1 className="text-3xl font-black text-black tracking-tight">Shopping<br/><span className="text-slate-400 text-lg font-medium">Lists</span></h1>
          </div>
          <button
            onClick={() => setIsListModalOpen(true)}
            className="p-3 bg-black text-white rounded-full hover:scale-110 transition-transform"
          >
            <FolderPlus size={20} />
          </button>
        </div>

        {/* List Selector */}
        {lists.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowListDropdown(!showListDropdown)}
              className="w-full bg-white border-2 border-black rounded-xl p-4 flex items-center justify-between hover:shadow-[4px_4px_0px_black] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeList?.icon}</span>
                <span className="font-bold text-lg">{activeList?.title}</span>
              </div>
              <ChevronDown size={20} className={`transition-transform ${showListDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showListDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-black rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                {lists.map(list => (
                  <button
                    key={list.id}
                    onClick={() => {
                      onSelectList(list.id);
                      setShowListDropdown(false);
                    }}
                    className={`w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      list.id === activeListId ? 'bg-slate-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{list.icon}</span>
                      <span className="font-bold">{list.title}</span>
                    </div>
                    {lists.length > 1 && list.id !== lists[0].id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteList(list.id);
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Add Bar - Technical Style */}
      <div className="mb-10 relative">
          <div className="absolute inset-0 bg-black translate-y-1 translate-x-1 rounded-full opacity-10" />
          <div className="bg-white relative rounded-full border-2 border-black p-1.5 flex items-center">
            <form onSubmit={handleAdd} className="flex-1 flex items-center">
                <input
                    type="text"
                    placeholder="Input item..."
                    className="flex-1 bg-transparent border-none outline-none text-black font-bold placeholder:text-slate-300 px-4 h-12 text-lg font-mono"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                />
                <button 
                    type="submit"
                    disabled={!newItemTitle.trim()}
                    className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={24} />
                </button>
            </form>
          </div>
      </div>

      <div className="space-y-8">
        {/* Active Items */}
        {activeItems.length > 0 && (
          <div className="space-y-3">
             <div className="flex items-center gap-2 mb-2 opacity-50">
                <div className="w-1 h-1 bg-black rounded-full" />
                <div className="w-1 h-1 bg-black rounded-full" />
                <div className="w-1 h-1 bg-black rounded-full" />
                <span className="text-xs font-mono uppercase tracking-widest ml-2">Pending Acquisition</span>
             </div>
            
            {activeItems.map(item => (
              <div 
                key={item.id} 
                className="group relative"
              >
                {/* Connecting line segment */}
                <div className="absolute left-6 -top-4 -bottom-4 w-[1px] bg-slate-200 -z-10 group-first:top-4 group-last:bottom-1/2" />

                <div 
                  className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 flex items-center justify-between transition-all hover:bg-white hover:pl-6"
                >
                  <div 
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="w-5 h-5 rounded border-2 border-slate-300 group-hover:border-black transition-colors flex-shrink-0" />
                    <span className="text-black font-bold text-lg font-mono">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-4 pl-2">
                    <AssigneeAvatar assignee={item.addedBy} size="sm" user={currentUser} partner={partner} />
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bought Items */}
        {boughtItems.length > 0 && (
          <div className="space-y-3 pt-8 border-t-2 border-dashed border-slate-200">
             <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-2">Acquired</span>
            {boughtItems.map(item => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-2 opacity-40 hover:opacity-100 transition-opacity"
              >
                <div 
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white">
                      <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-black font-medium line-through decoration-2 font-mono">{item.title}</span>
                </div>
                <button 
                    onClick={() => deleteItem(item.id)}
                    className="text-slate-300 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for creating new list */}
      <Modal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} title="Новый список">
        <Input
          autoFocus
          label="Название"
          placeholder="Продукты, Хозтовары..."
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
        />
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Иконка</label>
          <div className="flex gap-2 flex-wrap">
            {['🛒', '🍎', '🏠', '🧹', '👕', '🎁', '🔧', '📚'].map(icon => (
              <button
                key={icon}
                onClick={() => setNewListIcon(icon)}
                className={`text-3xl p-3 rounded-xl border-2 transition-all ${
                  newListIcon === icon 
                    ? 'border-black bg-slate-100 scale-110' 
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleCreateList}
          disabled={!newListTitle.trim()}
          className="w-full bg-black text-white py-4 rounded-full font-bold disabled:opacity-50 hover:scale-105 transition-transform"
        >
          Создать список
        </button>
      </Modal>
    </div>
  );
};