# Supabase Setup for TwoDo

## Prerequisites

1. Supabase account at https://supabase.com
2. Project created: `supabase-fuchsia-dog`

## Setup Instructions

### 1. Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** (e.g., `https://supabase-fuchsia-dog.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 2. Configure Environment Variables

Update `.env.local` with your credentials:

```env
VITE_SUPABASE_URL=https://supabase-fuchsia-dog.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 3. Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase/schema.sql`
5. Click **Run** to execute the schema

This will create:
- All necessary tables (users, spaces, clusters, tasks, notes, events, shopping_items)
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

### 4. Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (or other providers as needed)
3. Configure email templates if needed

### 5. Test Connection

Run the app:
```bash
npm run dev
```

The app should now connect to Supabase instead of localStorage.

## Database Structure

### Tables

- **users** - User profiles (extends Supabase auth)
- **spaces** - Workspaces/contexts for organizing data
- **space_members** - Members of shared spaces
- **clusters** - Project clusters within spaces
- **tasks** - Tasks within clusters
- **notes** - Notes within spaces
- **events** - Calendar events within spaces
- **shopping_items** - Shopping list items within spaces

### Security

All tables have Row Level Security (RLS) enabled:
- Users can only access their own spaces
- Users can access shared spaces they're members of
- Space owners can manage their spaces and members
- All data is isolated by space

## Migration from localStorage

To migrate existing localStorage data to Supabase:

1. Export data from localStorage (browser DevTools → Application → Local Storage)
2. Create a migration script to import data
3. Ensure all records have proper `spaceId` associations

## Troubleshooting

### Connection Issues

- Verify environment variables are set correctly
- Check Supabase project is active
- Ensure anon key has correct permissions

### RLS Policy Issues

- Check user is authenticated
- Verify user has access to the space
- Review RLS policies in Supabase dashboard

### Data Not Showing

- Confirm data exists in Supabase tables
- Check `spaceId` associations are correct
- Verify active space is set properly
