import React, { useState } from 'react';
import { Event, EventType } from '../types';
import { Card, Modal, Input, Select, SectionHeader } from './UI';
import { Calendar as CalIcon, MapPin, Sparkles, Loader2, Clock, ChevronLeft, ChevronRight, Locate, Map } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface EventsProps {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
}

const EventIcon = ({ type }: { type: EventType }) => {
  switch (type) {
    case EventType.BIRTHDAY: return <span className="text-2xl grayscale">🎂</span>;
    case EventType.DATE: return <span className="text-2xl grayscale">💕</span>;
    case EventType.TRIP: return <span className="text-2xl grayscale">✈️</span>;
    default: return <span className="text-2xl grayscale">📅</span>;
  }
};

export const EventsView: React.FC<EventsProps> = ({ events, addEvent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<EventType>(EventType.OTHER);
  const [description, setDescription] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  
  // Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  
  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);

  const openNewEvent = (initialDate?: string) => {
      // Default to today if no date provided
      const d = initialDate ? new Date(initialDate) : new Date();
      // Ensure we have YYYY-MM-DD
      const dateStr = d.toISOString().split('T')[0];
      
      setDate(dateStr);
      setTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
      setTitle('');
      setLocation('');
      setType(EventType.OTHER);
      setDescription('');
      setIsModalOpen(true);
  };

  const handleCreate = () => {
    addEvent({
      title,
      date: date || new Date().toISOString().split('T')[0],
      time,
      location,
      type,
      description
    });
    setIsModalOpen(false);
  };

  const handleAiSuggest = async () => {
    if (!title) return;
    setIsAiLoading(true);
    try {
      if (!process.env.API_KEY) {
        setDescription("API Key not configured. Please add API_KEY to environment.");
        setIsAiLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Suggest a short, fun plan (max 3 bullet points) for a couple's event titled "${title}". Language: Russian. Keep it romantic or fun.`,
      });
      setDescription(response.text.trim());
    } catch (error) {
      console.error("AI Error:", error);
      setDescription("Не удалось получить совет от AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGeoLocation = () => {
      if (!navigator.geolocation) {
          alert('Geolocation is not supported by this browser.');
          return;
      }
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              const coords = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
              setLocation((prev) => prev ? `${prev} (${coords})` : coords);
              setGeoLoading(false);
          },
          (error) => {
              console.error(error);
              alert('Unable to retrieve location.');
              setGeoLoading(false);
          }
      );
  };

  const openMap = () => {
     window.open('https://www.google.com/maps', '_blank');
  };

  // --- Calendar Logic ---
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonthDate(newDate);
  };

  const handleDateClick = (day: number) => {
    const year = currentMonthDate.getFullYear();
    const month = String(currentMonthDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    
    openNewEvent(dateStr);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 = Sunday
  };

  // --- Timeline Logic ---
  const getGroupLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Сегодня';
    if (d.toDateString() === tomorrow.toDateString()) return 'Завтра';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const hasEventOnDay = (day: number) => {
     const year = currentMonthDate.getFullYear();
     const month = String(currentMonthDate.getMonth() + 1).padStart(2, '0');
     const dayStr = String(day).padStart(2, '0');
     const checkDate = `${year}-${month}-${dayStr}`;
     return events.some(e => e.date === checkDate);
  };

  const isToday = (day: number) => {
      const today = new Date();
      return today.getDate() === day && 
             today.getMonth() === currentMonthDate.getMonth() && 
             today.getFullYear() === currentMonthDate.getFullYear();
  };

  return (
    <div className="pt-10 px-6 pb-28">
      <SectionHeader title="Календарь" />

      {/* --- Calendar Widget --- */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-xl font-black capitalize text-black">
                {currentMonthDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1">
                <button onClick={() => changeMonth(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-90 transition-all text-slate-500">
                    <ChevronLeft size={20} />
                </button>
                <button onClick={() => changeMonth(1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-90 transition-all text-slate-500">
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
        
        {/* Week Days */}
        <div className="grid grid-cols-7 mb-2">
            {['Вс','Пн','Вт','Ср','Чт','Пт','Сб'].map((d,i) => (
                <div key={i} className="text-center text-xs font-bold text-slate-300 uppercase tracking-wider py-2">{d}</div>
            ))}
        </div>
        
        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-2">
            {Array.from({ length: getFirstDayOfMonth(currentMonthDate) }).map((_, i) => <div key={`empty-${i}`} />)}
            
            {Array.from({ length: getDaysInMonth(currentMonthDate) }).map((_, i) => {
                const day = i + 1;
                const hasEvent = hasEventOnDay(day);
                const today = isToday(day);

                return (
                    <div key={day} className="flex flex-col items-center justify-center aspect-square">
                        <button 
                            onClick={() => handleDateClick(day)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all relative
                                ${today ? 'bg-black text-white shadow-lg scale-110' : 'hover:bg-slate-100 text-slate-700'}
                            `}
                        >
                            {day}
                            {hasEvent && !today && (
                                <div className="absolute bottom-1.5 w-1 h-1 bg-rose-500 rounded-full" />
                            )}
                            {hasEvent && today && (
                                <div className="absolute bottom-1.5 w-1 h-1 bg-white rounded-full" />
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
      </div>

      <h3 className="text-lg font-black mb-6 px-2 text-black">Таймлайн</h3>

      <div className="space-y-0">
        {sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CalIcon size={24} />
            </div>
            <p className="text-sm font-medium">Нет событий</p>
            <p className="text-xs mt-1">Нажмите на дату в календаре</p>
          </div>
        ) : (
          sortedEvents.map((event, index) => (
            <div key={event.id} className="relative pl-10 pb-12 last:pb-0 animate-in fade-in duration-700 slide-in-from-bottom-4 fill-mode-backwards" style={{ animationDelay: `${index * 100}ms` }}>
               {/* Timeline Line (Connection) */}
               {index !== sortedEvents.length - 1 && (
                 <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-slate-200" />
               )}
               
               {/* Timeline Node */}
               <div className="absolute left-0 top-3 w-8 h-8 rounded-full bg-black border-4 border-slate-50 shadow-lg z-10" />

               <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">{getGroupLabel(event.date)}</p>
                   
                   <Card className="!p-8 !rounded-[2.5rem] relative overflow-hidden group">
                     {/* Decorative background circle */}
                     <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-slate-50 opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                     
                     <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <EventIcon type={event.type} />
                                <h3 className="font-black text-2xl text-black">{event.title}</h3>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mb-6">
                            {event.time && (
                                <div className="flex items-center text-xs font-bold text-black bg-slate-100 px-4 py-2 rounded-full uppercase tracking-wider">
                                    <Clock size={12} className="mr-2" /> {event.time}
                                </div>
                            )}
                            {event.location && (
                                <div className="flex items-center text-xs font-bold text-black bg-slate-100 px-4 py-2 rounded-full uppercase tracking-wider">
                                    <MapPin size={12} className="mr-2" /> {event.location}
                                </div>
                            )}
                        </div>

                        {event.description && (
                        <div className="p-5 bg-slate-50 rounded-[1.5rem] text-sm text-slate-600 font-medium leading-relaxed border border-slate-100">
                            {event.description}
                        </div>
                        )}
                     </div>
                   </Card>
               </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Новое событие">
        <Input 
          label="Название" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Например: Годовщина"
          autoFocus
        />
        
        <div className="grid grid-cols-2 gap-4 mb-2">
          <Input 
            label="Дата" 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
          <Input 
            label="Время" 
            type="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)} 
          />
        </div>

        <Select label="Тип события" value={type} onChange={(e) => setType(e.target.value as EventType)}>
          <option value={EventType.DATE}>Свидание</option>
          <option value={EventType.BIRTHDAY}>День Рождения</option>
          <option value={EventType.TRIP}>Путешествие</option>
          <option value={EventType.OTHER}>Другое</option>
        </Select>

        <div className="mb-4">
             <label className="block text-xs font-bold text-black uppercase tracking-widest mb-1.5 ml-4">Место (Где?)</label>
             <div className="flex gap-2">
                 <input
                   className="flex-1 px-6 py-3 rounded-full bg-slate-100 border-0 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium text-black placeholder:text-slate-400"
                   value={location} 
                   onChange={(e) => setLocation(e.target.value)} 
                   placeholder="Ресторан, Парк..."
                 />
                 <button 
                    type="button"
                    onClick={handleGeoLocation}
                    disabled={geoLoading}
                    className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 hover:bg-black hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
                    title="Текущая позиция"
                 >
                     {geoLoading ? <Loader2 size={18} className="animate-spin" /> : <Locate size={18} />}
                 </button>
                 <button 
                    type="button"
                    onClick={openMap}
                    className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 hover:bg-black hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
                    title="Открыть карту"
                 >
                     <Map size={18} />
                 </button>
             </div>
        </div>

        <div className="mb-6">
            <div className="flex justify-between items-center mb-2 px-4">
                <label className="text-xs font-bold text-black uppercase tracking-widest">Детали</label>
                <button 
                  onClick={handleAiSuggest}
                  disabled={!title || isAiLoading}
                  className="text-[10px] flex items-center gap-1.5 text-white bg-black px-3 py-1.5 rounded-full font-bold uppercase tracking-wider hover:opacity-80 transition-all disabled:opacity-50"
                >
                  {isAiLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                  AI Generate
                </button>
            </div>
            <textarea 
                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-100 border-0 focus:bg-white focus:ring-2 focus:ring-black outline-none text-black font-medium h-24 resize-none transition-all placeholder:text-slate-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Заметки..."
            />
        </div>

        <button 
            onClick={handleCreate}
            disabled={!title}
            className="bg-black text-white w-full py-4 rounded-full font-black text-lg shadow-xl shadow-slate-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            ДОБАВИТЬ
        </button>
      </Modal>
    </div>
  );
};