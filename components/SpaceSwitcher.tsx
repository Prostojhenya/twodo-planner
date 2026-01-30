import React, { useState } from 'react';
import { Space } from '../types';
import { ChevronDown, Check, Plus } from 'lucide-react';

interface SpaceSwitcherProps {
  spaces: Space[];
  activeSpaceId: string;
  onSelectSpace: (spaceId: string) => void;
  onAddSpace: () => void;
}

export const SpaceSwitcher: React.FC<SpaceSwitcherProps> = ({
  spaces,
  activeSpaceId,
  onSelectSpace,
  onAddSpace
}) => {
  const [isSpaceMenuOpen, setIsSpaceMenuOpen] = useState(false);
  
  const activeSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];

  return (
    <div 
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[280px] pointer-events-none ignore-pan"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-[2rem] p-2 flex flex-col pointer-events-auto transition-all">
        
        {/* Главная кнопка с текущим пространством */}
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            setIsSpaceMenuOpen(!isSpaceMenuOpen); 
          }}
          className="w-full px-5 py-3 flex items-center justify-between rounded-2xl hover:bg-black/5 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl leading-none">{activeSpace.icon}</span>
            <span className="font-black text-black tracking-tight">{activeSpace.title}</span>
          </div>
          <ChevronDown 
            size={18} 
            className={`text-slate-400 transition-transform duration-300 ${isSpaceMenuOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {/* Выпадающий список */}
        {isSpaceMenuOpen && (
          <div className="mt-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="h-px bg-slate-100 mx-2 mb-1" />
            
            <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-1">
              {spaces.map(s => (
                <button
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSpace(s.id);
                    setIsSpaceMenuOpen(false);
                  }}
                  className={`w-full px-5 py-3 rounded-xl flex items-center justify-between transition-all group ${
                    s.id === activeSpaceId 
                      ? 'bg-black text-white' 
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="leading-none">{s.icon}</span>
                    <span className="font-bold text-sm">{s.title}</span>
                  </div>
                  {s.id === activeSpaceId ? (
                    <Check size={14} className="text-white" />
                  ) : s.type === 'shared' ? (
                    <span className="text-[9px] uppercase font-black opacity-30">Shared</span>
                  ) : null}
                </button>
              ))}
            </div>
            
            {/* Кнопка создания нового пространства */}
            <div className="h-px bg-slate-100 mx-2 mt-1" />
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onAddSpace(); 
                setIsSpaceMenuOpen(false); 
              }}
              className="w-full px-5 py-3 rounded-xl flex items-center gap-3 text-emerald-600 font-black text-sm hover:bg-emerald-50 transition-all"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Создать пространство</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
