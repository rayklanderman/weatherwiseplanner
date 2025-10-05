# 🚀 DEPLOYMENT GUIDE

## Automatic Deployment Setup

### ✅ Frontend → Vercel (Auto-configured)

**What Vercel will detect:**
- ✅ `package.json` - Automatically detects Vite project
- ✅ `vercel.json` - Configuration for build settings and API proxy
- ✅ Root-level frontend code (not in subdirectory)

**Steps:**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import `rayklanderman/weatherwiseplanner` from GitHub
4. Vercel will auto-detect settings:
   - **Framework Preset**: Vite ✅ (auto-detected)
   - **Root Directory**: `./ ` (leave empty - frontend is at root)
   - **Build Command**: `yarn build` ✅ (from vercel.json)
   - **Output Directory**: `dist` ✅ (from vercel.json)
5. Add **Environment Variable**:
   ```
   Name: VITE_API_URL
   Value: https://weatherwiseplanner-backend.onrender.com
   ```
   (You'll update this after Render deploys)
6. Click **"Deploy"**
7. Done! Site will be at `https://weatherwiseplanner.vercel.app`

---

### ✅ Backend → Render (Auto-configured)

**What Render will detect:**
- ✅ `render.yaml` - Blueprint file with all settings
- ✅ `backend/requirements.txt` - Python dependencies
- ✅ `runtime.txt` - Python 3.13.5 version

**Steps:**

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Blueprint"**
3. Connect to `rayklanderman/weatherwiseplanner` repository
4. Render will read `render.yaml` and show:
   - **Service Name**: `weatherwiseplanner-backend`
   - **Type**: Web Service
   - **Runtime**: Python 3.13.5
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Click **"Apply"** and add **Environment Variable**:
   ```
   Key: GROQ_API_KEY
   Value: your_groq_api_key_here
   ```
6. Click **"Create Web Service"**
7. Wait ~3-5 minutes for first deploy
8. Your API will be at: `https://weatherwiseplanner-backend.onrender.com`

---

### 🔄 Connect Frontend to Backend

After Render deploys:

1. Copy your Render backend URL: `https://weatherwiseplanner-backend.onrender.com`
2. Go to Vercel → Project → **Settings** → **Environment Variables**
3. Update `VITE_API_URL` to your Render URL
4. Go to **Deployments** → Click **"Redeploy"** on latest deployment
5. ✅ Done! Frontend now talks to backend

---

## Configuration Files Explained

### `vercel.json` (Frontend)
```json
{
  "buildCommand": "yarn build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://[YOUR-RENDER-URL]/api/:path*"
    }
  ]
}
```
- Tells Vercel: "This is a Vite app, build with yarn, output to dist"
- Proxies `/api/*` requests to backend (avoids CORS issues)

### `render.yaml` (Backend)
```yaml
services:
  - type: web
    name: weatherwiseplanner-backend
    runtime: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```
- Tells Render: "This is a Python web service, here's how to build and run it"
- **Blueprint deployment** = zero-click setup!

### Why This Works

**Vercel looks at root:**
- Finds `package.json` → "This is a Node.js project"
- Finds `vercel.json` → "Build with Vite"
- Deploys frontend ✅

**Render looks at root:**
- Finds `render.yaml` → "Use Blueprint mode"
- Reads build/start commands → Points to `backend/` folder
- Deploys backend ✅

No conflicts! Both platforms know exactly what to do.

---

## Local Development

```powershell
# Terminal 1 - Backend
.\.venv\Scripts\Activate.ps1
$env:GROQ_API_KEY="your_groq_api_key_here"
python -m uvicorn backend.main:app --reload

# Terminal 2 - Frontend
yarn dev
```

Open: http://localhost:5173

---

## Files Created for Deployment

- ✅ `vercel.json` - Vercel auto-config (frontend)
- ✅ `render.yaml` - Render Blueprint (backend)
- ✅ `Procfile` - Fallback for Render (if yaml fails)
- ✅ `runtime.txt` - Python 3.13.5 specification
- ✅ `favicon-nasa.svg` - NASA-themed favicon
- ✅ `preview.svg` - Social media preview image
- ✅ Updated `index.html` with Open Graph tags
- ✅ Updated `.gitignore` to exclude `.env.local`

---

## Quick Checklist

- [ ] Push code to GitHub
- [ ] Deploy backend to Render (Blueprint mode)
- [ ] Copy Render URL
- [ ] Deploy frontend to Vercel
- [ ] Add `VITE_API_URL` env var in Vercel
- [ ] Redeploy Vercel
- [ ] Test live site!

