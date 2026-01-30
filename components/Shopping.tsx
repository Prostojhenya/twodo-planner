import React, { useState } from 'react';
import { ShoppingItem, Assignee, User } from '../types';
import { Card, AssigneeAvatar, SectionHeader } from './UI';
import { ShoppingCart, Plus, Trash2, Check, GripVertical } from 'lucide-react';

interface ShoppingProps {
  items: ShoppingItem[];
  addItem: (item: Omit<ShoppingItem, 'id' | 'isBought' | 'addedBy'>) => void;
  toggleItem: (id: string) => void;
  deleteItem: (id: string) => void;
  currentUser: User;
  partner: User;
}

export const ShoppingView: React.FC<ShoppingProps> = ({ items, addItem, toggleItem, deleteItem, currentUser, partner }) => {
  const [newItemTitle, setNewItemTitle] = useState('');
  
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    addItem({
      title: newItemTitle,
      category: 'General', 
    });
    setNewItemTitle('');
  };

  const boughtItems = items.filter(i => i.isBought);
  const activeItems = items.filter(i => !i.isBought);

  return (
    <div className="pt-8 px-6 pb-28">
      <div className="flex items-center gap-3 mb-8">
         <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_black]">
            <ShoppingCart size={24} className="text-black" />
         </div>
         <h1 className="text-3xl font-black text-black tracking-tight">Procurement<br/><span className="text-slate-400 text-lg font-medium">List</span></h1>
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
    </div>
  );
};