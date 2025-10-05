# 🌍 Custom Domain Setup: weatherwise.earth

## Step-by-Step Guide to Add Custom Domain to Vercel

### Prerequisites
- ✅ Domain `weatherwise.earth` registered (you own it)
- ✅ Access to domain registrar's DNS settings
- ✅ Vercel project deployed

---

## Part 1: Add Domain in Vercel

### 1. Go to Vercel Dashboard
```
https://vercel.com/dashboard
→ Select your "weatherwiseplanner" project
→ Click "Settings" tab
→ Click "Domains" in sidebar
```

### 2. Add Your Domain
```
In "Domains" section:
1. Type: weatherwise.earth
2. Click "Add"

Vercel will show you DNS records to configure
```

### 3. Vercel Will Ask You to Add DNS Records

You'll see something like:

**Option A - CNAME (Recommended):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Option B - A Record (For root domain):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Option C - ANAME/ALIAS (Best for root + www):**
```
Type: ANAME (or ALIAS)
Name: @
Value: cname.vercel-dns.com
```

---

## Part 2: Configure DNS at Your Domain Registrar

### Where Did You Buy `weatherwise.earth`?

#### Option 1: **Namecheap**
```
1. Log in to Namecheap
2. Dashboard → Domain List → Manage
3. Advanced DNS tab
4. Add New Record:
   
   For Root Domain (weatherwise.earth):
   Type: ALIAS Record (or URL Redirect Record if no ALIAS)
   Host: @
   Value: cname.vercel-dns.com
   TTL: Automatic
   
   For WWW (www.weatherwise.earth):
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic

5. Save All Changes
```

#### Option 2: **GoDaddy**
```
1. Log in to GoDaddy
2. My Products → DNS
3. Add Record:
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 600
   
   Type: Forwarding (for root)
   Forward to: https://www.weatherwise.earth
   
   OR use A Record:
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 600

4. Save
```

#### Option 3: **Cloudflare**
```
1. Log in to Cloudflare
2. Select weatherwise.earth domain
3. DNS tab
4. Add Record:
   
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   Proxy status: DNS only (gray cloud)
   
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   Proxy status: DNS only (gray cloud)

5. Save

⚠️ IMPORTANT: Turn OFF Cloudflare proxy (gray cloud) for Vercel to work
```

#### Option 4: **Google Domains / Squarespace**
```
1. Log in to Google Domains (now Squarespace)
2. My domains → weatherwise.earth → DNS
3. Custom records:
   
   Type: CNAME
   Host name: www
   Data: cname.vercel-dns.com
   TTL: 1 hour
   
   Type: A
   Host name: @
   Data: 76.76.21.21
   TTL: 1 hour

4. Save
```

#### Option 5: **Other Registrars**
General steps:
```
1. Log in to your domain registrar
2. Find DNS settings / DNS management
3. Add these records:
   
   CNAME: www → cname.vercel-dns.com
   A Record: @ → 76.76.21.21
   
   OR (if ANAME/ALIAS supported):
   ANAME: @ → cname.vercel-dns.com
   CNAME: www → cname.vercel-dns.com

4. Save and wait for DNS propagation (5 min - 48 hours)
```

---

## Part 3: Verify Domain in Vercel

### After Adding DNS Records:

```
1. Go back to Vercel → Settings → Domains
2. Click "Refresh" next to your domain
3. Vercel will check DNS records

Status Messages:
✅ "Valid Configuration" = Success!
⏳ "Pending" = Wait for DNS propagation (usually 5-30 minutes)
❌ "Invalid Configuration" = Check DNS records again
```

---

## Part 4: Set Primary Domain & Redirects

### In Vercel Domains Settings:

```
1. You'll see both domains listed:
   - weatherwise.earth
   - www.weatherwise.earth

2. Choose primary (recommended: www.weatherwise.earth)
   Click "..." → "Set as Primary Domain"

3. Non-www will auto-redirect to www (or vice versa)
```

**Recommended Setup:**
```
Primary: www.weatherwise.earth
Redirect: weatherwise.earth → www.weatherwise.earth

Result:
- User types: weatherwise.earth → redirects to www.weatherwise.earth
- Both work, consistent branding
```

---

## Part 5: SSL Certificate (Automatic)

Vercel automatically:
- ✅ Issues free SSL certificate (HTTPS)
- ✅ Renews it automatically
- ✅ Redirects HTTP → HTTPS

**Wait 5-10 minutes after DNS verification for SSL to activate**

---

## Part 6: Update Your App Configuration

### Update Open Graph Tags

After domain is live, update `index.html`:

```html
<!-- Change from Vercel URL to custom domain -->
<meta property="og:url" content="https://www.weatherwise.earth/" />
<meta property="twitter:url" content="https://www.weatherwise.earth/" />
<meta property="og:image" content="https://www.weatherwise.earth/preview.svg" />
<meta property="twitter:image" content="https://www.weatherwise.earth/preview.svg" />
```

### Update CORS in Backend

Add custom domain to `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://weatherwiseplanner.vercel.app",
        "https://weatherwise.earth",        # Add this
        "https://www.weatherwise.earth",    # Add this
        "https://*.vercel.app",
    ],
    ...
)
```

Commit and push:
```powershell
git add .
git commit -m "Add custom domain weatherwise.earth to CORS"
git push origin main
```

---

## Troubleshooting

### ❌ "Domain is not configured correctly"
**Solution:**
```
1. Check DNS records match Vercel's requirements exactly
2. Wait 30-60 minutes for DNS propagation
3. Use DNS checker: https://dnschecker.org
4. Search for: weatherwise.earth
5. Verify CNAME/A records propagated globally
```

### ❌ "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"
**Solution:**
```
1. SSL certificate is still being issued
2. Wait 10-15 minutes
3. Clear browser cache (Ctrl + Shift + Delete)
4. Try incognito/private window
```

### ❌ "This site can't be reached"
**Solution:**
```
1. DNS not propagated yet - wait longer
2. Check DNS records are correct
3. Flush local DNS cache:
   PowerShell: ipconfig /flushdns
4. Try different network (mobile hotspot)
```

### ❌ Cloudflare "Too many redirects"
**Solution:**
```
1. In Cloudflare, turn OFF proxy (gray cloud icon)
2. DNS only mode for Vercel domains
3. OR set SSL/TLS mode to "Full" in Cloudflare
```

---

## DNS Propagation Check

Use these tools to verify DNS has propagated:

1. **DNSChecker**: https://dnschecker.org
   - Enter: `weatherwise.earth`
   - Check worldwide propagation

2. **Command Line**:
   ```powershell
   # Check if DNS resolves
   nslookup weatherwise.earth
   nslookup www.weatherwise.earth
   
   # Should show Vercel's IP addresses
   ```

3. **What's My DNS**: https://www.whatsmydns.net
   - Enter: `weatherwise.earth`
   - Type: A or CNAME
   - See global DNS status

---

## Timeline

| Step | Time |
|------|------|
| Add domain in Vercel | 1 minute |
| Configure DNS records | 5 minutes |
| DNS propagation | 5 min - 48 hours (usually 15-30 min) |
| SSL certificate issued | 5-15 minutes after DNS verified |
| **Total** | **~30 minutes average** |

---

## Quick Checklist

- [ ] Register `weatherwise.earth` domain (if not already)
- [ ] Add domain in Vercel Dashboard
- [ ] Copy DNS records from Vercel
- [ ] Add DNS records to domain registrar
- [ ] Wait for DNS propagation (check with dnschecker.org)
- [ ] Verify domain in Vercel (should show "Valid")
- [ ] Wait for SSL certificate (HTTPS)
- [ ] Set primary domain (www or non-www)
- [ ] Update `index.html` Open Graph tags
- [ ] Update `backend/main.py` CORS allow_origins
- [ ] Test: https://weatherwise.earth
- [ ] Test: https://www.weatherwise.earth
- [ ] ✅ Done!

---

## Final Result

After setup:
```
✅ https://weatherwise.earth → Works!
✅ https://www.weatherwise.earth → Works!
✅ http://weatherwise.earth → Redirects to HTTPS
✅ weatherwiseplanner.vercel.app → Still works (fallback)
✅ Free SSL certificate
✅ Auto-renewal
✅ Both domains point to same app
```

---

## Need Help?

**Vercel Support:**
- Docs: https://vercel.com/docs/concepts/projects/domains
- Support: https://vercel.com/support

**DNS Registrar Support:**
- Contact your domain registrar's support
- They can help add DNS records

**Can't find DNS settings?**
- Google: "[Your Registrar] how to add CNAME record"
- Example: "Namecheap how to add CNAME record"
