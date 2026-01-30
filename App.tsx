import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useSupabaseData } from './lib/useSupabaseData';
import * as actions from './lib/supabaseActions';
import { AppState, User, Priority, Status, Assignee, ClusterColor, ClusterSize, SpaceType, Cluster, Task } from './types';
import { TasksView } from './components/Tasks';
import { ShoppingView } from './components/Shopping';
import { EventsView } from './components/Events';
import { DashboardView } from './components/Dashboard';
import { NotesView } from './components/Notes';
import { Auth } from './components/Auth';
import { LayoutGrid, CheckSquare, ShoppingBag, Calendar, Share2, Check } from 'lucide-react';
import { Modal, Input, Select } from './components/UI';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [activeSpaceId, setActiveSpaceId] = useState<string>('');
  
  // Load data from Supabase
  const { tasks: remoteTasks, clusters: remoteClusters, notes, events, shoppingList, spaces, partner, loading: dataLoading } = useSupabaseData(userId, activeSpaceId);

  // Local state for optimistic updates
  const [localClusters, setLocalClusters] = useState(remoteClusters);
  const [localTasks, setLocalTasks] = useState(remoteTasks);

  // Sync remote data to local state
  useEffect(() => {
    setLocalClusters(remoteClusters);
  }, [remoteClusters]);

  useEffect(() => {
    setLocalTasks(remoteTasks);
  }, [remoteTasks]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'notes' | 'shopping' | 'calendar'>('dashboard');
  const [currentClusterId, setCurrentClusterId] = useState<string | 'ALL' | 'GENERAL' | null>(null);
  const [dashboardViewState, setDashboardViewState] = useState({ x: 0, y: 0, scale: 1 });

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [targetClusterIdForTask, setTargetClusterIdForTask] = useState<string | undefined>(undefined);
  const [newTaskCoords, setNewTaskCoords] = useState<{x: number, y: number} | undefined>(undefined);
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [newClusterCoords, setNewClusterCoords] = useState<{x: number, y: number} | null>(null);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  // Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>(Priority.MEDIUM);
  const [newTaskAssignee, setNewTaskAssignee] = useState<Assignee>(Assignee.ME);
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newClusterTitle, setNewClusterTitle] = useState('');
  const [newClusterColor, setNewClusterColor] = useState<ClusterColor>('slate');
  const [newClusterSize, setNewClusterSize] = useState<ClusterSize>('md');
  const [newSpaceTitle, setNewSpaceTitle] = useState('');
  const [newSpaceIcon, setNewSpaceIcon] = useState('🏠');
  const [newSpaceType, setNewSpaceType] = useState<SpaceType>('personal');

  // Check auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadUserProfile(session.user.id);
      } else {
        setUserId(undefined);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set active space when spaces load
  useEffect(() => {
    if (spaces.length > 0 && !activeSpaceId) {
      setActiveSpaceId(spaces[0].id);
    }
  }, [spaces, activeSpaceId]);

  const loadUserProfile = async (uid: string) => {
    console.log('🔍 Loading user profile for:', uid);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .limit(1);

      console.log('📊 User profile response:', { data, error });

      if (error) {
        console.error('❌ Error loading user profile:', error);
        return;
      }

      if (data && data.length > 0) {
        const userData = data[0];
        console.log('✅ User profile loaded:', userData);
        setUser({
          id: userData.id,
          name: userData.name,
          initials: userData.initials,
          avatarColor: userData.avatar_color
        });
      } else {
        console.warn('⚠️ No user profile found for:', uid);
      }
    } catch (err) {
      console.error('💥 Failed to load user profile:', err);
    }
  };

  // Actions
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !activeSpaceId) return;

    let finalX = newTaskCoords?.x;
    let finalY = newTaskCoords?.y;

    if (!finalX && targetClusterIdForTask) {
      const cluster = localClusters.find(c => c.id === targetClusterIdForTask);
      if (cluster) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = 12 + Math.random() * 6;
        finalX = cluster.x + Math.cos(angle) * radius;
        finalY = cluster.y + Math.sin(angle) * radius;
        finalX = Math.max(5, Math.min(95, finalX));
        finalY = Math.max(5, Math.min(95, finalY));
      }
    } else if (!finalX) {
      finalX = 50 + (Math.random() - 0.5) * 30;
      finalY = 50 + (Math.random() - 0.5) * 30;
    }

    // Create temporary task for optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempTask: Task = {
      id: tempId,
      title: newTaskTitle,
      priority: newTaskPriority,
      assignee: newTaskAssignee,
      status: Status.TODO,
      deadline: newTaskDeadline || undefined,
      clusterId: targetClusterIdForTask,
      x: finalX,
      y: finalY,
      createdAt: Date.now(),
      spaceId: activeSpaceId
    };

    // Optimistic update - show immediately
    setLocalTasks(prev => [...prev, tempTask]);
    setIsTaskModalOpen(false);
    setNewTaskTitle('');
    setNewTaskCoords(undefined);
    setTargetClusterIdForTask(undefined);

    // Background DB create
    try {
      const newTask = await actions.createTask(activeSpaceId, {
        title: newTaskTitle,
        priority: newTaskPriority,
        assignee: newTaskAssignee,
        status: Status.TODO,
        deadline: newTaskDeadline || undefined,
        clusterId: targetClusterIdForTask,
        x: finalX,
        y: finalY,
      });
      
      // Replace temp with real
      setLocalTasks(prev => prev.map(t => t.id === tempId ? { ...tempTask, id: newTask.id } : t));
    } catch (err) {
      console.error('Error creating task:', err);
      // Remove temp on error
      setLocalTasks(prev => prev.filter(t => t.id !== tempId));
    }
  };

  // Optimistic action wrappers
  const handleUpdateCluster = async (id: string, updates: Partial<Cluster>) => {
    // Optimistic update
    setLocalClusters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    
    // Background DB update
    try {
      await actions.updateCluster(id, updates);
    } catch (err) {
      console.error('Error updating cluster:', err);
      // Revert on error
      setLocalClusters(remoteClusters);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    // Optimistic update
    setLocalTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    
    // Background DB update
    try {
      await actions.updateTask(id, updates);
    } catch (err) {
      console.error('Error updating task:', err);
      // Revert on error
      setLocalTasks(remoteTasks);
    }
  };

  const handleDeleteTask = async (id: string) => {
    // Optimistic delete
    setLocalTasks(prev => prev.filter(t => t.id !== id));
    
    // Background DB delete
    try {
      await actions.deleteTask(id);
    } catch (err) {
      console.error('Error deleting task:', err);
      // Revert on error
      setLocalTasks(remoteTasks);
    }
  };

  const handleCreateCluster = async () => {
    if (!newClusterTitle.trim() || !activeSpaceId) return;
    
    // Create temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempCluster: Cluster = {
      id: tempId,
      title: newClusterTitle,
      color: newClusterColor,
      size: newClusterSize,
      x: newClusterCoords?.x ?? 50,
      y: newClusterCoords?.y ?? 20,
      createdAt: Date.now(),
      spaceId: activeSpaceId
    };
    
    // Optimistic update
    setLocalClusters(prev => [...prev, tempCluster]);
    setIsClusterModalOpen(false);
    setNewClusterTitle('');
    setNewClusterCoords(null);
    
    // Background DB create
    try {
      const newCluster = await actions.createCluster(activeSpaceId, newClusterTitle, newClusterColor, newClusterSize, newClusterCoords?.x, newClusterCoords?.y);
      // Replace temp with real
      setLocalClusters(prev => prev.map(c => c.id === tempId ? { ...tempCluster, id: newCluster.id } : c));
    } catch (err) {
      console.error('Error creating cluster:', err);
      // Remove temp on error
      setLocalClusters(prev => prev.filter(c => c.id !== tempId));
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpaceTitle.trim() || !userId) return;
    const newSpace = await actions.createSpace(userId, newSpaceTitle, newSpaceIcon, newSpaceType);
    setActiveSpaceId(newSpace.id);
    setIsSpaceModalOpen(false);
  };

  const handleCopyInvite = () => {
    if (!userId) return;
    const inviteCode = btoa(userId + ':invite').replace(/=/g, '');
    const inviteLink = `${window.location.origin}${window.location.pathname}#/invite/${inviteCode}`;
    
    navigator.clipboard.writeText(inviteLink).then(() => {
      setInviteLinkCopied(true);
      setTimeout(() => setInviteLinkCopied(false), 3000);
    });
  };

  // Handle invite acceptance
  useEffect(() => {
    const hash = window.location.hash;
    const inviteMatch = hash.match(/#\/invite\/([^\/]+)/);
    
    if (inviteMatch && inviteMatch[1] && userId) {
      const inviteCode = inviteMatch[1];
      
      try {
        const decoded = atob(inviteCode);
        const [inviterId] = decoded.split(':');
        
        const accept = window.confirm(
          `Вы хотите присоединиться к пространству партнёра?\n\nВаше имя: ${user?.name}\n\nПосле принятия вы станете партнёрами.`
        );
        
        if (accept && inviterId) {
          // Find shared space of inviter
          supabase
            .from('spaces')
            .select('id')
            .eq('owner_id', inviterId)
            .eq('type', 'shared')
            .limit(1)
            .single()
            .then(({ data }) => {
              if (data) {
                actions.addPartnerToSpace(data.id, userId).then(() => {
                  alert('Вы присоединились! Теперь вы партнёры.');
                  window.location.hash = '#/';
                });
              }
            });
        } else {
          window.location.hash = '#/';
        }
      } catch (e) {
        console.error('Invalid invite code:', e);
        window.location.hash = '#/';
      }
    }
  }, [userId, user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (!userId) {
    return <Auth onAuthSuccess={() => setLoading(false)} />;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка профиля...</div>;
  }

  const appState: AppState = {
    tasks: localTasks,
    clusters: localClusters,
    notes,
    shoppingList,
    events,
    currentUser: user,
    partner: partner || { id: 'u2', name: '', initials: '', avatarColor: 'rose' },
  };

  const NavItem = ({ id, icon, label }: { id: typeof activeTab, icon: React.ReactNode, label: string }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => {
          setActiveTab(id);
          if (id === 'tasks') setCurrentClusterId(null);
        }}
        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${isActive ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:text-black hover:bg-white'}`}
      >
        {icon}
      </button>
    );
  };

  return (
    <HashRouter>
      <div className="min-h-screen font-sans text-black">
        <main className={`relative min-h-screen ${activeTab === 'dashboard' ? 'w-full h-screen overflow-hidden' : 'max-w-md mx-auto pb-32'}`}>
          {activeTab === 'dashboard' && 
            <DashboardView 
              state={appState} 
              viewState={dashboardViewState}
              onViewStateChange={setDashboardViewState}
              onNavigate={setActiveTab}
              onSelectCluster={setCurrentClusterId}
              onUpdateCluster={handleUpdateCluster}
              onRequestNewCluster={(coords) => {
                setNewClusterCoords(coords || null);
                setIsClusterModalOpen(true);
              }}
              onRequestNewTask={(clusterId, coords) => {
                setTargetClusterIdForTask(clusterId);
                setNewTaskCoords(coords);
                setIsTaskModalOpen(true);
              }}
              onUpdateTask={handleUpdateTask}
              onHubClick={() => {}}
              spaces={spaces}
              activeSpaceId={activeSpaceId}
              onSelectSpace={setActiveSpaceId}
              onAddSpace={() => setIsSpaceModalOpen(true)}
            />
          }
          {activeTab === 'tasks' && 
            <TasksView 
              tasks={tasks}
              clusters={clusters}
              currentUser={user}
              partner={partner || { id: 'u2', name: '', initials: '', avatarColor: 'rose' }}
              notesCount={notes.length}
              currentClusterId={currentClusterId}
              onSelectCluster={(id) => {
                if (id === 'GENERAL') setActiveTab('notes');
                else setCurrentClusterId(id);
              }}
              addCluster={async (title, color, size) => {
                if (!activeSpaceId) return;
                
                // Create temporary cluster
                const tempId = `temp-${Date.now()}`;
                const tempCluster: Cluster = {
                  id: tempId,
                  title,
                  color,
                  size,
                  x: 50,
                  y: 20,
                  createdAt: Date.now(),
                  spaceId: activeSpaceId
                };
                
                // Optimistic update
                setLocalClusters(prev => [...prev, tempCluster]);
                
                // Background DB create
                try {
                  const newCluster = await actions.createCluster(activeSpaceId, title, color, size);
                  setLocalClusters(prev => prev.map(c => c.id === tempId ? { ...tempCluster, id: newCluster.id } : c));
                } catch (err) {
                  console.error('Error creating cluster:', err);
                  setLocalClusters(prev => prev.filter(c => c.id !== tempId));
                }
              }}
              updateCluster={handleUpdateCluster}
              updateTask={handleUpdateTask}
              deleteTask={handleDeleteTask}
              onRequestNewTask={() => {
                setTargetClusterIdForTask(currentClusterId && currentClusterId !== 'ALL' && currentClusterId !== 'GENERAL' ? currentClusterId : undefined);
                setIsTaskModalOpen(true);
              }}
              onRequestNewCluster={() => setIsClusterModalOpen(true)}
            />
          }
          {activeTab === 'notes' &&
            <NotesView
              notes={notes}
              addNote={async (title, content) => {
                if (activeSpaceId) await actions.createNote(activeSpaceId, title, content);
              }}
              updateNote={(id, updates) => actions.updateNote(id, updates)}
              deleteNote={(id) => actions.deleteNote(id)}
              onBack={() => setActiveTab('tasks')}
            />
          }
          {activeTab === 'shopping' && 
            <ShoppingView 
              items={shoppingList}
              addItem={async (item) => {
                if (activeSpaceId) await actions.createShoppingItem(activeSpaceId, item.title, item.category);
              }}
              toggleItem={(id) => {
                const item = shoppingList.find(i => i.id === id);
                if (item) actions.toggleShoppingItem(id, item.isBought);
              }}
              deleteItem={(id) => actions.deleteShoppingItem(id)}
              currentUser={user}
              partner={partner || { id: 'u2', name: '', initials: '', avatarColor: 'rose' }}
            />
          }
          {activeTab === 'calendar' && 
            <EventsView 
              events={events}
              addEvent={async (event) => {
                if (activeSpaceId) await actions.createEvent(activeSpaceId, event);
              }}
            />
          }
        </main>

        {/* Navigation */}
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <nav className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-full px-8 py-3 pointer-events-auto flex items-center gap-6">
            <NavItem id="dashboard" icon={<LayoutGrid size={22} strokeWidth={2.5} />} label="Главная" />
            <NavItem id="tasks" icon={<CheckSquare size={22} strokeWidth={2.5} />} label="Задачи" />
            <NavItem id="shopping" icon={<ShoppingBag size={22} strokeWidth={2.5} />} label="Покупки" />
            <NavItem id="calendar" icon={<Calendar size={22} strokeWidth={2.5} />} label="События" />
          </nav>
        </div>

        {/* Modals */}
        <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Новая задача">
          <Input autoFocus label="Название" placeholder="Название задачи..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-6 mb-2">
            <Select label="Приоритет" value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as Priority)}>
              <option value={Priority.LOW}>Низкий</option>
              <option value={Priority.MEDIUM}>Средний</option>
              <option value={Priority.HIGH}>Высокий</option>
            </Select>
            {partner?.name && (
              <Select label="Исполнитель" value={newTaskAssignee} onChange={(e) => setNewTaskAssignee(e.target.value as Assignee)}>
                <option value={Assignee.ME}>{user.name}</option>
                <option value={Assignee.PARTNER}>{partner.name}</option>
                <option value={Assignee.BOTH}>Вместе</option>
              </Select>
            )}
          </div>
          <Input label="Дедлайн" type="date" value={newTaskDeadline} onChange={(e) => setNewTaskDeadline(e.target.value)} />
          <div className="mt-10">
            <button onClick={handleCreateTask} disabled={!newTaskTitle.trim()} className="bg-black text-white w-full py-5 rounded-full font-black text-lg shadow-xl disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all">
              СОЗДАТЬ ЗАДАЧУ
            </button>
          </div>
        </Modal>

        <Modal isOpen={isClusterModalOpen} onClose={() => setIsClusterModalOpen(false)} title="Новый кластер">
          <Input autoFocus placeholder="Название кластера" value={newClusterTitle} onChange={(e) => setNewClusterTitle(e.target.value)} className="text-center" />
          <div className="flex flex-col items-center gap-3">
            <label className="text-xs font-bold uppercase">Цвет</label>
            <div className="flex gap-4">
              {(['slate', 'rose', 'blue', 'emerald', 'amber', 'violet'] as ClusterColor[]).map(color => (
                <button key={color} onClick={() => setNewClusterColor(color)} className={`w-10 h-10 rounded-full ${newClusterColor === color ? 'ring-2 ring-black ring-offset-2' : ''}`}>
                  <div className={`w-full h-full rounded-full ${color === 'slate' ? 'bg-slate-600' : color === 'rose' ? 'bg-rose-500' : color === 'blue' ? 'bg-blue-500' : color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : 'bg-violet-500'}`} />
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleCreateCluster} disabled={!newClusterTitle.trim()} className="bg-black text-white w-full py-5 rounded-full font-black mt-4">СОЗДАТЬ</button>
        </Modal>

        <Modal isOpen={isSpaceModalOpen} onClose={() => setIsSpaceModalOpen(false)} title="Новое пространство">
          <Input autoFocus placeholder="Название" value={newSpaceTitle} onChange={(e) => setNewSpaceTitle(e.target.value)} />
          <Input placeholder="🏠" value={newSpaceIcon} onChange={(e) => setNewSpaceIcon(e.target.value)} maxLength={2} />
          <Select value={newSpaceType} onChange={(e) => setNewSpaceType(e.target.value as SpaceType)}>
            <option value="personal">Личное</option>
            <option value="shared">Общее</option>
          </Select>
          <button onClick={handleCreateSpace} disabled={!newSpaceTitle.trim()} className="bg-black text-white w-full py-5 rounded-full font-black mt-4">СОЗДАТЬ</button>
        </Modal>

        <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Пригласить партнёра">
          <div className="text-center mb-4">
            <Share2 size={48} className="mx-auto text-indigo-500" />
            <p className="text-sm text-slate-600 mt-2">Отправьте эту ссылку партнёру</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl mb-4">
            <div className="bg-white p-3 rounded-lg text-xs font-mono break-all">
              {window.location.origin}{window.location.pathname}#/invite/{userId ? btoa(userId + ':invite').replace(/=/g, '') : ''}
            </div>
          </div>
          <button onClick={handleCopyInvite} className={`w-full py-4 rounded-xl font-bold ${inviteLinkCopied ? 'bg-green-500 text-white' : 'bg-black text-white'}`}>
            {inviteLinkCopied ? <><Check size={16} /> Скопировано!</> : 'Скопировать ссылку'}
          </button>
        </Modal>
      </div>
    </HashRouter>
  );
};

export default App;
