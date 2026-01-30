import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { AppState, Status, Assignee, Cluster, ClusterColor, ClusterSize, Task, Space } from '../types';
import { AssigneeAvatar, PriorityBadge } from './UI';
import { CheckCircle2, ShoppingCart, Calendar, LayoutGrid, Plus, FolderPlus, ArrowUpRight, Check, StickyNote } from 'lucide-react';
import { SpaceSwitcher } from './SpaceSwitcher';

interface DashboardProps {
  state: AppState;
  viewState: { x: number; y: number; scale: number };
  onViewStateChange: React.Dispatch<React.SetStateAction<{ x: number; y: number; scale: number }>>;
  onNavigate: (tab: 'dashboard' | 'tasks' | 'notes' | 'shopping' | 'calendar') => void;
  onSelectCluster: (id: string | 'ALL' | null) => void;
  onUpdateCluster: (id: string, updates: Partial<Cluster>) => void;
  onRequestNewCluster: (coords?: {x: number, y: number}) => void;
  onRequestNewTask: (clusterId: string, coords?: {x: number, y: number}) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onHubClick?: () => void;
  spaces?: Space[];
  activeSpaceId?: string;
  onSelectSpace?: (spaceId: string) => void;
  onAddSpace?: () => void;
}

// Visual helpers
const getClusterColorStyles = (color: ClusterColor, isCompleted?: boolean) => {
  if (isCompleted) {
      return 'bg-slate-200 text-slate-400 border-slate-100 shadow-none';
  }

  switch (color) {
    case 'rose': return 'bg-rose-500 text-white shadow-rose-200';
    case 'blue': return 'bg-blue-500 text-white shadow-blue-200';
    case 'emerald': return 'bg-emerald-500 text-white shadow-emerald-200';
    case 'amber': return 'bg-amber-500 text-white shadow-amber-200';
    case 'violet': return 'bg-violet-500 text-white shadow-violet-200';
    default: return 'bg-slate-600 text-white shadow-slate-200';
  }
};

const getClusterSizeClass = (size: ClusterSize) => {
    switch(size) {
        case 'sm': return 'w-16 h-16 text-lg';
        case 'lg': return 'w-24 h-24 text-2xl';
        default: return 'w-20 h-20 text-xl'; // md
    }
}

interface DragState {
  isActive: boolean;
  sourceId: string | null;
  type: 'cluster' | 'hub' | 'task_create' | 'task';
  start: { x: number; y: number };
  current: { x: number; y: number };
  originNode: { x: number; y: number }; // In pixels
  originPercent: { x: number; y: number }; // Original position in %
  color: ClusterColor | 'black';
  size?: ClusterSize;
}

export const DashboardView: React.FC<DashboardProps> = ({ state, viewState, onViewStateChange, onNavigate, onSelectCluster, onUpdateCluster, onRequestNewCluster, onRequestNewTask, onUpdateTask, onHubClick, spaces, activeSpaceId, onSelectSpace, onAddSpace }) => {
  const { tasks, shoppingList, events, clusters, notes, currentUser, partner } = state;
  const shoppingCount = shoppingList.filter(i => !i.isBought).length;
  const eventsCount = events.filter(e => new Date(e.date) >= new Date()).length;
  // Notes are accessed via Tasks -> General, not separate node anymore

  const containerRef = useRef<HTMLDivElement>(null);

  // --- Track pointers for multi-touch ---
  const pointersRef = useRef<Map<number, { x: number, y: number }>>(new Map());
  const prevPinchRef = useRef<{ dist: number, center: { x: number, y: number } } | null>(null);

  // --- Layout Engine ---
  const containerSize = 100; // 100x100 coordinate system
  const centerX = 50;
  const centerY = 50;

  // Keep latest viewState in ref for event listeners (stale closure fix)
  const viewStateRef = useRef(viewState);
  viewStateRef.current = viewState;
  
  // Keep latest state in ref to access tasks during global event callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  // --- Drag Gesture State (Nodes) ---
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragInfoRef = useRef<DragState | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ignoreClickRef = useRef(false);

  // Keep callbacks in ref to avoid stale closures in useEffect
  const callbacksRef = useRef({ onUpdateCluster, onRequestNewCluster, onRequestNewTask, onUpdateTask });
  callbacksRef.current = { onUpdateCluster, onRequestNewCluster, onRequestNewTask, onUpdateTask };

  // Helper to sync state and ref
  const updateDrag = (newState: DragState | null) => {
    setDragState(newState);
    dragInfoRef.current = newState;
  };

  // Convert Screen Coordinates to World Percentage Coordinates (taking Pan/Zoom into account)
  const getPointerCoordsPercent = (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 50, y: 50 };
      const rect = containerRef.current.getBoundingClientRect();
      
      const currentView = viewStateRef.current; // Use ref to get latest state in callbacks

      // 1. Get coords relative to viewport container
      const viewportX = clientX - rect.left;
      const viewportY = clientY - rect.top;

      // 2. Apply Pan & Scale inverse to get World Coords (Pixels)
      // pixelInWorld = (pixelInViewport - translate) / scale
      const worldX = (viewportX - currentView.x) / currentView.scale;
      const worldY = (viewportY - currentView.y) / currentView.scale;

      // 3. Convert World Coords (Pixels) to Percentage of container Base Size
      const percentX = (worldX / rect.width) * 100;
      const percentY = (worldY / rect.height) * 100;

      return { x: percentX, y: percentY };
  };

  // --- Map Interaction Handlers (Pan/Zoom) ---

  const handleContainerPointerDown = (e: React.PointerEvent) => {
      containerRef.current?.setPointerCapture(e.pointerId);
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };

  const handleContainerPointerMove = (e: React.PointerEvent) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      
      const prev = pointersRef.current.get(e.pointerId)!;
      const deltaX = e.clientX - prev.x;
      const deltaY = e.clientY - prev.y;

      // Update pointer position
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      
      // Don't pan/zoom if dragging a node
      if (dragInfoRef.current?.isActive) return;

      const pointers = Array.from(pointersRef.current.values()) as { x: number; y: number }[];

      if (pointers.length === 1) {
          // PAN
          onViewStateChange(prevView => ({
              ...prevView,
              x: prevView.x + deltaX,
              y: prevView.y + deltaY
          }));

      } else if (pointers.length === 2) {
          // PINCH ZOOM
          const p1 = pointers[0];
          const p2 = pointers[1];
          
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

          if (prevPinchRef.current) {
              const prevDist = prevPinchRef.current.dist;
              const scaleFactor = dist / prevDist;
              
              onViewStateChange(prevView => {
                  const newScale = Math.max(0.1, Math.min(5, prevView.scale * scaleFactor));
                  const actualFactor = newScale / prevView.scale;
                  
                  // Need bounding rect to convert center to relative coords
                  const rect = containerRef.current!.getBoundingClientRect();
                  const relCenter = { x: center.x - rect.left, y: center.y - rect.top };
                  
                  const newX = relCenter.x - (relCenter.x - prevView.x) * actualFactor;
                  const newY = relCenter.y - (relCenter.y - prevView.y) * actualFactor;
                  
                  return { x: newX, y: newY, scale: newScale };
              });
          }
          
          prevPinchRef.current = { dist, center };
      }
  };

  const handleContainerPointerUp = (e: React.PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size < 2) {
          prevPinchRef.current = null;
      }
      containerRef.current?.releasePointerCapture(e.pointerId);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
     // Zoom with wheel
     const scaleChange = -e.deltaY * 0.001;
     
     // Zoom towards mouse pointer
     const rect = containerRef.current!.getBoundingClientRect();
     const relX = e.clientX - rect.left;
     const relY = e.clientY - rect.top;
     
     onViewStateChange(prevView => {
        const newScale = Math.max(0.1, Math.min(5, prevView.scale + scaleChange));
        
        const factor = newScale / prevView.scale;
        const newX = relX - (relX - prevView.x) * factor;
        const newY = relY - (relY - prevView.y) * factor;

        return { x: newX, y: newY, scale: newScale };
     });
  };


  // --- Node Dragging Handlers ---

  const startDrag = (e: React.PointerEvent, id: string, color: ClusterColor | 'black', type: 'cluster' | 'hub' | 'task_create' | 'task', initialX: number, initialY: number, size?: ClusterSize) => {
      e.stopPropagation(); // Stop map panning
      
      const target = e.currentTarget as HTMLElement;
      const clientX = e.clientX;
      const clientY = e.clientY;
      
      // Calculate origin center of the node in screen pixels
      const rect = target.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      // Start Timer for Long Press (only for moving clusters, instant for task creation or hub)
      const delay = (type === 'cluster' || type === 'task') ? 150 : 0;
      
      longPressTimerRef.current = setTimeout(() => {
          const newState: DragState = {
              isActive: true,
              sourceId: id,
              type,
              start: { x: clientX, y: clientY },
              current: { x: clientX, y: clientY },
              originNode: { x: originX, y: originY },
              originPercent: { x: initialX, y: initialY },
              color,
              size
          };
          updateDrag(newState);
          
          if (navigator.vibrate) navigator.vibrate(50);
      }, delay);
  };

  const handleGlobalPointerUp = useCallback(async () => {
      if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
      }

      const currentDrag = dragInfoRef.current;

      if (currentDrag?.isActive && currentDrag.sourceId) {
          const dx = currentDrag.current.x - currentDrag.originNode.x;
          const dy = currentDrag.current.y - currentDrag.originNode.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          // Calculate movement from start to determine if it was a drag or a hold-click
          const movedX = currentDrag.current.x - currentDrag.start.x;
          const movedY = currentDrag.current.y - currentDrag.start.y;
          const distMoved = Math.hypot(movedX, movedY);
          
          if (distMoved > 5) {
              ignoreClickRef.current = true;
              setTimeout(() => { ignoreClickRef.current = false; }, 50);
          }

          if (dist > 30 || currentDrag.type === 'cluster' || currentDrag.type === 'task_create' || currentDrag.type === 'task') { 
             
             // Calculate final drop position in percentage relative to transformed world
             const dropCoords = getPointerCoordsPercent(currentDrag.current.x, currentDrag.current.y);

             if (currentDrag.type === 'cluster') {
                 // Calculate delta for child tasks
                 const deltaX = dropCoords.x - currentDrag.originPercent.x;
                 const deltaY = dropCoords.y - currentDrag.originPercent.y;
                 
                 const childTasks = stateRef.current.tasks.filter(t => t.clusterId === currentDrag.sourceId);
                 
                 // Update cluster immediately (optimistic update in App.tsx)
                 callbacksRef.current.onUpdateCluster(currentDrag.sourceId, { x: dropCoords.x, y: dropCoords.y });
                 
                 // Update child tasks immediately
                 childTasks.forEach(t => {
                     const tx = t.x ?? 0;
                     const ty = t.y ?? 0;
                     callbacksRef.current.onUpdateTask(t.id, { x: tx + deltaX, y: ty + deltaY });
                 });

             } else if (currentDrag.type === 'hub') {
                 callbacksRef.current.onRequestNewCluster({ x: dropCoords.x, y: dropCoords.y });
             } else if (currentDrag.type === 'task_create') {
                 callbacksRef.current.onRequestNewTask(currentDrag.sourceId, { x: dropCoords.x, y: dropCoords.y });
             } else if (currentDrag.type === 'task') {
                 // Update task immediately (optimistic update in App.tsx)
                 callbacksRef.current.onUpdateTask(currentDrag.sourceId, { x: dropCoords.x, y: dropCoords.y });
             }
             
             if (navigator.vibrate) navigator.vibrate(20);
          }
      }

      updateDrag(null);
  }, []);

  const handleGlobalPointerMove = (e: PointerEvent) => {
      const currentDrag = dragInfoRef.current;
      if (currentDrag?.isActive) {
          const newState = {
              ...currentDrag,
              current: { x: e.clientX, y: e.clientY }
          };
          updateDrag(newState);
      }
  };

  useEffect(() => {
      window.addEventListener('pointermove', handleGlobalPointerMove);
      window.addEventListener('pointerup', handleGlobalPointerUp);
      window.addEventListener('pointercancel', handleGlobalPointerUp);
      
      return () => {
          window.removeEventListener('pointermove', handleGlobalPointerMove);
          window.removeEventListener('pointerup', handleGlobalPointerUp);
          window.removeEventListener('pointercancel', handleGlobalPointerUp);
      };
  }, []); 

  // --- Node Rendering ---
  
  // Calculate display position
  const getDisplayPosition = (id: string, staticX: number, staticY: number, type: DragState['type']) => {
      if (dragState?.isActive && dragState.sourceId === id && dragState.type === type) {
           // When dragging, snap to pointer (projected to world %)
           const percent = getPointerCoordsPercent(dragState.current.x, dragState.current.y);
           return { x: percent.x, y: percent.y };
      }
      return { x: staticX, y: staticY };
  };

  const clusterNodes = clusters.map(c => {
      const pos = getDisplayPosition(c.id, c.x, c.y, 'cluster');
      const totalTasks = tasks.filter(t => t.clusterId === c.id).length;
      const activeTaskCount = tasks.filter(t => t.clusterId === c.id && t.status !== Status.DONE).length;
      // Determine if completed (has tasks, but all are done)
      const isCompleted = totalTasks > 0 && activeTaskCount === 0;

      return {
          ...c,
          displayX: pos.x,
          displayY: pos.y,
          count: activeTaskCount,
          isCompleted,
          isDragging: dragState?.sourceId === c.id
      };
  });
  
  // Prepare visible tasks (only those with coords and assigned cluster)
  const taskNodes = tasks.filter(t => t.clusterId && t.status !== Status.DONE && t.x !== undefined && t.y !== undefined).map(t => {
      let displayX = t.x!;
      let displayY = t.y!;
      
      // Apply Cluster Drag Delta if parent is dragging (Visual Gravity)
      if (dragState?.isActive && dragState.type === 'cluster' && dragState.sourceId === t.clusterId) {
           const clusterCurrent = getPointerCoordsPercent(dragState.current.x, dragState.current.y);
           const deltaX = clusterCurrent.x - dragState.originPercent.x;
           const deltaY = clusterCurrent.y - dragState.originPercent.y;
           displayX += deltaX;
           displayY += deltaY;
      }

      const pos = getDisplayPosition(t.id, displayX, displayY, 'task');
      return {
          ...t,
          displayX: pos.x,
          displayY: pos.y,
          isDragging: dragState?.sourceId === t.id
      };
  });

  const shopNode = { x: 50, y: 80, id: 'sys_shop', type: 'shop', title: 'Shop', count: shoppingCount, color: 'slate' as ClusterColor, icon: <ShoppingCart size={20} />, onClick: () => onNavigate('shopping') };
  const eventNode = { x: 50, y: 20, id: 'sys_events', type: 'events', title: 'Events', count: eventsCount, color: 'slate' as ClusterColor, icon: <Calendar size={20} />, onClick: () => onNavigate('calendar') };

  return (
    <div 
        ref={containerRef} 
        className="h-[100dvh] w-full relative flex flex-col items-center justify-center touch-none select-none bg-slate-50 overflow-hidden"
        style={{
            backgroundImage: `
                linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
            `,
            backgroundSize: `${24 * viewState.scale}px ${24 * viewState.scale}px`,
            backgroundPosition: `${viewState.x}px ${viewState.y}px`
        }}
        onPointerDown={handleContainerPointerDown}
        onPointerMove={handleContainerPointerMove}
        onPointerUp={handleContainerPointerUp}
        onPointerCancel={handleContainerPointerUp}
        onWheel={handleWheel}
    >
      
      {/* TRANSFORM WRAPPER - The World Layer */}
      <div 
        className="absolute inset-0 w-full h-full origin-top-left will-change-transform"
        style={{ 
            transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale})`,
            width: '100%',
            height: '100%'
        }}
      >
        
        {/* SVG Connection Layer */}
        <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" 
            viewBox={`0 0 ${containerSize} ${containerSize}`}
            preserveAspectRatio="none"
        >
            {/* System Nodes to Hub */}
            {[shopNode, eventNode].map(node => (
                <path
                    key={`line-${node.id}`}
                    d={`M ${centerX} ${centerY} L ${node.x} ${node.y}`}
                    stroke="#cbd5e1"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    className="opacity-50"
                />
            ))}
            {/* Clusters to Hub */}
            {clusterNodes.map(node => (
                <path
                    key={`line-${node.id}`}
                    d={`M ${centerX} ${centerY} L ${node.displayX} ${node.displayY}`}
                    stroke="#cbd5e1"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    className="opacity-50"
                />
            ))}
            {/* Tasks to Cluster */}
            {taskNodes.map(node => {
                const parent = clusterNodes.find(c => c.id === node.clusterId);
                if (!parent) return null;
                return (
                    <path
                        key={`line-task-${node.id}`}
                        d={`M ${parent.displayX} ${parent.displayY} L ${node.displayX} ${node.displayY}`}
                        stroke="#cbd5e1"
                        strokeWidth="0.3"
                        className="opacity-40"
                    />
                );
            })}
        </svg>

        {/* --- CENTRAL HUB --- */}
        <div 
            className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer touch-none"
            style={{ left: `${centerX}%`, top: `${centerY}%` }}
            onPointerDown={(e) => startDrag(e, 'hub', 'black', 'hub', centerX, centerY)}
            onClick={() => {
                if (!dragInfoRef.current?.isActive && onHubClick) {
                    onHubClick();
                }
            }}
        >
            <div className="w-24 h-24 rounded-full bg-black text-white shadow-xl flex items-center justify-center border-4 border-white relative z-20 active:scale-95 transition-transform">
                <div className="scale-125 pointer-events-none">
                    <AssigneeAvatar assignee={Assignee.BOTH} size="md" user={currentUser} partner={partner} />
                </div>
            </div>
            <div className="absolute -bottom-5 bg-black text-white px-3 py-1 rounded-full z-30 shadow-lg border border-white pointer-events-none">
                <span className="text-[9px] font-black tracking-[0.2em] uppercase">HUB</span>
            </div>
        </div>

        {/* --- SYSTEM NODES --- */}
        {[shopNode, eventNode].map(node => (
            <div
                key={node.id}
                onPointerDown={(e) => e.stopPropagation()} // Prevent map pan when clicking node
                onClick={node.onClick}
                className={`absolute z-20 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
                <div className="w-16 h-16 rounded-full border-4 shadow-sm flex flex-col items-center justify-center bg-white border-white text-slate-700">
                    <div className="mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {node.icon}
                    </div>
                    <span className="text-sm font-black leading-none">{node.count}</span>
                </div>
                <div className="absolute -bottom-3 bg-white border border-slate-100 px-2 py-0.5 rounded-full shadow-sm">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                        {node.title}
                    </span>
                </div>
            </div>
        ))}

        {/* --- USER TASKS (SATELLITES) --- */}
        {taskNodes.map(node => (
            <div
                key={node.id}
                className={`absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none transition-transform duration-200 ${node.isDragging ? 'scale-110 z-50 cursor-grabbing' : 'hover:scale-105 active:scale-95'}`}
                style={{ left: `${node.displayX}%`, top: `${node.displayY}%` }}
                onPointerDown={(e) => startDrag(e, node.id, 'slate', 'task', node.x || 0, node.y || 0)}
                onClick={() => {
                     if (!ignoreClickRef.current && !dragInfoRef.current?.isActive) {
                         onUpdateTask(node.id, { status: Status.DONE });
                     }
                }}
            >
                <div className={`
                    flex items-center justify-center px-4 py-2 rounded-full shadow-md border bg-white
                    ${node.status === Status.DONE ? 'opacity-60 grayscale' : ''}
                    ${node.priority === 'HIGH' ? 'border-rose-500 border-2 shadow-rose-200/50' : 'border-slate-100'}
                `}>
                     {/* Text */}
                    <span className={`text-xs font-bold text-slate-800 whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis ${node.status === Status.DONE ? 'line-through' : ''}`}>
                        {node.title}
                    </span>
                </div>
            </div>
        ))}

        {/* --- USER CLUSTERS --- */}
        {clusterNodes.map(node => (
            <div
                key={node.id}
                className={`absolute z-30 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center touch-none transition-transform duration-75 ${node.isDragging ? 'scale-110 z-50' : 'hover:scale-105 active:scale-95'}`}
                style={{ left: `${node.displayX}%`, top: `${node.displayY}%` }}
            >
                {/* Connector/Plus Button for Task Creation - Positioned Top Right */}
                <div 
                    className="absolute -top-1 -right-1 z-40 w-7 h-7 bg-white text-black border-2 border-slate-100 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-125 transition-transform"
                    onPointerDown={(e) => startDrag(e, node.id, node.color, 'task_create', node.displayX, node.displayY)}
                >
                    <Plus size={14} strokeWidth={3} />
                </div>

                {/* Main Cluster Body - Handles Movement */}
                <div 
                    onPointerDown={(e) => startDrag(e, node.id, node.color, 'cluster', node.x, node.y, node.size)}
                    onClick={() => {
                        if (!ignoreClickRef.current && !dragInfoRef.current?.isActive) {
                            onSelectCluster(node.id);
                            onNavigate('tasks');
                        }
                    }}
                    className={`${getClusterSizeClass(node.size)} rounded-full border-4 border-white flex flex-col items-center justify-center transition-all ${
                        node.isDragging ? 'shadow-2xl' : 'shadow-lg'
                    } ${getClusterColorStyles(node.color, node.isCompleted)}`}
                >
                    <div className="flex flex-col items-center justify-center h-full px-2 pointer-events-none">
                            <span className={`font-bold uppercase tracking-wide opacity-80 mb-1 max-w-full truncate text-center leading-none text-[0.6em] ${node.isCompleted ? 'text-slate-400' : 'text-white'}`}>
                                {node.title.split(' ')[0]}
                            </span>
                    </div>
                    <span className={`font-black leading-none pointer-events-none ${node.isCompleted ? 'text-slate-500' : 'text-white'}`}>{node.count}</span>
                </div>
            </div>
        ))}

        {/* --- DRAG VISUALS (New Cluster or New Task Indicator) --- */}
        {dragState?.isActive && (dragState.type === 'hub' || dragState.type === 'task_create') && (
            <div className="absolute inset-0 pointer-events-none z-50">
                <svg className="absolute inset-0 w-full h-full overflow-visible">
                    <line 
                        x1={`${dragState.originPercent.x}%`} 
                        y1={`${dragState.originPercent.y}%`} 
                        x2={`${getPointerCoordsPercent(dragState.current.x, dragState.current.y).x}%`} 
                        y2={`${getPointerCoordsPercent(dragState.current.x, dragState.current.y).y}%`} 
                        stroke="black" 
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="opacity-30"
                        vectorEffect="non-scaling-stroke" 
                    />
                </svg>
                <div 
                    className={`absolute w-14 h-14 rounded-full bg-slate-100 border-2 border-dashed border-black text-black flex items-center justify-center shadow-xl transform -translate-x-1/2 -translate-y-1/2 ${dragState.type === 'task_create' ? 'bg-white' : ''}`}
                    style={{ 
                        left: `${getPointerCoordsPercent(dragState.current.x, dragState.current.y).x}%`, 
                        top: `${getPointerCoordsPercent(dragState.current.x, dragState.current.y).y}%` 
                    }}
                >
                    {dragState.type === 'hub' ? <FolderPlus size={24} strokeWidth={2} /> : <CheckCircle2 size={24} strokeWidth={2} />}
                </div>
            </div>
        )}

      </div>
      
      {/* Background Decor (Static) */}
      <div className="absolute top-10 left-0 w-full text-center opacity-20 pointer-events-none">
         <h1 className="text-4xl font-black text-slate-300 tracking-tighter">TwoDo</h1>
      </div>

      {/* Space Switcher */}
      {spaces && spaces.length > 0 && activeSpaceId && onSelectSpace && onAddSpace && (
        <SpaceSwitcher
          spaces={spaces}
          activeSpaceId={activeSpaceId}
          onSelectSpace={onSelectSpace}
          onAddSpace={onAddSpace}
        />
      )}

    </div>
  );
};