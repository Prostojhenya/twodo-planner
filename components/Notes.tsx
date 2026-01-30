import React, { useState } from 'react';
import { Note } from '../types';
import { Modal, Input, SectionHeader, FloatingActionButton } from './UI';
import { StickyNote, Plus, Trash2, PenLine, X, ArrowLeft } from 'lucide-react';

interface NotesProps {
  notes: Note[];
  addNote: (title: string, content: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  onBack: () => void;
}

export const NotesView: React.FC<NotesProps> = ({ notes, addNote, updateNote, deleteNote, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const openNewNote = () => {
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setIsModalOpen(true);
  };

  const openEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    if (editingNoteId) {
      updateNote(editingNoteId, { 
        title, 
        content,
        updatedAt: Date.now() 
      });
    } else {
      addNote(title, content);
    }
    setIsModalOpen(false);
  };

  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="pt-8 px-6 pb-28 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
            <button 
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-95"
            >
                <ArrowLeft size={18} />
            </button>
            <div className="flex-1">
                    <h2 className="text-3xl font-black text-black leading-none">General</h2>
                    <span className="text-xs text-slate-400 font-mono mt-1 block">Notes & Favorites</span>
            </div>
      </div>

      {sortedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 rotate-3">
            <StickyNote size={32} />
          </div>
          <p className="text-sm font-medium">Здесь пусто</p>
          <p className="text-xs mt-1">Запишите свои мысли</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 auto-rows-min">
          {sortedNotes.map((note) => (
            <div 
              key={note.id}
              onClick={() => openEditNote(note)}
              className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col gap-2 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all active:scale-95 group relative break-inside-avoid"
            >
               <h3 className={`font-bold text-lg leading-tight ${!note.title ? 'text-slate-400 italic' : 'text-black'}`}>
                 {note.title || 'Без названия'}
               </h3>
               <p className="text-sm text-slate-500 line-clamp-4 leading-relaxed font-medium">
                 {note.content || 'Нет описания'}
               </p>
               <div className="mt-2 pt-3 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] text-slate-300 font-mono">
                    {new Date(note.updatedAt).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="text-slate-200 hover:text-red-400 p-1 -mr-2 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      <FloatingActionButton onClick={openNewNote} icon={<Plus size={32} />} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingNoteId ? "Редактировать" : "Новая заметка"}>
         <div className="flex flex-col h-[60vh]">
            <Input 
              placeholder="Заголовок..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-bold text-xl !bg-transparent !px-0 border-b border-slate-100 rounded-none mb-4 focus:ring-0 placeholder:text-slate-300"
              autoFocus={!editingNoteId}
            />
            
            <textarea
              className="flex-1 w-full bg-transparent border-0 focus:ring-0 outline-none resize-none text-base leading-relaxed text-slate-700 placeholder:text-slate-300 font-medium"
              placeholder="Начните писать..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            <div className="pt-4 mt-auto">
               <button 
                onClick={handleSave}
                className="bg-black text-white w-full py-4 rounded-full font-black text-lg shadow-xl shadow-slate-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                СОХРАНИТЬ
              </button>
            </div>
         </div>
      </Modal>
    </div>
  );
};