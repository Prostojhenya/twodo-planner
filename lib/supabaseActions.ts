import { supabase } from './supabase';
import { Cluster, Task, Note, Event, ShoppingItem, Space, Priority, Status, Assignee, EventType, ClusterColor, ClusterSize, SpaceType } from '../types';

// Cluster actions
export const createCluster = async (spaceId: string, title: string, color: ClusterColor, size: ClusterSize, x?: number, y?: number) => {
  const { data, error } = await supabase
    .from('clusters')
    .insert({
      space_id: spaceId,
      title,
      color,
      size,
      x: x ?? 50,
      y: y ?? 20
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCluster = async (id: string, updates: Partial<Cluster>) => {
  const { error } = await supabase
    .from('clusters')
    .update({
      title: updates.title,
      color: updates.color,
      size: updates.size,
      x: updates.x,
      y: updates.y
    })
    .eq('id', id);

  if (error) throw error;
};

// Task actions
export const createTask = async (spaceId: string, task: Omit<Task, 'id' | 'createdAt' | 'spaceId'>) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      space_id: spaceId,
      cluster_id: task.clusterId,
      title: task.title,
      priority: task.priority,
      status: task.status,
      assignee: task.assignee,
      deadline: task.deadline,
      x: task.x,
      y: task.y
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
  const { error } = await supabase
    .from('tasks')
    .update({
      title: updates.title,
      priority: updates.priority,
      status: updates.status,
      assignee: updates.assignee,
      deadline: updates.deadline,
      cluster_id: updates.clusterId,
      x: updates.x,
      y: updates.y
    })
    .eq('id', id);

  if (error) throw error;
};

// Batch update tasks (for moving multiple tasks at once)
export const updateTasksBatch = async (updates: Array<{ id: string; x: number; y: number }>) => {
  // Update tasks in parallel
  const promises = updates.map(({ id, x, y }) =>
    supabase
      .from('tasks')
      .update({ x, y })
      .eq('id', id)
  );

  const results = await Promise.all(promises);
  const errors = results.filter(r => r.error).map(r => r.error);
  
  if (errors.length > 0) {
    console.error('Batch update errors:', errors);
    throw errors[0];
  }
};

export const deleteTask = async (id: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Note actions
export const createNote = async (spaceId: string, title: string, content: string) => {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      space_id: spaceId,
      title,
      content
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateNote = async (id: string, updates: Partial<Note>) => {
  const { error } = await supabase
    .from('notes')
    .update({
      title: updates.title,
      content: updates.content
    })
    .eq('id', id);

  if (error) throw error;
};

export const deleteNote = async (id: string) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Shopping actions
export const createShoppingList = async (spaceId: string, title: string, icon: string = '🛒') => {
  const { data, error } = await supabase
    .from('shopping_lists')
    .insert({
      space_id: spaceId,
      title,
      icon
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateShoppingList = async (id: string, updates: { title?: string; icon?: string }) => {
  const { error } = await supabase
    .from('shopping_lists')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

export const deleteShoppingList = async (id: string) => {
  const { error } = await supabase
    .from('shopping_lists')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const createShoppingItem = async (spaceId: string, title: string, category: string, listId?: string) => {
  const { data, error } = await supabase
    .from('shopping_items')
    .insert({
      space_id: spaceId,
      list_id: listId,
      title,
      category,
      added_by: 'ME',
      is_bought: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const toggleShoppingItem = async (id: string, isBought: boolean) => {
  const { error } = await supabase
    .from('shopping_items')
    .update({ is_bought: !isBought })
    .eq('id', id);

  if (error) throw error;
};

export const deleteShoppingItem = async (id: string) => {
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Event actions
export const createEvent = async (spaceId: string, event: Omit<Event, 'id' | 'spaceId'>) => {
  const { data, error } = await supabase
    .from('events')
    .insert({
      space_id: spaceId,
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type,
      description: event.description
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Space actions
export const createSpace = async (userId: string, title: string, icon: string, type: SpaceType) => {
  const { data, error } = await supabase
    .from('spaces')
    .insert({
      title,
      icon,
      type,
      owner_id: userId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Invite actions
export const addPartnerToSpace = async (spaceId: string, partnerId: string) => {
  const { error } = await supabase
    .from('space_members')
    .insert({
      space_id: spaceId,
      user_id: partnerId,
      role: 'member'
    });

  if (error) throw error;
};
