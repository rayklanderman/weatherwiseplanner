# 🚀 WeatherWise Planner - Quick Start Guide

## Your Current Setup

### Architecture
```
Backend:  Render       → https://weatherwiseplanner.onrender.com
Frontend: Vercel       → https://weatherwiseplanner.vercel.app
Domain:   (Optional)   → weatherwise.earth (see CUSTOM_DOMAIN.md)
```

### Package Manager
**Using YARN** (not npm/pnpm)

---

## Local Development

### Start Development Server
```powershell
# Frontend (from project root)
yarn dev

# Access at: http://localhost:5173
```

### Backend is on Render
- **No need to run locally** - backend is already deployed
- Backend URL: `https://weatherwiseplanner.onrender.com`
- Health check: `https://weatherwiseplanner.onrender.com/health`

---

## Common Commands

### Install Dependencies
```powershell
yarn install
```

### Build for Production
```powershell
yarn build
```

### Preview Production Build
```powershell
yarn preview
```

### Lint Code
```powershell
yarn lint
```

---

## Environment Variables

### `.env.local` (Required)
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_API_BASE_URL=https://weatherwiseplanner.onrender.com
```

**Important Notes:**
- ✅ Use `VITE_` prefix for frontend variables
- ⚠️  Restart dev server after changing `.env.local`
- 🔒 Never commit `.env.local` to git

---

## Deployment

### Frontend (Vercel)
**Automatic deployment on push to `main` branch**

```powershell
git add .
git commit -m "Your message"
git push origin main

# Vercel auto-deploys in ~2-3 minutes
```

### Backend (Render)
Already deployed! No action needed unless updating Python code.

If you need to update backend:
```powershell
# Backend changes auto-deploy on push to main
git add backend/
git commit -m "Update backend"
git push origin main

# Render auto-deploys in ~3-5 minutes
```

---

## Troubleshooting

### ❌ "GROQ_API_KEY is missing"
**Solution:**
1. Check `.env.local` has `VITE_GROQ_API_KEY` (not `GROQ_API_KEY`)
2. Restart dev server: Ctrl+C then `yarn dev`
3. Hard refresh browser: Ctrl+Shift+R

### ❌ "Cannot connect to backend"
**Solution:**
1. Check backend is running: https://weatherwiseplanner.onrender.com/health
2. Check CORS in `backend/main.py` includes your domain
3. Render might be sleeping (free tier) - first request wakes it up (~30s)

### ❌ "Module not found"
**Solution:**
```powershell
# Clean install
Remove-Item node_modules -Recurse -Force
Remove-Item yarn.lock
yarn install
```

### ❌ "Port 5173 already in use"
**Solution:**
```powershell
# Kill process on port 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force

# Then restart
yarn dev
```

---

## Project Structure

```
weatherwiseplanner/
├── backend/                 # Python FastAPI (deployed on Render)
│   ├── main.py             # API endpoints
│   ├── data_fetcher.py     # NASA MERRA-2 data
│   └── ai_insights.py      # Groq AI integration
├── src/                     # React frontend (deployed on Vercel)
│   ├── components/         # UI components
│   ├── services/           # API services
│   │   ├── intentParser.ts    # AI intent parsing
│   │   ├── geocoder.ts        # Location geocoding
│   │   └── aiInsightsService.ts
│   └── hooks/              # React hooks
├── public/                  # Static assets
├── .env.local              # Environment variables (DO NOT COMMIT)
└── package.json            # Dependencies (use yarn)
```

---

## Key Features Implemented

### Phase 1: UI/UX Fixes ✅
- Fixed dark text on dark backgrounds
- Added glassmorphism effects
- NASA colors properly displayed
- Modern gradient animations

### Phase 2: AI Integration ✅
- Multi-model Groq AI (3 models)
- Natural language location selection
- Intent parsing extracts location/date/conditions
- AI chat controls all app panels
- Global geocoding (220+ countries)

### Phase 3: Pending
- Multi-year date ranges (backend)
- Historical trend charts
- Enhanced satellite imagery

---

## API Keys Required

### 1. Groq API Key (AI)
- **Get it:** https://console.groq.com
- **Free tier:** Yes (generous limits)
- **Where to add:** `.env.local` as `VITE_GROQ_API_KEY`

### 2. NASA MERRA-2 Data
- **Already configured** in backend
- Uses local sample data: `public/sample_data/merra2_sample_denver_2018_2023.nc`

---

## Testing Locally

### 1. Start Dev Server
```powershell
yarn dev
```

### 2. Open Browser
```
http://localhost:5173
```

### 3. Test Features
- **Map Selection:** Click any location on map
- **Date Picker:** Select any date (YYYY-MM-DD format)
- **Condition Toggles:** Enable weather conditions
- **AI Chat:** Try these:
  - "Show me weather in Tokyo"
  - "Paris on Bastille Day 2024"
  - "Extreme heat in Dubai"
  - "Mumbai monsoon season"

### 4. Check Backend Connection
```powershell
# Test backend health
Invoke-WebRequest -Uri "https://weatherwiseplanner.onrender.com/health"
```

---

## Production URLs

### Current Deployment
- **Frontend:** https://weatherwiseplanner.vercel.app
- **Backend:** https://weatherwiseplanner.onrender.com

### Custom Domain (Optional)
See `CUSTOM_DOMAIN.md` for setup instructions:
- **Target:** weatherwise.earth
- **DNS Setup:** ~30 minutes
- **SSL:** Auto-issued by Vercel

---

## Git Workflow

### Commit Changes
```powershell
git status                    # Check what changed
git add .                     # Stage all changes
git commit -m "Description"   # Commit with message
git push origin main          # Push to GitHub
```

### View Deployment Status
- **Vercel:** https://vercel.com/dashboard
- **Render:** https://dashboard.render.com

---

## Performance

### Response Times
- Intent parsing: ~200ms (Llama 3.1 8B)
- Geocoding: ~150ms (Nominatim API)
- Backend query: ~800ms (NASA data)
- AI response: ~500ms (Llama 3.3 70B)
- **Total:** ~1.65 seconds end-to-end

### Cost Optimization
- Multi-model strategy saves **59% on AI costs**
- Free geocoding (OpenStreetMap Nominatim)
- Free SSL (Vercel)
- Free backend (Render free tier)

---

## Support Resources

### Documentation
- `PHASE_2_COMPLETE.md` - Phase 2 features
- `CUSTOM_DOMAIN.md` - Domain setup guide
- `COMPREHENSIVE_FIXES.md` - Full roadmap

### External Docs
- **Vite:** https://vitejs.dev
- **React 19:** https://react.dev
- **Groq:** https://console.groq.com/docs
- **Vercel:** https://vercel.com/docs
- **Render:** https://render.com/docs

---

## Quick Checklist

Before committing:
- [ ] `yarn build` works without errors
- [ ] All environment variables in `.env.local`
- [ ] `.env.local` in `.gitignore` (already done)
- [ ] Backend health check passes
- [ ] Local dev server runs (`yarn dev`)
- [ ] No TypeScript errors (`yarn lint`)

Before deploying:
- [ ] Test locally first
- [ ] Commit with descriptive message
- [ ] Push to `main` branch
- [ ] Wait for Vercel deployment (~2-3 min)
- [ ] Test production URL
- [ ] Check browser console for errors

---

## Emergency Fixes

### Site is down
1. Check Vercel status: https://www.vercel-status.com
2. Check Render status: https://status.render.com
3. Check backend: `https://weatherwiseplanner.onrender.com/health`

### Backend not responding
- Render free tier sleeps after 15 min inactivity
- First request wakes it up (~30 seconds delay)
- Consider upgrading to paid tier for 24/7 uptime

### Frontend errors
1. Check browser console (F12)
2. Check `.env.local` variables
3. Hard refresh: Ctrl+Shift+R
4. Clear cache and restart browser

---

**Last Updated:** October 6, 2025  
**Version:** Phase 2 (Multi-model AI Integration)  
**Status:** Production Ready ✅
