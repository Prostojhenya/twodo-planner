import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Task, Cluster, Note, Event, ShoppingItem, Space } from '../types';

export const useSupabaseData = (activeSpaceId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data for active space
  useEffect(() => {
    if (!activeSpaceId) return;

    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch spaces
        const { data: spacesData } = await supabase
          .from('spaces')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (spacesData) {
          setSpaces(spacesData.map(s => ({
            id: s.id,
            title: s.title,
            icon: s.icon,
            type: s.type,
            createdAt: new Date(s.created_at).getTime()
          })));
        }

        // Fetch clusters for active space
        const { data: clustersData } = await supabase
          .from('clusters')
          .select('*')
          .eq('space_id', activeSpaceId)
          .order('created_at', { ascending: true });
        
        if (clustersData) {
          setClusters(clustersData.map(c => ({
            id: c.id,
            title: c.title,
            color: c.color,
            size: c.size,
            x: Number(c.x),
            y: Number(c.y),
            createdAt: new Date(c.created_at).getTime(),
            spaceId: c.space_id
          })));
        }

        // Fetch tasks for active space
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('space_id', activeSpaceId)
          .order('created_at', { ascending: false });
        
        if (tasksData) {
          setTasks(tasksData.map(t => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            status: t.status,
            assignee: t.assignee,
            deadline: t.deadline,
            clusterId: t.cluster_id,
            x: t.x ? Number(t.x) : undefined,
            y: t.y ? Number(t.y) : undefined,
            createdAt: new Date(t.created_at).getTime(),
            spaceId: t.space_id
          })));
        }

        // Fetch notes for active space
        const { data: notesData } = await supabase
          .from('notes')
          .select('*')
          .eq('space_id', activeSpaceId)
          .order('created_at', { ascending: false });
        
        if (notesData) {
          setNotes(notesData.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            createdAt: new Date(n.created_at).getTime(),
            updatedAt: new Date(n.updated_at).getTime(),
            spaceId: n.space_id
          })));
        }

        // Fetch events for active space
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .eq('space_id', activeSpaceId)
          .order('date', { ascending: true });
        
        if (eventsData) {
          setEvents(eventsData.map(e => ({
            id: e.id,
            title: e.title,
            date: e.date,
            time: e.time,
            location: e.location,
            type: e.type,
            description: e.description,
            spaceId: e.space_id
          })));
        }

        // Fetch shopping items for active space
        const { data: shoppingData } = await supabase
          .from('shopping_items')
          .select('*')
          .eq('space_id', activeSpaceId)
          .order('created_at', { ascending: false });
        
        if (shoppingData) {
          setShoppingList(shoppingData.map(s => ({
            id: s.id,
            title: s.title,
            category: s.category,
            addedBy: s.added_by,
            isBought: s.is_bought,
            spaceId: s.space_id
          })));
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to realtime changes
    const tasksSubscription = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `space_id=eq.${activeSpaceId}` }, () => {
        fetchData();
      })
      .subscribe();

    const clustersSubscription = supabase
      .channel('clusters-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clusters', filter: `space_id=eq.${activeSpaceId}` }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      tasksSubscription.unsubscribe();
      clustersSubscription.unsubscribe();
    };
  }, [activeSpaceId]);

  return {
    tasks,
    clusters,
    notes,
    events,
    shoppingList,
    spaces,
    loading,
    setTasks,
    setClusters,
    setNotes,
    setEvents,
    setShoppingList,
    setSpaces
  };
};
