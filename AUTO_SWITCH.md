# 🔄 Auto-Switch Logic Explained

## How the Frontend Knows Which Backend to Use

### Automatic Environment Detection ✅

The app **automatically switches** between local and production backends:

```typescript
// src/config/api.ts
const getBaseUrl = (): string => {
  // Production (Vercel) → Use environment variable
  if (import.meta.env.PROD && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development → Use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  
  // Fallback
  return 'https://weatherwiseplanner-backend.onrender.com';
};
```

### What This Means:

| Environment | Backend URL | How It's Set |
|------------|-------------|--------------|
| **Local Dev** (`yarn dev`) | `http://localhost:8000` | Automatic - no config needed |
| **Production** (Vercel) | From `VITE_API_URL` env var | Set once in Vercel dashboard |
| **Build Preview** | Same as production | Uses Vercel env vars |

---

## Health Check & Uptime Logic

### Backend Health Monitoring ✅

The frontend automatically checks if the backend is reachable:

```typescript
// Checks backend every 30 seconds (dev mode only)
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: AbortSignal.timeout(5000) // 5 sec timeout
    });
    return response.ok;
  } catch {
    return false;
  }
};
```

### In Development:
- ✅ Shows backend status indicator (bottom-right corner)
- ✅ Green dot = Backend connected
- ✅ Red dot = Backend offline (start it!)
- ✅ Yellow dot = Checking...

### In Production:
- ✅ No visible indicator (cleaner UI)
- ✅ Errors shown only if API calls fail
- ✅ Render keeps backend alive with health checks

---

## Render Free Tier - Sleep/Wake Behavior

### How Render Free Tier Works:

**Render free services sleep after 15 minutes of inactivity** 🛌

When a request comes in:
1. ❄️ Backend is asleep (cold start)
2. ⏳ First request wakes it up (~30-60 seconds)
3. ✅ Subsequent requests are fast
4. 💤 Sleeps again after 15 min idle

### How We Handle This:

#### 1. Health Check Endpoint
```python
# backend/main.py
@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
```
- Render pings `/health` to keep service alive
- Configured in `render.yaml` with `healthCheckPath: /health`

#### 2. User Experience
When backend is sleeping:
- ⏱️ First API call takes 30-60 seconds (wake time)
- 💡 Frontend shows loading state
- ✅ Once awake, responds normally

#### 3. Keep-Alive Options

**Option A: Accept Sleep** (Free)
- Users wait 30-60s on first load
- Good for demos/submissions

**Option B: Paid Plan** ($7/month)
- Backend stays awake 24/7
- Instant response times

**Option C: UptimeRobot** (Free hack)
- Sign up at [uptimerobot.com](https://uptimerobot.com)
- Monitor your Render URL every 5 minutes
- Keeps backend awake during demo day
- Free tier: 50 monitors

---

## No Manual Switching Required! 🎉

### Development Workflow:
```powershell
# Terminal 1 - Start backend
.\.venv\Scripts\Activate.ps1
$env:GROQ_API_KEY="your_key"
python -m uvicorn backend.main:app --reload

# Terminal 2 - Start frontend
yarn dev
# ✅ Automatically uses localhost:8000
```

### Production Workflow:
```powershell
# Push to GitHub
git push origin main

# Vercel auto-deploys frontend
# ✅ Automatically uses VITE_API_URL from env vars

# Render auto-deploys backend
# ✅ Stays alive with health checks
```

---

## Troubleshooting

### "Backend offline" in development?
```powershell
# Check if backend is running
curl http://localhost:8000/health

# If not, start it:
.\.venv\Scripts\Activate.ps1
$env:GROQ_API_KEY="your_key"
python -m uvicorn backend.main:app --reload
```

### "API error 502" in production?
- Backend might be sleeping (Render free tier)
- Wait 30-60 seconds and retry
- Or set up UptimeRobot to keep it awake

### "CORS error" in production?
- Check `backend/main.py` has your Vercel URL in `allow_origins`
- Should include: `"https://weatherwiseplanner.vercel.app"`

---

## Summary

✅ **Automatic switching** - No manual config needed  
✅ **Health checks** - Backend monitored every 30s (dev mode)  
✅ **Sleep handling** - Render free tier wakes on first request  
✅ **Zero config** - Just set `VITE_API_URL` once in Vercel  

The system is production-ready! 🚀
