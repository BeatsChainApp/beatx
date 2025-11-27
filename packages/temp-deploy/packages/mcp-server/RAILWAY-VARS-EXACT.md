# 🚨 EXACT Railway Environment Variables

## Set these EXACT variable names in Railway Dashboard:

```bash
SUPABASE_URL=https://zgdxpsenxjwyiwbbealf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_T6kuzjPB46RcdratmBdocA_53ceaOJc
SUPABASE_ANON_KEY=sb_publishable_ZNsSNgXL7N74uzV6oWkp-A_MMMf15_r
GOOGLE_CLIENT_ID=239753403483-re3akggqub93apgm4t5nnabbbrcp0q1p.apps.googleusercontent.com
NODE_ENV=production
CORS_ORIGIN=*
PORT=4000
```

## Variable Names Must Match Code Exactly:
- ✅ `SUPABASE_URL` (not supabaseUrl)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (not SUPABASE_KEY)
- ✅ `GOOGLE_CLIENT_ID` (not GOOGLE_CLIENT)

## After Setting Variables:
1. Click "Deploy" in Railway dashboard
2. Check logs for: "All env keys: [list of variables]"
3. Verify Supabase routes load successfully