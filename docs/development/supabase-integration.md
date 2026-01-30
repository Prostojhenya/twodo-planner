# Supabase Integration Guide

## Overview

TwoDo uses Supabase as the backend database for storing and syncing data across devices. This guide explains how the integration works and how to use it.

## Architecture

### Data Flow

```
User Action → App.tsx → Supabase Client → Supabase Database
                ↓
         Local State Update
                ↓
         UI Re-render
```

### Realtime Sync

Supabase provides realtime subscriptions that automatically update the UI when data changes:

```typescript
supabase
  .channel('tasks-changes')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'tasks' 
  }, (payload) => {
    // Handle change
  })
  .subscribe();
```

## Setup

### 1. Environment Configuration

Create or update `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Database Schema

Run the SQL schema from `supabase/schema.sql` in your Supabase SQL Editor.

### 3. Client Initialization

The Supabase client is initialized in `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

## Usage

### Using the Hook

The `useSupabaseData` hook provides data and loading state:

```typescript
import { useSupabaseData } from './lib/useSupabaseData';

const {
  tasks,
  clusters,
  notes,
  events,
  shoppingList,
  spaces,
  loading
} = useSupabaseData(activeSpaceId);
```

### CRUD Operations

#### Create

```typescript
const { data, error } = await supabase
  .from('tasks')
  .insert({
    space_id: activeSpaceId,
    title: 'New Task',
    priority: 'MEDIUM',
    status: 'TODO',
    assignee: 'ME'
  })
  .select()
  .single();
```

#### Read

```typescript
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('space_id', activeSpaceId)
  .order('created_at', { ascending: false });
```

#### Update

```typescript
const { data, error } = await supabase
  .from('tasks')
  .update({ status: 'DONE' })
  .eq('id', taskId)
  .select()
  .single();
```

#### Delete

```typescript
const { error } = await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId);
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled. Users can only access:
- Their own spaces (where they are the owner)
- Shared spaces they are members of

Example policy:

```sql
CREATE POLICY "Users can view tasks in their spaces" ON public.tasks
  FOR SELECT USING (
    space_id IN (
      SELECT id FROM public.spaces WHERE owner_id = auth.uid()
      UNION
      SELECT space_id FROM public.space_members WHERE user_id = auth.uid()
    )
  );
```

### Authentication

Users must be authenticated to access data:

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Sign out
const { error } = await supabase.auth.signOut();
```

## Migration from localStorage

To migrate existing localStorage data:

1. Export current data:
```typescript
const localData = {
  tasks: JSON.parse(localStorage.getItem('twodo_tasks') || '[]'),
  clusters: JSON.parse(localStorage.getItem('twodo_clusters') || '[]'),
  // ... other data
};
```

2. Create a default space:
```typescript
const { data: space } = await supabase
  .from('spaces')
  .insert({
    title: 'Пара',
    icon: '💑',
    type: 'personal',
    owner_id: userId
  })
  .select()
  .single();
```

3. Import data with space_id:
```typescript
const tasksToInsert = localData.tasks.map(task => ({
  ...task,
  space_id: space.id
}));

await supabase.from('tasks').insert(tasksToInsert);
```

## Offline Support

For offline support, consider using:

1. **Optimistic Updates**: Update local state immediately, sync to Supabase in background
2. **Queue Failed Requests**: Store failed requests and retry when online
3. **Conflict Resolution**: Handle conflicts when syncing offline changes

Example optimistic update:

```typescript
const updateTask = async (id: string, updates: Partial<Task>) => {
  // Update local state immediately
  setTasks(prev => prev.map(t => 
    t.id === id ? { ...t, ...updates } : t
  ));

  // Sync to Supabase
  try {
    await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id);
  } catch (error) {
    // Revert on error
    console.error('Failed to update task:', error);
    // Optionally revert local state
  }
};
```

## Performance Optimization

### 1. Selective Fetching

Only fetch data for the active space:

```typescript
.eq('space_id', activeSpaceId)
```

### 2. Pagination

For large datasets, use pagination:

```typescript
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('space_id', activeSpaceId)
  .range(0, 49) // First 50 items
  .order('created_at', { ascending: false });
```

### 3. Indexes

The schema includes indexes on frequently queried columns:

```sql
CREATE INDEX idx_tasks_space ON public.tasks(space_id);
CREATE INDEX idx_tasks_cluster ON public.tasks(cluster_id);
```

## Troubleshooting

### Common Issues

1. **"relation does not exist"**
   - Run the schema.sql in Supabase SQL Editor

2. **"new row violates row-level security policy"**
   - Check user is authenticated
   - Verify user has access to the space

3. **Data not syncing**
   - Check network connection
   - Verify Supabase credentials
   - Check browser console for errors

### Debug Mode

Enable debug logging:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      debug: true
    }
  }
);
```

## Best Practices

1. **Always use transactions** for related operations
2. **Handle errors gracefully** with user-friendly messages
3. **Validate data** before sending to Supabase
4. **Use TypeScript types** for type safety
5. **Test RLS policies** thoroughly
6. **Monitor performance** with Supabase dashboard
7. **Backup data regularly** using Supabase backups

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)
