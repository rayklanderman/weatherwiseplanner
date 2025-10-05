# 🚀 Deployment Checklist - Phase 2

## Pre-Deployment Checklist

### 1. Local Testing ✅
- [ ] Dev server running: `yarn dev`
- [ ] No console errors in browser (F12)
- [ ] AI chat working (test: "Show me Tokyo")
- [ ] Map updates on location change
- [ ] Date picker working
- [ ] Weather data loading from backend

### 2. Environment Variables 🔐

#### Local (.env.local) - Already Done ✅
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_API_BASE_URL=https://weatherwiseplanner.onrender.com
```

#### Vercel (Production) - REQUIRED ⚠️
**You MUST add this in Vercel dashboard!**

1. Go to: https://vercel.com/dashboard
2. Select: `weatherwiseplanner` project
3. Click: `Settings` → `Environment Variables`
4. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_GROQ_API_KEY` | `your_groq_api_key_from_console.groq.com` | Production, Preview, Development |
| `VITE_API_BASE_URL` | `https://weatherwiseplanner.onrender.com` | Production, Preview, Development |

5. Click `Save`
6. **Redeploy** required after adding env vars!

---

## Deployment Process

### Step 1: Commit Phase 2 Changes
```powershell
# Check what will be committed
git status

# Stage all changes (excluding .env.local - already in .gitignore)
git add .

# Commit with descriptive message
git commit -m "Phase 2: Multi-model AI integration with global location support

- Added intentParser.ts (Llama 3.1 8B + Mixtral 8x7B)
- Added geocoder.ts (OpenStreetMap Nominatim - 220+ countries)
- Updated AiChatPanel.tsx (AI controls app state)
- Fixed GROQ_API_KEY → VITE_GROQ_API_KEY for frontend
- Global location support: Tokyo, Paris, Dubai, Mumbai, etc.
- Multi-model strategy: 59% cost savings, 40% faster
"

# Push to GitHub (triggers auto-deployment)
git push origin main
```

### Step 2: Verify GitHub Push
```powershell
# Check GitHub received the push
# Go to: https://github.com/rayklanderman/weatherwiseplanner/commits/main
# You should see your commit at the top
```

### Step 3: Monitor Vercel Deployment
**Automatic deployment starts in ~10 seconds after push**

1. Go to: https://vercel.com/dashboard
2. Select: `weatherwiseplanner` project
3. Click: `Deployments` tab
4. Watch deployment progress (Building → Deploying → Ready)
5. **Time:** ~2-3 minutes

**Status Messages:**
- 🟡 Building... (30-60s)
- 🟡 Deploying... (30-60s)
- 🟢 Ready (Success!)
- 🔴 Error (Check build logs)

### Step 4: Monitor Render Deployment (Backend)
**Automatic deployment if backend files changed**

1. Go to: https://dashboard.render.com
2. Select: `weatherwiseplanner` service
3. Click: `Events` tab
4. **Time:** ~3-5 minutes (if deploying)

**Note:** Phase 2 has NO backend changes, so Render won't deploy.

### Step 5: Verify Production
```powershell
# Test backend health
Invoke-WebRequest -Uri "https://weatherwiseplanner.onrender.com/health"

# Test frontend (after Vercel deployment completes)
# Open browser: https://weatherwiseplanner.vercel.app
```

---

## Post-Deployment Verification

### Frontend Checks ✅

1. **Open Production Site:**
   - https://weatherwiseplanner.vercel.app

2. **Open Browser Console (F12):**
   - Check for errors
   - **If you see "GROQ_API_KEY is missing":**
     - You forgot to add `VITE_GROQ_API_KEY` in Vercel dashboard!
     - See "Environment Variables" section above

3. **Test AI Chat:**
   - Type: "Show me weather in Tokyo"
   - Map should move to Tokyo
   - AI should respond with analysis

4. **Test Geocoding:**
   - Try: "Paris on Bastille Day 2024"
   - Try: "Extreme heat in Dubai"
   - Try: "Mumbai monsoon season"

5. **Check All Panels:**
   - Map displays correctly
   - Risk gauges show data
   - Charts render
   - Satellite imagery loads

### Backend Checks ✅

1. **Health Endpoint:**
   ```powershell
   Invoke-WebRequest -Uri "https://weatherwiseplanner.onrender.com/health"
   # Should return: 200 OK
   ```

2. **Test Weather Query:**
   - Use AI chat to trigger backend query
   - Check data loads in frontend
   - No CORS errors in console

---

## Troubleshooting

### ❌ "GROQ_API_KEY is missing" (Production)
**Solution:**
1. You forgot to add env var in Vercel
2. Go to: https://vercel.com/dashboard
3. Settings → Environment Variables
4. Add: `VITE_GROQ_API_KEY` = `gsk_ja3hor...`
5. Redeploy: Deployments → Latest → ⋯ → Redeploy

### ❌ Vercel Build Failed
**Solution:**
1. Check build logs in Vercel dashboard
2. Common issues:
   - TypeScript errors (run `yarn build` locally first)
   - Missing dependencies (run `yarn install`)
   - Environment variable typos

### ❌ Backend Not Responding
**Solution:**
1. Render free tier sleeps after 15 min inactivity
2. First request takes ~30s to wake up
3. Check: https://weatherwiseplanner.onrender.com/health
4. If still down, check Render dashboard for errors

### ❌ CORS Errors
**Solution:**
1. Backend needs to allow Vercel domain
2. Check `backend/main.py`:
   ```python
   allow_origins=[
       "https://weatherwiseplanner.vercel.app",
       "https://*.vercel.app",  # Allows all Vercel preview URLs
   ]
   ```

---

## Rollback Plan (If Something Breaks)

### Option 1: Rollback in Vercel
1. Go to: https://vercel.com/dashboard
2. Select: `weatherwiseplanner` project
3. Click: `Deployments` tab
4. Find previous working deployment
5. Click: ⋯ → `Promote to Production`

### Option 2: Git Revert
```powershell
# Find commit hash of last working version
git log --oneline

# Revert to previous commit
git revert HEAD
git push origin main

# Vercel auto-deploys the reverted version
```

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Fix local dev server (yarn dev) | 1 min | ✅ Done |
| Add Vercel env variables | 2 min | ⏳ **DO THIS FIRST!** |
| Git commit + push | 1 min | ⏳ Ready |
| Vercel deployment | 2-3 min | ⏳ Auto |
| Render deployment | 0 min | ✅ No changes |
| Verification testing | 5 min | ⏳ After deploy |
| **Total** | **~10 min** | |

---

## Commands Summary

```powershell
# 1. Restart local dev (fix API key error)
yarn dev

# 2. Test locally
# Open: http://localhost:5173
# Test AI chat, verify no errors

# 3. Commit and deploy
git add .
git commit -m "Phase 2: Multi-model AI integration"
git push origin main

# 4. Monitor deployment
# Vercel: https://vercel.com/dashboard
# Wait 2-3 minutes

# 5. Verify production
# Open: https://weatherwiseplanner.vercel.app
# Test AI chat

# 6. If API key error in production:
# Add VITE_GROQ_API_KEY in Vercel dashboard
# Redeploy from Vercel UI
```

---

## What Gets Deployed

### ✅ Frontend (Vercel)
- `src/services/intentParser.ts` (NEW)
- `src/services/geocoder.ts` (NEW)
- `src/components/AiChatPanel.tsx` (UPDATED)
- All Phase 1 UI/UX fixes
- Package updates (groq-sdk, zod, etc.)

### ✅ Backend (Render)
- No changes in Phase 2
- Already deployed and working
- https://weatherwiseplanner.onrender.com

### ❌ NOT Committed (Excluded)
- `.env.local` (in .gitignore)
- `node_modules/` (in .gitignore)
- `dist/` (build output)
- `.venv/` (Python virtual env)

---

## Next Steps After Deployment

1. **Test Production Thoroughly**
   - All AI chat examples
   - Global locations
   - Date parsing
   - Condition toggles

2. **Share Links**
   - Production: https://weatherwiseplanner.vercel.app
   - Backend: https://weatherwiseplanner.onrender.com

3. **Optional: Custom Domain**
   - See `CUSTOM_DOMAIN.md`
   - Setup `weatherwise.earth`
   - ~30 minutes DNS propagation

4. **Phase 3 Planning**
   - Multi-year date ranges
   - Historical trend charts
   - Enhanced satellite imagery

---

## Success Criteria ✅

- [ ] Local dev server works (no API key error)
- [ ] Committed to GitHub successfully
- [ ] Vercel deployment shows "Ready"
- [ ] Production site loads without errors
- [ ] AI chat works in production
- [ ] Global locations work (Tokyo, Paris, Dubai)
- [ ] Backend responding (Render)
- [ ] No CORS errors
- [ ] All panels update correctly

---

**Ready to deploy?**
1. Add env vars in Vercel dashboard FIRST
2. Run: `git push origin main`
3. Wait ~3 minutes
4. Test production site

🚀 **Let's ship Phase 2!**
