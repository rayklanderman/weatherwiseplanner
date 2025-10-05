# Quick Custom Domain Setup - weatherwise.earth

## 1️⃣ In Vercel (2 minutes)
```
vercel.com → weatherwiseplanner project → Settings → Domains
→ Add: weatherwise.earth
→ Copy the DNS records shown
```

## 2️⃣ In Your Domain Registrar (5 minutes)
Add these DNS records:

### For www subdomain:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### For root domain (choose ONE):

**Option A - If registrar supports ANAME/ALIAS:**
```
Type: ANAME (or ALIAS)
Name: @
Value: cname.vercel-dns.com
```

**Option B - Standard A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

## 3️⃣ Wait & Verify (15-30 minutes)
```
Check propagation: dnschecker.org
Vercel will auto-issue SSL certificate
Both URLs will work:
  - https://weatherwise.earth
  - https://www.weatherwise.earth
```

## 4️⃣ Already Done! ✅
- ✅ `index.html` updated with weatherwise.earth URLs
- ✅ `backend/main.py` CORS includes custom domain
- ✅ Ready to push to GitHub

## 5️⃣ Push Changes
```powershell
git add .
git commit -m "Add custom domain weatherwise.earth support"
git push origin main
```

## That's It! 🎉
After DNS propagates, your app will be live at:
**https://weatherwise.earth**
