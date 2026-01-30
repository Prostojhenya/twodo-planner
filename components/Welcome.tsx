import React from 'react';
import { Layers, Sparkles } from 'lucide-react';

interface WelcomeProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-between py-20 px-6 animate-in fade-in duration-700">
      
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
        {/* Logo Animation */}
        <div className="relative mb-8 group">
           <div className="absolute inset-0 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse" />
           <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 rotate-3 transition-transform group-hover:rotate-12 duration-500">
              <Layers className="text-white w-12 h-12" strokeWidth={1.5} />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-black">
                 <Sparkles size={16} className="text-black" />
              </div>
           </div>
        </div>

        <div className="space-y-2">
            <h1 className="text-5xl font-black text-black tracking-tighter">TwoDo</h1>
            <p className="text-slate-400 font-medium text-lg">Синхронизируйте<br/>свою жизнь.</p>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <button 
          onClick={onStart}
          className="w-full py-5 bg-black text-white rounded-full font-black text-lg shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          НАЧАТЬ
        </button>
        <p className="text-center text-[10px] text-slate-300 font-mono uppercase tracking-widest">
            Planner for Couples
        </p>
      </div>
    </div>
  );
};