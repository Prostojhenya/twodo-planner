import React, { useState, useMemo } from 'react';
import { Task, Cluster, Priority, Status, Assignee, ClusterColor, ClusterSize, User } from '../types';
import { Card, PriorityBadge, AssigneeAvatar, FloatingActionButton, Modal, Input, Select, SectionHeader } from './UI';
import { Plus, Check, Calendar as CalendarIcon, Hash, FolderPlus, Layers, Settings, Share2, Copy, Trash2, ArrowLeft, LayoutGrid, StickyNote } from 'lucide-react';

interface TasksProps {
  tasks: Task[];
  clusters: Cluster[];
  notesCount: number; // Added notesCount to display in General card
  currentClusterId: string | 'ALL' | 'GENERAL' | null;
  onSelectCluster: (id: string | 'ALL' | 'GENERAL' | null) => void;
  addCluster: (title: string, color: ClusterColor, size: ClusterSize, x?: number, y?: number) => void;
  updateCluster: (id: string, updates: Partial<Cluster>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  onRequestNewTask: () => void;
  onRequestNewCluster: () => void;
  currentUser: User;
  partner: User;
}

// --- Detail View Component ---

interface TaskListProps {
    title: string;
    items: Task[];
    clusters: Cluster[]; // Added to access colors for individual tasks
    color?: ClusterColor;
    onToggleTask: (task: Task) => void;
    onBack: () => void;
    onOpenSettings?: () => void;
    currentUser: User;
    partner: User;
}

const TaskList: React.FC<TaskListProps> = ({ title, items, clusters, color, onToggleTask, onBack, onOpenSettings, currentUser, partner }) => {
    
    // Helper to get dynamic styles based on cluster
    const getTaskStyles = (clusterId?: string) => {
        const cluster = clusters.find(c => c.id === clusterId);
        // General Tasks
        if (!cluster) return 'bg-white border-slate-100 hover:border-slate-300 text-slate-800';

        // Vibrant Solid Colors
        switch (cluster.color) {
            case 'rose': return 'bg-rose-500 border-rose-600 text-white shadow-rose-200';
            case 'blue': return 'bg-blue-500 border-blue-600 text-white shadow-blue-200';
            case 'emerald': return 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200';
            case 'amber': return 'bg-amber-500 border-amber-600 text-white shadow-amber-200';
            case 'violet': return 'bg-violet-500 border-violet-600 text-white shadow-violet-200';
            default: return 'bg-slate-500 border-slate-600 text-white shadow-slate-200';
        }
    };

    const getConnectorColor = (clusterId?: string) => {
        const cluster = clusters.find(c => c.id === clusterId);
        if (!cluster) return 'bg-slate-300 group-hover:bg-black';

        switch (cluster.color) {
            case 'rose': return 'bg-rose-300 group-hover:bg-rose-600';
            case 'blue': return 'bg-blue-300 group-hover:bg-blue-600';
            case 'emerald': return 'bg-emerald-300 group-hover:bg-emerald-600';
            case 'amber': return 'bg-amber-300 group-hover:bg-amber-600';
            case 'violet': return 'bg-violet-300 group-hover:bg-violet-600';
            default: return 'bg-slate-300 group-hover:bg-slate-600';
        }
    };

    const getDeadlineBadgeStyle = (clusterId?: string) => {
        const cluster = clusters.find(c => c.id === clusterId);
        if (!cluster) return 'text-rose-500 bg-rose-50'; // Standard style for general tasks
        return 'text-white bg-white/20'; // White translucent for vibrant backgrounds
    };

    return (
        <div className="animate-in slide-in-from-right-8 duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-95"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1">
                     <h2 className="text-3xl font-black text-black leading-none">{title}</h2>
                     <span className="text-xs text-slate-400 font-mono mt-1 block">{items.length} nodes connected</span>
                </div>
                {onOpenSettings && (
                    <button 
                        onClick={onOpenSettings}
                        className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-black hover:border-black transition-all"
                    >
                        <Settings size={18} />
                    </button>
                )}
            </div>

            {/* List */}
             <div className="relative pl-6 mb-8">
                {/* Backbone */}
                <div className="absolute left-0 top-3 bottom-0 w-[2px] opacity-20 rounded-full bg-black" />
                
                {items.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                            <LayoutGrid size={24} />
                        </div>
                        <p className="font-mono text-sm">No active nodes</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map(task => (
                            <div key={task.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards" style={{animationDelay: '0ms'}}>
                                {/* Connector */}
                                <div className={`absolute -left-6 top-1/2 w-4 h-[2px] transition-colors ${getConnectorColor(task.clusterId)}`} />
                                <div className={`absolute -left-2.5 top-1/2 -mt-1 w-2 h-2 rounded-full transition-colors ${getConnectorColor(task.clusterId)}`} />

                                <div 
                                    className={`
                                        backdrop-blur-sm border p-4 rounded-2xl shadow-sm transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer flex items-center justify-between gap-4 
                                        ${getTaskStyles(task.clusterId)}
                                        ${task.status === Status.DONE ? 'opacity-50 grayscale' : ''}
                                    `}
                                    onClick={() => onToggleTask(task)}
                                >
                                    <div className="flex-1 min-w-0">
                                        {/* Title: Inherit color for white text on vibrant backgrounds, or slate-800 on white */}
                                        <h4 className={`font-bold text-base truncate ${task.status === Status.DONE ? 'line-through decoration-2' : ''}`}>{task.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            {task.deadline && (
                                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${getDeadlineBadgeStyle(task.clusterId)}`}>
                                                    {new Date(task.deadline).toLocaleDateString('ru-RU', {day: 'numeric', month: 'numeric'})}
                                                </span>
                                            )}
                                            <PriorityBadge priority={task.priority} />
                                        </div>
                                    </div>
                                    
                                    {/* Only show Assignee Avatar if Partner exists (Collaboration Mode) */}
                                    {partner.name && (
                                        <AssigneeAvatar assignee={task.assignee} size="sm" user={currentUser} partner={partner} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Root View (Cluster Grid) ---

interface ClusterGridProps {
    clusters: Cluster[];
    tasks: Task[];
    allCount: number;
    notesCount: number; // Changed from generalCount
    onSelect: (id: string | 'ALL' | 'GENERAL') => void;
    onCreateCluster: () => void;
}

const ClusterGrid: React.FC<ClusterGridProps> = ({ clusters, tasks, allCount, notesCount, onSelect, onCreateCluster }) => {
    return (
        <div className="animate-in fade-in duration-500">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-black text-white rounded-2xl shadow-lg">
                        <Layers size={24} />
                    </div>
                    <h1 className="text-3xl font-black text-black tracking-tight">System<br/><span className="text-slate-400 text-lg font-medium">Nodes</span></h1>
                </div>
                
                <button 
                    onClick={onCreateCluster}
                    className="flex flex-col items-center justify-center w-14 h-14 bg-white border-2 border-slate-100 rounded-2xl shadow-sm hover:border-black hover:scale-105 transition-all active:scale-95"
                >
                    <FolderPlus size={20} className="text-black mb-1" />
                    <span className="text-[8px] font-bold uppercase tracking-wide">New</span>
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Master Node */}
                <div 
                    onClick={() => onSelect('ALL')}
                    className="col-span-2 bg-black text-white p-6 rounded-[2rem] shadow-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all relative overflow-hidden group"
                >
                     <div className="absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
                     <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Master Node</span>
                            <h3 className="text-2xl font-black">All Tasks</h3>
                        </div>
                        <span className="text-4xl font-black text-white/20">{allCount}</span>
                     </div>
                </div>

                {/* General (Notes) Node - Repurposed based on user request */}
                <div 
                    onClick={() => onSelect('GENERAL')}
                    className="bg-white border-4 border-slate-100 p-5 rounded-[2rem] shadow-sm cursor-pointer hover:border-slate-300 active:scale-[0.98] transition-all flex flex-col justify-between h-40"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <StickyNote size={18} className="text-slate-500" />
                    </div>
                    <div>
                        <span className="text-2xl font-black text-black block">{notesCount}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">General</span>
                    </div>
                </div>

                {/* Cluster Nodes */}
                {clusters.map(cluster => {
                    // Progress Calculation
                    const clusterTasks = tasks.filter(t => t.clusterId === cluster.id);
                    const totalTasks = clusterTasks.length;
                    const completedTasks = clusterTasks.filter(t => t.status === Status.DONE).length;
                    const activeTasks = totalTasks - completedTasks;
                    
                    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
                    const isCompleted = totalTasks > 0 && activeTasks === 0;

                    return (
                        <div 
                            key={cluster.id}
                            onClick={() => onSelect(cluster.id)}
                            className={`p-5 rounded-[2rem] shadow-md cursor-pointer border-4 border-white transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-40 
                                ${isCompleted 
                                    ? 'bg-slate-200 text-slate-400 border-slate-100' 
                                    : `text-white ${
                                          cluster.color === 'rose' ? 'bg-rose-500' : 
                                          cluster.color === 'blue' ? 'bg-blue-500' :
                                          cluster.color === 'emerald' ? 'bg-emerald-500' :
                                          cluster.color === 'amber' ? 'bg-amber-500' :
                                          cluster.color === 'violet' ? 'bg-violet-500' :
                                          'bg-slate-600'
                                    }`
                                }
                            `}
                        >
                            <div className="flex justify-between items-start">
                                 <div className={`w-3 h-3 rounded-full backdrop-blur-sm ${isCompleted ? 'bg-slate-300' : 'bg-white/50'}`} />
                            </div>
                            
                            <div className="w-full">
                                <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{cluster.title}</h3>
                                
                                <div className="flex items-end justify-between mb-2">
                                     <span className={`text-[10px] opacity-80 font-mono uppercase ${isCompleted ? 'text-slate-400' : 'text-white'}`}>
                                        {isCompleted ? 'Done' : `${activeTasks} left`}
                                     </span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${isCompleted ? 'bg-slate-400' : 'bg-white/90'}`}
                                        style={{ width: `${progressPercent}%` }} 
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Main Component ---

export const TasksView: React.FC<TasksProps> = ({ tasks, clusters, notesCount, currentClusterId, onSelectCluster, addCluster, updateCluster, updateTask, deleteTask, onRequestNewTask, onRequestNewCluster, currentUser, partner }) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Selected Cluster for Settings
  const [settingsCluster, setSettingsCluster] = useState<Cluster | null>(null);

  // Derived Data
  const unclusteredTasks = tasks.filter(t => !t.clusterId);
  
  // Active Data for Detail View
  const activeTasks = useMemo(() => {
      // In "ALL" view, do NOT show completed tasks
      if (currentClusterId === 'ALL') return tasks.filter(t => t.status !== Status.DONE);
      // GENERAL is now Notes, so we don't handle General Tasks in the detail view anymore.
      if (currentClusterId === 'GENERAL') return []; 
      return tasks.filter(t => t.clusterId === currentClusterId);
  }, [currentClusterId, tasks]);

  const activeCluster = clusters.find(c => c.id === currentClusterId);
  const pageTitle = currentClusterId === 'ALL' ? 'All Tasks' : activeCluster?.title || 'Unknown Cluster';

  // Handlers

  const toggleStatus = (task: Task) => {
    const newStatus = task.status === Status.DONE ? Status.TODO : Status.DONE;
    updateTask(task.id, { status: newStatus });
  };

  const openSettings = () => {
      if (activeCluster) {
          setSettingsCluster(activeCluster);
          setIsSettingsModalOpen(true);
      }
  };

  const copyInviteLink = () => {
    const link = `https://twodo.app/join/${settingsCluster?.id}`;
    navigator.clipboard.writeText(link);
    alert('Invite link copied!');
  };

  // Render Logic
  const isRootView = currentClusterId === null;

  return (
    <div className="pt-8 px-6 pb-28 min-h-screen">
      
      {isRootView ? (
          <ClusterGrid 
            clusters={clusters}
            tasks={tasks}
            allCount={tasks.filter(t => t.status !== Status.DONE).length} // Count only active tasks for "All Tasks" card
            notesCount={notesCount}
            onSelect={onSelectCluster}
            onCreateCluster={onRequestNewCluster}
          />
      ) : (
          <TaskList 
            title={pageTitle}
            items={activeTasks}
            clusters={clusters}
            color={activeCluster?.color}
            onToggleTask={toggleStatus}
            onBack={() => onSelectCluster(null)}
            onOpenSettings={activeCluster ? openSettings : undefined}
            currentUser={currentUser}
            partner={partner}
          />
      )}

      {/* Context-aware Floating Action Button */}
      {/* Show FAB when inside a specific list (but NOT 'ALL' and NOT root view) */}
      {!isRootView && currentClusterId !== 'ALL' && (
        <FloatingActionButton 
            onClick={onRequestNewTask} 
            icon={<Plus size={32} strokeWidth={3} />} 
        />
      )}

      {/* --- CLUSTER SETTINGS MODAL --- */}
      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Cluster Settings">
        {settingsCluster && (
            <div className="space-y-8">
                {/* Invite */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <label className="text-xs font-bold text-black uppercase tracking-widest mb-3 block">Collaborate</label>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white px-4 py-3 rounded-xl border border-slate-200 text-slate-500 text-sm font-mono truncate">
                            twodo.app/join/{settingsCluster.id}
                        </div>
                        <button onClick={copyInviteLink} className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                            <Copy size={18} />
                        </button>
                    </div>
                </div>

                {/* Appearance */}
                <div>
                     <label className="text-xs font-bold text-black uppercase tracking-widest mb-4 block">Color Identity</label>
                     <div className="flex gap-3 flex-wrap">
                         {(['slate', 'rose', 'blue', 'emerald', 'amber', 'violet'] as ClusterColor[]).map(color => (
                             <button 
                                key={color}
                                onClick={() => updateCluster(settingsCluster.id, { color })}
                                className={`w-10 h-10 rounded-full border-2 transition-all ${settingsCluster.color === color ? 'border-black scale-110' : 'border-transparent hover:scale-105'}`}
                             >
                                 <div className={`w-full h-full rounded-full border-2 border-white shadow-sm ${
                                     color === 'slate' ? 'bg-slate-600' : 
                                     color === 'rose' ? 'bg-rose-500' :
                                     color === 'blue' ? 'bg-blue-500' :
                                     color === 'emerald' ? 'bg-emerald-500' :
                                     color === 'amber' ? 'bg-amber-500' :
                                     'bg-violet-500'
                                 }`} />
                             </button>
                         ))}
                     </div>
                </div>
            </div>
        )}
      </Modal>

    </div>
  );
};