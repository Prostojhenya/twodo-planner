import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom'; // Using HashRouter strictly as per instructions for URL safety
import { AppState, Task, Event, Note, ShoppingItem, User, Priority, Status, Assignee, EventType, Cluster, ClusterColor, ClusterSize, Space, SpaceType } from './types';
import { TasksView } from './components/Tasks';
import { ShoppingView } from './components/Shopping';
import { EventsView } from './components/Events';
import { DashboardView } from './components/Dashboard';
import { NotesView } from './components/Notes';
import { WelcomeScreen } from './components/Welcome';
import { LayoutGrid, CheckSquare, ShoppingBag, Calendar, Copy, Share2, StickyNote, Check } from 'lucide-react';
import { Modal, Input, Select } from './components/UI';

// --- CLEAN SLATE INITIAL DATA ---
const INITIAL_CLUSTERS: Cluster[] = [];
const INITIAL_TASKS: Task[] = [];
const INITIAL_NOTES: Note[] = [];
const INITIAL_SHOPPING: ShoppingItem[] = [];
const INITIAL_EVENTS: Event[] = [];
const INITIAL_SPACES: Space[] = [
  { id: 's1', title: 'Пара', icon: '💑', type: 'shared', createdAt: Date.now() },
  { id: 's2', title: 'Личное', icon: '👤', type: 'personal', createdAt: Date.now() }
];

// Helper to load state from Local Storage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.warn(`Failed to load ${key} from storage`, e);
    return fallback;
  }
};

const App = () => {
  // Onboarding State
  // 'welcome': Intro screen
  // 'app': Main app (which might be in 'setup' mode if no user data)
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'app'>(() => {
      const onboarded = localStorage.getItem('twodo_onboarded_v2'); 
      return onboarded === 'true' ? 'app' : 'welcome';
  });

  // State Management with Persistence
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('twodo_tasks', INITIAL_TASKS));
  const [clusters, setClusters] = useState<Cluster[]>(() => loadFromStorage('twodo_clusters', INITIAL_CLUSTERS));
  const [notes, setNotes] = useState<Note[]>(() => loadFromStorage('twodo_notes', INITIAL_NOTES));
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => loadFromStorage('twodo_shopping', INITIAL_SHOPPING));
  const [events, setEvents] = useState<Event[]>(() => loadFromStorage('twodo_events', INITIAL_EVENTS));
  const [spaces, setSpaces] = useState<Space[]>(() => loadFromStorage('twodo_spaces', INITIAL_SPACES));
  const [activeSpaceId, setActiveSpaceId] = useState<string>(() => loadFromStorage('twodo_active_space', 's1'));
  
  const [user, setUser] = useState<User>(() => loadFromStorage('twodo_user', { id: 'u1', name: '', initials: '', avatarColor: 'indigo' }));
  const [partner, setPartner] = useState<User>(() => loadFromStorage('twodo_partner', { id: 'u2', name: '', initials: '', avatarColor: 'rose' }));

  const isSetupDone = !!user.name;

  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'notes' | 'shopping' | 'calendar'>('dashboard');
  
  // View State (Dashboard position & zoom)
  const [dashboardViewState, setDashboardViewState] = useState(() => 
    loadFromStorage('twodo_view_state', { x: 0, y: 0, scale: 1 })
  );
  
  // Persistence Effects
  useEffect(() => { if (isSetupDone) localStorage.setItem('twodo_tasks', JSON.stringify(tasks)); }, [tasks, isSetupDone]);
  useEffect(() => { if (isSetupDone) localStorage.setItem('twodo_clusters', JSON.stringify(clusters)); }, [clusters, isSetupDone]);
  useEffect(() => { if (isSetupDone) localStorage.setItem('twodo_notes', JSON.stringify(notes)); }, [notes, isSetupDone]);
  useEffect(() => { if (isSetupDone) localStorage.setItem('twodo_shopping', JSON.stringify(shoppingList)); }, [shoppingList, isSetupDone]);
  useEffect(() => { if (isSetupDone) localStorage.setItem('twodo_events', JSON.stringify(events)); }, [events, isSetupDone]);
  useEffect(() => { if (isSetupDone) localStorage.setItem('twodo_spaces', JSON.stringify(spaces)); }, [spaces, isSetupDone]);
  useEffect(() => { localStorage.setItem('twodo_active_space', activeSpaceId); }, [activeSpaceId]);
  useEffect(() => { localStorage.setItem('twodo_view_state', JSON.stringify(dashboardViewState)); }, [dashboardViewState]);
  useEffect(() => { localStorage.setItem('twodo_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('twodo_partner', JSON.stringify(partner)); }, [partner]);

  
  // 'ALL' = Show all tasks, 'GENERAL' = Show unclustered, 'c1' = Show specific cluster, null = Show cluster grid
  const [currentClusterId, setCurrentClusterId] = useState<string | 'ALL' | 'GENERAL' | null>(null);

  // --- Modal State ---
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [targetClusterIdForTask, setTargetClusterIdForTask] = useState<string | undefined>(undefined);
  const [newTaskCoords, setNewTaskCoords] = useState<{x: number, y: number} | undefined>(undefined);
  
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [newClusterCoords, setNewClusterCoords] = useState<{x: number, y: number} | null>(null);

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  
  // Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>(Priority.MEDIUM);
  // Default to ME (Private) until user explicitly selects otherwise or invite partner
  const [newTaskAssignee, setNewTaskAssignee] = useState<Assignee>(Assignee.ME);
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  
  const [newClusterTitle, setNewClusterTitle] = useState('');
  const [newClusterColor, setNewClusterColor] = useState<ClusterColor>('slate');
  const [newClusterSize, setNewClusterSize] = useState<ClusterSize>('md');

  const [newSpaceTitle, setNewSpaceTitle] = useState('');
  const [newSpaceIcon, setNewSpaceIcon] = useState('🏠');
  const [newSpaceType, setNewSpaceType] = useState<SpaceType>('personal');

  // Setup Form State
  const [setupUserName, setSetupUserName] = useState(user.name || '');

  // --- Onboarding Logic ---
  const handleStartWelcome = () => {
    // Clear any old data to ensure "Empty" state
    setTasks([]);
    setClusters([]);
    setNotes([]);
    setShoppingList([]);
    setEvents([]);
    
    // Also clear specific local storage keys to prevent ghost data
    localStorage.removeItem('twodo_tasks');
    localStorage.removeItem('twodo_clusters');
    localStorage.removeItem('twodo_notes');
    localStorage.removeItem('twodo_shopping');
    localStorage.removeItem('twodo_events');
    
    setOnboardingStep('app');
    // IMMEDIATELY prompt for setup
    setIsSetupModalOpen(true);
  };

  const handleFinishSetup = () => {
    if (!setupUserName.trim()) return;

    setUser(prev => ({ ...prev, name: setupUserName, initials: setupUserName.charAt(0).toUpperCase() }));
    // We don't force partner setup here anymore
    
    localStorage.setItem('twodo_onboarded_v2', 'true');
    setIsSetupModalOpen(false);
  };

  const handleCopyInvite = () => {
      // Generate unique invite code based on user ID
      const inviteCode = btoa(user.id + ':' + Date.now()).replace(/=/g, '');
      const inviteLink = `${window.location.origin}${window.location.pathname}#/invite/${inviteCode}`;
      
      navigator.clipboard.writeText(inviteLink).then(() => {
          setInviteLinkCopied(true);
          setTimeout(() => setInviteLinkCopied(false), 3000);
      }).catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = inviteLink;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setInviteLinkCopied(true);
          setTimeout(() => setInviteLinkCopied(false), 3000);
      });
  };

  const openInviteModal = () => {
      setIsInviteModalOpen(true);
      setInviteLinkCopied(false);
  };

  const handleAddPartnerManually = () => {
      const partnerName = prompt('Введите имя партнёра:');
      if (partnerName && partnerName.trim()) {
          setPartner(prev => ({
              ...prev,
              name: partnerName.trim(),
              initials: partnerName.trim().charAt(0).toUpperCase()
          }));
      }
  };

  const handleAcceptInvite = (partnerName: string) => {
      setPartner(prev => ({
          ...prev,
          name: partnerName,
          initials: partnerName.charAt(0).toUpperCase()
      }));
      alert(`${partnerName} присоединился к вашему пространству!`);
  };

  // Check for invite code in URL on mount
  useEffect(() => {
      const hash = window.location.hash;
      const inviteMatch = hash.match(/#\/invite\/([^\/]+)/);
      
      if (inviteMatch && inviteMatch[1]) {
          const inviteCode = inviteMatch[1];
          
          // Show prompt to accept invite
          if (user.name) {
              const accept = window.confirm(
                  `Вы хотите присоединиться к пространству партнёра?\n\nВаше имя: ${user.name}`
              );
              
              if (accept) {
                  // In real app, this would send user data to partner via Supabase
                  // For now, just show success message
                  alert(`Запрос отправлен! Партнёр получит уведомление.`);
                  
                  // Clear invite from URL
                  window.location.hash = '#/';
              }
          } else {
              // User needs to set up their profile first
              alert('Сначала создайте свой профиль, затем примите приглашение.');
              setIsSetupModalOpen(true);
              
              // Store invite code to process after setup
              localStorage.setItem('twodo_pending_invite', inviteCode);
          }
      }
      
      // Check for pending invite after setup
      const pendingInvite = localStorage.getItem('twodo_pending_invite');
      if (pendingInvite && user.name) {
          localStorage.removeItem('twodo_pending_invite');
          alert(`Запрос отправлен! Партнёр получит уведомление.`);
      }
  }, [user.name]);

  // --- Actions ---
  const addCluster = (title: string, color: ClusterColor, size: ClusterSize, x?: number, y?: number) => {
    const newCluster: Cluster = { 
      id: Math.random().toString(36).substr(2, 9), 
      title, 
      createdAt: Date.now(),
      color,
      size,
      x: x ?? 50,
      y: y ?? 20,
      spaceId: activeSpaceId
    };
    setClusters(prev => [...prev, newCluster]);
  };

  const updateCluster = (id: string, updates: Partial<Cluster>) => {
    setClusters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = { 
      ...task, 
      id: Math.random().toString(36).substr(2, 9), 
      createdAt: Date.now(),
      spaceId: activeSpaceId
    };
    setTasks(prev => [newTask, ...prev]);
  };
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Notes Actions
  const addNote = (title: string, content: string) => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      spaceId: activeSpaceId
    };
    setNotes(prev => [newNote, ...prev]);
  };
  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };
  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const addItem = (item: Omit<ShoppingItem, 'id' | 'isBought' | 'addedBy'>) => {
    const newItem: ShoppingItem = { 
      ...item, 
      id: Math.random().toString(36).substr(2, 9), 
      isBought: false, 
      addedBy: Assignee.ME,
      spaceId: activeSpaceId
    };
    setShoppingList(prev => [newItem, ...prev]);
  };
  const toggleItem = (id: string) => {
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, isBought: !i.isBought } : i));
  };
  const deleteItem = (id: string) => {
      setShoppingList(prev => prev.filter(i => i.id !== id));
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = { 
      ...event, 
      id: Math.random().toString(36).substr(2, 9),
      spaceId: activeSpaceId
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const addSpace = (title: string, icon: string, type: SpaceType) => {
    const newSpace: Space = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      icon,
      type,
      createdAt: Date.now()
    };
    setSpaces(prev => [...prev, newSpace]);
    setActiveSpaceId(newSpace.id);
  };

  const openCreateSpaceModal = () => {
    setNewSpaceTitle('');
    setNewSpaceIcon('🏠');
    setNewSpaceType('personal');
    setIsSpaceModalOpen(true);
  };

  const handleCreateSpaceSubmit = () => {
    if (!newSpaceTitle.trim()) return;
    addSpace(newSpaceTitle, newSpaceIcon, newSpaceType);
    setIsSpaceModalOpen(false);
  };

  // --- Global Handlers ---
  const openCreateTaskModal = (preselectedClusterId?: string, coords?: {x: number, y: number}) => {
      setTargetClusterIdForTask(preselectedClusterId);
      setNewTaskCoords(coords);
      setNewTaskTitle('');
      setNewTaskPriority(Priority.MEDIUM);
      // Reset assignee to ME by default for every new task
      setNewTaskAssignee(Assignee.ME);
      setNewTaskDeadline('');
      setIsTaskModalOpen(true);
  };

  const handleCreateTaskSubmit = () => {
      if (!newTaskTitle.trim()) return;

      let finalX = newTaskCoords?.x;
      let finalY = newTaskCoords?.y;

      // ORBITAL LOGIC: If we don't have explicit coords (e.g. created from list), 
      // but we have a target cluster, calculate a random position around that cluster.
      if (!finalX && targetClusterIdForTask) {
         const cluster = clusters.find(c => c.id === targetClusterIdForTask);
         if (cluster) {
             // Random angle in radians
             const angle = Math.random() * 2 * Math.PI;
             // Radius: 12-18% distance from cluster center (creates an orbit ring)
             const radius = 12 + Math.random() * 6; 
             
             finalX = cluster.x + Math.cos(angle) * radius;
             finalY = cluster.y + Math.sin(angle) * radius;

             // Keep within bounds (approx 5-95%)
             finalX = Math.max(5, Math.min(95, finalX));
             finalY = Math.max(5, Math.min(95, finalY));
         }
      } 
      // If still no coords (General task created from list), randomize in center
      else if (!finalX) {
          finalX = 50 + (Math.random() - 0.5) * 30;
          finalY = 50 + (Math.random() - 0.5) * 30;
      }

      addTask({
        title: newTaskTitle,
        priority: newTaskPriority,
        assignee: newTaskAssignee,
        status: Status.TODO,
        deadline: newTaskDeadline || undefined,
        clusterId: targetClusterIdForTask,
        x: finalX,
        y: finalY,
      });
      setIsTaskModalOpen(false);
      setNewTaskCoords(undefined);
  };
  
  const openCreateClusterModal = (coords?: {x: number, y: number}) => {
    setNewClusterTitle('');
    setNewClusterColor('slate');
    setNewClusterSize('md');
    setNewClusterCoords(coords || null);
    setIsClusterModalOpen(true);
  };

  const handleCreateClusterSubmit = () => {
    if (!newClusterTitle.trim()) return;
    addCluster(newClusterTitle, newClusterColor, newClusterSize, newClusterCoords?.x, newClusterCoords?.y);
    setNewClusterTitle('');
    setNewClusterCoords(null);
    setIsClusterModalOpen(false);
  };

  const appState: AppState = {
    tasks: tasks.filter(t => t.spaceId === activeSpaceId),
    clusters: clusters.filter(c => c.spaceId === activeSpaceId),
    notes: notes.filter(n => n.spaceId === activeSpaceId),
    shoppingList: shoppingList.filter(s => s.spaceId === activeSpaceId),
    events: events.filter(e => e.spaceId === activeSpaceId),
    currentUser: user,
    partner: partner,
  };

  const NavItem = ({ id, icon, label }: { id: typeof activeTab, icon: React.ReactNode, label: string }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => {
            setActiveTab(id);
            if (id === 'tasks') setCurrentClusterId(null); // Reset drill-down on tab switch
        }}
        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 relative group ${isActive ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:text-black hover:bg-white'}`}
      >
        <div className={`transition-transform duration-300`}>
          {icon}
        </div>
      </button>
    );
  };

  if (onboardingStep === 'welcome') {
      return <WelcomeScreen onStart={handleStartWelcome} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen font-sans text-black selection:bg-black selection:text-white">
        
        {/* Main Content Area */}
        <main className={`relative min-h-screen ${activeTab === 'dashboard' ? 'w-full h-screen overflow-hidden' : 'max-w-md mx-auto pb-32'}`}>
          {activeTab === 'dashboard' && 
            <DashboardView 
                key="dashboard-view"
                state={appState} 
                viewState={dashboardViewState}
                onViewStateChange={setDashboardViewState}
                onNavigate={setActiveTab}
                onSelectCluster={setCurrentClusterId}
                onUpdateCluster={updateCluster}
                onRequestNewCluster={openCreateClusterModal}
                onRequestNewTask={openCreateTaskModal}
                onHubClick={() => setIsSetupModalOpen(true)}
                onUpdateTask={updateTask}
                spaces={spaces}
                activeSpaceId={activeSpaceId}
                onSelectSpace={setActiveSpaceId}
                onAddSpace={openCreateSpaceModal}
            />
          }
          {activeTab === 'tasks' && 
            <TasksView 
              tasks={tasks} 
              clusters={clusters}
              currentUser={user}
              partner={partner}
              notesCount={notes.length} // Pass notes count to tasks view for General card
              currentClusterId={currentClusterId}
              onSelectCluster={(id) => {
                  if (id === 'GENERAL') {
                      setActiveTab('notes');
                  } else {
                      setCurrentClusterId(id);
                  }
              }}
              addCluster={addCluster}
              updateCluster={updateCluster}
              updateTask={updateTask} 
              deleteTask={deleteTask}
              onRequestNewTask={() => {
                  if (currentClusterId && currentClusterId !== 'ALL' && currentClusterId !== 'GENERAL') {
                      openCreateTaskModal(currentClusterId);
                  } else {
                      openCreateTaskModal(undefined);
                  }
              }}
              onRequestNewCluster={() => openCreateClusterModal()}
            />
          }
          {activeTab === 'notes' &&
            <NotesView
              notes={notes}
              addNote={addNote}
              updateNote={updateNote}
              deleteNote={deleteNote}
              onBack={() => setActiveTab('tasks')}
            />
          }
          {activeTab === 'shopping' && 
            <ShoppingView 
                items={shoppingList} 
                addItem={addItem} 
                toggleItem={toggleItem} 
                deleteItem={deleteItem} 
                currentUser={user}
                partner={partner}
            />
          }
          {activeTab === 'calendar' && <EventsView events={events} addEvent={addEvent} />}
        </main>

        {/* Floating Bottom Navigation */}
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <nav className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-full px-8 py-3 pointer-events-auto flex items-center gap-6 transform transition-all hover:scale-[1.02]">
                <NavItem id="dashboard" icon={<LayoutGrid size={22} strokeWidth={2.5} />} label="Главная" />
                <NavItem id="tasks" icon={<CheckSquare size={22} strokeWidth={2.5} />} label="Задачи" />
                {/* Notes removed from nav, accessed via General folder in Tasks */}
                <NavItem id="shopping" icon={<ShoppingBag size={22} strokeWidth={2.5} />} label="Покупки" />
                <NavItem id="calendar" icon={<Calendar size={22} strokeWidth={2.5} />} label="События" />
            </nav>
        </div>

        {/* --- GLOBAL CREATE TASK MODAL --- */}
        <Modal 
            isOpen={isTaskModalOpen} 
            onClose={() => setIsTaskModalOpen(false)} 
            title={targetClusterIdForTask ? 
                `New Node in ${clusters.find(c => c.id === targetClusterIdForTask)?.title || 'Cluster'}` 
                : "New General Task"
            }
        >
            <Input 
            autoFocus
            label="Objective" 
            placeholder="Task name..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            
            <div className={`grid ${partner.name ? 'grid-cols-2' : 'grid-cols-1'} gap-6 mb-2`}>
            <Select 
                label="Priority Level"
                value={newTaskPriority} 
                onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
            >
                <option value={Priority.LOW}>Low</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.HIGH}>Critical</option>
            </Select>

            {/* ONLY SHOW ASSIGNEE SELECTOR IF PARTNER EXISTS */}
            {partner.name && (
                <Select 
                    label="Assignee"
                    value={newTaskAssignee} 
                    onChange={(e) => setNewTaskAssignee(e.target.value as Assignee)}
                >
                    <option value={Assignee.ME}>{user.name || 'Me'}</option>
                    <option value={Assignee.PARTNER}>{partner.name}</option>
                    <option value={Assignee.BOTH}>Together</option>
                </Select>
            )}
            </div>

            <Input 
            label="Deadline" 
            type="date" 
            value={newTaskDeadline}
            onChange={(e) => setNewTaskDeadline(e.target.value)}
            />

            <div className="mt-10">
            <button 
                onClick={handleCreateTaskSubmit}
                disabled={!newTaskTitle.trim()}
                className="bg-black text-white w-full py-5 rounded-full font-black text-lg shadow-xl shadow-slate-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                INITIALIZE NODE
            </button>
            </div>
        </Modal>

        {/* --- GLOBAL CREATE CLUSTER MODAL --- */}
        <Modal isOpen={isClusterModalOpen} onClose={() => setIsClusterModalOpen(false)} title="New Cluster">
         <div className="flex flex-col items-center gap-6">
            
            <div className="w-full">
                <div className="text-center w-full">
                    <label className="block text-xs font-bold text-black uppercase tracking-widest mb-3 text-center">Cluster Name</label>
                    <Input 
                        autoFocus
                        placeholder="e.g. Project Alpha"
                        value={newClusterTitle}
                        onChange={(e) => setNewClusterTitle(e.target.value)}
                        className="text-center !mb-0" 
                    />
                </div>
            </div>

            {/* Compact Color Selection */}
            <div className="flex flex-col items-center gap-3 w-full">
                 <label className="text-xs font-bold text-black uppercase tracking-widest text-center">Color</label>
                 <div className="flex gap-4 justify-center flex-wrap">
                     {(['slate', 'rose', 'blue', 'emerald', 'amber', 'violet'] as ClusterColor[]).map(color => (
                         <button 
                            key={color}
                            onClick={() => setNewClusterColor(color)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${newClusterColor === color ? 'scale-110 ring-2 ring-black ring-offset-2' : 'hover:scale-105'}`}
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

            {/* Compact Size Selection */}
            <div className="flex flex-col items-center gap-3 w-full">
                 <label className="text-xs font-bold text-black uppercase tracking-widest text-center">Size</label>
                 <div className="flex items-end justify-center gap-6 bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100">
                    {(['sm', 'md', 'lg'] as ClusterSize[]).map(size => (
                         <button
                            key={size}
                            onClick={() => setNewClusterSize(size)}
                            className={`relative rounded-full transition-all duration-300 flex items-center justify-center ${newClusterSize === size ? 'ring-2 ring-black ring-offset-2 scale-110' : 'hover:scale-105 opacity-50 hover:opacity-100'}`}
                            style={{
                                width: size === 'sm' ? '36px' : size === 'md' ? '48px' : '60px',
                                height: size === 'sm' ? '36px' : size === 'md' ? '48px' : '60px',
                            }}
                         >
                             {/* The actual circle visual, distinct from selection ring */}
                            <div className="w-full h-full rounded-full bg-white border-2 border-slate-200 shadow-sm" />
                         </button>
                    ))}
                 </div>
            </div>

            <div className="mt-4 w-full">
              <button 
                onClick={handleCreateClusterSubmit}
                disabled={!newClusterTitle.trim()}
                className="bg-black text-white w-full py-5 rounded-full font-black text-lg shadow-xl shadow-slate-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                CREATE CLUSTER
              </button>
            </div>
         </div>
      </Modal>

      {/* --- SETUP / ONBOARDING MODAL --- */}
      <Modal 
        isOpen={isSetupModalOpen} 
        onClose={() => {
            // Only allow close if setup is actually done, otherwise prevent close or force stay
            if (isSetupDone) setIsSetupModalOpen(false);
        }} 
        title="My Profile"
      >
        <div className="flex flex-col items-center gap-6">
            <p className="text-center text-slate-500 text-sm mb-2">Start your journey.</p>
            
            <div className="w-full">
                <label className="block text-xs font-bold text-black uppercase tracking-widest mb-3 text-center">Your Name</label>
                <Input 
                    autoFocus
                    placeholder="e.g. Alex"
                    value={setupUserName}
                    onChange={(e) => setSetupUserName(e.target.value)}
                    className="text-center !mb-0" 
                />
            </div>

            {/* Partner Invitation Section */}
            <div className="w-full bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                 <label className="block text-xs font-bold text-black uppercase tracking-widest mb-3 text-center">Partner</label>
                 
                 {partner.name ? (
                     <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                        <span className="font-bold ml-2">{partner.name}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold uppercase">Connected</span>
                     </div>
                 ) : (
                     <div className="space-y-3">
                        <p className="text-xs text-center text-slate-400">Пригласите партнёра для совместной работы</p>
                        <button 
                            onClick={openInviteModal}
                            className="w-full py-3 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:border-black transition-colors"
                        >
                            <Share2 size={14} /> Пригласить партнёра
                        </button>
                        <button 
                            onClick={handleAddPartnerManually}
                            className="w-full py-2 text-xs text-slate-500 hover:text-black transition-colors"
                        >
                            или добавить вручную
                        </button>
                     </div>
                 )}
            </div>

            <div className="mt-4 w-full">
              <button 
                onClick={handleFinishSetup}
                disabled={!setupUserName.trim()}
                className="bg-black text-white w-full py-5 rounded-full font-black text-lg shadow-xl shadow-slate-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isSetupDone ? "SAVE CHANGES" : "COMPLETE SETUP"}
              </button>
            </div>
        </div>
      </Modal>

      {/* --- CREATE SPACE MODAL --- */}
      <Modal isOpen={isSpaceModalOpen} onClose={() => setIsSpaceModalOpen(false)} title="Новое пространство">
        <div className="flex flex-col items-center gap-6">
          <div className="w-full">
            <label className="block text-xs font-bold text-black uppercase tracking-widest mb-3 text-center">Название</label>
            <Input 
              autoFocus
              placeholder="например, Семья"
              value={newSpaceTitle}
              onChange={(e) => setNewSpaceTitle(e.target.value)}
              className="text-center !mb-0" 
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-bold text-black uppercase tracking-widest mb-3 text-center">Иконка</label>
            <Input 
              placeholder="🏠"
              value={newSpaceIcon}
              onChange={(e) => setNewSpaceIcon(e.target.value)}
              className="text-center text-2xl !mb-0" 
              maxLength={2}
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-bold text-black uppercase tracking-widest mb-3 text-center">Тип</label>
            <Select 
              value={newSpaceType} 
              onChange={(e) => setNewSpaceType(e.target.value as SpaceType)}
            >
              <option value="personal">Личное</option>
              <option value="shared">Общее</option>
            </Select>
          </div>

          <div className="mt-4 w-full">
            <button 
              onClick={handleCreateSpaceSubmit}
              disabled={!newSpaceTitle.trim()}
              className="bg-black text-white w-full py-5 rounded-full font-black text-lg shadow-xl shadow-slate-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              СОЗДАТЬ ПРОСТРАНСТВО
            </button>
          </div>
        </div>
      </Modal>

      {/* --- INVITE PARTNER MODAL --- */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Пригласить партнёра">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Share2 size={32} className="text-white" />
            </div>
            <p className="text-sm text-slate-600 mb-2">
              Отправьте эту ссылку партнёру, чтобы он мог присоединиться к вашему пространству
            </p>
          </div>

          <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 mb-2 text-center">Ссылка-приглашение</p>
            <div className="bg-white p-3 rounded-lg border border-slate-200 break-all text-xs text-slate-700 font-mono">
              {window.location.origin}{window.location.pathname}#/invite/{btoa(user.id + ':' + Date.now()).replace(/=/g, '')}
            </div>
          </div>

          <button 
            onClick={handleCopyInvite}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${
              inviteLinkCopied 
                ? 'bg-green-500 text-white' 
                : 'bg-black text-white hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {inviteLinkCopied ? (
              <>
                <Check size={16} /> Скопировано!
              </>
            ) : (
              <>
                <Copy size={16} /> Скопировать ссылку
              </>
            )}
          </button>

          <div className="w-full">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-500">или</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setIsInviteModalOpen(false);
              handleAddPartnerManually();
            }}
            className="w-full py-3 text-sm text-slate-600 hover:text-black transition-colors"
          >
            Добавить партнёра вручную
          </button>

          <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-800">
              💡 <strong>Совет:</strong> После того как партнёр перейдёт по ссылке и создаст профиль, вы сможете совместно работать в общих пространствах.
            </p>
          </div>
        </div>
      </Modal>

      </div>
    </HashRouter>
  );
};

export default App;