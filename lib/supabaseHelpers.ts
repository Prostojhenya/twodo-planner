import { supabase } from './supabase';
import { User, Space, Cluster, Task, Note, Event, ShoppingItem } from '../types';

// Auth helpers
export const signUp = async (email: string, password: string, name: string) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('No user returned');

  // Create user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      name,
      initials: name.charAt(0).toUpperCase(),
      avatar_color: 'indigo'
    });

  if (profileError) throw profileError;

  return authData.user;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// User profile helpers
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;

  return {
    id: data.id,
    name: data.name,
    initials: data.initials,
    avatarColor: data.avatar_color
  };
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { error } = await supabase
    .from('users')
    .update({
      name: updates.name,
      initials: updates.initials,
      avatar_color: updates.avatarColor
    })
    .eq('id', userId);

  if (error) throw error;
};

// Space helpers
export const createSpace = async (title: string, icon: string, type: 'personal' | 'shared', ownerId: string) => {
  const { data, error } = await supabase
    .from('spaces')
    .insert({
      title,
      icon,
      type,
      owner_id: ownerId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserSpaces = async (userId: string): Promise<Space[]> => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .or(`owner_id.eq.${userId},id.in.(select space_id from space_members where user_id = ${userId})`)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data.map(s => ({
    id: s.id,
    title: s.title,
    icon: s.icon,
    type: s.type,
    createdAt: new Date(s.created_at).getTime()
  }));
};

// Invite helpers
export const sendInvite = async (spaceId: string, inviteeEmail: string) => {
  // In a real app, this would send an email
  // For now, we'll use a simple invite code system
  const inviteCode = btoa(`${spaceId}:${inviteeEmail}:${Date.now()}`);
  return inviteCode;
};

export const acceptInvite = async (inviteCode: string, userId: string) => {
  try {
    const decoded = atob(inviteCode);
    const [spaceId] = decoded.split(':');

    // Add user to space_members
    const { error } = await supabase
      .from('space_members')
      .insert({
        space_id: spaceId,
        user_id: userId,
        role: 'member'
      });

    if (error) throw error;
    return spaceId;
  } catch (e) {
    throw new Error('Invalid invite code');
  }
};

// Partner helpers (simplified for two-person app)
export const getPartner = async (userId: string): Promise<User | null> => {
  // Get shared spaces
  const { data: sharedSpaces } = await supabase
    .from('spaces')
    .select('id')
    .eq('type', 'shared')
    .or(`owner_id.eq.${userId},id.in.(select space_id from space_members where user_id = ${userId})`);

  if (!sharedSpaces || sharedSpaces.length === 0) return null;

  // Get other members from shared spaces
  const { data: members } = await supabase
    .from('space_members')
    .select('user_id')
    .in('space_id', sharedSpaces.map(s => s.id))
    .neq('user_id', userId)
    .limit(1);

  if (!members || members.length === 0) {
    // Check if user is owner and get members
    const { data: ownedSpaceMembers } = await supabase
      .from('space_members')
      .select('user_id')
      .in('space_id', sharedSpaces.map(s => s.id))
      .neq('user_id', userId)
      .limit(1);

    if (!ownedSpaceMembers || ownedSpaceMembers.length === 0) return null;
    
    return getUserProfile(ownedSpaceMembers[0].user_id);
  }

  return getUserProfile(members[0].user_id);
};

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
