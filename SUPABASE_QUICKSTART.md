# Supabase Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open project: **supabase-fuchsia-dog**
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL**: `https://supabase-fuchsia-dog.supabase.co`
   - **anon public key**: `eyJ...` (long string)

### Step 2: Update Environment Variables

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://supabase-fuchsia-dog.supabase.co
VITE_SUPABASE_ANON_KEY=paste-your-actual-key-here
```

### Step 3: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire content from `supabase/schema.sql`
4. Paste and click **Run**
5. Wait for "Success" message

### Step 4: Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Save changes

### Step 5: Test

```bash
npm run dev
```

Open http://localhost:5173 - your app now uses Supabase! 🎉

## ✅ What You Get

- ✅ Real-time data sync across devices
- ✅ Multi-user support (shared spaces)
- ✅ Secure data with Row Level Security
- ✅ Automatic backups
- ✅ Scalable infrastructure

## 📚 Next Steps

- Read full documentation: `docs/development/supabase-integration.md`
- Setup guide: `supabase/README.md`
- Database schema: `supabase/schema.sql`

## 🔧 Troubleshooting

**App not connecting?**
- Check `.env.local` has correct values
- Restart dev server after changing env vars
- Check browser console for errors

**Database errors?**
- Ensure schema.sql was run successfully
- Check all tables exist in Supabase dashboard
- Verify RLS policies are enabled

**Need help?**
- Check `docs/development/supabase-integration.md`
- Review Supabase logs in dashboard
- Check browser DevTools console

## 🎯 Current Status

✅ Space Switcher component created
✅ Multi-space support implemented
✅ Supabase schema ready
✅ Integration code prepared
⏳ Need to add Supabase credentials
⏳ Need to run schema in Supabase

## 📝 Notes

- Currently using localStorage (local only)
- After Supabase setup, data will sync across devices
- Existing localStorage data can be migrated (see docs)
