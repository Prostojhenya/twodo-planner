import React, { ReactNode, HTMLAttributes, InputHTMLAttributes } from 'react';
import { Assignee, Priority, User } from '../types';
import { User as UserIcon, Heart, CheckCircle2, Circle, Clock, Users } from 'lucide-react';

// --- Badges & Indicators ---

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  // Visualizing priority as node size/intensity instead of colored badges
  const sizeClass = {
    [Priority.LOW]: 'w-2 h-2 bg-slate-300',
    [Priority.MEDIUM]: 'w-3 h-3 bg-slate-500',
    [Priority.HIGH]: 'w-4 h-4 bg-black shadow-[0_0_10px_rgba(0,0,0,0.3)]',
  };

  const labels = {
    [Priority.LOW]: 'Low',
    [Priority.MEDIUM]: 'Med',
    [Priority.HIGH]: 'High',
  };

  return (
    <div className="flex items-center gap-2" title={`Priority: ${labels[priority]}`}>
      <div className={`rounded-full transition-all duration-300 ${sizeClass[priority]}`} />
    </div>
  );
};

interface AssigneeAvatarProps {
  assignee: Assignee;
  size?: 'sm' | 'md';
  user?: User;
  partner?: User;
}

export const AssigneeAvatar = ({ assignee, size = 'sm', user, partner }: AssigneeAvatarProps) => {
  const dimClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-12 h-12 text-sm';
  
  const hasUserSetup = !!user?.name;
  const hasPartnerSetup = !!partner?.name;

  // Render generic icon if setup is not done
  const renderContent = (isMe: boolean) => {
    if (isMe) {
        if (hasUserSetup) return user.initials;
        return <UserIcon size={size === 'sm' ? 14 : 18} />;
    } else {
        if (hasPartnerSetup) return partner.initials;
        return <UserIcon size={size === 'sm' ? 14 : 18} className="opacity-50" />;
    }
  };
  
  if (assignee === Assignee.ME) {
    return (
        <div className={`${dimClass} rounded-full bg-black text-white flex items-center justify-center font-bold shadow-lg border-2 border-white z-10`} title={user?.name || "Me"}>
            {renderContent(true)}
        </div>
    );
  }
  if (assignee === Assignee.PARTNER) {
    return (
        <div className={`${dimClass} rounded-full bg-white text-black flex items-center justify-center font-bold border-[3px] border-black shadow-sm z-10`} title={partner?.name || "Partner"}>
            {renderContent(false)}
        </div>
    );
  }
  // For 'BOTH', overlapping nodes
  return (
    <div className="flex -space-x-3">
         <div className={`${dimClass} rounded-full bg-black text-white flex items-center justify-center font-bold border-2 border-white shadow-lg z-20`}>
            {renderContent(true)}
        </div>
        <div className={`${dimClass} rounded-full bg-white text-black flex items-center justify-center font-bold border-[3px] border-black shadow-sm z-10`}>
            {renderContent(false)}
        </div>
    </div>
  );
};

// --- Layout Components ---

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card = ({ children, className = '', onClick, ...props }: CardProps) => (
  <div 
    onClick={onClick} 
    className={`bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] active:scale-[0.98]' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const SectionHeader = ({ title, action }: { title: string; action?: ReactNode }) => (
  <div className="flex items-center justify-between mb-8 px-2">
    <h2 className="text-3xl font-black text-black tracking-tight">{title}</h2>
    {action}
  </div>
);

export const FloatingActionButton = ({ onClick, icon }: { onClick: () => void; icon: ReactNode }) => (
  <button
    onClick={onClick}
    className="fixed bottom-24 right-5 md:bottom-28 md:right-8 w-16 h-16 bg-black text-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all hover:scale-110 active:scale-90 hover:rotate-90 z-40 flex items-center justify-center"
  >
    {icon}
  </button>
);

// --- Form Elements ---

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  autoFocus?: boolean;
  type?: string;
  value?: string | number | readonly string[];
  placeholder?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const Input = ({ label, className = '', ...props }: InputProps) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-bold text-black uppercase tracking-widest mb-1.5 ml-4">{label}</label>}
    <input
      className={`w-full px-6 py-3 rounded-full bg-slate-100 border-0 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium text-black placeholder:text-slate-400 ${className}`}
      {...props}
    />
  </div>
);

export const Select = ({ label, children, ...props }: React.ComponentPropsWithoutRef<'select'> & { label?: string }) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold text-black uppercase tracking-widest mb-1.5 ml-4">{label}</label>}
    <div className="relative">
      <select
        className="w-full px-6 py-3 rounded-full bg-slate-100 border-0 focus:bg-white focus:ring-2 focus:ring-black outline-none appearance-none transition-all font-medium text-black"
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-6 pointer-events-none text-black">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
      </div>
    </div>
  </div>
);

// --- Modal ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm max-h-[90dvh] flex flex-col rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-slate-50 flex-shrink-0 z-10 relative">
          <h3 className="font-black text-xl text-black ml-2">{title}</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 min-h-0 custom-scrollbar overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};