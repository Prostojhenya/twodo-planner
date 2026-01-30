import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Task, Cluster, Note, Event, ShoppingItem, ShoppingList, Space, User } from '../types';

export const useSupabaseData = (userId: string | undefined, activeSpaceId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [partner, setPartner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch spaces (owned by user)
        const { data: ownedSpaces } = await supabase
          .from('spaces')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: true });
        
        // Fetch spaces (where user is member)
        const { data: memberSpaces } = await supabase
          .from('space_members')
          .select('space_id, spaces(*)')
          .eq('user_id', userId);
        
        const spacesData = [
          ...(ownedSpaces || []),
          ...(memberSpaces?.map(m => m.spaces).filter(Boolean) || [])
        ];
        
        if (spacesData) {
          setSpaces(spacesData.map(s => ({
            id: s.id,
            title: s.title,
            icon: s.icon,
            type: s.type,
            createdAt: new Date(s.created_at).getTime()
          })));
        }

        if (!activeSpaceId) {
          setLoading(false);
          return;
        }

        // Fetch clusters
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

        // Fetch tasks
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

        // Fetch notes
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

        // Fetch events
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

        // Fetch shopping lists
        const { data: shoppingListsData } = await supabase
          .from('shopping_lists')
          .select('*')
          .eq('space_id', activeSpaceId)
          .order('created_at', { ascending: true});
        
        if (shoppingListsData) {
          setShoppingLists(shoppingListsData.map(sl => ({
            id: sl.id,
            title: sl.title,
            icon: sl.icon,
            spaceId: sl.space_id,
            createdAt: new Date(sl.created_at).getTime(),
            updatedAt: new Date(sl.updated_at).getTime()
          })));
        }

        // Fetch shopping
        const { data: shoppingData } = await supabase
          .from('shopping_items')
          .select('*')
          .eq('space_id', activeSpaceId)
          .order('created_at', { ascending: false});
        
        if (shoppingData) {
          setShoppingList(shoppingData.map(s => ({
            id: s.id,
            title: s.title,
            category: s.category,
            addedBy: s.added_by,
            isBought: s.is_bought,
            spaceId: s.space_id,
            listId: s.list_id
          })));
        }

        // Fetch partner
        const { data: ownedSharedSpaces } = await supabase
          .from('spaces')
          .select('id')
          .eq('type', 'shared')
          .eq('owner_id', userId);
        
        const { data: memberSharedSpaces } = await supabase
          .from('space_members')
          .select('space_id, spaces!inner(id, type)')
          .eq('user_id', userId)
          .eq('spaces.type', 'shared');
        
        const sharedSpaces = [
          ...(ownedSharedSpaces || []),
          ...(memberSharedSpaces?.map(m => ({ id: m.space_id })) || [])
        ];

        if (sharedSpaces && sharedSpaces.length > 0) {
          const { data: members } = await supabase
            .from('space_members')
            .select('user_id')
            .in('space_id', sharedSpaces.map(s => s.id))
            .neq('user_id', userId)
            .limit(1);

          if (members && members.length > 0) {
            const { data: partnerData, error: partnerError } = await supabase
              .from('users')
              .select('*')
              .eq('id', members[0].user_id)
              .limit(1);

            if (partnerError) {
              console.error('Error loading partner:', partnerError);
            } else if (partnerData && partnerData.length > 0) {
              const partner = partnerData[0];
              setPartner({
                id: partner.id,
                name: partner.name,
                initials: partner.initials,
                avatarColor: partner.avatar_color
              });
            }
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `space_id=eq.${activeSpaceId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clusters', filter: `space_id=eq.${activeSpaceId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `space_id=eq.${activeSpaceId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `space_id=eq.${activeSpaceId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items', filter: `space_id=eq.${activeSpaceId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_lists', filter: `space_id=eq.${activeSpaceId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'space_members' }, fetchData)
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, activeSpaceId]);

  return {
    tasks,
    clusters,
    notes,
    events,
    shoppingList,
    shoppingLists,
    spaces,
    partner,
    loading
  };
};
