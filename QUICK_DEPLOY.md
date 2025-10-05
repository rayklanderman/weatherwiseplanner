# Quick Deploy Reference

## Vercel (Frontend)
- **Auto-detects**: Vite project from `package.json` + `vercel.json`
- **Root**: Project root (not subdirectory)
- **Build**: `yarn build` → outputs to `dist/`
- **Env var needed**: `VITE_API_URL` (add after Render deploys)

## Render (Backend)  
- **Auto-detects**: Blueprint from `render.yaml`
- **Backend folder**: Commands point to `backend/` subdirectory
- **Build**: `pip install -r backend/requirements.txt`
- **Start**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- **Env var needed**: `GROQ_API_KEY`

## Deploy Order
1. ✅ Push to GitHub
2. 🐍 Deploy Render (Blueprint) → Copy URL
3. ⚡ Deploy Vercel → Add VITE_API_URL → Redeploy
4. 🎉 Test live!
